/**
 * A justified-rows grid for images of mixed aspect ratio.
 *
 * The obvious two answers are both wrong here. A fixed square grid crops every portrait
 * and landscape to the same box, which throws away the one thing that varies. CSS
 * multi-column masonry keeps the shapes but reorders the content down-then-across, so
 * "most recent first" stops being readable.
 *
 * So: justified rows, the newspaper/Flickr solution. Fill a row with items until their
 * combined aspect ratio exceeds the container, then scale that row to exactly the
 * container width. Every image keeps its true proportions, every row is flush on both
 * edges, and reading order is preserved.
 *
 * Performance is the reason this takes aspect ratios as *input* rather than measuring
 * loaded images:
 *
 * - The full layout is computed before a single byte is requested, so every tile has its
 *   exact final height from first paint. Zero layout shift, no reflow as images arrive.
 * - Each tile knows its own rendered width, so `sizes` is exact and the browser fetches
 *   the right rung of the srcset ladder — a 180px tile pulls 256px, not a 2048px original.
 * - `loading="lazy"` and `decoding="async"` keep off-screen rows off the network and off
 *   the main thread.
 *
 * Rows are recomputed on container resize, which is the only thing that can change them.
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ResolvingImage } from "@/components/media/resolving-image";
import { cn } from "@/lib/utils";

export interface JustifiedItem {
  id: string;
  /** width ÷ height. Required — this is what the layout is built from. */
  aspect: number;
  src: string;
  srcSet?: string;
  alt: string;
  /** Rendered over the tile, e.g. hover actions or a progress label. */
  overlay?: ReactNode;
  onClick?: () => void;
}

interface Placed extends JustifiedItem {
  width: number;
  height: number;
}

export function JustifiedGrid({
  items,
  targetHeight = 220,
  gap = 10,
  className,
}: {
  items: JustifiedItem[];
  /** The height rows aim for. Actual heights flex around it to make each row fit. */
  targetHeight?: number;
  gap?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Measured synchronously first: ResizeObserver delivers on a frame boundary and not
    // at all in a backgrounded tab, so an observer-only version renders nothing until the
    // page is looked at. The observer then handles every subsequent change.
    const read = () => setWidth(Math.floor(el.getBoundingClientRect().width));
    read();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rows = width > 0 ? layout(items, width, targetHeight, gap) : [];

  return (
    <div ref={containerRef} className={cn("flex flex-col", className)} style={{ gap }}>
      {rows.map((row, i) => (
        <div key={i} className="flex" style={{ gap }}>
          {row.map((item) => (
            <Tile key={item.id} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Tile({ item }: { item: Placed }) {
  const interactive = Boolean(item.onClick);
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={item.onClick}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          item.onClick?.();
        }
      }}
      aria-label={interactive ? item.alt : undefined}
      className={cn(
        "group relative shrink-0 overflow-hidden border border-border bg-panel-2",
        interactive && "cursor-zoom-in transition-colors hover:border-accent"
      )}
      style={{ width: item.width, height: item.height }}
    >
      <ResolvingImage
        src={item.src}
        srcSet={item.srcSet}
        // Exact, because the layout already knows what this tile measures.
        sizes={`${Math.round(item.width)}px`}
        alt={item.alt}
        loading="lazy"
        decoding="async"
        width={Math.round(item.width)}
        height={Math.round(item.height)}
      />
      {item.overlay}
    </div>
  );
}

/**
 * Greedy row packing.
 *
 * Items accumulate until the row's combined aspect ratio would render shorter than the
 * target height, then the row is scaled to fill the container exactly. The last row is
 * left at target height rather than stretched, so three leftover images don't blow up to
 * fill a width they were never meant to cover.
 */
function layout(
  items: JustifiedItem[],
  containerWidth: number,
  targetHeight: number,
  gap: number
): Placed[][] {
  const rows: Placed[][] = [];
  let row: JustifiedItem[] = [];
  let aspectSum = 0;

  const flush = (justify: boolean) => {
    if (row.length === 0) return;
    const available = containerWidth - gap * (row.length - 1);
    // Scaling by the aspect sum is what makes the row exactly fill the width.
    const height = justify ? available / aspectSum : targetHeight;

    let used = 0;
    const placed = row.map((item, i) => {
      // The last tile absorbs the rounding so rows land flush rather than a pixel short.
      const w = i === row.length - 1 && justify ? available - used : Math.round(height * item.aspect);
      used += w;
      return { ...item, width: w, height: Math.round(height) };
    });

    rows.push(placed);
    row = [];
    aspectSum = 0;
  };

  for (const item of items) {
    // Guard against a bad ratio taking the whole layout down with a division by zero.
    const aspect = Number.isFinite(item.aspect) && item.aspect > 0 ? item.aspect : 1;
    row.push({ ...item, aspect });
    aspectSum += aspect;

    const projected = (containerWidth - gap * (row.length - 1)) / aspectSum;
    if (projected <= targetHeight) flush(true);
  }
  flush(false);

  return rows;
}
