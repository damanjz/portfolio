import sizes from "@/image-sizes.json";

/**
 * Prefixes a public/ asset path with the deployment base path
 * (GitHub Pages project sites live under /<repo>). Next handles this for
 * routes and next/font automatically; plain <img>/<video>/poster srcs
 * go through here.
 */
export function asset(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}

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
