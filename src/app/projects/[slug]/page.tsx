import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, getProject, categoryLabel, site, trackOf, getTrack, projectsIn, displayName, fitOf } from "@/content";
import { asset, srcSet } from "@/lib/asset";
import Bar from "@/components/Bar";
import Split from "@/components/Split";
import Gallery from "@/components/Gallery";
import YouTubeFigure from "@/components/YouTubeFigure";
import VideoFigure from "@/components/VideoFigure";
import Foot from "@/components/Foot";
import { TLink } from "@/components/Transition";
import { ProjectJsonLd } from "./project-jsonld";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return { title: "Not found" };
  const title = `${displayName(p.name)} — ${site.name}`;
  const ogImage = p.gallery[0]?.src ?? "/og.png";
  return {
    title,
    description: p.summary,
    alternates: { canonical: `/projects/${p.slug}/` },
    openGraph: { type: "article", url: `/projects/${p.slug}/`, title, description: p.summary, images: [{ url: ogImage }] },
    twitter: { card: "summary_large_image", title, description: p.summary, images: [ogImage] },
  };
}

const STATUS: Record<string, string> = { public: "Public", private: "Private", wip: "In development", live: "Live" };

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const p = getProject((await params).slug);
  if (!p) notFound();

  const track = getTrack(trackOf(p))!;
  const peers = projectsIn(track.id);
  const idx = peers.findIndex((x) => x.slug === p.slug);
  const next = peers[(idx + 1) % peers.length];
  const shots = p.gallery;
  const cover = shots[0] ?? (p.reels?.[0] ? { src: p.reels[0].poster, alt: p.name, caption: "" } : undefined);
  const rest = shots[0] ? shots.slice(1) : shots;
  const title = displayName(p.name);
  const nextTitle = displayName(next.name);
  const doorName = track.id === "art" ? "Environments" : track.word;

  return (
    <>
      <ProjectJsonLd p={p} />
      <Bar backHref={`/${track.id}/`} backLabel={doorName} backText={doorName} active={track.id} />

      <section className="cs-hero" style={{ ["--fit" as string]: fitOf(title) }}>
        <div className="kick" data-fade="">
          <span className="lbl">
            <span className="acc">{track.num}</span> / {track.role}
          </span>
          <span className="lbl">&middot; {categoryLabel(p.category)}</span>
        </div>
        <Split as="h1" text={title} className="cap" />
        <p className="sum" data-fade="" style={{ ["--d" as string]: "200ms" }}>
          {p.summary}
        </p>
      </section>

      <div className="cs-meta">
        {[
          ["Year", p.year],
          ["Status", STATUS[p.status] ?? p.status],
          ["Stack", p.stack.slice(0, 4).join(", ")],
          [p.metric?.label ?? "Type", p.metric?.value ?? categoryLabel(p.category)],
        ].map(([k, v], i) => (
          <div key={k} data-fade="" style={{ ["--d" as string]: `${i * 90}ms` }}>
            <span className="lbl" style={{ textTransform: "capitalize" }}>{k}</span>
            <div className="v">{v}</div>
          </div>
        ))}
      </div>

      {cover && (
        <div className="cs-cover" data-colorize="">
          <img src={asset(cover.src)} srcSet={srcSet(cover.src)} sizes="(max-width: 760px) 100vw, 96vw" alt={cover.alt} fetchPriority="high" />
        </div>
      )}

      <section className="cs-body">
        <div>
          {p.sections.map((s, i) => (
            <div key={s.heading} className="cs-ch">
              <span className="n" data-fade="">{String(i + 1).padStart(2, "0")}</span>
              <Split as="h2" text={s.heading} className="cap" />
              <p data-fade="">{s.body}</p>
            </div>
          ))}
          {p.decisions && p.decisions.length > 0 && (
            <div className="cs-ch">
              <span className="n" data-fade="">{String(p.sections.length + 1).padStart(2, "0")}</span>
              <Split as="h2" text="Decisions" className="cap" />
              <div className="cs-dec" data-fade="">
                {p.decisions.map((d) => (
                  <div key={d.choice}>
                    <b>{d.choice}</b>
                    <span>{d.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="cs-aside" data-fade="">
          <div className="cs-facts">
            {p.facts.map((f) => (
              <div key={f.label}>
                <span className="k">{f.label}</span>
                <span className={p.specAccent === f.label ? "hot" : ""}>{f.value}</span>
              </div>
            ))}
          </div>
          {p.href && (
            <a className="pill on" href={p.href} target="_blank" rel="noopener noreferrer" data-magnetic>
              {p.hrefLabel ? p.hrefLabel.charAt(0).toUpperCase() + p.hrefLabel.slice(1) : "View on GitHub"} &#8599;
            </a>
          )}
        </aside>
      </section>

      {(p.youtube || (p.reels && p.reels.length > 0) || rest.length > 0) && (
        <section className="cs-media">
          {p.youtube && (
            <YouTubeFigure videoId={p.youtube} poster={shots[0]?.src ?? ""} title={`${title}, full piece`} caption="The full piece on YouTube. Nothing loads from YouTube until you press play." />
          )}
          {p.reels && p.reels.length > 0 && (
            <div className="reels">
              {p.reels.map((r) => (
                <VideoFigure key={r.src} src={r.src} poster={r.poster} portrait={r.portrait} title={`${title} reel`} caption={r.caption} />
              ))}
            </div>
          )}
          {rest.length > 0 && <Gallery shots={rest} />}
        </section>
      )}

      {next.slug !== p.slug && (
        <TLink href={`/projects/${next.slug}/`} label={nextTitle} className="next" data-cursor="Next" style={{ ["--fit" as string]: fitOf(nextTitle) }}>
          <span className="lbl">Next in {doorName.toLowerCase()}</span>
          <span className="cap" style={{ display: "block" }}>{nextTitle} &rarr;</span>
        </TLink>
      )}

      <Foot outro={track.outro} />
    </>
  );
}
