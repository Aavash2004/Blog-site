import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug } from "@/lib/db";
import { cleanHtml } from "@/lib/sanitize";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main className="relative min-h-screen bg-transparent px-4 py-8 sm:px-6 sm:py-12 md:py-16">
      <article className="mx-auto max-w-3xl space-y-7">
        {/* Back Link */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Blog</span>
          </Link>
        </div>

        {/* Featured Image */}
        {post.featured_image ? (
          <figure className="overflow-hidden rounded-[1.75rem] sm:rounded-3xl border border-black/5 bg-zinc-100 shadow-md dark:border-white/10 dark:bg-zinc-900">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 768px, 100vw"
                priority
              />
            </div>
          </figure>
        ) : null}

        {/* Article Header & Meta */}
        <div className="space-y-4 pt-1">
          {/* Metadata Pill */}
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-zinc-200/70 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
            <span>{post.category || "GENERAL"}</span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span>{formatDate(post.created_at).toUpperCase()}</span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span>5 MIN READ</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
            {post.title}
          </h1>

          {/* Subtitle / Excerpt */}
          {post.excerpt ? (
            <p className="text-base sm:text-lg font-medium leading-relaxed text-zinc-700 dark:text-zinc-300">
              {post.excerpt}
            </p>
          ) : null}
        </div>

        {/* Content Body */}
        <div
          className="prose prose-zinc max-w-none pt-2 prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-li:leading-relaxed prose-a:text-zinc-950 prose-a:underline prose-a:underline-offset-2 dark:prose-invert dark:prose-a:text-white"
          dangerouslySetInnerHTML={{ __html: cleanHtml(post.content) }}
        />
      </article>
    </main>
  );
}