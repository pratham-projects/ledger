import * as React from "react";
import { Link } from "react-router-dom";
import { Shuffle } from "lucide-react";
import { stockFor } from "@/lib/stock";
import { facts, TOOLS } from "./facts";
import { ConceptNote, ModelPicker, LoraPicker, useIdeaSelection } from "./shared";

const EXAMPLES = [
  "a rooftop courier in the rain, seen from below",
  "the lighthouse keeper mending a net at dawn",
  "an archivist's desk, ink everywhere, one candle",
];

/**
 * NAV DIRECTION B — Browse becomes the generation hub.
 *
 * Today `/browse` ends at a choice: pick a base model and a LoRA, then get routed to a
 * tool with nothing carried over but the selection. This sketch adds the one thing that
 * choice is missing — somewhere to say what you want *before* you leave. A prompt line
 * and five launch buttons sit directly under the picker, so "choose an asset" and "start
 * making something" happen on the same screen instead of two.
 *
 * The picker itself is untouched — same `ModelPicker`/`LoraPicker` the real `/browse`
 * uses via `home-ideas/shared.tsx`, reading and writing the same global selection. Only
 * the launch bar is new.
 */
export function NavHub() {
  const { checkpoint, activeLora } = useIdeaSelection();
  const [prompt, setPrompt] = React.useState(EXAMPLES[0]);
  const chip = stockFor(activeLora.id, "portrait");

  return (
    <div className="min-h-[100dvh] bg-bg text-ink" style={{ fontFamily: "var(--font-sans)" }}>
      <ConceptNote
        eyebrow="Nav direction B"
        otherHref="/home-ideas/nav-showcase"
        otherLabel="See direction A — landing as pure showcase"
      >
        Browse gains a launch bar: write your line and pick a tool right under the picker,
        instead of arriving at the model/LoRA choice with nowhere to spend it.
      </ConceptNote>

      <header className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-8">
        <Link to="/home-ideas/nav-showcase" className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
          {facts.wordmark}
        </Link>
        <nav aria-label="Creation tools" className="hidden items-center gap-1 lg:flex">
          {TOOLS.map((t) => (
            <span key={t.id} className="px-3 py-1.5 text-[13px] font-semibold text-ink-muted-2">
              {t.name}
            </span>
          ))}
        </nav>
        <span className="border border-border-2 px-2.5 py-1.5 font-mono text-[11.5px] text-ink-muted">
          {facts.freeCap} credits
        </span>
      </header>

      <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">
        <p className="font-mono text-[11.5px] font-bold uppercase tracking-[0.16em] text-accent">
          browse · the generation hub
        </p>
        <h1
          className="mt-4 max-w-[18ch] font-display font-bold tracking-[-0.03em] text-ink"
          style={{ fontSize: "clamp(2rem, 4.6vw, 3.2rem)", lineHeight: 1.05 }}
        >
          Pick it. Then start it — right here.
        </h1>
        <p className="mt-4 max-w-[62ch] text-[16px] leading-[1.65] text-ink-muted">
          Choose a base model and a LoRA below. As soon as you have, write your line and
          send it to any of the five tools without leaving this page.
        </p>
      </div>

      <div className="border-y border-border bg-panel-2">
        <div className="mx-auto max-w-[1180px] px-5 py-9 sm:px-8">
          <ModelPicker />
        </div>
      </div>
      <div className="mx-auto max-w-[1180px] px-5 py-9 sm:px-8">
        <LoraPicker />
      </div>

      {/* The new piece: a launch bar, sticky so it stays reachable while you keep
          browsing further down the catalogue below it. */}
      <div className="sticky bottom-0 z-20 border-t border-border-2 bg-bg/95 backdrop-blur">
        <div className="mx-auto max-w-[1180px] px-5 py-4 sm:px-8">
          <div className="border border-border-2 bg-panel p-3.5">
            <div className="flex items-center gap-2.5 border-b border-border px-1 pb-3">
              <img
                src={chip.src(56)}
                alt=""
                className="h-7 w-7 shrink-0 rounded-full object-cover object-top"
                loading="lazy"
                decoding="async"
              />
              <p className="min-w-0 truncate text-[13px] font-semibold text-ink-muted">
                <span className="text-ink">{activeLora.name}</span> on{" "}
                <span className="text-ink">{checkpoint.name}</span>
              </p>
              <Link to="#" className="ml-auto shrink-0 text-[12.5px] font-bold text-accent">
                Change
              </Link>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full resize-none bg-transparent px-1 pt-3 text-[16px] leading-[1.5] text-ink outline-none placeholder:text-ink-muted-2"
            />

            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border px-1 pt-3">
              <button
                type="button"
                onClick={() => setPrompt(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)])}
                className="inline-flex items-center gap-1.5 border border-border-2 px-2.5 py-1.5 font-mono text-[11px] text-ink-muted-2 hover:border-accent hover:text-ink"
              >
                <Shuffle className="h-3.5 w-3.5" aria-hidden />
                Try another line
              </button>
              <div className="ml-auto flex flex-wrap gap-2">
                {TOOLS.map((t) => (
                  <Link
                    key={t.id}
                    to={t.href}
                    className="border border-accent bg-accent px-3.5 py-2 text-[12.5px] font-bold text-[#06060A] transition-transform hover:-translate-y-px"
                  >
                    {t.action}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
