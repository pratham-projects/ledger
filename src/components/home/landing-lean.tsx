import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SpecimenBand } from "@/components/home/specimen-band";
import { Disclosure } from "@/routes/home-ideas/frame";
import { facts, TOOLS } from "@/routes/home-ideas/facts";
import { Wall, EmberField, TOOL_SETUP } from "@/routes/home-ideas/desk";
import { useIdeaSelection } from "@/routes/home-ideas/shared";

/**
 * LEAN LANDING — `/`, trimmed to three things only: **results** (what the machine makes),
 * **options** (the five things you can make it do), and **one navigation** (into `/home`,
 * the hub — never straight into a tool). Every other Desk section (Claim, Doors, Spine,
 * Proof, Steps, Terms) argued the product at length; this page is the cover, not the
 * pitch, so it argues once and points at the room where the pitch actually lives.
 *
 * Built entirely from Desk's own furniture (`Wall`, `EmberField`, the `.desk-*` classes,
 * `SpecimenBand`, `facts`/`TOOLS`) rather than a fresh visual language — the brief was to
 * use existing components, and Desk already is the one Persuade surface in the system.
 * `IdeaDesk` itself is untouched; it stays the full candidate at `/home-ideas/desk`.
 */
export function LeanLanding() {
  const { activeLora: subject } = useIdeaSelection();
  const [toolId, setToolId] = React.useState(TOOLS[0].id);
  const [prompt, setPrompt] = React.useState("");
  const setup = TOOL_SETUP[toolId];
  /** Every link on the page hands the same two things to `/home`: what was typed, and
   *  which of the five tools was selected when it was clicked — see the note on
   *  `HandOff` in `home-hub.tsx` for how the hub reads it back. */
  const handOff = { tool: toolId, prompt };

  return (
    <div className="desk-lamp relative isolate flex min-h-[100dvh] flex-col overflow-x-clip">
      <TopBar handOff={handOff} />

      <Hero
        toolId={toolId}
        onTool={setToolId}
        setup={setup}
        subjectName={subject.name}
        prompt={prompt}
        onPrompt={setPrompt}
        handOff={handOff}
      />

      <section className="desk-band relative z-10 border-t border-border px-6">
        <SpecimenBand />
      </section>

      <Options toolId={toolId} onTool={setToolId} prompt={prompt} />

      <Closing handOff={handOff} />
    </div>
  );
}

/* ── chrome — one wordmark, one destination ─────────────────────────────── */

function TopBar({ handOff }: { handOff: { tool: string; prompt: string } }) {
  const [stuck, setStuck] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="desk-topbar flex items-center gap-3 px-5 py-4 sm:px-8"
      data-stuck={stuck}
    >
      <span className="desk-display text-[20px]">{facts.wordmark}</span>
      <Link
        to="/home"
        state={handOff}
        className="desk-cta group ml-auto inline-flex items-center gap-1.5 bg-accent px-[18px] py-2.5 text-[14px] font-bold text-[var(--on-accent)] transition-transform hover:-translate-y-px"
        style={{ borderRadius: "999px" }}
      >
        Enter
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </header>
  );
}

/* ── results + options, in one hero ───────────────────────────────────────── */

function Hero({
  toolId,
  onTool,
  setup,
  subjectName,
  prompt,
  onPrompt,
  handOff,
}: {
  toolId: string;
  onTool: (id: string) => void;
  setup: (typeof TOOL_SETUP)[string];
  subjectName: string;
  prompt: string;
  onPrompt: (v: string) => void;
  handOff: { tool: string; prompt: string };
}) {
  const action = TOOLS.find((t) => t.id === toolId)?.action ?? "Continue";
  return (
    <section className="relative -mt-[68px] overflow-hidden px-5 pb-14 pt-[92px] sm:px-8 sm:pb-20 sm:pt-[112px]">
      <Wall />
      <EmberField />

      <div className="desk-inner-wide relative z-10">
        <div className="desk-pool mx-auto flex max-w-[760px] flex-col items-center text-center">
          <h1
            className="desk-display idea-rise"
            style={{ fontSize: "clamp(2.6rem, 6.6vw, 5.2rem)" }}
          >
            One line in.
            <br />
            <span key={toolId} className="desk-em desk-relabel">
              {setup.outcome}
            </span>
          </h1>
          <p className="idea-rise mt-5 max-w-[52ch] text-[16.5px] font-medium leading-[1.6] text-ink-muted sm:text-[17.5px]">
            Pick a model, load a face, then send one line into image, video, chat, RPG or
            story — {subjectName} comes along to all five.
          </p>

          <div
            className="desk-toolbar reel-scroller idea-rise-2 mt-8 max-w-full overflow-x-auto"
            role="tablist"
            aria-label="What it can make"
          >
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={t.id === toolId}
                data-active={t.id === toolId}
                onClick={() => onTool(t.id)}
                className="desk-tool shrink-0"
              >
                {t.name}
              </button>
            ))}
          </div>

          <label htmlFor="landing-prompt" className="sr-only">
            {setup.lineLabel}
          </label>
          <div
            className="idea-rise-2 mt-8 flex w-full max-w-[560px] items-center gap-2.5 border border-border-2 py-1.5 pl-4 pr-1.5"
            style={{
              borderRadius: "999px",
              background: "color-mix(in srgb, var(--panel) 96%, transparent)",
              backdropFilter: "blur(20px) saturate(130%)",
            }}
          >

            <input
              id="landing-prompt"
              value={prompt}
              onChange={(e) => onPrompt(e.target.value)}
              placeholder={setup.placeholder}
              className="min-w-0 flex-1 bg-transparent text-[15px] leading-[1.5] text-ink outline-none placeholder:text-ink-muted-2"
            />
            <Link
              to="/home"
              state={handOff}
              className="group inline-flex shrink-0 items-center gap-1.5 bg-accent px-4 py-2.5 text-[13.5px] font-bold text-[var(--on-accent)] transition-transform hover:-translate-y-px"
              style={{ borderRadius: "999px" }}
              title={`Take this to ${setup.lineLabel.toLowerCase()} in the hub`}
            >
              <span key={toolId} className="desk-relabel">
                {action}
              </span>
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>
          <p className="idea-rise-2 mt-3 max-w-[52ch] text-[12.5px] leading-[1.5] text-ink-muted-2">
            Sends this line, and this tool, straight into the hub — nothing typed here is
            lost switching tabs above.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── options — the five things, all pointing at /home ────────────────────── */

function Options({
  toolId,
  onTool,
  prompt,
}: {
  toolId: string;
  onTool: (id: string) => void;
  prompt: string;
}) {
  return (
    <section className="desk-section desk-recessed desk-lift">
      <div className="desk-inner desk-ledger">
        <div className="max-w-[64ch]">
          <h2 className="desk-display" style={{ fontSize: "clamp(1.8rem, 3.6vw, 2.9rem)" }}>
            Five things. One <span className="desk-em">setup</span>.
          </h2>
          <p className="mt-3.5 max-w-[58ch] text-[16px] leading-[1.65] text-ink-muted">
            Whatever you load stays loaded — every door below opens onto the same model
            and the same face. Pick one and the hub opens straight into it.
          </p>
        </div>

        <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-px border border-border bg-border p-0 sm:grid-cols-3 lg:grid-cols-5">
          {TOOLS.map((tool) => (
            <li key={tool.id} className="contents">
              <Link
                to="/home"
                state={{ tool: tool.id, prompt }}
                onMouseEnter={() => onTool(tool.id)}
                onFocus={() => onTool(tool.id)}
                data-active={tool.id === toolId}
                className="m-hover group flex w-full flex-col gap-1.5 bg-panel px-4 py-3.5 text-left no-underline transition-colors hover:bg-panel-2 data-[active=true]:bg-panel-2"
              >
                <span className="font-mono text-[12px] font-semibold text-ink">
                  {tool.name}
                </span>
                <span className="font-sans text-[11.5px] text-ink-muted-2">
                  {tool.blurb}
                </span>
                <span className="desk-data mt-1 text-ink-muted-2" style={{ fontSize: "11px" }}>
                  {tool.cost}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── the one navigation ───────────────────────────────────────────────────── */

function Closing({ handOff }: { handOff: { tool: string; prompt: string } }) {
  return (
    <section className="desk-section desk-recessed desk-lift border-t border-border">
      <div className="desk-inner text-center">
        <h2
          className="desk-display mx-auto max-w-[16ch]"
          style={{ fontSize: "clamp(2.3rem, 5.8vw, 4.2rem)" }}
        >
          Everything lives in <span className="desk-em">one</span> room.
        </h2>
        <p className="mx-auto mt-5 max-w-[48ch] text-[17px] leading-[1.65] text-ink-muted">
          The hub is where you pick a model, load a face, and jump into any of the five
          tools — {facts.freeCap} free credits to start, no card.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/home"
            state={handOff}
            className="bg-accent px-[28px] py-4 text-[16px] font-bold text-[var(--on-accent)] transition-transform hover:-translate-y-px"
            style={{ borderRadius: "999px" }}
          >
            Go to the hub
          </Link>
        </div>

        <p className="mx-auto mt-9 max-w-[68ch] text-[13px] leading-[1.6] text-ink-muted-2">
          Pictures you make are deleted after {facts.expiryMonths} months — your account,
          prompts and chats stay.
        </p>
        <Disclosure className="mx-auto mt-2 justify-center" />
      </div>
    </section>
  );
}
