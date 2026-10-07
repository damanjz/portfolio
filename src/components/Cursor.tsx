"use client";

import { useEffect, useRef } from "react";

/**
 * Orange dot that trails the pointer and grows into a labelled disc over
 * anything with data-cursor="Label" (work cards, tiles, crafts). Pointer devices only.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = ref.current!;
    let x = -100, y = -100, tx = -100, ty = -100, raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add("on");
      const t = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      if (t) {
        if (label.current) label.current.textContent = t.dataset.cursor ?? "";
        el.classList.add("big");
      } else el.classList.remove("big");
    };
    const out = () => el.classList.remove("on");
    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x}px,${y}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", out);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", out);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
