import { categoryLabel, coverOf, displayName, fitOf, type Project } from "@/content";
import { asset, srcSet } from "@/lib/asset";
import { TLink } from "./Transition";
import DataCard from "./DataCard";

/** One project on a door page: a data project's pipeline card, a black-and-white
 *  cover that colours on hover, or a typographic tile when no real image exists yet. */
export default function WorkCard({ p, n, wide }: { p: Project; n: number; wide?: boolean }) {
  const cover = coverOf(p);
  return (
    <TLink
      href={`/projects/${p.slug}/`}
      label={displayName(p.name)}
      className={`card ${wide ? "wide" : ""}`}
      data-fade=""
      data-cursor="View"
    >
      <div className="img" data-parallax={cover && !p.pipeline ? "" : undefined}>
        {p.pipeline ? (
          <DataCard name={p.name} year={p.year} pipe={p.pipeline} />
        ) : cover ? (
          <img src={asset(cover.src)} srcSet={srcSet(cover.src)} sizes={wide ? "(max-width: 760px) 100vw, (max-width: 1100px) 96vw, 32vw" : "(max-width: 760px) 100vw, (max-width: 1100px) 48vw, 32vw"} alt={cover.alt} loading="lazy" decoding="async" />
        ) : (
          <div className="type" style={{ ["--fit" as string]: fitOf(displayName(p.name)) }}>
            <span className="tag">
              {categoryLabel(p.category)} &middot; {p.year}
            </span>
            <span className="cap">{displayName(p.name)}</span>
          </div>
        )}
      </div>
      <div className="meta">
        <div>
          <h3>{displayName(p.name)}</h3>
          <p>{p.tagline}</p>
        </div>
        <span className="n">{String(n).padStart(2, "0")}</span>
      </div>
    </TLink>
  );
}
