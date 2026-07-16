"use client";

import { useReveal } from "@/lib/useReveal";

/**
 * THE LEDGER RULE — the signature element, used identically everywhere:
 * number — title — right-aligned mono readout, on a full-width 1px rule
 * that draws in once when scrolled into view (600ms).
 *
 * `tone` picks ink (paper sections) or plate (the umber Plates band).
 */
export default function Ledger({
  num,
  title,
  readout,
  tone = "ink",
  size = "lg",
}: {
  num: string;
  title: string;
  readout?: string;
  tone?: "ink" | "plate";
  size?: "lg" | "md";
}) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  const numCls = tone === "plate" ? "text-plate-acc" : "text-acc";
  const titleCls = tone === "plate" ? "text-plate-text" : "text-ink";
  const readoutCls = tone === "plate" ? "text-plate-faint" : "text-faint";
  const ruleCls = tone === "plate" ? "text-plate-text/35" : "text-ink";

  return (
    <div
      ref={ref}
      data-inview={inView}
      className={`ledger ledger-draw ${ruleCls}`}
    >
      <span className={`mono text-xs font-medium ${numCls}`}>{num}</span>
      <span
        className={`serif font-semibold tracking-[-0.01em] ${titleCls} ${
          size === "lg" ? "text-[26px] leading-none sm:text-3xl" : "text-2xl leading-none"
        }`}
      >
        {title}
      </span>
      {readout && (
        <span
          className={`mono ml-auto text-right text-[10px] tracking-[0.1em] ${readoutCls}`}
        >
          {readout}
        </span>
      )}
    </div>
  );
}
