"use client";

import Link from "next/link";
import { Handshake, CameraIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200/80 bg-white/50 text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-950/80 dark:text-zinc-300">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm sm:flex-row">
        <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 text-white">
            < CameraIcon className="h-3.5 w-3.5" />
          </div>
          <span>Blogs</span>
          <span className="text-zinc-400">•</span>
          <span className="text-xs text-zinc-500">© {new Date().getFullYear()}</span>
        </div>

        <nav className="flex items-center gap-6 text-xs text-zinc-500">
          <Link href="/" className="transition hover:text-zinc-950">
            Home
          </Link>
          <Link href="/about" className="transition hover:text-zinc-950">
            About
          </Link>
          <Link href="/services" className="transition hover:text-zinc-950">
            Services
          </Link>
          <Link href="/contact" className="transition hover:text-zinc-950">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
