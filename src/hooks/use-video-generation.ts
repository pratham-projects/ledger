import { useCallback, useEffect, useRef, useState } from "react";
import { useCredits } from "@/hooks/use-credits";
import { useSelection } from "@/hooks/use-selection";

export const VIDEO_GENERATE_COST = 9;
export const VIDEO_REGENERATE_COST = 3;

export type Stage = "queued" | "rendering" | "encoding" | "ready";

export interface ResultTile {
  id: string;
  seed: number;
  stage: Stage;
  frame: number;
  totalFrames: number;
  playing: boolean;
}

export interface StartFrame {
  name: string;
  dataUrl: string;
  type: "image" | "video";
}

const FPS = 24;

export const VIDEO_STYLES = ["Cinematic", "Anime", "Realistic", "Stop-Motion", "Claymation", "Noir"];
export const DURATIONS = [4, 8, 12] as const;
export const ASPECT_RATIOS = ["16:9", "9:16", "1:1"] as const;
export const BATCH_SIZES = [1, 2, 4];

export const EXAMPLE_PROMPTS = [
  "a paper boat sailing through a rainstorm gutter",
  "time-lapse of a city skyline sliding into dusk",
  "a hummingbird frozen mid-flight, wings blurring",
  "clouds rolling fast over a mountain ridge",
  "a neon sign flickering to life in the rain",
  "a spinning vinyl record, close-up on the grooves",
  "waves crashing against a lighthouse in slow motion",
  "a candle flame dancing in a dark room",
];

const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));

let tileCounter = 0;
const nextTileId = () => `vtile-${++tileCounter}`;

export function useVideoGeneration() {
  const credits = useCredits();
  const { referenceMedia, clearReferenceMedia } = useSelection();
  const [prompt, setPrompt] = useState("");
  const [promptError, setPromptError] = useState<string | null>(null);
  const [outOfCredits, setOutOfCredits] = useState(false);
  const [style, setStyle] = useState(VIDEO_STYLES[0]);
  const [startFrame, setStartFrame] = useState<StartFrame | null>(null);

  const [negativePrompt, setNegativePrompt] = useState("");
  const [motionIntensity, setMotionIntensity] = useState(5);
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_RATIOS)[number]>(ASPECT_RATIOS[0]);
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(DURATIONS[0]);
  const [batchCount, setBatchCount] = useState(BATCH_SIZES[0]);
  const [seedInput, setSeedInput] = useState(-1);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tiles, setTiles] = useState<ResultTile[]>([]);

  useEffect(() => {
    if (!referenceMedia || referenceMedia.type !== "video") return;
    setPrompt(referenceMedia.prompt);
    setStartFrame({ name: referenceMedia.name, dataUrl: referenceMedia.url, type: "video" });
    clearReferenceMedia();
  }, [referenceMedia, clearReferenceMedia]);

  const timeouts = useRef<number[]>([]);
  const intervals = useRef<number[]>([]);
  useEffect(
    () => () => {
      timeouts.current.forEach((t) => window.clearTimeout(t));
      intervals.current.forEach((t) => window.clearInterval(t));
    },
    []
  );

  const updateTile = useCallback((id: string, patch: Partial<ResultTile>) => {
    setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const runTile = useCallback(
    (id: string, totalFrames: number) => {
      const t = (ms: number, fn: () => void) => timeouts.current.push(window.setTimeout(fn, ms));

      t(rand(500, 1200), () => {
        updateTile(id, { stage: "rendering", frame: 0 });

        const renderMs = rand(1800, 3200);
        const startedAt = Date.now();
        const tick = window.setInterval(() => {
          const elapsed = Date.now() - startedAt;
          const frame = Math.min(totalFrames, Math.round((elapsed / renderMs) * totalFrames));
          updateTile(id, { frame });
        }, 120);
        intervals.current.push(tick);

        t(renderMs, () => {
          window.clearInterval(tick);
          updateTile(id, { stage: "encoding", frame: totalFrames });

          t(rand(700, 1400), () => {
            updateTile(id, { stage: "ready", playing: true });
          });
        });
      });
    },
    [updateTile]
  );

  useEffect(() => {
    if (tiles.length > 0 && tiles.every((t) => t.stage === "ready")) setIsGenerating(false);
  }, [tiles]);

  const makeSeed = (index: number) => (seedInput === -1 ? rand(0, 999_999_999) : seedInput + index);

  const generate = useCallback(() => {
    if (!prompt.trim()) {
      setPromptError("Type a description first — nothing to generate yet.");
      return;
    }
    // Counted before the spend so the ledger records how many files this actually made.
    const count = hasGeneratedOnce ? batchCount : 1;
    if (
      !credits.spend(VIDEO_GENERATE_COST, `Generated video — "${prompt.trim().slice(0, 40)}"`, {
        tool: "video",
        media: "video",
        count,
      })
    ) {
      setOutOfCredits(true);
      return;
    }
    setPromptError(null);
    setIsGenerating(true);
    const totalFrames = duration * FPS;
    const newTiles: ResultTile[] = Array.from({ length: count }, (_, i) => ({
      id: nextTileId(),
      seed: makeSeed(i),
      stage: "queued",
      frame: 0,
      totalFrames,
      playing: false,
    }));
    setTiles(newTiles);
    setHasGeneratedOnce(true);
    newTiles.forEach((tile) => runTile(tile.id, totalFrames));
  }, [prompt, hasGeneratedOnce, batchCount, duration, seedInput, runTile, credits]);

  const regenerateTile = useCallback(
    (id: string) => {
      if (!credits.spend(VIDEO_REGENERATE_COST, "Regenerated video clip", {
        tool: "video",
        media: "video",
      })) {
        setOutOfCredits(true);
        return;
      }
      setIsGenerating(true);
      const totalFrames = duration * FPS;
      setTiles((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, seed: rand(0, 999_999_999), stage: "queued", frame: 0, totalFrames, playing: false }
            : t
        )
      );
      runTile(id, totalFrames);
    },
    [runTile, duration, credits]
  );

  const dismissOutOfCredits = useCallback(() => setOutOfCredits(false), []);

  const togglePlaying = useCallback((id: string) => {
    setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, playing: !t.playing } : t)));
  }, []);

  const randomizePrompt = useCallback(() => {
    setPromptError(null);
    setPrompt((current) => {
      const pool = EXAMPLE_PROMPTS.filter((p) => p !== current);
      return pool[rand(0, pool.length)];
    });
  }, []);

  const uploadStartFrame = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setStartFrame({ name: file.name, dataUrl: reader.result, type: "image" });
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const clearStartFrame = useCallback(() => setStartFrame(null), []);

  return {
    prompt,
    setPrompt,
    promptError,
    style,
    setStyle,
    startFrame,
    uploadStartFrame,
    clearStartFrame,
    negativePrompt,
    setNegativePrompt,
    motionIntensity,
    setMotionIntensity,
    aspectRatio,
    setAspectRatio,
    duration,
    setDuration,
    batchCount,
    setBatchCount,
    seedInput,
    setSeedInput,
    advancedOpen,
    setAdvancedOpen,
    hasGeneratedOnce,
    isGenerating,
    tiles,
    generate,
    regenerateTile,
    togglePlaying,
    randomizePrompt,
    outOfCredits,
    dismissOutOfCredits,
  };
}
