/**
 * One entry in the transcript.
 *
 * Deliberately not a two-colour bubble thread. Bubbles are the category default and they
 * flatten everyone into the same shape, which is exactly wrong here: the character is the
 * subject of this surface and you are the person operating it. So the asymmetry is the
 * design —
 *
 *   - the character has a **face** (the loaded LoRA) and speaks in full-strength ink,
 *     unboxed, at reading size. She is the brightest thing in the column.
 *   - you speak in a bordered block on the right, in a quieter measure. You are the
 *     margin note.
 *   - the narrator is a ruled break across the column, because a scene change is a
 *     division of the document, not a participant in it.
 *
 * Every name here is free text a user typed. Nothing prints one without `min-w-0` and
 * `truncate` above it, and the full string always survives on `title`.
 */
import { useEffect, useState, type ReactNode } from "react";
import { Pencil, Trash2, RefreshCw, Check, X } from "lucide-react";
import { StockFill } from "@/components/media/stock-fill";
import { SceneImage } from "@/components/session/scene-image";
import { StreamedBody } from "@/components/session/streaming-text";
import { AuthorMark } from "@/components/session/author-mark";
import { Textarea } from "@/components/ui/textarea";
import { useStreamedText } from "@/hooks/use-streamed-text";
import type { ChatMessage } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

export interface MessageActions {
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onRegenerate: (id: string) => void;
}

export function Message({
  message,
  characterName,
  portraitSeed,
  loraName,
  isNewest,
  onStreamReveal,
  actions,
}: {
  message: ChatMessage;
  characterName: string;
  portraitSeed: string;
  loraName: string | null;
  /** Only the newest message may write itself in. History is history. */
  isNewest: boolean;
  onStreamReveal: () => void;
  actions: MessageActions;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);

  const startEdit = () => {
    setDraft(message.text);
    setEditing(true);
  };
  const commitEdit = () => {
    actions.onEdit(message.id, draft.trim() || message.text);
    setEditing(false);
  };
  const cancelEdit = () => setEditing(false);

  // Short on purpose — the caption bar sits under a 340px picture and truncates.
  const caption = loraName ? `Generated with ${loraName}` : "Scene image";

  /*
   * Only the newest assistant line writes itself in, and never while it is being edited —
   * a field you are typing into must not be re-rendering its own contents underneath you.
   * Your own messages never stream: you already have those words.
   */
  const isAssistant = message.role === "chloe" || message.role === "narrator";
  const streams = isAssistant && isNewest && !editing;
  const streamed = useStreamedText(message.text, {
    enabled: streams,
    onReveal: onStreamReveal,
  });
  const writing = streamed.streaming;

  if (message.role === "narrator") {
    return (
      <Row>
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
          <AuthorMark
            speaker="narrator"
            writing={writing}
            side="after"
            actions={
              editing ? undefined : (
                <>
                  <IconButton label="Edit this line" onClick={startEdit}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </IconButton>
                  <IconButton label="Delete this line" onClick={() => actions.onDelete(message.id)}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </IconButton>
                </>
              )
            }
          />
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>
        {editing ? (
          <EditField draft={draft} setDraft={setDraft} onCommit={commitEdit} onCancel={cancelEdit} />
        ) : (
          <StreamedBody
            streamed={streamed}
            text={message.text}
            className="text-center font-sans text-[14.5px] italic leading-[1.7] text-ink-muted"
          />
        )}
      </Row>
    );
  }

  // A picture placed into the scene from the composer's `image` role — it belongs to the
  // conversation rather than to either speaker, so it gets the full measure.
  if (message.role === "image") {
    return (
      <Row>
        <AuthorMark
          speaker="scene image"
          voice="user"
          actions={
            <>
              <IconButton
                label="Generate a different image"
                onClick={() => actions.onRegenerate(message.id)}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              </IconButton>
              <IconButton label="Delete this image" onClick={() => actions.onDelete(message.id)}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </IconButton>
            </>
          }
        />
        <GeneratedPicture seed={message.seed ?? 0} caption={caption} aspect="wide" />
        <p className="m-0 font-mono text-[10.5px] leading-[1.6] text-ink-muted-2">
          prompt: <span className="text-ink-muted">{message.text}</span>
        </p>
      </Row>
    );
  }

  if (message.role === "chloe") {
    return (
      <Row className="grid grid-cols-[34px_minmax(0,1fr)] gap-x-3.5 gap-y-2">
        <Portrait seedKey={portraitSeed} name={characterName} />
        <div className="flex min-w-0 flex-col gap-2">
          <AuthorMark
            speaker={characterName}
            writing={writing}
            title={characterName}
            actions={
              editing ? undefined : (
                <>
                  <IconButton label="Edit this line" onClick={startEdit}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label="Write a different reply"
                    onClick={() => actions.onRegenerate(message.id)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label="Delete this line"
                    onClick={() => actions.onDelete(message.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </IconButton>
                </>
              )
            }
          />
          {editing ? (
            <EditField draft={draft} setDraft={setDraft} onCommit={commitEdit} onCancel={cancelEdit} />
          ) : (
            <>
              <StreamedBody
                streamed={streamed}
                text={message.text}
                className="font-sans text-[16.5px] leading-[1.65] text-ink"
              />
              {/* The picture waits for the words. She says something and *then* shows you
                  — a line and its image landing simultaneously reads as two unrelated
                  things appearing, not as one person sending both. */}
              {message.seed !== undefined && !writing && (
                <div className="max-w-[340px]">
                  <GeneratedPicture seed={message.seed} caption={caption} aspect="square" />
                </div>
              )}
            </>
          )}
        </div>
      </Row>
    );
  }

  return (
    <Row className="items-end pl-10">
      <AuthorMark
        speaker="you"
        voice="user"
        side="before"
        actions={
          editing ? undefined : (
            <>
              <IconButton label="Edit what you said" onClick={startEdit}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </IconButton>
              <IconButton
                label="Delete what you said"
                onClick={() => actions.onDelete(message.id)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </IconButton>
            </>
          )
        }
      />
      {editing ? (
        <div className="w-full max-w-[420px] self-end">
          <EditField draft={draft} setDraft={setDraft} onCommit={commitEdit} onCancel={cancelEdit} />
        </div>
      ) : (
        <p className="m-0 max-w-[420px] self-end whitespace-pre-wrap border border-border-2 bg-panel-2 px-4 py-2.5 text-right font-sans text-[15px] leading-[1.6] text-ink">
          {message.text}
        </p>
      )}
    </Row>
  );
}

/**
 * The character's face, at the size a face needs to register. Zero radius, like
 * everything else — a circular avatar would be the one rounded thing in the product.
 */
function Portrait({ seedKey, name }: { seedKey: string; name: string }) {
  return (
    <div
      className="h-[34px] w-[34px] overflow-hidden border border-border-2 bg-panel-2"
      title={name}
    >
      <StockFill seedKey={seedKey} alt="" sizes="34px" subject="portrait" />
    </div>
  );
}

/**
 * Reuses the narrative surfaces' scene card, including its staged-progress honesty: the
 * shader stands in for the model working, then the picture resolves. The wait is
 * simulated here exactly as it is everywhere else in this build.
 */
function GeneratedPicture({
  seed,
  caption,
  aspect,
}: {
  seed: number;
  caption: string;
  aspect: "wide" | "square";
}) {
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    setGenerating(true);
    const t = window.setTimeout(() => setGenerating(false), 900 + Math.random() * 900);
    return () => window.clearTimeout(t);
  }, [seed]);

  return <SceneImage seed={seed} caption={caption} generating={generating} aspect={aspect} />;
}

function Row({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <article className={cn("ledger-message-in group relative flex flex-col gap-2", className)}>
      {children}
    </article>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="border border-border-2 bg-panel p-1 text-ink-muted-2 transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}

function EditField({
  draft,
  setDraft,
  onCommit,
  onCancel,
}: {
  draft: string;
  setDraft: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <Textarea
        rows={2}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onCommit();
          }
          if (e.key === "Escape") onCancel();
        }}
        className="text-[14px]"
        aria-label="Edit this message"
        autoFocus
      />
      <div className="flex justify-end gap-1.5">
        <IconButton label="Discard the edit" onClick={onCancel}>
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </IconButton>
        <IconButton label="Save the edit" onClick={onCommit}>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  );
}
