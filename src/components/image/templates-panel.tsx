import { MediaTemplateGrid, type MediaTemplate } from "@/components/tool-workspace/media-template-grid";
import { imageRun } from "@/lib/template-images";
import { stockRun } from "@/lib/stock";
import { EXAMPLE_PROMPTS, ART_STYLES, SHAPES } from "@/hooks/use-image-generation";
import { useSelection } from "@/hooks/use-selection";

const COUNT = 20;

/** `EXAMPLE_PROMPTS` is shorter than `COUNT`, so it repeats — same reasoning as the video
 *  panel's own builder: the picture is the offer, the prompt just needs to be plausible.
 *  A distinct `seed` per call site so Templates and My Generations don't show the same run. */
function buildItems(seed: string): MediaTemplate[] {
  return imageRun(seed, COUNT).map(({ url, aspect }, i) => ({
    id: `${seed}-${i}`,
    url,
    aspect,
    type: "image",
    name: `Template image ${i + 1}`,
    prompt: EXAMPLE_PROMPTS[i % EXAMPLE_PROMPTS.length],
    references: stockRun(`${seed}-ref-${i}`, 2, "portrait").map((s) => s.src(140)),
    settings: [ART_STYLES[i % ART_STYLES.length], SHAPES[i % SHAPES.length]],
  }));
}

export const IMAGE_TEMPLATE_ITEMS = buildItems("image-templates-panel");
export const IMAGE_MY_GENERATIONS_ITEMS = buildItems("image-my-generations");

/**
 * The image tool's "Templates" tab — real stills from `lib/template-images`, each a tap
 * away from becoming the composer's prompt via `selectReferenceMedia` (read back by
 * `useImageGeneration`'s own effect).
 */
export function ImageTemplatesPanel() {
  const { selectReferenceMedia } = useSelection();
  return <MediaTemplateGrid items={IMAGE_TEMPLATE_ITEMS} unit="images" onSelect={selectReferenceMedia} />;
}
