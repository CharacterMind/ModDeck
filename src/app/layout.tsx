import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ModDeck — Game Trainers & Mods for PC",
  description:
    "ModDeck is a WeMod-style game trainer platform: browse trainers for popular PC games, launch them, and flip cheats like God Mode, Infinite Money and multipliers with a live simulator.",
  keywords: ["ModDeck", "game trainers", "cheats", "mods", "single-player", "PC games", "WeMod"],
  authors: [{ name: "ModDeck" }],
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%23ffe600'/%3E%3Ctext x='50' y='68' font-size='52' text-anchor='middle' fill='%231c1a00' font-family='sans-serif' font-weight='bold'%3EM%3C/text%3E%3C/svg%3E",
      },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "ModDeck — Game Trainers & Mods for PC",
    description: "Trainers for 12 popular PC games with a live cheat simulator.",
    siteName: "ModDeck",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffe600",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
