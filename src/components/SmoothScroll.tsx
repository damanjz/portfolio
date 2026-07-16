"use client";

/**
 * The Monograph scrolls like a document — native scrolling, smooth anchor
 * jumps via CSS `scroll-behavior` (globals.css). No Lenis, no momentum
 * hijack. This module keeps only the shared jump helper.
 */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 76;
  window.scrollTo({ top: y, behavior: "smooth" });
}
