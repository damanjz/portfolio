# Changelog — Daman Portfolio

All notable changes to the portfolio. v4 ("the flow-board") replaced v3 ("The
Monograph") as the live site. Dates are when the work shipped to `main`
(auto-deploys to [damanjz.github.io/portfolio](https://damanjz.github.io/portfolio/)).

---

## v4 — The Flow-Board

The whole site is one pannable 2D board; every project is drawn as its real
production DAG (idea → decisions → production → shipped). Dual theme: **Terminal**
(light) / **Nocturne** (dark).

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
