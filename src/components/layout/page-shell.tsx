import * as React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PixelGrid } from "@/components/ui/pixel-grid";
import { NavBar } from "@/components/layout/nav-bar";
import { SideRail } from "@/components/layout/side-rail";
import { ContextRail } from "@/components/layout/context-rail";
import { Footer } from "@/components/layout/footer";

/**
 * Three columns from xl up, one below it.
 *
 * The old shell capped every surface at 860px, which left roughly half of a 1080p screen
 * and two thirds of a 1440p one as empty gutter. Widening that cap alone would have been
 * worse, not better — 1600px of running prose is unreadable. So the gutters get *jobs*:
 * the left one carries navigation permanently, the right one carries session context,
 * and the middle column is only allowed to grow on surfaces that are grids rather than
 * text.
 *
 * The two rails arrive at different breakpoints on purpose — SideRail at xl, ContextRail
 * at 2xl. See the note in context-rail.tsx.
 */

/**
 * Surfaces whose content is prose or a single conversation column. These stay near a
 * readable measure no matter how wide the display is; everything else (catalogs, result
 * grids, history tables) is allowed to spread and gains density instead.
 *
 * `/story` moved out to `HubShell` (see `BARE_ROUTES` below) and carries its own measure
 * there (`Manuscript`'s `max-w-[680px]`), so it no longer reads this set.
 */
const PROSE_ROUTES = new Set<string>([]);

/**
 * Surfaces that take the viewport instead of sitting in a scrolling page.
 *
 * Empty, and deliberately so — this is now `SessionSurface`'s job rather than the shell's.
 *
 * The three narrative surfaces (chat, RPG, story) dock in their route by default and can
 * portal to full screen on demand, so the shell no longer has to reshape them.
 *
 * Kept as a named concept because the reasoning is worth not rediscovering: a surface
 * that owns the viewport should own it, rather than asking its container to become a
 * different container.
 */
const STAGE_ROUTES = new Set<string>([]);

/**
 * Routes that render with no shell at all — no rails, no nav, no footer, no pixel grid.
 *
 * `/home-ideas` is a set of candidate replacements for `/`, and each candidate owns its
 * own visual world down to its own navigation. Wrapping them in Ledger's chrome would put
 * the incumbent design system around five proposals to replace it, which makes every one
 * of them impossible to judge. Prefix match rather than exact, so the index and all six
 * candidates are covered by one entry.
 *
 * `/home` and `/` are bare for the same reason: neither is a page inside the app's
 * chrome, each *is* chrome — its own permanent topbar, its own hero, its own scroll.
 * Nesting either inside the shell would give a visitor two left rails and two credit
 * readouts. `/` is an exact match rather than a prefix — a leading-slash prefix would
 * swallow every route in the app.
 *
 * `/image`, `/video`, `/chat`, `/rpg`, `/story`, `/credits`, `/profile` and `/editor`
 * are surfaces migrated onto that same
 * chrome (`HubShell`, mounted in `App.tsx`) rather than this shell's old
 * `SideRail`/`NavBar`/`ContextRail` — see the note on `HubShell` for why a tool route
 * wants the hub's rail instead of a second one. `/chat`, `/rpg` and `/story` need it
 * doubly: all three stages now dock by default (see `ChatStage`, `PlaySurface`,
 * `Manuscript`), so the rail behind them is actually visible rather than moot chrome
 * under a portal.
 */
const BARE_ROUTES = new Set([
  "/",
  "/image",
  "/video",
  "/chat",
  "/rpg",
  "/story",
  "/credits",
  "/profile",
  "/editor",
]);
const BARE_PREFIXES = ["/home-ideas", "/home"];

export function PageShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const prose = PROSE_ROUTES.has(pathname);
  const stage = STAGE_ROUTES.has(pathname);

  if (BARE_ROUTES.has(pathname) || BARE_PREFIXES.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  return (
    <>
      <PixelGrid />
      <div
        className={cn(
          "relative z-[1] mx-auto flex max-w-[1720px] items-start",
          stage && "h-[100dvh] overflow-hidden"
        )}
      >
        <SideRail />

        <div className={cn("min-w-0 flex-1", stage && "flex h-full min-h-0 flex-col")}>
          <div
            className={cn(
              "mx-auto w-full px-6",
              stage
                ? "flex h-full min-h-0 max-w-[1280px] flex-col"
                : cn("max-w-[860px]", prose ? "xl:max-w-[900px]" : "xl:max-w-[1180px]")
            )}
          >
            <NavBar />
            {/* Keyed on pathname so the route body replays its arrival on every
                navigation. See the `m-view` note in styles/motion.css for why
                this role is deliberately quieter than `m-enter`. */}
            <div
              key={pathname}
              className={cn("m-view", stage && "flex min-h-0 flex-1 flex-col py-4 xl:py-5")}
            >
              {children}
            </div>
            {!stage && <Footer />}
          </div>
        </div>

        {!stage && <ContextRail />}
      </div>
    </>
  );
}
