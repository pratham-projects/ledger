import { StockFill } from "@/components/media/stock-fill";
import { useDemoScript, type StageGrant } from "@/hooks/use-demo-stage";
import { RPG_TURN_COST } from "@/hooks/use-rpg";
import type { Lora } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * Two turns: the narrator sets a scene, three doors open, you take one, the world draws
 * it — and then the world it drew becomes the next scene.
 *
 * The commit beat is the one that matters. Every text-adventure product on the internet
 * can show you a paragraph and three buttons; what makes this one worth opening is that
 * choosing something produces a *picture* of it, drawn by the model you loaded. So the
 * demo spends its longest steps on exactly that — the chosen option locking, then the
 * illustration resolving underneath it.
 *
 * A single turn could not show the part that makes it a game rather than a generator: that
 * the choice you made is what the next scene is about. Two turns can, and the second one's
 * prose picks up where the first one's picture left off.
 */

/**
 * Per turn: scene reads → one option lights → the choice commits → the world draws it →
 * the picture holds. Turn one opens at step 0, so it needs no name of its own.
 */
const SCRIPT = [2400, 1100, 1300, 2600, 2200, 2400, 1100, 1300, 2600, 2400] as const;
const [HOVER_1, CHOSEN_1, ILLUSTRATING_1, ILLUSTRATED_1] = [1, 2, 3, 4];
const [SCENE_2, HOVER_2, CHOSEN_2, ILLUSTRATING_2] = [5, 6, 7, 8];
const ILLUSTRATED_2 = 9;

const TURNS = [
  {
    n: 4,
    scene:
      "The stair ends at a door that was not there an hour ago. Something behind it is still warm.",
    choices: ["Follow the light", "Wait for morning", "Turn back"],
    taken: 0,
  },
  {
    n: 5,
    scene:
      "The light was a lamp, and the lamp was being carried. Whoever set it down did so recently, and did not take it with them.",
    choices: ["Call out", "Take the lamp", "Douse it and listen"],
    taken: 1,
  },
] as const;

export function RpgDemo({ grant, lora }: { grant: StageGrant; lora: Lora }) {
  const step = useDemoScript(SCRIPT, grant.playing);

  const second = step >= SCENE_2;
  const turn = second ? TURNS[1] : TURNS[0];
  const [hoverStep, chosenStep, illustratingStep] = second
    ? [HOVER_2, CHOSEN_2, ILLUSTRATING_2]
    : [HOVER_1, CHOSEN_1, ILLUSTRATING_1];

  // Turn one's picture stays on screen through turn two's deliberation — the illustration
  // is part of the record, not a transient, and a band that emptied itself between turns
  // would read as the last turn being undone.
  const showing = step >= ILLUSTRATED_2 ? 2 : step >= ILLUSTRATED_1 && step < ILLUSTRATING_2 ? 1 : 0;

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-3.5">
        {/* A scene change is a division of the document, not a participant in it. */}
        <div className="flex items-center gap-2.5">
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
          <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] tabular-nums text-ink-muted-2">
            turn {turn.n}
          </span>
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>

        <p
          key={turn.n}
          className="m-enter m-0 font-sans text-[12.5px] italic leading-[1.6] text-ink-muted"
        >
          {turn.scene}
        </p>

        <div className="mt-auto flex flex-col gap-1.5">
          {turn.choices.map((choice, i) => {
            const taken = i === turn.taken;
            const marked = taken && step >= chosenStep;
            const lit = taken && step === hoverStep;

            return (
              <span
                key={`${turn.n}-${choice}`}
                className={cn(
                  "flex items-center justify-between gap-2 border px-2.5 py-1.5 font-mono text-[10.5px] transition-colors duration-200",
                  marked
                    ? "border-accent bg-accent/10 text-accent"
                    : lit
                      ? "border-ink text-ink"
                      : "border-border-2 text-ink-muted-2",
                  // Untaken options fade out once the turn is committed — the fiction
                  // has moved on and they are no longer live.
                  step >= chosenStep && !taken && "opacity-35"
                )}
              >
                <span className="truncate">{choice}</span>
                {marked && <span aria-hidden="true">→</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/*
        The illustration occupies a reserved band, always. Sliding it up over the turn was
        tried first and looked like a bug: the panel travelled across the choice list and
        sheared the last option in half on its way. An image in this product is part of the
        record, not an overlay on it — so the space is committed from the first frame and
        only its *contents* change, pending → resolved, exactly as every other image in the
        product arrives.
      */}
      <div className="relative h-[38%] shrink-0 overflow-hidden border-t border-border bg-panel-2">
        {showing > 0 ? (
          <>
            <StockFill
              seedKey={`${lora.id}-demo-rpg-${showing}`}
              subject="scene"
              alt=""
              sizes="(min-width: 1280px) 600px, (min-width: 768px) 45vw, 92vw"
            />
            <span className="absolute bottom-2 left-3 font-mono text-[9.5px] uppercase tracking-wider text-ink drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {lora.name} · turn {showing === 2 ? TURNS[1].n : TURNS[0].n}
            </span>
            <span className="absolute bottom-2 right-3 font-mono text-[9.5px] font-semibold tabular-nums text-red drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              −{RPG_TURN_COST}
            </span>
          </>
        ) : (
          <>
            <span aria-hidden="true" className="m-pending absolute inset-0" />
            <span className="absolute bottom-2 left-3 font-mono text-[9.5px] uppercase tracking-wider text-ink-muted-2">
              {step >= illustratingStep
                ? "illustrating…"
                : step === chosenStep
                  ? "resolving your move"
                  : "awaiting your move"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
