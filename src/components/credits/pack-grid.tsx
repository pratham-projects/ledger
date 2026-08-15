import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CreditPack {
  id: string;
  label: string;
  credits: number;
  price: string;
  tag?: string;
}

/**
 * Optional top-up. Credits bought here bank above the free daily cap and are never
 * removed by a recharge — buying is a shortcut past the wait, never a requirement.
 */
export const CREDIT_PACKS: CreditPack[] = [
  { id: "starter", label: "starter", credits: 100, price: "$2.99" },
  { id: "popular", label: "popular", credits: 300, price: "$7.99", tag: "most popular" },
  { id: "mega", label: "mega", credits: 1000, price: "$19.99", tag: "best value" },
];

export function PackGrid({ onPurchase }: { onPurchase: (pack: CreditPack) => void }) {
  return (
    <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
      {CREDIT_PACKS.map((pack) => (
        <div key={pack.id} className="flex flex-col gap-3 bg-panel p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted-2">
              {pack.label}
            </span>
            {pack.tag && (
              <Badge className={cn(pack.tag === "most popular" && "border-accent/50 text-accent")}>
                {pack.tag}
              </Badge>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[26px] font-bold text-ink">{pack.credits}</span>
            <span className="font-mono text-[11px] text-ink-muted-2">credits</span>
          </div>
          <Button
            variant={pack.tag === "most popular" ? "primary" : "ghost"}
            size="sm"
            onClick={() => onPurchase(pack)}
          >
            buy — {pack.price}
          </Button>
        </div>
      ))}
    </div>
  );
}
