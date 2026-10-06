"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";

/**
 * Page transition: an orange panel wipes up carrying the destination's name,
 * the route changes underneath, then the panel wipes away. TLink is a
 * drop-in for next/link that triggers it; plain links and modified clicks
 * (new tab etc.) behave normally.
 */

type Go = { href: string; label: string };
const EVT = "pt:go";

export function TLink({
  label,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { label: string }) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent<Go>(EVT, { detail: { href: String(props.href), label } }));
  };
  return <Link {...props} onClick={handle} />;
}

export function TransitionLayer() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"" | "cover" | "leave">("");
  const [label, setLabel] = useState("");
  // covering: panel up, route change in flight (further clicks wait);
  // leaving: panel wiping away (a new click may start the next cover at once)
  const phase = useRef<"idle" | "covering" | "leaving">("idle");
  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    const go = (e: Event) => {
      const { href, label } = (e as CustomEvent<Go>).detail;
      if (phase.current === "covering") return;
      const norm = (p: string) => p.replace(/\/+$/, "") || "/";
      if (norm(href) === norm(window.location.pathname.slice((process.env.NEXT_PUBLIC_BASE_PATH ?? "").length))) return;
      clearTimers();
      phase.current = "covering";
      setLabel(label);
      setState("cover");
      window.__lenis?.stop();
      router.prefetch(href);
      timers.current.push(
        window.setTimeout(() => router.push(href, { scroll: false }), 460),
        // safety net: never leave the panel stuck if the route never changes
        window.setTimeout(() => {
          if (phase.current !== "covering") return;
          phase.current = "idle";
          setState("");
          window.__lenis?.start();
        }, 6000),
      );
    };
    window.addEventListener(EVT, go);
    return () => window.removeEventListener(EVT, go);
  }, [router]);

  // the new route has rendered: wipe the panel away
  useEffect(() => {
    if (phase.current !== "covering") return;
    timers.current.push(
      window.setTimeout(() => {
        phase.current = "leaving";
        setState("leave");
        window.__lenis?.start();
      }, 60),
      window.setTimeout(() => {
        phase.current = "idle";
        setState("");
      }, 760),
    );
  }, [pathname]);

  useEffect(() => clearTimers, []);

  return (
    <div className={`pt ${state}`} aria-hidden="true">
      <div className="cap" style={{ fontSize: `min(clamp(56px, 13vw, 220px), calc(92vw / ${Math.max(label.length * 0.76, 3)}))` }}>
        <span>{label}</span>
      </div>
    </div>
  );
}
