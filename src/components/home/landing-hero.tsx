import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHECKPOINTS, LORAS } from "@/lib/catalog";
import { FREE_CAP } from "@/hooks/use-credits";

/**
 * The claim, once, in the visitor's language.
 *
 * The headline used to live on `/browse`, which meant the sentence that explains the
 * entire product was one click behind a page that explained none of it. It belongs here.
 *
 * Everything printed below is checked against something real: the counts come from the
 * catalog module, the free cap comes from the credits hook. Nothing on this page states
 * a number that the app does not actually behave according to — see the "be honest in
 * copy" rule in DESIGN.md, which is a product principle here rather than a preference.
 */
export function LandingHero() {
  return (
    <section className="max-w-[720px] pb-10 pt-12 sm:pt-16">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-accent">
        one asset, five tools
      </p>

      <h1 className="mb-5 font-display text-[clamp(34px,5.8vw,56px)] font-bold leading-[1.06] tracking-[-0.02em] text-ink">
        Pick one model.
        <br />
        Use it everywhere.
      </h1>

      <p className="mb-7 max-w-[56ch] font-sans text-[17px] leading-[1.6] text-ink-muted">
        Choose a base model and a LoRA — a character, a style, a look — and it follows you
        into image, video, chat, RPG and story. You set it up once, then it&rsquo;s just
        there, in whichever tool you open.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Link to="/home#catalog" className="no-underline">
          <Button variant="primary" size="lg">
            browse {LORAS.length} loras
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </Link>
        {/* An in-page jump rather than a second destination: the proof is directly
            below, and sending a hesitant visitor to another route loses them. */}
        <a href="#flows" className="no-underline">
          <Button variant="ghost" size="lg">
            see how it works ↓
          </Button>
        </a>
      </div>

      <p className="mt-6 font-mono text-[11px] leading-[1.7] text-ink-muted-2">
        free · no card · {FREE_CAP} credits that refill on their own ·{" "}
        {CHECKPOINTS.length} base models
      </p>
    </section>
  );
}
