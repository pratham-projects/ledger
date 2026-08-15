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
  ASPECT_RATIOS,
  DURATIONS,
  EXAMPLE_PROMPTS,
  VIDEO_GENERATE_COST,
  VIDEO_STYLES,
  type useVideoGeneration,
} from "@/hooks/use-video-generation";

type Gen = ReturnType<typeof useVideoGeneration>;

/** Same glass slab as `/image` — see `.hub-composer` in hub.css. Style, duration and
 *  ratio are Desk's three real per-tool controls for video (`TOOL_SETUP.video` in
 *  desk.tsx), so all three sit in the shelf; count, motion, negative prompt and seed
 *  stay in the advanced disclosure below. */
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

  const chip = lora ? stockFor(lora.id, previewSubject(lora)) : null;

  return (
    <div className="hub-composer border border-border-2 p-3.5 sm:p-4">
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

      <label className="sr-only" htmlFor="video-prompt">
        Describe the shot
      </label>
      <Textarea
        id="video-prompt"
        rows={3}
        value={gen.prompt}
        onChange={(e) => gen.setPrompt(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={EXAMPLE_PROMPTS[placeholderIndex]}
        aria-invalid={!!gen.promptError}
        className={cn(
          // `border-0`, not `border-none` — Tailwind's `border` (width) and `border-none`
          // (style) are different utility groups, so `twMerge` doesn't dedupe them and the
          // base `Textarea`'s literal `border` class survives into the merged list. That
          // class is also the app's global corner-clip marker (`.border` in globals.css
          // sets `overflow: hidden` so images clip to Desk's radius) — which silently ate
          // any prompt longer than 3 lines, no scrollbar, no visible cue. `border-0` is in
          // the same width group as `border`, so `twMerge` actually removes it.
          "border-0 bg-transparent px-1 text-[18px] leading-[1.5] outline-none sm:text-[19px]",
          gen.promptError && "text-red"
        )}
      />

      {gen.promptError && (
        <p className="px-1 font-mono text-[11.5px] text-red">{gen.promptError}</p>
      )}

      {gen.startFrame && (
        <div className="w-28 px-1 pb-1">
          <div className="group relative aspect-square w-28 overflow-hidden border border-border-2 bg-panel-2">
            {gen.startFrame.type === "video" ? (
              <video
                src={gen.startFrame.dataUrl}
                muted
                loop
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={gen.startFrame.dataUrl}
                alt="Selected start frame"
                className="h-full w-full object-cover"
              />
            )}
            <button
              type="button"
              title="Remove start frame"
              onClick={gen.clearStartFrame}
              className="absolute right-1.5 top-1.5 border border-border-2 bg-panel/90 p-1 text-ink-muted-2 opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1.5 truncate font-mono text-[10.5px] text-ink-muted-2">
            {gen.startFrame.name}
          </p>
        </div>
      )}

      <div className="mt-3.5 flex shrink-0 flex-wrap items-center gap-2.5 border-t border-border px-1 pt-3.5">
        <div className="desk-shelf">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="desk-pill"
            title="Add a start frame"
            aria-label="Add a start frame"
          >
            <ImagePlus className="h-4 w-4 text-ink-muted-2" aria-hidden />
            <span className="hidden sm:inline">Start frame</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) gen.uploadStartFrame(file);
              e.target.value = "";
            }}
          />

          <Select value={gen.style} onValueChange={gen.setStyle}>
            <SelectTrigger className="desk-pill w-auto" aria-label="Style">
              <span className="desk-pill-label">Style</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="desk-menu">
              {VIDEO_STYLES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(gen.duration)}
            onValueChange={(v) => gen.setDuration(Number(v) as (typeof DURATIONS)[number])}
          >
            <SelectTrigger className="desk-pill w-auto" aria-label="Length">
              <span className="desk-pill-label">Length</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="desk-menu">
              {DURATIONS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d}s
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={gen.aspectRatio}
            onValueChange={(v) => gen.setAspectRatio(v as (typeof ASPECT_RATIOS)[number])}
          >
            <SelectTrigger className="desk-pill w-auto" aria-label="Ratio">
              <span className="desk-pill-label">Ratio</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="desk-menu">
              {ASPECT_RATIOS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
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
            {VIDEO_GENERATE_COST} credits
          </p>
          <Button variant="primary" size="lg" onClick={gen.generate} disabled={gen.isGenerating}>
            {gen.isGenerating ? "Generating…" : "Generate →"}
          </Button>
        </div>
      </div>

      {/* Removed, same as `/image`'s — see the note in `components/image/prompt-composer`.
          Two controls that did nothing at all. */}
    </div>
  );
}
