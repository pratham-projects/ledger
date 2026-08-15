import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { StockFill } from "@/components/media/stock-fill";
import { ModelPreview } from "@/components/browse/model-preview";
import { Panel, PanelHead } from "@/components/ui/panel";
import { featuredLoras } from "@/components/home/featured";
import { useSelection } from "@/hooks/use-selection";
import { CHECKPOINTS, type Lora } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * The product's thesis, made operable — and shown rather than listed.
 *
 * A diagram of `base model → LoRA → five tools` would have been easier and would have
 * persuaded nobody, because the claim is not that the pipeline exists — it is that
 * choosing once changes everything downstream. That is a *consequence*, and a consequence
 * has to be caused to be believed. So these controls are not a mock-up: they write to the
 * same `use-selection` store `/browse` writes to, the five demonstrations below re-cast to
 * whatever is picked, and the tool opened next already has it loaded.
 *
 * **Both rows lead with the picture.** The first version was two rows of text chips, which
 * asked a visitor to choose between four base models and six characters on the strength of
 * names like "Ferrograph" and "Orrin Tide" — words that mean nothing until you have seen
 * what they produce. Nobody picks a model from a word. Base models get their preview clip
 * (motion is the only honest way to advertise a video-capable checkpoint) and LoRAs get a
 * portrait at a size where a face actually registers.
 */

export function SpineStrip({ subject }: { subject: Lora }) {
  const { checkpoint, lora, setCheckpoint, selectLora } = useSelection();
  const featured = featuredLoras();

  return (
    <Panel>
      <PanelHead
        title="home.spine"
        sub={lora ? `${subject.name} · ${checkpoint.name}` : "nothing loaded yet"}
      />

      <div className="flex flex-col divide-y divide-border">
        <Row label="base model" hint="what it can draw at all" cols="sm:grid-cols-3">
          {CHECKPOINTS.map((cp) => {
            const active = cp.id === checkpoint.id;
            return (
              <button
                key={cp.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setCheckpoint(cp.id)}
                title={cp.tagline}
                className={cn(
                  "m-press group flex w-[220px] shrink-0 flex-col border text-left transition-colors sm:w-auto",
                  active ? "border-accent" : "border-border-2 hover:border-ink"
                )}
              >
                <ModelPreview
                  slug={cp.preview}
                  name={cp.name}
                  poster={cp.poster}
                  active={active}
                  play
                />
                <Caption active={active} name={cp.name}>
                  {cp.nativeResolution} · {cp.costPerImage} cr
                </Caption>
              </button>
            );
          })}
        </Row>

        <Row label="lora" hint="who or what it draws" cols="sm:grid-cols-4 lg:grid-cols-7">
          {featured.map((item) => {
            // The fallback subject supplies downstream imagery only. It must not look
            // selected before the user chooses a LoRA.
            const active = lora?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectLora(item.id)}
                title={item.tagline}
                className={cn(
                  "m-press group flex w-[176px] shrink-0 flex-col border text-left transition-colors sm:w-auto",
                  active ? "border-accent" : "border-border-2 hover:border-ink"
                )}
              >
                <span className="relative block aspect-[3/4] w-full overflow-hidden bg-panel-2">
                  <StockFill
                    seedKey={item.id}
                    subject="portrait"
                    alt=""
                    sizes="176px"
                    className="h-full w-full"
                  />
                  {active && (
                    <span className="absolute right-1.5 top-1.5 border border-accent bg-bg/85 p-1 backdrop-blur">
                      <Check className="h-3 w-3 text-accent" aria-hidden="true" />
                    </span>
                  )}
                </span>
                <Caption active={active} name={item.name}>
                  {item.triggerWords[0]}
                </Caption>
              </button>
            );
          })}

          <Link
            to="/home#catalog"
            className="m-hover flex w-[176px] shrink-0 flex-col items-center justify-center gap-1 border border-border-2 bg-panel-2/40 px-3 py-6 no-underline transition-colors hover:border-ink sm:w-auto"
          >
            <span className="font-mono text-[11px] font-semibold text-ink">all →</span>
            <span className="text-center font-mono text-[9.5px] leading-[1.5] text-ink-muted-2">
              browse the
              <br />
              full catalog
            </span>
          </Link>
        </Row>
      </div>

      <p className="border-t border-border px-4 py-2.5 font-mono text-[10.5px] leading-[1.6] text-ink-muted-2">
        {lora ? (
          <>
            <span className="text-accent">{subject.name}</span> is loaded on{" "}
            {checkpoint.name} — every tool below is already using it
          </>
        ) : (
          <>
            pick a face — the five tools below re-cast to it, and so does whichever one you
            open
          </>
        )}
      </p>
    </Panel>
  );
}

/**
 * The ruled strip under a tile's picture. Inside the tile's own border rather than a box
 * of its own, so the grammar stays "one bordered thing per choice" — no nested panels.
 */
function Caption({
  active,
  name,
  children,
}: {
  active: boolean;
  name: string;
  children: ReactNode;
}) {
  return (
    // Same glass recipe as the preview clip's own status chip (`bg-bg/80` + blur, border-2)
    // — this strip sits directly under a picture, so it gets the treatment Ledger already
    // uses wherever text has to sit on top of imagery rather than the flat panel ground.
    <span
      className={cn(
        "flex min-w-0 flex-col gap-0.5 border-t px-2.5 py-2 backdrop-blur-[10px]",
        active ? "border-accent/40" : "border-border-2"
      )}
      style={{ background: "color-mix(in srgb, var(--bg) 78%, transparent)" }}
    >
      <span
        className={cn(
          "truncate font-sans text-[13px] font-semibold transition-colors",
          active ? "text-accent" : "text-ink"
        )}
      >
        {name}
      </span>
      <span className="truncate font-mono text-[9.5px] tabular-nums text-ink-muted-2">
        {children}
      </span>
    </span>
  );
}

function Row({
  label,
  hint,
  cols,
  children,
}: {
  label: string;
  /** One line saying what this step of the pipeline decides. */
  hint: string;
  /** Column counts for this row — the two steps hold different numbers of tiles. */
  cols: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-muted-2">
          {label}
        </span>
        <span className="font-sans text-[12px] text-ink-muted-2">{hint}</span>
      </div>

      {/*
        A scrolling row on a phone, a grid from sm up. Wrapping the tiles on a narrow
        screen would break the two rows into paragraphs of thumbnails and lose the thing
        the layout is for — that this is a pipeline with two steps, in order.
      */}
      <div className={cn(
          "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0",
          cols
        )}>
        {children}
      </div>
    </div>
  );
}
