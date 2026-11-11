import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject, site, trackOf, laneLabel, nameOf, coverOf } from "@/content";
import { asset, srcSet } from "@/lib/asset";
import Gallery from "@/components/Gallery";
import YouTubeFigure from "@/components/YouTubeFigure";
import VideoFigure from "@/components/VideoFigure";
import DataCard from "@/components/DataCard";
import { ProjectJsonLd } from "./project-jsonld";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return { title: "Not found" };
  const title = `${nameOf(p)} — ${site.name}`;
  const ogImage = p.gallery[0]?.src ?? "/og.png";
  return {
    title,
    description: p.summary,
    alternates: { canonical: `/projects/${p.slug}/` },
    openGraph: { type: "article", url: `/projects/${p.slug}/`, title, description: p.summary, images: [{ url: ogImage }] },
    twitter: { card: "summary_large_image", title, description: p.summary, images: [ogImage] },
  };
}

const STATUS: Record<string, string> = { public: "Public repo", private: "Private", wip: "In development", live: "Live" };
const ICON = {
  out: <svg className="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>,
  back: <svg className="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3M7 4 3 8l4 4" /></svg>,
  next: <svg className="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>,
};

/** A case study, open in its lane's column: claim, proof, the build, then every picture and reel. */
export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const p = getProject((await params).slug);
  if (!p) notFound();

  const lane = trackOf(p);
  const sibs = projects.filter((x) => trackOf(x) === lane);
  const i = sibs.indexOf(p);
  const prev = sibs[(i - 1 + sibs.length) % sibs.length];
  const next = sibs[(i + 1) % sibs.length];
  const title = nameOf(p);
  const cover = p.cover ?? coverOf(p);
  const rest = p.gallery[0] ? p.gallery.slice(1) : p.gallery;
  const proof = p.pipeline?.stats ?? (p.metric ? [{ value: p.metric.value, label: p.metric.label }] : []);
  const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="paper">
      <ProjectJsonLd p={p} />
      <Link className="up" href={`/${lane}/`}>{ICON.back}All {laneLabel[lane]}</Link>
      <article className="case">
        <h1>{title}</h1>
        <p className="tag">{p.tagline}</p>
        <p className="tagrow meta">
          <span>{laneLabel[lane]}</span><span>{p.year}</span><span>{STATUS[p.status] ?? p.status}</span><span>{p.stack.join(", ")}</span>
        </p>
        {(p.href || p.repo || p.caseStudy) && (
          <div className="acts">
            {p.href && <a className="btn on" href={p.href} target="_blank" rel="noopener noreferrer">{label(p.hrefLabel ?? "view on GitHub")}{ICON.out}</a>}
            {p.repo && <a className="btn" href={p.repo} target="_blank" rel="noopener noreferrer">View source{ICON.out}</a>}
            {p.caseStudy && <a className="btn" href={asset(p.caseStudy)} target="_blank" rel="noopener">Case study PDF{ICON.out}</a>}
          </div>
        )}
        {proof.length > 0 && (
          <dl className="proof">
            {proof.map((s) => (
              <div key={s.label}><dt className="num">{s.value}</dt><dd>{s.label}</dd></div>
            ))}
          </dl>
        )}
        {cover ? (
          <figure className="cover"><img src={asset(cover.src)} srcSet={srcSet(cover.src)} sizes="(max-width: 999px) 100vw, 60vw" alt={cover.alt} fetchPriority="high" /></figure>
        ) : p.pipeline ? (
          <figure className="cover"><DataCard name={p.name} year={p.year} pipe={p.pipeline} /></figure>
        ) : null}
        <p className="sum">{p.summary}</p>
        <div className="secs">
          {p.sections.map((s) => (
            <section key={s.heading} className="sec"><h3>{s.heading}</h3><p>{s.body}</p></section>
          ))}
        </div>
        {p.decisions && p.decisions.length > 0 && (
          <section className="blk">
            <h3>Decisions</h3>
            <div className="dec">
              {p.decisions.map((d) => (
                <div key={d.choice}><b>{d.choice}</b><span>{d.reason}</span></div>
              ))}
            </div>
          </section>
        )}
        <section className="blk">
          <h3>Facts</h3>
          <dl className="facts">
            {p.facts.map((f) => (
              <div key={f.label}><dt>{f.label}</dt><dd className={p.specAccent === f.label ? "hot" : undefined}>{f.value}</dd></div>
            ))}
          </dl>
        </section>
        {(p.youtube || (p.reels && p.reels.length > 0) || rest.length > 0) && (
          <section className="blk">
            <h3>Pictures and reels</h3>
            <div className="media">
              {p.youtube && <YouTubeFigure videoId={p.youtube} poster={p.gallery[0]?.src ?? ""} title={`${title}, full piece`} caption="The full piece on YouTube. Nothing loads from YouTube until you press play." />}
              {p.reels && p.reels.length > 0 && (
                <div className="reels">
                  {p.reels.map((r) => <VideoFigure key={r.src} src={r.src} poster={r.poster} portrait={r.portrait} title={`${title} reel`} caption={r.caption} />)}
                </div>
              )}
              {rest.length > 0 && <Gallery shots={rest} />}
            </div>
          </section>
        )}
        {sibs.length > 1 && (
          <nav className="pn" aria-label={`More in ${laneLabel[lane]}`}>
            <Link href={`/projects/${prev.slug}/`}>{ICON.back}{nameOf(prev)}</Link>
            <Link href={`/projects/${next.slug}/`}>{nameOf(next)}{ICON.next}</Link>
          </nav>
        )}
      </article>
    </div>
  );
}
