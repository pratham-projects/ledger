import { useCallback, useMemo, useRef, useState } from "react";
import { useSelection } from "@/hooks/use-selection";

export type MessageRole = "chloe" | "anon" | "narrator" | "image";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  /**
   * Set when this message carries a picture. On an `image` message it *is* the message;
   * on a `chloe` message it means she sent one alongside her line.
   */
  seed?: number;
}

export interface Character {
  name: string;
  description: string;
  anonDescription: string;
  scenarioLore: string;
}

const DEFAULT_CHARACTER: Character = {
  name: "Chloe",
  description: "",
  anonDescription: "",
  scenarioLore: "",
};

/**
 * A name is free text a user typed, so every surface that prints one has to survive
 * `sdfasdfadsfasdfadsfasdfasdfkjhasdlkfjhaslkdjfhalkdjshflkajdshhf`. Layout defends
 * itself with `truncate` + `min-w-0`; this defends the places where a truncating box
 * isn't available — a tab label, an aria-label, a document title. Full name always goes
 * to `title=` so nothing is actually lost.
 */
export const NAME_MAX_LENGTH = 40;

export function shortName(name: string, max = 16): string {
  const trimmed = name.trim();
  if (!trimmed) return "chloe";
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

const CANNED_REPLIES = [
  "Tell me more about that.",
  "Hah, I wasn't expecting that.",
  "*tilts head* Go on…",
  "That's one way to put it.",
  "I don't know if I believe you, but I like it.",
  "Okay, okay — what happens next?",
  "You always know what to say.",
  "Hmm. Let's sit with that for a second.",
];

/** Lines she sends a picture with. Kept separate so the picture never arrives mute. */
const CANNED_IMAGE_REPLIES = [
  "Here — look at this one.",
  "This is what I meant.",
  "Took this earlier. Thoughts?",
  "Okay but *this*.",
  "I keep coming back to this one.",
];

/** How often a reply arrives as a picture rather than a line. */
const IMAGE_REPLY_CHANCE = 0.3;

const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));
const newSeed = () => rand(0, 999_999_999);

let idCounter = 0;
const nextId = () => `msg-${++idCounter}`;

function pickFrom(pool: string[], excluding?: string): string {
  const candidates = pool.filter((r) => r !== excluding);
  return candidates[rand(0, candidates.length)];
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function isCharacterShape(value: unknown): value is Partial<Character> {
  return typeof value === "object" && value !== null && typeof (value as Record<string, unknown>).name === "string";
}

const OPENING_MESSAGE: ChatMessage = { id: nextId(), role: "chloe", text: "Hi! 😊" };

export function useChat() {
  const { lora } = useSelection();

  const [character, setCharacter] = useState<Character>(DEFAULT_CHARACTER);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([OPENING_MESSAGE]);
  const [composerRole, setComposerRole] = useState<MessageRole>("anon");
  const [composerText, setComposerText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<number | null>(null);

  /**
   * The character's face. The loaded LoRA *is* the character's appearance in this
   * product's spine, so the portrait follows the LoRA and only falls back to the name
   * when nothing is loaded — which keeps a face on screen either way, and makes swapping
   * the LoRA visibly change who you're talking to.
   */
  const portraitSeed = useMemo(
    () => lora?.id ?? `character:${character.name.toLowerCase() || "chloe"}`,
    [lora, character.name]
  );

  const updateCharacterField = useCallback((field: keyof Character, value: string) => {
    setCharacter((prev) => ({
      ...prev,
      [field]: field === "name" ? value.slice(0, NAME_MAX_LENGTH) : value,
    }));
  }, []);

  const sendMessage = useCallback(() => {
    const text = composerText.trim();
    if (!text) return;

    const role = composerRole;
    const message: ChatMessage = {
      id: nextId(),
      role,
      text,
      seed: role === "image" ? newSeed() : undefined,
    };
    setMessages((prev) => [...prev, message]);
    setComposerText("");

    if (role !== "anon") return;

    setIsTyping(true);
    typingTimeout.current = window.setTimeout(() => {
      const sendsPicture = Math.random() < IMAGE_REPLY_CHANCE;
      setMessages((prev) => {
        const lastLine = [...prev].reverse().find((m) => m.role === "chloe")?.text;
        return [
          ...prev,
          {
            id: nextId(),
            role: "chloe",
            text: pickFrom(sendsPicture ? CANNED_IMAGE_REPLIES : CANNED_REPLIES, lastLine),
            seed: sendsPicture ? newSeed() : undefined,
          },
        ];
      });
      setIsTyping(false);
    }, rand(700, 1600));
  }, [composerText, composerRole]);

  const editMessage = useCallback((id: string, text: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)));
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const regenerateMessage = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (m.role === "image") return { ...m, seed: newSeed() };
        if (m.role !== "chloe") return m;
        // A line and a picture were produced together, so they reroll together.
        return m.seed === undefined
          ? { ...m, text: pickFrom(CANNED_REPLIES, m.text) }
          : { ...m, text: pickFrom(CANNED_IMAGE_REPLIES, m.text), seed: newSeed() };
      })
    );
  }, []);

  const clearConversation = useCallback(() => {
    if (typingTimeout.current !== null) window.clearTimeout(typingTimeout.current);
    setIsTyping(false);
    setMessages([{ ...OPENING_MESSAGE, id: nextId() }]);
  }, []);

  const exportCharacter = useCallback(() => {
    downloadJson(`${character.name.toLowerCase().replace(/\s+/g, "-") || "character"}.json`, character);
  }, [character]);

  const importCharacter = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!isCharacterShape(parsed)) {
          throw new Error("missing name field");
        }
        setCharacter({
          name: (parsed.name ?? DEFAULT_CHARACTER.name).slice(0, NAME_MAX_LENGTH),
          description: parsed.description ?? "",
          anonDescription: parsed.anonDescription ?? "",
          scenarioLore: parsed.scenarioLore ?? "",
        });
        setImportError(null);
        setDrawerOpen(true);
      } catch {
        setImportError("That doesn't look like a valid character file — expected a JSON object with at least a \"name\" field.");
      }
    };
    reader.readAsText(file);
  }, []);

  const isCustomized = Boolean(
    character.description || character.anonDescription || character.scenarioLore
  );

  return {
    character,
    isCustomized,
    portraitSeed,
    updateCharacterField,
    drawerOpen,
    setDrawerOpen,
    importError,
    messages,
    composerRole,
    setComposerRole,
    composerText,
    setComposerText,
    isTyping,
    sendMessage,
    editMessage,
    deleteMessage,
    regenerateMessage,
    clearConversation,
    exportCharacter,
    importCharacter,
  };
}

export type Chat = ReturnType<typeof useChat>;
