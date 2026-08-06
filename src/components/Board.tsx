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
          <li><b>Grab a card&apos;s top strip</b> to move it · body text selects</li>
          <li><b>Shift-drag</b> a box to select many · then drag them together</li>
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
        <div className="n-kicker kicker n-drag">
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
        <div className="n-kicker kicker n-drag">
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
  // marquee multi-select: the set of selected node ids + the live marquee rect
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
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
  // refs so the once-bound pointer handlers always see current nodes/positions
  const visibleNodesRef = useRef(visibleNodes);
  visibleNodesRef.current = visibleNodes;
  const posOfRef = useRef(posOf);
  posOfRef.current = posOf;

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

  // ---- node drag: move a single card, but only past a movement threshold so
  //      text stays selectable and clicks still work. The card is grabbed by
  //      its DRAG STRIP (the kicker/handle row); the body allows text select. ─
  const DRAG_THRESHOLD = 5; // px before a press becomes a drag
  const dragState = useRef<
    | {
        id: string; sx: number; sy: number; ox: number; oy: number;
        active: boolean; pointerId: number; captureEl: HTMLElement;
        group: string[]; starts: Record<string, { x: number; y: number }>;
      }
    | null
  >(null);
  const onNodeDragStart = useCallback(
    (e: React.PointerEvent, id: string) => {
      // links, buttons, and selectable body text handle their own pointer;
      // dragging is initiated only from the card's handle strip (.n-drag)
      const t = e.target as HTMLElement;
      if (t.closest("a, button")) return;
      if (!t.closest(".n-drag")) return; // body/text is NOT a drag zone → selectable
      const node = model.nodes.find((n) => n.id === id);
      if (!node) return;
      const start = pos[id] ?? { x: node.x, y: node.y };
      // if this node is part of a marquee selection, drag the WHOLE group
      const sel = selectedRef.current;
      const groupIds = sel.has(id) ? [...sel] : [id];
      const starts: Record<string, { x: number; y: number }> = {};
      for (const gid of groupIds) {
        const gn = model.nodes.find((n) => n.id === gid);
        if (gn) starts[gid] = pos[gid] ?? { x: gn.x, y: gn.y };
      }
      dragState.current = {
        id, sx: e.clientX, sy: e.clientY, ox: start.x, oy: start.y,
        active: false, pointerId: e.pointerId, captureEl: e.currentTarget as HTMLElement,
        group: groupIds, starts,
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
      // move every node in the drag group by the same delta
      for (const gid of d.group) {
        const st = d.starts[gid];
        if (!st) continue;
        const gel = worldRef.current?.querySelector<HTMLElement>(`[data-node="${gid}"]`);
        if (gel) {
          gel.style.left = `${st.x + dx}px`;
          gel.style.top = `${st.y + dy}px`;
        }
      }
      requestAnimationFrame(() => drawWiresRef.current?.());
    };
    const onUp = () => {
      const d = dragState.current;
      dragState.current = null;
      if (!d || !d.active) return;
      setPos((prev) => {
        const next = { ...prev };
        for (const gid of d.group) {
          const gel = worldRef.current?.querySelector<HTMLElement>(`[data-node="${gid}"]`);
          if (gel) next[gid] = { x: parseFloat(gel.style.left), y: parseFloat(gel.style.top) };
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
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest(".node, a, button")) return;
      sx = e.clientX;
      sy = e.clientY;
      if (e.shiftKey) {
        // Shift + drag on empty = rubber-band marquee select
        mode = "marquee";
        const w = toWorld(e.clientX, e.clientY);
        mwx = w.x;
        mwy = w.y;
        setMarquee({ x: mwx, y: mwy, w: 0, h: 0 });
      } else {
        // plain drag on empty = pan; a plain click also clears any selection
        mode = "pan";
        ox = view.current.tx;
        oy = view.current.ty;
        stage.classList.add("dragging");
      }
      stage.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (mode === "pan") {
        view.current.tx = ox + (e.clientX - sx);
        view.current.ty = oy + (e.clientY - sy);
        applyView();
      } else if (mode === "marquee") {
        const w = toWorld(e.clientX, e.clientY);
        const x = Math.min(mwx, w.x), y = Math.min(mwy, w.y);
        const bw = Math.abs(w.x - mwx), bh = Math.abs(w.y - mwy);
        setMarquee({ x, y, w: bw, h: bh });
        // live-select nodes whose box intersects the marquee
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
    const onUp = () => {
      if (mode === "pan") {
        // a click that didn't drag clears the selection
        if (Math.abs(view.current.tx - ox) + Math.abs(view.current.ty - oy) < 3) setSelected(new Set());
      }
      if (mode === "marquee") setMarquee(null);
      mode = "none";
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
      const p = posOf(node);
      const el = world?.querySelector<HTMLElement>(`[data-node="${id}"]`);
      const h = el?.offsetHeight ?? 120;
      x0 = Math.min(x0, p.x);
      y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x + node.w);
      y1 = Math.max(y1, p.y + h);
    }
    if (!isFinite(x0)) return { x: b.x, y: b.y, w: b.w, h: b.h };
    const padX = 24, padTop = 34, padBottom = 22;
    return { x: x0 - padX, y: y0 - padTop, w: x1 - x0 + padX * 2, h: y1 - y0 + padTop + padBottom };
  };

  return (
    <div ref={stageRef} className="board-stage" aria-label="Portfolio board — drag to pan, scroll to zoom">
      <div ref={worldRef} className="board-world">
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
            expanded={!!n.project && open.has(n.project.slug)}
            selected={selected.has(n.id)}
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

