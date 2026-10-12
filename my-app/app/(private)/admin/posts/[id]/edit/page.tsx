"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    category: "",
    status: "DRAFT",
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/admin/posts/${id}`);

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load post.");
          setFetching(false);
          return;
        }

        setFormData({
          title: data.post.title,
          slug: data.post.slug,
          excerpt: data.post.excerpt,
          content: data.post.content,
          featuredImage: data.post.featured_image || "",
          category: data.post.category,
          status: data.post.status,
        });
        setFetching(false);
      } catch {
        setError("Unable to reach the server right now.");
        setFetching(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    setFormData((prev) => ({ ...prev, featuredImage: reader.result as string }));
  };
  reader.readAsDataURL(file);
};

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);
try {
      const payload = {
        ...formData,
        featuredImage:
          formData.featuredImage.trim() === ""
            ? undefined
            : formData.featuredImage.trim(),
      };

      const response = await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to update post.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to reach the server right now.");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading post...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl space-y-8">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">Edit Post</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Update your blog post details.</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter post title"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Slug
              </label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="your post slug"
                required
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Excerpt
              </label>
              <Input
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Write a short description of your post..."
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Content
              </label>
             <RichTextEditor
  content={formData.content}
  onChange={(content: string) =>
    setFormData((prev) => ({
      ...prev,
      content,
    }))
  }
/>
            </div>

            <div>
              <label htmlFor="featuredImage" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Featured Image URL
              </label>
              {formData.featuredImage ? (
    <div className="relative mb-2 w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      <img
        src={formData.featuredImage}
        alt="Featured preview"
        className="h-40 w-full object-cover"
      />
      <button
        type="button"
        onClick={() => setFormData((prev) => ({ ...prev, featuredImage: "" }))}
        className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
      >
        Remove
      </button>
    </div>
  ) : null}

              <Input
    id="featuredImage"
    name="featuredImage"
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
  />
            </div>

            <div>
              <label htmlFor="category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Category
              </label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Travel"
                required
              />
            </div>

            <div>
              <label htmlFor="status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}