import type { MetadataRoute } from "next";
import { seo } from "@/content";

/**
 * robots.txt emitted at build (output: "export" → out/robots.txt). On GitHub
 * Pages this publishes under /portfolio/robots.txt; the Sitemap line is a fully
 * qualified URL so crawlers still resolve it correctly.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = seo.url.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
