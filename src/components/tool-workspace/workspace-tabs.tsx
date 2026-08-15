import * as React from "react";

/**
 * The right panel's own header — "Templates" and "My Generations" as two tabs sharing one
 * scroll region, rather than two stacked sections. A reader who has already loaded a
 * template and wants to check on their own results shouldn't have to scroll past a
 * gallery of starting points to find them.
 */
export function WorkspaceTabs({
  templates,
  myGenerations,
}: {
  templates: React.ReactNode;
  myGenerations: React.ReactNode;
}) {
  const [tab, setTab] = React.useState<"templates" | "mine">("templates");

  return (
    <div className="tool-tabs">
      <div className="tool-tab-bar" role="tablist" aria-label="Templates or your own generations">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "templates"}
          data-active={tab === "templates"}
          className="tool-tab"
          onClick={() => setTab("templates")}
        >
          Templates
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "mine"}
          data-active={tab === "mine"}
          className="tool-tab"
          onClick={() => setTab("mine")}
        >
          My Generations
        </button>
      </div>

      <div className="tool-tab-body">{tab === "templates" ? templates : myGenerations}</div>
    </div>
  );
}
