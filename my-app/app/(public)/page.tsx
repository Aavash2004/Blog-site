"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Handshake, Sun, Cloud, CloudRain, Clock, Utensils, Camera } from "lucide-react";
import { useState, useEffect } from "react";

const photos = [
  { src: "/images/kv.jpg", alt: "Photo 1" },
  { src: "/images/ls.jpg", alt: "Photo 2" },
  { src: "/images/3.jpg", alt: "Photo 3" },
  { src: "/images/eug.jpg", alt: "Photo 4" },
];

// --- Time & Weather Widget ---
function TimeWeatherWidget() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const lat = 27.7172;
    const lon = 85.324;

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
    )
      .then((res) => res.json())
      .then((data) => {
        const code = data.current.weather_code;
        let condition = "clear";
        if (code >= 51 && code <= 67) condition = "rain";
        else if (code >= 1 && code <= 3) condition = "cloud";
        else if (code >= 45 && code <= 48) condition = "cloud";

        setWeather({ temp: Math.round(data.current.temperature_2m), condition });
      })
      .catch(() => setWeather({ temp: 75, condition: "cloud" }));
  }, []);

  const WeatherIcon =
    weather?.condition === "rain" ? CloudRain : weather?.condition === "cloud" ? Cloud : Sun;

  return (
    <div className="inline-flex items-center gap-4 rounded-full border border-zinc-200 bg-white px-5 py-2.5 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
      <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        <Clock className="h-3.5 w-3.5 text-zinc-400" />
        <span className="tabular-nums">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
      <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        <WeatherIcon className="h-3.5 w-3.5 text-zinc-400" />
        <span className="tabular-nums">{weather ? `${weather.temp}°F` : "--°F"}</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50/50 px-6 py-12 text-zinc-900 dark:bg-zinc-950/50 dark:text-zinc-100 sm:py-20">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-4rem] h-64 w-64 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute right-[-5rem] top-20 h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl" />
        <div className="absolute bottom-[-3rem] left-1/3 h-60 w-60 rounded-full bg-violet-300/35 blur-3xl" />
      </div>
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-xs font-semibold text-zinc-700 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80 dark:text-zinc-100">
              <Handshake className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
              <span>Stories from Nepal</span>
            </div>
            <TimeWeatherWidget />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 sm:text-6xl">
            Discover Nepal <br className="hidden sm:inline" />
            <span className="text-zinc-600">one story at a time.</span>
          </h1>

          <p className="max-w-2xl text-lg text-zinc-600 leading-relaxed">
            Explore the places, people, food, culture, traditions, and experiences that make Nepal unique. Stories and guides for discovering Nepal beyond the usual destinations.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/auth/signup"
              className="group flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800"
            >
              <span>Explore Stories</span>
              <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </Link>

            <Link
              href="/about"
              className="rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700/60 dark:bg-zinc-950/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              About Nepal
            </Link>
          </div>
        </section>

        {/* Full-Width Video Banner Section with "LEARN" in the Middle */}
        <section className="relative left-1/2 right-1/2 -ml-[50vw]  -mr-[50vw] w-screen h-72 sm:h-96 md:h-[420px] rounded-3xl overflow-hidden shadow-lg border border-zinc-200/80 my-12 dark:border-zinc-700/60">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-100"
          >
            <source src="/images/mmm.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="absolute inset-0 bg-black/30 backdrop-brightness-90" />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <span className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-widest text-white uppercase drop-shadow-lg select-none">
               Nepal
              </span>
              <span className="h-1 w-12 rounded-full bg-white/80" />
            </div>
          </div>
        </section>

        {/* Gallery Showcase Grid */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-3 shadow-2xs">
            <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-80">
              <Image src={photos[0].src} alt={photos[0].alt} fill priority className="object-cover" />
            </div>
            <div className="p-4 space-y-1">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-100">Culture</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">The Culture Behind Kathmandu Valley</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-3 shadow-2xs">
            <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-80">
              <Image src={photos[1].src} alt={photos[1].alt} fill className="object-cover" />
            </div>
            <div className="p-4 space-y-1">
              <h2 className="text-lg font-bold text-zinc-950">Travel</h2>
              <p className="text-sm text-zinc-600">Explore stunning landscapes and rich cultures around the Nepal.</p>
            </div>
          </div>
        </section>

        {/* Key Pillars */}
        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 space-y-3 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100">
              < Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100">Travel & Adventure</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
           Trekking routes, hidden destinations, travel guides, and unforgettable adventures across Nepal
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 space-y-3 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100">
              <Utensils className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100">Food & Flavors</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Discover momo, dal bhat, Newari cuisine, local dishes, and the stories behind Nepali food culture.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 space-y-3 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100">People & Culture</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Stories about Nepali communities, festivals, traditions, heritage, and the people who keep them alive.
            </p>
          </div>
        </section>
      </div>
    </main>
    
  );
}