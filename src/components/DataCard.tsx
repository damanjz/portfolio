import { displayName, type Pipeline } from "@/content";

const marks: Record<Pipeline["mark"], React.ReactNode> = {
  bars: <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />,
  people: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.2 3.2 0 0 1 0 6.4M21 20c0-2.6-1.6-4.8-4-5.6" />
    </>
  ),
  cross: (
    <>
      <path d="M12 7v10M7 12h10" />
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </>
  ),
  network: (
    <>
      <circle cx="5" cy="6" r="2.2" />
      <circle cx="19" cy="6" r="2.2" />
      <circle cx="12" cy="18" r="2.6" />
      <path d="M6.6 7.6l3.9 8.2M17.4 7.6l-3.9 8.2" />
    </>
  ),
};

/**
 * A data project drawn as its pipeline instead of a shrunken dashboard:
 * mark and name, data in, the model (orange), the report out, four numbers.
 * Sized in container units, so it is the same drawing at every card size.
 */
export default function DataCard({ name, year, pipe }: { name: string; year: string; pipe: Pipeline }) {
  return (
    <div className="pipe">
      <div className="pipe-in">
        <div className="pipe-hd">
          <span className="mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {marks[pipe.mark]}
            </svg>
          </span>
          <span className="ttl">
            <b>{displayName(name)}</b>
            <span>
              {pipe.live ? <i /> : null}
              {`${pipe.status} · ${year}`}
            </span>
          </span>
        </div>
        <div className="pipe-flow">
          {pipe.flow.map((f, k) => (
            <div key={k} className={k === 1 ? "node model" : "node"}>
              <b>{f.name}</b>
              <span>{f.note}</span>
            </div>
          ))}
          <i className="arr a1" />
          <i className="arr a2" />
        </div>
        <div className="pipe-stats">
          {pipe.stats.map((s) => (
            <div key={s.label}>
              <b>{s.value}</b>
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
