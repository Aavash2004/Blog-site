"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, BookOpen, LogOut, ChevronDown } from "lucide-react";
import { StoredUser } from "@/app/lib/auth-client";

interface UserMenuProps {
  user: StoredUser | null;
  displayName: string;
  onLogout: () => Promise<void>;
}

export function UserMenu({ user, displayName, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const profileHref = user?.role === "admin" ? "/admin" : "/blog";
  const storiesHref = user?.role === "admin" ? "/admin/posts" : "/blog";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User account menu"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-stone-300/80 bg-white/80 px-3.5 text-[14px] font-medium text-stone-800 shadow-2xs transition-all hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2 dark:border-stone-700 dark:bg-stone-900/90 dark:text-stone-200 dark:hover:bg-stone-800"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
          <User className="h-3.5 w-3.5" />
        </span>
        <span className="font-medium tracking-tight">{displayName}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-stone-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl border border-stone-200/90 bg-white/95 p-1.5 shadow-xl backdrop-blur-md ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150 z-50 dark:border-stone-800 dark:bg-stone-950/95 dark:ring-white/10"
        >
          <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800/80">
            <p className="text-[13px] font-semibold text-stone-900 dark:text-stone-100 truncate">
              {user?.name || displayName}
            </p>
            <p className="text-[13px] text-stone-500 dark:text-stone-400 truncate">
              {user?.email || "nepal@ournepal.com"}
            </p>
          </div>

          <div className="py-1">
            <Link
              href={profileHref}
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium text-stone-700 transition hover:bg-stone-100/80 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-stone-100"
            >
              <User className="h-4 w-4 text-stone-500" />
              <span>Profile</span>
            </Link>

            <Link
              href={storiesHref}
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium text-stone-700 transition hover:bg-stone-100/80 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-stone-100"
            >
              <BookOpen className="h-4 w-4 text-stone-500" />
              <span>My Stories</span>
            </Link>
          </div>

          <div className="border-t border-stone-100 pt-1 dark:border-stone-800/80">
            <button
              type="button"
              onClick={async () => {
                setIsOpen(false);
                await onLogout();
              }}
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium text-[#C65D3B] transition hover:bg-[#C65D3B]/10 dark:text-[#E07A5F] dark:hover:bg-[#C65D3B]/20"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
