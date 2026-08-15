/**
 * The story session, once chapter one exists.
 *
 * This used to be a stack of panels in a scrolling page, which made it the odd one out of
 * the three narrative surfaces for no reason anybody could defend: the same two authors
 * write into it, the same illustrations land in it, and the same "write the next one"
 * control has to stay reachable. Parked at the bottom of a growing page, that control
 * walked further away with every chapter — by chapter five you scrolled a full screen to
 * reach the button whose entire job was "keep going".
 *
 * So it runs in `SessionSurface` like chat and RPG: docked by default, one scrolling
 * region, the continue control docked. `/story` is mounted in `HubShell` (`App.tsx`) same
 * as the other tools now, and a surface that hides the hub's rail the moment chapter one
 * exists is a visitor who can't see where else the site goes without finding an exit
 * first — full screen is one tap away instead. What stays different is the *typography* —
 * this is the one surface whose job is sustained reading, so it keeps the 17px/1.75
 * measure and the chapter numerals in the margin rather than adopting the transcript's
 * rhythm.
 */
import { useState } from "react";
import { BookOpen, Image as ImageIcon, RotateCcw, X } from "lucide-react";
import { SessionSurface, SurfaceButton } from "@/components/session/session-surface";
import { SceneImage } from "@/components/session/scene-image";
import { StreamedBody } from "@/components/session/streaming-text";
import { AuthorMark } from "@/components/session/author-mark";
import { Button } from "@/components/ui/button";
import { useStreamedText } from "@/hooks/use-streamed-text";
import { useStickToBottom, useArrivalNotifier } from "@/hooks/use-stick-to-bottom";
import {
  STORY_CHAPTER_COST,
  STORY_ILLUSTRATE_COST,
  type Chapter,
  type useStory,
} from "@/hooks/use-story";

type Story = ReturnType<typeof useStory>;

export function Manuscript({ story }: { story: Story }) {
  // Docked is the default now — see the header note above. Full screen is one tap away.
  const [full, setFull] = useState(false);
  const stick = useStickToBottom();

  const newestId = story.chapters[story.chapters.length - 1]?.id ?? null;

  useArrivalNotifier(story.chapters.length, stick.noteArrival);

  return (
    <SessionSurface
      full={full}
      onFullChange={setFull}
      stick={stick}
      header={
        <>
          <SurfaceButton onClick={story.reset} label="Close this story and start a different one">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">close</span>
          </SurfaceButton>

          <div className="flex min-w-0 flex-1 flex-col">
            <span
              className="truncate font-sans text-[14.5px] font-semibold leading-tight text-ink"
              title={story.genre.name}
            >
              {story.genre.name}
            </span>
            <span className="truncate font-mono text-[10.5px] leading-[1.5] text-ink-muted-2">
              {story.config.protagonists.join(", ") || "no cast"}
            </span>
          </div>

          <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ink-muted-2">
            {story.chapters.length} ch
            <span className="hidden sm:inline"> · {story.wordCount} words</span>
          </span>
        </>
      }
      dock={
        <div className="mx-auto flex max-w-[680px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
          <button
            type="button"
            onClick={story.reset}
            className="m-press inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-muted-2 transition-colors hover:text-red"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            start a different story
          </button>

          <Button
            variant="primary"
            size="md"
            onClick={story.continueStory}
            disabled={story.writing}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {story.writing
              ? "Writing…"
              : `Write chapter ${story.chapters.length + 1} — ${STORY_CHAPTER_COST} cr`}
          </Button>
        </div>
      }
    >
      <div className="mx-auto flex max-w-[680px] flex-col px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        {story.chapters.map((chapter) => (
          <ChapterBlock
            key={chapter.id}
            chapter={chapter}
            story={story}
            stream={chapter.id === newestId}
            onReveal={stick.follow}
          />
        ))}

        {story.writing && (
          <div className="ledger-message-in border-t border-border pt-6">
            <AuthorMark speaker="storyteller" writing />
          </div>
        )}

      </div>
    </SessionSurface>
  );
}

function ChapterBlock({
  chapter,
  story,
  stream,
  onReveal,
}: {
  chapter: Chapter;
  story: Story;
  stream: boolean;
  onReveal: () => void;
}) {
  /**
   * A chapter is several paragraphs, and they have to stream *in order* — all of them at
   * once would be four write-heads racing down the column. So the whole chapter is joined
   * into one stream and split back on the blank lines for rendering; `whitespace-pre-wrap`
   * in StreamedBody preserves the breaks, and the paragraph spacing comes from the
   * separator rather than from separate elements.
   */
  const body = chapter.paragraphs.join("\n\n");
  const streamed = useStreamedText(body, { enabled: stream, onReveal });

  return (
    <article className="ledger-message-in group flex flex-col gap-5 border-b border-border py-8 first:pt-0 last:border-b-0">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <span className="font-mono text-[11px] tabular-nums text-accent">
          {String(chapter.index + 1).padStart(2, "0")}
        </span>
        <h2 className="m-0 font-display text-[20px] font-bold leading-tight tracking-[-0.01em] text-ink sm:text-[22px]">
          {chapter.title}
        </h2>
        <AuthorMark speaker="storyteller" writing={streamed.streaming} className="ml-auto" />
      </header>

      <StreamedBody
        streamed={streamed}
        text={body}
        className="max-w-[66ch] font-sans text-[16.5px] leading-[1.75] text-ink-muted sm:text-[17px]"
      />

      {/* The illustration waits for the prose to finish. A picture appearing mid-paragraph
          is a competing focal point in a surface whose entire job is sustained reading. */}
      {!streamed.streaming && (
        <div className="max-w-[66ch]">
          {chapter.illustrationSeed !== undefined ? (
            <SceneImage
              seed={chapter.illustrationSeed}
              generating={Boolean(chapter.illustrating)}
              caption={
                story.loraName
                  ? `Illustrated with ${story.loraName}`
                  : "Chapter illustration"
              }
            />
          ) : (
            <button
              type="button"
              onClick={() => story.illustrate(chapter.id)}
              className="m-press inline-flex items-center gap-1.5 border border-border-2 px-2.5 py-1.5 font-mono text-[11px] text-ink-muted transition-colors hover:border-accent hover:text-accent"
            >
              <ImageIcon className="h-3 w-3" aria-hidden="true" />
              illustrate this chapter — {STORY_ILLUSTRATE_COST} cr
            </button>
          )}
        </div>
      )}
    </article>
  );
}
