import { useCallback, useRef, useState } from "react";
import { useCredits } from "@/hooks/use-credits";
import { useSelection } from "@/hooks/use-selection";

/**
 * Turn-based RPG session state.
 *
 * NO REAL LLM. Narration comes from an authored pool below, assembled with the player's
 * own setup values so it reads as a real session rather than lorem — but it is never
 * presented as AI-generated. Wiring the backend means replacing narrate() with the
 * actual call; the turn/inventory/scene shape shouldn't need to change.
 *
 * SETUP IS PRE-ROLLED. The wizard used to open with three empty required fields and a
 * disabled button — a quiz standing between someone and the thing they came for. Every
 * field now arrives already answered by `rollConfig()`, so "drop in" is live on the first
 * frame and every control is a correction rather than an obligation.
 */

export const RPG_BEGIN_COST = 4;
export const RPG_TURN_COST = 1;
export const RPG_ILLUSTRATE_COST = 2;

export interface WorldTheme {
  id: string;
  name: string;
  /** What is wrong with the place. One line — it sits under the name on the tile. */
  note: string;
  /** What the place itself puts in your hands, before class or preference. */
  kit: string[];
}

export interface CharacterClass {
  id: string;
  name: string;
  /** How this one solves things. */
  note: string;
  /** Tools of the trade, added to the world's kit. */
  kit: string[];
  /** A beat this class notices that others don't. Appended to the opening narration. */
  flavor: string;
}

/**
 * How the player's input enters the story. Borrowed from the turn-based convention the
 * genre has settled on: the same text field means different things depending on the verb
 * you pick, rather than forcing "> " prefixes or four separate inputs.
 *
 * `story` writes narration directly and costs nothing — nothing is generated for it.
 */
export type RpgMode = "do" | "say" | "story" | "see";

export const RPG_MODES: { key: RpgMode; label: string; placeholder: string; cost: number }[] = [
  { key: "do", label: "Do", placeholder: "what do you do?", cost: RPG_TURN_COST },
  { key: "say", label: "Say", placeholder: "what do you say?", cost: RPG_TURN_COST },
  { key: "story", label: "Story", placeholder: "write the next beat yourself…", cost: 0 },
  { key: "see", label: "See", placeholder: "what do you look at?", cost: RPG_ILLUSTRATE_COST },
];

export interface RpgTurn {
  id: string;
  kind: "narration" | "action";
  text: string;
  /** Which verb produced an action turn. Absent on narration. */
  mode?: RpgMode;
  /** Present when this turn produced an illustration. */
  sceneSeed?: number;
  illustrating?: boolean;
}

export interface RpgConfig {
  /** WorldTheme id. */
  worldTheme: string;
  /** CharacterClass id. */
  characterClass: string;
  /** Free-form, order-preserving. Items may come from a kit or be typed by hand. */
  inventory: string[];
}

export const WORLD_THEMES: WorldTheme[] = [
  {
    id: "drowned-city",
    name: "Drowned city",
    note: "The water came up and nobody left. It is still coming up.",
    kit: ["waders", "salvage hook"],
  },
  {
    id: "frozen-station",
    name: "Frozen orbital station",
    note: "Power for one deck. You are not on that deck.",
    kit: ["thermal wrap", "hand torch"],
  },
  {
    id: "glass-cathedral",
    name: "Sunken cathedral of glass",
    note: "Every surface is beautiful and load-bearing.",
    kit: ["glass cutter", "coil of rope"],
  },
  {
    id: "ash-road",
    name: "Ash-choked trade road",
    note: "Everyone on it is going the same way and nobody says why.",
    kit: ["face rag", "water tin"],
  },
  {
    id: "living-archive",
    name: "Archive that rewrites itself",
    note: "Everything you read here was different yesterday.",
    kit: ["blank ledger", "wax pencil"],
  },
  {
    id: "storm-border",
    name: "Border town at the storm's edge",
    note: "The storm has been three days out for eleven years.",
    kit: ["oilskin", "storm glass"],
  },
  {
    id: "hollow-orchard",
    name: "Hollow orchard",
    note: "The trees are healthy. What lives in them is the problem.",
    kit: ["pruning knife", "lantern"],
  },
  {
    id: "standing-train",
    name: "Train that never arrives",
    note: "Nine carriages, no engine, and the window insists you are moving.",
    kit: ["punched ticket", "dining-car key"],
  },
];

export const CHARACTER_CLASSES: CharacterClass[] = [
  {
    id: "scavenger",
    name: "Scavenger",
    note: "You price a room before you enter it.",
    kit: ["crowbar", "folded tarp"],
    flavor: "You price it out of habit: two days' water, maybe three.",
  },
  {
    id: "archivist",
    name: "Archivist",
    note: "You read the room. Literally, and out loud.",
    kit: ["field notebook", "reading glass"],
    flavor: "You note the date-stamp before you note the danger. Occupational hazard.",
  },
  {
    id: "cartographer",
    name: "Cartographer",
    note: "A place unmapped is a place you die in twice.",
    kit: ["chalk", "folding rule"],
    flavor: "You mark it, because a place unmapped is a place you die in twice.",
  },
  {
    id: "fixer",
    name: "Fixer",
    note: "You already know who would pay to hear about this.",
    kit: ["favour owed", "clean shirt"],
    flavor: "You already know who would pay to hear about this.",
  },
  {
    id: "beast-handler",
    name: "Beast-handler",
    note: "Whatever is in there, you have fed one before.",
    kit: ["lure pouch", "muzzle strap"],
    flavor: "Whatever's stabled here left in a hurry. The straw is still warm.",
  },
  {
    id: "signal-reader",
    name: "Signal-reader",
    note: "You hear the carrier tone under everything.",
    kit: ["field radio", "spare cell"],
    flavor: "There's a carrier tone under everything, faint and repeating.",
  },
  {
    id: "medic",
    name: "Medic",
    note: "You count the exits by how fast you could carry someone through them.",
    kit: ["bandage roll", "tincture"],
    flavor: "You count the exits by how fast you could carry someone through them.",
  },
  {
    id: "smuggler",
    name: "Smuggler",
    note: "Doors are a suggestion. So are manifests.",
    kit: ["false-bottom bag", "lockpicks"],
    flavor: "You find the way that isn't a door before you try the one that is.",
  },
];

/**
 * Things anyone might carry anywhere, offered as chips alongside the world's and class's
 * own kit. Not defaults — one tap each, so the common case of "and a knife" costs no
 * typing, and anything not here can still be typed.
 */
export const COMMON_ITEMS = [
  "rope",
  "lamp",
  "half a map",
  "knife",
  "flint",
  "canteen",
  "dried rations",
  "mirror shard",
  "wire spool",
  "dog whistle",
  "letter you didn't open",
  "somebody else's coat",
];

export const findWorld = (id: string): WorldTheme | undefined =>
  WORLD_THEMES.find((w) => w.id === id);

export const findClass = (id: string): CharacterClass | undefined =>
  CHARACTER_CLASSES.find((c) => c.id === id);

const OPENINGS = [
  "The way in is a maintenance hatch nobody has oiled in years. It gives on the third pull, and the sound of it carries further than you would like.",
  "You come up on it at dusk, when the light is doing you no favours. Whatever is down there has already heard you arrive.",
  "There is a moment, standing at the threshold, where turning back is still free. It passes.",
];

const BEATS = [
  "The floor gives half an inch under your weight and holds. Somewhere ahead, water is moving that shouldn't be.",
  "You find the marks first — three notches at knee height, fresh, cut by someone in a hurry. They point the way you were already going.",
  "It stops when you stop. That is the part you don't like.",
  "The passage opens into a room that was clearly built for something taller than you, and recently used by something shorter.",
  "A cable runs the length of the ceiling, still humming. Follow it and you'll find whatever it feeds.",
  "Your light catches the edge of a drop you were two steps from walking into.",
  "There's a door, and it's already open, and that is worse than finding it locked.",
  "The air changes — colder, and carrying a smell like hot metal. Something down here is still running.",
];

let turnCounter = 0;
const nextTurnId = () => `turn-${++turnCounter}`;
const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));

function pick<T>(pool: T[], excluding?: T): T {
  const options = excluding ? pool.filter((p) => p !== excluding) : pool;
  return options[rand(0, options.length)];
}

const dedupe = (items: string[]) => Array.from(new Set(items));

/**
 * Swap one source's contribution to the pack without disturbing anything else in it.
 *
 * Changing world or class has to change what you're carrying — a Scavenger's crowbar
 * should not survive becoming an Archivist — but it must not silently discard the two
 * items you typed yourself. So only the outgoing kit's own items are dropped, and only
 * where the *other* source isn't also vouching for them.
 */
function swapKit(items: string[], from: string[], to: string[], protectedKit: string[]): string[] {
  const dropped = from.filter((i) => !to.includes(i) && !protectedKit.includes(i));
  const kept = items.filter((i) => !dropped.includes(i));
  return dedupe([...kept, ...to]);
}

/** A complete, playable setup. This is what the surface opens with — never a blank form. */
export function rollConfig(): RpgConfig {
  const world = pick(WORLD_THEMES);
  const characterClass = pick(CHARACTER_CLASSES);
  return {
    worldTheme: world.id,
    characterClass: characterClass.id,
    inventory: dedupe([...world.kit, ...characterClass.kit]),
  };
}

export function useRpg() {
  const credits = useCredits();
  const { lora } = useSelection();

  const [config, setConfig] = useState<RpgConfig>(rollConfig);
  const [started, setStarted] = useState(false);
  const [turns, setTurns] = useState<RpgTurn[]>([]);
  const [carried, setCarried] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  /**
   * What the blocked action actually needed. Carries the amount and label rather than a
   * bare boolean — the three actions cost different amounts, and a modal that quotes the
   * wrong price is worse than no modal.
   */
  const [blocked, setBlocked] = useState<{ cost: number; action: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<RpgMode>("do");
  /**
   * Steering the narrator carries between turns rather than being restated each time.
   * Stored in this tab only — see the disclosure in the drawer; nothing is sent anywhere.
   */
  const [directorNote, setDirectorNote] = useState("");
  const timers = useRef<number[]>([]);

  const setWorld = useCallback((id: string) => {
    setConfig((prev) => {
      if (prev.worldTheme === id) return prev;
      const from = findWorld(prev.worldTheme)?.kit ?? [];
      const to = findWorld(id)?.kit ?? [];
      const classKit = findClass(prev.characterClass)?.kit ?? [];
      return {
        ...prev,
        worldTheme: id,
        inventory: swapKit(prev.inventory, from, to, classKit),
      };
    });
  }, []);

  const setCharacterClass = useCallback((id: string) => {
    setConfig((prev) => {
      if (prev.characterClass === id) return prev;
      const from = findClass(prev.characterClass)?.kit ?? [];
      const to = findClass(id)?.kit ?? [];
      const worldKit = findWorld(prev.worldTheme)?.kit ?? [];
      return {
        ...prev,
        characterClass: id,
        inventory: swapKit(prev.inventory, from, to, worldKit),
      };
    });
  }, []);

  const toggleItem = useCallback((item: string) => {
    setConfig((prev) => ({
      ...prev,
      inventory: prev.inventory.includes(item)
        ? prev.inventory.filter((i) => i !== item)
        : [...prev.inventory, item],
    }));
  }, []);

  /** Accepts a comma-separated run, so pasting a list works as well as typing one thing. */
  const addItems = useCallback((raw: string) => {
    const additions = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (additions.length === 0) return;
    setConfig((prev) => ({ ...prev, inventory: dedupe([...prev.inventory, ...additions]) }));
  }, []);

  const reroll = useCallback(() => setConfig(rollConfig()), []);

  const begin = useCallback(() => {
    const world = findWorld(config.worldTheme);
    const characterClass = findClass(config.characterClass);
    if (!world || !characterClass) return;

    if (!credits.spend(RPG_BEGIN_COST, `Started an RPG — ${world.name}`, {
      tool: "rpg",
      media: "image",
    })) {
      setBlocked({ cost: RPG_BEGIN_COST, action: "Starting an adventure" });
      return;
    }
    setCarried(config.inventory);
    setTurns([
      {
        id: nextTurnId(),
        kind: "narration",
        text: `${world.name}. ${world.note} ${pick(OPENINGS)} ${characterClass.flavor}`,
        sceneSeed: rand(0, 999_999_999),
      },
    ]);
    setStarted(true);
  }, [credits, config]);

  /** Appends the world's answer after a beat of thinking. Shared by act and continue. */
  const narrate = useCallback(() => {
    setPending(true);
    const t = window.setTimeout(() => {
      setTurns((prev) => {
        const lastNarration = [...prev].reverse().find((turn) => turn.kind === "narration");
        return [
          ...prev,
          {
            id: nextTurnId(),
            kind: "narration",
            text: pick(BEATS, lastNarration?.text),
          },
        ];
      });
      setPending(false);
    }, rand(700, 1500));
    timers.current.push(t);
  }, []);

  const act = useCallback(() => {
    const text = draft.trim();
    if (!text || pending) return;

    // Player-authored narration. Nothing is generated for it, so nothing is charged.
    if (mode === "story") {
      setTurns((prev) => [...prev, { id: nextTurnId(), kind: "narration", text }]);
      setDraft("");
      return;
    }

    // "See" spends on an illustration rather than on a turn of narration.
    if (mode === "see") {
      if (!credits.spend(RPG_ILLUSTRATE_COST, "Illustrated an RPG scene", {
        tool: "rpg",
        media: "image",
      })) {
        setBlocked({ cost: RPG_ILLUSTRATE_COST, action: "Illustrating a scene" });
        return;
      }
      const id = nextTurnId();
      setTurns((prev) => [
        ...prev,
        {
          id,
          kind: "action",
          mode: "see",
          text,
          sceneSeed: rand(0, 999_999_999),
          illustrating: true,
        },
      ]);
      setDraft("");
      const t = window.setTimeout(() => {
        setTurns((prev) =>
          prev.map((turn) => (turn.id === id ? { ...turn, illustrating: false } : turn))
        );
      }, rand(1200, 2400));
      timers.current.push(t);
      return;
    }

    if (!credits.spend(RPG_TURN_COST, "RPG turn", { tool: "rpg" })) {
      setBlocked({ cost: RPG_TURN_COST, action: "Taking a turn" });
      return;
    }

    setTurns((prev) => [...prev, { id: nextTurnId(), kind: "action", mode, text }]);
    setDraft("");
    narrate();
  }, [draft, pending, mode, credits, narrate]);

  /** Advance the story without saying what you did. */
  const continueStory = useCallback(() => {
    if (pending) return;
    if (!credits.spend(RPG_TURN_COST, "RPG turn — continued", { tool: "rpg" })) {
      setBlocked({ cost: RPG_TURN_COST, action: "Continuing the story" });
      return;
    }
    narrate();
  }, [pending, credits, narrate]);

  /**
   * Reroll the last narration. Drops it first so the replacement can't be compared
   * against itself, then charges as a fresh turn — a retry is a generation either way.
   */
  const retry = useCallback(() => {
    if (pending) return;
    const last = turns[turns.length - 1];
    if (!last || last.kind !== "narration") return;
    if (!credits.spend(RPG_TURN_COST, "RPG turn — retried", { tool: "rpg" })) {
      setBlocked({ cost: RPG_TURN_COST, action: "Retrying the last beat" });
      return;
    }
    setTurns((prev) => prev.slice(0, -1));
    narrate();
  }, [pending, turns, credits, narrate]);

  /** Remove the last entry. Free — you're deleting, not generating. Never empties the log. */
  const erase = useCallback(() => {
    if (pending) return;
    setTurns((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, [pending]);

  /** Illustrates a narration turn with the loaded LoRA. */
  const illustrate = useCallback(
    (turnId: string) => {
      if (!credits.spend(RPG_ILLUSTRATE_COST, "Illustrated an RPG scene", {
        tool: "rpg",
        media: "image",
      })) {
        setBlocked({ cost: RPG_ILLUSTRATE_COST, action: "Illustrating a scene" });
        return;
      }
      const seed = rand(0, 999_999_999);
      setTurns((prev) =>
        prev.map((t) => (t.id === turnId ? { ...t, sceneSeed: seed, illustrating: true } : t))
      );
      const t = window.setTimeout(() => {
        setTurns((prev) =>
          prev.map((turn) => (turn.id === turnId ? { ...turn, illustrating: false } : turn))
        );
      }, rand(1200, 2400));
      timers.current.push(t);
    },
    [credits]
  );

  const dropItem = useCallback((item: string) => {
    setCarried((prev) => prev.filter((i) => i !== item));
  }, []);

  const abandon = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setStarted(false);
    setTurns([]);
    setCarried([]);
    setPending(false);
    setDraft("");
    setMode("do");
    setDirectorNote("");
    // A new adventure gets a new pre-rolled setup rather than the one just abandoned.
    setConfig(rollConfig());
  }, []);

  const turnCount = turns.filter((t) => t.kind === "action").length;

  return {
    config,
    world: findWorld(config.worldTheme) ?? WORLD_THEMES[0],
    characterClass: findClass(config.characterClass) ?? CHARACTER_CLASSES[0],
    setWorld,
    setCharacterClass,
    toggleItem,
    addItems,
    reroll,
    started,
    begin,
    turns,
    carried,
    dropItem,
    draft,
    setDraft,
    mode,
    setMode,
    act,
    continueStory,
    retry,
    erase,
    canRetry: turns.length > 0 && turns[turns.length - 1].kind === "narration",
    canErase: turns.length > 1,
    directorNote,
    setDirectorNote,
    illustrate,
    pending,
    turnCount,
    abandon,
    blocked,
    dismissBlocked: () => setBlocked(null),
    loraHue: lora?.hue ?? 268,
    loraName: lora?.name ?? null,
  };
}
