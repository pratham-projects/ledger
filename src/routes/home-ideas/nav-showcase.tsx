import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SpecimenBand } from "@/components/home/specimen-band";
import { FlowsSection } from "@/components/home/flows-section";
import { TruthsPanel } from "@/components/home/truths-panel";
import { featuredLoras } from "@/components/home/featured";
import { LORAS, CHECKPOINTS } from "@/lib/catalog";
import { facts } from "./facts";
import { ConceptNote } from "./shared";

/**
 * NAV DIRECTION A — the landing page sheds the picker.
 *
 * The current `/` does three jobs at once: it pitches the product, it lets you pick a
 * base model and LoRA, and it proves the five tools work. That third job is the one only
 * `/` can do — a first-time visitor has nothing to judge the product by yet. The other
 * two duplicate what `nav-hub` (the other sketch) proposes `/browse` should own outright.
 *
 * This sketch removes the composer and the model/LoRA spine entirely. What is left: a
 * claim stated once, proof (the specimen band and the five live demos), the honest terms,
 * and exactly one door — Browse. No tool tabs in the header, because there is nothing to
 * switch between yet; the visitor has not chosen anything to route into a tool.
 */
export function NavShowcase() {
  const lora = featuredLoras()[0];

  return (
    <div className="min-h-[100dvh] bg-bg text-ink" style={{ fontFamily: "var(--font-sans)" }}>
      <ConceptNote
        eyebrow="Nav direction A"
        otherHref="/home-ideas/nav-hub"
        otherLabel="See direction B — Browse as the hub"
      >
        Landing sheds the model picker and the composer — both move to Browse. Its only
        job here is proof: show the five tools working, then hand off in one click.
      </ConceptNote>

      <header className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-8">
        <span className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
          {facts.wordmark}
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/home-ideas/nav-hub"
            className="hidden text-[13px] font-semibold text-ink-muted hover:text-ink sm:inline"
          >
            Sign in
          </Link>
          <Link
            to="/home-ideas/nav-hub"
            className="border border-accent bg-accent px-4 py-2 text-[13px] font-bold text-[#06060A] transition-transform hover:-translate-y-px"
          >
            Open Browse
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[900px] px-5 py-16 text-center sm:px-8 sm:py-24">
        <p className="font-mono text-[11.5px] font-bold uppercase tracking-[0.16em] text-accent">
          one model · one face · five tools
        </p>
        <h1
          className="mx-auto mt-5 max-w-[18ch] font-display font-bold tracking-[-0.03em] text-ink"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.4rem)", lineHeight: 1.04 }}
        >
          Everything below was made with one setup.
        </h1>
        <p className="mx-auto mt-5 max-w-[56ch] text-[17px] leading-[1.65] text-ink-muted">
          Pick a base model and a LoRA once on Browse, and it follows you into Image,
          Video, Chat, RPG and Story. This page doesn&rsquo;t ask you to choose anything —
          it shows you what choosing gets you.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/home-ideas/nav-hub"
            className="inline-flex items-center gap-2 border border-accent bg-accent px-7 py-3.5 text-[15px] font-bold text-[#06060A] transition-transform hover:-translate-y-px"
          >
            See what it makes <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href="#proof"
            className="border border-border-2 px-7 py-3.5 text-[15px] font-bold text-ink transition-colors hover:border-accent"
          >
            Watch it work ↓
          </a>
        </div>
      </section>

      <section className="border-t border-border">
        <SpecimenBand />
      </section>

      <main id="proof" className="mx-auto flex max-w-[1180px] flex-col gap-10 px-5 py-14 sm:px-8">
        <FlowsSection subject={lora} />
        <TruthsPanel />
      </main>

      <footer className="border-t border-border px-5 py-9 text-center sm:px-8">
        <p className="mx-auto max-w-[60ch] text-[14px] leading-[1.6] text-ink-muted">
          {LORAS.length} LoRAs · {CHECKPOINTS.length} base models
        </p>
        <Link
          to="/home-ideas/nav-hub"
          className="mt-5 inline-block border border-accent bg-accent px-7 py-3 text-[14px] font-bold text-[#06060A]"
        >
          Open Browse
        </Link>
      </footer>
    </div>
  );
}
