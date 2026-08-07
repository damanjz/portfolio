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

/** Daman's hand-arranged board layout, exported from the live board's
 *  localStorage on 2026-08-07 and baked in as the default so it persists for
 *  everyone (not just the browser it was dragged in). Nodes here override their
 *  generated positions; RESET returns to this. Coordinates are board-space. */
const DEFAULT_POS: Record<string, { x: number; y: number }> = {
  "art-texture": { x: -340, y: 574 },
  "root-n8n-automation": { x: 1740, y: -113 },
  "plate-umbraixs": { x: -901, y: 110 },
  "plate-cinematic-car": { x: -882, y: 429 },
  "plate-stylized-studies": { x: -916, y: 755 },
  "plate-product-placement-dev": { x: -901, y: 1100 },
  "plate-procedural-clouds": { x: -901, y: 1430 },
  "plate-cityscape": { x: -1407, y: 110 },
  "plate-highway-stop": { x: -1407, y: 770 },
  "plate-interior-study": { x: -1407, y: 1100 },
  "art-render": { x: -16, y: 950 },
  "art-light": { x: -352, y: 825 },
  "art-assemble": { x: -17, y: 692 },
  "art-concept": { x: -343, y: 347 },
  "art-blockout": { x: -25, y: 422 },
  "howto": { x: 438, y: 371 },
  "about": { x: 788, y: 375 },
  "contact": { x: 792, y: 695 },
  "root-protec": { x: 1468, y: -710 },
  "protec-idea": { x: 1769, y: -694 },
  "protec-decision": { x: 1492, y: -485 },
  "protec-prod-0": { x: 1768, y: -428 },
  "protec-end": { x: 2063, y: -600 },
  "root-volt-techwear-store": { x: 1771, y: 411 },
  "root-flux-player": { x: 1783, y: 1097 },
  "root-noctra": { x: 1572, y: 2224 },
  "root-umbra": { x: 1684, y: 1643 },
  "n8n-automation-idea": { x: 2031, y: -115 },
  "n8n-automation-decision": { x: 1745, y: 108 },
  "n8n-automation-prod-0": { x: 2032, y: 128 },
  "n8n-automation-end": { x: 2297, y: 35 },
  "volt-techwear-store-idea": { x: 2125, y: 466 },
  "volt-techwear-store-decision": { x: 1851, y: 705 },
  "volt-techwear-store-prod-0": { x: 2132, y: 746 },
  "volt-techwear-store-end": { x: 2382, y: 648 },
  "flux-player-idea": { x: 2062, y: 1087 },
  "flux-player-decision": { x: 1791, y: 1312 },
  "flux-player-prod-0": { x: 2060, y: 1325 },
  "flux-player-end": { x: 2339, y: 1180 },
  "noctra-idea": { x: 1865, y: 2224 },
  "noctra-decision": { x: 1587, y: 2473 },
  "noctra-prod-0": { x: 1866, y: 2483 },
  "noctra-end": { x: 2124, y: 2395 },
  "umbra-idea": { x: 1960, y: 1643 },
  "umbra-decision": { x: 1701, y: 1913 },
  "umbra-prod-0": { x: 1975, y: 1916 },
  "umbra-end": { x: 2235, y: 1824 },
  "art-hub": { x: -277, y: 100 },
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
const STAGE_GAP_X = 268; // horizontal DAG step — tightened so the chain reads as
                         //  a connected flow, not far-flung islands (Daman)
const ROW0 = 160;
const WELCOME_X = 60;
const WELCOME_W = 320;

const SECTION_LABEL_H = 56; // header band the ◆ label lives in (clear of cards)
const SECTION_PITCH = 300; // vertical distance between systems sections — closer,
                           //  more natural stack (still clears an open DAG row +
                           //  the next label band; collapsed cards are ~150px)
const COL_GAP = 260; // gap between columns

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
  const PLATE_W = 360; // bigger artwork cards (Daman) — was 260
  const PLATE_H = 234;  // keep ~3:2, scaled up from 168
  const PLATE_PITCH = 330; // room for the taller cards + their label band
  const ART_X = 60;
  const ART_W = 300;
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
  const PDAG_W = 250;   // per-plate DAG stage width
  const PDAG_GAP = 274; // horizontal step
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
    // per-plate DAG: vision → implementation → problems → output, flowing RIGHT
    // of the plate. Shown only when this plate is expanded (Board gates on open).
    if (p.artDag) {
      const steps: [string, string, string][] = [
        ["vision", "Vision", p.artDag.vision],
        ["impl", "Implementation", p.artDag.implementation],
        ["problems", "Problems faced", p.artDag.problems],
        ["output", "Output", p.artDag.output],
      ];
      const dagX0 = px + PLATE_W + 90;
      let prevP = id;
      steps.forEach(([key, label, body], j) => {
        const sid = `${id}-${key}`;
        nodes.push({
          id: sid, role: "artstage", x: dagX0 + j * PDAG_GAP, y: py, w: PDAG_W,
          artStage: { id: sid, label, title: label, body },
        });
        edges.push([prevP, sid, "art"]);
        prevP = sid;
      });
    }
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

  // ── Daman's hand-arranged layout (exported from the live board 2026-08-07) ──
  //    baked in as the DEFAULT positions so the arrangement persists for every
  //    visitor / device, not just this browser's localStorage. Any node not
  //    listed keeps its computed position; RESET returns to this arrangement.
  for (const n of nodes) {
    const p = DEFAULT_POS[n.id];
    if (p) { n.x = p.x; n.y = p.y; }
  }

  // recompute bounds from the ACTUAL positions (the arrangement spreads wider /
  // higher than the generated columns, incl. negative coords to the left of 0)
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  for (const n of nodes) {
    bx0 = Math.min(bx0, n.x); by0 = Math.min(by0, n.y);
    bx1 = Math.max(bx1, n.x + n.w); by1 = Math.max(by1, n.y + 300); // +300 ≈ tall open card
  }
  void maxRight; void sysBottom; void artBottom; // superseded by measured bounds
  const bounds = {
    w: bx1 - Math.min(0, bx0) + 220,
    h: by1 - Math.min(0, by0) + 220,
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
