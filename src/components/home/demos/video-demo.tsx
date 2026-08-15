import { useEffect, useRef } from "react";
import { DemoStatus, TypedLine } from "@/components/home/flow-demo";
import { useDemoRamp, useDemoScript, type StageGrant } from "@/hooks/use-demo-stage";
import { VIDEO_GENERATE_COST } from "@/hooks/use-video-generation";
import { checkpointClip, checkpointPoster, type Checkpoint, type Lora } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * The one demo that really is footage — because for video, footage is the deliverable.
 *
 * The clips under `/public/models` are stock previews stood in for this build, exactly as
 * `lib/catalog.ts` says. They are not output from the checkpoint they sit beneath, which
 * is why the caption on this panel and the disclosure in the specimen band both say so.
 * Showing motion here and stills everywhere else would be a lie about what the video tool
 * produces; showing a static frame would be a lie about what video is.
 *
 * It plays the round trip, not a single render: prompt, render, encode, watch it, then
 * amend the prompt and render again. Iteration is what video work actually is — nobody's
 * first four seconds are their last — and the second pass is where the panel earns the
 * cost line it prints twice.
 *
 * The element is muted, inline and looped, and it is paused the instant the stage revokes
 * playback — an autoplaying video the visitor cannot see is pure battery.
 */

const SCRIPT = [2000, 1800, 900, 4200, 1400, 1800, 900, 4400] as const;
const [WRITING, RENDERING, ENCODING, PLAYING, AMENDING, RERENDERING, REENCODING, REPLAYING] = [
  0, 1, 2, 3, 4, 5, 6, 7,
];

const TOTAL_FRAMES = 96;

export function VideoDemo({
  grant,
  lora,
  checkpoint,
}: {
  grant: StageGrant;
  lora: Lora;
  checkpoint: Checkpoint;
}) {
  const step = useDemoScript(SCRIPT, grant.playing);
  const videoRef = useRef<HTMLVideoElement>(null);

  const playing = grant.playing && (step === PLAYING || step === REPLAYING);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) {
      // Autoplay can still be refused (low-power mode); the poster stays, which is a
      // perfectly good frame. Never let a rejected promise reach the console.
      void el.play().catch(() => {});
    } else {
      el.pause();
      // Rewind only when the clip is genuinely being remade, so a pause between the two
      // passes does not look like a scrub.
      if (step === RENDERING || step === RERENDERING) el.currentTime = 0;
    }
  }, [playing, step]);

  // The second pass is the same shot with a note added — which is how the amendment reads
  // as an edit to the prompt rather than an unrelated second prompt.
  const base = `${lora.triggerWords[0]}, slow push-in, handheld`;
  const amended = `${base}, golden hour`;
  const prompt = step >= AMENDING ? amended : base;

  const working =
    step === RENDERING || step === ENCODING || step === RERENDERING || step === REENCODING;
  const rendering = step === RENDERING || step === RERENDERING;
  const second = step >= AMENDING;

  const framesStep = step === RERENDERING ? RERENDERING : RENDERING;
  const frames = Math.round(useDemoRamp(rendering, SCRIPT[framesStep]) * TOTAL_FRAMES);

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center gap-2 border-b border-border bg-panel px-3 py-2">
        <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-wider text-ink-muted-2">
          prompt
        </span>
        <span className="min-w-0 flex-1 truncate">
          <TypedLine
            key={`${prompt}-${step === WRITING || step === AMENDING ? "typing" : "done"}`}
            text={prompt}
            typing={step === WRITING || step === AMENDING}
          />
        </span>
        <span
          className={cn(
            "shrink-0 border px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-wider transition-colors",
            step === WRITING || step === AMENDING
              ? "border-border-2 text-ink-muted-2"
              : "border-accent bg-accent text-[#06060A]"
          )}
        >
          {second ? "re-render" : "render"}
        </span>
      </div>

      <div className="relative min-h-0 flex-1 bg-panel-2">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster={checkpointPoster(checkpoint)}
          src={checkpointClip(checkpoint)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            working ? "opacity-20 blur-[6px] saturate-[0.4]" : "opacity-100"
          )}
        />

        {rendering && (
          <DemoStatus tone="accent">
            rendering {frames}/{TOTAL_FRAMES}
          </DemoStatus>
        )}
        {(step === ENCODING || step === REENCODING) && (
          <DemoStatus tone="accent">encoding…</DemoStatus>
        )}
        {step === AMENDING && <DemoStatus tone="muted">amending prompt</DemoStatus>}
        {(step === PLAYING || step === REPLAYING) && (
          <>
            <DemoStatus tone="green">
              0:04 · 24fps{second ? " · take 2" : ""}
            </DemoStatus>
            <span className="absolute bottom-2.5 right-3 z-10 font-mono text-[10px] font-semibold tabular-nums text-red drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              −{VIDEO_GENERATE_COST}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
