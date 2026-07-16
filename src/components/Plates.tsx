"use client";

import Link from "next/link";
import { projects, platesIntro } from "@/content";
import Ledger from "./Ledger";
import { useReveal } from "@/lib/useReveal";

/**
 * 02 — PLATES. The site's single inversion: the art archive on deep
 * warm-umber stock. Rows follow the Work ledger's exact spacing grammar
 * (same paddings, same column rhythm) — just no figures. Archived,
 * not headlined.
 */
export default function Plates() {
  const { ref, inView } = useReveal<HTMLDivElement>({ threshold: 0.1 });
  const art = projects.filter((p) => p.discipline === "craft");

  return (
    <section id="plates" className="bg-plate">
      <div
        ref={ref}
        data-inview={inView}
        className="mx-auto max-w-[1232px] px-5 py-16 sm:px-8 sm:py-[72px] xl:px-0"
      >
        <Ledger
          num="02"
          title="Plates"
          readout="MA ANIMATION · ARCHIVED"
          tone="plate"
        />
        <p className="serif fade mt-5 max-w-[520px] text-[15px] leading-[1.6] text-plate-faint">
          {platesIntro}
        </p>

        <div className="fade mt-4">
          {art.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="group grid grid-cols-[44px_1fr_100px] items-center gap-4 border-b border-plate-text/20 py-6 sm:grid-cols-[52px_1fr_240px_110px] sm:gap-6 lg:py-[30px]"
            >
              <span className="mono text-xs text-plate-faint transition-colors duration-150 group-hover:text-plate-acc">
                {p.num}
              </span>
              <div>
                <div className="serif text-xl font-semibold leading-[1.15] tracking-[-0.01em] text-plate-text sm:text-[25px]">
                  <span className="border-b border-transparent transition-colors duration-150 group-hover:border-plate-text">
                    {p.name}
                  </span>
                </div>
                <div className="serif mt-1 text-sm leading-[1.5] text-plate-faint">
                  {p.tagline}
                </div>
              </div>
              <span className="mono hidden text-[10.5px] leading-[1.7] tracking-[0.05em] text-plate-faint sm:block">
                {p.stack.slice(0, 3).join(" · ").toUpperCase()}
              </span>
              <span className="mono justify-self-end text-[10px] font-medium tracking-[0.1em] text-plate-acc">
                VIEW ↗
              </span>
            </Link>
          ))}
        </div>

        <a
          href="https://www.artstation.com/damanpsd"
          target="_blank"
          rel="noopener noreferrer"
          className="mono fade mt-7 inline-block border-b border-transparent text-[11px] tracking-[0.06em] text-plate-acc transition-colors duration-150 hover:border-plate-acc"
        >
          FULL ARCHIVE — ARTSTATION.COM/DAMANPSD ↗
        </a>
      </div>
    </section>
  );
}
