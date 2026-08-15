import { useMemo } from "react";
import { ResolvingImage } from "@/components/media/resolving-image";
import { stockFor, type StockSubject } from "@/lib/stock";

/**
 * A real image filling whatever box it is given, chosen deterministically from a seed.
 *
 * Replaces the procedural colour mosaics that used to stand in for generated output. The
 * seed contract is identical — the same key always resolves to the same picture — so a
 * reel, a result tile and its full-screen view all agree, across reloads.
 *
 * Always passes `sizes` so the browser picks a rung of the srcset ladder rather than
 * downloading a full-size original for a 180px tile.
 *
 * Rendering is delegated to ResolvingImage, so every one of these — catalog tiles, result
 * tiles, chat inline images, RPG/Story illustrations — resolves in rather than popping.
 */
export function StockFill({
  seedKey,
  alt,
  sizes,
  subject,
  className,
}: {
  seedKey: string | number;
  alt: string;
  /** What this renders at, e.g. "180px" or "(min-width: 1280px) 20vw, 50vw". */
  sizes: string;
  /**
   * What the placeholder is standing in for. Pass `portrait` wherever a face is expected
   * — avatars, character previews — and `scene` for illustrations. Omit where anything
   * plausible will do.
   */
  subject?: StockSubject;
  className?: string;
}) {
  const image = useMemo(() => stockFor(seedKey, subject), [seedKey, subject]);

  return (
    <ResolvingImage
      src={image.src(512)}
      srcSet={image.srcSet}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}
