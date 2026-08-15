import * as React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Compass, FolderOpen, Home, Plus, UserRound, X } from "lucide-react";
import { TOOLS as TOOL_FACTS } from "@/routes/home-ideas/facts";
import { cn } from "@/lib/utils";

/**
 * The mobile primary navigation. Below `lg` the permanent rail (`HubSidebar`) is a drawer
 * you have to reach for — fine as a secondary "everything else" menu (still opened by the
 * topbar's hamburger), wrong as the thing a thumb reaches for forty times a session. This
 * bar is that instead: fixed to the viewport bottom, five targets, gone at `lg` and up
 * where the rail is already visible.
 *
 * The five targets are a reading of the rail's own sections, not a new information
 * architecture — `Home` is the rail's ungrouped first tile, `Inspire` is the rail's
 * `Discover` group (the Inspirations band on `/home`), `Profile` and `Assets` are the
 * rail's `Library` group split across its two destinations (`/credits` — balance and
 * tier, the account view; `/profile` — the generation grid, the media view), and `Create`
 * is the rail's `Create` group, surfaced here as a popover instead of a fifth page because
 * a route change is the wrong weight for "which of five tools do I want."
 *
 * Ledger's grammar (zero radius, bordered, mono) governs the bar exactly the way it
 * governs everything else in `HubShell` — this is still Operate chrome, not a lit-room
 * floating dock borrowed wholesale from a phone-app reference.
 */
/**
 * Named exactly as the rail names them. They used to read "Assets" and "Profile" — and
 * "Profile" pointed at `/credits`, so the one label a visitor is most confident about took
 * them to a balance sheet, while their generations lived under a word the rail never uses.
 * Two destinations should not carry three sets of names between two navigations.
 */
const RIGHT_ITEMS = [
  { to: "/profile", label: "My work", icon: FolderOpen, end: false },
  { to: "/credits", label: "Credits", icon: UserRound, end: false },
] as const;

export function BottomNav() {
  const [createOpen, setCreateOpen] = React.useState(false);
  /** `Home` and `Inspire` share `/home` as a pathname and only differ by hash — see the
   *  `inspireOnly` note in `home-hub.tsx` — so `NavLink`'s own pathname-only matching
   *  can't tell them apart. Read the hash here instead of leaning on it. */
  const { pathname, hash } = useLocation();
  const onHome = pathname === "/home";
  const inspireActive = onHome && hash.startsWith("#insp");
  const homeActive = onHome && !inspireActive;

  return (
    <>
      {createOpen && <CreateFan onClose={() => setCreateOpen(false)} />}

      <nav className="hub-bottom-nav lg:hidden" aria-label="Primary">
        <Link to="/home" className={cn("hub-bottom-nav-item", homeActive && "is-active")}>
          <Home className="h-[19px] w-[19px]" aria-hidden="true" />
          Home
        </Link>
        <Link
          to="/home#insp"
          className={cn("hub-bottom-nav-item", inspireActive && "is-active")}
        >
          <Compass className="h-[19px] w-[19px]" aria-hidden="true" />
          Inspire
        </Link>

        <button
          type="button"
          className="hub-bottom-nav-create"
          aria-expanded={createOpen}
          aria-haspopup="true"
          onClick={() => setCreateOpen((v) => !v)}
        >
          <span className="hub-bottom-nav-create-icon">
            {createOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
          </span>
          Create
        </button>

        {RIGHT_ITEMS.map((item) => (
          <BottomNavLink key={item.to} {...item} />
        ))}
      </nav>
    </>
  );
}

function BottomNavLink({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn("hub-bottom-nav-item", isActive && to.indexOf("#") === -1 && "is-active")
      }
    >
      <Icon className="h-[19px] w-[19px]" aria-hidden="true" />
      {label}
    </NavLink>
  );
}

/**
 * The five tools, fanned out above the Create tab rather than pushed to a sixth page.
 * Squares, not bubbles — an arc reveal is a reference to the *gesture*, not a licence to
 * borrow the glassy circular-icon look that comes with it elsewhere; every tile here is
 * still a bordered, zero-radius `hub-create-tile` wearing the tool's own hue, the same
 * object the rail's Create grid already uses.
 */
function CreateFan({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const n = TOOL_FACTS.length;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="hub-create-fan-scrim lg:hidden" onClick={onClose} aria-hidden="true">
      <div
        className="hub-create-fan"
        role="menu"
        aria-label="Create"
        onClick={(e) => e.stopPropagation()}
      >
        {TOOL_FACTS.map((tool, i) => (
          <button
            key={tool.id}
            type="button"
            role="menuitem"
            className="hub-create-fan-tile"
            style={{ "--i": i, "--n": n, "--hue": tool.hue } as React.CSSProperties}
            onClick={() => {
              onClose();
              navigate(tool.href);
            }}
          >
            <span className="hub-create-fan-label">{tool.name}</span>
            <span className="hub-create-fan-blurb">{tool.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
