import * as React from "react";
import { cn } from "@/lib/utils";

type Phase = "pending" | "resolved" | "instant" | "error";

/**
 * Every image in the product, and the only place an image is allowed to appear.
 *
 * The problem it solves is specific. Generation finishes and the backend hands back a
 * *URL* — the picture does not exist on screen yet, it still has to be fetched and
 * decoded. That gap is invisible to the generation pipeline (which is already "done") but
 * very visible to the user, and filling it with nothing produces the pop-in this design
 * system otherwise never has. So the gap gets the `m-pending` latent field, and the
 * arrival gets `m-resolve` — the image de-noises into place exactly the way the product's
 * own subject does. See docs/motion.md.
 *
 * This is deliberately **not** the generating animation. `DitheringShader` still owns the
 * "the model is working" state on image and video; this owns only "the bytes are on their
 * way". The two run in sequence: shader while generating, then this while the URL loads.
 *
 * Three behaviours that matter more than they look:
 *
 * - **A cached image never animates.** `complete` is checked in a layout effect, before
 *   paint, so an image the browser already has skips straight to `instant`. Without this,
 *   every scroll back up a catalog would replay a loading state that never happened —
 *   which is both a lie and a flicker.
 * - **`src` changes reset the phase.** A tile that re-seeds is loading again.
 * - **Failure is a designed state.** A broken URL says so in the product's own voice
 *   rather than leaving an empty box or a browser glyph.
 * - **The resolve class is dropped once it has played.** `m-resolve` is `fill: both`, so
 *   leaving it on would pin `filter` forever and permanently block the hover lift on
 *   media (`.m-hover:hover img`). Retiring it on `animationend` hands the property back
 *   to the cascade and releases the compositor layer.
 *
 * Reduced motion needs no branch here: the global escape in styles/motion.css neutralises
 * `m-pending` and `m-resolve` to their still states, and the image is still hidden while
 * genuinely loading because there is genuinely nothing to show yet.
 */
export function ResolvingImage({
  className,
  fit = "cover",
  alt,
  src,
  onLoad,
  onError,
  ...img
}: Omit<React.ImgHTMLAttributes<HTMLImageElement>, "className"> & {
  alt: string;
  /** Classes for the wrapper, which is what occupies the layout box. */
  className?: string;
  fit?: "cover" | "contain";
}) {
  const [phase, setPhase] = React.useState<Phase>("pending");
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Before paint, not after: an already-decoded image must never flash a pending state.
  React.useLayoutEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    if (el.complete) setPhase(el.naturalWidth > 0 ? "instant" : "error");
    else setPhase("pending");
  }, [src]);

  return (
    <span className={cn("relative block h-full w-full overflow-hidden bg-panel-2", className)}>
      {phase === "pending" && <span aria-hidden="true" className="m-pending absolute inset-0" />}

      <img
        {...img}
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={(e) => {
          // `instant` already won the race in the layout effect; don't restage it.
          setPhase((p) => (p === "pending" ? "resolved" : p));
          onLoad?.(e);
        }}
        onError={(e) => {
          setPhase("error");
          onError?.(e);
        }}
        onAnimationEnd={() => setPhase((p) => (p === "resolved" ? "instant" : p))}
        style={phase === "pending" || phase === "error" ? { opacity: 0 } : undefined}
        className={cn(
          "h-full w-full",
          fit === "contain" ? "object-contain" : "object-cover",
          phase === "resolved" && "m-resolve"
        )}
      />

      {phase === "error" && (
        <span className="absolute inset-0 flex items-center justify-center p-2 text-center font-mono text-[10px] uppercase tracking-wider text-ink-muted-2">
          image unavailable
        </span>
      )}
    </span>
  );
}
