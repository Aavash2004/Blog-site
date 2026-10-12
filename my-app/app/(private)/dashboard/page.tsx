"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchCurrentUser,
  type StoredUser,
} from "@/app/lib/auth-client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (u) setUser(u);
    });
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
        </div>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              {user?.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.name ?? "User"} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-base font-medium">
                {user?.name ?? "—"}
              </p>
              <p className="truncate text-sm text-zinc-500">
                {user?.email ?? ""}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/profile")}
            >
              View Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/settings")}
            >
              Settings
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}