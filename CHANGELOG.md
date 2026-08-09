# Changelog — Daman Portfolio

All notable changes to the portfolio. v4 ("the flow-board") replaced v3 ("The
Monograph") as the live site. Dates are when the work shipped to `main`
(auto-deploys to [damanjz.github.io/portfolio](https://damanjz.github.io/portfolio/)).

---

## v4 — The Flow-Board

The whole site is one pannable 2D board; every project is drawn as its real
production DAG (idea → decisions → production → shipped). Dual theme: **Terminal**
(light) / **Nocturne** (dark).

### v4.14 — OG image + favicon — 2026-08-08
- **OG image** (`public/og.png`, 1200×630) — the "origin node on the board": name, role, and wires fanning to project chips over the dot-grid, in the Nocturne palette. This is the preview card shown when the site is shared on social platforms.
- **Favicon** (`app/icon.svg`) — a serif "D" node in the accent colour, traced from the Source Serif 4 glyph so it renders crisply at any size independent of webfonts.

### v4.13 — Final pass: SEO, dead-code, 404, AI-agent, docs — 2026-08-08
- **SEO** — added `sitemap.xml` and `robots.txt`; per-project structured data (`SoftwareSourceCode` / `VisualArtwork`) alongside the site-wide `Person`; shortened the home title and meta description to fit search-result limits; canonical/OG trailing slashes; a semantic heading outline (h1 + h2s) on the board home; `authors` / `keywords` metadata. Fixed an OG bug where empty-gallery projects pointed `og:image` at the site URL instead of an image.
- **AI-agent readability** — added `llms.txt`, an LLM-readable summary of the site.
- **Custom 404** — an on-brand `not-found.tsx` → `404.html` ("this node isn't on the board"), dual-theme, `noindex`.
- **Security** — hardened the YouTube embed (referrer policy + trimmed permissions).
- **Dead code removed** — an unused component, a dead export, unused imports, and several orphaned CSS rules (net −61 lines).
- **Docs** — added this project's README and LICENSE (MIT for the source code; content is All Rights Reserved).

### v4.12 — Layout re-bake, no box outlines, art-output wire, stable zoom — 2026-08-08
- **Board re-arranged** — the hand-arranged node layout was re-baked as the new default.
- **Box outlines removed** — the framed rectangles around each project/plate are gone; the group labels stay.
- **Art "output" wire recolored** — the wire leading into each art project's Output step is now a distinct teal-blue, apart from the amber art wires.
- **Stable zoom** — zoom now uses a single rendering mode at every level, so text no longer shimmers or reflows as you zoom (it was swapping modes at rest before). Slightly softer away from 100%, sharp at 100%.
- **Tighter zoom-out cap + pan bounds** — the board can't be zoomed or panned as far into empty space.
- **Work-hub wires are plain orange** — the work hub's connections (origin → hub, hub → each project, and the process pipeline chain) use the plain accent wire, not the green branch colour. Only the project-DAG "shipped" end wires stay green.

### v4.11 — Engineering-process hub + zoom cap + pan bounds — 2026-08-08
- **"How I build software" hub** — a process node before the systems projects, the engineering-side twin of the art hub. Expands into a 6-stage build DAG (Scope → Threat-model → Build → Measure → Harden → Ship), drawn from the real project decisions and principles.
- **Zoom-out cap** — the board can no longer shrink to a distant speck; the floor is the larger of a fixed minimum and the scale that fits the whole board.
- **Pan bounds** — the camera is clamped so the board always stays on screen; no panning off into empty space.
- **Work projects branch out of the work hub** — the systems projects now connect from the work hub with colored wires, mirroring how the art hub fans out to its plates. Each hub has its own process pipeline plus a colored branch to everything it produced.

### v4.10 — Reposition as creative technologist + audit fixes — 2026-08-08
- **Positioning.** The site now leads as a creative technologist — a trained 3D environment artist and self-taught systems engineer — instead of "systems engineer" alone, which had erased half the story. Updated across the hero thesis, intro, page metadata, the board's Origin node, and the About and Focus lines.
- **Distinct project descriptions** for protec, volt, and flux (previously duplicated their taglines).
- **Real build dates** — each project now carries the actual month from its repo history rather than a bare year.

### v4.9.1 — Wire-glow flicker fix — 2026-08-08
- The wire glow used to flick off/on while panning — the bloom was suppressed during every pan/zoom/drag to protect weak GPUs, which on a capable machine reads as a flicker. Panning with the static glow live is ~0.03ms/frame (the already-rasterized filter just composites), so it's free on a capable GPU. Now the glow is dropped only on low-end devices — which show a flat bright wire always — so no machine ever sees the glow toggle. Removed the now-dead interaction-suppression machinery.

### v4.9 — Static bloomed wires + real contact email — 2026-08-08
- **Real contact email.** Replaced the `hello@example.com` placeholder (live in the `/read` mailto) with the real work address. The board Contact node now offers email + GitHub.
- **Static bloomed wires.** Dropped the animated flowing-glint for a steady glowing wire — a bright accent core with a soft two-layer drop-shadow halo, in all three wire colors, themed for light and dark. One consistent look for everyone. Potato-safe: the glow is static at rest and drops to a plain bright stroke during pan/zoom/drag and on low-end devices, so a weak GPU never re-renders a blurred layer while moving.
- Removed the now-dead wire animation machinery (keyframe, idle/hidden/zoomed-out pause toggles, per-wire delay); fixed a dark-theme bug where the base-track glow overrode the colored blooms.

### v4.8 — Potato-PC performance pass — 2026-08-08
- **Zoom is no longer a per-frame relayout.** The CSS `zoom` property (chosen in v4.4 for crisp text) was forcing a full ~80-node relayout on every wheel tick — profiled at **27 ms/frame** (worse on weak/integrated GPUs → the "not fluid when zooming out" jank). Now zoom animates via GPU-composited `transform: scale` during the gesture (**0.24 ms/frame, measured 113× faster**) and swaps to the crisp `zoom` property once, ~180 ms after zooming stops. Fluid in motion, razor-sharp at rest.
- **Wires stop glitching on zoom** — they re-measure and redraw against the settled coordinates after the crisp swap, so they never sit misaligned mid-zoom.
- **Group-move optimized** — dragged nodes' DOM elements are resolved once at drag-start instead of re-queried every pointer-move frame (**~6× cheaper** on a full-board selection).
- **Low-end guard** — on a weak device (≤4 cores / ≤4 GB RAM / reduced-motion) the ~80 perpetual flowing-wire animations (the dominant *sustained* compositor cost) drop to static wires: the board still reads as a DAG, just without the moving glint. Restored automatically on capable machines.
- **Zoomed-out flow pause** — past ~0.55× the moving wire-glints are too small to see, but the 80 animations still repaint every frame. Below the threshold they pause (`.far` class, same mechanism as the idle pause); above it they resume. Wires stay drawn — only the never-seen animation stops. Helps every machine, most on a potato.

### v4.7 — Mobile board + per-art DAGs — 2026-08-08
- **Mobile: touch-tuned board** (direction C) — real pinch-to-zoom (about the midpoint, wider zoom-out on touch), inertial pan, opens collapsed + fits all roots, card-drag disabled on touch, and a thumb-zone bottom toolbar (fit / zoom / theme / read). Desktop board unchanged.
- **Per-art-project DAGs** — every art plate now expands into its own Vision → Implementation → Problems faced → Output DAG (drafted from the images); the shared art-hub pipeline is kept too.

### v4.6 — Perf + art cleanup — 2026-08-08
- Pause the flowing-wire animation during active pan/zoom/drag (`.busy`) — ~27% faster zoom (measured 485ms → 354ms for 20 ops). The flow keeps running when idle.
- Removed the **NPR / Grease-Pencil** art plate (PL.07) — it duplicated PL.03 Stylized Studies. Remaining art plates renumbered to stay sequential (PL.01–PL.08). Art plates: 8 → 7; project pages: 14 → 13.

### v4.5 — Performance + baked layout — 2026-08-08
- **Baked in the hand-arranged layout** as the default — node positions the
  owner set by dragging (previously only in browser localStorage) now persist
  for every visitor on every device. The board opens fully expanded; Reset
  returns to this arrangement. (`b58bbe1`)
- **Performance pass** — profiled first (payload was already small; the cost was
  runtime): (`1f64318`)
  - Board links no longer prefetch — killed a burst of ~30 RSC prefetch requests
    (many 404ing) that fired on every load.
  - The dot-grid layer is now paint-isolated (`contain: strict` + own compositor
    layer) so it rasterizes once instead of repainting the whole gradient every
    zoom/pan frame.
  - Removed the per-frame drop-shadow on the flowing wires; wires pause when the
    tab is hidden.
  - The custom-cursor animation loop now stops when idle instead of running
    forever; drag wire-redraws coalesced to one per frame.

### v4.4 — Second tweak round + more art — 2026-08-07
- **Crisp text at 150% zoom** — zoom now drives the CSS `zoom` property (text
  re-rasterizes sharp) instead of a transform scale (which blurred). (`7f46f82`)
- **+5 artworks** — Procedural Clouds, Cityscape, NPR / Grease-Pencil, Highway
  Night Stop, Interior Study, each with its own deep page (self-hosted, from the
  owner's ArtStation).
- Selection rolled back to **shift-drag** (removed the SELECT tool).
- **Bigger artwork cards.**
- **Flowing wires** — a glint travels each link.
- Project nodes spread more naturally (tighter, less sparse).

### v4.3 — First tweak round — 2026-08-07
- **Zoom to 150%** and the board background/texture scales with zoom; texture
  made more visible in both themes. (`e7dd41a`)
- Bottom-left tools collapsed into a **drop-up menu**.
- **Whole card is draggable** (not just the top strip).
- Creative nodes fixed — plates are now draggable, and the art hub expands into a
  real **art-pipeline DAG** (concept → Blender → Substance → UE5 → atmosphere →
  render), reconstructed from the owner's actual project files.
- **Custom cursor** — a precise dot that expands to a ring over interactive
  targets.

### v4.2 — /read: The Monograph as a reading view — 2026-08-07
- Added **`/read`** — the polished v3 Monograph, re-skinned into the v4
  Terminal/Nocturne themes, as the linear reading view of the same content. The
  board is the spatial view; `/read` is the calm top-to-bottom read. (`e6bea96`)

### v4.1 — Finish review — 2026-08-07
- Impeccable finish-review fixes before launch: deterministic initial framing,
  light-theme AA contrast, keyboard-operable board + focus-trapped outline,
  mobile chrome, and a dead-code sweep. (`2dcab59`)

### v4.0 — Launch — 2026-08-07
- The flow-board shipped, **replacing The Monograph** as the live site.
  (merge `09899d1`)
- Core build: content-derived DAGs, dual-theme token system, pan/zoom, draggable
  nodes, per-project expand trees + deep pages, container boxes, marquee
  multi-select, the a11y outline, text non-selectable site-wide. Zero external
  requests (video is click-to-load).
  (`0bed33b` → `4060a8f`, `ff5ada5`)

---

## v3 — The Monograph (retired)

A printed-engineering-volume design: warm paper, ink typography, drafting-blue
annotation, art bound in as plates. Live until 2026-08-07, now preserved in git
history (pre-v4 `main` at `5fb4ce3`) and re-skinned as the `/read` view.
