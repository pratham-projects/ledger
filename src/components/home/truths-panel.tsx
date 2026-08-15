import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Panel, PanelHead } from "@/components/ui/panel";
import { bodyLinkClass } from "@/components/ui/body-link";
import { FREE_CAP } from "@/hooks/use-credits";
import { LORAS, CHECKPOINTS } from "@/lib/catalog";

/**
 * Four facts, including the one nobody else would print.
 *
 * The competitive set leads with the same three promises — free, fast, no watermark —
 * and hides everything with a cost attached. The differentiating move is not a fourth
 * superlative, it is *disclosure*: images on this platform are deleted after six months,
 * and a visitor is going to find that out eventually. Telling them here, next to the good
 * news, is worth more than the six months of goodwill it costs, and `docs/goal.md` §5
 * requires the product to communicate it honestly somewhere. This is the somewhere.
 *
 * Everything numeric is read from the module that governs it, so a change to the credit
 * cap or the catalog cannot leave a stale number on the front page.
 */
export function TruthsPanel() {
  return (
    <Panel>
      <PanelHead title="home.terms" sub="plainly" />

      <dl className="m-0 grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
        <Fact term={`Free, with ${FREE_CAP} credits`}>
          They refill on their own — there is no paywall between you and a generation. If
          you run out you can wait, watch an ad, or top up.{" "}
          <Link to="/credits" className={bodyLinkClass}>
            How the credits work
          </Link>
          .
        </Fact>

        <Fact term={`${LORAS.length} LoRAs, ${CHECKPOINTS.length} base models`}>
          Characters, styles and concepts, searchable by word or tag, filtered to what your
          base model can actually run.
        </Fact>

        <Fact term="One choice, five tools">
          The model you load follows you between image, video, chat, RPG and story. Nothing
          has to be set up twice, and nothing is locked to the tool you picked it in.
        </Fact>

        <Fact term="Generated images last six months">
          Then they are deleted from the server for good. Your account, prompts, settings
          and chat histories are kept — the pictures are not. Download anything you want to
          keep.
        </Fact>
      </dl>
    </Panel>
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 bg-panel p-4">
      <dt className="font-mono text-[11.5px] font-semibold text-ink">{term}</dt>
      <dd className="m-0 max-w-[48ch] font-sans text-[13.5px] leading-[1.6] text-ink-muted">
        {children}
      </dd>
    </div>
  );
}
