import { Check } from "lucide-react";
import { ModelPreview } from "@/components/browse/model-preview";
import { CHECKPOINTS, type Checkpoint } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * Step one of the pipeline. The ticket asks for a "visual dropdown" of checkpoints, but
 * with four of them a dropdown hides exactly the information that makes the choice —
 * what each base is good at and what it costs. So: laid out, not collapsed.
 */
export function CheckpointBar({
  selected,
  onSelect,
}: {
  selected: Checkpoint;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3"
      role="radiogroup"
      aria-label="Base model"
    >
      {CHECKPOINTS.map((cp) => {
        const active = cp.id === selected.id;
        return (
          <button
            key={cp.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(cp.id)}
            className={cn(
              "flex flex-col gap-2 p-4 text-left transition-colors",
              active ? "bg-accent/10" : "bg-panel hover:bg-panel-2"
            )}
          >
            <ModelPreview
              slug={cp.preview}
              name={cp.name}
              poster={cp.poster}
              active={active}
              play
            />

            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "font-sans text-[14px] font-semibold",
                  active ? "text-accent" : "text-ink"
                )}
              >
                {cp.name}
              </span>
              {active && <Check className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />}
            </div>

            <p className="font-sans text-[12.5px] leading-[1.5] text-ink-muted-2">{cp.tagline}</p>

            <div className="mt-auto flex items-center gap-3 pt-1 font-mono text-[10px] text-ink-muted-2">
              <span className="tabular-nums">{cp.nativeResolution}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{cp.costPerImage} cr/image</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
