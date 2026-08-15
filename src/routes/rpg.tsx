/**
 * THESIS: a turn-based RPG that reads like a kept log rather than a chat thread — the
 * world's narration is the page, your actions are ruled entries against it, and the
 * illustration is something you spend on deliberately, not decoration that appears.
 * OWN-WORLD: Desk's tokens throughout. Narration sits in a prose measure; actions are
 * mono, accent-marked, and indented against a rule.
 * STORY: the visitor arrives to a world, a class and a pack already chosen for them, and
 * can drop in on the first frame — or spend as long as they like disagreeing with it.
 * FIRST VIEWPORT: mounted in `HubShell` (`App.tsx`), same as `/image`, `/video` and
 * `/chat`. Pre-session this route is its own setup surface with the hub's rail beside it;
 * beginning hands off to `PlaySurface`, which docks in place by default and only takes
 * the viewport if asked to.
 * FORM: the setup is picture-led — eight worlds and eight classes as four-across grids,
 * because choosing a place is a visual decision that a dropdown of six phrases cannot
 * hold. Play deliberately shares none of this; a session in progress is a reading
 * surface, not a tool surface.
 */
import { SourceStrip } from "@/components/session/source-strip";
import { SetupPanel, SetupSection } from "@/components/wizard/setup-panel";
import { ChoiceGrid } from "@/components/wizard/choice-grid";
import { TagField } from "@/components/wizard/tag-field";
import { PlaySurface } from "@/components/rpg/play-surface";
import { RpgTemplatesPanel } from "@/components/rpg/templates-panel";
import { OutOfCreditsModal } from "@/components/credits/out-of-credits-modal";
import { ToolWorkspace } from "@/components/tool-workspace/workspace";
import { ToolHead } from "@/components/tool-workspace/tool-head";
import { WorkspaceTabs } from "@/components/tool-workspace/workspace-tabs";
import { MyGenerationsPanel } from "@/components/tool-workspace/my-generations-panel";
import {
  useRpg,
  WORLD_THEMES,
  CHARACTER_CLASSES,
  COMMON_ITEMS,
  RPG_BEGIN_COST,
} from "@/hooks/use-rpg";

export function Rpg() {
  const rpg = useRpg();

  /**
   * Once a session is running the adventure takes the viewport. Note this is a state
   * switch, not a route change — the session lives in this hook, and routing away and
   * back would silently discard it.
   */
  if (rpg.started) {
    return (
      <>
        <PlaySurface rpg={rpg} />
        {rpg.blocked && (
          <OutOfCreditsModal
            requiredCredits={rpg.blocked.cost}
            action={rpg.blocked.action}
            onClose={rpg.dismissBlocked}
          />
        )}
      </>
    );
  }

  /**
   * The chips on offer: what this world and this class hand you, plus the things anyone
   * might bring anywhere. Kit items stay in the list once dropped, so removing the
   * crowbar leaves a way to change your mind rather than deleting the option.
   */
  const suggestions = Array.from(
    new Set([...rpg.world.kit, ...rpg.characterClass.kit, ...COMMON_ITEMS])
  );

  return (
    <>
      <ToolWorkspace
        storageKey="rpg"
        middle={
          <>
            <ToolHead
              kicker="rpg.session"
              title={
                <>
                  Go somewhere <span className="desk-em">that wants you gone.</span>
                </>
              }
            >
              A turn-based adventure that keeps a log. A world, a class and a pack are
              already picked below — drop in now, or change any of it first.
            </ToolHead>

            <main className="flex flex-col gap-5">
              <SourceStrip
                domain="rpg"
                emptyHint="Nothing loaded. Pick a LoRA and it illustrates this one — or drop in without, and the adventure stays text only."
              />

              <SetupPanel
                domain="rpg"
                blurb="Everything here is pre-rolled and playable as it stands — nothing is required of you. None of it is sent anywhere; the session runs entirely in this tab."
                onReroll={rpg.reroll}
                rerollLabel="roll all three"
                onBegin={rpg.begin}
                beginLabel="drop in"
                cost={RPG_BEGIN_COST}
              >
                <SetupSection
                  label="world theme"
                  hint="Where this happens, and what's wrong with it. Switching worlds swaps the gear the place itself hands you."
                >
                  <ChoiceGrid
                    name="world"
                    label="World theme"
                    options={WORLD_THEMES}
                    value={rpg.config.worldTheme}
                    onChange={rpg.setWorld}
                    subject="scene"
                  />
                </SetupSection>

                <SetupSection
                  label="character class"
                  hint="How you tend to solve things. It sets your tools and what the narrator points out to you."
                >
                  <ChoiceGrid
                    name="class"
                    label="Character class"
                    options={CHARACTER_CLASSES}
                    value={rpg.config.characterClass}
                    onChange={rpg.setCharacterClass}
                    subject="portrait"
                  />
                </SetupSection>

                <SetupSection
                  label="starting inventory"
                  hint="Pick to add or drop, or type anything that isn't listed. You can drop things once you're in, but not add them."
                  action={
                    <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ink-muted-2">
                      {rpg.config.inventory.length} carried
                    </span>
                  }
                >
                  <TagField
                    id="rpg-inventory"
                    legend="starting inventory"
                    selected={rpg.config.inventory}
                    suggestions={suggestions}
                    onToggle={rpg.toggleItem}
                    onAdd={rpg.addItems}
                    placeholder="a dead man's compass, half a map…"
                    emptyNote="Empty-handed. That's a legitimate way to play it — pick anything below to change your mind."
                  />
                </SetupSection>
              </SetupPanel>

            </main>
          </>
        }
        right={
          <WorkspaceTabs
            templates={
              <RpgTemplatesPanel
                activeWorldId={rpg.config.worldTheme}
                activeClassId={rpg.config.characterClass}
                onSelectWorld={rpg.setWorld}
                onSelectClass={rpg.setCharacterClass}
              />
            }
            myGenerations={<MyGenerationsPanel resultCount={0} />}
          />
        }
      />

      {rpg.blocked && (
        <OutOfCreditsModal
          requiredCredits={rpg.blocked.cost}
          action={rpg.blocked.action}
          onClose={rpg.dismissBlocked}
        />
      )}
    </>
  );
}
