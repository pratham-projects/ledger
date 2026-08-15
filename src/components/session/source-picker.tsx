import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Search, X } from "lucide-react";
import { StockFill } from "@/components/media/stock-fill";
import { stagger } from "@/lib/motion";
import {
  LORAS,
  matchesQuery,
  previewSubject,
  sortByRule,
  type Checkpoint,
  type Lora,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** How many tiles the inline picker shows. A dozen and a half fills three rows of six. */
const PICKER_CAP = 18;

/**
 * Swapping the loaded LoRA without leaving the surface you're setting up.
 *
 * The bug this fixes: `${domain}.source` used to offer nothing but a link to `/browse`.
 * That link is a trapdoor — the catalog has no idea you came from RPG, so there is no way
 * back, and the setup you had filled in is gone with the unmounted route. Someone who
 * only wanted to see the other options loses their session to satisfy the curiosity.
 *
 * So the swap happens here instead. Eighteen most-used models, searchable across the whole
 * catalog, and picking one is a state change on the page you are already on — the LoRA
 * updates in the strip above and nothing else moves. `/browse` is still one click away for
 * the real browsing job (tag facets, per-category shelves, the full index), and that link
 * now carries where it was opened from so the catalog can offer the way back.
 *
 * Motion is `m-expand`, not a dropdown or a dialog: this is disclosure of something that
 * belongs to the panel, and it must not cover the strip whose value it is changing.
 */
export function SourcePicker({
  domain,
  checkpoint,
  selectedId,
  onSelect,
  onClose,
  compact = false,
}: {
  domain: string;
  checkpoint: Checkpoint;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  /** Fixes the grid at three columns for the ~360px session drawer. */
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const matched = query.trim() ? LORAS.filter((l) => matchesQuery(l, query)) : LORAS;
    // Most-used first: with no stated ordering a grid of eighteen out of three hundred
    // reads as arbitrary, and the visitor assumes the good ones are the ones not shown.
    return sortByRule(matched, "popular");
  }, [query]);

  const visible = results.slice(0, PICKER_CAP);

  return (
    <div className="flex flex-col border-t border-border bg-panel-2/40">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <Search className="h-3.5 w-3.5 shrink-0 text-ink-muted-2" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`search ${LORAS.length} models…`}
          aria-label="Search models"
          className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-ink outline-none placeholder:text-ink-muted-2"
        />
        {/* No "done" here on purpose: the caller's own toggle sits directly above this bar
            and already closes the region. Two closers a centimetre apart is one too many. */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="m-press inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-ink-muted-2 transition-colors hover:text-ink"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            clear
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="m-0 px-4 py-8 text-center font-sans text-[13px] text-ink-muted-2">
          Nothing matches “{query}”. Try a shorter word, or open the catalog to filter by tag.
        </p>
      ) : (
        <div
          className={cn(
            "m-stagger ledger-scrollbar grid grid-flow-col grid-rows-[repeat(2,minmax(0,1fr))] gap-px overflow-x-auto bg-border p-px",
            compact ? "auto-cols-[112px]" : "auto-cols-[152px]"
          )}
          style={{ gridTemplateRows: compact ? "repeat(2, 112px)" : "repeat(2, 152px)" }}
        >
          {visible.map((lora, i) => (
            <PickerTile
              key={lora.id}
              lora={lora}
              index={i}
              selected={lora.id === selectedId}
              compatible={lora.compatible.includes(checkpoint.family)}
              checkpointFamily={checkpoint.family}
              onSelect={() => {
                onSelect(lora.id);
                onClose();
              }}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border px-4 py-2.5">
        <span className="font-sans text-[12px] text-ink-muted-2">
          {visible.length === results.length
            ? `${results.length} ${results.length === 1 ? "match" : "matches"}, most used first.`
            : `${PICKER_CAP} of ${results.length}, most used first.`}
        </span>
        {/* Carries the origin so the catalog can offer a way back. Without this, /browse
            cannot know it was opened mid-setup — which is the whole bug. */}
        <Link
          to="/home#catalog"
          state={{ returnTo: `/${domain}`, returnLabel: `${domain}.setup` }}
          className="m-hover font-mono text-[11.5px] text-ink-muted no-underline transition-colors hover:text-accent"
        >
          open the full catalog →
        </Link>
      </div>
    </div>
  );
}

function PickerTile({
  lora,
  index,
  selected,
  compatible,
  checkpointFamily,
  onSelect,
}: {
  lora: Lora;
  index: number;
  selected: boolean;
  compatible: boolean;
  checkpointFamily: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      style={stagger(index)}
      onClick={onSelect}
      aria-pressed={selected}
      className="m-hover m-press group relative block h-full w-full overflow-hidden bg-panel outline-offset-[-2px]"
    >
      <StockFill
        seedKey={lora.id}
        subject={previewSubject(lora)}
        alt={`${lora.name} — preview`}
        sizes="(min-width: 1024px) 150px, 30vw"
        className="h-full w-full object-cover"
      />

      {selected && (
        <>
          <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_2px_var(--accent)]" />
          <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-accent text-[var(--on-accent)]">
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
        </>
      )}

      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-1.5 pb-1 pt-6">
        <span
          className={cn(
            "block truncate font-sans text-[12.5px] font-semibold leading-tight",
            selected ? "text-accent" : "text-ink"
          )}
        >
          {lora.name}
        </span>
        <span className="block truncate font-mono text-[9.5px] leading-tight text-white/70">
          {compatible ? lora.author : `trained for ${lora.compatible.join("/")}, not ${checkpointFamily}`}
        </span>
      </span>
    </button>
  );
}
