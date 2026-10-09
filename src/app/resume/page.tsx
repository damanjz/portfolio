import type { Metadata } from "next";
import { site } from "@/content";
import { asset } from "@/lib/asset";
import resume from "@/resume.json";
import Bar from "@/components/Bar";
import Split from "@/components/Split";
import Foot from "@/components/Foot";
import Ribbon from "@/components/Ribbon";
import { TLink } from "@/components/Transition";

/**
 * The resume as a page. Content comes from src/resume.json, exported by the
 * ATS resume build script (same source as the PDF), with the phone number
 * removed for the public web. Every project and section links back to its
 * page on this site.
 */

export const metadata: Metadata = {
  title: `Resume — ${site.name}`,
  description: `${site.name}: data analyst, AI-assisted software developer and 3D environment artist. Experience, projects, education and skills.`,
  alternates: { canonical: "/resume/" },
};

type Block = { k: string; t?: string; l?: string; r?: string };
type Entry = { title: string; date: string; bullets: string[] };
type Section = { heading: string; paras: string[]; skills: [string, string][]; entries: Entry[] };

// resume entry title prefix -> project page; section heading -> door
const PROJECT: [RegExp, string, string][] = [
  [/^India Air Quality/, "/projects/india-air-quality/", "India air quality"],
  [/^SaaS Revenue Leak/, "/projects/saas-revenue-leak/", "SaaS Revenue Leak"],
  [/^Hospital Operations/, "/projects/hospital-operations/", "Hospital operations"],
  [/^HR Analytics/, "/projects/hr-analytics/", "HR analytics"],
  [/^Supply Chain/, "/projects/supply-chain/", "Supply chain"],
  [/^Personal Finance/, "/projects/finance-bi/", "Finance BI"],
  [/^Protec/, "/projects/protec/", "Protec"],
  [/^AI Support Triage/, "/projects/n8n-automation/", "n8n automation"],
  [/^VOLT/, "/projects/volt-techwear-store/", "VOLT"],
  [/^AI Calendar/, "/projects/ai-calendar/", "AI Calendar"],
  [/^Additional builds/, "/projects/flux-player/", "Flux Player"],
  [/^Umbraixs/, "/projects/umbraixs/", "Umbraixs"],
  [/^Blender Work/, "/art/", "Environments"],
];
const DOOR: Record<string, [string, string]> = {
  "Data Analytics Projects": ["/data/", "Data"],
  "Software Projects": ["/systems/", "Systems"],
  "3D Art Projects": ["/art/", "Environments"],
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

// every figure here is in the resume itself
const STATS = [
  { value: "06", label: "BI case studies, end to end" },
  { value: "16", label: "security fixes shipped in Protec" },
  { value: "177", label: "tests behind AI Calendar" },
  { value: "15", label: "months in a 3D studio" },
];

const linkFor = (title: string) => PROJECT.find(([re]) => re.test(title));

export default function ResumePage() {
  const { head, sections } = parse(resume as Block[]);
  const linkSection = sections.find((s) => s.heading === "Links");

  return (
    <>
      <Bar backHref="/" backLabel={site.name} backText="All work" />

      <section className="rs-hero">
        <span className="lbl" data-fade="">Resume</span>
        <Split as="h1" text={site.name} className="cap rs-name" />
        <p className="rs-headline" data-fade="" style={{ ["--d" as string]: "200ms" }}>
          {head.headline}
        </p>
        <div className="rs-actions" data-fade="" style={{ ["--d" as string]: "300ms" }}>
          <a className="pill on" href={asset("/resume/Daman-Reddy-Resume.pdf")} target="_blank" rel="noopener" data-magnetic>
            Download PDF &#8599;
          </a>
          <a className="pill" href={`mailto:${site.email}`} data-magnetic>
            {site.email}
          </a>
          <span className="lbl">{site.location}</span>
        </div>
      </section>

      <Ribbon items={["Data analyst", "AI-assisted developer", "3D environment artist", "SQL", "Python", "Power BI", "Tableau", "Rust", "Unreal Engine 5", "Blender"]} className="rs-ribbon" />

      <div className="stats rs-stats">
        {STATS.map((x, i) => (
          <div key={x.label} data-fade="" style={{ ["--d" as string]: `${i * 100}ms` }}>
            <b data-count={x.value}>{x.value}</b>
            <span className="lbl">{x.label}</span>
          </div>
        ))}
      </div>

      <div className="rs-body">
        {sections
          .filter((s) => s !== linkSection)
          .map((s, i) => {
            const door = DOOR[s.heading];
            return (
              <section key={s.heading} className={`rs-sec ${s.skills.length ? "rs-dark" : ""}`}>
                <div className="rs-side">
                  <span className="rs-num">{String(i + 1).padStart(2, "0")}</span>
                  <Split as="h2" text={s.heading} className="cap" />
                  {door && (
                    <TLink href={door[0]} label={door[1]} className="rs-door">
                      {`All ${door[1]} work →`}
                    </TLink>
                  )}
                </div>
                <div className="rs-main">
                  {s.paras.map((p) => (
                    <p key={p} className="rs-p" data-fade="">
                      {p}
                    </p>
                  ))}
                  {s.skills.length > 0 && (
                    <dl className="rs-skills">
                      {s.skills.map(([k, v]) => (
                        <div key={k} data-fade="">
                          <dt>{k}</dt>
                          <dd>
                            {v.split(/, (?![^(]*\))/).map((x) => (
                              <span key={x} className="chip">{x}</span>
                            ))}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {s.entries.map((e) => {
                    const link = linkFor(e.title);
                    return (
                      <article key={e.title} className="rs-entry" data-fade="">
                        <div className="rs-entry-head">
                          <div>
                            <h3>{e.title.split(": ")[0]}</h3>
                            {e.title.includes(": ") && <span className="rs-stack">{e.title.split(": ").slice(1).join(": ")}</span>}
                          </div>
                          {e.date && <span className="lbl">{e.date}</span>}
                        </div>
                        {e.bullets.length > 0 && (
                          <ul>
                            {e.bullets.map((b) => (
                              <li key={b}>{b}</li>
                            ))}
                          </ul>
                        )}
                        {link && (
                          <TLink href={link[1]} label={link[2]} className="rs-link" data-cursor="View">
                            {link[1].startsWith("/projects/") ? `View ${link[2]} →` : `All ${link[2]} work →`}
                          </TLink>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
      </div>

      <Foot outro={["Let's work", "together"]} />
    </>
  );
}
