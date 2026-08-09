"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { projects, site } from "@/content";
import { asset } from "@/lib/asset";
import { buildBoard, type PlacedNode, type Box } from "@/lib/board-layout";
import type { Stage } from "@/lib/graph";

/* ---- one node ---- */
function Node({
  n,
  pos,
  expanded,
  selected,
  onToggle,
  onDragStart,
}: {
  n: PlacedNode;
  pos: { x: number; y: number };
  expanded: boolean;
  selected: boolean;
  onToggle: (slug: string) => void;
  onDragStart: (e: React.PointerEvent, id: string) => void;
}) {
  const base: React.CSSProperties = { left: pos.x, top: pos.y, width: n.w };
  const nid = { "data-node": n.id, ...(selected ? { "data-selected": "true" } : {}) } as Record<string, string>;
  // every node is a drag handle (the board pan ignores pointerdowns on nodes)
  const dragHandle = { onPointerDown: (e: React.PointerEvent) => onDragStart(e, n.id) };

  if (n.role === "origin") {
    return (
      <div className="node n-origin" style={base} {...nid} {...dragHandle}>
        <div className="n-kicker kicker n-drag">
          <span className="dot" />
          Origin
        </div>
        {/* h1 (not div) so the board home has a document heading for crawlers /
            agents — Tailwind preflight zeroes UA heading styles, so with the
            .n-title class this renders pixel-identical to the old div. */}
        <h1 className="n-title">{site.name}</h1>
        <div className="n-lede">
          Creative technologist in Hyderabad — a trained{" "}
          <span className="em">3D environment artist</span> and self-taught
          systems engineer. Real-time worlds on one side, hardened local-first
          software on the other. Every project here is drawn as the path that
          built it.
        </div>
        <div className="n-met mono">GITHUB @{site.handle} · ARTSTATION @damanpsd</div>
      </div>
    );
  }

  if (n.role === "howto") {
    return (
      <div className="node n-howto" style={base} {...nid} {...dragHandle}>
        <div className="n-kicker kicker n-drag" style={{ color: "var(--acc)" }}>
          <span className="dot" />
          How to read this board
        </div>
        <div className="n-title">This site is a board, not a page.</div>
        <div className="n-body" style={{ marginTop: 6 }}>
          Everything I&apos;ve built is laid out in space as the path that made
          it. To move around:
        </div>
        <ul className="n-howlist mono">
          <li><b>Drag</b> the background to pan · <b>scroll</b> to zoom out</li>
          <li><b>Click a project</b> to trace its build, idea → shipped</li>
          <li><b>Grab a card&apos;s top strip</b> to move it around the board</li>
          <li><b>⇧ Shift-drag</b> the background → box several cards, move together</li>
          <li><b>☰ Outline</b> up top = the whole thing as a plain list</li>
          <li><b>◑ / ◐</b> toggles light / dark</li>
        </ul>
      </div>
    );
  }

  if (n.role === "about") {
    return (
      <div className="node n-about" style={base} {...nid} {...dragHandle}>
        <div className="n-kicker kicker n-drag" style={{ color: "var(--art)" }}>
          <span className="dot" />
          About
        </div>
        <div className="n-title">Two crafts, one mind.</div>
        <div className="n-body" style={{ marginTop: 6 }}>
          I&apos;m a creative technologist — a 3D environment artist and a
          systems engineer, and it&apos;s the same mind running both. Composition,
          systems thinking, and restraint show up on both sides.
        </div>
        <div className="n-body" style={{ marginTop: 8 }}>
          Trained as an artist (MA Animation, University of Salford — Merit;
          Umbraixs was my final project), self-taught and AI-assisted on the
          engineering side. I work local-first, $0-recurring, and
          evidence-over-vibes: profile before you optimize, measure before you
          ship.
        </div>
        <div className="n-met mono">HYDERABAD, IN · {site.status.toUpperCase()}</div>
      </div>
    );
  }

  if (n.role === "contact") {
    return (
      <div className="node k-end" style={base} {...nid} {...dragHandle}>
        <div className="n-kicker kicker n-drag">
          <span className="dot" />
          Contact
        </div>
        <div className="n-title">Get in touch</div>
        <div className="n-body">
          {site.status} · {site.replies}. Email me directly, or find me on
          GitHub.
        </div>
        <div className="n-met mono">
          <a href={`mailto:${site.email}`}>{site.email} ↗</a>
          <br />
          <a href={`https://github.com/${site.handle}`} target="_blank" rel="noopener noreferrer">
            github.com/{site.handle} ↗
          </a>
        </div>
      </div>
    );
  }

  if (n.role === "art") {
    return (
      <div className="node n-art" style={base} {...nid} {...dragHandle} aria-expanded={expanded}>
        <div className="n-kicker kicker">
          <span className="dot" />
          The Craft · 3D / technical art
        </div>
        <div className="n-title">3D / technical art</div>
        <div className="n-body">
          A curated archive from my MA Animation work — environments, looks-dev,
          procedural studies. Trace how a piece gets built, below.
        </div>
        <div className="n-met mono">
          <a href="https://www.artstation.com/damanpsd" target="_blank" rel="noopener noreferrer">
            full gallery on artstation ↗
          </a>
        </div>
        {/* expand the art PIPELINE (same affordance as project DAGs) */}
        <button
          type="button"
          className="n-expand"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse the art pipeline" : "Expand the art pipeline"}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onToggle("art"); }}
        >
          <span className="n-expand-ico">{expanded ? "−" : "+"}</span>
          {expanded ? "COLLAPSE PIPELINE" : "TRACE THE PIPELINE"}
        </button>
      </div>
    );
  }

  if (n.role === "work") {
    return (
      <div className="node n-art n-work" style={base} {...nid} {...dragHandle} aria-expanded={expanded}>
        <div className="n-kicker kicker">
          <span className="dot" />
          The Work · how I build software
        </div>
        <div className="n-title">How I build software</div>
        <div className="n-body">
          The same process behind every system below — local-first, threat-modeled,
          measured, hardened. Trace it before the projects.
        </div>
        <div className="n-met mono">
          <a href={`https://github.com/${site.handle}`} target="_blank" rel="noopener noreferrer">
            github.com/{site.handle} ↗
          </a>
        </div>
        {/* expand the ENGINEERING pipeline (mirror of the art pipeline) */}
        <button
          type="button"
          className="n-expand"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse the build process" : "Expand the build process"}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onToggle("work"); }}
        >
          <span className="n-expand-ico">{expanded ? "−" : "+"}</span>
          {expanded ? "COLLAPSE PROCESS" : "TRACE THE PROCESS"}
        </button>
      </div>
    );
  }

  if (n.role === "plate" && n.plate) {
    const p = n.plate;
    const cover = p.gallery?.[0]?.src;
    // a proper draggable NODE (not a Link) so it moves anywhere on the board;
    // the caption carries the title-link into the project's deep-dive page.
    return (
      <div
        className="node n-plate"
        style={{ ...base, height: 234 }}
        {...nid} {...dragHandle}
        aria-label={`${p.name} — ${p.tagline}`}
      >
        {cover ? (
          <img src={asset(cover.replace(".webp", "-thumb.webp"))} alt={p.description} loading="lazy" draggable={false} />
        ) : (
          <span style={{ position: "absolute", inset: 0, background: "var(--node-hi)" }} />
        )}
        <Link href={`/projects/${p.slug}`} prefetch={false} className="p-cap p-cap-link" draggable={false}>
          {p.num} · {p.name} <span className="n-go">↗</span>
        </Link>
        {p.artDag && (
          <button
            type="button"
            className="n-expand p-expand"
            aria-expanded={expanded}
            aria-label={expanded ? `Collapse ${p.name} process` : `Expand ${p.name} process`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onToggle(`plate-${p.slug}`); }}
          >
            <span className="n-expand-ico">{expanded ? "−" : "+"}</span>
            {expanded ? "COLLAPSE" : "TRACE"}
          </button>
        )}
      </div>
    );
  }

  if (n.role === "proj" && n.project) {
    const p = n.project;
    return (
      <div className="node n-proj" style={base} {...nid} {...dragHandle} aria-expanded={expanded}>
        <div className="n-kicker kicker n-drag">
          <span className="dot" />
          {p.num} · {p.category}
        </div>
        {/* title navigates into the project's deep-dive page. Wrapped in an h2
            with display:contents so the board home has a heading outline for
            crawlers/agents while adding ZERO layout box (pixel-identical). */}
        <h2 style={{ display: "contents" }}>
          <Link href={`/projects/${p.slug}`} prefetch={false} className="n-title n-title-link" draggable={false}>
            {p.name} <span className="n-go">↗</span>
          </Link>
        </h2>
        <div className="n-body">{p.description}</div>
        {p.metric && (
          <div className="n-met">
            <em>{p.metric.value}</em>
            {p.metric.label ? <span className="n-metlbl"> {p.metric.label}</span> : null}
          </div>
        )}
        {/* explicit expand control — toggles the DAG tree; separate from drag + page */}
        <button
          type="button"
          className="n-expand"
          aria-expanded={expanded}
          aria-label={expanded ? `Collapse ${p.name} build tree` : `Expand ${p.name} build tree`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(p.slug);
          }}
        >
          <span className="n-expand-ico">{expanded ? "−" : "+"}</span>
          {expanded ? "COLLAPSE BUILD" : "TRACE THE BUILD"}
        </button>
      </div>
    );
  }

  // stage node (only rendered when its project is expanded)
  if (n.role === "stage" && n.stage) {
    const s: Stage = n.stage;
    const endCls = s.kind === "end" ? `k-end s-${n.project?.status ?? ""}` : `k-${s.kind}`;
    return (
      <div className={`node ${endCls}`} style={base} {...nid} {...dragHandle}>
        <div className="n-kicker kicker n-drag">
          <span className="dot" />
          {s.label}
        </div>
        <div className="n-title">{s.title}</div>
        {s.body && <div className="n-body">{s.body}</div>}
        {s.decisions && (
          <ul className="n-decisions">
            {s.decisions.map((d, i) => (
              <li key={i}>
                <span className="d-choice mono">{d.choice}</span>
                <span className="d-reason"> — {d.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // art-pipeline stage (shown when the art hub is expanded)
  if (n.role === "artstage" && n.artStage) {
    const s = n.artStage;
    return (
      <div className="node k-production n-artstage" style={base} {...nid} {...dragHandle}>
        <div className="n-kicker kicker n-drag" style={{ color: "var(--art)" }}>
          <span className="dot" />
          {s.label}
        </div>
        <div className="n-title">{s.title}</div>
        <div className="n-body">{s.body}</div>
      </div>
    );
  }

  return null;
}

const POS_KEY = "board-positions-v1";
const ZOOM_MAX = 1.5; // allow zooming in to 150% (Daman)
// zoom-out floors: capped so the board can't shrink to a distant speck (Daman).
// A "fit the whole board" scale is computed at runtime and used as the real floor
// when it's tighter than these — so the min always keeps the board readable.
const ZOOM_MIN = 0.55; // tighter zoom-out cap (Daman) — board can't shrink far
const ZOOM_MIN_TOUCH = 0.3; // phones can pull back a bit further to reach one screen
// how far past the content edges the camera may pan before it's clamped — a
// TIGHT margin of empty board around the arrangement (Daman: don't let the board
// drift far out when we're not using that space), so you stay near the content.
const PAN_MARGIN = 260;
const isCoarse = () =>
  typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;

export default function Board() {
  const model = useMemo(() => buildBoard([...projects]), []);
  // EVERYTHING opens expanded by default, on BOTH desktop and mobile (Daman):
  // every systems project, the art hub pipeline, AND every art plate's own DAG.
  const [open, setOpen] = useState<Set<string>>(
    () =>
      new Set<string>([
        ...projects.filter((p) => p.discipline === "systems").map((p) => p.slug),
        "art",
        "work",
        ...projects.filter((p) => p.discipline === "craft").map((p) => `plate-${p.slug}`),
      ]),
  );
  const worldRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // per-node position overrides (drag) — persisted, resettable
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  // marquee multi-select is shift+drag (no tool mode)
  const [toolsOpen, setToolsOpen] = useState(false); // bottom-left drop-up menu
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  // bumped after DAG stages mount/unmount so item boxes re-measure their bounds
  const [, setBoxTick] = useState(0);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // keep only well-formed {x:number,y:number} entries — a malformed store
      // must never crash the board
      const clean: Record<string, { x: number; y: number }> = {};
      for (const [k, v] of Object.entries(parsed ?? {})) {
        const p = v as { x?: unknown; y?: unknown };
        if (typeof p?.x === "number" && typeof p?.y === "number") clean[k] = { x: p.x, y: p.y };
      }
      setPos(clean);
    } catch {
      /* ignore — fall back to designed defaults */
    }
  }, []);
  // resolve a node's live position (override or its designed default) — always safe
  const posOf = useCallback(
    (n: PlacedNode) => {
      const o = pos[n.id];
      return o && typeof o.x === "number" && typeof o.y === "number" ? o : { x: n.x, y: n.y };
    },
    [pos],
  );

  // view transform
  const view = useRef({ tx: 0, ty: 0, s: 1 });

  // ── PAN BOUNDS: keep the board on screen — the camera can't wander off into
  //    empty void (Daman). We clamp tx/ty so the content rect (all node
  //    positions + PAN_MARGIN of slack) always overlaps the viewport. Computed
  //    from live positions so it tracks dragged nodes; recomputed cheaply.
  const contentRect = useCallback(() => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of model.nodes) {
      const p = pos[n.id] ?? { x: n.x, y: n.y };
      x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x + n.w); y1 = Math.max(y1, p.y + 300); // +300 ≈ tall card
    }
    if (!isFinite(x0)) return null;
    return { x0: x0 - PAN_MARGIN, y0: y0 - PAN_MARGIN, x1: x1 + PAN_MARGIN, y1: y1 + PAN_MARGIN };
  }, [model.nodes, pos]);
  const contentRectRef = useRef(contentRect);
  contentRectRef.current = contentRect;

  // clamp view.current.tx/ty so the content rect can't be panned entirely out of
  // the viewport. Screen coords: a world point wx maps to tx + wx*s. We require
  // the content's on-screen span to still cover the stage (with margin baked into
  // the rect), i.e. right edge ≥ 0 and left edge ≤ stageW (and same vertically).
  const clampView = useCallback(() => {
    const stage = stageRef.current;
    const r = contentRectRef.current?.();
    if (!stage || !r) return;
    const { width: vw, height: vh } = stage.getBoundingClientRect();
    const s = view.current.s;
    const cw = (r.x1 - r.x0) * s, ch = (r.y1 - r.y0) * s;
    // allowed tx range so the scaled content rect stays overlapping the viewport
    const minTx = cw >= vw ? vw - (r.x1 * s) : -(r.x0 * s);
    const maxTx = cw >= vw ? -(r.x0 * s) : vw - (r.x1 * s);
    const minTy = ch >= vh ? vh - (r.y1 * s) : -(r.y0 * s);
    const maxTy = ch >= vh ? -(r.y0 * s) : vh - (r.y1 * s);
    view.current.tx = Math.min(maxTx, Math.max(minTx, view.current.tx));
    view.current.ty = Math.min(maxTy, Math.max(minTy, view.current.ty));
  }, []);
  const clampViewRef = useRef(clampView);
  clampViewRef.current = clampView;

  // shared adaptive zoom-out floor (used by the +/− buttons + keyboard zoom):
  // the larger of the fixed floor and the "fit the whole board" scale.
  const minZoomOut = useCallback(() => {
    const floor = isCoarse() ? ZOOM_MIN_TOUCH : ZOOM_MIN;
    const stage = stageRef.current;
    const r = contentRectRef.current?.();
    if (!stage || !r) return floor;
    const vr = stage.getBoundingClientRect();
    const fit = Math.min(vr.width / (r.x1 - r.x0), vr.height / (r.y1 - r.y0));
    return Math.max(floor, fit);
  }, []);

  // Zoom = pure GPU transform:translate+scale, ALWAYS (Daman). The old approach
  // swapped to the CSS `zoom` property at rest for razor-crisp text, but that
  // swap re-rasterized the text and made it visibly shimmer / reflow at the
  // settle moment. Using one mode everywhere kills that: the layout never
  // changes coordinate systems, so text is rock-stable. Tradeoff — text is
  // slightly soft away from 100%, razor-sharp AT 100%. Compositor-only, so it's
  // buttery on any machine, no relayout at any zoom level.
  const drawWiresRef = useRef<(() => void) | null>(null);
  const applyView = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    clampViewRef.current?.(); // keep the board on screen — no panning into the void
    const { tx, ty, s } = view.current;
    w.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
  }, []);

  // which stage nodes are shown: project stages only when that project is open;
  // art-pipeline stages only when the art hub is open.
  const visibleNodes = useMemo(
    () =>
      model.nodes.filter((n) => {
        if (n.role === "stage") return !!n.project && open.has(n.project.slug);
        if (n.role === "artstage") {
          // per-plate DAG stage id = "plate-<slug>-<key>" → gate on its plate;
          // work-pipeline stage (e.g. "work-scope") → gate on the work hub;
          // shared art-hub stage (e.g. "art-concept") → gate on the art hub.
          if (n.id.startsWith("plate-")) {
            const plateId = n.id.replace(/-(vision|impl|problems|output)$/, "");
            return open.has(plateId);
          }
          if (n.id.startsWith("work-")) return open.has("work");
          return open.has("art");
        }
        return true;
      }),
    [model.nodes, open],
  );
  const visibleIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  // draw wires after layout (measure real node heights)
  const drawWires = useCallback(() => {
    const svg = svgRef.current;
    const world = worldRef.current;
    if (!svg || !world) return;
    svg.innerHTML = "";
    const rectOf = (id: string) => {
      const el = world.querySelector<HTMLElement>(`[data-node="${id}"]`);
      if (!el) return null;
      return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
    };
    for (const [a, b, kind] of model.edges) {
      if (!visibleIds.has(a) || !visibleIds.has(b)) continue;
      const ra = rectOf(a);
      const rb = rectOf(b);
      if (!ra || !rb) continue;
      const p1 = [ra.x + ra.w, ra.y + ra.h / 2];
      const p2 = [rb.x, rb.y + rb.h / 2];
      const mx = (p1[0] + p2[0]) / 2;
      const d = `M${p1[0]},${p1[1]} C${mx},${p1[1]} ${mx},${p2[1]} ${p2[0]},${p2[1]}`;
      // base (static track)
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      if (kind === "ship") path.setAttribute("class", "w-ship");
      else if (kind === "art") path.setAttribute("class", "w-art");
      else if (kind === "out") path.setAttribute("class", "w-out");
      svg.appendChild(path);
      // bloomed core overlaid on the same curve — a bright glowing accent line
      // (static; the halo is a CSS drop-shadow, dropped only on low-end devices)
      const flow = document.createElementNS("http://www.w3.org/2000/svg", "path");
      flow.setAttribute("d", d);
      flow.setAttribute("class", `w-flow${kind === "ship" ? " f-ship" : kind === "art" ? " f-art" : kind === "out" ? " f-out" : ""}`);
      svg.appendChild(flow);
    }
  }, [model.edges, visibleIds]);

  // keep the forward-declared drawWiresRef (above applyView) pointing at the
  // latest drawWires, for handlers bound once with []-deps.
  useEffect(() => {
    drawWiresRef.current = drawWires;
  }, [drawWires]);
  drawWiresRef.current = drawWires; // also current within this render
  // refs so the once-bound pointer handlers always see current nodes/positions
  const visibleNodesRef = useRef(visibleNodes);
  visibleNodesRef.current = visibleNodes;
  const posOfRef = useRef(posOf);
  posOfRef.current = posOf;

  // fit a set of nodes into view
  const fitTo = useCallback(
    // maxScale caps a fit at native 1× by default (framing shouldn't blow content
    // up past native even though free zoom now goes to 1.5×).
    (ids?: Set<string>, pad = 90, maxScale = 1) => {
      const stage = stageRef.current;
      const world = worldRef.current;
      if (!stage || !world) return;
      let x0 = Infinity,
        y0 = Infinity,
        x1 = -Infinity,
        y1 = -Infinity;
      const list = visibleNodes.filter((n) => !ids || ids.has(n.id));
      for (const n of list) {
        const el = world.querySelector<HTMLElement>(`[data-node="${n.id}"]`);
        const h = el?.offsetHeight ?? 90;
        const p = posOf(n);
        x0 = Math.min(x0, p.x);
        y0 = Math.min(y0, p.y);
        x1 = Math.max(x1, p.x + n.w);
        y1 = Math.max(y1, p.y + h);
      }
      if (!isFinite(x0)) return;
      const bw = x1 - x0 + pad * 2;
      const bh = y1 - y0 + pad * 2;
      const r = stage.getBoundingClientRect();
      const s = Math.min(maxScale, Math.max(ZOOM_MIN, Math.min(r.width / bw, r.height / bh)));
      view.current = {
        s,
        tx: (r.width - (x0 + x1) * s) / 2,
        ty: (r.height - (y0 + y1) * s) / 2,
      };
      applyView();
    },
    [visibleNodes, applyView, posOf],
  );

  // ---- node drag: move a single card, but only past a movement threshold so
  //      text stays selectable and clicks still work. The card is grabbed by
  //      its DRAG STRIP (the kicker/handle row); the body allows text select. ─
  const DRAG_THRESHOLD = 5; // px before a press becomes a drag
  const dragState = useRef<
    | {
        id: string; sx: number; sy: number; ox: number; oy: number;
        active: boolean; pointerId: number; captureEl: HTMLElement;
        group: string[]; starts: Record<string, { x: number; y: number }>;
        // DOM elements resolved ONCE at drag-start (not re-queried per frame —
        // measured 6× cheaper on a full-board group-move).
        els: Record<string, HTMLElement | null>;
        last?: Record<string, { x: number; y: number }>;
      }
    | null
  >(null);
  const redrawPending = useRef<number | null>(null); // coalesce wire redraws to 1/frame
  const onNodeDragStart = useCallback(
    (e: React.PointerEvent, id: string) => {
      // MOBILE: card-drag is disabled (the layout is baked; on touch it only
      // fights pan/pinch). A finger on a node just lets the pinch/pan handler or
      // the node's own link/expand button do its thing.
      if (isCoarse()) return;
      // the WHOLE card is a drag surface now (Daman) — grab it anywhere. Only
      // real controls opt out: links and buttons handle their own pointer so
      // clicking a title/expand still works. (Text is non-selectable site-wide,
      // so there's no selection to protect — no need for a handle strip.)
      const t = e.target as HTMLElement;
      if (t.closest("a, button")) return;
      const node = model.nodes.find((n) => n.id === id);
      if (!node) return;
      const start = pos[id] ?? { x: node.x, y: node.y };
      // if this node is part of a marquee selection, drag the WHOLE group
      const sel = selectedRef.current;
      const groupIds = sel.has(id) ? [...sel] : [id];
      const starts: Record<string, { x: number; y: number }> = {};
      const els: Record<string, HTMLElement | null> = {};
      const world = worldRef.current;
      for (const gid of groupIds) {
        const gn = model.nodes.find((n) => n.id === gid);
        if (gn) starts[gid] = pos[gid] ?? { x: gn.x, y: gn.y };
        // resolve the DOM node once — reused every pointermove frame
        els[gid] = world?.querySelector<HTMLElement>(`[data-node="${gid}"]`) ?? null;
      }
      dragState.current = {
        id, sx: e.clientX, sy: e.clientY, ox: start.x, oy: start.y,
        active: false, pointerId: e.pointerId, captureEl: e.currentTarget as HTMLElement,
        group: groupIds, starts, els,
      };
      e.stopPropagation();
    },
    [model.nodes, pos],
  );
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragState.current;
      if (!d) return;
      const s = view.current.s;
      const dx = (e.clientX - d.sx) / s;
      const dy = (e.clientY - d.sy) / s;
      // only begin the actual drag once past the threshold (keeps clicks/selection intact)
      if (!d.active) {
        if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) < DRAG_THRESHOLD) return;
        d.active = true;
        try {
          d.captureEl.setPointerCapture(d.pointerId);
        } catch {
          /* ignore */
        }
      }
      // move every node in the drag group by the same delta, and RECORD the
      // final positions on dragState — onUp persists from here, NOT from the DOM
      // (a mid-drag React re-render can reset el.style.left to the state value,
      // which would make the node snap back on release).
      d.last = {};
      for (const gid of d.group) {
        const st = d.starts[gid];
        if (!st) continue;
        const nx = st.x + dx, ny = st.y + dy;
        d.last[gid] = { x: nx, y: ny };
        const gel = d.els[gid]; // cached at drag-start, no per-frame query
        if (gel) {
          gel.style.left = `${nx}px`;
          gel.style.top = `${ny}px`;
        }
      }
      // coalesce wire redraws to ONE per animation frame — pointermove can fire
      // 120+×/s; without this we'd queue a full 46-path rebuild per event.
      if (redrawPending.current == null) {
        redrawPending.current = requestAnimationFrame(() => {
          redrawPending.current = null;
          drawWiresRef.current?.();
        });
      }
    };
    const onUp = () => {
      const d = dragState.current;
      dragState.current = null;
      if (!d || !d.active || !d.last) return;
      const last = d.last;
      setPos((prev) => {
        const next = { ...prev };
        for (const gid of d.group) {
          if (last[gid]) next[gid] = last[gid]; // from tracked drag, not the DOM
        }
        try {
          localStorage.setItem(POS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const resetLayout = useCallback(() => {
    // restore the baked default positions; redraw wires against them. No camera
    // move (Daman: reset shouldn't jump the view), and no DOM-read snap-back —
    // clearing pos re-renders nodes at their DEFAULT_POS defaults.
    setPos({});
    try {
      localStorage.removeItem(POS_KEY);
    } catch {
      /* ignore */
    }
    setTimeout(() => drawWiresRef.current?.(), 40);
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      // Expand/collapse IN PLACE — no camera move (Daman: the auto-fit-to-tree
      // on TRACE was too jarring). The tree just appears where the card is; the
      // wire-redraw effect handles the freshly-shown stages.
      setOpen((prev) => {
        const next = new Set(prev);
        if (next.has(slug)) next.delete(slug);
        else next.add(slug);
        return next;
      });
    },
    [],
  );

  // redraw wires + re-measure boxes when the visible set changes — after a
  // frame so newly-mounted stage nodes are measurable (box hugs then grows).
  useEffect(() => {
    const r1 = requestAnimationFrame(() => { drawWires(); setBoxTick((t) => t + 1); });
    const t = setTimeout(() => { drawWires(); setBoxTick((t) => t + 1); }, 140);
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t);
    };
  }, [drawWires]);

  // LOW-END GUARD: on a weak machine (few cores / little RAM), re-rendering the
  // blurred wire-glow layer is a needless cost. Detect a potato once and flag
  // the stage `.low-end` → CSS drops the wire bloom's drop-shadow to a plain
  // bright stroke (still visible + colored, just no halo). Everything else
  // (crisp zoom, wires, drag) stays. Reduced-motion users get the same.
  // (The old idle-pause / tab-hidden / zoomed-out `.calm`/`.far` effects were
  // removed with the wire ANIMATION — a static glow has nothing to pause.)
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency ?? 8;
    const mem = nav.deviceMemory ?? 8;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const potato = cores <= 4 || mem <= 4 || reduced;
    if (potato) stageRef.current?.classList.add("low-end");
  }, []);

  // initial view: open focused on the welcome column (how-to + origin + about)
  // at native scale, so a first-time visitor lands oriented and reading crisp text.
  // The fit must run only once nodes have real measured heights — a single rAF
  // loses a race on cold loads (fonts not yet laid out → placeholder heights →
  // fit no-ops, board lands untransformed). Settle it deterministically: retry
  // across a rAF, a timed fallback, fonts.ready, and window.load until the
  // welcome nodes measure taller than the 90px placeholder, then stop.
  useEffect(() => {
    // START HERE: every visitor lands framed on the WELCOME column (origin +
    // how-to + about + contact) — the "who I am / how to read this board" zone —
    // on both desktop and mobile (Daman). The rest of the open board is a pan
    // away. Responsive (a fit, not a hardcoded camera), so it frames right on
    // any screen size.
    const mobile = isCoarse();
    const TARGET = new Set(["origin", "howto", "about", "contact"]);
    let settled = false;
    const measured = () => {
      const el = worldRef.current?.querySelector<HTMLElement>('[data-node="origin"]');
      return !!el && el.offsetHeight > 100; // real card, not the placeholder
    };
    const settle = () => {
      if (settled) return;
      drawWires();
      fitTo(TARGET, mobile ? 48 : 90);
      if (measured()) settled = true; // stop once framed against real heights
    };
    const r1 = requestAnimationFrame(settle);
    const t1 = setTimeout(settle, 140);
    const t2 = setTimeout(settle, 380);
    if (document.fonts?.ready) document.fonts.ready.then(settle);
    window.addEventListener("load", settle);
    const onResize = () => {
      drawWires();
      fitTo();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("load", settle);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pan + marquee select
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let mode: "none" | "pan" | "marquee" = "none";
    let sx = 0, sy = 0, ox = 0, oy = 0;
    // marquee start in WORLD coords
    let mwx = 0, mwy = 0;
    const toWorld = (clientX: number, clientY: number) => {
      const r = stage.getBoundingClientRect();
      return {
        x: (clientX - r.left - view.current.tx) / view.current.s,
        y: (clientY - r.top - view.current.ty) / view.current.s,
      };
    };
    // Zoom-out floor = the LARGER of the fixed floor and the scale that just
    // fits the whole content rect on screen — so you can never zoom out past
    // "the whole board fills the view" into empty space (Daman's cap).
    const minZoom = () => {
      const floor = isCoarse() ? ZOOM_MIN_TOUCH : ZOOM_MIN;
      const r = contentRectRef.current?.();
      if (!r) return floor;
      const vr = stage.getBoundingClientRect();
      const fit = Math.min(vr.width / (r.x1 - r.x0), vr.height / (r.y1 - r.y0));
      return Math.max(floor, fit);
    };
    // active touch/pen/mouse pointers for multi-touch pinch
    const pts = new Map<number, { x: number; y: number }>();
    // pinch state
    let pinch: { d0: number; s0: number; cx: number; cy: number } | null = null;
    // inertial pan state
    let vx = 0, vy = 0, lastT = 0, momentum = 0;
    const stopMomentum = () => { if (momentum) { cancelAnimationFrame(momentum); momentum = 0; } };

    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot(a.x - b.x, a.y - b.y);

    const onDown = (e: PointerEvent) => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      // second finger down → enter pinch (works even if the first landed on a node)
      if (pts.size === 2) {
        stopMomentum();
        const [a, b] = [...pts.values()];
        const r = stage.getBoundingClientRect();
        pinch = {
          d0: dist(a, b),
          s0: view.current.s,
          cx: (a.x + b.x) / 2 - r.left,
          cy: (a.y + b.y) / 2 - r.top,
        };
        mode = "none";
        stage.classList.remove("dragging");
        return;
      }
      if ((e.target as HTMLElement).closest(".node, a, button")) return;
      stopMomentum();
      sx = e.clientX; sy = e.clientY;
      if (e.shiftKey) {
        mode = "marquee";
        const w = toWorld(e.clientX, e.clientY);
        mwx = w.x; mwy = w.y;
        setMarquee({ x: mwx, y: mwy, w: 0, h: 0 });
      } else {
        mode = "pan";
        ox = view.current.tx; oy = view.current.ty;
        vx = 0; vy = 0; lastT = e.timeStamp;
        stage.classList.add("dragging");
      }
      stage.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      // ── PINCH: two pointers → zoom about their midpoint ──
      if (pinch && pts.size >= 2) {
        const [a, b] = [...pts.values()];
        const d = dist(a, b);
        if (pinch.d0 > 0) {
          const ns = Math.min(ZOOM_MAX, Math.max(minZoom(), pinch.s0 * (d / pinch.d0)));
          const k = ns / view.current.s;
          view.current.tx = pinch.cx - (pinch.cx - view.current.tx) * k;
          view.current.ty = pinch.cy - (pinch.cy - view.current.ty) * k;
          view.current.s = ns;
          applyView();
        }
        return;
      }
      if (mode === "pan") {
        const nx = ox + (e.clientX - sx);
        const ny = oy + (e.clientY - sy);
        const dt = e.timeStamp - lastT || 16;
        vx = (nx - view.current.tx) / dt; vy = (ny - view.current.ty) / dt;
        lastT = e.timeStamp;
        view.current.tx = nx; view.current.ty = ny;
        applyView();
      } else if (mode === "marquee") {
        const w = toWorld(e.clientX, e.clientY);
        const x = Math.min(mwx, w.x), y = Math.min(mwy, w.y);
        const bw = Math.abs(w.x - mwx), bh = Math.abs(w.y - mwy);
        setMarquee({ x, y, w: bw, h: bh });
        const hit = new Set<string>();
        for (const n of visibleNodesRef.current) {
          const p = posOfRef.current(n);
          const el = worldRef.current?.querySelector<HTMLElement>(`[data-node="${n.id}"]`);
          const h = el?.offsetHeight ?? 120;
          if (p.x < x + bw && p.x + n.w > x && p.y < y + bh && p.y + h > y) hit.add(n.id);
        }
        setSelected(hit);
      }
    };

    const onUp = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pinch && pts.size < 2) pinch = null; // last finger of a pinch lifted
      if (mode === "pan") {
        if (Math.abs(view.current.tx - ox) + Math.abs(view.current.ty - oy) < 3) setSelected(new Set());
        // ── INERTIAL PAN: fling with the release velocity, decaying ──
        else if (Math.hypot(vx, vy) > 0.05) {
          const step = () => {
            view.current.tx += vx * 16; view.current.ty += vy * 16;
            vx *= 0.92; vy *= 0.92;
            applyView();
            momentum = Math.hypot(vx, vy) > 0.02 ? requestAnimationFrame(step) : 0;
          };
          momentum = requestAnimationFrame(step);
        }
      }
      if (mode === "marquee") setMarquee(null);
      mode = "none";
      stage.classList.remove("dragging");
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      const ns = Math.min(ZOOM_MAX, Math.max(minZoom(), view.current.s * (e.deltaY < 0 ? 1.1 : 0.9)));
      const k = ns / view.current.s;
      view.current.tx = cx - (cx - view.current.tx) * k;
      view.current.ty = cy - (cy - view.current.ty) * k;
      view.current.s = ns;
      applyView();
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stopMomentum();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("wheel", onWheel);
    };
  }, [applyView]);

  const zoomBy = (k: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    const cx = r.width / 2,
      cy = r.height / 2;
    const ns = Math.min(ZOOM_MAX, Math.max(minZoomOut(), view.current.s * k));
    const m = ns / view.current.s;
    view.current.tx = cx - (cx - view.current.tx) * m;
    view.current.ty = cy - (cy - view.current.ty) * m;
    view.current.s = ns;
    applyView();
  };

  const fitZone = (zone: "all" | "work" | "art") => {
    if (zone === "all") return fitTo();
    if (zone === "work") {
      const ids = new Set(
        visibleNodes.filter((n) => n.role === "proj" || n.role === "stage").map((n) => n.id),
      );
      return fitTo(ids, 70);
    }
    const ids = new Set(
      visibleNodes.filter((n) => n.role === "plate" || n.role === "art").map((n) => n.id),
    );
    return fitTo(ids, 70);
  };

  // Box bounds:
  //  · GROUP boxes keep their designed static rect (a stable container that
  //    doesn't jump when DAGs open/close).
  //  · ITEM boxes follow their members' CURRENT positions (so a dragged card's
  //    box moves with it), sized from measured heights.
  const liveBox = (b: Box) => {
    if (b.kind === "group") return { x: b.x, y: b.y, w: b.w, h: b.h };
    const world = worldRef.current;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const id of b.members) {
      const node = model.nodes.find((n) => n.id === id);
      if (!node) continue;
      // ONLY wrap members that are actually on screen — a collapsed DAG's stage
      // nodes aren't rendered, so the box hugs just the visible card(s).
      const el = world?.querySelector<HTMLElement>(`[data-node="${id}"]`);
      if (!el) continue;
      const p = posOf(node);
      x0 = Math.min(x0, p.x);
      y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x + el.offsetWidth);
      y1 = Math.max(y1, p.y + el.offsetHeight);
    }
    if (!isFinite(x0)) return { x: b.x, y: b.y, w: b.w, h: b.h };
    const padX = 22, padTop = 32, padBottom = 20;
    return { x: x0 - padX, y: y0 - padTop, w: x1 - x0 + padX * 2, h: y1 - y0 + padTop + padBottom };
  };

  // keyboard operation of the board itself (Sam / keyboard-only users): arrows
  // pan, +/− zoom, 0 fits everything. The board is focusable so these are
  // reachable without a pointer; the Outline remains the full linear fallback.
  const onStageKeyDown = (e: React.KeyboardEvent) => {
    // don't hijack keys while focus is on a node's link/button
    if ((e.target as HTMLElement).closest("a, button")) return;
    const PAN = 80;
    switch (e.key) {
      case "ArrowLeft": view.current.tx += PAN; applyView(); break;
      case "ArrowRight": view.current.tx -= PAN; applyView(); break;
      case "ArrowUp": view.current.ty += PAN; applyView(); break;
      case "ArrowDown": view.current.ty -= PAN; applyView(); break;
      case "+": case "=": zoomBy(1 / 0.82); break;
      case "-": case "_": zoomBy(0.82); break;
      case "0": fitZone("all"); break;
      default: return;
    }
    e.preventDefault();
  };

  return (
    <div
      ref={stageRef}
      className="board-stage"
      tabIndex={0}
      role="application"
      aria-label="Portfolio board — drag or arrow keys to pan, scroll or +/− to zoom, 0 to fit. Prefer a linear list? Use the Outline button, top right."
      onKeyDown={onStageKeyDown}
    >
      <div ref={worldRef} className="board-world">
        {/* dot-grid texture layer — a big absolutely-positioned child so it
            scales with the world (zoom) yet never shifts node coordinates.
            Extends well past content in every direction so it fills the view
            when panned/zoomed. */}
        <div
          className="board-grid"
          aria-hidden="true"
          style={{
            left: -3000, top: -3000,
            width: model.bounds.w + 6000,
            height: model.bounds.h + 6000,
          }}
        />
        <svg ref={svgRef} className="board-wires" />
        {/* per-project / per-plate item boxes (group section boxes removed on
            Daman's call — the item boxes group each project cleanly enough). */}
        {model.boxes.filter((b) => b.kind === "item").map((b) => {
          const r = liveBox(b);
          return (
            <div
              key={b.id}
              className="board-box board-box-item"
              style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
            >
              {b.label && <span className="board-box-label">{b.label}</span>}
            </div>
          );
        })}
        {/* the marquee rectangle while selecting */}
        {marquee && (
          <div
            className="board-marquee"
            style={{ left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h }}
          />
        )}
        {model.zones.map((z) => {
          // the label tracks its section's lead node's CURRENT position, so it
          // follows when that node is dragged
          const anchor = model.nodes.find((n) => n.id === z.anchor);
          const ap = anchor ? posOf(anchor) : null;
          const left = ap ? ap.x + z.dx : z.x;
          const top = ap ? ap.y + z.dy : z.y;
          return (
            <div key={z.label} className="zone-title" style={{ left, top }}>
              {z.label}
            </div>
          );
        })}
        {visibleNodes.map((n) => (
          <Node
            key={n.id}
            n={n}
            pos={posOf(n)}
            expanded={
              n.role === "plate" && n.plate
                ? open.has(`plate-${n.plate.slug}`)
                : n.role === "art"
                ? open.has("art")
                : n.role === "work"
                ? open.has("work")
                : !!n.project && open.has(n.project.slug)
            }
            selected={selected.has(n.id)}
            onToggle={toggle}
            onDragStart={onNodeDragStart}
          />
        ))}
      </div>

      {/* tool menu (bottom-left): a single TOOLS button that opens a vertical
          stack ABOVE it with a drop-up animation. Selection is shift+drag now,
          so the menu is just fit-zones + reset (+ a hint). */}
      <div className="hud tools-menu" style={{ left: 18, bottom: 18 }} data-open={toolsOpen}>
        <div className="tools-stack" role="menu" aria-hidden={!toolsOpen}>
          <button className="hud-btn" role="menuitem" tabIndex={toolsOpen ? 0 : -1}
            onClick={() => fitZone("all")}
          >◱ WHOLE BOARD</button>
          <button className="hud-btn" role="menuitem" tabIndex={toolsOpen ? 0 : -1}
            onClick={() => fitZone("work")}
          >◧ THE WORK</button>
          <button className="hud-btn" role="menuitem" tabIndex={toolsOpen ? 0 : -1}
            onClick={() => fitZone("art")}
          >◨ THE CRAFT</button>
          <button className="hud-btn" role="menuitem" tabIndex={toolsOpen ? 0 : -1}
            onClick={resetLayout}
          >↺ RESET LAYOUT</button>
          <span className="tools-hint mono" aria-hidden="true">⇧ shift-drag to select</span>
        </div>
        <button
          className="hud-btn tools-toggle"
          aria-expanded={toolsOpen}
          aria-haspopup="menu"
          onClick={() => setToolsOpen((v) => !v)}
        >
          <span className="tools-caret">{toolsOpen ? "▾" : "▴"}</span> TOOLS
          {selected.size ? ` · ${selected.size} selected` : ""}
        </button>
      </div>
      {/* zoom — out only; 1× is native and crisp. DESKTOP only (mobile uses the
          bottom bar below). */}
      <div className="hud hud-desktop-zoom" style={{ right: 18, bottom: 18, display: "flex", flexDirection: "column", gap: 6 }}>
        <button className="hud-btn" style={{ width: 34, height: 34, fontSize: 16 }} onClick={() => zoomBy(1 / 0.82)} aria-label="Zoom in">+</button>
        <button className="hud-btn" style={{ width: 34, height: 34, fontSize: 16 }} onClick={() => zoomBy(0.82)} aria-label="Zoom out">−</button>
      </div>

      {/* MOBILE bottom toolbar — thumb-zone: fit · zoom · theme · read. Hidden on
          desktop; the desktop tools-menu + zoom column are hidden on mobile. */}
      <div className="hud mobile-bar" role="toolbar" aria-label="Board controls">
        <button className="mbar-btn" onClick={() => fitZone("all")} aria-label="Fit whole board">◱</button>
        <button className="mbar-btn" onClick={() => zoomBy(0.82)} aria-label="Zoom out">−</button>
        <button className="mbar-btn" onClick={() => zoomBy(1 / 0.82)} aria-label="Zoom in">+</button>
        <button
          className="mbar-btn"
          aria-label="Toggle light / dark theme"
          onClick={() => {
            const el = document.documentElement;
            const cur = el.getAttribute("data-theme")
              ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
            const next = cur === "dark" ? "light" : "dark";
            el.setAttribute("data-theme", next);
            try { localStorage.setItem("theme", next); } catch {}
          }}
        >◐</button>
        <a className="mbar-btn mbar-read" href="/read">READ</a>
      </div>
    </div>
  );
}

