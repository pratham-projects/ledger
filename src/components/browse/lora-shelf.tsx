/**
 * One category, shown two ways.
 *
 * By default it is a **shelf**: a dozen picked by a rule, and the rule is named on the
 * head and switchable. That naming is the whole anti-overwhelm device — "12 of 104"
 * with no stated reason reads as arbitrary and makes the visitor suspect the good ones
 * are the 92 they can't see. "12 of 104 · most used" is a claim they can accept or
 * reject, and rejecting it costs one click.
 *
 * On demand it becomes an **index**: every match in the category, in a dense grid,
 * revealed a page at a time. Two modes rather than one compromise, because winding a
 * reel through 104 frames and scanning a wall of 104 tiles are different jobs and no
 * single control does both.
 */
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { LoraReel } from "@/components/browse/lora-reel";
import { JustifiedGrid } from "@/components/media/justified-grid";
import { stockFor } from "@/lib/stock";
import { formatDownloads, previewSubject } from "@/lib/catalog";
import {
  CATEGORY_BLURB,
  CATEGORY_LABEL,
  SHELF_RULES,
  sortByRule,
  type Lora,
  type LoraCategory,
  type ShelfRule,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** How many a shelf shows before it stops being a shelf. */
export const SHELF_CAP = 12;
/** How many the index reveals per page. */
const INDEX_PAGE = 36;

export function LoraShelf({
  category,
  loras,
  total,
  rule,
  onRuleChange,
  expanded,
  onExpandedChange,
  page,
  onPageChange,
  selectedId,
  onSelect,
  isCompatible,
}: {
  category: LoraCategory;
  /** Everything in this category that survived the console's narrowing. */
  loras: Lora[];
  /** Everything in this category, before narrowing — so the head can say what was cut. */
  total: number;
  rule: ShelfRule;
  onRuleChange: (rule: ShelfRule) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  page: number;
  onPageChange: (page: number) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isCompatible: (lora: Lora) => boolean;
}) {
  const ordered = sortByRule(loras, rule);
  const overflows = ordered.length > SHELF_CAP;
  const visible = expanded ? ordered.slice(0, page * INDEX_PAGE) : ordered.slice(0, SHELF_CAP);
  const activeRule = SHELF_RULES.find((r) => r.key === rule)!;

  return (
    <section className="border border-border bg-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 border-b border-border px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          {/* The heading reads the way the rest of the page reads. It used to be
              `browse.{category}` — an address in the `domain.operation` convention, which
              belongs on a `PanelHead`'s mono metadata line, not in the `<h2>` a visitor
              scans to find the characters. On `/home`, where its neighbours are "Latest AI
              Models" and "Marketing and Advertising", it read as debug output; and it named
              `/browse`, a route this product no longer has (see App.tsx). The address is
              still here, in the slot the convention actually specifies. */}
          <div className="flex items-baseline gap-3">
            <h2 className="m-0 font-sans text-[15px] font-semibold capitalize text-ink">
              {CATEGORY_LABEL[category]}
            </h2>
            <span className="font-mono text-[10.5px] tabular-nums text-ink-muted-2">
              {ordered.length === total
                ? `${total} in catalog`
                : `${ordered.length} of ${total} match`}
            </span>
          </div>
          <p className="m-0 max-w-[62ch] font-sans text-[12.5px] leading-[1.5] text-ink-muted-2">
            {CATEGORY_BLURB[category]}
          </p>
        </div>

        {/* The rule is a control, not a caption — it is how you change what you're shown.
            It stays up in the index too: the ordering still applies there, and a control
            whose effect outlives its own visibility is worse than no control. */}
        {overflows && (
          <div
            role="radiogroup"
            aria-label={
              expanded
                ? `How ${CATEGORY_LABEL[category]} are ordered`
                : `How ${CATEGORY_LABEL[category]} are picked`
            }
            className="flex shrink-0 items-center border border-border-2"
          >
            {SHELF_RULES.map((r) => (
              <button
                key={r.key}
                type="button"
                role="radio"
                aria-checked={r.key === rule}
                title={r.note}
                onClick={() => onRuleChange(r.key)}
                className={cn(
                  "border-r border-border-2 px-2.5 py-1.5 font-mono text-[11px] transition-colors last:border-r-0",
                  r.key === rule
                    ? "bg-accent text-[#06060A]"
                    : "text-ink-muted-2 hover:bg-panel-2 hover:text-ink"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {ordered.length === 0 ? (
        <p className="px-4 py-10 text-center font-sans text-[13px] text-ink-muted-2">
          No {CATEGORY_LABEL[category]} match. Drop a tag or clear the search above.
        </p>
      ) : expanded ? (
        <>
          {/*
            The index is where the previews stop being uniform squares. A fixed grid would
            crop every portrait and panorama to the same box — throwing away the one thing
            that distinguishes hundreds of otherwise-similar entries — so the index lays
            out justified rows at each image's true ratio instead.
          */}
          <div className="p-4">
            <JustifiedGrid
              targetHeight={190}
              gap={10}
              items={visible.map((lora) => {
                const preview = stockFor(lora.id, previewSubject(lora));
                return {
                  id: lora.id,
                  aspect: preview.aspect,
                  src: preview.src(512),
                  srcSet: preview.srcSet,
                  alt: `${lora.name} — preview`,
                  onClick: () => onSelect(lora.id),
                  overlay: (
                    <LoraCaption
                      lora={lora}
                      selected={lora.id === selectedId}
                      compatible={isCompatible(lora)}
                    />
                  ),
                };
              })}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5">
            <span className="font-sans text-[12px] text-ink-muted-2">
              Showing {visible.length} of {ordered.length}, ordered by {activeRule.note}.
            </span>
            <div className="flex items-center gap-2">
              {visible.length < ordered.length && (
                <button
                  type="button"
                  onClick={() => onPageChange(page + 1)}
                  className="border border-border-2 px-3 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  show {Math.min(INDEX_PAGE, ordered.length - visible.length)} more
                </button>
              )}
              <button
                type="button"
                onClick={() => onExpandedChange(false)}
                className="inline-flex items-center gap-1.5 border border-border-2 px-3 py-1.5 font-mono text-[11px] text-ink-muted transition-colors hover:border-ink hover:text-ink"
              >
                <ChevronUp className="h-3 w-3" aria-hidden="true" />
                back to the shelf
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <LoraReel
            category={category}
            loras={visible}
            selectedId={selectedId}
            onSelect={onSelect}
            isCompatible={isCompatible}
          />

          {overflows && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5">
              <span className="font-sans text-[12px] text-ink-muted-2">
                {SHELF_CAP} of {ordered.length}, picked by {activeRule.note}.
              </span>
              <button
                type="button"
                onClick={() => onExpandedChange(true)}
                className="inline-flex items-center gap-1.5 border border-border-2 px-3 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
                see all {ordered.length}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** The index's tile chrome — name, author, uptake, and the two states that matter. */
function LoraCaption({
  lora,
  selected,
  compatible,
}: {
  lora: Lora;
  selected: boolean;
  compatible: boolean;
}) {
  return (
    <>
      {!compatible && (
        <span className="absolute left-2 top-2 border border-amber/50 bg-bg/80 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-amber backdrop-blur">
          needs another base
        </span>
      )}

      {selected && (
        <span className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center bg-accent text-[#06060A]">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2.5 pb-2 pt-6">
        <span
          className={cn(
            "truncate font-sans text-[13px] font-semibold leading-tight",
            selected ? "text-accent" : "text-ink"
          )}
        >
          {lora.name}
        </span>
        <span className="flex items-center justify-between gap-2 font-mono text-[10px] text-ink-muted">
          <span className="truncate">{lora.author}</span>
          <span className="shrink-0 tabular-nums">{formatDownloads(lora.downloads)}</span>
        </span>
      </div>
    </>
  );
}
