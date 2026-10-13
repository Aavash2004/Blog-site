"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, MapPin } from "lucide-react";

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
    title: "Sanctuary of the Gods & Fishtail Peak",
    region: "Gandaki Province",
    category: "Trekking",
    excerpt: "Traversing morning mist and rhododendron ridges toward the amphitheater of 8,000m giants.",
    image: "/images/annapurna-sanctuary.jpg",
  },
  {
    id: "mustang",
    slug: "secret-monasteries-upper-mustang",
    destination: "MUSTANG",
    title: "The Walled Kingdom of Sky Caves",
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

export function BlogCoverflowShowcase() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = destinations.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay (~6s), paused on hover/focus and disabled when prefers-reduced-motion is active
  useEffect(() => {
    if (isPaused) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current;
      if (distance > 50) nextSlide();
      if (distance < -50) prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const activeDestination = destinations[activeIndex];

  return (
    <section
      aria-label="Featured Himalayan Destinations Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-[#0A0D12] text-white py-12 md:py-16 lg:py-20 border-b border-stone-800/90 select-none"
    >
      {/* Screen reader live announcement */}
      <div className="sr-only" aria-live="polite">
        Slide {activeIndex + 1} of {total}: {activeDestination.title} in {activeDestination.region}
      </div>

      {/* Dynamic Ambient Cross-Fade Backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {destinations.map((dest, idx) => (
          <div
            key={dest.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              activeIndex === idx ? "opacity-35" : "opacity-0"
            }`}
          >
            <Image
              src={dest.image}
              alt=""
              fill
              className="object-cover blur-3xl scale-125 saturate-150 brightness-75"
              sizes="100vw"
            />
          </div>
        ))}
        {/* Layered vignette and tone tints */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#0A0D12]/60 to-[#0A0D12]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D12] via-transparent to-[#0A0D12]/70" />
      </div>

      {/* 3D Coverflow Viewport (Increased height: 460px - 580px) */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 h-[460px] sm:h-[520px] md:h-[560px] lg:h-[600px] flex items-center justify-center">
        {/* 48px Previous Arrow Button placed outside cards */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous destination story"
          className="absolute left-2 sm:left-4 md:left-8 lg:left-12 z-40 flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-white/25 bg-black/60 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-110 hover:border-[#C65D3B] hover:bg-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* 48px Next Arrow Button placed outside cards */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next destination story"
          className="absolute right-2 sm:right-4 md:right-8 lg:right-12 z-40 flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-white/25 bg-black/60 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-110 hover:border-[#C65D3B] hover:bg-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* 3D Cards Perspective Stage */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ perspective: "1300px" }}
        >
          {destinations.map((item, index) => {
            // Signed distance relative to active slide
            let diff = index - activeIndex;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            const isCenter = diff === 0;
            const isLeft = diff === -1;
            const isRight = diff === 1;
            const isFarLeft = diff === -2;
            const isFarRight = diff === 2;

            const isVisible = Math.abs(diff) <= 2;
            if (!isVisible) return null;

            // Compute exact 3D positioning
            let translateX = "0px";
            let translateZ = "0px";
            let rotateY = "0deg";
            let scale = 1;
            let opacity = 1;
            let zIndex = 30;

            if (isCenter) {
              translateX = "0px";
              translateZ = "140px";
              rotateY = "0deg";
              scale = 1.08;
              opacity = 1;
              zIndex = 35;
            } else if (isLeft) {
              translateX = "calc(-56% - 110px)";
              translateZ = "10px";
              rotateY = "24deg";
              scale = 0.88;
              opacity = 0.68;
              zIndex = 25;
            } else if (isRight) {
              translateX = "calc(56% + 110px)";
              translateZ = "10px";
              rotateY = "-24deg";
              scale = 0.88;
              opacity = 0.68;
              zIndex = 25;
            } else if (isFarLeft) {
              translateX = "calc(-110% - 170px)";
              translateZ = "-90px";
              rotateY = "34deg";
              scale = 0.74;
              opacity = 0.45;
              zIndex = 15;
            } else if (isFarRight) {
              translateX = "calc(110% + 170px)";
              translateZ = "-90px";
              rotateY = "-34deg";
              scale = 0.74;
              opacity = 0.45;
              zIndex = 15;
            }

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!isCenter) setActiveIndex(index);
                }}
                className={`absolute transition-all duration-500 ease-out will-change-transform ${
                  isCenter ? "cursor-default" : "cursor-pointer hover:opacity-85"
                }`}
                style={{
                  transform: `translateX(${translateX}) translateZ(${translateZ}) rotateY(${rotateY}) scale(${scale})`,
                  zIndex,
                  opacity,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Individual Card Container */}
                <div
                  className={`relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-300 ${
                    isCenter
                      ? "w-[270px] sm:w-[330px] md:w-[380px] lg:w-[410px] aspect-[9/13.5] ring-2 ring-[#C65D3B] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(198,93,59,0.35)]"
                      : "w-[220px] sm:w-[270px] md:w-[300px] lg:w-[330px] aspect-[9/13.5] ring-1 ring-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.7)]"
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 270px, (max-width: 768px) 330px, 410px"
                    priority={isCenter}
                  />

                  {/* Gradient Lighting Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                  {!isCenter && (
                    <div className="absolute inset-0 bg-black/25 backdrop-brightness-95" />
                  )}

                  {/* Category Pill Tag */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-block rounded-full bg-black/65 backdrop-blur-md px-3.5 py-1 text-[13px] font-semibold tracking-[0.08em] text-white uppercase border border-white/20 shadow-xs">
                      {item.category}
                    </span>
                  </div>

                  {/* Card Content at Bottom */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white space-y-2">
                    {/* Destination Eyebrow */}
                    <p className="font-heading tracking-[0.22em] text-xs font-semibold text-[#E07A5F] uppercase">
                      {item.destination}
                    </p>

                    {/* Title: 1.75 - 2.25rem on Center Card */}
                    <h3
                      className={`font-heading font-bold leading-tight drop-shadow-md ${
                        isCenter
                          ? "text-2xl sm:text-[28px] lg:text-[32px] line-clamp-2"
                          : "text-lg sm:text-xl line-clamp-2"
                      }`}
                    >
                      {item.title}
                    </h3>

                    {/* Excerpt on Center Card */}
                    {isCenter && (
                      <p className="line-clamp-2 text-[14px] sm:text-[15px] leading-relaxed text-white/90 font-light pt-0.5">
                        {item.excerpt}
                      </p>
                    )}

                    {/* Location Region */}
                    <div className="flex items-center gap-1.5 text-xs sm:text-[13px] text-white/75 font-medium pt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-[#E07A5F]" />
                      <span>{item.region}</span>
                    </div>

                    {/* Large "Read Full Story" Button (min-h 48px) on Active Card */}
                    {isCenter && (
                      <div className="pt-3">
                        <Link
                          href={`/blog/${item.slug}`}
                          className="group/btn inline-flex h-12 min-h-[48px] items-center gap-2.5 rounded-full bg-[#C65D3B] px-7 text-[15px] font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#B24F30] hover:shadow-xl hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                        >
                          <span>Read Full Story</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
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

      {/* Pagination Dots with Larger Tap Targets (min 24px) */}
      <div className="relative mx-auto max-w-xl px-4 text-center mt-6">
        <div className="flex items-center justify-center gap-2">
          {destinations.map((dest, idx) => (
            <button
              key={dest.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to slide ${idx + 1}: ${dest.title}`}
              className="group flex h-6 w-6 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-full"
            >
              <span
                className={`transition-all duration-300 rounded-full ${
                  activeIndex === idx
                    ? "w-8 h-2.5 bg-[#C65D3B]"
                    : "w-2.5 h-2.5 bg-white/40 group-hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>

        {/* High-Contrast Helper Text (hidden on touch devices) */}
        <p className="hidden md:block text-[13px] text-white/75 font-medium tracking-wide mt-3">
          Use keyboard arrows <span className="text-white font-mono px-1">← →</span> or drag to explore Nepal&apos;s regions
        </p>
      </div>
    </section>
  );
}
