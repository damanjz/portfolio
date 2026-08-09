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
  role: "origin" | "proj" | "stage" | "plate" | "art" | "artstage" | "contact" | "about" | "howto" | "work";
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

/** The engineering pipeline — how Daman builds software, mirroring the art hub.
 *  Derived from the real project decisions (protec's threat-model + 16-fix audit,
 *  n8n's eval-gated 88%-vs-70% routing, NOCTRA's pause-on-a-business-call, the
 *  Server-Actions / native-over-Electron calls) and the R.1–R.4 principles.
 *  Shown as the work-hub's DAG, the systems-side twin of the art pipeline. */
const WORK_PIPELINE: ArtStage[] = [
  { id: "work-scope", label: "Scope", title: "Scope the real problem",
    body: "Start from the actual problem, not a feature list — \"every password manager is someone else's database with a subscription.\" And pause a build when the case doesn't hold (NOCTRA): knowing when to stop is part of the work." },
  { id: "work-threat", label: "Threat-model", title: "Threat-model first",
    body: "Before code: what's the attack surface, what data must never leave the machine, what earns its keep. Local-first by default — your data lives on your disk; sync is a feature, not a landlord." },
  { id: "work-build", label: "Build", title: "Build the core",
    body: "A hardened core owns the sensitive path — a Rust engine, native messaging over a local server, Server Actions over client-trusted flows, native over Electron. When the right tool doesn't exist, that becomes the project." },
  { id: "work-measure", label: "Measure", title: "Measure, don't guess",
    body: "If it isn't evaluated, it isn't done. An eval corpus gates every prompt change — AI routing shipped only once it beat the rules baseline, 88% vs 70%. Profile before you optimize; numbers over vibes." },
  { id: "work-harden", label: "Harden", title: "Harden every surface",
    body: "Zeroize secrets on drop, rate-limit reveals, verify senders and schemes. A six-agent whole-codebase audit shipped 16 fixes on protec. Every dependency and surface earns its keep." },
  { id: "work-ship", label: "Ship", title: "Ship it running",
    body: "Built to run unattended — exactly-once processing, a self-healing watchdog, nightly backups, stress-tested recovery. $0 recurring, and yours to run." },
];
export function workStages(): ArtStage[] { return WORK_PIPELINE; }

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
  edges: [string, string, ("ship" | "art" | "out" | undefined)?][];
  zones: Zone[];
  boxes: Box[];
  bounds: { w: number; h: number };
};

/** Daman's hand-arranged board layout, exported from the live board's
 *  localStorage on 2026-08-07 and baked in as the default so it persists for
 *  everyone (not just the browser it was dragged in). Nodes here override their
 *  generated positions; RESET returns to this. Coordinates are board-space. */
const DEFAULT_POS: Record<string, { x: number; y: number }> = {
  "about": { x: -2121, y: -2411 },
  "art-assemble": { x: -1191, y: -413 },
  "art-blockout": { x: -1170, y: -638 },
  "art-concept": { x: -1525, y: -602 },
  "art-hub": { x: -1379, y: -839 },
  "art-light": { x: -1529, y: -253 },
  "art-render": { x: -1189, y: -236 },
  "art-texture": { x: -1530, y: -428 },
  "contact": { x: -2245, y: -2102 },
  "flux-player-decision": { x: 116, y: -1836 },
  "flux-player-end": { x: 612, y: -1852 },
  "flux-player-idea": { x: -129, y: -1880 },
  "flux-player-prod-0": { x: 365, y: -1886 },
  "howto": { x: -2473, y: -2542 },
  "n8n-automation-decision": { x: 101, y: -2521 },
  "n8n-automation-end": { x: 599, y: -2492 },
  "n8n-automation-idea": { x: -150, y: -2534 },
  "n8n-automation-prod-0": { x: 354, y: -2526 },
  "noctra-decision": { x: 148, y: -1283 },
  "noctra-end": { x: 673, y: -1228 },
  "noctra-idea": { x: -121, y: -1261 },
  "noctra-prod-0": { x: 415, y: -1263 },
  "origin": { x: -2111, y: -2637 },
  "plate-cinematic-car": { x: -481, y: -541 },
  "plate-cinematic-car-impl": { x: 220, y: -509 },
  "plate-cinematic-car-output": { x: 851, y: -507 },
  "plate-cinematic-car-problems": { x: 533, y: -517 },
  "plate-cinematic-car-vision": { x: -74, y: -502 },
  "plate-cityscape": { x: -528, y: 641 },
  "plate-cityscape-impl": { x: 237, y: 661 },
  "plate-cityscape-output": { x: 873, y: 688 },
  "plate-cityscape-problems": { x: 562, y: 661 },
  "plate-cityscape-vision": { x: -85, y: 670 },
  "plate-highway-stop": { x: -528, y: 943 },
  "plate-highway-stop-impl": { x: 245, y: 974 },
  "plate-highway-stop-output": { x: 869, y: 992 },
  "plate-highway-stop-problems": { x: 576, y: 966 },
  "plate-highway-stop-vision": { x: -85, y: 982 },
  "plate-interior-study": { x: -530, y: 1274 },
  "plate-interior-study-impl": { x: 246, y: 1299 },
  "plate-interior-study-output": { x: 877, y: 1326 },
  "plate-interior-study-problems": { x: 581, y: 1298 },
  "plate-interior-study-vision": { x: -82, y: 1315 },
  "plate-procedural-clouds": { x: -525, y: 335 },
  "plate-procedural-clouds-impl": { x: 241, y: 366 },
  "plate-procedural-clouds-output": { x: 863, y: 373 },
  "plate-procedural-clouds-problems": { x: 552, y: 366 },
  "plate-procedural-clouds-vision": { x: -87, y: 376 },
  "plate-product-placement-dev": { x: -504, y: 41 },
  "plate-product-placement-dev-impl": { x: 241, y: 54 },
  "plate-product-placement-dev-output": { x: 850, y: 79 },
  "plate-product-placement-dev-problems": { x: 552, y: 64 },
  "plate-product-placement-dev-vision": { x: -71, y: 71 },
  "plate-stylized-studies": { x: -488, y: -246 },
  "plate-stylized-studies-impl": { x: 242, y: -236 },
  "plate-stylized-studies-output": { x: 847, y: -211 },
  "plate-stylized-studies-problems": { x: 556, y: -236 },
  "plate-stylized-studies-vision": { x: -73, y: -227 },
  "plate-umbraixs": { x: -478, y: -863 },
  "plate-umbraixs-impl": { x: 234, y: -877 },
  "plate-umbraixs-output": { x: 849, y: -842 },
  "plate-umbraixs-problems": { x: 544, y: -852 },
  "plate-umbraixs-vision": { x: -69, y: -851 },
  "protec-decision": { x: 92, y: -2793 },
  "protec-end": { x: 591, y: -2764 },
  "protec-idea": { x: -156, y: -2797 },
  "protec-prod-0": { x: 338, y: -2799 },
  "root-flux-player": { x: -435, y: -1888 },
  "root-n8n-automation": { x: -430, y: -2506 },
  "root-noctra": { x: -439, y: -1251 },
  "root-protec": { x: -437, y: -2797 },
  "root-umbra": { x: -435, y: -1582 },
  "root-volt-techwear-store": { x: -433, y: -2210 },
  "umbra-decision": { x: 125, y: -1586 },
  "umbra-end": { x: 634, y: -1541 },
  "umbra-idea": { x: -131, y: -1584 },
  "umbra-prod-0": { x: 375, y: -1583 },
  "volt-techwear-store-decision": { x: 112, y: -2185 },
  "volt-techwear-store-end": { x: 612, y: -2167 },
  "volt-techwear-store-idea": { x: -141, y: -2219 },
  "volt-techwear-store-prod-0": { x: 359, y: -2228 },
  "work-build": { x: -1492, y: -2181 },
  "work-harden": { x: -1490, y: -1928 },
  "work-hub": { x: -1358, y: -2659 },
  "work-measure": { x: -1215, y: -2170 },
  "work-scope": { x: -1500, y: -2426 },
  "work-ship": { x: -1195, y: -1919 },
  "work-threat": { x: -1241, y: -2395 },
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
    // each plate links to the 3D/technical-art HUB directly — NOT chained to the
    // next plate (Daman): the hub is the shared pipeline, every piece hangs off it.
    edges.push(["art-hub", id, "art"]);
    // per-plate DAG: vision → implementation → problems → output, flowing RIGHT
    // of the plate — laid out like the systems projects (one clean row). Stages
    // are box MEMBERS so the item box wraps the whole extended tree when open
    // (Board's liveBox counts only VISIBLE members → collapsed box hugs the
    // plate, open box grows to the full row). Shown only when the plate is open.
    const members = [id];
    if (p.artDag) {
      const steps: [string, string, string][] = [
        ["vision", "Vision", p.artDag.vision],
        ["impl", "Implementation", p.artDag.implementation],
        ["problems", "Problems faced", p.artDag.problems],
        ["output", "Output", p.artDag.output],
      ];
      const dagX0 = px + PLATE_W + PDAG_GAP; // first stage clears the plate
      let prevP = id;
      steps.forEach(([key, label, body], j) => {
        const sid = `${id}-${key}`;
        nodes.push({
          id: sid, role: "artstage", x: dagX0 + j * PDAG_GAP, y: py, w: PDAG_W,
          artStage: { id: sid, label, title: label, body },
        });
        // the wire INTO the "output" step gets a distinct colour (Daman) — the
        // final hop into each art project's Output node reads apart from the
        // amber art wires (a teal-blue "out" wire).
        edges.push([prevP, sid, key === "output" ? "out" : "art"]);
        prevP = sid;
        members.push(sid);
      });
    }
    artItemBoxes.push({
      id: `box-${id}`, kind: "item", label: `${p.num} · ${p.name}`,
      members,
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
  // WORK HUB — the engineering-process card, the systems-side twin of the art
  // hub. Sits above the project roots; its pipeline DAG flows RIGHT (like the
  // project DAGs), shown only when the hub is expanded. "How I build software"
  // before the individual builds.
  const workHubY = ROW0 - 260;
  const sysTop = ROW0 + 40;
  let maxRight = SYS_STAGE0;
  const sysItemBoxes: Box[] = [];

  nodes.push({ id: "work-hub", role: "work", x: SYS_COL, y: workHubY, w: ROOT_W });
  // colored branch like the art hub (art uses "art"; systems uses "ship")
  edges.push(["origin", "work-hub", "ship"]);
  {
    const stagesWork = workStages();
    const wMembers = ["work-hub"];
    let prevWork = "work-hub";
    stagesWork.forEach((s, j) => {
      const sx = SYS_STAGE0 + j * STAGE_GAP_X;
      nodes.push({ id: s.id, role: "artstage", x: sx, y: workHubY, w: STAGE_W, artStage: s });
      edges.push([prevWork, s.id, "ship"]);
      prevWork = s.id;
      wMembers.push(s.id);
      if (sx + STAGE_W > maxRight) maxRight = sx + STAGE_W;
    });
    sysItemBoxes.push({
      id: "box-work-hub", kind: "item", label: "THE WORK · HOW I BUILD",
      members: wMembers,
      x: SYS_COL - BOX_PAD, y: workHubY - BOX_PAD - BOX_LABEL_H,
      w: ROOT_W + BOX_PAD * 2, h: 150 + BOX_PAD * 2 + BOX_LABEL_H,
    });
  }

  systems.forEach((p, i) => {
    const rootY = sysTop + i * SECTION_PITCH;
    const rootId = `root-${p.slug}`;
    nodes.push({ id: rootId, role: "proj", x: SYS_COL, y: rootY, w: ROOT_W, project: p });
    // every systems project branches out of the WORK HUB (Daman) — the flow reads
    // "here's how I build → and here's everything it produced". Colored "ship"
    // wire so the fan-out reads like the art hub's colored branch to its plates.
    edges.push(["work-hub", rootId, "ship"]);

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
