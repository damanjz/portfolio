import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject, categoryLabel, site, seo } from "@/content";
import Gallery from "@/components/Gallery";
import YouTubeFigure from "@/components/YouTubeFigure";
import VideoFigure from "@/components/VideoFigure";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollUnlock from "@/components/ScrollUnlock";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return { title: "Not found" };
  const title = `${p.name} — ${site.name}`;
  return {
    title,
    description: p.summary,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: {
      type: "article",
      url: `/projects/${p.slug}`,
      title,
      description: p.summary,
      images: [{ url: p.gallery[0]?.src ?? seo.url }],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const peers = projects.filter((x) => x.discipline === p.discipline);
  const idx = peers.findIndex((x) => x.slug === p.slug);
  const next = peers[(idx + 1) % peers.length];
  const statusLabel = p.status === "wip" ? "UNDER DEVELOPMENT" : p.status.toUpperCase();

  return (
    <div className="proj-page">
      {/* this route scrolls (the board route locks body scroll) */}
      <ScrollUnlock />

      {/* running header */}
      <header className="proj-bar">
        <Link href="/" className="proj-back">
          ← THE BOARD
        </Link>
        <span className="proj-bar-meta mono">
          {p.num} · {categoryLabel(p.category).toUpperCase()} · {statusLabel}
        </span>
        <ThemeToggle />
      </header>

      <main className="proj-main">
        {/* hero */}
        <div className="proj-hero">
          <div className="kicker" style={{ color: "var(--acc)" }}>
            Case study — {p.num}
          </div>
          <h1 className="proj-title serif">{p.name}</h1>
          <p className="proj-summary serif">{p.summary}</p>
          <div className="proj-stack mono">
            {p.stack.join(" · ").toUpperCase()}
          </div>
        </div>

        <div className="proj-grid">
          <div className="proj-body">
            {p.youtube && (
              <div style={{ marginBottom: 40 }}>
                <YouTubeFigure
                  videoId={p.youtube}
                  poster={p.gallery[0]?.src ?? ""}
                  title={`${p.name} — tech demo`}
                  caption="FIG.00 — TECH DEMO · FULL PIECE · YOUTUBE (LOADS ON CLICK)"
                />
              </div>
            )}

            {p.reels && p.reels.length > 0 && (
              <div className="proj-reels">
                {p.reels.map((r) => (
                  <VideoFigure
                    key={r.src}
                    src={r.src}
                    poster={r.poster}
                    portrait={r.portrait}
                    title={`${p.name} — reel`}
                    caption={r.caption}
                  />
                ))}
              </div>
            )}

            {p.gallery.length > 0 && <Gallery shots={p.gallery} />}

            {/* chapters */}
            {p.sections.map((s, i) => (
              <section key={s.heading} className="proj-chapter">
                <div className="proj-chapter-head">
                  <span className="mono proj-chapter-num">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="serif proj-chapter-title">{s.heading}</h2>
                </div>
                <p className="serif proj-chapter-body">{s.body}</p>
              </section>
            ))}

            {/* decisions */}
            {p.decisions && p.decisions.length > 0 && (
              <section className="proj-chapter">
                <div className="proj-chapter-head">
                  <span className="mono proj-chapter-num">
                    {String(p.sections.length + 1).padStart(2, "0")}
                  </span>
                  <h2 className="serif proj-chapter-title">Decisions</h2>
                </div>
                <div className="proj-decisions mono">
                  {p.decisions.map((d) => (
                    <div key={d.choice} className="proj-decision">
                      <span className="pd-choice">{d.choice}</span>
                      <span className="pd-reason">{d.reason}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* next */}
            <Link href={`/projects/${next.slug}`} className="proj-next">
              <span className="mono proj-next-label">NEXT — {next.num}</span>
              <span className="serif proj-next-name">{next.name} →</span>
            </Link>
          </div>

          {/* spec sheet */}
          <aside className="proj-aside">
            <div className="proj-spec">
              <div className="mono proj-spec-label">SPEC SHEET</div>
              <div className="mono proj-spec-rows">
                {p.facts.map((f) => (
                  <div key={f.label} className="proj-spec-row">
                    <span className="ps-label">{f.label}</span>
                    <span className={`ps-value ${p.specAccent === f.label ? "ps-acc" : ""}`}>
                      {f.value}
                    </span>
                  </div>
                ))}
                {p.href && (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="proj-spec-row">
                    <span className="ps-label">{p.hrefLabel ? "LINK" : "REPO"}</span>
                    <span className="ps-value ps-acc">
                      {p.hrefLabel?.toUpperCase() ?? "GITHUB"} ↗
                    </span>
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
