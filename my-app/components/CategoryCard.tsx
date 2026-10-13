import Link from "next/link";
import { ArrowRight } from "lucide-react";
import React from "react";

interface CategoryCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgPattern?: string;
}

export function CategoryCard({
  href,
  title,
  description,
  icon,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#C65D3B]/50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3B] focus-visible:ring-offset-2 dark:border-stone-800 dark:bg-stone-900/90 dark:hover:border-[#C65D3B]/60"
    >
      {/* Subtle decorative background watermarks */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-3 dark:opacity-5 transition-opacity group-hover:opacity-8 dark:group-hover:opacity-10">
        <svg
          viewBox="0 0 100 80"
          className="h-36 w-36 text-stone-900 dark:text-white"
          fill="currentColor"
        >
          <path d="M0 80 L35 15 L65 55 L85 25 L100 80 Z" />
        </svg>
      </div>

      <div className="space-y-4">
        {/* 56px Icon Container with Soft Accent-Tinted Background */}
        <div className="flex h-14 w-14 min-h-14 min-w-14 items-center justify-center rounded-2xl bg-[#C65D3B]/10 text-[#C65D3B] transition-colors duration-300 group-hover:bg-[#C65D3B] group-hover:text-white dark:bg-[#C65D3B]/20 dark:text-[#E07A5F] dark:group-hover:bg-[#C65D3B] dark:group-hover:text-white shadow-2xs">
          {icon}
        </div>

        {/* Title: 1.25rem (20px) Fraunces Heading Font */}
        <h3 className="font-heading text-[20px] font-bold text-stone-900 transition-colors duration-200 group-hover:text-[#C65D3B] dark:text-stone-100 dark:group-hover:text-[#E07A5F]">
          {title}
        </h3>

        {/* Description: 0.9375rem (15px) */}
        <p className="text-[15px] leading-relaxed text-stone-600 dark:text-stone-300">
          {description}
        </p>
      </div>

      {/* Explore More CTA Footer */}
      <div className="pt-6 mt-auto">
        <span className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#C65D3B] transition-all group-hover:gap-2.5 dark:text-[#E07A5F]">
          <span>Explore more</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
