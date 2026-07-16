import { Gallery } from "daman-portfolio";

/**
 * Screenshot gallery with lightbox. Shots are self-contained data-URI stills
 * (the real /art assets live only in the app), captioned like the real ones.
 */
function still(label: string, bg: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'>
    <rect width='800' height='500' fill='${bg}'/>
    <rect x='1' y='1' width='798' height='498' fill='none' stroke='#372e23' stroke-width='2'/>
    <text x='400' y='250' text-anchor='middle' font-family='monospace' font-size='24' fill='#f0ebe3'>${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const shots = [
  {
    src: still("render 01 — vista", "#1c2a22"),
    alt: "environment vista",
    caption: "The establishing vista — composition anchors and value grouping.",
  },
  {
    src: still("render 02 — path", "#2b2016"),
    alt: "forest path",
    caption: "Leading lines into the frame — dappled light study.",
  },
  {
    src: still("render 03 — night", "#141820"),
    alt: "night lighting",
    caption: "Dynamic night pass — emissive materials and light anchors.",
  },
  {
    src: still("render 04 — detail", "#241a28"),
    alt: "detail still",
    caption: "Material detail — blends and masks over sourced assets.",
  },
];

/** Four-still grid (the lightbox opens on click in the live app). */
export function FourUp() {
  return <Gallery shots={shots} />;
}

/** Two-still variant — the compact case-study layout. */
export function TwoUp() {
  return <Gallery shots={shots.slice(0, 2)} />;
}
