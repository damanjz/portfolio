"use client";

import { useState, useEffect, useCallback } from "react";
import { asset, srcSet } from "@/lib/asset";
import type { Shot } from "@/content";

/** Figures: the first runs full width, the rest in pairs. Click opens a dark
 *  lightbox (Esc closes, arrow keys step). Scroll pauses while it's open. */
export default function Gallery({ shots, start = 1 }: { shots: Shot[]; start?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + shots.length) % shots.length)),
    [shots.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [open, close, go]);

  return (
    <>
      <div className="figs">
        {shots.map((s, i) => (
          <button key={s.src} className="fig" onClick={() => setOpen(i)} data-fade="" data-cursor="Expand">
            <div className="frame">
              <img src={asset(s.src)} srcSet={srcSet(s.src)} sizes={i === 0 ? "(max-width: 760px) 100vw, 96vw" : "(max-width: 760px) 100vw, 48vw"} alt={s.alt} loading="lazy" decoding="async" />
            </div>
            <div className="cap-line">
              <span className="n">{String(i + start).padStart(2, "0")}</span>
              <span>{s.caption}</span>
            </div>
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={shots[open].alt}>
          <div className="lb-top">
            <span className="lbl" style={{ color: "var(--on-dark-muted)" }}>
              <span className="acc">{String(open + 1).padStart(2, "0")}</span> / {String(shots.length).padStart(2, "0")}
            </span>
            <button className="pill" onClick={close} aria-label="Close">
              Close
            </button>
          </div>
          <div className="lb-img" onClick={close}>
            <img src={asset(shots[open].src)} alt={shots[open].alt} onClick={(e) => e.stopPropagation()} />
          </div>
          <div className="lb-bot">
            <button className="pill" onClick={() => go(-1)} aria-label="Previous image">&larr;</button>
            <p>{shots[open].caption}</p>
            <button className="pill" onClick={() => go(1)} aria-label="Next image">&rarr;</button>
          </div>
        </div>
      )}
    </>
  );
}
