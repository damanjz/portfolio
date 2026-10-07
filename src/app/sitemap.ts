import type { MetadataRoute } from "next";
import { projects, seo } from "@/content";

/**
 * Static sitemap emitted at build (output: "export" → out/sitemap.xml).
 * `seo.url` already carries the /portfolio base path, so URLs are absolute and
 * correct on GitHub Pages — basePath is NOT auto-applied to sitemap bodies.
 * Trailing slashes match next.config `trailingSlash: true`.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = seo.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...(["systems", "art", "data"] as const).map((t) => ({ url: `${base}/${t}/`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: `${base}/resume/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/projects/${p.slug}/`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
