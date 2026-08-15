/**
 * THESIS: credits are a recharging allowance you are never locked out of, shown as a
 * ledger — every spend and every refill is a legible line. Refuses the wallet-HUD
 * pattern where the balance is a badge and the history is hidden.
 * OWN-WORLD: existing Ledger hairline/mono/violet system; balance as a bold tabular
 * mono readout over a zero-radius fill meter; packs as hairline divider-grid cells;
 * history as a scrollable log with signed green/red deltas.
 * STORY: visitor glances at the balance, sees how long until it refills, and learns
 * that waiting is a real option before buying is offered.
 * FIRST VIEWPORT: balance + refill countdown + the two free doors, packs below,
 * ledger beneath — state and options understood without scrolling.
 * FORM: inherits the surface established by the previous /gems build (seed 21f9ad20,
 * candidate 3 — balance-as-hero + pack grid), reframed per docs/goal.md §6.
 */
import { useRef } from "react";
import { Panel, PanelHead, PanelBody } from "@/components/ui/panel";
import { BalanceReadout } from "@/components/credits/balance-readout";
import { PackGrid, type CreditPack } from "@/components/credits/pack-grid";
import { ActivityLog } from "@/components/credits/activity-log";
import { useCredits } from "@/hooks/use-credits";

export function Credits() {
  const credits = useCredits();
  const packsRef = useRef<HTMLDivElement>(null);

  const handlePurchase = (pack: CreditPack) => {
    credits.addCredits(pack.credits, `Purchased ${pack.label} pack`);
  };

  return (
    <div className="hub-band mx-auto w-full max-w-[980px]">
      <p className="desk-kicker">credits.balance</p>
      <h1 className="desk-display mt-3" style={{ fontSize: "clamp(28px, 4.4vw, 42px)" }}>
        Free credits, <span className="desk-em">back every day.</span>
      </h1>
      <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.65] text-ink-muted">
          You get {credits.cap} credits that refill on their own. Buying more is a
          shortcut past the wait, never the only way through — and every spend and refill
          lands as its own line below, the moment it happens.
      </p>

      <main className="mt-8 flex flex-col gap-5 pb-16">
        <Panel>
          <PanelHead title="credits.balance" sub="live" />
          <PanelBody>
            <BalanceReadout
              balance={credits.balance}
              cap={credits.cap}
              msUntilRecharge={credits.msUntilRecharge}
              onWatchAd={credits.watchAd}
              onBuyClick={() =>
                packsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            />
          </PanelBody>
        </Panel>

        <div ref={packsRef}>
          <Panel>
            <PanelHead title="credits.purchase" sub="optional" />
            <PanelBody>
              <PackGrid onPurchase={handlePurchase} />
            </PanelBody>
          </Panel>
        </div>

        <Panel>
          <PanelHead title="credits.activity" sub={`${credits.history.length} entries`} />
          <ActivityLog history={credits.history} />
        </Panel>
      </main>
    </div>
  );
}
