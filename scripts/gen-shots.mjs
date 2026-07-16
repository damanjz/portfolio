/**
 * Generates paper-styled figure placeholders for the code projects' case
 * studies (The Monograph: hatched engineering-print texture, ink frame,
 * mono figure label). Swap any file for a real PNG at the same path.
 *
 * Run:  node scripts/gen-shots.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "shots");

const W = 1280;
const H = 800;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function figure(label, note) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <pattern id="hatch" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="#EDEAE2"/>
      <line x1="0" y1="0" x2="0" y2="12" stroke="#E3DFD6" stroke-width="1.5"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#F7F5F0"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="url(#hatch)" stroke="#E3DFD6" stroke-width="2"/>
  <rect x="${W / 2 - 290}" y="${H / 2 - 64}" width="580" height="128" fill="#F7F5F0" stroke="#1C1B18" stroke-width="1"/>
  <text x="${W / 2}" y="${H / 2 - 12}" text-anchor="middle" font-family="monospace" font-size="21" letter-spacing="2" fill="#1C1B18">${esc(label)}</text>
  <text x="${W / 2}" y="${H / 2 + 26}" text-anchor="middle" font-family="monospace" font-size="13" letter-spacing="1.5" fill="#98938A">${esc(note)}</text>
  <text x="${W - 40}" y="${H - 38}" text-anchor="end" font-family="monospace" font-size="12" fill="#98938A">PLACEHOLDER — DROP REAL SCREENSHOT AT THIS PATH</text>
</svg>`;
}

const shots = {
  "protec/vault": ["FIG — VAULT VIEW", "PROTEC · WINDOWS 11"],
  "protec/unlock": ["FIG — WINDOWS HELLO UNLOCK", "PROTEC · BIOMETRIC GATE"],
  "protec/extension": ["FIG — EXTENSION ↔ APP HANDSHAKE", "NATIVE MESSAGING · NO OPEN PORT"],
  "n8n-automation/dashboard": ["FIG — TRIAGE DASHBOARD", "TICKETS · ROUTES · PENDING DRAFTS"],
  "n8n-automation/canvas": ["FIG — PIPELINE CANVAS", "INTAKE → TRIAGE → DRAFT → APPROVE"],
  "n8n-automation/eval": ["FIG — EVAL CORPUS", "AI 88% VS BASELINE 70%"],
  "volt-techwear-store/storefront": ["FIG — STOREFRONT", "VOLT HQ"],
  "volt-techwear-store/product": ["FIG — PRODUCT PAGE", "CLEARANCE-GATED"],
  "volt-techwear-store/checkout": ["FIG — CHECKOUT", "SERVER ACTIONS"],
  "flux-player/player": ["FIG — PLAYBACK", "FLUX-PLAYER · NATIVE QT"],
  "flux-player/library": ["FIG — LIBRARY VIEW", "NATIVE WIDGETS"],
};

let n = 0;
for (const [key, [label, note]] of Object.entries(shots)) {
  const [slug, name] = key.split("/");
  mkdirSync(join(OUT, slug), { recursive: true });
  writeFileSync(join(OUT, slug, `${name}.svg`), figure(label, note));
  n++;
}
console.log(`generated ${n} paper-styled figure placeholders into public/shots/`);
