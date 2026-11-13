"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { asset } from "@/lib/asset";
import { srcSet } from "@/lib/srcset";
import type { Shot } from "@/content";

/** Pictures in a grid; a click opens a dark lightbox (Esc closes, arrow keys step). */
export default function Gallery({ shots }: { shots: Shot[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + shots.length) % shots.length)),
    [shots.length],
  );

  // while open: the page behind is inert (Tab stays in the viewer) and does not scroll; focus returns to the picture on close
  const isOpen = open !== null;
  const opener = useRef<HTMLButtonElement | null>(null); // set on click: by the time effects run, Close already has focus
  useEffect(() => {
    if (!isOpen) return;
    const from = opener.current;
    const page = document.querySelector<HTMLElement>(".ga");
    const html = document.documentElement;
    page?.setAttribute("inert", "");
    html.style.overflow = "hidden";
    return () => {
      page?.removeAttribute("inert");
      html.style.overflow = "";
      from?.focus({ preventScroll: true });
    };
  }, [isOpen]);

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
          <button key={s.src} className="fig" onClick={(e) => { opener.current = e.currentTarget; setOpen(i); }} aria-label={`Enlarge: ${s.alt}`}>
            <div className="frame">
              <img src={asset(s.src)} srcSet={srcSet(s.src)} sizes="(max-width: 999px) 50vw, 20vw" alt={s.alt} loading="lazy" decoding="async" />
            </div>
            <div className="cap-line">
              <span>{s.caption}</span>
            </div>
          </button>
        ))}
      </div>

      {/* on body, not in the column: the column's stacking context put the header and other columns over it */}
      {open !== null && createPortal(
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={shots[open].alt}>
          <div className="lb-top">
            <span className="count num">{`${open + 1} of ${shots.length}`}</span>
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
        </div>,
        document.body,
      )}
    </>
  );
}
