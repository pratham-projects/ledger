import { cn } from "@/lib/utils";
import type { Preset } from "@/components/tool-workspace/preset-list";

/**
 * The grid counterpart of `PresetList` — a character, location or scenario is a face or a
 * scene before it is a name, so the tile leads with the stock image and carries its name
 * and hook underneath, the same way `MediaTemplateGrid` does for image/video templates.
 * Used wherever a preset picker used to be a plain list (chat and story's Templates tab,
 * and the logged-in "my characters" grid in My Generations).
 */
export function PresetGrid({
  items,
  activeId,
  onSelect,
  aspect = 3 / 4,
  layout = "wrap",
}: {
  items: Preset[];
  activeId?: string;
  onSelect: (id: string) => void;
  /** Width ÷ height for the image tile — 3/4 (portrait) for faces, wider for scenes. */
  aspect?: number;
  /** "wrap" (default): a grid that wraps to new rows. "scroll": a single horizontally
   *  scrollable row of smaller tiles, for sections stacked one above another. */
  layout?: "wrap" | "scroll";
}) {
  const isScroll = layout === "scroll";
  return (
    <ul
      className={cn(
        "m-0 p-0",
        isScroll
          ? "flex snap-x gap-2 overflow-x-auto pb-1"
          : "grid grid-cols-2 gap-2.5 sm:grid-cols-3"
      )}
    >
      {items.map((p) => (
        <li key={p.id} className={isScroll ? "shrink-0 snap-start" : "contents"}>
          <button
            type="button"
            onClick={() => onSelect(p.id)}
            data-active={p.id === activeId}
            title={p.note}
            className={cn(
              "m-hover group flex flex-col gap-1 border border-border p-1 text-left transition-colors",
              "hover:border-accent data-[active=true]:border-accent data-[active=true]:bg-panel-2",
              isScroll && "w-[140px]"
            )}
          >
            <div
              className="overflow-hidden border border-border-2 bg-panel-2"
              style={{ aspectRatio: aspect }}
            >
              {p.image && (
                <img
                  src={p.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <span className="block truncate px-0.5 text-[11px] font-semibold text-ink">
              {p.name}
            </span>
            <span className="block truncate px-0.5 text-[9.5px] leading-[1.3] text-ink-muted-2">
              {p.note}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
