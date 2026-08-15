/**
 * Real template stills, standing in for generated image output — the image equivalent of
 * `lib/template-videos.ts`.
 *
 * Self-hosted under `public/stills/` — see `UPSTREAM.md`. The upstream source pointed 44
 * of these at `cdn.openart.ai`. Each was downloaded and reviewed by hand for this demo:
 * 33 were kept and copied locally; 11 were dropped (branded/watermarked openart.ai
 * promotional assets, an in-app product-UI screenshot, a real movie poster, or content
 * judged too risky for a public portfolio repo) and are filled with a deterministic
 * placeholder still instead — see `placeholder-art.ts`. `aspect` was read from the
 * decoded image (via PIL) at author time, kept as-is for the placeholder slots too so
 * layout doesn't shift.
 *
 * Replace all of this the day the Laravel generation API returns real output.
 */

import { placeholderStill } from "@/lib/placeholder-art";

export interface TemplateImage {
  url: string;
  /** Width ÷ height, from the decoded file. */
  aspect: number;
}

export const TEMPLATE_IMAGES: TemplateImage[] = [
  { url: "/stills/still-01.webp", aspect: 0.75 },
  { url: "/stills/still-02.webp", aspect: 0.75 },
  { url: "/stills/still-03.webp", aspect: 0.75 },
  { url: "/stills/still-04.webp", aspect: 1.3333 },
  { url: "/stills/still-05.webp", aspect: 0.75 },
  { url: "/stills/still-06.webp", aspect: 0.75 },
  { url: "/stills/still-07.webp", aspect: 0.75 },
  { url: "/stills/still-08.webp", aspect: 0.75 },
  { url: "/stills/still-09.webp", aspect: 0.75 },
  { url: placeholderStill("template-image-10", 0.75), aspect: 0.75 },
  { url: "/stills/still-10.webp", aspect: 1.0 },
  { url: "/stills/still-11.webp", aspect: 0.75 },
  { url: placeholderStill("template-image-13", 1.78), aspect: 1.78 },
  { url: placeholderStill("template-image-14", 1.7778), aspect: 1.7778 },
  { url: "/stills/still-12.webp", aspect: 1.791 },
  { url: placeholderStill("template-image-16", 1.7778), aspect: 1.7778 },
  { url: "/stills/still-13.webp", aspect: 1.0 },
  { url: "/stills/still-14.webp", aspect: 1.3333 },
  { url: "/stills/still-15.webp", aspect: 1.0 },
  { url: "/stills/still-16.webp", aspect: 1.0 },
  { url: placeholderStill("template-image-21", 1.0), aspect: 1.0 },
  { url: "/stills/still-17.webp", aspect: 1.0 },
  { url: placeholderStill("template-image-23", 1.7764), aspect: 1.7764 },
  { url: "/stills/still-18.webp", aspect: 1.7804 },
  { url: "/stills/still-19.webp", aspect: 1.7778 },
  { url: "/stills/still-20.webp", aspect: 1.0 },
  { url: placeholderStill("template-image-27", 1.0), aspect: 1.0 },
  { url: "/stills/still-21.webp", aspect: 1.0 },
  { url: "/stills/still-22.webp", aspect: 1.025 },
  { url: "/stills/still-23.webp", aspect: 1.0 },
  { url: placeholderStill("template-image-31", 1.0), aspect: 1.0 },
  { url: "/stills/still-24.webp", aspect: 1.0 },
  { url: placeholderStill("template-image-33", 1.7751), aspect: 1.7751 },
  { url: "/stills/still-25.webp", aspect: 1.7751 },
  { url: placeholderStill("template-image-35", 1.7751), aspect: 1.7751 },
  { url: "/stills/still-26.webp", aspect: 1.7751 },
  { url: placeholderStill("template-image-37", 1.7778), aspect: 1.7778 },
  { url: "/stills/still-27.jpg", aspect: 1.0 },
  { url: "/stills/still-28.webp", aspect: 1.3393 },
  { url: "/stills/still-29.webp", aspect: 1.0 },
  { url: "/stills/still-30.webp", aspect: 1.3393 },
  { url: "/stills/still-31.webp", aspect: 1.0 },
  { url: "/stills/still-32.webp", aspect: 1.9359 },
  { url: "/stills/still-33.webp", aspect: 1.0 },
];

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A stable, non-repeating run of `count` images — same striding technique as
 *  `videoRun` in `lib/template-videos.ts`. */
export function imageRun(seedKey: string, count: number): TemplateImage[] {
  const start = hash(seedKey) % TEMPLATE_IMAGES.length;
  return Array.from(
    { length: count },
    (_, i) => TEMPLATE_IMAGES[(start + i * 7) % TEMPLATE_IMAGES.length]
  );
}
