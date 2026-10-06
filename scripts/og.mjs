/**
 * Renders the social share image (public/og.png, 1200x630) in the site's own
 * look: name, the three doors and the ribbon, set in the site's built fonts.
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

const doors = [
  ["01", "Systems", "doors/systems.webp", "left top"],
  ["02", "Environ<br>ments", "art/umbraixs-path.800.webp", "center"],
  ["03", "Data", "doors/data.800.webp", "center"],
];

const html = `<!doctype html><meta charset="utf-8"><style>
${faces}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{background:#e9e9e7;color:#141414;font-family:"Space Grotesk",sans-serif;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center;padding:34px 44px 0}
.top b{font-weight:500;font-size:22px}.top b span{color:#6b6b6b}
.pill{display:inline-flex;align-items:center;gap:10px;border:2px solid #141414;border-radius:999px;padding:8px 20px;font-weight:500;font-size:19px}
.dot{width:9px;height:9px;border-radius:50%;background:#2fbf71}
.main{flex:1;display:flex;gap:28px;padding:26px 44px 24px;min-height:0}
.name{flex:1;display:flex;flex-direction:column;justify-content:flex-end}
.cap{font-family:Archivo,sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-.02em;line-height:.86}
.name .cap{font-size:128px}
.name p{font-size:23px;margin-top:22px;line-height:1.3}.name p em{font-style:normal;color:#fe6608}
.doors{display:flex;gap:10px;width:540px}
.door{position:relative;flex:1;border-radius:8px;overflow:hidden;background:#1c1c1b;color:#f3f3f1}
.door img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.08) brightness(.72)}
.door:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45),rgba(0,0,0,0) 22%,rgba(0,0,0,0) 38%,rgba(0,0,0,.8))}
.door .n{position:absolute;top:14px;left:14px;z-index:1;color:#fe6608;font-size:16px;font-weight:500}
.door .w{position:absolute;left:14px;right:10px;bottom:14px;z-index:1;font-size:26px}
.ribbon{background:#141414;color:#e9e9e7;white-space:nowrap;overflow:hidden;padding:14px 0 14px 44px;font-family:Archivo,sans-serif;font-weight:800;font-size:19px;text-transform:uppercase;letter-spacing:.02em}
.ribbon i{color:#fe6608;font-style:normal;margin:0 22px}
</style>
<div class="top"><b>Daman Reddy <span>/ Hyderabad</span></b><span class="pill"><span class="dot"></span>Open to work</span></div>
<div class="main">
  <div class="name"><div class="cap">Daman<br>Reddy</div><p>AI-assisted systems developer,<br>3D environment artist, <em>BI and data analyst.</em></p></div>
  <div class="doors">${doors
    .map(([n, w, src, pos]) => `<div class="door"><img src="${src}" style="object-position:${pos}"><span class="n">${n}</span><span class="w cap">${w}</span></div>`)
    .join("")}</div>
</div>
<div class="ribbon">AI-assisted systems<i>&#10022;</i>3D environments<i>&#10022;</i>BI and data<i>&#10022;</i>Open to work<i>&#10022;</i>AI-assisted systems</div>`;

const page = join(OUT, "_og.html");
const shot = join(OUT, "_og.png");
writeFileSync(page, html);
execFileSync(CHROME, ["--hide-scrollbars", "--allow-file-access-from-files", "--force-device-scale-factor=1", "--window-size=1200,630", "--virtual-time-budget=4000", `--screenshot=${shot}`, pathToFileURL(page).href]);
await sharp(shot).png({ compressionLevel: 9, palette: false }).toFile(join(ROOT, "public/og.png"));
rmSync(page);
rmSync(shot);
console.log("public/og.png written");
