"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toast, ToastViewport } from "@/components/ui/toast";
import { EyeIcon, EyeOffIcon, ArrowRight, Handshake } from "lucide-react";
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-4rem] top-[-2rem] h-64 w-64 rounded-full bg-pink-300/40 blur-3xl dark:bg-pink-500/10" />
        <div className="absolute right-[-4rem] top-20 h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute bottom-[-3rem] left-1/3 h-60 w-60 rounded-full bg-violet-300/35 blur-3xl dark:bg-violet-500/10" />
      </div>
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white shadow-xs dark:bg-white dark:text-zinc-950">
            <Handshake className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">Blogs</span>
        </div>

        <Card className="border border-zinc-200/80 bg-white p-0 shadow-md rounded-3xl dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader className="p-8 pb-4 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to manage your project workspace.
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
