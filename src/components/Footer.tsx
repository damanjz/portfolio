"use client";

import { useRef } from "react";
import { site } from "@/content";
import { useModKey } from "@/lib/useModKey";

/**
 * The colophon line — the thesis proven where nobody looks.
 *
 * REPRINT (2026-08-06): the one reward for reading to the end. It replays
 * every draw, set, and print on the page top-to-bottom — you watch the
 * document print itself again. Pure CSS animations; each element gets its
 * document position as a delay (--rp), so the pass sweeps down the page.
 */
export default function Footer() {
  const modK = useModKey();
  const year = new Date().getFullYear();
  const busy = useRef(false);

  const reprint = () => {
    if (busy.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = document.querySelectorAll<HTMLElement>(
      ".ledger-draw, .fade, .printout, .setline",
    );
    let max = 0;
    els.forEach((el) => {
      const y = el.getBoundingClientRect().top + window.scrollY;
      const d = Math.max(0, Math.min(2600, Math.round(y * 0.4)));
      el.style.setProperty("--rp", `${d}ms`);
      if (d > max) max = d;
    });
    busy.current = true;
    document.body.classList.add("reprinting");
    window.setTimeout(() => {
      document.body.classList.remove("reprinting");
      els.forEach((el) => el.style.removeProperty("--rp"));
      busy.current = false;
    }, max + 1400);
  };

  return (
    <footer className="border-t border-hairline px-5 sm:px-8 xl:px-0">
      <div className="mono mx-auto flex max-w-[1232px] flex-col gap-2 py-5 text-[10px] tracking-[0.08em] text-faint sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {year} {site.name.toUpperCase()} · {site.location.toUpperCase()}
        </span>
        <span>BUILT LOCAL-FIRST — THIS SITE SHIPS NO ANALYTICS</span>
        <span className="flex items-center gap-4">
          <button
            onClick={reprint}
            className="no-print transition-colors duration-150 hover:text-acc"
            title="Print the page again"
          >
            REPRINT ↻
          </button>
          <span>INDEX {modK.toUpperCase()}</span>
        </span>
      </div>
    </footer>
  );
}
