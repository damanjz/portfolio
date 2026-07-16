"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";

/**
 * A locally-hosted video figure. Unlike YouTubeFigure it makes NO external
 * request — the file is served from /public through asset() — so it keeps the
 * colophon's "ships no analytics / local-first" promise intact. Until the
 * visitor clicks play it's a still poster with a typeset play control; on click
 * the <video> mounts and plays inline with native controls.
 *
 * Portrait sources (the guitar reels are 9:16) get an aspect-[9/16] frame and a
 * capped width so they don't tower over the page.
 */
export default function VideoFigure({
  src,
  poster,
  title,
  caption,
  portrait = false,
}: {
  src: string;
  poster: string;
  title: string;
  caption: string;
  portrait?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const aspect = portrait ? "aspect-[9/16]" : "aspect-video";
  const widthCap = portrait ? "mx-auto max-w-[360px]" : "";

  return (
    <div className={widthCap}>
      <div className={`relative ${aspect} overflow-hidden border border-hairline bg-raised`}>
        {playing ? (
          <video
            className="absolute inset-0 h-full w-full bg-plate object-contain"
            src={asset(src)}
            poster={asset(poster)}
            controls
            autoPlay
            loop
            playsInline
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 block h-full w-full text-left"
            aria-label={`Play ${title}`}
          >
            <img src={asset(poster)} alt={title} className="absolute inset-0 h-full w-full object-cover object-top" />
            {/* scrim + typeset play control */}
            <span className="absolute inset-0 bg-[rgba(28,27,24,0.25)] transition-opacity duration-150 group-hover:opacity-60" />
            <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 border border-paper bg-[rgba(28,27,24,0.75)] px-5 py-3">
              <span className="mono text-sm text-paper">▶</span>
              <span className="mono text-[11px] font-medium tracking-[0.1em] text-paper">
                PLAY THE REEL
              </span>
            </span>
            <span className="mono absolute bottom-2.5 right-2.5 bg-[rgba(28,27,24,0.75)] px-2 py-1 text-[10px] text-paper">
              LOCAL FILE · NO EXTERNAL REQUEST
            </span>
          </button>
        )}
      </div>
      <div className="mono mt-2.5 text-[10px] tracking-[0.08em] text-faint">
        {caption}
      </div>
    </div>
  );
}
