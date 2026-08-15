# Upstream

This repo is a frontend-only extraction of **Ledger** (Perchance UI), a real client
product. It is packaged for a portfolio, not maintained as a product.

- **Source:** local path `/Users/pratham/code/perchance/perchange-update` — this source
  has **no git remote**, so unlike a normal upstream there is nothing to `git fetch`; sync
  works directly off that local path (see `scripts/sync-ui.sh`).
- **Synced commit:** `9741b25` — `feat(ui): finalize live product shell`. This is the last
  commit before the real product wired the UI to a live Laravel generation API; everything
  after it on the source's `main` is that integration, which this demo intentionally does
  not carry.
- **Subtree taken:** `frontend/` only. `research/`, `okf/`, `docs/`, `design/`, `assets/`,
  `bg.ts`, `CLAUDE.md`, `PRODUCT.md`, `DESIGN.md` all stayed behind — client-facing product
  docs and internal research have no place in a public repo.
- **Protected paths — sync must never overwrite these:** `mock/` (n/a here, no backend),
  `components/demo/`, `README.md`, `UPSTREAM.md`, `scripts/`, `vercel.json`,
  `.env.example` (n/a — no env vars).

## What changed from upstream

Only one substantive change: **`src/lib/template-images.ts`**. At `9741b25` this module
pointed 44 image slots at `cdn.openart.ai` — a third-party CDN, unreviewed, and not
something a public repo should hotlink indefinitely. Every one of the 44 was downloaded and
looked at by hand for this pass:

- **33 kept** — self-hosted under `public/stills/still-NN.{webp,jpg}`, module rewritten to
  local paths, `aspect` preserved exactly from the original (author-measured, not guessed).
- **11 dropped** — openart.ai's own branded/watermarked promotional assets (a real movie
  poster, product-UI screenshots, AI-model-brand collages, an "OpenArt" magazine cover
  mockup) and one anime character portrait dropped out of caution. Those slots are filled
  by `lib/placeholder-art.ts`, a small seeded SVG generator in the same spirit as
  `components/ui/dithering-shader.tsx` — same accent-on-dark dotted look, deterministic per
  seed, zero network requests.

Everything else is byte-identical to the source at `9741b25`, plus the additive,
demo-only files this set of repos always adds: `README.md`, `UPSTREAM.md`, `vercel.json`,
`scripts/sync-ui.sh`, `src/components/demo/demo-badge.tsx` (and its one-line mount in
`src/App.tsx`).

## Known gap — not addressed in this pass

The imagery review above covered `template-images.ts` only, as scoped. Two other modules
in this same tree still hotlink third-party CDNs and were **not** reviewed or self-hosted:

- **`src/lib/template-videos.ts`** — ~247 `cdn.openart.ai` video preview URLs.
- **`src/lib/stock.ts`** — 246 `assets.lummi.ai` / `www.lummi.ai` photo URLs.
- **`src/lib/catalog.ts`** — 6 `cdn.openart.ai` checkpoint-preview video URLs.
- **`src/components/tool-workspace/my-generations-panel.tsx`** — 1 `cdn.openart.ai` URL.

These are a much larger surface (~500 assets) than the 44 covered here, and reviewing them
follows the same process: download, look at every one, self-host the keepers, extend
`placeholder-art.ts` for the rest. Until that pass happens, the running app still makes
live network requests to `openart.ai` and `lummi.ai`, which will fail a "network tab is
silent" check and should block making this repo public.

## Syncing a future UI change

```sh
git -C /Users/pratham/code/perchance/perchange-update log --oneline -20   # find the new sha
git -C /Users/pratham/code/perchance/perchange-update diff 9741b25..<new-sha> -- frontend/src frontend/public \
  | git apply --3way -p2   # -p2 strips the frontend/ prefix; adjust if paths don't match
```

Then: bump the synced sha in this file, re-run the imagery review for anything new in
`template-images.ts` (or the known-gap files above, if that pass ever happens), re-run
`bun run build`, re-check the §7-equivalent scrub, and commit.
