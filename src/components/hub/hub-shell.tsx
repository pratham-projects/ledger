import * as React from "react";
import { Link } from "react-router-dom";
import { Menu, Zap } from "lucide-react";
import { HubSidebar, useHubSidebar } from "@/components/hub/hub-sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCredits, formatCountdown } from "@/hooks/use-credits";
import { cn } from "@/lib/utils";

/**
 * The hub's chrome, as a wrapper rather than a page.
 *
 * `/home` and `/` both need the permanent rail and the topbar, and neither can get them
 * from `PageShell` — the shell nests its own left rail and its own credit readout, so a
 * surface that carries those itself would show a visitor two of each. That is why both
 * routes are in `BARE_ROUTES` / `BARE_PREFIXES`, and why the chrome had to become
 * something a route mounts instead of something wrapped around it.
 *
 * The rail's collapse state lives here, so it is per-mount: navigating between the two
 * surfaces re-reads it from `localStorage` and the rail stays where the user put it.
 *
 * `children` is handed the full width of the main column, unpadded. A surface that wants
 * a measure sets its own — the hub's bands do it with `.hub-band`, and `/` does it with a
 * centred max-width column — because the two surfaces disagree about how wide they should
 * run and the shell has no business deciding for them.
 *
 * `sidebar` defaults to on. `/` is the one surface that turns it off — it is the product's
 * landing page, not a dashboard a visitor navigates *from*, so a permanent rail of tool
 * links next to a page whose entire job is to sell one tool at a time was two competing
 * navigations stacked on top of each other. `/home` and every tool route wrapped in
 * `HubShell` keep it, because those genuinely are places you jump to other places from.
 */
export function HubShell({
  label,
  children,
  sidebar: sidebarEnabled = true,
}: {
  label: string;
  children: React.ReactNode;
  sidebar?: boolean;
}) {
  const sidebar = useHubSidebar();

  return (
    <div className="hub-shell">
      {sidebarEnabled && (
        <HubSidebar
          collapsed={sidebar.collapsed}
          onToggleCollapsed={() => sidebar.setCollapsed((c) => !c)}
          open={sidebar.open}
          onClose={() => sidebar.setOpen(false)}
        />
      )}

      <div className="hub-main">
        <HubTopBar
          label={label}
          onOpenSidebar={sidebarEnabled ? () => sidebar.setOpen(true) : undefined}
        />
        {children}
      </div>

      {sidebarEnabled && <BottomNav />}
    </div>
  );
}

/**
 * Where you are, what you have left, and who you are. It grounds itself once the page
 * scrolls — transparent over the hero, then glass with a rule under it — so the hero
 * reads as one uninterrupted field on arrival and the bar only becomes an object when it
 * has content passing beneath it.
 */
function HubTopBar({
  label,
  onOpenSidebar,
}: {
  label: string;
  /** Absent when `HubShell` is mounted with `sidebar={false}` — there is nothing to open. */
  onOpenSidebar?: () => void;
}) {
  const credits = useCredits();
  const auth = useAuth();
  const [stuck, setStuck] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const low = credits.balance <= 5;

  return (
    <header className="desk-topbar flex items-center gap-3 px-4 py-3 sm:px-6" data-stuck={stuck}>
      {onOpenSidebar && (
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded p-1.5 text-ink-muted transition-colors hover:bg-raised hover:text-ink lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      <p className="desk-pill-label m-0">{label}</p>

      <div className="ml-auto flex items-center gap-2.5">
        <Link
          to="/credits"
          className="desk-pill no-underline"
          title={
            credits.msUntilRecharge === null
              ? `${credits.balance} credits — full`
              : `${credits.balance} credits — refills to ${credits.cap} in ${formatCountdown(credits.msUntilRecharge)}`
          }
        >
          <Zap className={cn("h-3.5 w-3.5", low ? "text-red" : "text-accent")} aria-hidden="true" />
          <span key={credits.balance} className="desk-data m-attention inline-block text-[13px]">
            {credits.balance}
          </span>
          <span className="desk-data text-[13px] font-normal text-ink-muted-2">
            /{credits.cap}
          </span>
        </Link>

        {auth.isLoggedIn ? (
          <Button variant="ghost" size="sm" onClick={auth.logout}>
            Log out
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={auth.openLoginModal}>
            Log in
          </Button>
        )}
      </div>
    </header>
  );
}
