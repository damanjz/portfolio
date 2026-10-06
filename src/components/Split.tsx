import type { CSSProperties, ElementType } from "react";

/**
 * Giant-caps text split into masked words and rising characters. Renders
 * plain spans on the server; Motion adds `.in` when it scrolls into view
 * (or the landing intro adds `.ready` to a parent). "|" forces a line break.
 * The real text stays available to screen readers via aria-label.
 */
export default function Split({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  style,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  let i = 0;
  const lines = text.split("|");
  return (
    <Tag
      className={`split ${className}`}
      aria-label={text.replace(/\|/g, "")}
      style={{ ...style, ["--d" as string]: `${delay}ms` }}
    >
      {lines.map((line, li) => (
        <span key={li} aria-hidden="true" style={{ display: "block" }}>
          {line.split(" ").map((word, wi, arr) => (
            <span key={wi}>
              <span className="w">
                {[...word].map((ch, ci) => (
                  <span key={ci} className="ch" style={{ ["--i" as string]: i++ }}>
                    {ch}
                  </span>
                ))}
              </span>
              {wi < arr.length - 1 ? " " : null}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
