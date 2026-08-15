import type { CSSProperties } from "react";

/**
 * Stagger index for a `.m-stagger` child.
 *
 * A helper rather than an inline object so no component hand-writes the custom-property
 * name, and so the delay cap stays a CSS concern (`--m-step-cap` in styles/motion.css)
 * rather than something each list has to remember.
 *
 *   {rows.map((r, i) => <Row key={r.id} style={stagger(i)} />)}
 */
export function stagger(index: number): CSSProperties {
  return { "--m-i": index } as CSSProperties;
}

/**
 * The motion roles, for surfaces that document the system (see routes/motion.tsx).
 * Nothing at runtime branches on these — they exist so the spec page and the CSS can
 * never drift apart silently.
 */
export interface MotionRole {
  name: string;
  fires: string;
  note: string;
}

export const MOTION_ROLES: MotionRole[] = [
  {
    name: "m-enter",
    fires: "an element arrives",
    note: "blur 8px clearing to sharp, saturation rising, 4px settle. 460ms.",
  },
  {
    name: "m-exit",
    fires: "an element leaves",
    note: "re-blurs out at 200ms — always faster than the arrival.",
  },
  {
    name: "m-stagger",
    fires: "a list arrives as a list",
    note: "46ms per sibling, capped at 380ms total however long the list is.",
  },
  {
    name: "m-swap",
    fires: "content is replaced in place",
    note: "tab bodies, panel bodies. The container is stable; only contents change.",
  },
  {
    name: "m-view",
    fires: "a route body arrives",
    note: "the quietest role — 320ms opacity and 4px, no filter. Mid-task navigation must not choreograph.",
  },
  {
    name: "m-hover",
    fires: "pointer or keyboard acknowledgment",
    note: "a rule is drawn under the target, left to right. 130ms in, 260ms out.",
  },
  {
    name: "m-press",
    fires: "activation",
    note: "the mark gets heavier. Nothing translates.",
  },
  {
    name: "m-expand",
    fires: "a container opens or closes",
    note: "grid-template-rows 0fr↔1fr, driven by data-open. Height is never animated.",
  },
  {
    name: "m-marker",
    fires: "the selection indicator moves",
    note: "one indicator travels on transform. Never left/width, never fade-out-here-in-over-there.",
  },
  {
    name: "m-pending",
    fires: "waiting on something real",
    note: "a latent dither field breathing. Covers waiting on bytes — not the model working.",
  },
  {
    name: "m-resolve",
    fires: "pending → result",
    note: "720ms focus pull. The system's one authored beat; used where a picture lands.",
  },
  {
    name: "m-attention",
    fires: "a value changed and you are accountable for noticing",
    note: "the value defocuses and returns. No colour change, no movement.",
  },
  {
    name: "m-overlay / m-scrim",
    fires: "a dialog opens",
    note: "timed separately — the scrim is linear so the surface can carry the arrival.",
  },
];
