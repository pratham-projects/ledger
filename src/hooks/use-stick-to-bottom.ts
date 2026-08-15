import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps a log pinned to its newest entry, for chat, RPG and story alike.
 *
 * Three surfaces had three different answers to this and all three were wrong in a
 * different way, so it lives in one place now.
 *
 * THE HARD PART IS NOT THE SCROLL, IT IS KNOWING WHEN TO. Content in these surfaces grows
 * for four unrelated reasons — a message is appended, a line streams in a word at a time,
 * an illustration finishes loading and claims 200px of height, the composer grows a row —
 * and only the first is a React render you could hang an effect on. Chat's old
 * implementation watched `messages.length`, so a picture resolving under the newest reply
 * silently pushed it off screen; RPG's watched the whole turns array and re-scrolled on
 * every unrelated state change.
 *
 * So the trigger is a **ResizeObserver on the content**, which fires for all four causes
 * and nothing else. Growth while pinned scrolls; growth while the reader is elsewhere
 * does not.
 *
 * TWO RULES, and they are the whole contract:
 *
 * 1. **You never chase the log.** While you are at the bottom, you stay at the bottom.
 * 2. **You are never yanked away from it.** Scroll up to re-read something and pinning
 *    stops dead. A control appears saying how much arrived while you were away, and
 *    returning is your click, not ours.
 *
 * SMOOTH WHERE IT READS AS MOTION, INSTANT WHERE IT WOULD READ AS JUDDER. A new entry
 * arriving is one event and gets a smooth glide. A line streaming is sixty events a
 * second and gets instant correction — asking for `behavior: "smooth"` sixty times a
 * second queues sixty interrupted animations and produces visible stutter. Both look
 * continuous; only one of them is cheap.
 */

/** Distance from the bottom still counted as "at the bottom", in px. */
const STICK_THRESHOLD = 96;

export interface StickToBottom {
  /** Attach to the scrolling element. */
  scrollerRef: React.RefObject<HTMLDivElement>;
  /** Attach to the single child that wraps all the content. */
  contentRef: React.RefObject<HTMLDivElement>;
  /** Attach to the scroller's `onScroll`. */
  onScroll: () => void;
  /** True while the reader is at (or near) the newest entry. */
  atBottom: boolean;
  /** Entries that arrived while they were reading further up. */
  unread: number;
  /** Jump to the newest entry and resume pinning. */
  scrollToLatest: (smooth?: boolean) => void;
  /**
   * Call when a genuinely new entry lands, so the unread counter is accurate. Growth
   * alone can't tell an appended message from an image finishing.
   */
  noteArrival: () => void;
  /** Call on each streamed word. Corrects position without animating. */
  follow: () => void;
}

export function useStickToBottom(): StickToBottom {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [unread, setUnread] = useState(0);

  /**
   * Mirrors `atBottom` for the observer and the imperative callers. Reading React state
   * inside a ResizeObserver would capture whatever value existed when the observer was
   * created, which is exactly the stale-closure bug that makes these things unpin at
   * random.
   */
  const atBottomRef = useRef(true);

  const scrollToLatest = useCallback((smooth = false) => {
    const el = scrollerRef.current;
    if (!el) return;
    const top = el.scrollHeight - el.clientHeight;
    if (smooth) el.scrollTo({ top, behavior: "smooth" });
    else el.scrollTop = top;
    atBottomRef.current = true;
    setAtBottom(true);
    setUnread(0);
  }, []);

  const follow = useCallback(() => {
    if (!atBottomRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }, []);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const next = distance <= STICK_THRESHOLD;
    atBottomRef.current = next;
    setAtBottom(next);
    if (next) setUnread(0);
  }, []);

  const noteArrival = useCallback(() => {
    if (atBottomRef.current) scrollToLatest(true);
    else setUnread((n) => n + 1);
  }, [scrollToLatest]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;

    /*
     * Growth is corrected instantly, never smoothly. This fires for streaming text and
     * for images claiming their box — high-frequency, small-delta events where a smooth
     * scroll would be permanently mid-animation and never actually reach the bottom.
     * The smooth glide belongs to `noteArrival`, which fires once per entry.
     */
    const observer = new ResizeObserver(() => {
      if (!atBottomRef.current) return;
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight - el.clientHeight;
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return {
    scrollerRef,
    contentRef,
    onScroll,
    atBottom,
    unread,
    scrollToLatest,
    noteArrival,
    follow,
  };
}


/**
 * Convenience for the common case: call `noteArrival` whenever a count grows, without
 * every surface re-deriving the "did it grow, or was something deleted" logic.
 *
 * A plain "have I run before" boolean does not survive StrictMode's double invoke — the
 * second pass sails through it and fires on mount, which on chat meant scrolling past the
 * opening card before the visitor had read a word. Comparing against a ref seeded with
 * the initial count is the version that actually holds.
 */
export function useArrivalNotifier(count: number, notify: () => void, reducedInitial = true) {
  const seen = useRef(reducedInitial ? count : 0);
  useEffect(() => {
    if (count > seen.current) {
      seen.current = count;
      notify();
      return;
    }
    seen.current = count;
    // Keyed on the count alone: editing an entry in place must never move the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);
}
