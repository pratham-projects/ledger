import { RefreshCw } from "lucide-react";
import { DitheringShader } from "@/components/ui/dithering-shader";
import { StockFill } from "@/components/media/stock-fill";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { ResultTile as ResultTileData, Stage } from "@/hooks/use-image-generation";

const STAGE_LABEL: Record<Stage, string> = {
  waiting: "waiting…",
  preparing: "preparing…",
  processing: "processing…",
  done: "",
};

export function ResultTile({
  tile,
  onRegenerate,
  shaderEligible,
  onOpen,
}: {
  tile: ResultTileData;
  onRegenerate: (id: string) => void;
  /** Whether this tile is allowed to run its own WebGL context — see MAX_CONCURRENT_SHADERS in result-grid.tsx */
  shaderEligible: boolean;
  /** Opens this result in the shared full-screen viewer. Absent while still generating. */
  onOpen?: () => void;
}) {
  const done = tile.stage === "done";
  const reducedMotion = useReducedMotion();
  const showShader = !done && shaderEligible && !reducedMotion;

  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (onOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={onOpen ? `Open result ${tile.seed} full screen` : undefined}
      className={cn(
        "group relative aspect-square overflow-hidden border border-border bg-panel-2",
        onOpen && "m-hover cursor-zoom-in hover:border-accent"
      )}
    >
      {done ? (
        // No motion role here on purpose. `done` means the pipeline finished, not that
        // the picture is on screen — the URL still has to be fetched. StockFill owns the
        // resolve so it fires when the image actually lands, not when the stage flips.
        <div className="absolute inset-0">
          <StockFill
            seedKey={tile.seed}
            alt={`Generated result, seed ${tile.seed}`}
            sizes="(min-width: 768px) 22vw, 45vw"
          />
        </div>
      ) : showShader ? (
        <DitheringShader
          shape="warp"
          type="4x4"
          colorBack="var(--panel-2)"
          colorFront="var(--accent)"
          pxSize={2}
          speed={0.9}
          className="absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-panel-2" />
      )}

      {!done && (
        <span
          key={tile.stage}
          className="ledger-cell-reveal absolute bottom-2 left-2 font-mono text-[10px] uppercase tracking-wider text-ink drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
        >
          {STAGE_LABEL[tile.stage]}
        </span>
      )}

      <span className="absolute bottom-2 right-2 font-mono text-[9.5px] text-ink-muted-2 opacity-0 transition-opacity group-hover:opacity-100">
        seed {tile.seed}
      </span>

      {done && (
        <div
          // The overlay covers the whole tile, so it has to let clicks through to the
          // tile underneath — only its own buttons are interactive.
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none absolute inset-0 flex items-start justify-end gap-1.5 bg-gradient-to-b from-black/55 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 [&>button]:pointer-events-auto"
        >
          <button
            type="button"
            title="Regenerate this tile"
            onClick={() => onRegenerate(tile.id)}
            className="border border-border-2 bg-panel/80 p-1.5 text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
