import * as React from "react";
import { stockFor } from "@/lib/stock";
import {
  CandidateNav,
  LoraPicker,
  ModelPicker,
  PalettePicker,
  ProductTerms,
  ToolDeck,
  useIdeaSelection,
  type IdeaTheme,
} from "./shared";

/**
 * THESIS: Bill expands into a season program rather than a single poster. The page lets
 * the visitor browse the company, the production process, and the five performances
 * without giving up the printed hierarchy. It refuses a sparse fashion-editorial bill
 * that withholds the product's actual controls.
 *
 * OWN-WORLD: saturated programme stock, serif headlines, humanist body, fine rules, a
 * contact-sheet cast page. STORY: enter through this season's lead, leaf through base
 * models and cast, choose a production. FIRST VIEWPORT: programme note left, cast plates
 * right. FORM: repertory programme, Bill lineage.
 */

const THEMES: IdeaTheme[] = [
  {
    id: "juniper",
    name: "Juniper",
    note: "Deep green programme stock with warm brass ink.",
    swatch: ["#14251f", "#254138", "#efb55f"],
    style: {
      "--bg": "#14251f",
      "--panel": "#1b3029",
      "--panel-2": "#0e1c17",
      "--raised": "#254138",
      "--border": "#355b4e",
      "--border-2": "#56816f",
      "--text": "#fff8e8",
      "--muted": "#d9d4bd",
      "--muted-2": "#b7b39e",
      "--accent": "#efb55f",
      "--on-accent": "#261701",
    },
  },
  {
    id: "bordeaux",
    name: "Bordeaux",
    note: "Wine programme stock with pale blue billing.",
    swatch: ["#32131f", "#572438", "#9ed9e8"],
    style: {
      "--bg": "#32131f",
      "--panel": "#431a2a",
      "--panel-2": "#240d16",
      "--raised": "#572438",
      "--border": "#74364b",
      "--border-2": "#95566a",
      "--text": "#fff7ec",
      "--muted": "#e2cdd0",
      "--muted-2": "#bea4aa",
      "--accent": "#9ed9e8",
      "--on-accent": "#082128",
    },
  },
  {
    id: "indigo",
    name: "Indigo",
    note: "Inky blue programme stock with coral type.",
    swatch: ["#101e3a", "#203963", "#ff997d"],
    style: {
      "--bg": "#101e3a",
      "--panel": "#172a4f",
      "--panel-2": "#0a1429",
      "--raised": "#203963",
      "--border": "#31517f",
      "--border-2": "#5271a0",
      "--text": "#fff8e9",
      "--muted": "#d6d2ca",
      "--muted-2": "#acaab0",
      "--accent": "#ff997d",
      "--on-accent": "#2b1008",
    },
  },
];

export function IdeaProgram() {
  const [themeId, setThemeId] = React.useState(THEMES[0].id);
  const { checkpoint, activeLora, loras } = useIdeaSelection();
  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0];
  const cast = [activeLora, ...loras.filter((item) => item.id !== activeLora.id)].slice(
    0,
    4
  );

  return (
    <div className="min-h-[100dvh]" style={theme.style}>
      <CandidateNav action="Open the programme" />
      <div className="idea-program-mast">
        <PalettePicker
          themes={THEMES}
          active={themeId}
          onChange={setThemeId}
          label="Cover"
        />
      </div>

      <main>
        <section className="idea-program-hero">
          <div className="idea-program-copy idea-rise">
            <div>
              <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-accent">
                The current company · {checkpoint.name}
              </p>
              <h1 className="mt-7">A whole season from one cast.</h1>
              <p>
                Load {activeLora.name} once. Keep the same visual identity through
                five productions, from a single image to a continuing story.
              </p>
            </div>
            <p className="mt-12 text-[13px] font-bold text-ink-muted-2">
              Free entry · {checkpoint.costPerImage} credits for a standard image
            </p>
          </div>

          <div className="idea-program-cast idea-rise-2" aria-label="Current cast">
            {cast.map((item) => {
              const preview = stockFor(`${item.id}-program`, "portrait");
              return (
                <img
                  key={item.id}
                  src={preview.src(640)}
                  srcSet={preview.srcSet}
                  alt=""
                  loading="eager"
                  decoding="async"
                />
              );
            })}
          </div>
        </section>

        <LoraPicker
          className="idea-program-section"
          heading="The company"
          intro="Tap a performer to recast this programme and every linked tool."
        />
        <ModelPicker
          className="idea-program-section"
          heading="The production house"
        />
        <ToolDeck
          className="idea-program-section"
          heading="This season's five productions"
        />
      </main>

      <ProductTerms />
    </div>
  );
}
