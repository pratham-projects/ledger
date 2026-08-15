import * as React from "react";

/**
 * Which of `ids` is currently the one being read. Reports the *last* section whose top
 * has passed the sticky strip (120px down from the viewport top), rather than whichever
 * is most visible — while you are mid-scroll between two sections the honest answer is
 * the one you are entering.
 */
export function useScrollSpy(ids: string[]): string {
  const [active, setActive] = React.useState(ids[0]);

  React.useEffect(() => {
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null);
    if (nodes.length === 0) return;

    const onScroll = () => {
      let current = ids[0];
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= 120) current = node.id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids.join("|")]);

  return active;
}
