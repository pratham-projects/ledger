/**
 * SYNTHETIC DEMO CATALOG.
 *
 * Every checkpoint and LoRA below is authored for this build — none of it comes from a
 * real model registry, and the download counts are invented. It exists so the browse
 * surface can be designed and reviewed against realistic volume and name lengths instead
 * of three lorem rows. Replace wholesale with the Laravel catalog endpoint when it lands;
 * the shapes here are a guess at that payload, not a contract.
 *
 * Names are original to avoid standing in for real trained models or real people.
 */

import type { StockSubject } from "@/lib/stock";

export type LoraCategory = "character" | "style" | "concept";

export interface Checkpoint {
  id: string;
  name: string;
  family: string;
  tagline: string;
  nativeResolution: string;
  /** Rough per-image credit cost at this checkpoint's native settings. */
  costPerImage: number;
  /**
   * The preview clip. Either a full URL or a slug resolving to `/models/<slug>.mp4`.
   * Read it through `checkpointClip()` rather than interpolating it — the two forms have
   * already cost us one broken thumbnail. The clips are real footage, but they are stock
   * previews stood in for this build, not output from the checkpoint they sit under.
   */
  preview: string;
  /** Local still frame. Required: a remote clip has no derivable poster. */
  poster: string;
}

/** The clip URL for a checkpoint, whichever form `preview` is in. */
export function checkpointClip(cp: Checkpoint): string {
  return cp.preview.startsWith("http") ? cp.preview : `/models/${cp.preview}.mp4`;
}

/**
 * The still frame for a checkpoint. Every surface that shows a base model without playing
 * it — rails, sticky bars, the source strip — goes through here.
 */
export function checkpointPoster(cp: Checkpoint): string {
  return cp.poster;
}

export interface Lora {
  id: string;
  name: string;
  category: LoraCategory;
  author: string;
  tagline: string;
  /** Prompt fragments the LoRA responds to — shown on the detail panel, copyable. */
  triggerWords: string[];
  tags: string[];
  /** Checkpoint families this LoRA was trained against. */
  compatible: string[];
  defaultStrength: number;
  downloads: number;
  /**
   * Days since publication. Stored as an age rather than a date so the "newest" shelf
   * cannot rot into showing three-year-old models the way a hardcoded timestamp would.
   */
  ageDays: number;
  /** Hue used to seed the placeholder thumbnail — previews now come from lib/stock.ts. */
  hue: number;
}

export const CHECKPOINTS: Checkpoint[] = [
  {
    id: "cp-lumen",
    name: "Lumen XL",
    family: "XL",
    tagline: "Balanced general-purpose base. Clean skin, forgiving with short prompts.",
    nativeResolution: "1024×1024",
    costPerImage: 2,
    preview: "https://cdn.openart.ai/community-post-assets/f5c0f43df9285f47824c59b7849bb7f7/output/0.mp4",
    poster: "/models/lumen-xl.jpg",
  },
  {
    id: "cp-inkwell",
    name: "Inkwell",
    family: "XL",
    tagline: "Illustration-leaning. Holds linework and flat color without muddying.",
    nativeResolution: "1024×1024",
    costPerImage: 2,
    preview: "https://cdn.openart.ai/community-post-assets/356d264d30295b3ca22dc9f59a821dcb/output/0.mp4",
    poster: "/models/inkwell.jpg",
  },
  {
    id: "cp-ferrograph",
    name: "Ferrograph",
    family: "XL",
    tagline: "Photographic. Heavier, slower, best with detailed prompts.",
    nativeResolution: "1152×896",
    costPerImage: 3,
    preview: "https://cdn.openart.ai/community-post-assets/cb04d1e2fdea551b95767db788d79433/output/0.mp4",
    poster: "/models/ferrograph.jpg",
  },
  {
    id: "cp-tessera",
    name: "Tessera Mini",
    family: "Compact",
    tagline: "Fast and cheap. Lower fidelity — good for iterating on composition.",
    nativeResolution: "768×768",
    costPerImage: 1,
    preview: "https://cdn.openart.ai/community-post-assets/6574bb2772bb59f9a1b4d938ac223748/output/0.mp4",
    poster: "/models/tessera-mini.jpg",
  },
  {
    id: "cp-prism",
    name: "Prism",
    family: "XL",
    tagline: "Color-forward generalist for bold lighting and graphic scenes.",
    nativeResolution: "1024×1024",
    costPerImage: 2,
    preview: "https://cdn.openart.ai/community-post-assets/196da678045551c79c5ab02efa514075/output/0.mp4",
    poster: "/models/inkwell.jpg",
  },
  {
    id: "cp-morrow",
    name: "Morrow",
    family: "Compact",
    tagline: "Quick concept model for loose compositions and rapid iteration.",
    nativeResolution: "768×768",
    costPerImage: 1,
    preview: "https://cdn.openart.ai/community-post-assets/c20c62f01cbc5a66aac518b500817fdc/output/0.mp4",
    poster: "/models/lumen-xl.jpg",
  },
];

/**
 * The hand-authored head of the catalog. Real prose, real trigger words, plausible
 * relationships between fields — these are what the surface is designed against. The
 * procedural tail below exists only to reach production volume.
 */
const AUTHORED: Omit<Lora, "ageDays">[] = [
  // ── characters ──────────────────────────────────────────────────────────────
  {
    id: "lora-wren",
    name: "Wren Halloway",
    category: "character",
    author: "atlas.void",
    tagline: "Rooftop courier in a rain-soaked port city. Green jacket, cropped hair, always mid-stride.",
    triggerWords: ["wren halloway", "green courier jacket"],
    tags: ["original", "modern", "action"],
    compatible: ["XL"],
    defaultStrength: 0.8,
    downloads: 48210,
    hue: 152,
  },
  {
    id: "lora-marrow",
    name: "Doctor Marrow",
    category: "character",
    author: "pale.engine",
    tagline: "Victorian anatomist with a brass hand. Reads as clinical, never gory.",
    triggerWords: ["doctor marrow", "brass prosthetic hand"],
    tags: ["original", "victorian", "gothic"],
    compatible: ["XL"],
    defaultStrength: 0.75,
    downloads: 31044,
    hue: 38,
  },
  {
    id: "lora-sable",
    name: "Sable of the Ninth",
    category: "character",
    author: "cinder.works",
    tagline: "Knight-errant in blackened plate. Consistent heraldry across angles.",
    triggerWords: ["sable knight", "blackened plate armor"],
    tags: ["fantasy", "armor", "knight"],
    compatible: ["XL", "Compact"],
    defaultStrength: 0.85,
    downloads: 96530,
    hue: 268,
  },
  {
    id: "lora-junco",
    name: "Junco",
    category: "character",
    author: "atlas.void",
    tagline: "Small cheerful mechanic, goggles pushed up. Built for expressive close-ups.",
    triggerWords: ["junco", "mechanic goggles"],
    tags: ["original", "cheerful", "steampunk"],
    compatible: ["XL"],
    defaultStrength: 0.8,
    downloads: 22187,
    hue: 190,
  },
  {
    id: "lora-vesper",
    name: "Vesper Quill",
    category: "character",
    author: "nightshift",
    tagline: "Archivist witch, ink-stained fingers, enormous coat. Strong on hands.",
    triggerWords: ["vesper quill", "ink stained hands"],
    tags: ["fantasy", "witch", "scholar"],
    compatible: ["XL"],
    defaultStrength: 0.78,
    downloads: 64903,
    hue: 288,
  },
  {
    id: "lora-orrin",
    name: "Orrin Tide",
    category: "character",
    author: "saltflat",
    tagline: "Weathered lighthouse keeper. Excellent for older faces and heavy knitwear.",
    triggerWords: ["orrin tide", "lighthouse keeper"],
    tags: ["original", "coastal", "portrait"],
    compatible: ["XL", "Compact"],
    defaultStrength: 0.72,
    downloads: 15662,
    hue: 205,
  },
  {
    id: "lora-kestrel",
    name: "Kestrel Nine",
    category: "character",
    author: "pale.engine",
    tagline: "Android courier with a cracked faceplate. Keeps its damage consistent.",
    triggerWords: ["kestrel nine", "cracked faceplate android"],
    tags: ["scifi", "android", "original"],
    compatible: ["XL"],
    defaultStrength: 0.82,
    downloads: 73418,
    hue: 172,
  },
  {
    id: "lora-fen",
    name: "Fen the Lesser",
    category: "character",
    author: "cinder.works",
    tagline: "Grumpy hedge-wizard, knee-high. Comic proportions that survive style LoRAs.",
    triggerWords: ["fen the lesser", "hedge wizard"],
    tags: ["fantasy", "comic", "creature"],
    compatible: ["XL", "Compact"],
    defaultStrength: 0.88,
    downloads: 41276,
    hue: 96,
  },

  // ── styles ──────────────────────────────────────────────────────────────────
  {
    id: "lora-risograph",
    name: "Risograph Two-Colour",
    category: "style",
    author: "press.and.fold",
    tagline: "Duotone misregistration, visible paper tooth, blown-out highlights.",
    triggerWords: ["risograph print", "two colour misregistration"],
    tags: ["print", "duotone", "retro"],
    compatible: ["XL", "Compact"],
    defaultStrength: 0.65,
    downloads: 128940,
    hue: 340,
  },
  {
    id: "lora-cel-1987",
    name: "Cel 1987",
    category: "style",
    author: "nightshift",
    tagline: "Hand-painted animation cel — visible brush texture in the shadows, film grain.",
    triggerWords: ["1987 animation cel", "hand painted background"],
    tags: ["animation", "retro", "painterly"],
    compatible: ["XL"],
    defaultStrength: 0.7,
    downloads: 214380,
    hue: 24,
  },
  {
    id: "lora-graphite",
    name: "Heavy Graphite",
    category: "style",
    author: "press.and.fold",
    tagline: "Smudged 6B pencil on cartridge paper. Keeps whites genuinely white.",
    triggerWords: ["heavy graphite sketch", "smudged pencil"],
    tags: ["traditional", "monochrome", "sketch"],
    compatible: ["XL", "Compact"],
    defaultStrength: 0.6,
    downloads: 87201,
    hue: 218,
  },
  {
    id: "lora-lacquer",
    name: "Lacquer & Gold Leaf",
    category: "style",
    author: "atlas.void",
    tagline: "Deep lacquer ground with real gold-leaf crackle. Heavy — lower the strength.",
    triggerWords: ["black lacquer", "gold leaf crackle"],
    tags: ["ornate", "material", "luxury"],
    compatible: ["XL"],
    defaultStrength: 0.55,
    downloads: 39118,
    hue: 45,
  },
  {
    id: "lora-blueprint",
    name: "Cyanotype Blueprint",
    category: "style",
    author: "saltflat",
    tagline: "Prussian-blue contact print with white linework and uneven wash edges.",
    triggerWords: ["cyanotype", "blueprint linework"],
    tags: ["technical", "monochrome", "print"],
    compatible: ["XL", "Compact"],
    defaultStrength: 0.68,
    downloads: 52644,
    hue: 212,
  },
  {
    id: "lora-vhs",
    name: "Third-Generation VHS",
    category: "style",
    author: "nightshift",
    tagline: "Chroma bleed, tracking noise, interlace comb. Genuinely degraded, not a filter.",
    triggerWords: ["vhs tracking noise", "chroma bleed"],
    tags: ["analog", "retro", "glitch"],
    compatible: ["XL"],
    defaultStrength: 0.5,
    downloads: 165772,
    hue: 300,
  },

  // ── concepts ────────────────────────────────────────────────────────────────
  {
    id: "lora-drowned-arch",
    name: "Drowned Architecture",
    category: "concept",
    author: "saltflat",
    tagline: "Flooded interiors, waterline stains, furniture half-submerged and still.",
    triggerWords: ["flooded interior", "waterline stain"],
    tags: ["environment", "melancholy", "architecture"],
    compatible: ["XL"],
    defaultStrength: 0.75,
    downloads: 58390,
    hue: 186,
  },
  {
    id: "lora-brutalist",
    name: "Brutalist Megastructure",
    category: "concept",
    author: "pale.engine",
    tagline: "Board-marked concrete at impossible scale. Excellent depth cues.",
    triggerWords: ["brutalist megastructure", "board marked concrete"],
    tags: ["environment", "architecture", "scifi"],
    compatible: ["XL"],
    defaultStrength: 0.8,
    downloads: 71255,
    hue: 30,
  },
  {
    id: "lora-bioluminescence",
    name: "Bioluminescent Night",
    category: "concept",
    author: "cinder.works",
    tagline: "Living light as the only light source. Everything unlit stays truly black.",
    triggerWords: ["bioluminescent", "living light source"],
    tags: ["lighting", "nature", "atmosphere"],
    compatible: ["XL", "Compact"],
    defaultStrength: 0.72,
    downloads: 143908,
    hue: 168,
  },
  {
    id: "lora-paper-diorama",
    name: "Cut-Paper Diorama",
    category: "concept",
    author: "press.and.fold",
    tagline: "Layered paper depth with real cast shadows between planes.",
    triggerWords: ["cut paper diorama", "layered paper shadow"],
    tags: ["craft", "material", "depth"],
    compatible: ["XL"],
    defaultStrength: 0.7,
    downloads: 44017,
    hue: 12,
  },
  {
    id: "lora-orbital",
    name: "Orbital Agriculture",
    category: "concept",
    author: "atlas.void",
    tagline: "Ring-station farmland curving overhead. Handles the horizon bend correctly.",
    triggerWords: ["orbital ring farmland", "curved horizon"],
    tags: ["scifi", "environment", "hopeful"],
    compatible: ["XL"],
    defaultStrength: 0.78,
    downloads: 33871,
    hue: 84,
  },
  {
    id: "lora-storm-glass",
    name: "Storm Glass",
    category: "concept",
    author: "nightshift",
    tagline: "Rain on glass between viewer and subject. Focus falls off convincingly.",
    triggerWords: ["rain on glass", "shallow focus through window"],
    tags: ["lighting", "atmosphere", "portrait"],
    compatible: ["XL", "Compact"],
    defaultStrength: 0.62,
    downloads: 99460,
    hue: 200,
  },
];

/* ── procedural tail ────────────────────────────────────────────────────────────
 *
 * A real registry holds hundreds per category, and a browse surface designed against
 * twenty is a browse surface that has never met its own problem: reels wind forever,
 * "see all" means nothing, and no facet ever earns its place. The tail below fabricates
 * enough plausible volume to design against. It is deterministic — the same name, hue,
 * download count and age every load — so screenshots and reviews are comparable.
 *
 * All of it disappears the day the Laravel catalog endpoint lands.
 */

const PER_CATEGORY = 104;

const NAME_PARTS: Record<LoraCategory, [string[], string[]]> = {
  character: [
    ["Wren", "Cass", "Orrin", "Junco", "Sable", "Vesper", "Fen", "Marlow", "Bramble", "Quill",
     "Ada", "Rook", "Tam", "Pell", "Isolde", "Garrick", "Nim", "Ravel", "Sorrel", "Thane",
     "Lucia", "Odile", "Brann", "Mireille", "Hollis", "Yara"],
    ["Halloway", "Tide", "Vance", "of the Ninth", "Quill", "Ashgrove", "Marrow", "Sterling",
     "Fairweather", "Nine", "the Lesser", "Blackwood", "Reyes", "Underhill", "Voss", "Wilde"],
  ],
  style: [
    ["Heavy", "Soft", "Cracked", "Bleached", "Wet", "Cold", "Burnt", "Flat", "Loose", "Fine",
     "Coarse", "Bright", "Muted", "Raw", "Pressed", "Torn", "Late", "Early", "High", "Low"],
    ["Graphite", "Gouache", "Riso", "Cel", "Etching", "Halftone", "Lacquer", "Woodcut",
     "Airbrush", "Tempera", "Screenprint", "Charcoal", "Linocut", "Ink Wash", "Impasto",
     "Photostat", "Mezzotint", "Silverpoint"],
  ],
  concept: [
    ["Storm", "Salt", "Iron", "Dust", "Amber", "Fog", "Glass", "Ember", "Tide", "Frost",
     "Copper", "Moss", "Static", "Cinder", "Marble", "Rain", "Neon", "Chalk", "Pitch", "Silt"],
    ["Glass", "Bloom", "Hour", "Field", "Lattice", "Drift", "Vault", "Corridor", "Shelf",
     "Weather", "Interior", "Horizon", "Grain", "Fracture", "Canopy", "Threshold"],
  ],
};

const TAG_BANK: Record<LoraCategory, string[]> = {
  character: ["original", "fantasy", "scifi", "portrait", "creature", "armor", "modern",
    "gothic", "comic", "action", "android", "witch", "knight", "scholar", "coastal"],
  style: ["print", "retro", "painterly", "monochrome", "traditional", "animation", "sketch",
    "duotone", "glitch", "ornate", "craft", "analog", "technical", "luxury"],
  concept: ["environment", "lighting", "atmosphere", "material", "architecture", "nature",
    "depth", "melancholy", "hopeful", "steampunk", "scifi", "retro", "modern"],
};

const AUTHORS = ["atlas.void", "pale.engine", "cinder.works", "nightshift", "saltflat",
  "press.and.fold", "longwater", "tin.roof", "seventh.pass", "marrow.lab", "quietfield",
  "north.of.here", "bad.weather", "flat.iron", "index.card"];

const TAGLINE: Record<LoraCategory, string[]> = {
  character: [
    "Holds a consistent face across angles and lighting.",
    "Built for expressive close-ups; costume stays stable.",
    "Strong on hands and silhouette, forgiving at low strength.",
    "Reads the same in a crowd shot as in a portrait.",
  ],
  style: [
    "Keeps its texture without smearing fine detail.",
    "Stacks cleanly on top of a character LoRA.",
    "Holds its palette even when the prompt fights it.",
    "Heavier at full strength than the preview suggests.",
  ],
  concept: [
    "A condition rather than a subject — put anything inside it.",
    "Changes the light, leaves the subject alone.",
    "Surfaces and materials, not composition.",
    "Works best when the prompt names a place.",
  ],
};

function hash(n: number) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Deterministic 0..1 from an index and a channel, so each field varies independently. */
const rand = (i: number, channel: number) => hash(i * 31 + channel * 7919) / 4294967296;
const pickFrom = <T,>(pool: T[], i: number, channel: number) =>
  pool[Math.floor(rand(i, channel) * pool.length)];

function synthesize(category: LoraCategory, index: number): Lora {
  const [heads, tails] = NAME_PARTS[category];
  const head = heads[index % heads.length];
  const tail = tails[hash(index * 7 + 3) % tails.length];
  const name = `${head} ${tail}`;
  const bank = TAG_BANK[category];

  const tags = Array.from(
    new Set([
      pickFrom(bank, index, 2),
      pickFrom(bank, index, 3),
      pickFrom(bank, index, 4),
    ])
  );

  // Long-tail distribution: a handful of runaway hits, most in the low thousands.
  const pop = rand(index, 5);
  const downloads = Math.round(200 + Math.pow(pop, 7) * 340_000 + pop * 4_000);

  return {
    id: `lora-${category}-${index}`,
    name,
    category,
    author: pickFrom(AUTHORS, index, 6),
    tagline: pickFrom(TAGLINE[category], index, 7),
    triggerWords: [name.toLowerCase(), `${pickFrom(bank, index, 2)} ${head.toLowerCase()}`],
    tags,
    // Three-way, because a two-way split where everything lists XL makes the "runs on
    // <checkpoint>" filter a no-op for three of the four checkpoints — the control looks
    // live and removes nothing.
    compatible:
      rand(index, 8) > 0.82 ? ["Compact"] : rand(index, 8) > 0.55 ? ["XL", "Compact"] : ["XL"],
    defaultStrength: Math.round((0.55 + rand(index, 9) * 0.4) * 100) / 100,
    downloads,
    ageDays: Math.round(1 + Math.pow(rand(index, 10), 1.6) * 900),
    // Taken straight off the hash rather than through rand(), which correlates enough
    // with the popularity channel that the whole "most used" shelf came out green.
    hue: hash(index * 2654435761 + 7) % 360,
  };
}

export const LORAS: Lora[] = [
  // Authored entries get spread ages so they aren't all bunched in one shelf.
  ...AUTHORED.map((lora, i) => ({ ...lora, ageDays: 3 + i * 17 })),
  ...(["character", "style", "concept"] as LoraCategory[]).flatMap((category) =>
    Array.from({ length: PER_CATEGORY }, (_, i) => synthesize(category, i))
  ),
];

export const CATEGORY_LABEL: Record<LoraCategory, string> = {
  character: "characters",
  style: "styles",
  concept: "concepts",
};

export const CATEGORY_BLURB: Record<LoraCategory, string> = {
  character: "A person or creature the model will keep consistent across every generation.",
  style: "How it looks — medium, process, era. Stacks on top of a character.",
  concept: "A setting, material, or lighting condition rather than a subject.",
};

export const CATEGORY_ORDER: LoraCategory[] = ["character", "style", "concept"];

export function lorasByCategory(category: LoraCategory): Lora[] {
  return LORAS.filter((l) => l.category === category);
}

/**
 * What a LoRA's preview picture should be a picture *of*.
 *
 * A character LoRA whose preview is a landscape is a broken promise on every surface it
 * appears — the catalogue tile, the loaded strip, the chat avatar. Styles and concepts
 * have no such constraint; they can legitimately be anything.
 */
export function previewSubject(lora: Lora): StockSubject | undefined {
  return lora.category === "character" ? "portrait" : undefined;
}

export function findLora(id: string | null): Lora | null {
  if (!id) return null;
  return LORAS.find((l) => l.id === id) ?? null;
}

export function findCheckpoint(id: string | null): Checkpoint | null {
  if (!id) return null;
  return CHECKPOINTS.find((c) => c.id === id) ?? null;
}

/** Matches a LoRA against a free-text query over name, tags, author and tagline. */
export function matchesQuery(lora: Lora, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    lora.name.toLowerCase().includes(q) ||
    lora.author.toLowerCase().includes(q) ||
    lora.tagline.toLowerCase().includes(q) ||
    lora.tags.some((t) => t.includes(q)) ||
    lora.triggerWords.some((t) => t.includes(q))
  );
}

export function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export function formatAge(days: number): string {
  if (days < 1) return "today";
  if (days < 7) return `${Math.round(days)}d`;
  if (days < 60) return `${Math.round(days / 7)}w`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

/* ── narrowing ──────────────────────────────────────────────────────────────── */

/**
 * How a shelf decides which handful of a few hundred to show.
 *
 * The rule is named on the surface and switchable by the visitor, because an unexplained
 * "here are twelve of two hundred" is worse than the full list — it looks arbitrary, and
 * the visitor can't tell what they're missing.
 */
export type ShelfRule = "popular" | "new" | "hidden";

export const SHELF_RULES: { key: ShelfRule; label: string; note: string }[] = [
  { key: "popular", label: "most used", note: "highest download count" },
  { key: "new", label: "newest", note: "most recently published" },
  { key: "hidden", label: "overlooked", note: "recent, but barely downloaded yet" },
];

export interface CatalogFilter {
  query: string;
  /** Tag facets, ANDed — a LoRA must carry every selected tag. */
  tags: string[];
  /** Checkpoint family to restrict to, or null for no compatibility filter. */
  family: string | null;
}

export function filterLoras(loras: Lora[], filter: CatalogFilter): Lora[] {
  return loras.filter(
    (lora) =>
      matchesQuery(lora, filter.query) &&
      filter.tags.every((t) => lora.tags.includes(t)) &&
      (filter.family === null || lora.compatible.includes(filter.family))
  );
}

export function sortByRule(loras: Lora[], rule: ShelfRule): Lora[] {
  const sorted = [...loras];
  switch (rule) {
    case "new":
      return sorted.sort((a, b) => a.ageDays - b.ageDays);
    case "hidden":
      // Under-noticed rather than merely unpopular: recent *and* low uptake. Without the
      // recency term this shelf is just a graveyard of things nobody ever wanted.
      return sorted.sort(
        (a, b) => a.downloads * (1 + a.ageDays / 120) - b.downloads * (1 + b.ageDays / 120)
      );
    default:
      return sorted.sort((a, b) => b.downloads - a.downloads);
  }
}

export interface TagFacet {
  tag: string;
  count: number;
}

/** Tag facets over an arbitrary subset, most common first. */
export function tagFacets(loras: Lora[]): TagFacet[] {
  const counts = new Map<string, number>();
  for (const lora of loras) {
    for (const tag of lora.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
