/**
 * The narrowing instrument at the head of /browse.
 *
 * A catalog of three hundred does not have a browsing problem, it has an *asking*
 * problem. The old surface opened on three reels of everything and left the visitor to
 * wind; that works at twenty and collapses at three hundred, where winding is the only
 * tool and it costs a hundred clicks to reach the end of one category.
 *
 * So the surface opens on a question instead of a wall. Search, tag facets carrying
 * their own counts, and a compatibility switch — then a readout of exactly how much of
 * the catalog survived, drawn with the same two-segment bar the reels use for position.
 * Narrowing is the page's loudest move because narrowing is the thing that has to happen
 * before anything else is worth looking at.
 */
import { Search, X } from "lucide-react";
import { Panel, PanelHead } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import type { Checkpoint, TagFacet } from "@/lib/catalog";

/** Facets shown before "more" — enough to cover the common asks, few enough to read. */
const VISIBLE_FACETS = 12;

export function CatalogConsole({
  query,
  onQueryChange,
  facets,
  activeTags,
  onToggleTag,
  checkpoint,
  familyOnly,
  onFamilyOnlyChange,
  showAllFacets,
  onShowAllFacets,
  matched,
  total,
  onClear,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  facets: TagFacet[];
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  checkpoint: Checkpoint;
  familyOnly: boolean;
  onFamilyOnlyChange: (value: boolean) => void;
  showAllFacets: boolean;
  onShowAllFacets: () => void;
  matched: number;
  total: number;
  onClear: () => void;
}) {
  const narrowed = query.trim() !== "" || activeTags.length > 0 || familyOnly;
  const shown = showAllFacets ? facets : facets.slice(0, VISIBLE_FACETS);
  const share = total === 0 ? 0 : matched / total;

  return (
    <Panel>
      <PanelHead title="browse.narrow" sub={`${total} loras · ${facets.length} tags`} />

      <div className="relative border-b border-border">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted-2"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="search by name, tag, author or trigger word…"
          aria-label="Search the LoRA catalog"
          className="w-full bg-transparent py-3.5 pl-11 pr-4 font-mono text-[13px] text-ink outline-none placeholder:text-ink-muted-2 focus:bg-panel-2"
        />
      </div>

      <div className="flex flex-col gap-3 border-b border-border p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted-2">
            narrow by tag
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={familyOnly}
            onClick={() => onFamilyOnlyChange(!familyOnly)}
            className={cn(
              "inline-flex items-center gap-2 border px-2.5 py-1.5 font-mono text-[11px] transition-colors",
              familyOnly
                ? "border-accent text-accent"
                : "border-border-2 text-ink-muted-2 hover:border-ink hover:text-ink"
            )}
          >
            <span
              aria-hidden="true"
              className={cn("h-2 w-2 shrink-0", familyOnly ? "bg-accent" : "bg-border-2")}
            />
            runs on {checkpoint.name}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {shown.map(({ tag, count }) => {
            const active = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={active}
                onClick={() => onToggleTag(tag)}
                className={cn(
                  "inline-flex items-baseline gap-1.5 border px-2 py-1 font-mono text-[11px] transition-colors",
                  active
                    ? "border-accent bg-accent text-[#06060A]"
                    : "border-border-2 text-ink-muted hover:border-ink hover:text-ink"
                )}
              >
                {tag}
                <span
                  className={cn(
                    "tabular-nums text-[10px]",
                    active ? "text-[#06060A]/60" : "text-ink-muted-2"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {!showAllFacets && facets.length > VISIBLE_FACETS && (
            <button
              type="button"
              onClick={onShowAllFacets}
              className="border border-transparent px-2 py-1 font-mono text-[11px] text-ink-muted-2 transition-colors hover:text-accent"
            >
              +{facets.length - VISIBLE_FACETS} more
            </button>
          )}
        </div>
      </div>

      {/* How much of the catalog survived — the reels' position bar, applied to the whole. */}
      <div className="flex items-center gap-4 p-4">
        <div className="relative h-1.5 flex-1 bg-panel-2" aria-hidden="true">
          <div
            className={cn(
              "absolute inset-y-0 left-0 transition-[width] duration-300 ease-out",
              // Accent means "your narrowing did this". Un-narrowed, the bar is full by
              // definition and carries no information — a full-width accent stripe there
              // would be decoration, and the loudest thing on the page for saying nothing.
              matched === 0 ? "bg-red" : narrowed ? "bg-accent" : "bg-border-2"
            )}
            style={{ width: `${Math.max(matched === 0 ? 0 : 1.5, share * 100)}%` }}
          />
        </div>

        <span className="shrink-0 font-mono text-[12px] tabular-nums text-ink">
          {matched}
          <span className="text-ink-muted-2"> / {total}</span>
        </span>

        <button
          type="button"
          onClick={onClear}
          disabled={!narrowed}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] transition-colors",
            narrowed
              ? "border-border-2 text-ink-muted hover:border-red hover:text-red"
              : "cursor-not-allowed border-transparent text-ink-muted-2 opacity-40"
          )}
        >
          <X className="h-3 w-3" aria-hidden="true" />
          clear
        </button>
      </div>
    </Panel>
  );
}
