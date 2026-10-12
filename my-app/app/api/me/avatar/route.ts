import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { updateUserAvatar } from "@/lib/db";
import { verifyToken, verifyCsrf } from "@/app/lib/auth-server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PATCH(request: NextRequest) {
  if (!verifyCsrf(request)) {
    return NextResponse.json({ error: "Invalid request origin (CSRF check failed)." }, { status: 403 });
  }

  const payload = verifyToken(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "avatars",
            public_id: `user_${payload.userId}`,
            overwrite: true,
            transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
          },
          (error, result) => {
            if (error || !result) reject(error);
            else resolve(result as { secure_url: string });
          }
        )
        .end(buffer);
    });

    const result = await updateUserAvatar(payload.userId, uploadResult.secure_url);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: result.user }, { status: 200 });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}