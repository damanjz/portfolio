"use client";

import { stackGroups } from "@/content";
import Ledger from "./Ledger";
import { useReveal } from "@/lib/useReveal";

/** 04 — STACK. Four mono ledger columns. */
export default function Stack() {
  const { ref, inView } = useReveal<HTMLDivElement>();

  return (
    <section id="stack" className="px-5 sm:px-8 xl:px-0">
      <div
        ref={ref}
        data-inview={inView}
        className="mx-auto max-w-[1232px] py-[88px]"
      >
        <Ledger num="04" title="Stack" readout="CURRENT" />
        <div className="fade mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stackGroups.map((g) => (
            <div key={g.label}>
              <div className="mono mb-2 border-b border-hairline pb-2 text-[11px] font-medium tracking-[0.1em] text-ink">
                {g.label}
              </div>
              <div className="mono text-xs leading-8 text-graphite">
                {g.items.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
