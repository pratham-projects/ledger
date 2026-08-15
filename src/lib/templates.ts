/**
 * Synthetic authorship and creative-brief text for each template video.
 *
 * This build has no real community feed behind "Inspirations" — the video itself is real
 * (see `lib/template-videos.ts`), but the author, title and brief around it are generated,
 * not scraped. Deterministic per `(category, index)`, so the same slot always shows the
 * same card rather than reshuffling on every render.
 */

import { videoRun } from "@/lib/template-videos";
import { stockRun, type StockImage } from "@/lib/stock";

/**
 * The ten genres the deck can be pointed at, each with its own gallery — the
 * "Inspirations" band: our own copy, our own template videos
 * from `lib/template-videos`, nothing borrowed visually. Single source of truth for both
 * the `/home` band and each category's own page at `/home/inspirations/:id`.
 */
export const INSPIRATION_CATEGORIES = [
  {
    id: "marketing",
    label: "Marketing and Advertising",
    blurb: "Campaign clips, product shots, and style visuals for brands and sellers",
  },
  {
    id: "film",
    label: "Film & Stories",
    blurb: "Character arcs, dialogue-driven scenes, and narrative shorts",
  },
  {
    id: "music",
    label: "Music Video",
    blurb: "Rhythmic cuts, performance shots, and mood-driven visuals for tracks",
  },
  {
    id: "animation",
    label: "Animation & Illustration",
    blurb: "Character-driven stories, anime, illustration, and 3D art",
  },
  { id: "ugc", label: "UGC", blurb: "Handheld, authentic-feeling clips styled like creator content" },
  {
    id: "micro-drama",
    label: "Micro Drama",
    blurb: "Short, plot-heavy episodes built for vertical viewing",
  },
  {
    id: "anime",
    label: "Anime",
    blurb: "Cel-shaded characters and stylised motion in the anime tradition",
  },
  {
    id: "gaming",
    label: "Gaming and Concept Art",
    blurb: "Environment and character concepts for games and interactive worlds",
  },
  {
    id: "explainer",
    label: "Explainer",
    blurb: "Clear, friendly visuals for walkthroughs and how-it-works videos",
  },
  {
    id: "mood",
    label: "Mood and Atmosphere",
    blurb: "Ambient scenes built around light, texture, and feeling over plot",
  },
] as const;

export interface Template {
  id: string;
  url: string;
  /** Width ÷ height, from `videoRun` — see `lib/template-videos.ts`. */
  aspect: number;
  title: string;
  authorName: string;
  authorHandle: string;
  categoryLabel: string;
  brief: string;
  references: StockImage[];
}

const FIRST_NAMES = [
  "Fandy", "Mira", "Kestrel", "Orin", "Tamsin", "Bao",
  "Ines", "Rolf", "Suki", "Dario", "Nadia", "Wren",
];
const LAST_NAMES = [
  "Wu", "Kade", "Marsh", "Vale", "Ochoa", "Lin",
  "Reyes", "Storm", "Iyer", "Solis", "Petrov", "Ashe",
];
const HANDLE_WORDS = [
  "quetzal", "frigatebird", "cinder", "harbor", "echo", "tundra",
  "lantern", "argent", "brine", "ember", "glacier", "opal",
];
const HANDLE_TAGS = [
  "obvious", "hidden", "quiet", "distant", "narrow", "gentle", "open", "steady",
];

const TITLE_WORDS_A = [
  "Echoes", "Embers", "Static", "Harbor", "Signal", "Ashes", "Drift", "Hollow", "Glass", "Nightfall",
];
const TITLE_WORDS_B = [
  "of Canvas", "of Rain", "of the Line", "of Glass", "of Tide",
  "of Neon", "of Static", "of Home", "of Distance", "of Light",
];

const DIRECTION_NOTES = [
  "Keep the visual language grounded — real locations, motivated light, believable performances.",
  "Cut on action and hold the wide for a beat longer than feels natural.",
  "Let the camera drift rather than track — nothing locked-off, nothing handheld either.",
  "Favor practical light sources in frame over anything that reads as a rig.",
  "One clean master shot is worth more here than five inserts.",
  "Treat the reference as an identity lock, not a style lock — preserve the face, not the palette.",
  "Play the dialogue underneath, not over it — let the picture carry the first beat in silence.",
  "Match the coverage to a real shot list: wide, two-shot, single, insert — nothing invented on the fly.",
];

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(pool: T[], seed: number): T {
  // `seed` typically arrives already right-shifted (`seed >> n`) by the caller. `>>`
  // sign-extends, so a `hash()` output whose high bit is set (any value ≥ 2^31, which
  // is roughly half of them) becomes negative — and a negative `%` stays negative in JS,
  // indexing the array from the *end* or, once `Math.abs` of it exceeds the pool length,
  // landing outside it entirely and returning `undefined`. Normalize with `>>> 0` first.
  return pool[(seed >>> 0) % pool.length];
}

/** `count` deterministic template cards for one category, backed by real (deduplicated,
 *  reachability-checked) clips from `videoRun`. */
export function templatesFor(
  categoryId: string,
  categoryLabel: string,
  blurb: string,
  count: number
): Template[] {
  const clips = videoRun(categoryId, count);

  return clips.map(({ url, aspect }, i) => {
    const seed = hash(`${categoryId}-${i}-${url}`);
    const authorName = `${pick(FIRST_NAMES, seed)} ${pick(LAST_NAMES, seed >> 3)}`;
    const authorHandle = `@${pick(HANDLE_WORDS, seed >> 5)}_${pick(HANDLE_TAGS, seed >> 8)}_${(seed % 90) + 10}`;
    const title = `${pick(TITLE_WORDS_A, seed >> 2)} ${pick(TITLE_WORDS_B, seed >> 4)}`;
    const noteA = pick(DIRECTION_NOTES, seed >> 6);
    const noteB = pick(DIRECTION_NOTES, (seed >> 6) + 3);
    const brief = `Create a short video for ${blurb.toLowerCase()}. ${noteA} ${noteB}`;

    return {
      id: `${categoryId}-${i}`,
      url,
      aspect,
      title,
      authorName,
      authorHandle,
      categoryLabel,
      brief,
      references: stockRun(`${categoryId}-${i}-ref`, 4, "portrait"),
    };
  });
}
