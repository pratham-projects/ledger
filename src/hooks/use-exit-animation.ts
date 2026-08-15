import * as React from "react";

/**
 * Keeps a conditionally-mounted surface (modal, drawer, popover) on screen for one exit
 * duration after `open` goes false, so closing plays the reverse of the entrance instead
 * of the element simply vanishing. Callers render nothing while `mounted` is false, and
 * apply `data-closing={closing}` to whichever element carries the entrance animation —
 * the stylesheet supplies the reverse keyframe for that state.
 *
 * `duration` should match the CSS closing animation's own duration; defaults to
 * `--m-exit-dur` (200ms, see styles/motion.css) since most of this system's closes use it.
 */
export function useExitAnimation(open: boolean, duration = 200) {
  const [mounted, setMounted] = React.useState(open);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    setMounted((wasMounted) => {
      if (!wasMounted) return false;
      setClosing(true);
      return true;
    });
  }, [open]);

  React.useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, duration);
    return () => clearTimeout(t);
  }, [closing, duration]);

  return { mounted, closing };
}
