"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { X, Menu, Moon, Sun, BookOpen, User as UserIcon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchCurrentUser, logout, StoredUser } from "@/app/lib/auth-client";
import { UserMenu } from "@/components/UserMenu";

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
  const [scrolled, setScrolled] = useState(false);

  // Theme state
  const { theme, setTheme, resolvedTheme } = useTheme();
  const themeMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Auth state
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

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
    closeDrawer();
    router.push("/auth/login");
    router.refresh();
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
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

  useEffect(() => {
    fetchCurrentUser().then((user) => {
      setCurrentUser(user);
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

  const isDarkMode =
    themeMounted &&
    (theme === "dark" || (theme === "system" && resolvedTheme === "dark"));

  const displayName =
    currentUser?.name?.split(" ")[0] || currentUser?.username || "Aavash";

  const themeToggleLabel = isDarkMode
    ? "Switch to light mode"
    : "Switch to dark mode";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-stone-200/80 bg-[#FAF7F2]/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/95 shadow-xs"
            : "border-b border-transparent bg-[#FAF7F2] dark:border-transparent dark:bg-stone-950"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-stone-900 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2 rounded-lg p-1 dark:text-stone-100"
          >
            {/* Mountain Peak Line Logo */}
            <svg
              viewBox="0 0 38 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-9 text-[#C65D3B] transition-transform duration-300 group-hover:scale-105"
            >
              <path d="M2 21L12 4L22 21H2Z" />
              <path d="M12 4L15 11L18 21" strokeWidth="1.5" />
              <path d="M17 21L25 8L36 21H17Z" />
              <path d="M25 8L28 13L30 21" strokeWidth="1.5" />
            </svg>
            <span className="font-heading text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Our Nepal
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-8 lg:gap-10 sm:flex" aria-label="Main Navigation">
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
                    "relative py-1 text-[15px] lg:text-[16px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] rounded-sm",
                    "after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full after:origin-bottom-left after:transition-transform after:duration-200",
                    isActive
                      ? "text-[#C65D3B] font-semibold dark:text-[#E07A5F] after:bg-[#C65D3B] dark:after:bg-[#E07A5F] after:scale-x-100"
                      : "text-stone-700 hover:text-[#C65D3B] dark:text-stone-300 dark:hover:text-[#E07A5F] after:bg-[#C65D3B] dark:after:bg-[#E07A5F] after:scale-x-0 hover:after:scale-x-100"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action CTAs */}
          <div className="hidden items-center gap-3.5 sm:flex">
            {/* Theme Toggle Button - 40x40px with aria-label & tooltip */}
            <button
              type="button"
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              aria-label={themeToggleLabel}
              title={themeToggleLabel}
              className="inline-flex h-10 w-10 min-w-10 items-center justify-center rounded-full border border-stone-300/80 bg-white/80 text-stone-700 shadow-2xs transition-all hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2 dark:border-stone-700 dark:bg-stone-900/90 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              {isDarkMode ? (
                <Sun className="h-4.5 w-4.5 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-stone-700 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* User Profile Pill with merged Dropdown (Profile, My Stories, Logout) */}
            <UserMenu
              user={currentUser}
              displayName={displayName}
              onLogout={handleLogout}
            />
          </div>

          {/* Mobile Toggle Button */}
          <button
            type="button"
            onClick={openDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] dark:border-stone-800 dark:text-stone-200 dark:hover:bg-stone-800 sm:hidden active:scale-95"
            aria-label="Open navigation menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

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
              "fixed inset-y-0 right-0 z-[100] flex h-full w-[85%] max-w-sm flex-col bg-[#FAF7F2] shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out sm:hidden border-l border-stone-200 dark:bg-stone-950 dark:border-stone-800",
              visible ? "translate-x-0" : "translate-x-full"
            )}
          >
            {/* Header inside Mobile Drawer */}
            <div className="flex items-center justify-between border-b border-stone-200/80 px-6 py-5 dark:border-stone-800">
              <Link
                href="/"
                onClick={closeDrawer}
                className="flex items-center gap-2.5 text-sm font-semibold text-stone-900 dark:text-stone-100"
              >
                <svg
                  viewBox="0 0 38 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-7 text-[#C65D3B]"
                >
                  <path d="M2 21L12 4L22 21H2Z" />
                  <path d="M12 4L15 11L18 21" strokeWidth="1.5" />
                  <path d="M17 21L25 8L36 21H17Z" />
                  <path d="M25 8L28 13L30 21" strokeWidth="1.5" />
                </svg>
                <span className="font-heading text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                  Our Nepal
                </span>
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1.5 overflow-y-auto px-6 py-5">
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
                      "flex items-center justify-between rounded-xl px-3.5 py-3 text-[16px] font-medium transition-colors",
                      isActive
                        ? "bg-stone-200/70 font-semibold text-[#C65D3B] dark:bg-stone-800 dark:text-[#E07A5F]"
                        : "text-stone-700 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-800/70 dark:hover:text-stone-100"
                    )}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-[#C65D3B] dark:bg-[#E07A5F]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Details & Theme Toggle */}
            <div className="mt-auto flex flex-col gap-3 border-t border-stone-200/80 bg-stone-100/50 p-6 dark:border-stone-800 dark:bg-stone-900/80">
              {/* User Shortcuts in Mobile Drawer */}
              <div className="rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-950/80">
                <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C65D3B]/10 text-[#C65D3B]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-[13px] font-semibold text-stone-900 dark:text-stone-100">{displayName}</p>
                    <p className="text-[12px] text-stone-500 truncate">{currentUser?.email || "nepal@ournepal.com"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <Link
                    href={currentUser?.role === "admin" ? "/admin" : "/blog"}
                    onClick={closeDrawer}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-900"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-stone-500" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href={currentUser?.role === "admin" ? "/admin/posts" : "/blog"}
                    onClick={closeDrawer}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-900"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-stone-500" />
                    <span>My Stories</span>
                  </Link>
                </div>
              </div>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                className="flex items-center justify-center gap-2 w-full rounded-full border border-stone-300 bg-white px-4 py-2.5 text-center text-[14px] font-medium text-stone-800 shadow-2xs transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50/50 px-4 py-2.5 text-center text-[14px] font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}