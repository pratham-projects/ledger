import * as React from "react";
import { cn } from "@/lib/utils";

type Phase = "pending" | "resolved" | "instant" | "error";

/**
 * A grid tile's clip: a still first frame at rest, playing only on hover.
 *
 * An earlier version of this autoplayed every tile once it scrolled into view. With ten
 * Inspirations categories on one page that meant dozens of clips decoding at once, which
 * saturated the browser's per-origin connection limit badly enough that *previously
 * loaded* video elsewhere on the page stalled too — the whole page's video went black, not
 * just the grid. Hover-to-play is also just the right interaction for a grid you're
 * scanning rather than watching: one clip plays at a time, the one under the pointer.
 *
 * `src` is only assigned once the tile is near the viewport (`IntersectionObserver` with a
 * generous `rootMargin`, so it's ready slightly before it's seen) — an offscreen tile
 * fetches nothing at all.
 *
 * **This is `ResolvingImage`'s problem, one element over.** A `<video>` with nothing
 * decoded paints nothing, and that is most of a tile's life: no source until it is
 * observed, then a round trip and a decode. Left bare, a category reads as a row of empty
 * rectangles filling in one at a time — and a clip that 403s or that the browser cannot
 * decode leaves its rectangle empty for good, saying nothing. So this borrows that
 * component's vocabulary exactly rather than inventing a second one: the `m-pending` latent
 * field holds the space, `m-resolve` de-noises the first frame into place, and failure is a
 * designed state that names what is missing. Nothing here fabricates a poster frame — a
 * tile with no frame does not pretend to have one.
 *
 * It cannot literally *be* `ResolvingImage`: that component owns an `<img>`, and the
 * hover-play, loop and decode behaviour here is the whole point of the tile.
 */
export function VideoTile({
  src,
  label,
  className,
}: {
  src: string;
  /** Named in the failure state, so a tile that cannot draw still says what it is. */
  label?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [phase, setPhase] = React.useState<Phase>("pending");

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "200px",
      threshold: 0.1,
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <span className={cn("relative block h-full w-full overflow-hidden bg-panel-2", className)}>
      {phase === "pending" && <span aria-hidden="true" className="m-pending absolute inset-0" />}

      <video
        ref={ref}
        src={visible ? src : undefined}
        muted
        loop
        playsInline
        preload={visible ? "auto" : "none"}
        onLoadedData={() => setPhase((p) => (p === "pending" ? "resolved" : p))}
        onError={() => setPhase("error")}
        onAnimationEnd={() => setPhase((p) => (p === "resolved" ? "instant" : p))}
        onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
        onMouseLeave={(e) => {
          e.currentTarget.pause();
          e.currentTarget.currentTime = 0;
        }}
        style={phase === "pending" || phase === "error" ? { opacity: 0 } : undefined}
        className={cn("h-full w-full object-cover", phase === "resolved" && "m-resolve")}
      />

      {phase === "error" && (
        <span className="absolute inset-0 flex items-center justify-center p-2 text-center font-mono text-[10px] uppercase leading-[1.4] tracking-wider text-ink-muted-2">
          {label ?? "clip unavailable"}
        </span>
      )}
    </span>
  );
}
