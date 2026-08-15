import type { ReactNode } from "react";
import { StockFill } from "@/components/media/stock-fill";
import { useDemoScript, type StageGrant } from "@/hooks/use-demo-stage";
import type { Lora } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * The transcript's speaker grammar, at a quarter scale — three exchanges deep.
 *
 * It keeps the asymmetry the real surface is built on — the character has a face and
 * speaks unboxed in full-strength ink, you are a bordered block in the margin — because
 * that asymmetry *is* the recognisable thing about our chat, and a demo that flattened it
 * into two-tone bubbles would advertise a product nobody would recognise on arrival.
 *
 * One exchange was not a conversation, it was a screenshot with a timer on it. Three is
 * enough for the thing a chat product has to prove: that the replies follow from what you
 * said, that they get longer and stranger as it goes, and that the transcript scrolls.
 * The window here is `justify-end` over `overflow-hidden`, so new lines push older ones
 * off the top exactly the way the real transcript does when it outgrows the viewport — no
 * scroll position to manage and nothing animating a layout property to achieve it.
 *
 * Nothing here is labelled as model output. The lines are authored, the portrait is stock
 * standing in for a LoRA-generated avatar, and the panel's caption says so.
 */

/**
 * greet → you type → send → thinking → reply → you type → send → thinking → reply → hold.
 * The two reply steps go unnamed: a reply is simply "past the thinking step", and every
 * line below tests for that rather than for the beat it lands on.
 */
const SCRIPT = [1300, 1500, 900, 2200, 2400, 1500, 900, 2000, 2600, 2400] as const;
const [GREETING, YOU_TYPING_1, YOU_SENT_1, THINKING_1] = [0, 1, 2, 3];
const [YOU_TYPING_2, YOU_SENT_2, THINKING_2] = [5, 6, 7];

export function ChatDemo({ grant, lora }: { grant: StageGrant; lora: Lora }) {
  const step = useDemoScript(SCRIPT, grant.playing);
  const name = lora.name;

  const turn = step >= YOU_SENT_2 ? 5 : step >= YOU_SENT_1 ? 4 : 3;

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* The stage's header bar. Without it the transcript sat at the bottom of an empty
          box — three lines of dialogue floating in a void, which is not what the chat
          surface looks like and reads as a rendering bug. */}
      <div className="flex items-center gap-2 border-b border-border bg-panel px-3 py-2">
        <span className="h-4 w-4 shrink-0 overflow-hidden border border-border-2">
          <StockFill seedKey={lora.id} alt="" sizes="16px" subject="portrait" />
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          {name}
        </span>
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider tabular-nums text-ink-muted-2">
          turn {turn}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden p-3.5">
        <Line show={step >= GREETING}>
          <Said name={name} loraId={lora.id}>
            You actually came back.
          </Said>
        </Line>

        <Line show={step >= YOU_TYPING_1}>
          <Yours typing={step === YOU_TYPING_1} draft="I said I wo">
            I said I would.
          </Yours>
        </Line>

        <Line show={step >= THINKING_1}>
          <Said name={name} loraId={lora.id} thinking={step === THINKING_1}>
            Then sit down. This one takes a while.
          </Said>
        </Line>

        <Line show={step >= YOU_TYPING_2}>
          <Yours typing={step === YOU_TYPING_2} draft="Start with the pa">
            Start with the part you left out.
          </Yours>
        </Line>

        <Line show={step >= THINKING_2}>
          <Said name={name} loraId={lora.id} thinking={step === THINKING_2}>
            The part I left out is the reason there's a letter at all. You're not going to
            like whose handwriting it's in.
          </Said>
        </Line>
      </div>

      {/* The composer. It is where the caret actually is for most of this loop, and
          leaving it out put the typing indicator in mid-air. */}
      <div className="flex items-center gap-2 border-t border-border bg-panel px-3 py-1.5">
        <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-ink-muted-2">
          {step === YOU_TYPING_1 || step === YOU_TYPING_2 ? "…" : `message ${name}`}
        </span>
        <span
          className={cn(
            "shrink-0 border px-1.5 py-[2px] font-mono text-[9px] uppercase tracking-wider transition-colors",
            step === YOU_SENT_1 || step === YOU_SENT_2
              ? "border-accent bg-accent text-[#06060A]"
              : "border-border-2 text-ink-muted-2"
          )}
        >
          send
        </span>
      </div>
    </div>
  );
}

function Said({
  name,
  loraId,
  thinking = false,
  children,
}: {
  name: string;
  loraId: string;
  thinking?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[26px_minmax(0,1fr)] gap-x-2.5 gap-y-1">
      <div className="h-[26px] w-[26px] overflow-hidden border border-border-2 bg-panel-2">
        <StockFill seedKey={loraId} alt="" sizes="26px" subject="portrait" />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate font-mono text-[8.5px] uppercase tracking-[0.18em] text-ink-muted-2">
          {name}
        </span>
        {thinking ? (
          // `m-pending` is the system's one "working" loop. A bespoke bouncing-dot
          // animation would be a second one, and motion.css is explicit that nothing
          // loops that isn't actually working — so the working state uses the role
          // built for it rather than inventing a keyframe here.
          <span aria-hidden="true" className="m-pending block h-[13px] w-[42%] bg-panel-2" />
        ) : (
          <p className="m-0 font-sans text-[13px] leading-[1.5] text-ink">{children}</p>
        )}
      </div>
    </div>
  );
}

function Yours({
  typing,
  draft,
  children,
}: {
  typing: boolean;
  /** The half-written string shown while the caret is still moving. */
  draft: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "m-0 ml-auto max-w-[75%] border border-border-2 bg-panel-2 px-2.5 py-1.5 text-right font-sans text-[12.5px] leading-[1.45]",
        typing ? "text-ink-muted-2" : "text-ink"
      )}
    >
      {typing ? (
        <>
          {draft}
          <span
            aria-hidden="true"
            className="ml-px inline-block h-[1em] w-[1px] translate-y-[0.15em] bg-accent"
          />
        </>
      ) : (
        children
      )}
    </p>
  );
}

/**
 * Arrival is `m-enter` — the same de-noise every other element in the product uses. Lines
 * that have not happened yet are absent rather than `invisible`: in a window that scrolls,
 * reserving their space would push the live line off the top before it was spoken.
 */
function Line({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return <div className="m-enter shrink-0">{children}</div>;
}
