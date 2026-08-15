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

/**
 * The economy, reframed from purchased gems to recharging credits.
 *
 * Free tier: credits refill to FREE_CAP automatically once RECHARGE_WINDOW_MS has
 * elapsed since the balance first dropped below the cap. Running out is a wait, not a
 * wall — the paywall is optional, not the only door (see docs/goal.md §6).
 *
 * Purchased credits bank *above* the cap and are never removed by a recharge, so buying
 * a pack is never wasted. The recharge only ever tops a sub-cap balance back up to it.
 *
 * All of this is client-side simulation. No payment processor, no backend.
 */

export const FREE_CAP = 50;
const RECHARGE_WINDOW_MS = 4 * 60 * 60 * 1000;
export const AD_REWARD = 5;
const STORAGE_KEY = "ledger:credits";
const MAX_HISTORY = 50;

export type ToolId = "image" | "video" | "chat" | "rpg" | "story";

/** What a spend put on disk. Text turns produce nothing that can expire. */
export type MediaKind = "image" | "video";

/**
 * Optional provenance on a spend.
 *
 * The ledger was previously a flat list of prose labels, which meant anything wanting to
 * reason about the session — which tool, how many files, what expires when — had to
 * string-match its own labels back. Recording it at the point of spend keeps that honest.
 */
export interface SpendMeta {
  tool: ToolId;
  media?: MediaKind;
  /** Files produced. Defaults to 1 when `media` is set. */
  count?: number;
}

export interface CreditTransaction {
  id: string;
  label: string;
  delta: number;
  balanceAfter: number;
  at: number;
  tool?: ToolId;
  media?: MediaKind;
  count?: number;
}

interface CreditState {
  balance: number;
  history: CreditTransaction[];
  /** When the free balance refills to the cap. Null whenever balance >= cap. */
  rechargeAt: number | null;
}

function initialState(): CreditState {
  return { balance: FREE_CAP, history: [], rechargeAt: null };
}

function loadState(): CreditState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<CreditState>;
    if (typeof parsed.balance !== "number" || !Array.isArray(parsed.history)) {
      return initialState();
    }
    return {
      balance: parsed.balance,
      // Ledgers written before ids were made reload-safe can already contain
      // duplicates, so repair on read rather than only preventing new ones —
      // otherwise an existing user keeps the duplicate-key render forever.
      history: dedupeIds(parsed.history),
      rechargeAt: typeof parsed.rechargeAt === "number" ? parsed.rechargeAt : null,
    };
  } catch {
    return initialState();
  }
}

function dedupeIds(history: CreditTransaction[]): CreditTransaction[] {
  const seen = new Set<string>();
  return history.map((entry) => {
    if (entry.id && !seen.has(entry.id)) {
      seen.add(entry.id);
      return entry;
    }
    const id = nextTxId();
    seen.add(id);
    return { ...entry, id };
  });
}

let txCounter = 0;

/**
 * Transaction ids have to survive a reload, because `history` does.
 *
 * A bare module counter restarts at 1 on every page load while localStorage still holds
 * `tx-1`, `tx-2`… from the last session — so the first new spend after a refresh collided
 * with a restored entry and React rendered the activity log and the context rail with
 * duplicate keys. Time-prefixed, with the counter only disambiguating entries written
 * inside the same millisecond.
 */
const nextTxId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `tx-${Date.now().toString(36)}-${(++txCounter).toString(36)}`;

function withEntry(
  state: CreditState,
  label: string,
  delta: number,
  balanceAfter: number,
  meta?: SpendMeta
) {
  return [
    {
      id: nextTxId(),
      label,
      delta,
      balanceAfter,
      at: Date.now(),
      ...(meta && {
        tool: meta.tool,
        media: meta.media,
        count: meta.media ? (meta.count ?? 1) : undefined,
      }),
    },
    ...state.history,
  ].slice(0, MAX_HISTORY);
}

/** Applies the recharge if it's due. Pure — safe to call from a state updater. */
function applyRecharge(state: CreditState, now: number): CreditState {
  if (state.rechargeAt === null || now < state.rechargeAt || state.balance >= FREE_CAP) {
    return state;
  }
  return {
    balance: FREE_CAP,
    rechargeAt: null,
    history: withEntry(state, "Daily credits recharged", FREE_CAP - state.balance, FREE_CAP),
  };
}

interface CreditsContextValue {
  balance: number;
  cap: number;
  history: CreditTransaction[];
  /** Milliseconds until the free balance refills, or null when it's already at/above cap. */
  msUntilRecharge: number | null;
  spend: (amount: number, label: string, meta?: SpendMeta) => boolean;
  addCredits: (amount: number, label: string) => void;
  watchAd: () => void;
  resetToStarter: () => void;
}

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CreditState>(() => applyRecharge(loadState(), Date.now()));
  const [now, setNow] = useState(() => Date.now());

  /**
   * Synchronous mirror of the balance.
   *
   * spend() has to answer "did that go through?" immediately — its callers open the
   * out-of-credits modal on false. Reading that answer out of a setState updater is
   * unreliable: React 18 only *sometimes* runs the updater eagerly, so a spend that
   * will succeed can report failure and pop the modal over a healthy balance. The ref
   * is decremented up front so rapid successive spends also settle correctly, and the
   * effect below reconciles it against whatever state actually committed.
   */
  const balanceRef = useRef(state.balance);

  useEffect(() => {
    balanceRef.current = state.balance;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Only tick while a recharge is actually pending — no idle timer on a full balance.
  useEffect(() => {
    if (state.rechargeAt === null) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      setState((prev) => applyRecharge(prev, t));
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.rechargeAt]);

  const spend = useCallback((amount: number, label: string, meta?: SpendMeta) => {
    if (balanceRef.current < amount) return false;
    balanceRef.current -= amount;
    setState((prev) => {
      if (prev.balance < amount) return prev;
      const balanceAfter = prev.balance - amount;
      return {
        balance: balanceAfter,
        // Starts the clock the first time the balance drops below the free cap.
        rechargeAt:
          prev.rechargeAt ?? (balanceAfter < FREE_CAP ? Date.now() + RECHARGE_WINDOW_MS : null),
        history: withEntry(prev, label, -amount, balanceAfter, meta),
      };
    });
    return true;
  }, []);

  const addCredits = useCallback((amount: number, label: string) => {
    balanceRef.current += amount;
    setState((prev) => {
      const balanceAfter = prev.balance + amount;
      return {
        balance: balanceAfter,
        rechargeAt: balanceAfter >= FREE_CAP ? null : prev.rechargeAt,
        history: withEntry(prev, label, amount, balanceAfter),
      };
    });
  }, []);

  const watchAd = useCallback(() => {
    addCredits(AD_REWARD, "Watched an ad");
  }, [addCredits]);

  const resetToStarter = useCallback(() => {
    balanceRef.current = FREE_CAP;
    setState(initialState());
  }, []);

  const value = useMemo<CreditsContextValue>(() => {
    const msUntilRecharge =
      state.rechargeAt === null ? null : Math.max(0, state.rechargeAt - now);
    return {
      balance: state.balance,
      cap: FREE_CAP,
      history: state.history,
      msUntilRecharge,
      spend,
      addCredits,
      watchAd,
      resetToStarter,
    };
  }, [state, now, spend, addCredits, watchAd, resetToStarter]);

  return <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>;
}

export function useCredits() {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used within a CreditsProvider");
  return ctx;
}

/** "3h 12m" / "12m 04s" — mono-friendly, no seconds until the last minute. */
export function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}
