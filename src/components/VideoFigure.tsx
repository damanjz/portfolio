"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";

/** A locally hosted reel: a still poster until clicked, then plays inline.
 *  No external request either way. */
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
  return (
    <div className="fig" data-fade="">
      <div className={`frame ${portrait ? "portrait" : "wide"}`}>
        {playing ? (
          <video src={asset(src)} poster={asset(poster)} controls autoPlay loop playsInline style={{ objectFit: "contain", background: "#000" }} />
        ) : (
          <button onClick={() => setPlaying(true)} aria-label={`Play ${title}`} data-cursor="Play" style={{ position: "absolute", inset: 0 }}>
            <img src={asset(poster)} alt={title} />
            <span className="play">
              <span>&#9654; Play</span>
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
