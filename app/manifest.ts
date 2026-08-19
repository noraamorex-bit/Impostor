import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Imposter — one phone, one secret",
    short_name: "Imposter",
    description:
      "A pass-the-phone party game for 3–12 players. Everyone gets the secret word. Someone doesn't.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#05061a",
    theme_color: "#05061a",
    categories: ["games", "entertainment"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
