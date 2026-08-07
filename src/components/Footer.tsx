"use client";

import { site } from "@/content";
import { useModKey } from "@/lib/useModKey";

/** The colophon line — the thesis proven where nobody looks. */
export default function Footer() {
  const modK = useModKey();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-hairline px-5 sm:px-8 xl:px-0">
      <div className="mono mx-auto flex max-w-[1232px] flex-col gap-2 py-5 text-[10px] tracking-[0.08em] text-faint sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {year} {site.name.toUpperCase()} · {site.location.toUpperCase()}
        </span>
        <span>BUILT LOCAL-FIRST — THIS SITE SHIPS NO ANALYTICS</span>
        <span>INDEX {modK.toUpperCase()}</span>
      </div>
    </footer>
  );
}
