"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  BookOpen,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { BlogCoverflowShowcase } from "@/components/BlogCoverflowShowcase";
import { StoryCard, Story } from "@/components/StoryCard";
import { Newsletter } from "@/components/Newsletter";

const initialStories: Story[] = [
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
    featured: true,
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

const categoryList = ["All", "Trekking", "Heritage", "Culture", "Food", "Expedition"];

type SortOption = "newest" | "oldest" | "most_read";

export default function BlogIndexPage() {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: pressing "/" focuses the search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement !== searchInputRef.current &&
        !(document.activeElement instanceof HTMLInputElement) &&
        !(document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch stories from API with resilient fallback
  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) {
        throw new Error("Failed to load stories from server");
      }
      const data = await res.json();
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
        const mapped: Story[] = data.posts.map((p: DbPost, idx: number) => ({
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
          featured: idx === 0,
        }));
        setStories(mapped);
      } else {
        setStories(initialStories);
      }
    } catch {
      // Fallback gracefully to rich curated stories
      setStories(initialStories);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function initFetch() {
      try {
        const res = await fetch("/api/posts");
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore && data && Array.isArray(data.posts) && data.posts.length > 0) {
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
          const mapped: Story[] = data.posts.map((p: DbPost, idx: number) => ({
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
            featured: idx === 0,
          }));
          setStories(mapped);
        }
      } catch {
        // keep initialStories
      }
    }
    initFetch();
    return () => {
      ignore = true;
    };
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: stories.length };
    categoryList.forEach((cat) => {
      if (cat !== "All") {
        counts[cat] = stories.filter(
          (s) => s.category.toLowerCase() === cat.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [stories]);

  // Filter and sort stories
  const filteredAndSortedStories = useMemo(() => {
    let result = stories.filter((story) => {
      const matchesCategory =
        selectedCategory === "All" ||
        story.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        story.title.toLowerCase().includes(q) ||
        story.excerpt.toLowerCase().includes(q) ||
        story.category.toLowerCase().includes(q) ||
        story.author.name.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });

    if (sortBy === "newest") {
      result = [...result].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (sortBy === "oldest") {
      result = [...result].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (sortBy === "most_read") {
      result = [...result].sort((a, b) => b.title.length - a.title.length);
    }

    return result;
  }, [stories, selectedCategory, searchQuery, sortBy]);

  const hasActiveFilters = selectedCategory !== "All" || searchQuery.trim() !== "";
  const displayedStories = filteredAndSortedStories.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedStories.length;

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setVisibleCount(6);
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1F1A17] dark:bg-stone-950 dark:text-stone-100 selection:bg-[#C65D3B] selection:text-white">
      {/* ======================================================== */}
      {/* 1. 3D COVERFLOW DESTINATION CAROUSEL                     */}
      {/* ======================================================== */}
      <BlogCoverflowShowcase />

      {/* ======================================================== */}
      {/* 2. CATALOG HEADER, SEARCH, & FILTERS                     */}
      {/* ======================================================== */}
      <div id="stories-grid" className="mx-auto max-w-7xl px-5 pt-8 pb-16 md:pt-10 md:pb-24 space-y-8 md:space-y-10">
        {/* Section Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-stone-200/80 pb-8 dark:border-stone-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.18em] uppercase text-[#C65D3B] dark:text-[#E07A5F]">
              <Sparkles className="h-4 w-4" />
              <span>THE STORIES JOURNAL</span>
            </div>

            {/* Fluid H1: clamp(2.25rem, 3vw + 1rem, 3.25rem) */}
            <h1 className="font-heading text-[clamp(2.25rem,3vw+1rem,3.25rem)] font-bold tracking-tight text-stone-900 leading-[1.1] dark:text-stone-100">
              All Stories & Dispatches
            </h1>

            {/* Description: 1.0625rem (17px), max-w ~56ch */}
            <p className="text-[17px] leading-[1.6] text-stone-600 dark:text-stone-300 max-w-[56ch]">
              Authentic writing, cultural portraits, and travel dispatches from valleys, trails, and communities across Nepal.
            </p>
          </div>

          {/* Search Box: wider (min 320px, h-48px), clear (x) button, "/" shortcut */}
          <div className="relative w-full sm:w-80 md:w-96 lg:w-[400px]">
            <label htmlFor="story-search-input" className="sr-only">
              Search stories
            </label>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              ref={searchInputRef}
              id="story-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, region, trail..."
              className="h-12 w-full rounded-full border border-stone-300/80 bg-white pl-11 pr-20 text-[15px] text-stone-900 placeholder:text-stone-400 shadow-2xs transition-all focus:border-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500"
            />

            {/* Right Controls in Search: Clear button and "/" shortcut badge */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search input"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-stone-200 bg-stone-50 px-1.5 text-[13px] font-mono text-stone-400 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-400">
                  /
                </kbd>
              )}
            </div>
          </div>
        </div>

        {/* Filter Pills & Sort Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Horizontally scrollable filter pills with counts */}
          <div className="relative flex-1 overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="hidden lg:flex items-center gap-1.5 text-[13px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider pr-1">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filter:</span>
              </span>

              {categoryList.map((cat) => {
                const isActive = selectedCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setVisibleCount(6);
                    }}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4.5 text-[14px] sm:text-[15px] font-medium transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2 ${
                      isActive
                        ? "bg-[#C65D3B] text-white shadow-xs font-semibold"
                        : "border border-stone-200/90 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[13px] rounded-full px-2 py-0.5 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-stone-400" />
              <label htmlFor="sort-dropdown" className="text-[14px] text-stone-500 dark:text-stone-400">
                Sort:
              </label>
              <select
                id="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 rounded-full border border-stone-200/90 bg-white px-3.5 text-[14px] font-medium text-stone-800 shadow-2xs transition focus:border-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="most_read">Most read</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info & Clear Filters State Indicator */}
        <div className="flex items-center justify-between text-[14px] text-stone-600 dark:text-stone-400 pt-1">
          <p>
            Showing{" "}
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              {filteredAndSortedStories.length}
            </span>{" "}
            {filteredAndSortedStories.length === 1 ? "story" : "stories"}
            {hasActiveFilters && (
              <span>
                {" "}
                matching filters
              </span>
            )}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="font-medium text-[#C65D3B] hover:underline dark:text-[#E07A5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. STORIES GRID / STATES                                 */}
        {/* ======================================================== */}
        {error ? (
          /* Error State */
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-12 text-center dark:border-red-900/50 dark:bg-red-950/20">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-600 dark:text-red-400 mb-3" />
            <h3 className="font-heading text-xl font-bold text-stone-900 dark:text-stone-100">
              Unable to load stories
            </h3>
            <p className="mt-1 text-[15px] text-stone-600 dark:text-stone-400">
              {error}
            </p>
            <button
              type="button"
              onClick={fetchStories}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#C65D3B] px-6 py-2.5 text-[14px] font-semibold text-white shadow-xs transition hover:bg-[#B24F30]"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          </div>
        ) : isLoading ? (
          /* Skeleton Loading Cards */
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 md:gap-8 items-stretch">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col h-full overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs animate-pulse dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="aspect-[16/10] w-full rounded-xl bg-stone-200 dark:bg-stone-800 mb-5" />
                <div className="h-5 w-3/4 rounded bg-stone-200 dark:bg-stone-800 mb-3" />
                <div className="h-4 w-full rounded bg-stone-100 dark:bg-stone-800/60 mb-2" />
                <div className="h-4 w-5/6 rounded bg-stone-100 dark:bg-stone-800/60 mb-6" />
                <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-stone-200 dark:bg-stone-800" />
                    <div className="h-4 w-20 rounded bg-stone-200 dark:bg-stone-800" />
                  </div>
                  <div className="h-4 w-16 rounded bg-stone-200 dark:bg-stone-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedStories.length === 0 ? (
          /* Empty Search/Filter State */
          <div className="rounded-3xl border border-dashed border-stone-300 p-16 text-center dark:border-stone-800">
            <BookOpen className="mx-auto h-10 w-10 text-stone-400 mb-3" />
            <h3 className="font-heading text-xl font-bold text-stone-900 dark:text-stone-100">
              No stories found
            </h3>
            <p className="mt-1 text-[15px] text-stone-500 max-w-md mx-auto">
              We couldn&apos;t find any stories matching your query. Try broadening your keywords or resetting category filters.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#C65D3B] px-6 py-2.5 text-[14px] font-semibold text-white shadow-xs transition hover:bg-[#B24F30]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Main 3-Column Stories Grid with Optional Wide Featured Card */
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 md:gap-8 items-stretch">
            {displayedStories.map((story, index) => {
              // First story is wide featured if on 'All' with no search filter
              const isFirstFeatured =
                index === 0 && selectedCategory === "All" && !searchQuery.trim();

              return (
                <StoryCard
                  key={story.id}
                  story={story}
                  isFeatured={isFirstFeatured}
                />
              );
            })}
          </div>
        )}

        {/* Load More Pagination & Progress Indicator */}
        {!isLoading && filteredAndSortedStories.length > 0 && (
          <div className="flex flex-col items-center justify-center gap-3 pt-6 border-t border-stone-200/80 dark:border-stone-800">
            <p className="text-[14px] text-stone-500 dark:text-stone-400">
              Showing{" "}
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {displayedStories.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {filteredAndSortedStories.length}
              </span>{" "}
              stories
            </p>

            {hasMore ? (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-8 text-[15px] font-semibold text-stone-800 shadow-2xs transition-all hover:border-[#C65D3B] hover:text-[#C65D3B] hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-[#C65D3B]"
              >
                <span>Load More Stories</span>
              </button>
            ) : filteredAndSortedStories.length > 6 ? (
              <span className="text-[13px] text-stone-400">
                You&apos;ve reached the end of the collection.
              </span>
            ) : null}
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. NEWSLETTER SIGNUP SECTION                             */}
        {/* ======================================================== */}
        <div className="pt-8">
          <Newsletter />
        </div>
      </div>
    </main>
  );
}