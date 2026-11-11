"use client";

import { useState, useEffect, useCallback } from "react";
import { asset, srcSet } from "@/lib/asset";
import type { Shot } from "@/content";

/** Pictures in a grid; a click opens a dark lightbox (Esc closes, arrow keys step). */
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
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, go]);

  return (
    <>
      <div className="figs">
        {shots.map((s, i) => (
          <button key={s.src} className="fig" onClick={() => setOpen(i)} aria-label={`Enlarge: ${s.alt}`}>
            <div className="frame">
              <img src={asset(s.src)} srcSet={srcSet(s.src)} sizes="(max-width: 999px) 50vw, 20vw" alt={s.alt} loading="lazy" decoding="async" />
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
            <span className="count num">{String(open + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}</span>
            <button onClick={close} aria-label="Close" autoFocus>Close</button>
          </div>
          <div className="lb-img" onClick={close}>
            <img src={asset(shots[open].src)} alt={shots[open].alt} onClick={(e) => e.stopPropagation()} />
          </div>
          <div className="lb-bot">
            <button onClick={() => go(-1)} aria-label="Previous image">&larr;</button>
            <p>{shots[open].caption}</p>
            <button onClick={() => go(1)} aria-label="Next image">&rarr;</button>
          </div>
        </div>
      )}
    </>
  );
}
