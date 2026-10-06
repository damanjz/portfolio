"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";

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
    <div className="fig" data-fade="">
      <div className="frame wide">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button onClick={() => setPlaying(true)} aria-label={`Play ${title}`} data-cursor="Play" style={{ position: "absolute", inset: 0 }}>
            <img src={asset(poster)} alt={title} />
            <span className="play">
              <span>&#9654; Play the full piece</span>
              <small>Loads YouTube on click</small>
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
