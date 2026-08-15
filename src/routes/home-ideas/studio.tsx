import * as React from "react";
import { Link } from "react-router-dom";
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
 * THESIS: Desk becomes a quiet creative studio: the selected subject already fills the
 * wall while the prompt remains the only foreground object. It refuses both a blank
 * prompt-first hero and a gallery that cannot be acted on.
 *
 * OWN-WORLD: deep upholstered colour, soft working panels, broad editorial scale, 16px
 * radii, one lime signal. STORY: see the cast, write beside it, then choose the tools
 * and ingredients below. FIRST VIEWPORT: image wall left, writing room right.
 * FORM: night studio, Desk lineage.
 */

const THEMES: IdeaTheme[] = [
  {
    id: "aubergine",
    name: "Aubergine",
    note: "Plum upholstery and electric chartreuse.",
    swatch: ["#17151c", "#302a38", "#b9f36b"],
    style: {
      "--bg": "#17151c",
      "--panel": "#25212b",
      "--panel-2": "#111016",
      "--raised": "#302a38",
      "--border": "#393240",
      "--border-2": "#554b5e",
      "--text": "#fff9f2",
      "--muted": "#d8cbd6",
      "--muted-2": "#ad9ca9",
      "--accent": "#b9f36b",
      "--on-accent": "#172006",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    note: "Deep blue room with a warm apricot action.",
    swatch: ["#0e1828", "#1d304c", "#ffad7a"],
    style: {
      "--bg": "#0e1828",
      "--panel": "#17263d",
      "--panel-2": "#09111d",
      "--raised": "#1d304c",
      "--border": "#2c4568",
      "--border-2": "#476890",
      "--text": "#f8fbff",
      "--muted": "#c8d6e7",
      "--muted-2": "#9eb3cc",
      "--accent": "#ffad7a",
      "--on-accent": "#2b1305",
    },
  },
  {
    id: "oxide",
    name: "Oxide",
    note: "Warm iron-brown with a powder-blue marker.",
    swatch: ["#211513", "#3b2924", "#91d7e8"],
    style: {
      "--bg": "#211513",
      "--panel": "#30201d",
      "--panel-2": "#160e0d",
      "--raised": "#3b2924",
      "--border": "#543a33",
      "--border-2": "#755247",
      "--text": "#fff8f1",
      "--muted": "#dfccc2",
      "--muted-2": "#bca296",
      "--accent": "#91d7e8",
      "--on-accent": "#072027",
    },
  },
];

export function IdeaStudio() {
  const [themeId, setThemeId] = React.useState(THEMES[0].id);
  const [prompt, setPrompt] = React.useState(
    "cinematic rain, green courier jacket, the city glowing below"
  );
  const { checkpoint, activeLora } = useIdeaSelection();
  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0];
  const frame = stockFor(`${activeLora.id}-studio`, "portrait");

  return (
    <div className="min-h-[100dvh]" style={theme.style}>
      <CandidateNav action="Choose a model" />

      <main>
        <section className="idea-studio-hero">
          <div className="idea-studio-media idea-rise">
            <img
              src={frame.src(1280)}
              srcSet={frame.srcSet}
              alt={`${activeLora.name}, placeholder preview`}
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="idea-studio-panel idea-rise-2">
            <h1>Make a world around one face.</h1>
            <p>
              {activeLora.name} is loaded on {checkpoint.name}. Write once here;
              carry the same cast and look into all five tools.
            </p>
            <div className="idea-studio-composer">
              <textarea
                aria-label="Describe what you want to make"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
              <div className="flex flex-wrap items-center gap-3 px-2 pb-2">
                <span className="text-[12px] font-bold text-ink-muted">
                  {checkpoint.costPerImage} credits
                </span>
                <Link
                  to="/image"
                  className="ml-auto rounded-[12px] bg-accent px-5 py-3 text-[13px] font-black text-[var(--on-accent)]"
                >
                  Make the first frame →
                </Link>
              </div>
            </div>
            <div className="mt-7">
              <PalettePicker
                themes={THEMES}
                active={themeId}
                onChange={setThemeId}
                label="Room"
              />
            </div>
          </div>
        </section>

        <LoraPicker
          className="idea-studio-section"
          heading="Cast the recurring subject"
        />
        <ModelPicker
          className="idea-studio-section"
          heading="Choose the rendering room"
        />
        <ToolDeck
          className="idea-studio-section"
          heading="Take the setup into five rooms"
        />
      </main>

      <ProductTerms />
    </div>
  );
}
