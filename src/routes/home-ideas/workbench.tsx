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
 * THESIS: the prompt desk deepened into a working bench: material on the left, the
 * active job on the right, and the model/LoRA rack within arm's reach. It refuses a
 * decorative hero whose controls vanish once the visitor starts working.
 *
 * OWN-WORLD: powder-coated equipment, bench grid, condensed job lettering, exposed
 * status labels, 8px working radii. STORY: load a model, load a cast member, write the
 * job, send that same setup into any tool. FIRST VIEWPORT: proposition and palette at
 * left, live job console at right. FORM: production workbench, Desk lineage.
 */

const THEMES: IdeaTheme[] = [
  {
    id: "graphite",
    name: "Graphite",
    note: "Charcoal equipment with amber task lighting.",
    swatch: ["#111418", "#242b33", "#f3b43f"],
    style: {
      "--bg": "#111418",
      "--panel": "#1a1f25",
      "--panel-2": "#0d1013",
      "--raised": "#242b33",
      "--border": "#303841",
      "--border-2": "#495563",
      "--text": "#f4f7f8",
      "--muted": "#c1cad0",
      "--muted-2": "#96a4ad",
      "--accent": "#f3b43f",
      "--on-accent": "#191105",
    },
  },
  {
    id: "cobalt",
    name: "Cobalt",
    note: "Blue machine enamel with safety orange controls.",
    swatch: ["#0c1b2c", "#173657", "#ff8a47"],
    style: {
      "--bg": "#0c1b2c",
      "--panel": "#112842",
      "--panel-2": "#081523",
      "--raised": "#173657",
      "--border": "#285077",
      "--border-2": "#3e6d9a",
      "--text": "#f3f8ff",
      "--muted": "#c2d5e8",
      "--muted-2": "#94b2ce",
      "--accent": "#ff8a47",
      "--on-accent": "#271004",
    },
  },
  {
    id: "moss",
    name: "Moss",
    note: "Workshop green with a sharp lime indicator.",
    swatch: ["#101c18", "#233c32", "#c9e75d"],
    style: {
      "--bg": "#101c18",
      "--panel": "#182a23",
      "--panel-2": "#0b1512",
      "--raised": "#233c32",
      "--border": "#345447",
      "--border-2": "#507464",
      "--text": "#f4f8ef",
      "--muted": "#cad6c8",
      "--muted-2": "#9fb4a6",
      "--accent": "#c9e75d",
      "--on-accent": "#172000",
    },
  },
];

export function IdeaWorkbench() {
  const [themeId, setThemeId] = React.useState(THEMES[0].id);
  const [prompt, setPrompt] = React.useState(
    "a rooftop courier crossing a rain-lit market at midnight"
  );
  const { checkpoint, activeLora } = useIdeaSelection();
  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0];
  const portrait = stockFor(activeLora.id, "portrait");

  return (
    <div className="idea-workbench-board min-h-[100dvh]" style={theme.style}>
      <CandidateNav action="Open the rack" />

      <main>
        <section className="idea-workbench-hero">
          <div className="idea-workbench-copy idea-rise">
            <h1>Build the setup once.</h1>
            <p>
              Pick the rendering engine and the subject, then keep both loaded while
              you move between pictures, clips, conversations, games, and stories.
            </p>
            <div className="mt-8">
              <PalettePicker themes={THEMES} active={themeId} onChange={setThemeId} />
            </div>
          </div>

          <div className="idea-workbench-console idea-rise-2">
            <div className="flex items-center gap-3 border-b border-border-2 pb-4">
              <img
                src={portrait.src(128)}
                alt=""
                className="h-14 w-14 rounded-[6px] object-cover object-top"
              />
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-ink-muted-2">ACTIVE JOB</p>
                <p className="mt-1 truncate text-[15px] font-extrabold">
                  {checkpoint.name} + {activeLora.name}
                </p>
              </div>
              <span className="ml-auto bg-accent px-2 py-1 text-[11px] font-black text-[var(--on-accent)]">
                READY
              </span>
            </div>

            <label
              htmlFor="workbench-prompt"
              className="mt-7 text-[13px] font-extrabold text-ink"
            >
              Describe the next job
            </label>
            <textarea
              id="workbench-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="mt-3"
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-[12px] font-bold text-ink-muted">
                Image · {checkpoint.costPerImage} credits
              </span>
              <Link
                to="/image"
                className="ml-auto rounded-[6px] bg-accent px-5 py-3 text-[13px] font-black text-[var(--on-accent)]"
              >
                Run job →
              </Link>
            </div>
          </div>
        </section>

        <ModelPicker className="idea-workbench-section" />
        <LoraPicker className="idea-workbench-section" />
        <ToolDeck className="idea-workbench-section" />
      </main>

      <ProductTerms />
    </div>
  );
}
