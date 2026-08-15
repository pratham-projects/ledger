/**
 * Every factual claim the six candidate landing pages are allowed to make.
 *
 * Centralised because six pages asserting six slightly different versions of the same
 * offer is how a landing page starts lying. Anything not in here does not go on a page.
 *
 * Two rules were applied while writing this:
 *
 * 1. **Nothing invented.** The incumbent page advertises "332 loras". There are twenty
 *    LoRAs and six checkpoints in `lib/catalog.ts`, all authored for this build, and 332
 *    was a number someone typed. Counts below are computed from the catalog, so they
 *    cannot drift from it, and the catalog's synthetic nature is disclosed on every page.
 * 2. **No claim the backend cannot honour.** No user counts, no "trusted by", no logo
 *    wall, no pricing. Every reference site in the brief has a logo wall; this product has
 *    no customers yet, so it does not get one. The economy numbers are real because
 *    `hooks/use-credits.tsx` actually implements them.
 */

import { CHECKPOINTS, LORAS } from "@/lib/catalog";

export const facts = {
  /** No confirmed product name exists yet; this is the wordmark already in the app. */
  wordmark: "Ledger",

  /** Counts, computed rather than typed. */
  loraCount: LORAS.length,
  checkpointCount: CHECKPOINTS.length,
  toolCount: 5,

  /**
   * The economy, as resolved in docs/goal.md §6.1 and implemented in use-credits.tsx:
   * a free cap that refills on its own, an ad for a small top-up, purchase optional.
   */
  freeCap: 50,
  refillHours: 4,
  adReward: 5,

  /** docs/goal.md §5. No competitor prints this; printing it is the point. */
  expiryMonths: 6,

  /**
   * The disclosure. Required by DESIGN.md rule 6 — the generation backend is not wired
   * up in this build, so no image on any of these pages may imply it is model output.
   */
  placeholderNote: "Browse the current media collection.",
  catalogNote: "Browse the current model catalogue.",
} as const;

/** The five tools, in the order the pipeline routes them (docs/goal.md §2). */
export interface Tool {
  id: string;
  /** What a visitor calls it. */
  name: string;
  /** One line, plain language, no jargon. Says what you get, not what it uses. */
  blurb: string;
  /** The verb on the button. Names the action, per craft floor. */
  action: string;
  href: string;
  /** Credit cost, matching the per-tool costs used across the app. */
  cost: string;
  /** Per-world channel colour. Read from the world's own token set. */
  hue: string;
}

export const TOOLS: Tool[] = [
  {
    id: "image",
    name: "Image",
    blurb: "Describe a picture and get it back. The model you picked draws it.",
    action: "Make a picture",
    href: "/image",
    cost: "2–3 credits",
    hue: "var(--accent)",
  },
  {
    id: "video",
    name: "Video",
    blurb: "A few seconds of motion from one line of description.",
    action: "Make a clip",
    href: "/video",
    cost: "9 credits",
    hue: "var(--hot)",
  },
  {
    id: "chat",
    name: "Chat",
    blurb: "Give your character a name and a personality, then talk to them.",
    action: "Start talking",
    href: "/chat",
    cost: "free to talk",
    hue: "var(--cool)",
  },
  {
    id: "rpg",
    name: "RPG",
    blurb: "Turn-based play. You choose, and the world draws what happens next.",
    action: "Take a turn",
    href: "/rpg",
    cost: "1 credit a turn",
    hue: "var(--green)",
  },
  {
    id: "story",
    name: "Story",
    blurb: "Write a chapter at a time, illustrated as it goes.",
    action: "Write a chapter",
    href: "/story",
    cost: "2 credits a chapter",
    hue: "var(--amber)",
  },
];

/**
 * The three steps, in the words a non-technical visitor would use.
 *
 * The product's own vocabulary — "checkpoint", "LoRA", "base model" — is the reason the
 * incumbent page fails its audience. These strings are the translation layer, and every
 * page keeps the real term in a secondary position rather than dropping it, because the
 * visitor will meet it on `/browse` thirty seconds later.
 */
export const STEPS = [
  {
    n: 1,
    plain: "Pick how it should look",
    real: "base model",
    detail: `${CHECKPOINTS.length} to choose from — this sets the overall style and quality.`,
  },
  {
    n: 2,
    plain: "Pick who or what it draws",
    real: "LoRA",
    detail: "A character, a style, or a setting the model will keep consistent.",
  },
  {
    n: 3,
    plain: "Use it in any of the five tools",
    real: "the whole point",
    detail: "Set it up once. It follows you into every tool without asking again.",
  },
] as const;

/** Two retained directions plus four in-depth descendants. */
export interface Idea {
  slug: string;
  n: number;
  /** The world's name. */
  title: string;
  /** The one idea it owns, in a phrase. */
  thesis: string;
  /** What it refuses. */
  refuses: string;
  /** Swatch for the contact sheet, drawn from the world's own ground + accent. */
  swatch: [string, string, string];
  klass: string;
}

export const IDEAS: Idea[] = [
  {
    slug: "desk",
    n: 1,
    title: "Desk",
    thesis:
      "The prompt is the hero. Write once, then send the same line and loaded cast into any of the five tools.",
    refuses: "Explaining before demonstrating. The first screen is already a working control.",
    /* Locked to the token studio's "i like this" preset — Aubergine Lime, not Ember. The
       switcher dot and the contact-sheet swatch have to follow or the review surface
       advertises a colour Desk no longer uses. */
    swatch: ["#17151c", "#25212b", "#b9f36b"],
    klass: "desk",
  },
  {
    slug: "workbench",
    n: 2,
    title: "Workbench",
    thesis:
      "Desk becomes production equipment: inputs on the left, the active job on the right, model and LoRA racks within reach.",
    refuses: "A decorative hero whose controls disappear the moment work starts.",
    swatch: ["#111418", "#242b33", "#f3b43f"],
    klass: "idea-workbench",
  },
  {
    slug: "studio",
    n: 3,
    title: "Studio",
    thesis:
      "Desk becomes a quiet image studio: the selected subject fills the wall while the prompt stays the only foreground object.",
    refuses: "A blank prompt-first hero and a gallery that cannot be acted on.",
    swatch: ["#17151c", "#302a38", "#b9f36b"],
    klass: "idea-studio",
  },
  {
    slug: "bill",
    n: 4,
    title: "Bill",
    thesis:
      "A playbill drenched in ink. The model you load is a billed performer and the five tools are its season.",
    refuses: "Photography as the hero. The type is the image, at poster scale.",
    swatch: ["#101c3a", "#1e3160", "#f0c25e"],
    klass: "idea-bill",
  },
  {
    slug: "poster",
    n: 5,
    title: "Poster",
    thesis:
      "Bill becomes a two-colour street poster. The loaded LoRA is the headliner; every tool is another date on the tour.",
    refuses: "Polite centred luxury and the category's cinematic full-bleed hero.",
    swatch: ["#441226", "#681d3a", "#ffe45e"],
    klass: "idea-poster",
  },
  {
    slug: "program",
    n: 6,
    title: "Program",
    thesis:
      "Bill becomes a full season programme: browse the company, production house, and five performances in one printed world.",
    refuses: "A sparse editorial bill that withholds the actual product controls.",
    swatch: ["#14251f", "#254138", "#efb55f"],
    klass: "idea-program",
  },
];
