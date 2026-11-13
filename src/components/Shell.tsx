"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { asset, srcSet } from "@/lib/asset";
import CopyEmail from "@/components/CopyEmail";

export type Face = {
  id: string;
  label: string;
  sub: string;
  role?: string;
  names?: string[];
  stats?: { value: string; label: string }[];
  lede?: [string, string];
  location?: string;
  status?: string;
  portrait?: null | { src: string; alt: string };
};
type Scene = { id: string; label: string; src: string; slug: string; name: string };

const OPEN = 5; // the open column is five times a closed one
const CYCLE_MS = 20000; // the dial moves on by itself every 20 seconds (Daman, 2026-11-11)

// Time of day in Hyderabad decides the first scene. Runs inline before paint, and again in React.
const IST = `(function(){var d=new Date(),h=(d.getUTCHours()+5.5+d.getUTCMinutes()/60)%24;return h>=6&&h<16?"day":h>=16&&h<18.5?"golden":h>=18.5&&h<21?"evening":"night"})()`;
const istNow = (): string => new Function(`return ${IST}`)();

export function Portrait({ portrait }: { portrait?: Face["portrait"] }) {
  if (portrait) return <div className="portrait"><img src={asset(portrait.src)} alt={portrait.alt} /></div>;
  return (
    <div className="portrait" role="img" aria-label="Portrait to come">
      <svg viewBox="0 0 100 125" aria-hidden="true"><circle cx="50" cy="46" r="19" /><path d="M14 125c2-27 17-41 36-41s34 14 36 41" /></svg>
      <span>Portrait to come</span>
    </div>
  );
}

/** The site frame: the scene, the top line with the dial, and the five columns. The page is the open column. */
export default function Shell({ faces, laneOfSlug, scenes, email, updated, children }: { faces: Face[]; laneOfSlug: Record<string, string>; scenes: Scene[]; email: string; updated: string; children: React.ReactNode }) {
  const path = usePathname() ?? "/";
  const parts = path.split("/").filter(Boolean);
  const col = parts[0] === "projects" ? laneOfSlug[parts[1]] ?? "you" : faces.some((f) => f.id === parts[0]) ? parts[0] : "you";

  const [t, setT] = useState("golden");
  const ga = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const first = useRef(true);

  // the open column's paper is laid out at its final width, so text never reflows while the columns move
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const size = () => el.style.setProperty("--ow", `${(el.clientWidth * OPEN) / (OPEN + faces.length - 1)}px`);
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    return () => ro.disconnect();
  }, [faces.length]);

  const cycle = useCallback(() => {
    clearInterval(timer.current);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = setInterval(() => {
      if (document.hidden) return;
      setT((cur) => scenes[(scenes.findIndex((s) => s.id === cur) + 1) % scenes.length].id);
    }, CYCLE_MS);
  }, [scenes]);

  useEffect(() => {
    setT(ga.current?.dataset.t || istNow());
    cycle();
    return () => clearInterval(timer.current);
  }, [cycle]);

  // on phones the columns stack: bring the opened one into view (not on the first load)
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!matchMedia("(min-width: 1000px)").matches) document.querySelector(".co-col.open")?.scrollIntoView({ block: "start" });
  }, [path]);

  const scene = scenes.find((s) => s.id === t) ?? scenes[1];
  const hrefOf = (id: string) => (id === "you" ? "/" : `/${id}/`);

  return (
    <div className="ga" data-t={t} ref={ga} suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: `document.currentScript.parentElement.dataset.t=${IST};` }} />
      <div className="ga-sky" aria-hidden="true">
        {scenes.map((s) => (
          <img key={s.id} src={asset(s.src)} srcSet={srcSet(s.src)} sizes="100vw" alt="" />
        ))}
      </div>
      <div className="ga-grade" />
      <header className="ga-top">
        <Link className="ga-name" href="/">Daman Reddy</Link>
        <nav aria-label="Site">
          <Link href="/#featured" aria-current={col !== "you" ? "page" : undefined}>Work</Link>
          <Link href="/" aria-current={path === "/" ? "page" : undefined}>About</Link>
          <Link href="/resume/" aria-current={path.startsWith("/resume") ? "page" : undefined}>Resume</Link>
        </nav>
        <a className="ga-cta" href={`mailto:${email}`}>Email me</a>
        <div className="ga-dial">
          <svg viewBox="0 0 92 40" aria-hidden="true"><path className="arc" d="M6 38A40 40 0 0 1 86 38" /><path className="hz" d="M0 38h92" /><circle className="moon" cx="30" cy="8" r="4.5" /><circle className="sun" r="5" /></svg>
          <div className="ga-times" role="group" aria-label="Time of day">
            {scenes.map((s) => (
              <button key={s.id} aria-pressed={s.id === t} onClick={() => { setT(s.id); cycle(); }}>{s.label}</button>
            ))}
          </div>
          <p className="ga-credit">
            Scene: <Link href={`/projects/${scene.slug}/`}>{scene.name}</Link>
          </p>
        </div>
      </header>
      <main className="co-strip" ref={strip} style={{ gridTemplateColumns: faces.map((f) => `minmax(0,${f.id === col ? OPEN : 1}fr)`).join(" ") }}>
        {faces.map((f) => {
          const open = f.id === col;
          return (
            <section key={f.id} className={`co-col${open ? " open" : ""}`} data-col={f.id} aria-label={f.label}>
              <Link className="co-face" href={hrefOf(f.id)} aria-current={open ? "page" : undefined} tabIndex={open ? -1 : undefined}>
                {f.id === "you" ? (
                  <>
                    <h2>{f.label}</h2>
                    <span className="n">{f.sub}</span>
                    {f.lede && <p className="lede hide-m">{f.lede.join(" ")}</p>}
                    <span className="names hide-m"><span>{f.location}</span><span>{f.status}</span></span>
                    <div className="hide-m" style={{ marginTop: "auto" }}><Portrait portrait={f.portrait} /></div>
                  </>
                ) : (
                  <>
                    <h2>{f.label}</h2>
                    <span className="n num">{f.sub}</span>
                    <span className="role hide-m">{f.role}</span>
                    <span className="names hide-m">{f.names?.map((n) => <span key={n}>{n}</span>)}</span>
                    <ul className="hide-m">
                      {f.stats?.map((s) => (
                        <li key={s.label}><b className="num">{s.value}</b><span>{s.label}</span></li>
                      ))}
                    </ul>
                  </>
                )}
              </Link>
              {open && (
                <div className="co-body" key={path} tabIndex={-1}>
                  {children}
                  <footer className="foot">
                    <nav aria-label="Lanes">
                      {faces.filter((x) => x.id !== "you").map((x) => <Link key={x.id} href={hrefOf(x.id)}>{x.label}</Link>)}
                      <Link href="/resume/">Resume</Link>
                      <Link href="/privacy/">Privacy</Link>
                    </nav>
                    <nav aria-label="Contact">
                      <a href={`mailto:${email}`}>{email}</a>
                      <CopyEmail email={email} className="copy" />
                      <a href="https://github.com/damanjz">GitHub</a>
                      <a href="https://www.artstation.com/damanpsd">ArtStation</a>
                      <a href="https://www.linkedin.com/in/daman-reddy">LinkedIn</a>
                    </nav>
                    <p>Built with Next.js and exported as static files to GitHub Pages. Last updated {updated}.</p>
                    <p>© 2026 Daman Reddy · Hyderabad · No cookies, no analytics, no trackers.</p>
                  </footer>
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}
