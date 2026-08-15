import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Dices,
  Film,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  Swords,
  Waves,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCredits, formatCountdown } from "@/hooks/use-credits";
import { useAuth } from "@/hooks/use-auth";
import { useSelection } from "@/hooks/use-selection";

/**
 * The wide-screen navigation. Below xl the app keeps the horizontal NavBar; from xl up
 * the left gutter — previously dead space — carries navigation permanently so the
 * content column never has to spend vertical room on it.
 */

const SPINE = { to: "/home", label: "Home", icon: Layers };

const TOOLS = [
  { to: "/image", label: "Image", icon: ImageIcon },
  { to: "/video", label: "Video", icon: Film },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/rpg", label: "RPG", icon: Swords },
  { to: "/story", label: "Story", icon: BookOpen },
];

export function SideRail() {
  const credits = useCredits();
  const auth = useAuth();
  const { lora } = useSelection();

  const low = credits.balance <= 5;

  return (
    <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col border-r border-border xl:flex">
      <NavLink
        to="/"
        aria-label="Home"
        className="flex items-center gap-2 border-b border-border px-5 py-[18px] font-display text-[15px] font-bold tracking-tight text-ink no-underline"
      >
        <Dices className="h-4 w-4 text-accent" aria-hidden="true" />
        Ledger
      </NavLink>

      <nav className="flex flex-col gap-1 p-3">
        <RailLink {...SPINE}>
          {/* The loaded LoRA is the spine — its indicator belongs on the entry point. */}
          {lora && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              aria-hidden="true"
              title={`${lora.name} loaded`}
            />
          )}
        </RailLink>

        <p className="desk-pill-label px-3 pb-1.5 pt-4">
          tools
        </p>
        {TOOLS.map((link) => (
          <RailLink key={link.to} {...link} />
        ))}

        {/* Design-system surface, not a product tool — grouped apart so it never
            reads as something a visitor came here to use. */}
        <p className="desk-pill-label px-3 pb-1.5 pt-4">
          system
        </p>
        <RailLink to="/motion" label="Motion" icon={Waves} />
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-border p-3">
        <NavLink
          to="/credits"
          className={cn(
            "desk-pill w-full justify-between no-underline",
            low && "text-red"
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <Zap
              className={cn("h-3.5 w-3.5", low ? "text-red" : "text-accent")}
              aria-hidden="true"
            />
            {/* Keyed on the value so a spend or a recharge replays m-attention —
                the balance changing is something the user is accountable for. */}
            <span key={credits.balance} className="desk-data m-attention inline-block text-[13px]">
              {credits.balance}
            </span>
            <span className="desk-data text-[13px] font-normal text-ink-muted-2">
              /{credits.cap}
            </span>
          </span>
          <span className="desk-data text-[12px] font-normal text-ink-muted-2">
            {credits.msUntilRecharge === null
              ? "full"
              : `+${formatCountdown(credits.msUntilRecharge)}`}
          </span>
        </NavLink>

        {auth.isLoggedIn ? (
          <div className="flex flex-col gap-1.5">
            <NavLink
              to="/profile"
              title={auth.email ?? undefined}
              className="truncate px-1 font-sans text-[13px] text-ink-muted no-underline transition-colors hover:text-ink"
            >
              {auth.email}
            </NavLink>
            <Button variant="ghost" size="sm" onClick={auth.logout}>
              log out
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={auth.openLoginModal}>
            login
          </Button>
        )}
      </div>
    </aside>
  );
}

function RailLink({
  to,
  label,
  icon: Icon,
  children,
}: {
  to: string;
  label: string;
  icon: typeof Layers;
  children?: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          // Ledger marked the active route with a left border-rule, which is how you
          // annotate a table. Desk fills the row instead — the current tool is a place you
          // are standing in, so it gets a lit surface rather than a margin mark.
          "flex items-center gap-2.5 rounded px-3 py-2 font-sans text-[14px] font-medium no-underline transition-colors",
          isActive
            ? "bg-raised text-accent"
            : "text-ink-muted hover:bg-[color-mix(in_srgb,var(--raised)_55%,transparent)] hover:text-ink"
        )
      }
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {label}
      {children}
    </NavLink>
  );
}
