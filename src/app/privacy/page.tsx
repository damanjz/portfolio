import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content";

export const metadata: Metadata = {
  title: `Privacy | ${site.name}`,
  description: "This site sets no cookies and runs no analytics or trackers. What is and is not collected.",
  alternates: { canonical: "/privacy/" },
};

/** Privacy note. Every line here is checked against the code: no cookies, no storage, no trackers. */
export default function Privacy() {
  return (
    <div className="paper legal">
      <h1>Privacy</h1>
      <p className="lead">Short version: this site sets no cookies, stores nothing in your browser and runs no analytics or trackers.</p>
      <section>
        <h2>What this site does not do</h2>
        <ul>
          <li>No cookies, no local storage, no fingerprinting.</li>
          <li>No analytics, advertising or tracking scripts.</li>
          <li>No forms, so nothing you type is sent anywhere.</li>
          <li>Fonts, images and videos are served from this site itself, not from third parties.</li>
        </ul>
      </section>
      <section>
        <h2>The two exceptions, both your choice</h2>
        <ul>
          <li>The Umbraxis case study has a YouTube video. Nothing loads from YouTube until you press play; then it loads from youtube-nocookie.com under Google&apos;s terms.</li>
          <li>Email links open your own mail app. Anything you send reaches {site.email} and is used only to reply.</li>
        </ul>
      </section>
      <section>
        <h2>Hosting</h2>
        <p>The site is static and hosted on GitHub Pages. GitHub may log technical data such as IP addresses to run and secure its service; see GitHub&apos;s privacy statement. I do not receive or look at those logs.</p>
      </section>
      <section>
        <h2>Questions</h2>
        <p>Write to <a href={`mailto:${site.email}`}>{site.email}</a>. Last updated 11 November 2026.</p>
      </section>
      <p className="back"><Link className="btn" href="/">Back to the start</Link></p>
    </div>
  );
}
