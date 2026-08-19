import type { MetadataRoute } from "next";

// Manifest URLs are absolute, so they need the base path baked in for the
// GitHub Pages build (where the app lives under /<repo>/ rather than /).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Reading an env var makes the route look dynamic; it is not — the value is
// fixed at build time, and the static export needs to be told so.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Imposter — one phone, one secret",
    short_name: "Imposter",
    description:
      "A pass-the-phone party game for 3–12 players. Everyone gets the secret word. Someone doesn't.",
    start_url: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#05061a",
    theme_color: "#05061a",
    categories: ["games", "entertainment"],
    icons: [
      { src: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${basePath}/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
