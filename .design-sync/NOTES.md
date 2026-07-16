# design-sync notes — daman-portfolio

Repo-specific gotchas discovered on the first sync (2026-07-16). Read before any re-sync.

- **This is a Next.js APP, not a packaged library.** No dist/, components are default exports under `src/components/`. The bundle entry is the hand-written barrel `.design-sync/ds-entry.ts` (re-exports defaults as named; wired via `cfg.entry`). Without `--entry`/`cfg.entry` the converter crashes looking for `node_modules/daman-portfolio`.
- **Next imports are shimmed** via `cfg.tsconfig` → `.design-sync/tsconfig.sync.json` paths: `next/image` / `next/link` / `next/navigation` → `.design-sync/shims/*`. The image shim swaps missing assets (e.g. `/art/*.webp`, which exist only in the app) for labeled dark placeholders via onError.
- **CSS is the COMPILED Tailwind v4 build**, flattened into `.design-sync/sync-styles.css` by `node .design-sync/refresh-css.mjs` (picks the newest >10KB css chunk under `.next/static/chunks`, rewrites `url(../media/…)` → `url(../.next/static/media/…)` so the font harvester copies the woff2s). **After any theme change: `npm run build && node .design-sync/refresh-css.mjs`, then rebuild the bundle.** The converter does NOT chase local `@import`s in cssEntry — keep it flattened.
- **Fonts are self-hosted** (next/font woff2s from `.next/static/media`, clean family names in Next 16). No Google Fonts import — matches Daman's no-external-CDN rule.
- **`Stage` provider is mandatory** (`cfg.provider`): the app styles `<body>` (dark bg, bone text, Inter); without Stage every preview renders bone-on-white. Stage lives at `.design-sync/shims/stage.tsx`, exported through the barrel, excluded from the component list via `componentSrcMap: {"Stage": null}`.
- **Entrance animations race captures.** Components use IO-gated reveals (`useReveal`) + framer-motion starting at `opacity: 0`; per-story captures fired before the reveal (empty Work grid, closed palette). Fix: `.design-sync/previews/_settle.tsx` (`Settle`) — attribute-scoped `!important` overrides that force-finish INLINE-styled animation state only. Imported by preview files; never ships in the bundle.
- **CommandPalette preview opens the palette** by dispatching the real ⌘K keydown synchronously in a parent effect (child's listener attaches first). Don't add delays — they race the screenshot.
- **Playwright chromium lives at `F:/ClaudeSpace/ms-playwright`** (no-elephants rule): export `PLAYWRIGHT_BROWSERS_PATH=F:/ClaudeSpace/ms-playwright` before validate/capture/resync or the render check fails to launch.
- Repo intentionally has NO git commits (Daman's rule: never commit without his word) — the "commit the durable set" step is deferred until he says commit.

## Known render warns

(none — validate exits clean with zero warnings)

## Re-sync risks

- `sync-styles.css` / `compiled-tailwind.css` are SNAPSHOTS of the built theme — they silently go stale after any `globals.css`/component-class change until `refresh-css.mjs` is re-run. This is the #1 thing to check on a re-sync.
- The `.next/static/chunks` css filename is content-hashed; `refresh-css.mjs` picks the newest >10KB file — if the app ever ships multiple large css chunks this heuristic could pick the wrong one.
- Font woff2 hashes change with Next upgrades; refresh-css re-copying handles it, but stale `fonts/` entries in the project are cleaned only by the reconciliation delete pass.
- The `Settle` helper and the image-shim placeholder are tied to framer-motion writing inline styles and to `next/image` prop shape — a major upgrade of either could invalidate them.
- Site content (projects, copy) lives in `src/content.ts` and is BUNDLED — every content edit changes the bundle and re-uploads it (correct, but expect `upload.bundle: true` on most re-syncs).
