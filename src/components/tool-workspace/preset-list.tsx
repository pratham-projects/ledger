/**
 * The Templates tab for tools with no media to preview (chat, RPG, story) — a starting
 * point is a named preset here, not a picture or a clip, so the card pairs a small stock
 * portrait/scene with a name and a one-line hook. `MediaTemplateGrid` is the sibling of
 * this for image/video.
 */
export interface Preset {
  id: string;
  name: string;
  note: string;
  /** A stock still — same pool `ChoiceGrid` draws from, so it matches the setup grid. */
  image?: string;
}

export function PresetList({
  items,
  activeId,
  onSelect,
}: {
  items: Preset[];
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {items.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => onSelect(p.id)}
            data-active={p.id === activeId}
            className="m-hover flex w-full items-center gap-3 border border-border p-2 text-left transition-colors hover:border-accent data-[active=true]:border-accent data-[active=true]:bg-panel-2"
          >
            {p.image && (
              <img
                src={p.image}
                alt=""
                loading="lazy"
                className="h-11 w-11 shrink-0 rounded-sm object-cover"
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold text-ink">{p.name}</span>
              <span className="mt-0.5 block truncate text-[12px] leading-[1.45] text-ink-muted-2">
                {p.note}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
