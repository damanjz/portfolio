"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { tracks, projectsIn, site } from "@/content";
import { asset } from "@/lib/asset";
import Split from "./Split";
import Ribbon from "./Ribbon";
import { TLink } from "./Transition";

/**
 * Landing: three full-height doors. Intro: doors wipe up in sequence, the
 * images settle, the giant words rise letter by letter. Hover widens a door,
 * brings its image to colour, and the image follows the pointer slightly.
 */
export default function Doors() {
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) requestAnimationFrame(() => setReady(true));
    });
    return () => {
      alive = false;
    };
  }, []);

  const drift = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * -18;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -18;
    const img = e.currentTarget.querySelector<HTMLElement>(".img");
    if (img) img.style.transform = `translate3d(${x}px,${y}px,0)`;
  };
  const settle = (e: PointerEvent<HTMLElement>) => {
    const img = e.currentTarget.querySelector<HTMLElement>(".img");
    if (img) img.style.transform = "";
  };

  return (
    <div ref={root} className={`landing ${ready ? "ready" : ""}`}>
      <header className="topbar">
        <span className="name">
          {site.name} <span>/ Hyderabad</span>
        </span>
        <nav>
          <a className="pill hide-s" href={`mailto:${site.email}`} data-magnetic>
            <span className="dot" /> {site.status}
          </a>
          <a className="pill on" href={`mailto:${site.email}`} data-magnetic>
            Email me
          </a>
        </nav>
      </header>

      <main className="doors">
        {tracks.map((t, n) => (
          <TLink
            key={t.id}
            href={`/${t.id}/`}
            label={t.word.replace("|", "")}
            className="door"
            style={{ ["--n" as string]: n }}
            data-cursor="Enter"
            onPointerMove={drift}
            onPointerLeave={settle}
          >
            <span className="img" style={{ transition: "transform 0.8s cubic-bezier(.16,1,.3,1)" }}>
              <img src={asset(t.cover)} alt="" fetchPriority="high" style={t.coverPos ? { objectPosition: t.coverPos } : undefined} />
            </span>
            <span className="top">
              <span className="num">{t.num}</span> &middot; {String(projectsIn(t.id).length).padStart(2, "0")} works
            </span>
            <span className="bot">
              <span className="role" style={{ display: "block" }}>{t.role}</span>
              <Split text={t.word} className={`word cap ${ready ? "in" : ""}`} />
            </span>
            <span className="go" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </TLink>
        ))}
      </main>

      <Ribbon items={["AI-assisted systems", "3D environments", "BI and data", site.status]} />
    </div>
  );
}
