"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const images = [
  { src: "/images/about.jpg", alt: "Our workspace" },
  { src: "/images/about2.jpg", alt: "Team collaborating" },
  { src: "/images/about3.jpg", alt: "Product design process" },
   { src: "/images/about4.jpg", alt: "Product design process" },
    { src: "/images/about5.jpg", alt: "Product design process" },

];

const AUTOPLAY_INTERVAL = 4000;

function Carousel() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex(((i % images.length) + images.length) % images.length);
  }, []);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, AUTOPLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  return (
    <div
      className="group relative overflow-hidden rounded-3xl bg-white p-2 shadow-2xs dark:bg-zinc-950/80"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-80">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((img) => (
              <div key={img.src} className="relative h-full w-full shrink-0">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  priority={img.src === images[0].src}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={prev}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-zinc-900 opacity-0 shadow-md transition group-hover:opacity-100 hover:bg-white dark:bg-zinc-900/80 dark:text-zinc-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next image"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-zinc-900 opacity-0 shadow-md transition group-hover:opacity-100 hover:bg-white dark:bg-zinc-900/80 dark:text-zinc-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-transparent px-6 py-12 text-zinc-900 dark:text-zinc-100 sm:py-20">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            About
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
           Stories from a land of mountains.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
           A place to discover the stories, landscapes, traditions, food, people, and experiences that make Nepal truly unique.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-7">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
              Our Story
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Nepal is more than the Himalayas. Behind its mountains are centuries-old cities, diverse communities, vibrant festivals, traditional food, quiet villages, and countless stories waiting to be discovered.
            </p>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
This blog brings together travel guides, local experiences, cultural stories, food discoveries, and hidden places from across Nepal. Our goal is to help you see Nepal through the places and people that make it special.            </p>
            <div className="pt-2">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                <span>Explore Stories</span>
                <ArrowRight className="h-4 w-4 opacity-70" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Carousel />
          </div>
        </div>
      </div>
    </main>
  );
}