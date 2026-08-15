import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PanelHead } from "@/components/ui/panel";
import { useStageGrant, type StageGrant } from "@/hooks/use-demo-stage";
import { cn } from "@/lib/utils";

/**
 * One tool, demonstrated rather than described.
 *
 * The competitive set — Civitai, DeepAI, BasedLabs, Character.ai — all answer "what is
 * this site" with a directory: a grid of assets or a list of tool names. None of them
 * shows a *flow*. That is the gap this component exists to occupy, because the thing
 * this product actually sells is not five tools, it is one asset moving through five
 * tools, and that is a sequence. A sequence has to be watched.
 *
 * Two decisions inside it are worth defending:
 *
 * **These are live components, not video files.** The demo is built from the same
 * grammar as the real surface — the same transcript rules, the same result tile, the same
 * `m-resolve` when a picture lands. A recorded mp4 would go stale the first time a
 * surface changed, weigh a few megabytes, and could not be clicked into. This can: the
 * whole panel is a link, so watching the thing you want *is* the way to open it. That is
 * the "quick access" affordance, disguised as a demonstration.
 *
 * **The panel is the link, and the caption is the label.** An accessible name assembled
 * from a moving demo would change mid-sentence, so the link's name comes from the static
 * caption and the demo viewport is `aria-hidden`. A screen-reader user gets "Chat —
 * Bring the model you picked into a conversation" and never hears a typing animation.
 */
export function FlowDemo({
  id,
  domain,
  title,
  caption,
  to,
  cost,
  children,
}: {
  /** Stable id used by the stage to arbitrate playback. */
  id: string;
  /** `domain.operation`, per the naming convention every region follows. */
  domain: string;
  title: string;
  /** Plain English. What the visitor gets, not what the feature is called. */
  caption: string;
  to: string;
  /** Mono cost line, e.g. "2 credits". Honest: these are the real catalog numbers. */
  cost: string;
  children: (grant: StageGrant) => ReactNode;
}) {
  const grant = useStageGrant(id);

  return (
    <Link
      to={to}
      ref={grant.ref}
      aria-label={`${title} — ${caption}`}
      className={cn(
        "m-hover group flex flex-col border border-border bg-panel no-underline",
        "transition-colors hover:border-border-2"
      )}
    >
      <PanelHead
        title={domain}
        sub={
          <span className="inline-flex items-center gap-2">
            <span className="tabular-nums">{cost}</span>
            <span
              aria-hidden="true"
              className={cn(
                "h-1.5 w-1.5 transition-colors",
                grant.playing ? "bg-accent" : "bg-border-2"
              )}
            />
          </span>
        }
      />

      {/*
        Fixed aspect, always, and the *same* aspect on every demo. Two reasons. The
        contents change on a timer, so a box that could change with them would make the
        page breathe once a second — the "never animate a layout property" rule applied
        to a scripted timeline. And five panels in a grid must agree on a height or the
        row is set by whichever one happens to be tallest, which is how a wall of demos
        turns into a ransom note.
      */}
      <div
        aria-hidden="true"
        className="relative aspect-[4/3] overflow-hidden border-b border-border bg-panel-2"
      >
        {children(grant)}
      </div>

      <div className="flex items-start justify-between gap-4 p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-sans text-[15px] font-semibold text-ink">{title}</span>
          <span className="font-sans text-[13.5px] leading-[1.55] text-ink-muted">
            {caption}
          </span>
        </div>
        <ArrowRight
          className="mt-1 h-4 w-4 shrink-0 text-ink-muted-2 transition-colors group-hover:text-accent"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

/** The mono status line demos print over their viewport while something is "working". */
export function DemoStatus({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "accent" | "green";
}) {
  return (
    <span
      className={cn(
        "absolute bottom-2.5 left-3 z-10 font-mono text-[10px] uppercase tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]",
        tone === "accent" && "text-accent",
        tone === "green" && "text-green",
        tone === "muted" && "text-ink-muted"
      )}
    >
      {children}
    </span>
  );
}

/**
 * A prompt line that types itself.
 *
 * Remounted by its `key` at the start of each typing step, so the caret always begins at
 * zero rather than inheriting a count from the previous cycle. When `typing` is false the
 * whole string is simply present — that is the idle frame, and it must never look like a
 * half-finished thought.
 */
export function TypedLine({
  text,
  typing,
  className,
}: {
  text: string;
  /** False shows the finished string — the idle state of every demo. */
  typing: boolean;
  className?: string;
}) {
  return (
    <span className={cn("font-mono text-[11.5px] leading-[1.6] text-ink", className)}>
      {typing ? <Typewriter text={text} /> : text}
      {typing && (
        <span
          aria-hidden="true"
          className="ml-px inline-block h-[1.1em] w-[1px] translate-y-[0.18em] bg-accent"
        />
      )}
    </span>
  );
}

function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    setN(0);
    const id = window.setInterval(() => {
      setN((prev) => {
        if (prev >= text.length) {
          window.clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, 26);
    return () => window.clearInterval(id);
  }, [text]);

  return <>{text.slice(0, n)}</>;
}
