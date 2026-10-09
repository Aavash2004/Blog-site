"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function NewPostPage() {
  const router = useRouter();
const [uploadingImage, setUploadingImage] = useState(false);
const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    category: "",
    status: "DRAFT",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")  // strip anything not a-z, 0-9, space, hyphen
    .replace(/\s+/g, "-")          // spaces -> hyphens
    .replace(/-+/g, "-")           // collapse repeated hyphens
    .replace(/^-|-$/g, "");        // trim leading/trailing hyphen
};

  const handleTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const title = e.target.value;

    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        featuredImage:
          formData.featuredImage.trim() === "" ? undefined : formData.featuredImage.trim(),
      };

      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

     if (!response.ok) {
  throw new Error(data.error || data.message || "Failed to create post");
}

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setImageError("");
  setUploadingImage(true);

  try {
    const body = new FormData();
    body.append("image", file);

    const res = await fetch("/api/posts/upload-image", {
      method: "POST",
      body,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Upload failed.");
    }

    setFormData((prev) => ({ ...prev, featuredImage: data.url }));
  } catch (err) {
    setImageError(err instanceof Error ? err.message : "Upload failed.");
  } finally {
    setUploadingImage(false);
  }
};

  return (
    <main className="min-h-screen bg-zinc-50/70 px-6 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-5 -ml-2 gap-2"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Blog
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Create New Blog
            </h1>

            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Create and publish a new article on your blog.
            </p>
          </div>
        </div>

 {/* Form */}
<form onSubmit={handleSubmit} className="space-y-6">

  {/* Basic Information */}
  <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <div className="mb-6">
      <h2 className="text-lg font-semibold">
        Basic Information
      </h2>

      <p className="mt-1 text-sm text-zinc-500">
        Add the main information about your post.
      </p>
    </div>

    <div className="space-y-5">

      {/* Title */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="text-sm font-medium"
        >
          Title
        </label>

        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleTitleChange}
          placeholder="Enter your post title"
          required
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <label
          htmlFor="slug"
          className="text-sm font-medium"
        >
          Slug
        </label>

        <Input
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="your-post-slug"
          required
        />

        <p className="text-xs text-zinc-500">
          This will be used in the blog URL.
        </p>
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <label
          htmlFor="excerpt"
          className="text-sm font-medium"
        >
          Excerpt
        </label>

        <Input
          id="excerpt"
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          placeholder="Write a short excerpt for your post"
        />

        <p className="text-xs text-zinc-500">
          A short description of your blog post.
        </p>
      </div>

    </div>
  </section>

  {/* Content */}
  <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <div className="mb-6">
      <h2 className="text-lg font-semibold">
        Content
      </h2>

      <p className="mt-1 text-sm text-zinc-500">
        Write the content of your blog post.
      </p>
    </div>

    <RichTextEditor
      content={formData.content}
      onChange={(content: string) =>
        setFormData((prev) => ({
          ...prev,
          content,
        }))
      }
    />
  </section>

      

          {/* Image */}
         <div className="space-y-2">
  <label htmlFor="featuredImage" className="text-sm font-medium">
    Image
  </label>

  {formData.featuredImage ? (
    <div className="relative overflow-hidden rounded-lg border dark:border-zinc-800">
      <img
        src={formData.featuredImage}
        alt="Featured"
        className="h-48 w-full object-cover"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="absolute right-2 top-2"
        onClick={() =>
          setFormData((prev) => ({ ...prev, featuredImage: "" }))
        }
      >
        Remove
      </Button>
    </div>
  ) : (
    <label
      htmlFor="image-upload"
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
    >
      <ImagePlus className="h-6 w-6 text-zinc-400" />
      {uploadingImage ? "Uploading..." : "Click to upload an image"}
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
        disabled={uploadingImage}
      />
    </label>
  )}

  {imageError && (
    <p className="text-xs text-red-600 dark:text-red-400">{imageError}</p>
  )}
</div>

          {/* Post Settings */}
          <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Post Settings
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Configure the category and publication status.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* Category */}
              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="text-sm font-medium"
                >
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

              {/* Status */}
              <div className="space-y-2">
                <label
                  htmlFor="status"
                  className="text-sm font-medium"
                >
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
                  <option value="PUBLISHED">
                    Published
                  </option>
                </select>
              </div>

            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Post"
              )}
            </Button>

          </div>

        </form>
      </div>
    </main>
  );
}
