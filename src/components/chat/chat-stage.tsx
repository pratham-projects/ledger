/**
 * The chat surface as a stage rather than a page section.
 *
 * The old /chat was a 480px transcript box parked under a title block and a character
 * form, inside a scrolling page. That meant the conversation — the entire point of the
 * surface — occupied about a third of the screen, and reading it meant scrolling a page
 * that also scrolled the composer away from you.
 *
 * The frame itself lives in `SessionSurface`, shared with RPG and story. Chat opens
 * **full screen by default** — the conversation is the reason this route is mounted, not
 * a supporting section of it. That no longer means hunting for an exit: full screen
 * leaves the hub's rail in place (see the note on `SessionSurface`'s `full` branch), so
 * the rest of the site stays one tap away without needing the docked, viewport-fraction
 * frame as the escape hatch. Docking down is still available from the same
 * `SurfaceButton` in the header, for anyone who wants the rest of the page visible too.
 */
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { SessionSurface, SurfaceButton } from "@/components/session/session-surface";
import { Transcript } from "@/components/chat/transcript";
import { Composer } from "@/components/chat/composer";
import { CharacterDrawer } from "@/components/chat/character-drawer";
import { StockFill } from "@/components/media/stock-fill";
import { useStickToBottom, useArrivalNotifier } from "@/hooks/use-stick-to-bottom";
import { useSelection } from "@/hooks/use-selection";
import { shortName, type Chat } from "@/hooks/use-chat";

export function ChatStage({ chat }: { chat: Chat }) {
  const { lora } = useSelection();
  // Full screen by default — see `SessionSurface`'s note on why that no longer means
  // losing the hub rail. Docking down is one tap away via the same header toggle.
  const [full, setFull] = useState(true);
  const stick = useStickToBottom();

  const characterName = chat.character.name.trim() || "Chloe";

  /*
   * A new message glides the view down. Growth from a streaming line or a picture
   * resolving is handled by the ResizeObserver inside the hook, so nothing here has to
   * know about either.
   */
  useArrivalNotifier(chat.messages.length, stick.noteArrival);

  return (
    <SessionSurface
      full={full}
      onFullChange={setFull}
      stick={stick}
      header={
        <>
          <div className="h-9 w-9 shrink-0 overflow-hidden border border-border-2 bg-panel-2">
            <StockFill seedKey={chat.portraitSeed} alt="" sizes="36px" subject="portrait" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <span
              className="truncate font-sans text-[14.5px] font-semibold leading-tight text-ink"
              title={characterName}
            >
              {characterName}
            </span>
            <span className="truncate font-mono text-[10.5px] leading-[1.5] text-ink-muted-2">
              {lora ? lora.name : "no LoRA loaded"}
              {chat.isCustomized && <span className="text-accent"> · customized</span>}
            </span>
          </div>

          <span className="hidden shrink-0 font-mono text-[10.5px] tabular-nums text-ink-muted-2 sm:inline">
            {chat.messages.length} {chat.messages.length === 1 ? "message" : "messages"}
          </span>

          <SurfaceButton
            active={chat.drawerOpen}
            onClick={() => chat.setDrawerOpen(!chat.drawerOpen)}
            label="Character, persona and source"
            expanded={chat.drawerOpen}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">character</span>
          </SurfaceButton>
        </>
      }
      dock={
        <Composer
          role={chat.composerRole}
          onRoleChange={chat.setComposerRole}
          text={chat.composerText}
          onTextChange={chat.setComposerText}
          onSend={chat.sendMessage}
          characterName={shortName(characterName, 24)}
          portraitSeed={chat.portraitSeed}
        />
      }
      drawer={
        chat.drawerOpen ? (
          <CharacterDrawer chat={chat} onClose={() => chat.setDrawerOpen(false)} />
        ) : undefined
      }
    >
      <Transcript
        messages={chat.messages}
        characterName={characterName}
        description={chat.character.description}
        portraitSeed={chat.portraitSeed}
        loraName={lora?.name ?? null}
        isTyping={chat.isTyping}
        onStreamReveal={stick.follow}
        actions={{
          onEdit: chat.editMessage,
          onDelete: chat.deleteMessage,
          onRegenerate: chat.regenerateMessage,
        }}
      />
    </SessionSurface>
  );
}
