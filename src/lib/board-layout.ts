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

  const boxes: Box[] = [];
  const BOX_PAD = 22; // item-box padding around a card
  const BOX_LABEL_H = 22;

  // ══ ART COLUMN — LEFTMOST (left of origin, Daman's call). ═════════════════
  //    Each plate is its own item box, stacked down the far-left column.
  const PLATE_W = 260;
  const PLATE_H = 168;
  const PLATE_PITCH = 250;
  const ART_X = 60;
  const artTop = ROW0 + 60;
  nodes.push({ id: "art-hub", role: "art", x: ART_X, y: ROW0, w: 260 });
  const artItemBoxes: Box[] = [];
  art.forEach((p, i) => {
    const px = ART_X;
    const py = artTop + 200 + i * PLATE_PITCH;
    const id = `plate-${p.slug}`;
    nodes.push({ id, role: "plate", x: px, y: py, w: PLATE_W, plate: p });
    edges.push([i === 0 ? "art-hub" : `plate-${art[i - 1].slug}`, id, "art"]);
    artItemBoxes.push({
      id: `box-${id}`, kind: "item", label: `${p.num} · ${p.name}`,
      members: [id],
      x: px - BOX_PAD, y: py - BOX_PAD - BOX_LABEL_H,
      w: PLATE_W + BOX_PAD * 2, h: PLATE_H + BOX_PAD * 2 + BOX_LABEL_H,
    });
  });
  const artBottom = artTop + 200 + (art.length - 1) * PLATE_PITCH + PLATE_H;

  // ══ WELCOME COLUMN — right of the art column. ═════════════════════════════
  const WELCOME_X2 = ART_X + PLATE_W + COL_GAP;
  const wOrigin = ROW0;
  const wHowto = ROW0 + 360;
  const wAbout = ROW0 + 780;
  const wContact = ROW0 + 1240;
  nodes.push({ id: "origin", role: "origin", x: WELCOME_X2, y: wOrigin, w: WELCOME_W });
  nodes.push({ id: "howto", role: "howto", x: WELCOME_X2, y: wHowto, w: WELCOME_W });
  nodes.push({ id: "about", role: "about", x: WELCOME_X2, y: wAbout, w: WELCOME_W });
  nodes.push({ id: "contact", role: "contact", x: WELCOME_X2, y: wContact, w: WELCOME_W });
  edges.push(["origin", "howto"]);
  edges.push(["howto", "about"]);
  edges.push(["about", "contact"]);
  edges.push(["origin", "art-hub", "art"]);

  // ══ SYSTEMS COLUMN — far right. Each project = an item box (root + DAG). ═══
  const SYS_COL = WELCOME_X2 + WELCOME_W + COL_GAP;
  const SYS_STAGE0 = SYS_COL + ROOT_W + 110;
  const sysTop = ROW0 + 40;
  let maxRight = SYS_STAGE0;
  const sysItemBoxes: Box[] = [];
  systems.forEach((p, i) => {
    const rootY = sysTop + i * SECTION_PITCH;
    const rootId = `root-${p.slug}`;
    nodes.push({ id: rootId, role: "proj", x: SYS_COL, y: rootY, w: ROOT_W, project: p });
    edges.push(["origin", rootId]);

    const stages = deriveStages(p);
    // the box wraps the root + this project's stage nodes; the Board's liveBox
    // only counts VISIBLE members, so a collapsed box hugs just the root card.
    const members = [rootId];
    let prevId = rootId;
    stages.forEach((s, j) => {
      const sx = SYS_STAGE0 + j * STAGE_GAP_X;
      nodes.push({ id: s.id, role: "stage", x: sx, y: rootY, w: STAGE_W, stage: s, project: p });
      edges.push([prevId, s.id, s.kind === "end" ? "ship" : undefined]);
      prevId = s.id;
      members.push(s.id);
      if (sx + STAGE_W > maxRight) maxRight = sx + STAGE_W;
    });
    sysItemBoxes.push({
      id: `box-${rootId}`, kind: "item", label: `${p.num} · ${p.name}`,
      members,
      x: SYS_COL - BOX_PAD, y: rootY - BOX_PAD - BOX_LABEL_H,
      w: ROOT_W + BOX_PAD * 2, h: 150 + BOX_PAD * 2 + BOX_LABEL_H,
    });
  });
  const sysBottom = sysTop + (systems.length - 1) * SECTION_PITCH + 150;
  boxes.push(...artItemBoxes, ...sysItemBoxes);

  const rightEdge = maxRight + 220;
  const bounds = {
    w: rightEdge,
    h: Math.max(sysBottom, artBottom, wContact + 300) + 160,
  };

  // three column headers, each anchored to its column's lead node (horizontal)
  const LABEL_DY = -(SECTION_LABEL_H - 12);
  const zones: Zone[] = [
    {
      label: "◆ THE CRAFT — 3D / TECHNICAL ART",
      anchor: "art-hub", dx: 0, dy: LABEL_DY,
      x: ART_X, y: ROW0 + LABEL_DY,
    },
    {
      label: "◆ START HERE — WHO I AM + HOW TO READ THIS BOARD",
      anchor: "origin", dx: 0, dy: LABEL_DY,
      x: WELCOME_X2, y: wOrigin + LABEL_DY,
    },
    {
      label: "◆ THE WORK — SYSTEMS, EACH DRAWN AS HOW IT GOT BUILT",
      anchor: `root-${systems[0]?.slug ?? ""}`, dx: 0, dy: LABEL_DY,
      x: SYS_COL, y: sysTop + LABEL_DY,
    },
  ];

  return { nodes, edges, zones, boxes, bounds };
}
