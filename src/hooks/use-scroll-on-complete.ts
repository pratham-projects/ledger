import * as React from "react";

const DURATION_MS = 500;

/** Ease-out cubic — arrives decisively rather than coasting in, matching the snap of
 *  every other arrival in the motion system rather than a lazy native ease. */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * A hand-rolled smooth scroll rather than `scrollIntoView({ behavior: "smooth" })`.
 * The native version is not reliable enough to hang a "here's what finished" cue on —
 * it silently no-ops in some browser/webview/automation contexts (confirmed: instant
 * `behavior: "auto"` moves the page, `"smooth"` does nothing, no error, no fallback).
 * Driving it by hand with `requestAnimationFrame` costs a few lines and works
 * everywhere `getBoundingClientRect` and `scrollTo` do.
 */
function animateScrollTo(targetY: number, durationMs: number) {
  const startY = window.scrollY;
  const delta = targetY - startY;
  if (Math.abs(delta) < 1) return;

  const startTime = performance.now();
  const tick = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    window.scrollTo(0, startY + delta * easeOutCubic(progress));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Brings the results into view the moment a generation finishes — on a phone the
 * composer fills the viewport, so a tap on "Generate" completing off-screen, below the
 * fold, looks like nothing happened. Fires on the `true → false` edge of `isGenerating`
 * only (never on mount, never while still running), so it reads as "here's what
 * finished" rather than yanking the page around on every render.
 *
 * `prefers-reduced-motion` degrades to an instant jump — the destination is what
 * matters, the glide there is the part that's optional.
 */
export function useScrollOnComplete(
  isGenerating: boolean,
  ref: React.RefObject<HTMLElement>
) {
  const wasGenerating = React.useRef(false);

  React.useEffect(() => {
    if (wasGenerating.current && !isGenerating && ref.current) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // `scroll-mt-*` on the target (set by every caller) supplies the offset from the
      // viewport's top edge, the same way native `scrollIntoView`/anchor scrolling reads
      // it — but that's `scroll-margin-top`, which only native scroll mechanisms apply
      // automatically. A manual `scrollTo` has to read and subtract it itself.
      const scrollMarginTop = Number.parseFloat(
        getComputedStyle(ref.current).scrollMarginTop || "0"
      );
      const targetY = window.scrollY + ref.current.getBoundingClientRect().top - scrollMarginTop;
      if (reduced) {
        window.scrollTo(0, targetY);
      } else {
        animateScrollTo(targetY, DURATION_MS);
      }
    }
    wasGenerating.current = isGenerating;
  }, [isGenerating, ref]);
}
