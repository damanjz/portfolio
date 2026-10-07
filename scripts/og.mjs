/**
 * Renders the social share image (public/og.png, 1200x630) in the site's own
 * look: the landing in miniature (who on the left, a wall of work on the right),
 * set in the site's built fonts.
 * Needs a finished build (`npm run build`) and a Chromium binary:
 *   CHROME=<path to chrome or chrome-headless-shell> node scripts/og.mjs
 */
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const CHROME = process.env.CHROME;
if (!CHROME) throw new Error("Set CHROME to a Chromium executable");

// latin @font-face rules from the built CSS (Archivo, Space Grotesk)
const cssFile = readdirSync(join(OUT, "_next/static/chunks")).find((f) => f.endsWith(".css"));
const css = readFileSync(join(OUT, "_next/static/chunks", cssFile), "utf8");
const faces = (css.match(/@font-face\{[^}]*\}/g) ?? [])
  .filter((f) => /url\([^)]*\.p\.[^)]*\)/.test(f)) // the preloaded latin subsets
  .map((f) => f.replace(/url\(\.\.\/media\//g, "url(_next/static/media/"))
  .join("\n");

// the landing in miniature: who on the left, a wall of real work on the right
const wall = [
  ["art/umbraixs-path.webp", "shots/protec/app.webp", "art/highway-stop.webp"],
  ["shots/hr-analytics/workbench.webp", "art/car-hero.webp", "shots/ai-calendar/month.webp"],
  ["art/interior-study.webp", "shots/supply-chain/network.webp", "art/proc-clouds.webp"],
];
const crafts = [["01", "Systems", "16", "security fixes, one audit"], ["02", "Environments", "UE5", "and Blender"], ["03", "Data", "0.840", "best model ROC AUC"]];

const html = `<!doctype html><meta charset="utf-8"><style>
${faces}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{background:#e9e9e7;color:#141414;font-family:"Space Grotesk",sans-serif;display:grid;grid-template-columns:600px 1fr}
.me{display:flex;flex-direction:column;padding:30px 40px 30px 44px;border-right:2px solid #141414}
.top{display:flex;justify-content:space-between;align-items:center}
.top b{font-weight:500;font-size:20px}.top b span{color:#6b6b6b;font-weight:400}
.pill{display:inline-flex;align-items:center;gap:9px;border:2px solid #141414;border-radius:999px;padding:6px 16px;font-weight:500;font-size:16px}
.dot{width:8px;height:8px;border-radius:50%;background:#2fbf71}
.cap{font-family:Archivo,sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-.02em;line-height:.86}
.me .name{font-size:112px;margin-top:auto}
.me p{font-size:24px;font-weight:500;margin-top:16px}.me p em{font-style:normal;color:#fe6608}
.rows{margin-top:20px;border-top:2px solid #141414}
.row{display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #cfcfc9}
.row .n{font-size:13px;color:#6b6b6b}.row .w{font-size:26px}
.row .s{text-align:right;font-size:12px;color:#6b6b6b}.row .s b{display:block;font-size:20px;font-weight:500;color:#141414}
.wall{background:#141414;display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:0 7px;overflow:hidden}
.col{display:flex;flex-direction:column;gap:7px}.col:nth-child(1){margin-top:-60px}.col:nth-child(2){margin-top:-150px}.col:nth-child(3){margin-top:-20px}
.col img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:5px;filter:grayscale(1) brightness(.85)}
.col img:nth-child(2){aspect-ratio:16/11}
</style>
<div class="me">
  <div class="top"><b>Daman Reddy <span>/ Hyderabad</span></b><span class="pill"><span class="dot"></span>Open to work</span></div>
  <div class="cap name">Daman<br>Reddy</div>
  <p>3D artist turned <em>systems builder.</em></p>
  <div class="rows">${crafts.map(([n, w, v, l]) => `<div class="row"><span class="n">${n}</span><span class="w cap">${w}</span><span class="s"><b>${v}</b>${l}</span></div>`).join("")}</div>
</div>
<div class="wall">${wall.map((c) => `<div class="col">${c.map((src) => `<img src="${src}">`).join("")}</div>`).join("")}</div>`;

const page = join(OUT, "_og.html");
const shot = join(OUT, "_og.png");
writeFileSync(page, html);
execFileSync(CHROME, ["--hide-scrollbars", "--allow-file-access-from-files", "--force-device-scale-factor=1", "--window-size=1200,630", "--virtual-time-budget=4000", `--screenshot=${shot}`, pathToFileURL(page).href]);
await sharp(shot).png({ compressionLevel: 9, palette: false }).toFile(join(ROOT, "public/og.png"));
rmSync(page);
rmSync(shot);
console.log("public/og.png written");
