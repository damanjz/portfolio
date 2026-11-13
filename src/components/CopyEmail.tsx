"use client";

import { useRef, useState } from "react";

/** One click copies the email address; the button says so for two seconds. */
export default function CopyEmail({ email, className = "btn" }: { email: string; className?: string }) {
  const [done, setDone] = useState<"" | "ok" | "fail">("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setDone("ok");
    } catch {
      setDone("fail");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(""), 2000);
  };
  return (
    <button type="button" className={className} onClick={copy} aria-live="polite">
      {done === "ok" ? "Copied" : done === "fail" ? "Copy failed, select it" : "Copy email"}
    </button>
  );
}
