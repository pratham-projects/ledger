import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceThumbs } from "@/components/session/source-thumbs";
import { Panel, PanelHead } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { useCredits, type CreditTransaction, type ToolId } from "@/hooks/use-credits";
import { useSelection } from "@/hooks/use-selection";

/**
 * The wide-screen right gutter.
 *
 * It used to carry a tool list and a credit balance — both of which the SideRail already
 * shows, four inches to the left. Two rails restating each other is worse than one rail,
 * because it costs the width and returns nothing.
 *
 * So the two rails are split by question. The left answers *where can I go and what do I
 * have*: navigation, balance. This one answers *what have I made, and what happens to
 * it* — the record and its lifecycle, which is the Ledger thesis and, until now, was
 * shown nowhere in the product.
 *
 * The two regions below are both requirements from `docs/goal.md` §5 that had no UI at
 * all: image retention (files are deleted from disk after six months) and the
 * rate-limit/CAPTCHA gate. They are driven by real ledger entries, not invented numbers,
 * and both say plainly what is and isn't wired up.
 *
 * Appears at 2xl, one step later than the SideRail. Both rails at xl would cost 520px
 * and leave the content column *narrower* than the 860px it had before any of this —
 * making 1280–1440px displays worse, which is the opposite of the point.
 */

/** docs/goal.md §5 — generated images are deleted from disk by a daily cron after six months. */
const RETENTION_DAYS = 180;

/**
 * docs/goal.md §5 — the transparent hourly cap, above which Generate demands a visible
 * CAPTCHA. The real ceiling is the backend's; this is the number the UI is designed to.
 */
const HOURLY_CAP = 40;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const TOOL_LABEL: Record<ToolId, string> = {
  image: "image",
  video: "video",
  chat: "chat",
  rpg: "rpg",
  story: "story",
};

export function ContextRail() {
  const credits = useCredits();
  const { lora, checkpoint, strength } = useSelection();
  const { pathname } = useLocation();

  const record = useMemo(() => summarize(credits.history), [credits.history]);

  return (
    <aside className="sticky top-0 hidden h-screen w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-border p-4 2xl:flex">
      <Panel>
        <PanelHead
          title="rail.source"
          sub={lora ? `strength ${strength.toFixed(2)}` : "none loaded"}
        />
        {lora ? (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              <SourceThumbs checkpoint={checkpoint} lora={lora} size={40} />
              <div className="flex min-w-0 flex-col">
                <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                  loaded
                </span>
                <span className="truncate font-sans text-[14px] font-semibold text-ink">
                  {lora.name}
                </span>
                <span className="truncate font-sans text-[12.5px] text-ink-muted-2">
                  {checkpoint.name}
                </span>
              </div>
            </div>

            <p className="m-0 font-sans text-[12.5px] leading-[1.6] text-ink-muted-2">
              triggers on {lora.triggerWords.join(", ")}
            </p>

            {!lora.compatible.includes(checkpoint.family) && (
              <p className="m-0 border border-amber/40 px-2.5 py-1.5 font-sans text-[12px] leading-[1.5] text-amber">
                trained for {lora.compatible.join("/")}, not {checkpoint.family}
              </p>
            )}

            {/* The rail is shared by every tool, so it passes the surface it is currently
                rendered on. Without this the catalog is a one-way door: it has no idea
                anyone was mid-task, and offers nothing to get back to. */}
            <Link
              to="/home#catalog"
              state={{ returnTo: pathname, returnLabel: `${pathname.replace("/", "") || "browse"}.setup` }}
              className="no-underline"
            >
              <Button variant="ghost" size="sm" className="w-full">
                change source →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2 text-ink-muted-2">
              <Layers className="h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="m-0 font-sans text-[13px] leading-[1.5]">
                Nothing loaded. Every tool works without one — it just won't look like
                anyone in particular.
              </p>
            </div>
            <Link to="/home#catalog" className="no-underline">
              <Button variant="ghost" size="sm" className="w-full">
                browse the catalog →
              </Button>
            </Link>
          </div>
        )}
      </Panel>

      {/* What this session put on disk, and when the platform takes it back. */}
      <Panel>
        <PanelHead
          title="rail.output"
          sub={record.files === 0 ? "nothing yet" : `${record.files} files`}
        />

        {record.files === 0 ? (
          <p className="m-0 p-4 font-sans text-[13px] leading-[1.55] text-ink-muted-2">
            Nothing generated in this tab yet. Anything you make is logged here with when
            it was made and how long the server keeps it.
          </p>
        ) : (
          <>
            <ul className="m-0 flex list-none flex-col p-0">
              {record.entries.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-baseline gap-2.5 border-b border-border px-4 py-2 last:border-b-0"
                >
                  <span className="w-[38px] shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent">
                    {tx.tool ? TOOL_LABEL[tx.tool] : "—"}
                  </span>
                  <span
                    className="min-w-0 flex-1 truncate font-sans text-[12.5px] text-ink-muted"
                    title={tx.label}
                  >
                    {subject(tx.label)}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-muted-2">
                    {formatTime(tx.at)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Ruled subdivision, not a nested panel. */}
            <div className="flex flex-col gap-1.5 border-t border-border p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted-2">
                  oldest expires
                </span>
                <span className="font-mono text-[12px] tabular-nums text-ink">
                  {formatDate(record.oldestExpiresAt!)}
                </span>
              </div>
              <p className="m-0 font-sans text-[12.5px] leading-[1.6] text-ink-muted-2">
                images and clips are deleted from the server {RETENTION_DAYS} days after
                they're made — {daysUntil(record.oldestExpiresAt!)} days for that one.
                prompts, chats and your account are kept.
              </p>
            </div>
          </>
        )}
      </Panel>

      {/* The rate-limit gate, stated before you hit it rather than sprung on you. */}
      <Panel>
        <PanelHead
          title="rail.throughput"
          sub={`${record.lastHour} / ${HOURLY_CAP} this hour`}
        />
        <div className="flex flex-col gap-2.5 p-4">
          <Meter used={record.lastHour} cap={HOURLY_CAP} />
          <p className="m-0 font-sans text-[12.5px] leading-[1.6] text-ink-muted-2">
            {record.lastHour >= HOURLY_CAP
              ? "over the hourly cap — generating will ask you to pass a captcha first."
              : `${HOURLY_CAP - record.lastHour} more before generate asks for a captcha.`}{" "}
            counted from this tab's ledger; the real cap is enforced server-side and isn't
            wired up yet.
          </p>
        </div>
      </Panel>
    </aside>
  );
}

/** A ruled budget bar — hairline segments, no fill gradient, no rounded cap. */
function Meter({ used, cap }: { used: number; cap: number }) {
  const filled = Math.min(used, cap);
  const over = used >= cap;
  return (
    <div
      className="flex h-1.5 gap-px"
      role="meter"
      aria-valuenow={used}
      aria-valuemin={0}
      aria-valuemax={cap}
      aria-label="Generations this hour"
    >
      {Array.from({ length: cap }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-full flex-1",
            i < filled ? (over ? "bg-amber" : "bg-accent") : "bg-border-2"
          )}
        />
      ))}
    </div>
  );
}

interface Record_ {
  /** Spends that produced files, newest first. */
  entries: CreditTransaction[];
  /** Total files produced. */
  files: number;
  /** When the earliest surviving file is deleted. Null when nothing was produced. */
  oldestExpiresAt: number | null;
  /** Generations in the trailing hour — what the rate limiter counts. */
  lastHour: number;
}

function summarize(history: CreditTransaction[]): Record_ {
  const produced = history.filter((tx) => tx.media !== undefined);
  const now = Date.now();

  // Anything already past retention is gone from the server, so it isn't "output" here.
  const live = produced.filter((tx) => now - tx.at < RETENTION_DAYS * DAY_MS);
  const oldest = live.length > 0 ? Math.min(...live.map((tx) => tx.at)) : null;

  return {
    entries: live.slice(0, 6),
    files: live.reduce((sum, tx) => sum + (tx.count ?? 1), 0),
    oldestExpiresAt: oldest === null ? null : oldest + RETENTION_DAYS * DAY_MS,
    lastHour: produced.filter((tx) => now - tx.at < HOUR_MS).length,
  };
}

/**
 * Ledger labels lead with what made them ("Generated image — …"), which the row's tool
 * chip already says. Drop that clause so the narrow column spends its width on the part
 * that identifies the entry — usually the prompt.
 */
function subject(label: string) {
  const [, rest] = label.split(/\s+—\s+/, 2);
  return (rest ?? label).replace(/^"|"$/g, "");
}

function formatTime(at: number) {
  return new Date(at).toTimeString().slice(0, 5);
}

function daysUntil(at: number) {
  return Math.max(0, Math.ceil((at - Date.now()) / DAY_MS));
}

function formatDate(at: number) {
  return new Date(at).toISOString().slice(0, 10);
}
