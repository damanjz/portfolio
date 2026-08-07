/**
 * graph.ts — derive a project's production DAG from its existing content.
 *
 * The flow-board renders every project as: IDEA → DECISIONS → PRODUCTION → END.
 * Rather than author a second copy of that structure, we DERIVE it from the
 * fields `content.ts` already has (sections / decisions / facts). One source of
 * truth; every project laid out by the same rules, so the board stays honest
 * and consistent.
 *
 * A project's `sections` are numbered chapters (Problem/Build/Hardening…). We
 * map the FIRST as the idea, the LAST as the outcome, and any middle sections
 * as production stages; `decisions` become the decision node; the terminal
 * node's tone comes from `status` (shipped / live / under-development).
 */
import type { Project } from "@/content";

export type StageKind = "idea" | "decision" | "production" | "end";

export type Stage = {
  id: string;
  kind: StageKind;
  label: string; // the small mono kicker ("IDEA", "DECISION"…)
  title: string; // the section heading, or a synthesized one
  body?: string; // section prose (trimmed for the node)
  /** decision rows, only on the decision stage */
  decisions?: { choice: string; reason: string }[];
  /** the terminal node's status word drives its colour */
  status?: Project["status"];
};

/** Node-sized excerpt. Generous by default so stage cards carry real substance
 *  (the tree is the meat; the project page is the full deep-dive). Only very
 *  long sections get trimmed at a sentence boundary. */
function excerpt(body: string, max = 320): string {
  if (body.length <= max) return body;
  const cut = body.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return (lastStop > 120 ? cut.slice(0, lastStop + 1) : cut.trimEnd()) + "…";
}

const STATUS_END_LABEL: Record<Project["status"], string> = {
  public: "Shipped",
  live: "Live",
  private: "Shipped",
  wip: "In development",
};

/**
 * Build the ordered stage list for a project's DAG.
 * Shape: idea → [decision] → production stages → end.
 */
export function deriveStages(p: Project): Stage[] {
  const stages: Stage[] = [];
  const secs = p.sections ?? [];

  // IDEA — the first section is the origin
  if (secs[0]) {
    stages.push({
      id: `${p.slug}-idea`,
      kind: "idea",
      label: "Idea",
      title: secs[0].heading,
      body: excerpt(secs[0].body),
    });
  }

  // DECISION — the decisions ledger, if any
  if (p.decisions && p.decisions.length) {
    stages.push({
      id: `${p.slug}-decision`,
      kind: "decision",
      label: "Decisions",
      title: `${p.decisions.length} call${p.decisions.length === 1 ? "" : "s"} made`,
      decisions: p.decisions,
    });
  }

  // PRODUCTION — middle sections (everything between first and last)
  secs.slice(1, Math.max(1, secs.length - 1)).forEach((s, i) => {
    stages.push({
      id: `${p.slug}-prod-${i}`,
      kind: "production",
      label: "Production",
      title: s.heading,
      body: excerpt(s.body),
    });
  });

  // END — the last section carries the outcome; tone from status
  const last = secs.length > 1 ? secs[secs.length - 1] : undefined;
  stages.push({
    id: `${p.slug}-end`,
    kind: "end",
    label: STATUS_END_LABEL[p.status],
    title: last ? last.heading : p.name,
    body: last ? excerpt(last.body, 110) : undefined,
    status: p.status,
  });

  return stages;
}

/** Edges of the derived DAG: root → idea → decision → prod… → end (a chain,
 *  with decision and first production both feeding the next as the board draws
 *  them). Kept linear so the graph reads left-to-right without crossing wires. */
export function stageEdges(stages: Stage[]): [string, string][] {
  const e: [string, string][] = [];
  for (let i = 0; i < stages.length - 1; i++) {
    e.push([stages[i].id, stages[i + 1].id]);
  }
  return e;
}
