import { useCallback, useRef, useState } from "react";
import { useCredits } from "@/hooks/use-credits";
import { useSelection } from "@/hooks/use-selection";

/**
 * Linear story session state.
 *
 * NO REAL LLM. Prose comes from the authored pools below, stitched with the writer's own
 * genre and protagonist names so the surface can be designed against realistic paragraph
 * lengths. It is never presented as AI-generated. Replace continueStory()'s body with
 * the real call when the backend lands; the chapter/illustration shape can stay.
 *
 * SETUP IS PRE-ROLLED, same argument as RPG: `rollConfig()` produces a genre, a cast and
 * a premise that already agree with each other, so chapter one is one click from arrival.
 * The premises are keyed to the genre — rolling "folk horror" and getting a spaceship
 * would make the randomiser feel like a slot machine instead of a collaborator.
 */

export const STORY_BEGIN_COST = 4;
export const STORY_CHAPTER_COST = 2;
export const STORY_ILLUSTRATE_COST = 2;

export interface Genre {
  id: string;
  name: string;
  /** What the genre does to the register. One line, shown under the name on the tile. */
  note: string;
  /** Opening situations that belong to this genre. Fed to the premise roller. */
  premises: string[];
}

export interface StoryConfig {
  /** Genre id. */
  genre: string;
  plot: string;
  /** Order matters — the first name carries the opening. */
  protagonists: string[];
}

export interface Chapter {
  id: string;
  index: number;
  title: string;
  paragraphs: string[];
  illustrationSeed?: number;
  illustrating?: boolean;
}

export const GENRES: Genre[] = [
  {
    id: "quiet-sf",
    name: "Quiet science fiction",
    note: "The future is already installed and nobody mentions it.",
    premises: [
      "The house has been running the household accounts for six years, and this morning it declined to explain one of them.",
      "Everyone on the station received the same letter, dated four days from now, signed by someone who has not been born.",
      "The colony's translation layer has started smoothing over one particular word, and only she has noticed which.",
    ],
  },
  {
    id: "folk-horror",
    name: "Folk horror",
    note: "The village is welcoming, which is the problem.",
    premises: [
      "The parish has kept the same hedge for four hundred years, and this spring someone has cut a gate into it.",
      "She is welcomed by name at the boundary stone by people she has never met, and none of them will say who told them.",
      "The rite is harmless, everyone insists — it has to be done twice this year, and nobody will say why.",
    ],
  },
  {
    id: "rain-detective",
    name: "Detective, rain-soaked",
    note: "Everybody is lying, including the client.",
    premises: [
      "The client pays in advance, in cash, for the recovery of an object she refuses to describe.",
      "A man confesses to a murder that hasn't happened yet, in detail, and then asks for a lift home.",
      "The insurance file lists eleven witnesses. Nine of them share an address.",
    ],
  },
  {
    id: "portal-fantasy",
    name: "Portal fantasy",
    note: "The door works. Getting back is the plot.",
    premises: [
      "The lift in her building has a button for a floor that the building does not have, and today it is lit.",
      "The map in the second-hand atlas updates itself, and it has begun marking where she is.",
      "He follows the dog through a gap in the fence and comes out somewhere the dog clearly knows well.",
    ],
  },
  {
    id: "one-impossible-thing",
    name: "Domestic, one impossible thing",
    note: "Ordinary life, plus a single rule change.",
    premises: [
      "Since the funeral, the kettle has been boiling itself at ten past four, which was exactly her habit.",
      "Everyone in the family can hear the phone ringing except the person it is for.",
      "The photographs in the hall are aging. The people in them are not.",
    ],
  },
  {
    id: "sea-story",
    name: "Sea story",
    note: "The weather is a character and it dislikes you.",
    premises: [
      "The boat comes back on schedule, crewed, provisioned, and with nobody aboard who left on it.",
      "A letter arrives eleven years after it was posted, and the return address is a berth that never existed.",
      "The harbour master's log records a vessel entering every autumn for a century. It has never been seen leaving.",
    ],
  },
  {
    id: "heist",
    name: "Heist, small stakes",
    note: "A modest crime, executed by people who care too much.",
    premises: [
      "The object is worth almost nothing and four people have already died over it, which is what makes her curious.",
      "The museum's night guard is willing to help, on one condition she cannot possibly meet.",
      "They have six days, a floor plan from 1974, and the wrong key.",
    ],
  },
  {
    id: "found-document",
    name: "Found document",
    note: "Told through what survived, in the order it surfaced.",
    premises: [
      "The ledger runs to two hundred pages and the handwriting changes on page eighty-one.",
      "The transcript is complete except for the nine minutes everything happened in.",
      "Someone has annotated the report in pencil, correcting details only a participant could know.",
    ],
  },
];

/**
 * Names for the cast roller. Deliberately mixed in origin and shape so a rolled pair does
 * not read as one family — and split so the lead and the second name can differ in
 * register, which is most of what makes an invented cast feel authored.
 */
const NAME_POOL = [
  "Ada Feltrin",
  "Marcus Vane",
  "Iyanu Oyelaran",
  "Perpetua Small",
  "Sasha Kohl",
  "Noor Haddad",
  "Wren Okonkwo",
  "Halvard Ness",
  "Junie Marsh",
  "Teodor Lisk",
  "Constance Aye",
  "Roz Ferreira",
  "Emil Barrow",
  "Saoirse Pike",
  "Kit Anand",
  "Delphine Ruz",
];

export const findGenre = (id: string): Genre | undefined => GENRES.find((g) => g.id === id);

export interface CastPreset {
  id: string;
  name: string;
  /** How the pair plays against each other — shown under the name on the tile. */
  note: string;
  names: [string, string];
}

/** Named pairs for the Templates tab's "Characters" shortcut — a faster path to a cast
 *  than typing two names, the way a template loads a prompt on the media tools. */
export const CAST_PRESETS: CastPreset[] = [
  { id: "the-feltrin-vane", name: "Feltrin & Vane", note: "The believer and the skeptic.", names: ["Ada Feltrin", "Marcus Vane"] },
  { id: "the-oyelaran-small", name: "Oyelaran & Small", note: "The one who left, the one who stayed.", names: ["Iyanu Oyelaran", "Perpetua Small"] },
  { id: "the-kohl-haddad", name: "Kohl & Haddad", note: "Old partners, new argument.", names: ["Sasha Kohl", "Noor Haddad"] },
  { id: "the-okonkwo-ness", name: "Okonkwo & Ness", note: "Neither of them asked to be here.", names: ["Wren Okonkwo", "Halvard Ness"] },
  { id: "the-marsh-lisk", name: "Marsh & Lisk", note: "One of them is lying, charmingly.", names: ["Junie Marsh", "Teodor Lisk"] },
  { id: "the-aye-ferreira", name: "Aye & Ferreira", note: "Family, more or less.", names: ["Constance Aye", "Roz Ferreira"] },
];

const CHAPTER_TITLES = [
  "What the tide left",
  "A door that opens inward",
  "Small hours",
  "The second letter",
  "Everything that was promised",
  "Below the waterline",
  "What she meant by it",
  "The long way round",
  "Nothing to declare",
];

const PARAGRAPHS = [
  "The house had been empty long enough that the air inside had its own weather — colder by the stairs, warmer where the sun had been working on the carpet all afternoon.",
  "Nobody said anything for a while. That was the trouble with being right; it left you with nowhere pleasant to stand.",
  "Outside, the rain had settled into the kind of steadiness that suggests it has no intention of stopping and never did.",
  "It was a small thing to notice and an enormous thing to have noticed, and the difference between those two would take most of the year to work out.",
  "There is a particular silence that follows a decision, and it filled the room the way water fills a boot: completely, and from the bottom up.",
  "The letter had been folded and unfolded so many times that the creases had gone soft, and the words at the folds had begun to disappear.",
  "Morning came in grey and businesslike, and the whole thing looked considerably more survivable than it had at three.",
  "They walked without talking, which was not the same as walking in silence, because the road had plenty to say.",
];

let chapterCounter = 0;
const nextChapterId = () => `ch-${++chapterCounter}`;
const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));

function pick<T>(pool: T[], excluding?: T): T {
  const options = excluding ? pool.filter((p) => p !== excluding) : pool;
  return options[rand(0, options.length)];
}

function pickMany<T>(pool: T[], count: number): T[] {
  const copy = [...pool];
  const out: T[] = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    out.push(copy.splice(rand(0, copy.length), 1)[0]);
  }
  return out;
}

/** A cast of two — enough for the authored prose to play one name against the other. */
export function rollCast(): string[] {
  return pickMany(NAME_POOL, 2);
}

/** A complete, writable setup. This is what the surface opens with — never a blank form. */
export function rollConfig(): StoryConfig {
  const genre = pick(GENRES);
  return {
    genre: genre.id,
    plot: pick(genre.premises),
    protagonists: rollCast(),
  };
}

export function useStory() {
  const credits = useCredits();
  const { lora } = useSelection();

  const [config, setConfig] = useState<StoryConfig>(rollConfig);
  const [started, setStarted] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [writing, setWriting] = useState(false);
  /** The blocked action's real cost and label — the three actions differ in price. */
  const [blocked, setBlocked] = useState<{ cost: number; action: string } | null>(null);
  const timers = useRef<number[]>([]);

  /**
   * Changing genre re-rolls the premise, but only while the premise is still one this app
   * suggested. A sentence someone typed themselves is theirs, and silently overwriting it
   * because they were curious about another genre would be the worst bug on the surface.
   */
  const setGenre = useCallback((id: string) => {
    setConfig((prev) => {
      if (prev.genre === id) return prev;
      const next = findGenre(id);
      if (!next) return prev;
      const previous = findGenre(prev.genre);
      const wasSuggested = previous?.premises.includes(prev.plot) ?? false;
      return {
        ...prev,
        genre: id,
        plot: wasSuggested || !prev.plot.trim() ? pick(next.premises) : prev.plot,
      };
    });
  }, []);

  const setPlot = useCallback((plot: string) => {
    setConfig((prev) => ({ ...prev, plot }));
  }, []);

  /** Another premise from the current genre, never the one already showing. */
  const rollPlot = useCallback(() => {
    setConfig((prev) => {
      const genre = findGenre(prev.genre);
      if (!genre) return prev;
      return { ...prev, plot: pick(genre.premises, prev.plot) };
    });
  }, []);

  const rollNames = useCallback(() => {
    setConfig((prev) => ({ ...prev, protagonists: rollCast() }));
  }, []);

  /** Replaces the cast outright — used by the Templates tab's named-pair presets. */
  const setCast = useCallback((names: string[]) => {
    setConfig((prev) => ({ ...prev, protagonists: names }));
  }, []);

  const addProtagonist = useCallback((raw: string) => {
    const additions = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (additions.length === 0) return;
    setConfig((prev) => ({
      ...prev,
      protagonists: Array.from(new Set([...prev.protagonists, ...additions])),
    }));
  }, []);

  const removeProtagonist = useCallback((name: string) => {
    setConfig((prev) => ({
      ...prev,
      protagonists: prev.protagonists.filter((n) => n !== name),
    }));
  }, []);

  const reroll = useCallback(() => setConfig(rollConfig()), []);

  const composeChapter = useCallback(
    (index: number, opening: boolean): Chapter => {
      const names = config.protagonists.filter(Boolean);
      const lead = names[0] ?? "She";
      const paragraphs = pickMany(PARAGRAPHS, opening ? 3 : 2);
      if (opening) {
        paragraphs.unshift(
          `${lead} had read the whole thing twice before deciding it was true. ${config.plot}`
        );
      } else if (names[1]) {
        paragraphs.push(`${names[1]} would have known what to do. That was rather the problem.`);
      }
      return {
        id: nextChapterId(),
        index,
        title: CHAPTER_TITLES[index % CHAPTER_TITLES.length],
        paragraphs,
      };
    },
    [config]
  );

  const begin = useCallback(() => {
    const genre = findGenre(config.genre);
    if (!genre) return;
    if (!credits.spend(STORY_BEGIN_COST, `Started a story — ${genre.name}`, {
      tool: "story",
      media: "image",
    })) {
      setBlocked({ cost: STORY_BEGIN_COST, action: "Starting a story" });
      return;
    }
    setChapters([{ ...composeChapter(0, true), illustrationSeed: rand(0, 999_999_999) }]);
    setStarted(true);
  }, [credits, config.genre, composeChapter]);

  const continueStory = useCallback(() => {
    if (writing) return;
    if (!credits.spend(STORY_CHAPTER_COST, "Wrote a chapter", { tool: "story" })) {
      setBlocked({ cost: STORY_CHAPTER_COST, action: "Writing a chapter" });
      return;
    }
    setWriting(true);
    const t = window.setTimeout(() => {
      setChapters((prev) => [...prev, composeChapter(prev.length, false)]);
      setWriting(false);
    }, rand(900, 1800));
    timers.current.push(t);
  }, [writing, credits, composeChapter]);

  const illustrate = useCallback(
    (chapterId: string) => {
      if (!credits.spend(STORY_ILLUSTRATE_COST, "Illustrated a chapter", {
        tool: "story",
        media: "image",
      })) {
        setBlocked({ cost: STORY_ILLUSTRATE_COST, action: "Illustrating a chapter" });
        return;
      }
      const seed = rand(0, 999_999_999);
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId ? { ...c, illustrationSeed: seed, illustrating: true } : c
        )
      );
      const t = window.setTimeout(() => {
        setChapters((prev) =>
          prev.map((c) => (c.id === chapterId ? { ...c, illustrating: false } : c))
        );
      }, rand(1200, 2400));
      timers.current.push(t);
    },
    [credits]
  );

  const reset = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setStarted(false);
    setChapters([]);
    setWriting(false);
    // A different story means a different pre-rolled setup, not the one just closed.
    setConfig(rollConfig());
  }, []);

  const wordCount = chapters.reduce(
    (sum, c) => sum + c.paragraphs.join(" ").split(/\s+/).filter(Boolean).length,
    0
  );

  return {
    config,
    genre: findGenre(config.genre) ?? GENRES[0],
    setGenre,
    setPlot,
    rollPlot,
    rollNames,
    setCast,
    addProtagonist,
    removeProtagonist,
    reroll,
    started,
    begin,
    chapters,
    continueStory,
    illustrate,
    writing,
    wordCount,
    reset,
    blocked,
    dismissBlocked: () => setBlocked(null),
    loraHue: lora?.hue ?? 268,
    loraName: lora?.name ?? null,
  };
}
