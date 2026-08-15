import { Dices, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCredits, formatCountdown } from "@/hooks/use-credits";
import { useAuth } from "@/hooks/use-auth";
import { useSelection } from "@/hooks/use-selection";

const navLinks = [
  { to: "/home", label: "Home" },
  { to: "/image", label: "Image" },
  { to: "/video", label: "Video" },
  { to: "/chat", label: "Chat" },
  { to: "/rpg", label: "RPG" },
  { to: "/story", label: "Story" },
];

export function NavBar() {
  const credits = useCredits();
  const auth = useAuth();
  const { lora } = useSelection();

  const low = credits.balance <= 5;

  return (
    // From xl up the SideRail carries all of this; two navigations at once would be noise.
    <nav className="flex flex-wrap items-center justify-between gap-3.5 border-b border-border py-[18px] xl:hidden">
      <NavLink
        to="/"
        aria-label="Home"
        className="flex items-center gap-2 font-display text-[15px] font-bold tracking-tight text-ink no-underline"
      >
        <Dices className="h-4 w-4 text-accent" aria-hidden="true" />
        Ledger
      </NavLink>

      {/* Tool names are words, not addresses — Desk sets them in the sentence face. The
          reel scrolls without a scrollbar, same as every other horizontal run in the app. */}
      <div className="reel-scroller flex items-center gap-[18px] overflow-x-auto font-sans text-[14px] font-medium text-ink-muted">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-ink-muted no-underline transition-colors hover:text-ink",
                isActive && "text-accent hover:text-accent"
              )
            }
          >
            {link.label}
            {/* The loaded LoRA is the spine — surface it wherever the tools are listed. */}
            {link.to === "/home" && lora && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
                title={`${lora.name} loaded`}
              />
            )}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <NavLink
          to="/credits"
          title={
            credits.msUntilRecharge === null
              ? `${credits.balance} credits — full`
              : `${credits.balance} credits — refills to ${credits.cap} in ${formatCountdown(credits.msUntilRecharge)}`
          }
          className={cn(
            // The balance is a pill, like every other piece of Desk chrome. `.desk-pill`
            // owns the surface and the type; the number inside it takes the mono `data`
            // role so it stays tabular and doesn't reflow as it counts down.
            "desk-pill shrink-0 no-underline",
            low && "text-red"
          )}
        >
          <Zap className={cn("h-3.5 w-3.5", low ? "text-red" : "text-accent")} aria-hidden="true" />
          <span key={credits.balance} className="desk-data m-attention inline-block text-[13px]">
            {credits.balance}
          </span>
          <span className="desk-data text-[13px] font-normal text-ink-muted-2">/{credits.cap}</span>
        </NavLink>

        {auth.isLoggedIn ? (
          <>
            <NavLink
              to="/profile"
              title={auth.email ?? undefined}
              className="max-w-[120px] truncate font-mono text-[12px] text-ink-muted no-underline transition-colors hover:text-ink"
            >
              {auth.email}
            </NavLink>
            <Button variant="ghost" size="sm" onClick={auth.logout}>
              log out
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={auth.openLoginModal}>
            login
          </Button>
        )}
      </div>
    </nav>
  );
}
