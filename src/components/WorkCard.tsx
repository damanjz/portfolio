import { categoryLabel, realShots, displayName, fitOf, type Project } from "@/content";
import { asset } from "@/lib/asset";
import { TLink } from "./Transition";

/** One project on a door page: black-and-white cover that colours on hover,
 *  or a typographic tile when no real image exists yet. */
export default function WorkCard({ p, n, wide }: { p: Project; n: number; wide?: boolean }) {
  const cover = realShots(p)[0] ?? (p.reels?.[0] ? { src: p.reels[0].poster, alt: p.name } : undefined);
  return (
    <TLink
      href={`/projects/${p.slug}/`}
      label={displayName(p.name)}
      className={`card ${wide ? "wide" : ""}`}
      data-fade=""
      data-cursor="View"
    >
      <div className="img" data-parallax={cover ? "" : undefined}>
        {cover ? (
          <img src={asset(cover.src)} alt={cover.alt} loading="lazy" />
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
