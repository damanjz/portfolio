"use client";

import Link from "next/link";
import { useModKey } from "@/lib/useModKey";

/**
 * Case-study folio — same height and grammar as the home folio line;
 * one or the other, never both. ← index | title | number · category · status.
 */
export default function DetailBar({
  title,
  meta,
}: {
  title: string;
  meta: string;
}) {
  const modK = useModKey();
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-raised">
      <div className="mx-auto flex h-[52px] max-w-[1232px] items-center justify-between px-5 sm:px-8 xl:px-0">
        <div className="flex items-baseline gap-5">
          <Link href="/" className="mono link-acc text-xs">
            ← index
          </Link>
          <span className="serif text-[15px] font-semibold text-ink">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="mono hidden text-[10px] tracking-[0.1em] text-faint sm:inline">
            {meta}
          </span>
          <button
            onClick={() =>
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
              )
            }
            className="mono border border-hairline bg-paper px-2 py-1 text-[11px] font-medium text-ink transition-colors duration-150 hover:border-ink"
          >
            {modK}
          </button>
        </div>
      </div>
    </header>
  );
}
