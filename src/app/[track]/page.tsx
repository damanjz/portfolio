import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tracks, getTrack, projectsIn, site, ethics, laneLabel, nameOf, shortOf, coverOf, type TrackId } from "@/content";
import { asset } from "@/lib/asset";
import { srcSet } from "@/lib/srcset";
import DataCard from "@/components/DataCard";

type Params = { track: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return tracks.map((t) => ({ track: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const t = getTrack((await params).track);
  if (!t) return { title: "Not found" };
  const title = `${laneLabel[t.id]}: ${t.role} | ${site.name}`;
  const description = `${t.intro} ${t.introEm}`;
  return {
    title,
    description,
    alternates: { canonical: `/${t.id}/` },
    openGraph: { type: "website", url: `/${t.id}/`, title, description, images: [{ url: t.cover }] },
    twitter: { card: "summary_large_image", title, description, images: [t.cover] },
  };
}

/** A lane, open: what it is, its numbers, every project as a row, and how the work is done. */
export default async function LanePage({ params }: { params: Promise<Params> }) {
  const t = getTrack((await params).track);
  if (!t) notFound();
  const work = projectsIn(t.id);
  const how = t.id === "ai" ? null : ethics[t.id as Exclude<TrackId, "ai">];

  return (
    <div className="paper">
      <header className="lh">
        <h1>{laneLabel[t.id]}</h1>
        <p className="role">{t.role}</p>
        <p className="intro">{t.intro} {t.introEm}</p>
        <p className="stats">
          {t.stats.map((s) => (
            <span key={s.label}><b className="num">{s.value}</b>{s.label}</span>
          ))}
        </p>
      </header>
      <div className="rows">
        {work.map((p) => {
          const c = coverOf(p);
          return (
            <Link key={p.slug} className="row" href={`/projects/${p.slug}/`}>
              <span className="th">
                {c ? <img src={asset(c.src)} srcSet={srcSet(c.src)} sizes="96px" alt="" loading="lazy" /> : p.pipeline ? <DataCard name={p.name} year={p.year} pipe={p.pipeline} /> : null}
              </span>
              <span><b>{nameOf(p)}</b><small>{p.tagline}</small></span>
              <em className="num">{shortOf(p)}</em>
            </Link>
          );
        })}
      </div>
      {how && (
        <section className="how">
          <h3>How I work</h3>
          <dl>
            {how.map((e) => (
              <div key={e.title}><dt>{e.title}</dt><dd>{e.body}</dd></div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
