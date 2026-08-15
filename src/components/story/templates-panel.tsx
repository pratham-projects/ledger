import { useMemo } from "react";
import { PresetGrid } from "@/components/tool-workspace/preset-grid";
import { stockRun } from "@/lib/stock";
import { GENRES, CAST_PRESETS } from "@/hooks/use-story";

/** A scenario tile per genre — its first premise, standing in for a location's opening
 *  beat. Tapping sets both the genre and the plot text, same reasoning as the "Locations"
 *  section reusing genre for its mood. */
const SCENARIO_PRESETS = GENRES.map((g) => ({
  id: g.id,
  name: g.name,
  note: g.premises[0],
}));

/**
 * "My Generations", logged in: the cast pairs the visitor has already used, standing in
 * for a saved roster — same reasoning as chat's `useMyCharacters`. A distinct stock seed
 * keeps these portraits from repeating the Templates tab's.
 */
export function useMyStoryCharacters(onSelectCast: (names: string[]) => void) {
  const previews = useMemo(() => stockRun("my-story-cast", CAST_PRESETS.length, "portrait"), []);
  const items = useMemo(
    () => CAST_PRESETS.map((c, i) => ({ id: c.id, name: c.name, note: c.note, image: previews[i].src(96) })),
    [previews]
  );
  const onSelect = (id: string) => {
    const preset = CAST_PRESETS.find((c) => c.id === id);
    if (preset) onSelectCast(preset.names);
  };
  return { items, onSelect };
}

/**
 * Same reasoning as RPG's templates tab: the middle column already has full pickers for
 * genre and cast (`ChoiceGrid`, `TagField`); this is a faster path to the same state, one
 * tap instead of opening either. "Locations" reuses genre — the genre grid in the setup
 * panel is keyed to a place and its mood (a drowned parish, a rain-soaked city), so it
 * doubles as the closest thing this tool has to a location picker.
 */
export function StoryTemplatesPanel({
  activeGenreId,
  onSelectGenre,
  onSelectCast,
  onSelectScenario,
}: {
  activeGenreId: string;
  onSelectGenre: (id: string) => void;
  onSelectCast: (names: string[]) => void;
  onSelectScenario?: (id: string) => void;
}) {
  const castPreviews = useMemo(() => stockRun("story-cast", CAST_PRESETS.length, "portrait"), []);
  const genrePreviews = useMemo(() => stockRun("genre", GENRES.length, "scene"), []);
  const scenarioPreviews = useMemo(
    () => stockRun("story-scenario", SCENARIO_PRESETS.length, "scene"),
    []
  );

  const characterItems = useMemo(
    () => CAST_PRESETS.map((c, i) => ({ id: c.id, name: c.name, note: c.note, image: castPreviews[i].src(96) })),
    [castPreviews]
  );
  const locationItems = useMemo(
    () => GENRES.map((g, i) => ({ id: g.id, name: g.name, note: g.note, image: genrePreviews[i].src(96) })),
    [genrePreviews]
  );
  const scenarioItems = useMemo(
    () => SCENARIO_PRESETS.map((s, i) => ({ ...s, image: scenarioPreviews[i].src(96) })),
    [scenarioPreviews]
  );

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="mb-3 text-[16px] font-semibold leading-[1.3] text-ink">Characters</p>
        <PresetGrid
          items={characterItems}
          layout="scroll"
          onSelect={(id) => {
            const preset = CAST_PRESETS.find((c) => c.id === id);
            if (preset) onSelectCast(preset.names);
          }}
        />
      </section>
      <section>
        <p className="mb-3 text-[16px] font-semibold leading-[1.3] text-ink">Locations</p>
        <PresetGrid
          items={locationItems}
          activeId={activeGenreId}
          onSelect={onSelectGenre}
          aspect={4 / 3}
          layout="scroll"
        />
      </section>
      <section>
        <p className="mb-3 text-[16px] font-semibold leading-[1.3] text-ink">Scenarios</p>
        <PresetGrid
          items={scenarioItems}
          onSelect={(id) => (onSelectScenario ?? onSelectGenre)(id)}
          aspect={4 / 3}
          layout="scroll"
        />
      </section>
    </div>
  );
}
