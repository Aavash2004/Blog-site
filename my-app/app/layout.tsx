import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import CursorEffect from "./cursor";
import { ThemeProvider } from "@/components/theme-provider";
import { HimalayanBackground } from "@/components/HimalayanBackground";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Our Nepal — Discover Nepal, one story at a time",
  description: "Explore breathtaking places, meet inspiring people, taste authentic food, and experience rich culture across Nepal.",
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
      className={`${inter.variable} ${jetBrainsMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-zinc-900 selection:text-white relative">
        <HimalayanBackground />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CursorEffect />
          <div className="flex-1 flex flex-col relative z-10">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}