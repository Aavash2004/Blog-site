"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { X, Menu, Moon, Sun, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchCurrentUser, logout, StoredUser } from "@/app/lib/auth-client";
import Image from "next/image";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
];

const TRANSITION_MS = 250;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Theme state
  const { theme, setTheme, resolvedTheme } = useTheme();
  const themeMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Auth state
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mobile drawer states
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const openDrawer = () => {
    setMounted(true);
    setOpen(true);
  };

  const closeDrawer = () => {
    setVisible(false);
    setOpen(false);
    window.setTimeout(() => setMounted(false), TRANSITION_MS);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setIsLoggedIn(false);
    closeDrawer();
    router.push("/auth/login");
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/blog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Close mobile drawer on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setVisible(false);
    setMounted(false);
  }

  // Check auth state
  useEffect(() => {
    fetchCurrentUser().then((user) => {
      setCurrentUser(user);
      setIsLoggedIn(!!user);
      setAuthChecked(true);
    });
  }, [pathname]);

  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);


  return (
    <>
      <header className="sticky top-3.5 z-50 w-full px-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-black/[0.07] bg-white/80 px-4 py-2 backdrop-blur-xl shadow-xs transition-all dark:border-white/10 dark:bg-zinc-900/80 sm:px-6">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition hover:opacity-90"
          >
            <div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-zinc-950 ring-1 ring-black/10 dark:bg-white">
              <Image
                src="/nep.webp"
                alt="Our Nepal"
                width={20}
                height={20}
                className="h-4 w-4 object-contain"
              />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Our Nepal
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-2 text-sm md:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-zinc-200/80 font-semibold text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Search Icon / Toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() =>
                setTheme(
                  theme === "dark" || (theme === "system" && resolvedTheme === "dark")
                    ? "light"
                    : "dark"
                )
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {themeMounted &&
              (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Auth buttons */}
            {!authChecked ? (
              <div className="h-7 w-28 animate-pulse rounded-full bg-zinc-200/60 dark:bg-zinc-800" />
            ) : isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-zinc-300/80 bg-white/50 px-3.5 py-1 text-xs font-medium text-zinc-700 shadow-2xs transition hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/auth/login"
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    pathname === "/auth/login"
                      ? "bg-zinc-200/80 font-semibold text-zinc-950 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                  )}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className={cn(
                    "flex items-center rounded-full px-3.5 py-1 text-xs font-medium shadow-2xs transition-all",
                    pathname === "/auth/signup"
                      ? "bg-zinc-950 text-white font-semibold dark:bg-white dark:text-zinc-950"
                      : "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  )}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              type="button"
              onClick={() =>
                setTheme(
                  theme === "dark" || (theme === "system" && resolvedTheme === "dark")
                    ? "light"
                    : "dark"
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Toggle theme"
            >
              {themeMounted &&
              (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={openDrawer}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 active:scale-95"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar Flyout */}
        {searchOpen && (
          <div className="mx-auto mt-2 max-w-md animate-in fade-in slide-in-from-top-2 duration-200">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center overflow-hidden rounded-full border border-black/10 bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95"
            >
              <Search className="h-4 w-4 text-zinc-400 ml-1 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blogs, destinations, culture..."
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer Overlay & Content */}
      {mounted && (
        <>
          <div
            onClick={closeDrawer}
            aria-hidden="true"
            className={cn(
              "fixed inset-0 z-[90] bg-black/40 backdrop-blur-xs transition-opacity duration-300 md:hidden",
              visible ? "opacity-100" : "opacity-0"
            )}
          />

          <div
            role="dialog"
            aria-modal="true"
            className={cn(
              "fixed inset-y-0 right-0 z-[100] flex h-full w-[85%] max-w-sm flex-col bg-[#FAF8F5]/98 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out md:hidden border-l border-zinc-200 dark:bg-zinc-950/98 dark:border-zinc-800",
              visible ? "translate-x-0" : "translate-x-full"
            )}
          >
            {/* Header inside Mobile Drawer */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 px-6 py-5 dark:border-zinc-800">
              <Link
                href="/"
                onClick={closeDrawer}
                className="flex items-center gap-2"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 dark:bg-white">
                  <Image
                    src="/nep.webp"
                    alt="Our Nepal"
                    width={16}
                    height={16}
                    className="h-3.5 w-3.5 object-contain"
                  />
                </div>
                <span className="font-serif text-lg font-semibold text-zinc-950 dark:text-zinc-100">
                  Our Nepal
                </span>
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1 overflow-y-auto px-6 py-4">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeDrawer}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium transition-colors",
                      isActive
                        ? "bg-zinc-200/80 font-semibold text-zinc-950 dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
                    )}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-white" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="mt-auto flex flex-col gap-2.5 border-t border-zinc-200/80 bg-zinc-100/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              {!authChecked ? null : isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-800 shadow-2xs transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <Link
                    href="/auth/login"
                    onClick={closeDrawer}
                    className={cn(
                      "w-full rounded-full border border-zinc-300 bg-white px-4 py-2 text-center text-sm font-medium text-zinc-800 shadow-2xs transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
                      pathname === "/auth/login" && "ring-2 ring-zinc-950 dark:ring-white font-semibold"
                    )}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={closeDrawer}
                    className={cn(
                      "w-full rounded-full bg-zinc-950 px-4 py-2 text-center text-sm font-medium text-white shadow-2xs transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
                      pathname === "/auth/signup" && "ring-2 ring-zinc-400 dark:ring-zinc-600 font-semibold"
                    )}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}