import { Link } from "react-router-dom";
import { IDEAS, facts } from "./facts";

/**
 * The contact sheet.
 *
 * Deliberately plain — it is a review surface, not a sixth candidate. Its job is to state
 * the diagnosis the six worlds are answering, then get out of the way. If this page were
 * designed it would compete with the things it is presenting.
 */
export function HomeIdeasIndex() {
  return (
    <div className="min-h-[100dvh] bg-[#0c0c10] pb-16 text-[#e8e9ee]" style={{ fontFamily: "Archivo, system-ui, sans-serif" }}>
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
        <header className="border-b border-[#26262e] py-12">
          <p className="text-[12.5px] font-bold uppercase tracking-[0.16em] text-[#8a8d99]">
            Landing page · two directions, explored in depth
          </p>
          <h1 className="mt-3 text-[clamp(1.9rem,4.4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Six complete pages. Two visual families.
          </h1>
          <p className="mt-4 max-w-[68ch] text-[16px] leading-[1.65] text-[#b9bcc7]">
            Desk and Bill are retained. Workbench and Studio push Desk deeper; Poster
            and Program push Bill deeper. Every page includes the full model + LoRA
            spine, all five tools, product terms, and three palettes you can tap in place.
          </p>
        </header>

        <Diagnosis />

        <ol className="mt-14 space-y-px bg-[#26262e]">
          {IDEAS.map((idea) => (
            <li key={idea.slug} className="bg-[#13131a]">
              <Link
                to={`/home-ideas/${idea.slug}`}
                className="group grid gap-5 p-6 transition-colors hover:bg-[#1a1a23] sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-7 sm:p-8"
              >
                {/* The world's own three values, so the palette is legible before you
                    open it. */}
                <div className="flex h-[92px] w-[132px] shrink-0 overflow-hidden">
                  {idea.swatch.map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </div>

                <div>
                  <h2 className="flex items-baseline gap-2.5 text-[21px] font-extrabold tracking-[-0.02em]">
                    <span className="tabular-nums text-[#6f7280]">{idea.n}</span>
                    {idea.title}
                    <span
                      aria-hidden
                      className="ml-1 text-[15px] text-[#6f7280] transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </h2>
                  <p className="mt-2 max-w-[70ch] text-[15px] leading-[1.6] text-[#c6c9d3]">
                    {idea.thesis}
                  </p>
                  <p className="mt-2.5 max-w-[70ch] text-[13.5px] font-medium leading-[1.55] text-[#8a8d99]">
                    <span className="font-bold text-[#a9adb9]">Refuses:</span>{" "}
                    {idea.refuses}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <section className="mt-14 border-t border-[#26262e] pt-10">
          <p className="text-[12.5px] font-bold uppercase tracking-[0.16em] text-[#8a8d99]">
            Two more explorations, off the Desk world
          </p>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            <li>
              <Link
                to="/home-ideas/desk/studio"
                className="group block border border-[#26262e] bg-[#13131a] p-5 transition-colors hover:bg-[#1a1a23]"
              >
                <h3 className="flex items-center gap-2 text-[16px] font-bold text-[#e8e9ee]">
                  Design system studio
                  <span aria-hidden className="text-[13px] text-[#6f7280] transition-transform group-hover:translate-x-1">→</span>
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-[#9598a3]">
                  A shadcn-style live token editor for Desk — colour, type, radius, surface
                  and motion, all real primitives, with shuffle, presets and get-code.
                </p>
              </Link>
            </li>
            <li>
              <Link
                to="/home-ideas/nav-showcase"
                className="group block border border-[#26262e] bg-[#13131a] p-5 transition-colors hover:bg-[#1a1a23]"
              >
                <h3 className="flex items-center gap-2 text-[16px] font-bold text-[#e8e9ee]">
                  Navigation: showcase + hub
                  <span aria-hidden className="text-[13px] text-[#6f7280] transition-transform group-hover:translate-x-1">→</span>
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-[#9598a3]">
                  Two sketches for the rest of the app: landing sheds the picker and
                  becomes pure proof, Browse gains a launch bar and becomes the hub.
                </p>
              </Link>
            </li>
          </ol>
        </section>

        <footer className="mt-12 border-t border-[#26262e] pt-7 text-[13.5px] leading-[1.65] text-[#8a8d99]">
          <p className="max-w-[74ch]">
            Every page draws from the same authored catalogue —{" "}
            <span className="text-[#c6c9d3]">
              {facts.loraCount} LoRAs, {facts.checkpointCount} base models
            </span>{" "}
            — and none of the imagery is model output. The bar along the bottom of each
            candidate is review chrome and ships with none of them.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block font-bold text-[#c6c9d3] underline decoration-[#4a4d59] underline-offset-4 hover:decoration-[#c6c9d3]"
          >
            Compare against the page that's live now
          </Link>
        </footer>
      </div>
    </div>
  );
}

/**
 * Why the current page is hard to read, stated as measurements rather than taste.
 *
 * This is here because "make it friendlier" is unfalsifiable and these measurements are
 * not: whichever world wins has to beat these, and a reviewer can check that it did.
 */
function Diagnosis() {
  const rows: [string, string, string][] = [
    [
      "Ground and panel are indistinguishable",
      "#060608 page against a #0b0c10 panel — 1.04:1",
      "At 1.04:1 the panel edge is not visible at all, so regions have nothing to separate them and the eye has nothing to grab. Every retained and new direction uses clearly separated ground, working surface, and raised state.",
    ],
    [
      "Labels are 11px monospace",
      "JetBrains Mono, letterspaced, at the smallest size on the page",
      "Worth being precise: the ratio here passes — tertiary ink is 6.3:1 on the ground. The failure is size and typeface, not colour. These pages set the same information at readable sizes in faces native to each family.",
    ],
    [
      "Regions are named for the codebase",
      "home.spine · home.video-ideas · story.compose · 2 cr",
      "These are addresses for whoever built it. A visitor reads them and learns nothing. Every label here names what the thing does.",
    ],
    [
      "The first screen holds no pictures",
      "the earliest image sits roughly 800px down",
      "This is an image-generation product whose opening screen shows none. The new directions either put the selected subject in the first viewport or place the live creation control there.",
    ],
    [
      "Two buttons of equal weight",
      "a small filled rectangle beside a same-size outlined one",
      "Nothing on the opening screen is at consumer scale, so there is no obvious next move. Each world has exactly one primary action.",
    ],
  ];

  return (
    <section className="mt-14">
      <h2 className="text-[19px] font-extrabold tracking-[-0.02em]">
        What all six are still fixing
      </h2>
      <p className="mt-2 max-w-[68ch] text-[15px] leading-[1.6] text-[#b9bcc7]">
        Darkness was never the problem — flatness was. The difference now is depth:
        each family keeps a recognizable thesis while changing composition, density,
        and interaction.
      </p>

      <dl className="mt-6 space-y-px bg-[#26262e]">
        {rows.map(([claim, evidence, fix]) => (
          <div key={claim} className="bg-[#13131a] p-5 sm:p-6">
            <dt className="text-[15.5px] font-bold text-[#f0f1f5]">{claim}</dt>
            <dd className="mt-1 text-[13px] font-medium text-[#f0a3a3]">{evidence}</dd>
            <dd className="mt-2 max-w-[76ch] text-[14px] leading-[1.6] text-[#b9bcc7]">
              {fix}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
