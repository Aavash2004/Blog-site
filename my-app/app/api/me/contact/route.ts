import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateUserContactInfo } from "@/lib/db";
import { verifyToken, verifyCsrf } from "@/app/lib/auth-server";

const contactSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username is too long.")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed."),
  phone: z.string().trim().max(20, "Phone number is too long.").optional().or(z.literal("")),
  address: z.string().trim().max(255, "Address is too long.").optional().or(z.literal("")),
});

export async function PATCH(request: NextRequest) {
  if (!verifyCsrf(request)) {
    return NextResponse.json({ error: "Invalid request origin (CSRF check failed)." }, { status: 403 });
  }

  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { username?: string; phone?: string; address?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const result = await updateUserContactInfo(
    payload.userId,
    parsed.data.username,
    parsed.data.phone || "",
    parsed.data.address || ""
  );

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true, user: result.user }, { status: 200 });
}