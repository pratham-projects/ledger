import * as React from "react";

/**
 * Drag-to-resize for the tool workspace's middle column.
 *
 * Only the middle panel's width is tracked — the right panel is whatever's left
 * (`flex: 1`), so there's exactly one number to own and persist. `min`/`max` bound it, and
 * the last width picked per tool is remembered in `localStorage` under `storageKey`, so a
 * reader who widens the composer on `/video` doesn't have to redo it on the next visit.
 */
export function useResizableWidth({
  storageKey,
  initial,
  min,
  max,
}: {
  storageKey: string;
  initial: number;
  min: number;
  max: number;
}) {
  const clamp = React.useCallback((n: number) => Math.min(max, Math.max(min, n)), [min, max]);

  const [width, setWidth] = React.useState(() => {
    if (typeof window === "undefined") return initial;
    const saved = Number(window.localStorage.getItem(storageKey));
    return Number.isFinite(saved) && saved > 0 ? clamp(saved) : initial;
  });

  const drag = React.useRef<{ startX: number; startWidth: number } | null>(null);

  const onDragStart = React.useCallback(
    (e: React.PointerEvent) => {
      drag.current = { startX: e.clientX, startWidth: width };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width]
  );

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!drag.current) return;
      setWidth(clamp(drag.current.startWidth + (e.clientX - drag.current.startX)));
    };
    const onUp = () => {
      if (!drag.current) return;
      drag.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [clamp]);

  React.useEffect(() => {
    window.localStorage.setItem(storageKey, String(width));
  }, [storageKey, width]);

  return { width, onDragStart };
}
