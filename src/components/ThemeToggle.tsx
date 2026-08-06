"use client";

import { useEffect, useState } from "react";

/**
 * Terminal (light) ⇄ Nocturne (dark). The toggle sets [data-theme] on <html>
 * and persists to localStorage; the no-flash default (system preference) is
 * applied by an inline script in <head> before hydration (see layout.tsx).
 */
type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme") as Theme | null;
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(attr ?? system);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode — the in-memory choice still applies */
    }
    setTheme(next);
  }

  const label = theme === "dark" ? "Nocturne" : "Terminal";
  return (
    <button
      type="button"
      className="hud-btn"
      onClick={toggle}
      aria-label={`Switch theme (currently ${label})`}
      title="Switch light / dark"
      suppressHydrationWarning
    >
      {theme === "dark" ? "◐ NOCTURNE" : "◑ TERMINAL"}
    </button>
  );
}
