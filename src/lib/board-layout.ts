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

/** A backing container rectangle drawn behind nodes. `kind` picks its styling
 *  ("group" = the big outer container, "item" = one project/plate). `member`
 *  ids let the Board recompute a box's bounds live from its nodes' positions. */
export type Box = {
  id: string;
  kind: "group" | "item";
  label?: string; // shown as the box's header (groups + items)
  members: string[]; // node ids this box wraps
  x: number;
  y: number;
  w: number;
  h: number;
};

export type BoardModel = {
  nodes: PlacedNode[];
  edges: [string, string, ("ship" | "art" | undefined)?][];
  zones: Zone[];
  boxes: Box[];
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

  const boxes: Box[] = [];
  const BOX_PAD = 26; // inner padding of item boxes around their cards
  const GROUP_PAD = 44; // outer padding of the group container
  const GROUP_HEADER = 52; // header band inside a group box for its title

  // ══ ART GROUP (LEFT of systems, fully separated) ══════════════════════════
  //    Each plate is its own item box; all plates live in one group box.
  const ART_COL = WELCOME_X + WELCOME_W + COL_GAP;
  const PLATE_W = 260;
  const PLATE_H = 168;
  const PLATE_PITCH = 250; // vertical distance between plate item boxes
  const artInnerTop = ROW0 + GROUP_HEADER + GROUP_PAD;
  const artHubY = artInnerTop;
  nodes.push({ id: "art-hub", role: "art", x: ART_COL + GROUP_PAD, y: artHubY, w: 260 });
  edges.push(["origin", "art-hub", "art"]);
  const artItemBoxes: Box[] = [];
  let artMaxRight = ART_COL + GROUP_PAD + 260;
  art.forEach((p, i) => {
    const px = ART_COL + GROUP_PAD;
    const py = artHubY + 240 + i * PLATE_PITCH;
    const id = `plate-${p.slug}`;
    nodes.push({ id, role: "plate", x: px, y: py, w: PLATE_W, plate: p });
    edges.push([i === 0 ? "art-hub" : `plate-${art[i - 1].slug}`, id, "art"]);
    artItemBoxes.push({
      id: `box-${id}`, kind: "item", label: `${p.num} · ${p.name}`,
      members: [id],
      x: px - BOX_PAD, y: py - BOX_PAD - 22, w: PLATE_W + BOX_PAD * 2, h: PLATE_H + BOX_PAD * 2 + 22,
    });
    if (px + PLATE_W > artMaxRight) artMaxRight = px + PLATE_W;
  });
  const artInnerBottom = artHubY + 240 + (art.length - 1) * PLATE_PITCH + PLATE_H + BOX_PAD;
  const ART_GROUP = {
    id: "group-art", kind: "group" as const, label: "◆ THE CRAFT — 3D / TECHNICAL ART",
    members: ["art-hub", ...art.map((p) => `plate-${p.slug}`)],
    x: ART_COL, y: ROW0,
    w: artMaxRight + GROUP_PAD - ART_COL,
    h: artInnerBottom + GROUP_PAD - ROW0,
  };
  boxes.push(ART_GROUP, ...artItemBoxes);

  // ══ SYSTEMS GROUP (RIGHT of art) ══════════════════════════════════════════
  //    Each project is an item box (root + its DAG row); all in one group box.
  const SYS_COL = ART_GROUP.x + ART_GROUP.w + COL_GAP;
  const SYS_INNER_X = SYS_COL + GROUP_PAD;
  const SYS_STAGE0 = SYS_INNER_X + ROOT_W + 110;
  const sysTop = ROW0 + GROUP_HEADER + GROUP_PAD;
  let maxRight = SYS_STAGE0;
  const sysItemBoxes: Box[] = [];
  systems.forEach((p, i) => {
    const rootY = sysTop + i * SECTION_PITCH;
    const rootId = `root-${p.slug}`;
    nodes.push({ id: rootId, role: "proj", x: SYS_INNER_X, y: rootY, w: ROOT_W, project: p });
    edges.push(["origin", rootId]);

    const stages = deriveStages(p);
    const members = [rootId];
    let prevId = rootId;
    let rowRight = SYS_INNER_X + ROOT_W;
    stages.forEach((s, j) => {
      const sx = SYS_STAGE0 + j * STAGE_GAP_X;
      nodes.push({ id: s.id, role: "stage", x: sx, y: rootY, w: STAGE_W, stage: s, project: p });
      edges.push([prevId, s.id, s.kind === "end" ? "ship" : undefined]);
      prevId = s.id;
      members.push(s.id);
      rowRight = sx + STAGE_W;
      if (rowRight > maxRight) maxRight = rowRight;
    });
    sysItemBoxes.push({
      id: `box-${rootId}`, kind: "item", label: `${p.num} · ${p.name}`,
      members,
      x: SYS_INNER_X - BOX_PAD, y: rootY - BOX_PAD - 22,
      w: rowRight - SYS_INNER_X + BOX_PAD * 2, h: 150 + BOX_PAD * 2 + 22,
    });
  });
  const sysInnerBottom = sysTop + (systems.length - 1) * SECTION_PITCH + 150 + BOX_PAD;
  // widen every systems item box to the group's common right edge (tidy column)
  const sysGroupInnerRight = maxRight;
  sysItemBoxes.forEach((b) => { b.w = sysGroupInnerRight - (SYS_INNER_X - BOX_PAD) + BOX_PAD; });
  // the group box must wrap EVERY card in the section (roots + all DAG stages),
  // so its live bounds include the full DAG width even when expanded
  const sysAllMembers = nodes
    .filter((n) => (n.role === "proj" || n.role === "stage") && systems.some((p) => n.project?.slug === p.slug))
    .map((n) => n.id);
  const SYS_GROUP: Box = {
    id: "group-systems", kind: "group", label: "◆ THE WORK — SYSTEMS, EACH DRAWN AS HOW IT GOT BUILT",
    members: sysAllMembers,
    x: SYS_COL, y: ROW0,
    w: sysGroupInnerRight + GROUP_PAD - SYS_COL,
    h: sysInnerBottom + GROUP_PAD - ROW0,
  };
  boxes.push(SYS_GROUP, ...sysItemBoxes);

  const rightEdge = SYS_GROUP.x + SYS_GROUP.w + 200;
  const bounds = {
    w: rightEdge,
    h: Math.max(SYS_GROUP.y + SYS_GROUP.h, ART_GROUP.y + ART_GROUP.h, wContact + 300) + 120,
  };

  // welcome-column label only (project/art labels now live on their boxes)
  const LABEL_DY = -(SECTION_LABEL_H - 12);
  const zones: Zone[] = [
    {
      label: "◆ START HERE — who I am + how to read this board",
      anchor: "origin", dx: 0, dy: LABEL_DY,
      x: WELCOME_X, y: wOrigin + LABEL_DY,
    },
  ];

  return { nodes, edges, zones, boxes, bounds };
}
