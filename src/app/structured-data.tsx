import { site, seo, socials } from "@/content";

/** JSON-LD Person schema for SEO. Server component, injected once. */
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    alternateName: site.handle,
    description: site.metaDescription,
    url: seo.url,
    jobTitle: site.role,
    sameAs: socials.map((s) => s.href).filter((h) => !h.startsWith("mailto")),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
