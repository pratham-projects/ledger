import { RotateCw } from "lucide-react";
import { StockFill } from "@/components/media/stock-fill";
import { DitheringShader } from "@/components/ui/dithering-shader";
import { DemoStatus, TypedLine } from "@/components/home/flow-demo";
import { useDemoRamp, useDemoScript, type StageGrant } from "@/hooks/use-demo-stage";
import { IMAGE_GENERATE_COST, IMAGE_REGENERATE_COST } from "@/hooks/use-image-generation";
import type { Lora } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * A whole image session, not a single generation.
 *
 * The earlier version showed one picture arriving and stopped, which demonstrated that we
 * have a text box and a spinner — true of every generator on the internet. What is
 * actually worth watching is the loop *after* the first result: a batch lands, one of the
 * two is not right, you reroll that one alone for a third of the price and keep the other.
 * That is the working rhythm of the real surface and the reason its tiles carry their own
 * regenerate control, so the demo now plays it end to end.
 *
 * The waits are kept honest. Real generation on this product's backend is not instant, and
 * a demo that cut from a button press to a finished picture would be selling a product we
 * do not have — so the shader runs, the sampler counts up, and the result arrives
 * afterwards, at the same order of magnitude as the real two-stage wait.
 */

/** Step durations, ms. Index into these is what the whole demo branches on. */
const SCRIPT = [2200, 1000, 800, 2600, 2000, 1000, 700, 2200, 2800] as const;
const [
  WRITING,
  STYLING,
  QUEUED,
  SAMPLING,
  LANDED,
  REGEN_TAP,
  REGEN_QUEUED,
  REGEN_SAMPLING,
  REGEN_DONE,
] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const TOTAL_STEPS = 30;
const STYLE_TAG = "cinematic lighting";

export function ImageDemo({ grant, lora }: { grant: StageGrant; lora: Lora }) {
  const step = useDemoScript(SCRIPT, grant.playing);

  // Seeded on the LoRA itself, not on a demo-specific key, so the first picture that lands
  // is the *same picture* as the thumbnail the visitor just clicked in the spine strip.
  // That correspondence is the entire claim of this panel — you pick a face, you get that
  // face — and a different stock image here would quietly contradict it.
  const prompt = `${lora.triggerWords[0]}, close portrait, soft light`;

  const batchWorking = step === QUEUED || step === SAMPLING;
  const regenWorking = step === REGEN_QUEUED || step === REGEN_SAMPLING;

  const sampled = Math.round(useDemoRamp(step === SAMPLING, SCRIPT[SAMPLING]) * TOTAL_STEPS);
  const resampled = Math.round(
    useDemoRamp(step === REGEN_SAMPLING, SCRIPT[REGEN_SAMPLING]) * TOTAL_STEPS
  );

  // Only the second tile is rerolled, and a reroll is a new seed — so it resolves to a
  // different picture while its neighbour is untouched. That contrast is the whole beat.
  const secondSeed = step >= REGEN_QUEUED ? `${lora.id}-b2` : `${lora.id}-b`;

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* The composer, reduced to its load-bearing parts. */}
      <div className="flex flex-col gap-1.5 border-b border-border bg-panel px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-wider text-ink-muted-2">
            prompt
          </span>
          <span className="min-w-0 flex-1 truncate">
            <TypedLine
              key={`${prompt}-${step === WRITING ? "typing" : "done"}`}
              text={prompt}
              typing={step === WRITING}
            />
          </span>
          <span
            className={cn(
              "shrink-0 border px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-wider transition-colors",
              step <= STYLING
                ? "border-border-2 text-ink-muted-2"
                : "border-accent bg-accent text-[#06060A]"
            )}
          >
            generate
          </span>
        </div>

        {/* The modifier tags, quoted from the real composer — the beat where one gets
            picked is what tells a visitor those chips are selectable at all. */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span
            className={cn(
              "shrink-0 border px-1.5 py-[2px] font-mono text-[9px] transition-colors duration-200",
              step >= STYLING
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-2 text-ink-muted-2"
            )}
          >
            {STYLE_TAG}
          </span>
          <span className="shrink-0 border border-border-2 px-1.5 py-[2px] font-mono text-[9px] text-ink-muted-2">
            film grain
          </span>
          <span className="truncate border border-border-2 px-1.5 py-[2px] font-mono text-[9px] text-ink-muted-2">
            depth of field
          </span>
        </div>
      </div>

      {/*
        Two tiles, because two is what the first generate on the real surface produces.
        A single frame here would misreport the batch and leave nowhere for the reroll to
        happen — you cannot show "keep this one, redo that one" with one picture.
      */}
      <div className="relative grid min-h-0 flex-1 grid-cols-2 gap-px bg-border">
        <Tile
          seedKey={lora.id}
          working={batchWorking}
          shader={grant.mayUseShader && step === SAMPLING}
          landed={step >= LANDED}
        />
        <Tile
          seedKey={secondSeed}
          working={batchWorking || regenWorking}
          // One WebGL context per demo, so the reroll's field falls back to `m-pending`
          // rather than mounting a second one. Same rule as the stage enforces globally.
          shader={false}
          landed={step >= LANDED && !regenWorking}
          reroll={step === REGEN_TAP ? "tapped" : step >= LANDED ? "idle" : undefined}
        />

        {step === QUEUED && <DemoStatus tone="muted">queued 2…</DemoStatus>}
        {step === SAMPLING && (
          <DemoStatus tone="accent">
            sampling {sampled}/{TOTAL_STEPS}
          </DemoStatus>
        )}
        {step === LANDED && (
          <>
            <DemoStatus tone="green">2 ready</DemoStatus>
            <Spend amount={IMAGE_GENERATE_COST} />
          </>
        )}
        {step === REGEN_TAP && <DemoStatus tone="muted">regenerate tile 2</DemoStatus>}
        {step === REGEN_QUEUED && <DemoStatus tone="muted">queued 1…</DemoStatus>}
        {step === REGEN_SAMPLING && (
          <DemoStatus tone="accent">
            resampling {resampled}/{TOTAL_STEPS}
          </DemoStatus>
        )}
        {step === REGEN_DONE && (
          <>
            <DemoStatus tone="green">new seed · ready</DemoStatus>
            <Spend amount={IMAGE_REGENERATE_COST} />
          </>
        )}
      </div>
    </div>
  );
}

function Tile({
  seedKey,
  working,
  shader,
  landed,
  reroll,
}: {
  seedKey: string;
  working: boolean;
  shader: boolean;
  landed: boolean;
  /** Present once the tile has a result to reroll; "tapped" is the pressed frame. */
  reroll?: "idle" | "tapped";
}) {
  return (
    <div className="relative overflow-hidden bg-panel-2">
      {working ? (
        shader ? (
          <DitheringShader
            shape="warp"
            type="4x4"
            colorBack="var(--panel-2)"
            colorFront="var(--accent)"
            pxSize={2}
            speed={0.9}
            className="absolute inset-0"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          // No shader token: the field still has to read as "working", so it falls back
          // to the same latent role every loading image in the product uses.
          <span aria-hidden="true" className="m-pending absolute inset-0" />
        )
      ) : (
        <div className="absolute inset-0">
          <StockFill
            seedKey={seedKey}
            subject="portrait"
            alt=""
            sizes="(min-width: 1280px) 310px, (min-width: 768px) 23vw, 46vw"
          />
        </div>
      )}

      {/* The per-tile control the real result grid carries. It only exists once there is
          something to replace, which is also why it cannot appear before the batch lands. */}
      {landed && reroll && (
        <span
          className={cn(
            "absolute right-1.5 top-1.5 z-10 border p-1 transition-colors duration-150",
            reroll === "tapped"
              ? "border-accent bg-accent text-[#06060A]"
              : "border-border-2 bg-bg/80 text-ink-muted backdrop-blur"
          )}
        >
          <RotateCw className="h-2.5 w-2.5" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

function Spend({ amount }: { amount: number }) {
  return (
    <span className="absolute bottom-2.5 right-3 z-10 font-mono text-[10px] font-semibold tabular-nums text-red drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
      −{amount}
    </span>
  );
}
