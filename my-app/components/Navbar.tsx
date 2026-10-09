"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { X, Menu, Handshake, Moon, Sun, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";
import { fetchCurrentUser, logout } from "@/app/lib/auth-client";
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
  {href: "/blog", label: "Blog"},
];

const TRANSITION_MS = 250;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Theme state
  const { theme, setTheme, resolvedTheme } = useTheme();
  const themeMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

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
    setIsLoggedIn(false);
    closeDrawer();
    router.push("/auth/login");
    router.refresh();
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setVisible(false);
    setMounted(false);
  }

  // Check auth state on mount and whenever the route changes
  // (so login/logout redirects immediately reflect in the navbar)
  useEffect(() => {
    fetchCurrentUser().then((user) => {
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

  const shouldHideNavbar = pathname === "/auth/login" || pathname === "/auth/signup";

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 px-4 pt-3 sm:px-6",
          scrolled ? "pt-2" : "pt-4"
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex max-w-6xl items-center justify-between overflow-hidden rounded-full border transition-all duration-300 px-4 py-2.5 sm:px-6",
            scrolled
              ? "border-zinc-200/80 bg-white/90 text-zinc-900 shadow-md backdrop-blur-xl ring-1 ring-black/5 dark:border-zinc-700/80 dark:bg-zinc-950/90 dark:text-zinc-100 dark:ring-white/10"
              : "border-zinc-200/60 bg-white/75 text-zinc-900 shadow-sm backdrop-blur-lg dark:border-zinc-700/60 dark:bg-zinc-950/75 dark:text-zinc-100"
          )}
        >
          <BorderBeam duration={7} size={100} colorFrom="#1005e2" colorTo="#df0e1c " />

          {/* Brand Logo */}
          <Link
  href="/"
  className="group flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-950 transition hover:opacity-90 dark:text-zinc-100"
>
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 dark:bg-white">
    <Image
      src="/nep.webp"
      alt="Our Nepal logo"
      width={16}
      height={16}
      className="h-4 w-4"
    />
  </div>
  <span className="font-bold tracking-tight text-zinc-950 dark:text-zinc-100">
    Our Nepal
  </span>
</Link>
  

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 text-sm sm:flex">
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
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-zinc-100 text-zinc-950 font-semibold dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-600 hover:bg-zinc-100/60 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/70 dark:hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Action CTAs */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" || (theme === "system" && resolvedTheme === "dark") ? "light" : "dark")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700/80 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Toggle dark mode"
            >
              {themeMounted && (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {!authChecked ? null : isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  Log in
                </Link>

                <Link
                  href="/auth/signup"
                  className="rounded-full bg-zinc-950 px-4 py-1.5 text-sm font-medium text-white shadow-xs transition duration-200 hover:bg-zinc-800"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button
            type="button"
            onClick={openDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:hidden active:scale-95"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay & Content */}
      {mounted && (
        <>
          <div
            onClick={closeDrawer}
            aria-hidden="true"
            className={cn(
              "fixed inset-0 z-[90] bg-black/40 backdrop-blur-xs transition-opacity duration-300 sm:hidden",
              visible ? "opacity-100" : "opacity-0"
            )}
          />

          <div
            role="dialog"
            aria-modal="true"
            className={cn(
              "fixed inset-y-0 right-0 z-[100] flex h-full w-[85%] max-w-sm flex-col bg-white/95 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out sm:hidden border-l border-zinc-100 dark:bg-zinc-950/95 dark:border-zinc-700/60",
              visible ? "translate-x-0" : "translate-x-full"
            )}
          >
            {/* Header inside Mobile Drawer */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
              <Link
                href="/"
                onClick={closeDrawer}
                className="flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-zinc-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                  <Handshake className="h-4 w-4" />
                </div>
                <span className="font-bold tracking-tight text-zinc-950 dark:text-zinc-100">Blogs</span>
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
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
                      "flex items-center justify-between rounded-xl px-3 py-3 text-lg font-medium transition-colors",
                      isActive
                        ? "bg-zinc-100 font-semibold text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
                    )}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="mt-auto flex flex-col gap-2.5 border-t border-zinc-100 bg-zinc-50/50 p-6 dark:border-zinc-700/60 dark:bg-zinc-950/80">
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" || (theme === "system" && resolvedTheme === "dark") ? "light" : "dark")}
                className="w-full rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-800 shadow-2xs transition hover:bg-zinc-50 dark:border-zinc-700/70 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                {themeMounted && (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) ? "Switch to Light" : "Switch to Dark"}
              </button>

              {!authChecked ? null : isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2.5 text-center text-sm font-medium text-white shadow-xs transition hover:bg-zinc-800"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={closeDrawer}
                    className="w-full rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-800 shadow-2xs transition hover:bg-zinc-50 dark:border-zinc-700/70 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={closeDrawer}
                    className="w-full rounded-full bg-zinc-950 px-4 py-2.5 text-center text-sm font-medium text-white shadow-xs transition hover:bg-zinc-800"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}