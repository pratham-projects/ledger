import { useCallback, useEffect, useRef, useState } from "react";
import { useCredits } from "@/hooks/use-credits";
import { useSelection } from "@/hooks/use-selection";

export const IMAGE_GENERATE_COST = 3;
export const IMAGE_REGENERATE_COST = 1;

export type Stage = "waiting" | "preparing" | "processing" | "done";

export interface ResultTile {
  id: string;
  seed: number;
  stage: Stage;
}

export interface ImageFrame {
  name: string;
  src: string;
}

export const ART_STYLES = [
  "Painted Anime",
  "Casual Photo",
  "Cinematic",
  "Digital Painting",
  "Concept Art",
  "3D",
  "Disney",
];

export const RESOLUTIONS = ["768x768", "512x512", "768x512", "512x768"] as const;
export const SHAPES = ["Square", "Portrait", "Landscape"] as const;
export const BATCH_SIZES = [1, 2, 4, 6, 8, 16, 32];

export const EXAMPLE_PROMPTS = [
  "a lighthouse at dusk, waves lit by its own beam",
  "a cat astronaut floating above a neon city",
  "an ancient library built inside a glacier",
  "a clockwork dragon perched on a rooftop antenna",
  "a bioluminescent forest at midnight",
  "a floating market above the clouds",
  "a diner on the moon, chrome and neon",
  "a fox made of autumn leaves mid-stride",
];

export const STYLE_MODIFIERS = [
  "cinematic lighting",
  "hyper-detailed",
  "soft focus",
  "dramatic shadows",
  "pastel palette",
  "film grain",
];

export const EFFECT_MODIFIERS = [
  "depth of field",
  "lens flare",
  "long exposure",
  "chromatic aberration",
  "tilt-shift",
];

const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));

let tileCounter = 0;
const nextTileId = () => `tile-${++tileCounter}`;

export function useImageGeneration() {
  const credits = useCredits();
  const { referenceMedia, clearReferenceMedia } = useSelection();
  const [prompt, setPrompt] = useState("");
  const [promptError, setPromptError] = useState<string | null>(null);
  const [outOfCredits, setOutOfCredits] = useState(false);
  const [artStyle, setArtStyle] = useState(ART_STYLES[0]);
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [imageFrame, setImageFrame] = useState<ImageFrame | null>(null);

  const [negativePrompt, setNegativePrompt] = useState("");
  const [guidanceScale, setGuidanceScale] = useState(7);
  const [resolution, setResolution] = useState<(typeof RESOLUTIONS)[number]>(RESOLUTIONS[0]);
  const [shape, setShape] = useState<(typeof SHAPES)[number]>(SHAPES[0]);
  const [batchCount, setBatchCount] = useState(BATCH_SIZES[0]);
  const [seedInput, setSeedInput] = useState(-1);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tiles, setTiles] = useState<ResultTile[]>([]);

  useEffect(() => {
    if (!referenceMedia || referenceMedia.type !== "image") return;
    setPrompt(referenceMedia.prompt);
    setImageFrame({ name: referenceMedia.name, src: referenceMedia.url });
    clearReferenceMedia();
  }, [referenceMedia, clearReferenceMedia]);

  const timeouts = useRef<number[]>([]);
  useEffect(() => () => timeouts.current.forEach((t) => window.clearTimeout(t)), []);

  const updateTileStage = useCallback((id: string, stage: Stage) => {
    setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, stage } : t)));
  }, []);

  const runTile = useCallback(
    (id: string) => {
      const willRegress = Math.random() < 0.15;
      const t = (ms: number, fn: () => void) => timeouts.current.push(window.setTimeout(fn, ms));

      const runProcessing = () => {
        t(rand(700, 1400), () => {
          updateTileStage(id, "processing");
          t(rand(900, 1700), () => updateTileStage(id, "done"));
        });
      };

      t(rand(400, 900), () => {
        updateTileStage(id, "preparing");
        if (willRegress) {
          t(rand(300, 600), () => {
            updateTileStage(id, "waiting");
            t(rand(500, 900), () => {
              updateTileStage(id, "preparing");
              runProcessing();
            });
          });
        } else {
          runProcessing();
        }
      });
    },
    [updateTileStage]
  );

  useEffect(() => {
    if (tiles.length > 0 && tiles.every((t) => t.stage === "done")) setIsGenerating(false);
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
      !credits.spend(IMAGE_GENERATE_COST, `Generated image — "${prompt.trim().slice(0, 40)}"`, {
        tool: "image",
        media: "image",
        count,
      })
    ) {
      setOutOfCredits(true);
      return;
    }
    setPromptError(null);
    setIsGenerating(true);
    const newTiles: ResultTile[] = Array.from({ length: count }, (_, i) => ({
      id: nextTileId(),
      seed: makeSeed(i),
      stage: "waiting",
    }));
    setTiles(newTiles);
    setHasGeneratedOnce(true);
    newTiles.forEach((tile) => runTile(tile.id));
  }, [prompt, hasGeneratedOnce, batchCount, seedInput, runTile, credits]);

  const regenerateTile = useCallback(
    (id: string) => {
      if (!credits.spend(IMAGE_REGENERATE_COST, "Regenerated image tile", {
        tool: "image",
        media: "image",
      })) {
        setOutOfCredits(true);
        return;
      }
      setIsGenerating(true);
      setTiles((prev) =>
        prev.map((t) => (t.id === id ? { ...t, seed: rand(0, 999_999_999), stage: "waiting" } : t))
      );
      runTile(id);
    },
    [runTile, credits]
  );

  const dismissOutOfCredits = useCallback(() => setOutOfCredits(false), []);

  const randomizePrompt = useCallback(() => {
    setPromptError(null);
    setPrompt((current) => {
      const pool = EXAMPLE_PROMPTS.filter((p) => p !== current);
      return pool[rand(0, pool.length)];
    });
  }, []);

  const uploadImageFrame = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImageFrame({ name: file.name, src: reader.result });
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImageFrame = useCallback(() => setImageFrame(null), []);

  const toggleModifier = useCallback((value: string) => {
    setModifiers((prev) => (prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]));
  }, []);

  return {
    prompt,
    setPrompt,
    promptError,
    artStyle,
    setArtStyle,
    modifiers,
    toggleModifier,
    negativePrompt,
    setNegativePrompt,
    guidanceScale,
    setGuidanceScale,
    resolution,
    setResolution,
    shape,
    setShape,
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
    randomizePrompt,
    imageFrame,
    uploadImageFrame,
    clearImageFrame,
    outOfCredits,
    dismissOutOfCredits,
  };
}
