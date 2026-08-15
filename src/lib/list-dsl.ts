/**
 * A small, faithful-enough interpreter for this app's list-DSL — the syntax
 * taught on the home page (output/item/pack lists, [refs], {inline|alts},
 * ^N weights). Not a full reimplementation of that language, just
 * enough to make the "try this example" editor page's preview genuinely work
 * off whatever the user has typed, not a canned recording.
 */

export interface ParsedGenerator {
  title: string;
  lists: Record<string, { text: string; weight: number }[]>;
}

function parseWeightedLine(line: string): { text: string; weight: number } {
  const match = line.match(/^(.*?)\s*\^(\d+(?:\.\d+)?)$/);
  if (match) return { text: match[1].trim(), weight: Number(match[2]) };
  return { text: line, weight: 1 };
}

export function parseSource(source: string): ParsedGenerator {
  const rawLists: Record<string, string[]> = {};
  let current: string | null = null;

  for (const line of source.split("\n")) {
    if (/^\s*\/\//.test(line)) continue;
    if (line.trim() === "") continue;

    const indented = /^[ \t]/.test(line);
    if (!indented) {
      current = line.trim();
      if (current && !rawLists[current]) rawLists[current] = [];
    } else if (current) {
      rawLists[current].push(line.trim());
    }
  }

  const lists: ParsedGenerator["lists"] = {};
  for (const [name, items] of Object.entries(rawLists)) {
    lists[name] = items.map(parseWeightedLine);
  }

  return { title: lists.title?.[0]?.text ?? "Untitled", lists };
}

function pickWeighted(items: { text: string; weight: number }[]): string {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    if (roll < item.weight) return item.text;
    roll -= item.weight;
  }
  return items[items.length - 1]?.text ?? "";
}

const MAX_PASSES = 12;

function resolveOnce(text: string, lists: ParsedGenerator["lists"]): { text: string; changed: boolean } {
  let changed = false;

  text = text.replace(/\{([^{}]*)\}/g, (_, inner: string) => {
    changed = true;
    const options = inner.split("|");
    return options[Math.floor(Math.random() * options.length)];
  });

  text = text.replace(/\[([a-zA-Z0-9_]+)\]/g, (_, name: string) => {
    const list = lists[name];
    if (!list || list.length === 0) return `[${name}]`;
    changed = true;
    return pickWeighted(list);
  });

  return { text, changed };
}

export function resolveTemplate(text: string, lists: ParsedGenerator["lists"]): string {
  for (let i = 0; i < MAX_PASSES; i++) {
    const { text: next, changed } = resolveOnce(text, lists);
    text = next;
    if (!changed) break;
  }
  return text;
}

export function renderGenerator(source: string): { title: string; output: string } {
  const parsed = parseSource(source);
  const template = parsed.lists.output?.[0]?.text ?? "";
  return { title: parsed.title, output: resolveTemplate(template, parsed.lists) };
}

export const DEFAULT_SOURCE = `title
  Minimal Example

output
  Your [pack] contains [item], [item] and [item].

item
  a few coins
  an old {silver|bronze} ring
  a handkerchief
  a shard of bone
  some lint
  a tin of tea leaves

pack
  purse
  backpack
  bag
  pack
  knapsack
  rucksack
`;
