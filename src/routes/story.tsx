/**
 * THESIS: the story surface is a book, not a feed — one prose column at reading measure,
 * chapters ruled apart, illustrations sitting in the text where a printed book would put
 * them. Refuses the chat-bubble transcript that RPG and Chat use, because reading is a
 * different job from taking turns — but shares their full-screen frame, because keeping
 * "write the next chapter" reachable is the same problem on all three.
 * OWN-WORLD: Desk's tokens, tuned for reading — Figtree at 17px on a 66ch measure, mono
 * chapter numerals in the margin rule, accent only on the spend-to-continue action.
 * STORY: the writer sets genre, plot and names, reads the opening, and chooses chapter
 * by chapter whether to keep going and whether to pay to see it drawn.
 * FIRST VIEWPORT: mounted in `HubShell` (`App.tsx`), same as `/image`, `/video`, `/chat`
 * and `/rpg`. Pre-session the setup surface sits beside the hub's rail, picture-led and
 * already answered. Beginning hands off to `Manuscript`, which docks in place by
 * default — chapter one writes itself in under a "storyteller" mark, so the reader can
 * see it is being written for them rather than waiting for them.
 * FORM: extension of the tool-surface family; the reading column is the one deliberate
 * departure from the panel-stack rhythm, earned by the mode.
 */
import { Dices } from "lucide-react";
import { SourceStrip } from "@/components/session/source-strip";
import { SetupPanel, SetupSection } from "@/components/wizard/setup-panel";
import { ChoiceGrid } from "@/components/wizard/choice-grid";
import { TagField } from "@/components/wizard/tag-field";
import { OutOfCreditsModal } from "@/components/credits/out-of-credits-modal";
import { Textarea } from "@/components/ui/textarea";
import { Manuscript } from "@/components/story/manuscript";
import { StoryTemplatesPanel, useMyStoryCharacters } from "@/components/story/templates-panel";
import { ToolWorkspace } from "@/components/tool-workspace/workspace";
import { ToolHead } from "@/components/tool-workspace/tool-head";
import { WorkspaceTabs } from "@/components/tool-workspace/workspace-tabs";
import { MyGenerationsPanel } from "@/components/tool-workspace/my-generations-panel";
import { useStory, findGenre, GENRES, STORY_BEGIN_COST } from "@/hooks/use-story";

export function Story() {
  const story = useStory();
  const myCharacters = useMyStoryCharacters(story.setCast);

  /*
   * Once chapter one exists the manuscript takes the viewport, the way chat and RPG do.
   * Note this is a state switch, not a route change — the story lives in this hook, and
   * routing away and back would silently discard it.
   */
  if (story.started) {
    return (
      <>
        <Manuscript story={story} />
        {story.blocked && (
          <OutOfCreditsModal
            requiredCredits={story.blocked.cost}
            action={story.blocked.action}
            onClose={story.dismissBlocked}
          />
        )}
      </>
    );
  }

  return (
    <>
      <ToolWorkspace
        storageKey="story"
        middle={
          <>
            <ToolHead
              kicker="story.session"
              title={
                <>
                  Write it <span className="desk-em">one chapter at a time.</span>
                </>
              }
            >
              A genre, a cast and an opening are already picked — change what you like, then
              write. Nothing writes itself past where you stop.
            </ToolHead>

            <main className="flex flex-col gap-5">
              <SourceStrip
                domain="story"
                emptyHint="Nothing loaded. Pick a LoRA and it illustrates the chapters — or write without, and the story stays prose only."
              />

              <SetupPanel
                domain="story"
                blurb="All three are filled in and ready to write as they stand. Everything stays in this tab — nothing is uploaded."
                onReroll={story.reroll}
                rerollLabel="roll all three"
                onBegin={story.begin}
                beginLabel="write chapter one"
                cost={STORY_BEGIN_COST}
                disabled={!story.config.plot.trim()}
                disabledNote="the story needs an opening"
              >
                <SetupSection
                  label="genre"
                  hint="Sets the register more than the plot does. Switching it suggests a new opening, unless you've written your own."
                >
                  <ChoiceGrid
                    name="genre"
                    label="Genre"
                    options={GENRES}
                    value={story.config.genre}
                    onChange={story.setGenre}
                    subject="scene"
                  />
                </SetupSection>

                <SetupSection
                  label="protagonists"
                  hint="The first name carries the opening; the second gets played against it. Tap a name to drop it, or type your own."
                  action={
                    <button
                      type="button"
                      onClick={story.rollNames}
                      className="m-press inline-flex shrink-0 items-center gap-1.5 border border-border-2 px-2.5 py-1.5 font-mono text-[11px] text-ink-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      <Dices className="h-3 w-3" aria-hidden="true" />
                      new cast
                    </button>
                  }
                >
                  <TagField
                    id="story-protagonists"
                    legend="protagonists"
                    selected={story.config.protagonists}
                    suggestions={[]}
                    onToggle={story.removeProtagonist}
                    onAdd={story.addProtagonist}
                    placeholder="Perpetua Small, Emil Barrow…"
                    addLabel="add name"
                    emptyNote="No cast. The opening will fall back to “She”, which works better than you'd think."
                  />
                </SetupSection>

                <SetupSection
                  label="initial plot"
                  hint="One or two sentences. This becomes the story's first real beat, verbatim."
                  action={
                    <button
                      type="button"
                      onClick={story.rollPlot}
                      className="m-press inline-flex shrink-0 items-center gap-1.5 border border-border-2 px-2.5 py-1.5 font-mono text-[11px] text-ink-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      <Dices className="h-3 w-3" aria-hidden="true" />
                      another premise
                    </button>
                  }
                >
                  <Textarea
                    id="story-plot"
                    rows={3}
                    value={story.config.plot}
                    placeholder="A letter arrives eleven years after it was posted, and the address is one that never existed."
                    onChange={(e) => story.setPlot(e.target.value)}
                    aria-label="Initial plot"
                  />
                </SetupSection>
              </SetupPanel>

            </main>
          </>
        }
        right={
          <WorkspaceTabs
            templates={
              <StoryTemplatesPanel
                activeGenreId={story.config.genre}
                onSelectGenre={story.setGenre}
                onSelectCast={story.setCast}
                onSelectScenario={(id) => {
                  const genre = findGenre(id);
                  if (!genre) return;
                  story.setGenre(id);
                  story.setPlot(genre.premises[0]);
                }}
              />
            }
            myGenerations={
              <MyGenerationsPanel
                resultCount={0}
                characterItems={myCharacters.items}
                onSelectCharacter={myCharacters.onSelect}
              />
            }
          />
        }
      />

      {story.blocked && (
        <OutOfCreditsModal
          requiredCredits={story.blocked.cost}
          action={story.blocked.action}
          onClose={story.dismissBlocked}
        />
      )}
    </>
  );
}
