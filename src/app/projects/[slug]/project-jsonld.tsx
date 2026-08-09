import type { Project } from "@/content";
import { seo, categoryLabel } from "@/content";

/**
 * Per-project structured data — the machine-readable twin of each case study.
 * SoftwareSourceCode for systems work, VisualArtwork for craft; both extend
 * schema.org CreativeWork. Renders no visible DOM (a JSON-LD <script>), so it's
 * output-neutral. Complements the site-wide Person schema.
 */
export function ProjectJsonLd({ p }: { p: Project }) {
  const isSystems = p.discipline === "systems";
  const repo = p.href?.includes("github") ? p.href : undefined;
  const data = {
    "@context": "https://schema.org",
    "@type": isSystems ? "SoftwareSourceCode" : "VisualArtwork",
    name: p.name,
    headline: p.tagline,
    description: p.summary,
    url: `${seo.url}/projects/${p.slug}/`,
    dateCreated: p.year,
    keywords: [categoryLabel(p.category), ...p.stack].join(", "),
    ...(isSystems
      ? { programmingLanguage: p.stack }
      : { artMedium: p.stack.join(", ") }),
    ...(repo ? { codeRepository: repo } : {}),
    ...(p.href ? { sameAs: p.href } : {}),
    author: { "@type": "Person", name: "Daman", url: seo.url },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
