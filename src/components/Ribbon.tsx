/**
 * Black marquee band. The track holds the items four times; Motion scrolls
 * it continuously and speeds it up with scroll velocity (CSS-free loop, so
 * it can react to the page).
 */
export default function Ribbon({ items, className = "" }: { items: readonly string[]; className?: string }) {
  const run = [...items, ...items, ...items, ...items];
  return (
    <div className={`ribbon ${className}`} aria-hidden="true">
      <div className="track" data-ribbon>
        {run.map((it, i) => (
          <span key={i} style={{ display: "inline-flex", gap: 28, alignItems: "center" }}>
            <span>{it}</span>
            <i>&#10022;</i>
          </span>
        ))}
      </div>
    </div>
  );
}
