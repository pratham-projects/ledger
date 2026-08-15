import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Layers } from "lucide-react";
import { SourceThumbs } from "@/components/session/source-thumbs";
import { SourcePicker } from "@/components/session/source-picker";
import { Panel, PanelHead } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/hooks/use-selection";
import { cn } from "@/lib/utils";

/**
 * "Here's what's loaded" — the spine made visible on every tool surface. Without this,
 * routing a LoRA from /browse into a tool would be invisible, and the product's whole
 * differentiator would be a state change nobody sees.
 *
 * It also *changes* what's loaded now. Reporting the selection while offering only a link
 * away to alter it was the strip's original sin: the link discarded the surface's own
 * state and gave the catalog no way to send you back. `SourcePicker` handles the common
 * case — swap to another popular model, or search for one by name — in place. `/browse`
 * stays available for the browsing job it is actually good at.
 */
export function SourceStrip({
  domain,
  emptyHint,
  className,
}: {
  domain: string;
  /** What this particular tool loses by having nothing loaded. */
  emptyHint: string;
  /** Call sites pass `xl:hidden` where the ContextRail already carries this. */
  className?: string;
}) {
  const { lora, checkpoint, strength, selectLora } = useSelection();
  const [picking, setPicking] = useState(false);

  const picker = (
    <div className="m-expand" data-open={picking}>
      <div>
        {picking && (
          <SourcePicker
            domain={domain}
            checkpoint={checkpoint}
            selectedId={lora?.id ?? null}
            onSelect={selectLora}
            onClose={() => setPicking(false)}
          />
        )}
      </div>
    </div>
  );

  if (!lora) {
    return (
      <Panel className={className}>
        <PanelHead title={`${domain}.source`} sub="none loaded" />
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Layers className="h-5 w-5 shrink-0 text-ink-muted-2" aria-hidden="true" />
            <p className="max-w-[54ch] font-sans text-[13.5px] leading-[1.55] text-ink-muted">
              {emptyHint}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPicking((v) => !v)}
              aria-expanded={picking}
            >
              {picking ? "close" : "pick one here"}
            </Button>
            <Link
              to="/home#catalog"
              state={{ returnTo: `/${domain}`, returnLabel: `${domain}.setup` }}
              className="no-underline"
            >
              <Button variant="ghost" size="sm">
                browse the catalog →
              </Button>
            </Link>
          </div>
        </div>
        {picker}
      </Panel>
    );
  }

  const compatible = lora.compatible.includes(checkpoint.family);

  return (
    <Panel className={className}>
      <PanelHead
        title={`${domain}.source`}
        sub={`${checkpoint.name} · strength ${strength.toFixed(2)}`}
      />
      <div className="flex flex-wrap items-center gap-4 p-4">
        <SourceThumbs checkpoint={checkpoint} lora={lora} size={48} />

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-mono text-[10px] uppercase tracking-wider text-accent">loaded</span>
          <span className="font-sans text-[15px] font-semibold text-ink">{lora.name}</span>
          <span className="font-mono text-[10.5px] text-ink-muted-2">
            triggers on {lora.triggerWords.join(", ")}
          </span>
        </div>

        {!compatible && (
          <span className="w-full border border-amber/40 px-2 py-1.5 font-mono text-[10px] leading-[1.5] text-amber">
            trained for {lora.compatible.join("/")}, not {checkpoint.family}
          </span>
        )}

        <button
          type="button"
          onClick={() => setPicking((v) => !v)}
          aria-expanded={picking}
          className={cn(
            "m-hover m-press inline-flex shrink-0 items-center gap-1.5 border border-border-2 px-2.5 py-1.5",
            "font-mono text-[11.5px] transition-colors",
            picking ? "border-accent text-accent" : "text-ink-muted hover:border-ink hover:text-ink"
          )}
        >
          <ChevronDown
            className={cn("h-3 w-3 transition-transform", picking && "rotate-180")}
            aria-hidden="true"
          />
          {picking ? "close" : "change"}
        </button>
      </div>
      {picker}
    </Panel>
  );
}
