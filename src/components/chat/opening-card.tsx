/**
 * The top of the transcript, which is also this surface's title block and its empty
 * state — the same object doing all three jobs, because they are all the same moment:
 * "here is who you are about to talk to."
 *
 * The old /chat spent a 56px-padded page header and a 160px dashed empty state saying
 * nothing, then gave the conversation a 480px box underneath. This inverts that. The
 * headline is here, the character is here at a size where a face reads, and it all
 * scrolls away the moment the conversation has anything in it.
 */
import { Link } from "react-router-dom";
import { StockFill } from "@/components/media/stock-fill";
import { useSelection } from "@/hooks/use-selection";

/** Tells /browse where this visitor came from, so it can render its return bar. */
const BROWSE_ORIGIN = { returnTo: "/chat", returnLabel: "chat.session" };

export function OpeningCard({
  characterName,
  description,
  portraitSeed,
}: {
  characterName: string;
  description: string;
  portraitSeed: string;
}) {
  const { lora } = useSelection();

  return (
    <header className="ledger-message-in flex flex-col gap-7">
      <div className="flex flex-col gap-[18px]">
        <p className="desk-kicker m-0">chat.session</p>
        <h1 className="desk-display m-0" style={{ fontSize: "clamp(28px, 4.5vw, 40px)" }}>
          Talk to <span className="desk-em">characters you make up.</span>
        </h1>
        <p className="m-0 max-w-[54ch] font-sans text-[15.5px] leading-[1.65] text-ink-muted">
          Write as yourself, as them, as the narrator, or drop a picture into the scene.
          Every line stays editable after the fact, and whatever LoRA you have loaded is
          their face.
        </p>
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-start sm:gap-5">
        <div className="w-[112px] shrink-0 overflow-hidden border border-border-2 bg-panel-2 sm:w-[132px]">
          <div className="aspect-[3/4]">
            <StockFill seedKey={portraitSeed} alt="" sizes="132px" subject="portrait" />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <h2
            className="m-0 truncate font-display text-[24px] font-bold leading-tight tracking-[-0.01em] text-ink"
            title={characterName}
          >
            {characterName}
          </h2>

          {description ? (
            <p className="m-0 max-w-[52ch] whitespace-pre-wrap font-sans text-[14.5px] leading-[1.6] text-ink-muted">
              {description}
            </p>
          ) : (
            <p className="m-0 max-w-[52ch] font-sans text-[14.5px] leading-[1.6] text-ink-muted-2">
              No description written yet — they'll answer, but they won't be anyone in
              particular. Open <span className="font-mono text-[13px] text-ink-muted">character</span>{" "}
              to give them a past.
            </p>
          )}

          {lora ? (
            <p className="m-0 flex flex-wrap items-baseline gap-x-2 font-mono text-[11px] text-ink-muted-2">
              <span>face and pictures from</span>
              <span className="max-w-[28ch] truncate text-accent" title={lora.name}>
                {lora.name}
              </span>
              {/* Carries the origin so the catalog can offer a way back. The no-navigation
                  path is the picker under `character → source`; this one is for people who
                  actually want to browse. */}
              <Link
                to="/home#catalog"
                state={BROWSE_ORIGIN}
                className="text-ink-muted no-underline transition-colors hover:text-accent"
              >
                change →
              </Link>
            </p>
          ) : (
            <p className="m-0 flex flex-wrap items-baseline gap-x-2 font-mono text-[11px] text-ink-muted-2">
              <span>no LoRA loaded — this face is a stand-in</span>
              <Link
                to="/home#catalog"
                state={BROWSE_ORIGIN}
                className="text-accent no-underline transition-colors hover:brightness-125"
              >
                browse the catalog →
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* The conversation begins on a rule, so the log has a visible top edge. */}
    </header>
  );
}
