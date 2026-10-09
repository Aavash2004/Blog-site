import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { sanitizeRedirect } from "./lib/redirect";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_jwt_secret_key_change_in_production"
);

interface TokenPayload {
  userId: number;
  email: string;
  role: "user" | "admin";
}

async function verifyTokenEdge(token: string | undefined): Promise<TokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: Number(payload.userId),
      email: String(payload.email || ""),
      role: (payload.role as "user" | "admin") || "user",
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const user = await verifyTokenEdge(token);

  // If unauthenticated or token expired, clean up cookie if present
  const isInvalidToken = Boolean(token && !user);

  // Auth pages (/auth/login, /auth/signup)
  if (pathname.startsWith("/auth/")) {
    if (user) {
      const redirectQuery = request.nextUrl.searchParams.get("redirect");
      const target = sanitizeRedirect(redirectQuery, "/dashboard");
      return NextResponse.redirect(new URL(target, request.url));
    }
    const response = NextResponse.next();
    if (isInvalidToken) {
      response.cookies.delete("auth_token");
    }
    return response;
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", sanitizeRedirect(pathname, "/dashboard"));
      const response = NextResponse.redirect(loginUrl);
      if (isInvalidToken) {
        response.cookies.delete("auth_token");
      }
      return response;
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Other private routes protection (/dashboard, /profile, /settings)
  const isPrivate =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings");

  if (isPrivate) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", sanitizeRedirect(pathname, "/dashboard"));
      const response = NextResponse.redirect(loginUrl);
      if (isInvalidToken) {
        response.cookies.delete("auth_token");
      }
      return response;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Next.js 16 conventions
export default proxy;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};
