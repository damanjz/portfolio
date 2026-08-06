/**
 * board-layout.ts — compute where every node sits on the 2D board.
 *
 * Pure geometry, no DOM. The board reads left→right: ORIGIN on the left, the
 * six project roots in a column, each project's derived DAG flowing to the
 * right of its root, the art plates in a band below, contact at the far right.
 * Positions are in board coordinates (the world is pan/zoomed as a whole).
 */
import type { Project } from "@/content";
import { deriveStages, type Stage } from "./graph";

export type PlacedNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  role: "origin" | "proj" | "stage" | "plate" | "art" | "contact" | "about" | "howto";
  project?: Project;
  stage?: Stage;
  plate?: Project; // art project rendered as a plate
};

export type Zone = {
  label: string;
  x: number;
  y: number;
  /** the node id this label tracks — so the label follows its section live
   *  (e.g. when its lead node is dragged). dx/dy = label offset from that node. */
  anchor: string;
  dx: number;
  dy: number;
};

export type BoardModel = {
  nodes: PlacedNode[];
  edges: [string, string, ("ship" | "art" | undefined)?][];
  zones: Zone[];
  bounds: { w: number; h: number };
};

/* Layout (2026-08-07, Daman: "really spread out, no overlap of nodes").
   Spacing is collision-safe by construction: every row reserves enough height
   for a project's FULL open DAG, columns are far apart, and zones/plates never
   share space. Estimated node heights drive the row pitch so tall cards (long
   decisions, fuller text) can't run into the next row. */
const ROOT_W = 240;
const STAGE_W = 220;
const STAGE_GAP_X = 320; // wide horizontal DAG steps
const ROW0 = 160;
const WELCOME_X = 60;
const WELCOME_W = 320;

// generous, height-aware row pitch: a system row must clear its tallest stage
// card even when the DAG fans vertically. These are deliberate over-estimates.
const ROOT_ROW_PITCH = 340; // vertical distance between consecutive project rows
const STAGE_FAN = 150; // how far a stage can sit above/below its root row
const COL_GAP = 260; // clear gap between the systems block and the art column

export function buildBoard(projects: Project[]): BoardModel {
  const systems = projects.filter((p) => p.discipline === "systems");
  const art = projects.filter((p) => p.discipline === "craft");

  const nodes: PlacedNode[] = [];
  const edges: BoardModel["edges"] = [];

  // ── WELCOME COLUMN (top-left): Origin → How-to → About → Contact. ─────────
  // Big vertical gaps so these tall cards (How-to has a 5-item list, About is
  // multi-paragraph) never touch — measured against real rendered heights.
  const wOrigin = ROW0;
  const wHowto = ROW0 + 360;
  const wAbout = ROW0 + 780;
  const wContact = ROW0 + 1240;
  nodes.push({ id: "origin", role: "origin", x: WELCOME_X, y: wOrigin, w: WELCOME_W });
  nodes.push({ id: "howto", role: "howto", x: WELCOME_X, y: wHowto, w: WELCOME_W });
  nodes.push({ id: "about", role: "about", x: WELCOME_X, y: wAbout, w: WELCOME_W });
  nodes.push({ id: "contact", role: "contact", x: WELCOME_X, y: wContact, w: WELCOME_W });
  edges.push(["origin", "howto"]);
  edges.push(["howto", "about"]);
  edges.push(["about", "contact"]);

  // ── SYSTEMS ZONE: its own column to the RIGHT of the welcome column, so a
  //    system root never overlaps the welcome cards. Roots stack down; each
  //    DAG flows right on its own row with a tall, collision-safe pitch. ─────
  const SYS_COL = WELCOME_X + WELCOME_W + COL_GAP; // clear of the welcome column
  const SYS_STAGE0 = SYS_COL + ROOT_W + 120;
  const sysTop = ROW0 + 40;
  let maxRight = SYS_STAGE0;
  systems.forEach((p, i) => {
    const rootY = sysTop + i * ROOT_ROW_PITCH;
    const rootId = `root-${p.slug}`;
    nodes.push({ id: rootId, role: "proj", x: SYS_COL, y: rootY, w: ROOT_W, project: p });
    edges.push(["origin", rootId]);

    const stages = deriveStages(p);
    let prevId = rootId;
    stages.forEach((s, j) => {
      const sx = SYS_STAGE0 + j * STAGE_GAP_X;
      // small deterministic fan, bounded so it stays inside the row's reserved band
      const sy = rootY + (j % 2 === 0 ? -STAGE_FAN * 0.16 : STAGE_FAN * 0.22);
      nodes.push({ id: s.id, role: "stage", x: sx, y: sy, w: STAGE_W, stage: s, project: p });
      edges.push([prevId, s.id, s.kind === "end" ? "ship" : undefined]);
      prevId = s.id;
      if (sx + STAGE_W > maxRight) maxRight = sx + STAGE_W;
    });
  });
  const sysBottom = sysTop + (systems.length - 1) * ROOT_ROW_PITCH + STAGE_FAN + 200;

  // ── CREATIVE / ART ZONE: far right, its own column, well clear of systems.
  const ART_COL = maxRight + COL_GAP;
  const artHubY = ROW0;
  nodes.push({ id: "art-hub", role: "art", x: ART_COL, y: artHubY, w: 240 });
  edges.push(["origin", "art-hub", "art"]);
  const PLATE_W = 240;
  const PLATE_PITCH = 260; // tall plates + caption, no overlap
  art.forEach((p, i) => {
    const px = ART_COL + (i % 2 === 0 ? 0 : 300); // two staggered sub-columns, far apart
    const py = artHubY + 280 + i * PLATE_PITCH;
    const id = `plate-${p.slug}`;
    nodes.push({ id, role: "plate", x: px, y: py, w: PLATE_W, plate: p });
    edges.push([i === 0 ? "art-hub" : `plate-${art[i - 1].slug}`, id, "art"]);
  });
  const artBottom = artHubY + 280 + (art.length - 1) * PLATE_PITCH + 220;

  const rightEdge = ART_COL + 300 + PLATE_W + 200;
  const bounds = {
    w: rightEdge,
    h: Math.max(sysBottom, artBottom, wContact + 300) + 120,
  };

  // ── ZONE LABELS — each anchored to its section's LEAD node, so the label
  //    follows its project section live (Daman: "can it move according to
  //    project section"). The Board recomputes x/y from the anchor's current
  //    position; the static x/y here are just the first-paint fallback. ──────
  const zones: Zone[] = [
    {
      label: "◆ START HERE — who I am + how to read this board",
      anchor: "origin", dx: 0, dy: -50,
      x: WELCOME_X, y: wOrigin - 50,
    },
    {
      label: "◆ THE WORK — systems, each drawn as how it got built",
      anchor: `root-${systems[0]?.slug ?? ""}`, dx: 0, dy: -50,
      x: SYS_COL, y: sysTop - 50,
    },
    {
      label: "◆ THE CRAFT — 3D / technical art",
      anchor: "art-hub", dx: 0, dy: -50,
      x: ART_COL, y: artHubY - 50,
    },
  ];

  return { nodes, edges, zones, bounds };
}
