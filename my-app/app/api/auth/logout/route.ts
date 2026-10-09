import { NextRequest, NextResponse } from "next/server";
import { verifyCsrf } from "@/app/lib/auth-server";

export async function POST(request: NextRequest) {
  if (!verifyCsrf(request)) {
    return NextResponse.json(
      { error: "Invalid request origin (CSRF check failed)." },
      { status: 403 }
    );
  }

  const response = NextResponse.json(
    { success: true, message: "Logged out successfully." },
    { status: 200 }
  );

  response.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Logout requires POST." },
    { status: 405, headers: { Allow: "POST" } }
  );
}
