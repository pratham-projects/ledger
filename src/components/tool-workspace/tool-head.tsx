import * as React from "react";

/**
 * The title block for a tool surface — the same one on `/image`, `/video`, `/chat`, `/rpg`
 * and `/story`, which is why it is a component rather than five copies.
 *
 * It is deliberately smaller than the page title block DESIGN.md specifies. That rhythm
 * (`max-w-[660px] py-[56px]`, a display h1, a full lede) was written for a *scrolling page
 * of panels*, where the reader arrives at the top, reads down, and everything below is one
 * scroll away. A tool route is not that: `ToolWorkspace` pins the surface to
 * `100dvh - topbar` and gives the composer its own column, so every pixel the heading takes
 * is a pixel the actual task does not get. At the page-block size the measurement was
 * unambiguous — `Generate` sat at 810–858px inside a 900px viewport, and at 1280×800, one
 * of the most common laptop sizes there is, it fell off the bottom of the screen entirely.
 * The primary action of a page cannot be below the fold on that page.
 *
 * So: the kicker and the rule stay (they are what makes a region addressable), the display
 * face stays, and the vertical spend comes down by about 120px — enough to bring the
 * primary action back above the fold at 800px without turning the surface into a bare form.
 * The lede stays because a first-time visitor genuinely needs to know what the tool does;
 * it is just written to two lines instead of four.
 *
 * `/credits`, `/profile` and `/editor` keep the full page block — they *are* scrolling
 * pages of panels, and the rhythm is right there.
 */
export function ToolHead({
  kicker,
  title,
  children,
}: {
  /** The `domain.operation` address, e.g. `image.generate`. */
  kicker: string;
  /** Display headline. Callers mark the second clause with `desk-em`. */
  title: React.ReactNode;
  /** The lede. Two lines at this measure; write to that. */
  children: React.ReactNode;
}) {
  return (
    <header className="mb-6">
      <p className="desk-kicker">{kicker}</p>
      <h1
        className="desk-display mt-2.5"
        style={{ fontSize: "clamp(24px, 2.6vw, 32px)", lineHeight: 1.1 }}
      >
        {title}
      </h1>
      <p className="mt-2.5 max-w-[52ch] text-[14px] leading-[1.6] text-ink-muted">
        {children}
      </p>
    </header>
  );
}
