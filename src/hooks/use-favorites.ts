import * as React from "react";

const STORAGE_KEY = "ledger:favorites";

function load(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Client-only favoriting for template/generation tiles — starred ids persist in
 *  localStorage since there's no account-backed store in this build. */
export function useFavorites() {
  const [ids, setIds] = React.useState<Set<string>>(load);

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  }, [ids]);

  const toggle = React.useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const has = React.useCallback((id: string) => ids.has(id), [ids]);

  return { has, toggle };
}
