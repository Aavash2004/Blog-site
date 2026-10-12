import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";
import { getPublishedPosts } from "@/lib/db";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  searchParams?: Promise<{ q?: string; category?: string }>;
};

export default async function BlogIndexPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const query = params.q?.toLowerCase() || "";
  const categoryFilter = params.category?.toLowerCase() || "";

  let posts = await getPublishedPosts();

  if (query) {
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
    );
  }

  if (categoryFilter) {
    posts = posts.filter(
      (p) => p.category && p.category.toLowerCase() === categoryFilter
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#b85437]">
            Blog & Stories
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Latest Stories
          </h1>
          <p className="max-w-2xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-light">
            Insights, cultural heritage, adventures, and perspectives from across Nepal.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300/80 p-16 text-center backdrop-blur-xs dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No posts found. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-black/5 bg-white/80 shadow-2xs backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-zinc-900/80"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {post.featured_image ? (
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
                      No image
                    </div>
                  )}
                  {post.category && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-800 backdrop-blur-xs dark:bg-zinc-900/90 dark:text-zinc-200">
                        {post.category}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-6 sm:p-7">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>

                  <h2 className="font-serif text-xl font-bold leading-snug text-zinc-950 transition group-hover:text-[#b85437] dark:text-white">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-light">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="mt-auto flex items-center gap-1.5 pt-3 text-xs sm:text-sm font-semibold text-[#c2593f]">
                    <span>Read story</span>
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}