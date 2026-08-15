import { Link } from "react-router-dom";
import { Dices } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MediaTemplateGrid } from "@/components/tool-workspace/media-template-grid";
import { IMAGE_MY_GENERATIONS_ITEMS } from "@/components/image/templates-panel";
import { VIDEO_MY_GENERATIONS_ITEMS } from "@/components/video/templates-panel";
import { useCredits } from "@/hooks/use-credits";
import { useAuth } from "@/hooks/use-auth";
import { useSelection } from "@/hooks/use-selection";

/**
 * "My work" is the grid, not a ledger of past transactions — a visitor wants to see what
 * they made, tile by tile, the same way Image and Video's own "My Generations" tab shows
 * it. The one identity strip up top is context for whose grid this is, not the page's
 * subject.
 *
 * Same media pool `MyGenerationsPanel` draws from — real stills and clips standing in for
 * "what you've made" is honest on both sides of login (no persisted generation history
 * exists in this build) and it means a tile here is a tile you have already seen work the
 * same way elsewhere in the app.
 */
const MY_WORK_ITEMS = [...IMAGE_MY_GENERATIONS_ITEMS, ...VIDEO_MY_GENERATIONS_ITEMS];

export function Profile() {
  const credits = useCredits();
  const auth = useAuth();
  const { selectReferenceMedia } = useSelection();
  const displayName = auth.isLoggedIn ? auth.email!.split("@")[0] : "Guest";

  return (
    <div className="hub-band mx-auto w-full max-w-[1180px]">
      <p className="desk-kicker">my work</p>
      <h1 className="desk-display mt-3" style={{ fontSize: "clamp(28px, 4.4vw, 42px)" }}>
        Everything you&rsquo;ve made, <span className="desk-em">in one grid.</span>
      </h1>
      <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.65] text-ink-muted">
        Every image and clip, tile by tile. Pick one to see the full prompt, or to load it back
        into the composer.
      </p>

      <main className="mt-8 flex flex-col gap-5 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border border-border bg-panel p-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border-2 bg-panel-2 text-ink-muted">
              {auth.isLoggedIn ? (
                <span className="font-mono text-[14px] font-semibold text-accent">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <Dices className="h-4 w-4 text-accent" aria-hidden="true" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-display text-[15px] font-bold text-ink">{displayName}</span>
              <Badge>free tier</Badge>
            </div>
          </div>

          {/* Reports, it does not act. This slot used to hold a primary `log in →` button
              seventy pixels above an identical primary `log in` in the empty state below —
              two buttons, one modal, competing for the same decision. The empty state is
              the page's actual subject when there is nothing in the grid, so the single
              call to action lives there and this strip goes back to saying who you are. */}
          <span className="font-mono text-[12px] text-ink-muted-2">
            {auth.isLoggedIn ? (
              <>
                <span className="tabular-nums text-ink">{credits.balance}</span> credits left
              </>
            ) : (
              "not signed in"
            )}
          </span>
        </div>

        {auth.isLoggedIn ? (
          <MediaTemplateGrid
            items={MY_WORK_ITEMS}
            unit="generations"
            onSelect={selectReferenceMedia}
            columns={4}
          />
        ) : (
          /* Two doors, because there are genuinely two reasons this grid is empty: you have
             not signed in, or you have not made anything yet. Offering only the first left
             a visitor who just wanted to try the thing with nowhere to go but back. */
          <div className="tool-tab-empty">
            <p className="m-0 text-[13.5px] leading-[1.6] text-ink-muted">
              Log in and everything you generate stays here, tile by tile, instead of
              disappearing the moment you close the tab.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <Button variant="primary" size="sm" onClick={auth.openLoginModal}>
                log in
              </Button>
              <Link to="/image" className="no-underline">
                <Button variant="ghost" size="sm">
                  make something first →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
