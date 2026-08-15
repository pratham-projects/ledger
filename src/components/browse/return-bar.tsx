import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SourceThumbs } from "@/components/session/source-thumbs";
import { Button } from "@/components/ui/button";
import type { Checkpoint, Lora } from "@/lib/catalog";

/**
 * The way back, for someone who arrived here mid-setup.
 *
 * `/browse` is reachable from every tool surface, and it used to be a one-way door: the
 * catalog had no idea it had been opened from RPG, so there was no route back and no
 * acknowledgment that the visitor was in the middle of something. The tool surfaces now
 * pass their origin in router state and this bar reports it.
 *
 * Two exits, deliberately: leaving without changing anything has to be as easy as
 * committing, or the bar becomes a nag. Both are honest about what happens — the setup on
 * the other side is rebuilt when you return, since a tool's session lives in its own route.
 */
export function ReturnBar({
  returnTo,
  returnLabel,
  lora,
  checkpoint,
}: {
  returnTo: string;
  /** The origin's own region name, e.g. `rpg.setup`. */
  returnLabel: string;
  lora: Lora | null;
  checkpoint: Checkpoint;
}) {
  const navigate = useNavigate();
  const destination = returnLabel.split(".")[0];

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border border-accent/40 bg-accent/[0.06] p-4">
      <div className="flex min-w-0 items-center gap-3">
        {lora && <SourceThumbs checkpoint={checkpoint} lora={lora} size={40} />}
        <div className="flex min-w-0 flex-col">
          <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
            picking for {returnLabel}
          </span>
          <span className="font-sans text-[13.5px] leading-[1.5] text-ink-muted">
            {lora
              ? `${lora.name} is loaded. Take it back, or keep looking.`
              : "Nothing loaded yet. Take one off a shelf below, or go back without one."}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(returnTo)}>
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          back to {destination}
        </Button>
        {lora && (
          <Button variant="primary" size="sm" onClick={() => navigate(returnTo)}>
            use {lora.name} in {destination}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
