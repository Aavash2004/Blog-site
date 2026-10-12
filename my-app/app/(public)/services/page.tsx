import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Mountain,
  Landmark,
  Utensils,
} from "lucide-react";

const services = [
  { icon: Mountain, title: "Travel & Adventure", description: "Discover trekking routes, mountain destinations, peaceful villages, and unforgettable adventures across Nepal.", }, { icon: Utensils, title: "Food & Flavors", description: "Explore Nepal through its food, from traditional dal bhat and momo to Newari cuisine and local specialties.", }, { icon: Landmark, title: "Culture & Heritage", description: "Learn about Nepal's festivals, traditions, ancient architecture, communities, and cultural heritage.", }, ];
 ;

const steps = [
 { number: "01", title: "Discover", description: "Find places, stories, and experiences worth exploring.", }, { number: "02", title: "Explore", description: "Dive deeper into Nepal's destinations, food, and culture.", }, { number: "03", title: "Experience", description: "See Nepal through local stories and authentic experiences.", }, { number: "04", title: "Share", description: "Discover something new and share the story with others.", }, ];
export default function ServicesPage() {
  return (
    <main className="relative min-h-screen bg-transparent px-6 py-12 text-zinc-900 dark:text-zinc-100 sm:py-20">
      <div className="mx-auto max-w-5xl space-y-20">
        {/* Header */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
           Explore Nepal
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
           Places, people, and stories worth discovering.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            From the Himalayas to the Terai, discover the destinations, traditions, flavors, and experiences that make Nepal unique.
          </p>
        </div>

        {/* Bento Image Showcase */}
       <div className="grid h-[420px] grid-cols-2 gap-4 sm:grid-cols-4 sm:grid-rows-2">
  <div className="relative col-span-2 row-span-2 h-full overflow-hidden rounded-3xl">
    <Image
      src="/images/s1.jpg"
      alt="Design process"
      fill
      className="object-cover transition duration-500 hover:scale-105"
    />
  </div>
  <div className="relative col-span-1 row-span-1 h-full overflow-hidden rounded-3xl">
    <Image
      src="/images/s2.jpg"
      alt="Development work"
      fill
      className="object-cover transition duration-500 hover:scale-105"
    />
  </div>
  <div className="relative col-span-1 row-span-1 h-full overflow-hidden rounded-3xl">
    <Image
      src="/images/s3.jpg"
      alt="Team support"
      fill
      className="object-cover transition duration-500 hover:scale-105"
    />
  </div>
  <div className="relative col-span-1 row-span-1 h-full overflow-hidden rounded-3xl">
    <Image
      src="/images/s4.jpg"
      alt="Team support"
      fill
      className="object-cover transition duration-500 hover:scale-105"
    />
  </div>
  <div className="relative col-span-1 row-span-1 h-full overflow-hidden rounded-3xl">
    <Image
      src="/images/s5.jpg"
      alt="Team support"
      fill
      className="object-cover transition duration-500 hover:scale-105"
    />
  </div>
</div>
        

        {/* Services Grid */}
        <div className="space-y-8">
          

          <div className="grid gap-5 sm:grid-cols-3">
            {services.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xs transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-950/80"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white transition group-hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:group-hover:bg-zinc-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Process Steps */}
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Our process
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-4">
            {steps.map(({ number, title, description }, i) => (
              <div key={number} className="relative space-y-2">
                <span className="text-3xl font-bold text-zinc-200 dark:text-zinc-800">
                  {number}
                </span>
                <h4 className="text-base font-bold text-zinc-950 dark:text-white">
                  {title}
                </h4>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {description}
                </p>
                {i < steps.length - 1 && (
                  <div className="absolute -right-4 top-2 hidden h-px w-8 bg-zinc-200 dark:bg-zinc-800 sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Card */}
        <div className="space-y-6 rounded-3xl bg-zinc-950 p-8 shadow-2xs sm:p-10 dark:bg-white">
          <h2 className="text-2xl font-bold text-white dark:text-zinc-950">
            Our Approach
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 dark:text-zinc-600">
            We deliver straightforward solutions tailored to your
            requirements, prioritizing usability, performance, and clean code
            standards.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800"
            >
              <span>Get in touch</span>
              <ArrowRight className="h-4 w-4 opacity-70" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
 
