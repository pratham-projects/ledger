import * as React from "react";
import { useLocation } from "react-router-dom";
import { CheckpointBar } from "@/components/browse/checkpoint-bar";
import { ReturnBar } from "@/components/browse/return-bar";
import { CatalogConsole } from "@/components/browse/catalog-console";
import { LoraShelf } from "@/components/browse/lora-shelf";
import { LoraDetail } from "@/components/browse/lora-detail";
import { Panel, PanelHead, PanelBody } from "@/components/ui/panel";
import { useSelection } from "@/hooks/use-selection";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  LORAS,
  filterLoras,
  tagFacets,
  type Lora,
  type LoraCategory,
  type ShelfRule,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * The catalogue, as a band of the hub rather than a page of its own.
 *
 * This is `/browse` moved inside `/home` without losing anything it did: narrow first —
 * by word, by tag, by what your base model can actually run — then read one shelf per
 * category. What it gains by moving is context. On its own page the catalogue was a
 * detour you had to already know to take; here the tools are directly above it, so
 * picking a model and using it are the same scroll.
 *
 * The one addition is the sticky category strip, borrowed from the bands above: at three
 * shelves and a few hundred models you lose your place, and the strip is both the readout
 * that tells you where you are and the control that moves you.
 */

type PerCategory<T> = Record<LoraCategory, T>;

const byCategory = <T,>(value: T): PerCategory<T> => ({
  character: value,
  style: value,
  concept: value,
});

export function CatalogSection() {
  const { checkpoint, lora, setCheckpoint, selectLora } = useSelection();

  /**
   * Set by the tool surfaces when they hand off here mid-setup, so the catalogue can
   * offer the way back. Absent for anyone who navigated in normally.
   */
  const origin = useLocation().state as { returnTo?: string; returnLabel?: string } | null;

  const [query, setQuery] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [familyOnly, setFamilyOnly] = React.useState(false);
  const [showAllFacets, setShowAllFacets] = React.useState(false);
  const [rules, setRules] = React.useState<PerCategory<ShelfRule>>(byCategory("popular"));
  const [expanded, setExpanded] = React.useState<PerCategory<boolean>>(byCategory(false));
  const [pages, setPages] = React.useState<PerCategory<number>>(byCategory<number>(1));

  const filter = React.useMemo(
    () => ({ query, tags, family: familyOnly ? checkpoint.family : null }),
    [query, tags, familyOnly, checkpoint.family]
  );

  const matched = React.useMemo(() => filterLoras(LORAS, filter), [filter]);

  /**
   * Facets are counted over what the *other* filters already left, so a tag never offers
   * a count it can't deliver. Selected tags are excluded from that narrowing, or picking
   * one would collapse every sibling to zero and dead-end the field.
   */
  const facets = React.useMemo(() => tagFacets(filterLoras(LORAS, { ...filter, tags: [] })), [filter]);

  const isCompatible = (candidate: Lora) => candidate.compatible.includes(checkpoint.family);

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const clear = () => {
    setQuery("");
    setTags([]);
    setFamilyOnly(false);
    setExpanded(byCategory(false));
  };

  const setFor = <T,>(
    setter: React.Dispatch<React.SetStateAction<PerCategory<T>>>,
    category: LoraCategory,
    value: T
  ) => setter((prev) => ({ ...prev, [category]: value }));

  const active = useScrollSpy(CATEGORY_ORDER.map((c) => `catalog-${c}`));

  return (
    <section id="catalog" className="hub-band scroll-mt-0">
      <header className="mb-6 max-w-[62ch]">
        <p className="desk-kicker mb-3">The catalogue</p>
        <h2
          className="desk-display mb-3 text-ink"
          style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.7rem)" }}
        >
          Pick what it draws. <span className="desk-em">Then use it anywhere.</span>
        </h2>
        <p className="text-[15px] leading-[1.65] text-ink-muted">
          {LORAS.length} models, so narrow before you browse — by word, by tag, or by what
          your base model can actually run. Whatever you load follows you into image,
          video, chat, RPG and story.
        </p>
      </header>

      <nav className="hub-spy reel-scroller" aria-label="Catalogue categories">
        {CATEGORY_ORDER.map((category) => (
          <a
            key={category}
            href={`#catalog-${category}`}
            className="hub-spy-pill no-underline"
            data-active={active === `catalog-${category}`}
          >
            {CATEGORY_LABEL[category]}
          </a>
        ))}
      </nav>

      <div className="mt-5 flex flex-col gap-5">
        {origin?.returnTo && (
          <ReturnBar
            returnTo={origin.returnTo}
            returnLabel={origin.returnLabel ?? origin.returnTo.replace("/", "")}
            lora={lora}
            checkpoint={checkpoint}
          />
        )}

        <Panel>
          <PanelHead title="base model" sub={checkpoint.name} />
          <PanelBody className="p-0">
            <CheckpointBar selected={checkpoint} onSelect={setCheckpoint} />
          </PanelBody>
        </Panel>

        <CatalogConsole
          query={query}
          onQueryChange={setQuery}
          facets={facets}
          activeTags={tags}
          onToggleTag={toggleTag}
          checkpoint={checkpoint}
          familyOnly={familyOnly}
          onFamilyOnlyChange={setFamilyOnly}
          showAllFacets={showAllFacets}
          onShowAllFacets={() => setShowAllFacets(true)}
          matched={matched.length}
          total={LORAS.length}
          onClear={clear}
        />

        {lora && <LoraDetail lora={lora} />}

        {CATEGORY_ORDER.map((category) => (
          <div key={category} id={`catalog-${category}`} className={cn("scroll-mt-[112px]")}>
            <LoraShelf
              category={category}
              loras={matched.filter((l) => l.category === category)}
              total={LORAS.filter((l) => l.category === category).length}
              rule={rules[category]}
              onRuleChange={(rule) => setFor(setRules, category, rule)}
              expanded={expanded[category]}
              onExpandedChange={(value) => {
                setFor(setExpanded, category, value);
                setFor<number>(setPages, category, 1);
              }}
              page={pages[category]}
              onPageChange={(page) => setFor(setPages, category, page)}
              selectedId={lora?.id ?? null}
              onSelect={selectLora}
              isCompatible={isCompatible}
            />
          </div>
        ))}

      </div>
    </section>
  );
}
