"use client";

import { useEffect, useRef, useState } from "react";

/**
 * DraftingLayer — the drafting instrument under the hero. The paper stays
 * paper; the instrument appears under your hand:
 *
 *   · a light-table dot grid that fades up only around the cursor,
 *     anchored to the content column (not the viewport) so its geometry is
 *     stable at every aspect ratio — site invariant
 *   · a hairline crosshair through the cursor with a mono coordinate
 *     readout, measured from the column origin like a drafting machine
 *   · a drafting-pen trace that fades like ink drying
 *
 * Pointer-fine devices only; reduced motion renders nothing; draws nothing
 * when the cursor is elsewhere. Zero external requests, zero libraries.
 */
const GRID = 16; // dot pitch, px
const REACH = 190; // light-table radius around the cursor
const TRACE_LIFE = 1.4; // seconds of ink memory

export default function DraftingLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const readoutRef = useRef<HTMLSpanElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduce);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const cv = canvasRef.current;
    const readout = readoutRef.current;
    const host = cv?.parentElement; // the hero <section>
    if (!cv || !readout || !host) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const size = () => {
      const r = host.getBoundingClientRect();
      if (r.width < 2) return;
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * DPR);
      cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(host);

    // tokens, read once from the live styles so the layer can never drift
    // off-palette
    const css = getComputedStyle(document.documentElement);
    const ACC = css.getPropertyValue("--acc").trim() || "#2a41c8";
    const FAINT = css.getPropertyValue("--faint").trim() || "#98938a";
    const GRAPHITE = css.getPropertyValue("--graphite").trim() || "#6b675e";

    let mx = -1;
    let my = -1;
    let inside = false;
    let raf = 0;
    const trace: { x: number; y: number; t: number }[] = [];

    // grid + coordinates anchor to the content column, not the viewport
    const anchor = () => {
      const a = host.querySelector<HTMLElement>("[data-draft-anchor]");
      const hr = host.getBoundingClientRect();
      const ar = a?.getBoundingClientRect();
      return ar ? ar.left - hr.left : 0;
    };

    const draw = () => {
      raf = 0;
      const now = performance.now() / 1000;
      ctx.clearRect(0, 0, W, H);

      // cull dried ink
      while (trace.length && now - trace[0].t > TRACE_LIFE) trace.shift();

      if (inside && mx >= 0) {
        const ox = anchor() % GRID;

        // light-table dot grid, only under the hand
        ctx.fillStyle = FAINT;
        const c0 = Math.max(0, Math.floor((mx - REACH - ox) / GRID));
        const c1 = Math.ceil((mx + REACH - ox) / GRID);
        const r0 = Math.max(0, Math.floor((my - REACH) / GRID));
        const r1 = Math.ceil((my + REACH) / GRID);
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const x = ox + c * GRID;
            const y = r * GRID;
            const d = Math.hypot(x - mx, y - my);
            if (d > REACH) continue;
            const f = 1 - d / REACH;
            ctx.globalAlpha = f * f * 0.4;
            ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
          }
        }

        // crosshair — full-bleed hairlines through the pen
        ctx.globalAlpha = 0.13;
        ctx.strokeStyle = GRAPHITE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, Math.round(my) + 0.5);
        ctx.lineTo(W, Math.round(my) + 0.5);
        ctx.moveTo(Math.round(mx) + 0.5, 0);
        ctx.lineTo(Math.round(mx) + 0.5, H);
        ctx.stroke();
        // registration tick at the intersection
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = ACC;
        ctx.beginPath();
        ctx.moveTo(mx - 4, Math.round(my) + 0.5);
        ctx.lineTo(mx + 4, Math.round(my) + 0.5);
        ctx.moveTo(Math.round(mx) + 0.5, my - 4);
        ctx.lineTo(Math.round(mx) + 0.5, my + 4);
        ctx.stroke();
      }

      // the pen trace, fading like ink drying
      if (trace.length > 1) {
        ctx.strokeStyle = ACC;
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 1; i < trace.length; i++) {
          const a = trace[i - 1];
          const b = trace[i];
          const age = now - b.t;
          ctx.globalAlpha = Math.max(0, 1 - age / TRACE_LIFE) * 0.38;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      if (inside || trace.length) raf = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const was = inside;
      inside = x >= 0 && x <= r.width && y >= 0 && y <= r.height;
      if (inside) {
        // ink only flows while the pen moves
        if (mx >= 0 && Math.hypot(x - mx, y - my) > 1.5) {
          trace.push({ x, y, t: performance.now() / 1000 });
          if (trace.length > 240) trace.shift();
        }
        mx = x;
        my = y;
        const off = anchor();
        readout.textContent = `X ${String(Math.max(0, Math.round(x - off))).padStart(4, "0")} · Y ${String(Math.max(0, Math.round(y))).padStart(4, "0")}`;
        readout.style.transform = `translate3d(${Math.round(x + 14)}px, ${Math.round(y + 18)}px, 0)`;
        readout.style.opacity = "1";
      } else if (was) {
        readout.style.opacity = "0";
      }
      kick();
    };
    const leave = () => {
      inside = false;
      readout.style.opacity = "0";
      kick();
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
      document.removeEventListener("mouseleave", leave);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="no-print pointer-events-none absolute inset-0 z-0 h-full w-full"
      />
      <span
        ref={readoutRef}
        aria-hidden="true"
        className="mono no-print pointer-events-none absolute left-0 top-0 z-0 text-[10px] tracking-[0.08em] text-faint opacity-0 transition-opacity duration-150"
      />
    </>
  );
}
