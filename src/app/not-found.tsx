import type { Metadata } from "next";
import { site } from "@/content";
import Split from "@/components/Split";
import { TLink } from "@/components/Transition";

/** 404: on static export this is out/404.html, which GitHub Pages serves for unknown paths. */
export const metadata: Metadata = {
  title: `404 — ${site.name}`,
  description: "That page doesn't exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="nf">
      <header className="me-top nf-top">
        <span className="name">
          {site.name} <span>/ Hyderabad</span>
        </span>
      </header>
      <main>
        <span className="lbl">Error 404</span>
        <Split as="h1" text="Nothing|here" className="cap" />
        <p data-fade="">The page you followed was moved, renamed or never existed.</p>
        <div>
          <TLink href="/" label={site.name} className="pill on" data-magnetic>
            &larr; Back to all work
          </TLink>
        </div>
      </main>
    </div>
  );
}
