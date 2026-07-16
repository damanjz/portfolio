/**
 * Regenerates .design-sync/sync-styles.css from the latest compiled Tailwind
 * build. Run after any theme change:  npm run build && node .design-sync/refresh-css.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const CHUNKS = join(ROOT, ".next", "static", "chunks");

// newest production css chunk over 10KB = the compiled Tailwind build
const candidates = readdirSync(CHUNKS)
  .filter((f) => f.endsWith(".css"))
  .map((f) => ({ f, s: statSync(join(CHUNKS, f)) }))
  .filter((x) => x.s.size > 10_000)
  .sort((a, b) => b.s.mtimeMs - a.s.mtimeMs);

if (!candidates.length) {
  console.error("no compiled css >10KB under .next/static/chunks — run `npm run build` first");
  process.exit(1);
}

const src = join(CHUNKS, candidates[0].f);
copyFileSync(src, join(HERE, "compiled-tailwind.css"));

const header = `/* Design-sync styling entry — FLATTENED: the app's compiled Tailwind v4 build
 * inlined (self-hosted next/font woff2s, url-rewritten so the design-sync font
 * harvester can copy them) + the font vars next/font sets in the real app.
 * Refresh after a theme change:  npm run build && node .design-sync/refresh-css.mjs */
:root { --font-space: 'Space Grotesk'; --font-jbmono: 'JetBrains Mono'; --font-inter: 'Inter'; }
`;

// ../media/*.woff2 resolves from .next/static/chunks/ — repoint it so it
// resolves from THIS directory instead, letting the build copy the real files.
const css = readFileSync(src, "utf8").replaceAll("url(../media/", "url(../.next/static/media/");

writeFileSync(join(HERE, "sync-styles.css"), header + css);
console.log(`sync-styles.css regenerated from ${candidates[0].f} (${(candidates[0].s.size / 1024).toFixed(0)}KB)`);
