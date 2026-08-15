/**
 * The preview clip on a base-model card.
 *
 * These are full-quality source files (139 MB across the four), so nothing about this is
 * naive. The renditions shipped under /models are cropped at encode time to the 4:3 box
 * this component actually renders — no pixels are shipped for the layout to throw away —
 * and every clip is muted, silent-track-stripped and faststart-muxed.
 *
 * The playback rules matter as much as the encode:
 *
 * - `preload="none"` with a poster. First paint costs four JPEGs (~145 KB), not four
 *   videos. The MP4 is only fetched once something asks for it to move.
 * - **One clip plays at a time.** Four simultaneous decodes for a control strip is a
 *   waste of battery and bandwidth on a surface where three of the four are, by
 *   definition, not the one you chose. The selected card plays; hover or keyboard focus
 *   borrows playback and hands it back.
 * - Off-screen means paused. An IntersectionObserver stops the decoder the moment the
 *   strip scrolls away, which on this page it immediately does.
 * - `prefers-reduced-motion` pins it to the poster and never loads the video at all.
 */
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export function ModelPreview({
  slug,
  name,
  poster,
  /** Whether this card's model is the selected one. Border only — not a playback input. */
  active,
  /**
   * Whether this is *the* clip that should be moving. The caller owns the one-at-a-time
   * invariant, so this component can never be the reason two decoders are running.
   */
  play,
}: {
  slug: string;
  name: string;
  poster?: string;
  active: boolean;
  play: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const [onScreen, setOnScreen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const wants = !reducedMotion && onScreen && play;

  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setOnScreen(true);
      return;
    }

    // Seed the first answer from a synchronous measurement rather than waiting on the
    // observer. IntersectionObserver delivers on a frame boundary and doesn't deliver at
    // all while the tab is backgrounded or occluded, so an observer-only version leaves
    // every card stuck on its poster until the page happens to be looked at.
    const rect = el.getBoundingClientRect();
    setOnScreen(rect.bottom > -200 && rect.top < window.innerHeight + 200);

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (wants) {
      // The source is attached only now, so a card nobody looks at never costs a request.
      if (!video.src) video.src = slug.startsWith("http") ? slug : `/models/${slug}.mp4`;
      // Autoplay can still be refused (low-power mode, policy) — that is not an error,
      // and the poster underneath is a perfectly good fallback.
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [wants, slug]);

  return (
    <div
      ref={frameRef}
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden border bg-panel-2 transition-colors",
        active ? "border-accent/50" : "border-border"
      )}
    >
      <video
        ref={videoRef}
        poster={poster ?? (slug.startsWith("http") ? undefined : `/models/${slug}.jpg`)}
        muted
        loop
        playsInline
        preload="none"
        aria-label={`Preview clip for ${name}`}
        onLoadedData={() => setLoaded(true)}
        className="h-full w-full object-cover"
      />

      {/* Reads as a still until it isn't — so a paused card looks deliberate, not broken. */}
      {!wants && (
        <span
          aria-hidden="true"
          className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 border border-border-2 bg-bg/80 px-1.5 py-1 font-mono text-[9.5px] uppercase tracking-wider text-ink-muted backdrop-blur"
        >
          <Play className="h-2.5 w-2.5" />
          {reducedMotion ? "still" : "preview"}
        </span>
      )}

      {wants && !loaded && (
        <span className="absolute bottom-2 left-2 border border-border-2 bg-bg/80 px-1.5 py-1 font-mono text-[9.5px] uppercase tracking-wider text-ink-muted backdrop-blur">
          loading…
        </span>
      )}
    </div>
  );
}
