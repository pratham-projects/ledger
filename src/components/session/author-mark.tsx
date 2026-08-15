import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Who wrote this line.
 *
 * In chat, RPG and story alike, two authors write into one column: you, and the thing on
 * the other end. Everything else on those surfaces — the measure, the rules, the
 * illustration — is shared between them, so this mark is carrying the entire distinction.
 * It gets the accent; your own turns stay muted. Colour is doing information work here,
 * which is the only kind of colour DESIGN.md allows.
 *
 * The `writing` state is the same mark mid-generation. It matters that this is the *same*
 * element rather than a separate typing indicator that gets swapped out: the label does
 * not move, jump or re-flow when the line finishes, so the eye stays where the words are
 * about to be.
 *
 * HONESTY. This names the **speaker**, not the provenance of the bytes. In this build the
 * prose comes from authored pools, and every surface states that plainly beneath its log
 * — see the disclosure line on each. Naming the narrator is true either way; claiming a
 * canned string came out of a language model would not be, and this component never does.
 */
export function AuthorMark({
  speaker,
  writing = false,
  /** `assistant` gets the accent; `user` stays muted. */
  voice = "assistant",
  actions,
  /** Which way to hang the controls, so they never sit on top of the words. */
  side = "after",
  title,
  className,
}: {
  speaker: string;
  writing?: boolean;
  voice?: "assistant" | "user";
  actions?: ReactNode;
  side?: "after" | "before";
  title?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex w-fit min-w-0 max-w-[calc(100%-104px)] items-center gap-2",
        className
      )}
    >
      <span
        className={cn(
          "min-w-0 truncate font-mono text-[9.5px] uppercase tracking-[0.18em]",
          voice === "assistant" ? "text-accent" : "text-ink-muted-2"
        )}
        title={title ?? speaker}
      >
        {speaker}
      </span>

      {writing && (
        <span className="inline-flex shrink-0 items-center gap-1.5">
          {/* The system's own "genuinely working" role, not three bouncing dots. */}
          <span className="m-pending h-[7px] w-[26px] border border-border-2" aria-hidden="true" />
          <span className="font-mono text-[9.5px] lowercase tracking-wider text-ink-muted-2">
            writing
          </span>
        </span>
      )}

      {actions && (
        <span
          className={cn(
            "absolute top-1/2 z-10 flex -translate-y-1/2 gap-1.5 opacity-0 transition-opacity duration-150",
            "group-hover:opacity-100 group-focus-within:opacity-100",
            side === "after" ? "left-full ml-2.5" : "right-full mr-2.5"
          )}
        >
          {actions}
        </span>
      )}
    </span>
  );
}
