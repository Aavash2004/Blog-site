import Link from "next/link";
import { CameraIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/[0.05] bg-transparent text-zinc-600 dark:border-white/[0.06] dark:text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm sm:flex-row">
        <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
          <span className="font-serif font-semibold">Our Nepal</span>
          <span className="text-zinc-400">•</span>
          <span className="text-xs text-zinc-500">© {new Date().getFullYear()}</span>
        </div>

        <nav className="flex flex-wrap items-center gap-5 sm:gap-6 text-xs text-zinc-500">
          <Link href="/" className="transition hover:text-zinc-950 dark:hover:text-white">
            Home
          </Link>
          <Link href="/about" className="transition hover:text-zinc-950 dark:hover:text-white">
            About
          </Link>
          <Link href="/services" className="transition hover:text-zinc-950 dark:hover:text-white">
            Services
          </Link>
          <Link href="/contact" className="transition hover:text-zinc-950 dark:hover:text-white">
            Contact
          </Link>
          <Link href="/blog" className="transition hover:text-zinc-950 dark:hover:text-white">
            Blog
          </Link>
          <Link href="/auth/login" className="transition hover:text-zinc-950 dark:hover:text-white">
            Log in
          </Link>
          <Link href="/auth/signup" className="transition hover:text-zinc-950 dark:hover:text-white">
            Sign up
          </Link>
        </nav>
      </div>
    </footer>
  );
}
