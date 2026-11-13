import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content";
import { asset } from "@/lib/asset";
import resume from "@/resume.json";

/**
 * The resume, open in the "you" column. Content comes from src/resume.json, exported by the
 * ATS resume build script (same source as the PDF), with the phone number removed for the web.
 * Every project and section links back to its page on this site.
 */

export const metadata: Metadata = {
  title: `Resume | ${site.name}`,
  description: `${site.name}: AI agents, data and BI, 3D environments. Experience, projects, education and skills.`,
  alternates: { canonical: "/resume/" },
};

type Block = { k: string; t?: string; l?: string; r?: string };
type Entry = { title: string; date: string; bullets: string[] };
type Section = { heading: string; paras: string[]; skills: [string, string][]; entries: Entry[] };

// resume entry title prefix -> project page or lane; section heading -> lane
const PROJECT: [RegExp, string, string][] = [
  [/^India Air Quality/, "/projects/india-air-quality/", "India Air Quality"],
  [/^SaaS Revenue Leak/, "/projects/saas-revenue-leak/", "SaaS Revenue Leak"],
  [/^Hospital Operations/, "/projects/hospital-operations/", "Hospital Operations"],
  [/^HR Analytics/, "/projects/hr-analytics/", "HR Analytics"],
  [/^Supply Chain/, "/projects/supply-chain/", "Supply Chain"],
  [/^Personal Finance/, "/projects/finance-bi/", "Finance BI"],
  [/^FDE Portfolio/, "/ai/", "the six AI builds"],
  [/^Protec/, "/projects/protec/", "Protec"],
  [/^AI Support Triage/, "/projects/n8n-automation/", "n8n Automation"],
  [/^VOLT/, "/projects/volt-techwear-store/", "VOLT"],
  [/^AI Calendar/, "/projects/ai-calendar/", "AI Calendar"],
  [/^Additional builds/, "/systems/", "all Systems work"],
  [/^Umbraxis/, "/projects/umbraxis/", "Umbraxis"],
  [/^Blender Work/, "/art/", "all Art"],
];
const LANE: Record<string, [string, string]> = {
  "AI Systems Projects": ["/ai/", "AI"],
  "Data Analytics Projects": ["/data/", "Data"],
  "Software Projects": ["/systems/", "Systems"],
  "3D Art Projects": ["/art/", "Art"],
};

function parse(blocks: Block[]) {
  const head = { name: "", headline: "", contact: [] as string[] };
  const sections: Section[] = [];
  let cur: Section | null = null;
  for (const b of blocks) {
    if (b.k === "name") head.name = b.t!;
    else if (b.k === "headline") head.headline = b.t!;
    else if (b.k === "contact") head.contact.push(...b.t!.split(" | "));
    else if (b.k === "h") sections.push((cur = { heading: b.t!, paras: [], skills: [], entries: [] }));
    else if (!cur) continue;
    else if (b.k === "p") cur.paras.push(b.t!);
    else if (b.k === "skill") cur.skills.push([b.l!, b.t!]);
    else if (b.k === "entry") cur.entries.push({ title: b.l!, date: b.r ?? "", bullets: [] });
    else if (b.k === "b") cur.entries.at(-1)?.bullets.push(b.t!);
  }
  return { head, sections };
}

const linkFor = (title: string) => PROJECT.find(([re]) => re.test(title));
const OUT = <svg className="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>;

export default function ResumePage() {
  const { head, sections } = parse(resume as Block[]);

  return (
    <div className="paper rs">
      <header className="rs-head">
        <h1>{site.name}</h1>
        <p>{head.headline}</p>
        <div className="acts">
          <a className="btn on" href={asset("/resume/Daman-Reddy-Resume.pdf")} target="_blank" rel="noopener">Download PDF{OUT}</a>
          <a className="btn" href={`mailto:${site.email}`}>{site.email}</a>
          <span className="tagrow"><span>{site.location}</span></span>
        </div>
      </header>
      {sections
        .filter((s) => s.heading !== "Links")
        .map((s) => {
          const lane = LANE[s.heading];
          return (
            <section key={s.heading} className="rs-sec">
              <header>
                <h2>{s.heading}</h2>
                {lane && <Link href={lane[0]}>All {lane[1]} work</Link>}
              </header>
              {s.paras.map((p) => <p key={p} className="rs-p">{p}</p>)}
              {s.skills.length > 0 && (
                <dl className="rs-skills">
                  {s.skills.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v.split(/, (?![^(]*\))/).map((x) => <span key={x} className="chip">{x}</span>)}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {s.entries.map((e) => {
                const link = linkFor(e.title);
                return (
                  <article key={e.title} className="rs-entry">
                    <div className="eh">
                      <div>
                        <h3>{e.title.split(": ")[0]}</h3>
                        {e.title.includes(": ") && <span className="stack">{e.title.split(": ").slice(1).join(": ")}</span>}
                      </div>
                      {e.date && <time>{e.date}</time>}
                    </div>
                    {e.bullets.length > 0 && <ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
                    {link && <Link className="more" href={link[1]}>View {link[2]}</Link>}
                  </article>
                );
              })}
            </section>
          );
        })}
    </div>
  );
}
