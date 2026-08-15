import { useMemo } from "react";
import { PresetGrid } from "@/components/tool-workspace/preset-grid";
import { stockRun } from "@/lib/stock";
import type { Chat } from "@/hooks/use-chat";

/**
 * A character is three free-text fields (`hooks/use-chat.ts`'s `Character`), not a piece
 * of media — so unlike image/video, chat's "Templates" tab writes straight into those
 * fields via `updateCharacterField`, three calls per preset, rather than going through
 * `useSelection`'s `referenceMedia`.
 */
const CHARACTER_PRESETS = [
  {
    id: "archivist",
    name: "The Archivist",
    note: "Answers only in questions. Keeps records of a city that no longer exists.",
    description:
      "A former city archivist who answers almost everything with another question. Dry, patient, occasionally cutting. Believes most problems are just facts arranged wrong.",
    scenarioLore:
      "The archive burned down eleven years ago; she kept working anyway, cataloguing things from memory.",
  },
  {
    id: "shopkeeper",
    name: "The Last Shopkeeper",
    note: "Runs the only open shop on the last night of a long war.",
    description:
      "Tired, warm underneath it, has seen everyone in town at their worst. Talks in short sentences. Doesn't ask what you're running from.",
    scenarioLore: "The shop is the last one open in a town that emptied out over the winter.",
  },
  {
    id: "rival",
    name: "The Polite Rival",
    note: "Unfailingly courteous about wanting the same thing you do.",
    description:
      "Charming, competitive, never raises their voice. Treats every conversation as a small negotiation they intend to win pleasantly.",
    scenarioLore: "You've been on opposite sides of the same three deals for two years running.",
  },
  {
    id: "mechanic",
    name: "The Rooftop Mechanic",
    note: "Fixes things that shouldn't work anymore, for people who ask nicely.",
    description:
      "Blunt, funny, allergic to sentiment. Talks about machines the way other people talk about pets. Softer than she lets on.",
    scenarioLore: "Works out of a rooftop shop that technically isn't zoned for it.",
  },
];

/**
 * "My Generations", logged in: a grid of the visitor's own characters rather than a
 * single session-count line — same reasoning as `MediaTemplateGrid` reusing template
 * media to stand in for "what you've made" on image/video. A distinct stock seed keeps
 * these portraits from repeating the Templates tab's faces.
 */
export function useMyCharacters(chat: Chat) {
  const previews = useMemo(
    () => stockRun("my-chat-characters", CHARACTER_PRESETS.length, "portrait"),
    []
  );
  const items = useMemo(
    () =>
      CHARACTER_PRESETS.map((p, i) => ({
        id: p.id,
        name: p.name.replace(/^The /, ""),
        note: p.note,
        image: previews[i].src(96),
      })),
    [previews]
  );
  const onSelect = (id: string) => {
    const preset = CHARACTER_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    chat.updateCharacterField("name", preset.name.replace(/^The /, ""));
    chat.updateCharacterField("description", preset.description);
    chat.updateCharacterField("scenarioLore", preset.scenarioLore);
  };
  return { items, onSelect };
}

export function ChatTemplatesPanel({ chat }: { chat: Chat }) {
  const previews = useMemo(
    () => stockRun("chat-characters", CHARACTER_PRESETS.length, "portrait"),
    []
  );
  const items = useMemo(
    () =>
      CHARACTER_PRESETS.map((p, i) => ({ ...p, image: previews[i].src(96) })),
    [previews]
  );

  return (
    <>
      <p className="mb-3 text-[16px] font-semibold leading-[1.3] text-ink">Characters</p>
      <PresetGrid
        items={items}
        layout="scroll"
        onSelect={(id) => {
          const preset = CHARACTER_PRESETS.find((p) => p.id === id);
          if (!preset) return;
          chat.updateCharacterField("name", preset.name.replace(/^The /, ""));
          chat.updateCharacterField("description", preset.description);
          chat.updateCharacterField("scenarioLore", preset.scenarioLore);
        }}
      />
    </>
  );
}
