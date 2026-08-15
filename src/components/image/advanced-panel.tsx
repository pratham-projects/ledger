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
import { BATCH_SIZES, RESOLUTIONS, type useImageGeneration } from "@/hooks/use-image-generation";

type Gen = ReturnType<typeof useImageGeneration>;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="desk-pill-label">{label}</span>
      {children}
    </label>
  );
}

/**
 * A recessed disclosure under the composer, in the same pill/mono vocabulary as its
 * shelf — `desk-pill-label` captions, pill selects — rather than a second boxed `Panel`
 * stacked under the first. Shape moved up into the composer's own shelf (it is one of
 * Desk's two real per-tool controls, alongside style); what stays here is genuinely
 * secondary — count, negative prompt, guidance, resolution, seed.
 */
export function AdvancedPanel(gen: Gen) {
  return (
    <div className="border border-border-2 bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] p-3.5 sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Field label="how many?">
          <Select value={String(gen.batchCount)} onValueChange={(v) => gen.setBatchCount(Number(v))}>
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

      {/* Animated open rather than mounted/unmounted — the fields keep their state and
          the panel's height change is explained instead of jumped. */}
      <div className="m-expand" data-open={gen.advancedOpen}>
        <div className="flex flex-col gap-4 pt-4">
          <Field label="negative prompt">
            <Textarea
              rows={2}
              placeholder="blur, blurry image, motion blur…"
              value={gen.negativePrompt}
              onChange={(e) => gen.setNegativePrompt(e.target.value)}
              className="text-[13px]"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label={`guidance scale — ${gen.guidanceScale}`}>
              <Slider
                min={1}
                max={30}
                value={[gen.guidanceScale]}
                onValueChange={([v]) => gen.setGuidanceScale(v)}
              />
            </Field>

            <Field label="resolution">
              <Select
                value={gen.resolution}
                onValueChange={(v) => gen.setResolution(v as (typeof RESOLUTIONS)[number])}
              >
                <SelectTrigger className="w-full" aria-label="Resolution">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="desk-menu">
                  {RESOLUTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
    </div>
  );
}
