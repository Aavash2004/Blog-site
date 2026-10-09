import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

export function verifyCsrf(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return true;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}