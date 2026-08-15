import { useMemo } from "react";
import { PresetGrid } from "@/components/tool-workspace/preset-grid";
import { stockRun } from "@/lib/stock";
import { WORLD_THEMES, CHARACTER_CLASSES } from "@/hooks/use-rpg";

/**
 * RPG's setup already has a rich picker for world/class/inventory in the middle column
 * (`ChoiceGrid` inside `SetupPanel`) — this tab isn't a second way to configure those.
 * It's a faster path in: tap a class or a world and it's set, the way a template loads a
 * prompt elsewhere, without opening the grid at all.
 *
 * Images come from `stockRun` keyed the same way `ChoiceGrid` keys them in the setup
 * panel ("class"/"portrait", "world"/"scene") — same seed, same pool, so a class or world
 * shows the identical still here as it does in the grid it's shortcutting.
 */
export function RpgTemplatesPanel({
  activeWorldId,
  activeClassId,
  onSelectWorld,
  onSelectClass,
}: {
  activeWorldId: string;
  activeClassId: string;
  onSelectWorld: (id: string) => void;
  onSelectClass: (id: string) => void;
}) {
  const classPreviews = useMemo(
    () => stockRun("class", CHARACTER_CLASSES.length, "portrait"),
    []
  );
  const worldPreviews = useMemo(() => stockRun("world", WORLD_THEMES.length, "scene"), []);

  const characterItems = useMemo(
    () =>
      CHARACTER_CLASSES.map((c, i) => ({
        id: c.id,
        name: c.name,
        note: c.note,
        image: classPreviews[i].src(96),
      })),
    [classPreviews]
  );
  const locationItems = useMemo(
    () =>
      WORLD_THEMES.map((w, i) => ({
        id: w.id,
        name: w.name,
        note: w.note,
        image: worldPreviews[i].src(96),
      })),
    [worldPreviews]
  );

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="mb-3 text-[16px] font-semibold leading-[1.3] text-ink">Characters</p>
        <PresetGrid
          items={characterItems}
          activeId={activeClassId}
          onSelect={onSelectClass}
          layout="scroll"
        />
      </section>
      <section>
        <p className="mb-3 text-[16px] font-semibold leading-[1.3] text-ink">Locations</p>
        <PresetGrid
          items={locationItems}
          activeId={activeWorldId}
          onSelect={onSelectWorld}
          aspect={4 / 3}
          layout="scroll"
        />
      </section>
    </div>
  );
}
