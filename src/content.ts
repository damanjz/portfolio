/**
 * SINGLE SOURCE OF TRUTH for all site content. Everything the visitor reads
 * lives here; components only lay it out.
 */

export const site = {
  handle: "damanjz",
  name: "Daman Reddy",
  role: "Systems developer · 3D environment artist · BI and data analyst",
  location: "Hyderabad, IN",
  status: "Open to work",
  email: "daman.w3d@gmail.com", // public work contact
  // Title < 60 chars (Google truncates ~60); keywords front-loaded.
  metaTitle: "Daman Reddy — Systems, 3D Environments, BI and Data",
  // Description < 160 chars (Google truncates ~155); primary keywords early.
  metaDescription:
    "Daman Reddy, Hyderabad: AI-assisted systems developer, 3D environment artist (Unreal, Blender) and BI and data analyst (SQL, Power BI, Tableau).",
} as const;

export const socials = [
  { label: "ArtStation", handle: "@damanpsd", href: "https://www.artstation.com/damanpsd" },
  { label: "GitHub", handle: "@damanjz", href: "https://github.com/damanjz" },
  { label: "Email", handle: site.email, href: `mailto:${site.email}` },
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
  year: string;
  // ---- detail-page fields ----
  summary: string; // case-study intro
  youtube?: string; // full-length demo — YouTube video id, loaded on click only
  reels?: Reel[]; // locally-hosted video reels — no external request, played on click
  gallery: Shot[];
  sections: { heading: string; body: string }[];
  decisions?: { choice: string; reason: string }[];
  facts: { label: string; value: string }[];
  specAccent?: string; // which spec label gets the accent (e.g. "NETWORK")
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
    year: "Jun 2026", // repo created 2026-06-20
    summary:
      "A password manager that never phones home — Rust core, encrypted local vault, zero cloud dependency.",
    gallery: [],
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
    tagline: "Self-hosted AI support triage on local Ollama.",
    discipline: "systems",
    category: "automation",
    stack: ["n8n", "Ollama", "Eval-gated", "Docker"],
    status: "private",
    metric: { label: "routing", value: "88%" },
    year: "2026",
    summary:
      "A self-hosted support-triage pipeline: a local Ollama model routes tickets and drafts KB-grounded replies for human approval — every prompt change gated by an eval corpus.",
    gallery: [],
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
    tagline: "Techwear commerce, end to end.",
    discipline: "systems",
    category: "commerce",
    stack: ["Next.js 15", "Prisma", "Postgres", "NextAuth"],
    status: "public",
    href: "https://github.com/damanjz/volt-techwear-store",
    metric: { label: "stack", value: "Next 15 · Prisma 7" },
    year: "Mar 2026", // repo created 2026-03-13
    summary:
      "VOLT HQ — a full Next.js 15 techwear storefront: membership identity, dynamic clearance leveling, secure Server Action checkouts.",
    gallery: [
      { src: "/shots/volt-techwear-store/shop.webp", alt: "VOLT archive page: product grid of techwear with category filters", caption: "The archive — category filters, search and sort over the full catalogue." },
      { src: "/shots/volt-techwear-store/home.webp", alt: "VOLT home page: DEFY LIMITS hero with the current drop", caption: "The storefront — industrial techwear aesthetic, built to feel like a product, not a demo." },
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
    tagline: "A native video player that starts instantly.",
    discipline: "systems",
    category: "multimedia",
    stack: ["Python", "PySide6"],
    status: "public",
    href: "https://github.com/damanjz/flux-player",
    metric: { label: "runtime", value: "native" },
    year: "Mar 2026", // repo created 2026-03-10
    summary:
      "A sleek Windows video player in Python + PySide6 — a deliberate homage to Windows Media Player 12. Native desktop, no web wrapper.",
    gallery: [],
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
  {
    slug: "noctra",
    name: "NOCTRA",
    tagline: "A full-stack street-luxury app — and the call to pause it.",
    discipline: "systems",
    category: "commerce",
    stack: ["React Native", "Expo", "Express", "Prisma", "Postgres", "Redis", "Razorpay"],
    status: "wip",
    href: "https://github.com/damanjz/NOCTRA",
    hrefLabel: "view source",
    metric: { label: "state", value: "under development" },
    year: "Feb 2026", // repo created 2026-02-25
    summary:
      "\"Own the after hours.\" A cultural-membership commerce app — React Native front end, a security-hardened Node backend, Razorpay payments — built deep, then paused when the business case didn't hold.",
    gallery: [],
    sections: [
      {
        heading: "Idea",
        body: "NOCTRA was a business idea before it was code: a premium Indian street-luxury app where buying clothes earns access, not just a transaction. A cultural-membership layer — tiers, drop windows, waitlist position, referral clout — rather than a points program. The goal was to take a real product concept from strategy all the way to a working full-stack system.",
      },
      {
        heading: "Build",
        body: "A React Native (Expo) app over a Node/Express/Prisma backend, PostgreSQL and Redis, Socket.io for live drops, and a Next.js admin panel — a documented 12-table schema behind it. Auth runs Firebase phone-OTP into custom RS256 JWTs with single-use refresh rotation; the backend carries helmet, rate-limiting, zod validation and sanitize-html. The same security instinct as protec, in a commerce backend. Payments are Razorpay, UPI-first — built for how India actually pays.",
      },
      {
        heading: "The decision most portfolios hide",
        body: "I paused it. Once the system was real enough to judge the business case honestly, it didn't hold — so I stepped back rather than sink more time into something that wouldn't be profitable. The repo is still there to pick back up. Scoping a real product, building it deep, and knowing when to pause is part of the work too. The full docs set — architecture, security, scalability, deployment — is a real artifact of that thinking.",
      },
    ],
    decisions: [
      { choice: "MEMBERSHIP AS PRODUCT", reason: "the app is the brand — status, not a points program" },
      { choice: "RS256 JWT + ROTATION", reason: "single-use refresh tokens; the protec instinct in a commerce backend" },
      { choice: "UPI-FIRST (RAZORPAY)", reason: "built for how India actually pays" },
      { choice: "PAUSE ON A BUSINESS CALL", reason: "judged the case honestly, then stopped — a skill too" },
    ],
    facts: [
      { label: "TYPE", value: "FULL-STACK MOBILE" },
      { label: "APP", value: "REACT NATIVE · EXPO" },
      { label: "BACKEND", value: "NODE · EXPRESS · PRISMA" },
      { label: "DATA", value: "POSTGRES · REDIS" },
      { label: "AUTH", value: "FIREBASE + RS256 JWT" },
      { label: "PAYMENTS", value: "RAZORPAY (UPI)" },
      { label: "STATUS", value: "UNDER DEVELOPMENT" },
    ],
    specAccent: "STATUS",
  },
  {
    slug: "umbra",
    name: "umbra",
    tagline: "A storefront built from scratch — no framework, real WebGL.",
    discipline: "systems",
    category: "commerce",
    stack: ["Vanilla JS", "WebGL", "HTML", "CSS"],
    status: "live",
    href: "https://umbrav.vercel.app",
    hrefLabel: "view live",
    metric: { label: "dependencies", value: "zero" },
    year: "Feb 2026", // repo created 2026-02-25
    summary:
      "A full multi-page athletic-wear storefront built with no framework and no build step — 34 products, a scroll-driven hero, and a custom WebGL shader up top, all hand-written.",
    gallery: [
      { src: "/shots/umbra/home.webp", alt: "Umbra home page: the giant UMBRA wordmark over the WebGL shader hero", caption: "The hero — a hand-written WebGL shader in the brand violet behind the wordmark." },
    ],
    sections: [
      {
        heading: "Idea",
        body: "Umbra — \"shadow of style,\" premium athletic gear forged in the shadows. I wanted to build a complete storefront by hand: no framework, no build step, no dependencies to hide behind. Just HTML, CSS, and JavaScript, taken as far as they go — the fundamentals, proven.",
      },
      {
        heading: "Build",
        body: "A full multi-page site — men, women, kids, sport categories, 34 products with detail pages — plus a scroll-driven hero and a working cart and checkout on localStorage, no backend. Everything is hand-written; the deployed build (umbra_v) is the tightened version.",
      },
      {
        heading: "The shader",
        body: "The hero runs a real WebGL shader — custom vertex and fragment programs in the brand's deep-violet palette, reactive to the mouse. It's the 3D instinct from my art years showing up in the browser: not a library's default effect, but shader code written to match the brand.",
      },
    ],
    decisions: [
      { choice: "VANILLA > FRAMEWORK", reason: "prove the fundamentals; every page and animation is mine" },
      { choice: "CUSTOM WEBGL HERO", reason: "hand-written shaders, brand palette — the art instinct in the browser" },
      { choice: "LOCALSTORAGE CART", reason: "a working checkout with zero backend; fully static" },
    ],
    facts: [
      { label: "TYPE", value: "STOREFRONT · FRONT-END" },
      { label: "BUILT", value: "VANILLA HTML · CSS · JS" },
      { label: "HERO", value: "CUSTOM WEBGL SHADER" },
      { label: "CART", value: "LOCALSTORAGE" },
      { label: "SCOPE", value: "34 PRODUCTS · MULTI-PAGE" },
      { label: "STATUS", value: "LIVE" },
    ],
    specAccent: "HERO",
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
    year: "Oct 2026",
    summary:
      "An end-to-end BI build: realistic personal-finance exports, a tested SQL model in DuckDB, and a four-question Power BI report generated from code.",
    gallery: [
      { src: "/shots/finance-bi/where.webp", alt: "Power BI page 'Where does it go?': Sankey from gross pay to tax, provident fund, fixed costs, discretionary spend, investments and cash", caption: "Where does it go? Gross pay traced through tax and EPF to every destination." },
      { src: "/shots/finance-bi/track.webp", alt: "Power BI page 'Am I on track?': trailing 12-month savings rate and debt to income", caption: "Am I on track? Savings rate as a trailing 12-month line, so one car purchase no longer flattens the chart." },
      { src: "/shots/finance-bi/stop.webp", alt: "Power BI page 'When can I stop?': FIRE projection with sliders for return, inflation and withdrawal rate", caption: "When can I stop? Live what-if sliders recompute the FIRE age in DAX." },
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
      { choice: "SYNTHETIC, NOT TOY", reason: "publishable, but messy enough to need real cleaning" },
      { choice: "REPORT AS CODE", reason: "generated TMDL + PBIR: reviewable, reproducible" },
      { choice: "ACCRUAL SPEND", reason: "card spend counts when it happens, not when it's paid" },
    ],
    facts: [
      { label: "TYPE", value: "BI CASE STUDY" },
      { label: "DATA", value: "60 MONTHS · SYNTHETIC" },
      { label: "MODEL", value: "DUCKDB · PLAIN SQL" },
      { label: "CHECKS", value: "15 / 15 PASS" },
      { label: "REPORT", value: "POWER BI · GENERATED" },
      { label: "STATUS", value: "PUBLIC REPO" },
    ],
    specAccent: "CHECKS",
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
    caseStudy: "/case-studies/hr-analytics.pdf",
    metric: { label: "flight risk", value: "AUC 0.658" },
    year: "Oct 2026",
    summary:
      "A people-analytics build for a 2,500-person IT services firm: attrition, hiring, engagement and pay equity, plus a flight-risk score that never sees gender.",
    gallery: [
      { src: "/shots/hr-analytics/workbench.webp", alt: "HR analytics workbench: filters, five KPIs, six views, the highest flight risks and the levers behind them", caption: "The whole firm: filters, five headline numbers, six views and the at-risk drill." },
      { src: "/shots/hr-analytics/filtered.webp", alt: "The workbench filtered to the Data and Analytics department", caption: "One department: every number, chart and the drill table follow the filter." },
      { src: "/shots/hr-analytics/bengaluru.webp", alt: "The workbench filtered to Bengaluru in FY 2024-25", caption: "Bengaluru, FY 2024-25: rolling attrition and eNPS narrow to the year chosen." },
    ],
    sections: [
      {
        heading: "Problem",
        body: "HR data lives in separate systems: people and job changes in the HRIS, pay in payroll, requisitions in the ATS, anonymous scores in the survey tool. Leadership's questions cut across all of them: how fast are we losing people, which leavers hurt, are we paying fairly, and who is likely to go next?",
      },
      {
        heading: "Build",
        body: "A seeded generator simulates the firm month by month, with planted effects to find: resignations driven by pay against market, slow raises, long commutes and bench time; women paid 3.5% less for the same job. DuckDB builds a point-in-time monthly snapshot of every employee with ASOF joins, so nothing leaks from the future. A scikit-learn model trained on 2022-23 and tested on 2024 onwards scores everyone on the books and lists the levers HR could change. The Tableau workbook is written as XML by Python, matched to the file Tableau itself saves.",
      },
      {
        heading: "Measurement",
        body: "15 checks gate the export, each proven by breaking the data on purpose. Tableau's numbers match an independent DuckDB calculation for the whole firm and three filtered views, 20 values out of 20. The model reaches ROC AUC 0.658; its top 10% of scores catch 20.4% of leavers. Gender, age, region and university are never features, and the fairness table shows why women are still flagged more: they are paid less. Pay equity recovers the planted gap: 74.9% raw, 97.7% like for like.",
      },
    ],
    decisions: [
      { choice: "OUT-OF-TIME TEST", reason: "the model is judged on years it never saw" },
      { choice: "RISK AS A RANK", reason: "the model over-predicts calm years; ranks stay honest" },
      { choice: "WORKBOOK AS CODE", reason: "Tableau's own save as the spec; the XML rebuilds byte for byte" },
    ],
    facts: [
      { label: "TYPE", value: "PEOPLE ANALYTICS" },
      { label: "DATA", value: "4,238 PEOPLE · 48 MONTHS" },
      { label: "MODEL", value: "GRADIENT BOOSTING" },
      { label: "AUC", value: "0.658 OUT-OF-TIME" },
      { label: "DASHBOARD", value: "TABLEAU PUBLIC · LIVE" },
      { label: "STATUS", value: "PUBLIC REPO" },
    ],
    specAccent: "AUC",
  },

  /* ----------------------------------------------------------------------- */
  /*  CRAFT — 3D / art. Real renders from the project hub, optimized to WebP. */
  /* ----------------------------------------------------------------------- */
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
    year: "Oct 2026",
    summary:
      "Three years of a synthetic 256-bed hospital in Hyderabad: patient flow, bed occupancy and 30-day readmissions in DuckDB, a readmission model that beats the clinical LACE score, and a Power BI report generated from code.",
    gallery: [
      { src: "/shots/hospital-operations/now.webp", alt: "Power BI page 'Now': every bed by bay at a chosen hour, ER queue by triage level and patients per nurse", caption: "Now: every bed in the hospital at a chosen hour, the ER queue by triage level, and staffing against target." },
      { src: "/shots/hospital-operations/flow.webp", alt: "Power BI page 'Flow': ER arrivals and waits by weekday and hour, occupancy by month and waits by shift", caption: "Flow: arrivals and waits by weekday and hour; the evening wait falls once an extra evening doctor starts in April 2025." },
      { src: "/shots/hospital-operations/readmissions.webp", alt: "Power BI page 'Readmissions': rates by diagnosis, age, length of stay and unit fullness, with a follow-up list", caption: "Readmissions: who comes back within 30 days, and a follow-up list ranked by the model's risk score." },
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
      { choice: "OUT-OF-TIME TEST", reason: "train on the past, test on a later year: no leakage from the future" },
      { choice: "MODEL VS LACE", reason: "beat the score clinicians already use, like for like" },
      { choice: "REPORT AS CODE", reason: "generated Power BI project: reviewable, rebuilt identically" },
    ],
    facts: [
      { label: "TYPE", value: "BI CASE STUDY" },
      { label: "DATA", value: "168K ER VISITS · SYNTHETIC" },
      { label: "MODEL", value: "LOGISTIC REGRESSION" },
      { label: "AUC", value: "0.786 VS LACE 0.749" },
      { label: "CHECKS", value: "18 / 18 PASS" },
      { label: "REPORT", value: "POWER BI · GENERATED" },
      { label: "STATUS", value: "PUBLIC REPO" },
    ],
    specAccent: "AUC",
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
    caseStudy: "/case-studies/supply-chain.pdf",
    metric: { label: "stockout AUC", value: "0.840 vs rule 0.699" },
    year: "Oct 2026",
    summary:
      "Three years of a synthetic Indian FMCG distributor: on-time-in-full, lead time, inventory and supplier performance in DuckDB, a 14-day stockout model that beats the reorder-point rule, and a Tableau workbook generated from code.",
    gallery: [
      { src: "/shots/supply-chain/network.webp", alt: "Tableau dashboard: map of four warehouses and delivery lanes with OTIF, lead time, inventory turns, carrying cost and stockout risk", caption: "The whole network: click a warehouse or a lane on the map and every number follows." },
      { src: "/shots/supply-chain/kolkata.webp", alt: "The dashboard set to the Kolkata warehouse, OTIF 59.0%", caption: "Kolkata: on time and in full 59.0% against 83 to 87% at the other three warehouses." },
      { src: "/shots/supply-chain/diwali-2024.webp", alt: "The dashboard filtered to Snacks, FY 2024-25, as of 28 October 2024", caption: "Snacks going into Diwali 2024, as of 28 October: the watch list and the supplier behind it." },
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
        body: "15 checks gate the build, including an exact day-to-day stock balance, and each one is proven by breaking the data on purpose; two full rebuilds produce identical files. The 14-day stockout model (gradient boosting) reaches ROC AUC 0.840 against 0.699 for the reorder-point rule; flagging the same share of products as the rule, it catches 65.6% of stockouts against 59.5%. Dashboard numbers were checked against DuckDB in three filtered views.",
      },
      {
        heading: "What it found",
        body: "Kolkata delivers on time and in full 59.0% of the time against 83 to 87% at the other warehouses, held back by dispatch waits and monsoon lanes. One snacks supplier fell from 75% to 40% on time after July 2024, with the highest defect rate. A festive pre-build cut snacks out-of-stock days from 4.2% to 1.6% for about 16% more stock from September to November.",
      },
    ],
    decisions: [
      { choice: "OTIF PER ORDER LINE", reason: "one short line in a big order shouldn't hide which lines fail" },
      { choice: "MAP AS NAVIGATION", reason: "click a warehouse or lane and everything follows" },
      { choice: "MODEL VS RULE", reason: "beat the reorder-point rule planners already use" },
    ],
    facts: [
      { label: "TYPE", value: "BI CASE STUDY" },
      { label: "DATA", value: "3 YEARS · SYNTHETIC" },
      { label: "NETWORK", value: "4 DCS · 40 SUPPLIERS · 200 SKUS" },
      { label: "MODEL", value: "GRADIENT BOOSTING" },
      { label: "AUC", value: "0.840 VS RULE 0.699" },
      { label: "OTIF", value: "80.2%" },
      { label: "DASHBOARD", value: "TABLEAU PUBLIC · LIVE" },
      { label: "CHECKS", value: "15 / 15 PASS" },
      { label: "STATUS", value: "PUBLIC REPO" },
    ],
    specAccent: "AUC",
  },
  {
    slug: "umbraixs",
    name: "Umbraixs",
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
    tagline: "Studio product lighting — deep blacks, warm rim, colored gels.",
    discipline: "craft",
    category: "product-render",
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
    metric: { label: "format", value: "9:16 · social" },
    year: "2025",
    summary:
      "Looks-development for a set of graphic-finish electric guitars — low-key studio lighting, textured bodies, and compositing built for a vertical social cut. Made for the output, then posted.",
    reels: [
      { src: "/art/gtr-reel-lineup.mp4", poster: "/art/gtr-lineup.webp", portrait: true, caption: "REEL.01 — THE LINEUP · THREE SIGNATURE FINISHES · 9:16" },
      { src: "/art/gtr-reel-1.mp4", poster: "/art/gtr-slayer.webp", portrait: true, caption: "REEL.02 — HEADSTOCK PASS · RIM-LIT ON BLACK" },
      { src: "/art/gtr-reel-2.mp4", poster: "/art/gtr-detail.webp", portrait: true, caption: "REEL.03 — HARDWARE PASS · PICKUPS & BRIDGE" },
      { src: "/art/gtr-reel-3.mp4", poster: "/art/gtr-body.webp", portrait: true, caption: "REEL.04 — BODY GRAPHIC PASS · TEXTURED WRAP" },
    ],
    gallery: [
      { src: "/art/gtr-lineup.webp", alt: "three signature electric guitars lit against black", caption: "The lineup — three signature-graphic guitars, rim-lit against near-black so the silhouettes read first." },
      { src: "/art/gtr-body.webp", alt: "guitar body with EMG pickups over graphic wrap", caption: "The body pass — EMG pickups and tune-o-matic bridge over a war-art graphic wrap, lit to hold the surface detail." },
      { src: "/art/gtr-slayer.webp", alt: "guitar headstock with graphic decal, shallow depth of field", caption: "A headstock at shallow depth of field — the finish artwork and logo carry the frame; everything else falls to black." },
      { src: "/art/gtr-detail.webp", alt: "guitar neck and body detail", caption: "Detail pass — hardware, inlays, and the graphic finish, framed vertical for the social cut." },
    ],
    sections: [
      {
        heading: "The brief",
        body: "A set of signature-graphic electric guitars, treated as a product-placement piece rather than a modeling one. The job was looks-development: lighting, texturing, and compositing the guitars into a studio set that sells the object — the way a product ad would — with the final vertical cut in mind from the first frame.",
      },
      {
        heading: "The approach",
        body: "Rendered in Blender with Cycles. The set is low-key — near-black studio, guitars on wall mounts, described by rim light so the silhouette and the finish artwork read before anything else. Texturing carries the graphic body wraps and the hardware (EMG pickups, tune-o-matic bridges, logo decals); compositing ties the passes together. The whole scene was built for the output: framed 9:16, cut into short reels, and posted to Instagram.",
      },
    ],
    facts: [
      { label: "TYPE", value: "PRODUCT LOOKS-DEV" },
      { label: "TOOL", value: "BLENDER · CYCLES" },
      { label: "WORK", value: "LIGHTING · TEXTURING · COMP" },
      { label: "SUBJECT", value: "SIGNATURE GUITARS" },
      { label: "FORMAT", value: "9:16 · SOCIAL" },
      { label: "SHIPPED", value: "INSTAGRAM" },
    ],
    specAccent: "FORMAT",
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
      "A volumetric cloud study at golden hour — two soft cumulus forms lit warm on top and cool below, sitting in a smoothly graded dusk sky. Generated as volume rather than painted, so the light reads through the whole form.",
    gallery: [
      { src: "/art/proc-clouds.webp", alt: "two golden-hour volumetric clouds against a dusk sky", caption: "Two cumulus forms at golden hour — warm light catching the tops, cooler shadow beneath, in a graded dusk sky." },
    ],
    sections: [
      { heading: "The study", body: "A focused lighting-and-volume study: two soft cumulus clouds at golden hour. The goal was believable scattering — warm light raking the tops, the underside falling to cool shadow — with the forms reading as volume, not flat cards." },
      { heading: "Why procedural", body: "Built as volumetrics rather than painted so the light genuinely travels through the cloud. It's the same instinct as the rest of the craft work: describe the thing with rules and let the render resolve it." },
    ],
    facts: [
      { label: "TYPE", value: "LIGHTING STUDY" },
      { label: "TOOL", value: "BLENDER · VOLUMES" },
      { label: "SUBJECT", value: "CUMULUS · GOLDEN HOUR" },
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
      "A dense city block seen from above — skyscrapers, setbacks, rooftop clutter of HVAC units and antennas — rendered as untextured clay so the scale, massing and geometry carry the frame on their own.",
    gallery: [
      { src: "/art/cityscape.webp", alt: "aerial greyscale clay render of a dense city", caption: "An aerial clay render of a dense downtown — rooftop detail, setbacks and towers, left untextured so massing reads first." },
    ],
    sections: [
      { heading: "Scale from geometry", body: "A downtown seen from above, rendered in greyscale clay. Stripping colour and texture puts all the weight on geometry — the massing of towers, the rhythm of setbacks, the clutter of rooftop mechanicals — to see whether the scene holds on scale alone." },
      { heading: "Built by rules", body: "The density is the point: enough buildings, each with believable rooftop detail, that placing them by hand isn't the move. It's an environment/scale exercise in the same procedural vein as the generators." },
    ],
    facts: [
      { label: "TYPE", value: "ENVIRONMENT · SCALE" },
      { label: "TOOL", value: "BLENDER" },
      { label: "RENDER", value: "GREYSCALE CLAY" },
      { label: "SUBJECT", value: "DENSE CITY" },
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
      { src: "/art/highway-stop.webp", alt: "foggy roadside gas stop at night with neon canopy", caption: "A roadside stop at night — barriers curving into fog, streetlights receding, a neon-trimmed canopy glowing at the edge." },
    ],
    sections: [
      { heading: "Atmosphere first", body: "This is a mood piece: an empty roadside at night, carried by fog, falloff, and a few warm pools of streetlight. The near-monochrome palette makes the single hit of red-and-blue neon land hard." },
      { heading: "Leading the eye", body: "The crash barrier and the line of lamps act as leading lines pulling into depth; the lit canopy is the anchor. It's a composition-and-lighting study more than a modelling one." },
    ],
    facts: [
      { label: "TYPE", value: "ENVIRONMENT · MOOD" },
      { label: "TOOL", value: "BLENDER" },
      { label: "STUDY", value: "NIGHT LIGHTING · FOG" },
      { label: "SUBJECT", value: "ROADSIDE STOP" },
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
      "An interior lighting study — a modern living room after dark, its mood set by nested square ceiling frames, a warm standing lamp, and the glow they throw across a sectional, marble table and patterned floor.",
    gallery: [
      { src: "/art/interior-study.webp", alt: "warm modern living room at night with nested light fixtures", caption: "A living room after dark — nested light-frame fixtures and a single lamp carry a warm, low-key evening mood." },
    ],
    sections: [
      { heading: "Light as the subject", body: "The room is furnished plainly on purpose; the piece is really about the light. Nested square fixtures and one warm lamp set a low-key evening key, with the fill falling off into the corners of the space." },
      { heading: "Materials in low light", body: "It's also a materials test — how the sofa fabric, marble top, and patterned floor hold up when they're described almost entirely by warm, indirect light rather than a bright key." },
    ],
    facts: [
      { label: "TYPE", value: "INTERIOR · LIGHTING" },
      { label: "TOOL", value: "BLENDER" },
      { label: "STUDY", value: "EVENING · LOW-KEY" },
      { label: "SUBJECT", value: "LIVING ROOM" },
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
export type TrackId = "systems" | "art" | "data";

export type Track = {
  id: TrackId;
  num: string;
  role: string; // the door label
  word: string; // the giant word on the landing door ("|" = forced line break)
  line1: string; // door-page hero, line 1
  line2: string; // door-page hero, line 2
  fit: number; // hero size: content width / fit (em), same scale as the approved v5 build
  cover: string; // landing door image
  coverPos?: string; // object-position when the subject is not centred
  intro: string; // the one-paragraph pitch; introEm is accented
  introEm: string;
  stats: { value: string; label: string }[];
  ribbon: string[];
  outro: [string, string]; // footer headline, second line accented
};

export const tracks: Track[] = [
  {
    id: "systems",
    num: "01",
    role: "AI-assisted systems developer",
    word: "Systems",
    line1: "Systems",
    line2: "Developer",
    fit: 9.2,
    cover: "/doors/systems.webp",
    coverPos: "left top",
    intro: "I ship complete software with AI as the co-pilot and my judgement at the wheel:",
    introEm: "local-first, security-hardened, measured before it ships.",
    stats: [
      { value: "06", label: "projects shipped or in build" },
      { value: "16", label: "security fixes from one audit" },
      { value: "88%", label: "routing accuracy, AI triage" },
    ],
    ribbon: ["Rust", "TypeScript", "Next.js", "Python", "Tauri", "Ollama", "Postgres", "WebGL"],
    outro: ["Let's build", "something"],
  },
  {
    id: "art",
    num: "02",
    role: "3D environment artist",
    word: "Environ|ments",
    line1: "Environment",
    line2: "Artist",
    fit: 8.3,
    cover: "/art/umbraixs-path.webp",
    intro: "I build places that tell a story on their own,",
    introEm: "composed to read in motion, from stylized villages to sodium-lit roadsides.",
    stats: [
      { value: "08", label: "pieces" },
      { value: "UE5", label: "and Blender" },
      { value: "MA", label: "Animation" },
    ],
    ribbon: ["Unreal Engine 5", "Blender", "Substance", "Lumen", "Nanite", "Lighting", "Composition"],
    outro: ["Let's build", "a world"],
  },
  {
    id: "data",
    num: "03",
    role: "BI and data analyst",
    word: "Data",
    line1: "Data",
    line2: "Analyst",
    fit: 7.6,
    cover: "/doors/data.webp",
    intro: "I turn messy records into reports people can act on,",
    introEm: "with every number reconciled back to SQL before it ships.",
    stats: [
      { value: "04", label: "end-to-end BI builds" },
      { value: "0.840", label: "best model ROC AUC, stockouts" },
      { value: "63", label: "of 63 report numbers matched to SQL" },
    ],
    ribbon: ["SQL", "DuckDB", "Python", "Power BI", "DAX", "Tableau", "Modelling", "Reconciliation"],
    outro: ["Let's find", "the signal"],
  },
];

export function trackOf(p: Project): TrackId {
  if (p.discipline === "craft") return "art";
  return p.category === "analytics" ? "data" : "systems";
}

export function getTrack(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}

/** A track's work, pieces with a real image first (the lead card runs wide). */
export function projectsIn(id: TrackId): Project[] {
  const own = projects.filter((p) => trackOf(p) === id);
  const hasImage = (p: Project) => p.gallery.length > 0 || (p.reels?.length ?? 0) > 0;
  return [...own.filter(hasImage), ...own.filter((p) => !hasImage(p))];
}

/** Repo-style names read as words in giant caps: "flux-player" -> "flux player". */
export function displayName(name: string): string {
  return name.replace(/-/g, " ");
}

/** Widest word in em for Archivo 900 caps (~0.76em a letter), so a title never clips. */
export function fitOf(text: string): number {
  const longest = Math.max(...text.split(" ").map((w) => w.length));
  return Math.max(longest * 0.76, 4.5);
}

/**
 * HOW I WORK — the standards behind each craft, four per door. Every line is
 * backed by a project on that door.
 */
export const ethics: Record<TrackId, { title: string; body: string }[]> = {
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
      body: "A scene that stutters doesn't read. Umbraixs was profiled to about 100 fps against a 60 fps target, with Lumen and Nanite doing the heavy lifting.",
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

export const seo = {
  url: "https://damanjz.github.io/portfolio", // update if a custom domain lands
} as const;
