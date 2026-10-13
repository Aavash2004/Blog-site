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
    excerpt: "Traversing morning mist and bamboo ravines into the high amphitheater of 8,000m giants.",
    image: "/images/annapurna-sanctuary.jpg",
  },
  {
    id: "mustang",
    slug: "secret-monasteries-upper-mustang",
    destination: "MUSTANG",
    title: "The Walled Kingdom of Sky Caves",
    region: "Trans-Himalayan Plateau",
    category: "Heritage",
    excerpt: "Wind-carved sandstone cliffs, ancient mud-brick fortresses, and sacred Buddhist sky caves.",
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
      className="relative w-full overflow-hidden bg-[#0A0D12] text-white border-b border-stone-800/90 select-none flex flex-col justify-between pt-6 sm:pt-8 md:pt-10"
      style={{
        height: "clamp(460px, 62svh, 560px)",
      }}
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

      {/* 3D Coverflow Stage Viewport */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 flex-1 min-h-0 flex items-center justify-center">
        {/* 44px Previous Arrow Button placed outside cards */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous destination story"
          className="absolute left-2 sm:left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-40 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/25 bg-black/60 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-110 hover:border-[#C65D3B] hover:bg-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* 44px Next Arrow Button placed outside cards */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next destination story"
          className="absolute right-2 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-40 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/25 bg-black/60 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-110 hover:border-[#C65D3B] hover:bg-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* 3D Cards Perspective Stage */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ perspective: "1200px" }}
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

            // Maximum 2 cards per side on desktop, 1 on tablet, peek on mobile
            const isVisible = Math.abs(diff) <= 2;
            if (!isVisible) return null;

            // Compute exact 3D positioning
            let translateX = "0px";
            let translateZ = "0px";
            let rotateY = "0deg";
            let scale = 1;
            let opacity = 1;
            let zIndex = 35;
            let blur = "0px";

            if (isCenter) {
              translateX = "0px";
              translateZ = "24px";
              rotateY = "0deg";
              scale = 1;
              opacity = 1;
              zIndex = 35;
              blur = "0px";
            } else if (isLeft) {
              translateX = "calc(-78% - 16px)";
              translateZ = "0px";
              rotateY = "18deg";
              scale = 0.82;
              opacity = 0.65;
              zIndex = 25;
              blur = "0px";
            } else if (isRight) {
              translateX = "calc(78% + 16px)";
              translateZ = "0px";
              rotateY = "-18deg";
              scale = 0.82;
              opacity = 0.65;
              zIndex = 25;
              blur = "0px";
            } else if (isFarLeft) {
              translateX = "calc(-152% - 32px)";
              translateZ = "-50px";
              rotateY = "20deg";
              scale = 0.68;
              opacity = 0.45;
              zIndex = 15;
              blur = "0.5px";
            } else if (isFarRight) {
              translateX = "calc(152% + 32px)";
              translateZ = "-50px";
              rotateY = "-20deg";
              scale = 0.68;
              opacity = 0.45;
              zIndex = 15;
              blur = "0.5px";
            }

            const isFar = Math.abs(diff) === 2;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!isCenter) setActiveIndex(index);
                }}
                className={`absolute h-[88%] sm:h-[90%] flex items-center justify-center transition-all duration-500 ease-out will-change-transform ${
                  isCenter ? "cursor-default" : "cursor-pointer hover:opacity-85"
                } ${isFar ? "hidden lg:flex" : "flex"}`}
                style={{
                  transform: `translateX(${translateX}) translateZ(${translateZ}) rotateY(${rotateY}) scale(${scale})`,
                  zIndex,
                  opacity,
                  filter: blur !== "0px" ? `blur(${blur})` : undefined,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Individual Card Container: height 100%, aspect-ratio 3/4, width auto, max-width 340px, max-height 390px */}
                <div
                  className={`relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-300 ${
                    isCenter
                      ? "ring-2 ring-[#C65D3B] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_40px_rgba(198,93,59,0.3)]"
                      : "ring-1 ring-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.7)]"
                  }`}
                  style={{
                    height: "100%",
                    maxHeight: "390px",
                    aspectRatio: "3 / 4",
                    width: "auto",
                    maxWidth: "340px",
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 280px, (max-width: 1024px) 340px, 400px"
                    priority={isCenter}
                  />

                  {/* Strong bottom gradient: rgba(0,0,0,0.85) to transparent at ~70% */}
                  <div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.8) 35%, rgba(0,0,0,0.35) 70%, transparent 100%)",
                    }}
                  />
                  {!isCenter && (
                    <div className="absolute inset-0 bg-black/25 backdrop-brightness-95 pointer-events-none z-10" />
                  )}

                  {/* Category Pill Tag top-left: 0.75rem, uppercase */}
                  <div className="absolute top-3.5 sm:top-4 left-3.5 sm:left-4 z-20">
                    <span className="inline-block rounded-full bg-black/65 backdrop-blur-md px-3 py-1 text-[0.75rem] font-semibold tracking-[0.08em] text-white uppercase border border-white/20 shadow-xs">
                      {item.category}
                    </span>
                  </div>

                  {/* Card Content */}
                  {isCenter ? (
                    /* Center Card Content: flex column with justify-content: flex-end, >= 20px bottom padding */
                    <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 pb-5 sm:pb-6 z-20 text-white">
                      {/* Destination Eyebrow */}
                      <p className="font-heading tracking-[0.22em] text-[12px] sm:text-[13px] font-semibold text-[#E07A5F] uppercase mb-1">
                        {item.destination}
                      </p>

                      {/* Title: clamp(1.375rem, 1.2rem + 0.8vw, 1.875rem), line-clamp 2 */}
                      <h3 className="font-heading font-bold text-[clamp(1.375rem,1.2rem+0.8vw,1.875rem)] leading-tight drop-shadow-md line-clamp-2 mb-1.5 sm:mb-2">
                        {item.title}
                      </h3>

                      {/* Excerpt: 2 lines max, 0.9375rem, hidden when viewport height < 760px */}
                      <p className="carousel-excerpt-auto-hide line-clamp-2 text-[0.9375rem] leading-relaxed text-white/90 font-light mb-2 sm:mb-2.5">
                        {item.excerpt}
                      </p>

                      {/* Location / Meta: single line, 0.875rem */}
                      <div className="flex items-center gap-1.5 text-[0.875rem] text-white/80 font-medium truncate mb-3 sm:mb-3.5">
                        <MapPin className="h-3.5 w-3.5 text-[#E07A5F] shrink-0" />
                        <span className="truncate">{item.region}</span>
                      </div>

                      {/* Read Full Story Button: min-height 44px, always inside card with >=20px padding */}
                      <div>
                        <Link
                          href={`/blog/${item.slug}`}
                          className="group/btn inline-flex h-11 min-h-[44px] items-center gap-2 rounded-full bg-[#C65D3B] px-6 text-[14px] sm:text-[15px] font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#B24F30] hover:shadow-xl hover:gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                        >
                          <span>Read Full Story</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* Side Card Content: Category tag stays top-left, show only 2-line title and eyebrow, NO location, NO excerpt */
                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 pb-4 sm:pb-5 z-20 text-white">
                      <p className="font-heading tracking-[0.2em] text-[11px] sm:text-[12px] font-semibold text-[#E07A5F] uppercase mb-1">
                        {item.destination}
                      </p>
                      <h3 className="font-heading font-bold text-base sm:text-lg leading-snug drop-shadow-md line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Dots & Helper text inside section, 16-20px spacing under cards */}
      <div className="relative mx-auto max-w-xl px-4 text-center mt-2 sm:mt-3 pb-3.5 sm:pb-5 shrink-0 z-30">
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

        {/* High-Contrast Helper Text (13-14px, hidden on touch devices) */}
        <p className="hidden md:block text-[13px] text-white/75 font-medium tracking-wide mt-2">
          Use keyboard arrows <span className="text-white font-mono px-1">← →</span> or drag to explore Nepal&apos;s regions
        </p>
      </div>
    </section>
  );
}
