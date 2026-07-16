/**
 * Stage — the app's page context as a wrapper component.
 * In the real app, globals.css styles <body> (dark canvas, bone text, body
 * font). Preview cards and rendered designs mount components in a bare
 * container, so this provider recreates that context around them.
 */
import * as React from "react";

export default function Stage({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="bg-void text-bone"
      style={{
        fontFamily: "var(--font-body), system-ui, sans-serif",
        minHeight: "100vh",
        position: "relative",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {children}
    </div>
  );
}
