"use client";

import { principles } from "@/content";
import Ledger from "./Ledger";
import { useReveal } from "@/lib/useReveal";

/** 03 — PRINCIPLES. Four rules, R.1–R.4, each on its own hairline rule. */
export default function Principles() {
  const { ref, inView } = useReveal<HTMLDivElement>();

  return (
    <section id="principles" className="px-5 sm:px-8 xl:px-0">
      <div
        ref={ref}
        data-inview={inView}
        className="mx-auto max-w-[1232px] pt-[88px]"
      >
        <Ledger num="03" title="Principles" readout="FOUR RULES" />
        <div className="fade mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <div key={p.tag} className="border-t border-hairline pt-3.5">
              <div className="mono text-[11px] font-medium tracking-[0.1em] text-acc">
                {p.tag}
              </div>
              <p className="serif mt-2.5 text-sm leading-[1.65] text-graphite">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
