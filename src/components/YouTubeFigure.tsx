"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";

/**
 * A YouTube figure that honors the colophon ("this site ships no analytics"):
 * nothing loads from Google until the visitor clicks play — until then it's a
 * local poster with a typeset play control. On click, the youtube-nocookie
 * embed swaps in and autoplays.
 */
export default function YouTubeFigure({
  videoId,
  poster,
  title,
  caption,
}: {
  videoId: string;
  poster: string;
  title: string;
  caption: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div>
      <div className="relative aspect-video overflow-hidden border border-hairline bg-raised">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 block h-full w-full text-left"
            aria-label={`Play ${title}`}
          >
            <img src={asset(poster)} alt={title} className="absolute inset-0 h-full w-full object-cover" />
            {/* scrim + typeset play control */}
            <span className="absolute inset-0 bg-[rgba(28,27,24,0.25)] transition-opacity duration-150 group-hover:opacity-60" />
            <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 border border-paper bg-[rgba(28,27,24,0.75)] px-5 py-3">
              <span className="mono text-sm text-paper">▶</span>
              <span className="mono text-[11px] font-medium tracking-[0.1em] text-paper">
                PLAY THE FULL TECH DEMO
              </span>
            </span>
            <span className="mono absolute bottom-2.5 right-2.5 bg-[rgba(28,27,24,0.75)] px-2 py-1 text-[10px] text-paper">
              LOADS YOUTUBE ON CLICK
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
