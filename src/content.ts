/**
 * SINGLE SOURCE OF TRUTH for all site content. Everything the visitor reads
 * lives here; components only lay it out.
 */

export const site = {
  handle: "damanjz",
  name: "Daman Reddy",
  role: "AI agents and data systems, BI analyst, 3D environment artist",
  location: "Hyderabad, IN",
  status: "Open to work",
  // landing intro
  bio: "Agents graded by their own evals. Reports where every number reconciles to SQL. All of it runs on local models.",
  email: "daman.w3d@gmail.com", // public work contact
  // Title < 60 chars (Google truncates ~60); keywords front-loaded.
  metaTitle: "Daman Reddy: AI Agents, Data Systems and BI",
  // Description < 160 chars (Google truncates ~155); primary keywords early.
  metaDescription:
    "Daman Reddy, Hyderabad: AI agents graded by their own evals, BI reports reconciled to SQL (Power BI, Tableau), local models. Also a 3D environment artist.",
} as const;

export const socials = [
  { label: "ArtStation", handle: "@damanpsd", href: "https://www.artstation.com/damanpsd" },
  { label: "GitHub", handle: "@damanjz", href: "https://github.com/damanjz" },
  { label: "Email me", handle: site.email, href: `mailto:${site.email}` },
] as const;

/** Two disciplines; trackOf() maps them (plus the analytics category) onto the three doors. */
export type DisciplineId = "systems" | "craft";

/** One category per project, shown as a label on cards and case studies. */
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
  { id: "analytics", label: "Analytics", discipline: "systems" },
  { id: "productivity", label: "Productivity", discipline: "systems" },
  { id: "applied-ai", label: "Applied AI", discipline: "systems" },
  { id: "integration", label: "Integration", discipline: "systems" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

/** A single screenshot in a project's gallery. `src` lives under /public. */
export type Shot = {
  src: string;
  alt: string;
  caption: string;
};

/** A locally-hosted video reel. `src`/`poster` live under /public. `portrait`
 *  flags 9:16 sources so the figure renders in a capped portrait frame. */
export type Reel = {
  src: string;
  poster: string;
  caption: string;
  portrait?: boolean;
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  discipline: DisciplineId;
  category: CategoryId;
  stack: string[];
  status: "public" | "private" | "wip" | "live";
  href?: string;
  hrefLabel?: string; // e.g. "view source", "view on ArtStation"
  metric?: { label: string; value: string };
  caseStudy?: string; // PDF under /public, linked from the case-study page
  repo?: string; // source link when href points somewhere else (e.g. a live dashboard)
  year: string;
  // ---- detail-page fields ----
  summary: string; // case-study intro
  youtube?: string; // full-length demo — YouTube video id, loaded on click only
  reels?: Reel[]; // locally-hosted video reels — no external request, played on click
  gallery: Shot[];
  sections: { heading: string; body: string }[];
  decisions?: { choice: string; reason: string }[];
  facts: { label: string; value: string }[];
  pipeline?: Pipeline; // drawn as a pipeline card instead of a screenshot
  cover?: Shot; // case-page cover when the card image can't take that crop (wide, with scroll parallax)
};

/** A pipeline card: what goes in, the core, what comes out, four numbers (the first leads).
 *  Each card has its own layout and colour so no two look alike. */
export type Pipeline = {
  mark: "bars" | "people" | "cross" | "network" | "lock" | "play" | "leak";
  layout: "ledger" | "spotlight" | "rail" | "network" | "split" | "stack" | "transport";
  accent: string;
  onAccent?: string; // text on the accent when the accent is light
  status: string;
  live?: boolean;
  flow: [{ name: string; note: string }, { name: string; note: string }, { name: string; note: string }];
  stats: { value: string; label: string }[];
};

export const projects: Project[] = [
  {
    slug: "protec",
    name: "protec",
    tagline: "A password manager that never phones home.",
    discipline: "systems",
    category: "security",
    stack: ["Rust", "Tauri", "Svelte", "WebExt", "Windows Hello"],
    status: "public",
    href: "https://github.com/damanjz/protec",
    metric: { label: "audit", value: "16 hardening fixes" },
    pipeline: {
      mark: "lock",
      layout: "stack",
      accent: "#3b82f6",
      status: "Public repo",
      flow: [
        { name: "Browser extension", note: "native messaging · no port" },
        { name: "Rust core", note: "Argon2id · zeroize on drop" },
        { name: "Vault on disk", note: "encrypted · never leaves" },
      ],
      stats: [
        { value: "16", label: "hardening fixes shipped" },
        { value: "0", label: "open ports" },
        { value: "6", label: "areas in the audit" },
        { value: "Hello", label: "optional Windows unlock" },
      ],
    },
    year: "Jun 2026", // repo created 2026-06-20
    summary:
      "A password manager that never phones home: Rust core, encrypted local vault, no cloud dependency.",
    gallery: [
      { src: "/shots/protec/app.webp", alt: "Protec's vault with an entry open: username, revealed password, URL, notes and tags (demo data)", caption: "The vault, with demo entries: one secret revealed at a time, copied with a shortcut, cleared from the clipboard after." },
      { src: "/shots/protec/how-it-works.webp", alt: "Diagram: browser extension to desktop app over native messaging, Windows Hello unlock, Rust core encryption, vault file on disk", caption: "How it works: the extension talks to the app over native messaging, optional Windows Hello unlock, and the Rust core encrypts a vault that never leaves the disk." },
      { src: "/shots/protec/command-palette.webp", alt: "Protec command palette listing commands and fuzzy-matched vault entries", caption: "Ctrl+K command palette: run commands or jump to any entry. Demo entries on example.com." },
      { src: "/shots/protec/generator.webp", alt: "Protec password generator dialog with length slider and character-class toggles", caption: "Password generator: length and character classes. The result shown is a fixed demo string from the stand-in backend." },
      { src: "/shots/protec/terminal-green.webp", alt: "Protec main view in the Terminal Green theme with the GitHub entry revealed", caption: "Terminal Green theme with an entry revealed. Demo entry and password, not real credentials." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "Every mainstream password manager is someone else's database with a subscription attached. The vault, the most sensitive file a person owns, lives on infrastructure they don't control, reachable by anyone who breaches it. The requirement was simple to state and hard to build: a vault that never leaves the disk, unlocks with hardware biometrics, and still autofills in the browser like the cloud products do.",
      },
      {
        heading: "Build",
        body: "A Rust core owns cryptography and storage; a Tauri + Svelte shell renders it. The browser extension talks to the desktop app over native messaging, with no local server and no open port. Windows Hello is an optional extra unlock; the master password always works.",
      },
      {
        heading: "Hardening",
        body: "A six-area whole-codebase security audit shipped 16 fixes. Entry secrets (password, notes, TOTP seed, custom fields) zeroize on drop so they don't linger in memory. Plaintext reveals are rate-limited to block bulk exfiltration. The extension confirms nonces, matches the HTTPS scheme, and checks the message sender before it will fill anything.",
      },
    ],
    decisions: [
      { choice: "Argon2id over PBKDF2", reason: "memory-hard KDF; GPU farms pay full price" },
      { choice: "Native messaging over local server", reason: "no listening port, no CORS surface" },
      { choice: "Zeroize on drop", reason: "secrets leave memory the moment they're unused" },
    ],
    facts: [
      { label: "Type", value: "Desktop + WebExt" },
      { label: "Core", value: "Rust" },
      { label: "Shell", value: "Tauri, Svelte" },
      { label: "Unlock", value: "Password, optional Hello" },
      { label: "Network", value: "None" },
      { label: "Audit", value: "16 fixes shipped" },
      { label: "Release", value: "v0.2.0 · WIN + MAC (EXP.)" },
      { label: "Status", value: "Public" },
    ],
  },
  {
    slug: "n8n-automation",
    name: "n8n-automation",
    tagline: "Self-hosted AI support triage on local Ollama.",
    discipline: "systems",
    category: "automation",
    stack: ["n8n", "Ollama", "Eval-gated", "Node"],
    status: "public",
    href: "https://github.com/damanjz/n8n-ai-triage",
    metric: { label: "routing", value: "88%" },
    year: "2026",
    summary:
      "A self-hosted support-triage pipeline: a local Ollama model routes tickets and drafts KB-grounded replies for human approval. Every prompt change is gated by an eval corpus.",
    gallery: [
      { src: "/shots/n8n-automation/canvas.webp", alt: "n8n canvas of a separate guardrails test workflow: test cases fan out to guardrail checks for jailbreaks, NSFW content, PII, secret keys and topic drift, each with pass and fail paths, collected by a results node", caption: "A separate guardrails test workflow on n8n: test cases fan out to checks for jailbreaks, NSFW content, PII, secret keys and topic drift, each with a pass and a fail path. The triage pipeline itself runs on local Ollama." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "Support inboxes are repetitive but not quite scriptable: routing and drafting need judgment. Cloud AI could do it, but piping a support inbox through someone else's API means paying rent on your own mail, forever. A home rig can run the model.",
      },
      {
        heading: "Build",
        body: "A self-hosted n8n pipeline: inbound support email is triaged by a local Ollama model, which routes each ticket and drafts a reply grounded in a knowledge base. Nothing sends automatically. Drafts land in an approval queue for a human. A live dashboard shows tickets, stats, and the pending-drafts count, with a daily digest email.",
      },
      {
        heading: "Measurement",
        body: "No prompt change ships on gut feel. A 40-case eval corpus gates the pipeline; AI-primary routing was promoted only when it beat the rules baseline, 88% against 70%. Ops is built for unattended running: exactly-once email processing, a keep-alive task at logon, nightly backups, and a stress-test suite that proves the recovery behaviour.",
      },
    ],
    decisions: [
      { choice: "Local Ollama over cloud API", reason: "a support inbox never leaves the machine" },
      { choice: "Eval corpus gate", reason: "88% vs 70% baseline: measured, then shipped" },
      { choice: "Human approval queue", reason: "AI drafts; a person sends" },
    ],
    facts: [
      { label: "Type", value: "Automation pipeline" },
      { label: "Engine", value: "n8n, self-hosted" },
      { label: "Model", value: "Local Ollama" },
      { label: "Routing", value: "88% (baseline 70%)" },
      { label: "Cost", value: "$0 recurring" },
      { label: "Status", value: "Public mirror" },
    ],
  },
  {
    slug: "volt-techwear-store",
    name: "volt-techwear-store",
    tagline: "Techwear commerce, end to end.",
    discipline: "systems",
    category: "commerce",
    stack: ["Next.js 15", "Prisma", "Postgres", "NextAuth"],
    status: "live",
    href: "https://volt-techwear-store.vercel.app",
    hrefLabel: "open the live store",
    repo: "https://github.com/damanjz/volt-techwear-store",
    metric: { label: "stack", value: "Next 15, Prisma 6" },
    year: "Mar 2026", // repo created 2026-03-13
    summary:
      "VOLT HQ is a full Next.js 15 techwear storefront with membership identity, dynamic clearance leveling and Server Action checkouts.",
    gallery: [
      { src: "/shots/volt-techwear-store/shop.webp", alt: "VOLT archive page: product grid of techwear with category filters", caption: "The archive: category filters, search and sort over the full catalogue." },
      { src: "/shots/volt-techwear-store/home.webp", alt: "VOLT home page: DEFY LIMITS hero with the current drop", caption: "The storefront: an industrial techwear look over a working shop." },
      { src: "/shots/volt-techwear-store/product-detail.webp", alt: "VOLT product page for the Phantom Shell Windbreaker with size selector and Add to Loadout button", caption: "Product detail page: size picker, stock state and add-to-cart. Demo catalogue and prices from the local seed database." },
      { src: "/shots/volt-techwear-store/cart-drawer.webp", alt: "VOLT cart drawer listing one Phantom Shell Windbreaker, size M, with coupon field and subtotal", caption: "Loadout drawer after adding an item: quantity controls, coupon field, subtotal. Demo data." },
      { src: "/shots/volt-techwear-store/black-site.webp", alt: "VOLT Black Site page with locked classified product cards", caption: "Black Site: members-only drop with locked prototype cards for signed-out visitors. Demo data." },
    ],
    sections: [
      {
        heading: "Idea",
        body: "VOLT HQ is a techwear brand rendered as a full commerce system, under the line 'master the urban void.' The storefront has industrial aesthetics and a members-only fiction (The Syndicate), with working accounts, gating and checkout behind it.",
      },
      {
        heading: "Build",
        body: "A Next.js 15 app with Tailwind v4. Persistent membership identity via NextAuth, backed by Prisma and PostgreSQL. Members hold a dynamic 'clearance level' that gates access to Black Site vaults and unlocks products. Checkout runs through secure Server Actions so the sensitive path stays on the server.",
      },
      {
        heading: "Systems, not screens",
        body: "Identity, leveling and checkout share one model. Clearance state persists, drives what a member can see, and feeds the purchase flow.",
      },
    ],
    decisions: [
      { choice: "Server actions over client flow", reason: "the sensitive path never trusts the browser" },
      { choice: "Clearance as state", reason: "identity, gating, and checkout share one model" },
    ],
    facts: [
      { label: "Type", value: "Commerce, full stack" },
      { label: "Framework", value: "Next.js 15" },
      { label: "Data", value: "Prisma 6, Postgres" },
      { label: "Auth", value: "NextAuth" },
      { label: "Checkout", value: "Server actions" },
      { label: "Status", value: "LIVE · v1.0.0" },
    ],
  },
  {
    slug: "flux-player",
    name: "flux-player",
    tagline: "A native video player that starts instantly.",
    discipline: "systems",
    category: "multimedia",
    stack: ["Python", "PySide6"],
    status: "public",
    href: "https://github.com/damanjz/flux-player",
    metric: { label: "runtime", value: "native" },
    pipeline: {
      mark: "play",
      layout: "transport",
      accent: "#14b8a6",
      onAccent: "#04201d",
      status: "Public repo",
      flow: [
        { name: "Your videos", note: "local files · playlist" },
        { name: "Qt player", note: "Python · PySide6" },
        { name: "Windows desktop", note: "native widgets · no webview" },
      ],
      stats: [
        { value: "0", label: "web views" },
        { value: "WMP 12", label: "layout homage" },
        { value: "Qt", label: "native widgets" },
        { value: "Python", label: "PySide6" },
      ],
    },
    year: "Mar 2026", // repo created 2026-03-10
    summary:
      "A Windows video player in Python and PySide6, built as a homage to Windows Media Player 12. Native desktop, no web wrapper.",
    gallery: [
      { src: "/shots/flux-player/player.webp", alt: "Flux Player playing a portrait guitar reel, with the seek bar, transport controls and Now Playing list", caption: "Playback: the Windows Media Player 12 layout rebuilt in Qt, with the Now Playing list beside the video." },
      { src: "/shots/flux-player/player-2.webp", alt: "Flux Player paused on a close-up of guitar pickups and a painted body", caption: "Native controls: seek, speed, repeat and shuffle, no browser underneath." },
      { src: "/shots/flux-player/menu.webp", alt: "Flux Player with the Play menu open: play, stop, previous, next, playback speed, repeat, shuffle", caption: "Keyboard-first: every control has a shortcut in the Play menu." },
      { src: "/shots/flux-player/speed-menu.webp", alt: "Flux Player with the Play menu and Playback Speed submenu open, 1.5x checked", caption: "Play menu with the playback speed submenu (1.5x selected) over a paused reel. Demo clips from the portfolio's own art reels." },
      { src: "/shots/flux-player/context-menu.webp", alt: "Flux Player right-click menu over a paused guitar reel, shuffle on", caption: "Right-click menu on the video: play, stop, previous, next, fullscreen, open. Shuffle and repeat-all enabled." },
    ],
    sections: [
      {
        heading: "Homage",
        body: "Windows Media Player 12 had a specific, confident look that later players abandoned. flux-player is a deliberate homage: the same silhouette and feel, rebuilt from scratch with a modern toolkit.",
      },
      {
        heading: "Build",
        body: "A desktop video player in Python with PySide6 (Qt). A native application with real OS widgets and real window chrome, and no Electron underneath. That choice keeps it light and makes it feel like it belongs on the desktop.",
      },
      {
        heading: "Why native",
        body: "Wrapping a web view would have been faster to build and worse to use. Going native with Qt means the player starts fast, sits at a sensible memory footprint, and behaves like desktop software, which is the point of a tribute to a desktop-era classic.",
      },
    ],
    decisions: [
      { choice: "Qt over Electron", reason: "instant start, native widgets, sane memory" },
    ],
    facts: [
      { label: "Type", value: "Desktop, native" },
      { label: "Language", value: "Python" },
      { label: "Toolkit", value: "PySide6 (Qt)" },
      { label: "Platform", value: "Windows" },
      { label: "Runtime", value: "Native, no WebView" },
      { label: "Status", value: "Public" },
    ],
  },
  {
    slug: "ai-calendar",
    name: "ai-calendar",
    tagline: "A calendar that people and AI assistants book into, behind one conflict check.",
    discipline: "systems",
    category: "productivity",
    stack: ["React 19", "Vite", "Node", "Express 5", "node:test"],
    status: "public",
    href: "https://github.com/damanjz/ai-calendar",
    hrefLabel: "view source",
    metric: { label: "tests", value: "177, ~96% coverage" },
    year: "Aug 2026",
    summary:
      "An open-source calendar with a web app and a REST API, so an AI assistant can check availability, spot conflicts and book events in a local calendar, with adapters for Google, Outlook and CalDAV.",
    gallery: [
      { src: "/shots/ai-calendar/month.webp", alt: "AI Calendar month view with work and personal events (demo data booked through the API)", caption: "Month view, with demo events that were booked through the API, the same way an assistant would." },
      { src: "/shots/ai-calendar/how-it-works.webp", alt: "Diagram: an AI assistant and people both use one REST API, which checks conflicts and writes to calendar providers", caption: "How it works: the assistant and the web app share one API, so the same conflict check guards every booking." },
      { src: "/shots/ai-calendar/booking.webp", alt: "The booking form: title, calendar, date, start and end, location, description, attendees", caption: "Booking by hand goes through the same endpoint and the same conflict rules." },
      { src: "/shots/ai-calendar/conflict.webp", alt: "AI Calendar booking dialog warning that the new slot overlaps Data review", caption: "Conflict detection: booking 10:00 to 11:00 is flagged against an existing 10:30 event before anything is saved. Demo events." },
      { src: "/shots/ai-calendar/week.webp", alt: "AI Calendar week view of 4 to 10 October 2026 with work and personal events", caption: "Week view with work and personal calendars colour-coded. Demo events." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "AI assistants can talk about a schedule but can't safely act on it. Every calendar service has its own API, and nothing stops an assistant from double-booking someone.",
      },
      {
        heading: "Build",
        body: "One npm workspace: a React 19 web app (month, week, day and agenda views, drag to reschedule) and a Node and Express 5 API with endpoints for availability, conflicts, booking and editing. Providers share one contract: a local file by default, plus Google, Outlook and CalDAV adapters. Repeating events, working hours, time zones, reminders, search and ICS import and export are all built in, and a written guide tells assistants how to use the API.",
      },
      {
        heading: "Measurement",
        body: "177 automated tests across 15 suites, about 96% line coverage, run by GitHub Actions on every push to master and every pull request. Code-review findings were written as failing tests first, then fixed. The Google, Outlook and CalDAV adapters are tested against stand-ins; the local provider is the one running for real.",
      },
    ],
    decisions: [
      { choice: "Conflicts in the API", reason: "assistants get the same check as the UI; double-booking needs an explicit override" },
      { choice: "localhost by default", reason: "listens on 127.0.0.1 only, with an optional API key" },
      { choice: "One test runner", reason: "Node's built-in runner, no extra frameworks to maintain" },
    ],
    facts: [
      { label: "Type", value: "Web app + REST API" },
      { label: "Front end", value: "React 19, Vite" },
      { label: "API", value: "Node, Express 5" },
      { label: "Providers", value: "Local, 3 adapters" },
      { label: "Tests", value: "177, ~96% coverage" },
      { label: "Status", value: "Public repo" },
    ],
  },
  {
    slug: "obsidian-vault-mcp",
    name: "obsidian-vault-mcp",
    tagline: "A read-only MCP server that lets an AI assistant search an Obsidian vault.",
    discipline: "systems",
    category: "productivity",
    stack: ["TypeScript", "MCP SDK", "zod", "Node", "node:test"],
    status: "public",
    href: "https://github.com/damanjz/obsidian-vault-mcp",
    hrefLabel: "view source",
    metric: { label: "tests", value: "49, unit + end to end" },
    pipeline: {
      mark: "network",
      layout: "stack",
      accent: "#f43f5e",
      status: "Public repo",
      flow: [
        { name: "AI assistant", note: "any MCP client · stdio" },
        { name: "MCP server", note: "5 read-only tools" },
        { name: "Markdown vault", note: "on disk · never written" },
      ],
      stats: [
        { value: "49", label: "tests, unit + end to end" },
        { value: "0", label: "write calls" },
        { value: "87 ms", label: "to index 215 notes" },
        { value: "5", label: "read-only tools" },
      ],
    },
    year: "Oct 2026",
    summary:
      "A small Model Context Protocol server that lets an AI assistant search and read an Obsidian vault over stdio: full-text search, notes with frontmatter, tags, backlinks and outgoing links. It never writes and never touches the network.",
    gallery: [],
    sections: [
      {
        heading: "Problem",
        body: "An Obsidian vault holds years of notes an AI assistant could use as context. Handing it over should not mean uploading it, or giving a model write access to files it only needs to read.",
      },
      {
        heading: "Build",
        body: "TypeScript over stdio, with two runtime dependencies: the official MCP SDK and zod. Five tools, all read-only: search, read_note, backlinks, outgoing_links and list_notes. Search ranks with BM25 over an in-memory index that re-reads only changed files. Links resolve the way Obsidian resolves them: wikilinks with aliases and headings, embeds, Markdown links, frontmatter tags and aliases.",
      },
      {
        heading: "Hardening",
        body: "The code only lists, stats, resolves and reads files, and a test fails if any other filesystem call or a network call appears. Path traversal, absolute paths outside the vault, NUL bytes and dot-folders such as .obsidian and .git are refused. Symlinks and junctions that resolve outside the vault are ignored, and each file's real path is checked again right before it is read.",
      },
      {
        heading: "Measurement",
        body: "49 tests: parsing, link resolution, every tool, path-traversal and symlink attempts, plus an end-to-end run that starts the server over stdio and calls each tool through the MCP SDK client. CI runs them on Node 20 and 22, on Ubuntu and Windows. On a real 215-note vault the index built in 87 ms, searches took 3 to 12 ms, and one note's backlinks (33 notes, 48 links) matched an independent count.",
      },
    ],
    decisions: [
      { choice: "Read-only by construction", reason: "no write tools, and a test fails if a write call appears" },
      { choice: "stdio over HTTP", reason: "no port, no network, nothing to expose" },
      { choice: "Two dependencies", reason: "MCP SDK and zod; own frontmatter parser, no search library" },
    ],
    facts: [
      { label: "Type", value: "MCP server, stdio" },
      { label: "Language", value: "TypeScript" },
      { label: "Dependencies", value: "MCP SDK, Zod" },
      { label: "Tools", value: "5" },
      { label: "Access", value: "Read-only" },
      { label: "Network", value: "None" },
      { label: "Tests", value: "49, unit + E2E" },
      { label: "Status", value: "Public repo" },
    ],
  },
  {
    slug: "fde-support-agent",
    name: "fde-support-agent",
    tagline: "A support agent that answers from the help centre with citations and acts only after the customer confirms.",
    discipline: "systems",
    category: "applied-ai",
    stack: ["Python", "FastAPI", "Postgres + pgvector", "Ollama", "Slack"],
    status: "public",
    href: "https://github.com/damanjz/fde-support-agent",
    hrefLabel: "view source",
    metric: { label: "60-case eval", value: "88%, mean of 3 runs" },
    year: "Nov 2026",
    summary:
      "A customer-support agent for Larkfield Coffee Co., a fictional Indian coffee-gear brand: it answers from the help centre with citations, looks up orders and stock, and starts a return or raises a ticket only after the customer confirms. It runs on a local 27B model at zero cost per query. The data is synthetic; the engineering and the numbers are real.",
    reels: [
      { src: "/shots/fde-support-agent/reel.mp4", poster: "/shots/fde-support-agent/title.webp", caption: "A return request, answered, confirmed and measured." },
    ],
    cover: { src: "/shots/fde-support-agent/cover.webp", alt: "88% on a 60-case eval, mean of three runs, against 85% keyword-only and 37% with no retrieval", caption: "" },
    gallery: [
      { src: "/shots/fde-support-agent/result.webp", alt: "88% on a 60-case eval, mean of three runs, against 85% keyword-only and 37% with no retrieval", caption: "The headline: 88% on 60 cases, the mean of runs 5 to 7, against 85% with keyword-only retrieval and 37% with none. Every refuse and escalate case passes." },
      { src: "/shots/fde-support-agent/architecture.webp", alt: "Architecture: customer channels, input guardrails, agent loop with retrieval and tools, output checks, reply and confirmation card, Postgres", caption: "Architecture: guardrails in, hybrid retrieval and four tools in the agent loop, honesty checks out. Writes wait for a confirmation card." },
      { src: "/shots/fde-support-agent/trace.webp", alt: "Trace of one return request through the API, the agent, retrieval, tools and Postgres", caption: "One return request traced from the customer's message through retrieval, tools and Postgres to the confirmed return." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "Larkfield's customers ask the same things all day, in English and Hinglish, with typos and sometimes anger: where is my order, can I return this, what is the policy. The shop wanted answers grounded in its own help centre and real actions on real orders, with no invented policy, dates or refunds, and no recurring cost.",
      },
      {
        heading: "Build",
        body: "Hybrid retrieval (Postgres full-text and pgvector, fused by reciprocal rank fusion, expanded to whole articles), with every policy claim cited. Four tools: order lookup with date facts computed in code, stock check, product search, and returns and tickets that wait for Confirm or Cancel. Guardrails mask personal data, strip injected lines from retrieved text and decline fake admin claims; output checks block invented codes and any claimed action without a tool call. REST API, a local chat page and a Slack bot.",
      },
      {
        heading: "Measurement",
        body: "60 cases (35 answers, 15 tool tasks, 10 that must refuse or escalate) against two baselines on the same model: 88% vs 85% keyword-only and 37% without retrieval, the mean of three runs. An LLM judge passes all 35 answers in every run vs 32 for keyword-only, hand-checked 15 of 15. 40 unscripted simulated customers found 76 issues, 2 critical, fixed at the root cause. The first real user was offered a refund on an order that did not match their story; that rule moved from the prompt into code.",
      },
    ],
    decisions: [
      { choice: "Dates in code", reason: "the model counted a 33-day-old delivery as inside 30 days and held the line; order lookup now returns the arithmetic" },
      { choice: "Confirm before writes", reason: "returns and tickets need a click or a clear yes; a hedge like \"Yeah, no\" never confirms" },
      { choice: "Money rules in code", reason: "a records mismatch blocks the return in code; a prompt rule is only a suggestion" },
    ],
    facts: [
      { label: "Type", value: "Support agent, RAG + tools" },
      { label: "Model", value: "Local 27B, Ollama" },
      { label: "Retrieval", value: "Full-text + pgvector" },
      { label: "Eval", value: "88%, 60 cases" },
      { label: "Cost", value: "INR 0 per query" },
      { label: "Status", value: "Public repo" },
    ],
  },
  {
    slug: "fde-integration-hub",
    name: "fde-integration-hub",
    tagline: "A webhook hub that delivers every order event to three systems once, in order, through outages and crashes.",
    discipline: "systems",
    category: "integration",
    stack: ["Python", "FastAPI", "Postgres", "OAuth2", "HMAC"],
    status: "public",
    href: "https://github.com/damanjz/fde-integration-hub",
    hrefLabel: "view source",
    metric: { label: "chaos run", value: "1,476 deliveries, 0 lost" },
    year: "Nov 2026",
    summary:
      "A webhook hub for Larkfield Coffee Co. (fictional): every storefront order event reaches the warehouse, helpdesk and accounting systems exactly once in effect, and in order, through slow commits, rate limits, outages and worker crashes. All three destinations are local mock providers.",
    reels: [
      { src: "/shots/fde-integration-hub/reel.mp4", poster: "/shots/fde-integration-hub/title.webp", caption: "500 events through the hub under chaos." },
    ],
    cover: { src: "/shots/fde-integration-hub/cover.webp", alt: "1,476 deliveries under chaos: 0 lost, duplicated or out of order", caption: "" },
    gallery: [
      { src: "/shots/fde-integration-hub/result.webp", alt: "1,476 deliveries under chaos: 0 lost, duplicated or out of order", caption: "The chaos run: 1,476 deliveries with 0 lost, duplicated or out of order, through 549 retries and 437 server errors." },
      { src: "/shots/fde-integration-hub/architecture.webp", alt: "Architecture: storefront webhook through intake, the Postgres outbox and workers, the rate gate and client, to warehouse, helpdesk and accounting", caption: "Architecture: signed intake, a Postgres outbox with leased workers, and one rate gate per destination." },
      { src: "/shots/fde-integration-hub/trace.webp", alt: "Trace of one order.paid event from the signed webhook to three destinations, with a retry and a suppressed duplicate", caption: "One order event traced: three delivery rows, a retry after a 503, a lookup before resending, and a duplicate webhook suppressed." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "After each order event a script called three APIs directly. When one was slow, rate-limited or down, orders were lost or booked twice, and nobody could say which.",
      },
      {
        heading: "Build",
        body: "Postgres is the queue: the raw event and one outbox row per destination are written in one transaction, claimed with SKIP LOCKED under a lease, and settled under a lease token, so a dead worker's rows are recovered. Order is enforced per order and destination; an older event whose later sibling already went out is marked superseded, never sent. HMAC-signed intake, OAuth2 client credentials, and a shared token bucket, Retry-After block and circuit breaker per destination.",
      },
      {
        heading: "Measurement",
        body: "A chaos run of 500 events across 257 orders, with 3 hard worker kills, a 60-second outage, slow commits, rate limits and 27 duplicate webhooks: 1,476 deliveries, 0 lost, 0 duplicates, 0 ordering violations, passed twice on production settings. An independent review first showed the verdict could not fail; it now counts duplicates at the destination and judges order on every arrival. A separate probe exceeds the timeout window on purpose and fails, and the README states where the guarantee stops.",
      },
    ],
    decisions: [
      { choice: "Postgres as the queue", reason: "a few hundred events an hour need one database and a few workers, not a message broker" },
      { choice: "Look before resending", reason: "the warehouse has no idempotency, so after an unknown outcome the hub searches for its own key first" },
      { choice: "A test that can fail", reason: "the slow-commit fault is part of every standard run, and a probe shows the boundary" },
    ],
    facts: [
      { label: "Type", value: "Integration hub" },
      { label: "Queue", value: "Postgres outbox" },
      { label: "Auth", value: "HMAC, OAuth2" },
      { label: "Deliveries", value: "1,476 sent, 0 lost, 0 dupes" },
      { label: "Faults", value: "Crashes, outage, 429s" },
      { label: "Status", value: "Public repo" },
    ],
  },
  {
    slug: "fde-doc-extraction",
    name: "fde-doc-extraction",
    tagline: "Supplier invoices and delivery notes in, validated JSON out; only the doubtful fields go to a person.",
    discipline: "systems",
    category: "applied-ai",
    stack: ["Python", "pypdf", "RapidOCR", "Ollama", "SQLite"],
    status: "public",
    href: "https://github.com/damanjz/fde-doc-extraction",
    hrefLabel: "view source",
    metric: { label: "silent errors", value: "0 in 1,130 fields" },
    year: "Nov 2026",
    summary:
      "Document extraction for Larkfield Coffee Co. (fictional): drop in a supplier invoice or courier delivery note, as a PDF or a scan, and get validated JSON. Code checks every total, tax rule and GST number, and only the doubtful fields go to a review screen. Fully local, because invoices carry bank details.",
    reels: [
      { src: "/shots/fde-doc-extraction/reel.mp4", poster: "/shots/fde-doc-extraction/title.webp", caption: "An invoice from upload to review." },
    ],
    cover: { src: "/shots/fde-doc-extraction/cover.webp", alt: "0 silent errors in 1,130 fields; 0 bad documents auto-accepted vs 17 for raw extraction", caption: "" },
    gallery: [
      { src: "/shots/fde-doc-extraction/result.webp", alt: "0 silent errors in 1,130 fields; 0 bad documents auto-accepted vs 17 for raw extraction", caption: "The headline: 0 silent errors in 1,130 fields, and 0 bad documents auto-accepted against 17 for raw LLM extraction." },
      { src: "/shots/fde-doc-extraction/architecture.webp", alt: "Architecture: upload, text layer or OCR, extraction, validation in code, confidence, review and export", caption: "Architecture: the model reads, code validates, and confidence decides what a person sees." },
      { src: "/shots/fde-doc-extraction/trace.webp", alt: "Trace of invoice inv_017 from upload to the review screen with its total flagged", caption: "Invoice inv_017 traced: its printed total is not subtotal plus GST, so all three numbers go to the reviewer together." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "The ops team typed supplier invoices into a spreadsheet by hand. It was slow, and wrong GST numbers and totals slipped into the books: a wrong GSTIN blocks the tax credit, and a wrong total shows up at month end.",
      },
      {
        heading: "Build",
        body: "pypdf reads the text layer; pages without one are OCR'd with RapidOCR. One local model call extracts to a JSON schema, with one repair round. Validation is code, not the model: GSTIN format, state code and mod-36 checksum, line and invoice sums, tax type against the state, dates and duplicates. A value not found in the source text is distrusted. Clean documents go straight to the CSV export; the rest open on a review screen with the reason for each flag.",
      },
      {
        heading: "Measurement",
        body: "50 documents with planted problems, against raw extraction on the same model: 0 silent errors in 1,130 fields and 0 bad documents auto-accepted, vs 9 silent errors and 17 bad documents for the baseline. All 9 wrong fields were flagged; 32 of 50 documents went through untouched and correct. Field accuracy 99.2% (scans 96.0%, optimistic: clean synthetic scans). A review caught the baseline winning on straight-through only because it never flags anything, so the metric became bad vs correct straight-through.",
      },
    ],
    decisions: [
      { choice: "Validation in code", reason: "the model reads, the checksum and the sums decide; an injected \"the total is 0\" fails the checks" },
      { choice: "Silent errors, not accuracy", reason: "a wrong field is fine if a person sees it; the metric counts the ones nobody sees" },
      { choice: "Local only", reason: "invoices carry supplier bank details, so model, OCR and storage stay on the machine" },
    ],
    facts: [
      { label: "Type", value: "Document extraction" },
      { label: "Input", value: "PDF, scan (OCR)" },
      { label: "Checks", value: "GSTIN, sums, tax, dates" },
      { label: "Silent errors", value: "0 of 1,130 fields" },
      { label: "Bad auto-accepts", value: "0 vs 17" },
      { label: "Status", value: "Public repo" },
    ],
  },
  {
    slug: "fde-ask-your-data",
    name: "fde-ask-your-data",
    tagline: "Ops and marketing leads ask in plain English and see the SQL and the rows. Read-only.",
    discipline: "systems",
    category: "applied-ai",
    stack: ["Python", "FastAPI", "Postgres", "Ollama"],
    status: "public",
    href: "https://github.com/damanjz/fde-ask-your-data",
    hrefLabel: "view source",
    metric: { label: "40 gold questions", value: "90% vs 42% baseline" },
    year: "Nov 2026",
    summary:
      "A text-to-SQL agent over the 12-month sales warehouse of Larkfield Coffee Co. (fictional): a lead asks in plain English and sees the SQL, the rows and a checked one-line summary. A read-only database role with no access to customers' personal data is the control that must hold.",
    reels: [
      { src: "/shots/fde-ask-your-data/reel.mp4", poster: "/shots/fde-ask-your-data/title.webp", caption: "A question, its SQL, its rows." },
    ],
    cover: { src: "/shots/fde-ask-your-data/cover.webp", alt: "90% on 40 gold questions against 42% for raw schema and 18% for table names only", caption: "" },
    gallery: [
      { src: "/shots/fde-ask-your-data/result.webp", alt: "90% on 40 gold questions against 42% for raw schema and 18% for table names only", caption: "The headline: 36 of 40 gold questions (90%) against 42% with the raw schema and 18% with table names only, on the same model." },
      { src: "/shots/fde-ask-your-data/architecture.webp", alt: "Architecture: question screen, schema-docs prompt, local model, SQL checks, read-only database role, summary checks, answer", caption: "Architecture: five layers of defence, with the read-only role as the one that must hold." },
      { src: "/shots/fde-ask-your-data/trace.webp", alt: "Trace of question G07 through the guards, SQL, execution and summary checks", caption: "Question G07 traced: correct SQL and rows, and a summary that named the wrong lowest value, dropped by the superlative check." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "Every question about orders, returns or tickets went to one analyst, who became the bottleneck. The leads would not learn SQL and would not accept a tool that could change data or expose customers.",
      },
      {
        heading: "Build",
        body: "Business definitions (revenue, return rate, repeat customer, fiscal quarter, \"last month\") are written once in a schema-docs file the model reads. Five layers of defence: a question pre-filter, the prompt, a real SQL lexer allowing one SELECT on allowed tables and functions, a read-only role with no privilege on raw customer data, and a row cap. Every number in the summary must appear in the rows, and a lowest or highest claim must name the right row.",
      },
      {
        heading: "Measurement",
        body: "40 gold questions on the same local model: 36/40 (90%) vs 17/40 (42%) for the raw schema plus today's date, and 7/40 (18%) for table names only; simple 24/25, complex 7/10, refuse 5/5. Before publishing, an independent reviewer pushed deliberately wrong SQL through the scorer and 10 of 23 passed; the half-finished run was thrown away and the scorer fixed first. A wrong \"lowest\" summary, caught while recording the demo, led to the superlative check.",
      },
    ],
    decisions: [
      { choice: "The role is the control", reason: "parser and filter are extra layers; the database role holds whatever the model writes" },
      { choice: "Definitions written down", reason: "vague words resolve one way, so the model never guesses what \"last quarter\" means" },
      { choice: "Test the scorer", reason: "wrong answers were pushed through the scorer before any number was published" },
    ],
    facts: [
      { label: "Type", value: "Text-to-SQL agent" },
      { label: "Warehouse", value: "12 months, 8,034 orders" },
      { label: "Access", value: "Read-only, no PII" },
      { label: "Accuracy", value: "36/40, 90%" },
      { label: "Baseline", value: "17/40, raw schema" },
      { label: "Status", value: "Public repo" },
    ],
  },
  {
    slug: "fde-eval-harness",
    name: "fde-eval-harness",
    tagline: "Runs an AI feature's golden set on any model, says whether a difference is real, and blocks regressions in CI.",
    discipline: "systems",
    category: "applied-ai",
    stack: ["Python", "SQLite", "Statistics", "CI gate"],
    status: "public",
    href: "https://github.com/damanjz/fde-eval-harness",
    hrefLabel: "view source",
    metric: { label: "noise floor", value: "4 of 60 cases" },
    year: "Nov 2026",
    summary:
      "An eval and monitoring harness for the AI features of Larkfield Coffee Co. (fictional). It runs a feature's golden cases on any model, pairs the results case by case, says whether a difference is real, and blocks a change in CI when it regresses or fails a must-pass category.",
    reels: [
      { src: "/shots/fde-eval-harness/reel.mp4", poster: "/shots/fde-eval-harness/title.webp", caption: "Three models, one noise floor, one gate." },
    ],
    cover: { src: "/shots/fde-eval-harness/cover.webp", alt: "Noise floor: 4 of 60 cases flipped with nothing changed; three models scored 53, 55 and 48 of 60", caption: "" },
    gallery: [
      { src: "/shots/fde-eval-harness/result.webp", alt: "Noise floor: 4 of 60 cases flipped with nothing changed; three models scored 53, 55 and 48 of 60", caption: "The noise floor: 4 of 60 cases flip between identical runs, so the gate allows a drop of 4. Three models: 53, 55 and 48 of 60." },
      { src: "/shots/fde-eval-harness/architecture.webp", alt: "Architecture: a candidate change through the suite adapter and harness into the gate, with every run stored in SQLite", caption: "Architecture: adapters call each feature's own eval, every run is stored with its fingerprint, and the gate compares like with like." },
      { src: "/shots/fde-eval-harness/trace.webp", alt: "Trace of one CI run of the gate, qwen3:14b against fusion27b:iq3, ending in exit code 1", caption: "One CI run traced: qwen3:14b against the baseline, blocked with exit code 1 because it failed the must-pass refuse cases." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "Every prompt, model or data change could silently break an AI feature, and each feature measured itself in its own way, so nobody could answer \"is this change safe?\" with one number and a plain reading.",
      },
      {
        heading: "Build",
        body: "Adapters call each feature's own eval code, and a parity test reproduces all 60 of the support agent's recorded results. Every run is stored in SQLite with its model, prompt, case file, scoring-code hash and frozen clock, and the gate refuses to compare runs that differ in any of them. Exact McNemar test on paired flips, exact paired bootstrap and Wilson intervals. No LLM judge in the gate, because it would move with the model under test. A monitor job watches the request log.",
      },
      {
        heading: "Measurement",
        body: "The support agent's 60 cases on three local models: fusion27b:iq3 53/60, fusion27b:q4ks 55/60 (within noise, p 0.688, at about 1.4x the latency) and qwen3:14b 48/60. The same model run twice on identical code flipped 4 of 60 cases, so the allowed drop is 4, not a guessed 2. The 14B model was only about 1.2x faster on a clean run and failed 2 of 10 refuse cases; a must-pass rule on refuse blocks it automatically.",
      },
    ],
    decisions: [
      { choice: "Noise before comparison", reason: "identical runs flip 4 of 60 cases; a smaller difference is not evidence" },
      { choice: "Must-pass categories", reason: "safety cases gate on their own, not hidden inside the average" },
      { choice: "No judge in the gate", reason: "a judge running on the candidate model would grade itself" },
    ],
    facts: [
      { label: "Type", value: "Eval + regression gate" },
      { label: "Stats", value: "McNemar, bootstrap, Wilson" },
      { label: "Models", value: "3 local" },
      { label: "Noise floor", value: "4 of 60 cases" },
      { label: "Gate", value: "Blocks qwen3:14b" },
      { label: "Status", value: "Public repo" },
    ],
  },
  {
    slug: "fde-voice-intake",
    name: "fde-voice-intake",
    tagline: "Customers talk instead of type; the support agent answers out loud and still asks before it acts.",
    discipline: "systems",
    category: "applied-ai",
    stack: ["Python", "faster-whisper", "Piper", "FastAPI"],
    status: "public",
    href: "https://github.com/damanjz/fde-voice-intake",
    hrefLabel: "view source",
    metric: { label: "end to end, voiced", value: "25/25, synthetic speech" },
    year: "Nov 2026",
    summary:
      "A voice front end for the Larkfield support agent (fictional customer): hold a button and speak, and the same agent answers out loud with the same confirmation rules. Speech to text and text to speech run on the CPU, so the GPU stays free for the agent's model.",
    reels: [
      { src: "/shots/fde-voice-intake/reel.mp4", poster: "/shots/fde-voice-intake/title.webp", caption: "A spoken return, read back and confirmed." },
    ],
    cover: { src: "/shots/fde-voice-intake/cover.webp", alt: "25 of 25 voiced requests reached the right tool and order id; typed 25 of 25; quiet clips 5 of 5 made no agent call", caption: "" },
    gallery: [
      { src: "/shots/fde-voice-intake/result.webp", alt: "25 of 25 voiced requests reached the right tool and order id; typed 25 of 25; quiet clips 5 of 5 made no agent call", caption: "End to end: 25 of 25 spoken requests reached the right tool and order id, the same as typed text. Synthetic speech, so optimistic." },
      { src: "/shots/fde-voice-intake/architecture.webp", alt: "Architecture: browser page, speech in, voice rules, the support agent, speech out", caption: "Architecture: speech in and out on the CPU, voice rules in between, and the support agent as the only brain." },
      { src: "/shots/fde-voice-intake/trace.webp", alt: "Trace of one spoken return from button press to Return started", caption: "One spoken return traced: the customer asks, hears the pending return read back, says yes, and the return is written." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "Older buyers and people on the move would rather talk than type. A voice path must not become a way around the agent's rules: a misheard order id or a hedged yes must never start a return.",
      },
      {
        heading: "Build",
        body: "faster-whisper small (int8) turns speech into text, with a prompt carrying Larkfield terms so order ids come out right, and Piper speaks the reply. The brain is the support agent over HTTP, so the typed and spoken paths cannot drift apart. Silence and low-confidence audio are never sent; while an action waits, only a whole-utterance yes or a clear no is passed on. Order ids are converted by code, never snapped to the nearest real order. Audio is dropped after each request.",
      },
      {
        heading: "Measurement",
        body: "25 of 25 spoken requests reached the right tool and order id end to end, matching typed text; 5 of 5 quiet clips (silence, noise, laughter) never reached the agent; word error rate 1.3% on synthetic speech, which is optimistic. In the author's own voice, 7 of 8 end to end, and the one misheard id was caught and asked again. A review of the voice path found the support agent taking \"Yeah, no\" and \"Ji nahi\" as a yes; it was fixed at the source, in the agent.",
      },
    ],
    decisions: [
      { choice: "One brain", reason: "voice calls the support agent's API, so no logic is copied and nothing drifts" },
      { choice: "Strict yes", reason: "only a whole-utterance yes or a clear no is passed on while an action waits" },
      { choice: "CPU for speech", reason: "Whisper and Piper on the CPU keep the GPU free for the 27B model" },
    ],
    facts: [
      { label: "Type", value: "Voice front end" },
      { label: "Speech in", value: "faster-whisper, CPU" },
      { label: "Speech out", value: "Piper, CPU" },
      { label: "End to end", value: "25/25 voiced" },
      { label: "WER", value: "1.3%, synthetic" },
      { label: "Status", value: "Public repo" },
    ],
  },
  {
    slug: "finance-bi",
    name: "finance-bi",
    tagline: "Five years of personal finance, four questions, one honest report.",
    discipline: "systems",
    category: "analytics",
    stack: ["Python", "DuckDB", "SQL", "DAX", "Power BI"],
    status: "public",
    href: "https://github.com/damanjz/personal-finance-bi",
    hrefLabel: "view source",
    caseStudy: "/case-studies/finance-bi.pdf",
    metric: { label: "checks", value: "15 reconciled" },
    pipeline: {
      mark: "bars",
      layout: "ledger",
      accent: "#10b981",
      onAccent: "#06281d",
      status: "Public repo",
      flow: [
        { name: "Raw records", note: "60 months · synthetic" },
        { name: "DuckDB model", note: "plain SQL · 4 questions" },
        { name: "Power BI", note: "generated from code" },
      ],
      stats: [
        { value: "33.2%", label: "savings rate found" },
        { value: "15/15", label: "checks pass" },
        { value: "60", label: "months of data" },
        { value: "4", label: "report pages" },
      ],
    },
    year: "Oct 2026",
    summary:
      "An end-to-end BI build: realistic personal-finance exports, a tested SQL model in DuckDB, and a four-question Power BI report generated from code.",
    gallery: [
      { src: "/shots/finance-bi/where.webp", alt: "Power BI page 'Where does it go?': Sankey from gross pay to tax, provident fund, fixed costs, discretionary spend, investments and cash", caption: "Where does it go? Gross pay traced through tax and EPF to every destination." },
      { src: "/shots/finance-bi/track.webp", alt: "Power BI page 'Am I on track?': trailing 12-month savings rate and debt to income", caption: "Am I on track? Savings rate as a trailing 12-month line, so one car purchase no longer flattens the chart." },
      { src: "/shots/finance-bi/stop.webp", alt: "Power BI page 'When can I stop?': FIRE projection with sliders for return, inflation and withdrawal rate", caption: "When can I stop? Live what-if sliders recompute the FIRE age in DAX." },
      { src: "/shots/finance-bi/own.webp", alt: "Power BI report page 'What do I own?': net worth, assets, loans and change-in-period cards; stacked area of assets by class from 2022 to 2026; allocation bars for equity, fixed income, cash reserves and real estate.", caption: "Net worth grows to ₹44.0 L on ₹46.5 L of assets, with equity at 41.5% and fixed income at 39.2% of the mix." },
      { src: "/shots/finance-bi/proving.webp", alt: "Pipeline diagram from generator through raw CSVs, DuckDB staging, model and marts, 13 exported tables and Power BI, followed by a table comparing five measures in Power BI and DuckDB, all identical.", caption: "15 checks gate the export, and five report measures, from savings rate (33.222%) to FIRE age 46, match DuckDB to the last digit." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "Personal finance data is scattered across a bank statement, a credit card, payslips, fund confirmations, a provident-fund passbook and loan schedules. Each answers a narrow question; none answers the ones that matter: where the money goes, what it built, whether things are improving, and when work becomes optional.",
      },
      {
        heading: "Build",
        body: "A seeded generator writes the exports a Hyderabad software engineer would have over 60 months, mess included: UPI references, card bills that pay last month's spending, bonus months, a broken fixed deposit. Plain SQL in DuckDB types them into one ledger, sorts 2,818 transactions with regex rules kept as data, builds loan amortisation with a recursive CTE, and produces report-ready marts. The Power BI project (model and pages) is generated from the schema, not clicked together.",
      },
      {
        heading: "Measurement",
        body: "The export is blocked unless 15 reconciliation checks pass: bank balances chain line by line, salary credits match payslips, EMIs match the schedule, the cashflow identity holds every month. The checks were tested by corrupting the data six different ways; each was caught. Every headline measure was queried from the running Power BI model and matched DuckDB exactly.",
      },
    ],
    decisions: [
      { choice: "Synthetic, not toy", reason: "publishable, but messy enough to need real cleaning" },
      { choice: "Report as code", reason: "generated TMDL + PBIR: reviewable, reproducible" },
      { choice: "Accrual spend", reason: "card spend counts when it happens, not when it's paid" },
    ],
    facts: [
      { label: "Type", value: "BI case study" },
      { label: "Data", value: "60 months, synthetic" },
      { label: "Model", value: "DuckDB, plain SQL" },
      { label: "Checks", value: "15 / 15 pass" },
      { label: "Report", value: "Power BI, generated" },
      { label: "Status", value: "Public repo" },
    ],
  },
  {
    slug: "hr-analytics",
    name: "hr-analytics",
    tagline: "Who leaves, why, and who's next.",
    discipline: "systems",
    category: "analytics",
    stack: ["Python", "DuckDB", "SQL", "scikit-learn", "Tableau"],
    status: "live",
    href: "https://public.tableau.com/app/profile/daman.reddy/viz/HRAnalyticsWorkbench/Workbench",
    hrefLabel: "open the live workbench",
    repo: "https://github.com/damanjz/hr-analytics",
    caseStudy: "/case-studies/hr-analytics.pdf",
    metric: { label: "flight risk", value: "AUC 0.658" },
    pipeline: {
      mark: "people",
      layout: "spotlight",
      accent: "#8b5cf6",
      status: "Live on Tableau",
      live: true,
      flow: [
        { name: "People data", note: "4,238 people · 48 months" },
        { name: "Flight-risk model", note: "gradient boosting · out-of-time" },
        { name: "Tableau", note: "Public · live workbench" },
      ],
      stats: [
        { value: "0.658", label: "AUC, flight risk" },
        { value: "20/20", label: "values match DuckDB" },
        { value: "15", label: "checks gate export" },
        { value: "97.7%", label: "pay ratio, like for like" },
      ],
    },
    year: "Oct 2026",
    summary:
      "A people-analytics build for a 2,500-person IT services firm: attrition, hiring, engagement and pay equity, plus a flight-risk score that never sees gender.",
    gallery: [
      { src: "/shots/hr-analytics/workbench.webp", alt: "HR analytics workbench: filters, five KPIs, six views, the highest flight risks and the levers behind them", caption: "The whole firm: filters, five headline numbers, six views and the at-risk drill." },
      { src: "/shots/hr-analytics/filtered.webp", alt: "The workbench filtered to the Data and Analytics department", caption: "One department: every number, chart and the drill table follow the filter." },
      { src: "/shots/hr-analytics/bengaluru.webp", alt: "The workbench filtered to Bengaluru in FY 2024-25", caption: "Bengaluru, FY 2024-25: rolling attrition and eNPS narrow to the year chosen." },
      { src: "/shots/hr-analytics/model.webp", alt: "Model comparison table (logistic regression vs gradient boosting: ROC AUC, precision-recall AUC, leavers caught in top 10%) above a bar chart of predicted vs actual six-month leaving rate by risk decile.", caption: "Gradient boosting reaches 0.658 ROC AUC on a future test period, and calibration drifts high at the top: 22.1% predicted against 14.5% actual." },
      { src: "/shots/hr-analytics/proving.webp", alt: "Pipeline diagram ending in a generated Tableau workbook, above a table of attrition, voluntary share, days to hire, eNPS and pay ratio for four views.", caption: "15 checks gate the export, and all 20 dashboard values across four views match an independent DuckDB calculation." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "HR data lives in separate systems: people and job changes in the HRIS, pay in payroll, requisitions in the ATS, anonymous scores in the survey tool. Leadership's questions cut across all of them: how fast are we losing people, which leavers hurt, are we paying fairly, and who is likely to go next?",
      },
      {
        heading: "Build",
        body: "A seeded generator simulates the firm month by month, with planted effects to find: resignations driven by pay against market, slow raises, long commutes and bench time; women paid 3.5% less for the same job. DuckDB builds a point-in-time monthly snapshot of every employee with ASOF joins, so nothing leaks from the future. A scikit-learn model trained on snapshots up to September 2023 and tested on March 2024 onwards scores everyone on the books and lists the levers HR could change. The Tableau workbook is written as XML by Python, matched to the file Tableau itself saves.",
      },
      {
        heading: "Measurement",
        body: "15 checks gate the export, each proven by breaking the data on purpose. Tableau's numbers match an independent DuckDB calculation for the whole firm and three filtered views, 20 values out of 20. The model reaches ROC AUC 0.658; its top 10% of scores catch 20.4% of leavers. Gender, age, region and university are never features, and the fairness table shows why women are still flagged more: they are paid less. Pay equity recovers the planted gap: 74.9% raw, 97.7% like for like.",
      },
    ],
    decisions: [
      { choice: "Out-of-time test", reason: "the model is judged on years it never saw" },
      { choice: "Risk as a rank", reason: "the model over-predicts calm years; ranks stay honest" },
      { choice: "Workbook as code", reason: "Tableau's own save as the spec; the XML rebuilds byte for byte" },
    ],
    facts: [
      { label: "Type", value: "People analytics" },
      { label: "Data", value: "4,238 people, 48 months" },
      { label: "Model", value: "Gradient boosting" },
      { label: "AUC", value: "0.658 out-of-time" },
      { label: "Dashboard", value: "Tableau Public, live" },
      { label: "Status", value: "Public repo" },
    ],
  },

  {
    slug: "hospital-operations",
    name: "hospital-operations",
    tagline: "Where a hospital's beds, waits and readmissions go wrong, hour by hour.",
    discipline: "systems",
    category: "analytics",
    stack: ["Python", "DuckDB", "SQL", "scikit-learn", "Power BI"],
    status: "public",
    href: "https://github.com/damanjz/hospital-operations-bi",
    hrefLabel: "view source",
    caseStudy: "/case-studies/hospital-operations.pdf",
    metric: { label: "readmission AUC", value: "0.786 vs LACE 0.749" },
    pipeline: {
      mark: "cross",
      layout: "rail",
      accent: "#f43f5e",
      status: "Public repo",
      flow: [
        { name: "ER visits", note: "168K · synthetic" },
        { name: "Readmission model", note: "logistic regression vs LACE" },
        { name: "Power BI", note: "Now · Flow · Readmissions" },
      ],
      stats: [
        { value: "0.786", label: "AUC, readmissions" },
        { value: "0.749", label: "LACE baseline" },
        { value: "18/18", label: "checks pass" },
        { value: "3", label: "report pages" },
      ],
    },
    year: "Oct 2026",
    summary:
      "Three years of a synthetic 256-bed hospital in Hyderabad: patient flow, bed occupancy and 30-day readmissions in DuckDB, a readmission model that beats the clinical LACE score, and a Power BI report generated from code.",
    gallery: [
      { src: "/shots/hospital-operations/now.webp", alt: "Power BI page 'Now': every bed by bay at a chosen hour, ER queue by triage level and patients per nurse", caption: "Now: every bed in the hospital at a chosen hour, the ER queue by triage level, and staffing against target." },
      { src: "/shots/hospital-operations/flow.webp", alt: "Power BI page 'Flow': ER arrivals and waits by weekday and hour, occupancy by month and waits by shift", caption: "Flow: arrivals and waits by weekday and hour; the evening wait falls once an extra evening doctor starts in April 2025." },
      { src: "/shots/hospital-operations/readmissions.webp", alt: "Power BI page 'Readmissions': rates by diagnosis, age, length of stay and unit fullness, with a follow-up list", caption: "Readmissions: who comes back within 30 days, and a follow-up list ranked by the model's risk score." },
      { src: "/shots/hospital-operations/model.webp", alt: "Table comparing the LACE index, gradient boosting and logistic regression on ROC AUC, precision-recall AUC and readmissions caught, above a bar chart of predicted vs actual 30-day readmission rate by risk decile.", caption: "Logistic regression beats the LACE index (0.786 vs 0.749 ROC AUC) and stays calibrated: the top decile is predicted at 40.4% and comes back at 43.7%." },
      { src: "/shots/hospital-operations/proving.webp", alt: "Pipeline diagram with 18 checks gating the export, above a table of seven checks and what each guarantees.", caption: "18 checks gate the export, from no bed holding two patients to the model never seeing sex, payer or age group." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "Hospital data answers narrow questions in separate systems: the ER board, the bed census, the discharge summaries. The questions that matter cut across them: where patients wait and why, how full the beds really run, and who is likely to be back within 30 days.",
      },
      {
        heading: "Build",
        body: "A seeded event simulation of a synthetic 256-bed multi-specialty hospital, April 2023 to March 2026: an ER doctor queue ordered by triage acuity, patients who leave without being seen, beds that need cleaning, ICU step-down, ward overflow into surgical beds, and readmissions that come back through the ER. About 168,000 ER visits land in nine raw exports. Plain SQL in DuckDB models flow, occupancy and readmissions, and the Power BI project (three pages: Now, Flow, Readmissions) is generated from code.",
      },
      {
        heading: "Measurement",
        body: "18 checks gate the build, each proven by breaking the data on purpose. 63 of 63 numbers on the report match DuckDB, and two full rebuilds produce identical files. The readmission model, tested out of time, reaches ROC AUC 0.786 against 0.749 for the LACE score; flagging the same share of patients as LACE, it catches 51.4% of readmissions against 47.4%.",
      },
      {
        heading: "What it found",
        body: "Evening arrivals waited a median 93 minutes for a doctor in FY 2024-25; after an extra evening doctor from April 2025 that fell to 32. Patients sent home from a unit 95% full or more came back 14.3% of the time, against 12.3% from a unit under 85% full.",
      },
    ],
    decisions: [
      { choice: "Out-of-time test", reason: "train on the past, test on a later year: no leakage from the future" },
      { choice: "Model vs LACE", reason: "beat the score clinicians already use, like for like" },
      { choice: "Report as code", reason: "generated Power BI project: reviewable, rebuilt identically" },
    ],
    facts: [
      { label: "Type", value: "BI case study" },
      { label: "Data", value: "168K ER visits, synthetic" },
      { label: "Model", value: "Logistic regression" },
      { label: "AUC", value: "0.786 vs LACE 0.749" },
      { label: "Checks", value: "18 / 18 pass" },
      { label: "Report", value: "Power BI, generated" },
      { label: "Status", value: "Public repo" },
    ],
  },
  {
    slug: "supply-chain",
    name: "supply-chain",
    tagline: "Which shelves run empty next, and which supplier is behind it.",
    discipline: "systems",
    category: "analytics",
    stack: ["Python", "DuckDB", "SQL", "scikit-learn", "Tableau"],
    status: "live",
    href: "https://public.tableau.com/app/profile/daman.reddy/viz/SupplyChainNetwork_17913286536000/Network",
    hrefLabel: "open the live dashboard",
    repo: "https://github.com/damanjz/supply-chain-bi",
    caseStudy: "/case-studies/supply-chain.pdf",
    metric: { label: "stockout AUC", value: "0.840 vs rule 0.699" },
    pipeline: {
      mark: "network",
      layout: "network",
      accent: "#f59e0b",
      onAccent: "#2a1a00",
      status: "Live on Tableau",
      live: true,
      flow: [
        { name: "Network", note: "4 DCs · 40 suppliers · 200 SKUs" },
        { name: "Stockout model", note: "gradient boosting vs rule" },
        { name: "Tableau", note: "map as navigation · live" },
      ],
      stats: [
        { value: "0.840", label: "AUC vs rule 0.699" },
        { value: "80.2%", label: "OTIF, order lines" },
        { value: "59.0%", label: "Kolkata on time in full" },
        { value: "15/15", label: "checks pass" },
      ],
    },
    year: "Oct 2026",
    summary:
      "Three years of a synthetic Indian FMCG distributor: on-time-in-full, lead time, inventory and supplier performance in DuckDB, a 14-day stockout model that beats the reorder-point rule, and a Tableau workbook generated from code.",
    gallery: [
      { src: "/shots/supply-chain/network.webp", alt: "Tableau dashboard: map of four warehouses and delivery lanes with OTIF, lead time, inventory turns, carrying cost and stockout risk", caption: "The whole network: click a warehouse or a lane on the map and every number follows." },
      { src: "/shots/supply-chain/kolkata.webp", alt: "The dashboard set to the Kolkata warehouse, OTIF 59.0%", caption: "Kolkata: on time and in full 59.0% against 83 to 87% at the other three warehouses." },
      { src: "/shots/supply-chain/diwali-2024.webp", alt: "The dashboard filtered to Snacks, FY 2024-25, as of 28 October 2024", caption: "Snacks going into Diwali 2024, as of 28 October: the watch list and the supplier behind it." },
      { src: "/shots/supply-chain/model.webp", alt: "Table comparing the reorder-point rule, logistic regression and gradient boosting on ROC AUC, precision-recall AUC and stockouts caught, above a bar chart of predicted vs actual 14-day stockout rate by risk decile.", caption: "Gradient boosting beats the reorder-point rule (0.840 vs 0.699 ROC AUC), and its top decile is predicted at 42.3% and runs out 38.6% of the time." },
      { src: "/shots/supply-chain/proving.webp", alt: "Pipeline diagram ending in a generated Tableau workbook, above a table of OTIF, days to deliver, turns, carrying cost and products at risk for three views.", caption: "15 checks gate the export, and dashboard numbers for three views, including Kolkata's 59.0% OTIF, match independent DuckDB queries." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "A distributor's view of its network is split across order books, warehouse stock and supplier records. The questions that matter cross all three: which lanes deliver on time and in full, where stock runs out next, and which supplier is causing it.",
      },
      {
        heading: "Build",
        body: "A day-by-day simulation of a synthetic distributor, April 2023 to March 2026: 4 warehouses (Hyderabad, Mumbai, Delhi NCR, Kolkata), 40 suppliers, 200 products and 36 delivery cities, with Diwali demand, monsoon lane delays, a supplier that starts slipping in July 2024 and a festive pre-build from September 2025. Plain SQL in DuckDB models OTIF, lead time, inventory turns and carrying cost. The Tableau workbook is generated from code; clicking a warehouse or lane on the map sets the whole dashboard.",
      },
      {
        heading: "Measurement",
        body: "15 checks gate the build, including an exact day-to-day stock balance, and each one is proven by breaking the data on purpose; two full rebuilds produce identical files. The 14-day stockout model (gradient boosting) reaches ROC AUC 0.840 against 0.699 for the reorder-point rule; flagging the same share of products as the rule, it catches 65.6% of stockouts against 59.5%. Dashboard numbers were checked against DuckDB for the whole network and two filtered views.",
      },
      {
        heading: "What it found",
        body: "Kolkata delivers on time and in full 59.0% of the time against 83 to 87% at the other warehouses, held back by dispatch waits and monsoon lanes. One snacks supplier fell from 75% to 40% on time after July 2024, with the highest defect rate. A festive pre-build cut snacks out-of-stock days from 4.2% to 1.6% for about 16% more stock from September to November.",
      },
    ],
    decisions: [
      { choice: "OTIF per order line", reason: "one short line in a big order shouldn't hide which lines fail" },
      { choice: "Map as navigation", reason: "click a warehouse or lane and everything follows" },
      { choice: "Model vs rule", reason: "beat the reorder-point rule planners already use" },
    ],
    facts: [
      { label: "Type", value: "BI case study" },
      { label: "Data", value: "3 years, synthetic" },
      { label: "Network", value: "4 DCs, 40 suppliers, 200 SKUs" },
      { label: "Model", value: "Gradient boosting" },
      { label: "AUC", value: "0.840 vs rule 0.699" },
      { label: "OTIF", value: "80.2%" },
      { label: "Dashboard", value: "Tableau Public, live" },
      { label: "Checks", value: "15 / 15 pass" },
      { label: "Status", value: "Public repo" },
    ],
  },
  {
    slug: "saas-revenue-leak",
    name: "saas-revenue-leak",
    tagline: "Five revenue leaks, planted and sealed away. The analytics had to find them blind.",
    discipline: "systems",
    category: "analytics",
    stack: ["Python", "DuckDB", "dbt", "XGBoost", "Power BI"],
    status: "public",
    href: "https://github.com/damanjz/saas-revenue-leak-bi",
    hrefLabel: "view source",
    caseStudy: "/case-studies/saas-revenue-leak.pdf",
    metric: { label: "leaks found", value: "5 of 5, blind" },
    pipeline: {
      mark: "leak",
      layout: "split",
      accent: "#fe6608",
      status: "Public repo",
      flow: [
        { name: "Simulated SaaS", note: "1,107 accounts · 5 sealed leaks" },
        { name: "Leak monitor", note: "6 detectors · dbt star schema" },
        { name: "Power BI", note: "4 pages · generated from code" },
      ],
      stats: [
        { value: "5/5", label: "planted leaks found" },
        { value: "19/20", label: "across four worlds" },
        { value: "0.73", label: "churn AUC, out of time" },
        { value: "69/69", label: "numbers match DuckDB" },
      ],
    },
    year: "Oct 2026",
    summary:
      "A B2B SaaS revenue engine built so it can be graded: five revenue leaks were planted in a simulated business and sealed away, and the warehouse, the anomaly monitor and the churn model had to find them blind.",
    gallery: [
      { src: "/shots/saas-revenue-leak/revenue.webp", alt: "Power BI Revenue page: ARR $20.6M, MRR growth 108.3%, NRR 85.1%, MRR over time, monthly MRR movements, retention and MRR lost by segment", caption: "Revenue: $1.72M MRR at Sep 2026, up 108% in a year, with what was added and what leaked each month." },
      { src: "/shots/saas-revenue-leak/cohorts.webp", alt: "Power BI Cohorts page: a cohort grid of customers still paying by signup month and months since signup", caption: "Cohorts: the April and May 2025 signups fall away faster than the rest." },
      { src: "/shots/saas-revenue-leak/accounts.webp", alt: "Power BI Accounts page: high-risk accounts, model risk against health score, a call list by expected loss and the latest leak alerts", caption: "Accounts: a call list ranked by expected loss, beside the leak monitor's latest alerts." },
      { src: "/shots/saas-revenue-leak/account.webp", alt: "Power BI Account page for one enterprise account: MRR, churn probability, usage, health score, billing ledger and support tickets", caption: "Account: one customer end to end, with the reasons the model flags it." },
      { src: "/shots/saas-revenue-leak/detection.webp", alt: "Timeline of five planted revenue leaks from Oct 2024 to Jul 2026, each with its active period and the first monitor alert, labelled in days.", caption: "The monitor caught all five planted leaks, from 3 days for duplicate webhooks to 394 days for a neglected account book." },
      { src: "/shots/saas-revenue-leak/early-warning.webp", alt: "Paired bars by churn cause showing the share of churns flagged in the 60 days before, churn model vs rules-based health score.", caption: "Of 140 churns, the model flagged 44% in the 60 days before; the rules-based health score flagged 11%." },
      { src: "/shots/saas-revenue-leak/data-quality.webp", alt: "Table of 13 injected data problems with counts injected and flagged and how each was handled, from duplicate webhooks to late CRM changes.", caption: "Each injected data problem was caught and handled, from 15 re-sent webhooks to 14,839 duplicate sessions." },
      { src: "/shots/saas-revenue-leak/pipeline.webp", alt: "Flow diagram: simulate, raw landing and a sealed answer key, dbt on DuckDB, churn model, Power BI, and a scorecard that alone reads the answer key; checks listed underneath.", caption: "Five stages from simulator to scorecard, with 105 dbt nodes, 14 of 14 mutation breaks caught and 69 report numbers matched." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "Revenue analytics is rarely checked against the truth, because nobody knows the truth. This build plants it: five revenue leaks were written into a simulated business and sealed away before any analysis, so the warehouse, the anomaly monitor and the churn model are graded against an answer key, not judged by how they look.",
      },
      {
        heading: "Build",
        body: "A day-by-day simulation of a B2B SaaS company from October 2024 to September 2026: 1,107 accounts across SMB, Mid-Market and Enterprise, with 13 kinds of dirty data mixed in. dbt on DuckDB builds a Kimball star schema with SCD Type 2 and enforced contracts. A six-detector leak monitor and a churn model (logistic regression, chosen over XGBoost) sit on top, and the Power BI report (Revenue, Cohorts, Accounts, Account) is generated entirely from code.",
      },
      {
        heading: "Measurement",
        body: "105 dbt nodes build with tests and contracts, and 13 of 13 injected data-problem types are caught (39,161 dirty rows). 14 of 14 deliberate breakages are caught. 69 of 69 Power BI figures match DuckDB, 3,391 of 3,391 text lines are measured to fit, and two runs from scratch give 90 of 90 byte-identical files. GitHub Actions reruns the pipeline and the mutation test on every push.",
      },
      {
        heading: "What it found",
        body: "The monitor found 5 of 5 planted leaks on the main run and 19 of 20 across four simulated worlds. False alarms fell from 10 to 3 once the detectors were rebuilt as Poisson, binomial and two-proportion tests, with both versions rerun on three unseen worlds. Tested out of time, the churn model reaches ROC AUC 0.73: the riskiest 10% churn at 2.9x the base rate, and 44% of churns are flagged in the 60 days before, a median 41 days ahead.",
      },
    ],
    decisions: [
      { choice: "Sealed answer key", reason: "grade the analytics, don't just build them" },
      { choice: "Statistical detectors", reason: "false alarms 10 to 3, checked on unseen worlds" },
      { choice: "Report as code", reason: "TMDL + PBIR, rebuilt byte-identical" },
    ],
    facts: [
      { label: "Type", value: "BI case study" },
      { label: "Data", value: "1,107 accounts, 24 months, synthetic" },
      { label: "Warehouse", value: "dbt, DuckDB, star schema" },
      { label: "Leaks", value: "5 / 5 found, 19 / 20 across 4 worlds" },
      { label: "AUC", value: "0.73 out-of-time" },
      { label: "Checks", value: "69 / 69 numbers match" },
      { label: "Report", value: "Power BI, generated" },
      { label: "Status", value: "Public repo" },
    ],
  },
  {
    slug: "india-air-quality",
    name: "india-air-quality",
    tagline: "How bad is the air in six Indian cities, and can the data be trusted?",
    discipline: "systems",
    category: "analytics",
    stack: ["Python", "DuckDB", "SQL", "Power BI", "Excel"],
    status: "public",
    href: "https://github.com/damanjz/india-air-quality-bi",
    hrefLabel: "view source",
    caseStudy: "/case-studies/india-air-quality.pdf",
    metric: { label: "report numbers", value: "423 of 423 match SQL" },
    pipeline: {
      mark: "bars",
      layout: "stack",
      accent: "#14b8a6",
      onAccent: "#04201d",
      status: "Public repo",
      flow: [
        { name: "OpenAQ archive", note: "107 stations · hourly · real" },
        { name: "DuckDB warehouse", note: "23 checks · nothing filled in" },
        { name: "Power BI + Excel", note: "5-page question rail" },
      ],
      stats: [
        { value: "107", label: "stations, real data" },
        { value: "27", label: "months gap, left blank" },
        { value: "23/23", label: "checks pass" },
        { value: "423/423", label: "numbers match SQL" },
      ],
    },
    year: "Oct 2026",
    summary:
      "Government air-quality monitoring in Delhi, Mumbai, Kolkata, Chennai, Bengaluru and Hyderabad, hourly from 2019 to September 2026. The first piece in this series built on real data rather than a simulation: every problem in the source is found, counted and handled, and nothing is filled in.",
    gallery: [
      { src: "/shots/india-air-quality/bad.webp", alt: "Power BI page 'How bad is each city?': a five-question rail on the left, a one-sentence answer, four cards, days by CPCB AQI category per city, and the share of days over the national standard by city and pollutant", caption: "How bad is each city? 11% of city-days were Poor or worse (AQI above 200); Delhi averages an AQI of 205, Bengaluru 78." },
      { src: "/shots/india-air-quality/when.webp", alt: "Power BI page 'When in the year is it worst?': mean AQI by city and month coloured by CPCB category with the archive gap left blank, mean AQI by season per city, and a typical year by calendar month", caption: "When in the year is it worst? Winter (Jan-Feb) averages AQI 155 against 74 in the monsoon; the 27-month archive gap stays blank, never drawn as clean air." },
      { src: "/shots/india-air-quality/spikes.webp", alt: "Power BI page 'When do short spikes hit?': spike counts by city and start month, the nine largest spikes against their surrounding days, and mean PM2.5 by city for September, October-November and December", caption: "When do spikes hit? 79 short PM2.5 spikes, found from the data alone by comparing each day with the days around it; most start in October." },
      { src: "/shots/india-air-quality/hours.webp", alt: "Power BI page 'Which hours and weekdays are worst?': mean PM2.5 by hour of day and weekday, hourly profile by season, and each weekday against the whole week", caption: "Which hours are worst? PM2.5 peaks at 22:00 IST across all cities, 1.4x the cleanest hour (16:00); weekday differences are a few percent." },
      { src: "/shots/india-air-quality/trust.webp", alt: "Power BI page 'Can the data be trusted?': stations, valid station-hours, readings set aside and missing station-days, completeness by city and year, and the issue log with the action taken for each issue", caption: "Can the data be trusted? 1,089,800 readings set aside, each under a named reason, from mislabelled units to fault code 985." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "The earlier pieces in this series simulated their data and graded the analytics against a sealed answer key: that proves the method, not the world. This one uses real measurements from 107 government monitoring stations (CPCB and state boards, via the public OpenAQ archive) in six cities. There is no answer key, so every number has to survive the source.",
      },
      {
        heading: "What real data cost",
        body: "The archive has no Indian station data from 31 Oct 2022 to 19 Feb 2025: 27 months, left blank and never estimated. Later files label NO2, SO2 and CO as ppb, but the values are CPCB's own µg/m³ and mg/m³: 12,171,979 readings relabelled, not converted. PM value 985 is an analyser status code (22,707 readings at exactly 985, 15 at 984). 5,890 runs of a frozen value last 8 hours or more, and at two stations an old and a new OpenAQ id publish different values. In all, 1,089,800 readings are set aside, each under a named reason.",
      },
      {
        heading: "Build",
        body: "The stations were found from the archive itself, with no account or API key: 117,993 daily files (337.4 MB), each MD5-verified and listed in a manifest. 56,030,781 raw rows go into a DuckDB star schema, where every reading gets exactly one disposition, valid or a named issue, and only valid readings reach the facts. The marts score CPCB's National AQI, exceedance of the national standards, seasons, hourly profiles and spikes. An Excel workbook and a 5-page Power BI report are generated from the same warehouse; the report is a question rail, and each page opens with a one-sentence answer computed by a measure.",
      },
      {
        heading: "Measurement",
        body: "23 of 23 reconciliation checks pass, and the export is blocked if any fails; 23 of 23 deliberate breakages are caught. 423 of 423 figures on the report match independent SQL, and 56 of 56 measures evaluate. 305 of 305 single lines, 36 of 36 wrapped texts and 14 of 14 grids are measured to fit. Two builds from the raw files give 18 of 18 byte-identical output files.",
      },
      {
        heading: "What it found",
        body: "The worst city-month was Delhi in November 2021: mean AQI 401, with 30 of 30 days Very Poor or Severe. City PM2.5 was above the 24-hour national standard on 56.5% of measured days in Delhi and 3.6% in Bengaluru. Delhi's October-November PM2.5 runs 3.3x to 5.3x its September; with no weather or emissions data, levels are described and no cause is attributed. 79 short spikes were found from the data alone, starting most often in October.",
      },
    ],
    decisions: [
      { choice: "Nothing filled in", reason: "gaps stay blank; no trend claimed across the 27-month hole" },
      { choice: "Relabel, not convert", reason: "the values were right, only the unit label was wrong" },
      { choice: "Spikes from data alone", reason: "no event calendar: each day against the days around it" },
    ],
    facts: [
      { label: "Type", value: "BI case study" },
      { label: "Data", value: "Real, 107 stations, hourly" },
      { label: "Window", value: "2019 to Sep 2026, 6 cities" },
      { label: "Source", value: "CPCB and state boards via OpenAQ" },
      { label: "Licence", value: "Per provider" },
      { label: "Checks", value: "23 / 23 pass, 23 / 23 breaks caught" },
      { label: "Numbers", value: "423 / 423 match SQL" },
      { label: "Report", value: "Power BI, Excel, generated" },
      { label: "Status", value: "Public repo" },
    ],
  },

  /* ----------------------------------------------------------------------- */
  /*  CRAFT — 3D / art. Real renders from the project hub, optimized to WebP. */
  /* ----------------------------------------------------------------------- */
  {
    slug: "umbraxis",
    name: "Umbraxis",
    tagline: "A semi-stylized medieval village that reads in motion.",
    discipline: "craft",
    category: "environment",
    stack: ["Unreal Engine 5.6", "Blender", "Substance", "Lumen", "Nanite"],
    status: "live",
    href: "https://www.artstation.com/damanpsd",
    hrefLabel: "view on ArtStation",
    metric: { label: "performance", value: "~100 fps @ target" },
    year: "2026",
    summary:
      "A composition-driven, semi-stylized medieval village in Unreal Engine 5, built to tell a story by itself and read clearly in motion. My MA Animation technical showcase.",
    youtube: "BFrPzJXAXRU",
    gallery: [
      { src: "/art/umbraxis-vista.webp", alt: "Umbraxis village vista", caption: "The establishing vista: windmill, red rooftops, a lily-pad river, stylized cumulus over hazy mountains." },
      { src: "/art/umbraxis-path.webp", alt: "Umbraxis forest path", caption: "A birch-lined path with dappled light and faint magic wisps in the shade, with leading lines into the frame." },
      { src: "/art/umbraxis-shot3.webp", alt: "Umbraxis environment shot", caption: "Value grouping and light anchors do the composition work. Semi-stylized, so lighting reads at a glance." },
      { src: "/art/umbraxis-shot2.webp", alt: "Umbraxis environment shot", caption: "Emissive stylized materials with a fully dynamic day/night cycle and a randomized weather system." },
      { src: "/art/umbraxis-shot5.webp", alt: "Umbraxis environment shot", caption: "Blockout to beauty: spline-driven castle walls and river, blueprint-authored buildings." },
    ],
    sections: [
      {
        heading: "The brief",
        body: "Under a clear blue sky brushed with soft pink clouds, a quiet medieval village of round stone towers and red-tiled roofs: a landscape that tells a story by itself. Umbraxis is my MA Animation technical showcase: composition-driven, semi-stylized environment building that has to read clearly in motion. The touchstones were Genshin's Mondstadt, Zelda: Breath of the Wild, and Studio Ghibli's Howl's Moving Castle.",
      },
      {
        heading: "How it was built",
        body: "Unreal Engine 5.6 as the primary engine, with Lumen for lighting and Nanite for foliage. Buildings and workspaces are authored as Blueprint actors; the castle walls and the flowing river are spline-driven. Assets are largely sourced and then reworked. The skill is in combining and re-authoring them through material and shader edits (blends and masks) so a bought asset stops looking bought.",
      },
      {
        heading: "Lighting & atmosphere",
        body: "The lighting is fully dynamic, from street lamps to cloud caustics, with generous bloom to bring out the stylized energy. A day/night cycle drives the whole scene, and a randomized weather system runs in cahoots with it for a more authentic feel. Going semi-stylized (rather than fully) kept a firmer grip on how the environment and lighting read. Composition leans on leading lines, value grouping, and light anchors.",
      },
      {
        heading: "Making it run",
        body: "The PC target was 60 fps; it landed around 100. Getting there meant profiling with stat fps and stat gpu to find what was pulling compute down (dynamic shadows and pre-lighting composition were the culprits), then leaning on camera culling, LODs, and Nanite overrides, which saved a lot.",
      },
      {
        heading: "What broke, and what I learned",
        body: "Water reflectivity fought me every time I panned or rendered, from overlapping materials where one had emission enabled, until I tracked it down and fixed it. A GPU driver update broke DirectX 12 and crashed Unreal at random, a hard lesson that the newest of everything has drawbacks. Blueprint pivot points drifted and scrambled whole classes, so I'd reset the pivot and re-add the actor at its original transform. The real takeaways were earlier planning for system integration, the economics of asset reuse, and a sharper critical eye for what a shot actually needs.",
      },
    ],
    facts: [
      { label: "Type", value: "MA animation showcase" },
      { label: "Engine", value: "Unreal Engine 5.6" },
      { label: "Lighting", value: "Lumen, dynamic" },
      { label: "Foliage", value: "Nanite" },
      { label: "Performance", value: "~100 fps (target 60)" },
      { label: "Runtime", value: "~10 min piece" },
    ],
  },
  {
    slug: "cinematic-car",
    name: "Cinematic Car Render",
    tagline: "Studio product lighting: deep blacks, warm rim, colored gels.",
    discipline: "craft",
    category: "product-render",
    stack: ["Blender", "Cycles", "Compositing"],
    status: "live",
    href: "https://www.artstation.com/damanpsd",
    hrefLabel: "view on ArtStation",
    metric: { label: "focus", value: "light & form" },
    year: "2026",
    summary:
      "A moody Blender studio render: dramatic rim lighting and colored gels against near-black, all about reading form through light.",
    gallery: [
      { src: "/art/car-hero.webp", alt: "cinematic car render front", caption: "Near-black body read entirely through rim light: warm key, cool fill, minimal detail noise." },
      { src: "/art/car-2.webp", alt: "cinematic car render angle", caption: "Colored gels shape the surfaces; the environment stays dark so the silhouette carries the frame." },
    ],
    sections: [
      {
        heading: "The exercise",
        body: "A lighting study: take a sports car into a dark studio and make it read through light alone. Deep blacks, a warm rim to describe the silhouette, and red/blue gels to give the panels shape without flooding them with detail.",
      },
      {
        heading: "The approach",
        body: "Rendered in Blender with Cycles. The restraint is the point: most of the body sits in shadow, and a few carefully placed lights do the describing. It's the same instinct as the environment work, turned inward on a single hero object: composition and value first, everything else second.",
      },
    ],
    facts: [
      { label: "Type", value: "Lighting study" },
      { label: "Tool", value: "Blender, Cycles" },
      { label: "Focus", value: "Studio lighting" },
      { label: "Look", value: "Cinematic, low-key" },
    ],
  },
  {
    slug: "stylized-studies",
    name: "Stylized Studies",
    tagline: "Toon-shaded and procedural experiments in Blender.",
    discipline: "craft",
    category: "stylized",
    stack: ["Blender", "Geometry Nodes", "NPR / Toon"],
    status: "live",
    href: "https://www.artstation.com/damanpsd",
    hrefLabel: "view on ArtStation",
    metric: { label: "approach", value: "procedural" },
    year: "2026",
    summary:
      "Stylized and procedural Blender experiments: cel-shaded illustration and node-based generators that build scenes from rules.",
    gallery: [
      { src: "/art/vending-toon.webp", alt: "toon-shaded vending machine", caption: "A cel-shaded vending machine: flat toon look, clean outlines, deliberately illustrative." },
    ],
    sections: [
      {
        heading: "Two directions",
        body: "This is a bucket for the more experimental art: on one side, non-photorealistic toon/cel-shaded pieces where the goal is a clean illustrative read; on the other, procedural work where the scene is generated from rules rather than placed by hand.",
      },
      {
        heading: "Building generators",
        body: "The procedural side is where the artist and the engineer overlap. I've built Blender generators (a castle generator, a medieval building and city generator, a flock system) using Geometry Nodes so a whole layout comes from parameters. It's the same systems instinct as the software work: make a tool, then let the tool make the output.",
      },
    ],
    facts: [
      { label: "Type", value: "Experiments" },
      { label: "Tool", value: "Blender, geo nodes" },
      { label: "Range", value: "Toon / NPR, procedural" },
      { label: "Generators", value: "Castle, city, flock" },
    ],
  },
  {
    slug: "product-placement-dev",
    name: "Product Placement Dev",
    tagline: "Studio looks-dev for a set of signature electric guitars.",
    discipline: "craft",
    category: "product-render",
    stack: ["Blender", "Cycles", "Compositing"],
    status: "live",
    href: "https://www.artstation.com/artwork/8Bo3O6",
    hrefLabel: "view on ArtStation",
    metric: { label: "format", value: "9:16, social" },
    year: "2025",
    summary:
      "Looks-development for a set of graphic-finish electric guitars: low-key studio lighting, textured bodies, and compositing built for a vertical social cut. Made for the output, then posted.",
    reels: [
      { src: "/art/gtr-reel-lineup.mp4", poster: "/art/gtr-lineup.webp", portrait: true, caption: "The lineup: three signature finishes." },
      { src: "/art/gtr-reel-1.mp4", poster: "/art/gtr-slayer.webp", portrait: true, caption: "Headstock pass, rim-lit on black." },
      { src: "/art/gtr-reel-2.mp4", poster: "/art/gtr-detail.webp", portrait: true, caption: "Hardware pass: pickups and bridge." },
      { src: "/art/gtr-reel-3.mp4", poster: "/art/gtr-body.webp", portrait: true, caption: "Body graphic pass: textured wrap." },
    ],
    gallery: [
      { src: "/art/gtr-lineup.webp", alt: "three signature electric guitars lit against black", caption: "The lineup: three signature-graphic guitars, rim-lit against near-black so the silhouettes read first." },
      { src: "/art/gtr-body.webp", alt: "guitar body with EMG pickups over graphic wrap", caption: "The body pass: EMG pickups and tune-o-matic bridge over a war-art graphic wrap, lit to hold the surface detail." },
      { src: "/art/gtr-slayer.webp", alt: "guitar headstock with graphic decal, shallow depth of field", caption: "A headstock at shallow depth of field: the finish artwork and logo carry the frame; everything else falls to black." },
      { src: "/art/gtr-detail.webp", alt: "guitar neck and body detail", caption: "Detail pass: hardware, inlays, and the graphic finish, framed vertical for the social cut." },
    ],
    sections: [
      {
        heading: "The brief",
        body: "A set of signature-graphic electric guitars, treated as a product-placement piece. The job was looks-development: lighting, texturing, and compositing the guitars into a studio set that sells the object the way a product ad would, with the final vertical cut in mind from the first frame.",
      },
      {
        heading: "The approach",
        body: "Rendered in Blender with Cycles. The set is low-key: near-black studio, guitars on wall mounts, described by rim light so the silhouette and the finish artwork read before anything else. Texturing carries the graphic body wraps and the hardware (EMG pickups, tune-o-matic bridges, logo decals); compositing ties the passes together. The whole scene was built for the output: framed 9:16, cut into short reels, and posted to Instagram.",
      },
    ],
    facts: [
      { label: "Type", value: "Product looks-dev" },
      { label: "Tool", value: "Blender, Cycles" },
      { label: "Work", value: "Lighting, texturing, comp" },
      { label: "Subject", value: "Signature guitars" },
      { label: "Format", value: "9:16, social" },
      { label: "Shipped", value: "Instagram" },
    ],
  },
  {
    slug: "procedural-clouds",
    name: "Procedural Clouds",
    tagline: "Golden-hour volumetric clouds, generated not painted.",
    discipline: "craft",
    category: "environment",
    stack: ["Blender", "Volumetrics"],
    status: "live",
    href: "https://www.artstation.com/damanpsd",
    hrefLabel: "view on ArtStation",
    metric: { label: "approach", value: "procedural" },
    year: "2025",
    summary:
      "A volumetric cloud study at golden hour: two soft cumulus forms lit warm on top and cool below, sitting in a smoothly graded dusk sky. Generated as volume rather than painted, so the light reads through the whole form.",
    gallery: [
      { src: "/art/proc-clouds.webp", alt: "two golden-hour volumetric clouds against a dusk sky", caption: "Two cumulus forms at golden hour: warm light catching the tops, cooler shadow beneath, in a graded dusk sky." },
    ],
    sections: [
      { heading: "The study", body: "A focused lighting-and-volume study: two soft cumulus clouds at golden hour. The goal was believable scattering (warm light raking the tops, the underside falling to cool shadow), with the forms reading as volume." },
      { heading: "Why procedural", body: "Built as volumetrics rather than painted so the light genuinely travels through the cloud. It's the same instinct as the rest of the craft work: describe the thing with rules and let the render resolve it." },
    ],
    facts: [
      { label: "Type", value: "Lighting study" },
      { label: "Tool", value: "Blender, volumes" },
      { label: "Subject", value: "cumulus, golden hour" },
    ],
  },
  {
    slug: "cityscape",
    name: "Cityscape",
    tagline: "A dense procedural city, rendered in clay.",
    discipline: "craft",
    category: "environment",
    stack: ["Blender", "Procedural"],
    status: "live",
    href: "https://www.artstation.com/damanpsd",
    hrefLabel: "view on ArtStation",
    metric: { label: "approach", value: "procedural" },
    year: "2024",
    summary:
      "A dense city block seen from above (skyscrapers, setbacks, rooftop clutter of HVAC units and antennas), rendered as untextured clay so the scale, massing and geometry carry the frame on their own.",
    gallery: [
      { src: "/art/cityscape.webp", alt: "aerial greyscale clay render of a dense city", caption: "An aerial clay render of a dense downtown: rooftop detail, setbacks and towers, left untextured so massing reads first." },
    ],
    sections: [
      { heading: "Scale from geometry", body: "A downtown seen from above, rendered in greyscale clay. Stripping colour and texture puts all the weight on geometry (the massing of towers, the rhythm of setbacks, the clutter of rooftop mechanicals) to see whether the scene holds on scale alone." },
      { heading: "Built by rules", body: "The density is the point: enough buildings, each with believable rooftop detail, that placing them by hand isn't the move. It's an environment/scale exercise in the same procedural vein as the generators." },
    ],
    facts: [
      { label: "Type", value: "Environment, scale" },
      { label: "Tool", value: "Blender" },
      { label: "Render", value: "Greyscale clay" },
      { label: "Subject", value: "Dense city" },
    ],
  },
  {
    slug: "highway-stop",
    name: "Highway Night Stop",
    tagline: "A nocturnal roadside scene, lit by sodium and neon.",
    discipline: "craft",
    category: "environment",
    stack: ["Blender", "Lighting"],
    status: "live",
    href: "https://www.artstation.com/damanpsd",
    hrefLabel: "view on ArtStation",
    metric: { label: "study", value: "night lighting" },
    year: "2024",
    summary:
      "A nocturnal environment study: a highway-side stop where fog, a receding run of streetlights, and a neon-edged fuel canopy do all the work. Almost monochrome until the red-and-blue neon pulls the eye to the corner.",
    gallery: [
      { src: "/art/highway-stop.webp", alt: "foggy roadside gas stop at night with neon canopy", caption: "A roadside stop at night: barriers curving into fog, streetlights receding, a neon-trimmed canopy glowing at the edge." },
    ],
    sections: [
      { heading: "Atmosphere first", body: "This is a mood piece: an empty roadside at night, carried by fog, falloff, and a few warm pools of streetlight. The near-monochrome palette makes the single hit of red-and-blue neon land hard." },
      { heading: "Leading the eye", body: "The crash barrier and the line of lamps act as leading lines pulling into depth; the lit canopy is the anchor. It's a composition-and-lighting study more than a modelling one." },
    ],
    facts: [
      { label: "Type", value: "Environment, mood" },
      { label: "Tool", value: "Blender" },
      { label: "Study", value: "Night lighting, fog" },
      { label: "Subject", value: "Roadside stop" },
    ],
  },
  {
    slug: "interior-study",
    name: "Interior Study",
    tagline: "A warm evening living room, lit by nested frames.",
    discipline: "craft",
    category: "environment",
    stack: ["Blender", "Interior Lighting"],
    status: "live",
    href: "https://www.artstation.com/damanpsd",
    hrefLabel: "view on ArtStation",
    metric: { label: "study", value: "interior lighting" },
    year: "2024",
    summary:
      "An interior lighting study: a modern living room after dark, its mood set by nested square ceiling frames, a warm standing lamp, and the glow they throw across a sectional, marble table and patterned floor.",
    gallery: [
      { src: "/art/interior-study.webp", alt: "warm modern living room at night with nested light fixtures", caption: "A living room after dark: nested light-frame fixtures and a single lamp carry a warm, low-key evening mood." },
    ],
    sections: [
      { heading: "Light as the subject", body: "The room is furnished plainly on purpose; the piece is really about the light. Nested square fixtures and one warm lamp set a low-key evening key, with the fill falling off into the corners of the space." },
      { heading: "Materials in low light", body: "It's also a materials test: how the sofa fabric, marble top, and patterned floor hold up when they're described almost entirely by warm, indirect light rather than a bright key." },
    ],
    facts: [
      { label: "Type", value: "Interior, lighting" },
      { label: "Tool", value: "Blender" },
      { label: "Study", value: "Evening, low-key" },
      { label: "Subject", value: "Living room" },
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
 * TRACKS — the three doors. Every project belongs to exactly one, derived
 * from its discipline and category (craft = art, analytics = data, the rest
 * = systems), so nothing is written twice.
 */
export type TrackId = "ai" | "data" | "systems" | "art";

export type Track = {
  id: TrackId;
  role: string; // the door label
  cover: string; // landing door image
  intro: string; // the one-paragraph pitch; introEm is accented
  introEm: string;
  stats: { value: string; label: string }[];
};

export const tracks: Track[] = [
  {
    id: "ai",
    role: "AI agents and integrations",
    cover: "/shots/fde-support-agent/result.webp",
    intro: "Six builds for one fictional customer,",
    introEm: "each graded by its own eval before it counts.",
    stats: [
      { value: "6", label: "builds, one customer" },
      { value: "88%", label: "support agent, 60-case eval" },
      { value: "0", label: "lost in 1,476 deliveries" },
    ],
  },
  {
    id: "systems",
    role: "AI-assisted systems developer",
    cover: "/doors/systems.webp",
    intro: "I ship complete software with AI as the co-pilot and my judgement at the wheel:",
    introEm: "local-first, security-hardened, measured before it ships.",
    stats: [
      { value: "6", label: "projects shipped" },
      { value: "16", label: "security fixes from one audit" },
      { value: "88%", label: "routing accuracy, AI triage" },
    ],
  },
  {
    id: "art",
    role: "3D environment artist",
    cover: "/art/umbraxis-path.webp",
    intro: "I build places that tell a story on their own,",
    introEm: "composed to read in motion, from stylized villages to sodium-lit roadsides.",
    stats: [
      { value: "8", label: "pieces" },
      { value: "UE5", label: "and Blender" },
      { value: "MA", label: "Animation" },
    ],
  },
  {
    id: "data",
    role: "BI and data analyst",
    cover: "/doors/data.webp",
    intro: "I turn messy records into reports people can act on,",
    introEm: "with every number reconciled back to SQL before it ships.",
    stats: [
      { value: "6", label: "end-to-end BI builds" },
      { value: "0.840", label: "best model ROC AUC, stockouts" },
      { value: "63", label: "of 63 hospital report numbers matched to SQL" },
    ],
  },
];

export function trackOf(p: Project): TrackId {
  if (p.discipline === "craft") return "art";
  if (p.category === "applied-ai" || p.category === "integration") return "ai";
  return p.category === "analytics" ? "data" : "systems";
}

/** Lane order on the site: AI and data lead, art last (Daman, 2026-11-11). */
export const laneOrder: TrackId[] = ["ai", "data", "systems", "art"];
export const lanes = (): Track[] => laneOrder.map((id) => tracks.find((t) => t.id === id)!);

/** Short label for a lane's column. */
export const laneLabel: Record<TrackId, string> = { ai: "AI", data: "Data", systems: "Systems", art: "Art" };

export function getTrack(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}

/** A track's work, pieces with a real image first (the lead card runs wide). */
export function projectsIn(id: TrackId): Project[] {
  const own = projects.filter((p) => trackOf(p) === id);
  const hasImage = (p: Project) => p.gallery.length > 0 || (p.reels?.length ?? 0) > 0;
  return [...own.filter(hasImage), ...own.filter((p) => !hasImage(p))];
}

/** The image that stands for a project: first screenshot, else the first reel's poster. */
export function coverOf(p: Project): Shot | undefined {
  return p.gallery[0] ?? (p.reels?.[0] ? { src: p.reels[0].poster, alt: p.name, caption: "" } : undefined);
}

/** Repo-style names read as words in giant caps: "flux-player" -> "flux player". */
export function displayName(name: string): string {
  return name.replace(/-/g, " ");
}

/**
 * HOW I WORK — the standards behind each craft, four per door. Every line is
 * backed by a project on that door.
 */
export const ethics: Record<Exclude<TrackId, "ai">, { title: string; body: string }[]> = {
  systems: [
    {
      title: "Local-first",
      body: "Data lives on the user's disk. Sync is a feature, not a landlord, so nothing I build needs my server to keep working.",
    },
    {
      title: "Measured, then shipped",
      body: "If it isn't evaluated, it isn't done. The AI triage only moved to model routing after it beat the rules baseline on a 40-case eval set: 88% against 70%.",
    },
    {
      title: "Threat-model first",
      body: "Every dependency and open surface has to earn its place. Protec went through a six-area security audit and shipped 16 hardening fixes.",
    },
    {
      title: "AI speeds it up, I own it",
      body: "I build with AI tools and keep the decisions, the review and the testing. If it ships, I can explain why it works and how it fails.",
    },
  ],
  art: [
    {
      title: "Composition first",
      body: "Value grouping and light anchors do the work before any detail goes in. A frame has to read at a glance, in grey, before it earns colour.",
    },
    {
      title: "Blockout to beauty",
      body: "Spaces are blocked out and checked in motion before they're dressed. Detail is placed where the eye lands, not sprayed everywhere.",
    },
    {
      title: "Performance is part of the art",
      body: "A scene that stutters doesn't read. Umbraxis was profiled to about 100 fps against a 60 fps target, with Lumen and Nanite doing the heavy lifting.",
    },
    {
      title: "Built for where it lands",
      body: "Framing, passes and cuts are planned for the final format, like the guitar looks-dev framed 9:16 and cut into reels from the start.",
    },
  ],
  data: [
    {
      title: "Every number reconciles",
      body: "No report ships until its headline numbers match an independent SQL calculation. Power BI and Tableau are checked against DuckDB, value for value.",
    },
    {
      title: "Break it on purpose",
      body: "A check only counts if it has been seen to fail. Each one is proven by corrupting the data deliberately and watching the build stop.",
    },
    {
      title: "Fair by design",
      body: "Sensitive attributes like gender, age and region never become model features, and the fairness table shows what the model does anyway.",
    },
    {
      title: "Reports as code",
      body: "Dashboards are generated from code, not clicked together: reviewable, versioned, and rebuilt identically every time.",
    },
  ],
};

/**
 * ABOUT — the "you" column. Copy is a draft for Daman's edit (2026-11-11): AI and data lead,
 * 3D training as background. Facts from the resume and this site only.
 */
export const about = {
  draft: false,
  // Stand-in until Daman sends a portrait: his own Umbraxis render.
  portrait: { src: "/art/umbraxis-path.webp", alt: "A birch-lined path from Umbraxis, Daman's own render, standing in for a portrait" } as null | { src: string; alt: string },
  head: ["I build agents and reports", "you can check."] as [string, string],
  line: "Each one ships with its proof: an eval score for the agents, a SQL reconciliation for the reports.",
  story: [
    "I build AI agents and data systems, and everything I ship is public on GitHub.",
    "In 2026 that meant six agent builds for one fictional customer, each graded by its own eval: a support agent, an integration hub, document extraction, a read-only data agent, an eval harness and a voice intake line. All of it runs on local models.",
    "On the data side, six BI case studies in SQL, Python, Power BI and Tableau, one of them on 36.1M real air-quality readings. No report ships until its numbers match an independent SQL calculation.",
    "The checks come from real failures. In a live test, the support agent accepted a customer's wrong account of an order under pushback and started an INR 12,998 return. It now compares what the customer names with what the order holds, and refuses the return when they do not match.",
    "I came to software from 3D: an MA in Animation at the University of Salford and fifteen months on ad campaigns at Blur'd. I taught myself to build software with Claude Code, and I test everything before it ships.",
    "Today I lead product and design at Datatree Systems, building GrafiLabs. I am open to work.",
  ],
  timeline: [
    { when: "Jan 2026 – now", what: "Product and Design Lead", where: "Datatree Systems", note: "Building GrafiLabs, an AI flyer and social-post service." },
    { when: "Sep 2024 – Sep 2025", what: "MA Animation, Merit", where: "University of Salford, UK", note: "Global Gold Excellence Scholarship." },
    { when: "Jun 2023 – Dec 2025", what: "Design Associate", where: "Datatree Systems", note: "Company website and external documents." },
    { when: "Jan 2022 – Apr 2023", what: "3D Generalist Intern", where: "Blur'd LLP, Hyderabad", note: "3D visualisation for client ad campaigns." },
    { when: "2020 – 2023", what: "B.Sc. Multimedia and Animation", where: "Loyola Academy, Hyderabad", note: "GPA 9.1 / 10." },
  ],
  personal: [
    { title: "What I look at", body: "Studio Ghibli, Breath of the Wild, Arcane, Spider-Verse, Blade Runner 2049 and Roger Deakins. Mood through light." },
    { title: "Languages", body: "Telugu, English, Hindi and beginner Japanese." },
    { title: "Behind a camera", body: "Winner of an inter-college photography competition. Composition came before code." },
    { title: "How I work", body: "Local-first and measured before it ships. AI speeds the work up; I own the result." },
  ],
};

/** The Golden Hour scenes behind the site: four of Daman's renders, one per time of day. */
export const scenes = [
  { id: "day", label: "Day", src: "/art/umbraxis-vista.webp", slug: "umbraxis", name: "Umbraxis" },
  { id: "golden", label: "Golden hour", src: "/art/proc-clouds.webp", slug: "procedural-clouds", name: "Procedural Clouds" },
  { id: "evening", label: "Evening", src: "/art/interior-study.webp", slug: "interior-study", name: "Interior Study" },
  { id: "night", label: "Night", src: "/art/highway-stop.webp", slug: "highway-stop", name: "Highway Night Stop" },
] as const;

const ACR: Record<string, string> = { ai: "AI", bi: "BI", hr: "HR", mcp: "MCP", saas: "SaaS", n8n: "n8n", volt: "VOLT" };
/** A project's name as a title: "fde-support-agent" -> "Support Agent", "hr-analytics" -> "HR Analytics". */
export function nameOf(p: Project): string {
  const n = p.name.replace(/^fde-/, "").replace(/-/g, " ");
  return /[A-Z]/.test(n) ? n : n.split(" ").map((w) => ACR[w] ?? w[0].toUpperCase() + w.slice(1)).join(" ");
}

/** The short value beside a project in lists: its metric, or the year for art. */
export function shortOf(p: Project): string {
  // a metric with no number in it ("native") is not proof, so the year stands in
  return trackOf(p) === "art" || !p.metric || !/\d/.test(p.metric.value) ? p.year : p.metric.value;
}

export const seo = {
  url: "https://damanjz.github.io/portfolio", // update if a custom domain lands
} as const;
