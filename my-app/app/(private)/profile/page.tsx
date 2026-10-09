"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCurrentUser, type StoredUser } from "@/app/lib/auth-client";
import { ShieldCheck, Clock, Hash, Pencil } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

function getInitials(name: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatMemberSince(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (u) setUser(u);
    });
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Profile
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
          Your profile.
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          A quick overview of your account.
        </p>
      </div>

      {/* Identity card */}
      <div className="rounded-3xl border border-white/50 bg-white/60 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border border-zinc-200 dark:border-zinc-700">
              {user?.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user?.name ?? "User Avatar"} />
              ) : null}
              <AvatarFallback className="text-lg font-bold">
                {getInitials(user?.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
                {user?.name || "—"}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {user?.email || "—"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                Member since {formatMemberSince(user?.created_at)}
              </p>
            </div>
          </div>

          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 shadow-2xs transition hover:bg-zinc-100 dark:border-zinc-700/60 dark:bg-zinc-950/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Pencil className="h-4 w-4" />
            Edit profile
          </Link>
        </div>
      </div>

      {/* Overview grid */}
      <div className="space-y-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Account overview
        </p>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="group rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xs transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-950/80">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white transition group-hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:group-hover:bg-zinc-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Secure Session</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Your login is protected with a signed token stored locally on this device.
            </p>
          </div>

          <div className="group rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xs transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-950/80">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white transition group-hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:group-hover:bg-zinc-200">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Stays Signed In</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              You&apos;ll remain logged in across page reloads until you log out.
            </p>
          </div>

          <div className="group rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xs transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-950/80">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white transition group-hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:group-hover:bg-zinc-200">
              <Hash className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Account ID</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              #{user?.id ?? "—"} — reference this if you ever need support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}