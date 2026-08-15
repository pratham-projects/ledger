import * as React from "react";
import { X } from "lucide-react";
import type { MediaTemplate } from "@/components/tool-workspace/media-template-grid";
import { useExitAnimation } from "@/hooks/use-exit-animation";

/**
 * The template, full detail — what a tap on a grid tile opens onto, instead of loading the
 * composer immediately. A grid tile only has room for a caption; a real decision ("is this
 * worth spending credits recreating?") needs the whole prompt, not a truncated line, and a
 * reader should be able to look without committing. `onRecreate` is the one action that
 * actually does anything — everything else here is read-only.
 *
 * `open` is tracked separately from `item` so the modal can stay mounted and play its
 * close animation for one beat after the caller clears the selection — see
 * `useExitAnimation`. `item` is only ever null while that close is playing.
 */
export function TemplateDetailModal({
  open,
  item,
  onClose,
  onRecreate,
}: {
  open: boolean;
  item: MediaTemplate | null;
  onClose: () => void;
  onRecreate: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const { mounted, closing } = useExitAnimation(open);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !item) return null;

  return (
    <div className="tplx-backdrop" data-closing={closing} onClick={onClose}>
      <div
        className="tplx-modal"
        data-closing={closing}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button type="button" onClick={onClose} className="tplx-close" aria-label="Close">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="tplx-media">
          {item.type === "video" ? (
            <video src={item.url} controls autoPlay loop playsInline className="max-h-full max-w-full" />
          ) : (
            <img src={item.url} alt="" className="max-h-full max-w-full object-contain" />
          )}
        </div>

        <div className="tplx-rail ledger-scrollbar">
          <div>
            <h2 className="desk-display m-0 text-[24px] text-ink">Template</h2>
            <p className="desk-pill-label m-0 mt-1">Details</p>
          </div>

          <div>
            <p className="desk-pill-label m-0 mb-2">Prompt</p>
            <p
              className={
                expanded
                  ? "m-0 text-[13.5px] leading-[1.6] text-ink-muted"
                  : "tpl-clamp m-0 text-[13.5px] leading-[1.6] text-ink-muted"
              }
            >
              {item.prompt}
            </p>
            <button
              type="button"
              className="mt-1.5 text-[12.5px] font-bold text-accent"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "See less" : "See more"}
            </button>
          </div>

          {item.references && item.references.length > 0 && (
            <div>
              <p className="desk-pill-label m-0 mb-2">References</p>
              <div className="flex flex-wrap gap-1.5">
                {item.references.map((ref, i) => (
                  <span key={i} className="tpl-ref-thumb">
                    <img src={ref} alt="" loading="lazy" />
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.settings && item.settings.length > 0 && (
            <div>
              <p className="desk-pill-label m-0 mb-2">Settings</p>
              <div className="flex flex-wrap gap-1.5">
                {item.settings.map((s) => (
                  <span key={s} className="hub-modifier">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            className="desk-cta mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-[15px] font-bold text-[var(--on-accent)] transition-transform hover:-translate-y-px"
            onClick={onRecreate}
          >
            Recreate
          </button>
        </div>
      </div>
    </div>
  );
}
