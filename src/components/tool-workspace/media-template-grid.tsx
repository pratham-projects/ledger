import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon, Film, Star } from "lucide-react";
import { VideoTile } from "@/components/hub/video-tile";
import { ResolvingImage } from "@/components/media/resolving-image";
import { TemplateDetailModal } from "@/components/tool-workspace/template-detail-modal";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import type { ReferenceMedia } from "@/hooks/use-selection";

export interface MediaTemplate extends ReferenceMedia {
  id: string;
  /** Width ÷ height — from `ffprobe`/PIL at author time (`lib/template-videos.ts` /
   *  `lib/template-images.ts`), never guessed. Drives the tile's own box, not a crop. */
  aspect: number;
  /** Small portrait crops for the detail popup's "References" row. */
  references?: string[];
  /** Plain labels for the detail popup's "Settings" row (e.g. a style, a duration). */
  settings?: string[];
}

type TypeFilter = "image" | "video" | "favorites";

/**
 * The "Templates" tab body — shared by every tool whose starting point is a piece of
 * media (image, video; chat/RPG/story don't have one and don't use this) — and "My
 * Generations", which reuses it with `filterable` on.
 *
 * A real grid now, capped at `columns` (3 everywhere, 4 on `/profile`'s wider column) —
 * fewer, larger tiles read as a gallery instead of a contact sheet. Each cell still keeps
 * its item's real `aspect` rather than cropping to a square.
 *
 * Tapping a tile opens `TemplateDetailModal` rather than loading the composer straight
 * away — a caption is enough to browse by, not enough to decide whether to spend credits
 * recreating it. `Recreate`, inside that modal, is what actually writes into
 * `useSelection`'s `referenceMedia`.
 */
export function MediaTemplateGrid({
  items,
  unit,
  onSelect,
  columns = 3,
  filterable = false,
}: {
  items: MediaTemplate[];
  /** "clips" or "images" — the counter's noun. */
  unit: string;
  onSelect: (item: MediaTemplate) => void;
  /** Column cap at rest width. 3 everywhere except `/profile`'s wider grid (4). */
  columns?: 3 | 4;
  /** "My Generations" gets the image/video/favorites filter row; "Templates" doesn't —
   *  there's nothing of yours to narrow down there. */
  filterable?: boolean;
}) {
  const navigate = useNavigate();
  const [viewing, setViewing] = React.useState<MediaTemplate | null>(null);
  const lastViewing = React.useRef<MediaTemplate | null>(null);
  if (viewing) lastViewing.current = viewing;

  const [filter, setFilter] = React.useState<TypeFilter | null>(null);
  const favorites = useFavorites();

  const filtered = React.useMemo(() => {
    if (!filter) return items;
    if (filter === "favorites") return items.filter((item) => favorites.has(item.id));
    return items.filter((item) => item.type === filter);
  }, [items, filter, favorites]);

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="m-0 text-[12.5px] leading-[1.5] text-ink-muted-2">Pick one to see the full prompt.</p>
        <span className="desk-data shrink-0 text-ink-muted-2" style={{ fontSize: "11px" }}>
          {filtered.length} {unit}
        </span>
      </div>

      {filterable && (
        <div className="mb-3 flex items-center gap-1.5" role="group" aria-label="Filter your generations">
          <FilterButton
            active={filter === "image"}
            label="Images only"
            onClick={() => setFilter((f) => (f === "image" ? null : "image"))}
          >
            <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </FilterButton>
          <FilterButton
            active={filter === "video"}
            label="Videos only"
            onClick={() => setFilter((f) => (f === "video" ? null : "video"))}
          >
            <Film className="h-3.5 w-3.5" aria-hidden="true" />
          </FilterButton>
          <FilterButton
            active={filter === "favorites"}
            label="Favorites only"
            onClick={() => setFilter((f) => (f === "favorites" ? null : "favorites"))}
          >
            <Star className="h-3.5 w-3.5" aria-hidden="true" fill={filter === "favorites" ? "currentColor" : "none"} />
          </FilterButton>
        </div>
      )}

      <div className="tplx-grid" style={{ "--tplx-cols": columns } as React.CSSProperties}>
        {filtered.map((item) => (
          <div key={item.id} className="tplx-grid-cell" style={{ aspectRatio: item.aspect }}>
            <button
              type="button"
              onClick={() => setViewing(item)}
              title={item.prompt}
              className="tplx-grid-tile"
            >
              {/* Both branches go through the resolving pair rather than a bare element:
                  a gallery of raw `<img>`/`<video>` pops in tile by tile and shows nothing
                  at all when a URL fails. `ResolvingImage` is the system's only sanctioned
                  `<img>` (see DESIGN.md); `VideoTile` is its clip-shaped sibling. */}
              {item.type === "video" ? (
                <VideoTile src={item.url} label={item.prompt} />
              ) : (
                <ResolvingImage
                  src={item.url}
                  alt={item.prompt}
                  loading="lazy"
                  className="absolute inset-0"
                />
              )}
            </button>

            {filterable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  favorites.toggle(item.id);
                }}
                aria-label={favorites.has(item.id) ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={favorites.has(item.id)}
                className="tplx-grid-fav"
                data-active={favorites.has(item.id)}
              >
                <Star className="h-3.5 w-3.5" aria-hidden="true" fill={favorites.has(item.id) ? "currentColor" : "none"} />
              </button>
            )}
          </div>
        ))}
      </div>

      {filterable && filtered.length === 0 && (
        <div className="tool-tab-empty">
          <p className="m-0 text-[13.5px] leading-[1.6] text-ink-muted">Nothing matches this filter yet.</p>
        </div>
      )}

      <TemplateDetailModal
        open={viewing !== null}
        item={viewing ?? lastViewing.current}
        onClose={() => setViewing(null)}
        onRecreate={() => {
          if (viewing) {
            onSelect(viewing);
            // `Recreate` fires from more than one screen — a tool's own Templates tab
            // (already on the right route, so this is a no-op navigation) and `/profile`'s
            // "My work" grid (where it's the only thing that takes you anywhere). Routing
            // off the item's own type, rather than assuming the current page, is what
            // makes it work the same from both places instead of silently doing nothing
            // on `/profile`.
            navigate(viewing.type === "video" ? "/video" : "/image");
          }
          setViewing(null);
        }}
      />
    </>
  );
}

function FilterButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center border transition-colors",
        active
          ? "border-accent text-accent"
          : "border-border-2 text-ink-muted-2 hover:border-ink-muted hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
