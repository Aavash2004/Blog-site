"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";

export interface Story {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categoryColor?: string;
  featuredImage: string;
  author: {
    name: string;
    avatar?: string;
  };
  date: string;
  readTime: string;
}

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const categoryBg =
    story.category.toLowerCase() === "trekking" || story.category.toLowerCase() === "travel"
      ? "bg-[#2E5266] text-white"
      : story.category.toLowerCase() === "food" || story.category.toLowerCase() === "gastronomy"
      ? "bg-[#8D5B4C] text-white"
      : "bg-[#C65D3B] text-white";

  return (
    <article className="group flex flex-col h-full overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-xl dark:border-stone-800 dark:bg-stone-900/90 dark:hover:border-stone-700">
      <Link
        href={`/blog/${story.slug}`}
        className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-800 focus-visible:outline-none"
      >
        <Image
          src={story.featuredImage}
          alt={story.title}
          fill
          className="object-cover transition-transform duration-600 ease-out group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />

        {/* Category Pill Tag */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span
            className={`inline-block rounded-full px-3 py-1 text-[13px] font-semibold tracking-[0.08em] uppercase shadow-xs ${categoryBg}`}
          >
            {story.category}
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Meta Row: Date & Reading Time */}
        <div className="flex items-center gap-3 text-[14px] text-stone-500 dark:text-stone-400 mb-2.5">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-stone-400" />
            <span>{story.date}</span>
          </span>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-stone-400" />
            <span>{story.readTime}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-xl font-bold leading-snug text-stone-900 transition-colors duration-200 group-hover:text-[#C65D3B] dark:text-stone-100 dark:group-hover:text-[#E07A5F] mb-2.5">
          <Link
            href={`/blog/${story.slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm"
          >
            {story.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="line-clamp-2 text-[15px] leading-relaxed text-stone-600 dark:text-stone-300 mb-5">
          {story.excerpt}
        </p>

        {/* Author Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4 dark:border-stone-800/80">
          <div className="flex items-center gap-2.5">
            {story.author.avatar ? (
              <Image
                src={story.author.avatar}
                alt={story.author.name}
                width={30}
                height={30}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C65D3B]/10 text-xs font-semibold text-[#C65D3B] dark:bg-[#C65D3B]/20 dark:text-[#E07A5F]">
                {story.author.name.charAt(0)}
              </div>
            )}
            <span className="text-[14px] font-medium text-stone-800 dark:text-stone-200">
              {story.author.name}
            </span>
          </div>

          <Link
            href={`/blog/${story.slug}`}
            className="inline-flex items-center gap-1 text-[14px] font-medium text-[#C65D3B] transition-all group-hover:gap-1.5 dark:text-[#E07A5F]"
            aria-label={`Read ${story.title}`}
          >
            <span>Read</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
