import { useRef } from "react";
import { PromptComposer } from "@/components/video/prompt-composer";
import { AdvancedPanel } from "@/components/video/advanced-panel";
import { ResultGrid } from "@/components/video/result-grid";
import { VideoTemplatesPanel, VIDEO_MY_GENERATIONS_ITEMS } from "@/components/video/templates-panel";
import { OutOfCreditsModal } from "@/components/credits/out-of-credits-modal";
import { SourceStrip } from "@/components/session/source-strip";
import { ToolWorkspace } from "@/components/tool-workspace/workspace";
import { ToolHead } from "@/components/tool-workspace/tool-head";
import { WorkspaceTabs } from "@/components/tool-workspace/workspace-tabs";
import { MyGenerationsPanel } from "@/components/tool-workspace/my-generations-panel";
import { useVideoGeneration, VIDEO_GENERATE_COST } from "@/hooks/use-video-generation";
import { useSelection } from "@/hooks/use-selection";
import { useScrollOnComplete } from "@/hooks/use-scroll-on-complete";

/**
 * Second tool moved onto Desk's chrome (`HubShell`) — same shape as `/image`. See the
 * header note on that file for `.hub-band`/`SourceStrip` visibility reasoning.
 *
 * **Three independently-scrolling panels**, studied live from openart.ai/suite/create-video/:
 * the rail (`HubShell`, mounted around this route), a resizable composer column, and the
 * right panel's own Templates / My Generations tabs — `ToolWorkspace` and `WorkspaceTabs`
 * own that structure now; this file only supplies what goes in each slot. See
 * `components/tool-workspace/workspace.tsx` for why the row is fixed-height and scrolls
 * internally at `xl` and up, and stacks and lets the page scroll below it.
 */
export function VideoGenerator() {
  const gen = useVideoGeneration();
  const { selectReferenceMedia } = useSelection();
  const resultsRef = useRef<HTMLDivElement>(null);
  useScrollOnComplete(gen.isGenerating, resultsRef);

  return (
    <>
      <ToolWorkspace
        storageKey="video"
        middle={
          <>
            <ToolHead
              kicker="video.generate"
              title={
                <>
                  Describe it. <span className="desk-em">Watch it move.</span>
                </>
              }
            >
              Every clip narrates its own pipeline — queued, rendering frame by frame,
              encoding — then loops.
            </ToolHead>

            <div className="flex flex-col gap-5">
              <SourceStrip
                domain="video"
                emptyHint="No LoRA loaded — you'll get the base model on its own. Load one to hold a character or style steady across the whole clip."
              />
              <PromptComposer {...gen} />
              {gen.hasGeneratedOnce && <AdvancedPanel {...gen} />}

              <div ref={resultsRef} className="scroll-mt-20">
                <p className="desk-pill-label mb-3">results</p>
                <ResultGrid
                  tiles={gen.tiles}
                  onRegenerate={gen.regenerateTile}
                  onTogglePlaying={gen.togglePlaying}
                  aspectRatio={gen.aspectRatio}
                />
              </div>
            </div>
          </>
        }
        right={
          <WorkspaceTabs
            templates={<VideoTemplatesPanel />}
            myGenerations={
              <MyGenerationsPanel
                resultCount={gen.tiles.length}
                items={VIDEO_MY_GENERATIONS_ITEMS}
                unit="clips"
                onSelect={selectReferenceMedia}
              />
            }
          />
        }
      />

      {gen.outOfCredits && (
        <OutOfCreditsModal
          requiredCredits={VIDEO_GENERATE_COST}
          action="Generating a video"
          onClose={gen.dismissOutOfCredits}
        />
      )}
    </>
  );
}
