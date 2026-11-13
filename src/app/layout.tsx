import type { Metadata } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import "./globals.css";
import "./pipe.css";
import { site, seo, lanes, laneLabel, projects, trackOf, nameOf, about, scenes } from "@/content";
import { StructuredData } from "./structured-data";
import Shell, { type Face } from "@/components/Shell";
import { srcSet } from "@/lib/srcset";

// Two families, self-hosted by next/font at build time (no runtime request to Google):
// Newsreader for display, Instrument Sans for text.
const serif = Newsreader({ variable: "--font-serif", subsets: ["latin"], axes: ["opsz"], display: "swap" });
const sans = Instrument_Sans({ variable: "--font-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),
  title: site.metaTitle,
  description: site.metaDescription,
  authors: [{ name: site.name, url: seo.url }],
  creator: site.name,
  keywords: ["Daman Reddy", "AI agents", "LLM evaluation", "RAG", "data analyst", "BI analyst", "Power BI", "Tableau", "SQL", "Python", "FastAPI", "3D environment artist", "Hyderabad"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: site.name, title: site.metaTitle, description: site.metaDescription, locale: "en_US", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: site.metaTitle, description: site.metaDescription, images: ["/og.png"] },
  robots: { index: true, follow: true },
};

// What each closed column shows. Built here on the server so the client shell carries only this, not all content.
const faces: Face[] = [
  { id: "you", label: site.name, sub: "About me", lede: about.head, location: site.location, status: site.status, portrait: about.portrait && { ...about.portrait, srcSet: srcSet(about.portrait.src) } },
  ...lanes().map((t) => {
    const work = projects.filter((p) => trackOf(p) === t.id);
    return { id: t.id, label: laneLabel[t.id], sub: `${work.length} projects`, role: t.role, names: work.map(nameOf), stats: t.stats };
  }),
];
const laneOfSlug = Object.fromEntries(projects.map((p) => [p.slug, trackOf(p)]));
const sceneList = scenes.map((s) => ({ ...s, srcSet: srcSet(s.src) }));
// Stamped once at build time, so the server render and the browser agree.
const updated = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <StructuredData />
        <Shell faces={faces} laneOfSlug={laneOfSlug} scenes={sceneList} email={site.email} updated={updated}>
          {children}
        </Shell>
      </body>
    </html>
  );
}
