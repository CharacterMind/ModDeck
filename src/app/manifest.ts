import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ModDeck — Game Trainers & Mods for PC",
    short_name: "ModDeck",
    description:
      "Browse trainers for popular PC games and flip cheats like God Mode and Infinite Money — installs as a real desktop app.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0a0b0d",
    theme_color: "#ffe600",
    categories: ["games", "utilities", "entertainment"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
