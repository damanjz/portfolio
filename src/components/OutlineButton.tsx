"use client";

/** Opens the linear outline view (dispatches the event Outline listens for). */
export default function OutlineButton() {
  return (
    <button
      className="hud-btn"
      onClick={() => window.dispatchEvent(new Event("board:outline"))}
    >
      ☰ OUTLINE
    </button>
  );
}
