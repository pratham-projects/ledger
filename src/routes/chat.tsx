/**
 * THESIS: a conversation is not a section of a page — it is the page, but it does not have
 * to own the viewport to be one. /chat is mounted in `HubShell` (`App.tsx`) same as
 * `/image` and `/video`, and the character owns the conversation: they have a face (the
 * loaded LoRA), they speak in full-strength ink, and they send pictures the way a person
 * would.
 * OWN-WORLD: Desk's tokens throughout — glass composer, pill controls, ruled subdivisions
 * for the transcript and drawer. No bubbles, no tinted chat colours.
 * STORY: you land looking at who you're about to talk to, with the hub's rail still
 * beside you, and you write in one of four voices without scrolling to keep up.
 * FORM: a docked stage (header · transcript · docked composer · drawer) inside the shell,
 * with a focus toggle that takes the viewport when asked for it.
 */
import { ChatStage } from "@/components/chat/chat-stage";
import { ChatTemplatesPanel, useMyCharacters } from "@/components/chat/templates-panel";
import { ToolWorkspace } from "@/components/tool-workspace/workspace";
import { WorkspaceTabs } from "@/components/tool-workspace/workspace-tabs";
import { MyGenerationsPanel } from "@/components/tool-workspace/my-generations-panel";
import { useChat } from "@/hooks/use-chat";

/**
 * Same three-panel shell as `/image` and `/video`: `ToolWorkspace` for the resizable,
 * independently-scrolling columns; the middle slot is `ChatStage` itself (which already
 * manages its own docked/full-screen height — see the note there), and the right panel
 * gets the same Templates / My Generations tabs. Chat has no media to preview, so its
 * "Templates" are character presets (`ChatTemplatesPanel`) rather than `MediaTemplateGrid`.
 */
export function Chat() {
  const chat = useChat();
  const myCharacters = useMyCharacters(chat);

  return (
    <ToolWorkspace
      storageKey="chat"
      middle={<ChatStage chat={chat} />}
      right={
        <WorkspaceTabs
          templates={<ChatTemplatesPanel chat={chat} />}
          myGenerations={
            <MyGenerationsPanel
              resultCount={chat.messages.length}
              characterItems={myCharacters.items}
              onSelectCharacter={myCharacters.onSelect}
            />
          }
        />
      }
    />
  );
}
