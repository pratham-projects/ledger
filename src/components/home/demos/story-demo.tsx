import type { ReactNode } from "react";
import { StockFill } from "@/components/media/stock-fill";
import { useDemoScript, type StageGrant } from "@/hooks/use-demo-stage";
import type { Lora } from "@/lib/catalog";

/**
 * Prose arriving a paragraph at a time, illustrating itself twice, and crossing into a
 * second chapter.
 *
 * Story is the hardest of the five to demonstrate, because its output is text and text
 * takes longer to read than a loop should last. So the demo does not ask anyone to read
 * it: the paragraphs are set at a deliberately small measure and arrive as *shapes*, and
 * the beat the eye is meant to catch is the picture appearing mid-column — which is the
 * actual claim this tool makes, that the narrative illustrates itself as it goes.
 *
 * One illustration only proved a story can have a picture in it. Two, at different points,
 * with a chapter rule between them, proves the thing that is actually distinctive: the
 * illustrations keep coming, they are drawn by the LoRA you loaded, and the document grows
 * past its own frame. The column is anchored to the bottom of an `overflow-hidden` box, so
 * earlier paragraphs slide off the top as later ones land — an auto-scrolling manuscript,
 * with no scroll position to manage and no layout property being animated.
 */

const SCRIPT = [1600, 1800, 1400, 2400, 2000, 1300, 2400, 1800, 2600] as const;
const [
  FIRST,
  SECOND,
  ILLUSTRATING_1,
  ILLUSTRATED_1,
  THIRD,
  CHAPTER_TWO,
  ILLUSTRATING_2,
  ILLUSTRATED_2,
  FOURTH,
] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const PARAGRAPHS = [
  "The letter arrived on a Tuesday, which was the first thing wrong with it.",
  "She read it twice before she found her own name in the margin, in a hand she had not used since she was nine.",
  "By the time the light went, she had copied it out four times, and each copy said something the last one hadn't.",
  "The house had been empty eleven years. The key still turned.",
];

export function StoryDemo({ grant, lora }: { grant: StageGrant; lora: Lora }) {
  const step = useDemoScript(SCRIPT, grant.playing);

  return (
    <div className="absolute inset-0 flex flex-col justify-end overflow-hidden px-4 py-3.5">
      <div className="flex flex-col gap-2">
        <Beat show={step >= FIRST}>
          <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-ink-muted-2">
            chapter one
          </span>
        </Beat>

        <Beat show={step >= FIRST}>
          <p className="m-0 font-sans text-[12px] leading-[1.65] text-ink">{PARAGRAPHS[0]}</p>
        </Beat>

        <Beat show={step >= SECOND}>
          <p className="m-0 font-sans text-[12px] leading-[1.65] text-ink-muted">
            {PARAGRAPHS[1]}
          </p>
        </Beat>

        <Beat show={step >= ILLUSTRATING_1}>
          <Plate
            lora={lora}
            seedKey={`${lora.id}-demo-story-1`}
            resolved={step >= ILLUSTRATED_1}
          />
        </Beat>

        <Beat show={step >= THIRD}>
          <p className="m-0 font-sans text-[12px] leading-[1.65] text-ink-muted">
            {PARAGRAPHS[2]}
          </p>
        </Beat>

        {/* A chapter break is a division of the document, not a paragraph in it — the same
            rule the RPG demo's turn rule follows. */}
        <Beat show={step >= CHAPTER_TWO}>
          <div className="flex items-center gap-2.5 pt-1">
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-ink-muted-2">
              chapter two
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
        </Beat>

        <Beat show={step >= ILLUSTRATING_2}>
          <Plate
            lora={lora}
            seedKey={`${lora.id}-demo-story-2`}
            resolved={step >= ILLUSTRATED_2}
          />
        </Beat>

        <Beat show={step >= FOURTH}>
          <p className="m-0 font-sans text-[12px] leading-[1.65] text-ink">{PARAGRAPHS[3]}</p>
        </Beat>

        <Beat show={step >= FOURTH}>
          <span className="font-mono text-[9.5px] uppercase tracking-wider text-ink-muted-2">
            writing chapter three…
          </span>
        </Beat>
      </div>
    </div>
  );
}

/**
 * An illustration inside the column. It takes its space the moment it is commissioned and
 * only its *contents* change, pending → resolved — the same arrival every other image in
 * the product performs, and the reason the prose beneath it never jumps.
 */
function Plate({
  lora,
  seedKey,
  resolved,
}: {
  lora: Lora;
  seedKey: string;
  resolved: boolean;
}) {
  return (
    <figure className="m-0 border border-border bg-panel-2">
      <div className="relative aspect-[16/7] overflow-hidden">
        {resolved ? (
          <StockFill
            seedKey={seedKey}
            subject="scene"
            alt=""
            sizes="(min-width: 1280px) 600px, (min-width: 768px) 45vw, 92vw"
          />
        ) : (
          <span aria-hidden="true" className="m-pending absolute inset-0" />
        )}
      </div>
      <figcaption className="border-t border-border px-2.5 py-1.5 font-mono text-[8.5px] text-ink-muted-2">
        {resolved ? `illustrated with ${lora.name}` : "illustrating…"}
      </figcaption>
    </figure>
  );
}

/**
 * Beats are absent until they happen rather than hidden in place: the column is anchored
 * to the bottom of its frame, so reserving space for unwritten paragraphs would push the
 * live one out of view before it was written.
 */
function Beat({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return <div className="m-enter shrink-0">{children}</div>;
}
