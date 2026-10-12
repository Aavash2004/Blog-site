"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCurrentUser } from "@/app/lib/auth-client";

import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  FileEdit,
  ListOrdered,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ApiPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  created_at: string;
  updated_at?: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogsPage() {
  const router = useRouter();

  const [checked, setChecked] = useState(false);

  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "PUBLISHED" | "DRAFT"
  >("All");

  const [deletePost, setDeletePost] = useState<ApiPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/posts");

      if (!res.ok) {
        throw new Error("Failed to load posts.");
      }

      const data = await res.json();

      const list: ApiPost[] = Array.isArray(data)
        ? data
        : data.posts ?? [];

      setPosts(list);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (!u) {
        router.replace("/auth/login");
        return;
      }
      if (u.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      setChecked(true);
      fetchPosts();
    });
  }, [router]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        post.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  const publishedCount = posts.filter(
    (post) => post.status === "PUBLISHED"
  ).length;

  const draftCount = posts.filter(
    (post) => post.status === "DRAFT"
  ).length;

  const categoryCount = new Set(
    posts.map((post) => post.category)
  ).size;

  const handleDelete = async () => {
    if (!deletePost) return;

    setDeleting(true);

    try {
      const res = await fetch(
        `/api/admin/posts/${deletePost.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete post.");
      }

      setPosts((current) =>
        current.filter(
          (post) => post.id !== deletePost.id
        )
      );

      setDeletePost(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete post."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (!checked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">
          Loading...
        </p>
      </main>
    );
  }

  const stats = [
    {
      label: "Total posts",
      value: posts.length,
      icon: FileText,
    },
    {
      label: "Published",
      value: publishedCount,
      icon: CheckCircle2,
    },
    {
      label: "Drafts",
      value: draftCount,
      icon: FileEdit,
    },
    {
      label: "Categories",
      value: categoryCount,
      icon: ListOrdered,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-900 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 border-b border-zinc-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Content
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              Blog
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Manage published articles and drafts from one place.
            </p>
          </div>

          <Button
            onClick={() =>
              router.push("/admin/posts/new")
            }
            className="w-fit gap-2"
          >
            <Plus className="h-4 w-4" />
            New Blog
          </Button>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-2 border border-zinc-200 bg-white sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }, index) => (
            <div
              key={label}
              className={`flex items-center justify-between px-5 py-5 ${
                index > 0
                  ? "border-l border-zinc-200"
                  : ""
              }`}
            >
              <div>
                <p className="text-xs font-medium text-zinc-500">
                  {label}
                </p>

                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {loading ? "—" : value}
                </p>
              </div>

              <Icon className="h-4 w-4 text-zinc-400" />
            </div>
          ))}
        </div>

        {/* Posts */}
        <section className="border border-zinc-200 bg-white">
          {/* Toolbar */}
          <div className="border-b border-zinc-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold">
                  All Blogs
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  {loading
                    ? "Loading posts..."
                    : `${posts.length} ${
                        posts.length === 1
                          ? "post"
                          : "posts"
                      } in total`}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Search */}
                <div className="relative sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                  <Input
                    placeholder="Search posts"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="h-9 border-zinc-200 pl-9 text-sm shadow-none"
                  />
                </div>

                {/* Filter */}
                <div className="flex border border-zinc-200">
                  {[
                    ["All", "All"],
                    ["Published", "PUBLISHED"],
                    ["Drafts", "DRAFT"],
                  ].map(([label, value]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setStatusFilter(
                          value as
                            | "All"
                            | "PUBLISHED"
                            | "DRAFT"
                        )
                      }
                      className={`px-3 py-2 text-xs font-medium transition ${
                        statusFilter === value
                          ? "bg-zinc-900 text-white"
                          : "bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden border-b border-zinc-200 bg-zinc-50 px-6 py-3 text-xs font-medium text-zinc-500 md:grid md:grid-cols-[1fr_150px_130px_80px] md:gap-6">
            <span>Post</span>
            <span>Category</span>
            <span>Status</span>
            <span className="text-right">Date</span>
          </div>

          {/* Posts */}
          <div>
            {loading ? (
              <div className="flex min-h-56 items-center justify-center">
                <p className="text-sm text-zinc-400">
                  Loading posts...
                </p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <FileText className="h-7 w-7 text-zinc-300" />

                <h3 className="mt-4 text-sm font-semibold">
                  No posts found
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-500">
                  {search || statusFilter !== "All"
                    ? "Try adjusting your search or filter."
                    : "Create your first post to get started."}
                </p>

                {!search &&
                  statusFilter === "All" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() =>
                        router.push(
                          "/admin/posts/new"
                        )
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      New post
                    </Button>
                  )}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group grid gap-4 border-b border-zinc-100 px-5 py-5 last:border-b-0 hover:bg-zinc-50/70 sm:px-6 md:grid-cols-[1fr_150px_130px_80px] md:items-center md:gap-6"
                >
                  {/* Post */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">
                        {post.title}
                      </h3>

                      <span className="hidden text-[10px] text-zinc-400 sm:inline">
                        #{post.id}
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-1 text-xs leading-5 text-zinc-500">
                      {post.excerpt}
                    </p>

                    {/* Mobile actions */}
                    <div className="mt-3 flex items-center gap-3 md:hidden">
                      <span className="text-xs text-zinc-400">
                        {formatDate(post.created_at)}
                      </span>

                      <span className="text-zinc-300">
                        ·
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/blog/${post.slug}`
                          )
                        }
                        className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/admin/posts/${post.id}/edit`
                          )
                        }
                        className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <span className="text-xs text-zinc-600">
                      {post.category}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                      {post.status === "PUBLISHED" ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Published
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                          Draft
                        </>
                      )}
                    </span>
                  </div>

                  {/* Date + Actions */}
                  <div className="hidden items-center justify-end gap-1 md:flex">
                    <span className="mr-2 whitespace-nowrap text-xs text-zinc-400">
                      {formatDate(post.created_at)}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/blog/${post.slug}`
                            )
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/admin/posts/${post.id}/edit`
                            )
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() =>
                            setDeletePost(post)
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deletePost}
        onOpenChange={(open) => {
          if (!open) setDeletePost(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete post?
            </DialogTitle>

            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-zinc-900">
                {deletePost?.title}
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletePost(null)}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}