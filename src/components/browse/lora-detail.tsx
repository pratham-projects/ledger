import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { stockFor } from "@/lib/stock";
import { ResolvingImage } from "@/components/media/resolving-image";
import { Panel, PanelHead } from "@/components/ui/panel";
import { formatDownloads, previewSubject, type Lora } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function LoraDetail({ lora }: { lora: Lora }) {
  const preview = useMemo(() => stockFor(lora.id, previewSubject(lora)), [lora]);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (word: string) => {
    try {
      await navigator.clipboard.writeText(word);
      setCopied(word);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      // Clipboard blocked (insecure context or denied permission) — the word is
      // selectable on screen regardless, so fail quietly rather than alarm.
    }
  };

  return (
    <Panel>
      <PanelHead title="browse.selected" sub={`${formatDownloads(lora.downloads)} downloads`} />

      <div className="flex flex-col gap-5 p-5 sm:flex-row">
        <div
          // The box takes the image's own ratio rather than forcing a square — the
          // catalog spans 39 of them, and cropping every one to 1:1 hides that. Capped in
          // width so a tall portrait doesn't push every detail below the fold on a phone.
          className="w-full max-w-[220px] shrink-0 overflow-hidden border border-border sm:w-[200px]"
          style={{ aspectRatio: String(preview.aspect) }}
        >
          <ResolvingImage
            src={preview.src(512)}
            srcSet={preview.srcSet}
            sizes="(min-width: 640px) 200px, 220px"
            alt={`Preview for ${lora.name}`}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div>
            <h2 className="font-display text-[22px] font-bold leading-tight tracking-[-0.01em] text-ink">
              {lora.name}
            </h2>
            <p className="mt-1 font-mono text-[11px] text-ink-muted-2">
              by {lora.author} · {lora.category}
            </p>
            <p className="mt-2.5 max-w-[62ch] font-sans text-[14px] leading-[1.6] text-ink-muted">
              {lora.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-muted-2">
              trigger words — put these in your prompt
            </span>
            <div className="flex flex-wrap gap-2">
              {lora.triggerWords.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => copy(word)}
                  aria-label={`Copy trigger word "${word}"`}
                  className={cn(
                    "inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11.5px] transition-colors",
                    copied === word
                      ? "border-green text-green"
                      : "border-border-2 text-ink hover:border-accent hover:text-accent"
                  )}
                >
                  {copied === word ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3 w-3" aria-hidden="true" />
                  )}
                  {word}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3.5 font-mono text-[10.5px] text-ink-muted-2">
            <span>
              tags <span className="text-ink-muted">{lora.tags.join(", ")}</span>
            </span>
            <span>
              base <span className="text-ink-muted">{lora.compatible.join(", ")}</span>
            </span>
            <span>
              default strength{" "}
              <span className="tabular-nums text-ink-muted">{lora.defaultStrength.toFixed(2)}</span>
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
