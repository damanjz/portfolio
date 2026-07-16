/**
 * One-off: copy + optimize real renders from G:\ProJect Hub into the site.
 * Downscales large PNG stills to web sizes and writes WebP (quality-tuned),
 * so 6–23 MB source frames become ~100–250 KB web assets.
 *
 * Run:  node scripts/optimize-art.mjs
 * Safe to re-run; overwrites outputs. Source files are never modified.
 */
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HUB = "G:/ProJect Hub";
const OUT = join(ROOT, "public", "art");
mkdirSync(OUT, { recursive: true });

// [sourceRelativeToHub, outputName, maxWidth]
const jobs = [
  // Umbraixs — the flagship UE5 village
  ["Master Pjs/Umbraixs/Render outs/Umbraixs V2/Shot4/Shot_4.0400.png", "umbraixs-vista", 2000],
  ["Master Pjs/Umbraixs/Render outs/Umbraixs V2/Shot1/Shot_1.0080.png", "umbraixs-path", 2000],
  ["Master Pjs/Umbraixs/Render outs/Umbraixs V2/Shot3/Shot_3.0199.png", "umbraixs-shot3", 2000],
  ["Master Pjs/Umbraixs/Render outs/Umbraixs V2/Shot2/Shot_2.0199.png", "umbraixs-shot2", 2000],
  ["Master Pjs/Umbraixs/Render outs/Umbraixs V2/Shot5/Shot_5.0199.png", "umbraixs-shot5", 2000],
  // Blender — cinematic product render
  ["BLENDER/Renders/Car scene/0033 3.png", "car-hero", 1800],
  ["BLENDER/Renders/Car scene/0035 2.png", "car-2", 1800],
  // Blender — toon/NPR stylization
  ["BLENDER/Renders/Vendy/0015.png", "vending-toon", 1600],
];

// Frame-sourced stills — pulled from render footage (MP4) at a chosen timestamp,
// so they stay reproducible from Hub sources like the PNG jobs above. Needs ffmpeg.
// [sourceMp4RelativeToHub, timestampSeconds, outputName, maxWidth]
const frameJobs = [
  // Product Placement Dev — a set of signature electric guitars (vertical product-viz)
  ["BLENDER/metal/metal/footage/Scene [50001-50180].mp4", 4, "gtr-lineup", 1280],
  ["BLENDER/metal/metal/footage/[0001-0180]1.mp4", 4, "gtr-slayer", 1080],
  ["BLENDER/metal/metal/footage/[0001-0180]2.mp4", 4, "gtr-detail", 1080],
  ["BLENDER/metal/metal/footage/[0001-0180]3.mp4", 4, "gtr-body", 1080],
];

const results = [];

/** Write a full-size + thumb webp from a source image path. */
async function optimize(src, name, maxW) {
  const full = join(OUT, `${name}.webp`);
  const meta = await sharp(src)
    .resize({ width: maxW, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(full);
  const thumb = join(OUT, `${name}-thumb.webp`);
  await sharp(src)
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(thumb);
  results.push(`${name}.webp  ${meta.width}x${meta.height}  ${(meta.size / 1024).toFixed(0)}KB`);
}

for (const [rel, name, maxW] of jobs) {
  const src = join(HUB, rel);
  if (!existsSync(src)) {
    results.push(`SKIP (missing): ${rel}`);
    continue;
  }
  await optimize(src, name, maxW);
}

// frame-sourced stills: grab one PNG from the source video, then optimize it
const frameTmp = mkdtempSync(join(tmpdir(), "art-frames-"));
for (const [rel, ts, name, maxW] of frameJobs) {
  const src = join(HUB, rel);
  if (!existsSync(src)) {
    results.push(`SKIP (missing): ${rel}`);
    continue;
  }
  const png = join(frameTmp, `${name}.png`);
  try {
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y",
      "-ss", String(ts), "-i", src, "-frames:v", "1", png], { stdio: "ignore" });
  } catch {
    results.push(`SKIP (ffmpeg failed): ${rel}`);
    continue;
  }
  await optimize(png, name, maxW);
}

console.log(results.join("\n"));
console.log(`\nwrote to ${OUT}`);
