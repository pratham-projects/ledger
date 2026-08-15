/**
 * Session controls for the immersive surface.
 *
 * From md up this is a column in the flex row, so opening it *narrows the log* instead of
 * covering it — the point of a wide screen is being able to steer the world and keep
 * reading it at once. Below md there is no width to spare, so it takes the screen.
 *
 * The `source` tab is where our LoRA spine plugs in: it holds the position that a
 * generic "image generator" setting would occupy, and answers what illustrates this
 * adventure.
 */
import { useState, type ReactNode } from "react";
import { Backpack, ChevronDown, Layers, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { StockFill } from "@/components/media/stock-fill";
import { SourcePicker } from "@/components/session/source-picker";
import { SimpleSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/hooks/use-selection";
import {
  CHARACTER_CLASSES,
  RPG_ILLUSTRATE_COST,
  RPG_TURN_COST,
  WORLD_THEMES,
  type useRpg,
} from "@/hooks/use-rpg";

type Rpg = ReturnType<typeof useRpg>;
type Tab = "adventure" | "source";

export function RpgDrawer({ rpg, onClose }: { rpg: Rpg; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("adventure");
  const [picking, setPicking] = useState(false);
  const { lora, checkpoint, strength, selectLora } = useSelection();

  return (
    <aside className="absolute inset-0 z-50 flex flex-col border-border bg-panel md:static md:z-auto md:w-[360px] md:shrink-0 md:border-l">
      <div className="flex items-center border-b border-border">
        <TabButton active={tab === "adventure"} onClick={() => setTab("adventure")}>
          adventure
        </TabButton>
        <TabButton active={tab === "source"} onClick={() => setTab("source")}>
          source
        </TabButton>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the panel"
          className="ml-auto px-4 py-3 text-ink-muted-2 transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="ledger-scrollbar flex-1 overflow-y-auto">
        {tab === "adventure" ? (
          <div className="flex flex-col">
            <Section title="plot">
              <Field label="world">
                <SimpleSelect
                  value={rpg.config.worldTheme}
                  onValueChange={rpg.setWorld}
                  options={WORLD_THEMES.map((w) => ({ value: w.id, label: w.name }))}
                />
              </Field>
              <Field label="class">
                <SimpleSelect
                  value={rpg.config.characterClass}
                  onValueChange={rpg.setCharacterClass}
                  options={CHARACTER_CLASSES.map((c) => ({ value: c.id, label: c.name }))}
                />
              </Field>
            </Section>

            <Section
              title="director's note"
              sub="carries between turns"
            >
              <Textarea
                rows={4}
                value={rpg.directorNote}
                onChange={(e) => rpg.setDirectorNote(e.target.value)}
                placeholder="Keep it bleak. Don't speak for me. Nobody trusts anybody."
                aria-label="Standing instructions for the narrator"
                className="text-[13.5px]"
              />
              <p className="m-0 font-mono text-[10px] leading-[1.6] text-ink-muted-2">
                stored in this tab only. narration is authored, not generated, so this
                doesn't change what comes back yet — it's the field the real narrator will
                read.
              </p>
            </Section>

            <Section title="carried" sub={`${rpg.carried.length} items`}>
              {rpg.carried.length === 0 ? (
                <div className="flex items-center gap-2 text-ink-muted-2">
                  <Backpack className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <p className="m-0 font-mono text-[11.5px]">carrying nothing</p>
                </div>
              ) : (
                <ul className="m-0 flex list-none flex-col border border-border p-0">
                  {rpg.carried.map((item) => (
                    <li
                      key={item}
                      className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 last:border-b-0"
                    >
                      <span className="font-sans text-[13.5px] text-ink">{item}</span>
                      <button
                        type="button"
                        onClick={() => rpg.dropItem(item)}
                        aria-label={`Drop ${item}`}
                        className="text-ink-muted-2 transition-colors hover:text-red"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="session">
              <dl className="m-0 flex flex-col border border-border">
                <Row label="turns taken" value={String(rpg.turnCount)} />
                <Row label="entries in log" value={String(rpg.turns.length)} />
              </dl>
              <button
                type="button"
                onClick={rpg.abandon}
                className="w-fit font-mono text-[11.5px] text-ink-muted-2 transition-colors hover:text-red"
              >
                abandon and start over
              </button>
            </Section>
          </div>
        ) : (
          <div className="flex flex-col">
            <Section title="illustrated by">
              {lora ? (
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 shrink-0 overflow-hidden border border-border-2"
                      aria-hidden="true"
                    >
                      <StockFill seedKey={lora.id} alt="" sizes="48px" subject="portrait" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                        loaded
                      </span>
                      <span className="truncate font-sans text-[15px] font-semibold text-ink">
                        {lora.name}
                      </span>
                    </div>
                  </div>
                  <dl className="m-0 flex flex-col border border-border">
                    <Row label="base model" value={checkpoint.name} />
                    <Row label="strength" value={strength.toFixed(2)} />
                    <Row label="triggers" value={lora.triggerWords.join(", ")} />
                  </dl>
                  {!lora.compatible.includes(checkpoint.family) && (
                    <p className="m-0 border border-amber/40 px-2.5 py-2 font-mono text-[10.5px] leading-[1.5] text-amber">
                      trained for {lora.compatible.join("/")}, not {checkpoint.family} — scenes
                      may drift.
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-start gap-2 text-ink-muted-2">
                  <Layers className="h-4 w-4 shrink-0 translate-y-0.5" aria-hidden="true" />
                  <p className="m-0 font-sans text-[13px] leading-[1.55]">
                    Nothing loaded. Scenes still illustrate — they just won't hold to any
                    particular character or style.
                  </p>
                </div>
              )}

              {/* Swapping happens here rather than on /browse. The session lives in this
                  route's hook, so navigating to the catalog mid-adventure would discard
                  the whole log — which is exactly what the link that used to sit here did,
                  under copy claiming the opposite. */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setPicking((v) => !v)}
                aria-expanded={picking}
              >
                <ChevronDown
                  className={cn("h-3 w-3 transition-transform", picking && "rotate-180")}
                  aria-hidden="true"
                />
                {picking ? "close" : lora ? "change source" : "pick a source"}
              </Button>

              <div className="m-expand -mx-4" data-open={picking}>
                <div>
                  {picking && (
                    <SourcePicker
                      domain="rpg"
                      compact
                      checkpoint={checkpoint}
                      selectedId={lora?.id ?? null}
                      onSelect={selectLora}
                      onClose={() => setPicking(false)}
                    />
                  )}
                </div>
              </div>

              <p className="m-0 font-mono text-[10px] leading-[1.6] text-ink-muted-2">
                swapping here keeps the adventure. leaving for the catalog does not — the
                session only exists in this tab.
              </p>
            </Section>

            <Section title="cost">
              <dl className="m-0 flex flex-col border border-border">
                <Row label="take a turn" value={`${RPG_TURN_COST} cr`} />
                <Row label="continue" value={`${RPG_TURN_COST} cr`} />
                <Row label="retry" value={`${RPG_TURN_COST} cr`} />
                <Row label="write it yourself" value="free" />
                <Row label="illustrate a scene" value={`${RPG_ILLUSTRATE_COST} cr`} />
                <Row label="erase" value="free" />
              </dl>
            </Section>
          </div>
        )}
      </div>
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-b-2 px-4 py-3 font-mono text-[12px] transition-colors",
        active
          ? "border-accent text-accent"
          : "border-transparent text-ink-muted-2 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5 border-b border-border p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="m-0 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
          {title}
        </h2>
        {sub && <span className="font-mono text-[10.5px] text-ink-muted-2">{sub}</span>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-muted-2">
        {label}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border px-3 py-2 last:border-b-0">
      <dt className="shrink-0 font-mono text-[10.5px] uppercase tracking-wider text-ink-muted-2">
        {label}
      </dt>
      <dd className="m-0 truncate text-right font-mono text-[12px] text-ink" title={value}>
        {value}
      </dd>
    </div>
  );
}
