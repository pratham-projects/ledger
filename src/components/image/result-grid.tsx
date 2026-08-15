import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { ResultTile } from "@/components/image/result-tile";
import { MediaViewer, type MediaItem } from "@/components/media/media-viewer";
import { useSelection } from "@/hooks/use-selection";
import type { ResultTile as ResultTileData } from "@/hooks/use-image-generation";

// Browsers cap live WebGL contexts per page (~16 in Chrome); batch size can go up to 32,
// so only the first N still-generating tiles get their own shader — the rest fall back
// to a plain CSS pulse in ResultTile until a shader slot frees up.
const MAX_CONCURRENT_SHADERS = 9;

export function ResultGrid({
  tiles,
  onRegenerate,
}: {
  tiles: ResultTileData[];
  onRegenerate: (id: string) => void;
}) {
  const { lora } = useSelection();
  const [viewing, setViewing] = useState<number | null>(null);

  if (tiles.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-2.5 border border-dashed border-border-2 text-ink-muted-2">
        <ImageIcon className="h-5 w-5" aria-hidden="true" />
        <p className="font-mono text-[11.5px]">results will appear here</p>
      </div>
    );
  }

  let activeRank = 0;

  // Only finished tiles are openable, and the viewer pages through those alone — stepping
  // onto a half-generated tile would show a progress animation with no way to read it.
  const done = tiles.filter((t) => t.stage === "done");
  const items: MediaItem[] = done.map((t) => ({
    id: t.id,
    kind: "image",
    seed: t.seed,
    aspect: 1,
    aspectLabel: "1:1",
    hue: lora?.hue,
    title: lora ? `${lora.name} · seed ${t.seed}` : `seed ${t.seed}`,
    caption: lora ? `Generated with ${lora.name}` : "Generated image",
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
        {tiles.map((tile) => {
          const isActive = tile.stage !== "done";
          const shaderEligible = isActive && activeRank < MAX_CONCURRENT_SHADERS;
          if (isActive) activeRank++;
          return (
            <ResultTile
              key={tile.id}
              tile={tile}
              onRegenerate={onRegenerate}
              shaderEligible={shaderEligible}
              onOpen={
                isActive ? undefined : () => setViewing(done.findIndex((d) => d.id === tile.id))
              }
            />
          );
        })}
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
