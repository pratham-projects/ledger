import { useState } from "react";
import { Clapperboard } from "lucide-react";
import { ResultTile } from "@/components/video/result-tile";
import { MediaViewer, type MediaItem } from "@/components/media/media-viewer";
import { shapeForSeed } from "@/components/video/result-tile";
import type { ResultTile as ResultTileData } from "@/hooks/use-video-generation";

// Every tile keeps its WebGL context alive indefinitely once ready (it's a looping clip,
// not a static image), so unlike the image page this caps ALL tiles, not just generating
// ones. Batch size tops out at 4 here anyway, so this is a defensive ceiling, not a
// day-to-day limit.
const MAX_CONCURRENT_SHADERS = 8;

const ASPECT_VALUE: Record<string, number> = { "16:9": 16 / 9, "9:16": 9 / 16, "1:1": 1 };

function formatDuration(totalFrames: number, fps = 24) {
  return `0:${String(Math.round(totalFrames / fps)).padStart(2, "0")}`;
}

export function ResultGrid({
  tiles,
  onRegenerate,
  onTogglePlaying,
  aspectRatio = "1:1",
}: {
  tiles: ResultTileData[];
  onRegenerate: (id: string) => void;
  onTogglePlaying: (id: string) => void;
  /** The ratio these clips were generated at — the viewer fits the stage to it. */
  aspectRatio?: string;
}) {
  const [viewing, setViewing] = useState<number | null>(null);

  if (tiles.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-2.5 border border-dashed border-border-2 text-ink-muted-2">
        <Clapperboard className="h-5 w-5" aria-hidden="true" />
        <p className="font-mono text-[11.5px]">clips will appear here</p>
      </div>
    );
  }

  // Only finished clips are openable — stepping onto one still encoding would show a
  // progress animation with nothing to watch.
  const ready = tiles.filter((t) => t.stage === "ready");
  const items: MediaItem[] = ready.map((t) => ({
    id: t.id,
    kind: "video",
    seed: t.seed,
    aspect: ASPECT_VALUE[aspectRatio] ?? 1,
    aspectLabel: aspectRatio,
    title: `clip · seed ${t.seed}`,
    shape: shapeForSeed(t.seed),
    playing: t.playing,
    onTogglePlaying: () => onTogglePlaying(t.id),
    meta: [
      { label: "duration", value: formatDuration(t.totalFrames) },
      { label: "frames", value: String(t.totalFrames) },
    ],
    caption: "placeholder motion — no video model is wired up yet.",
  }));

  return (
    <>
      <div
        className={
          tiles.length === 1
            ? "grid grid-cols-1"
            : "grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4"
        }
      >
        {tiles.map((tile, i) => (
          <ResultTile
            key={tile.id}
            tile={tile}
            onRegenerate={onRegenerate}
            onTogglePlaying={onTogglePlaying}
            shaderEligible={i < MAX_CONCURRENT_SHADERS}
            onOpen={
              tile.stage === "ready"
                ? () => setViewing(ready.findIndex((r) => r.id === tile.id))
                : undefined
            }
          />
        ))}
      </div>

      {viewing !== null && items[viewing] && (
        <MediaViewer
          items={items}
          index={viewing}
          onIndexChange={setViewing}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
