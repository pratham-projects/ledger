import { Routes, Route } from "react-router-dom";
import "@/styles/review-fonts.css";
import { HomeIdeasIndex } from "@/routes/home-ideas";
import { IdeaFrame } from "@/routes/home-ideas/frame";
import { IDEAS } from "@/routes/home-ideas/facts";
import { IdeaDesk } from "@/routes/home-ideas/desk";
import { IdeaWorkbench } from "@/routes/home-ideas/workbench";
import { IdeaStudio } from "@/routes/home-ideas/studio";
import { IdeaBill } from "@/routes/home-ideas/bill";
import { IdeaPoster } from "@/routes/home-ideas/poster";
import { IdeaProgram } from "@/routes/home-ideas/program";
import { DeskStudio } from "@/routes/home-ideas/desk-studio";
import { NavShowcase } from "@/routes/home-ideas/nav-showcase";
import { NavHub } from "@/routes/home-ideas/nav-hub";

/**
 * Every `/home-ideas/*` route, in one module that ships nowhere.
 *
 * These are the six candidate landing worlds Desk won against, plus the token studio and
 * two navigation studies. They exist to be compared, and the comparison is finished — but
 * deleting them would throw away the evidence for why `/` looks the way it does, which
 * `DESIGN.md` still cites. So they stay in the repo and leave the product: `App.tsx`
 * reaches this module through a `React.lazy` inside an `import.meta.env.DEV` branch, and
 * Vite substitutes that flag literally, so a production build drops the branch, drops the
 * `import()`, and never emits the chunk — with it goes five worlds' worth of components,
 * palettes and type.
 *
 * The candidate-only font faces are imported here for the same reason; see the header of
 * `styles/review-fonts.css`.
 *
 * One thing is deliberately *not* review-only: Desk's furniture. `/` is built from `Wall`,
 * `EmberField` and `TOOL_SETUP` out of `desk.tsx`, so that module is a production
 * dependency. Only its full-page candidate, `IdeaDesk`, is routed here.
 *
 * Paths are relative because this renders under the parent's `/home-ideas/*` splat.
 */
const IDEA_VIEWS: Record<string, () => JSX.Element> = {
  desk: IdeaDesk,
  workbench: IdeaWorkbench,
  studio: IdeaStudio,
  bill: IdeaBill,
  poster: IdeaPoster,
  program: IdeaProgram,
};

export default function ReviewRoutes() {
  return (
    <Routes>
      <Route index element={<HomeIdeasIndex />} />
      <Route path="desk/studio" element={<DeskStudio />} />
      <Route path="nav-showcase" element={<NavShowcase />} />
      <Route path="nav-hub" element={<NavHub />} />
      {IDEAS.map((idea) => {
        const View = IDEA_VIEWS[idea.slug];
        return (
          <Route
            key={idea.slug}
            path={idea.slug}
            element={
              <IdeaFrame klass={idea.klass}>
                <View />
              </IdeaFrame>
            }
          />
        );
      })}
    </Routes>
  );
}
