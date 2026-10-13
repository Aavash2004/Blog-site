"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, BookOpen, Sparkles } from "lucide-react";
import { BlogCoverflowShowcase } from "@/components/BlogCoverflowShowcase";
import { StoryCard, Story } from "@/components/StoryCard";
import { Newsletter } from "@/components/Newsletter";

const fallbackStories: Story[] = [
  {
    id: "annapurna-1",
    slug: "annapurna-sanctuary-fishtail",
    title: "Sanctuary of the Gods: In the Shadow of Machapuchare",
    excerpt:
      "Trekking through steep bamboo ravines into the high alpine natural amphitheater surrounded by Annapurna I and Fishtail Peak.",
    category: "Trekking",
    featuredImage: "/images/annapurna-sanctuary.jpg",
    author: {
      name: "Tenzin Norbu",
    },
    date: "May 2, 2025",
    readTime: "7 min read",
  },
  {
    id: "mustang-1",
    slug: "secret-monasteries-upper-mustang",
    title: "Sacred Murals of Upper Mustang: Centuries of Buddhist Art at 3,800m",
    excerpt:
      "Exploring medieval mud-brick alleyways, ancient royal palaces, and sacred sky caves with untouched 14th-century frescoes.",
    category: "Heritage",
    featuredImage: "/images/mustang-cliffs.jpg",
    author: {
      name: "Aavash Regmi",
    },
    date: "Apr 28, 2025",
    readTime: "6 min read",
  },
  {
    id: "kathmandu-1",
    slug: "kathmandu-valley-living-history",
    title: "Kathmandu Valley — Where Living History Lives in Stone & Timber",
    excerpt:
      "Centuries of Newari pagoda artistry, stone carving, and temple courtyards that have stood against earthquakes and time.",
    category: "Culture",
    featuredImage: "/images/kathmandu-valley.jpg",
    author: {
      name: "Pooja Shrestha",
    },
    date: "Apr 25, 2025",
    readTime: "5 min read",
  },
  {
    id: "tilicho-1",
    slug: "hidden-trails-tilicho-gokyo",
    title: "Hidden Glacial Trails of the Himalayas: High Passes & Sacred Waters",
    excerpt:
      "From high-altitude turquoise lakes to wind-swept cols, discovering the quiet trails beyond standard tourist routes.",
    category: "Expedition",
    featuredImage: "/images/himalaya-trails.jpg",
    author: {
      name: "Tenzin Norbu",
    },
    date: "Apr 18, 2025",
    readTime: "8 min read",
  },
  {
    id: "food-1",
    slug: "beyond-momo-newari-gastronomy",
    title: "Beyond Momo: The Ancient Fermentation & Spices of Newari Feasts",
    excerpt:
      "A deep dive into clay kiln traditions, slow-roasted choila, spiced beaten rice, and ceremonial Newari feasting culture.",
    category: "Food",
    featuredImage: "/images/eug.jpg",
    author: {
      name: "Pooja Shrestha",
    },
    date: "Apr 12, 2025",
    readTime: "5 min read",
  },
  {
    id: "everest-1",
    slug: "sagarmatha-sherpa-high-passes",
    title: "Beneath Sagarmatha: The Monasteries & High Passes of Khumbu",
    excerpt:
      "Tengboche monastery bells, morning prayer horns, and ancient stone stupas framing the tallest peaks on Earth.",
    category: "Trekking",
    featuredImage: "/images/himalaya-hero.jpg",
    author: {
      name: "Aavash Regmi",
    },
    date: "Apr 8, 2025",
    readTime: "6 min read",
  },
];

const categories = ["All", "Trekking", "Heritage", "Culture", "Food", "Expedition"];

export default function BlogIndexPage() {
  const [stories, setStories] = useState<Story[]>(fallbackStories);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch live published posts if any exist in the database
  useEffect(() => {
    fetch("/api/posts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.posts) && data.posts.length > 0) {
          interface DbPost {
            id: number;
            slug: string;
            title: string;
            excerpt?: string;
            category?: string;
            featured_image?: string;
            author_name?: string;
            created_at: string;
          }
          const mapped: Story[] = data.posts.map((p: DbPost) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt || "Explore perspectives and stories from Nepal.",
            category: p.category || "Stories",
            featuredImage: p.featured_image || "/images/annapurna-sanctuary.jpg",
            author: {
              name: p.author_name || "Editorial Writer",
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
        // Retain fallback rich stories smoothly
      });
  }, []);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const matchesCategory =
        selectedCategory === "All" ||
        story.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        searchQuery.trim() === "" ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [stories, selectedCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1F1A17] dark:bg-stone-950 dark:text-stone-100 selection:bg-[#C65D3B] selection:text-white">
      {/* ======================================================== */}
      {/* 1. 3D COVERFLOW DESTINATION SHOWCASE                     */}
      {/* ======================================================== */}
      <BlogCoverflowShowcase />

      {/* ======================================================== */}
      {/* 2. FILTER & STORIES CATALOG SECTION                      */}
      {/* ======================================================== */}
      <div id="stories-grid" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24 space-y-16">
        {/* Section Header with Search & Filter Controls */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-stone-200/80 pb-8 dark:border-stone-800">
          <div>
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.15em] uppercase text-[#C65D3B] dark:text-[#E07A5F]">
              <Sparkles className="h-4 w-4" />
              <span>THE STORIES JOURNAL</span>
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-100 mt-1">
              All Stories & Dispatches
            </h1>
            <p className="mt-1 text-[16px] text-stone-600 dark:text-stone-400 max-w-xl">
              Authentic writing, cultural portraits, and travel dispatches from valleys, trails, and communities across Nepal.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80 lg:w-96">
            <label htmlFor="story-search" className="sr-only">
              Search stories
            </label>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              id="story-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, region, trail..."
              className="h-11 w-full rounded-full border border-stone-300/80 bg-white pl-10 pr-4 text-[14px] text-stone-900 placeholder:text-stone-400 shadow-2xs transition focus:border-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider pr-2">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </span>

          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-[#C65D3B] text-white shadow-sm font-semibold"
                    : "border border-stone-200/80 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 p-16 text-center dark:border-stone-800">
            <BookOpen className="mx-auto h-8 w-8 text-stone-400 mb-3" />
            <p className="text-[16px] font-semibold text-stone-800 dark:text-stone-200">
              No matching stories found
            </p>
            <p className="text-[14px] text-stone-500 mt-1">
              Try adjusting your search terms or selecting a different category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#C65D3B] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#B24F30]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8 items-stretch">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}

        {/* Newsletter Callout */}
        <div className="pt-8">
          <Newsletter />
        </div>
      </div>
    </main>
  );
}