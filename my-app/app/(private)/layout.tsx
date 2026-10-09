"use client";
import { fetchCurrentUser, logout, type StoredUser } from "@/app/lib/auth-client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, User, Settings, LogOut, Handshake, Menu, X, LucideCamera, CameraIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Manage Posts", icon: LucideCamera },
];
function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setLocalUser] = useState<StoredUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const { theme, setTheme, resolvedTheme } = useTheme();
  const themeMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const privateLinks =
    user?.role === "admin" ? [...baseLinks, ...adminLinks] : baseLinks;

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (!u) {
        router.replace("/auth/login");
        return;
      }
      setLocalUser(u);
    });
  }, [router]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 flex-col border-r border-white/40 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/50 sm:flex">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <CameraIcon className="h-4 w-4" />
          </div>
          <span className="font-bold tracking-tight text-zinc-950 dark:text-white">Blogs</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {privateLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-3 flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-700">
              {user?.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user?.name ?? "Profile"} />
              ) : null}
              <AvatarFallback className="text-xs font-semibold">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                {user?.name || "Account"}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" || (theme === "system" && resolvedTheme === "dark") ? "light" : "dark")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            {themeMounted && (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {themeMounted && (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) ? "Light mode" : "Dark mode"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen ? (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity sm:hidden"
        />
      ) : null}

      {/* Mobile drawer panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85%] flex-col border-r border-zinc-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-zinc-800 dark:bg-zinc-950 sm:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Handshake className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-zinc-950 dark:text-white">Blogs</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {privateLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-3 flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-700">
              {user?.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user?.name ?? "Profile"} />
              ) : null}
              <AvatarFallback className="text-xs font-semibold">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                {user?.name || "Account"}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 active:scale-95 dark:text-zinc-300 dark:hover:bg-zinc-900"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Handshake className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-zinc-950 dark:text-white">Blogs</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}