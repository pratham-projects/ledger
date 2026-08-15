import { useRef } from "react";
import { PromptComposer } from "@/components/image/prompt-composer";
import { AdvancedPanel } from "@/components/image/advanced-panel";
import { ResultGrid } from "@/components/image/result-grid";
import { ImageTemplatesPanel, IMAGE_MY_GENERATIONS_ITEMS } from "@/components/image/templates-panel";
import { OutOfCreditsModal } from "@/components/credits/out-of-credits-modal";
import { SourceStrip } from "@/components/session/source-strip";
import { ToolWorkspace } from "@/components/tool-workspace/workspace";
import { ToolHead } from "@/components/tool-workspace/tool-head";
import { WorkspaceTabs } from "@/components/tool-workspace/workspace-tabs";
import { MyGenerationsPanel } from "@/components/tool-workspace/my-generations-panel";
import { useImageGeneration, IMAGE_GENERATE_COST } from "@/hooks/use-image-generation";
import { useSelection } from "@/hooks/use-selection";
import { useScrollOnComplete } from "@/hooks/use-scroll-on-complete";

/**
 * The first tool moved onto Desk's own chrome (`HubShell`, mounted in `App.tsx`) instead
 * of the old `PageShell` rail. `HubShell` hands its children the full column, unpadded —
 * see the note on `HubShell`.
 *
 * Same three-panel shell as `/video` now: `ToolWorkspace` supplies the resizable,
 * independently-scrolling composer and right-panel columns; this file only fills them in.
 * See `components/tool-workspace/workspace.tsx` for the responsive/scroll mechanics.
 */
export function ImageGenerator() {
  const gen = useImageGeneration();
  const { selectReferenceMedia } = useSelection();
  const resultsRef = useRef<HTMLDivElement>(null);
  useScrollOnComplete(gen.isGenerating, resultsRef);

  return (
    <>
      <ToolWorkspace
        storageKey="image"
        middle={
          <>
            <ToolHead
              kicker="image.generate"
              title={
                <>
                  Describe it. <span className="desk-em">Watch it resolve.</span>
                </>
              }
            >
              Every tile narrates its own progress — waiting, preparing, processing — rather
              than sitting on one blank spinner.
            </ToolHead>

            <div className="flex flex-col gap-5">
              <SourceStrip
                domain="image"
                emptyHint="No LoRA loaded — you'll get the base model on its own. Load one to keep a character or style consistent across every generation."
              />
              <PromptComposer {...gen} />
              {gen.hasGeneratedOnce && <AdvancedPanel {...gen} />}

              <div ref={resultsRef} className="scroll-mt-20">
                <p className="desk-pill-label mb-3">results</p>
                <ResultGrid tiles={gen.tiles} onRegenerate={gen.regenerateTile} />
              </div>
            </div>
          </>
        }
        right={
          <WorkspaceTabs
            templates={<ImageTemplatesPanel />}
            myGenerations={
              <MyGenerationsPanel
                resultCount={gen.tiles.length}
                items={IMAGE_MY_GENERATIONS_ITEMS}
                unit="images"
                onSelect={selectReferenceMedia}
              />
            }
          />
        }
      />

      {gen.outOfCredits && (
        <OutOfCreditsModal
          requiredCredits={IMAGE_GENERATE_COST}
          action="Generating an image"
          onClose={gen.dismissOutOfCredits}
        />
      )}
    </>
  );
}
