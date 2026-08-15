import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { useSelection } from "@/hooks/use-selection";
import type { Template } from "@/lib/templates";

/**
 * A template video, full screen — the shared detail view for both the Inspirations band on
 * `/home` and each category's full page. Playing the clip is the point, so the video takes
 * the whole left side; the right rail is everything you'd need to decide whether to use it
 * — who made it, what it was asked for, and what it referenced — ending in the one action
 * that actually does something: load this brief and this clip into `/video`.
 */
export function TemplateLightbox({
  template,
  onClose,
}: {
  template: Template;
  onClose: () => void;
}) {
  const { selectReferenceMedia } = useSelection();
  const navigate = useNavigate();
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const initials = template.authorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const direct = () => {
    selectReferenceMedia({
      url: template.url,
      type: "video",
      name: template.title,
      prompt: template.brief,
    });
    navigate("/video");
  };

  return (
    <div className="hub-lightbox" role="dialog" aria-modal="true" aria-label={template.title}>
      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-panel-2 p-4 sm:p-8">
        <video
          src={template.url}
          controls
          autoPlay
          loop
          playsInline
          className="max-h-full max-w-full rounded object-contain"
        />
        <button
          type="button"
          onClick={onClose}
          className="hub-cover-arrow right-4 top-4 translate-y-0"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="hub-lightbox-rail ledger-scrollbar">
        <div className="flex items-center gap-2.5">
          <span className="tpl-avatar" aria-hidden="true">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate text-[14px] font-semibold text-ink">
              {template.authorName}
            </p>
            <p className="desk-data m-0 truncate text-[12px] text-ink-muted-2">
              {template.authorHandle}
            </p>
          </div>
        </div>

        <span className="hub-insp-tab w-fit" data-active="false">
          {template.categoryLabel}
        </span>

        <div>
          <h2 className="desk-display m-0 mb-2 text-[22px] text-ink">{template.title}</h2>
          <p className="desk-pill-label m-0 mb-2">Starting brief</p>
          <p
            className={expanded ? "m-0 text-[13.5px] leading-[1.6] text-ink-muted" : "tpl-clamp m-0 text-[13.5px] leading-[1.6] text-ink-muted"}
          >
            {template.brief}
          </p>
          <button
            type="button"
            className="mt-1.5 text-[12.5px] font-bold text-accent"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "See less" : "See more"}
          </button>
        </div>

        <div>
          <p className="desk-pill-label m-0 mb-2">References</p>
          <div className="flex flex-wrap gap-1.5">
            {template.references.map((ref, i) => (
              <span key={i} className="tpl-ref-thumb">
                <img src={ref.src(140)} alt="" loading="lazy" />
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="desk-cta mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-[15px] font-bold text-[var(--on-accent)] transition-transform hover:-translate-y-px"
          onClick={direct}
        >
          Direct this <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
