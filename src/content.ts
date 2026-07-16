/**
 * SINGLE SOURCE OF TRUTH for all site content.
 *
 * Everything the visitor reads lives here so copy can be tweaked without
 * touching components. Fields marked `PLACEHOLDER` are best guesses derived
 * from the GitHub profile @damanjz (which has no bio/name/location set) —
 * swap them for the real thing.
 */

export const site = {
  handle: "damanjz",
  name: "Daman", // PLACEHOLDER — confirm your preferred display name
  // Folio line, mono, uppercase — the whole positioning in three words.
  role: "Systems · Security · Local-first",
  // 00 — THESIS. The only italic on the page is the em phrase.
  thesisLead: "Local-first software. No cloud, no telemetry,",
  thesisEm: "no rent.",
  intro:
    "I'm Daman — a systems engineer in Hyderabad building software that runs entirely on your machine: hardened, measured, and yours.",
  location: "Hyderabad, IN",
  status: "Open to work",
  replies: "replies in ~24h",
  email: "hello@example.com", // PLACEHOLDER — set your real contact address
  metaTitle: "Daman — Local-first software. No cloud, no telemetry, no rent.",
  metaDescription:
    "Daman is a systems engineer in Hyderabad building local-first, security-hardened software: a Rust password manager, self-hosted AI automation, commerce systems, and native desktop apps.",
} as const;

export const socials = [
  { label: "ArtStation", handle: "@damanpsd", href: "https://www.artstation.com/damanpsd" },
  { label: "GitHub", handle: "@damanjz", href: "https://github.com/damanjz" },
  // PLACEHOLDER — set your real contact address.
  { label: "Email", handle: site.email, href: `mailto:${site.email}` },
] as const;

/**
 * The two kinds of work: systems fill the Work ledger (chapter 01);
 * craft is the archived art in the Plates band (chapter 02).
 */
export type DisciplineId = "systems" | "craft";

/**
 * Use-case categories drive the secondary filter. One primary category per
 * project. Grouped by discipline so the chip row can react to the active lens.
 */
export const categories = [
  // craft
  { id: "environment", label: "Environment", discipline: "craft" },
  { id: "product-render", label: "Product Render", discipline: "craft" },
  { id: "stylized", label: "Stylized", discipline: "craft" },
  // systems
  { id: "security", label: "Security", discipline: "systems" },
  { id: "automation", label: "Automation", discipline: "systems" },
  { id: "commerce", label: "Commerce", discipline: "systems" },
  { id: "multimedia", label: "Multimedia", discipline: "systems" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

/** A single screenshot in a project's gallery. `src` lives under /public. */
export type Shot = {
  src: string;
  alt: string;
  caption: string;
};

export type Project = {
  slug: string;
  name: string;
  num: string; // ledger number — P.01 … (systems) / PL.01 … (plates)
  tagline: string;
  discipline: DisciplineId; // systems fill the Work ledger; craft = plates
  category: CategoryId;
  description: string; // short — used on the ledger row
  stack: string[]; // mono stack list on the row + spec sheet
  status: "public" | "private" | "wip" | "live";
  href?: string;
  hrefLabel?: string; // e.g. "view source", "view on ArtStation"
  metric?: { label: string; value: string };
  year: string;
  // ---- detail-page fields ----
  summary: string; // one-line hero subtitle on the detail page
  youtube?: string; // full-length demo — YouTube video id, loaded on click only
  gallery: Shot[]; // figures — FIG.01, FIG.02 …
  sections: { heading: string; body: string }[]; // numbered chapters
  decisions?: { choice: string; reason: string }[]; // the decisions ledger table
  facts: { label: string; value: string }[]; // spec sheet sidebar
  specAccent?: string; // which spec label gets the accent (e.g. "NETWORK")
};

export const projects: Project[] = [
  {
    slug: "protec",
    name: "protec",
    num: "P.01",
    tagline: "A password manager that never phones home.",
    discipline: "systems",
    category: "security",
    description: "A password manager that never phones home.",
    stack: ["Rust", "Tauri", "Svelte", "WebExt", "Windows Hello"],
    status: "public",
    href: "https://github.com/damanjz/protec",
    metric: { label: "audit", value: "16 hardening fixes" },
    year: "2026",
    summary:
      "A password manager that never phones home — Rust core, encrypted local vault, zero cloud dependency.",
    gallery: [
      { src: "/shots/protec/vault.svg", alt: "protec vault list", caption: "The vault — entries stay encrypted on disk, revealed one at a time." },
      { src: "/shots/protec/unlock.svg", alt: "protec Windows Hello unlock", caption: "Unlock with Windows Hello — the master key never touches a server." },
      { src: "/shots/protec/extension.svg", alt: "protec browser extension autofill", caption: "The browser extension autofills over a scheme-matched, sender-verified channel." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "Every mainstream password manager is someone else's database with a subscription attached. The vault — the most sensitive file a person owns — lives on infrastructure they don't control, reachable by anyone who breaches it. The requirement was simple to state and hard to build: a vault that never leaves the disk, unlocks with hardware biometrics, and still autofills in the browser like the cloud products do.",
      },
      {
        heading: "Build",
        body: "A Rust core owns cryptography and storage; a Tauri + Svelte shell renders it. The browser extension talks to the desktop app over native messaging — no local server, no open port. Windows Hello gates every unlock.",
      },
      {
        heading: "Hardening",
        body: "A six-agent whole-codebase security audit shipped 16 fixes. Entry secrets — password, notes, TOTP seed, custom fields — zeroize on drop so they don't linger in memory. Plaintext reveals are rate-limited to block bulk exfiltration. The extension confirms nonces, matches the HTTPS scheme, and checks the message sender before it will fill anything.",
      },
    ],
    decisions: [
      { choice: "ARGON2ID > PBKDF2", reason: "memory-hard KDF; GPU farms pay full price" },
      { choice: "NATIVE MSG > LOCAL SERVER", reason: "no listening port, no CORS surface" },
      { choice: "ZEROIZE ON DROP", reason: "secrets leave memory the moment they're unused" },
    ],
    facts: [
      { label: "TYPE", value: "DESKTOP + WEBEXT" },
      { label: "CORE", value: "RUST" },
      { label: "SHELL", value: "TAURI · SVELTE" },
      { label: "UNLOCK", value: "WINDOWS HELLO" },
      { label: "NETWORK", value: "NONE" },
      { label: "AUDIT", value: "16 FIXES SHIPPED" },
      { label: "STATUS", value: "PUBLIC" },
    ],
    specAccent: "NETWORK",
  },
  {
    slug: "n8n-automation",
    name: "n8n-automation",
    num: "P.02",
    tagline: "Self-hosted AI support triage on local Ollama.",
    discipline: "systems",
    category: "automation",
    description: "Self-hosted AI support triage on local Ollama.",
    stack: ["n8n", "Ollama", "Eval-gated", "Docker"],
    status: "private",
    metric: { label: "routing", value: "88%" },
    year: "2026",
    summary:
      "A self-hosted support-triage pipeline: a local Ollama model routes tickets and drafts KB-grounded replies for human approval — every prompt change gated by an eval corpus.",
    gallery: [
      { src: "/shots/n8n-automation/dashboard.svg", alt: "triage dashboard", caption: "A live dashboard — tickets, categories, and the pending-drafts queue at a glance." },
      { src: "/shots/n8n-automation/canvas.svg", alt: "n8n workflow canvas", caption: "The intake → triage → draft pipeline on the n8n canvas." },
      { src: "/shots/n8n-automation/eval.svg", alt: "eval corpus results", caption: "The eval corpus — routing changes ship only when the numbers beat the baseline." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "Support inboxes are repetitive but not quite scriptable — routing and drafting need judgment. Cloud AI could do it, but piping a support inbox through someone else's API means paying rent on your own mail, forever. A home rig can run the model.",
      },
      {
        heading: "Build",
        body: "A self-hosted n8n pipeline: inbound support email is triaged by a local Ollama model, which routes each ticket and drafts a reply grounded in a knowledge base. Nothing sends automatically — drafts land in an approval queue for a human. A live dashboard shows tickets, stats, and the pending-drafts count, with a daily digest email.",
      },
      {
        heading: "Measurement",
        body: "No prompt change ships on gut feel. A 40-case eval corpus gates the pipeline; AI-primary routing was promoted only when it beat the rules baseline — 88% against 70%. Ops is built for unattended running: exactly-once email processing, a self-healing watchdog, nightly backups, and a stress-test suite that proves the recovery behaviour.",
      },
    ],
    decisions: [
      { choice: "LOCAL OLLAMA > CLOUD API", reason: "a support inbox never leaves the machine" },
      { choice: "EVAL CORPUS GATE", reason: "88% vs 70% baseline — measured, then shipped" },
      { choice: "HUMAN APPROVAL QUEUE", reason: "AI drafts; a person sends" },
    ],
    facts: [
      { label: "TYPE", value: "AUTOMATION PIPELINE" },
      { label: "ENGINE", value: "N8N · SELF-HOSTED" },
      { label: "MODEL", value: "LOCAL OLLAMA" },
      { label: "ROUTING", value: "88% (BASELINE 70%)" },
      { label: "COST", value: "$0 RECURRING" },
      { label: "STATUS", value: "PRIVATE" },
    ],
    specAccent: "ROUTING",
  },
  {
    slug: "volt-techwear-store",
    name: "volt-techwear-store",
    num: "P.03",
    tagline: "Techwear commerce, end to end.",
    discipline: "systems",
    category: "commerce",
    description: "Techwear commerce, end to end.",
    stack: ["Next.js 15", "Prisma", "Postgres", "NextAuth"],
    status: "public",
    href: "https://github.com/damanjz/volt-techwear-store",
    metric: { label: "stack", value: "Next 15 · Prisma 7" },
    year: "2026",
    summary:
      "VOLT HQ — a full Next.js 15 techwear storefront: membership identity, dynamic clearance leveling, secure Server Action checkouts.",
    gallery: [
      { src: "/shots/volt-techwear-store/storefront.svg", alt: "VOLT storefront", caption: "The storefront — industrial techwear aesthetic, built to feel like a product, not a demo." },
      { src: "/shots/volt-techwear-store/product.svg", alt: "product page", caption: "A product page with clearance-gated availability." },
      { src: "/shots/volt-techwear-store/checkout.svg", alt: "secure checkout", caption: "Checkout runs through secure Server Actions, not a client-trusted flow." },
    ],
    sections: [
      {
        heading: "Idea",
        body: "VOLT HQ is a techwear brand rendered as a full commerce system — 'master the urban void.' The goal was a storefront with a real point of view: industrial aesthetics, a members-only fiction (The Syndicate), and the plumbing to back it up rather than a pretty front end over nothing.",
      },
      {
        heading: "Build",
        body: "A high-performance Next.js 15 app with Tailwind v4. Persistent membership identity via NextAuth, backed by Prisma and PostgreSQL. Members hold a dynamic 'clearance level' that gates access to Black Site vaults and unlocks products. Checkout runs through secure Server Actions so the sensitive path stays on the server.",
      },
      {
        heading: "Systems, not screens",
        body: "The interesting part isn't the visuals — it's that identity, leveling, and checkout form one coherent system. Clearance state persists, drives what a member can see, and feeds the purchase flow. A full-stack exercise dressed as a brand.",
      },
    ],
    decisions: [
      { choice: "SERVER ACTIONS > CLIENT FLOW", reason: "the sensitive path never trusts the browser" },
      { choice: "CLEARANCE AS STATE", reason: "identity, gating, and checkout share one model" },
    ],
    facts: [
      { label: "TYPE", value: "COMMERCE · FULL STACK" },
      { label: "FRAMEWORK", value: "NEXT.JS 15" },
      { label: "DATA", value: "PRISMA 7 · POSTGRES" },
      { label: "AUTH", value: "NEXTAUTH" },
      { label: "CHECKOUT", value: "SERVER ACTIONS" },
      { label: "STATUS", value: "PUBLIC" },
    ],
    specAccent: "CHECKOUT",
  },
  {
    slug: "flux-player",
    name: "flux-player",
    num: "P.04",
    tagline: "A native video player that starts instantly.",
    discipline: "systems",
    category: "multimedia",
    description: "A native video player that starts instantly.",
    stack: ["Python", "PySide6"],
    status: "public",
    href: "https://github.com/damanjz/flux-player",
    metric: { label: "runtime", value: "native" },
    year: "2026",
    summary:
      "A sleek Windows video player in Python + PySide6 — a deliberate homage to Windows Media Player 12. Native desktop, no web wrapper.",
    gallery: [
      { src: "/shots/flux-player/player.svg", alt: "flux-player playing", caption: "Playback — the WMP12 silhouette, rebuilt with a modern toolkit." },
      { src: "/shots/flux-player/library.svg", alt: "flux-player library", caption: "The library view — native widgets, no browser in sight." },
    ],
    sections: [
      {
        heading: "Homage",
        body: "Windows Media Player 12 had a specific, confident look that later players abandoned. flux-player is a deliberate homage — the same silhouette and feel, rebuilt from scratch with a modern toolkit instead of nostalgia alone.",
      },
      {
        heading: "Build",
        body: "A desktop video player in Python with PySide6 (Qt). A native application — real OS widgets, real window chrome — not an Electron app pretending to be one. That choice keeps it light and makes it feel like it belongs on the desktop.",
      },
      {
        heading: "Why native",
        body: "Wrapping a web view would have been faster to build and worse to use. Going native with Qt means the player starts fast, sits at a sensible memory footprint, and behaves like desktop software — the whole point of paying tribute to a desktop-era classic.",
      },
    ],
    decisions: [
      { choice: "QT > ELECTRON", reason: "instant start, native widgets, sane memory" },
    ],
    facts: [
      { label: "TYPE", value: "DESKTOP · NATIVE" },
      { label: "LANGUAGE", value: "PYTHON" },
      { label: "TOOLKIT", value: "PYSIDE6 (QT)" },
      { label: "PLATFORM", value: "WINDOWS" },
      { label: "RUNTIME", value: "NATIVE — NO WEBVIEW" },
      { label: "STATUS", value: "PUBLIC" },
    ],
    specAccent: "RUNTIME",
  },

  /* ----------------------------------------------------------------------- */
  /*  CRAFT — 3D / art. Real renders from the project hub, optimized to WebP. */
  /* ----------------------------------------------------------------------- */
  {
    slug: "umbraixs",
    name: "Umbraixs",
    num: "PL.01",
    tagline: "A semi-stylized medieval village that reads in motion.",
    discipline: "craft",
    category: "environment",
    description:
      "A composition-driven Unreal Engine 5 environment — round stone towers, red-tiled roofs, lanterns and ivy under a soft pink-and-blue sky. My MA Animation technical showcase.",
    stack: ["Unreal Engine 5.6", "Blender", "Substance", "Lumen", "Nanite"],
    status: "live",
    href: "https://www.artstation.com/damanpsd",
    hrefLabel: "view on ArtStation",
    metric: { label: "performance", value: "~100 fps @ target" },
    year: "2026",
    summary:
      "A composition-driven, semi-stylized medieval village in Unreal Engine 5 — built to tell a story by itself and read clearly in motion. My MA Animation technical showcase.",
    youtube: "BFrPzJXAXRU",
    gallery: [
      { src: "/art/umbraixs-vista.webp", alt: "Umbraixs village vista", caption: "The establishing vista — windmill, red rooftops, a lily-pad river, stylized cumulus over hazy mountains." },
      { src: "/art/umbraixs-path.webp", alt: "Umbraixs forest path", caption: "A birch-lined path with dappled light and faint magic wisps in the shade — leading lines into the frame." },
      { src: "/art/umbraixs-shot3.webp", alt: "Umbraixs environment shot", caption: "Value grouping and light anchors do the composition work — semi-stylized so lighting reads at a glance." },
      { src: "/art/umbraixs-shot2.webp", alt: "Umbraixs environment shot", caption: "Emissive stylized materials with a fully dynamic day/night cycle and a randomized weather system." },
      { src: "/art/umbraixs-shot5.webp", alt: "Umbraixs environment shot", caption: "Blockout-to-beauty — spline-driven castle walls and river, blueprint-authored buildings." },
    ],
    sections: [
      {
        heading: "The brief",
        body: "Under a clear blue sky brushed with soft pink clouds, a quiet medieval village of round stone towers and red-tiled roofs — a landscape that tells a story by itself. Umbraixs is my MA Animation technical showcase: composition-driven, semi-stylized environment building that has to read clearly in motion. The touchstones were Genshin's Mondstadt, Zelda: Breath of the Wild, and Studio Ghibli's Howl's Moving Castle.",
      },
      {
        heading: "How it was built",
        body: "Unreal Engine 5.6 as the primary engine, with Lumen for lighting and Nanite for foliage. Buildings and workspaces are authored as Blueprint actors; the castle walls and the flowing river are spline-driven. Assets are largely sourced and then reworked — the skill is in combining and re-authoring them through material and shader edits (blends and masks) so a bought asset stops looking bought.",
      },
      {
        heading: "Lighting & atmosphere",
        body: "The lighting is fully dynamic, from street lamps to cloud caustics, with generous bloom to bring out the stylized energy. A day/night cycle drives the whole scene, and a randomized weather system runs in cahoots with it for a more authentic feel. Going semi-stylized (rather than fully) kept a firmer grip on how the environment and lighting read. Composition leans on leading lines, value grouping, and light anchors.",
      },
      {
        heading: "Making it run",
        body: "The PC target was 60 fps; it landed around 100. Getting there meant profiling with stat fps and stat gpu to find what was pulling compute down — dynamic shadows and pre-lighting composition were the culprits — then leaning on camera culling, LODs, and Nanite overrides, which saved a lot.",
      },
      {
        heading: "What broke, and what I learned",
        body: "Water reflectivity fought me every time I panned or rendered — overlapping materials where one had emission enabled — until I tracked it down and fixed it. A GPU driver update broke DirectX 12 and crashed Unreal at random, a hard lesson that the newest of everything has drawbacks. Blueprint pivot points drifted and scrambled whole classes, so I'd reset the pivot and re-add the actor at its original transform. The real takeaways were earlier planning for system integration, the economics of asset reuse, and a sharper critical eye for what a shot actually needs.",
      },
    ],
    facts: [
      { label: "TYPE", value: "MA ANIMATION SHOWCASE" },
      { label: "ENGINE", value: "UNREAL ENGINE 5.6" },
      { label: "LIGHTING", value: "LUMEN · DYNAMIC" },
      { label: "FOLIAGE", value: "NANITE" },
      { label: "PERFORMANCE", value: "~100 FPS (TARGET 60)" },
      { label: "RUNTIME", value: "~10 MIN PIECE" },
    ],
  },
  {
    slug: "cinematic-car",
    name: "Cinematic Car Render",
    num: "PL.02",
    tagline: "Studio product lighting — deep blacks, warm rim, colored gels.",
    discipline: "craft",
    category: "product-render",
    description:
      "A moody Blender studio render — a sports car lit with dramatic rim light and red/blue gels against near-black, focused on form, reflection, and restraint.",
    stack: ["Blender", "Cycles", "Compositing"],
    status: "live",
    href: "https://www.artstation.com/damanpsd",
    hrefLabel: "view on ArtStation",
    metric: { label: "focus", value: "light & form" },
    year: "2026",
    summary:
      "A moody Blender studio render — dramatic rim lighting and colored gels against near-black, all about reading form through light.",
    gallery: [
      { src: "/art/car-hero.webp", alt: "cinematic car render front", caption: "Near-black body read entirely through rim light — warm key, cool fill, minimal detail noise." },
      { src: "/art/car-2.webp", alt: "cinematic car render angle", caption: "Colored gels shape the surfaces; the environment stays dark so the silhouette carries the frame." },
    ],
    sections: [
      {
        heading: "The exercise",
        body: "This is a lighting study more than a modeling one: take a sports car into a dark studio and make it read through light alone. Deep blacks, a warm rim to describe the silhouette, and red/blue gels to give the panels shape without flooding them with detail.",
      },
      {
        heading: "The approach",
        body: "Rendered in Blender with Cycles. The restraint is the point — most of the body sits in shadow, and a few carefully placed lights do the describing. It's the same instinct as the environment work, turned inward on a single hero object: composition and value first, everything else second.",
      },
    ],
    facts: [
      { label: "TYPE", value: "LIGHTING STUDY" },
      { label: "TOOL", value: "BLENDER · CYCLES" },
      { label: "FOCUS", value: "STUDIO LIGHTING" },
      { label: "LOOK", value: "CINEMATIC · LOW-KEY" },
    ],
  },
  {
    slug: "stylized-studies",
    name: "Stylized Studies",
    num: "PL.03",
    tagline: "Toon-shaded and procedural experiments in Blender.",
    discipline: "craft",
    category: "stylized",
    description:
      "A run of stylized and procedural Blender work — clean cel-shaded objects and node-driven generators (castles, medieval cities, flocks) that build scenes from rules.",
    stack: ["Blender", "Geometry Nodes", "NPR / Toon"],
    status: "live",
    href: "https://www.artstation.com/damanpsd",
    hrefLabel: "view on ArtStation",
    metric: { label: "approach", value: "procedural" },
    year: "2026",
    summary:
      "Stylized and procedural Blender experiments — cel-shaded illustration and node-based generators that build scenes from rules, not by hand.",
    gallery: [
      { src: "/art/vending-toon.webp", alt: "toon-shaded vending machine", caption: "A cel-shaded vending machine — flat toon look, clean outlines, deliberately illustrative." },
    ],
    sections: [
      {
        heading: "Two directions",
        body: "This is a bucket for the more experimental art: on one side, non-photorealistic toon/cel-shaded pieces where the goal is a clean illustrative read; on the other, procedural work where the scene is generated from rules rather than placed by hand.",
      },
      {
        heading: "Building generators",
        body: "The procedural side is where the artist and the engineer overlap. I've built Blender generators — a castle generator, a medieval building and city generator, a flock system — using Geometry Nodes so a whole layout comes from parameters. It's the same systems instinct as the software work: make a tool, then let the tool make the output.",
      },
    ],
    facts: [
      { label: "TYPE", value: "EXPERIMENTS" },
      { label: "TOOL", value: "BLENDER · GEO NODES" },
      { label: "RANGE", value: "TOON / NPR · PROCEDURAL" },
      { label: "GENERATORS", value: "CASTLE · CITY · FLOCK" },
    ],
  },
];

/** Lookup helper for the detail route. */
export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Human label for a category id. */
export function categoryLabel(id: CategoryId): string {
  return categories.find((c) => c.id === id)?.label ?? id;
}

/**
 * PRINCIPLES — chapter 03. Four rules, R.1–R.4 (The Monograph copy).
 */
export const principles = [
  {
    tag: "R.1 — LOCAL-FIRST",
    body: "Data lives on the user's disk. Sync is a feature, not a landlord.",
  },
  {
    tag: "R.2 — MEASURED",
    body: "If it isn't evaluated, it isn't done. Evals gate every prompt; numbers over vibes.",
  },
  {
    tag: "R.3 — BUILD THE TOOL",
    body: "When the right tool doesn't exist, that becomes the project.",
  },
  {
    tag: "R.4 — HARDENED",
    body: "Threat-model first. Every dependency and surface earns its keep.",
  },
] as const;

/**
 * STACK — chapter 04. Four ledger columns (The Monograph grouping).
 */
export const stackGroups = [
  { label: "ENGINEERING", items: ["Rust", "Python", "Tauri", "PySide6"] },
  { label: "WEB", items: ["TypeScript", "Next.js 15", "Svelte", "Prisma · Postgres"] },
  { label: "OPS", items: ["Docker", "n8n", "Ollama", "GitHub Actions"] },
  { label: "3D", items: ["Unreal Engine 5", "Blender", "Substance Painter"] },
] as const;

/**
 * PLATES — chapter 02, the site's single inversion. The art archive bound in
 * as glossy plates on umber stock. Each plate links to its case study.
 */
export const platesIntro =
  "Before engineering, an animation degree. The archive stays — evidence of a trained eye, not a second career.";

export const seo = {
  url: "https://damanjz.github.io/portfolio", // update if a custom domain lands
} as const;
