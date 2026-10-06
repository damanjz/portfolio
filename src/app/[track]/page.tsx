import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tracks, getTrack, projectsIn, site, ethics } from "@/content";
import Bar from "@/components/Bar";
import Split from "@/components/Split";
import Ribbon from "@/components/Ribbon";
import WorkCard from "@/components/WorkCard";
import Foot from "@/components/Foot";

type Params = { track: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return tracks.map((t) => ({ track: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const t = getTrack((await params).track);
  if (!t) return { title: "Not found" };
  const title = `${site.name} — ${t.role}`;
  const description = `${t.intro} ${t.introEm}`;
  return {
    title,
    description,
    alternates: { canonical: `/${t.id}/` },
    openGraph: { type: "website", url: `/${t.id}/`, title, description, images: [{ url: t.cover }] },
    twitter: { card: "summary_large_image", title, description, images: [t.cover] },
  };
}

/** One door: a calm opening (title and pitch, no imagery), the numbers,
 *  how the work is done, then every piece of work and the contact band. */
export default async function TrackPage({ params }: { params: Promise<Params> }) {
  const t = getTrack((await params).track);
  if (!t) notFound();
  const work = projectsIn(t.id);

  return (
    <>
      <Bar backHref="/" backLabel={site.name} backText="All doors" active={t.id} />

      <section className="hero" style={{ ["--fit" as string]: t.fit }}>
        <span className="lbl" data-fade="">
          <span className="acc">{t.num}</span> / {t.role}
        </span>
        <h1 className="cap">
          <Split text={t.line1} style={{ display: "block" }} />
          <Split text={t.line2} delay={200} style={{ display: "block" }} />
        </h1>
        <div className="hero-foot">
          <p data-fade="" style={{ ["--d" as string]: "350ms" }}>
            {t.intro} <em>{t.introEm}</em>
          </p>
          <a className="cue lbl" href="#how" data-fade="" style={{ ["--d" as string]: "500ms" }}>
            Scroll <span aria-hidden="true">&darr;</span>
          </a>
        </div>
      </section>

      <div className="stats">
        {t.stats.map((s, i) => (
          <div key={s.label} data-fade="" style={{ ["--d" as string]: `${i * 110}ms` }}>
            <b data-count={s.value}>{s.value}</b>
            <span className="lbl">{s.label}</span>
          </div>
        ))}
      </div>

      <section className="how" id="how">
        <div className="how-head">
          <span className="lbl" data-fade="">How I work</span>
          <Split as="h2" text="The standards" className="cap" />
        </div>
        <ol className="how-list">
          {ethics[t.id].map((e, i) => (
            <li key={e.title} data-fade="" style={{ ["--d" as string]: `${(i % 2) * 120}ms` }}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <h3>{e.title}</h3>
              <p>{e.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <Ribbon items={t.ribbon} className="door-ribbon" />

      <section className="works" id="work">
        <div className="head">
          <Split as="h2" text="Work" className="cap" />
          <span className="lbl">{String(work.length).padStart(2, "0")} pieces</span>
        </div>
        <div className="grid">
          {work.map((p, i) => (
            <WorkCard key={p.slug} p={p} n={i + 1} wide={i === 0 || ((work.length - 1) % 2 === 1 && i === work.length - 1)} />
          ))}
        </div>
      </section>

      <Foot outro={t.outro} />
    </>
  );
}
