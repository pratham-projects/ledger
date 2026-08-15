import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FlowDemo } from "@/components/home/flow-demo";
import { ImageDemo } from "@/components/home/demos/image-demo";
import { VideoDemo } from "@/components/home/demos/video-demo";
import { ChatDemo } from "@/components/home/demos/chat-demo";
import { RpgDemo } from "@/components/home/demos/rpg-demo";
import { StoryDemo } from "@/components/home/demos/story-demo";
import { DemoStage } from "@/hooks/use-demo-stage";
import { useSelection } from "@/hooks/use-selection";
import { IMAGE_GENERATE_COST } from "@/hooks/use-image-generation";
import { VIDEO_GENERATE_COST } from "@/hooks/use-video-generation";
import { RPG_TURN_COST } from "@/hooks/use-rpg";
import { STORY_CHAPTER_COST } from "@/hooks/use-story";
import { LORAS, type Lora } from "@/lib/catalog";

/**
 * The argument, running.
 *
 * Five panels, one subject. Change the LoRA in the strip above and every one of these
 * re-casts — the image, the clip's prompt, the face in the transcript, the RPG scene, the
 * story's illustration. That is the differentiator demonstrated rather than asserted, and
 * it is the reason this section exists instead of a feature list.
 *
 * `DemoStage` wraps all five so playback can be arbitrated centrally: off-screen panels
 * stop, narrow viewports run exactly one, and only ever one WebGL context is alive. See
 * hooks/use-demo-stage.tsx for why that is not optional here.
 *
 * Every panel is a link into its tool with the current selection already loaded, so the
 * demonstration and the entry point are the same object. Watching is how you enter.
 */
export function FlowsSection({ subject }: { subject: Lora }) {
  const { checkpoint } = useSelection();

  return (
    <section id="flows" aria-labelledby="flows-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2
          id="flows-heading"
          className="font-display text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-ink"
        >
          The same face, five ways.
        </h2>
        <p className="max-w-[62ch] font-sans text-[15px] leading-[1.6] text-ink-muted">
          These run on a loop so you can see what each tool actually does before you spend
          anything. Click one to open it — <span className="text-ink">{subject.name}</span>{" "}
          comes with you.
        </p>
      </div>

      <DemoStage>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Equal cells, in the order the side rail uses. Giving image a double-width
              cell was tried and abandoned: a wider box at the same aspect is a taller
              box, and one tall panel sets the height of the whole row, leaving its
              neighbours floating in dead space. Five doors of the same size also says
              something true — none of these is the main one.

              Two columns, not three. Each demo now plays a full multi-step session —
              two images and a regenerate, three chat turns, two RPG turns, a chapter
              with two illustrations — and at one-third width the transcripts and prose
              inside them were too small to read as the interfaces they are quoting.
              Six cells divide evenly into three rows of two, so nothing ends ragged. */}
          <FlowDemo
            id="image"
            domain="image.generate"
            title="Image"
            caption="Describe it, get a picture. Aspect, steps and seed sit behind an Advanced toggle if you want them."
            to="/image"
            cost={`${IMAGE_GENERATE_COST} cr`}
          >
            {(grant) => <ImageDemo grant={grant} lora={subject} />}
          </FlowDemo>

          <FlowDemo
            id="video"
            domain="video.generate"
            title="Video"
            caption="A few seconds of motion from the same prompt box."
            to="/video"
            cost={`${VIDEO_GENERATE_COST} cr`}
          >
            {(grant) => <VideoDemo grant={grant} lora={subject} checkpoint={checkpoint} />}
          </FlowDemo>

          <FlowDemo
            id="chat"
            domain="chat.transcript"
            title="Chat"
            caption="Give them a name and a personality, then talk. The face comes from the model you picked."
            to="/chat"
            // Honest: nothing in this build charges for a chat reply, and the economy
            // for it is still open (docs/goal.md §6). Say so rather than invent a price.
            cost="no cost yet"
          >
            {(grant) => <ChatDemo grant={grant} lora={subject} />}
          </FlowDemo>

          <FlowDemo
            id="rpg"
            domain="rpg.turn"
            title="RPG"
            caption="Turn-based play. Pick a door and the world draws what's behind it."
            to="/rpg"
            cost={`${RPG_TURN_COST} cr / turn`}
          >
            {(grant) => <RpgDemo grant={grant} lora={subject} />}
          </FlowDemo>

          <FlowDemo
            id="story"
            domain="story.compose"
            title="Story"
            caption="A chapter at a time, illustrating itself as it goes."
            to="/story"
            cost={`${STORY_CHAPTER_COST} cr / chapter`}
          >
            {(grant) => <StoryDemo grant={grant} lora={subject} />}
          </FlowDemo>

          {/* Five demos in a two-column grid leaves one cell over. Rather than let the
              row end ragged, the gap states the thing the five panels have been implying
              and sends the visitor to the catalog — which is where the whole page is
              trying to get them. */}
          <Link
            to="/home#catalog"
            className="m-hover group flex flex-col justify-center gap-4 border border-border bg-panel p-5 no-underline transition-colors hover:border-border-2"
          >
            <p className="m-0 max-w-[30ch] font-display text-[21px] font-bold leading-[1.2] tracking-[-0.01em] text-ink">
              Nothing is locked to the tool you made it in.
            </p>
            <div className="flex flex-col gap-3">
              <p className="m-0 font-sans text-[13.5px] leading-[1.6] text-ink-muted">
                One balance, one loaded model, five tools. Swap the model and every one of
                them changes with it.
              </p>
              <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-semibold text-accent">
                browse {LORAS.length} loras
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </div>
      </DemoStage>

    </section>
  );
}
