"use client";

import { site } from "@/content";
import { scrollToId } from "./SmoothScroll";
import { useReveal } from "@/lib/useReveal";
import { useModKey } from "@/lib/useModKey";

/**
 * 00 — THESIS. Serif display with the page's ONLY italic ("no rent." in
 * drafting blue) beside the vitals ledger — the spec motif's first appearance.
 */
export default function Hero() {
  const { ref, inView } = useReveal<HTMLDivElement>({ threshold: 0.1 });
  const modK = useModKey();

  return (
    <section id="top" className="px-5 pt-[60px] sm:px-8 xl:px-0">
      <div
        ref={ref}
        data-inview={inView}
        className="mx-auto grid max-w-[1232px] gap-10 py-20 sm:py-[88px] lg:grid-cols-[1fr_320px] lg:gap-16"
      >
        <div className="fade">
          <div className="mono text-[11px] font-medium tracking-[0.12em] text-acc">
            00 — THESIS
          </div>
          <h1 className="serif mt-5 max-w-[760px] text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[62px] lg:leading-[1.05]">
            {site.thesisLead}{" "}
            <em className="text-acc">{site.thesisEm}</em>
          </h1>
          <p className="serif mt-6 max-w-[560px] text-[17px] leading-[1.6] text-graphite sm:text-lg">
            {site.intro}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <button
              onClick={() => scrollToId("work")}
              className="mono rounded-[2px] bg-ink px-6 py-[13px] text-xs font-medium tracking-[0.08em] text-paper transition-opacity duration-150 hover:opacity-85"
            >
              VIEW THE WORK ↓
            </button>
            <a
              href="https://github.com/damanjz"
              target="_blank"
              rel="noopener noreferrer"
              className="mono link-acc pb-0.5 text-xs"
            >
              github.com/damanjz ↗
            </a>
          </div>
        </div>

        {/* vitals ledger — the spec motif, introduced here */}
        <div className="fade self-end">
          <div className="mono border-t border-ink text-[11px] tracking-[0.06em]">
            {[
              { k: "LOCATION", v: site.location.toUpperCase(), acc: false },
              { k: "FOCUS", v: "SECURITY · LOCAL-FIRST", acc: false },
              { k: "STATUS", v: site.status.toUpperCase(), acc: true },
              { k: "INDEX", v: modK.toUpperCase(), acc: false },
            ].map((row) => (
              <div
                key={row.k}
                className="flex justify-between border-b border-hairline py-2.5"
              >
                <span className="text-faint">{row.k}</span>
                <span className={row.acc ? "text-acc" : "text-ink"}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
