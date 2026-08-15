import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * One `<title>` per surface.
 *
 * An SPA keeps whatever title `index.html` shipped with unless something changes it, so
 * every route in this app read "Ledger" — which makes browser history, a pinned tab,
 * and a shared link indistinguishable from each other. The map is keyed by pathname
 * because these are a fixed, small set of surfaces; a dynamic route falls through to its
 * prefix, and anything unmatched keeps the site title rather than inventing one.
 *
 * Descriptions live in `index.html` and are deliberately *not* rewritten here: a crawler
 * reads the served HTML, not the DOM this hook mutates, so a per-route description would
 * be visible to nobody and would only imply a promise the build cannot keep. Real
 * per-route metadata needs prerendering or SSR — flagged, not faked.
 */
const SITE = "Ledger";

const TITLES: Record<string, string> = {
  "/": "Ledger — one line in, a picture out",
  "/home": "Home",
  "/image": "Image",
  "/video": "Video",
  "/chat": "Chat",
  "/rpg": "RPG",
  "/story": "Story",
  "/credits": "Credits",
  "/profile": "My work",
  "/editor": "Editor",
};

const PREFIXES: [string, string][] = [
  ["/home/inspirations/", "Inspirations"],
  ["/home-ideas", "Design review"],
];

export function useDocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const exact = TITLES[pathname];
    if (exact) {
      document.title = pathname === "/" ? exact : `${exact} — ${SITE}`;
      return;
    }
    const prefix = PREFIXES.find(([p]) => pathname.startsWith(p));
    document.title = prefix ? `${prefix[1]} — ${SITE}` : TITLES["/"];
  }, [pathname]);
}
