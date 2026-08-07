"use client";

import { site } from "@/content";
import Ledger from "./Ledger";
import { useReveal } from "@/lib/useReveal";

/** 05 — CONTACT. One serif question, one ink button, two annotated links. */
export default function Contact() {
  const { ref, inView } = useReveal<HTMLDivElement>();

  return (
    <section id="contact" className="px-5 sm:px-8 xl:px-0">
      <div
        ref={ref}
        data-inview={inView}
        className="mx-auto max-w-[1232px] pb-24"
      >
        <Ledger
          num="05"
          title="Contact"
          readout={site.replies.toUpperCase()}
        />
        <h2 className="serif fade mt-9 max-w-[720px] text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[44px]">
          Have a machine that deserves better software?
        </h2>
        <div className="fade mt-8 flex flex-wrap items-center gap-7">
          <a
            href={`mailto:${site.email}`}
            className="mono rounded-[2px] bg-ink px-6 py-[13px] text-xs font-medium tracking-[0.08em] text-paper transition-opacity duration-150 hover:opacity-85"
          >
            EMAIL ME →
          </a>
          <a
            href="https://github.com/damanjz"
            target="_blank"
            rel="noopener noreferrer"
            className="mono link-acc text-xs"
          >
            GITHUB ↗ @damanjz
          </a>
          <a
            href="https://www.artstation.com/damanpsd"
            target="_blank"
            rel="noopener noreferrer"
            className="mono link-acc text-xs"
          >
            ARTSTATION ↗ damanpsd
          </a>
        </div>
      </div>
    </section>
  );
}
