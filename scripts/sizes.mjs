/**
 * Writes smaller copies of every site image (800 and 1400 px wide, WebP) next
 * to the original as name.800.webp / name.1400.webp, and records each image's
 * widths in src/image-sizes.json so pages can serve a srcset. Safe to re-run;
 * originals are never touched. Run after adding images: node scripts/sizes.mjs
 */
import sharp from "sharp";
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const WIDTHS = [800, 1400];
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const images = walk(PUB).filter((f) => /\.(webp|png|jpe?g)$/i.test(f) && !/\.(800|1400)\.webp$/.test(f) && !f.endsWith("og.png"));

const manifest = {};
for (const file of images) {
  const { width } = await sharp(file).metadata();
  const key = "/" + relative(PUB, file).split("\\").join("/");
  const set = [];
  for (const w of WIDTHS) {
    if (w >= width) continue;
    const out = file.replace(/\.(webp|png|jpe?g)$/i, `.${w}.webp`);
    if (!existsSync(out)) await sharp(file).resize({ width: w }).webp({ quality: 80 }).toFile(out);
    set.push(w);
  }
  manifest[key] = { w: width, set };
}
writeFileSync(join(ROOT, "src/image-sizes.json"), JSON.stringify(manifest, null, 0) + "\n");
console.log(`${images.length} images, manifest written`);
