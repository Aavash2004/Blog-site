"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar } from "lucide-react";

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
  featured?: boolean;
}

interface StoryCardProps {
  story: Story;
  isFeatured?: boolean;
}

export function StoryCard({ story, isFeatured = false }: StoryCardProps) {
  const categoryBg =
    story.category.toLowerCase() === "trekking" || story.category.toLowerCase() === "travel"
      ? "bg-[#2E5266] text-white"
      : story.category.toLowerCase() === "food" || story.category.toLowerCase() === "gastronomy"
      ? "bg-[#7D4F38] text-white"
      : story.category.toLowerCase() === "heritage"
      ? "bg-[#5B3E75] text-white"
      : story.category.toLowerCase() === "expedition"
      ? "bg-[#1E4D5F] text-white"
      : "bg-[#C65D3B] text-white";

  // Wide featured layout for first story (spans 2 columns on desktop)
  if (isFeatured || story.featured) {
    return (
      <Link
        href={`/blog/${story.slug}`}
        className="group relative md:col-span-2 flex flex-col md:flex-row h-full overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#C65D3B]/40 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2 dark:border-stone-800 dark:bg-stone-900/90 dark:hover:border-[#C65D3B]/50"
      >
        {/* Featured Card Image */}
        <div className="relative md:w-1/2 aspect-[16/10] md:aspect-auto overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
          <Image
            src={story.featuredImage}
            alt={story.title}
            fill
            className="object-cover transition-transform duration-600 ease-out group-hover:scale-105"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          {/* Category Tag */}
          <div className="absolute top-4 left-4 z-10">
            <span
              className={`inline-block rounded-full px-3.5 py-1 text-[13px] font-semibold tracking-[0.08em] uppercase shadow-xs ${categoryBg}`}
            >
              {story.category}
            </span>
          </div>
        </div>

        {/* Featured Card Content */}
        <div className="flex flex-1 flex-col p-6 sm:p-8 justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#C65D3B] dark:text-[#E07A5F]">
              <span>FEATURED DISPATCH</span>
            </div>

            <h3 className="font-heading text-2xl lg:text-[28px] font-bold leading-snug text-stone-900 transition-colors duration-200 group-hover:text-[#C65D3B] dark:text-stone-100 dark:group-hover:text-[#E07A5F] line-clamp-2">
              {story.title}
            </h3>

            <p className="line-clamp-3 text-[15px] sm:text-[16px] leading-[1.6] text-stone-600 dark:text-stone-300">
              {story.excerpt}
            </p>
          </div>

          {/* Footer Row */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 dark:border-stone-800/80">
            {/* Author */}
            <div className="flex items-center gap-2.5">
              {story.author.avatar ? (
                <Image
                  src={story.author.avatar}
                  alt={story.author.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C65D3B]/10 text-[13px] font-semibold text-[#C65D3B] dark:bg-[#C65D3B]/20 dark:text-[#E07A5F]">
                  {story.author.name.charAt(0)}
                </div>
              )}
              <span className="text-[14px] font-medium text-stone-800 dark:text-stone-200">
                {story.author.name}
              </span>
            </div>

            {/* Date & Read Time */}
            <div className="flex items-center gap-2 text-[14px] text-stone-500 dark:text-stone-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-stone-400" />
                <span>{story.date}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-stone-400" />
                <span>{story.readTime}</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Standard 3-column Card
  return (
    <Link
      href={`/blog/${story.slug}`}
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#C65D3B]/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2 dark:border-stone-800 dark:bg-stone-900/90 dark:hover:border-[#C65D3B]/50"
    >
      {/* 1. Image with Category Pill Tag */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
        <Image
          src={story.featuredImage}
          alt={story.title}
          fill
          className="object-cover transition-transform duration-600 ease-out group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />

        <div className="absolute top-3.5 left-3.5 z-10">
          <span
            className={`inline-block rounded-full px-3 py-1 text-[13px] font-semibold tracking-[0.08em] uppercase shadow-xs ${categoryBg}`}
          >
            {story.category}
          </span>
        </div>
      </div>

      {/* 2. Content: Title & Excerpt with 20-24px padding */}
      <div className="flex flex-1 flex-col p-6">
        {/* Title: 1.25rem (20px), weight 600, clamped to 2 lines */}
        <h3 className="font-heading text-[20px] font-semibold leading-snug text-stone-900 transition-colors duration-200 group-hover:text-[#C65D3B] dark:text-stone-100 dark:group-hover:text-[#E07A5F] line-clamp-2 mb-2.5">
          {story.title}
        </h3>

        {/* Excerpt: 0.9375rem-1rem (15-16px), clamped to 2-3 lines, line-height 1.6 */}
        <p className="line-clamp-3 text-[15px] leading-[1.6] text-stone-600 dark:text-stone-300 mb-6">
          {story.excerpt}
        </p>

        {/* 3. Footer Row Pinned to Bottom: Author on left, Date + Read Time on right */}
        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4 dark:border-stone-800/80 text-[14px]">
          {/* Author */}
          <div className="flex items-center gap-2">
            {story.author.avatar ? (
              <Image
                src={story.author.avatar}
                alt={story.author.name}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C65D3B]/10 text-[13px] font-semibold text-[#C65D3B] dark:bg-[#C65D3B]/20 dark:text-[#E07A5F]">
                {story.author.name.charAt(0)}
              </div>
            )}
            <span className="font-medium text-stone-800 dark:text-stone-200 truncate max-w-[110px]">
              {story.author.name}
            </span>
          </div>

          {/* Date & Read Time */}
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 shrink-0">
            <span>{story.date}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-stone-400" />
              <span>{story.readTime}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
