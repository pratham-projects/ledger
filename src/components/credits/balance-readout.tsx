import { RotateCw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCountdown, AD_REWARD } from "@/hooks/use-credits";
import { cn } from "@/lib/utils";

export function BalanceReadout({
  balance,
  cap,
  msUntilRecharge,
  onBuyClick,
  onWatchAd,
}: {
  balance: number;
  cap: number;
  msUntilRecharge: number | null;
  onBuyClick: () => void;
  onWatchAd: () => void;
}) {
  const banked = Math.max(0, balance - cap);
  const freePortion = Math.min(balance, cap);
  const fillPct = (freePortion / cap) * 100;
  const empty = balance === 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-muted-2">
            credits available
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "font-mono text-[64px] font-bold leading-none tabular-nums",
                empty ? "text-red" : "text-ink"
              )}
            >
              {balance}
            </span>
            <span className="font-mono text-[18px] font-semibold tabular-nums text-ink-muted-2">
              / {cap}
            </span>
          </div>
          {banked > 0 && (
            <span className="font-mono text-[11px] text-green">
              +{banked} purchased, banked above the free cap
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="ghost" size="lg" onClick={onWatchAd}>
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            watch an ad +{AD_REWARD}
          </Button>
          <Button variant="primary" size="lg" onClick={onBuyClick}>
            top up →
          </Button>
        </div>
      </div>

      {/* Free-tier fill. Purchased credits deliberately don't extend it — the meter
          measures the recharging allowance, not total holdings. */}
      <div>
        <div
          className="h-1.5 w-full bg-panel-2"
          role="meter"
          aria-valuenow={freePortion}
          aria-valuemin={0}
          aria-valuemax={cap}
          aria-label="Free credit allowance"
        >
          <div
            className={cn("h-full transition-[width] duration-500", empty ? "bg-red" : "bg-accent")}
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 font-mono text-[11.5px] text-ink-muted">
          {msUntilRecharge === null ? (
            <>
              <RotateCw className="h-3.5 w-3.5 text-green" aria-hidden="true" />
              <span className="text-green">full</span>
              <span className="text-ink-muted-2">— recharges once you spend below {cap}</span>
            </>
          ) : (
            <>
              <RotateCw className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              refills to {cap} in{" "}
              <span className="font-semibold tabular-nums text-ink">
                {formatCountdown(msUntilRecharge)}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
