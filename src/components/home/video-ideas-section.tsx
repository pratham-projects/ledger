import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ImagePlus, Play } from "lucide-react";
import { useSelection } from "@/hooks/use-selection";
import { cn } from "@/lib/utils";

type Idea = { url: string; type: "image" | "video"; name: string; prompt: string };

const SOURCES: Record<string, string[]> = {
  "Marketing campaigns": [
    "make_a_video_ad_for_all_social_media_formats_thumbnail.mp4",
    "create_product_shot_variations_for_my_sku_thumbnail.mp4",
    "build_creative_assets_from_my_brief_thumbnail.png",
    "generate_a_b_ad_variants_thumbnail.png",
    "make_seasonal_versions_of_an_ad_thumbnail.png",
  ],
  Movies: [
    "create_a_multi_shot_scene_2_thumbnail.mp4",
    "lock_a_character_across_angles_thumbnail.jpg",
    "scout_locations_for_a_scene_thumbnail.png",
    "storyboard_a_scene_thumbnail.png",
    "test_color_grades_on_a_shot_thumbnail.png",
  ],
  "Social media": [
    "adapt_one_idea_for_every_platform_thumbnail.png",
    "create_a_week_of_posts_thumbnail.png",
    "remix_a_trend_with_my_product_thumbnail.mp4",
    "create_a_thumbnail_pack_thumbnail.png",
    "make_a_short_vertical_reel_thumbnail.mp4",
  ],
  "Educational content": [
    "create_slides_from_my_content_thumbnail.png",
    "explain_a_concept_in_shots_thumbnail.png",
    "create_a_lesson_visual_set_thumbnail.png",
    "build_an_explainer_video_thumbnail.mp4",
  ],
  "Experimental art": [
    "explore_one_subject_in_many_styles_thumbnail.jpg",
    "create_a_morph_sequence_thumbnail.mp4",
    "make_variations_on_a_theme_thumbnail.png",
    "animate_a_still_many_ways_thumbnail.mp4",
  ],
};

const BASE = "https://d3phaj0sisr2ct.cloudfront.net/app/dashboard/v1/presets/";

/**
 * Every real .mp4 in the preset library, flattened — for anywhere else on the page that
 * wants an autoplaying loop instead of a still. Same CDN, same files this section already
 * trusts; nothing new to source or host.
 */
export const VIDEO_LOOPS: string[] = Object.values(SOURCES)
  .flat()
  .filter((file) => file.endsWith(".mp4"))
  .map((file) => `${BASE}${file}`);

function makeIdea(file: string): Idea {
  const prompt = file
    .replace(/_thumbnail\.(mp4|png|jpg)$/, "")
    .replace(/_/g, " ");
  return { url: `${BASE}${file}`, type: file.endsWith(".mp4") ? "video" : "image", name: file, prompt };
}

/**
 * The `.mp4` half of `SOURCES`, flattened with their category — for `VideoTemplatesPanel`
 * on `/video`. Video-only rather than the full mixed set: a template card there has to
 * actually load into `useVideoGeneration` (whose reference-media effect only reacts to
 * `type === "video"`), so an image card would look clickable and silently do nothing.
 */
export const VIDEO_TEMPLATE_IDEAS: (Idea & { category: string })[] = Object.entries(SOURCES)
  .flatMap(([category, files]) => files.map((file) => ({ category, ...makeIdea(file) })))
  .filter((idea) => idea.type === "video");

export function VideoIdeasSection() {
  const [category, setCategory] = useState("Movies");
  const [offset, setOffset] = useState(0);
  const navigate = useNavigate();
  const { selectReferenceMedia } = useSelection();
  const ideas = useMemo(
    () => SOURCES[category]
      .map(makeIdea)
      .sort((a, b) => Number(b.type === "video") - Number(a.type === "video")),
    [category]
  );
  const visibleIdeas = [0, 1, 2].map((step) => ideas[(offset + step) % ideas.length]);

  const choose = (idea: Idea) => {
    selectReferenceMedia(idea);
    navigate(idea.type === "video" ? "/video" : "/image");
  };

  return (
    <section className="border-b border-border py-10" aria-labelledby="video-ideas-heading">
      <div className="mb-5 flex items-end justify-between gap-4 px-0">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">home.video-ideas</p>
          <h2 id="video-ideas-heading" className="font-display text-[clamp(22px,3vw,32px)] font-semibold tracking-[-0.02em] text-ink">Start with an idea</h2>
        </div>
        <span className="hidden font-mono text-[10px] text-ink-muted-2 sm:block">click a reference to load its prompt</span>
      </div>

      <div className="reel-scroller -mx-1 mb-6 flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Idea categories">
        {Object.keys(SOURCES).map((item) => (
          <button key={item} type="button" role="tab" aria-selected={category === item} onClick={() => { setCategory(item); setOffset(0); }} className={cn("shrink-0 border px-3 py-1.5 font-sans text-[12px] text-ink-muted transition-colors", category === item ? "border-border-2 bg-panel-2 text-ink" : "border-transparent hover:text-ink")}>
            {item}
          </button>
        ))}
      </div>

      <div className="relative grid h-[230px] grid-cols-[minmax(260px,1.5fr)_minmax(160px,0.8fr)_minmax(240px,1.2fr)] gap-2 overflow-hidden sm:h-[270px]">
        {visibleIdeas.map((idea, index) => (
          <button key={idea.url} type="button" onClick={() => choose(idea)} className={cn("group relative min-w-0 overflow-hidden border border-border text-left hover:border-accent", index === 0 && "sm:col-span-1")}>
            {idea.type === "video" ? (
              <video src={idea.url} muted autoPlay loop playsInline preload="metadata" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            ) : (
              <img src={idea.url} alt={idea.prompt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-3 pt-8 font-mono text-[10px] leading-[1.4] text-ink">
              <span className="truncate">{idea.prompt}</span>
              <span className="flex shrink-0 items-center gap-1 text-accent"><ImagePlus className="h-3 w-3" /> use</span>
            </span>
            {idea.type === "video" && <span className="absolute left-3 top-3 border border-border-2 bg-bg/75 p-1.5 text-ink"><Play className="h-3 w-3 fill-current" /></span>}
          </button>
        ))}
        {ideas.length > 3 && (
          <button type="button" aria-label="Show more ideas" onClick={() => setOffset((current) => (current + 1) % ideas.length)} className="absolute right-3 top-1/2 -translate-y-1/2 border border-border-2 bg-bg/75 p-2.5 text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="mt-3 font-mono text-[10px] text-ink-muted-2 sm:hidden">tap a reference to load its prompt and frame</p>
    </section>
  );
}
