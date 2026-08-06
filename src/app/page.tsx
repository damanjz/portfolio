import { site } from "@/content";
import Board from "@/components/Board";
import Outline from "@/components/Outline";
import ThemeToggle from "@/components/ThemeToggle";
import OutlineButton from "@/components/OutlineButton";

/**
 * v4 — the board IS the site. A pannable 2D flow-board where every project is
 * drawn as its production DAG. Fixed identity strip up top; the outline is the
 * a11y / 30-second read. Terminal (light) ⇄ Nocturne (dark) via the toggle.
 */
export default function Home() {
  return (
    <>
      <a className="skip-link" href="#outline">
        Skip the board — read as a linear outline
      </a>

      {/* fixed identity strip */}
      <header
        className="hud"
        style={{
          left: 0,
          right: 0,
          top: 0,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          <span className="serif" style={{ fontSize: 16, fontWeight: 600 }}>
            {site.name}
          </span>
          <span
            className="kicker"
            style={{ color: "var(--dim)", marginLeft: 10 }}
          >
            {site.role}
          </span>
        </div>
        <div
          className="kicker"
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "var(--dim)",
            pointerEvents: "auto",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--ship)",
              boxShadow: "0 0 0 3px color-mix(in srgb, var(--ship) 16%, transparent)",
            }}
          />
          <span>{site.status.toUpperCase()}</span>
          <OutlineButton />
          <ThemeToggle />
        </div>
      </header>

      <Board />
      <Outline />
    </>
  );
}
