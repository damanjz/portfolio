import Link from "next/link";
import { about, lanes, laneLabel, site, socials, projects, getProject, trackOf, nameOf, shortOf, coverOf, type Project } from "@/content";
import { asset, srcSet } from "@/lib/asset";
import { Portrait } from "@/components/Shell";
import CopyEmail from "@/components/CopyEmail";
import resume from "@/resume.json";

// Featured work: six picks, AI and data first (Claude's default, 2026-11-11; Daman can swap them).
const FEATURED = ["fde-support-agent", "fde-ask-your-data", "fde-doc-extraction", "india-air-quality", "saas-revenue-leak", "umbraxis"];
const featured = FEATURED.map((s) => getProject(s)).filter((p): p is Project => !!p && projects.includes(p));
// Skills, grouped exactly as on the resume (same source as the PDF).
const skills = (resume as { k: string; l?: string; t?: string }[]).filter((b) => b.k === "skill" && b.l !== "Languages");

const OUT = (
  <svg className="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>
);

/** The "you" column: the heading over the scene, then the story on paper. Copy is a draft for Daman's edit. */
export default function Home() {
  return (
    <>
      <div className="hero">
        <h1>{about.head.join(" ")}</h1>
        <p>{about.line}</p>
        <div className="ctas">
          <a className="cta-1" href="#featured">View work</a>
          <a className="cta-2" href={asset("/resume/Daman-Reddy-Resume.pdf")} download>Download resume</a>
        </div>
        <div className="go" aria-label="Lanes">
          {lanes().map((l) => (
            <Link key={l.id} href={`/${l.id}/`}>{laneLabel[l.id]}<small className="num">{projects.filter((p) => trackOf(p) === l.id).length} projects</small></Link>
          ))}
        </div>
        <div className="avail">{site.status} · {site.location}</div>
      </div>
      <section className="paper featured" id="featured" aria-labelledby="featured-h">
        <h2 id="featured-h">Featured work</h2>
        <div className="rows">
          {featured.map((p) => {
            const c = coverOf(p);
            return (
              <Link key={p.slug} className="row" href={`/projects/${p.slug}/`}>
                <span className="th">{c && <img src={asset(c.src)} srcSet={srcSet(c.src)} sizes="120px" alt="" loading="lazy" />}</span>
                <span><b>{nameOf(p)}</b><small>{p.tagline}</small></span>
                <em className="num">{`${laneLabel[trackOf(p)]} · ${shortOf(p)}`}</em>
              </Link>
            );
          })}
        </div>
      </section>
      <div className="paper">
        <article className="about">
          <div className="top">
            <Portrait portrait={about.portrait} />
            <div>
              <p className="tagrow"><span>{site.name}</span><span>{site.location}</span><span>{site.status}</span></p>
              <div className="links">
                {socials.map((s) => (
                  <a key={s.label} className="btn" href={s.href}>{s.label}{s.href.startsWith("mailto") ? null : OUT}</a>
                ))}
                <CopyEmail email={site.email} />
                <Link className="btn on" href="/resume/">Resume</Link>
                <a className="btn" href={asset("/resume/Daman-Reddy-Resume.pdf")} target="_blank" rel="noopener">Resume PDF{OUT}</a>
              </div>
            </div>
          </div>
          <div className="story">
            {about.story.map((p) => <p key={p}>{p}</p>)}
          </div>
          <section className="blk">
            <h3>Skills</h3>
            <dl className="rs-skills">
              {skills.map((x) => (
                <div key={x.l}>
                  <dt>{x.l}</dt>
                  <dd>{x.t!.split(/, (?![^(]*\))/).map((v) => <span key={v} className="chip">{v}</span>)}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="blk">
            <h3>Where I have been</h3>
            <div className="tl">
              {about.timeline.map((x) => (
                <div key={x.when + x.what}>
                  <time>{x.when}</time>
                  <p><b>{x.what}</b><span>{x.where}</span></p>
                  <span>{x.note}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="blk">
            <h3>Outside the work</h3>
            <div className="per">
              {about.personal.map((x) => (
                <div key={x.title}><b>{x.title}</b><p>{x.body}</p></div>
              ))}
            </div>
          </section>
          {about.draft && <p className="draft">Draft copy, yours to edit</p>}
        </article>
      </div>
    </>
  );
}
