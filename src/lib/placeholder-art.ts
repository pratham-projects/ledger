/**
 * Deterministic placeholder stills for template-image slots whose original source was
 * dropped during the demo's imagery review (branded/watermarked openart.ai promotional
 * assets, or content judged too risky for a public repo — see `UPSTREAM.md`).
 *
 * Same idea as `components/ui/dithering-shader.tsx` — a seeded, dotted, low-fi pattern in
 * the site's own bg/accent tokens — baked to a static inline SVG instead of an animated
 * WebGL canvas, because this needs to sit in a plain `<img src>` slot inside a data array,
 * not mount a canvas. Same seeded-hash contract as `imageRun` below: a given seed always
 * produces the same still, so a reel and its detail view agree, across reloads.
 */

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** xorshift32, seeded from `hash()` — deterministic, no external RNG dependency. */
function makeRng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967295;
  };
}

const BG = "#17151c";
const ACCENT = "#b9f36b";

/**
 * A dark tile scattered with accent-coloured dots at a seeded pseudo-random layout —
 * evokes the dithering shader's "dots" mode without needing WebGL at render time.
 * Returns a data: URI, so the tile never issues a network request.
 */
export function placeholderStill(seed: string, aspect: number): string {
  const width = 640;
  const height = Math.round(width / aspect);
  const rng = makeRng(hash(seed));
  const dotCount = 42;
  let dots = "";
  for (let i = 0; i < dotCount; i++) {
    const x = rng() * width;
    const y = rng() * height;
    const r = 3 + rng() * 12;
    const o = 0.06 + rng() * 0.32;
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${ACCENT}" fill-opacity="${o.toFixed(2)}"/>`;
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${BG}"/>${dots}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Video counterpart of `placeholderStill`, for `lib/template-videos.ts`'s clip pool and
 * anywhere else a `<video src>` slot stood in for generated output. A `<video>` element
 * can't take an inline SVG as `src` the way `<img>` can, so this can't be a data: URI the
 * same way — instead it's a small, fixed pool of self-hosted static-frame clips
 * (`public/videos/placeholder-0.mp4` … `placeholder-11.mp4`), each rendered once at
 * authoring time from this same dot-scatter pattern (same `BG`/`ACCENT`, same algorithm,
 * baked to a 2s silent loop via ffmpeg) and checked into the repo — no network request,
 * same seeded-hash contract as `placeholderStill`: a given seed always resolves to the
 * same clip.
 */
const VIDEO_PLACEHOLDER_COUNT = 12;

export function placeholderVideoSrc(seed: string): string {
  const index = hash(seed) % VIDEO_PLACEHOLDER_COUNT;
  return `/videos/placeholder-${index}.mp4`;
}
