import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateUserPassword } from "@/lib/db";
import { verifyToken, verifyCsrf } from "@/app/lib/auth-server";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters.")
    .max(72, "New password is too long."),
});

export async function PATCH(request: NextRequest) {
  if (!verifyCsrf(request)) {
    return NextResponse.json({ error: "Invalid request origin (CSRF check failed)." }, { status: 403 });
  }

  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const result = await updateUserPassword(
    payload.userId,
    parsed.data.currentPassword,
    parsed.data.newPassword
  );

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}