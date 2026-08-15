import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A multi-select that is also a text field.
 *
 * The comma-separated input this replaces made the user do the data entry *and* the
 * formatting — "rope, lamp, half a map" is a list pretending to be a sentence, with no
 * way to see what you already have or to remove one thing without editing a string. Here
 * the pack is a wrapped run of chips you can drop individually, the obvious contents are
 * one tap each, and the field is still open for anything nobody thought of.
 *
 * Chosen and suggested chips share a row rather than sitting in two lists: they are the
 * same kind of thing in two states, and splitting them would make adding an item move it
 * across the panel.
 */
export function TagField({
  id,
  legend,
  selected,
  suggestions,
  onToggle,
  onAdd,
  placeholder,
  addLabel = "add",
  emptyNote,
}: {
  id: string;
  /** Accessible name for the chip group, e.g. "starting inventory". */
  legend: string;
  selected: string[];
  /** Offered but not chosen. Anything already selected is filtered out here. */
  suggestions: string[];
  onToggle: (item: string) => void;
  onAdd: (raw: string) => void;
  placeholder: string;
  addLabel?: string;
  /** Shown in place of the chips when nothing is selected. */
  emptyNote: string;
}) {
  const [draft, setDraft] = useState("");

  const offered = suggestions.filter((s) => !selected.includes(s));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onAdd(draft);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label={legend} className="flex flex-wrap items-center gap-1.5">
        {selected.length === 0 && (
          <p className="m-0 font-sans text-[12.5px] text-ink-muted-2">{emptyNote}</p>
        )}

        {selected.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed
            onClick={() => onToggle(item)}
            title={`Remove ${item}`}
            className={cn(
              "m-press inline-flex items-center gap-1.5 border border-accent bg-accent/10 py-1 pl-2.5 pr-2",
              "font-mono text-[11.5px] text-accent transition-colors hover:bg-accent/20"
            )}
          >
            {item}
            <X className="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />
          </button>
        ))}

        {offered.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={false}
            onClick={() => onToggle(item)}
            title={`Add ${item}`}
            className={cn(
              "m-press inline-flex items-center gap-1.5 border border-border-2 py-1 pl-2.5 pr-2",
              "font-mono text-[11.5px] text-ink-muted-2 transition-colors hover:border-ink hover:text-ink"
            )}
          >
            {item}
            <Plus className="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex items-stretch gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          aria-label={`Add to ${legend}`}
          className={cn(
            "min-w-0 flex-1 border border-border-2 bg-panel-2 px-3 py-2 font-sans text-[14px] text-ink",
            "outline-none transition-colors placeholder:text-ink-muted-2 focus:border-accent"
          )}
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className={cn(
            "shrink-0 border border-border-2 px-3.5 font-mono text-[11.5px] text-ink transition-colors",
            "hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
          )}
        >
          {addLabel}
        </button>
      </form>
    </div>
  );
}
