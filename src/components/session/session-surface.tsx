import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, Minimize2, Maximize2 } from "lucide-react";
import type { StickToBottom } from "@/hooks/use-stick-to-bottom";
import { cn } from "@/lib/utils";

/**
 * The frame every session runs inside: chat, RPG and story.
 *
 * FULL SCREEN IS THE DEFAULT, and that is the point of consolidating these. All three
 * surfaces are the same object — a log you read, a control bar you act from, a side panel
 * you configure from — and all three were previously boxed inside a scrolling page with
 * site chrome above them, which produced the same two failures every time: the composer
 * scrolled away from the reader, and the newest line ended up below the fold. On a phone,
 * where the visible column is barely taller than the keyboard, that was fatal.
 *
 * So the surface takes the viewport. One header, one scrolling region, one docked control
 * bar, and the page itself never scrolls. Leaving full screen is a toggle rather than a
 * one-way door, because the site's own navigation lives out there and someone who wants
 * it should not have to end their session to reach it.
 *
 * STRUCTURE, top to bottom:
 *   header   — who/where, session metadata, drawer and full-screen toggles
 *   log      — the only scrolling region, owning its own pinning (useStickToBottom)
 *   dock     — composer or command bar, always on screen
 *   drawer   — pushes the log on md+, takes the screen below it
 *
 * MOBILE. `100dvh` rather than `100vh`, so the frame tracks the browser's collapsing
 * address bar instead of hiding the dock behind it. The dock carries the bottom safe-area
 * inset for devices with a home indicator, and the header's metadata drops progressively
 * rather than wrapping into a second row that would eat the log.
 */
export function SessionSurface({
  full,
  onFullChange,
  header,
  dock,
  drawer,
  stick,
  children,
}: {
  full: boolean;
  onFullChange: (full: boolean) => void;
  /** Left-hand identity and metadata. Controls are appended by this component. */
  header: ReactNode;
  dock: ReactNode;
  /** Rendered beside the log on md+, over it below. Omit when closed. */
  drawer?: ReactNode;
  stick: StickToBottom;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!full) return;

    const onKey = (e: KeyboardEvent) => {
      // Not while typing — Escape in a field means "abandon this edit", not "leave".
      if (e.key === "Escape" && !(e.target as HTMLElement)?.closest("textarea, input")) {
        onFullChange(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [full, onFullChange]);

  const frame = (
    <div
      className={cn(
        // `relative` gives the mobile drawer (`absolute inset-0` in CharacterDrawer /
        // RpgDrawer) a containing block that is this frame's own box. Without it an
        // `absolute` child would climb to the nearest positioned ancestor — which, in
        // docked mode, is nothing, so it would fall back to the initial containing block
        // and stop matching this frame's `my-4` inset at all.
        "relative flex min-h-0",
        full
          ? /*
             * z-[100] rather than matching the hub sidebar's own z-60: full screen still
             * sits above the hub's topbar and credits readout, both of which it covers.
             * `lg:left-[236px]` leaves the hub rail alone at its expanded width — the rail
             * is permanent navigation, not chrome around the session, so "full screen"
             * means "the reading surface, maximized" rather than "everywhere the rail
             * used to be." Below `lg` the rail is already an off-canvas drawer with no
             * width of its own, so there's nothing to hold space for. `bg-bg` is opaque,
             * so nothing behind this frame is visible regardless; the higher z-index just
             * makes the stacking guaranteed rather than incidental.
             */
            "fixed inset-y-0 left-0 right-0 z-[100] h-[100dvh] bg-bg lg:left-[236px]"
          : /*
             * Docked, the frame still has to bound its own height — the log inside it
             * scrolls, and a `flex-1` in an ordinary page has nothing to be 1 *of*, so it
             * would collapse to its content and the surface would grow forever. Below
             * `xl` that's an explicit viewport fraction (`dvh` so a phone's collapsing
             * address bar doesn't cover the dock); at `xl` and up it instead fills exactly
             * what's left below the hub topbar (`61px`, the same measured constant
             * `.tool-workspace` subtracts) so the frame's bottom edge meets the viewport's
             * rather than stopping short and leaving dead page beneath it.
             */
            "my-4 h-[78dvh] min-h-[420px] border border-border bg-panel xl:my-0 xl:h-[calc(100dvh-61px)]"
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2.5 sm:gap-3 sm:px-4">
          {header}

          <SurfaceButton
            active={full}
            onClick={() => onFullChange(!full)}
            label={full ? "Leave full screen (esc)" : "Full screen"}
          >
            {full ? (
              <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </SurfaceButton>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={stick.scrollerRef}
            onScroll={stick.onScroll}
            className="ledger-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            {/* The single wrapper the ResizeObserver watches. Everything that can change
                the log's height has to be inside this one element. */}
            <div ref={stick.contentRef}>{children}</div>
          </div>

          {!stick.atBottom && (
            <button
              type="button"
              onClick={() => stick.scrollToLatest(true)}
              className={cn(
                "m-enter m-press absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-2",
                "border border-accent bg-panel px-3 py-2 font-mono text-[11.5px] text-accent",
                "shadow-[0_6px_20px_rgba(0,0,0,0.45)] transition-[filter] hover:brightness-125"
              )}
            >
              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              latest
              {stick.unread > 0 && (
                <span className="tabular-nums text-ink-muted">+{stick.unread}</span>
              )}
            </button>
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          {dock}
        </div>
      </div>

      {drawer}
    </div>
  );

  return full ? createPortal(frame, document.body) : frame;
}

/** Header control. Matches the Ledger button grammar without importing page-level Button. */
export function SurfaceButton({
  active,
  onClick,
  label,
  expanded,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  expanded?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-expanded={expanded}
      className={cn(
        "m-press inline-flex shrink-0 items-center gap-1.5 border px-2 py-1.5 font-mono text-[11.5px]",
        "transition-colors sm:px-2.5",
        active
          ? "border-accent text-accent"
          : "border-border-2 text-ink-muted hover:border-ink hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
