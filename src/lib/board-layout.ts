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
  role: "origin" | "proj" | "stage" | "plate" | "art" | "artstage" | "contact" | "about" | "howto";
  project?: Project;
  stage?: Stage;
  artStage?: ArtStage; // a step in the art pipeline (art-hub DAG)
  plate?: Project; // art project rendered as a plate
};

/** The art pipeline — Daman's real 3D/technical-art process, reconstructed from
 *  the evidence in G:\ProJect Hub (Blender + ProGen generators, Substance .spp,
 *  UE5 project + Lumen/Nanite, FBX interchange, render shot sequences, AE/
 *  Premiere comp) and the Umbraixs project overview (UE 5.6, splines for walls +
 *  river, blueprint actors, dynamic day-night + weather, stat fps/gpu profiling).
 *  Shown as the art-hub's DAG, mirroring how each systems project has one. */
export type ArtStage = { id: string; label: string; title: string; body: string };
const ART_PIPELINE: ArtStage[] = [
  { id: "art-concept", label: "Idea", title: "Concept + references",
    body: "A landscape that tells its own story — Mondstadt, BOTW, Ghibli as the north star. Refs, mood, and the shot list before any geometry." },
  { id: "art-blockout", label: "Blockout", title: "Blockout in Blender",
    body: "Grey-box the space in Blender to nail scale, composition, and leading lines. Procedural generators (castle / medieval-city / flock) author repeatable structure." },
  { id: "art-texture", label: "Look-dev", title: "Texturing — Substance",
    body: "Substance Painter + Designer for materials; sourced assets reworked through blends and masks so they read as one authored world, not a kit-bash." },
  { id: "art-assemble", label: "Assembly", title: "UE5 scene — Lumen + Nanite",
    body: "Assemble in Unreal 5.6: Lumen lighting, Nanite foliage, blueprint actors for buildings, splines driving the castle walls and the flowing river." },
  { id: "art-light", label: "Atmosphere", title: "Lighting + dynamic sky",
    body: "Fully dynamic lighting, emissive stylized materials, and a randomized weather system in cahoots with a day-night cycle for an atmosphere that feels alive." },
  { id: "art-render", label: "Ship", title: "Optimize → render → cut",
    body: "Profile with stat fps / stat gpu, tune LODs / culling / Nanite overrides (100fps on target), render the shot bank, then comp + cut in After Effects and Premiere." },
];
export function artStages(): ArtStage[] { return ART_PIPELINE; }

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
  //    Hub card at top, its PIPELINE DAG flowing to the RIGHT of the hub (only
  //    shown when the hub is expanded), then the plates stacked down the column.
  const PLATE_W = 260;
  const PLATE_H = 168;
  const PLATE_PITCH = 250;
  const ART_X = 60;
  const ART_W = 260;
  nodes.push({ id: "art-hub", role: "art", x: ART_X, y: ROW0, w: ART_W });

  // the art pipeline — a vertical DAG flowing DOWN from the hub (the art column
  // is vertical; a rightward DAG would collide with the welcome/systems columns).
  // Hidden until the hub is expanded; the plates sit below it.
  const AST_W = 260;
  const AST_PITCH = 150; // vertical step per pipeline stage
  const AST_Y0 = ROW0 + 220;
  const stagesArt = artStages();
  let prevArt = "art-hub";
  stagesArt.forEach((s, j) => {
    const sy = AST_Y0 + j * AST_PITCH;
    nodes.push({ id: s.id, role: "artstage", x: ART_X, y: sy, w: AST_W, artStage: s });
    edges.push([prevArt, s.id, "art"]);
    prevArt = s.id;
  });
  const pipelineBottom = AST_Y0 + stagesArt.length * AST_PITCH;

  // plates stack below the pipeline space so an expanded pipeline never overlaps
  const artTop = pipelineBottom + 40;
  const artItemBoxes: Box[] = [];
  art.forEach((p, i) => {
    const px = ART_X;
    const py = artTop + i * PLATE_PITCH;
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
  const artBottom = artTop + (art.length - 1) * PLATE_PITCH + PLATE_H;

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
