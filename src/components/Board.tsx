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
  expanded,
  onToggle,
}: {
  n: PlacedNode;
  expanded: boolean;
  onToggle: (slug: string) => void;
}) {
  const base: React.CSSProperties = { left: n.x, top: n.y, width: n.w };
  const nid = { "data-node": n.id } as Record<string, string>;

  if (n.role === "origin") {
    return (
      <div className="node n-origin" style={base} {...nid}>
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

  if (n.role === "contact") {
    return (
      <div className="node k-end" style={base} {...nid}>
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
      <div className="node n-art" style={base} {...nid}>
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
        style={{ ...base, height: 112 }}
        {...nid}
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
      <div
        className="node n-proj"
        style={base}
        {...nid}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => onToggle(p.slug)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(p.slug);
          }
        }}
      >
        <div className="n-kicker kicker">
          <span className="dot" />
          {p.num} · {p.category}
        </div>
        <div className="n-title">{p.name}</div>
        <div className="n-body">{p.description}</div>
        {p.metric && (
          <div className="n-met">
            <em>{p.metric.value}</em>
          </div>
        )}
        <div className="n-open">{expanded ? "▾ TRACING THE BUILD" : "▸ CLICK TO TRACE THE BUILD"}</div>
      </div>
    );
  }

  // stage node (only rendered when its project is expanded)
  if (n.role === "stage" && n.stage) {
    const s: Stage = n.stage;
    const endCls = s.kind === "end" ? `k-end s-${n.project?.status ?? ""}` : `k-${s.kind}`;
    return (
      <div className={`node ${endCls}`} style={base} {...nid}>
        <div className="n-kicker kicker">
          <span className="dot" />
          {s.label}
        </div>
        <div className="n-title">{s.title}</div>
        {s.body && <div className="n-body">{s.body}</div>}
        {s.decisions && (
          <div className="n-body" style={{ marginTop: 6 }}>
            {s.decisions.slice(0, 3).map((d, i) => (
              <div key={i} style={{ marginTop: i ? 4 : 0 }}>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--acc)" }}>
                  {d.choice}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default function Board() {
  const model = useMemo(() => buildBoard([...projects]), []);
  const [open, setOpen] = useState<Set<string>>(new Set(["protec"])); // protec pre-opened
  const worldRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

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
        x0 = Math.min(x0, n.x);
        y0 = Math.min(y0, n.y);
        x1 = Math.max(x1, n.x + n.w);
        y1 = Math.max(y1, n.y + h);
      }
      if (!isFinite(x0)) return;
      const bw = x1 - x0 + pad * 2;
      const bh = y1 - y0 + pad * 2;
      const r = stage.getBoundingClientRect();
      const s = Math.min(1.4, Math.max(0.4, Math.min(r.width / bw, r.height / bh)));
      view.current = {
        s,
        tx: (r.width - (x0 + x1) * s) / 2,
        ty: (r.height - (y0 + y1) * s) / 2,
      };
      applyView();
    },
    [visibleNodes, applyView],
  );

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

  // initial fit + on resize
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      drawWires();
      fitTo();
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
      if ((e.target as HTMLElement).closest(".n-proj, .n-plate, a, button")) return;
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
      const ns = Math.min(1.6, Math.max(0.35, view.current.s * (e.deltaY < 0 ? 1.1 : 0.9)));
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
    const ns = Math.min(1.6, Math.max(0.35, view.current.s * k));
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
        {model.zones.map((z) => (
          <div key={z.label} className="zone-title" style={{ left: z.x, top: z.y }}>
            {z.label}
          </div>
        ))}
        {visibleNodes.map((n) => (
          <Node key={n.id} n={n} expanded={!!n.project && open.has(n.project.slug)} onToggle={toggle} />
        ))}
      </div>

      {/* zone rail */}
      <div className="hud" style={{ left: 18, bottom: 18, display: "flex", gap: 7 }}>
        <button className="hud-btn" onClick={() => fitZone("all")}>◱ WHOLE BOARD</button>
        <button className="hud-btn" onClick={() => fitZone("work")}>◧ THE WORK</button>
        <button className="hud-btn" onClick={() => fitZone("art")}>◨ THE PLATES</button>
      </div>
      {/* zoom */}
      <div className="hud" style={{ right: 18, bottom: 18, display: "flex", flexDirection: "column", gap: 6 }}>
        <button className="hud-btn" style={{ width: 34, height: 34, fontSize: 16 }} onClick={() => zoomBy(1.18)} aria-label="Zoom in">+</button>
        <button className="hud-btn" style={{ width: 34, height: 34, fontSize: 16 }} onClick={() => zoomBy(0.85)} aria-label="Zoom out">−</button>
      </div>
    </div>
  );
}

