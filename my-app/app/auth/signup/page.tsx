"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toast, ToastViewport } from "@/components/ui/toast";

import { EyeIcon, EyeOffIcon, ArrowRight, Handshake } from "lucide-react";
const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required.")
      .max(100, "Name is too long.")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces."),
    email: z.string().trim().email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password is too long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAll = (values: typeof form) => {
    const result = signupSchema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors = result.error.flatten().fieldErrors;
    setErrors({
      name: fieldErrors.name?.[0],
      email: fieldErrors.email?.[0],
      password: fieldErrors.password?.[0],
      confirmPassword: fieldErrors.confirmPassword?.[0],
    });
    return false;
  };

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    // Re-validate live once the user has already tried submitting once
    if (Object.keys(errors).length > 0) {
      validateAll(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll(form)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        if (data.error === "Email already exists") {
          setErrors((prev) => ({ ...prev, email: "An account with this email already exists." }));
        } else {
          setToast({ message: data.error || "Signup failed.", type: "error" });
        }
        setIsSubmitting(false);
        return;
      }

     setToast({ message: "Account created successfully. Please log in.", type: "success" });
router.push("/auth/login");
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
              Create an account
            </CardTitle>
            <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
              Get started with your project workspace.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Your name"
                  disabled={isSubmitting}
                  className="rounded-xl border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:border-zinc-500 dark:focus-visible:ring-zinc-500/20"
                />
                {errors.name ? <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name}</p> : null}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  className="rounded-xl border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:border-zinc-500 dark:focus-visible:ring-zinc-500/20"
                />
                {errors.email ? <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.email}</p> : null}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handleFieldChange("password", e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 rounded-xl border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:border-zinc-500 dark:focus-visible:ring-zinc-500/20"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.password}</p> : null}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 rounded-xl border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:border-zinc-500 dark:focus-visible:ring-zinc-500/20"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword ? (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.confirmPassword}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="w-full rounded-full bg-zinc-950 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 cursor-pointer mt-2 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Creating account..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Sign up</span>
                    <ArrowRight className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                  </span>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-zinc-950 hover:underline dark:text-white">
                Log in
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