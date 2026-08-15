import type { ReactNode } from "react";
import { ChevronRight, Shuffle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BATCH_SIZES, type useVideoGeneration } from "@/hooks/use-video-generation";

type Gen = ReturnType<typeof useVideoGeneration>;

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="desk-pill-label">{label}</span>
      {children}
    </label>
  );
}

/** Same recessed disclosure as `/image`'s. Duration and ratio moved up into the composer
 *  shelf — Desk's two real per-tool controls, alongside style; what stays here is
 *  genuinely secondary — count, motion, negative prompt, seed. */
export function AdvancedPanel(gen: Gen) {
  return (
    <div className="border border-border-2 bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] p-3.5 sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="how many?">
            <Select
              value={String(gen.batchCount)}
              onValueChange={(v) => gen.setBatchCount(Number(v))}
            >
              <SelectTrigger className="desk-pill w-auto" aria-label="How many">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="desk-menu">
                {BATCH_SIZES.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={`motion — ${gen.motionIntensity}`}>
            <div className="flex h-[38px] w-[160px] items-center">
              <Slider
                min={1}
                max={10}
                value={[gen.motionIntensity]}
                onValueChange={([v]) => gen.setMotionIntensity(v)}
              />
            </div>
          </Field>
        </div>

        <button
          type="button"
          onClick={() => gen.setAdvancedOpen(!gen.advancedOpen)}
          className="inline-flex items-center gap-1 desk-pill-label transition-colors hover:text-ink"
          aria-expanded={gen.advancedOpen}
        >
          <ChevronRight
            className={cn("h-3 w-3 transition-transform", gen.advancedOpen && "rotate-90")}
            aria-hidden="true"
          />
          advanced parameters
        </button>
      </div>

      <div className="m-expand" data-open={gen.advancedOpen}>
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
          <Field label="negative prompt" className="sm:col-span-2">
            <Textarea
              rows={2}
              placeholder="blurry, warped hands, flicker…"
              value={gen.negativePrompt}
              onChange={(e) => gen.setNegativePrompt(e.target.value)}
              className="text-[13px]"
            />
          </Field>

          <Field label="seed">
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={gen.seedInput}
                onChange={(e) => gen.setSeedInput(Number(e.target.value))}
                className="w-full border border-border-2 bg-panel-2 px-2.5 py-1.5 font-mono text-[12px] text-ink focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                title="Randomize seed (-1)"
                aria-label="Randomize seed"
                onClick={() => gen.setSeedInput(-1)}
                className="desk-pill shrink-0"
              >
                <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}
