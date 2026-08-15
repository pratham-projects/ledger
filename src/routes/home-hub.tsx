/**
 * THESIS: one place to stand. Before this the app asked you to choose a tool before it
 * told you what the tools were for, and hid the catalogue that gives all five of them a
 * subject on a page called `/browse` that nobody had a reason to open. The hub makes the
 * first screen a room: what you have loaded, what you could make with it, what other
 * people made, and the catalogue itself — all reachable without leaving.
 * OWN-WORLD: Desk. Every token comes from `:root`; this file adds layout and behaviour
 * only, and leans on `.desk-*` primitives for every surface it needs.
 * STORY: you arrive → you see your loaded model in the rail and in the composer → you
 * either type a line and pick a tool, take a starting point from the deck, or scroll into
 * the catalogue and change what is loaded.
 * FIRST VIEWPORT: the question, the five tools, the composer, and the deck of starting
 * points behind it. Nothing above the fold is an advertisement.
 * FORM: a permanent rail plus one scrolling column of bands, rather than a page per tool.
 */
import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Shuffle,
  X,
} from "lucide-react";
import { HubShell } from "@/components/hub/hub-shell";
import { CatalogSection } from "@/components/hub/catalog-section";
import { TemplateLightbox } from "@/components/hub/template-lightbox";
import { VideoTile } from "@/components/hub/video-tile";
import { StockFill } from "@/components/media/stock-fill";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelection } from "@/hooks/use-selection";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TOOLS, facts, type Tool } from "@/routes/home-ideas/facts";
import { CHECKPOINTS, LORAS, previewSubject, type Lora } from "@/lib/catalog";
import { stockFor } from "@/lib/stock";
import { VIDEO_LOOPS } from "@/components/home/video-ideas-section";
import { templatesFor, INSPIRATION_CATEGORIES, type Template } from "@/lib/templates";

/* ── what each tool asks for ──────────────────────────────────────────────── */

/**
 * The composer changes shape with the tool, because the five tools do not take the same
 * input. Only the controls a tool genuinely has are listed — no tool is given a knob here
 * that its own page does not have.
 */
interface ToolSetup {
  /** Completes "…and get {outcome}". Carries the headline's second line. */
  outcome: string;
  placeholder: string;
  /** Names what the one line *is* for this tool, for screen readers. */
  lineLabel: string;
  controls: { id: string; label: string; options: string[] }[];
  /** The one extra field a tool genuinely cannot start without. Image and video have none. */
  extra?: { id: string; label: string; placeholder: string };
  /** Three lines that are real starting points for this tool, offered in its menu. */
  starts: string[];
}

const SETUP: Record<string, ToolSetup> = {
  image: {
    outcome: "a picture.",
    placeholder: "A lantern-lit street after rain, seen from a doorway…",
    lineLabel: "Describe the picture",
    controls: [
      { id: "style", label: "Style", options: ["Photographic", "Illustrated", "Painterly", "Anime"] },
      { id: "shape", label: "Shape", options: ["Square", "Portrait", "Landscape", "Wide"] },
    ],
    starts: [
      "A portrait in hard afternoon light, shot on 50mm",
      "A quiet interior — dust in a shaft of sun",
      "A wide landscape at the last minute of dusk",
    ],
  },
  video: {
    outcome: "a few seconds of motion.",
    placeholder: "Slow push in on a window as the rain starts…",
    lineLabel: "Describe the shot",
    controls: [
      { id: "style", label: "Look", options: ["Cinematic", "Documentary", "Animated", "Handheld"] },
      { id: "length", label: "Length", options: ["3s", "5s", "8s"] },
      { id: "ratio", label: "Ratio", options: ["16:9", "9:16", "1:1"] },
    ],
    starts: [
      "A slow dolly through an empty train carriage",
      "Steam rising off a cup, locked-off camera",
      "A character turning to face the camera, once",
    ],
  },
  chat: {
    outcome: "someone to talk to.",
    placeholder: "She runs the last bookshop on the station and remembers every customer…",
    lineLabel: "Describe who they are",
    controls: [{ id: "tone", label: "Tone", options: ["Warm", "Dry", "Formal", "Playful"] }],
    extra: { id: "name", label: "Their name", placeholder: "Marrow" },
    starts: [
      "An archivist who answers only in questions",
      "A tired shopkeeper on the last night of a war",
      "A rival who is unfailingly polite about it",
    ],
  },
  rpg: {
    outcome: "a world to play in.",
    placeholder: "A drowned city where the tide only goes out once a year…",
    lineLabel: "Describe the world",
    controls: [
      { id: "world", label: "World", options: ["High fantasy", "Sci-fi", "Horror", "Mystery"] },
      { id: "class", label: "Class", options: ["Scout", "Scholar", "Soldier", "Thief"] },
    ],
    extra: { id: "inventory", label: "Starting inventory", placeholder: "A lamp, a knife, one match" },
    starts: [
      "A drowned city, and the tide is going out",
      "A frozen orbital station with one working door",
      "A border town at the storm's edge",
    ],
  },
  story: {
    outcome: "a chapter.",
    placeholder: "Two strangers agree to swap one memory each, once a year…",
    lineLabel: "Describe the plot",
    controls: [
      { id: "genre", label: "Genre", options: ["Literary", "Fantasy", "Sci-fi", "Mystery", "Romance"] },
    ],
    extra: { id: "cast", label: "Protagonists", placeholder: "Ines and Bo" },
    starts: [
      "Two strangers swap one memory a year",
      "A lighthouse keeper starts receiving her own letters",
      "The last train home is running an hour early",
    ],
  },
};

/* ── page ─────────────────────────────────────────────────────────────────── */

/**
 * `LeanLanding` (`/`) hands off here through router state — `{ tool, prompt }` — rather
 * than a query string, since neither needs to survive a reload or be link-shareable: it
 * is a one-time "continue what I was doing" handoff at the moment of navigation. Read
 * once with a lazy initializer so a later in-page tool switch isn't fighting stale state
 * on every render.
 */
interface HandOff {
  tool?: string;
  prompt?: string;
}

export function HomeHub() {
  const { lora, checkpoint } = useSelection();
  const location = useLocation();
  const handOff = (location.state ?? null) as HandOff | null;
  const [toolId, setToolId] = React.useState<string>(() =>
    handOff?.tool && TOOLS.some((t) => t.id === handOff.tool) ? handOff.tool : "image"
  );
  const [prompt, setPrompt] = React.useState(() => handOff?.prompt ?? "");
  const [params, setParams] = React.useState<Record<string, string>>({});
  const [extra, setExtra] = React.useState<Record<string, string>>({});
  const [viewing, setViewing] = React.useState<Lora | null>(null);

  const tool = TOOLS.find((t) => t.id === toolId) ?? TOOLS[0];
  const setup = SETUP[tool.id];

  /**
   * The deck draws from the whole catalogue rather than the six-strong featured cast. It
   * is a ring that wraps, and with six cards the wrap seam lands inside the visible
   * spread — a card would jump the width of the deck in front of the reader. Twenty puts
   * the seam well outside `DECK_REACH`.
   */
  const deck = LORAS;

  useHashScroll();

  /**
   * Below `lg` the bottom nav's `Inspire` tab is its own destination, not a scroll
   * position on the Home tab's page — landing on the composer, the deck and the model
   * row before you reach what you tapped for reads as "Inspire is broken, it opened
   * Home." `#insp` and every per-category anchor `Inspirations` renders (`#insp-<id>`)
   * both start with `insp`, so a visitor who taps "See all" on a category and then
   * backs out lands in the same trimmed view rather than the full page.
   *
   * `HomeHub` stays the one route both tabs point at — this only decides which of its
   * bands mount, the same route serving two shapes rather than a second page existing
   * for one of them.
   */
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const inspireOnly = isMobile && location.hash.startsWith("#insp");

  return (
    <>
      <HubShell label={inspireOnly ? "Inspire" : "Home"}>
        {inspireOnly ? (
          <Inspirations />
        ) : (
          <>
            <Hero
              tool={tool}
              setup={setup}
              onTool={setToolId}
              prompt={prompt}
              onPrompt={setPrompt}
              params={params}
              onParam={(id, value) => setParams((p) => ({ ...p, [id]: value }))}
              extra={extra}
              onExtra={(id, value) => setExtra((p) => ({ ...p, [id]: value }))}
              subject={lora}
              modelName={checkpoint.name}
              deck={deck}
              onOpen={setViewing}
            />

            <LatestModels />
            <Inspirations />
            <CatalogSection />
          </>
        )}
      </HubShell>

      {viewing && <Lightbox lora={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}

/**
 * Take the reader to `#catalog` when the URL asks for it.
 *
 * The browser only honours a hash on a real document load. Everything that used to point
 * at `/browse` is now a client-side navigation to `/#catalog` — the rail's Catalogue
 * item, the composer's "Change", the tool surfaces handing off mid-setup — and without
 * this they all appear to do nothing, because React Router changes the URL and leaves the
 * page exactly where it was.
 *
 * It fires more than once, on purpose. Everything above the catalogue — the deck, the
 * suite thumbnails, the model row — is images, and the page grows by hundreds of pixels
 * as they land. A single scroll measured on mount puts you well short of the target and
 * looks like the link half-worked. Re-running as the layout settles converges on it.
 *
 * Instant rather than smooth: someone who pressed "Catalogue" asked to *be* there, and a
 * smooth scroll over that distance is a long ride past everything they skipped. It would
 * also fight each retry.
 */
const HASH_SCROLL_RETRIES = [0, 120, 400, 900];

function useHashScroll() {
  const { hash } = useLocation();

  React.useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const timers = HASH_SCROLL_RETRIES.map((delay) =>
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
      }, delay)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [hash]);
}

/* ── hero ─────────────────────────────────────────────────────────────────── */

function Hero({
  tool,
  setup,
  onTool,
  prompt,
  onPrompt,
  params,
  onParam,
  extra,
  onExtra,
  subject,
  modelName,
  deck,
  onOpen,
}: {
  tool: Tool;
  setup: ToolSetup;
  onTool: (id: string) => void;
  prompt: string;
  onPrompt: (value: string) => void;
  params: Record<string, string>;
  onParam: (id: string, value: string) => void;
  extra: Record<string, string>;
  onExtra: (id: string, value: string) => void;
  subject: Lora | null;
  modelName: string;
  deck: Lora[];
  onOpen: (lora: Lora) => void;
}) {
  return (
    <section className="hub-band pb-8 pt-10">
      <div className="mx-auto flex w-full max-w-[880px] flex-col items-center text-center">
        <h1
          className="desk-display m-0 text-ink"
          style={{ fontSize: "clamp(2rem, 4.6vw, 3.4rem)" }}
        >
          What would you like to make
          <br />
          today? <span className="desk-em desk-relabel" key={tool.id}>{setup.outcome}</span>
        </h1>

        <ToolBar tool={tool} onTool={onTool} onPrompt={onPrompt} />

        <Composer
          tool={tool}
          setup={setup}
          prompt={prompt}
          onPrompt={onPrompt}
          params={params}
          onParam={onParam}
          extra={extra}
          onExtra={onExtra}
          subject={subject}
          modelName={modelName}
        />

        {/* Outside the composer: `.desk-composer` is a fixed-height box, and a line that
            only appears for some tools cannot live inside something whose footprint must
            never change. */}
        <p className="mt-3 max-w-[70ch] text-[12.5px] leading-[1.5] text-ink-muted-2">
          {facts.placeholderNote}
        </p>
      </div>

      <Deck cast={deck} onOpen={onOpen} />
    </section>
  );
}

/**
 * The five tools as one pill bar, each opening a menu on hover or focus.
 *
 * The menu is not a second navigation — every item in it is a *starting line* that fills
 * the composer below, plus one link that opens the tool itself. That is the whole reason
 * the bar can be a menu at all: picking "Music video" on a site like this usually means
 * committing to a page, and here it only means committing to a sentence.
 */
function ToolBar({
  tool,
  onTool,
  onPrompt,
}: {
  tool: Tool;
  onTool: (id: string) => void;
  onPrompt: (value: string) => void;
}) {
  const [open, setOpen] = React.useState<string | null>(null);

  return (
    <div
      className="hub-toolbar reel-scroller mt-7 max-w-full"
      onMouseLeave={() => setOpen(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(null);
      }}
    >
      {TOOLS.map((t) => (
        <div key={t.id} className="relative" onMouseEnter={() => setOpen(t.id)}>
          <button
            type="button"
            className="hub-tool"
            data-active={t.id === tool.id}
            aria-expanded={open === t.id}
            onClick={() => {
              onTool(t.id);
              setOpen(open === t.id ? null : t.id);
            }}
            onFocus={() => setOpen(t.id)}
          >
            {t.name}
          </button>

          {open === t.id && (
            <div className="hub-menu">
              <p className="px-2.5 pb-1.5 pt-1 text-[12.5px] leading-[1.5] text-ink-muted-2">
                {t.blurb}
              </p>
              <p className="desk-pill-label px-2.5 pb-1 pt-2">Start from</p>
              {SETUP[t.id].starts.map((line) => (
                <button
                  key={line}
                  type="button"
                  className="hub-menu-item"
                  onClick={() => {
                    onTool(t.id);
                    onPrompt(line);
                    setOpen(null);
                  }}
                >
                  {line}
                </button>
              ))}
              <Link to={t.href} className="hub-menu-item text-accent">
                Open {t.name} →
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Types a line, holds it, deletes it, moves to the next — the composer's placeholder text
 * when nothing has been typed yet. Runs off `setup.starts`, the same three lines each
 * tool's menu already offers as "start from", so a tool switch changes what the field
 * cycles through without any new copy to maintain.
 *
 * Reads `prefers-reduced-motion` once at effect-start rather than binding a listener: this
 * is a decorative loop, not a state the page needs to track live, and the effect already
 * re-runs on every line-set change.
 */
function useTypewriter(lines: string[]): string {
  const [text, setText] = React.useState("");
  const key = lines.join(" ");

  React.useEffect(() => {
    if (lines.length === 0) {
      setText("");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(lines[0]);
      return;
    }

    const TYPE_MS = 42;
    const DELETE_MS = 22;
    const HOLD_MS = 1500;
    const GAP_MS = 400;

    // All state driving the loop lives in these plain closures, not inside `setText` —
    // every call below passes a plain value, never an updater function. The previous
    // version scheduled the *next* timer from inside a `setText(current => ...)` updater,
    // and React 18 invokes updater functions twice under StrictMode to catch exactly this
    // kind of impurity — the double-invoke raced two independent timer chains, which is
    // what made the animation stutter, skip letters, and run too fast.
    let lineIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: number;

    const tick = () => {
      const target = lines[lineIndex];

      if (!deleting) {
        charIndex++;
        setText(target.slice(0, charIndex));
        timer = window.setTimeout(tick, charIndex >= target.length ? HOLD_MS : TYPE_MS);
        if (charIndex >= target.length) deleting = true;
        return;
      }

      charIndex--;
      setText(target.slice(0, charIndex));
      if (charIndex <= 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        timer = window.setTimeout(tick, GAP_MS);
      } else {
        timer = window.setTimeout(tick, DELETE_MS);
      }
    };

    timer = window.setTimeout(tick, GAP_MS);
    return () => window.clearTimeout(timer);
  }, [key]);

  return text;
}

/**
 * The one object on the page you can actually type into.
 *
 * This is Desk's composer field, not a bordered form control: the box *is* the input, so
 * the line sits at 19px on transparent ground with no second rectangle drawn around it.
 * A `<textarea>` element rather than the `Textarea` primitive for exactly that reason —
 * the primitive draws the border and the focus ring that the composer already owns
 * through `.desk-composer:focus-within`, and stacking them gives you a box in a box.
 *
 * It carries what is loaded, the line, the one extra field a tool genuinely needs, and
 * the cost — so committing is a single reading, not a hunt across the page for what this
 * is going to charge you.
 */
function Composer({
  tool,
  setup,
  prompt,
  onPrompt,
  params,
  onParam,
  extra,
  onExtra,
  subject,
  modelName,
}: {
  tool: Tool;
  setup: ToolSetup;
  prompt: string;
  onPrompt: (value: string) => void;
  params: Record<string, string>;
  onParam: (id: string, value: string) => void;
  extra: Record<string, string>;
  onExtra: (id: string, value: string) => void;
  subject: Lora | null;
  modelName: string;
}) {
  const typed = useTypewriter(setup.starts);

  return (
    <div className="desk-composer mt-6 w-full border border-border-2 p-3.5 text-left">
      {/* Nothing loaded is a state, not a reason to show a stand-in. Filling this row with
          a plausible LoRA when the selection is empty would tell a first-time visitor
          they had already chosen something, and contradict the rail, which says they
          have not. */}
      <div className="mb-3 flex items-center gap-2.5 px-1">
        {subject ? (
          <>
            <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border-2">
              <StockFill
                seedKey={subject.id}
                alt=""
                sizes="28px"
                subject={previewSubject(subject)}
              />
            </span>
            <p className="m-0 min-w-0 truncate text-[13px] text-ink-muted">
              <span className="font-semibold text-ink">{subject.name}</span> on {modelName}
            </p>
            <a href="#catalog" className="ml-auto shrink-0 text-[13px] font-bold text-accent">
              Change
            </a>
          </>
        ) : (
          <>
            <span className="h-7 w-7 shrink-0 rounded-full border border-dashed border-border-2" />
            <p className="m-0 min-w-0 truncate text-[13px] text-ink-muted-2">
              Nothing loaded — {modelName} on its own
            </p>
            <a href="#catalog" className="ml-auto shrink-0 text-[13px] font-bold text-accent">
              Pick a model
            </a>
          </>
        )}
      </div>

      <label className="sr-only" htmlFor="hub-prompt">
        {setup.lineLabel}
      </label>
      {/* `flex-1 min-h-0` rather than a rows-driven height: `.desk-composer` is a fixed
          346px box from `sm` up, so the field is what absorbs the difference when a tool
          adds its second field. The composer's footprint — and therefore the deck below
          it — never moves when you switch tabs. */}
      <textarea
        id="hub-prompt"
        value={prompt}
        onChange={(e) => onPrompt(e.target.value)}
        rows={3}
        placeholder={typed || setup.placeholder}
        className="min-h-0 w-full flex-1 resize-none bg-transparent px-1 text-[18px] leading-[1.5] text-ink outline-none placeholder:text-ink-muted-2 sm:text-[19px]"
      />

      {/* The second field, only where the tool genuinely cannot start from one line. */}
      {setup.extra && (
        <div className="mt-1 shrink-0 border-t border-border pt-3">
          <label className="desk-pill-label mb-1.5 block px-1" htmlFor={`hub-${setup.extra.id}`}>
            {setup.extra.label}
          </label>
          <input
            id={`hub-${setup.extra.id}`}
            value={extra[setup.extra.id] ?? ""}
            onChange={(e) => onExtra(setup.extra!.id, e.target.value)}
            placeholder={setup.extra.placeholder}
            className="w-full bg-transparent px-1 text-[15px] leading-[1.5] text-ink outline-none placeholder:text-ink-muted-2"
          />
        </div>
      )}

      <div className="desk-shelf mt-3.5 flex shrink-0 flex-wrap items-center gap-[7px] border-t border-border px-1 pt-3.5">
        <button
          type="button"
          className="desk-pill"
          title="Add a reference image — opens in the tool"
        >
          <ImagePlus className="h-4 w-4 text-ink-muted-2" aria-hidden="true" />
          <span className="hidden sm:inline">Reference</span>
        </button>

        {setup.controls.map((control) => (
          <Select
            key={`${tool.id}-${control.id}`}
            value={params[control.id] ?? control.options[0]}
            onValueChange={(v) => onParam(control.id, v)}
          >
            <SelectTrigger className="desk-pill w-auto" aria-label={control.label}>
              <span className="desk-pill-label">{control.label}</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {control.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        <button
          type="button"
          className="desk-pill"
          title="Try another line"
          onClick={() => onPrompt(setup.starts[Math.floor(Math.random() * setup.starts.length)])}
        >
          <Shuffle className="h-4 w-4 text-ink-muted-2" aria-hidden="true" />
        </button>

        <div className="ml-auto flex items-center gap-3">
          <p className="desk-data m-0 text-[12.5px] text-ink-muted-2">{tool.cost}</p>
          <Link
            to={tool.href}
            className="desk-cta rounded-full bg-accent px-5 py-2.5 text-[14.5px] font-bold text-[var(--on-accent)] no-underline transition-transform hover:-translate-y-px"
          >
            <span key={tool.id} className="desk-relabel">
              {tool.action} →
            </span>
          </Link>
        </div>
      </div>

    </div>
  );
}

/* ── the deck ─────────────────────────────────────────────────────────────── */

/** How long each card holds the centre before the deck advances. */
const DECK_DWELL_MS = 3600;

/** Cards further than this from centre are parked: no image, no transition, invisible. */
const DECK_REACH = 4;

/**
 * The deck — the hero's one authored moment.
 *
 * It is not a carousel of thumbnails and it is not decoration standing in for a hero
 * image. Every card is a real catalogue entry, the one at centre is the one the composer
 * above is currently set to use, and clicking it opens what it is and what it costs.
 *
 * **The thesis is a turntable, not a marquee.** Desk's motion idea is a lit room, and this
 * is the thing in the room that turns: the cast rotates slowly past the lamp, each card
 * easing into its slot over 900ms and holding the centre for three and a half seconds.
 * The alternative — a linear marquee — was rejected because a marquee has no centre, and
 * a deck whose centre means "this is loaded" needs one. Nothing about it is a loop of
 * pictures running at you.
 *
 * The ring wraps, so it never reaches an end and never stalls. Cards beyond `DECK_REACH`
 * are parked with `data-far`: invisible, transition suppressed, image not rendered. That
 * attribute is load-bearing — a card wrapping from `+10` to `-10` would otherwise slide
 * the full width of the screen in front of everything else.
 *
 * It stops when it is not being watched: off-screen, tab hidden, pointer over it, or
 * keyboard focus inside it. Under `prefers-reduced-motion` it never advances on its own
 * at all, and the arrows remain the way through.
 */
function Deck({ cast, onOpen }: { cast: Lora[]; onOpen: (lora: Lora) => void }) {
  const [centre, setCentre] = React.useState(0);
  const [held, setHeld] = React.useState(false);
  const [onScreen, setOnScreen] = React.useState(true);
  const ref = React.useRef<HTMLDivElement>(null);
  const n = cast.length;

  const step = React.useCallback((delta: number) => setCentre((c) => (c + delta + n) % n), [n]);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (held || !onScreen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => step(1), DECK_DWELL_MS);
    return () => window.clearInterval(id);
  }, [held, onScreen, step]);

  const current = cast[centre];

  return (
    <div
      ref={ref}
      className="hub-deck"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHeld(false);
      }}
    >
      <div className="hub-coverflow">
        <button
          type="button"
          className="hub-cover-arrow left-2 sm:left-8"
          onClick={() => step(-1)}
          aria-label="Previous model"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {cast.map((item, i) => {
          // Shortest signed distance around the ring, so a card leaves by the near edge
          // rather than travelling back across the whole deck.
          let offset = (i - centre + n) % n;
          if (offset > n / 2) offset -= n;
          const distance = Math.abs(offset);
          const far = distance > DECK_REACH;

          return (
            <button
              key={item.id}
              type="button"
              className="hub-cover"
              data-centre={offset === 0}
              data-far={far}
              tabIndex={far ? -1 : 0}
              aria-hidden={far}
              onClick={() => (offset === 0 ? onOpen(item) : setCentre(i))}
              style={
                {
                  "--o": offset,
                  "--depth": distance * 110,
                  "--scale": 1 - distance * 0.07,
                  "--fade": Math.max(0, 1 - distance * 0.26),
                  "--z": 20 - distance,
                } as React.CSSProperties
              }
              aria-label={offset === 0 ? `Open ${item.name}` : `Bring ${item.name} to front`}
            >
              {!far && (
                <StockFill
                  seedKey={`${item.id}-cover`}
                  alt=""
                  sizes="(min-width: 1280px) 280px, (min-width: 768px) 220px, 170px"
                  subject={previewSubject(item)}
                />
              )}
            </button>
          );
        })}

        <button
          type="button"
          className="hub-cover-arrow right-2 sm:right-8"
          onClick={() => step(1)}
          aria-label="Next model"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Keyed on the id so the caption re-sets rather than swapping mid-word — the same
          `desk-relabel` the headline and the send button use when the tool changes. */}
      <p className="hub-deck-caption">
        <span key={current.id} className="desk-relabel">
          <span className="font-semibold text-ink">{current.name}</span>
          <span className="text-ink-muted-2"> · {current.tagline}</span>
        </span>
      </p>
    </div>
  );
}

/* ── bands ────────────────────────────────────────────────────────────────── */

/**
 * What's loaded, in motion — our own checkpoints, each paired with a real loop from the
 * preset library rather than a still, so "latest" reads as footage instead of a poster.
 * A separate band from the catalogue: this one is announcement-only and never controls
 * what loads, so it doesn't need to pretend to be a picker.
 */
const LATEST_MODEL_COUNT = 4;

function LatestModels() {
  return (
    <section className="hub-band">
      <div className="flex items-end justify-between gap-4">
        <h2
          className="desk-display m-0 text-ink"
          style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)" }}
        >
          Latest AI Models
        </h2>
        <a href="#catalog" className="hub-more-link">
          More <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <div className="hub-scroller reel-scroller mt-6">
        {CHECKPOINTS.slice(0, LATEST_MODEL_COUNT).map((cp, i) => {
          const [first, ...rest] = cp.name.split(" ");
          return (
            <div key={cp.id} className="hub-model-card">
              <div className="hub-model-thumb">
                <video
                  src={VIDEO_LOOPS[i % VIDEO_LOOPS.length]}
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                />
              </div>
              <p className="hub-model-name">
                {first} {rest.length > 0 && <span className="text-accent">{rest.join(" ")}</span>}
              </p>
              <p className="hub-model-desc">{cp.tagline}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Every category stacked in one scroll, with a sticky tab strip on top — the same pattern
 * `CatalogSection` already uses for its category shelves (`useScrollSpy` + anchor links).
 * Clicking a tab jumps to its section; scrolling past a section's top lights its tab. The
 * two are the same control, read two ways, rather than a click-only tab switcher that
 * would silently disagree with the reader's own scrolling.
 */
/** How many template cards the home band shows per category — the category's own page
 *  (`/home/inspirations/:id`) shows the fuller `INSPIRATION_PAGE_COUNT`. */
export const INSPIRATION_HOME_COUNT = 10;
export const INSPIRATION_PAGE_COUNT = 24;

function Inspirations() {
  const ids = INSPIRATION_CATEGORIES.map((c) => `insp-${c.id}`);
  const active = useScrollSpy(ids);
  const [viewing, setViewing] = React.useState<Template | null>(null);

  return (
    // The lightbox is a sibling of the section, not a descendant — `.hub-band` sets its
    // own `z-index: 10`, which establishes a stacking context. A `position: fixed`,
    // `z-index: 80` element nested inside it is still trapped under anything stacked
    // above `.hub-band` itself (the topbar sits at `z-index: 40`), no matter how high its
    // own z-index reads. Same reason the LoRA lightbox further down this file renders
    // outside `<HubShell>` entirely rather than inside one of its bands.
    <>
      <section id="insp" className="hub-band desk-recessed">
        <BandHead title="Inspirations" />

        <nav className="hub-spy reel-scroller" aria-label="Inspiration categories">
          {INSPIRATION_CATEGORIES.map((c) => (
            <a
              key={c.id}
              href={`#insp-${c.id}`}
              className="hub-insp-tab no-underline"
              data-active={active === `insp-${c.id}`}
            >
              {c.label}
            </a>
          ))}
        </nav>

        <div className="mt-2 flex flex-col gap-10">
          {INSPIRATION_CATEGORIES.map((category) => {
            const templates = templatesFor(category.id, category.label, category.blurb, INSPIRATION_HOME_COUNT);
            return (
              <div key={category.id} id={`insp-${category.id}`} className="scroll-mt-[112px]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="m-0 text-[17px] font-semibold text-ink">{category.label}</h3>
                    <p className="mt-1 max-w-[52ch] text-[13px] leading-[1.5] text-ink-muted-2">
                      {category.blurb}
                    </p>
                  </div>
                  <Link to={`/home/inspirations/${category.id}`} className="hub-more-link shrink-0">
                    See all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>

                {/* A reel, not the grid. See `.hub-tpl-reel` for why ten wrapped galleries
                    could not stay on one page, and note that "See all →" above is now the
                    real route to the full grid rather than an ornament beside one. */}
                <div
                  className="hub-tpl-reel reel-scroller mt-4"
                  role="group"
                  aria-label={`${category.label} — scroll for more`}
                >
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="hub-tpl-tile"
                      style={{ aspectRatio: t.aspect }}
                      onClick={() => setViewing(t)}
                      aria-label={`Open ${t.title}`}
                    >
                      <VideoTile src={t.url} label={t.title} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {viewing && <TemplateLightbox template={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}

function BandHead({ title, sub }: { title: React.ReactNode; sub?: string }) {
  return (
    <header className="max-w-[62ch]">
      <h2
        className="desk-display m-0 text-ink"
        style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.7rem)" }}
      >
        {title}
      </h2>
      {sub && <p className="mt-3 text-[15px] leading-[1.65] text-ink-muted">{sub}</p>}
    </header>
  );
}

/* ── the lightbox ─────────────────────────────────────────────────────────── */

/**
 * What a card actually is, full screen.
 *
 * The right rail is deliberately the same set of facts the catalogue's detail panel shows
 * — trigger words, what it runs on, what it costs — because a visitor who opens a picture
 * here and then finds different information in the catalogue has been told the surface is
 * decorative. The one CTA loads it and closes; it does not silently navigate somewhere.
 */
function Lightbox({ lora, onClose }: { lora: Lora; onClose: () => void }) {
  const { selectLora, checkpoint } = useSelection();
  const shot = React.useMemo(() => stockFor(`${lora.id}-cover`, previewSubject(lora)), [lora]);
  const compatible = lora.compatible.includes(checkpoint.family);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="hub-lightbox" role="dialog" aria-modal="true" aria-label={lora.name}>
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
        <img
          src={shot.src(1200)}
          srcSet={shot.srcSet}
          sizes="(min-width: 900px) 60vw, 100vw"
          alt=""
          className="max-h-full max-w-full rounded object-contain"
        />
        <button
          type="button"
          onClick={onClose}
          className="hub-cover-arrow right-4 top-4 translate-y-0"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="hub-lightbox-rail ledger-scrollbar">
        <div>
          <p className="desk-pill-label m-0">{lora.category}</p>
          <h2 className="desk-display m-0 mt-1.5 text-[26px] text-ink">{lora.name}</h2>
          <p className="desk-data m-0 mt-1 text-[12.5px] text-ink-muted-2">by {lora.author}</p>
        </div>

        <p className="m-0 text-[14px] leading-[1.6] text-ink-muted">{lora.tagline}</p>

        <div>
          <p className="desk-pill-label m-0 mb-2">Trigger words</p>
          <div className="flex flex-wrap gap-1.5">
            {lora.triggerWords.map((word) => (
              <span key={word} className="desk-pill desk-data !py-1 text-[12px]">
                {word}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="desk-pill-label m-0 mb-2">Runs on</p>
          <p className="desk-data m-0 text-[13px] text-ink-muted">
            {lora.compatible.join(" · ")}
          </p>
          {!compatible && (
            <p className="m-0 mt-2 text-[12.5px] leading-[1.5] text-amber">
              Your loaded base model is {checkpoint.family}. You can still run this — expect
              the likeness to drift.
            </p>
          )}
        </div>

        <p className="m-0 text-[12.5px] leading-[1.5] text-ink-muted-2">
          {facts.placeholderNote}
        </p>

        <button
          type="button"
          className="desk-cta mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-[15px] font-bold text-[var(--on-accent)] transition-transform hover:-translate-y-px"
          onClick={() => {
            selectLora(lora.id);
            onClose();
          }}
        >
          Load this setup <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
