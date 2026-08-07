import Link from "next/link";

/**
 * READ — opens the linear reading view (/read = The Monograph, re-skinned).
 * The board is the spatial view; this is the calm top-to-bottom read of the
 * same content. (The bare a11y outline stays reachable via the skip-link.)
 */
export default function OutlineButton() {
  return (
    <Link href="/read" className="hud-btn">
      ☰ READ
    </Link>
  );
}
