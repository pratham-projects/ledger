import { useMemo } from "react";
import { ResolvingImage } from "@/components/media/resolving-image";
import { featuredLoras, seedsFor } from "@/components/home/featured";
import { stockFor } from "@/lib/stock";
import { stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The first thing on the site: a strip of output, edge to edge.
 *
 * Ledger is an Operate system — flat, ruled, restrained — and it earns that on every tool
 * surface, where the visitor came to do a task. The landing page is the one Persuade
 * surface in the product, and it needs a different kind of force. The move is *not* to
 * import the category default the design system explicitly refuses (gradient haze, glow,
 * rounded cards). It is to let the work be loud while the chrome stays exactly as silent
 * as it is everywhere else. Scale, not decoration.
 *
 * So this is a specimen row rather than a hero image: pictures at their true aspect
 * ratios, butted together with a hairline between them, running past both edges of the
 * column. It reads as a contact sheet — a record of what came out of the machine — which
 * is the same argument the rest of the system makes, made at volume.
 *
 * **It does not move.** A marquee here was the obvious idea and it is the wrong one:
 * motion.css is explicit that nothing loops unless it is actually working, and a strip
 * scrolling for atmosphere is decoration pretending to be status. The band arrives once,
 * de-noising like everything else, and then holds.
 *
 * **And it is not a mood board.** The first version drew a random run from the stock
 * pool and produced a windmill, an office desk and a plated dessert — a strip that argued
 * the site was a photo library. These are the *page's own* subjects instead: the six
 * featured faces and the scenes their demonstrations render further down. A visitor who
 * scrolls sees the same pictures arrive again as output, which turns the band from
 * decoration into a claim the rest of the page then keeps.
 */

/**
 * Eight. Fewer and the strip reads as a few hero shots; more and each cell is narrower
 * than a face, which defeats the point of leading with characters.
 */
const COUNT = 8;

export function SpecimenBand() {
  const images = useMemo(() => {
    const loras = featuredLoras();
    const columns = seedsFor(loras[0]).length;

    // Interleaved across LoRAs rather than grouped by one, so the row alternates
    // portrait / scene instead of running three pictures of a single character together
    // and reading as a gallery of one model.
    const candidates = Array.from({ length: loras.length * columns }, (_, i) => {
      const seed = seedsFor(loras[i % loras.length])[Math.floor(i / loras.length) % columns];
      return stockFor(seed.key, seed.subject);
    });

    // Deduped, because the pool is smaller than the catalogue and two different seeds can
    // land on the same picture. Anywhere else a repeat is a harmless placeholder; in a
    // single unbroken row it is two identical frames side by side, which is the one
    // artefact on this page that would read as a bug rather than as a design.
    const seen = new Set<string>();
    const picked: typeof candidates = [];
    for (const image of candidates) {
      if (seen.has(image.id)) continue;
      seen.add(image.id);
      picked.push(image);
      if (picked.length === COUNT) break;
    }
    return picked;
  }, []);

  return (
    <section className="-mx-6 border-b border-border" aria-labelledby="specimen-heading">
      <h2 id="specimen-heading" className="sr-only">
        Examples of what this platform produces
      </h2>

      {/* Flex with per-item basis proportional to aspect: every picture keeps its true
          shape and the row fills the width exactly, no cropping, no letterboxing. */}
      <div className="m-stagger flex h-[132px] w-full overflow-hidden sm:h-[176px] lg:h-[212px]">
        {images.map((image, i) => (
          <div
            key={image.id}
            style={{ ...stagger(i), flexGrow: image.aspect, flexBasis: 0 }}
            className={cn(
              "relative min-w-0 border-r border-border last:border-r-0",
              // Eight pictures across a phone is eight 45px slivers — a texture, not a
              // contact sheet. The row sheds cells as the viewport narrows so each
              // remaining one is still wide enough to be a picture of something.
              i >= 4 && "hidden sm:block",
              i >= 6 && "sm:hidden lg:block"
            )}
          >
            <ResolvingImage
              src={image.src(512)}
              srcSet={image.srcSet}
              sizes="(min-width: 1024px) 22vw, 40vw"
              alt=""
              // The band is the first paint on the page; it must not be lazy.
              decoding="async"
              className="h-full w-full"
            />
          </div>
        ))}
      </div>

    </section>
  );
}
