"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    // Simulate sending newsletter subscription
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 800);
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-gradient-to-br from-[#F5EFE6] via-white to-[#F5ECE3] p-8 sm:p-12 lg:p-16 shadow-sm dark:border-stone-800 dark:from-stone-900/90 dark:via-stone-900 dark:to-stone-950"
    >
      {/* Decorative mountain background watermark */}
      <div className="pointer-events-none absolute -right-12 -bottom-12 opacity-5 dark:opacity-10">
        <svg
          viewBox="0 0 200 120"
          className="h-72 w-96 text-stone-900 dark:text-white"
          fill="currentColor"
        >
          <path d="M0 120 L60 20 L110 80 L150 35 L200 120 Z" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-2xl text-center space-y-4">
        <span className="inline-block rounded-full bg-[#C65D3B]/10 px-3.5 py-1 text-[13px] font-semibold tracking-[0.15em] uppercase text-[#C65D3B] dark:bg-[#C65D3B]/20 dark:text-[#E07A5F]">
          OUR DISPATCHES
        </span>

        <h2
          id="newsletter-heading"
          className="font-heading text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-100"
        >
          Get Nepal stories in your inbox
        </h2>

        <p className="text-[16px] leading-relaxed text-stone-600 dark:text-stone-300">
          A monthly digest of slow travel stories, cultural deep-dives, and photography from the Himalayas. Thoughtfully curated, no spam ever.
        </p>

        {status === "success" ? (
          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-[15px] font-medium text-left">
              Thank you for subscribing! Check your inbox soon for your first dispatch.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
            noValidate
          >
            <div className="relative flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                disabled={status === "loading"}
                placeholder="Enter your email address"
                required
                className="h-12 w-full rounded-full border border-stone-300/80 bg-white pl-11 pr-4 text-[15px] text-stone-900 placeholder:text-stone-400 shadow-2xs transition-all focus:border-[#C65D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#C65D3B] px-7 text-[15px] font-medium text-white shadow-sm transition-all hover:bg-[#B24F30] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2 disabled:opacity-70 sm:w-auto"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <>
                  <span>Subscribe</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {status === "error" && (
          <div className="flex items-center justify-center gap-1.5 text-[14px] text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <p className="text-[13px] text-stone-500 dark:text-stone-400">
          We respect your privacy. Unsubscribe at any time with one click.
        </p>
      </div>
    </section>
  );
}
