import { useEffect, useRef } from "react";
import { Check, X, Clock, Play } from "lucide-react";
import { PackGrid, type CreditPack } from "@/components/credits/pack-grid";
import { Button } from "@/components/ui/button";
import { useCredits, formatCountdown, AD_REWARD } from "@/hooks/use-credits";

/**
 * Running out is a wait, not a wall. Three doors, in order of cost to the user:
 * wait for the free recharge, watch an ad, or buy. The paywall is the last one, not
 * the only one — see docs/goal.md §6.
 */
export function OutOfCreditsModal({
  requiredCredits,
  action,
  onClose,
}: {
  requiredCredits: number;
  action: string;
  onClose: () => void;
}) {
  const credits = useCredits();
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !dialogRef.current) return;
      // Keep tabbing inside the dialog while it's open.
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      restoreFocusRef.current?.focus();
    };
  }, [onClose]);

  const handlePurchase = (pack: CreditPack) => {
    credits.addCredits(pack.credits, `Purchased ${pack.label} pack`);
  };

  const resolved = credits.balance >= requiredCredits;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="m-scrim absolute inset-0 bg-black/70" aria-hidden="true" />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="out-of-credits-title"
        className="m-overlay relative max-h-[90vh] w-full max-w-[520px] overflow-y-auto border border-border-2 bg-panel outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="font-mono text-[11.5px] text-ink">
            {resolved ? "credits.topped-up" : "credits.exhausted"}
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-ink-muted-2 transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {resolved ? (
          <div className="flex flex-col items-start gap-4 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center border border-green/50 bg-green/15 text-green">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 id="out-of-credits-title" className="font-display text-[20px] font-bold text-ink">
                Topped up
              </h2>
            </div>
            <p className="font-sans text-[14px] leading-[1.5] text-ink-muted">
              You now have{" "}
              <span className="font-semibold text-ink">{credits.balance} credits</span> — enough to
              continue.
            </p>
            <Button variant="primary" onClick={onClose}>
              continue →
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 p-5">
            <div>
              <h2 id="out-of-credits-title" className="font-display text-[20px] font-bold text-ink">
                Out of credits
              </h2>
              <p className="mt-1.5 font-sans text-[14px] leading-[1.5] text-ink-muted">
                {action} costs{" "}
                <span className="font-semibold text-ink">{requiredCredits} credits</span> and you
                have <span className="font-semibold text-red">{credits.balance}</span>. Three ways
                forward — the first one is free.
              </p>
            </div>

            <div className="flex flex-col gap-px border border-border bg-border">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-panel px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="font-sans text-[13.5px] font-semibold text-ink">Wait</span>
                    <span className="font-sans text-[12.5px] text-ink-muted-2">
                      Your {credits.cap} free credits come back on their own.
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[13px] font-semibold tabular-nums text-ink">
                  {credits.msUntilRecharge === null
                    ? "ready"
                    : formatCountdown(credits.msUntilRecharge)}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 bg-panel px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <Play className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="font-sans text-[13.5px] font-semibold text-ink">
                      Watch an ad
                    </span>
                    <span className="font-sans text-[12.5px] text-ink-muted-2">
                      Adds {AD_REWARD} credits right now.
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={credits.watchAd}>
                  +{AD_REWARD}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-muted-2">
                or top up
              </span>
              <PackGrid onPurchase={handlePurchase} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
