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

/* Layout (2026-08-07, Daman: "give each node its own section, no overlap;
   the section name must be horizontal and not cover the nodes").

   Model: each SYSTEMS project is a self-contained horizontal SECTION —
   a header band (the ◆ label) + the root card + its full DAG on one row.
   Sections stack vertically with a fixed, generous pitch big enough that an
   OPEN DAG (one row of ~130px-tall cards) never reaches the next section, and
   the label sits in the header band above the cards, never on top of them. */
const ROOT_W = 240;
const STAGE_W = 220;
const STAGE_GAP_X = 320; // wide horizontal DAG steps
const ROW0 = 160;
const WELCOME_X = 60;
const WELCOME_W = 320;

const SECTION_LABEL_H = 56; // header band the ◆ label lives in (clear of cards)
const SECTION_PITCH = 420; // vertical distance between systems sections — big
                           //  enough for an open DAG row + the next label band
const COL_GAP = 300; // clear gap between the systems block and the art column

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

  // ── SYSTEMS: each project is its OWN section (label band + root + DAG row).
  //    Sections stack with SECTION_PITCH so an open DAG never reaches the next.
  const SYS_COL = WELCOME_X + WELCOME_W + COL_GAP; // clear of the welcome column
  const SYS_STAGE0 = SYS_COL + ROOT_W + 120;
  const sysTop = ROW0 + SECTION_LABEL_H; // first section's cards sit below its label
  let maxRight = SYS_STAGE0;
  const sysZones: Zone[] = [];
  systems.forEach((p, i) => {
    const sectionTop = sysTop + i * SECTION_PITCH; // top of this section's card row
    const rootY = sectionTop;
    const rootId = `root-${p.slug}`;
    nodes.push({ id: rootId, role: "proj", x: SYS_COL, y: rootY, w: ROOT_W, project: p });
    edges.push(["origin", rootId]);

    // per-project section label, in the header band ABOVE the cards (never over)
    sysZones.push({
      label: `◆ ${p.num} · ${p.name.toUpperCase()}`,
      anchor: rootId, dx: 0, dy: -(SECTION_LABEL_H - 12),
      x: SYS_COL, y: rootY - (SECTION_LABEL_H - 12),
    });

    // the DAG flows straight right on the SAME row — no vertical fan, so the
    // whole section is one clean horizontal band that can't touch its neighbours
    const stages = deriveStages(p);
    let prevId = rootId;
    stages.forEach((s, j) => {
      const sx = SYS_STAGE0 + j * STAGE_GAP_X;
      nodes.push({ id: s.id, role: "stage", x: sx, y: rootY, w: STAGE_W, stage: s, project: p });
      edges.push([prevId, s.id, s.kind === "end" ? "ship" : undefined]);
      prevId = s.id;
      if (sx + STAGE_W > maxRight) maxRight = sx + STAGE_W;
    });
  });
  const sysBottom = sysTop + (systems.length - 1) * SECTION_PITCH + 260;

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

  // ── ZONE LABELS — each label anchors to its section's lead node and sits in
  //    a clear band ABOVE it (never over the cards), horizontal, and follows
  //    the node when dragged. Every systems project gets its OWN section label.
  const LABEL_DY = -(SECTION_LABEL_H - 12);
  const zones: Zone[] = [
    {
      label: "◆ START HERE — who I am + how to read this board",
      anchor: "origin", dx: 0, dy: LABEL_DY,
      x: WELCOME_X, y: wOrigin + LABEL_DY,
    },
    // per-project systems section labels (built in the loop above)
    ...sysZones,
    {
      label: "◆ THE CRAFT — 3D / technical art",
      anchor: "art-hub", dx: 0, dy: LABEL_DY,
      x: ART_COL, y: artHubY + LABEL_DY,
    },
  ];

  return { nodes, edges, zones, bounds };
}
