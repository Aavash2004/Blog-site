import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { findUserById, type SafeUser } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "";

export interface TokenPayload {
  userId: number;
  email: string;
  role: "user" | "admin";
}

export function parseTokenFromHeader(header: string | null | undefined): string | null {
  if (!header) return null;
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return header.trim();
}

export async function getTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("auth_token")?.value || null;
  } catch {
    return null;
  }
}

export function verifyToken(input?: string | Request | null): TokenPayload | null {
  let token: string | null = null;

  if (typeof input === "string") {
    token = parseTokenFromHeader(input);
  } else if (input && typeof input === "object" && "headers" in input) {
    const authHeader = input.headers.get("authorization");
    if (authHeader) {
      token = parseTokenFromHeader(authHeader);
    } else {
      const cookieHeader = input.headers.get("cookie") || "";
      const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
  }

  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(request?: Request): Promise<TokenPayload | null> {
  if (request) {
    const fromReq = verifyToken(request);
    if (fromReq) return fromReq;
  }

  const cookieToken = await getTokenFromCookies();
  if (cookieToken) {
    return verifyToken(cookieToken);
  }

  return null;
}

export function requireAdmin(payload: TokenPayload | null): boolean {
  return payload?.role === "admin";
}

/**
 * Validates admin status afresh against the database.
 * Prevents trusting a 7-day JWT if the user was demoted or deleted.
 */
export async function requireFreshAdmin(
  request: Request
): Promise<{ user: SafeUser; payload: TokenPayload } | null> {
  const payload = verifyToken(request);
  if (!payload) return null;

  const user = await findUserById(payload.userId);
  if (!user || user.role !== "admin") {
    return null;
  }

  return { user, payload };
}

/**
 * Validates CSRF for state-mutating HTTP requests (POST, PUT, PATCH, DELETE).
 * - Skips check ONLY if authenticating with a Bearer header and NO cookie.
 * - Inspects Origin (falling back to Referer).
 * - Uses x-forwarded-host (Vercel) as well as Host.
 * - Rejects any cookie-authenticated mutating request with missing or mismatched Origin.
 */
export function verifyCsrf(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  const authHeader = request.headers.get("authorization");
  const cookieHeader = request.headers.get("cookie") || "";
  const hasAuthCookie = /(?:^|;\s*)auth_token=/.test(cookieHeader);

  // If the request authenticates strictly via Bearer token AND has no auth cookie,
  // it is not subject to ambient browser cookie CSRF.
  if (authHeader && authHeader.startsWith("Bearer ") && !hasAuthCookie) {
    return true;
  }

  const origin = request.headers.get("origin");
  let requestHost: string | null = null;

  if (origin) {
    try {
      requestHost = new URL(origin).host;
    } catch {
      return false;
    }
  } else {
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        requestHost = new URL(referer).host;
      } catch {
        return false;
      }
    }
  }

  // Reject if Origin (and Referer) is completely missing on cookie/session mutating requests
  if (!requestHost) {
    return false;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const directHost = request.headers.get("host");
  const expectedHost = (forwardedHost || directHost || "").split(",")[0].trim();

  if (!expectedHost) {
    return false;
  }

  return requestHost === expectedHost;
}