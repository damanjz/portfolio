"use client";

import { useEffect } from "react";

/**
 * The board route locks body scroll (globals: body{overflow:hidden}). Project
 * pages are scrollable documents, so re-enable scroll while one is mounted and
 * restore the lock on the way out.
 */
export default function ScrollUnlock() {
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";
    document.body.style.height = "auto";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      document.documentElement.style.height = "";
      document.body.style.height = "";
    };
  }, []);
  return null;
}
