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
  role: "origin" | "proj" | "stage" | "plate" | "art" | "contact";
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

const COL = {
  origin: 40,
  root: 360,
  stage0: 640, // first stage column; stages step right from here
};
const ROOT_W = 210;
const STAGE_W = 176;
const STAGE_GAP_X = 200;
const ROOT_GAP_Y = 132; // vertical gap between project roots
const ROW0 = 96;

export function buildBoard(projects: Project[]): BoardModel {
  const systems = projects.filter((p) => p.discipline === "systems");
  const art = projects.filter((p) => p.discipline === "craft");

  const nodes: PlacedNode[] = [];
  const edges: BoardModel["edges"] = [];

  // ORIGIN
  nodes.push({ id: "origin", role: "origin", x: COL.origin, y: ROW0, w: 262 });

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

  const artBandY = ROW0 + systems.length * ROOT_GAP_Y + 40;

  // ART HUB + PLATES
  nodes.push({ id: "art-hub", role: "art", x: COL.origin + 60, y: artBandY, w: 190 });
  edges.push(["origin", "art-hub", "art"]);
  art.forEach((p, i) => {
    const px = COL.root + i * 190;
    const py = artBandY + (i % 2 === 0 ? 60 : 96);
    const id = `plate-${p.slug}`;
    nodes.push({ id, role: "plate", x: px, y: py, w: 158, plate: p });
    edges.push([i === 0 ? "art-hub" : `plate-${art[i - 1].slug}`, id, "art"]);
  });

  // CONTACT — far right, on the origin row
  const contactX = maxRight + 90;
  nodes.push({ id: "contact", role: "contact", x: contactX, y: ROW0, w: 196 });

  const bounds = {
    w: contactX + 240,
    h: artBandY + 96 + 140 + 60,
  };

  const zones = [
    { label: "◆ ORIGIN", x: COL.origin, y: ROW0 - 40 },
    { label: "◆ THE WORK — how each system got built", x: COL.root, y: ROW0 - 40 },
    { label: "◆ THE PLATES — 3D / technical art", x: COL.origin + 60, y: artBandY - 34 },
  ];

  return { nodes, edges, zones, bounds };
}
