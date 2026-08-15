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

## Known gap — resolved

A follow-up pass closed the gap the imagery review above left open. Four more modules in
this tree hotlinked third-party CDNs live at runtime and have since been swapped wholesale
to self-hosted or seeded-local sources (unlike the `template-images.ts` pass, this one
skipped individual visual review of the ~500 assets — the owner's call, given the volume):

- **`src/lib/template-videos.ts`** — 247 `cdn.openart.ai` video URLs → each entry keeps its
  real, `ffprobe`-measured `aspect` but now resolves `url` through `placeholderVideoSrc()`
  (`lib/placeholder-art.ts`), a seeded pick from 12 self-hosted static-frame clips at
  `public/videos/placeholder-0.mp4`…`placeholder-11.mp4` (same dark/accent dot pattern as
  the image placeholders, baked to a silent 2s loop via ffmpeg at authoring time).
- **`src/lib/stock.ts`** — 246 `assets.lummi.ai`/`www.lummi.ai` photo URLs → `src`/`srcSet`
  now resolve through `placeholderStill()`, the same seeded SVG data-URI generator used for
  `template-images.ts`'s 11 dropped slots. Real aspect ratios (`w`/`h`, probed at author
  time) are kept as layout data; the pixels are locally generated.
- **`src/lib/catalog.ts`** — 6 `cdn.openart.ai` checkpoint-preview URLs → repointed to the
  four checkpoint clips already self-hosted under `public/models/*.mp4` (via the existing
  slug form `checkpointClip()` already supported), reusing real local footage instead of
  minting new placeholder assets.
- **`src/components/tool-workspace/my-generations-panel.tsx`** — 1 `cdn.openart.ai` URL →
  repointed to `/models/lumen-xl.mp4`, one of the same local checkpoint clips.

Confirmed via `grep -rn "openart\.ai\|lummi\.ai" src/ dist/` that no live URL to either host
remains anywhere in source or the built output (only historical comments in `src/`
mentioning the hostnames by name survive). `bun run build` stays clean. The app now makes
zero outbound requests to `openart.ai` or `lummi.ai`.

## Syncing a future UI change

```sh
git -C /Users/pratham/code/perchance/perchange-update log --oneline -20   # find the new sha
git -C /Users/pratham/code/perchance/perchange-update diff 9741b25..<new-sha> -- frontend/src frontend/public \
  | git apply --3way -p2   # -p2 strips the frontend/ prefix; adjust if paths don't match
```

Then: bump the synced sha in this file, re-run the imagery review for anything new in
`template-images.ts` (or the known-gap files above, if that pass ever happens), re-run
`bun run build`, re-check the §7-equivalent scrub, and commit.
