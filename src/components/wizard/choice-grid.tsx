import { useMemo } from "react";
import { Check } from "lucide-react";
import { ResolvingImage } from "@/components/media/resolving-image";
import { stagger } from "@/lib/motion";
import { stockRun, type StockSubject } from "@/lib/stock";
import { cn } from "@/lib/utils";

export interface Choice {
  id: string;
  name: string;
  /** One line under the name. This is what makes the grid choosable without reading all of it. */
  note: string;
}

/**
 * A picture-led single choice, four across.
 *
 * The dropdown this replaces asked someone to choose between "Frozen orbital station" and
 * "Sunken cathedral of glass" from a list of words, one at a time, behind a click. Both
 * are places; the whole decision is what they *look* like, and a `<select>` is the one
 * control that cannot say. Four columns is the widest a 2-line note stays readable at, and
 * it puts eight options — a full set — inside one glance instead of one scroll.
 *
 * Selection is marked by the frame, the accent check and the label weight. Deliberately
 * **not** by dimming the unpicked images: DESIGN.md's rule is that media renders as it
 * actually is, and a wall of half-lit previews would make the grid harder to choose from,
 * not easier.
 */
export function ChoiceGrid({
  name,
  label,
  options,
  value,
  onChange,
  subject,
  columns = 4,
}: {
  /** Used for the radiogroup's accessible name, e.g. "world theme". */
  name: string;
  label: string;
  options: Choice[];
  value: string;
  onChange: (id: string) => void;
  /** Passed through to the placeholder picker — `portrait` for people, `scene` for places. */
  subject?: StockSubject;
  columns?: 3 | 4;
}) {
  /**
   * One striding run rather than a per-option hash. Hashing each id independently collided
   * twice in the first eight worlds, and two identical photographs adjacent in a picker of
   * eight reads as broken, not as placeholder.
   */
  const previews = useMemo(() => stockRun(name, options.length, subject), [
    name,
    options.length,
    subject,
  ]);

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "m-stagger grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      )}
    >
      {options.map((option, i) => {
        const selected = option.id === value;
        const preview = previews[i];
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            style={stagger(i)}
            onClick={() => onChange(option.id)}
            className={cn(
              "m-hover m-press group relative flex flex-col bg-panel text-left outline-offset-[-2px]",
              selected && "bg-accent/[0.07]"
            )}
          >
            <span
              className={cn(
                "relative block aspect-[4/3] overflow-hidden bg-panel-2",
                // An inset ring rather than a border: a real border would shift the image
                // by a pixel on selection and make the whole grid twitch.
                selected && "shadow-[inset_0_0_0_2px_var(--accent)]"
              )}
            >
              <ResolvingImage
                src={preview.src(512)}
                srcSet={preview.srcSet}
                sizes="(min-width: 1024px) 260px, (min-width: 640px) 30vw, 45vw"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              {selected && (
                <span className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center bg-accent text-[var(--on-accent)]">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              )}
            </span>

            <span className="flex flex-1 flex-col gap-1 px-3 py-2.5">
              <span
                className={cn(
                  "font-sans text-[13.5px] font-semibold leading-tight",
                  selected ? "text-accent" : "text-ink"
                )}
              >
                {option.name}
              </span>
              <span className="font-sans text-[11.5px] leading-[1.45] text-ink-muted-2">
                {option.note}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
