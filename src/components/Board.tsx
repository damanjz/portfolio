"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { projects, site } from "@/content";
import { asset } from "@/lib/asset";
import { buildBoard, type PlacedNode } from "@/lib/board-layout";
import type { Stage } from "@/lib/graph";

/* ---- one node ---- */
function Node({
  n,
  pos,
  expanded,
  onToggle,
  onDragStart,
}: {
  n: PlacedNode;
  pos: { x: number; y: number };
  expanded: boolean;
  onToggle: (slug: string) => void;
  onDragStart: (e: React.PointerEvent, id: string) => void;
}) {
  const base: React.CSSProperties = { left: pos.x, top: pos.y, width: n.w };
  const nid = { "data-node": n.id } as Record<string, string>;
  // every node is a drag handle (the board pan ignores pointerdowns on nodes)
  const dragHandle = { onPointerDown: (e: React.PointerEvent) => onDragStart(e, n.id) };

  if (n.role === "origin") {
    return (
      <div className="node n-origin" style={base} {...nid} {...dragHandle}>
        <div className="n-kicker kicker">
          <span className="dot" />
          Origin
        </div>
        <div className="n-title">{site.name}</div>
        <div className="n-lede">
          Secure systems, engineered to run on your machine. Systems engineer,
          Hyderabad — and an <span className="em">ex-3D artist</span>. Every
          project here is drawn as the path that built it.
        </div>
        <div className="n-met mono">GITHUB @{site.handle} · ARTSTATION @damanpsd</div>
      </div>
    );
  }

  if (n.role === "howto") {
    return (
      <div className="node n-howto" style={base} {...nid} {...dragHandle}>
        <div className="n-kicker kicker" style={{ color: "var(--acc)" }}>
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
          <li><b>Drag any card</b> to rearrange — it&apos;s your board too</li>
          <li><b>☰ Outline</b> up top = the whole thing as a plain list</li>
          <li><b>◑ / ◐</b> toggles light / dark</li>
        </ul>
      </div>
    );
  }

  if (n.role === "about") {
    return (
      <div className="node n-about" style={base} {...nid} {...dragHandle}>
        <div className="n-kicker kicker" style={{ color: "var(--art)" }}>
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
        <div className="n-kicker kicker">
          <span className="dot" />
          Contact
        </div>
        <div className="n-title">Get in touch</div>
        <div className="n-body">
          {site.status} · {site.replies}. No inbox in the open — reach me on
          GitHub.
        </div>
        <div className="n-met mono">
          <a href={`https://github.com/${site.handle}`} target="_blank" rel="noopener noreferrer">
            github.com/{site.handle} ↗
          </a>
        </div>
      </div>
    );
  }

  if (n.role === "art") {
    return (
      <div className="node n-art" style={base} {...nid} {...dragHandle}>
        <div className="n-kicker kicker">
          <span className="dot" />
          The Plates · art
        </div>
        <div className="n-title">3D / technical art</div>
        <div className="n-body">
          A curated archive from my MA Animation work — environments, looks-dev,
          procedural studies.
        </div>
        <div className="n-met mono">
          <a href="https://www.artstation.com/damanpsd" target="_blank" rel="noopener noreferrer">
            full gallery on artstation ↗
          </a>
        </div>
      </div>
    );
  }

  if (n.role === "plate" && n.plate) {
    const p = n.plate;
    const cover = p.gallery?.[0]?.src;
    return (
      <Link
        href={`/projects/${p.slug}`}
        className="node n-plate"
        style={{ ...base, height: 150 }}
        {...nid} {...dragHandle}
        aria-label={`${p.name} — ${p.tagline}`}
      >
        {cover ? (
          <img src={asset(cover.replace(".webp", "-thumb.webp"))} alt={p.description} loading="lazy" />
        ) : (
          <span style={{ position: "absolute", inset: 0, background: "var(--node-hi)" }} />
        )}
        <span className="p-cap">
          {p.num} · {p.name}
        </span>
      </Link>
    );
  }

  if (n.role === "proj" && n.project) {
    const p = n.project;
    return (
      <div className="node n-proj" style={base} {...nid} {...dragHandle} aria-expanded={expanded}>
        <div className="n-kicker kicker">
          <span className="dot" />
          {p.num} · {p.category}
        </div>
        {/* title navigates into the project's deep-dive page */}
        <Link href={`/projects/${p.slug}`} className="n-title n-title-link" draggable={false}>
          {p.name} <span className="n-go">↗</span>
        </Link>
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
        <div className="n-kicker kicker">
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

  return null;
}

const POS_KEY = "board-positions-v1";
const ZOOM_MAX = 1; // never scale past 1× → text stays crisp (zoom OUT only)
const ZOOM_MIN = 0.28;

export default function Board() {
  const model = useMemo(() => buildBoard([...projects]), []);
  const [open, setOpen] = useState<Set<string>>(new Set(["protec"])); // protec pre-opened
  const worldRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // per-node position overrides (drag) — persisted, resettable
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
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

  const applyView = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    const { tx, ty, s } = view.current;
    w.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
  }, []);

  // which stage nodes are shown (only for opened projects)
  const visibleNodes = useMemo(
    () =>
      model.nodes.filter((n) => n.role !== "stage" || (n.project && open.has(n.project.slug))),
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
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute(
        "d",
        `M${p1[0]},${p1[1]} C${mx},${p1[1]} ${mx},${p2[1]} ${p2[0]},${p2[1]}`,
      );
      if (kind === "ship") path.setAttribute("class", "w-ship");
      else if (kind === "art") path.setAttribute("class", "w-art");
      svg.appendChild(path);
    }
  }, [model.edges, visibleIds]);

  // stable ref to the latest drawWires, for handlers bound once with []-deps
  const drawWiresRef = useRef(drawWires);
  useEffect(() => {
    drawWiresRef.current = drawWires;
  }, [drawWires]);

  // fit a set of nodes into view
  const fitTo = useCallback(
    (ids?: Set<string>, pad = 90) => {
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
      const s = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.min(r.width / bw, r.height / bh)));
      view.current = {
        s,
        tx: (r.width - (x0 + x1) * s) / 2,
        ty: (r.height - (y0 + y1) * s) / 2,
      };
      applyView();
    },
    [visibleNodes, applyView, posOf],
  );

  // ---- node drag: move a single card in board space (accounts for zoom) ----
  const dragState = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const onNodeDragStart = useCallback(
    (e: React.PointerEvent, id: string) => {
      // don't start a drag from a link or button inside the card — those are
      // their own actions (open page / expand tree)
      if ((e.target as HTMLElement).closest("a, button")) return;
      const node = model.nodes.find((n) => n.id === id);
      if (!node) return;
      const start = pos[id] ?? { x: node.x, y: node.y };
      dragState.current = { id, sx: e.clientX, sy: e.clientY, ox: start.x, oy: start.y, moved: false };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      e.stopPropagation(); // don't also pan the board
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
      if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
      const el = worldRef.current?.querySelector<HTMLElement>(`[data-node="${d.id}"]`);
      if (el) {
        el.style.left = `${d.ox + dx}px`;
        el.style.top = `${d.oy + dy}px`;
      }
      // redraw wires live so they follow the card
      requestAnimationFrame(() => drawWiresRef.current?.());
    };
    const onUp = () => {
      const d = dragState.current;
      dragState.current = null;
      if (!d || !d.moved) return;
      const el = worldRef.current?.querySelector<HTMLElement>(`[data-node="${d.id}"]`);
      if (!el) return;
      const nx = parseFloat(el.style.left);
      const ny = parseFloat(el.style.top);
      setPos((prev) => {
        const next = { ...prev, [d.id]: { x: nx, y: ny } };
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
    setPos({});
    try {
      localStorage.removeItem(POS_KEY);
    } catch {
      /* ignore */
    }
    setTimeout(() => fitTo(), 30);
  }, [fitTo]);

  const toggle = useCallback(
    (slug: string) => {
      setOpen((prev) => {
        const next = new Set(prev);
        const opening = !next.has(slug);
        if (opening) next.add(slug);
        else next.delete(slug);
        // when opening, frame the project + its freshly-shown DAG stages
        if (opening) {
          setTimeout(() => {
            const ids = new Set(
              model.nodes
                .filter((n) => n.id === `root-${slug}` || (n.project?.slug === slug && n.role === "stage"))
                .map((n) => n.id),
            );
            fitTo(ids, 80);
          }, 60);
        }
        return next;
      });
    },
    [model.nodes, fitTo],
  );

  // redraw wires when the visible set changes — after a frame so newly-mounted
  // stage nodes are measurable, and once more after fonts settle node heights.
  useEffect(() => {
    const r1 = requestAnimationFrame(drawWires);
    const t = setTimeout(drawWires, 120);
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t);
    };
  }, [drawWires]);

  // initial view: open focused on the welcome column (how-to + origin + about)
  // at native scale, so a first-time visitor lands oriented and reading crisp text.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      drawWires();
      fitTo(new Set(["howto", "origin", "about"]), 70);
    });
    const onResize = () => {
      drawWires();
      fitTo();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pan
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let down = false,
      sx = 0,
      sy = 0,
      ox = 0,
      oy = 0;
    const onDown = (e: PointerEvent) => {
      // any node (and any control) handles its own pointer — the board only
      // pans from the empty background, so dragging a card never moves the board
      if ((e.target as HTMLElement).closest(".node, a, button")) return;
      down = true;
      sx = e.clientX;
      sy = e.clientY;
      ox = view.current.tx;
      oy = view.current.ty;
      stage.classList.add("dragging");
      stage.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      view.current.tx = ox + (e.clientX - sx);
      view.current.ty = oy + (e.clientY - sy);
      applyView();
    };
    const onUp = () => {
      down = false;
      stage.classList.remove("dragging");
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      const cx = e.clientX - r.left,
        cy = e.clientY - r.top;
      // capped at 1× — you zoom OUT for overview, never past native (text stays crisp)
      const ns = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, view.current.s * (e.deltaY < 0 ? 1.1 : 0.9)));
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
    const ns = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, view.current.s * k));
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

  return (
    <div ref={stageRef} className="board-stage" aria-label="Portfolio board — drag to pan, scroll to zoom">
      <div ref={worldRef} className="board-world">
        <svg ref={svgRef} className="board-wires" />
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
            expanded={!!n.project && open.has(n.project.slug)}
            onToggle={toggle}
            onDragStart={onNodeDragStart}
          />
        ))}
      </div>

      {/* zone rail */}
      <div className="hud" style={{ left: 18, bottom: 18, display: "flex", gap: 7, flexWrap: "wrap", maxWidth: "60vw" }}>
        <button className="hud-btn" onClick={() => fitZone("all")}>◱ WHOLE BOARD</button>
        <button className="hud-btn" onClick={() => fitZone("work")}>◧ THE WORK</button>
        <button className="hud-btn" onClick={() => fitZone("art")}>◨ THE PLATES</button>
        <button className="hud-btn" onClick={resetLayout} title="Restore the default arrangement">↺ RESET LAYOUT</button>
      </div>
      {/* zoom — out only; 1× is native and crisp */}
      <div className="hud" style={{ right: 18, bottom: 18, display: "flex", flexDirection: "column", gap: 6 }}>
        <button className="hud-btn" style={{ width: 34, height: 34, fontSize: 16 }} onClick={() => zoomBy(1 / 0.82)} aria-label="Zoom in">+</button>
        <button className="hud-btn" style={{ width: 34, height: 34, fontSize: 16 }} onClick={() => zoomBy(0.82)} aria-label="Zoom out">−</button>
      </div>
    </div>
  );
}

