/**
 * Prefixes a public/ asset path with the deployment base path
 * (GitHub Pages project sites live under /<repo>). Next handles this for
 * routes and next/font automatically; plain <img>/<video>/poster srcs
 * go through here.
 */
export function asset(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
