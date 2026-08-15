# Ledger

A portfolio build of **Ledger**, the frontend for a generative-media product (image /
video / chat / RPG / interactive-story tools built on a Laravel generation backend).
Frozen at the commit right before the real app was wired to that backend — see
`UPSTREAM.md`.

**Demo — sample data, no backend.** Unlike the other two demos in this set, there is
nothing to mock here: at the commit this repo is built from, the product had **zero
network calls anywhere**. Every screen — the catalogue, the generation results, the chat
history, the RPG session, the story drafts — runs on synthetic, seeded local data
(`src/lib/catalog.ts`, `stock.ts`, `template-images.ts`, `template-videos.ts`). Nothing
you click here sends a request anywhere.

## What's real

- The full React 18 + Vite 6 UI: layout, navigation, all 9 top-level tools/pages, the
  10-category Inspirations browser, motion, theming, responsive behavior.
- The design system — flat, ruled, "technical ledger" aesthetic (mono labels, zero
  border-radius, ink-not-glow purple/lime accents). See `src/styles/globals.css` for the
  token set.
- The interaction model: selecting a template, building a prompt, browsing "My
  Generations", the credits panel, the RPG/story session UI.

## What's mocked / synthetic

- **The generation catalogue** (`src/lib/catalog.ts`) — invented checkpoints and LoRAs,
  invented download counts. Never a real model registry.
- **Template stills** (`src/lib/template-images.ts`) — 33 real photos/renders, self-hosted
  under `public/stills/`, reviewed by hand for this repo (see `UPSTREAM.md` for exactly
  what was kept, dropped, and why). The remaining slots — and every entry in
  `template-videos.ts` and `stock.ts` — are still openart.ai/lummi.ai hotlinks inherited
  from upstream and were **not** part of this review pass; see the "Known gap" section of
  `UPSTREAM.md` before treating this repo as fully self-contained.
- **Credits, favorites, auth** — local component state, not a real account system.

There is no `.env` — nothing here is configurable per-environment because nothing here
calls a network.

## Run it

```sh
bun install
bun run dev       # http://localhost:5173
```

```sh
bun run build     # tsc -b && vite build -> dist/
bun run preview   # serve dist/ locally
```

## Deploy

Vercel, as a static Vite SPA — `vercel.json` is already configured (build command,
output dir, SPA rewrite so client-side routes don't 404 on refresh). Connect the repo in
the Vercel dashboard; no environment variables are needed.

**Live URL:** not yet deployed — will be added here once connected.

## Repo layout

```
src/
  routes/            one file per top-level page
  components/        UI, organized by surface (chat/, rpg/, image/, video/, ...)
  components/demo/   demo-only: the "Demo — sample data, no backend" badge
  lib/                catalog.ts, stock.ts, template-images.ts, template-videos.ts —
                      all the synthetic data this UI runs on
  lib/placeholder-art.ts   seeded SVG generator for dropped image slots
  styles/            design tokens + globals
public/
  models/            local .mp4 checkpoint-preview clips (kept as-is from upstream)
  stills/            self-hosted template images (this repo's one substantive change)
```

## Source

Extracted from a real client project. See `UPSTREAM.md` for the exact source path, synced
commit, what was cut, and how to pull a future UI update (`scripts/sync-ui.sh`).
