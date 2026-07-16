"use client";

import { useEffect, useState } from "react";

/**
 * OS-dependent shortcut label: "⌘K" on Apple platforms, "Ctrl+K" elsewhere.
 * Defaults to Ctrl+K (the common case) and corrects after mount, so SSR
 * markup stays deterministic.
 */
export function useModKey(): string {
  const [label, setLabel] = useState("Ctrl+K");
  useEffect(() => {
    const p = `${navigator.platform ?? ""} ${navigator.userAgent ?? ""}`;
    if (/mac|iphone|ipad|ipod/i.test(p)) setLabel("⌘K");
  }, []);
  return label;
}
