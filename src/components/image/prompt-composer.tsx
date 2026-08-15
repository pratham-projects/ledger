import { useEffect, useRef, useState } from "react";
import { Dices, ImagePlus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelection } from "@/hooks/use-selection";
import { stockFor } from "@/lib/stock";
import { previewSubject } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import {
  ART_STYLES,
  EFFECT_MODIFIERS,
  EXAMPLE_PROMPTS,
  IMAGE_GENERATE_COST,
  SHAPES,
  STYLE_MODIFIERS,
  type useImageGeneration,
} from "@/hooks/use-image-generation";

type Gen = ReturnType<typeof useImageGeneration>;

/**
 * The glass composer slab from `/`, carrying a real tool instead of a marketing mock —
 * same loaded-asset chip, same textarea, same border-top shelf of pill controls, same
 * accent CTA. See `.hub-composer` in hub.css for why it isn't literally `.desk-composer`
 * (that class is locked to one line's height; this one has a reference preview and a
 * variable number of modifier tags under the line).
 */
export function PromptComposer(gen: Gen) {
  const { lora, checkpoint } = useSelection();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const idle = gen.prompt.length === 0 && !focused;
  useEffect(() => {
    if (!idle) return;
    const id = window.setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % EXAMPLE_PROMPTS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [idle]);

  const typed = gen.prompt.trim().length > 0;
  const chip = lora ? stockFor(lora.id, previewSubject(lora)) : null;

  return (
    <div className="hub-composer border border-border-2 p-3.5 sm:p-4">
      {/* The loaded asset, inside the box — same placement as the `/` composer, because
          the model is part of what is about to be sent, not a setting parked elsewhere.
          `SourceStrip` above still owns *changing* it; this is the read-only echo. */}
      {lora && chip && (
        <div className="flex shrink-0 items-center gap-2.5 px-1 pb-3">
          <img
            src={chip.src(64)}
            alt=""
            loading="eager"
            decoding="async"
            className="h-7 w-7 shrink-0 rounded-full object-cover object-top"
          />
          <p className="min-w-0 truncate text-[13.5px] font-semibold text-ink-muted">
            <span className="text-ink">{lora.name}</span> on{" "}
            <span className="text-ink">{checkpoint.name}</span>
          </p>
        </div>
      )}

      <label className="sr-only" htmlFor="image-prompt">
        Describe the picture
      </label>
      <Textarea
        id="image-prompt"
        rows={3}
        value={gen.prompt}
        onChange={(e) => gen.setPrompt(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={EXAMPLE_PROMPTS[placeholderIndex]}
        aria-invalid={!!gen.promptError}
        className={cn(
          // See the note on the video composer's own `Textarea` — `border-0`, not
          // `border-none`, so `twMerge` actually drops the base `border` class instead of
          // leaving it in place to trip the global `.border { overflow: hidden }` rule.
          "border-0 bg-transparent px-1 text-[18px] leading-[1.5] outline-none sm:text-[19px]",
          gen.promptError && "text-red"
        )}
      />

      {gen.promptError && (
        <p className="px-1 font-mono text-[11.5px] text-red">{gen.promptError}</p>
      )}

      {gen.imageFrame && (
        <div className="w-28 px-1 pb-1">
          <div className="group relative aspect-square w-28 overflow-hidden border border-border-2 bg-panel-2">
            <img
              src={gen.imageFrame.src}
              alt="Selected reference"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              title="Remove reference image"
              onClick={gen.clearImageFrame}
              className="absolute right-1.5 top-1.5 border border-border-2 bg-panel/90 p-1 text-ink-muted-2 opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1.5 truncate font-mono text-[10.5px] text-ink-muted-2">
            {gen.imageFrame.name}
          </p>
        </div>
      )}

      {/* Modifiers stay a wrapped tag list rather than two dropdowns — see the original
          note this replaced: eleven tags fit on two or three lines, every option stays
          visible, and selection lives on the option itself instead of a menu plus a
          separate chip row. Only the shape of each tag changed, to `.hub-modifier`. */}
      {typed && (
        <div className="flex flex-col gap-2 px-1 pb-1 pt-1">
          <TagGroup
            label="style"
            options={STYLE_MODIFIERS}
            selected={gen.modifiers}
            onToggle={gen.toggleModifier}
          />
          <TagGroup
            label="effect"
            options={EFFECT_MODIFIERS}
            selected={gen.modifiers}
            onToggle={gen.toggleModifier}
          />
        </div>
      )}

      <div className="mt-3.5 flex shrink-0 flex-wrap items-center gap-2.5 border-t border-border px-1 pt-3.5">
        <div className="desk-shelf">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="desk-pill"
            title="Add a reference image"
            aria-label="Add a reference image"
          >
            <ImagePlus className="h-4 w-4 text-ink-muted-2" aria-hidden />
            <span className="hidden sm:inline">Reference</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) gen.uploadImageFrame(file);
              e.target.value = "";
            }}
          />

          <Select value={gen.artStyle} onValueChange={gen.setArtStyle}>
            <SelectTrigger className="desk-pill w-auto" aria-label="Style">
              <span className="desk-pill-label">Style</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="desk-menu">
              {ART_STYLES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={gen.shape} onValueChange={(v) => gen.setShape(v as (typeof SHAPES)[number])}>
            <SelectTrigger className="desk-pill w-auto" aria-label="Shape">
              <span className="desk-pill-label">Shape</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="desk-menu">
              {SHAPES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={gen.randomizePrompt}
            className="desk-pill"
            title="Try another line"
            aria-label="Try another line"
          >
            <Dices className="h-4 w-4 text-ink-muted-2" aria-hidden />
          </button>

        </div>

        <div className="ml-auto flex items-center gap-3">
          <p className="desk-data text-ink-muted-2" style={{ fontSize: "12.5px" }}>
            {IMAGE_GENERATE_COST} credits
          </p>
          <Button variant="primary" size="lg" onClick={gen.generate} disabled={gen.isGenerating}>
            {gen.isGenerating ? "Generating…" : "Generate →"}
          </Button>
        </div>
      </div>

      {/* Removed: an 11px row carrying "show private gallery" and "feedback". Neither did
          anything. `feedback` had no handler at all, and the gallery toggle's state was
          read only to draw its own checkmark — nothing on the page or anywhere else
          consumed it. Two dead controls at the foot of the product's primary tool surface
          is worse than an absence: a visitor who clicks one concludes the app is broken.
          They can come back when there is a private gallery and somewhere to send
          feedback. */}
    </div>
  );
}

/**
 * One labelled row of multi-selectable prompt tags, as `.hub-modifier` pills — same
 * family as the shelf's `.desk-pill` controls, so a tag reads as the same kind of object
 * as everything else in the composer instead of a smaller, squarer species of its own.
 */
function TagGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="desk-pill-label">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((m) => {
          const on = selected.includes(m);
          return (
            <button
              key={m}
              type="button"
              aria-pressed={on}
              data-active={on}
              onClick={() => onToggle(m)}
              className="hub-modifier"
            >
              {m}
              {on && <X className="h-3 w-3" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
