"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { coverOf, displayName, projectsIn, site, tracks, trackOf, type Project, type TrackId } from "@/content";
import { asset, srcSet } from "@/lib/asset";
import Split from "./Split";
import DataCard from "./DataCard";
import { TLink } from "./Transition";

type Line = { key: string; title: string; rest: string };
const idle: Line = { key: "idle", title: `${String(tracks.reduce((n, t) => n + projectsIn(t.id).length, 0))} works`, rest: " across three crafts." };

/** Interleave the crafts, then deal into columns with a rotating offset so no
 *  column fills with one craft. */
function deal(cols: number): Project[][] {
  const lists = (["art", "systems", "data"] as TrackId[]).map((id) => projectsIn(id));
  const order: Project[] = [];
  for (let i = 0; i < Math.max(...lists.map((l) => l.length)); i++) lists.forEach((l) => l[i] && order.push(l[i]));
  const out: Project[][] = Array.from({ length: cols }, () => []);
  order.forEach((p, i) => out[(i + Math.floor(i / cols)) % cols].push(p));
  return out;
}

function Tile({ p, copy }: { p: Project; copy?: boolean }) {
  const cover = coverOf(p);
  const t = trackOf(p);
  return (
    <TLink
      href={`/projects/${p.slug}/`}
      label={displayName(p.name)}
      className={`tile ${t === "art" ? "port" : "land"}`}
      data-t={t}
      data-s={p.slug}
      data-cursor="Open"
      prefetch={false}
      aria-hidden={copy || undefined}
      tabIndex={copy ? -1 : undefined}
    >
      {p.pipeline ? (
        <DataCard name={p.name} year={p.year} pipe={p.pipeline} />
      ) : cover ? (
        <img src={asset(cover.src)} srcSet={srcSet(cover.src)} sizes="(max-width: 520px) 50vw, (max-width: 900px) 33vw, 20vw" alt={copy ? "" : cover.alt} loading="lazy" decoding="async" draggable={false} />
      ) : null}
      <span className="lab">
        {displayName(p.name)}
        <span>{`${tracks.find((x) => x.id === t)!.word.replace("|", "")} · ${p.year}`}</span>
      </span>
    </TLink>
  );
}

/**
 * Landing: who on the left, every work on the right. The wall drifts in three
 * columns and slows under the pointer. Hover a craft to light its work; hover a
 * work to light its craft and read it in the line on the left.
 */
export default function Dossier() {
  const [ready, setReady] = useState(false);
  const [ncols, setNcols] = useState(3);
  const [reps, setReps] = useState(2);
  const [lit, setLit] = useState<TrackId | null>(null);
  const [rowOn, setRowOn] = useState<TrackId | null>(null);
  const [lines, setLines] = useState<{ old?: Line; cur: Line; n: number }>({ cur: idle, n: 0 });
  const wall = useRef<HTMLElement>(null);
  const me = useRef<HTMLElement>(null);
  const target = useRef(1);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const posRef = useRef<number[]>([]);
  const halt = useRef(false); // keyboard focus stops the wall at once, no ease
  const cols = useMemo(() => deal(ncols), [ncols]);

  const say = (l: Line) => setLines((s) => (s.cur.key === l.key ? s : { old: s.cur, cur: l, n: s.n + 1 }));

  // intro once fonts are in; two columns on phones
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => alive && requestAnimationFrame(() => setReady(true)));
    const mq = window.matchMedia("(max-width: 520px)");
    const fit = () => setNcols(mq.matches ? 2 : 3);
    fit();
    mq.addEventListener("change", fit);
    return () => {
      alive = false;
      mq.removeEventListener("change", fit);
    };
  }, []);

  // the left column is the whole first screen: reveal it on load, not on scroll
  // (the scroll reveal ignores the bottom edge, where the buttons sit)
  useEffect(() => {
    if (!ready || !me.current) return;
    me.current.querySelectorAll(".split, [data-fade]").forEach((el) => el.classList.add("in"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // stats count up from zero, keeping their format (16, 0.840); words (UE5) stay as they are
    const rafs: number[] = [];
    me.current.querySelectorAll<HTMLElement>("[data-v]").forEach((el, i) => {
      const v = el.dataset.v!;
      if (!/^\d+(\.\d+)?$/.test(v)) return;
      const dec = (v.split(".")[1] ?? "").length;
      const end = parseFloat(v);
      const t0 = performance.now() + 500;
      const step = (t: number) => {
        const k = Math.min(1, Math.max(0, (t - t0) / 1600));
        el.textContent = k < 1 ? (end * (1 - Math.pow(1 - k, 3))).toFixed(dec).padStart(dec ? 0 : v.length, "0") : v;
        if (k < 1) rafs[i] = requestAnimationFrame(step);
      };
      rafs[i] = requestAnimationFrame(step);
    });
    return () => rafs.forEach((id) => cancelAnimationFrame(id));
  }, [ready]);

  // drift: one rAF loop, columns at different speeds and directions, eased toward a target speed
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = wall.current!;
    const colEls = [...el.querySelectorAll<HTMLElement>(".wcol")];
    const speed = [0.35, -0.28, 0.42];
    const pos = (posRef.current = colEls.map(() => 0));
    // one set = the distance from a tile to its first copy; read live, so resizes never leave a stale wrap point
    const setH = (i: number) => {
      const c = colEls[i], n = cols[i].length;
      const t0 = c.children[0] as HTMLElement | undefined, t1 = c.children[n] as HTMLElement | undefined;
      return t0 && t1 ? t1.offsetTop - t0.offsetTop : c.scrollHeight / reps;
    };
    // enough copies to cover the wall at its current height, re-checked whenever the wall resizes
    // tiles are at least ~100 px tall; anything less means layout isn't ready yet (e.g. mid page transition)
    const ready = () => colEls.every((_, i) => setH(i) > 100);
    const fill = () => {
      if (!ready()) return;
      const need = Math.min(8, Math.max(...colEls.map((_, i) => Math.ceil(el.clientHeight / setH(i)) + 1)));
      if (need > reps) setReps(need);
    };
    fill();
    const ro = new ResizeObserver(fill);
    ro.observe(el);
    let gain = 1, last = performance.now(), raf = 0, onScreen = true;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(el);
    let frames = 0;
    const loop = (t: number) => {
      const dt = Math.min(48, t - last) / 16.67;
      last = t;
      if (++frames % 30 === 0) fill(); // catches layout that settles without a resize (page transitions)
      const goal = pausedRef.current ? 0 : target.current;
      if (halt.current) {
        gain = 0;
        halt.current = false;
      }
      gain += (goal - gain) * 0.06;
      if (goal === 0 && gain < 0.003) gain = 0; // stop means stopped, not creeping
      if (onScreen && gain !== 0)
        colEls.forEach((c, i) => {
          const h = setH(i);
          if (h <= 100) return; // not laid out yet
          pos[i] = (pos[i] - speed[i % 3] * gain * dt) % h;
          if (pos[i] > 0) pos[i] -= h;
          c.style.transform = `translate3d(0,${pos[i]}px,0)`;
        });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [ncols, reps, cols]);

  // pointer and keyboard share these: a craft lights its work, a work lights its craft
  const enterCraft = (id: TrackId, word: string, n: number) => {
    setLit(id);
    setRowOn(id);
    target.current = 0.25;
    say({ key: id, title: word, rest: ` · ${n} works, lit on the wall.` });
  };
  const leaveCraft = () => {
    setLit(null);
    setRowOn(null);
    target.current = 1;
  };
  const showTile = (from: EventTarget) => {
    const el = (from as Element).closest<HTMLElement>(".tile");
    if (!el) return;
    const p = projectsIn(el.dataset.t as TrackId).find((x) => x.slug === el.dataset.s);
    if (!p) return;
    setRowOn(trackOf(p));
    say({ key: p.slug, title: displayName(p.name), rest: ` · ${p.tagline}` });
  };

  return (
    <main className={`dossier ${ready ? "ready" : ""}`}>
      <section ref={me} className="me">
        {/* contact sits at the top, outside any reveal: visible at every window size, even without JS */}
        <header className="me-top">
          <span className="name">
            {site.name} <span>/ Hyderabad</span>
          </span>
          <nav aria-label="Contact">
            <a className="pill status" href={`mailto:${site.email}`} data-magnetic>
              <span className="dot" /> {site.status}
            </a>
            <TLink href="/resume/" label="Resume" className="pill" data-magnetic>
              Resume
            </TLink>
            <a className="pill on" href={`mailto:${site.email}`} data-magnetic>
              Email me
            </a>
          </nav>
        </header>
        <Split as="h1" text={`${site.name.split(" ")[0]}|${site.name.split(" ").slice(1).join(" ")}`} className="cap" />
        <p className="lede" data-fade="" style={{ ["--d" as string]: "350ms" }}>
          {`${site.lede[0]} `}
          <em>{site.lede[1]}</em>
        </p>
        <p className="bio" data-fade="" style={{ ["--d" as string]: "450ms" }}>
          {site.bio}
        </p>
        <div className="now" data-fade="" style={{ ["--d" as string]: "550ms" }} aria-hidden="true">
          {lines.old ? (
            <div key={`o${lines.n}`} className="old">
              <b>{lines.old.title}</b>
              <span>{lines.old.rest}</span>
            </div>
          ) : null}
          <div key={`c${lines.n}`} className={lines.n ? "new" : undefined}>
            <b>{lines.cur.title}</b>
            <span>{lines.cur.rest}</span>
          </div>
        </div>
        <nav className="crafts" aria-label="Crafts" data-fade="" style={{ ["--d" as string]: "650ms" }}>
          {tracks.map((t) => {
            const n = projectsIn(t.id).length;
            const stat = t.stats[1];
            return (
              <TLink
                key={t.id}
                href={`/${t.id}/`}
                label={t.word.replace("|", "")}
                className={`craft ${rowOn === t.id ? "on" : ""}`}
                data-cursor="Enter"
                onPointerEnter={() => enterCraft(t.id, t.word.replace("|", ""), n)}
                onPointerLeave={leaveCraft}
                onFocus={() => enterCraft(t.id, t.word.replace("|", ""), n)}
                onBlur={leaveCraft}
              >
                <span className="n">{t.num}</span>
                <span className="w">
                  {t.word.replace("|", "")}
                  <span className="r">{`${t.role} · ${String(n).padStart(2, "0")} works`}</span>
                </span>
                <span className="s">
                  <b data-v={stat.value}>{stat.value}</b>
                  {stat.label}
                </span>
              </TLink>
            );
          })}
        </nav>
      </section>

      <section
        ref={wall}
        className="wall"
        data-lit={lit ?? undefined}
        aria-label="All work"
        onPointerEnter={() => (target.current = 0.08)}
        onPointerLeave={() => {
          target.current = 1;
          setRowOn(null);
        }}
        onPointerOver={(e) => showTile(e.target)}
        onFocus={(e) => {
          const tile = (e.target as Element).closest<HTMLElement>(".tile");
          if (!tile) return;
          target.current = 0;
          halt.current = true;
          showTile(tile);
          // the wall clips instead of scrolling, so move the tile's column to show it
          const col = tile.parentElement as HTMLElement, i = [...wall.current!.querySelectorAll(".wcol")].indexOf(col);
          const pos = posRef.current;
          if (i < 0 || pos[i] === undefined) return;
          const top = tile.offsetTop + pos[i], wallH = wall.current!.clientHeight;
          if (top < 16 || top + tile.offsetHeight > wallH - 16) {
            pos[i] = Math.min(0, 16 - tile.offsetTop); // stays in the wrap range, so the loop never swaps it for its copy
            col.style.transform = `translate3d(0,${pos[i]}px,0)`;
          }
        }}
        onBlur={() => {
          target.current = 1;
          setRowOn(null);
        }}
      >
        {cols.map((c, i) => (
          <div key={`${ncols}-${i}`} className="wcolwrap" style={{ ["--c" as string]: i }}>
            <div className="wcol">
              {Array.from({ length: reps }, (_, k) => c.map((p) => <Tile key={`${p.slug}-${k}`} p={p} copy={k > 0} />))}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="wall-pause"
          aria-pressed={paused}
          aria-label="Pause the moving wall"
          onClick={() => {
            pausedRef.current = !paused;
            setPaused(!paused);
          }}
        >
          {paused ? (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 5.5h3v13h-3zM13.5 5.5h3v13h-3z" fill="currentColor" /></svg>
          )}
        </button>
      </section>
    </main>
  );
}
