import type { NextConfig } from "next";

/**
 * GitHub Pages serves a project site from a sub-path (/<repo>/) and cannot run
 * a Node server, so that build is a static export with a base path. Vercel (and
 * `next dev`) serve from the root and set neither variable, so they are
 * unaffected — one `main`, two working deployments.
 */
const isPagesBuild = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  ...(isPagesBuild
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath || undefined,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
