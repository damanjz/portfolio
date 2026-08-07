"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor for the board — a precise dot with a trailing ring that expands
 * over interactive targets (nodes, buttons, links) and tightens while dragging.
 * Fine-pointer only; touch keeps native behaviour (the CSS hides these + the
 * `pointer: fine` guard keeps `cursor: none` off touch devices).
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // skip entirely on coarse/touch pointers
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // ring lags the dot slightly for a precise-but-alive feel
    let dx = 0, dy = 0, rx = 0, ry = 0;
    let raf = 0;

    const move = (e: PointerEvent) => {
      dx = e.clientX; dy = e.clientY;
      dot.style.transform = `translate(${dx}px, ${dy}px)`;
      // interactive target? expand the ring
      const t = e.target as HTMLElement | null;
      const interactive = !!t?.closest(
        "a, button, [role='menuitem'], .node, .hud-btn, input, textarea, select",
      );
      document.body.classList.toggle("cursor-active", interactive);
    };
    const down = () => document.body.classList.add("cursor-grab");
    const up = () => document.body.classList.remove("cursor-grab");
    const leave = () => { dot.style.opacity = "0"; ring.style.opacity = "0"; };
    const enter = () => { dot.style.opacity = "1"; ring.style.opacity = "1"; };

    // The ring eases toward the pointer — but the rAF loop only runs WHILE it's
    // still catching up (or the pointer is moving). Once it settles, we stop the
    // loop entirely instead of burning a frame every 1/120s forever. `move`
    // restarts it. This is the difference between idle CPU/GPU at 0% vs. pinned.
    let running = false;
    const loop = () => {
      rx += (dx - rx) * 0.2;
      ry += (dy - ry) * 0.2;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      if (Math.abs(dx - rx) > 0.5 || Math.abs(dy - ry) > 0.5) {
        raf = requestAnimationFrame(loop);
      } else {
        ring.style.transform = `translate(${dx}px, ${dy}px)`; // snap to final
        running = false;
      }
    };
    const kick = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };

    const moveWithKick = (e: PointerEvent) => { move(e); kick(); };
    window.addEventListener("pointermove", moveWithKick, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", moveWithKick);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      document.body.classList.remove("cursor-active", "cursor-grab");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
