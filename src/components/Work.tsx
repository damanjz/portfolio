"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  projects,
  categories,
  type Project,
  type CategoryId,
} from "@/content";
import Ledger from "./Ledger";
import { useReveal } from "@/lib/useReveal";

/** Figure captions for the row thumbnails (hatched until real shots land). */
const FIGS: Record<string, string> = {
  protec: "FIG — VAULT UI",
  "n8n-automation": "FIG — PIPELINE",
  "volt-techwear-store": "FIG — STOREFRONT",
  "flux-player": "FIG — PLAYER",
};

function statusMark(p: Project) {
  return p.status === "private"
    ? { label: "PRIVATE ⌑", cls: "text-faint" }
    : { label: "PUBLIC ↗", cls: "text-acc" };
}

function Row({ p }: { p: Project }) {
  const { ref, inView } = useReveal<HTMLDivElement>({ threshold: 0.1 });
  const st = statusMark(p);

  return (
    <div ref={ref} data-inview={inView}>
      <Link
        href={`/projects/${p.slug}`}
        className="group fade grid grid-cols-[44px_1fr_100px] items-center gap-4 border-b border-hairline py-6 sm:grid-cols-[52px_1fr_110px] sm:gap-6 lg:grid-cols-[52px_1fr_260px_200px_110px] lg:py-[30px]"
      >
        {/* index number — turns blue on hover (the only row hover motion) */}
        <span className="mono text-xs text-faint transition-colors duration-150 group-hover:text-acc">
          {p.num}
        </span>

        <div>
          <div className="serif text-xl font-semibold leading-[1.15] tracking-[-0.01em] text-ink sm:text-[25px]">
            <span className="border-b border-transparent transition-colors duration-150 group-hover:border-ink">
              {p.name}
            </span>
          </div>
          <div className="serif mt-1 text-sm leading-[1.5] text-graphite">
            {p.description}
          </div>
          {/* stack folds under the title on smaller screens */}
          <div className="mono mt-2 text-[10px] leading-[1.7] tracking-[0.05em] text-faint lg:hidden">
            {p.stack.join(" · ").toUpperCase()}
          </div>
        </div>

        <span className="mono hidden text-[10.5px] leading-[1.7] tracking-[0.05em] text-graphite lg:block">
          {p.stack.slice(0, 3).join(" · ").toUpperCase()}
          {p.stack.length > 3 && (
            <>
              <br />
              {p.stack.slice(3).join(" · ").toUpperCase()}
            </>
          )}
          {p.metric && (
            <>
              <br />
              <span className="text-ink">
                {p.metric.label.toUpperCase()} = {p.metric.value.toUpperCase()}
              </span>
            </>
          )}
        </span>

        {/* figure thumbnail — hatched engineering-print placeholder */}
        <div className="hatch relative hidden h-28 lg:block">
          <span className="mono absolute bottom-1.5 left-2 text-[9px] text-faint">
            {FIGS[p.slug] ?? "FIG"}
          </span>
        </div>

        <span className={`mono justify-self-end text-[10px] font-medium tracking-[0.1em] ${st.cls}`}>
          {st.label}
        </span>
      </Link>
    </div>
  );
}

export default function Work() {
  const [filter, setFilter] = useState<CategoryId | "all">("all");

  // The Work ledger lists systems projects; the art archive is the Plates band.
  const systems = useMemo(
    () => projects.filter((p) => p.discipline === "systems"),
    [],
  );
  const cats = categories.filter((c) => c.discipline === "systems");
  const shown =
    filter === "all" ? systems : systems.filter((p) => p.category === filter);
  const publicCount = systems.filter((p) => p.status !== "private").length;

  return (
    <section id="work" className="px-5 sm:px-8 xl:px-0">
      <div className="mx-auto max-w-[1232px] pb-[88px]">
        <Ledger
          num="01"
          title="Work"
          readout={`${systems.length} PROJECTS · ${publicCount} PUBLIC`}
        />

        {/* filter chips — mono, counts, ink-filled when active */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          <button
            onClick={() => setFilter("all")}
            className={`mono rounded-[2px] px-3 py-1.5 text-[11px] tracking-[0.06em] transition-colors duration-150 ${
              filter === "all"
                ? "bg-ink text-paper"
                : "border border-hairline text-graphite hover:border-ink hover:text-ink"
            }`}
          >
            ALL ({systems.length})
          </button>
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`mono rounded-[2px] px-3 py-1.5 text-[11px] tracking-[0.06em] transition-colors duration-150 ${
                filter === c.id
                  ? "bg-ink text-paper"
                  : "border border-hairline text-graphite hover:border-ink hover:text-ink"
              }`}
            >
              {c.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {shown.map((p) => (
            <Row key={p.slug} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
