import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject, categoryLabel, site, seo } from "@/content";
import DetailBar from "@/components/DetailBar";
import Gallery from "@/components/Gallery";
import YouTubeFigure from "@/components/YouTubeFigure";
import VideoFigure from "@/components/VideoFigure";
import Footer from "@/components/Footer";

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

  // next in the same discipline's sequence, wrapping around
  const peers = projects.filter((x) => x.discipline === p.discipline);
  const idx = peers.findIndex((x) => x.slug === p.slug);
  const next = peers[(idx + 1) % peers.length];

  const meta = `${p.num} · ${categoryLabel(p.category).toUpperCase()} · ${p.status.toUpperCase()}`;

  return (
    <>
      <DetailBar title={p.name} meta={meta} />

      <main className="px-5 sm:px-8 xl:px-0">
        <div className="mx-auto max-w-[1232px]">
          {/* header */}
          <div className="pb-10 pt-16">
            <div className="mono text-[11px] font-medium tracking-[0.12em] text-acc">
              CASE STUDY — {p.num}
            </div>
            <h1 className="serif mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[52px]">
              {p.name}
            </h1>
            <p className="serif mt-4 max-w-[640px] text-lg leading-[1.5] text-graphite sm:text-xl">
              {p.summary}
            </p>
          </div>

          <div className="grid gap-12 pb-[88px] lg:grid-cols-[1fr_300px] lg:gap-16">
            {/* body */}
            <div>
              {/* the full tech demo — YouTube, loaded only on click */}
              {p.youtube && (
                <div className="mb-10">
                  <YouTubeFigure
                    videoId={p.youtube}
                    poster={p.gallery[0]?.src ?? ""}
                    title={`${p.name} — tech demo`}
                    caption="FIG.00 — TECH DEMO · FULL PIECE · YOUTUBE (LOADS ON CLICK)"
                  />
                </div>
              )}

              {/* locally-hosted reels — no external request, played on click */}
              {p.reels && p.reels.length > 0 && (
                <div className="mb-10 grid gap-8 sm:grid-cols-2">
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

              {/* figures */}
              <Gallery shots={p.gallery} />

              {/* numbered chapters */}
              {p.sections.map((s, i) => (
                <section key={s.heading} className="mt-12 first-of-type:mt-14">
                  <div className="ledger text-ink">
                    <span className="mono text-xs font-medium text-acc">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="serif text-2xl font-semibold leading-none text-ink">
                      {s.heading}
                    </span>
                  </div>
                  <p className="serif mt-5 max-w-[640px] text-base leading-[1.75] text-ink">
                    {s.body}
                  </p>
                </section>
              ))}

              {/* decisions ledger */}
              {p.decisions && p.decisions.length > 0 && (
                <section className="mt-12">
                  <div className="ledger text-ink">
                    <span className="mono text-xs font-medium text-acc">
                      {String(p.sections.length + 1).padStart(2, "0")}
                    </span>
                    <span className="serif text-2xl font-semibold leading-none text-ink">
                      Decisions
                    </span>
                  </div>
                  <div className="mono mt-5 max-w-[640px] border border-hairline text-[11px] leading-[1.5] tracking-[0.04em]">
                    {p.decisions.map((d, i) => (
                      <div
                        key={d.choice}
                        className={`grid gap-2 px-4 py-3 sm:grid-cols-[220px_1fr] sm:gap-4 ${
                          i < p.decisions!.length - 1 ? "border-b border-hairline" : ""
                        }`}
                      >
                        <span className="text-ink">{d.choice}</span>
                        <span className="text-graphite">{d.reason}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* next */}
              <Link
                href={`/projects/${next.slug}`}
                className="group mt-16 flex items-baseline justify-between border-t border-hairline pt-5"
              >
                <span className="mono text-[11px] tracking-[0.1em] text-faint">
                  NEXT — {next.num}
                </span>
                <span className="serif text-2xl font-semibold text-ink">
                  <span className="border-b border-transparent transition-colors duration-150 group-hover:border-ink">
                    {next.name}
                  </span>{" "}
                  →
                </span>
              </Link>
            </div>

            {/* spec sheet — the memorable artifact of every case study */}
            <aside>
              <div className="lg:sticky lg:top-[68px]">
                <div className="mono mb-2.5 text-[10px] font-medium tracking-[0.12em] text-faint">
                  SPEC SHEET
                </div>
                <div className="mono border-t border-ink text-[10.5px] tracking-[0.05em]">
                  {p.facts.map((f) => {
                    const accented = p.specAccent === f.label;
                    return (
                      <div
                        key={f.label}
                        className="flex justify-between gap-3 border-b border-hairline py-2.5"
                      >
                        <span className="text-faint">{f.label}</span>
                        <span
                          className={`text-right ${
                            accented ? "font-medium text-acc" : "text-ink"
                          }`}
                        >
                          {f.value}
                        </span>
                      </div>
                    );
                  })}
                  {p.href && (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between gap-3 border-b border-hairline py-2.5"
                    >
                      <span className="text-faint">
                        {p.hrefLabel ? "LINK" : "REPO"}
                      </span>
                      <span className="link-acc">
                        {p.hrefLabel?.toUpperCase() ?? "GITHUB"} ↗
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
