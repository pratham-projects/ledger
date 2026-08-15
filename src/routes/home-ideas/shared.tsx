import * as React from "react";
import { Link } from "react-router-dom";
import {
  CHECKPOINTS,
  checkpointPoster,
  previewSubject,
  type Checkpoint,
  type Lora,
} from "@/lib/catalog";
import { featuredLoras } from "@/components/home/featured";
import { useSelection } from "@/hooks/use-selection";
import { stockFor } from "@/lib/stock";
import { facts, TOOLS } from "./facts";
import { Disclosure } from "./frame";

export type ThemeStyle = React.CSSProperties &
  Record<`--${string}`, string | number>;

export interface IdeaTheme {
  id: string;
  name: string;
  note: string;
  swatch: [string, string, string];
  style: ThemeStyle;
}

export function PalettePicker({
  themes,
  active,
  onChange,
  label = "Colour",
}: {
  themes: IdeaTheme[];
  active: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  return (
    <div className="idea-palette" aria-label={`${label} options`}>
      <span className="idea-palette-label">{label}</span>
      <div className="idea-palette-options">
        {themes.map((theme) => {
          const selected = theme.id === active;
          return (
            <button
              key={theme.id}
              type="button"
              aria-pressed={selected}
              aria-label={`${theme.name}: ${theme.note}`}
              onClick={() => onChange(theme.id)}
              className="idea-palette-option"
              data-active={selected}
            >
              <span className="idea-palette-swatches" aria-hidden>
                {theme.swatch.map((colour) => (
                  <span key={colour} style={{ background: colour }} />
                ))}
              </span>
              <span>{theme.name}</span>
              <span className="sr-only">{theme.note}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The rationale strip for the two navigation-direction sketches (`nav-showcase`,
 * `nav-hub`). Distinct from `IdeaFrame`'s comparison bar — these two pages are not a
 * six-way tournament, they're a before/after pair, so the note explains the *change*
 * rather than switching between finished worlds.
 */
export function ConceptNote({
  eyebrow,
  children,
  otherHref,
  otherLabel,
}: {
  eyebrow: string;
  children: React.ReactNode;
  otherHref: string;
  otherLabel: string;
}) {
  return (
    <div className="border-b border-border bg-panel-2 px-5 py-4 sm:px-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[70ch] text-[13px] leading-[1.6] text-ink-muted">
          <span className="mr-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-accent">
            {eyebrow}
          </span>
          {children}
        </p>
        <div className="flex shrink-0 items-center gap-3 text-[12.5px] font-bold">
          <Link to="/home-ideas" className="text-ink-muted-2 hover:text-ink">
            ← Gallery
          </Link>
          <Link to={otherHref} className="text-accent hover:underline">
            {otherLabel} →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CandidateNav({
  action = "Start creating",
}: {
  action?: string;
}) {
  return (
    <header className="idea-candidate-nav">
      <Link to="/home-ideas" className="idea-wordmark">
        {facts.wordmark}
      </Link>
      <nav aria-label="Creation tools" className="idea-tool-nav">
        {TOOLS.map((tool) => (
          <Link key={tool.id} to={tool.href}>
            {tool.name}
          </Link>
        ))}
      </nav>
      <div className="idea-nav-actions">
        <Link to="/credits" className="idea-credit-link">
          {facts.freeCap} credits
        </Link>
        <Link to="/home#catalog" className="idea-nav-primary">
          {action}
        </Link>
      </div>
    </header>
  );
}

export function useIdeaSelection() {
  const selection = useSelection();
  const loras = React.useMemo(() => featuredLoras(), []);
  const activeLora = selection.lora ?? loras[0];

  return { ...selection, loras, activeLora };
}

export function ModelPicker({
  heading = "Choose the base model",
  intro = "This sets the overall rendering style. Tap a model to load it everywhere.",
  className = "",
}: {
  heading?: string;
  intro?: string;
  className?: string;
}) {
  const { checkpoint, setCheckpoint } = useSelection();

  return (
    <section className={`idea-model-picker ${className}`}>
      <div className="idea-section-copy">
        <h2>{heading}</h2>
        <p>{intro}</p>
      </div>
      <div className="idea-model-list">
        {CHECKPOINTS.map((model) => (
          <ModelButton
            key={model.id}
            model={model}
            selected={checkpoint.id === model.id}
            onSelect={() => setCheckpoint(model.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ModelButton({
  model,
  selected,
  onSelect,
}: {
  model: Checkpoint;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="idea-model-card"
      data-selected={selected}
    >
      <img
        src={checkpointPoster(model)}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <span className="idea-model-copy">
        <strong>{model.name}</strong>
        <span>
          {model.family} · {model.nativeResolution}
        </span>
      </span>
      <span className="idea-model-cost">{model.costPerImage} cr</span>
    </button>
  );
}

export function LoraPicker({
  heading = "Choose the cast",
  intro = "Pick one character. The same face follows you into every tool.",
  className = "",
}: {
  heading?: string;
  intro?: string;
  className?: string;
}) {
  const { lora, selectLora } = useSelection();
  const loras = React.useMemo(() => featuredLoras(), []);
  const activeId = lora?.id ?? loras[0].id;

  return (
    <section className={`idea-lora-picker ${className}`}>
      <div className="idea-section-copy">
        <h2>{heading}</h2>
        <p>{intro}</p>
      </div>
      <div className="idea-lora-list">
        {loras.map((item) => (
          <LoraButton
            key={item.id}
            lora={item}
            selected={activeId === item.id}
            onSelect={() => selectLora(item.id)}
          />
        ))}
      </div>
      <Link to="/home#catalog" className="idea-see-all">
        Browse all {facts.loraCount} authored LoRAs →
      </Link>
    </section>
  );
}

function LoraButton({
  lora,
  selected,
  onSelect,
}: {
  lora: Lora;
  selected: boolean;
  onSelect: () => void;
}) {
  const preview = stockFor(lora.id, previewSubject(lora));

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="idea-lora-card"
      data-selected={selected}
    >
      <span className="idea-lora-image">
        <img
          src={preview.src(320)}
          srcSet={preview.srcSet}
          sizes="(min-width: 900px) 180px, 42vw"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span>{selected ? "Loaded" : lora.category}</span>
      </span>
      <span className="idea-lora-copy">
        <strong>{lora.name}</strong>
        <span>{lora.tagline}</span>
      </span>
    </button>
  );
}

export function ToolDeck({
  heading = "One selection. Five ways to use it.",
  className = "",
}: {
  heading?: string;
  className?: string;
}) {
  const { lora } = useSelection();
  const loras = React.useMemo(() => featuredLoras(), []);
  const firstName = (lora ?? loras[0]).name.split(" ")[0];

  return (
    <section className={`idea-tool-deck ${className}`}>
      <div className="idea-section-copy">
        <h2>{heading}</h2>
        <p>
          {firstName} and the loaded base model stay attached when you change tools.
        </p>
      </div>
      <div className="idea-tool-list">
        {TOOLS.map((tool) => (
          <Link key={tool.id} to={tool.href} className="idea-tool-card">
            <span className="idea-tool-name">{tool.name}</span>
            <span className="idea-tool-blurb">{tool.blurb}</span>
            <span className="idea-tool-action">
              {tool.action} <span aria-hidden>→</span>
            </span>
            <span className="idea-tool-cost">{tool.cost}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ProductTerms({ className = "" }: { className?: string }) {
  return (
    <footer className={`idea-product-terms ${className}`}>
      <div className="idea-terms-grid">
        <div>
          <strong>Free, with a refill</strong>
          <p>
            Start with {facts.freeCap} credits. They refill every {facts.refillHours}{" "}
            hours; an ad adds {facts.adReward}.
          </p>
        </div>
        <div>
          <strong>One setup travels</strong>
          <p>
            Your base model and LoRA remain loaded across Image, Video, Chat, RPG,
            and Story.
          </p>
        </div>
        <div>
          <strong>{facts.expiryMonths}-month image storage</strong>
          <p>
            Images are deleted after six months. Prompts, chats, and account data
            remain.
          </p>
        </div>
      </div>
      <Disclosure className="idea-terms-disclosure" />
    </footer>
  );
}
