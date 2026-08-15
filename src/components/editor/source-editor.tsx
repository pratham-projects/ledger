import { Fragment } from "react";

const LINE_HEIGHT = 22;

function highlightLine(line: string, index: number) {
  const trimmed = line.trim();
  if (trimmed.startsWith("//")) {
    return (
      <div key={index} className="italic text-ink-muted-2">
        {line || " "}
      </div>
    );
  }

  const isHeader = line.length > 0 && !/^[ \t]/.test(line);
  if (isHeader) {
    return (
      <div key={index} className="font-semibold text-accent">
        {line}
      </div>
    );
  }

  const parts = line.split(/(\[[a-zA-Z0-9_]+\]|\{[^{}]*\})/g);
  return (
    <div key={index} className="text-ink">
      {line === "" ? (
        " "
      ) : (
        parts.map((part, i) => {
          if (/^\[[a-zA-Z0-9_]+\]$/.test(part)) {
            return (
              <span key={i} className="text-accent">
                {part}
              </span>
            );
          }
          if (/^\{[^{}]*\}$/.test(part)) {
            return (
              <span key={i} className="text-blue">
                {part}
              </span>
            );
          }
          return <Fragment key={i}>{part}</Fragment>;
        })
      )}
    </div>
  );
}

export function SourceEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const lines = value.split("\n");
  const contentHeight = lines.length * LINE_HEIGHT + 24;

  return (
    <div className="ledger-scrollbar flex max-h-[420px] overflow-auto font-mono text-[13px]">
      <div
        className="sticky left-0 shrink-0 select-none border-r border-border-2 bg-panel-2 px-3 py-3 text-right text-ink-muted-2"
        style={{ lineHeight: `${LINE_HEIGHT}px` }}
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      <div className="relative flex-1">
        <pre
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 whitespace-pre px-3 py-3"
          style={{ lineHeight: `${LINE_HEIGHT}px` }}
        >
          {lines.map((line, i) => highlightLine(line, i))}
        </pre>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="relative w-full resize-none whitespace-pre bg-transparent px-3 py-3 text-transparent caret-ink outline-none"
          style={{ lineHeight: `${LINE_HEIGHT}px`, height: contentHeight, minWidth: "560px" }}
          aria-label="Generator source"
        />
      </div>
    </div>
  );
}
