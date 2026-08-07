# Portfolio v4 — design exploration archive

Durable copies of every v4 direction explored (2026-08-06/07). Scratchpad is session-temp; this is the record.

## Direction mocks (rendered, styled) — ALL REJECTED
Rejected as "three material treatments of one wireframe" / "same framework" / conceits "cheesy":
- `01-clean-room.dc.html` — light precision-instrument, calibration ticks, needle red
- `02-strongroom.dc.html` — dark machined vault, DIN, orange signal
- `03-light-study.dc.html` — warm tungsten cinema, f-stop annotations
- `04-the-fader.dc.html` — lighting-console crossfader (SYSTEMS↔SCENES). Impeccable finish-reviewed, 8 fixes applied, then rejected: "still using same framework… whole lighting thing is very cheesy."

**Lesson (now in taste file):** vary the SKELETON, not the skin. No governing metaphors played literally. Low-scroll, a11y-first.

## Structure wireframes (unstyled skeletons)
- `wireframes/skeletons-ABC.html` — three genuinely different structures: A command-surface (no scroll, ⌘K-native), B dense index (one ledger above the fold), C spatial board (pan not scroll).

## CHOSEN DIRECTION → `flow-board/`
Daman's own idea, evolved from wireframe C: **the whole site is one 2D board laid out as a flowchart** — each project shown as its real production DAG (idea → key decisions → production → shipped). The flowchart IS the information architecture and the navigation, not a decorative metaphor. Pan/zoom the board; a11y fallback = the same graph as a linear outline. See `flow-board/` for the built prototype + its own notes.
