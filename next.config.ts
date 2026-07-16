import type { NextConfig } from "next";

// GitHub Pages serves project sites under /<repo>. The deploy workflow sets
// NEXT_PUBLIC_BASE_PATH=/<repo>; local dev and plain builds get no prefix.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Fully static site — everything is SSG, so export to plain files that
  // GitHub Pages can host. Each route becomes <route>/index.html.
  output: "export",
  trailingSlash: true,
  ...(basePath ? { basePath } : {}),
  images: {
    // No image server on Pages; assets ship as the optimized WebP/SVG files
    // already committed under public/.
    unoptimized: true,
  },
};

export default nextConfig;
