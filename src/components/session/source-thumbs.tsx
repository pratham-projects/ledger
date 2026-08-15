import { StockFill } from "@/components/media/stock-fill";
import { ResolvingImage } from "@/components/media/resolving-image";
import { checkpointPoster, previewSubject, type Checkpoint, type Lora } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * What is loaded, as two pictures instead of one picture and a word.
 *
 * A selection in this product is always a *pair* — a base model and a LoRA — and every
 * surface that reported one used to show the LoRA's thumbnail beside the checkpoint's
 * name in mono. That is a picture and a word for two things of equal standing, and it
 * quietly demoted the half of the choice that decides what the model can render at all.
 * Names like "Ferrograph" and "Tessera Mini" carry no meaning until you have seen their
 * output, so the word was doing no work.
 *
 * Both halves get a frame, in pipeline order: base first, then the LoRA that rides on it.
 * The base shows its clip's poster frame rather than the clip — this appears in rails and
 * sticky bars where nothing should be decoding video, and the moving version lives on the
 * surfaces built to choose between them (`/browse`, `home.spine`).
 */
export function SourceThumbs({
  checkpoint,
  lora,
  /** Rendered edge length of each square, px. */
  size = 44,
  className,
}: {
  checkpoint: Checkpoint;
  lora: Lora;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("flex shrink-0 border border-border-2", className)}
      aria-hidden="true"
      title={`${lora.name} on ${checkpoint.name}`}
    >
      <span
        className="block shrink-0 overflow-hidden bg-panel-2"
        style={{ width: size, height: size }}
      >
        <ResolvingImage
          src={checkpointPoster(checkpoint)}
          alt=""
          sizes={`${size}px`}
          loading="lazy"
          decoding="async"
          className="h-full w-full"
        />
      </span>

      <span
        className="block shrink-0 overflow-hidden border-l border-border-2 bg-panel-2"
        style={{ width: size, height: size }}
      >
        <StockFill seedKey={lora.id} subject={previewSubject(lora)} alt="" sizes={`${size}px`} />
      </span>
    </span>
  );
}
