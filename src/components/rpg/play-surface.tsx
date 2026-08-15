/**
 * The immersive play surface.
 *
 * Once a session starts, /rpg docks inside `HubShell` by default — same fix as chat's
 * `ChatStage`: a surface that hides the hub's rail the moment a session begins is a
 * visitor who can never see where else the site goes without first finding an exit. Full
 * screen is one tap away via the header's `SurfaceButton`, still the better fit on a
 * phone. The frame is `SessionSurface`, shared with chat and story, so all three behave
 * identically once toggled.
 *
 * Three structural choices are deliberate:
 * - The log is a document, not a chat. Narration is plain prose in one measure; the
 *   player's turns sit indented against a rule inside the same column. No bubbles, no
 *   left/right alternation — an adventure reads as one continuous text.
 * - **The world's turns write themselves in; yours appear instantly.** That asymmetry is
 *   the only thing distinguishing the two authors of this document at a glance, and it is
 *   why the narrator carries an accent mark and you do not.
 * - The drawer *pushes* the log rather than covering it. On a wide screen you can steer
 *   the world and keep reading it at the same time.
 */
import { useState } from "react";
import {
  ChevronsRight,
  Eraser,
  Eye,
  Footprints,
  Image as ImageIcon,
  PanelRight,
  PenLine,
  Quote,
  RotateCw,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionSurface, SurfaceButton } from "@/components/session/session-surface";
import { SceneImage } from "@/components/session/scene-image";
import { StreamedBody } from "@/components/session/streaming-text";
import { AuthorMark } from "@/components/session/author-mark";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useStreamedText } from "@/hooks/use-streamed-text";
import { useStickToBottom, useArrivalNotifier } from "@/hooks/use-stick-to-bottom";
import { useCredits } from "@/hooks/use-credits";
import {
  RPG_ILLUSTRATE_COST,
  RPG_MODES,
  RPG_TURN_COST,
  type RpgMode,
  type RpgTurn,
  type useRpg,
} from "@/hooks/use-rpg";
import { RpgDrawer } from "@/components/rpg/rpg-drawer";

type Rpg = ReturnType<typeof useRpg>;

const MODE_ICON: Record<RpgMode, typeof Footprints> = {
  do: Footprints,
  say: Quote,
  story: PenLine,
  see: Eye,
};

/** How an action turn reads back in the log, given the verb that produced it. */
function actionLine(turn: RpgTurn): string {
  switch (turn.mode) {
    case "say":
      return `You say, "${turn.text}"`;
    case "see":
      return `You look at ${turn.text}`;
    default:
      return /^you\b/i.test(turn.text) ? turn.text : `You ${turn.text}`;
  }
}

export function PlaySurface({ rpg }: { rpg: Rpg }) {
  const credits = useCredits();
  const [composing, setComposing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Docked is the default now — see the header note above. Full screen is one tap away.
  const [full, setFull] = useState(false);
  const stick = useStickToBottom();

  const activeMode = RPG_MODES.find((m) => m.key === rpg.mode)!;
  const newestId = rpg.turns[rpg.turns.length - 1]?.id ?? null;

  useArrivalNotifier(rpg.turns.length, stick.noteArrival);

  const submit = () => {
    rpg.act();
    if (rpg.mode !== "story") setComposing(false);
  };

  return (
    <SessionSurface
      full={full}
      onFullChange={setFull}
      stick={stick}
      header={
        <>
          <SurfaceButton onClick={rpg.abandon} label="Leave this adventure and start over">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">exit</span>
          </SurfaceButton>

          <div className="flex min-w-0 flex-1 flex-col">
            <span
              className="truncate font-sans text-[14.5px] font-semibold leading-tight text-ink"
              title={rpg.world.name}
            >
              {rpg.world.name}
            </span>
            <span className="truncate font-mono text-[10.5px] leading-[1.5] text-ink-muted-2">
              {rpg.characterClass.name} · turn <span className="tabular-nums">{rpg.turnCount}</span>
            </span>
          </div>

          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 font-mono text-[12px] font-semibold",
              credits.balance <= 5 ? "text-red" : "text-ink"
            )}
            title={`${credits.balance} of ${credits.cap} credits`}
          >
            <Zap
              className={cn("h-3.5 w-3.5", credits.balance <= 5 ? "text-red" : "text-accent")}
              aria-hidden="true"
            />
            <span className="tabular-nums">{credits.balance}</span>
          </span>

          <SurfaceButton
            onClick={() => setDrawerOpen((o) => !o)}
            active={drawerOpen}
            expanded={drawerOpen}
            label="World, carried items and source"
          >
            <PanelRight className="h-3.5 w-3.5" aria-hidden="true" />
          </SurfaceButton>
        </>
      }
      drawer={drawerOpen ? <RpgDrawer rpg={rpg} onClose={() => setDrawerOpen(false)} /> : undefined}
      dock={
        <div className="mx-auto max-w-[680px] px-4 py-3 sm:px-6 sm:py-3.5">
          {composing ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setComposing(false)}
                  aria-label="Close the action field"
                  className="m-press border border-border-2 p-1.5 text-ink-muted-2 transition-colors hover:border-ink hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                {/* All four verbs visible at once — one field, four meanings, and you can
                    see the other three rather than having to page through to find them.
                    They scroll horizontally rather than wrapping on a narrow phone: a
                    second row here would push the field under the keyboard. */}
                <div
                  role="radiogroup"
                  aria-label="Input mode"
                  className="desk-toolbar ledger-scrollbar flex min-w-0 flex-1 items-center overflow-x-auto"
                >
                  {RPG_MODES.map((m) => {
                    const Icon = MODE_ICON[m.key];
                    const active = m.key === rpg.mode;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        data-active={active}
                        onClick={() => rpg.setMode(m.key)}
                        className="desk-tool shrink-0 text-[12.5px]"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                <span className="font-mono text-[10.5px] text-ink-muted-2">
                  {activeMode.cost === 0
                    ? "free — you write this one, nothing is generated"
                    : `${activeMode.cost} cr`}
                </span>
              </div>

              <div className="flex items-end gap-2">
                <Textarea
                  autoFocus
                  rows={2}
                  value={rpg.draft}
                  onChange={(e) => rpg.setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                    if (e.key === "Escape") setComposing(false);
                  }}
                  placeholder={activeMode.placeholder}
                  aria-label={`Your turn — ${activeMode.label} mode`}
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={submit}
                  disabled={!rpg.draft.trim() || rpg.pending}
                  className="shrink-0"
                >
                  Send
                </Button>
              </div>
            </div>
          ) : (
            /* Horizontal scroll rather than wrap: four commands wrapping to two rows on a
               phone doubles the dock's height and eats the log. */
            <div className="ledger-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1">
              <Command
                onClick={() => setComposing(true)}
                icon={PenLine}
                label="take a turn"
                primary
              />
              <Command
                onClick={rpg.continueStory}
                icon={ChevronsRight}
                label="continue"
                hint={`${RPG_TURN_COST} cr`}
                disabled={rpg.pending}
              />
              <Command
                onClick={rpg.retry}
                icon={RotateCw}
                label="retry"
                hint={`${RPG_TURN_COST} cr`}
                disabled={rpg.pending || !rpg.canRetry}
              />
              <Command
                onClick={rpg.erase}
                icon={Eraser}
                label="erase"
                disabled={rpg.pending || !rpg.canErase}
              />
            </div>
          )}
        </div>
      }
    >
      <div className="mx-auto flex max-w-[680px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        {rpg.turns.map((turn) =>
          turn.kind === "action" ? (
            <ActionBlock key={turn.id} turn={turn} rpg={rpg} />
          ) : (
            <NarrationBlock
              key={turn.id}
              turn={turn}
              rpg={rpg}
              stream={turn.id === newestId}
              onReveal={stick.follow}
            />
          )
        )}

        {rpg.pending && (
          <div className="ledger-message-in">
            <AuthorMark speaker="narrator" writing />
          </div>
        )}

      </div>
    </SessionSurface>
  );
}

function NarrationBlock({
  turn,
  rpg,
  stream,
  onReveal,
}: {
  turn: RpgTurn;
  rpg: Rpg;
  stream: boolean;
  onReveal: () => void;
}) {
  const streamed = useStreamedText(turn.text, { enabled: stream, onReveal });

  return (
    <article className="ledger-message-in group flex flex-col gap-2.5">
      <AuthorMark speaker="narrator" writing={streamed.streaming} />

      <StreamedBody
        streamed={streamed}
        text={turn.text}
        className="font-sans text-[16.5px] leading-[1.8] text-ink"
      />

      {/* The illustration waits for the words. A picture landing mid-sentence competes
          with the sentence, and the reader loses both. */}
      {!streamed.streaming &&
        (turn.sceneSeed !== undefined ? (
          <SceneImage
            seed={turn.sceneSeed}
            generating={Boolean(turn.illustrating)}
            caption={
              rpg.loraName
                ? `Illustrated with ${rpg.loraName}`
                : "Scene illustration"
            }
          />
        ) : (
          <button
            type="button"
            onClick={() => rpg.illustrate(turn.id)}
            className="m-press inline-flex w-fit items-center gap-1.5 border border-border-2 px-2.5 py-1.5 font-mono text-[11px] text-ink-muted-2 transition-colors hover:border-accent hover:text-accent"
          >
            <ImageIcon className="h-3 w-3" aria-hidden="true" />
            illustrate this — {RPG_ILLUSTRATE_COST} cr
          </button>
        ))}
    </article>
  );
}

function ActionBlock({ turn, rpg }: { turn: RpgTurn; rpg: Rpg }) {
  const Icon = MODE_ICON[turn.mode ?? "do"];
  return (
    <article className="ledger-message-in group flex flex-col gap-2.5 border-l border-accent pl-4">
      <AuthorMark speaker="you" voice="user" />
      <p className="m-0 flex items-baseline gap-2.5 font-sans text-[15px] leading-[1.7] text-ink-muted">
        <Icon className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-accent" aria-hidden="true" />
        {actionLine(turn)}
      </p>
      {turn.sceneSeed !== undefined && (
        <SceneImage
          seed={turn.sceneSeed}
          generating={Boolean(turn.illustrating)}
          caption={
            rpg.loraName
              ? `Illustrated with ${rpg.loraName}`
              : "Scene illustration"
          }
        />
      )}
    </article>
  );
}

function Command({
  onClick,
  icon: Icon,
  label,
  hint,
  primary,
  disabled,
}: {
  onClick: () => void;
  icon: typeof PenLine;
  label: string;
  hint?: string;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      variant={primary ? "primary" : "ghost"}
      size="md"
      onClick={onClick}
      disabled={disabled}
      className="shrink-0"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
      {hint && (
        <span
          className={cn(
            "font-normal",
            primary ? "text-[color-mix(in_srgb,var(--on-accent)_60%,transparent)]" : "text-ink-muted-2"
          )}
        >
          {hint}
        </span>
      )}
    </Button>
  );
}
