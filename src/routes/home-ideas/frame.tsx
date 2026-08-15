import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { IDEAS } from "./facts";

/**
 * The comparison chrome, and the one thing on these routes that is deliberately *not*
 * designed.
 *
 * It has to sit on top of six different visual worlds without belonging to any of them,
 * so it takes no token from the world underneath: fixed values, its own neutral dark, and
 * a hard top edge. If this bar were skinned per world it would stop being a control panel
 * and start being part of whichever page you happened to be looking at, which is exactly
 * the confusion the comparison is meant to remove.
 *
 * It is chrome for review only. None of it ships with whichever world is chosen.
 */

export function IdeaFrame({
  klass,
  children,
}: {
  klass: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <IdeaWorld klass={klass}>{children}</IdeaWorld>
      <SwitcherBar />
    </>
  );
}

/**
 * The scope alone, with no review chrome on top — what a chosen world ships with.
 * `IdeaFrame` is this plus `SwitcherBar`; production routes (`/` mounts Desk) use this
 * directly, since the switcher is comparison-only tooling that never ships.
 */
export function IdeaWorld({
  klass,
  children,
}: {
  klass: string;
  children: React.ReactNode;
}) {
  // `idea` supplies the ground and the shared motion roles; `klass` supplies the entire
  // token set, so nothing inside needs to know which world it is in.
  return <div className={`idea ${klass}`}>{children}</div>;
}

function SwitcherBar() {
  const { pathname } = useLocation();
  const active = IDEAS.find((i) => pathname.endsWith(i.slug));

  return (
    <div
      className="relative z-50 h-14 border-t border-[#2e2e35] bg-[#101014] sm:h-11"
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-1 px-2 sm:gap-2 sm:px-4">
        <Link
          to="/home-ideas"
          className="hidden h-11 shrink-0 items-center gap-2 px-2 py-1 text-[12px] font-semibold text-[#8b8f9a] transition-colors hover:text-white sm:flex"
        >
          ← All six
        </Link>

        <div
          className="idea-switcher-tabs flex min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:gap-1.5"
          role="tablist"
          aria-label="Landing page directions"
        >
          {IDEAS.map((idea) => {
            const on = active?.slug === idea.slug;
            return (
              <Link
                key={idea.slug}
                to={`/home-ideas/${idea.slug}`}
                role="tab"
                aria-selected={on}
                className={[
                  "flex h-11 shrink-0 items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold transition-colors sm:px-3",
                  on ? "bg-white text-[#101014]" : "text-[#b4b8c2] hover:bg-[#22222a] hover:text-white",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: idea.swatch[2] }}
                />
                <span className="tabular-nums opacity-60">{idea.n}</span>
                {idea.title}
              </Link>
            );
          })}
        </div>

        <Link
          to="/"
          className="hidden h-11 shrink-0 items-center px-2 py-1 text-[12px] font-semibold text-[#8b8f9a] transition-colors hover:text-white md:flex"
        >
          Current page
        </Link>
      </div>
    </div>
  );
}

/**
 * The disclosure line every world carries, in that world's own voice.
 *
 * Honest copy is a product principle here (DESIGN.md rule 6), not a footnote: none of the
 * imagery on these pages is model output and none of the catalogue is real, so each page
 * says so in a place a visitor will actually read rather than in a legal strip.
 */
export function Disclosure({
  className = "",
  tone = "muted-2",
}: {
  className?: string;
  tone?: "muted" | "muted-2";
}) {
  return (
    <p
      className={`text-[12.5px] leading-relaxed ${
        tone === "muted" ? "text-ink-muted" : "text-ink-muted-2"
      } ${className}`}
    >
      Browse the current media collection and model catalogue.
    </p>
  );
}
