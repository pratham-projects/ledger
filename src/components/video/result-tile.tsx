import { useMemo } from "react";
import { RefreshCw, Play, Pause } from "lucide-react";
import { DitheringShader, type DitheringShape } from "@/components/ui/dithering-shader";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { ResultTile as ResultTileData, Stage } from "@/hooks/use-video-generation";
import { cn } from "@/lib/utils";

const SHAPE_ROTATION: DitheringShape[] = ["warp", "ripple", "wave", "dots", "swirl"];

/** Exported so the full-screen viewer shows the same clip this tile is showing. */
export function shapeForSeed(seed: number): DitheringShape {
  return SHAPE_ROTATION[seed % SHAPE_ROTATION.length];
}

function formatDuration(totalFrames: number, fps = 24) {
  const seconds = Math.round(totalFrames / fps);
  return `0:${String(seconds).padStart(2, "0")}`;
}

const STAGE_LABEL: Record<Stage, (tile: ResultTileData) => string> = {
  queued: () => "queued…",
  rendering: (tile) => `rendering ${tile.frame}/${tile.totalFrames}`,
  encoding: () => "encoding…",
  ready: () => "",
};

export function ResultTile({
  tile,
  onRegenerate,
  onTogglePlaying,
  shaderEligible,
  onOpen,
}: {
  tile: ResultTileData;
  onRegenerate: (id: string) => void;
  onTogglePlaying: (id: string) => void;
  /** Whether this tile is allowed to run its own WebGL context — see MAX_CONCURRENT_SHADERS in result-grid.tsx */
  shaderEligible: boolean;
  /** Opens this clip in the shared full-screen viewer. Absent until it's ready. */
  onOpen?: () => void;
}) {
  const ready = tile.stage === "ready";
  const reducedMotion = useReducedMotion();
  const shape = useMemo(() => shapeForSeed(tile.seed), [tile.seed]);
  const animating = !reducedMotion && (!ready || tile.playing);
  const showShader = shaderEligible && !reducedMotion;

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
      aria-label={onOpen ? `Open clip ${tile.seed} full screen` : undefined}
      className={cn(
        "group relative aspect-square overflow-hidden border border-border bg-panel-2",
        onOpen && "m-hover cursor-zoom-in hover:border-accent"
      )}
    >
      {showShader ? (
        <DitheringShader
          shape={shape}
          type="4x4"
          colorBack="var(--panel-2)"
          colorFront="var(--accent)"
          pxSize={2}
          speed={animating ? 0.8 : 0}
          className="absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <div className={cn("absolute inset-0 bg-panel-2", !ready && "animate-pulse")} />
      )}

      {!ready ? (
        <span
          key={tile.stage}
          className="ledger-cell-reveal absolute bottom-2 left-2 font-mono text-[10px] uppercase tracking-wider text-ink drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
        >
          {STAGE_LABEL[tile.stage](tile)}
        </span>
      ) : (
        <span className="absolute bottom-2 left-2 font-mono text-[10px] text-ink drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          {formatDuration(tile.totalFrames)}
        </span>
      )}

      <span className="absolute bottom-2 right-2 font-mono text-[9.5px] text-ink-muted-2 opacity-0 transition-opacity group-hover:opacity-100">
        seed {tile.seed}
      </span>

      {ready && (
        <div
          // The overlay covers the whole tile, so it has to let clicks through to the
          // tile underneath — only its own buttons are interactive.
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none absolute inset-0 flex items-start justify-end gap-1.5 bg-gradient-to-b from-black/55 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 [&>button]:pointer-events-auto"
        >
          <button
            type="button"
            title={tile.playing ? "Pause" : "Play"}
            onClick={() => onTogglePlaying(tile.id)}
            className="border border-border-2 bg-panel/80 p-1.5 text-ink transition-colors hover:border-accent hover:text-accent"
          >
            {tile.playing ? (
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            title="Regenerate this clip"
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
