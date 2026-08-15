import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { CHECKPOINTS } from "@/lib/catalog";
import { MediaTemplateGrid, type MediaTemplate } from "@/components/tool-workspace/media-template-grid";
import { PresetGrid } from "@/components/tool-workspace/preset-grid";
import type { Preset } from "@/components/tool-workspace/preset-list";

// Reuses one of the checkpoint preview clips already self-hosted under `public/models/`
// (see `lib/catalog.ts`) rather than a dedicated asset — this is decorative chrome behind
// the login pitch, not a specific claim about output, so borrowing an existing local clip
// beats hotlinking or minting a new one.
const SHOWCASE_VIDEO = "/models/lumen-xl.mp4";

/**
 * The "My Generations" tab. There is no account-backed generation history in this
 * build — this stays honest on both sides of login rather than pretending otherwise.
 *
 * Logged out: the pitch for logging in, structurally modelled on how reference sites
 * sell the same account wall (a model row, a line of copy, one clip, one CTA) — but every
 * word and every model name is ours, and the CTA opens this app's real login modal rather
 * than a signup flow that doesn't exist.
 *
 * Logged in with `items` supplied (image/video): the same template media, reused rather
 * than duplicated content, standing in for "what you've made" the way it stands in for
 * "starting points" one tab over — same disclosure either way. Tools that don't pass
 * `items` (chat/RPG/story) fall back to a plain session-count message.
 */
export function MyGenerationsPanel({
  resultCount,
  items,
  unit,
  onSelect,
  characterItems,
  onSelectCharacter,
}: {
  resultCount: number;
  items?: MediaTemplate[];
  unit?: string;
  onSelect?: (item: MediaTemplate) => void;
  /** Chat/RPG/story: a grid of the visitor's own characters, locations or scenarios —
   *  only ever shown logged in, same disclosure as the `items` branch below. */
  characterItems?: Preset[];
  onSelectCharacter?: (id: string) => void;
}) {
  const auth = useAuth();

  if (!auth.isLoggedIn) {
    return (
      <div>
        <h3 className="desk-display m-0 text-[22px] text-ink">
          Save <span className="desk-em">every generation.</span>
        </h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {CHECKPOINTS.map((cp) => (
            <span key={cp.id} className="hub-modifier">
              {cp.name}
            </span>
          ))}
        </div>

        <p className="mt-3 max-w-[46ch] text-[13.5px] leading-[1.6] text-ink-muted">
          Log in and everything you generate across image, video, chat, RPG and story stays
          in one place — instead of disappearing the moment you close the tab.
        </p>

        <Button variant="primary" size="sm" onClick={auth.openLoginModal} className="mt-4">
          Log in
        </Button>

        <div className="tplx-showcase mt-6">
          <video src={SHOWCASE_VIDEO} muted loop autoPlay playsInline preload="metadata" />
        </div>
      </div>
    );
  }

  if (characterItems && characterItems.length > 0 && onSelectCharacter) {
    return (
      <>
        <p className="mb-3 text-[12.5px] leading-[1.5] text-ink-muted-2">
          What you've made before, plus this session.
        </p>
        <PresetGrid items={characterItems} onSelect={onSelectCharacter} layout="scroll" />
      </>
    );
  }

  if (items && items.length > 0 && onSelect) {
    return (
      <>
        <p className="mb-3 text-[12.5px] leading-[1.5] text-ink-muted-2">
          {resultCount > 0
            ? `${resultCount} result${resultCount === 1 ? "" : "s"} this session, plus what you've made before.`
            : "Nothing yet this session — here's what you've made before."}
        </p>
        <MediaTemplateGrid items={items} unit={unit ?? "results"} onSelect={onSelect} filterable />
      </>
    );
  }

  return (
    <div className="tool-tab-empty">
      <p className="m-0 text-[13.5px] leading-[1.6] text-ink-muted">
        {resultCount > 0
          ? `${resultCount} result${resultCount === 1 ? "" : "s"} so far this session — see them in the results list.`
          : "Nothing yet. Generate something and it'll show up here."}
      </p>
    </div>
  );
}
