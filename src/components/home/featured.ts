import { lorasByCategory, type Lora } from "@/lib/catalog";
import type { StockSubject } from "@/lib/stock";

/**
 * The faces the landing page casts itself with.
 *
 * Characters rather than styles or concepts: a style LoRA is a hard thing to put on a
 * front page, because its thumbnail is a picture of a *treatment* and a visitor reads it
 * as just another image. A character has a face, and a face is what makes "pick one, and
 * it follows you everywhere" land in one glance.
 *
 * Shared rather than duplicated because two surfaces depend on the same set being the
 * same set — the specimen band shows the work these produce, and the spine strip lets you
 * choose between them. If those drifted apart the band would be advertising models the
 * page does not offer.
 */

/** Enough faces to make the point, few enough to stay one row on a phone. */
const FEATURED_COUNT = 6;

export function featuredLoras(): Lora[] {
  return lorasByCategory("character").slice(0, FEATURED_COUNT);
}

/**
 * Every seed the page will render for a given LoRA, in a stable order.
 *
 * The specimen band draws from exactly these, which is why the band is not a mood board:
 * scroll past it and the same pictures reappear as the output of the demonstrations
 * below. The strip is a table of contents for the page, not decoration ahead of it.
 */
export function seedsFor(lora: Lora): { key: string; subject: StockSubject }[] {
  return [
    { key: lora.id, subject: "portrait" },
    { key: `${lora.id}-demo-rpg`, subject: "scene" },
    { key: `${lora.id}-demo-story`, subject: "scene" },
  ];
}
