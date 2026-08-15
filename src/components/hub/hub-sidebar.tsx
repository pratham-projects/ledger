import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Dices,
  Film,
  FolderOpen,
  Home,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  PanelLeft,
  Swords,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TOOLS as TOOL_FACTS } from "@/routes/home-ideas/facts";

/**
 * The hub's rail.
 *
 * **Home is the first tile, ungrouped and above everything.** It is not one of the five
 * things you make, so putting it under `CREATE` mislabelled it; and a rail whose first
 * row is a group heading gives you nothing to press. It sits alone, then the groups
 * follow: `CREATE` is the five tools, `LIBRARY` is your own output and your balance,
 * `DISCOVER` is other people's.
 *
 * Collapsing is remembered in `localStorage`. A rail that resets to wide every reload is
 * a rail whose collapse control does not mean anything.
 *
 * Glyphs are Ledger's established vocabulary, not fresh picks: `Layers` has meant the
 * catalogue since `/browse` existed, `Dices` has been the wordmark, `Zap` credits, and the
 * five tool glyphs are the same ones `QuickAccess` and the old `SideRail` use. A visitor
 * who learned an icon on one surface must not have to learn it again here.
 */

const CREATE_ICONS: Record<string, typeof Layers> = {
  image: ImageIcon,
  video: Film,
  chat: MessageSquare,
  rpg: Swords,
  story: BookOpen,
};

/**
 * The five tools, carrying `facts.ts`'s own hue per tool (`--accent`/`--hot`/`--cool`/
 * `--green`/`--amber`) — the same colour-coding `.hub-suite-card` uses on `/home` itself,
 * so a tool's colour means the same thing in the rail as it does in the room the rail
 * points into.
 */
const CREATE = TOOL_FACTS.map((t) => ({
  to: t.href,
  label: t.name,
  icon: CREATE_ICONS[t.id] ?? Layers,
  hue: t.hue,
}));

const LIBRARY = [
  { to: "/profile", label: "My work", icon: FolderOpen },
  { to: "/credits", label: "Credits", icon: Zap },
];

const DISCOVER = [{ to: "/home#catalog", label: "Catalogue", icon: Layers }];

const STORAGE_KEY = "hub-sidebar-collapsed";

export function useHubSidebar() {
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  });
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  return { collapsed, setCollapsed, open, setOpen };
}

export function HubSidebar({
  collapsed,
  onToggleCollapsed,
  open,
  onClose,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <div className="hub-sidebar-scrim lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className="hub-sidebar"
        data-collapsed={collapsed}
        data-open={open}
        aria-label="Sections"
      >
        <div
          className={cn(
            "flex items-center gap-2 border-b border-border px-4 py-[15px]",
            collapsed && "justify-center px-2"
          )}
        >
          {!collapsed && (
            <NavLink
              to="/"
              className="desk-display flex flex-1 items-center gap-2 truncate text-[18px] text-ink no-underline"
            >
              <Dices className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              Ledger
            </NavLink>
          )}
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="hidden rounded p-1.5 text-ink-muted-2 transition-colors hover:bg-raised hover:text-ink lg:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-ink-muted-2 transition-colors hover:bg-raised hover:text-ink lg:hidden"
            aria-label="Close sidebar"
          >
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="hub-sidebar-scroll ledger-scrollbar">
          {/* Ungrouped, first, and `end` so it lights up on `/home` itself rather
              than staying lit for every `/home#…` the rail links to. */}
          <NavLink
            to="/home"
            end
            onClick={onClose}
            className={({ isActive }) => cn("hub-nav-item", isActive && "is-active")}
          >
            <Home className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            Home
          </NavLink>

          {collapsed ? (
            <Group label="Create" items={CREATE} onNavigate={onClose} />
          ) : (
            <CreateGrid items={CREATE} onNavigate={onClose} />
          )}
          <Group label="Library" items={LIBRARY} onNavigate={onClose} />
          <Group label="Discover" items={DISCOVER} onNavigate={onClose} />
        </nav>
      </aside>
    </>
  );
}

/**
 * CREATE's own grammar: a two-column grid of icon tiles rather than a stacked list — the
 * one group dense enough, and used often enough, to earn the extra visual weight. Each
 * tile's icon sits in a chip tinted with that tool's own hue (`facts.ts`), so the group
 * reads as five colours before it reads as five words. Collapses to the shared single-
 * column `Group` at `data-collapsed`, where a 2-up grid has no room to exist.
 */
function CreateGrid({
  items,
  onNavigate,
}: {
  items: { to: string; label: string; icon: typeof Layers; hue: string }[];
  onNavigate: () => void;
}) {
  return (
    <>
      <p className="desk-pill-label hub-group-label">Create</p>
      <div className="hub-create-grid">
        {items.map(({ to, label, icon: Icon, hue }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => cn("hub-create-tile", isActive && "is-active")}
            style={{ ["--hue" as string]: hue }}
          >
            <span className="hub-create-tile-icon">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            {label}
          </NavLink>
        ))}
      </div>
    </>
  );
}

function Group({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: { to: string; label: string; icon: typeof Layers }[];
  onNavigate: () => void;
}) {
  return (
    <>
      <p className="desk-pill-label hub-group-label">{label}</p>
      {items.map(({ to, label: itemLabel, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          // NavLink can only hand `isActive` to `className`, not to an attribute, so the
          // active state travels as a class and the stylesheet keys off that.
          className={({ isActive }) => cn("hub-nav-item", isActive && "is-active")}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {itemLabel}
        </NavLink>
      ))}
    </>
  );
}
