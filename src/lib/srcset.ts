import sizes from "@/image-sizes.json";
import { asset } from "@/lib/asset";

// Kept apart from asset() so client code that only needs asset() does not ship the image manifest.
/**
 * srcset for a public image: the 800/1400 px copies written by
 * scripts/sizes.mjs plus the original, so each screen downloads only what it
 * shows. Undefined for images without copies (the browser uses src).
 */
export function srcSet(path: string): string | undefined {
  const m = (sizes as Record<string, { w: number; set: number[] }>)[path];
  if (!m || m.set.length === 0) return undefined;
  const sized = m.set.map((w) => `${asset(path.replace(/\.(webp|png|jpe?g)$/i, `.${w}.webp`))} ${w}w`);
  return [...sized, `${asset(path)} ${m.w}w`].join(", ");
}
