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
  lock: (
    <>
      <rect x="4" y="10.5" width="16" height="10.5" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 15v2.5" />
    </>
  ),
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  leak: <path d="M12 3.5c3.2 4.4 6 7.6 6 10.9a6 6 0 0 1-12 0c0-3.3 2.8-6.5 6-10.9zM9.5 15a2.5 2.5 0 0 0 2.5 2.5" />,
  network: (
    <>
      <circle cx="5" cy="6" r="2.2" />
      <circle cx="19" cy="6" r="2.2" />
      <circle cx="12" cy="18" r="2.6" />
      <path d="M6.6 7.6l3.9 8.2M17.4 7.6l-3.9 8.2" />
    </>
  ),
};

function Mark({ m }: { m: Pipeline["mark"] }) {
  return (
    <span className="p-mk">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {marks[m]}
      </svg>
    </span>
  );
}

function Title({ name, status, live }: { name: string; status: string; live?: boolean }) {
  return (
    <div className="p-ttl">
      <div className="p-nm">{displayName(name)}</div>
      <div className={live ? "p-st p-live" : "p-st"}>{status}</div>
    </div>
  );
}

function Stat({ s, className }: { s: { value: string; label: string }; className?: string }) {
  return (
    <div className={className}>
      <b className="p-v">{s.value}</b>
      <span className="p-lb">{s.label}</span>
    </div>
  );
}

/**
 * A project drawn as its pipeline instead of a shrunken screenshot: what goes
 * in, the core, what comes out, four measured numbers. Each project has its own
 * layout and colour (set in content.ts). Sized in container units, so it is the
 * same drawing at every card size; black and white until hovered.
 */
export default function DataCard({ name, year, pipe }: { name: string; year: string; pipe: Pipeline }) {
  const [a, core, b] = pipe.flow;
  const [lead, ...rest] = pipe.stats;
  const title = <Title name={name} status={`${pipe.status} · ${year}`} live={pipe.live} />;
  const style = { ["--a" as string]: pipe.accent, ["--on" as string]: pipe.onAccent ?? "#fff" };

  let body: React.ReactNode;
  switch (pipe.layout) {
    case "ledger":
      body = (
        <>
          <div className="p-col">
            <div className="p-box"><b>{a.name}</b><span className="p-lb">{a.note}</span></div>
            <i className="p-ln p-vln" />
            <div className="p-box p-core"><b>{core.name}</b></div>
            <i className="p-ln p-vln" />
            <div className="p-box"><b>{b.name}</b><span className="p-lb">{b.note}</span></div>
          </div>
          <div className="p-rt">
            <div className="p-top"><Mark m={pipe.mark} />{title}</div>
            <Stat s={lead} className="p-lead" />
            <div className="p-rows">
              {rest.map((s) => (
                <div key={s.label}><span className="p-lb">{s.label}</span><b>{s.value}</b></div>
              ))}
            </div>
          </div>
        </>
      );
      break;
    case "spotlight":
      body = (
        <>
          <div className="p-top">{title}<Mark m={pipe.mark} /></div>
          <div className="p-mid">
            <Stat s={lead} className="p-lead" />
            <div className="p-side">{rest.map((s) => <Stat key={s.label} s={s} />)}</div>
          </div>
          <div className="p-chips">
            <span className="p-chip">{a.name}</span><i className="p-ln" /><span className="p-chip p-core">{core.name}</span><i className="p-ln" /><span className="p-chip">{b.name}</span>
          </div>
        </>
      );
      break;
    case "rail":
      body = (
        <>
          <div className="p-top"><Mark m={pipe.mark} />{title}</div>
          <div className="p-rail">
            <i className="p-ln" />
            {[a, core, b].map((f, k) => (
              <div key={f.name} className={k === 1 ? "p-sta p-core" : "p-sta"} style={{ left: `${[15, 50, 85][k]}%` }}>
                <i /><b>{f.name}</b><span className="p-lb">{f.note}</span>
              </div>
            ))}
          </div>
          <div className="p-base">{pipe.stats.map((s) => <Stat key={s.label} s={s} />)}</div>
        </>
      );
      break;
    case "network":
      body = (
        <>
          <div className="p-map">
            <div className="p-top"><Mark m={pipe.mark} />{title}</div>
            <svg className="p-wire" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M18 74 L47 46 L82 74" /></svg>
            {[[6, 60], [28, 74], [70, 62], [90, 70]].map(([x, y]) => <span key={x} className="p-dot" style={{ left: `${x}%`, top: `${y}%` }} />)}
            <div className="p-node p-n1"><b>{a.name}</b><span className="p-lb">{a.note}</span></div>
            <div className="p-node p-core p-n2"><b>{core.name}</b></div>
            <div className="p-node p-n3"><b>{b.name}</b><span className="p-lb">{b.note}</span></div>
          </div>
          <div className="p-stats">{pipe.stats.map((s) => <Stat key={s.label} s={s} />)}</div>
        </>
      );
      break;
    case "split":
      body = (
        <>
          <div className="p-panel">
            <Mark m={pipe.mark} />
            <div className="p-coretext"><b>{core.name}</b><span>{core.note}</span></div>
            {title}
          </div>
          <div className="p-dark">
            <div className="p-io"><span>{a.name}</span><i className="p-ln" /><span>{b.name}</span></div>
            <div className="p-lb">{`${a.note} · ${b.note}`}</div>
            <div className="p-q">{pipe.stats.map((s) => <Stat key={s.label} s={s} />)}</div>
          </div>
        </>
      );
      break;
    case "stack":
      body = (
        <>
          <div className="p-top"><Mark m={pipe.mark} />{title}</div>
          <div className="p-stack">
            <svg className="p-wire" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M24 30 L50 52 L76 76" /></svg>
            {[a, core, b].map((f, k) => (
              <div key={f.name} className={k === 1 ? "p-layer p-core" : "p-layer"} style={{ left: `${k * 27}%`, top: `${4 + k * 30}%` }}>
                <b>{f.name}</b><span className="p-lb">{f.note}</span>
              </div>
            ))}
          </div>
          <div className="p-row">{pipe.stats.map((s) => <Stat key={s.label} s={s} />)}</div>
        </>
      );
      break;
    case "transport":
      body = (
        <>
          <div className="p-top"><Mark m={pipe.mark} />{title}</div>
          <div className="p-screen"><div><b>{core.name}</b><span className="p-lb">{core.note}</span></div></div>
          <div>
            <div className="p-bar"><i className="p-ln" />{[6, 50, 94].map((x, k) => <span key={x} className={k === 1 ? "p-ch p-core" : "p-ch"} style={{ left: `${x}%` }}><i /></span>)}</div>
            <div className="p-labels"><span>{a.name}</span><span>{core.name}</span><span>{b.name}</span></div>
          </div>
          <div className="p-tc">{pipe.stats.map((s) => <Stat key={s.label} s={s} />)}</div>
        </>
      );
      break;
  }

  return (
    <div className={`pipe p-${pipe.layout}`} style={style}>
      <div className="pipe-in">{body}</div>
      <span className="p-glow" aria-hidden="true" />
    </div>
  );
}
