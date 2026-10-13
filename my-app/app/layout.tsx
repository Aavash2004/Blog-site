import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import CursorEffect from "./cursor";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Our Nepal - Discover Nepal, one story at a time",
  description: "Explore breathtaking places, culture, food, and timeless traditions across Nepal.",
  icons: {
    icon: "/nep.webp"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${urbanist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-zinc-900 selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CursorEffect />
          <div className="flex-1 flex flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}