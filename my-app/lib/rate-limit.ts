/**
 * Rate Limiter for Authentication Endpoints (Signin / Signup).
 * 
 * Rules:
 * - Counts FAILED attempts only (5 failed attempts per 15-minute window).
 * - Keyed by client IP and lowercased email.
 * - Checked BEFORE executing any CPU-heavy bcrypt operations.
 * - Resets on successful authentication.
 * - Returns 429 status with Retry-After header when rate-limited.
 * - Uses Upstash Redis REST when configured; falls back to an in-memory sliding store for local dev.
 * - Issues a loud console warning at startup if running in production without Upstash.
 */

const WINDOW_SECONDS = 15 * 60; // 15 minutes (900 seconds)
const MAX_ATTEMPTS = 5;

// Warn once if in production without distributed Upstash Redis
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)
) {
  console.warn(
    "\n[SECURITY WARNING] ========================================================\n" +
    "[SECURITY WARNING] Rate limiter is using an IN-MEMORY store in production!\n" +
    "[SECURITY WARNING] In a serverless or multi-instance deployment (e.g. Vercel),\n" +
    "[SECURITY WARNING] in-memory rate limits are not shared across lambdas.\n" +
    "[SECURITY WARNING] Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.\n" +
    "[SECURITY WARNING] ========================================================\n"
  );
}

// In-Memory store for local development fallback
interface MemoryEntry {
  count: number;
  expiresAt: number;
}
const memoryStore = new Map<string, MemoryEntry>();

function cleanExpiredMemory() {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
}

// Upstash Redis helper
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasUpstash = Boolean(upstashUrl && upstashToken);

async function upstashPipeline(commands: unknown[][]): Promise<Array<{ result?: unknown; error?: string }> | null> {
  if (!hasUpstash || !upstashUrl || !upstashToken) return null;
  try {
    const res = await fetch(`${upstashUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[RateLimiter] Upstash error HTTP", res.status);
      return null;
    }
    return (await res.json()) as Array<{ result?: unknown; error?: string }>;
  } catch (err) {
    console.error("[RateLimiter] Upstash fetch failure:", err);
    return null;
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const client = forwarded.split(",")[0].trim();
    if (client) return client;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

function getIpKey(ip: string): string {
  return `ratelimit:auth:ip:${ip.trim()}`;
}

function getEmailKey(email: string): string {
  return `ratelimit:auth:email:${email.trim().toLowerCase()}`;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfter?: number;
  reason?: "ip" | "email";
}

/**
 * Checks if the request is rate-limited BEFORE performing bcrypt work.
 */
export async function checkAuthRateLimit(
  ip: string,
  email?: string
): Promise<RateLimitCheckResult> {
  const ipKey = getIpKey(ip);
  const emailKey = email ? getEmailKey(email) : null;

  if (hasUpstash) {
    const commands: unknown[][] = [["GET", ipKey], ["TTL", ipKey]];
    if (emailKey) {
      commands.push(["GET", emailKey], ["TTL", emailKey]);
    }
    const results = await upstashPipeline(commands);
    if (results && results.length >= 2) {
      const ipCount = Number(results[0]?.result || 0);
      const ipTtl = Math.max(1, Number(results[1]?.result || WINDOW_SECONDS));

      if (ipCount >= MAX_ATTEMPTS) {
        return { allowed: false, retryAfter: ipTtl, reason: "ip" };
      }

      if (emailKey && results.length >= 4) {
        const emailCount = Number(results[2]?.result || 0);
        const emailTtl = Math.max(1, Number(results[3]?.result || WINDOW_SECONDS));
        if (emailCount >= MAX_ATTEMPTS) {
          return { allowed: false, retryAfter: emailTtl, reason: "email" };
        }
      }

      return { allowed: true };
    }
    // If Upstash fails, fall through to in-memory check
  }

  cleanExpiredMemory();
  const now = Date.now();

  const ipEntry = memoryStore.get(ipKey);
  if (ipEntry && ipEntry.expiresAt > now && ipEntry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.max(1, Math.ceil((ipEntry.expiresAt - now) / 1000));
    return { allowed: false, retryAfter, reason: "ip" };
  }

  if (emailKey) {
    const emailEntry = memoryStore.get(emailKey);
    if (emailEntry && emailEntry.expiresAt > now && emailEntry.count >= MAX_ATTEMPTS) {
      const retryAfter = Math.max(1, Math.ceil((emailEntry.expiresAt - now) / 1000));
      return { allowed: false, retryAfter, reason: "email" };
    }
  }

  return { allowed: true };
}

/**
 * Records a single failed authentication attempt for both IP and email.
 */
export async function recordAuthFailure(ip: string, email?: string): Promise<void> {
  const ipKey = getIpKey(ip);
  const emailKey = email ? getEmailKey(email) : null;

  if (hasUpstash) {
    const commands: unknown[][] = [
      ["INCR", ipKey],
      ["EXPIRE", ipKey, WINDOW_SECONDS],
    ];
    if (emailKey) {
      commands.push(
        ["INCR", emailKey],
        ["EXPIRE", emailKey, WINDOW_SECONDS]
      );
    }
    const results = await upstashPipeline(commands);
    if (results) return;
  }

  const now = Date.now();
  const expiresAt = now + WINDOW_SECONDS * 1000;

  // Record for IP
  const existingIp = memoryStore.get(ipKey);
  if (existingIp && existingIp.expiresAt > now) {
    existingIp.count += 1;
  } else {
    memoryStore.set(ipKey, { count: 1, expiresAt });
  }

  // Record for Email
  if (emailKey) {
    const existingEmail = memoryStore.get(emailKey);
    if (existingEmail && existingEmail.expiresAt > now) {
      existingEmail.count += 1;
    } else {
      memoryStore.set(emailKey, { count: 1, expiresAt });
    }
  }
}

/**
 * Resets rate limit counters upon successful login or signup.
 */
export async function resetAuthRateLimit(ip: string, email?: string): Promise<void> {
  const ipKey = getIpKey(ip);
  const emailKey = email ? getEmailKey(email) : null;

  if (hasUpstash) {
    const commands: unknown[][] = [["DEL", ipKey]];
    if (emailKey) {
      commands.push(["DEL", emailKey]);
    }
    await upstashPipeline(commands);
  }

  memoryStore.delete(ipKey);
  if (emailKey) {
    memoryStore.delete(emailKey);
  }
}
