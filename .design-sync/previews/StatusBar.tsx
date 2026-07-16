import { StatusBar } from "daman-portfolio";

/** Fixed top status bar — identity, nav, live status readout. */
export function Default() {
  return (
    <div style={{ minHeight: 120 }}>
      <StatusBar />
    </div>
  );
}
