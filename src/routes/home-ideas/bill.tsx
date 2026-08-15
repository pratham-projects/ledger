import * as React from "react";
import { Link } from "react-router-dom";
import type { Checkpoint, Lora } from "@/lib/catalog";
import { stockFor, stockRun } from "@/lib/stock";
import { facts, TOOLS } from "./facts";
import { Disclosure } from "./frame";
import {
  LoraPicker,
  ModelPicker,
  PalettePicker,
  useIdeaSelection,
  type IdeaTheme,
} from "./shared";

/**
 * IDEA 5 — BILL
 *
 * THESIS: a playbill, drenched in ink. The model you load is a billed performer and the
 * five tools are its season. Refuses photography as the hero — on this page the type *is*
 * the image, at poster scale — which also makes it the only one of the five that stays
 * legible before a single picture has downloaded, and the highest-contrast of the set by
 * construction.
 *
 * OWN-WORLD: one saturated ink field (#101c3a) across the whole page, the way Hermes
 * drenches its blue, with warm cream ink (#fdf6e6) and gold for the billing. Bodoni Moda —
 * a real Didone with optical sizes, so it holds its hairlines at 6rem and thickens
 * correctly at 14px — carries every billed line; Archivo carries the small chrome. Zero
 * radius. The component grammar is three rule weights, hair / medium / fat, because rule
 * weight is how a printed bill has always carried hierarchy. A low-amplitude paper tooth
 * keeps the ink field from reading as a flat digital plane.
 *
 * STORY: the visitor reads a bill. Who is playing, in what, and what admission costs. The
 * running order tells them there are five productions and one company; the terms at the
 * foot tell them it is free.
 *
 * FIRST VIEWPORT: centred, symmetrical. Company line in small caps, fat gold rule, the
 * performer's name at the largest size on any of the five pages, the character note, then
 * the running order beginning above the fold.
 *
 * FORM: casting bill / playbill, staged as a centred printed sheet rather than a scrolling
 * document. Production numerals are native to the form and carry running order, which is
 * the one thing on the page a reader genuinely needs sequenced.
 */

const ROMAN = ["I", "II", "III", "IV", "V"];

const BILL_THEMES: IdeaTheme[] = [
  {
    id: "royal",
    name: "Royal",
    note: "Indigo ink with warm gold billing.",
    swatch: ["#101c3a", "#1e3160", "#f0c25e"],
    style: {
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
    },
  },
  {
    id: "vermilion",
    name: "Vermilion",
    note: "Theatre red with a cool mint bill.",
    swatch: ["#401315", "#702327", "#aee4cb"],
    style: {
      "--bg": "#401315",
      "--panel": "#551a1d",
      "--panel-2": "#2e0d0f",
      "--raised": "#702327",
      "--border": "#8f383b",
      "--border-2": "#b55356",
      "--text": "#fff8eb",
      "--muted": "#ebd1c1",
      "--muted-2": "#c8a89a",
      "--accent": "#aee4cb",
      "--on-accent": "#0b241b",
    },
  },
  {
    id: "forest",
    name: "Forest",
    note: "Deep green ink with tangerine billing.",
    swatch: ["#132a23", "#24493d", "#ffad68"],
    style: {
      "--bg": "#132a23",
      "--panel": "#1b382f",
      "--panel-2": "#0d1e19",
      "--raised": "#24493d",
      "--border": "#376456",
      "--border-2": "#548777",
      "--text": "#fff8e9",
      "--muted": "#d7d6bb",
      "--muted-2": "#afb399",
      "--accent": "#ffad68",
      "--on-accent": "#2b1403",
    },
  },
];

export function IdeaBill() {
  const { checkpoint: model, activeLora: face } = useIdeaSelection();
  const [themeId, setThemeId] = React.useState(BILL_THEMES[0].id);
  const theme =
    BILL_THEMES.find((item) => item.id === themeId) ?? BILL_THEMES[0];

  return (
    <div
      className="idea-bill-paper flex min-h-[100dvh] flex-col"
      style={theme.style}
    >
      <div className="mx-auto w-full max-w-[1080px] flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 flex justify-end">
          <PalettePicker
            themes={BILL_THEMES}
            active={themeId}
            onChange={setThemeId}
            label="Ink"
          />
        </div>
        <Company />
        <Billing face={face} model={model} />
        <LoraPicker
          className="idea-bill-catalog"
          heading="The company"
          intro="Tap a performer to rewrite the billing across this page and all five tools."
        />
        <ModelPicker
          className="idea-bill-catalog"
          heading="The production house"
          intro="Choose the base model that renders the whole season."
        />
        <RunningOrder face={face.name} />
        <Company2 />
        <Admission />
      </div>
      <Foot />
    </div>
  );
}

/* ── the company line ─────────────────────────────────────────────────── */

function Company() {
  return (
    <header className="idea-rise text-center">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-sans text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-muted-2">
          Nightly · No booking
        </p>
        <Link
          to="/home#catalog"
          className="font-sans text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-muted-2 transition-colors hover:text-accent"
        >
          Log in
        </Link>
      </div>

      <div className="idea-bill-rule-fat mt-3" />

      <h1 className="mt-5 font-display text-[clamp(1.5rem,4vw,2.3rem)] font-medium uppercase leading-none tracking-[0.24em]">
        {facts.wordmark}
      </h1>

      <p className="mt-3 font-sans text-[12.5px] font-bold uppercase tracking-[0.2em] text-accent">
        Free admission · {facts.freeCap} credits, refilling every {facts.refillHours} hours
      </p>

      <div className="idea-bill-rule-hair mt-5" />
    </header>
  );
}

/* ── the billing ──────────────────────────────────────────────────────── */

function Billing({
  face,
  model,
}: {
  face: Lora;
  model: Checkpoint;
}) {
  /**
   * A playbill carries an engraved likeness, small and centred, never a photograph at hero
   * scale — the name is the hero.
   *
   * Seeded separately from the catalogue thumbnail: `stockFor(face.id, "portrait")` draws a
   * motion-blurred frame for this character, which survives being 58px wide in a picker but
   * falls apart when it is the only photograph on the page and is being asked to read as an
   * engraving. A different seed against the same pool gets a still, frontal face.
   */
  const likeness = stockFor(`${face.id}-likeness`, "portrait");

  return (
    <section className="idea-rise-2 pt-9 text-center">
      <p className="font-display text-[17px] font-medium italic tracking-[0.02em] text-ink-muted">
        this season, starring
      </p>

      <img
        src={likeness.src(320)}
        srcSet={likeness.srcSet}
        sizes="132px"
        alt={`${face.name}, the loaded character model`}
        loading="eager"
        decoding="async"
        className="mx-auto mt-5 h-[168px] w-[132px] object-cover object-top grayscale-[0.35] sepia-[0.12]"
        style={{ boxShadow: "0 10px 30px -12px rgba(0,0,0,0.7)" }}
      />

      <h2
        className="mt-6 font-display font-black uppercase leading-[0.88] tracking-[-0.02em]"
        style={{ fontSize: "clamp(2.6rem, 8.4vw, 5.6rem)" }}
      >
        {face.name}
      </h2>

      <p className="mx-auto mt-5 max-w-[52ch] font-display text-[19px] font-medium leading-[1.5] text-ink">
        {face.tagline}
      </p>

      <p className="mt-4 font-sans text-[13px] font-bold uppercase tracking-[0.16em] text-ink-muted-2">
        Character model by {face.author} · rendered on {model.name}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/image"
          className="bg-accent px-6 py-3.5 font-sans text-[14px] font-bold uppercase tracking-[0.1em] text-[var(--on-accent)] transition-transform hover:-translate-y-px"
        >
          Cast {face.name.split(" ")[0]}
        </Link>
        <Link
          to="/home#catalog"
          className="border-2 border-border-2 px-5 py-3 font-sans text-[14px] font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:border-accent hover:text-accent"
        >
          See the other {facts.loraCount - 1}
        </Link>
      </div>
    </section>
  );
}

/* ── the running order ────────────────────────────────────────────────── */

function RunningOrder({ face }: { face: string }) {
  const first = face.split(" ")[0];

  return (
    <section className="idea-rise-3 pt-14">
      <div className="idea-bill-rule-med" />
      <h3 className="py-4 text-center font-display text-[clamp(1.35rem,3.4vw,1.85rem)] font-medium uppercase tracking-[0.12em]">
        In five productions
      </h3>
      <div className="idea-bill-rule-med" />

      <p className="py-4 text-center font-sans text-[14px] leading-[1.6] text-ink-muted">
        {first} appears in all five. Cast once at the door — nothing is arranged twice.
      </p>

      <ol>
        {TOOLS.map((t, i) => (
          <li key={t.id} className="idea-bill-rule-hair">
            <Link
              to={t.href}
              className="group grid grid-cols-[38px_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 py-6 sm:grid-cols-[46px_minmax(0,1fr)_auto] sm:gap-x-6"
            >
              <span className="font-display text-[19px] font-medium italic text-ink-muted-2">
                {ROMAN[i]}.
              </span>

              <span className="min-w-0">
                <span className="idea-bill-billed inline-block font-display text-[clamp(1.5rem,4.2vw,2.35rem)] font-black uppercase leading-[0.98] tracking-[-0.01em]">
                  {t.name}
                </span>
                <span className="mt-2 block max-w-[54ch] font-display text-[17px] font-medium leading-[1.5] text-ink">
                  {t.blurb}
                </span>
                <span className="mt-2 block font-sans text-[12.5px] font-bold uppercase tracking-[0.1em] text-accent sm:hidden">
                  {t.action} → · <span className="text-ink-muted-2">{t.cost}</span>
                </span>
              </span>

              <span className="hidden shrink-0 text-right sm:block">
                <span className="block font-sans text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted-2">
                  {t.cost}
                </span>
                <span className="mt-1.5 block font-sans text-[13px] font-bold uppercase tracking-[0.14em] text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {t.action} →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="idea-bill-rule-med" />
    </section>
  );
}

/* ── the company, illustrated ─────────────────────────────────────────── */

/**
 * The one place this world shows work at any size.
 *
 * A bill's foot carries a strip of engraved scenes from the season, and that is the honest
 * amount of imagery for a page whose thesis is that the type is the image. Enough to prove
 * this is a picture product; not enough to become the hero and turn the page into every
 * other landing page in the category.
 */
function Company2() {
  const plates = React.useMemo(() => stockRun("bill-plates", 6, "scene"), []);

  return (
    <section className="pt-12">
      <h3 className="text-center font-sans text-[12.5px] font-bold uppercase tracking-[0.2em] text-ink-muted-2">
        Scenes from the season
      </h3>
      <div className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {plates.map((p, i) => (
          <img
            key={p.id + i}
            src={p.src(320)}
            srcSet={p.srcSet}
            sizes="(min-width: 640px) 14vw, 30vw"
            alt=""
            loading="eager"
            decoding="async"
            className="aspect-[3/4] w-full object-cover grayscale-[0.28] sepia-[0.1]"
          />
        ))}
      </div>
      <Disclosure className="mt-3 text-center" />
    </section>
  );
}

/* ── admission ────────────────────────────────────────────────────────── */

function Admission() {
  return (
    <section className="pt-12">
      <div className="idea-bill-rule-fat" />
      <h3 className="py-4 text-center font-display text-[clamp(1.35rem,3.4vw,1.85rem)] font-medium uppercase tracking-[0.12em]">
        Admission
      </h3>
      <div className="idea-bill-rule-hair" />

      <dl className="grid gap-x-8 gap-y-5 py-7 sm:grid-cols-3">
        <Term term="Free, no card">
          {facts.freeCap} credits to start. They refill on their own every{" "}
          {facts.refillHours} hours.
        </Term>
        <Term term="If you run dry">
          Wait for the refill, watch an ad for +{facts.adReward}, or buy more. Bought
          credits sit above the free cap and are never removed.
        </Term>
        <Term term={`Pictures keep for ${facts.expiryMonths} months`}>
          Then they're deleted from the server. Your account, prompts and conversations are
          kept indefinitely.
        </Term>
      </dl>

      <div className="idea-bill-rule-hair" />
      <p className="pt-5 text-center font-sans text-[13px] font-bold uppercase tracking-[0.16em] text-ink-muted-2">
        {facts.catalogNote}
      </p>
    </section>
  );
}

function Term({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-display text-[18px] font-black uppercase leading-[1.1] tracking-[-0.01em]">
        {term}
      </dt>
      <dd className="mt-2 font-sans text-[14px] leading-[1.6] text-ink-muted">
        {children}
      </dd>
    </div>
  );
}

function Foot() {
  return (
    <footer className="mt-6 border-t-2 border-border-2 px-5 py-6 text-center sm:px-8">
      <p className="font-display text-[15px] font-medium italic text-ink-muted">
        One face, five productions, one balance.
      </p>
    </footer>
  );
}
