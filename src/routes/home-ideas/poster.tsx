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
 * THESIS: Bill leaves the theatre and becomes a screenprinted street poster. The loaded
 * LoRA is a headline big enough to own the block; every tool is another date on the tour.
 * It refuses polite centred luxury and a photo-led AI category hero.
 *
 * OWN-WORLD: two-colour ink, blunt gothic type, torn-scale composition, hard rules, no
 * radius. STORY: meet the headliner, choose the print stock (model), choose the cast,
 * then pick a date/tool. FIRST VIEWPORT: name and portrait collide. FORM: gig poster,
 * Bill lineage.
 */

const THEMES: IdeaTheme[] = [
  {
    id: "raspberry",
    name: "Raspberry",
    note: "Raspberry ink with a loud yellow overprint.",
    swatch: ["#441226", "#681d3a", "#ffe45e"],
    style: {
      "--bg": "#441226",
      "--panel": "#571831",
      "--panel-2": "#320c1b",
      "--raised": "#681d3a",
      "--border": "#8a3150",
      "--border-2": "#b34869",
      "--text": "#fff8e8",
      "--muted": "#f1cfd2",
      "--muted-2": "#dba7ad",
      "--accent": "#ffe45e",
      "--on-accent": "#291c00",
    },
  },
  {
    id: "ultraviolet",
    name: "Ultraviolet",
    note: "Purple ink with an acid-green overprint.",
    swatch: ["#241053", "#44248a", "#bfff54"],
    style: {
      "--bg": "#241053",
      "--panel": "#32186c",
      "--panel-2": "#190a3b",
      "--raised": "#44248a",
      "--border": "#633eb0",
      "--border-2": "#8564cc",
      "--text": "#fffaff",
      "--muted": "#ddcff2",
      "--muted-2": "#bba8dc",
      "--accent": "#bfff54",
      "--on-accent": "#162300",
    },
  },
  {
    id: "ice",
    name: "Ice",
    note: "Prussian blue with safety-orange ink.",
    swatch: ["#092b43", "#124b70", "#ff784f"],
    style: {
      "--bg": "#092b43",
      "--panel": "#0e3a58",
      "--panel-2": "#061e30",
      "--raised": "#124b70",
      "--border": "#1e658f",
      "--border-2": "#3c84aa",
      "--text": "#f6fbff",
      "--muted": "#c9ddea",
      "--muted-2": "#9ebed1",
      "--accent": "#ff784f",
      "--on-accent": "#2c0c03",
    },
  },
];

export function IdeaPoster() {
  const [themeId, setThemeId] = React.useState(THEMES[0].id);
  const { checkpoint, activeLora } = useIdeaSelection();
  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0];
  const portrait = stockFor(`${activeLora.id}-poster`, "portrait");

  return (
    <div className="min-h-[100dvh]" style={theme.style}>
      <CandidateNav action="Join the cast" />

      <main>
        <section className="idea-poster-hero">
          <img
            src={portrait.src(1280)}
            srcSet={portrait.srcSet}
            alt=""
            className="idea-poster-portrait"
            loading="eager"
            decoding="async"
          />
          <div className="idea-rise">
            <p className="mb-6 text-[13px] font-black uppercase tracking-[0.12em] text-accent">
              Now loaded on {checkpoint.name}
            </p>
            <h1>{activeLora.name}</h1>
            <p className="idea-poster-manifesto">
              One character. Five forms. Pictures, motion, chat, play, and story
              keep the same cast without rebuilding the setup.
            </p>
            <div className="mt-8">
              <PalettePicker
                themes={THEMES}
                active={themeId}
                onChange={setThemeId}
                label="Ink"
              />
            </div>
          </div>
        </section>

        <ModelPicker
          className="idea-poster-section"
          heading="Pick the print stock"
          intro="The base model sets the rendering character under the loaded LoRA."
        />
        <LoraPicker
          className="idea-poster-section"
          heading="Change the headliner"
        />
        <ToolDeck
          className="idea-poster-section"
          heading="Five dates. Same headliner."
        />
      </main>

      <ProductTerms />
    </div>
  );
}
