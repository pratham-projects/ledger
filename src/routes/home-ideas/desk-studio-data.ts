/**
 * The token model for the Desk Studio — the shadcn-`/create`-style live customizer.
 *
 * Every option here is a real, already-loaded value: the six colour themes are the exact
 * token sets the six `/home-ideas/*` worlds ship (see `styles/home-ideas.css`), and the
 * four font trios draw only from faces already requested by that stylesheet's `@import`
 * lines. Nothing new is fetched — flipping an option in the sidebar can never cause a
 * layout shift while a font loads in.
 *
 * A trio is at most three families (display / body / data), per the brief: each face
 * carries exactly one of the three importance tiers a page actually has — the headline,
 * the sentence, and the number — rather than one face doing every job.
 */

export interface StudioTheme {
  id: string;
  name: string;
  note: string;
  swatch: [string, string, string];
  vars: Record<string, string>;
}

export const THEMES: StudioTheme[] = [
  {
    id: "desk",
    name: "Ember Plum",
    note: "Desk's own room — warm plum-brown ground, peach action.",
    swatch: ["#1a1216", "#33232b", "#ff9b78"],
    vars: {
      "--bg": "#1a1216",
      "--panel": "#271b21",
      "--panel-2": "#201519",
      "--raised": "#33232b",
      "--border": "#402c36",
      "--border-2": "#573c49",
      "--text": "#fdf6f3",
      "--muted": "#ddc4c9",
      "--muted-2": "#bfa2aa",
      "--accent": "#ff9b78",
      "--on-accent": "#2b1007",
      "--hot": "#ff8fb1",
      "--cool": "#6fd0e8",
      "--green": "#52d99a",
      "--amber": "#f5b84e",
      "--red": "#ff6b6b",
    },
  },
  {
    id: "bill",
    name: "Midnight Playbill",
    note: "Drenched navy ink, the way a theatre bill is printed.",
    swatch: ["#101c3a", "#16264c", "#f0c25e"],
    vars: {
      "--bg": "#101c3a",
      "--panel": "#16264c",
      "--panel-2": "#0d1830",
      "--raised": "#1e3160",
      "--border": "#2b447d",
      "--border-2": "#3f5ea3",
      "--text": "#fdf6e6",
      "--muted": "#dcc9a8",
      "--muted-2": "#bfa87f",
      "--accent": "#f0c25e",
      "--on-accent": "#1a1102",
      "--hot": "#e8785c",
      "--cool": "#8fbce8",
      "--green": "#7fce9a",
      "--amber": "#f0c25e",
      "--red": "#e8788a",
    },
  },
  {
    id: "workbench",
    name: "Graphite Bench",
    note: "Equipment-grade neutrals, amber signal.",
    swatch: ["#111418", "#1a1f25", "#f3b43f"],
    vars: {
      "--bg": "#111418",
      "--panel": "#1a1f25",
      "--panel-2": "#0d1013",
      "--raised": "#242b33",
      "--border": "#303841",
      "--border-2": "#495563",
      "--text": "#f4f7f8",
      "--muted": "#c1cad0",
      "--muted-2": "#96a4ad",
      "--accent": "#f3b43f",
      "--on-accent": "#191105",
      "--hot": "#ff745c",
      "--cool": "#64b7ff",
      "--green": "#66d39a",
      "--amber": "#f3b43f",
      "--red": "#ff7684",
    },
  },
  {
    id: "studio",
    name: "Aubergine Lime",
    note: "A quiet image studio at night — acid lime signal.",
    swatch: ["#17151c", "#25212b", "#b9f36b"],
    vars: {
      "--bg": "#17151c",
      "--panel": "#25212b",
      "--panel-2": "#111016",
      "--raised": "#302a38",
      "--border": "#393240",
      "--border-2": "#554b5e",
      "--text": "#fff9f2",
      "--muted": "#d8cbd6",
      "--muted-2": "#ad9ca9",
      "--accent": "#b9f36b",
      "--on-accent": "#172006",
      "--hot": "#ff7f73",
      "--cool": "#8cb8ff",
      "--green": "#b9f36b",
      "--amber": "#ffc35c",
      "--red": "#ff788d",
    },
  },
  {
    id: "poster",
    name: "Crimson Street",
    note: "Two-colour street poster — crimson ground, signal yellow.",
    swatch: ["#441226", "#571831", "#ffe45e"],
    vars: {
      "--bg": "#441226",
      "--panel": "#571831",
      "--panel-2": "#320c1b",
      "--raised": "#681d3a",
      "--border": "#8a3150",
      "--border-2": "#b34869",
      "--text": "#fff8e8",
      "--muted": "#f1cfd2",
      "--muted-2": "#dba7ad",
      "--accent": "#ffe45e",
      "--on-accent": "#291c00",
      "--hot": "#ff805e",
      "--cool": "#8ed8ff",
      "--green": "#8fe497",
      "--amber": "#ffe45e",
      "--red": "#ff8791",
    },
  },
  {
    id: "program",
    name: "Forest Programme",
    note: "A season programme printed on deep green stock, gold ink.",
    swatch: ["#14251f", "#1b3029", "#efb55f"],
    vars: {
      "--bg": "#14251f",
      "--panel": "#1b3029",
      "--panel-2": "#0e1c17",
      "--raised": "#254138",
      "--border": "#355b4e",
      "--border-2": "#56816f",
      "--text": "#fff8e8",
      "--muted": "#d9d4bd",
      "--muted-2": "#b7b39e",
      "--accent": "#efb55f",
      "--on-accent": "#261701",
      "--hot": "#e57c64",
      "--cool": "#83b9e8",
      "--green": "#8bc993",
      "--amber": "#efb55f",
      "--red": "#e67f8a",
    },
  },
];

export interface FontTrio {
  id: string;
  name: string;
  note: string;
  /** The headline / poster tier. */
  display: string;
  displayWeight: number;
  /** The sentence / control tier. */
  body: string;
  /** The number / label / timestamp tier. */
  data: string;
  /** Preview strings, so the sidebar can show the trio without switching to it. */
  sample: { display: string; body: string; data: string };
}

export const FONT_TRIOS: FontTrio[] = [
  {
    id: "grotesk",
    name: "Ledger Grotesk",
    note: "Bricolage Grotesque · Figtree · DM Mono",
    display: "'Bricolage Grotesque', 'Figtree', system-ui, sans-serif",
    displayWeight: 800,
    body: "'Figtree', system-ui, sans-serif",
    data: "'DM Mono', ui-monospace, 'SF Mono', monospace",
    sample: { display: "One line in.", body: "Write it once, use it everywhere.", data: "2–3 CR · 1024×1024" },
  },
  {
    id: "editorial",
    name: "Editorial Serif",
    note: "Bodoni Moda · Public Sans · Archivo",
    display: "'Bodoni Moda', Georgia, serif",
    displayWeight: 800,
    body: "'Public Sans', system-ui, sans-serif",
    data: "'Archivo', system-ui, sans-serif",
    sample: { display: "One line in.", body: "Write it once, use it everywhere.", data: "2–3 CR · 1024×1024" },
  },
  {
    id: "condensed",
    name: "Condensed Trade",
    note: "Barlow Condensed · Public Sans",
    display: "'Barlow Condensed', 'Arial Narrow', sans-serif",
    displayWeight: 900,
    body: "'Public Sans', system-ui, sans-serif",
    data: "'Public Sans', system-ui, sans-serif",
    sample: { display: "One line in.", body: "Write it once, use it everywhere.", data: "2–3 CR · 1024×1024" },
  },
  {
    id: "playbill",
    name: "Playbill Grotesk",
    note: "Archivo Black · Archivo",
    display: "'Archivo Black', 'Archivo', sans-serif",
    displayWeight: 900,
    body: "'Archivo', system-ui, sans-serif",
    data: "'Archivo', system-ui, sans-serif",
    sample: { display: "One line in.", body: "Write it once, use it everywhere.", data: "2–3 CR · 1024×1024" },
  },
];

export interface RadiusOption {
  id: string;
  name: string;
  px: number;
}

export const RADII: RadiusOption[] = [
  { id: "sharp", name: "Sharp", px: 0 },
  { id: "trim", name: "Trim", px: 4 },
  { id: "soft", name: "Soft", px: 10 },
  { id: "round", name: "Round", px: 16 },
  { id: "pill", name: "Pill", px: 26 },
];

export interface SurfaceOption {
  id: "flat" | "glass";
  name: string;
  note: string;
}

export const SURFACES: SurfaceOption[] = [
  { id: "flat", name: "Flat", note: "Solid panels, hard edges — the Ledger default." },
  { id: "glass", name: "Glass", note: "Frosted, translucent panels over the wall." },
];

export interface MotionOption {
  id: "calm" | "standard" | "lively";
  name: string;
  note: string;
}

export const MOTION_OPTIONS: MotionOption[] = [
  { id: "calm", name: "Calm", note: "A short fade. Almost no travel." },
  { id: "standard", name: "Standard", note: "De-noise on scroll — the Ledger default." },
  { id: "lively", name: "Lively", note: "More travel, more blur-clear, staggered harder." },
];

export interface IconWeightOption {
  id: string;
  name: string;
  stroke: number;
}

export const ICON_WEIGHTS: IconWeightOption[] = [
  { id: "thin", name: "Thin", stroke: 1.25 },
  { id: "regular", name: "Regular", stroke: 1.75 },
  { id: "bold", name: "Bold", stroke: 2.5 },
];

export interface StudioSettings {
  themeId: string;
  fontId: string;
  radiusId: string;
  surfaceId: SurfaceOption["id"];
  motionId: MotionOption["id"];
  iconWeightId: string;
}

/** Mirrors what actually ships at `/home-ideas/desk` — see the locked-preset note atop
 *  `.desk` in `home-ideas.css`. Keep these two in sync by hand; there is no single
 *  source shared between a static CSS scope and this editor's runtime state. */
export const DEFAULT_SETTINGS: StudioSettings = {
  themeId: "studio",
  fontId: "grotesk",
  radiusId: "trim",
  surfaceId: "glass",
  motionId: "standard",
  iconWeightId: "regular",
};

export interface StudioPreset {
  id: string;
  name: string;
  note: string;
  settings: StudioSettings;
}

/** Named bundles — a starting point, not a limit; every axis stays independently editable. */
export const BUILT_IN_PRESETS: StudioPreset[] = [
  {
    id: "studio-glass",
    name: "Studio Glass",
    note: "The shipped Desk room, unmodified.",
    settings: { themeId: "studio", fontId: "grotesk", radiusId: "trim", surfaceId: "glass", motionId: "standard", iconWeightId: "regular" },
  },
  {
    id: "ember-glass",
    name: "Ember Glass",
    note: "The earlier Desk room, before the studio pass — kept as a reference point.",
    settings: { themeId: "desk", fontId: "grotesk", radiusId: "round", surfaceId: "glass", motionId: "standard", iconWeightId: "regular" },
  },
  {
    id: "playbill-flat",
    name: "Midnight Playbill",
    note: "Sharp corners, drenched navy, a true Didone headline.",
    settings: { themeId: "bill", fontId: "editorial", radiusId: "sharp", surfaceId: "flat", motionId: "calm", iconWeightId: "thin" },
  },
  {
    id: "bench-trim",
    name: "Graphite Bench",
    note: "Equipment-grade: condensed caps, trimmed corners, bold icons.",
    settings: { themeId: "workbench", fontId: "condensed", radiusId: "trim", surfaceId: "flat", motionId: "lively", iconWeightId: "bold" },
  },
  {
    id: "street-pill",
    name: "Crimson Street",
    note: "Poster energy — full pill radius, heavyweight display.",
    settings: { themeId: "poster", fontId: "playbill", radiusId: "pill", surfaceId: "glass", motionId: "lively", iconWeightId: "bold" },
  },
  {
    id: "studio-soft",
    name: "Aubergine Lime, Softer",
    note: "Same palette as the shipped room, rounder corners and calmer motion.",
    settings: { themeId: "studio", fontId: "grotesk", radiusId: "soft", surfaceId: "glass", motionId: "calm", iconWeightId: "regular" },
  },
];

export function themeById(id: string): StudioTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function fontById(id: string): FontTrio {
  return FONT_TRIOS.find((f) => f.id === id) ?? FONT_TRIOS[0];
}

export function radiusById(id: string): RadiusOption {
  return RADII.find((r) => r.id === id) ?? RADII[0];
}

export function surfaceById(id: string): SurfaceOption {
  return SURFACES.find((s) => s.id === id) ?? SURFACES[0];
}

export function motionById(id: string): MotionOption {
  return MOTION_OPTIONS.find((m) => m.id === id) ?? MOTION_OPTIONS[0];
}

export function iconWeightById(id: string): IconWeightOption {
  return ICON_WEIGHTS.find((w) => w.id === id) ?? ICON_WEIGHTS[1];
}

/** The full CSS custom-property block a chosen combination resolves to — for "Get code". */
export function settingsToCss(settings: StudioSettings): string {
  const theme = themeById(settings.themeId);
  const font = fontById(settings.fontId);
  const radius = radiusById(settings.radiusId);
  const lines = [
    ...Object.entries(theme.vars).map(([k, v]) => `  ${k}: ${v};`),
    `  --radius: ${radius.px}px;`,
    `  --font-display: ${font.display};`,
    `  --font-display-weight: ${font.displayWeight};`,
    `  --font-sans: ${font.body};`,
    `  --font-mono: ${font.data};`,
  ];
  return `.studio-theme {\n${lines.join("\n")}\n}`;
}

export function randomSettings(exclude?: StudioSettings): StudioSettings {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  let next: StudioSettings;
  do {
    next = {
      themeId: pick(THEMES).id,
      fontId: pick(FONT_TRIOS).id,
      radiusId: pick(RADII).id,
      surfaceId: pick(SURFACES).id,
      motionId: pick(MOTION_OPTIONS).id,
      iconWeightId: pick(ICON_WEIGHTS).id,
    };
  } while (exclude && JSON.stringify(next) === JSON.stringify(exclude));
  return next;
}
