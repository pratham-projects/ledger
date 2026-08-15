import { Check } from "lucide-react";
import { StockFill } from "@/components/media/stock-fill";
import { formatDownloads, previewSubject, type Lora } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * One frame on a reel. The preview is real photography standing in for a render — see
 * lib/stock.ts. It is seeded per-LoRA so the same asset always looks the same across
 * sessions, which is what makes the reel scannable at all.
 */
export function LoraTile({
  lora,
  selected,
  onSelect,
  compatible,
  className,
}: {
  lora: Lora;
  selected: boolean;
  onSelect: () => void;
  /** False when the loaded checkpoint can't run this LoRA — dimmed, still selectable. */
  compatible: boolean;
  /** The index grid passes `w-full` to drop the reel's fixed frame width. */
  className?: string;
}) {

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group m-hover m-press relative flex w-[200px] shrink-0 snap-start flex-col border text-left",
        selected ? "border-accent" : "border-border hover:border-border-2",
        className
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-panel-2">
        <div className="absolute inset-0">
          <StockFill
            seedKey={lora.id}
            subject={previewSubject(lora)}
            alt={`Preview for ${lora.name}`}
            sizes="200px"
          />
        </div>

        {!compatible && (
          <div className="absolute inset-0 flex items-end bg-bg/72 p-2">
            <span className="font-mono text-[9.5px] uppercase tracking-wider text-amber">
              needs another base
            </span>
          </div>
        )}

        {selected && (
          <span className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center bg-accent text-[#06060A]">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 border-t border-border p-2.5">
        <span
          className={cn(
            "truncate font-sans text-[13px] font-semibold leading-tight",
            selected ? "text-accent" : "text-ink"
          )}
          title={lora.name}
        >
          {lora.name}
        </span>
        <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-ink-muted-2">
          <span className="truncate">{lora.author}</span>
          <span className="shrink-0 tabular-nums">{formatDownloads(lora.downloads)}</span>
        </div>
      </div>
    </button>
  );
}
