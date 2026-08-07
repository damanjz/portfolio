# v4 flow-board — project content drafts (for Daman's approval)

Each project = a DAG: **IDEA → DECISIONS → PRODUCTION → SHIPPED**, plus a facts strip.
Source: content.ts (authoritative) + Daman's interview answers. Metrics are REAL from the repo.
Voice: dense, concrete, first-person-implied, no hype, no invented numbers.

---

## P.01 · protec — password manager that never phones home
**Status: SHIPPED · daily driver** · Public · github.com/damanjz/protec
**Hook (opens on):** architecture + audit rigor + it's real — all three.
**✅ APPROVED by Daman ("this nice") — this is the template density/voice for all four.**

### ▸ IDEA
> I use a password manager every single day. I didn't want to pay a subscription
> for something that important — or trust my most sensitive file to someone
> else's infrastructure. So I built the one I'd actually trust: a vault that
> lives on my disk and has nothing to phone home to.

### ▸ DECISIONS  (choice → why)
- **Rust core** → memory-safe, owns all crypto + storage; the sensitive code can't leak through a use-after-free.
- **Native messaging > local server** → the browser extension talks to the desktop app with no listening port and no CORS surface. Nothing to scan, nothing to hijack.
- **Argon2id > PBKDF2** → memory-hard KDF; GPU cracking farms pay full price.
- **Zeroize on drop** → password, notes, TOTP seed, custom fields wiped from memory the moment they're unused.

### ▸ PRODUCTION
> A Rust core owns cryptography and storage; a Tauri + Svelte shell renders it.
> The browser extension autofills over a native-messaging channel that confirms
> nonces, matches the HTTPS scheme, and verifies the message sender before it
> will fill anything. Windows Hello gates every unlock — the master key never
> touches a server because there is no server.

### ▸ HARDENING  (the process, not a feature)
> A six-agent whole-codebase security audit shipped **16 fixes**. Plaintext
> reveals are rate-limited to block bulk exfiltration. Every autofill is
> scheme-matched and sender-verified. Security here is a pass I run, not a
> checkbox I ticked.

### ▸ SHIPPED
**protec v1 — in daily use.** Desktop app + browser extension + Windows Hello.

### FACTS
TYPE desktop + webext · CORE Rust · SHELL Tauri · Svelte · UNLOCK Windows Hello · NETWORK **none** · AUDIT 16 fixes shipped · STATUS public

---

## (drafts for n8n / volt / flux follow after protec is approved — same shape)

## P.02 · n8n-automation — self-hosted AI support triage on local Ollama
**Status: SHIPPED · ran on real tickets** · Private · $0 recurring
**Hook:** a local LLM doing real work, gated by an eval — measured, not vibes.

### ▸ IDEA
> Piping a support inbox through a cloud API means paying rent on your own mail,
> forever — the same thing I refused with protec. My home rig can run the model
> for nothing. n8n-automation is the proof that a self-hosted LLM, held to a real
> eval, is production-ready — not a demo.

### ▸ DECISIONS  (choice → why)
- **Local Ollama > cloud API** → a support inbox never leaves the machine, and it costs $0 recurring.
- **Eval-corpus gate** → no prompt change ships on gut feel; a 40-case corpus decides.
- **Human approval queue** → the AI drafts, a person sends. Judgment stays with a human.

### ▸ PRODUCTION
> A self-hosted n8n pipeline: inbound email is triaged by a local Ollama model
> that routes each ticket and drafts a reply grounded in a knowledge base.
> Nothing sends automatically — drafts land in an approval queue. A live
> dashboard shows tickets, stats, and the pending-drafts count, with a daily
> digest email.

### ▸ MEASUREMENT  (the part I'm proudest of)
> AI-primary routing was promoted only when it beat the rules baseline on the
> eval: **88% vs 70%**. Then built for unattended running — exactly-once email
> processing, a self-healing watchdog, nightly backups, and a stress-test suite
> that proves the recovery behaviour.

### ▸ SHIPPED
**Ran on real tickets.** Routing + KB-grounded drafts, human-approved, $0 recurring.

### FACTS
TYPE automation pipeline · ENGINE n8n · self-hosted · MODEL local Ollama · ROUTING **88%** (baseline 70%, n=40) · COST $0 recurring · STATUS private

## P.03 · volt-techwear-store — techwear commerce, end to end
**Status: SHIPPED** · Public · github.com/damanjz/volt-techwear-store
**Hook:** clearance-as-state — one model drives identity, gating, and checkout.

### ▸ IDEA
> A full-stack systems exercise dressed as a brand. VOLT HQ is a techwear label —
> "master the urban void" — but the point was never the clothes. It was to build
> a storefront where identity, access, and purchase are one coherent system, not
> a pretty front end over nothing.

### ▸ DECISIONS  (choice → why)
- **Clearance as shared state** → one membership/clearance model drives what a member can see AND what they can buy. Identity, gating, checkout — one source of truth, not three bolted-together features.
- **Server Action checkout > client flow** → the sensitive path stays on the server; the browser is never trusted with it. (Security instinct, even in commerce.)

### ▸ PRODUCTION
> A high-performance Next.js 15 + Tailwind v4 app. Persistent membership via
> NextAuth, backed by Prisma and PostgreSQL. A member's dynamic clearance level
> gates access to Black Site vaults and unlocks products; that same state feeds
> the checkout. Full stack, coherent from login to purchase.

### ▸ SHIPPED
**Live storefront.** Identity → clearance → gated catalog → server-side checkout, one system.

### FACTS
TYPE commerce · full stack · FRAMEWORK Next.js 15 · DATA Prisma 7 · Postgres · AUTH NextAuth · CHECKOUT Server Actions · STATUS public

---

## P.04 · flux-player — native video player that starts instantly
**Status: SHIPPED** · Public · github.com/damanjz/flux-player
**Hook:** range — a third toolchain (Python-native) alongside Rust and the web.

### ▸ IDEA
> After a Rust security tool and a full-stack web system, flux-player is the
> native-desktop corner of the set: a video player in Python that opens and plays
> the instant you launch it — no splash, no spinner as a lifestyle.

### ▸ DECISIONS  (choice → why)
- **PySide6 native > Electron** → a single lightweight binary, real OS integration, none of the browser-in-a-box weight.
- **Instant start** → the player is usable the moment it's open; startup was a requirement, not an afterthought.

### ▸ PRODUCTION
> A focused PySide6 application wrapping the decoder and nothing else — the
> deliberate opposite of a feature-bloated media suite. Small, fast, native.

### ▸ SHIPPED
**A working native player.** Instant start, single binary.

### FACTS
TYPE native desktop · LANG Python · UI PySide6 · START instant · SCOPE focused · STATUS public

---

## P.05 · NOCTRA — a full-stack street-luxury app, in development
**Status: UNDER DEVELOPMENT** · TypeScript
**Hook:** a founder's arc — a real product concept taken deep into a full-stack build.
**Honesty note (Daman's call):** framed as UNDER DEVELOPMENT — paused, not deleted; a real repo he can resume. Built ~2 weeks with an AI agent (Antigravity). Docs are a real, deep artifact — surface them as evidence of systems thinking.

### ▸ IDEA
> NOCTRA was a business idea before it was code — a premium Indian street-luxury
> app where buying clothes earns access, not just a transaction. "Own the after
> hours." I wanted to see if I could take a real product concept from strategy to
> a working full-stack system.

### ▸ DECISIONS  (choice → why)
- **Membership-as-product** → the app IS the brand: tiers, drop windows, waitlist position, referral clout — status mechanics, not a points program.
- **Security-first backend** → Firebase phone-OTP → custom RS256 JWTs with single-use refresh rotation; helmet, rate-limiting, zod validation, sanitize-html. The instinct from protec, carried into a commerce backend.
- **UPI-first checkout (Razorpay)** → built for how India actually pays (70%+ digital via UPI).

### ▸ PRODUCTION  (what's real)
> React Native (Expo) app + Node/Express/Prisma backend, PostgreSQL + Redis,
> Socket.io for live drops, a Next.js admin panel, and a documented 12-table
> schema. ~2 weeks of real build, assisted by an AI agent — and a full docs set:
> architecture, security, scalability, deployment.

### ▸ IN DEVELOPMENT  (honest current state)
> Paused, not abandoned. The system got real enough to judge the business case,
> I stepped back to weigh it — and the repo is still there to pick back up.
> Scoping a real product, building it deep, and knowing when to pause is part of
> the work too.

### FACTS
TYPE full-stack mobile · APP React Native · Expo · BACKEND Node · Express · Prisma · DATA Postgres · Redis · AUTH Firebase + RS256 JWT · PAY Razorpay · STATUS under development

---

## P.06 · umbra — "Shadow of Style", a storefront built from scratch
**Status: SHIPPED · live (umbra_v deployed)** · umbrav.vercel.app
**Hook:** hand-built, no framework — a real WebGL shader hero, my own way.

### ▸ IDEA
> Umbra — "shadow of style," premium athletic gear forged in the shadows. I
> wanted to build a complete storefront by hand: no framework, no build step,
> no dependencies to hide behind. Just HTML, CSS, and JavaScript, taken as far
> as they go.

### ▸ DECISIONS  (choice → why)
- **Vanilla, no framework** → prove the fundamentals; every animation, cart, and page is mine, not a library's default.
- **A real WebGL shader hero** → custom vertex + fragment shaders in the brand's deep-violet palette, reactive to the mouse. The 3D instinct from my art years, in the browser.
- **localStorage cart** → a working cart and checkout flow with zero backend — the whole thing is static and self-contained.

### ▸ PRODUCTION
> A full multi-page site: men / women / kids, sport categories, 34 products with
> detail pages, a scroll-driven hero, and the WebGL shader up top. Everything
> hand-written; the deployed build (umbra_v) is the tightened version.

### ▸ SHIPPED
**Live at umbrav.vercel.app.** A complete, framework-free storefront with a custom shader hero.

### FACTS
TYPE storefront · front-end · BUILT vanilla HTML · CSS · JS · HERO custom WebGL shader · CART localStorage · SCOPE 34 products, multi-page · STATUS live

---

## THE PLATES — art archive (curated from ArtStation @damanpsd, verified by eye)
Featured 5 (recent + technical, tightest "3D/technical artist → engineer" signal), plus a **"full gallery → artstation.com/damanpsd"** link. 2023 anime/poster fan-art deliberately left off (dilutes the signal).

| Plate | Piece | Year | Media | Notes |
|---|---|---|---|---|
| PL.01 | **Umbraxis — The City of Progress** | 2025 | VIDEO (click-to-load YT) + stills | Hero plate. UE5 medieval village, golden-hour, Lumen/Nanite, dynamic sky. Seen: genuinely strong. |
| PL.02 | **Guitar Looks-Dev** (ESP set) | 2025 | VIDEO (click-to-load YT) + still | Studio product-render, dark dramatic. Was PL.04 on old site. |
| PL.03 | **Procedurally Generated Painted Clouds** | 2025 | still | Technical/shader art — threads to umbra's WebGL. |
| PL.04 | **Cityscape** | 2023 | still | Procedural city generation, dense clay render. Real env-generation chops. |
| PL.05 | **Looks-Dev Exercise** (or Highway Side Stop) | 2025/23 | video/still | 5th for depth; final pick at build. |

**MEDIA RULES (locked):**
- **Zero external requests = ABSOLUTE.** Self-host stills/fonts/everything.
- **Video = click-to-load YouTube** (YouTubeFigure pattern from the old portfolio): poster shows, NOTHING contacts Google until a deliberate click. Promise holds.
- **⏳ NEEDED FROM DAMAN:** YouTube URLs/IDs for the looks-dev reels (Umbraxis, Guitar, NPR asset). Not a design blocker.
- Full-res stills already downloaded → `scratchpad/artstation/covers/` (Umbraxis, Guitar, Clouds, Cityscape, Looks-dev, Highway, Interior, NPR). Optimize to webp at build.

## Board also carries: ORIGIN node + THE PLATES + CONTACT node (GitHub / form — NO email exposed).
Breadth statement the board makes at a glance: **Rust (protec) · self-hosted AI/ops (n8n) · full-stack web (volt) · Python native (flux) · mobile/full-stack (NOCTRA) · hand-built front-end + WebGL (umbra) · + curated 3D/technical art.** One person, real range, every claim true.

