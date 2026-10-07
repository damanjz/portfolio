import { tracks, type TrackId } from "@/content";
import { TLink } from "./Transition";

/** Sticky header for door and case-study pages: back link + door switcher. */
export default function Bar({
  backHref,
  backLabel,
  backText,
  active,
}: {
  backHref: string;
  backLabel: string;
  backText: string;
  active?: TrackId;
}) {
  return (
    <header className="bar">
      <TLink href={backHref} label={backLabel} className="back">
        <span className="arr" aria-hidden="true">&larr;</span>
        <span className="txt">{backText}</span>
      </TLink>
      <nav className="switch" aria-label="Crafts">
        {tracks.map((t) => (
          <TLink
            key={t.id}
            href={`/${t.id}/`}
            label={t.word.replace("|", "")}
            className={`pill ${t.id === active ? "on" : ""}`}
            aria-current={t.id === active ? "page" : undefined}
          >
            {t.id === "art" ? "Environments" : t.word}
          </TLink>
        ))}
      </nav>
    </header>
  );
}
