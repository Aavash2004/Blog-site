import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-[#FAF7F2] text-stone-600 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-stone-900 transition hover:opacity-90 dark:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-lg"
            >
              <svg
                viewBox="0 0 38 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-8 text-[#C65D3B]"
              >
                <path d="M2 21L12 4L22 21H2Z" />
                <path d="M12 4L15 11L18 21" strokeWidth="1.5" />
                <path d="M17 21L25 8L36 21H17Z" />
                <path d="M25 8L28 13L30 21" strokeWidth="1.5" />
              </svg>
              <span className="font-heading text-2xl font-bold tracking-tight">Our Nepal</span>
            </Link>

            <p className="text-[14px] leading-relaxed text-stone-600 dark:text-stone-400 max-w-sm">
              A living story of the Himalayas — celebrating the timeless places, authentic food, inspiring people, and rich cultures across Nepal.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-[16px] font-bold text-stone-900 dark:text-stone-100">
              Explore
            </h4>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link
                  href="/"
                  className="transition hover:text-[#C65D3B] dark:hover:text-[#E07A5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="transition hover:text-[#C65D3B] dark:hover:text-[#E07A5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm"
                >
                  About Nepal
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="transition hover:text-[#C65D3B] dark:hover:text-[#E07A5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition hover:text-[#C65D3B] dark:hover:text-[#E07A5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="transition hover:text-[#C65D3B] dark:hover:text-[#E07A5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm"
                >
                  Stories & Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="space-y-3">
            <h4 className="font-heading text-[16px] font-bold text-stone-900 dark:text-stone-100">
              Categories
            </h4>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link
                  href="/blog?category=travel"
                  className="transition hover:text-[#C65D3B] dark:hover:text-[#E07A5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm"
                >
                  Travel & Adventure
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?category=culture"
                  className="transition hover:text-[#C65D3B] dark:hover:text-[#E07A5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm"
                >
                  Culture & Heritage
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?category=food"
                  className="transition hover:text-[#C65D3B] dark:hover:text-[#E07A5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm"
                >
                  Food & Flavors
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?category=trekking"
                  className="transition hover:text-[#C65D3B] dark:hover:text-[#E07A5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm"
                >
                  Himalayan Trails
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Social & Connect */}
          <div className="space-y-3">
            <h4 className="font-heading text-[16px] font-bold text-stone-900 dark:text-stone-100">
              Connect
            </h4>
            <p className="text-[14px] text-stone-600 dark:text-stone-400">
              Follow our dispatches across the Himalayas and community updates.
            </p>

            <div className="flex items-center gap-3 pt-1">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white text-stone-600 transition hover:border-[#C65D3B] hover:text-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white text-stone-600 transition hover:border-[#C65D3B] hover:text-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white text-stone-600 transition hover:border-[#C65D3B] hover:text-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white text-stone-600 transition hover:border-[#C65D3B] hover:text-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Note */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-200/80 pt-8 text-[14px] text-stone-500 dark:border-stone-800 dark:text-stone-400 sm:flex-row">
          <p>© {currentYear} Our Nepal. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/about"
              className="transition hover:text-[#C65D3B] dark:hover:text-[#E07A5F]"
            >
              Editorial Policy
            </Link>
            <Link
              href="/contact"
              className="transition hover:text-[#C65D3B] dark:hover:text-[#E07A5F]"
            >
              Privacy & Inquiries
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
