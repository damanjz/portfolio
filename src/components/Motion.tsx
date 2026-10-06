"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The site's one motion layer, mounted once in the root layout.
 * - Lenis momentum scroll, driven by GSAP's ticker so ScrollTrigger stays in sync.
 * - Per route: reveals (.split, [data-fade], .hero .frame), scroll-scrubbed
 *   colour reveals ([data-colorize]), card parallax ([data-parallax]),
 *   count-ups ([data-count]), velocity-reactive ribbons ([data-ribbon]) and
 *   magnetic buttons ([data-magnetic]).
 * Nothing pins or hijacks scroll. Reduced motion skips all of it.
 */

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

let lenis: Lenis | null = null;

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Motion() {
  const pathname = usePathname();

  // global: smooth scroll
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (reduced()) return;
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
      window.__lenis = undefined;
    };
  }, []);

  // per route
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);

    const rm = reduced();
    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {});

    const start = window.setTimeout(() => {
      // reveals
      const targets = document.querySelectorAll<HTMLElement>(
        ".split:not(.door .split), [data-fade]",
      );
      if (rm) {
        targets.forEach((el) => el.classList.add("in"));
      } else {
        const io = new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add("in");
                io.unobserve(e.target);
              }
            }),
          { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
        );
        targets.forEach((el) => io.observe(el));
        cleanups.push(() => io.disconnect());
      }

      // count-ups: keep the target's own format (leading zeros, %, decimals)
      document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const final = el.dataset.count ?? el.textContent ?? "";
        const m = final.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
        if (!m || rm) {
          el.textContent = final;
          return;
        }
        const [, pre, num, post] = m;
        const decimals = num.includes(".") ? num.split(".")[1].length : 0;
        const width = decimals ? 0 : num.length;
        const target = parseFloat(num);
        const fmt = (v: number) => {
          const s = decimals ? v.toFixed(decimals) : String(Math.round(v)).padStart(width, "0");
          return `${pre}${s}${post}`;
        };
        el.textContent = fmt(0);
        const state = { v: 0 };
        ctx.add(() =>
          gsap.to(state, {
            v: target,
            duration: 1.6,
            ease: "power3.out",
            onUpdate: () => (el.textContent = fmt(state.v)),
            onComplete: () => (el.textContent = final),
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }),
        );
      });

      if (rm) return;

      ctx.add(() => {
        // big image: parallax across the viewport, colour arrives as it centres
        gsap.utils.toArray<HTMLElement>("[data-colorize]").forEach((box) => {
          const img = box.querySelector("img");
          if (!img) return;
          gsap.fromTo(
            img,
            { yPercent: -9 },
            { yPercent: 0, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true } },
          );
          gsap.fromTo(
            img,
            { filter: "grayscale(1) contrast(1.05)" },
            { filter: "grayscale(0) contrast(1)", ease: "none", scrollTrigger: { trigger: box, start: "top 80%", end: "top 15%", scrub: true } },
          );
          gsap.fromTo(
            box,
            { clipPath: "inset(6% 4% 6% 4% round 8px)" },
            { clipPath: "inset(0% 0% 0% 0% round 8px)", ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "top 30%", scrub: true } },
          );
        });

        // card images drift inside their frames
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((box) => {
          const img = box.querySelector("img");
          if (!img) return;
          gsap.fromTo(
            img,
            { yPercent: -5 },
            { yPercent: 5, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      });

      // ribbons: constant drift, sped up and reversed by scroll velocity
      const tracks = document.querySelectorAll<HTMLElement>("[data-ribbon]");
      if (tracks.length) {
        const state = [...tracks].map(() => ({ x: 0, half: 0 }));
        const measure = () => tracks.forEach((t, i) => (state[i].half = t.scrollWidth / 2));
        measure();
        let dir = 1;
        let boost = 0;
        const onScroll = () => {
          const v = lenis?.velocity ?? 0;
          if (Math.abs(v) > 0.1) dir = v > 0 ? 1 : -1;
          boost = Math.min(Math.abs(v) * 0.9, 14);
        };
        lenis?.on("scroll", onScroll);
        const loop = (_t: number, dt: number) => {
          const step = (0.045 + boost * 0.02) * dt * dir;
          boost *= 0.92;
          tracks.forEach((t, i) => {
            const s = state[i];
            if (!s.half) return;
            s.x -= step;
            if (s.x <= -s.half) s.x += s.half;
            if (s.x > 0) s.x -= s.half;
            t.style.transform = `translate3d(${s.x}px,0,0)`;
          });
        };
        gsap.ticker.add(loop);
        window.addEventListener("resize", measure);
        cleanups.push(() => {
          gsap.ticker.remove(loop);
          lenis?.off("scroll", onScroll);
          window.removeEventListener("resize", measure);
        });
      }

      // magnetic buttons (pointer devices only)
      if (window.matchMedia("(hover: hover)").matches) {
        document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - (r.left + r.width / 2)) * 0.32;
            const y = (e.clientY - (r.top + r.height / 2)) * 0.32;
            gsap.to(el, { x, y, duration: 0.5, ease: "power3.out" });
          };
          const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          });
        });
      }

      ScrollTrigger.refresh();
    }, 30);

    return () => {
      window.clearTimeout(start);
      cleanups.forEach((f) => f());
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
