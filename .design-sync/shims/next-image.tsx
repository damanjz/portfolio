/**
 * next/image shim for design-sync previews.
 * Renders a plain <img>; `fill` becomes absolute-cover positioning. When the
 * asset path doesn't exist in the design project (e.g. /art/*.webp), onError
 * swaps in a labeled dark placeholder so cards never show a broken-image icon.
 */
import * as React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
};

function placeholder(label: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'>
    <rect width='800' height='500' fill='#14110d'/>
    <rect x='1' y='1' width='798' height='498' fill='none' stroke='#262019' stroke-width='2'/>
    <text x='400' y='240' text-anchor='middle' font-family='monospace' font-size='22' fill='#9a9084'>${label.replace(/[<>&]/g, "")}</text>
    <text x='400' y='280' text-anchor='middle' font-family='monospace' font-size='14' fill='#6b6153'>image asset</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const NextImage = React.forwardRef<HTMLImageElement, Props>(function NextImage(
  { fill, priority, sizes, quality, style, alt = "", src, ...rest },
  ref,
) {
  const s: React.CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }
    : (style ?? {});
  return (
    <img
      ref={ref}
      alt={alt}
      src={typeof src === "string" ? src : undefined}
      style={s}
      loading={priority ? "eager" : undefined}
      onError={(e) => {
        const img = e.currentTarget;
        if (img.dataset.fallback) return; // no error loops
        img.dataset.fallback = "1";
        img.src = placeholder(alt || "image");
      }}
      {...rest}
    />
  );
});

export default NextImage;
