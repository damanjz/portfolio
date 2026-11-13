"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";
import { srcSet } from "@/lib/srcset";

/** YouTube that loads nothing from Google until the visitor clicks play:
 *  until then it's a local poster. */
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
    <div className="fig">
      <div className="frame wide">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            ref={(el) => el?.focus()}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button onClick={() => setPlaying(true)} aria-label={`Play ${title}`} style={{ position: "absolute", inset: 0 }}>
            <img src={asset(poster)} srcSet={srcSet(poster)} sizes="(max-width: 999px) 100vw, 55vw" alt={title} loading="lazy" decoding="async" />
            <span className="play">
              <span>&#9654; Play the full piece</span>
            </span>
          </button>
        )}
      </div>
      <div className="cap-line">
        <span>{caption}</span>
      </div>
    </div>
  );
}
