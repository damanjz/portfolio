"use client";

import { useState, useEffect, useCallback } from "react";
import { asset } from "@/lib/asset";
import type { Shot } from "@/content";

/**
 * Figures — every image is a numbered figure (FIG.01 …) with a mono caption
 * on a hairline, like plates in a printed write-up. Click opens the reader:
 * paper panel, ink border, the system's one hard offset shadow.
 */
export default function Gallery({ shots }: { shots: Shot[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (dir: 1 | -1) =>
      setOpen((i) => (i === null ? i : (i + dir + shots.length) % shots.length)),
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
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, go]);

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2">
        {shots.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setOpen(i)}
            className="group block text-left"
          >
            <div className="relative aspect-[16/10] overflow-hidden border border-hairline bg-raised">
              <img src={asset(s.src)} alt={s.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
            </div>
            <div className="mono mt-2.5 text-[10px] tracking-[0.08em] text-faint transition-colors duration-150 group-hover:text-ink">
              FIG.{String(i + 1).padStart(2, "0")} — {s.caption.toUpperCase()}
            </div>
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-10">
          <div
            className="absolute inset-0 bg-[rgba(28,27,24,0.45)]"
            onClick={close}
          />
          <div className="relative flex w-full max-w-5xl flex-col rounded-[2px] border border-ink bg-paper shadow-[10px_10px_0_rgba(28,27,24,0.25)]">
            <div className="mono flex items-center gap-3 border-b border-ink px-4 py-2.5 text-[10px] tracking-[0.08em] text-faint">
              <span className="text-acc">
                FIG.{String(open + 1).padStart(2, "0")}
              </span>
              <span>/ {String(shots.length).padStart(2, "0")}</span>
              <button
                onClick={close}
                className="ml-auto border border-hairline px-2 py-0.5 transition-colors duration-150 hover:border-ink hover:text-ink"
                aria-label="Close"
              >
                ESC ✕
              </button>
            </div>
            <div className="relative aspect-[16/10] bg-raised">
              <img src={asset(shots[open].src)} alt={shots[open].alt} className="absolute inset-0 h-full w-full object-contain" />
            </div>
            <div className="flex items-center gap-3 border-t border-hairline px-4 py-3">
              <button
                onClick={() => go(-1)}
                className="mono border border-hairline px-2.5 py-1 text-xs text-graphite transition-colors duration-150 hover:border-ink hover:text-ink"
                aria-label="Previous figure"
              >
                ←
              </button>
              <p className="mono flex-1 text-center text-[10px] tracking-[0.06em] text-graphite">
                {shots[open].caption.toUpperCase()}
              </p>
              <button
                onClick={() => go(1)}
                className="mono border border-hairline px-2.5 py-1 text-xs text-graphite transition-colors duration-150 hover:border-ink hover:text-ink"
                aria-label="Next figure"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
