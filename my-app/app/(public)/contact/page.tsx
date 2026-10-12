"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50 px-6 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[500px] overflow-hidden">
        <div className="absolute left-[-4rem] top-[-2rem] h-72 w-72 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute right-[-3rem] top-8 h-80 w-80 rounded-full bg-blue-300/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/20 to-transparent dark:from-zinc-950/70 dark:via-zinc-950/20 dark:to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-16">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Contact
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
            Let&apos;s talk about your next idea.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Reach out for questions, feedback, or simple collaboration.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="relative lg:col-span-7">
            <div className="absolute inset-[-8px] rounded-[30px] bg-gradient-to-br from-pink-400/30 to-blue-400/30 blur-lg" />
            <div className="relative overflow-hidden rounded-[24px] border border-zinc-200/80 bg-white p-8 shadow-xl dark:border-zinc-700/70 dark:bg-zinc-950">
              {submitted ? (
                <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
                    Message Received
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Thank you for reaching out! We will get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", message: "" });
                    }}
                    className="mt-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                      Name
                    </label>
                    <Input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder=""
                      className="rounded-xl border-zinc-200 bg-white placeholder:text-zinc-500 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:placeholder:text-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                      Email
                    </label>
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder=""
                      className="rounded-xl border-zinc-200 bg-white placeholder:text-zinc-500 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:placeholder:text-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                      Message
                    </label>
                     <RichTextEditor
    content={form.message}
    onChange={(message: string) =>
      setForm((prev) => ({ ...prev, message }))
    }
  />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSending}
                    className="w-full cursor-pointer rounded-full bg-zinc-950 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-white"
                  >
                    {isSending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Contact Info
              </h3>
              <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  <Mail className="h-4 w-4" />
                </div>
                <span>basnetaavash7@gmail.com</span>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </main>
  );
}
