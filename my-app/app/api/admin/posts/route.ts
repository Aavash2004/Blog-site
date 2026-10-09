import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllPosts, createPost, isSlugTaken } from "@/lib/db";
import { verifyToken } from "@/app/lib/auth-server";
import { logActivity } from "@/lib/db";
import { cleanHtml } from "@/lib/sanitize";

const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(255, "Title is too long."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(255, "Slug is too long.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  excerpt: z.string().trim().min(1, "Excerpt is required."),
  content: z.string().trim().min(1, "Content is required."),
  featuredImage: z.string().trim().url("Featured image must be a valid URL.").optional().or(z.literal("")),
  category: z.string().trim().min(1, "Category is required.").max(100, "Category is too long."),
  status: z.enum(["DRAFT", "PUBLISHED"], {
  message: "Status must be DRAFT or PUBLISHED.",
}),
});
export async function GET(request: NextRequest) {
  const payload = verifyToken(request.headers.get("authorization"));
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const posts = await getAllPosts();
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = verifyToken(request.headers.get("authorization"));
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (payload.role !=="admin"){
    return NextResponse.json ({error: "Forbidden"},{status:403});
    
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = createPostSchema.safeParse(body);
 if (!parsed.success) {
  console.log("POST VALIDATION ERROR:", parsed.error.issues);

  return NextResponse.json(
    {
      error: parsed.error.issues[0].message,
      issues: parsed.error.issues,
    },
    { status: 400 }
  );
}

  try {
    const slugExists = await isSlugTaken(parsed.data.slug);
    if (slugExists) {
      return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
    }

    const post = await createPost({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: cleanHtml(parsed.data.content),
      featuredImage: parsed.data.featuredImage || undefined,
      category: parsed.data.category,
      status: parsed.data.status,
      authorId: payload.userId,
    });

    await logActivity(
  "POST_CREATED",
  `Post created: "${post.title}"`,
  payload.userId
);
    return NextResponse.json(
      { message: "Post created successfully.", post },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}