import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content";

/** 404: on static export this is out/404.html, which GitHub Pages serves for unknown paths. */
export const metadata: Metadata = {
  title: `404 — ${site.name}`,
  description: "That page doesn't exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="paper nf">
      <p className="tagrow"><span>Error 404</span></p>
      <h1>Nothing here.</h1>
      <p>The page you followed was moved, renamed or never existed.</p>
      <div className="acts">
        <Link className="btn on" href="/">Back to the start</Link>
        <Link className="btn" href="/ai/">AI</Link>
        <Link className="btn" href="/data/">Data</Link>
      </div>
    </div>
  );
}
