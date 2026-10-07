"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { coverOf, displayName, projectsIn, site, tracks, trackOf, type Project, type TrackId } from "@/content";
import { asset, srcSet } from "@/lib/asset";
import Split from "./Split";
import DataCard from "./DataCard";
import { TLink } from "./Transition";

type Line = { key: string; title: string; rest: string };
const idle: Line = { key: "idle", title: `${String(tracks.reduce((n, t) => n + projectsIn(t.id).length, 0))} works`, rest: " across three crafts. Hover anything." };

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
        <img src={asset(cover.src)} srcSet={srcSet(cover.src)} sizes="(max-width: 900px) 50vw, 20vw" alt={copy ? "" : cover.alt} loading="lazy" decoding="async" draggable={false} />
      ) : null}
      <span className="lab">
        {displayName(p.name)}
        <span>{`${tracks.find((x) => x.id === t)!.word} · ${p.year}`}</span>
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
  const [lit, setLit] = useState<TrackId | null>(null);
  const [rowOn, setRowOn] = useState<TrackId | null>(null);
  const [lines, setLines] = useState<{ old?: Line; cur: Line; n: number }>({ cur: idle, n: 0 });
  const [clock, setClock] = useState("");
  const wall = useRef<HTMLElement>(null);
  const me = useRef<HTMLElement>(null);
  const target = useRef(1);
  const cols = useMemo(() => deal(ncols), [ncols]);

  const say = (l: Line) => setLines((s) => (s.cur.key === l.key ? s : { old: s.cur, cur: l, n: s.n + 1 }));

  // intro once fonts are in; two columns on phones; Hyderabad time
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => alive && requestAnimationFrame(() => setReady(true)));
    const mq = window.matchMedia("(max-width: 520px)");
    const fit = () => setNcols(mq.matches ? 2 : 3);
    fit();
    mq.addEventListener("change", fit);
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
    const tick = () => setClock(`${fmt.format(new Date())} IST`);
    tick();
    const id = window.setInterval(tick, 30000);
    return () => {
      alive = false;
      mq.removeEventListener("change", fit);
      window.clearInterval(id);
    };
  }, []);

  // the left column is the whole first screen: reveal it on load, not on scroll
  // (the scroll reveal ignores the bottom edge, where the buttons sit)
  useEffect(() => {
    if (!ready || !me.current) return;
    me.current.querySelectorAll(".split, [data-fade]").forEach((el) => el.classList.add("in"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // stats count up from zero, keeping their format (16, 0.840); words (UE5) stay as they are
    me.current.querySelectorAll<HTMLElement>("[data-v]").forEach((el) => {
      const v = el.dataset.v!;
      if (!/^\d+(\.\d+)?$/.test(v)) return;
      const dec = (v.split(".")[1] ?? "").length;
      const end = parseFloat(v);
      const t0 = performance.now() + 500;
      const step = (t: number) => {
        const k = Math.min(1, Math.max(0, (t - t0) / 1600));
        el.textContent = k < 1 ? (end * (1 - Math.pow(1 - k, 3))).toFixed(dec).padStart(dec ? 0 : v.length, "0") : v;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, [ready]);

  // drift: one rAF loop, columns at different speeds and directions, eased toward a target speed
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = wall.current!;
    const colEls = [...el.querySelectorAll<HTMLElement>(".wcol")];
    const speed = [0.35, -0.28, 0.42];
    const pos = colEls.map(() => 0);
    let gain = 1, last = performance.now(), raf = 0, onScreen = true;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(el);
    const loop = (t: number) => {
      const dt = Math.min(48, t - last) / 16.67;
      last = t;
      gain += (target.current - gain) * 0.06;
      if (onScreen)
        colEls.forEach((c, i) => {
          const half = c.scrollHeight / 2;
          pos[i] = (pos[i] - speed[i % 3] * gain * dt) % half;
          if (pos[i] > 0) pos[i] -= half;
          c.style.transform = `translate3d(0,${pos[i]}px,0)`;
        });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [ncols]);

  const overTile = (e: React.PointerEvent) => {
    const el = (e.target as Element).closest<HTMLElement>(".tile");
    if (!el) return;
    const p = projectsIn(el.dataset.t as TrackId).find((x) => x.slug === el.dataset.s);
    if (!p) return;
    setRowOn(trackOf(p));
    say({ key: p.slug, title: displayName(p.name), rest: ` · ${p.tagline}` });
  };

  return (
    <div className={`dossier ${ready ? "ready" : ""}`}>
      <section ref={me} className="me">
        <div className="me-top" data-fade="">
          <span className="name">
            {site.name} <span>/ Hyderabad</span>
          </span>
          <span className="clock">{clock}</span>
        </div>
        <Split as="h1" text={`${site.name.split(" ")[0]}|${site.name.split(" ").slice(1).join(" ")}`} className="cap" />
        <p className="lede" data-fade="" style={{ ["--d" as string]: "350ms" }}>
          {`${site.lede[0]} `}
          <em>{site.lede[1]}</em>
        </p>
        <p className="bio" data-fade="" style={{ ["--d" as string]: "450ms" }}>
          {site.bio}
        </p>
        <div className="now" data-fade="" style={{ ["--d" as string]: "550ms" }} aria-live="polite">
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
        <nav className="crafts" data-fade="" style={{ ["--d" as string]: "650ms" }}>
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
                onPointerEnter={() => {
                  setLit(t.id);
                  setRowOn(t.id);
                  target.current = 0.25;
                  say({ key: t.id, title: t.word.replace("|", ""), rest: ` · ${n} works, lit on the wall.` });
                }}
                onPointerLeave={() => {
                  setLit(null);
                  setRowOn(null);
                  target.current = 1;
                }}
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
        <div className="cta" data-fade="" style={{ ["--d" as string]: "800ms" }}>
          <a className="pill on" href={`mailto:${site.email}`} data-magnetic>
            Email me
          </a>
          <TLink href="/resume/" label="Resume" className="pill" data-magnetic>
            Resume
          </TLink>
          <a className="pill" href={`mailto:${site.email}`} data-magnetic>
            <span className="dot" /> {site.status}
          </a>
        </div>
      </section>

      <section
        ref={wall}
        className={`wall ${lit ? "f" : ""}`}
        data-lit={lit ?? undefined}
        aria-label="All work"
        onPointerEnter={() => (target.current = 0.08)}
        onPointerLeave={() => {
          target.current = 1;
          setRowOn(null);
        }}
        onPointerOver={overTile}
      >
        {cols.map((c, i) => (
          <div key={`${ncols}-${i}`} className="wcolwrap" style={{ ["--c" as string]: i }}>
            <div className="wcol">
              {c.map((p) => (
                <Tile key={p.slug} p={p} />
              ))}
              {c.map((p) => (
                <Tile key={`${p.slug}-copy`} p={p} copy />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
