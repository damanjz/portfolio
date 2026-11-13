/**
 * Renders the share image and the README header from the finished build:
 *   public/og.png (1200x630): the real home page at golden hour.
 *   .github/assets/header-{light,dark}.png (2000x550) and header-phone-{light,dark}.png (640x596):
 *   the README banner, set in the site's built fonts (Newsreader, Instrument Sans).
 * Needs `npm run build` first and a Chromium binary:
 *   CHROME=<path to chrome or chrome-headless-shell> node scripts/og.mjs
 * The banner figures are passed in, not measured here: re-measure them before a run (README, Results).
 */
import sharp from "sharp";
import { spawn } from "node:child_process";
import http from "node:http";
import { readFileSync, readdirSync, statSync, rmSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const CHROME = process.env.CHROME;
if (!CHROME) throw new Error("Set CHROME to a Chromium executable");

// The banner's four figures (measured 2026-11-13; see README, Results).
const FIGURES = [
  ["0", "third-party requests, measured"],
  ["26", "projects across four lanes"],
  ["33", "static pages, no backend"],
  ["76 s", "median deploy, last 10 runs"],
];

// serve out/ so the page loads exactly as it does on GitHub Pages (base path empty in a local build)
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
const server = http.createServer((q, r) => {
  let p = join(OUT, decodeURIComponent(q.url.split("?")[0]));
  try { if (statSync(p).isDirectory()) p = join(p, "index.html"); r.writeHead(200, { "content-type": TYPES[extname(p)] ?? "application/octet-stream" }); r.end(readFileSync(p)); }
  catch { r.writeHead(404); r.end(); }
}).listen(0, "127.0.0.1");
await new Promise((ok) => server.once("listening", ok));
const BASE = `http://127.0.0.1:${server.address().port}`;

// one headless Chromium over the DevTools protocol
const PORT = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT}`, "--hide-scrollbars", "--headless", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === "page"); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((ok) => (ws.onopen = ok));
let id = 0;
const waiting = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); waiting.get(d.id)?.(d); waiting.delete(d.id); };
const send = (method, params = {}) => new Promise((ok) => { const i = ++id; waiting.set(i, ok); ws.send(JSON.stringify({ id: i, method, params })); });
const run = (expression) => send("Runtime.evaluate", { expression, awaitPromise: true });
async function shoot(file, w, h, url, prepare) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url });
  await sleep(2500);
  if (prepare) await run(prepare);
  const tall = (await run("Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)")).result.result.value;
  if (tall > h) throw new Error(`${file}: content is ${tall}px tall, frame is ${h}px`);
  await sleep(1800); // the palette and scene fade take 1.4 s
  const shot = await send("Page.captureScreenshot", { format: "png" });
  await sharp(Buffer.from(shot.result.data, "base64")).png({ compressionLevel: 9 }).toFile(file);
  console.log("wrote", file.replace(ROOT, "."));
}
await send("Page.enable");

// 1. the share image: the home page itself, golden hour
await shoot(join(ROOT, "public/og.png"), 1200, 630, `${BASE}/`, `document.querySelectorAll(".ga-times button")[1].click()`);

// 2. the README banner, in the built fonts
const cssFile = readdirSync(join(OUT, "_next/static/chunks")).find((f) => f.endsWith(".css"));
const faces = (readFileSync(join(OUT, "_next/static/chunks", cssFile), "utf8").match(/@font-face\{[^}]*\}/g) ?? [])
  .filter((f) => /\.p\.[^)]*\)/.test(f))
  .map((f) => f.replace(/url\(\.\.\/media\//g, `url(${BASE}/_next/static/media/`))
  .join("\n");
const banner = (dark, phone) => `<!doctype html><meta charset="utf-8"><style>${faces}
*{box-sizing:border-box;margin:0;padding:0}
body{width:${phone ? 640 : 2000}px;height:${phone ? 596 : 550}px;overflow:hidden;background:${dark ? "#0d1219" : "#fbe9d0"};color:${dark ? "#e1e8f0" : "#33241b"};font-family:"Instrument Sans",sans-serif;padding:${phone ? "28px 26px" : "26px 8px"}}
.top{display:flex;justify-content:space-between;font-size:${phone ? 18 : 26}px;opacity:.72}
h1{font:400 ${phone ? 132 : 196}px/1 Newsreader,serif;letter-spacing:-.025em;margin:${phone ? "22px 0 30px" : "14px 0 34px"};padding-bottom:${phone ? 20 : 22}px;border-bottom:${phone ? 2 : 4}px solid currentColor}
.row{display:grid;grid-template-columns:${phone ? "1fr 1fr" : "1.25fr repeat(4,1fr)"};gap:${phone ? "30px 22px" : "0 40px"};align-items:start}
.lead{font-size:${phone ? 25 : 36}px;line-height:1.3;${phone ? "grid-column:1/-1" : "max-width:19ch"}}
b{display:block;font:400 ${phone ? 60 : 84}px/1 Newsreader,serif}
span{display:block;font-size:${phone ? 19 : 27}px;line-height:1.3;opacity:.72;margin-top:${phone ? 4 : 12}px}
</style><div class="top"><div>Static site, live since July 2026</div>${phone ? "" : "<div>Next.js on GitHub Pages</div>"}</div>
<h1>Portfolio</h1><div class="row"><p class="lead">A portfolio where every number comes from the project it describes.</p>
${FIGURES.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join("")}</div>`;
const page = join(OUT, "_banner.html");
const { writeFileSync } = await import("node:fs");
for (const dark of [false, true]) for (const phone of [false, true]) {
  writeFileSync(page, banner(dark, phone));
  await shoot(join(ROOT, `.github/assets/header${phone ? "-phone" : ""}-${dark ? "dark" : "light"}.png`), phone ? 640 : 2000, phone ? 596 : 550, `${BASE}/_banner.html`);
}
rmSync(page);
ws.close();
chrome.kill();
server.close();
