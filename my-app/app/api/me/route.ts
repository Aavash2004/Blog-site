import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserById, updateUserProfile, deleteUserAccount } from "@/lib/db";
import { verifyToken, verifyCsrf } from "@/app/lib/auth-server";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100, "Name is too long."),
});

export async function GET(request: NextRequest) {
  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, user }, { status: 200 });
}

export async function PATCH(request: NextRequest) {
  if (!verifyCsrf(request)) {
    return NextResponse.json({ error: "Invalid request origin (CSRF check failed)." }, { status: 403 });
  }

  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const result = await updateUserProfile(payload.userId, parsed.data.name);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true, user: result.user }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  if (!verifyCsrf(request)) {
    return NextResponse.json({ error: "Invalid request origin (CSRF check failed)." }, { status: 403 });
  }

  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await deleteUserAccount(payload.userId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.delete("auth_token");
  return response;
}