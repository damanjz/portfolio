/**
 * Settle — preview-only style override that force-finishes entrance
 * animations so captures are deterministic. Framer-motion writes animation
 * state as INLINE styles; these attribute selectors hit only those elements,
 * leaving class-based transforms (e.g. -translate-x-1/2 centering) intact.
 * Not part of the shipped bundle — imported by preview files only.
 */
export function Settle() {
  return (
    <style>{`
      [style*="opacity"] { opacity: 1 !important; }
      [style*="transform"] { transform: none !important; }
      [style*="filter"] { filter: none !important; }
    `}</style>
  );
}
