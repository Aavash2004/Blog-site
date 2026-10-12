"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Play, Pause, Utensils, Users } from "lucide-react";
import { useState, useRef } from "react";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <main className="min-h-screen bg-transparent text-zinc-900 transition-colors dark:text-zinc-100">
      {/* --- Fullscreen Edge-to-Edge Hero Video Banner --- */}
      <section className="relative w-full min-h-[calc(100vh-73px)] flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/clouds-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover scale-[1.01] motion-reduce:hidden"
        >
          <source src="/images/clouds.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Poster image fallback for users with prefers-reduced-motion */}
        <img
          src="/images/clouds-poster.jpg"
          alt="Himalayan mountain peaks and clouds"
          className="absolute inset-0 h-full w-full object-cover hidden motion-reduce:block"
        />

        {/* Scrim and Gradient Overlays for Maximum Contrast & Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/35" />
        <div className="absolute inset-0 bg-black/15" />

        {/* Hero Content Overlay */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16 md:px-14 lg:px-16 w-full">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left Column: Heading, Subtitle, Action Buttons */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-white">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.12]">
                Discover Nepal, <br />
                <span>one story at a time.</span>
              </h1>

              <p className="max-w-xl text-xs sm:text-sm md:text-base text-zinc-200/90 font-light leading-relaxed">
                Explore breathtaking places, meet inspiring people, taste authentic food, experience rich culture, and discover timeless traditions across Nepal.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#c2593f] px-6 py-3 text-xs sm:text-sm font-medium text-white shadow-sm transition hover:bg-[#a94a32] active:scale-[0.98]"
                >
                  <span>Explore Stories</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center rounded-full border border-white/40 bg-black/25 px-6 py-3 text-xs sm:text-sm font-medium text-white backdrop-blur-xs transition hover:bg-black/45 hover:border-white/60 active:scale-[0.98]"
                >
                  About Nepal
                </Link>
              </div>
            </div>

            {/* Right Column: "— NEPAL —", Italic subtitle, Play/Pause control */}
            <div className="flex flex-col items-center justify-center text-center lg:col-span-5 text-white">
              <div className="flex items-center justify-center gap-3">
                <span className="h-[1px] w-8 sm:w-12 bg-white/70" />
                <span className="font-serif text-2xl sm:text-4xl md:text-5xl tracking-[0.3em] font-normal uppercase text-white drop-shadow-sm">
                  NEPAL
                </span>
                <span className="h-[1px] w-8 sm:w-12 bg-white/70" />
              </div>

              <p className="mt-2 font-serif italic text-xs sm:text-sm md:text-base text-white/90 drop-shadow-sm">
                A living story of the Himalayas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Rest of Home Page in Centered Container --- */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14 space-y-8 sm:space-y-10">
        {/* --- Featured Highlights: 2 Large Cards --- */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card 1: Kathmandu Valley / Culture */}
          <Link
            href="/blog"
            className="group relative h-80 sm:h-96 w-full overflow-hidden rounded-[1.75rem] border border-black/5 shadow-xs transition duration-300 hover:shadow-md dark:border-white/10"
          >
            <Image
              src="/images/kv.jpg"
              alt="Kathmandu Valley"
              fill
              priority
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Top Tag */}
            <div className="absolute top-5 left-5 z-10">
              <span className="rounded-full bg-[#c2593f]/90 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-white uppercase backdrop-blur-xs">
                CULTURE
              </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-7 space-y-2">
              <h2 className="font-serif text-xl sm:text-2xl font-normal leading-snug text-white group-hover:text-amber-100 transition-colors">
                Kathmandu Valley — Where History Lives in Every Corner
              </h2>
              <p className="text-xs sm:text-sm text-zinc-200/90 font-light leading-relaxed line-clamp-2">
                Ancient temples, vibrant streets, and a culture that has stood the test of time.
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs text-zinc-300/80 font-light">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-zinc-300" />
                  Apr 12, 2025
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-zinc-300" />
                  Kathmandu
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Hidden Trails / Travel */}
          <Link
            href="/blog"
            className="group relative h-80 sm:h-96 w-full overflow-hidden rounded-[1.75rem] border border-black/5 shadow-xs transition duration-300 hover:shadow-md dark:border-white/10"
          >
            <Image
              src="/images/ls.jpg"
              alt="Hidden Trails of the Himalayas"
              fill
              priority
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Top Tag */}
            <div className="absolute top-5 left-5 z-10">
              <span className="rounded-full bg-[#3e6074]/90 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-white uppercase backdrop-blur-xs">
                TRAVEL
              </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-7 space-y-2">
              <h2 className="font-serif text-xl sm:text-2xl font-normal leading-snug text-white group-hover:text-amber-100 transition-colors">
                Hidden Trails of the Himalayas
              </h2>
              <p className="text-xs sm:text-sm text-zinc-200/90 font-light leading-relaxed line-clamp-2">
                From serene lakes to towering peaks, Nepal&apos;s landscapes never cease to amaze.
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs text-zinc-300/80 font-light">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-zinc-300" />
                  Apr 5, 2025
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-zinc-300" />
                  Annapurna Region
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* --- Key Pillars: 3 Clean Value Cards --- */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3 sm:gap-6">
          {/* Card 1: Travel & Adventure */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#E9E4DC] bg-white/70 p-6 sm:p-7 shadow-2xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE9DF] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                <svg
                  className="h-6 w-6 text-[#b85437]"
                  viewBox="0 0 28 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 17L9 5L16 17" />
                  <path d="M12 17L18 3L26 17" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-zinc-950 dark:text-zinc-50">
                  Travel & Adventure
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                  Trek majestic mountains, explore hidden valleys, and experience the thrill of Nepal&apos;s adventures.
                </p>
              </div>
            </div>
            <Link
              href="/blog"
              className="group mt-6 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#c2593f] transition hover:text-[#9e442c]"
            >
              <span>Explore more</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Card 2: Food & Flavors */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#E9E4DC] bg-white/70 p-6 sm:p-7 shadow-2xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE9DF] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                <Utensils className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-zinc-950 dark:text-zinc-50">
                  Food & Flavors
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                  Savor authentic Nepali cuisine, from hearty dal bhat to local delicacies and traditional flavors.
                </p>
              </div>
            </div>
            <Link
              href="/blog"
              className="group mt-6 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#c2593f] transition hover:text-[#9e442c]"
            >
              <span>Explore more</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Card 3: People & Culture */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#E9E4DC] bg-white/70 p-6 sm:p-7 shadow-2xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE9DF] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                <Users className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-zinc-950 dark:text-zinc-50">
                  People & Culture
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                  Meet the warm-hearted locals, discover unique traditions, and celebrate the rich cultural heritage of Nepal.
                </p>
              </div>
            </div>
            <Link
              href="/blog"
              className="group mt-6 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#c2593f] transition hover:text-[#9e442c]"
            >
              <span>Explore more</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}