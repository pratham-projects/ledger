import { MediaTemplateGrid, type MediaTemplate } from "@/components/tool-workspace/media-template-grid";
import { videoRun } from "@/lib/template-videos";
import { stockRun } from "@/lib/stock";
import { EXAMPLE_PROMPTS, VIDEO_STYLES, DURATIONS, ASPECT_RATIOS } from "@/hooks/use-video-generation";
import { useSelection } from "@/hooks/use-selection";

const COUNT = 20;

/** `EXAMPLE_PROMPTS` is shorter than `COUNT`, so it repeats — a template card only needs
 *  *a* plausible prompt, not a unique one; the clip is what's actually being offered. A
 *  distinct `seed` per call site (Templates vs. My Generations) so the two tabs don't show
 *  the literal same run of clips. */
function buildItems(seed: string): MediaTemplate[] {
  return videoRun(seed, COUNT).map(({ url, aspect }, i) => ({
    id: `${seed}-${i}`,
    url,
    aspect,
    type: "video",
    name: `Template clip ${i + 1}`,
    prompt: EXAMPLE_PROMPTS[i % EXAMPLE_PROMPTS.length],
    references: stockRun(`${seed}-ref-${i}`, 2, "portrait").map((s) => s.src(140)),
    settings: [
      VIDEO_STYLES[i % VIDEO_STYLES.length],
      `${DURATIONS[i % DURATIONS.length]}s`,
      ASPECT_RATIOS[i % ASPECT_RATIOS.length],
    ],
  }));
}

export const VIDEO_TEMPLATE_ITEMS = buildItems("video-templates-panel");
export const VIDEO_MY_GENERATIONS_ITEMS = buildItems("video-my-generations");

/**
 * The video tool's "Templates" tab — real clips from `lib/template-videos`, each one a tap
 * away from becoming the composer's prompt and start frame via `selectReferenceMedia`
 * (read back by `useVideoGeneration`'s own effect; see the note there).
 */
export function VideoTemplatesPanel() {
  const { selectReferenceMedia } = useSelection();
  return <MediaTemplateGrid items={VIDEO_TEMPLATE_ITEMS} unit="clips" onSelect={selectReferenceMedia} />;
}
