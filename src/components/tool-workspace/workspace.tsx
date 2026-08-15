import * as React from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useResizableWidth } from "@/hooks/use-resizable-width";

const MIN_WIDTH = 380;
const MAX_WIDTH = 820;

/**
 * The composer's width on a screen this reader has never dragged.
 *
 * It used to be a flat 480px at every size, and the right-hand panel takes whatever is
 * left — so the wider the display, the more lopsided it got: 480 against 564 on a 1280
 * laptop, 480 against 724 at 1440, 480 against **1204** at 1920. On the widest screens the
 * reference gallery was two and a half times the size of the tool it references, which is
 * the hierarchy of the page stated backwards. Scaling with the viewport keeps the composer
 * the larger of the two everywhere, and the drag handle still overrides it for anyone who
 * disagrees — that preference is what `localStorage` is for, and it is read first.
 */
function defaultWidth() {
  if (typeof window === "undefined") return 520;
  return Math.round(Math.min(MAX_WIDTH, Math.max(460, window.innerWidth * 0.4)));
}

/**
 * The three-panel tool shell: rail (mounted by `HubShell`, untouched here), a resizable
 * composer column, and whatever's left for the right-hand panel.
 *
 * Below `xl` the three columns are still three columns' worth of content — there just
 * isn't room to show them side by side, so `.tool-workspace` drops to a normal block and
 * everything stacks and the page scrolls as one, the way every other route on this site
 * does. At `xl` and up it becomes a fixed-height row (`100dvh` minus the topbar) with each
 * of the two panels scrolling on its own — dragging the composer wider doesn't reflow the
 * templates panel's scroll position, and vice versa.
 *
 * The right panel collapses fully, on demand — every tool route hands `right` to this
 * component rather than rendering it inline, so a single toggle here is a full-screen
 * option for the composer on all of them (image, video, chat, and RPG/story pre-session)
 * without each route reimplementing it. Collapsed state is remembered per tool, same as
 * width, so a reader who cleared the panel on `/image` doesn't have to clear it again.
 */
export function ToolWorkspace({
  storageKey,
  middle,
  right,
}: {
  storageKey: string;
  middle: React.ReactNode;
  right: React.ReactNode;
}) {
  const { width, onDragStart } = useResizableWidth({
    storageKey: `ledger:panel-width:${storageKey}`,
    initial: defaultWidth(),
    min: MIN_WIDTH,
    max: MAX_WIDTH,
  });

  const collapseKey = `ledger:panel-collapsed:${storageKey}`;
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(collapseKey) === "true";
  });

  React.useEffect(() => {
    window.localStorage.setItem(collapseKey, String(collapsed));
  }, [collapseKey, collapsed]);

  return (
    <div className="tool-workspace">
      <div
        className="tool-workspace-middle ledger-scrollbar"
        style={{ "--panel-w": `${width}px` } as React.CSSProperties}
      >
        {middle}
      </div>

      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Show panel"
          title="Show panel"
          className="m-press fixed right-0 top-1/2 z-40 inline-flex -translate-y-1/2 items-center gap-1.5 border border-border-2 border-r-0 bg-panel px-2 py-3 font-mono text-[11px] text-ink-muted transition-colors hover:border-accent hover:text-accent"
        >
          <PanelRightOpen className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : (
        <>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize the composer panel"
            className="tool-workspace-handle"
            onPointerDown={onDragStart}
          >
            <span className="tool-workspace-handle-grip" aria-hidden="true" />
          </div>

          <div className="tool-workspace-right ledger-scrollbar relative">
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse panel"
              title="Collapse panel"
              className="m-press absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 border border-border-2 bg-panel px-2 py-1.5 font-mono text-[11px] text-ink-muted transition-colors hover:border-accent hover:text-accent"
            >
              <PanelRightClose className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            {right}
          </div>
        </>
      )}
    </div>
  );
}
