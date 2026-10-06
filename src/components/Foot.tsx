import { site, socials } from "@/content";
import Split from "./Split";

/** Black closing band: giant call to action, contact pills, fine print. */
export default function Foot({ outro }: { outro: readonly [string, string] }) {
  return (
    <footer className="foot">
      <h2 className="cap">
        <Split text={outro[0]} />
        <Split text={outro[1]} className="acc" delay={180} style={{ display: "block" }} />
      </h2>
      <div className="row">
        <div className="links">
          <a className="pill on" href={`mailto:${site.email}`} data-magnetic>
            {site.email}
          </a>
          {socials
            .filter((s) => !s.href.startsWith("mailto"))
            .map((s) => (
              <a key={s.label} className="pill" href={s.href} target="_blank" rel="noopener noreferrer" data-magnetic>
                {s.label}
              </a>
            ))}
        </div>
        <span className="lbl">
          {site.location} &middot; {site.status}
        </span>
      </div>
      <div className="fine lbl">
        <span>&copy; {new Date().getFullYear()} {site.name}</span>
        <span>Built local-first. No analytics, no trackers.</span>
      </div>
    </footer>
  );
}
