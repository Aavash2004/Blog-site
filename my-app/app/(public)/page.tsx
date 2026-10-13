"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  MapPin,
  UtensilsCrossed,
  Users,
  Mountain,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import { StoryCard, Story } from "@/components/StoryCard";
import { Newsletter } from "@/components/Newsletter";

// Curated authentic stories for Nepal storytelling
const defaultLatestStories: Story[] = [
  {
    id: 1,
    slug: "secret-monasteries-upper-mustang",
    title: "Sacred Murals of Upper Mustang: Centuries of Buddhist Art at 3,800m",
    excerpt:
      "Trekking through wind-carved red cliffs into medieval walled villages, discovering cliffside monasteries that preserved pristine 14th-century frescoes.",
    category: "Trekking",
    featuredImage: "/images/3.jpg",
    author: {
      name: "Tenzin Norbu",
    },
    date: "Apr 28, 2025",
    readTime: "6 min read",
  },
  {
    id: 2,
    slug: "beyond-momo-newari-gastronomy",
    title: "Beyond Momo: The Ancient Fermentation & Spice Traditions of Newari Feasts",
    excerpt:
      "From spiced choila to slow-simmered samay baji, a deep dive into Kathmandu Valley's complex culinary rituals, clay kilns, and heritage feasts.",
    category: "Food",
    featuredImage: "/images/eug.jpg",
    author: {
      name: "Pooja Shrestha",
    },
    date: "Apr 22, 2025",
    readTime: "5 min read",
  },
  {
    id: 3,
    slug: "guardians-of-bhaktapur-woodcarving",
    title: "Guardians of Timber & Clay: The Living Craftsmanship of Bhaktapur",
    excerpt:
      "In the sunlit alleys of Bhaktapur, multi-generational master carvers and potters continue to shape temples, peacock windows, and living heritage.",
    category: "Culture",
    featuredImage: "/images/kv.jpg",
    author: {
      name: "Aavash Regmi",
    },
    date: "Apr 15, 2025",
    readTime: "7 min read",
  },
];

export default function Home() {
  const [stories, setStories] = useState<Story[]>(defaultLatestStories);

  // Attempt to fetch any published stories from the database/API; fallback cleanly to curated stories
  useEffect(() => {
    fetch("/api/posts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.posts) && data.posts.length > 0) {
          interface ApiPost {
            id: number;
            slug: string;
            title: string;
            excerpt?: string;
            category?: string;
            featured_image?: string;
            author_name?: string;
            created_at: string;
          }
          const mapped: Story[] = data.posts.slice(0, 3).map((p: ApiPost) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt || "Discover inspiring perspectives and experiences from Nepal.",
            category: p.category || "Stories",
            featuredImage: p.featured_image || "/images/3.jpg",
            author: {
              name: p.author_name || "Editorial Team",
            },
            date: new Date(p.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            readTime: "5 min read",
          }));
          setStories(mapped);
        }
      })
      .catch(() => {
        // Fallback to rich curated stories seamlessly
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1F1A17] dark:bg-stone-950 dark:text-stone-100 selection:bg-[#C65D3B] selection:text-white">
      {/* ======================================================== */}
      {/* 1. HERO SECTION - Panoramic Himalayas Banner            */}
      {/* ======================================================== */}
      <section className="relative w-full overflow-hidden border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="relative h-[560px] sm:h-[600px] md:h-[660px] lg:h-[700px] w-full">
          {/* Panoramic Himalayan Visual */}
          <Image
            src="/images/himalaya-hero.jpg"
            alt="Panoramic view of the Nepal Himalayas with prayer flags and a Buddhist stupa in golden sunlight"
            fill
            priority
            className="object-cover object-center select-none"
            sizes="100vw"
          />

          {/* Strengthened Contrast Overlays: WCAG AA Compliant */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

          {/* Container Aligned with Content Container (max-w-7xl px-5 md:px-8) */}
          <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 md:px-8">
            <div className="max-w-2xl space-y-6 text-white pt-6 pb-12">
              {/* Eyebrow Label moved from floating watermark */}
              <div className="inline-flex items-center gap-2">
                <span className="h-[2px] w-6 bg-[#E07A5F]" />
                <span className="text-[13px] md:text-[14px] font-semibold tracking-[0.2em] uppercase text-[#E07A5F] drop-shadow-sm">
                  A LIVING STORY OF THE HIMALAYAS
                </span>
              </div>

              {/* Fluid H1 Headline: clamp(2.75rem, 5vw + 1rem, 4.5rem) */}
              <h1 className="font-heading text-[clamp(2.75rem,5vw+1rem,4.5rem)] font-bold tracking-[-0.02em] leading-[1.05] text-white drop-shadow-md">
                Discover Nepal,<br />
                one story at a time.
              </h1>

              {/* Body Lead Paragraph: 1.125-1.25rem, max-w ~52ch */}
              <p className="max-w-[52ch] text-[18px] md:text-[20px] font-normal leading-[1.6] text-white/95 drop-shadow-sm">
                Explore breathtaking places, meet inspiring people, taste authentic food, experience rich culture, and discover timeless traditions across Nepal.
              </p>

              {/* Larger Buttons: min-h-48px, px-7 (28px), hover & focus states */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  href="/blog"
                  className="group inline-flex h-12 min-h-[48px] items-center gap-2.5 rounded-full bg-[#C65D3B] px-7 text-[16px] font-medium text-white shadow-md transition-all duration-200 hover:bg-[#B24F30] hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2"
                >
                  <span>Explore Stories</span>
                  <ArrowRight className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-1.5" />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex h-12 min-h-[48px] items-center justify-center rounded-full border border-white/50 bg-black/30 px-7 text-[16px] font-medium text-white backdrop-blur-xs transition-all duration-200 hover:border-white/80 hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                >
                  About Nepal
                </Link>
              </div>
            </div>

            {/* Subtle Minimal Scroll Indicator at bottom */}
            <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/70 animate-bounce">
              <span className="text-[13px] tracking-widest uppercase font-medium">Scroll</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections Wrapper with consistent vertical scale */}
      <div className="py-16 md:py-24 space-y-20 md:space-y-28">
        {/* ======================================================== */}
        {/* 2. FEATURED STORIES - 2 Side-by-Side Cards (Culture/Travel)*/}
        {/* ======================================================== */}
        <section
          aria-labelledby="featured-stories-heading"
          className="mx-auto max-w-7xl px-5 md:px-8"
        >
          <div className="mb-8">
            <span className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#C65D3B] dark:text-[#E07A5F]">
              FEATURED ESSAYS
            </span>
            <h2
              id="featured-stories-heading"
              className="font-heading text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-100 mt-1"
            >
              Stories from the Valley & High Peaks
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {/* Card 1: Culture / Kathmandu Valley */}
            <Link
              href="/blog?category=culture"
              className="group relative aspect-[16/10] overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2"
            >
              <Image
                src="/images/kathmandu-valley.jpg"
                alt="Kathmandu Valley Durbar Square ancient pagoda temples with distant mountain peaks"
                fill
                className="object-cover transition-transform duration-600 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Category Pill Tag (13px, uppercase, 0.08em letter-spacing) */}
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-block rounded-full bg-[#C65D3B]/95 px-4 py-1.5 text-[13px] font-semibold tracking-[0.08em] text-white uppercase backdrop-blur-xs shadow-xs">
                  CULTURE
                </span>
              </div>

              {/* Stronger Bottom Gradient for perfect legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/55 to-transparent" />

              {/* Card Content at Bottom */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white space-y-2.5">
                <h3 className="font-heading text-2xl sm:text-[26px] font-bold leading-snug drop-shadow-sm group-hover:text-amber-100 transition-colors">
                  Kathmandu Valley — Where History Lives in Every Corner
                </h3>
                <p className="text-[16px] text-white/90 line-clamp-2 leading-relaxed">
                  Ancient temples, vibrant streets, and a culture that has stood the test of time.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[14px] text-white/80 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-white/70" />
                    <span>Apr 12, 2025</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-white/70" />
                    <span>Kathmandu</span>
                  </span>
                </div>
              </div>
            </Link>

            {/* Card 2: Travel / Hidden Trails */}
            <Link
              href="/blog?category=travel"
              className="group relative aspect-[16/10] overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2"
            >
              <Image
                src="/images/himalaya-trails.jpg"
                alt="Hidden Trails of the Himalayas overlooking alpine turquoise lake"
                fill
                className="object-cover transition-transform duration-600 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Category Pill Tag (Slate Blue for Travel) */}
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-block rounded-full bg-[#2E5266]/95 px-4 py-1.5 text-[13px] font-semibold tracking-[0.08em] text-white uppercase backdrop-blur-xs shadow-xs">
                  TRAVEL
                </span>
              </div>

              {/* Stronger Bottom Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/55 to-transparent" />

              {/* Card Content at Bottom */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white space-y-2.5">
                <h3 className="font-heading text-2xl sm:text-[26px] font-bold leading-snug drop-shadow-sm group-hover:text-amber-100 transition-colors">
                  Hidden Trails of the Himalayas
                </h3>
                <p className="text-[16px] text-white/90 line-clamp-2 leading-relaxed">
                  From serene lakes to towering peaks, Nepal&apos;s landscapes never cease to amaze.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[14px] text-white/80 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-white/70" />
                    <span>Apr 5, 2025</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-white/70" />
                    <span>Annapurna Region</span>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. CATEGORY CARDS - 3 Pillars (Equal Heights)            */}
        {/* ======================================================== */}
        <section
          aria-labelledby="categories-heading"
          className="mx-auto max-w-7xl px-5 md:px-8"
        >
          <div className="mb-8">
            <span className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#C65D3B] dark:text-[#E07A5F]">
              PILLARS OF NEPAL
            </span>
            <h2
              id="categories-heading"
              className="font-heading text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-100 mt-1"
            >
              Explore by Experience
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 items-stretch">
            {/* Pillar 1: Travel & Adventure */}
            <CategoryCard
              href="/blog?category=travel"
              title="Travel & Adventure"
              description="Trek majestic mountains, explore hidden valleys, and experience the thrill of Nepal's world-renowned adventures."
              icon={<Mountain className="h-6 w-6" />}
            />

            {/* Pillar 2: Food & Flavors */}
            <CategoryCard
              href="/blog?category=food"
              title="Food & Flavors"
              description="Savor authentic Nepali cuisine, from hearty dal bhat and momos to local Newari delicacies and aromatic Himalayan spices."
              icon={<UtensilsCrossed className="h-6 w-6" />}
            />

            {/* Pillar 3: People & Culture */}
            <CategoryCard
              href="/blog?category=culture"
              title="People & Culture"
              description="Meet warm-hearted locals, discover unique indigenous traditions, and celebrate the rich living heritage of Nepal."
              icon={<Users className="h-6 w-6" />}
            />
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. NEW SECTION: LATEST STORIES GRID                     */}
        {/* ======================================================== */}
        <section
          aria-labelledby="latest-stories-heading"
          className="mx-auto max-w-7xl px-5 md:px-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <span className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#C65D3B] dark:text-[#E07A5F]">
                DISPATCHES & ESSAYS
              </span>
              <h2
                id="latest-stories-heading"
                className="font-heading text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-100 mt-1"
              >
                Latest Stories from Nepal
              </h2>
              <p className="mt-1 text-[16px] text-stone-600 dark:text-stone-400 max-w-xl">
                Recent journeys, cultural portraits, and culinary traditions documented by our writers across the country.
              </p>
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#C65D3B] transition-all hover:gap-2.5 dark:text-[#E07A5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm py-1"
            >
              <span>View all stories</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 3 Story Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8 items-stretch">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. NEWSLETTER SIGNUP BLOCK                              */}
        {/* ======================================================== */}
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Newsletter />
        </div>
      </div>
    </main>
  );
}