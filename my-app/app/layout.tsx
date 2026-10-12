import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import CursorEffect from "./cursor";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blogs",
  description: "A clean, modern, and minimalist web application.",
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
      className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
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