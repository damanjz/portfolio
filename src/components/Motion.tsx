"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * The site's one motion layer, mounted once in the root layout. No animation
 * library: Lenis for momentum scroll, IntersectionObserver for reveals, and one
 * shared requestAnimationFrame loop that only touches elements on screen.
 * - .split / [data-fade]: add `.in` when scrolled into view (CSS does the motion)
 * - [data-count]: count up to its own text, keeping its format (02, 88%, 0.658)
 * - [data-colorize]: image drifts and comes to colour as it crosses the screen
 * - [data-parallax]: image drifts inside its frame
 * - [data-ribbon]: marquee that speeds up and reverses with scroll velocity
 * - [data-magnetic]: button leans toward the pointer
 * Nothing pins or hijacks scroll. Reduced motion skips all of it.
 */

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

let lenis: Lenis | null = null;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function Motion() {
  const pathname = usePathname();

  // global: smooth scroll
  useEffect(() => {
    if (reduced()) return;
    lenis = new Lenis({ lerp: 0.085, autoRaf: true });
    window.__lenis = lenis;
    return () => {
      lenis?.destroy();
      lenis = null;
      window.__lenis = undefined;
    };
  }, []);

  // per route
  useEffect(() => {
    // new page starts at the top. force: the page transition pauses Lenis
    // while the panel covers the screen, and a paused Lenis ignores scrollTo.
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true, force: true });

    const rm = reduced();
    const off: (() => void)[] = [];
    let raf = 0;

    const start = window.setTimeout(() => {
      // reveals and count-ups share one observer
      const counts = new Map<Element, () => void>();
      document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const final = el.dataset.count ?? el.textContent ?? "";
        const m = final.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
        if (!m || rm) return;
        const [, pre, num, post] = m;
        const dec = num.includes(".") ? num.split(".")[1].length : 0;
        const width = dec ? 0 : num.length;
        const target = parseFloat(num);
        const fmt = (v: number) => pre + (dec ? v.toFixed(dec) : String(Math.round(v)).padStart(width, "0")) + post;
        el.textContent = fmt(0);
        counts.set(el, () => {
          const t0 = performance.now();
          const step = (now: number) => {
            const t = clamp01((now - t0) / 1600);
            el.textContent = t < 1 ? fmt(target * easeOut(t)) : final;
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      });

      const reveal = document.querySelectorAll<HTMLElement>(".split, [data-fade]");
      if (rm) {
        reveal.forEach((el) => el.classList.add("in"));
      } else {
        const io = new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (!e.isIntersecting) return;
              e.target.classList.add("in");
              counts.get(e.target)?.();
              io.unobserve(e.target);
            }),
          { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
        );
        reveal.forEach((el) => io.observe(el));
        counts.forEach((_, el) => io.observe(el));
        off.push(() => io.disconnect());
      }
      if (rm) return;

      // scroll-linked work: only for elements currently on screen
      type Item = { box: HTMLElement; img: HTMLElement; kind: "colorize" | "parallax" };
      const items: Item[] = [];
      document.querySelectorAll<HTMLElement>("[data-colorize], [data-parallax]").forEach((box) => {
        const img = box.querySelector("img");
        if (img) items.push({ box, img, kind: box.hasAttribute("data-colorize") ? "colorize" : "parallax" });
      });
      const ribbons = [...document.querySelectorAll<HTMLElement>("[data-ribbon]")].map((el) => ({ el, x: 0, half: el.scrollWidth / 2 }));
      const live = new Set<Element>();
      const vis = new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? live.add(e.target) : live.delete(e.target))));
      items.forEach((i) => vis.observe(i.box));
      ribbons.forEach((r) => vis.observe(r.el));
      off.push(() => vis.disconnect());

      const paint = (i: Item) => {
        const vh = window.innerHeight;
        const r = i.box.getBoundingClientRect();
        const through = clamp01((vh - r.top) / (vh + r.height)); // 0 entering, 1 leaving
        if (i.kind === "parallax") {
          i.img.style.transform = `translate3d(0,${(through - 0.5) * 10}%,0)`;
          return;
        }
        i.img.style.transform = `translate3d(0,${(through - 1) * 9}%,0)`;
        const colour = clamp01((vh * 0.8 - r.top) / (vh * 0.65));
        i.img.style.filter = `grayscale(${1 - colour}) contrast(${1.05 - colour * 0.05})`;
        const open = clamp01((vh - r.top) / (vh * 0.7));
        const y = 6 * (1 - open), x = 4 * (1 - open);
        i.box.style.clipPath = `inset(${y}% ${x}% ${y}% ${x}% round 8px)`;
      };
      items.forEach(paint); // correct first frame before any scroll

      let dir = 1, boost = 0, last = performance.now();
      const onScroll = () => {
        const v = lenis?.velocity ?? 0;
        if (Math.abs(v) > 0.1) dir = v > 0 ? 1 : -1;
        boost = Math.min(Math.abs(v) * 0.9, 14);
      };
      lenis?.on("scroll", onScroll);
      off.push(() => lenis?.off("scroll", onScroll));

      const loop = (now: number) => {
        const dt = Math.min(now - last, 64);
        last = now;
        for (const i of items) if (live.has(i.box)) paint(i);
        const step = (0.045 + boost * 0.02) * dt * dir;
        boost *= 0.92;
        for (const r of ribbons) {
          if (!live.has(r.el) || !r.half) continue;
          r.x -= step;
          if (r.x <= -r.half) r.x += r.half;
          if (r.x > 0) r.x -= r.half;
          r.el.style.transform = `translate3d(${r.x}px,0,0)`;
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      const measure = () => ribbons.forEach((r) => (r.half = r.el.scrollWidth / 2));
      window.addEventListener("resize", measure);
      off.push(() => window.removeEventListener("resize", measure));

      // magnetic buttons (pointer devices only); CSS transition does the easing
      if (window.matchMedia("(hover: hover)").matches) {
        document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            el.style.transition = "transform .45s cubic-bezier(.16,1,.3,1), background .35s, color .35s, border-color .35s";
            el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.32}px,${(e.clientY - r.top - r.height / 2) * 0.32}px)`;
          };
          const leave = () => {
            el.style.transition = "transform .9s cubic-bezier(.2,1.8,.4,1), background .35s, color .35s, border-color .35s";
            el.style.transform = "";
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          off.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          });
        });
      }
    }, 30);

    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(raf);
      off.forEach((f) => f());
    };
  }, [pathname]);

  return null;
}
