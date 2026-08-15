import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CHECKPOINTS, findCheckpoint, findLora, type Checkpoint, type Lora } from "@/lib/catalog";

/**
 * The LoRA-first spine's shared state: whatever the user picked on /browse travels with
 * them into Image, Video, Chat, RPG and Story. This is the product's differentiating
 * mechanic (one asset routed into every tool), so it lives app-wide rather than in a
 * route param — a tool opened directly from the nav still knows what's loaded.
 */

const STORAGE_KEY = "ledger:selection";
const DEFAULT_CHECKPOINT_ID = CHECKPOINTS[0].id;

interface StoredSelection {
  checkpointId: string;
  loraId: string | null;
  strength: number;
}

export interface ReferenceMedia {
  url: string;
  type: "image" | "video";
  name: string;
  prompt: string;
}

function loadState(): StoredSelection {
  const fallback: StoredSelection = {
    checkpointId: DEFAULT_CHECKPOINT_ID,
    loraId: null,
    strength: 0.8,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StoredSelection>;
    // Guard against a stale id from an older catalog revision.
    const checkpointId = findCheckpoint(parsed.checkpointId ?? null)
      ? (parsed.checkpointId as string)
      : DEFAULT_CHECKPOINT_ID;
    const loraId = findLora(parsed.loraId ?? null) ? (parsed.loraId as string) : null;
    return {
      checkpointId,
      loraId,
      strength: typeof parsed.strength === "number" ? parsed.strength : 0.8,
    };
  } catch {
    return fallback;
  }
}

interface SelectionContextValue {
  checkpoint: Checkpoint;
  lora: Lora | null;
  strength: number;
  setCheckpoint: (id: string) => void;
  /** Selecting a LoRA also resets strength to that LoRA's authored default. */
  selectLora: (id: string) => void;
  clearLora: () => void;
  setStrength: (value: number) => void;
  referenceMedia: ReferenceMedia | null;
  selectReferenceMedia: (media: ReferenceMedia) => void;
  clearReferenceMedia: () => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredSelection>(loadState);
  const [referenceMedia, setReferenceMedia] = useState<ReferenceMedia | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setCheckpoint = useCallback((id: string) => {
    setState((prev) => ({ ...prev, checkpointId: id }));
  }, []);

  const selectLora = useCallback((id: string) => {
    setState((prev) => {
      const lora = findLora(id);
      return { ...prev, loraId: id, strength: lora?.defaultStrength ?? prev.strength };
    });
  }, []);

  const clearLora = useCallback(() => {
    setState((prev) => ({ ...prev, loraId: null }));
  }, []);

  const setStrength = useCallback((value: number) => {
    setState((prev) => ({ ...prev, strength: value }));
  }, []);

  const selectReferenceMedia = useCallback((media: ReferenceMedia) => setReferenceMedia(media), []);
  const clearReferenceMedia = useCallback(() => setReferenceMedia(null), []);

  const value = useMemo<SelectionContextValue>(() => {
    const checkpoint = findCheckpoint(state.checkpointId) ?? CHECKPOINTS[0];
    return {
      checkpoint,
      lora: findLora(state.loraId),
      strength: state.strength,
      setCheckpoint,
      selectLora,
      clearLora,
      setStrength,
      referenceMedia,
      selectReferenceMedia,
      clearReferenceMedia,
    };
  }, [state, setCheckpoint, selectLora, clearLora, setStrength, referenceMedia, selectReferenceMedia, clearReferenceMedia]);

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within a SelectionProvider");
  return ctx;
}
