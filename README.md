# Daman — Portfolio

A creative-technologist portfolio built as a **pannable flow-board**: every project is drawn as the real production DAG that made it — idea → decisions → production → shipped. The flowchart *is* the navigation.

**Live:** [damanjz.github.io/portfolio](https://damanjz.github.io/portfolio/)

---

## What it is

The whole site is one **2D pannable, zoomable board**. Instead of a scrolling list of cards, each project is laid out in space as the path that built it — its decisions and trade-offs visible as a graph. Two ways in:

- **Explore** — the board (`/`). Pan, zoom, drag nodes, trace each project's build.
- **Read** — the linear "Monograph" view (`/read`). The same content top-to-bottom, and the accessibility / no-JS / 30-second fallback.

It holds **both halves of one practice**: a 3D environment artist (`damanpsd`) and a self-taught systems engineer (`damanjz`). The board's two hubs mirror each other — a *3D / technical-art* pipeline on one side, a *how I build software* pipeline on the other, each fanning out to the work it produced.

Dual theme: **Terminal** (warm-paper light) / **Nocturne** (near-black dark).

## Design principles

- **Zero external requests.** Fonts are self-hosted (`next/font`), art is committed WebP, video is click-to-load YouTube (nocookie). Nothing phones home.
- **Local-first, static.** No backend, no database, no analytics. A fully static export.
- **Real metrics only.** Every number on the site is true; nothing invented.
- **Content-derived.** The DAGs aren't hand-drawn — they're *derived* from a single content source, so the graph and the copy can never drift.

## Tech

| | |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Board | Hand-rolled DOM + SVG (no R3F / three.js / GSAP) |
| Output | Static export (`output: "export"`) → GitHub Pages |
| Fonts | Source Serif 4 · IBM Plex Mono (self-hosted) |

The board's pan / zoom / drag / marquee-select and the flowing SVG wires are all hand-built — GPU-composited transforms, a low-end device guard, and pan/zoom bounds keep it fluid down to weak hardware.

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # root: metadata, fonts, theme no-flash script
│   ├── page.tsx                # the board (home)
│   ├── read/page.tsx           # linear reading view (the Monograph)
│   ├── projects/[slug]/        # per-project deep pages (SSG) + JSON-LD
│   ├── not-found.tsx           # custom 404 (→ 404.html)
│   ├── sitemap.ts · robots.ts  # SEO routes
│   └── structured-data.tsx     # site-wide Person JSON-LD
├── components/
│   ├── Board.tsx               # the interactive board
│   └── …                       # Monograph sections, figures, cursor, theme
├── lib/
│   ├── board-layout.ts         # pure geometry + baked node positions
│   ├── graph.ts                # DAG derivation from content
│   └── …
└── content.ts                  # SINGLE SOURCE OF TRUTH — all site content
```

**`src/content.ts` is the one file to edit for content.** Every project, its copy, stack, decisions, metrics, and the DAGs derived from them all come from here.

## Run it locally

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). The board is the home page.

```bash
npm run build   # static export → out/
```

`out/` is the deployable static site.

## Deploy

Pushing to `main` triggers GitHub Actions → GitHub Pages (`.github/workflows/deploy.yml`, ~45–60s). The site deploys under the `/portfolio` base path; the workflow sets `NEXT_PUBLIC_BASE_PATH` so asset URLs resolve correctly.

## SEO & machine-readability

Per-page canonical / OG / Twitter metadata, a `Person` schema site-wide plus `SoftwareSourceCode` / `VisualArtwork` schema per project, `sitemap.xml`, `robots.txt`, a semantic heading outline, and an [`llms.txt`](https://damanjz.github.io/portfolio/llms.txt) LLM-readable summary.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the full version history.

## License

The **source code** is [MIT-licensed](./LICENSE) — read it, learn from it, reuse it. The **content** (project copy, 3D art, images, video, and Daman's name/identity) is **All Rights Reserved** and not licensed for reuse. See [LICENSE](./LICENSE) for the full terms.

---

© Daman · [github.com/damanjz](https://github.com/damanjz) · [artstation.com/damanpsd](https://www.artstation.com/damanpsd)
