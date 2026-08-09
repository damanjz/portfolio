import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollUnlock from "@/components/ScrollUnlock";

/**
 * 404 — a node that isn't on the board. On static export this renders as
 * out/404.html, which GitHub Pages serves for any unknown path under the site.
 * Renders inside RootLayout, so it inherits the fonts, the no-flash theme
 * script, and StructuredData; ScrollUnlock releases the board's body-scroll
 * lock so this short page sits centered instead of clipped. Terminal ⇄ Nocturne
 * via the same tokens as the rest of the site. next/link applies the basePath.
 */
export const metadata: Metadata = {
  title: `404 — off the board · ${site.name}`,
  description: "That node isn't on the board.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100%",
        background: "var(--ground)",
        color: "var(--ink)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ScrollUnlock />

      <header className="proj-bar">
        <Link href="/" className="proj-back">
          ← THE BOARD
        </Link>
        <span className="proj-bar-meta mono">ERR · 404 · NODE NOT FOUND</span>
        <ThemeToggle />
      </header>

      <main
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: "clamp(48px, 12vh, 140px) clamp(20px, 6vw, 48px)",
        }}
      >
        <div style={{ maxWidth: "60ch", width: "100%" }}>
          <div className="kicker" style={{ color: "var(--acc)", marginBottom: 18 }}>
            HTTP 404 · BROKEN WIRE
          </div>

          <h1
            className="serif"
            style={{
              fontSize: "clamp(38px, 7vw, 76px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
              margin: 0,
            }}
          >
            This node isn&rsquo;t on the board.
          </h1>

          <p
            className="serif"
            style={{
              fontSize: "clamp(16px, 1.6vw, 20px)",
              lineHeight: 1.6,
              color: "var(--dim)",
              maxWidth: "46ch",
              marginTop: 20,
            }}
          >
            The page you followed leads to a node that was never drawn — moved,
            renamed, or never there. The wire runs to nothing. Everything real is
            one pan away.
          </p>

          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "var(--faint)",
              marginTop: 28,
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span>REQUEST</span>
            <span aria-hidden style={{ color: "var(--line)" }}>─────</span>
            <span style={{ color: "var(--acc)" }}>✕ NO NODE</span>
            <span aria-hidden style={{ color: "var(--line)" }}>─────</span>
            <span>DEAD END</span>
          </div>

          <nav style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/"
              className="mono"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11.5,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--ink)",
                background: "color-mix(in srgb, var(--acc) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--acc) 34%, var(--node-bd))",
                borderRadius: 6,
                padding: "10px 16px",
                textDecoration: "none",
              }}
            >
              ← Back to the board
            </Link>
            <Link
              href="/read"
              className="mono"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11.5,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--dim)",
                background: "var(--node)",
                border: "1px solid var(--node-bd)",
                borderRadius: 6,
                padding: "10px 16px",
                textDecoration: "none",
              }}
            >
              Read the monograph →
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
