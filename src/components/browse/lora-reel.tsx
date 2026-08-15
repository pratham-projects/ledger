import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LoraTile } from "@/components/browse/lora-tile";
import { CATEGORY_LABEL, type Lora, type LoraCategory } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** Tile width + gap, in px — the wind step. Must match the tile's w-[172px] and gap-3. */
const STEP = 172 + 12;

/**
 * A category as a reel you wind through rather than a grid you scroll past.
 *
 * The counter and the two-segment bar are the honest readout of position: how much of
 * this category you have wound past, and how much is still ahead. A plain horizontal
 * rail hides both — you cannot tell whether three more or thirty more are off-screen.
 */
export function LoraReel({
  category,
  loras,
  selectedId,
  onSelect,
  isCompatible,
}: {
  category: LoraCategory;
  loras: Lora[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isCompatible: (lora: Lora) => boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({
    scrollLeft: 0,
    maxScroll: 0,
    lead: 0,
    visibleRatio: 1,
  });

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    setMetrics({
      scrollLeft: el.scrollLeft,
      maxScroll,
      lead: Math.min(loras.length - 1, Math.round(el.scrollLeft / STEP)),
      visibleRatio: el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1,
    });
  }, [loras.length]);

  useEffect(() => {
    measure();
    const el = scrollerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const wind = (direction: -1 | 1) => {
    scrollerRef.current?.scrollBy({ left: direction * STEP * 2, behavior: "smooth" });
  };

  const windable = metrics.maxScroll > 1;
  const atStart = metrics.scrollLeft <= 1;
  const atEnd = metrics.scrollLeft >= metrics.maxScroll - 1;
  const progress = windable ? metrics.scrollLeft / metrics.maxScroll : 0;

  return (
    <>
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={measure}
          className="reel-scroller flex snap-x gap-3 overflow-x-auto p-4"
          role="group"
          aria-label={`${CATEGORY_LABEL[category]} reel`}
        >
          {loras.map((lora) => (
            <LoraTile
              key={lora.id}
              lora={lora}
              selected={lora.id === selectedId}
              compatible={isCompatible(lora)}
              onSelect={() => onSelect(lora.id)}
            />
          ))}
        </div>
      </div>

      {windable && (
        <div className="flex items-center gap-3 border-t border-border px-4 py-2.5">
          {/* Position readout: the thumb's width is how much of the reel is on screen,
              its offset is how far you've wound. Both facts a plain rail hides. */}
          <div className="relative h-1 flex-1 bg-panel-2" aria-hidden="true">
            {(() => {
              // Width is a share of the track; travel has to be re-expressed as a
              // share of the thumb, because that's what translateX(%) resolves
              // against. Worth the arithmetic: it keeps `left`/`width` out of the
              // transition, so winding the reel never animates a layout property.
              const thumb = Math.max(8, metrics.visibleRatio * 100);
              const travel = (progress * (100 - thumb) * 100) / thumb;
              return (
                <div
                  className="m-marker absolute inset-y-0 left-0 bg-accent"
                  style={{ width: `${thumb}%`, transform: `translateX(${travel}%)` }}
                />
              );
            })()}
          </div>

          <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ink-muted-2">
            {String(metrics.lead + 1).padStart(2, "0")}/{String(loras.length).padStart(2, "0")}
          </span>

          <div className="flex shrink-0 items-center gap-1.5">
            <WindButton
              direction="back"
              disabled={atStart}
              onClick={() => wind(-1)}
              label={`Wind back through ${CATEGORY_LABEL[category]}`}
            />
            <WindButton
              direction="forward"
              disabled={atEnd}
              onClick={() => wind(1)}
              label={`Wind forward through ${CATEGORY_LABEL[category]}`}
            />
          </div>
        </div>
      )}
    </>
  );
}


function WindButton({
  direction,
  disabled,
  onClick,
  label,
}: {
  direction: "back" | "forward";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  const Icon = direction === "back" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "border border-border-2 p-1 transition-colors",
        disabled
          ? "cursor-not-allowed text-ink-muted-2 opacity-40"
          : "text-ink hover:border-accent hover:text-accent"
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
