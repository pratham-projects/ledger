import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ImagePlus, Shuffle, SlidersHorizontal } from "lucide-react";
import { stockFor, stockRun } from "@/lib/stock";
import { CHECKPOINTS, LORAS, type Lora } from "@/lib/catalog";
import { FREE_CAP } from "@/hooks/use-credits";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VIDEO_LOOPS } from "@/components/home/video-ideas-section";
import { ART_STYLES, SHAPES } from "@/hooks/use-image-generation";
import { VIDEO_STYLES, DURATIONS, ASPECT_RATIOS } from "@/hooks/use-video-generation";
import { WORLD_THEMES, CHARACTER_CLASSES } from "@/hooks/use-rpg";
import { GENRES } from "@/hooks/use-story";
import { SpecimenBand } from "@/components/home/specimen-band";
import { SpineStrip } from "@/components/home/spine-strip";
import { FlowsSection } from "@/components/home/flows-section";
import { TruthsPanel } from "@/components/home/truths-panel";
import { VideoIdeasSection } from "@/components/home/video-ideas-section";
import { QuickAccess } from "@/components/home/quick-access";
import { facts, TOOLS, STEPS, type Tool } from "./facts";
import { Disclosure } from "./frame";
import { useIdeaSelection } from "./shared";

/**
 * DESK — the prompt desk, carrying the whole product.
 *
 * THESIS: the box you type into is the hero, and switching tools keeps what you wrote. A
 * visitor writes one line, then picks which of the five things to do with it; the line
 * stays put, the loaded model stays put, and only the *controls* change — because a
 * picture, a clip, a conversation, a turn and a chapter genuinely need different settings.
 * "Set it up once and it follows you everywhere" is therefore something a visitor performs
 * in the first ten seconds rather than something the page claims.
 *
 * WHY THE COMPOSER IS BUILT FROM THE TOOLS' OWN MODULES: the control shelf reads
 * `ART_STYLES`, `SHAPES`, `VIDEO_STYLES`, `DURATIONS`, `ASPECT_RATIOS`, `WORLD_THEMES`,
 * `CHARACTER_CLASSES` and `GENRES` from the same hooks `/image`, `/video`, `/rpg` and
 * `/story` read. A landing page that invents its own plausible-looking settings is
 * advertising a product that does not exist; this one cannot drift from the app, because
 * there is only one source for each list.
 *
 * OWN-WORLD: a lamplit studio at night. Charcoal-aubergine ground, acid lime action, and a
 * wall of real output behind — nearly in focus, because this is an image product and
 * dimming its evidence to buy contrast is the wrong trade. Legibility comes from the
 * composer and the headline carrying their own grounds instead.
 *
 * LAYOUT: split. Three arrangements (centred / split / console) were built and compared in
 * place; split was chosen and the switcher removed, so the composer holds the left and the
 * loaded model plus its output holds the right.
 *
 * TOKENS: locked from the token studio (`/home-ideas/desk/studio`) — the Aubergine Lime
 * palette, the Ledger Grotesk trio, 4px radius, glass surfaces — declared once in the
 * `.desk` scope rather than passed as inline style. `EmberField` below and the wall's
 * standing drift (`home-ideas.css`) are this page's one ambient motion idea: the room
 * stays visibly alive even for a visitor who never scrolls, gated entirely behind
 * `prefers-reduced-motion`.
 */

const EXAMPLES = [
  "a rooftop courier in the rain, seen from below",
  "the lighthouse keeper mending a net at dawn",
  "an archivist's desk, ink everywhere, one candle",
];

/**
 * What each tool does with the shared line, and what it genuinely needs on top of it.
 *
 * `outcome` is the half of the headline that changes — the mechanism, printed at display
 * size and re-set every time a tab is pressed. `controls` are that tool's real parameters.
 * `extra` exists only where a tool cannot start from one line alone: chat needs to know
 * who *you* are, RPG needs what you are carrying, story needs who it is about.
 */
export interface ToolSetup {
  outcome: string;
  hint: string;
  placeholder: string;
  lineLabel: string;
  controls: { id: string; label: string; options: string[] }[];
  extra?: { id: string; label: string; placeholder: string };
}

export const TOOL_SETUP: Record<string, ToolSetup> = {
  image: {
    outcome: "A picture out.",
    hint: "Your line becomes the picture. Shape and style sit here; seed, guidance and negative prompt wait on the Advanced toggle inside the tool.",
    lineLabel: "Describe the picture",
    placeholder: "a rooftop courier in the rain, seen from below",
    controls: [
      { id: "image.style", label: "Style", options: [...ART_STYLES] },
      { id: "image.shape", label: "Shape", options: [...SHAPES] },
    ],
  },
  video: {
    outcome: "A clip out.",
    hint: "The same line, moving. Motion intensity, seed and a start frame are inside the tool.",
    lineLabel: "Describe the shot",
    placeholder: "a paper boat sailing through a rainstorm gutter",
    controls: [
      { id: "video.style", label: "Look", options: [...VIDEO_STYLES] },
      { id: "video.duration", label: "Length", options: DURATIONS.map((d) => `${d}s`) },
      { id: "video.ratio", label: "Ratio", options: [...ASPECT_RATIOS] },
    ],
  },
  chat: {
    outcome: "A conversation out.",
    hint: "Your line becomes who they are — it is the system prompt in everything but name. The loaded LoRA gives them their face.",
    lineLabel: "Who are they?",
    placeholder: "Appearance, occupation, how they talk, what they want…",
    controls: [],
    extra: {
      id: "chat.persona",
      label: "Your persona",
      placeholder: "Who are you playing as in this scene?",
    },
  },
  rpg: {
    outcome: "A game out.",
    hint: "Your line becomes the opening situation. The world and your class set what the first turn can contain.",
    lineLabel: "Where does it start?",
    placeholder: "a rooftop courier in the rain, seen from below",
    controls: [
      { id: "rpg.world", label: "World", options: WORLD_THEMES.map((w) => w.name) },
      { id: "rpg.class", label: "Class", options: CHARACTER_CLASSES.map((c) => c.name) },
    ],
    extra: {
      id: "rpg.inventory",
      label: "Starting inventory",
      placeholder: "a dead man's compass, half a map…",
    },
  },
  story: {
    outcome: "A story out.",
    hint: "Your line becomes the premise. Chapters illustrate themselves as they go.",
    lineLabel: "How does it open?",
    placeholder:
      "A letter arrives eleven years after it was posted, and the address is one that never existed.",
    controls: [{ id: "story.genre", label: "Genre", options: GENRES.map((g) => g.name) }],
    extra: {
      id: "story.cast",
      label: "Protagonists",
      placeholder: "Perpetua Small, Emil Barrow…",
    },
  },
};

/**
 * `chrome` is on at `/home-ideas/desk`, where Desk is reviewed as a self-contained world
 * and needs its own bar, and off at `/`, where `HubShell` supplies the rail and the
 * topbar. Two sticky bars stacked at the top of one page is the failure this prop exists
 * to prevent; the hero's negative top margin slides under whichever one is present.
 */
export function IdeaDesk({ chrome = true }: { chrome?: boolean } = {}) {
  const { checkpoint: model, activeLora: subject } = useIdeaSelection();
  const [prompt, setPrompt] = React.useState(EXAMPLES[0]);
  const [tool, setTool] = React.useState<Tool>(TOOLS[0]);
  const [params, setParams] = React.useState<Record<string, string>>({});

  const setup = TOOL_SETUP[tool.id];
  const paramOf = (id: string, fallback: string) => params[id] ?? fallback;
  const setParam = (id: string, value: string) =>
    setParams((prev) => ({ ...prev, [id]: value }));

  const composer = (
    <Composer
      prompt={prompt}
      onPrompt={setPrompt}
      tool={tool}
      setup={setup}
      paramOf={paramOf}
      setParam={setParam}
      subjectName={subject.name}
      subjectId={subject.id}
      modelName={model.name}
    />
  );

  return (
    // No inline theme style: the `.desk` scope in home-ideas.css already declares
    // exactly these token values, so the room is the stylesheet's job now that it is fixed.
    <div className="desk-lamp relative isolate flex min-h-[100dvh] flex-col overflow-x-clip">
      {chrome && <TopBar />}

      <Hero
        tool={tool}
        onTool={setTool}
        setup={setup}
        composer={composer}
        subject={subject}
        modelName={model.name}
      />

      <Ideas />
      {/* Both sit straight under the idea reel: a visitor who has just been handed a
          starting prompt is at exactly the point of asking what it will be drawn *with*.

          Band first, spine second, and that order is load-bearing rather than arbitrary.
          `SpecimenBand` seeds itself from `featuredLoras()`, so its first six cells are the
          same six portraits the spine's LoRA row shows — stacked directly against each
          other they read as the same row rendered twice, which is the one artefact on this
          page that looks like a bug rather than a design. With the band first, the spine's
          *checkpoint* row (six different previews) sits between the two sets of faces. */}
      <Evidence />
      <Spine subject={subject} />
      <Claim />
      <Doors />
      <Proof subject={subject} />
      <Steps />
      <Terms />
      <Closing subjectName={subject.name} />
      <Smallprint />
    </div>
  );
}

/* ── chrome ───────────────────────────────────────────────────────────────── */

/**
 * Transparent over the lamp, grounded once the hero is behind you. A bar that is opaque
 * from the first frame puts a hard rule across the pool of light the opening screen is
 * built around; a bar that is never grounded stops being legible over the specimen band.
 */
function useStuck() {
  const [stuck, setStuck] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return stuck;
}

function TopBar() {
  const stuck = useStuck();

  return (
    <header
      className="desk-topbar flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 sm:px-8"
      data-stuck={stuck}
    >
      <span className="desk-display text-[20px]">{facts.wordmark}</span>

      <div className="ml-auto flex items-center gap-2">
        <Link
          to="/home-ideas/desk/studio"
          className="desk-data hidden items-center gap-1.5 border border-border-2 px-2.5 py-2 text-ink-muted transition-colors hover:border-accent hover:text-ink sm:inline-flex sm:px-3"
          style={{ borderRadius: "999px", fontSize: "12px" }}
          title="Live-edit the design system's colour, type, radius and motion tokens"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          Customize
        </Link>
        <Link
          to="/credits"
          className="desk-data border border-border-2 px-2.5 py-2 text-ink-muted transition-colors hover:border-accent hover:text-ink sm:px-3"
          style={{ borderRadius: "999px", fontSize: "12px" }}
        >
          {facts.freeCap}
          <span className="hidden sm:inline"> credits</span>
          <span className="sm:hidden"> cr</span>
        </Link>
        {/* The one primary path off this page — everywhere else on the site funnels here
            too, so the topbar's CTA says exactly where it goes instead of a generic
            "Start free" that could mean anything. */}
        <Link
          to="/home#catalog"
          className="desk-cta group inline-flex items-center gap-1.5 bg-accent px-[18px] py-2.5 text-[14px] font-bold text-[var(--on-accent)] transition-transform hover:-translate-y-px"
          style={{ borderRadius: "999px" }}
        >
          Browse
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </header>
  );
}

/* ── 1 · the hero ─────────────────────────────────────────────────────────── */

function Hero({
  tool,
  onTool,
  setup,
  composer,
  subject,
  modelName,
}: {
  tool: Tool;
  onTool: (t: Tool) => void;
  setup: ToolSetup;
  composer: React.ReactNode;
  subject: Lora;
  modelName: string;
}) {
  return (
    <section className="relative -mt-[68px] overflow-hidden px-5 pb-14 pt-[92px] sm:px-8 sm:pb-20 sm:pt-[112px]">
      <Wall />
      <EmberField />

      <div className="desk-inner-wide relative z-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] xl:gap-12">
          {/* The pool wraps the whole column rather than the headline alone: at this wall
              brightness the lede and the hint land on tiles too, and a pool that stops
              under the h1 just moves the contrast problem down the page. */}
          <div className="desk-pool flex min-w-0 flex-col">
            <Headline tool={tool} setup={setup} />
            <ToolTabs tool={tool} onTool={onTool} className="mt-8" />
            <div className="mt-3">{composer}</div>
            <Hint setup={setup} subjectName={subject.name} />
          </div>
          <LoadedAside subject={subject} modelName={modelName} />
        </div>
      </div>
    </section>
  );
}

/**
 * Directly beneath the box, per the brief: the answer to a blank field is not an
 * empty-state illustration, it is somewhere to start.
 *
 * It sits on its own ground rather than inside the hero. Mounted over the wall its heading
 * and its cards landed on bright tiles, and giving a reel of *pictures* a busy backdrop of
 * other pictures is the one place on this page where the wall actively competes with the
 * content. The top padding is deliberately short so it still reads as continuous with the
 * composer above it.
 */
function Ideas() {
  return (
    <section className="desk-recessed desk-ledger relative z-10 px-5 pb-14 pt-10 sm:px-8 sm:pb-16">
      <div className="desk-inner-wide">
        <VideoIdeasSection />
      </div>
    </section>
  );
}

/**
 * The claim and the mechanism in one object.
 *
 * The first half is fixed and the second half is the selected tool, re-set at display size
 * every time a tab is pressed. That is the entire product argument — one line in, five
 * different things out — stated by a control rather than by a paragraph, and it is why
 * this replaced "What do you want to make?", which asked a question every competitor asks
 * and demonstrated nothing.
 */
function Headline({ tool, setup }: { tool: Tool; setup: ToolSetup }) {
  return (
    <div className="idea-rise">
      <h1
        className="desk-display"
        style={{ fontSize: "clamp(2.6rem, 6.6vw, 5.2rem)" }}
      >
        One line in.
        <br />
        <span key={tool.id} className="desk-em desk-relabel">
          {setup.outcome}
        </span>
      </h1>
      <p className="mt-5 max-w-[46ch] text-[16.5px] font-medium leading-[1.6] text-ink-muted sm:text-[17.5px]">
        Write it once. Every tool below keeps your line and the model you loaded — only the
        settings change, because a picture and a chapter need different ones.
      </p>
    </div>
  );
}

function Hint({
  setup,
  subjectName,
  className = "",
}: {
  setup: ToolSetup;
  subjectName: string;
  className?: string;
}) {
  return (
    <p className={`mt-4 max-w-[70ch] text-[13.5px] leading-[1.6] text-ink-muted-2 ${className}`}>
      {setup.hint} Switch tabs and your line stays where it is — {subjectName} comes along
      too.
    </p>
  );
}

/**
 * The actual tool-switcher from `/home` (`ToolBar` in `home-hub.tsx`, styled by
 * `.hub-toolbar`/`.hub-tool` in `hub.css`) — copied here as `.desk-toolbar`/`.desk-tool`
 * rather than reused directly, since it lives in a different route's stylesheet. One
 * glass pill track holding plain buttons, not the shared Radix `Tabs` primitive: that
 * primitive's `rounded-full` gets silently squared off by the app-wide
 * `.border { border-radius: var(--radius) }` rule in `globals.css` (any element carrying
 * Tailwind's `border` class gets its corner from that rule, later in the cascade) — the
 * exact reason a first pass here rendered as a rounded rectangle instead of a pill.
 * `.hub-toolbar`/`.hub-tool` sidestep it by writing `border` and `border-radius: 999px` as
 * literal CSS in a named rule instead of the `border` utility class.
 */
function ToolTabs({
  tool,
  onTool,
  className = "",
}: {
  tool: Tool;
  onTool: (t: Tool) => void;
  className?: string;
}) {
  return (
    <div
      className={`desk-toolbar reel-scroller max-w-full overflow-x-auto ${className}`}
      role="tablist"
      aria-label="What to do with your line"
    >
      {TOOLS.map((t) => {
        const on = t.id === tool.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            data-active={on}
            onClick={() => onTool(t)}
            className="desk-tool shrink-0"
          >
            {t.name}
          </button>
        );
      })}
    </div>
  );
}

/** One row's worth of images, doubled so a −50% translate loops seamlessly. */
const WALL_ROWS = 4;
const WALL_ROW_LENGTH = 9;

/**
 * The wall, now a bank of slow marquees instead of one still grid.
 *
 * 36 distinct tiles across four rows — twice the old static count — each row scrolling
 * continuously rather than the whole grid just breathing in place. Rows alternate
 * direction and run at slightly different speeds so the bank reads as depth rather than
 * a single mechanism, the same reasoning the ember field already uses for its two sizes.
 * Every row is its tile set rendered twice back to back: translating the row by exactly
 * −50% of its own width always lands on an identical frame, so the loop has no seam and
 * needs no JS to reset it.
 *
 * Static under `prefers-reduced-motion` — the CSS drops the scroll animation entirely
 * and the rows sit still, which is still a fuller wall than the old 18-tile version even
 * at rest.
 */
export function Wall() {
  const rows = React.useMemo(() => {
    const tiles = stockRun("desk-wall", WALL_ROWS * WALL_ROW_LENGTH);
    return Array.from({ length: WALL_ROWS }, (_, r) =>
      tiles.slice(r * WALL_ROW_LENGTH, r * WALL_ROW_LENGTH + WALL_ROW_LENGTH)
    );
  }, []);

  return (
    <div aria-hidden className="desk-wall">
      <div className="desk-wall-grid">
        {rows.map((tiles, r) => (
          <div
            key={r}
            className="desk-wall-row"
            style={{
              ["--row-duration" as string]: `${64 + r * 16}s`,
              animationDirection: r % 2 ? "reverse" : "normal",
            }}
          >
            {[...tiles, ...tiles].map((t, i) => (
              <img key={t.id + i} src={t.src(320)} alt="" loading="lazy" decoding="async" />
            ))}
          </div>
        ))}
      </div>
      <div className="desk-wall-scrim" />
      <div className="desk-wall-head" />
      <div className="desk-wall-foot" />
    </div>
  );
}

interface Ember {
  id: string;
  kind: "mote" | "orb";
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  peak: number;
}

/**
 * Motes of the accent colour, rising slowly through the lamp light — the room's one
 * continuous ornament. See the CSS comment on `.desk-embers` in `home-ideas.css` for
 * why this is safe to run forever: it is decoration, not status, and it disappears
 * completely under `prefers-reduced-motion`.
 */
export function EmberField() {
  const embers = React.useMemo<Ember[]>(() => {
    const motes: Ember[] = Array.from({ length: 20 }, (_, i) => ({
      id: `mote-${i}`,
      kind: "mote",
      left: Math.round(Math.random() * 100),
      size: 2 + Math.random() * 2.5,
      duration: 13 + Math.random() * 13,
      delay: -Math.random() * 24,
      drift: Math.round((Math.random() - 0.5) * 70),
      peak: 0.35 + Math.random() * 0.45,
    }));
    const orbs: Ember[] = Array.from({ length: 4 }, (_, i) => ({
      id: `orb-${i}`,
      kind: "orb",
      left: Math.round(10 + Math.random() * 80),
      size: 46 + Math.random() * 50,
      duration: 30 + Math.random() * 18,
      delay: -Math.random() * 30,
      drift: Math.round((Math.random() - 0.5) * 40),
      peak: 0.12 + Math.random() * 0.12,
    }));
    return [...motes, ...orbs];
  }, []);

  return (
    <div className="desk-embers" aria-hidden>
      {embers.map((e) => (
        <span
          key={e.id}
          className={e.kind === "orb" ? "desk-ember desk-ember--orb" : "desk-ember"}
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            ["--duration" as string]: `${e.duration}s`,
            ["--delay" as string]: `${e.delay}s`,
            ["--drift" as string]: `${e.drift}px`,
            ["--peak" as string]: e.peak,
          }}
        />
      ))}
    </div>
  );
}

/* ── the composer ─────────────────────────────────────────────────────────── */

function Composer({
  prompt,
  onPrompt,
  tool,
  setup,
  paramOf,
  setParam,
  subjectName,
  subjectId,
  modelName,
}: {
  prompt: string;
  onPrompt: (v: string) => void;
  tool: Tool;
  setup: ToolSetup;
  paramOf: (id: string, fallback: string) => string;
  setParam: (id: string, value: string) => void;
  subjectName: string;
  subjectId: string;
  modelName: string;
}) {
  const chip = stockFor(subjectId, "portrait");
  const [extra, setExtra] = React.useState<Record<string, string>>({});

  return (
    <div className="idea-rise-2">
      <div className="desk-composer border border-border-2 p-3.5 sm:p-4">
        {/* The loaded asset, inside the box. The single most important detail in this
            world: the model is not a setting somewhere else, it is part of what you are
            about to send. */}
        <div className="flex shrink-0 items-center gap-2.5 px-1 pb-3">
          <img
            src={chip.src(64)}
            alt=""
            loading="eager"
            decoding="async"
            className="h-7 w-7 shrink-0 object-cover object-top"
            style={{ borderRadius: "999px" }}
          />
          <p className="min-w-0 truncate text-[13.5px] font-semibold text-ink-muted">
            <span className="text-ink">{subjectName}</span> on{" "}
            <span className="text-ink">{modelName}</span>
          </p>
          <Link
            to="/home#catalog"
            className="ml-auto shrink-0 text-[13px] font-bold text-accent underline decoration-2 underline-offset-2"
          >
            Change
          </Link>
        </div>

        <label className="sr-only" htmlFor="desk-prompt">
          {setup.lineLabel}
        </label>
        {/* `flex-1 min-h-0` rather than a rows-driven height: the box around this has a
            fixed height now (see `.desk-composer` in home-ideas.css), so the field is what
            absorbs the difference when a tool below adds its second field — the composer
            itself, the aside beside it and everything under it never move. */}
        <textarea
          id="desk-prompt"
          value={prompt}
          onChange={(e) => onPrompt(e.target.value)}
          rows={3}
          placeholder={setup.placeholder}
          className="w-full min-h-0 flex-1 resize-none bg-transparent px-1 text-[18px] leading-[1.5] text-ink outline-none placeholder:text-ink-muted-2 sm:text-[19px]"
        />

        {/* The second field, only where the tool genuinely cannot start from one line. */}
        {setup.extra && (
          <div className="mt-1 shrink-0 border-t border-border pt-3">
            <label
              className="desk-pill-label mb-1.5 block px-1"
              htmlFor={`desk-${setup.extra.id}`}
            >
              {setup.extra.label}
            </label>
            <input
              id={`desk-${setup.extra.id}`}
              value={extra[setup.extra.id] ?? ""}
              onChange={(e) => {
                const key = setup.extra!.id;
                setExtra((p) => ({ ...p, [key]: e.target.value }));
              }}
              placeholder={setup.extra.placeholder}
              className="w-full bg-transparent px-1 text-[15px] leading-[1.5] text-ink outline-none placeholder:text-ink-muted-2"
            />
          </div>
        )}

        <div className="mt-3.5 flex shrink-0 flex-wrap items-center gap-2.5 border-t border-border px-1 pt-3.5">
          <div className="desk-shelf">
            <button
              type="button"
              className="desk-pill"
              title="Add a reference image — opens in the tool"
            >
              <ImagePlus className="h-4 w-4 text-ink-muted-2" aria-hidden />
              <span className="hidden sm:inline">Reference</span>
            </button>

            {/* The selected tool's real parameters, read from the tool's own module. */}
            {setup.controls.map((control) => (
              <Select
                key={control.id}
                value={paramOf(control.id, control.options[0])}
                onValueChange={(v) => setParam(control.id, v)}
              >
                <SelectTrigger
                  className="desk-pill w-auto"
                  aria-label={control.label}
                >
                  <span className="desk-pill-label">{control.label}</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="desk-menu">
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
              onClick={() => onPrompt(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)])}
              className="desk-pill"
              title="Try another line"
            >
              <Shuffle className="h-4 w-4 text-ink-muted-2" aria-hidden />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <p className="desk-data text-ink-muted-2" style={{ fontSize: "12.5px" }}>
              {tool.cost}
            </p>
            <Link
              to={tool.href}
              className="bg-accent px-6 py-3 text-[15.5px] font-bold text-[var(--on-accent)] transition-transform hover:-translate-y-px"
              style={{ borderRadius: "999px" }}
            >
              <span key={tool.id} className="desk-relabel">
                {tool.action} →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── hero side panels ─────────────────────────────────────────────────────── */

/** A stable, non-repeating run of loop URLs — same reasoning as `stockRun`: hashing each
 *  slot independently risks two identical clips side by side in a four-up grid. */
function loopsFor(seedKey: string, count: number): string[] {
  let h = 2166136261;
  for (const ch of seedKey) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const start = (h >>> 0) % VIDEO_LOOPS.length;
  return Array.from({ length: count }, (_, i) => VIDEO_LOOPS[(start + i * 3) % VIDEO_LOOPS.length]);
}

/**
 * A muted loop that actually starts. The bare `autoPlay` attribute is unreliable once a
 * video's `src` is set by React rather than present in the initial HTML — the element can
 * sit fully loaded and simply never begin (`model-preview.tsx` hit the same thing and
 * fixed it the same way): call `.play()` from an effect once the source is set, and treat
 * a refusal as a fine fallback to the poster frame rather than an error.
 */
function LoopClip({ src, className }: { src: string; className?: string }) {
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    void ref.current?.play().catch(() => {});
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      className={className}
    />
  );
}

/** Split's right column: what is loaded, and four clips of it in motion. */
function LoadedAside({ subject, modelName }: { subject: Lora; modelName: string }) {
  const clips = React.useMemo(() => loopsFor(subject.id, 4), [subject.id]);

  return (
    <aside className="desk-aside idea-rise-3 hidden flex-col xl:flex">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
        <span className="desk-pill-label">Loaded</span>
        <span className="ml-auto truncate text-[13.5px] font-bold text-ink">
          {subject.name}
        </span>
        <span className="desk-data text-ink-muted-2" style={{ fontSize: "11.5px" }}>
          {modelName}
        </span>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-px bg-border">
        {clips.map((src, i) => (
          <div key={src + i} className="relative min-h-[132px] bg-panel-2">
            <LoopClip src={src} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        ))}
      </div>

    </aside>
  );
}

function Claim() {
  return (
    <section className="desk-section desk-lift">
      <div className="desk-inner grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <div>
          <p className="desk-kicker">one asset · five tools</p>
          <h2
            className="desk-display mt-4"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}
          >
            Pick one model.
            <br />
            Use it <span className="desk-em">everywhere</span>.
          </h2>
          <p
            className="desk-data mt-6 leading-[1.7] text-ink-muted-2"
            style={{ fontSize: "12.5px" }}
          >
            free · no card · {FREE_CAP} credits that refill on their own ·{" "}
            {CHECKPOINTS.length} base models
          </p>
        </div>

        <div className="lg:pb-1.5">
          <p className="max-w-[54ch] text-[16.5px] leading-[1.65] text-ink-muted sm:text-[17.5px]">
            Choose a base model and a LoRA — a character, a style, a look — and it follows
            you into image, video, chat, RPG and story. You set it up once, then it&rsquo;s
            just there, in whichever tool you open.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/home#catalog"
              className="inline-flex items-center gap-2 bg-accent px-[24px] py-3.5 text-[15.5px] font-bold text-[var(--on-accent)] transition-transform hover:-translate-y-px"
              style={{ borderRadius: "999px" }}
            >
              Browse <span className="desk-data">{LORAS.length}</span> LoRAs
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#proof"
              className="border border-border-2 px-[24px] py-3.5 text-[15.5px] font-bold text-ink transition-colors hover:border-accent"
              style={{ borderRadius: "999px" }}
            >
              See how it works ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 3 · the doors ────────────────────────────────────────────────────────── */

function Doors() {
  return (
    <section className="desk-section desk-recessed desk-lift">
      <div className="desk-inner desk-ledger">
        <SectionHead
          title={
            <>
              Five doors. The same setup behind{" "}
              <span className="desk-em">all</span> of them.
            </>
          }
          sub="Whatever you have loaded is already waiting on the other side."
        />
        <div className="mt-8">
          <QuickAccess />
        </div>
      </div>
    </section>
  );
}

/* ── 4 · the evidence ─────────────────────────────────────────────────────── */

function Evidence() {
  return (
    <section className="desk-band relative z-10 border-t border-border px-6">
      <SpecimenBand />
    </section>
  );
}

/* ── 5 · the mechanism ────────────────────────────────────────────────────── */

function Spine({ subject }: { subject: Lora }) {
  return (
    <section className="desk-section desk-recessed desk-lift">
      <div className="desk-inner desk-ledger">
        <SectionHead
          title={
            <>
              First the look, then the <span className="desk-em">face</span>.
            </>
          }
          sub="Tap either row. Everything below this point re-casts to what you choose, and so does whichever tool you open next."
        />
        <div className="mt-8">
          <SpineStrip subject={subject} />
        </div>
      </div>
    </section>
  );
}

/* ── 6 · the proof ────────────────────────────────────────────────────────── */

function Proof({ subject }: { subject: Lora }) {
  return (
    <section id="proof" className="desk-section desk-lift">
      <div className="desk-inner desk-ledger">
        <FlowsSection subject={subject} />
      </div>
    </section>
  );
}

/* ── 7 · the three steps ──────────────────────────────────────────────────── */

function Steps() {
  return (
    <section className="desk-section desk-recessed desk-lift">
      <div className="desk-inner">
        <SectionHead
          title={
            <>
              How it works, in <span className="desk-em">three</span>.
            </>
          }
        />
        <ol className="mt-9 grid gap-8 sm:grid-cols-3 sm:gap-10">
          {STEPS.map((s, i) => (
            <li key={s.n} className="desk-stagger" style={{ ["--stagger-i" as string]: i }}>
              <span
                aria-hidden
                className="desk-data grid h-9 w-9 place-items-center bg-accent text-[var(--on-accent)]"
                style={{ borderRadius: "999px", fontSize: "15px" }}
              >
                {s.n}
              </span>
              <h3 className="mt-4 text-[19px] font-bold leading-[1.3] text-ink">
                {s.plain}
              </h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-ink-muted">{s.detail}</p>
              {/* The real term, kept but demoted. Step three's `real` is a phrase rather
                  than a noun, so the shared "called a …" frame would print "called a the
                  whole point"; it gets the phrase on its own. */}
              <p className="desk-data mt-2.5 text-ink-muted-2" style={{ fontSize: "12px" }}>
                {s.real.startsWith("the ") ? s.real : `called a ${s.real}`}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 8 · the terms ────────────────────────────────────────────────────────── */

function Terms() {
  return (
    <section className="desk-section desk-lift">
      <div className="desk-inner desk-ledger">
        <SectionHead
          title={
            <>
              What it costs, and what we <span className="desk-em">delete</span>.
            </>
          }
          sub="Including the part no competitor prints."
        />
        <div className="mt-8">
          <TruthsPanel />
        </div>
      </div>
    </section>
  );
}

function Closing({ subjectName }: { subjectName: string }) {
  return (
    <section className="desk-section desk-recessed desk-lift border-t border-border">
      <div className="desk-inner text-center">
        <h2
          className="desk-display mx-auto max-w-[16ch]"
          style={{ fontSize: "clamp(2.3rem, 5.8vw, 4.2rem)" }}
        >
          One line. Then <span className="desk-em">five</span> ways to spend it.
        </h2>
        <p className="mx-auto mt-5 max-w-[48ch] text-[17px] leading-[1.65] text-ink-muted">
          {subjectName} is loaded and the box is at the top of this page — nothing you
          picked has to be picked again.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/home#catalog"
            className="bg-accent px-[28px] py-4 text-[16px] font-bold text-[var(--on-accent)] transition-transform hover:-translate-y-px"
            style={{ borderRadius: "999px" }}
          >
            Start free
          </Link>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="border border-border-2 px-[28px] py-4 text-[16px] font-bold text-ink transition-colors hover:border-accent"
            style={{ borderRadius: "999px" }}
          >
            Back to the box ↑
          </a>
        </div>
      </div>
    </section>
  );
}

function Smallprint() {
  return (
    <footer className="relative z-10 border-t border-border px-5 py-9 sm:px-8">
      <div className="desk-inner grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-[68ch] space-y-2">
          <p className="text-[14.5px] leading-[1.6] text-ink-muted">
            Out of credits? Wait{" "}
            <span className="desk-data">{facts.refillHours}</span> hours, watch an ad
            for <span className="font-bold text-ink">+{facts.adReward}</span>, or buy some.
            Credits you buy stack above the free cap and never disappear.{" "}
            <span className="font-bold text-ink">
              Pictures you make are deleted after {facts.expiryMonths} months
            </span>{" "}
            — your account, prompts and chats stay.
          </p>
          <Disclosure />
        </div>
        <p className="desk-data text-ink-muted-2 md:text-right" style={{ fontSize: "12px" }}>
          {facts.catalogNote}
        </p>
      </div>
    </footer>
  );
}

/* ── shared section furniture ─────────────────────────────────────────────── */

/**
 * Every mounted Ledger component names its own region for the codebase — `home.spine`,
 * `home.terms`. That is an address for whoever built it, so each one gets a human heading
 * above it and the address demotes to a small label on the instrument.
 */
function SectionHead({ title, sub }: { title: React.ReactNode; sub?: string }) {
  return (
    <div className="max-w-[64ch]">
      <h2 className="desk-display" style={{ fontSize: "clamp(1.8rem, 3.6vw, 2.9rem)" }}>
        {title}
      </h2>
      {sub && (
        <p className="mt-3.5 max-w-[58ch] text-[16px] leading-[1.65] text-ink-muted">{sub}</p>
      )}
    </div>
  );
}
