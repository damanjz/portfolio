"use client";

import { site } from "@/content";
import { scrollToId } from "./SmoothScroll";
import { useReveal } from "@/lib/useReveal";
import { useModKey } from "@/lib/useModKey";
import SetLines from "./SetLines";
import DraftingLayer from "./DraftingLayer";

/**
 * 00 — THESIS. Serif display with the page's ONLY italic ("private by
 * design." in drafting blue) beside the vitals ledger — the spec motif's
 * first appearance.
 *
 * Craft pass (2026-08-06): the headline is COMPOSED — each rendered line
 * rises into place (SetLines), then the supporting matter prints in sequence:
 * kicker → headline lines → intro → actions → vitals. Behind it all sits the
 * DraftingLayer: crosshair, column-anchored dot grid, and a fading pen trace
 * that only exist under the cursor.
 */
export default function Hero() {
  const { ref, inView } = useReveal<HTMLDivElement>({ threshold: 0.1 });
  const modK = useModKey();

  return (
    <section id="top" className="relative px-5 pt-[60px] sm:px-8 xl:px-0">
      <DraftingLayer />
      <div
        ref={ref}
        data-inview={inView}
        data-draft-anchor
        className="relative z-10 mx-auto grid max-w-[1232px] gap-10 py-20 sm:py-[88px] lg:grid-cols-[1fr_320px] lg:gap-16"
      >
        <div>
          <div
            className="fade mono text-[11px] font-medium tracking-[0.12em] text-acc"
          >
            00 — THESIS
          </div>
          <h1 className="serif mt-5 max-w-[760px] text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[62px] lg:leading-[1.05]">
            <SetLines
              segments={[
                { text: `${site.thesisLead} ` },
                { text: site.thesisEm, em: true },
              ]}
              baseDelay={120}
              delayStep={110}
            />
          </h1>
          <p
            className="fade serif mt-6 max-w-[560px] text-[17px] leading-[1.6] text-graphite sm:text-lg"
            style={{ transitionDelay: "480ms" }}
          >
            {site.intro}
          </p>
          <div
            className="fade mt-9 flex flex-wrap items-center gap-6"
            style={{ transitionDelay: "620ms" }}
          >
            <button
              onClick={() => scrollToId("work")}
              className="mono rounded-[2px] bg-ink px-6 py-[13px] text-xs font-medium tracking-[0.08em] text-paper transition-colors duration-150 hover:bg-acc"
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

        {/* vitals ledger — the spec motif, introduced here; rows print in */}
        <div className="fade self-end" style={{ transitionDelay: "700ms" }}>
          <div className="mono border-t border-ink text-[11px] tracking-[0.06em]">
            {[
              { k: "LOCATION", v: site.location.toUpperCase(), acc: false },
              { k: "FOCUS", v: "SECURITY · LOCAL-FIRST", acc: false },
              { k: "STATUS", v: site.status.toUpperCase(), acc: true },
              { k: "INDEX", v: modK.toUpperCase(), acc: false },
            ].map((row, i) => (
              <div
                key={row.k}
                className="flex justify-between border-b border-hairline py-2.5"
              >
                <span className="text-faint">{row.k}</span>
                <span
                  className={`printout ${row.acc ? "text-acc" : "text-ink"}`}
                  style={{ ["--set" as string]: `${760 + i * 90}ms` }}
                >
                  {row.v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
