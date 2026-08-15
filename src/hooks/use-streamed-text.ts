import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Text arriving the way a model produces it: progressively, word by word.
 *
 * WHY THIS EXISTS AT ALL. In a surface where both you and the model write into the same
 * column, the single most important thing the interface has to communicate is *which of
 * you wrote a given line*. A speaker label does part of that job. But a label is a claim
 * you have to read; a line that visibly assembles itself in front of you is a fact you
 * cannot miss, and it is the convention every generative product has settled on for
 * exactly that reason. Your own words appear instantly because you already have them.
 * The model's do not, and pretending otherwise loses the distinction.
 *
 * WHAT IT IS NOT. It does not claim the text is AI-generated. In this build the prose
 * comes from authored pools (see use-chat / use-rpg / use-story), and every surface says
 * so plainly next to the log. What streams here is the *presentation* of an assistant
 * turn — the same component will be driven by real tokens the day the backend streams
 * them, and nothing above it needs to change.
 *
 * SHAPE. Words, not characters. A character ticker is a terminal effect and reads as a
 * costume; whole words de-noising in sequence is this system's own arrival language
 * (`m-stream`) played over time. Whitespace is preserved by splitting on the boundary
 * rather than on the space, so `whitespace-pre-wrap` still works and paragraph breaks in
 * narration survive intact.
 *
 * TIMING IS `requestAnimationFrame` AGAINST A PRECOMPUTED SCHEDULE, not a chain of
 * `setTimeout`s, and the difference is not academic:
 *
 *   - **Background tabs clamp timers to ~1s.** A chained-timeout stream in an unfocused
 *     tab crawls at roughly one word per second; come back to it and you are watching a
 *     sentence dribble out. rAF simply does not run while hidden, so the stream *pauses*
 *     and resumes at full speed when you look at it — which is also the behaviour you
 *     actually want from a story that is writing itself.
 *   - **Dropped frames catch up instead of accumulating drift.** The word count is
 *     derived from elapsed time against a cumulative schedule, so a slow frame reveals
 *     three words at once rather than pushing the whole passage later.
 *   - **One scheduled callback per passage** rather than one per word.
 *
 * Cadence is per-word and slightly irregular — long words dwell longer — because a
 * perfectly even tick reads as a progress bar rather than as writing.
 */

/** Base milliseconds between words. */
const WORD_INTERVAL = 34;
/** Extra ms per character beyond the first four, so long words don't flash past. */
const PER_CHAR = 5;
/** Ceiling on any single word's dwell, so one long word can't stall the line. */
const MAX_WORD_DELAY = 130;

/**
 * Split into words *with* their trailing whitespace attached. Joining any prefix of the
 * result reproduces the original string exactly — including newlines, which narration
 * relies on.
 */
function splitWords(text: string): string[] {
  return text.match(/\S+\s*|\s+/g) ?? [];
}

export interface StreamedText {
  /** The text revealed so far, minus the word currently arriving. */
  shown: string;
  /** The word currently arriving — rendered separately so only it animates. */
  head: string;
  /** True while more remains. Drives the caret and the "writing" state on the label. */
  streaming: boolean;
  /** Reveal the rest immediately. Wired to a tap/click on the passage. */
  skip: () => void;
}

export function useStreamedText(
  text: string,
  {
    /**
     * Whether this instance should ever stream. False for your own messages, for text
     * that was already on screen before this mount, and while a line is being edited.
     */
    enabled = true,
    /**
     * Fired after every reveal. The scroll container uses it to stay pinned to the
     * bottom while a line grows, which a one-shot effect cannot do.
     */
    onReveal,
  }: { enabled?: boolean; onReveal?: () => void } = {}
): StreamedText {
  const reducedMotion = useReducedMotion();
  const words = useMemo(() => splitWords(text), [text]);

  /**
   * Cumulative arrival time for each word. Precomputing it is what lets the loop derive
   * position from the clock rather than accumulate it, so the passage finishes on time
   * regardless of frame rate.
   */
  const schedule = useMemo(() => {
    let elapsed = 0;
    return words.map((word) => {
      elapsed += Math.min(
        MAX_WORD_DELAY,
        WORD_INTERVAL + Math.max(0, word.trim().length - 4) * PER_CHAR
      );
      return elapsed;
    });
  }, [words]);

  /**
   * Under reduced motion the whole thing is present from the first frame. This is the one
   * place a component may branch on the preference rather than defer to the CSS escape:
   * the reveal is a script, not a keyframe, so there is nothing for the stylesheet to
   * neutralise.
   */
  const instant = reducedMotion || !enabled;

  const [count, setCount] = useState(() => (instant ? words.length : 0));

  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;
  /** Set by `skip`, so the running loop stops rather than rewinding what it just showed. */
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;

    if (instant) {
      setCount(words.length);
      return;
    }

    setCount(0);

    let frame = 0;
    let start: number | null = null;
    let last = 0;

    const tick = (now: number) => {
      if (doneRef.current) return;
      if (start === null) start = now;
      const elapsed = now - start;

      let next = last;
      while (next < schedule.length && schedule[next] <= elapsed) next++;

      if (next !== last) {
        last = next;
        setCount(next);
        onRevealRef.current?.();
      }

      if (next < schedule.length) frame = requestAnimationFrame(tick);
    };

    /*
     * Leaving the tab completes the passage instead of freezing it mid-sentence.
     *
     * rAF does not run while a document is hidden — which is the behaviour we want, since
     * animating for nobody is waste — but "paused" is the wrong resting state here. Two
     * things are gated on the stream finishing: the illustration below it, and the
     * `writing` state on the speaker label. Leaving those suspended indefinitely means
     * coming back to a half-written line under a label still claiming to be working, and
     * an illustration that never arrived. Finishing is never wrong: the reader was not
     * there to watch it happen either way.
     */
    const onVisibility = () => {
      if (document.visibilityState !== "hidden") return;
      doneRef.current = true;
      cancelAnimationFrame(frame);
      setCount(words.length);
      onRevealRef.current?.();
    };

    document.addEventListener("visibilitychange", onVisibility);
    // Covers the case where the passage mounts into an already-hidden tab.
    onVisibility();

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [schedule, instant, words.length]);

  const skip = useCallback(() => {
    doneRef.current = true;
    setCount(words.length);
    onRevealRef.current?.();
  }, [words.length]);

  const streaming = count < words.length;

  return {
    // The head is peeled off the tail so it can carry `m-stream` alone. Everything before
    // it is inert text in a single node.
    shown: words.slice(0, Math.max(0, count - 1)).join(""),
    head: count > 0 ? (words[count - 1] ?? "") : "",
    streaming,
    skip,
  };
}
