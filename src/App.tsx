import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { PageShell } from "@/components/layout/page-shell";
import { HubShell } from "@/components/hub/hub-shell";
import { CreditsProvider } from "@/hooks/use-credits";
import { AuthProvider } from "@/hooks/use-auth";
import { SelectionProvider } from "@/hooks/use-selection";
import { AuthModal } from "@/components/auth/auth-modal";
import { HomeHub } from "@/routes/home-hub";
import { InspirationCategory } from "@/routes/inspiration-category";
import { LeanLanding } from "@/components/home/landing-lean";
import { ImageGenerator } from "@/routes/image";
import { VideoGenerator } from "@/routes/video";
import { Chat } from "@/routes/chat";
import { Rpg } from "@/routes/rpg";
import { Story } from "@/routes/story";
import { Credits } from "@/routes/credits";
import { Profile } from "@/routes/profile";
import { Editor } from "@/routes/editor";
import { IdeaWorld } from "@/routes/home-ideas/frame";
import { DemoBadge } from "@/components/demo/demo-badge";

/**
 * The six candidate landing worlds, the token studio and the navigation studies, behind a
 * flag Vite resolves at build time.
 *
 * `import.meta.env.DEV` is substituted literally, so in a production build the branch
 * below folds to `false`, the `import()` becomes unreachable, and Rollup never emits the
 * chunk — the shipped bundle contains none of it. In dev the routes behave exactly as
 * before. See `routes/home-ideas/review-routes.tsx` for why they are kept rather than
 * deleted.
 */
const ReviewRoutes = import.meta.env.DEV
  ? lazy(() => import("@/routes/home-ideas/review-routes"))
  : null;

/** Every route lands at its top. React Router does not do this on its own — the browser
 *  keeps whatever scroll position the previous page ended on, which reads as broken
 *  navigation the first time a link lands you mid-page. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Sibling of `ScrollToTop`, and mounted for the same reason: both are things the browser
 *  does for free on a document navigation and neither happens in an SPA. */
function DocumentTitle() {
  useDocumentTitle();
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <CreditsProvider>
        <SelectionProvider>
          <BrowserRouter>
            <ScrollToTop />
            <DocumentTitle />
            <PageShell>
              <Routes>
                {/* Two landing surfaces, deliberately distinct. `/` is Desk — the page
                    that argues: one line in, a picture out, then the evidence. `/home` is
                    the hub — the room you stand in once you are convinced. Desk graduated
                    out of the six-way `/home-ideas` comparison (see the "no longer one of
                    six candidates... it is the selection" note on `.desk` in
                    home-ideas.css); `IdeaWorld` gives it that token scope without the
                    review-only switcher bar. */}
                <Route
                  path="/"
                  element={
                    // `IdeaWorld klass="desk"` supplies the token scope only — Desk's own
                    // full landing (`IdeaDesk`) stays at `/home-ideas/desk` as the reviewed
                    // candidate. `/` itself is `LeanLanding`: results, options, and exactly
                    // one navigation, into `/home`. No `HubShell` here — `LeanLanding`
                    // carries its own single topbar, and `HubShell`'s always mounts its own
                    // (credits, login) even with `sidebar={false}`, which stacked as a
                    // second bar over this page's one wordmark + "Enter" bar.
                    <IdeaWorld klass="desk">
                      <LeanLanding />
                    </IdeaWorld>
                  }
                />
                <Route path="/home" element={<HomeHub />} />
                <Route
                  path="/home/inspirations/:categoryId"
                  element={<InspirationCategory />}
                />
                {/* `/browse` is gone, not redirected. The catalogue is a band of the hub
                    at `/home#catalog`, and every link in the app points there directly —
                    a redirect would have been a second name for a page that no longer
                    exists. */}
                <Route
                  path="/image"
                  element={
                    <HubShell label="Image">
                      <ImageGenerator />
                    </HubShell>
                  }
                />
                <Route
                  path="/video"
                  element={
                    <HubShell label="Video">
                      <VideoGenerator />
                    </HubShell>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <HubShell label="Chat">
                      <Chat />
                    </HubShell>
                  }
                />
                <Route
                  path="/rpg"
                  element={
                    <HubShell label="RPG">
                      <Rpg />
                    </HubShell>
                  }
                />
                <Route
                  path="/story"
                  element={
                    <HubShell label="Story">
                      <Story />
                    </HubShell>
                  }
                />
                <Route
                  path="/credits"
                  element={
                    <HubShell label="Credits">
                      <Credits />
                    </HubShell>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <HubShell label="Profile">
                      <Profile />
                    </HubShell>
                  }
                />
                <Route
                  path="/editor"
                  element={
                    <HubShell label="Editor">
                      <Editor />
                    </HubShell>
                  }
                />
                {ReviewRoutes && (
                  <Route
                    path="/home-ideas/*"
                    element={
                      <Suspense fallback={null}>
                        <ReviewRoutes />
                      </Suspense>
                    }
                  />
                )}
              </Routes>
            </PageShell>
            <AuthModal />
            <DemoBadge />
          </BrowserRouter>
        </SelectionProvider>
      </CreditsProvider>
    </AuthProvider>
  );
}
