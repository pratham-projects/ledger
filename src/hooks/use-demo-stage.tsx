import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Who is allowed to animate right now.
 *
 * The landing page runs five looping demonstrations of five different tools. Left
 * ungoverned that is five `requestAnimationFrame` timelines, two WebGL contexts and a
 * `<video>` all competing while the visitor is looking at one of them — on a phone that
 * is the difference between "this product is fast" and a stuttering first impression,
 * which on a Persuade surface is the whole argument lost.
 *
 * So playback is a grant, not a right. A demo reports how much of it is on screen; the
 * stage decides who plays:
 *
 *   - **Off screen plays nothing.** Ever. Not throttled — stopped.
 *   - **Narrow viewports run exactly one.** The most-visible demo wins; the rest hold
 *     their final frame, which is a legitimate still of the same thing.
 *   - **One WebGL context site-wide.** The dithering shader is the expensive tenant, so
 *     it is granted separately and to a single holder, following the same reasoning as
 *     MAX_CONCURRENT_SHADERS in components/video/result-grid.tsx.
 *   - **Reduced motion plays nothing and grants no shader.** The global escape in
 *     motion.css cannot help here, because these timelines are script, not CSS. This is
 *     the one place a component is allowed to branch on the preference, and it does it
 *     once, here, rather than five times downstream.
 *
 * The rule that keeps this honest: a demo that is not playing must still *look* like
 * something. Every one of them renders its finished frame when idle, so nothing on this
 * page is ever a blank box waiting for permission.
 */

interface StageContextValue {
  /** Report visibility. Ratio 0 means off screen. */
  report: (id: string, ratio: number) => void;
  release: (id: string) => void;
  activeId: string | null;
  /** On wide viewports every visible demo plays; on narrow ones only the winner does. */
  playsConcurrently: boolean;
  visible: Set<string>;
  shaderHolder: string | null;
  reducedMotion: boolean;
}

const StageContext = createContext<StageContextValue | null>(null);

/** Below this the page is a single column and one demo fills most of the viewport. */
const CONCURRENT_MIN_WIDTH = 1024;

export function DemoStage({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [playsConcurrently, setPlaysConcurrently] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= CONCURRENT_MIN_WIDTH
  );
  const [documentVisible, setDocumentVisible] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${CONCURRENT_MIN_WIDTH}px)`);
    const sync = () => setPlaysConcurrently(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  // A backgrounded tab keeps firing timers in some browsers and burns battery in all of
  // them. Nothing here is worth a background frame.
  useEffect(() => {
    const sync = () => setDocumentVisible(!document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const report = useCallback((id: string, ratio: number) => {
    setRatios((prev) => (prev[id] === ratio ? prev : { ...prev, [id]: ratio }));
  }, []);

  const release = useCallback((id: string) => {
    setRatios((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const value = useMemo<StageContextValue>(() => {
    const live = !reducedMotion && documentVisible;

    const onScreen = Object.entries(ratios)
      .filter(([, ratio]) => ratio > 0.25)
      .sort((a, b) => b[1] - a[1]);

    const winner = live && onScreen.length > 0 ? onScreen[0][0] : null;
    const visible = new Set(live ? onScreen.map(([id]) => id) : []);

    return {
      report,
      release,
      activeId: winner,
      playsConcurrently,
      visible,
      // The single most-visible playing demo may run WebGL. Nobody else, ever.
      shaderHolder: winner,
      reducedMotion,
    };
  }, [ratios, playsConcurrently, reducedMotion, documentVisible, report, release]);

  return <StageContext.Provider value={value}>{children}</StageContext.Provider>;
}

export interface StageGrant {
  /** Attach to the demo's outermost element so the stage can measure it. */
  ref: (node: HTMLElement | null) => void;
  /** May this demo advance its timeline? */
  playing: boolean;
  /** May this demo mount a WebGL context? */
  mayUseShader: boolean;
}

export function useStageGrant(id: string): StageGrant {
  const ctx = useContext(StageContext);
  if (!ctx) throw new Error("useStageGrant must be used within a DemoStage");

  const { report, release, activeId, playsConcurrently, visible, shaderHolder } = ctx;
  const nodeRef = useRef<HTMLElement | null>(null);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      nodeRef.current = node;
    },
    []
  );

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => report(id, entry.intersectionRatio),
      // A coarse ladder is enough to rank demos and avoids a report on every pixel.
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      release(id);
    };
  }, [id, report, release]);

  const playing = playsConcurrently ? visible.has(id) : activeId === id;

  return { ref, playing, mayUseShader: playing && shaderHolder === id };
}

/**
 * Runs a scripted timeline while `playing`, and holds its last frame when not.
 *
 * `script` is a list of step durations in milliseconds. The returned step is an index
 * into it. Pausing does not rewind — a demo scrolled out and back resumes where the
 * visitor left it rather than restarting mid-sentence, which reads as a glitch.
 *
 * When playback is denied the step pins to the **last** one. That is deliberate and it is
 * the same invariant motion.css states: the default state is the finished state. An idle
 * demo shows a completed generation, not an empty prompt box.
 */
/**
 * 0→1 over `durationMs` while `active`, for counters that must actually count.
 *
 * The demos used to print a constant — "sampling 18/30" — held for the whole step. At
 * four seconds nobody read it twice; at fourteen it is plainly frozen, and a frozen
 * progress readout is the single most legible way to look broken. This ticks coarsely on
 * purpose: a sampler that advanced smoothly at 60fps would be claiming a precision the
 * real one does not have, and the point is the shape of the wait, not the number.
 */
export function useDemoRamp(active: boolean, durationMs: number, steps = 12): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    const started = Date.now();
    const id = window.setInterval(() => {
      setProgress(Math.min(1, (Date.now() - started) / durationMs));
    }, Math.max(60, durationMs / steps));
    return () => window.clearInterval(id);
  }, [active, durationMs, steps]);

  return progress;
}

export function useDemoScript(script: readonly number[], playing: boolean): number {
  const last = script.length - 1;
  const [step, setStep] = useState(last);

  useEffect(() => {
    if (!playing) {
      setStep(last);
      return;
    }

    let timer: number;
    // Restart the sequence on resume rather than finishing a half-played beat whose
    // remaining duration nobody can reason about.
    setStep(0);

    let current = 0;
    const advance = () => {
      timer = window.setTimeout(() => {
        current = (current + 1) % script.length;
        setStep(current);
        advance();
      }, script[current]);
    };
    advance();

    return () => window.clearTimeout(timer);
  }, [playing, script, last]);

  return step;
}
