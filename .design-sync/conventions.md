# Building with the Daman Portfolio components

This is a personal portfolio's real production UI (Next.js app), not a generic kit. Components are full page sections with their content built in — compose pages by stacking them, then style your own connective tissue with the tokens below.

## Wrap everything in `Stage`

The app styles `<body>` (dark canvas, bone text, body font). Outside it, sections render on white and light text disappears. Always wrap compositions:

```jsx
<Stage>
  <StatusBar />
  <Hero />
  <Work />
  <Contact />
  <Footer />
</Stage>
```

`Stage` is exported from the bundle like any component. `CommandPalette` overlays globally (opens on ⌘K); `StatusBar` is `position: fixed`, `DetailBar` is its sticky case-study-page counterpart — use one or the other, not both.

## Styling idiom: existing utilities + CSS variables — never invent new Tailwind classes

`styles.css` is a **compiled** Tailwind build: only classes the app already uses exist. A class you invent (`bg-red-500`, `p-7`, any arbitrary-value bracket syntax) will silently do nothing. For your own layout glue, use inline styles with the token variables — they always resolve:

```jsx
<div style={{ background: "var(--panel)", border: "1px solid var(--hairline)", borderRadius: 12, padding: 24 }}>
```

Token vocabulary (all defined in `styles.css` `:root`):

| Token | Role |
|---|---|
| `--void` | page canvas (near-black) |
| `--panel`, `--panel-2` | raised surfaces / nested surfaces |
| `--hairline`, `--hairline-bright` | borders, dividers |
| `--bone` | primary text |
| `--slate`, `--slate-dim` | secondary / tertiary text |
| `--ember`, `--ember-dim`, `--ember-glow` | primary accent (`--phosphor` aliases it) |
| `--teal`, `--teal-dim` | secondary accent |
| `--warn` | amber status |

Verified utility classes you may reuse on your own elements: `bg-void` `bg-panel` `bg-ember` `text-bone` `text-slate` `text-slate-dim` `text-ember` `text-teal` `text-warn` `border-hairline` `rounded-full`, plus the two custom font classes — `mono` (JetBrains Mono — labels, data, kbd hints, eyebrows) and `font-display` (Space Grotesk — headings). Body text inherits Inter from `Stage`.

## Voice

Mono does structural work: section eyebrows are `// lowercase`, metrics read as `label = value`, terminal cues (`$`, `⌘K`) are part of the language. Headings are sentence case, confident, short.

## Where the truth lives

Read `styles.css` for every token and available utility before styling anything custom; each component's `.prompt.md` documents its props (most sections take none — `Gallery` takes `shots: {src, alt, caption}[]`).
