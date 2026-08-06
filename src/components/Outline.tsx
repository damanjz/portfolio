"use client";

import { useEffect, useState } from "react";
import { projects, site } from "@/content";
import { deriveStages } from "@/lib/graph";

/**
 * The linear outline — the board's a11y fallback AND the 30-second recruiter /
 * ATS / mobile read. Same content as the board (each project's derived DAG),
 * rendered as a plain nested list. Opened by the skip-link or the ☰ OUTLINE
 * button; Escape closes. Fully keyboard- and screen-reader-navigable.
 */
export default function Outline() {
  const [on, setOn] = useState(false);
  const systems = projects.filter((p) => p.discipline === "systems");
  const art = projects.filter((p) => p.discipline === "craft");

  useEffect(() => {
    const openIt = () => setOn(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOn(false);
    };
    window.addEventListener("board:outline", openIt);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("board:outline", openIt);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <section className={`outline-view ${on ? "on" : ""}`} id="outline" aria-label="Portfolio as a linear outline">
      <button
        className="hud-btn"
        style={{ position: "fixed", right: 24, top: 20 }}
        onClick={() => setOn(false)}
      >
        ✕ BACK TO THE BOARD
      </button>

      <h1 className="serif">Secure systems, engineered to run on your machine.</h1>
      <p style={{ color: "var(--dim)", marginTop: 10, maxWidth: "62ch", fontSize: 15 }}>
        {site.name} — systems engineer in Hyderabad, and an ex-3D artist. The
        board lays each project out as its production graph; this is the same
        content, linear.
      </p>

      <h2>The work</h2>
      {systems.map((p) => {
        const stages = deriveStages(p);
        return (
          <div className="o-proj" key={p.slug}>
            <b>{p.name}</b>
            {p.metric && (
              <span className="mono" style={{ color: "var(--acc)", marginLeft: 8, fontSize: 12 }}>
                {p.metric.value}
              </span>
            )}
            <div className="o-desc">{p.description}</div>
            <ol>
              {stages.map((s) => (
                <li key={s.id}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>
                    {s.label}:{" "}
                  </span>
                  {s.title}
                  {s.body ? ` — ${s.body}` : ""}
                </li>
              ))}
            </ol>
          </div>
        );
      })}

      <h2>The plates — 3D / technical art (MA Animation)</h2>
      <div className="o-proj">
        <div className="o-desc">
          {art.map((p) => p.name).join(" · ")}. Full gallery on{" "}
          <a href="https://www.artstation.com/damanpsd" target="_blank" rel="noopener noreferrer">
            ArtStation ↗
          </a>
        </div>
      </div>

      <h2>Contact</h2>
      <p style={{ color: "var(--dim)", fontSize: 14 }}>
        {site.status} · {site.replies}. GitHub{" "}
        <a href={`https://github.com/${site.handle}`} target="_blank" rel="noopener noreferrer">
          @{site.handle} ↗
        </a>{" "}
        · ArtStation @damanpsd. This site ships zero external requests and no
        analytics.
      </p>
    </section>
  );
}
