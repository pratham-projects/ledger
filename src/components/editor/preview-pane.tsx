import { Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PreviewPane({
  title,
  output,
  onRandomize,
  autoMode,
  onAutoModeChange,
  onReload,
  fullscreen,
  onToggleFullscreen,
}: {
  title: string;
  output: string;
  onRandomize: () => void;
  autoMode: boolean;
  onAutoModeChange: (auto: boolean) => void;
  onReload: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col bg-panel",
        fullscreen && "fixed inset-0 z-[80] p-8"
      )}
    >
      <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <h2 className="font-display text-[26px] font-bold text-ink">{title}</h2>
        <p className="max-w-[46ch] font-sans text-[15px] leading-[1.6] text-ink">{output}</p>
        <Button variant="ghost" size="md" onClick={onRandomize}>
          randomize
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5">
        <Button variant="ghost" size="sm" onClick={onToggleFullscreen}>
          {fullscreen ? (
            <Minimize2 className="h-3 w-3" aria-hidden="true" />
          ) : (
            <Maximize2 className="h-3 w-3" aria-hidden="true" />
          )}
          {fullscreen ? "exit fullscreen" : "fullscreen"}
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <label className="desk-pill cursor-pointer !py-1.5 text-[12px] text-ink-muted">
            <input
              type="checkbox"
              checked={autoMode}
              onChange={(e) => onAutoModeChange(e.target.checked)}
              className="h-3 w-3 accent-accent"
            />
            auto
          </label>
          <Button variant="ghost" size="sm" onClick={onReload}>
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            reload
          </Button>
        </div>
      </div>
    </div>
  );
}
