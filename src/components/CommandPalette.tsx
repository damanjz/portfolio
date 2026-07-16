"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { projects, socials } from "@/content";
import { scrollToId } from "./SmoothScroll";

type Item = {
  id: string;
  num: string; // ledger number: 01 / P.01 / ↗
  label: string;
  hint: string;
  group: "Sections" | "Projects" | "Plates" | "Links";
  keywords: string;
  run: () => void;
};

/**
 * Fuzzy match with a strong bias toward real matches: a contiguous substring
 * (extra at a word boundary) dominates scattered subsequences, so "vlt"
 * still finds volt but typing a name narrows to that name.
 */
function scoreText(q: string, text: string): number | null {
  const t = text.toLowerCase();
  const idx = t.indexOf(q);
  if (idx !== -1) {
    const atBoundary = idx === 0 || /\s/.test(t[idx - 1]);
    return 100 + (atBoundary ? 60 : 0) - idx;
  }
  let qi = 0;
  let streak = 0;
  let best = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      streak++;
      best = Math.max(best, streak);
      qi++;
    } else {
      streak = 0;
    }
  }
  if (qi !== q.length) return null;
  if (q.length >= 2 && best < 2) return null;
  return best;
}

function fuzzy(query: string, label: string, keywords: string): number | null {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const lab = scoreText(q, label);
  const kw = scoreText(q, keywords);
  if (lab === null && kw === null) return null;
  return Math.max((lab ?? -1) * 3, kw ?? -1);
}

const GROUPS = ["Sections", "Projects", "Plates", "Links"] as const;

/**
 * THE INDEX — ⌘K, recast as the volume's index. Typeset, not terminal:
 * paper panel, ink border, one hard offset shadow (the only shadow in the
 * system), serif entry names with mono numbers, accent-wash selection.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const jump = useCallback(
    (id: string) => {
      if (pathname === "/") scrollToId(id);
      else router.push(`/#${id}`);
    },
    [pathname, router],
  );

  const items = useMemo<Item[]>(() => {
    const sections: Item[] = [
      { id: "s-work", num: "01", label: "Work", hint: "", group: "Sections", keywords: "work projects ledger", run: () => jump("work") },
      { id: "s-plates", num: "02", label: "Plates", hint: "", group: "Sections", keywords: "plates art archive 3d renders", run: () => jump("plates") },
      { id: "s-principles", num: "03", label: "Principles", hint: "", group: "Sections", keywords: "principles rules", run: () => jump("principles") },
      { id: "s-stack", num: "04", label: "Stack", hint: "", group: "Sections", keywords: "stack tools", run: () => jump("stack") },
      { id: "s-contact", num: "05", label: "Contact", hint: "", group: "Sections", keywords: "contact email hire", run: () => jump("contact") },
    ];
    const sys: Item[] = projects
      .filter((p) => p.discipline === "systems")
      .map((p) => ({
        id: `p-${p.slug}`,
        num: p.num,
        label: p.name,
        hint: "↵ open",
        group: "Projects" as const,
        keywords: `${p.name} ${p.tagline} ${p.stack.join(" ")}`,
        run: () => router.push(`/projects/${p.slug}`),
      }));
    const art: Item[] = projects
      .filter((p) => p.discipline === "craft")
      .map((p) => ({
        id: `pl-${p.slug}`,
        num: p.num,
        label: p.name,
        hint: "↵ open",
        group: "Plates" as const,
        keywords: `${p.name} ${p.tagline} ${p.stack.join(" ")} art 3d`,
        run: () => router.push(`/projects/${p.slug}`),
      }));
    const links: Item[] = socials.map((s) => ({
      id: `l-${s.label}`,
      num: "↗",
      label: `${s.label} — ${s.handle}`,
      hint: "",
      group: "Links" as const,
      keywords: `${s.label} ${s.handle}`,
      run: () =>
        window.open(s.href, s.href.startsWith("mailto") ? "_self" : "_blank", "noopener,noreferrer"),
    }));
    return [...sections, ...sys, ...art, ...links];
  }, [jump, router]);

  const hasQuery = query.trim().length > 0;

  const results = useMemo(() => {
    if (!hasQuery) return items;
    return items
      .map((it) => ({ it, score: fuzzy(query, it.label, it.keywords) }))
      .filter((r) => r.score !== null)
      .sort((a, b) => (b.score as number) - (a.score as number))
      .map((r) => r.it);
  }, [items, query, hasQuery]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (
        e.key === "/" &&
        !open &&
        !/^(input|textarea)$/i.test((e.target as HTMLElement)?.tagName ?? "")
      ) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) {
        close();
        item.run();
      }
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 sm:pt-24">
      {/* ink scrim */}
      <div
        className="absolute inset-0 bg-[rgba(28,27,24,0.45)] opacity-100 transition-opacity duration-150"
        onClick={close}
      />
      {/* the index card — one hard offset shadow, the only shadow in the system */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site index"
        className="relative w-full max-w-[620px] rounded-[2px] border border-ink bg-paper shadow-[10px_10px_0_rgba(28,27,24,0.25)]"
        onKeyDown={onListKey}
      >
        <div className="flex items-center gap-3 border-b border-ink px-5 py-4">
          <span className="mono text-sm font-medium text-acc">→</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="jump anywhere — sections, projects, links…"
            className="mono w-full bg-transparent text-[13px] text-ink placeholder:text-faint focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={close}
            className="mono border border-hairline px-1.5 py-0.5 text-[10px] text-faint"
          >
            esc
          </button>
        </div>

        <div ref={listRef} className="max-h-[55vh] overflow-y-auto px-2 py-3">
          {results.length === 0 && (
            <div className="mono px-3 py-8 text-center text-xs text-faint">
              no entry — try &quot;protec&quot;, &quot;plates&quot;, or &quot;github&quot;
            </div>
          )}
          {hasQuery
            ? results.map((it, idx) => (
                <IndexRow
                  key={it.id}
                  it={it}
                  idx={idx}
                  active={active === idx}
                  onHover={setActive}
                  onPick={() => {
                    close();
                    it.run();
                  }}
                />
              ))
            : GROUPS.map((group) => {
                const rows = results.filter((r) => r.group === group);
                if (!rows.length) return null;
                return (
                  <div key={group}>
                    <div className="mono mt-1.5 border-t border-hairline px-3 pb-2 pt-3 text-[9px] font-medium uppercase tracking-[0.14em] text-faint first:mt-0 first:border-t-0 first:pt-0">
                      {group}
                    </div>
                    {rows.map((it) => {
                      const idx = results.indexOf(it);
                      return (
                        <IndexRow
                          key={it.id}
                          it={it}
                          idx={idx}
                          active={active === idx}
                          onHover={setActive}
                          onPick={() => {
                            close();
                            it.run();
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}
        </div>

        <div className="mono flex gap-4 border-t border-hairline px-5 py-3 text-[10px] tracking-[0.08em] text-faint">
          <span>↑↓ NAVIGATE</span>
          <span>↵ OPEN</span>
          <span>ESC CLOSE</span>
          <span className="ml-auto hidden sm:inline">FUZZY: &quot;VLT&quot; → VOLT</span>
        </div>
      </div>
    </div>
  );
}

/** One index entry: mono number · serif name · selection = wash + left rule. */
function IndexRow({
  it,
  idx,
  active,
  onHover,
  onPick,
}: {
  it: Item;
  idx: number;
  active: boolean;
  onHover: (i: number) => void;
  onPick: () => void;
}) {
  return (
    <button
      data-idx={idx}
      onMouseMove={() => onHover(idx)}
      onClick={onPick}
      className={`flex w-full items-baseline gap-3.5 px-3 py-[9px] text-left transition-colors duration-150 ${
        active ? "border-l-2 border-acc bg-wash" : "border-l-2 border-transparent"
      }`}
    >
      <span className={`mono text-[10px] ${active ? "text-acc" : "text-faint"}`}>
        {it.num}
      </span>
      <span className="serif text-sm text-ink">{it.label}</span>
      {it.hint && (
        <span className="mono ml-auto text-[10px] text-faint">{it.hint}</span>
      )}
    </button>
  );
}
