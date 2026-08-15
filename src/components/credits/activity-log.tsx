import { Receipt } from "lucide-react";
import type { CreditTransaction } from "@/hooks/use-credits";
import { cn } from "@/lib/utils";

function relativeTime(at: number): string {
  const diffMs = Date.now() - at;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ActivityLog({ history }: { history: CreditTransaction[] }) {
  if (history.length === 0) {
    return (
      <div className="flex min-h-[140px] flex-col items-center justify-center gap-2.5 border border-dashed border-border-2 text-ink-muted-2">
        <Receipt className="h-5 w-5" aria-hidden="true" />
        <p className="font-mono text-[11.5px]">no activity yet</p>
        <p className="max-w-[36ch] px-4 text-center font-sans text-[12px] leading-[1.5]">
          Generations and recharges land here the moment they happen.
        </p>
      </div>
    );
  }

  return (
    <div className="ledger-scrollbar flex max-h-[360px] flex-col overflow-y-auto">
      {history.map((tx) => (
        <div
          key={tx.id}
          className="ledger-message-in flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 last:border-b-0"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-sans text-[13px] text-ink">{tx.label}</span>
            <span className="font-mono text-[10.5px] text-ink-muted-2">{relativeTime(tx.at)}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span
              className={cn(
                "font-mono text-[13px] font-semibold tabular-nums",
                tx.delta > 0 ? "text-green" : "text-red"
              )}
            >
              {tx.delta > 0 ? "+" : ""}
              {tx.delta}
            </span>
            <span className="font-mono text-[10px] text-ink-muted-2">bal {tx.balanceAfter}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
