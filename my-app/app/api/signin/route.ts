import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  createUserRecord,
  findUserByEmailAndPassword,
  logActivity,
} from "@/lib/db";
import { verifyCsrf } from "@/app/lib/auth-server";

const JWT_SECRET = process.env.JWT_SECRET || "";

function createAuthCookie(token: string) {
  return {
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  };
}

export async function POST(request: NextRequest) {
  if (!verifyCsrf(request)) {
    return NextResponse.json(
      { error: "Invalid request origin (CSRF check failed)." },
      { status: 403 }
    );
  }

  let body: {
    action?: string;
    name?: string;
    email?: string;
    password?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { action, name, email, password } = body;

  if (!action || !email || !password) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  // =========================
  // SIGNUP
  // =========================
  if (action === "signup") {
    if (!name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    try {
      const result = await createUserRecord(name, email, password);

      if (!result.success) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }

      await logActivity(
        "USER_REGISTERED",
        `New user registered: ${result.user.email}`,
        result.user.id
      );

      const token = jwt.sign(
        {
          userId: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const response = NextResponse.json(
        {
          success: true,
          user: result.user,
          token,
        },
        { status: 201 }
      );

      response.cookies.set(createAuthCookie(token));
      return response;
    } catch (error) {
      console.error("Signup error:", error);

      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  }

  // =========================
  // LOGIN
  // =========================
  if (action === "login") {
    try {
      const user = await findUserByEmailAndPassword(email, password);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid credentials",
          },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const response = NextResponse.json(
        {
          success: true,
          user,
          token,
        },
        { status: 200 }
      );

      response.cookies.set(createAuthCookie(token));
      return response;
    } catch (error) {
      console.error("Login error:", error);

      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: "Unknown action." },
    { status: 400 }
  );
}