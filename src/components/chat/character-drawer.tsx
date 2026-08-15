/**
 * Who they are, and what they're made of.
 *
 * This used to be a collapsible panel stacked *above* the transcript, which meant that
 * opening it pushed the conversation off-screen — editing a character and reading them
 * were mutually exclusive. As a drawer it narrows the log on a wide screen instead of
 * covering it, matching the RPG session drawer, and only takes the screen below md where
 * there is no width to give.
 */
import { useRef, useState, type ReactNode } from "react";
import { ChevronDown, Download, Layers, Sparkles, Upload, X } from "lucide-react";
import { StockFill } from "@/components/media/stock-fill";
import { SourcePicker } from "@/components/session/source-picker";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/hooks/use-selection";
import { NAME_MAX_LENGTH, type Chat, type Character } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

type Tab = "identity" | "source";

const FIELDS: { key: keyof Character; label: string; hint: string; placeholder: string }[] = [
  {
    key: "description",
    label: "character description",
    hint: "The system prompt in everything but name.",
    placeholder: "Appearance, occupation, how they talk, what they want…",
  },
  {
    key: "anonDescription",
    label: "your persona",
    hint: "Optional — who they think they're talking to.",
    placeholder: "Who are you playing as in this scene?",
  },
  {
    key: "scenarioLore",
    label: "scenario & lore",
    hint: "Where this happens and what already happened.",
    placeholder: "World-building, setting, backstory…",
  },
];

/**
 * Hand-authored starting points, not a model call — there is no LLM in this build (see
 * `docs/goal.md`). The sparkle button drops one of these into the field rather than doing
 * nothing, which is what it did before; the tooltip says exactly that.
 */
const FIELD_SUGGESTIONS: Record<string, string[]> = {
  description:
    [
      "A former lighthouse keeper who talks in weather metaphors and notices everything. Dry humor, slow to trust, warmer than she lets on.",
      "A retired duelist who now repairs clocks. Precise, courteous, allergic to wasted motion — in speech or otherwise.",
      "A street cartographer who maps places that keep changing. Curious, a little breathless, always slightly lost herself.",
    ],
  anonDescription: [
    "A traveling correspondent nobody has quite placed yet.",
    "An old acquaintance back after a long silence.",
    "Someone who was told to ask for this person by name.",
  ],
  scenarioLore: [
    "The two of you meet at a night market that only opens when it rains.",
    "This is the third time this week you've ended up at the same counter, at the same hour.",
    "The letter that brought you here was six years late and unsigned.",
  ],
};

export function CharacterDrawer({ chat, onClose }: { chat: Chat; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("identity");
  const [picking, setPicking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { lora, checkpoint, strength, selectLora } = useSelection();

  return (
    <aside className="absolute inset-0 z-50 flex flex-col border-border bg-panel md:static md:z-auto md:w-[340px] md:shrink-0 md:border-l">
      <div className="flex items-center border-b border-border">
        <TabButton active={tab === "identity"} onClick={() => setTab("identity")}>
          identity
        </TabButton>
        <TabButton active={tab === "source"} onClick={() => setTab("source")}>
          source
        </TabButton>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the character panel"
          className="ml-auto px-4 py-3 text-ink-muted-2 transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="ledger-scrollbar flex-1 overflow-y-auto">
        {tab === "identity" ? (
          <div className="m-swap flex flex-col">
            <Section title="who">
              <div className="flex items-start gap-3">
                <div className="w-[72px] shrink-0 overflow-hidden border border-border-2 bg-panel-2">
                  <div className="aspect-[3/4]">
                    <StockFill seedKey={chat.portraitSeed} alt="" sizes="72px" subject="portrait" />
                  </div>
                </div>
                <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-muted-2">
                    name
                  </span>
                  <input
                    value={chat.character.name}
                    maxLength={NAME_MAX_LENGTH}
                    onChange={(e) => chat.updateCharacterField("name", e.target.value)}
                    className="w-full border border-border-2 bg-panel-2 px-2.5 py-1.5 font-mono text-[13px] text-ink transition-colors focus:border-accent focus:outline-none"
                  />
                  <span className="font-mono text-[10px] leading-[1.5] text-ink-muted-2">
                    {chat.character.name.length}/{NAME_MAX_LENGTH} — the portrait follows the
                    loaded LoRA, not the name.
                  </span>
                </label>
              </div>
            </Section>

            {FIELDS.map((field) => (
              <Section key={String(field.key)} title={field.label} hint={field.hint}>
                <div className="relative">
                  <Textarea
                    rows={field.key === "description" ? 5 : 3}
                    value={chat.character[field.key]}
                    onChange={(e) => chat.updateCharacterField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    aria-label={field.label}
                    className="text-[13.5px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const pool = FIELD_SUGGESTIONS[field.key] ?? [];
                      const current = chat.character[field.key];
                      const options = pool.filter((s) => s !== current);
                      const next = options[Math.floor(Math.random() * options.length)] ?? pool[0];
                      if (next) chat.updateCharacterField(field.key, next);
                    }}
                    title={`Suggest a ${field.label}`}
                    aria-label={`Suggest a ${field.label}`}
                    className="absolute right-2 top-2 text-ink-muted-2 transition-colors hover:text-accent"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </Section>
            ))}

            <Section title="character file" sub="json">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" onClick={chat.exportCharacter}>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  export
                </Button>
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  import
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) chat.importCharacter(file);
                    e.target.value = "";
                  }}
                />
              </div>
              {chat.importError && (
                <p
                  role="alert"
                  className="m-0 border border-red/40 px-2.5 py-2 font-mono text-[11px] leading-[1.5] text-red"
                >
                  {chat.importError}
                </p>
              )}
              <p className="m-0 font-mono text-[10px] leading-[1.6] text-ink-muted-2">
                Character files are validated before import.
              </p>
            </Section>

            <Section title="conversation" sub={`${chat.messages.length} messages`}>
              <button
                type="button"
                onClick={chat.clearConversation}
                className="w-fit font-mono text-[11.5px] text-ink-muted-2 transition-colors hover:text-red"
              >
                clear and start over
              </button>
            </Section>
          </div>
        ) : (
          <div className="m-swap flex flex-col">
            <Section title="their face">
              {lora ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden border border-border-2" aria-hidden="true">
                      <StockFill seedKey={lora.id} alt="" sizes="48px" subject="portrait" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                        loaded
                      </span>
                      <span className="truncate font-sans text-[15px] font-semibold text-ink" title={lora.name}>
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
                      trained for {lora.compatible.join("/")}, not {checkpoint.family} — their
                      look may drift between pictures.
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-start gap-2 text-ink-muted-2">
                  <Layers className="h-4 w-4 shrink-0 translate-y-0.5" aria-hidden="true" />
                  <p className="m-0 font-sans text-[13px] leading-[1.55]">
                    Nothing loaded. They still have a face and still send pictures — those
                    just won't hold to any particular character or style.
                  </p>
                </div>
              )}

              {/* Swapping happens here rather than on /browse. This conversation lives in
                  the route's own hook, so navigating to the catalog discards it — which is
                  what the link that used to sit here did, under copy claiming otherwise. */}
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
                      domain="chat"
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
                swapping here keeps this conversation. leaving for the catalog does not — it
                only exists in this tab.
              </p>
            </Section>

            <Section title="cost">
              <dl className="m-0 flex flex-col border border-border">
                <Row label="every message" value="free" />
                <Row label="pictures" value="free" />
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
        active ? "border-accent text-accent" : "border-transparent text-ink-muted-2 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

/**
 * `sub` is a short value that belongs beside the title (a count, a format). `hint` is a
 * sentence and gets its own line — side by side at 340px they collide and clip, which is
 * exactly what a right-aligned label does the moment it stops being one word.
 */
function Section({
  title,
  sub,
  hint,
  children,
}: {
  title: string;
  sub?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5 border-b border-border p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="m-0 min-w-0 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
            {title}
          </h2>
          {sub && <span className="shrink-0 font-mono text-[10.5px] text-ink-muted-2">{sub}</span>}
        </div>
        {hint && (
          <p className="m-0 font-sans text-[12px] leading-[1.5] text-ink-muted-2">{hint}</p>
        )}
      </div>
      {children}
    </section>
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
