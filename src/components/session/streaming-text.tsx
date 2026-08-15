import { useStreamedText, type StreamedText } from "@/hooks/use-streamed-text";
import { cn } from "@/lib/utils";

/**
 * A block of assistant-authored prose, arriving as it is written.
 *
 * Renders in three parts so that exactly one node animates at a time no matter how long
 * the passage is: the settled text, the word currently landing (`m-stream`), and the
 * write-head. A per-word `<span>` for four hundred words would put four hundred filtered
 * elements on the compositor and drop frames on a phone; this puts one.
 *
 * Clicking anywhere in the passage completes it. Someone who has read faster than the
 * stream should never have to wait for the interface to catch up, and "click to finish"
 * is the established gesture for that.
 */
export function StreamingText({
  text,
  /** False for text that was already on screen, for your own words, and while editing. */
  stream = true,
  onReveal,
  className,
  as,
}: {
  text: string;
  stream?: boolean;
  onReveal?: () => void;
  className?: string;
  as?: "p" | "div";
}) {
  const streamed = useStreamedText(text, { enabled: stream, onReveal });
  return <StreamedBody streamed={streamed} text={text} className={className} as={as} />;
}

/**
 * The same rendering, for callers that need the streaming flag themselves — a speaker
 * label that says "writing", or an illustration that must wait for the words to finish.
 * Those callers own the hook and hand the result down.
 */
export function StreamedBody({
  streamed,
  text,
  className,
  as: Tag = "p",
}: {
  streamed: StreamedText;
  /** The complete string, for assistive technology. */
  text: string;
  className?: string;
  as?: "p" | "div";
}) {
  const { shown, head, streaming, skip } = streamed;

  return (
    <Tag
      className={cn("m-0 whitespace-pre-wrap", streaming && "cursor-pointer", className)}
      onClick={streaming ? skip : undefined}
      title={streaming ? "Click to finish writing" : undefined}
      /*
       * The full text is exposed to assistive technology immediately. A screen reader
       * should never be fed a passage one word at a time — it would announce the same
       * sentence over and over as the node mutated. Sighted users get the reveal; anyone
       * listening gets the finished line once, when it lands.
       */
      aria-label={streaming ? text : undefined}
    >
      <span aria-hidden={streaming ? true : undefined}>
        {shown}
        {head && (
          // Keyed on position so React replaces the node each word, restarting the
          // animation. Without the key it would reuse the element and never re-run.
          <span key={shown.length} className="m-stream">
            {head}
          </span>
        )}
        {streaming && <span className="m-caret" aria-hidden="true" />}
      </span>
    </Tag>
  );
}
