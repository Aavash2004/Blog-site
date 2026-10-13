"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, MapPin, Compass, Search } from "lucide-react";

export interface ShowcaseDestination {
  id: string;
  slug: string;
  destination: string;
  title: string;
  region: string;
  category: string;
  excerpt: string;
  image: string;
}

const destinations: ShowcaseDestination[] = [
  {
    id: "annapurna",
    slug: "annapurna-sanctuary-fishtail",
    destination: "ANNAPURNA",
    title: "Sanctuary of Gods & Fishtail Peak",
    region: "Gandaki Province",
    category: "Trekking",
    excerpt: "Traversing morning mist and rhododendron ridges toward the amphitheater of 8,000m giants.",
    image: "/images/annapurna-sanctuary.jpg",
  },
  {
    id: "mustang",
    slug: "secret-monasteries-upper-mustang",
    destination: "MUSTANG",
    title: "The Walled Kingdom of Ancient Caves",
    region: "Trans-Himalayan Plateau",
    category: "Heritage",
    excerpt: "Wind-carved red sandstone cliffs, ancient mud-brick fortresses, and sacred Buddhist sky caves.",
    image: "/images/mustang-cliffs.jpg",
  },
  {
    id: "kathmandu",
    slug: "kathmandu-valley-living-history",
    destination: "KATHMANDU",
    title: "Where Sacred Heritage Lives in Stone",
    region: "Kathmandu Valley",
    category: "Culture",
    excerpt: "Centuries of multi-tiered pagoda craftsmanship, Newari wood carvings, and courtyard festivals.",
    image: "/images/kathmandu-valley.jpg",
  },
  {
    id: "tilicho",
    slug: "hidden-trails-tilicho-gokyo",
    destination: "TILICHO & GOKYO",
    title: "Turquoise Waters at High Altitude",
    region: "Annapurna & Everest",
    category: "Expedition",
    excerpt: "Pristine glacial alpine waters reflecting dramatic vertical snow ridges above 4,900 meters.",
    image: "/images/himalaya-trails.jpg",
  },
  {
    id: "everest",
    slug: "sagarmatha-sherpa-high-passes",
    destination: "SAGARMATHA",
    title: "Crown of the Earth & Sherpa Trails",
    region: "Solukhumbu Range",
    category: "Adventure",
    excerpt: "Prayer flags fluttering in mountain breezes beneath the grandest skyline on planet Earth.",
    image: "/images/himalaya-hero.jpg",
  },
];

const categoryTabs = [
  "ALL DESTINATIONS",
  "TREKKING",
  "HERITAGE",
  "EXPEDITION",
  "CULTURE",
];

export function BlogCoverflowShowcase() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("ALL DESTINATIONS");

  const total = destinations.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const activeDestination = destinations[activeIndex];

  return (
    <section className="relative w-full overflow-hidden bg-[#0A0D12] text-white py-8 md:py-12 border-b border-stone-800/80">
      {/* Dynamic Ambient Background Blur mirroring current active image */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 dark:opacity-25 transition-all duration-700">
        <Image
          src={activeDestination.image}
          alt=""
          fill
          className="object-cover blur-3xl scale-125 saturate-150"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0A0D12]/75 to-[#0A0D12]" />
      </div>

      {/* Top Header / Sub-Nav Bar */}
      <div className="relative mx-auto max-w-7xl px-5 md:px-8 mb-6 sm:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
          {/* Brand/Subtitle */}
          <div className="flex items-center gap-2.5">
            <Compass className="h-5 w-5 text-[#C65D3B]" />
            <span className="font-heading text-xl font-bold tracking-tight text-white">
              Expedition Chronicles
            </span>
            <span className="hidden sm:inline text-xs text-white/40">•</span>
            <span className="hidden sm:inline text-xs tracking-widest uppercase text-white/60">
              Interactive 3D Showcase
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs font-medium">
            {categoryTabs.map((tab) => {
              const isActive = selectedCategory === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedCategory(tab)}
                  className={`relative px-3.5 py-1.5 rounded-full transition-all duration-200 tracking-wider whitespace-nowrap ${
                    isActive
                      ? "bg-[#C65D3B] text-white shadow-sm font-semibold"
                      : "text-white/65 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Quick CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="#stories-grid"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-xs transition hover:bg-white/15"
            >
              <Search className="h-3.5 w-3.5 text-[#C65D3B]" />
              <span>Browse All Articles</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3D Coverflow Viewport */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 h-[480px] sm:h-[540px] md:h-[600px] flex items-center justify-center">
        {/* Previous Arrow Button */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous destination"
          className="absolute left-3 sm:left-6 md:left-10 z-40 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-white/50 hover:bg-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B]"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Next Arrow Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next destination"
          className="absolute right-3 sm:right-6 md:right-10 z-40 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-white/50 hover:bg-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B]"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* 3D Cards Perspective Container */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ perspective: "1200px" }}
        >
          {destinations.map((item, index) => {
            // Calculate signed distance with wrap-around
            let diff = index - activeIndex;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            const isCenter = diff === 0;
            const isLeft = diff === -1;
            const isRight = diff === 1;
            const isFarLeft = diff === -2;
            const isFarRight = diff === 2;

            // Only show items within distance <= 2
            const isVisible = Math.abs(diff) <= 2;
            if (!isVisible) return null;

            // Compute 3D translation & rotation values
            let translateX = "0px";
            let translateZ = "0px";
            let rotateY = "0deg";
            let scale = 1;
            let opacity = 1;
            let zIndex = 30;

            if (isCenter) {
              translateX = "0px";
              translateZ = "120px";
              rotateY = "0deg";
              scale = 1.05;
              opacity = 1;
              zIndex = 35;
            } else if (isLeft) {
              translateX = "calc(-52% - 100px)";
              translateZ = "20px";
              rotateY = "26deg";
              scale = 0.9;
              opacity = 0.85;
              zIndex = 25;
            } else if (isRight) {
              translateX = "calc(52% + 100px)";
              translateZ = "20px";
              rotateY = "-26deg";
              scale = 0.9;
              opacity = 0.85;
              zIndex = 25;
            } else if (isFarLeft) {
              translateX = "calc(-104% - 160px)";
              translateZ = "-90px";
              rotateY = "38deg";
              scale = 0.76;
              opacity = 0.5;
              zIndex = 15;
            } else if (isFarRight) {
              translateX = "calc(104% + 160px)";
              translateZ = "-90px";
              rotateY = "-38deg";
              scale = 0.76;
              opacity = 0.5;
              zIndex = 15;
            }

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!isCenter) setActiveIndex(index);
                }}
                className={`absolute cursor-pointer transition-all duration-500 ease-out select-none will-change-transform ${
                  isCenter ? "cursor-default" : "hover:brightness-110"
                }`}
                style={{
                  transform: `translateX(${translateX}) translateZ(${translateZ}) rotateY(${rotateY}) scale(${scale})`,
                  zIndex,
                  opacity,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Individual Card */}
                <div
                  className={`relative w-[210px] sm:w-[260px] md:w-[290px] lg:w-[320px] aspect-[9/13.5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
                    isCenter
                      ? "ring-2 ring-[#C65D3B]/90 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(198,93,59,0.3)]"
                      : "ring-1 ring-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 240px, (max-width: 768px) 280px, 340px"
                    priority={isCenter}
                  />

                  {/* Gradient Lighting Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  {!isCenter && (
                    <div className="absolute inset-0 bg-black/35 backdrop-brightness-95 transition-opacity" />
                  )}

                  {/* Category Pill Tag on top */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-block rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold tracking-[0.1em] text-white/90 uppercase border border-white/15">
                      {item.category}
                    </span>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white space-y-1.5">
                    {/* Destination Monogram Watermark */}
                    <p className="font-heading tracking-[0.25em] text-xs font-semibold text-[#E07A5F] uppercase">
                      {item.destination}
                    </p>

                    <h3 className="font-heading text-lg sm:text-xl font-bold leading-snug line-clamp-2 drop-shadow-md">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-white/70 pt-0.5">
                      <MapPin className="h-3 w-3 text-[#E07A5F]" />
                      <span>{item.region}</span>
                    </div>

                    {/* CTA Link when active */}
                    {isCenter && (
                      <div className="pt-3">
                        <Link
                          href={`/blog/${item.slug}`}
                          className="inline-flex items-center gap-2 rounded-full bg-[#C65D3B] hover:bg-[#B24F30] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:gap-2.5"
                        >
                          <span>Read Full Story</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Showcase Control Bar */}
      <div className="relative mx-auto max-w-xl px-4 text-center mt-4">
        {/* Indicator dots */}
        <div className="flex items-center justify-center gap-2">
          {destinations.map((dest, idx) => (
            <button
              key={dest.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to ${dest.title}`}
              className={`h-2 transition-all duration-300 rounded-full ${
                activeIndex === idx
                  ? "w-8 bg-[#C65D3B]"
                  : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-white/50 tracking-wider mt-3">
          Use arrow keys <span className="text-white/80 font-mono">← →</span> or drag to explore Nepal&apos;s iconic regions
        </p>
      </div>
    </section>
  );
}
