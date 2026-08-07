import type { Metadata } from "next";
import Link from "next/link";
import { site, seo } from "@/content";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Plates from "@/components/Plates";
import Principles from "@/components/Principles";
import Stack from "@/components/Stack";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollUnlock from "@/components/ScrollUnlock";

/**
 * /read — "The Monograph", the linear reading view of the portfolio.
 * The board (/) is the spatial view; this is the calm, top-to-bottom read of
 * the same content, reusing the v3 Monograph sections re-skinned into v4's
 * Terminal/Nocturne dual theme. Reached from the board's READ button; the bare
 * a11y outline stays as the skip-link fallback.
 */
export const metadata: Metadata = {
  title: `${site.name} — read`,
  description: site.metaDescription,
  alternates: { canonical: "/read" },
  openGraph: {
    type: "website",
    url: "/read",
    title: `${site.name} — read`,
    description: site.metaDescription,
  },
};

export default function ReadPage() {
  return (
    <div className="read-doc">
      {/* re-enable document scroll (the board route locks it) */}
      <ScrollUnlock />

      {/* thin bar: back to the board + theme toggle */}
      <div className="read-bar">
        <Link href="/" className="read-back mono">← THE BOARD</Link>
        <span className="read-bar-meta mono">The Monograph · linear read</span>
        <ThemeToggle />
      </div>

      <main>
        <Hero />
        <Work />
        <Plates />
        <Principles />
        <Stack />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
