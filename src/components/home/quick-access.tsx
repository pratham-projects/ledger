import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Film,
  Image as ImageIcon,
  MessageSquare,
  Swords,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Five doors, always in the same order, always in reach.
 *
 * The five tools appear three times on this page — here, on the demonstrations, and in
 * the side rail — and the order never changes between them. That repetition is the
 * point: a visitor who scrolls back up should find the door exactly where they last saw
 * it, and the row above the fold is what a returning user aims at without reading
 * anything.
 *
 * Ordered by how much of the product they explain, not alphabetically. Image first
 * because it is what most arrivals came for; story last because it is the one that needs
 * the most commitment.
 */

export const TOOLS: {
  to: string;
  label: string;
  icon: LucideIcon;
  /**
   * What you get, in the visitor's words. Deliberately *not* a credit price: chat does
   * not charge anything in this build, so a price row here would either lie about chat
   * or print an inconsistent set. Prices live on the demonstrations below, where each
   * one can be sourced from the constant the tool actually spends.
   */
  does: string;
}[] = [
  { to: "/image", label: "image", icon: ImageIcon, does: "make a picture" },
  { to: "/video", label: "video", icon: Film, does: "make a short clip" },
  { to: "/chat", label: "chat", icon: MessageSquare, does: "talk to a character" },
  { to: "/rpg", label: "rpg", icon: Swords, does: "play a turn" },
  { to: "/story", label: "story", icon: BookOpen, does: "write a chapter" },
];

export function QuickAccess({
  layout = "row",
  className,
}: {
  /**
   * `row` spans the content column. `column` collapses to a single stack from xl, for
   * the one place this stands *beside* the headline rather than under it — five cells
   * across a 300px gutter would be unreadable, and the stack is what stops the hero from
   * trailing off into half a screen of empty ground.
   */
  layout?: "row" | "column";
  className?: string;
}) {
  return (
    <nav aria-label="Jump into a tool" className={className}>
      {/* A one-pixel grid gap over a border-coloured ground: the cells are divided by
          rules, not by five separate boxes. No nested panels, per the system. */}
      <ul
        className={cn(
          "m-0 grid list-none grid-cols-2 gap-px border border-border bg-border p-0 sm:grid-cols-3 lg:grid-cols-5",
          layout === "column" && "xl:grid-cols-1"
        )}
      >
        {TOOLS.map(({ to, label, icon: Icon, does }) => (
          <li key={to} className="contents">
            <NavLink
              to={to}
              className={cn(
                "m-hover group flex flex-col gap-1.5 bg-panel px-4 py-3.5 no-underline transition-colors",
                "hover:bg-panel-2"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon
                  className="h-3.5 w-3.5 shrink-0 text-ink-muted-2 transition-colors group-hover:text-accent"
                  aria-hidden="true"
                />
                <span className="font-mono text-[12px] font-semibold text-ink">{label}</span>
              </span>
              <span className="font-sans text-[11.5px] text-ink-muted-2">{does}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
