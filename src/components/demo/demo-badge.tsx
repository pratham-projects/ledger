import * as React from "react";

/**
 * Fixed, always-on-top label present on every route (mounted once in `App.tsx`, outside
 * `PageShell`'s bare/chrome split, so it survives both).
 *
 * Ledger has no backend at all — see `UPSTREAM.md` and the README's "What's real, what's
 * mocked" section. Everything on screen is real UI wired to synthetic, seeded local data
 * (`lib/catalog.ts`, `lib/stock.ts`, `lib/template-images.ts`, `lib/template-videos.ts`);
 * there is no API to call, so unlike the other two demos in this set there is no mock
 * network layer to disclose — the badge exists purely so a visitor never mistakes the
 * generated-media browsing experience for a live product with real inference behind it.
 */
export function DemoBadge() {
  const [open, setOpen] = React.useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "14px",
        right: "14px",
        zIndex: 2147483647,
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      {open && (
        <div
          style={{
            marginBottom: "8px",
            maxWidth: "260px",
            padding: "10px 12px",
            borderRadius: "10px",
            background: "#17151c",
            color: "#e8e6ef",
            fontSize: "12px",
            lineHeight: 1.5,
            border: "1px solid rgba(185,243,107,0.35)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          Portfolio demo of Ledger's UI, frozen at a real commit. No backend — every
          catalogue, gallery and generation result is synthetic, seeded data baked into
          the bundle. Nothing you do here is sent anywhere.
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 12px",
          borderRadius: "999px",
          background: "#b9f36b",
          color: "#172006",
          fontSize: "12px",
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "999px",
            background: "#172006",
            display: "inline-block",
          }}
        />
        Demo — sample data, no backend
      </button>
    </div>
  );
}
