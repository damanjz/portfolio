"use client";

import { useEffect, useState } from "react";
import { site } from "@/content";
import { scrollToId } from "./SmoothScroll";
import { useModKey } from "@/lib/useModKey";

const NAV = [
  { id: "work", label: "work" },
  { id: "plates", label: "plates" },
  { id: "principles", label: "principles" },
  { id: "stack", label: "stack" },
  { id: "contact", label: "contact" },
] as const;

/**
 * The folio line — a print running header, not an app chrome bar.
 * Serif name · mono positioning · mono nav · local time · ⌘K index chip.
 */
export default function StatusBar() {
  const [clock, setClock] = useState("");
  const modK = useModKey();

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    };
    tick();
    const t = setInterval(tick, 15_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-hairline bg-paper/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-[60px] max-w-[1232px] items-center justify-between px-5 sm:px-8 xl:px-0">
        <button
          onClick={() => scrollToId("top")}
          className="flex items-baseline gap-3.5"
          aria-label="Back to top"
        >
          <span className="serif text-[17px] font-semibold text-ink">
            {site.name}
          </span>
          <span className="mono hidden text-[10px] font-normal uppercase tracking-[0.12em] text-faint md:inline">
            {site.role}
          </span>
        </button>

        <nav className="mono hidden items-center gap-6 text-xs text-graphite lg:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => scrollToId(n.id)}
              className="border-b border-transparent transition-colors duration-150 hover:border-ink hover:text-ink"
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="mono hidden text-[11px] text-faint sm:inline">
            HYD · {clock} IST
          </span>
          <button
            onClick={() =>
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
              )
            }
            className="mono border border-hairline bg-raised px-2 py-1 text-[11px] font-medium text-ink transition-colors duration-150 hover:border-ink"
          >
            {modK} index
          </button>
        </div>
      </div>
    </header>
  );
}
