import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPostById, updatePost, deletePost, isSlugTaken } from "@/lib/db";
import { requireFreshAdmin, verifyCsrf } from "@/app/lib/auth-server";
import { logActivity } from "@/lib/db";
import { cleanHtml } from "@/lib/sanitize";

const updatePostSchema = z.object({
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

function parsePostId(idParam: string): number | null {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminSession = await requireFreshAdmin(request);
  if (!adminSession) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const { id: idParam } = await params;
  const id = parsePostId(idParam);
  if (!id) {
    return NextResponse.json({ error: "Invalid post ID." }, { status: 400 });
  }

  try {
    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }
    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyCsrf(request)) {
    return NextResponse.json({ error: "Invalid request origin (CSRF check failed)." }, { status: 403 });
  }

  const adminSession = await requireFreshAdmin(request);
  if (!adminSession) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const { id: idParam } = await params;
  const id = parsePostId(idParam);
  if (!id) {
    return NextResponse.json({ error: "Invalid post ID." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const existing = await getPostById(id);
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    if (parsed.data.slug !== existing.slug) {
      const slugExists = await isSlugTaken(parsed.data.slug, id);
      if (slugExists) {
        return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
      }
    }

    const updated = await updatePost(id, {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: cleanHtml(parsed.data.content),
      featuredImage: parsed.data.featuredImage || undefined,
      category: parsed.data.category,
      status: parsed.data.status,
    });
    if (!updated) {
  return NextResponse.json({ error: "Post not found." }, { status: 404 });
}
    await logActivity(
      "POST_UPDATED",
      `Post updated: "${updated.title}"`,
      adminSession.payload.userId
    );
    return NextResponse.json({ message: "Post updated successfully.", post: updated }, { status: 200 });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyCsrf(request)) {
    return NextResponse.json({ error: "Invalid request origin (CSRF check failed)." }, { status: 403 });
  }

  const adminSession = await requireFreshAdmin(request);
  if (!adminSession) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const { id: idParam } = await params;
  const id = parsePostId(idParam);
  if (!id) {
    return NextResponse.json({ error: "Invalid post ID." }, { status: 400 });
  }

  try {
    const existing = await getPostById(id);
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    await deletePost(id);
    await logActivity(
      "POST_DELETED",
      `Post deleted: "${existing.title}"`,
      adminSession.payload.userId
    );
    return NextResponse.json({ message: "Post deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}