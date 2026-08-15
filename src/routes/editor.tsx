import { useCallback, useEffect, useState } from "react";
import { Panel, PanelHead } from "@/components/ui/panel";
import { SourceEditor } from "@/components/editor/source-editor";
import { PreviewPane } from "@/components/editor/preview-pane";
import { DEFAULT_SOURCE, renderGenerator } from "@/lib/list-dsl";

export function Editor() {
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [rendered, setRendered] = useState(() => renderGenerator(DEFAULT_SOURCE));
  const [autoMode, setAutoMode] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const regenerate = useCallback((src: string) => setRendered(renderGenerator(src)), []);

  useEffect(() => {
    if (autoMode) regenerate(source);
  }, [source, autoMode, regenerate]);

  return (
    <div className="hub-band mx-auto w-full max-w-[980px]">
      <p className="desk-kicker">editor</p>
      <h1 className="desk-display mt-3" style={{ fontSize: "clamp(28px, 4.4vw, 42px)" }}>
        The example, <span className="desk-em">live and editable.</span>
      </h1>
      {/* Was "the exact generator from the tutorial above". There is no tutorial above —
          this route has no page before it and never had one, so the sentence pointed at
          something a visitor would go looking for and not find. */}
      <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.65] text-ink-muted">
        A generator written in the list-DSL. Edit it on the left and the preview on the
        right updates immediately as the generator evaluates each list.
      </p>

      <main className="mt-8 pb-16">
        <Panel>
          <PanelHead title="editor.rg4m14ri" sub="minimal example" />
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="border-b border-border lg:border-b-0 lg:border-r">
              <SourceEditor value={source} onChange={setSource} />
            </div>
            <PreviewPane
              title={rendered.title}
              output={rendered.output}
              onRandomize={() => regenerate(source)}
              autoMode={autoMode}
              onAutoModeChange={setAutoMode}
              onReload={() => regenerate(source)}
              fullscreen={fullscreen}
              onToggleFullscreen={() => setFullscreen((v) => !v)}
            />
          </div>
        </Panel>
      </main>
    </div>
  );
}
