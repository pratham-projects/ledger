import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { StockFill } from "@/components/media/stock-fill";
import { DitheringShader } from "@/components/ui/dithering-shader";
import { MediaViewer, type MediaItem } from "@/components/media/media-viewer";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * A generated illustration inside a narrative surface. Shared by RPG and Story — both
 * need "the LoRA drew this bit" with the same staged-progress honesty the image
 * generator uses, but neither needs the full result-grid apparatus.
 */
export function SceneImage({
  seed,
  caption,
  generating,
  aspect = "wide",
}: {
  seed: number;
  caption: string;
  generating: boolean;
  aspect?: "wide" | "square";
}) {
  const reducedMotion = useReducedMotion();
  const [viewing, setViewing] = useState(false);

  const openable = !generating;
  const item: MediaItem = {
    id: `scene-${seed}`,
    kind: "scene",
    seed,
      aspect: aspect === "wide" ? 16 / 9 : 1,
    aspectLabel: aspect === "wide" ? "16:9" : "1:1",
    title: `scene · seed ${seed}`,
    caption,
  };

  return (
    /*
     * `m-media-in` claims the frame; `m-resolve` (inside ResolvingImage) lands the bytes.
     * Two events, two roles, in sequence — the container is ruled onto the page the
     * moment the model commits to an illustration, and the picture de-noises into it
     * when it actually arrives. Without the first one an illustration appeared as an
     * abrupt 200px shove of everything below it.
     */
    <figure className="m-media-in m-0 border border-border bg-panel-2">
      <div
        role={openable ? "button" : undefined}
        tabIndex={openable ? 0 : undefined}
        onClick={openable ? () => setViewing(true) : undefined}
        onKeyDown={(e) => {
          if (openable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setViewing(true);
          }
        }}
        aria-label={openable ? "Open this scene full screen" : undefined}
        className={cn(
          "group relative overflow-hidden",
          aspect === "wide" ? "aspect-[16/9]" : "aspect-square",
          openable && "cursor-zoom-in"
        )}
      >
        {generating ? (
          reducedMotion ? (
            <div className="absolute inset-0 animate-pulse bg-panel-2" />
          ) : (
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
          )
        ) : (
          <div className="absolute inset-0">
            <StockFill
              seedKey={seed}
              alt={caption}
              sizes="(min-width: 1280px) 680px, 92vw"
            />
          </div>
        )}

        {generating && (
          <span className="ledger-cell-reveal absolute bottom-2 left-2 font-mono text-[10px] uppercase tracking-wider text-ink drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            illustrating…
          </span>
        )}

        {openable && (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 border border-border-2 bg-panel/85 p-1.5 text-ink-muted opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <figcaption className="flex items-center justify-between gap-3 border-t border-border px-3 py-2 font-mono text-[10px] text-ink-muted-2">
        <span className="truncate">{caption}</span>
        <span className="shrink-0 tabular-nums">seed {seed}</span>
      </figcaption>

      {viewing && (
        <MediaViewer
          items={[item]}
          index={0}
          onIndexChange={() => {}}
          onClose={() => setViewing(false)}
        />
      )}
    </figure>
  );
}
