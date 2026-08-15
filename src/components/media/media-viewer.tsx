/**
 * The one full-screen viewer for every generated thing on the site — image tiles, video
 * clips, and the scene illustrations inside RPG and Story.
 *
 * It exists because those three surfaces each had their own small fixed-size preview and
 * no way to see the result properly. Rather than three lightboxes, they hand this a
 * MediaItem and it renders whatever that item is at whatever aspect ratio it has.
 *
 * The stage fits by aspect ratio rather than cropping: a 9:16 portrait and a 16:9 clip
 * both land fully visible inside the same box. Nothing is upscaled from the thumbnail —
 * the photo re-requests the top rung of its srcset ladder and the shader re-renders at the
 * container's real pixel size, so opening something full-screen genuinely shows more.
 *
 * A photo's ratio comes from the image itself rather than from whatever the caller
 * declared, because the caller is usually guessing from the box it drew.
 */
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { stockFor } from "@/lib/stock";
import { DitheringShader, type DitheringShape } from "@/components/ui/dithering-shader";
import { ResolvingImage } from "@/components/media/resolving-image";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export type MediaKind = "image" | "video" | "scene";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  seed: number;
  /** width ÷ height. Drives the stage box, so any ratio fits without cropping. */
  aspect: number;
  /** How that ratio reads in the chrome — "16:9", "1:1". */
  aspectLabel: string;
  title?: string;
  caption?: string;
  meta?: { label: string; value: string }[];
  /** Video only — which shader shape stands in for this clip. */
  shape?: DitheringShape;
  /** Video only. */
  playing?: boolean;
  onTogglePlaying?: () => void;
}

/**
 * Header + footer + the stage's own vertical padding, in px. Used to derive the stage
 * height from the viewport; both bars are fixed-height by construction, so this stays
 * accurate as long as their padding doesn't change.
 */
const CHROME_HEIGHT = 140;

export function MediaViewer({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: MediaItem[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  const step = useCallback(
    (delta: number) => {
      if (items.length < 2) return;
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  // The page behind must not scroll while this is up.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const photo = useMemo(
    () => (!item || item.kind === "video" ? null : stockFor(item.seed)),
    [item]
  );

  if (!item) return null;

  // Photos carry their own true ratio; a clip uses the one the caller generated it at.
  const ratio = photo?.aspect ?? item.aspect;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title ?? `${item.kind} preview`}
      // Heavier than the site's /70 modal scrim — this one has to let a picture read.
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <header
        className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="shrink-0 border border-border-2 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-accent">
          {item.kind}
        </span>
        <span className="truncate font-sans text-[14px] font-semibold text-ink">
          {item.title ?? `seed ${item.seed}`}
        </span>
        <span className="shrink-0 font-mono text-[11px] text-ink-muted-2">{item.aspectLabel}</span>

        {items.length > 1 && (
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-muted-2">
            {index + 1} / {items.length}
          </span>
        )}

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 border border-border-2 px-2.5 py-1.5 font-mono text-[11.5px] text-ink-muted transition-colors hover:border-ink hover:text-ink"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          esc
        </button>
      </header>

      <div className="flex min-h-0 flex-1 items-center gap-2 px-2 sm:px-4">
        {items.length > 1 && (
          <NavButton onClick={() => step(-1)} label="Previous">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </NavButton>
        )}

        <div className="flex h-full min-w-0 flex-1 items-center justify-center py-4">
          {/*
            Fit any ratio without cropping or stretching.

            Only the width is set; the height comes from aspect-ratio. Setting both (via
            h-full + max-w-full) silently wins over aspect-ratio the moment max-width
            clamps a wide item — the box keeps the full height and the picture stretches.
            Deriving width from the available height instead keeps the ratio exact:
            width = min(container, availableHeight × ratio).
          */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              aspectRatio: String(ratio),
              width: `min(100%, calc((100dvh - ${CHROME_HEIGHT}px) * ${ratio}))`,
            }}
            className="relative overflow-hidden border border-border bg-panel-2"
          >
            {item.kind === "video" ? (
              reducedMotion ? (
                <div className="absolute inset-0 bg-panel-2" />
              ) : (
                <DitheringShader
                  shape={item.shape ?? "warp"}
                  type="4x4"
                  colorBack="var(--panel-2)"
                  colorFront="var(--accent)"
                  pxSize={2}
                  speed={item.playing === false ? 0 : 0.8}
                  className="absolute inset-0"
                />
              )
            ) : (
              photo && (
                <ResolvingImage
                  src={photo.src(1536)}
                  srcSet={photo.srcSet}
                  // The stage is the largest this image ever renders, so ask for the top
                  // of the ladder here and nowhere else. It is also the one place the
                  // resolve is most worth watching, because the jump from the tile's
                  // 512px rung to this one is a real fetch every time.
                  sizes="90vw"
                  alt={item.caption ?? item.title ?? "Generated result"}
                  decoding="async"
                  fit="contain"
                  className="absolute inset-0 bg-transparent"
                />
              )
            )}

            {item.kind === "video" && item.onTogglePlaying && (
              <button
                type="button"
                onClick={item.onTogglePlaying}
                aria-label={item.playing ? "Pause" : "Play"}
                className="absolute bottom-3 left-3 border border-border-2 bg-panel/85 p-2 text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent"
              >
                {item.playing ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>

        {items.length > 1 && (
          <NavButton onClick={() => step(1)} label="Next">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </NavButton>
        )}
      </div>

      <footer
        className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <Meta label="seed" value={String(item.seed)} />
        {item.meta?.map((m) => (
          <Meta key={m.label} label={m.label} value={m.value} />
        ))}
        <p className="m-0 ml-auto max-w-[54ch] text-right font-mono text-[10px] leading-[1.6] text-ink-muted-2">
          {item.caption ?? "Generated media"}
        </p>
      </footer>
    </div>,
    document.body
  );
}

function NavButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className={cn(
        "shrink-0 border border-border-2 bg-panel/80 p-2 text-ink-muted transition-colors",
        "hover:border-accent hover:text-accent"
      )}
    >
      {children}
    </button>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted-2">
        {label}
      </span>
      <span className="font-mono text-[12px] tabular-nums text-ink">{value}</span>
    </span>
  );
}
