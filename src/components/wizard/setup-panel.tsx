import type { ReactNode } from "react";
import { ArrowRight, Dices, Zap } from "lucide-react";
import { Panel, PanelHead } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/use-credits";
import { cn } from "@/lib/utils";

/**
 * The setup step for RPG and Story.
 *
 * Replaces the old generic WizardShell, which rendered whatever fields it was handed as a
 * stack of empty required inputs and disabled the begin button until all of them were
 * filled. That is a form, and a form is the wrong shape for this: nobody arrives at an
 * RPG wanting to do data entry. Here the surface opens already answered — the hook rolls
 * a complete, playable configuration on mount — so the primary action is live on the
 * first frame and every control below it is optional.
 *
 * `reroll` is therefore the second-most important control on the page, not a novelty. It
 * sits on the panel head, at the top of the thing it rerolls.
 *
 * Deliberately not a modal — nothing here needs interrupting or protected focus, and a
 * dialog would hide the loaded LoRA that gives the whole flow its point.
 */
export function SetupPanel({
  domain,
  blurb,
  children,
  onReroll,
  rerollLabel,
  onBegin,
  beginLabel,
  cost,
  disabled = false,
  disabledNote,
}: {
  domain: string;
  blurb: string;
  children: ReactNode;
  onReroll: () => void;
  rerollLabel: string;
  onBegin: () => void;
  beginLabel: string;
  cost: number;
  /** True only when the user has emptied something that cannot be empty. */
  disabled?: boolean;
  disabledNote?: string;
}) {
  const credits = useCredits();
  const affordable = credits.balance >= cost;

  return (
    <Panel>
      <PanelHead
        title={`${domain}.setup`}
        sub={
          <button
            type="button"
            onClick={onReroll}
            className="m-press inline-flex items-center gap-1.5 font-mono text-[10.5px] text-ink-muted transition-colors hover:text-accent"
          >
            <Dices className="h-3.5 w-3.5" aria-hidden="true" />
            {rerollLabel}
          </button>
        }
      />

      <p className="m-0 max-w-[62ch] border-b border-border px-5 py-4 font-sans text-[14px] leading-[1.6] text-ink-muted">
        {blurb}
      </p>

      {children}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-mono text-[11px]",
            affordable ? "text-ink-muted-2" : "text-red"
          )}
        >
          <Zap className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="tabular-nums">{cost}</span> credits to begin
          {!affordable && ` — you have ${credits.balance}`}
        </span>

        <div className="flex items-center gap-3">
          {disabled && disabledNote && (
            <span className="font-mono text-[11px] text-ink-muted-2">{disabledNote}</span>
          )}
          <Button variant="primary" size="lg" onClick={onBegin} disabled={disabled}>
            {beginLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Panel>
  );
}

/**
 * One decision inside the setup panel, ruled off rather than boxed.
 *
 * DESIGN.md forbids nested panels, and four stacked cards inside a card is exactly the
 * failure it names. A rule and a mono label do the same job of separating without adding
 * a second frame around everything.
 */
export function SetupSection({
  label,
  hint,
  action,
  children,
}: {
  label: string;
  hint: string;
  /** Optional control belonging to this section, right-aligned against the label. */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-b border-border p-5 last-of-type:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="m-0 font-mono text-[10.5px] uppercase tracking-wider text-ink-muted-2">
            {label}
          </h2>
          <p className="m-0 max-w-[62ch] font-sans text-[12.5px] leading-[1.5] text-ink-muted-2">
            {hint}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
