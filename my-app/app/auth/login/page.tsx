"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toast, ToastViewport } from "@/components/ui/toast";
import { EyeIcon, EyeOffIcon, ArrowRight, ArrowLeft } from "lucide-react";
import { setCurrentUser } from "@/app/lib/auth-client";
import { sanitizeRedirect } from "@/lib/redirect";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (field: "email" | "password", value: string) => {
    const result = loginSchema.shape[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0].message,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        if (data.error === "Invalid credentials") {
          setErrors({
            email: "Invalid email or password.",
            password: "Invalid email or password.",
          });
        } else {
          setToast({ message: data.error || "Login failed.", type: "error" });
        }
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        setCurrentUser(data.user);
      }
      setToast({ message: "Logged in successfully.", type: "success" });

      const defaultDest = data.user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
      const targetUrl = sanitizeRedirect(searchParams.get("redirect"), defaultDest);

      router.push(targetUrl);
      router.refresh();
    } catch {
      setToast({ message: "Unable to reach the server right now.", type: "error" });
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-140px)] items-center justify-center bg-transparent px-4 py-8 sm:py-12 text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-md space-y-4">
        {/* Navigation & Brand Header */}
        <div className="flex items-center justify-between px-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 font-medium transition hover:text-zinc-950 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </Link>
          <span className="font-serif italic text-zinc-400 dark:text-zinc-500">
            Our Nepal
          </span>
        </div>

        <Card className="relative overflow-hidden rounded-3xl border border-black/[0.07] bg-white/85 p-0 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/85">
          {/* Subtle Himalayan mountain watermark decoration */}
          <div className="pointer-events-none absolute -right-6 -top-4 w-44 opacity-25 dark:opacity-15 select-none">
            <img src="/mount.svg" alt="" className="w-full h-auto object-contain" />
          </div>

          {/* Segmented Auth Switcher (Log in / Sign up) */}
          <div className="mx-8 mt-7 flex rounded-full bg-zinc-100/90 p-1 dark:bg-zinc-800/90">
            <div className="flex-1 rounded-full bg-white py-1.5 text-center text-xs font-semibold text-zinc-950 shadow-xs dark:bg-zinc-900 dark:text-white">
              Log in
            </div>
            <Link
              href="/auth/signup"
              className="flex-1 rounded-full py-1.5 text-center text-xs font-medium text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            >
              Sign up
            </Link>
          </div>

          <CardHeader className="p-8 pt-5 pb-3 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 ring-1 ring-black/10 dark:bg-white shadow-xs">
              <Image
                src="/nep.webp"
                alt="Our Nepal"
                width={20}
                height={20}
                className="h-3.5 w-3.5 object-contain"
              />
            </div>
            <CardTitle className="font-serif text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to manage your profile, stories, and dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, email: e.target.value }));
                    if (errors.email) validateField("email", e.target.value);
                  }}
                  onBlur={() => validateField("email", form.email)}
                  className="rounded-xl border-zinc-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  required
                />
                {errors.email ? (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, password: e.target.value }));
                      if (errors.password) validateField("password", e.target.value);
                    }}
                    onBlur={() => validateField("password", form.password)}
                    className="rounded-xl border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-zinc-950 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {isSubmitting ? (
                  "Logging in..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Log in</span>
                    <ArrowRight className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                  </span>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-semibold text-zinc-950 hover:underline dark:text-white">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {toast ? (
        <ToastViewport>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </ToastViewport>
      ) : null}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginFormContent />
    </Suspense>
  );
}
