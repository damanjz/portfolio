"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";
import { srcSet } from "@/lib/srcset";

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
    <div className="fig">
      <div className={`frame ${portrait ? "tall" : "wide"}`}>
        {playing ? (
          <video src={asset(src)} poster={asset(poster)} ref={(el) => el?.focus()} controls autoPlay loop playsInline style={{ objectFit: "contain", background: "#000" }} />
        ) : (
          <button onClick={() => setPlaying(true)} aria-label={`Play ${title}`} style={{ position: "absolute", inset: 0 }}>
            <img src={asset(poster)} srcSet={srcSet(poster)} sizes={portrait ? "(max-width: 760px) 100vw, 30vw" : "(max-width: 999px) 100vw, 55vw"} alt={title} loading="lazy" decoding="async" />
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
