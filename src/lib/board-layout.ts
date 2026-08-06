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

export type BoardModel = {
  nodes: PlacedNode[];
  edges: [string, string, ("ship" | "art" | undefined)?][];
  zones: { label: string; x: number; y: number }[];
  bounds: { w: number; h: number };
};

/* Spread out (2026-08-07, Daman): more breathing room everywhere so the board
   uses the space instead of feeling cramped. Origin + About + How-to form a
   welcome column on the left; the work fans out to the right with wide gaps. */
const COL = {
  about: 40, // left welcome column: about / origin / how-to stack
  origin: 40,
  root: 560, // project roots — pushed right to clear the welcome column
  stage0: 900, // first DAG stage column
};
const ROOT_W = 230;
const STAGE_W = 200;
const STAGE_GAP_X = 260; // wide DAG steps
const ROOT_GAP_Y = 200; // generous vertical gap between project roots
const ROW0 = 150;

export function buildBoard(projects: Project[]): BoardModel {
  const systems = projects.filter((p) => p.discipline === "systems");
  const art = projects.filter((p) => p.discipline === "craft");

  const nodes: PlacedNode[] = [];
  const edges: BoardModel["edges"] = [];

  // LEFT WELCOME COLUMN — how-to (top) → origin → about (below)
  // The site opens focused here, so a first-time visitor is oriented.
  nodes.push({ id: "howto", role: "howto", x: COL.about, y: ROW0 - 40, w: 300 });
  nodes.push({ id: "origin", role: "origin", x: COL.origin, y: ROW0 + 190, w: 300 });
  nodes.push({ id: "about", role: "about", x: COL.about, y: ROW0 + 470, w: 300 });
  edges.push(["howto", "origin"]);
  edges.push(["origin", "about"]);

  // PROJECT ROOTS + their derived DAG stages
  let maxRight = COL.stage0;
  systems.forEach((p, i) => {
    const rootY = ROW0 + i * ROOT_GAP_Y;
    const rootId = `root-${p.slug}`;
    nodes.push({ id: rootId, role: "proj", x: COL.root, y: rootY, w: ROOT_W, project: p });
    edges.push(["origin", rootId]);

    // stages flow to the right of the root, on the root's row
    const stages = deriveStages(p);
    let prevId = rootId;
    stages.forEach((s, j) => {
      const sx = COL.stage0 + j * STAGE_GAP_X;
      // gentle vertical fan so a long chain doesn't collide with the next root
      const sy = rootY + (j % 2 === 0 ? -6 : 10) + (s.kind === "decision" ? -2 : 0);
      nodes.push({ id: s.id, role: "stage", x: sx, y: sy, w: STAGE_W, stage: s, project: p });
      edges.push([prevId, s.id, s.kind === "end" ? "ship" : undefined]);
      prevId = s.id;
      if (sx + STAGE_W > maxRight) maxRight = sx + STAGE_W;
    });
  });

  // art band sits below the work rows, spanning under the whole board
  const artBandY = ROW0 + systems.length * ROOT_GAP_Y + 110;

  // ART HUB + PLATES — the plates get room to breathe, wider gaps
  nodes.push({ id: "art-hub", role: "art", x: COL.root, y: artBandY, w: 220 });
  edges.push(["origin", "art-hub", "art"]);
  art.forEach((p, i) => {
    const px = COL.stage0 + i * 240;
    const py = artBandY + (i % 2 === 0 ? 20 : 150);
    const id = `plate-${p.slug}`;
    nodes.push({ id, role: "plate", x: px, y: py, w: 190, plate: p });
    edges.push([i === 0 ? "art-hub" : `plate-${art[i - 1].slug}`, id, "art"]);
  });

  // CONTACT — far right, aligned with the origin row
  const contactX = maxRight + 120;
  nodes.push({ id: "contact", role: "contact", x: contactX, y: ROW0 + 190, w: 220 });

  const bounds = {
    w: contactX + 280,
    h: artBandY + 300,
  };

  const zones = [
    { label: "◆ START HERE — who I am + how to read this board", x: COL.about, y: ROW0 - 84 },
    { label: "◆ THE WORK — how each system got built", x: COL.root, y: ROW0 - 40 },
    { label: "◆ THE PLATES — 3D / technical art", x: COL.root, y: artBandY - 40 },
  ];

  return { nodes, edges, zones, bounds };
}
