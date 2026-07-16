import * as React from "react";
import { CommandPalette } from "daman-portfolio";
import { Settle } from "./_settle";

/**
 * The ⌘K palette, opened for the card: dispatch the real keybinding
 * synchronously after mount (the palette's window listener attaches in its
 * own effect, which runs before this parent effect) so the card shows the
 * overlay — input, grouped results, footer — not just the trigger pill.
 */
export function Open() {
  React.useEffect(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
    );
  }, []);
  return (
    <div style={{ minHeight: 520 }}>
      <Settle />
      <CommandPalette />
    </div>
  );
}
