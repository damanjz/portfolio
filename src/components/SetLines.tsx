"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * SetLines — splits its text into RENDERED lines at runtime and wraps each in
 * a .setline clip so the type rises into place line by line (the compositor
 * reveal). Line breaks are measured, not guessed: words are laid out, grouped
 * by offsetTop, then re-wrapped — and re-measured on resize, so the reveal is
 * identical at every viewport (site invariant).
 *
 * Reveal is driven by an ancestor's [data-inview] (useReveal), same as .fade.
 * Until the first measurement the text renders transparent in its final
 * layout, so nothing flashes and nothing shifts.
 */
type Segment = { text: string; em?: boolean };

export default function SetLines({
  segments,
  delayStep = 90,
  baseDelay = 0,
}: {
  segments: Segment[];
  /** ms between successive lines */
  delayStep?: number;
  /** ms before the first line */
  baseDelay?: number;
}) {
  // Tokenize once: words and spaces, each remembering its em styling.
  const tokens = useMemo(() => {
    const out: { t: string; em: boolean; sp: boolean }[] = [];
    for (const seg of segments) {
      for (const part of seg.text.split(/(\s+)/)) {
        if (!part.length) continue;
        out.push({ t: part, em: !!seg.em, sp: /^\s+$/.test(part) });
      }
    }
    return out;
  }, [segments]);

  const hostRef = useRef<HTMLSpanElement | null>(null);
  const [lines, setLines] = useState<number[][] | null>(null); // token indices per line
  const [tick, setTick] = useState(0); // measurement retry counter

  // If the text itself changes, the old grouping is meaningless — reset and
  // re-measure. (Render-phase adjustment, per React's derived-state pattern.)
  const prevTokens = useRef(tokens);
  if (prevTokens.current !== tokens) {
    prevTokens.current = tokens;
    if (lines !== null) setLines(null);
  }

  // Measure: group word tokens into rendered lines by offsetTop.
  // NOTE: the host must be display:block — inline boxes report clientWidth 0
  // and ResizeObserver won't observe them.
  useLayoutEffect(() => {
    if (lines !== null) return;
    const host = hostRef.current;
    if (!host) return;
    if (!host.clientWidth) {
      // not laid out yet — retry next frame rather than staying invisible
      const r = requestAnimationFrame(() => setTick((t) => t + 1));
      return () => cancelAnimationFrame(r);
    }
    const spans = Array.from(
      host.querySelectorAll<HTMLElement>("[data-tok]"),
    );
    const grouped: number[][] = [];
    let top: number | null = null;
    let cur: number[] = [];
    spans.forEach((s) => {
      const i = Number(s.dataset.tok);
      const tok = tokens[i];
      // a space opening a line is replaced by the break itself
      if (tok.sp && (top === null || Math.abs(s.offsetTop - top) > 2)) return;
      if (top === null || Math.abs(s.offsetTop - top) > 2) {
        cur = [];
        grouped.push(cur);
        top = s.offsetTop;
      }
      cur.push(i);
    });
    setLines(grouped);
  }, [lines, tokens, tick]);

  // Re-split when the host's width changes (debounced), so line breaks stay true.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === "undefined") return;
    let w = host.clientWidth;
    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      const nw = host.clientWidth;
      if (nw === w) return;
      w = nw;
      clearTimeout(t);
      t = setTimeout(() => setLines(null), 150);
    });
    ro.observe(host);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, []);

  const renderTok = (i: number) => {
    const tok = tokens[i];
    return tok.em ? (
      <em key={i} className="text-acc">
        {tok.t}
      </em>
    ) : (
      <span key={i}>{tok.t}</span>
    );
  };

  if (lines === null) {
    // measurement pass — final layout, transparent, real text (SEO/SSR safe)
    return (
      <span ref={hostRef} className="block opacity-0">
        {tokens.map((tok, i) =>
          tok.em ? (
            <em key={i} data-tok={i} className="text-acc whitespace-pre-wrap">
              {tok.t}
            </em>
          ) : (
            <span key={i} data-tok={i} className="whitespace-pre-wrap">
              {tok.t}
            </span>
          ),
        )}
      </span>
    );
  }

  return (
    <span ref={hostRef} className="block">
      {lines.map((ln, li) => (
        <span key={li} className="setline">
          <span
            style={{ ["--set" as string]: `${baseDelay + li * delayStep}ms` }}
          >
            {ln.map(renderTok)}
          </span>
        </span>
      ))}
    </span>
  );
}
