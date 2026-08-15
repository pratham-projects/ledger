/**
 * The contents of the log. Scrolling, pinning and the "latest" control now belong to
 * `SessionSurface` + `useStickToBottom`, shared with RPG and story — this component is
 * only the column of messages and the opening card above them.
 */
import { OpeningCard } from "@/components/chat/opening-card";
import { Message, type MessageActions } from "@/components/chat/message";
import { AuthorMark } from "@/components/session/author-mark";
import { StockFill } from "@/components/media/stock-fill";
import type { ChatMessage } from "@/hooks/use-chat";

export function Transcript({
  messages,
  characterName,
  description,
  portraitSeed,
  loraName,
  isTyping,
  onStreamReveal,
  actions,
}: {
  messages: ChatMessage[];
  characterName: string;
  description: string;
  portraitSeed: string;
  loraName: string | null;
  isTyping: boolean;
  /** Keeps the view pinned while a reply writes itself. */
  onStreamReveal: () => void;
  actions: MessageActions;
}) {
  /**
   * The id of the last message, so only *it* may stream. Everything above it is history:
   * re-streaming an old line on any unrelated re-render would be a lie about when it was
   * written, and re-streaming the whole transcript after an edit would be unusable.
   */
  const newestId = messages[messages.length - 1]?.id ?? null;

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-7 px-4 py-6 sm:px-8 sm:py-8">
      <OpeningCard
        characterName={characterName}
        description={description}
        portraitSeed={portraitSeed}
      />

      <div className="flex flex-col gap-7" role="log" aria-live="polite" aria-label="Conversation">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            characterName={characterName}
            portraitSeed={portraitSeed}
            loraName={loraName}
            isNewest={message.id === newestId}
            onStreamReveal={onStreamReveal}
            actions={actions}
          />
        ))}
        {isTyping && (
          <TypingIndicator characterName={characterName} portraitSeed={portraitSeed} />
        )}
      </div>
    </div>
  );
}

/**
 * The gap between "you sent it" and the first word arriving. Uses the same `AuthorMark`
 * the reply itself will use, in the same place, so when the line starts writing nothing
 * on screen jumps — the label was already there and simply stops saying "writing".
 */
function TypingIndicator({
  characterName,
  portraitSeed,
}: {
  characterName: string;
  portraitSeed: string;
}) {
  return (
    <div className="ledger-message-in grid grid-cols-[34px_minmax(0,1fr)] items-center gap-x-3.5">
      <div
        className="h-[34px] w-[34px] overflow-hidden border border-border-2 bg-panel-2"
        title={characterName}
      >
        <StockFill seedKey={portraitSeed} alt="" sizes="34px" subject="portrait" />
      </div>
      <AuthorMark speaker={characterName} writing title={characterName} />
    </div>
  );
}
