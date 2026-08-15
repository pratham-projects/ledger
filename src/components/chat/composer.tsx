/**
 * One field, four voices.
 *
 * The role selector is the composer's whole idea, so it carries identity rather than
 * labels alone: writing as the character shows her face on the control, writing as
 * yourself shows a mark. You can see who you are about to speak as without reading.
 *
 * A user-supplied name goes on that control, which is where the old build broke — a
 * 60-character name stretched the tab strip until it forced the panel wider than the
 * page. The label is shortened for display, capped in width, and carries the full string
 * on `title` and `aria-label`.
 */
import { useEffect, useRef } from "react";
import { Image as ImageIcon, Quote, User } from "lucide-react";
import { StockFill } from "@/components/media/stock-fill";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { shortName, type MessageRole } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

/**
 * Short enough to stay on one line in a phone-width field — a placeholder that wraps and
 * clips is worse than a terse one. The instruction lives in the hint below, which has the
 * full width of the composer to say it.
 */
const PLACEHOLDERS: Record<MessageRole, string> = {
  anon: "Say something…",
  chloe: "Write their line…",
  narrator: "Set the scene…",
  image: "Describe a picture…",
};

const HINTS: Record<MessageRole, string> = {
  anon: "as yourself — they answer",
  chloe: "as them — nothing is generated",
  narrator: "narration, not speech",
  image: "a picture in the scene, from the loaded LoRA",
};

export function Composer({
  role,
  onRoleChange,
  text,
  onTextChange,
  onSend,
  characterName,
  portraitSeed,
}: {
  role: MessageRole;
  onRoleChange: (role: MessageRole) => void;
  text: string;
  onTextChange: (text: string) => void;
  onSend: () => void;
  characterName: string;
  portraitSeed: string;
}) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  // Switching voice is a decision to write in it, so the caret goes there. `preventScroll`
  // is load-bearing: the shell's fixed-height frame is still programmatically scrollable
  // even at `overflow: hidden`, so a plain focus() nudges the whole stage upward and
  // clips the transcript's first line.
  useEffect(() => {
    fieldRef.current?.focus({ preventScroll: true });
  }, [role]);

  return (
    /* No border or background of its own: SessionSurface's dock supplies both, and two
       stacked rules read as a seam. */
    <div>
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-2.5 px-4 py-3 sm:px-8 sm:py-4">
        <div role="radiogroup" aria-label="Write as" className="desk-toolbar flex min-w-0">
          <RoleButton
            active={role === "anon"}
            onClick={() => onRoleChange("anon")}
            label="you"
            fullLabel="Write as yourself"
          >
            <User className="hidden h-3.5 w-3.5 shrink-0 min-[400px]:block" aria-hidden="true" />
          </RoleButton>

          <RoleButton
            active={role === "chloe"}
            onClick={() => onRoleChange("chloe")}
            label={shortName(characterName)}
            fullLabel={`Write as ${characterName}`}
          >
            <span
              className={cn(
                "h-4 w-4 shrink-0 overflow-hidden rounded-full border",
                role === "chloe" ? "border-[var(--on-accent)]" : "border-border-2"
              )}
            >
              <StockFill seedKey={portraitSeed} alt="" sizes="16px" subject="portrait" />
            </span>
          </RoleButton>

          <RoleButton
            active={role === "narrator"}
            onClick={() => onRoleChange("narrator")}
            label="narrator"
            fullLabel="Write narration"
          >
            <Quote className="hidden h-3.5 w-3.5 shrink-0 min-[400px]:block" aria-hidden="true" />
          </RoleButton>

          <RoleButton
            active={role === "image"}
            onClick={() => onRoleChange("image")}
            label="image"
            fullLabel="Add a picture to the scene"
          >
            <ImageIcon className="hidden h-3.5 w-3.5 shrink-0 min-[400px]:block" aria-hidden="true" />
          </RoleButton>
        </div>

        <div className="flex items-end gap-2.5">
          <Textarea
            ref={fieldRef}
            rows={1}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={PLACEHOLDERS[role]}
            aria-label={`Message — ${HINTS[role]}`}
            className="max-h-[168px] min-h-[46px] resize-none"
          />
          <Button
            variant="primary"
            size="lg"
            onClick={onSend}
            disabled={!text.trim()}
            aria-label="Send"
            className="h-[46px] shrink-0"
          >
            Send
          </Button>
        </div>

        <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[10.5px] text-ink-muted-2">
          <span className="min-w-0">{HINTS[role]}</span>
          <span className="shrink-0">enter sends · shift+enter breaks the line</span>
        </p>
      </div>
    </div>
  );
}

function RoleButton({
  active,
  onClick,
  label,
  fullLabel,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  /** The unabbreviated version — a display label is never the accessible name here. */
  fullLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={fullLabel}
      title={fullLabel}
      data-active={active}
      onClick={onClick}
      className={cn(
        // Four equal columns down to ~320px: the icons drop out before the words do,
        // because the words are what name the voice.
        "desk-tool min-w-0 flex-1 justify-center gap-1.5 px-1.5 text-[12.5px] min-[400px]:px-2 sm:px-3"
      )}
    >
      {children}
      <span className="truncate lowercase">{label}</span>
    </button>
  );
}
