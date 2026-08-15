import * as React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  FolderOpen,
  ImagePlus,
  MessageCircle,
  Play,
  Save,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { Panel, PanelHead } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { stockFor } from "@/lib/stock";
import { CHECKPOINTS, LORAS, previewSubject } from "@/lib/catalog";
import { featuredLoras } from "@/components/home/featured";
import {
  BUILT_IN_PRESETS,
  DEFAULT_SETTINGS,
  FONT_TRIOS,
  ICON_WEIGHTS,
  MOTION_OPTIONS,
  RADII,
  SURFACES,
  THEMES,
  fontById,
  iconWeightById,
  radiusById,
  randomSettings,
  settingsToCss,
  themeById,
  type StudioPreset,
  type StudioSettings,
} from "./desk-studio-data";

/**
 * DESK STUDIO — a shadcn-`/create`-style live token editor for the Desk world.
 *
 * THESIS: the design system is a small, named set of independent axes — colour, type,
 * radius, surface, motion, icon weight — not six fixed "candidate pages." Turning any one
 * axis re-skins real, working Ledger primitives (Button, Panel, Select, Slider, Tabs) and
 * a curated slice of the actual product surfaces (composer, result tile, chat line),
 * live, so a choice is judged on working UI rather than a swatch.
 *
 * CHROME vs SCOPE: the sidebar and topbar are neutral tool chrome — they never take a
 * token from the combination being edited, exactly like the existing `IdeaFrame` switcher
 * bar. Only `.studio-theme` (the preview pane) carries the live CSS custom properties, via
 * inline style, so every primitive dropped inside it re-skins for free.
 */

const STORAGE_KEY = "desk-studio-settings";
const PRESETS_KEY = "desk-studio-saved-presets";

function loadSettings(): StudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadSavedPresets(): StudioPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function DeskStudio() {
  const [settings, setSettings] = React.useState<StudioSettings>(loadSettings);
  const [savedPresets, setSavedPresets] = React.useState<StudioPreset[]>(loadSavedPresets);
  const [panel, setPanel] = React.useState<"presets" | "code" | null>(null);
  const [saveName, setSaveName] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const [portalEl, setPortalEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setPortalEl(previewRef.current);
  }, []);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  React.useEffect(() => {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(savedPresets));
  }, [savedPresets]);

  const set = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const applyPreset = (preset: StudioPreset) => {
    setSettings(preset.settings);
    setPanel(null);
  };

  const shuffle = () => setSettings((prev) => randomSettings(prev));

  const savePreset = () => {
    const name = saveName.trim();
    if (!name) return;
    const preset: StudioPreset = {
      id: `custom-${Date.now()}`,
      name,
      note: "Saved on this device.",
      settings,
    };
    setSavedPresets((prev) => [preset, ...prev].slice(0, 12));
    setSaveName("");
  };

  const theme = themeById(settings.themeId);
  const previewStyle: React.CSSProperties = {
    ...(theme.vars as React.CSSProperties),
    ["--radius" as string]: `${radiusById(settings.radiusId).px}px`,
    ["--font-display" as string]: fontById(settings.fontId).display,
    ["--font-display-weight" as string]: fontById(settings.fontId).displayWeight,
    ["--font-sans" as string]: fontById(settings.fontId).body,
    ["--font-mono" as string]: fontById(settings.fontId).data,
  };

  return (
    <div className="studio-shell">
      <StudioTopbar
        settings={settings}
        onShuffle={shuffle}
        onOpenPresets={() => setPanel(panel === "presets" ? null : "presets")}
        onOpenCode={() => setPanel(panel === "code" ? null : "code")}
        presetsOpen={panel === "presets"}
        codeOpen={panel === "code"}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      <div className="studio-layout">
        {sidebarOpen && (
          <div
            className="studio-sidebar-scrim"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}
        <StudioSidebar
          settings={settings}
          onSet={set}
          onShuffle={shuffle}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main
          ref={previewRef}
          className="studio-theme studio-preview"
          data-surface={settings.surfaceId}
          data-motion={settings.motionId}
          style={previewStyle}
        >
          <PreviewGallery settings={settings} portalEl={portalEl} />
        </main>
      </div>

      {panel === "presets" && (
        <PresetsPanel
          builtIns={BUILT_IN_PRESETS}
          saved={savedPresets}
          saveName={saveName}
          onSaveName={setSaveName}
          onSave={savePreset}
          onApply={applyPreset}
          onDeleteSaved={(id) => setSavedPresets((prev) => prev.filter((p) => p.id !== id))}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === "code" && (
        <CodePanel settings={settings} onClose={() => setPanel(null)} />
      )}
    </div>
  );
}

/* ── topbar ───────────────────────────────────────────────────────────────── */

function StudioTopbar({
  settings,
  onShuffle,
  onOpenPresets,
  onOpenCode,
  presetsOpen,
  codeOpen,
  onOpenSidebar,
}: {
  settings: StudioSettings;
  onShuffle: () => void;
  onOpenPresets: () => void;
  onOpenCode: () => void;
  presetsOpen: boolean;
  codeOpen: boolean;
  onOpenSidebar: () => void;
}) {
  return (
    <header className="studio-topbar">
      <Link to="/home-ideas/desk" className="studio-back">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Desk
      </Link>
      <div className="studio-topbar-title">
        <Sparkles className="h-3.5 w-3.5 text-[var(--studio-accent)]" aria-hidden />
        <span className="studio-btn-label">Design system studio</span>
      </div>
      <div className="studio-topbar-actions">
        <button
          type="button"
          className="studio-btn studio-btn-mobile-only"
          onClick={onOpenSidebar}
          aria-label="Open options"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          <span className="studio-btn-label">Options</span>
        </button>
        <button
          type="button"
          className="studio-btn"
          onClick={onOpenPresets}
          data-active={presetsOpen}
          aria-label="Open preset"
        >
          <FolderOpen className="h-3.5 w-3.5" aria-hidden />
          <span className="studio-btn-label">Open preset</span>
        </button>
        <button
          type="button"
          className="studio-btn"
          onClick={onOpenCode}
          data-active={codeOpen}
          aria-label="Get code"
        >
          <Code2 className="h-3.5 w-3.5" aria-hidden />
          <span className="studio-btn-label">Get code</span>
        </button>
        <button
          type="button"
          className="studio-btn studio-btn-accent"
          onClick={onShuffle}
          aria-label="Shuffle all"
        >
          <Shuffle className="h-3.5 w-3.5" aria-hidden />
          <span className="studio-btn-label">Shuffle all</span>
        </button>
      </div>
      <p className="studio-topbar-note">
        {themeById(settings.themeId).name} · {fontById(settings.fontId).name} ·{" "}
        {radiusById(settings.radiusId).name} radius
      </p>
    </header>
  );
}

/* ── sidebar ──────────────────────────────────────────────────────────────── */

function StudioSidebar({
  settings,
  onSet,
  onShuffle,
  open,
  onClose,
}: {
  settings: StudioSettings;
  onSet: <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => void;
  onShuffle: () => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <aside className="studio-sidebar" data-open={open}>
      <button type="button" className="studio-sidebar-close" onClick={onClose} aria-label="Close options">
        <X className="h-4 w-4" aria-hidden />
      </button>

      <button type="button" className="studio-shuffle-cta" onClick={onShuffle}>
        <Shuffle className="h-4 w-4" aria-hidden />
        Shuffle every option
      </button>

      <SidebarSection label="Theme">
        <div className="studio-swatch-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className="studio-swatch"
              data-active={t.id === settings.themeId}
              aria-pressed={t.id === settings.themeId}
              title={t.note}
              onClick={() => onSet("themeId", t.id)}
            >
              <span className="studio-swatch-dots" aria-hidden>
                {t.swatch.map((c, i) => (
                  <span key={i} style={{ background: c }} />
                ))}
              </span>
              <span className="studio-swatch-name">{t.name}</span>
            </button>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection label="Font trio" hint="max 3 faces — display, body, data">
        <div className="studio-font-list">
          {FONT_TRIOS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="studio-font-option"
              data-active={f.id === settings.fontId}
              aria-pressed={f.id === settings.fontId}
              onClick={() => onSet("fontId", f.id)}
            >
              <span
                className="studio-font-preview"
                style={{ fontFamily: f.display, fontWeight: f.displayWeight }}
              >
                Aa
              </span>
              <span className="studio-font-copy">
                <strong>{f.name}</strong>
                <span>{f.note}</span>
              </span>
            </button>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection label="Radius">
        <div className="studio-pill-row">
          {RADII.map((r) => (
            <button
              key={r.id}
              type="button"
              className="studio-pill-option"
              data-active={r.id === settings.radiusId}
              aria-pressed={r.id === settings.radiusId}
              onClick={() => onSet("radiusId", r.id)}
            >
              <span
                className="studio-radius-swatch"
                aria-hidden
                style={{ borderRadius: Math.min(r.px, 10) }}
              />
              {r.name}
            </button>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection label="Surface">
        <div className="studio-pill-row">
          {SURFACES.map((s) => (
            <button
              key={s.id}
              type="button"
              className="studio-pill-option"
              data-active={s.id === settings.surfaceId}
              aria-pressed={s.id === settings.surfaceId}
              title={s.note}
              onClick={() => onSet("surfaceId", s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection label="Scroll motion" hint="applies to the preview on the right">
        <div className="studio-pill-row">
          {MOTION_OPTIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              className="studio-pill-option"
              data-active={m.id === settings.motionId}
              aria-pressed={m.id === settings.motionId}
              title={m.note}
              onClick={() => onSet("motionId", m.id)}
            >
              {m.name}
            </button>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection label="Icon weight">
        <div className="studio-pill-row">
          {ICON_WEIGHTS.map((w) => (
            <button
              key={w.id}
              type="button"
              className="studio-pill-option"
              data-active={w.id === settings.iconWeightId}
              aria-pressed={w.id === settings.iconWeightId}
              onClick={() => onSet("iconWeightId", w.id)}
            >
              <Sparkles className="h-3 w-3" strokeWidth={w.stroke} aria-hidden />
              {w.name}
            </button>
          ))}
        </div>
      </SidebarSection>

      <p className="studio-sidebar-foot">
        Every option here is a real token — nothing on the right is a mockup. Preview
        images stand in for generated output.
      </p>
    </aside>
  );
}

function SidebarSection({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="studio-section">
      <div className="studio-section-head">
        <span>{label}</span>
        {hint && <span className="studio-section-hint">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

/* ── presets & code panels ───────────────────────────────────────────────── */

function PresetsPanel({
  builtIns,
  saved,
  saveName,
  onSaveName,
  onSave,
  onApply,
  onDeleteSaved,
  onClose,
}: {
  builtIns: StudioPreset[];
  saved: StudioPreset[];
  saveName: string;
  onSaveName: (v: string) => void;
  onSave: () => void;
  onApply: (p: StudioPreset) => void;
  onDeleteSaved: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="studio-flyout" role="dialog" aria-label="Presets">
      <div className="studio-flyout-head">
        <span>Presets</span>
        <button type="button" onClick={onClose} aria-label="Close presets">
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <div className="studio-flyout-body">
        <p className="studio-flyout-label">Bundled</p>
        <ul className="studio-preset-list">
          {builtIns.map((p) => (
            <li key={p.id}>
              <button type="button" className="studio-preset-row" onClick={() => onApply(p)}>
                <span className="studio-preset-dots" aria-hidden>
                  {themeById(p.settings.themeId).swatch.map((c, i) => (
                    <span key={i} style={{ background: c }} />
                  ))}
                </span>
                <span className="studio-preset-copy">
                  <strong>{p.name}</strong>
                  <span>{p.note}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="studio-flyout-label">Saved on this device</p>
        {saved.length === 0 ? (
          <p className="studio-flyout-empty">
            Nothing saved yet — name the current combination below and it stays in this
            browser only (no account, no server).
          </p>
        ) : (
          <ul className="studio-preset-list">
            {saved.map((p) => (
              <li key={p.id} className="studio-preset-row-wrap">
                <button type="button" className="studio-preset-row" onClick={() => onApply(p)}>
                  <span className="studio-preset-dots" aria-hidden>
                    {themeById(p.settings.themeId).swatch.map((c, i) => (
                      <span key={i} style={{ background: c }} />
                    ))}
                  </span>
                  <span className="studio-preset-copy">
                    <strong>{p.name}</strong>
                    <span>{p.note}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="studio-preset-delete"
                  onClick={() => onDeleteSaved(p.id)}
                  aria-label={`Delete ${p.name}`}
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="studio-save-row">
          <input
            value={saveName}
            onChange={(e) => onSaveName(e.target.value)}
            placeholder="Name this combination…"
            className="studio-save-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
            }}
          />
          <button type="button" className="studio-btn studio-btn-accent" onClick={onSave} disabled={!saveName.trim()}>
            <Save className="h-3.5 w-3.5" aria-hidden />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function CodePanel({ settings, onClose }: { settings: StudioSettings; onClose: () => void }) {
  const css = settingsToCss(settings);
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard permission denied — the textarea below is the fallback.
    }
  };

  return (
    <div className="studio-flyout" role="dialog" aria-label="Get code">
      <div className="studio-flyout-head">
        <span>Get code</span>
        <button type="button" onClick={onClose} aria-label="Close code panel">
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <div className="studio-flyout-body">
        <p className="studio-flyout-empty">
          The custom properties for the combination on the right. Drop this block onto any
          scope in <code>home-ideas.css</code> and every primitive inside it re-skins.
        </p>
        <pre className="studio-code-block">{css}</pre>
        <button type="button" className="studio-btn studio-btn-accent studio-copy-btn" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy CSS"}
        </button>
      </div>
    </div>
  );
}

/* ── the live preview gallery ────────────────────────────────────────────── */

function PreviewGallery({
  settings,
  portalEl,
}: {
  settings: StudioSettings;
  portalEl: HTMLElement | null;
}) {
  const font = fontById(settings.fontId);
  const iconStroke = iconWeightById(settings.iconWeightId).stroke;
  const loras = React.useMemo(() => featuredLoras(), []);
  const lora = loras[0];
  const model = CHECKPOINTS[0];
  const shot = React.useMemo(() => stockFor(`${lora.id}-studio`, previewSubject(lora)), [lora]);
  const clipShot = React.useMemo(() => stockFor(`${lora.id}-studio-clip`, "scene"), [lora]);
  const chatShot = React.useMemo(() => stockFor(`${lora.id}-studio-chat`, "portrait"), [lora]);

  return (
    <div className="studio-gallery">
      <Reveal index={0}>
        <p className="studio-kicker">Live preview · {THEMES.find((t) => t.id === settings.themeId)?.name}</p>
        <h1 className="studio-display">
          One line in.
          <br />
          <span className="studio-em">A picture out.</span>
        </h1>
        <p className="studio-body-copy">
          Every element below is a real component from the design system — Button, Panel,
          Select, Slider, Tabs — re-skinned live from the tokens on the left. Nothing here
          is a static swatch.
        </p>
      </Reveal>

      <Reveal index={1}>
        <div className="studio-composer">
          <div className="studio-composer-head">
            <img src={shot.src(64)} alt="" className="studio-avatar" loading="lazy" decoding="async" />
            <p>
              <strong>{lora.name}</strong> on {model.name}
            </p>
          </div>
          <p className="studio-composer-text">a rooftop courier in the rain, seen from below</p>
          <div className="studio-composer-shelf">
            <span className="studio-chip">
              <ImagePlus className="h-3.5 w-3.5" strokeWidth={iconStroke} aria-hidden />
              Reference
            </span>
            <span className="studio-chip">Cinematic</span>
            <span className="studio-chip">Portrait</span>
            <span className="studio-data ml-auto">2–3 CR</span>
            <Button variant="primary" size="md">
              Generate →
            </Button>
          </div>
        </div>
      </Reveal>

      <Reveal index={2}>
        <div className="studio-tile-row">
          <Panel className="studio-tile">
            <PanelHead title="image.result" sub="1024×1024" />
            <div className="studio-tile-media">
              <img src={shot.src(480)} alt="" loading="lazy" decoding="async" />
            </div>
            <div className="studio-tile-foot">
              <span className="studio-data">seed 88214</span>
              <Badge>portrait</Badge>
            </div>
          </Panel>

          <Panel className="studio-tile">
            <PanelHead title="video.result" sub="0:08" />
            <div className="studio-tile-media">
              <img src={clipShot.src(480)} alt="" loading="lazy" decoding="async" />
              <span className="studio-play" aria-hidden>
                <Play className="h-5 w-5" strokeWidth={iconStroke} fill="currentColor" />
              </span>
            </div>
            <div className="studio-tile-foot">
              <span className="studio-data">9 CR</span>
              <Badge>cinematic</Badge>
            </div>
          </Panel>

          <Panel className="studio-tile studio-tile-chat">
            <PanelHead title="chat.transcript" sub="live" />
            <div className="studio-chat-body">
              <div className="studio-chat-line">
                <img src={chatShot.src(96)} alt="" className="studio-avatar studio-avatar-sm" loading="lazy" decoding="async" />
                <p>
                  <MessageCircle className="h-3 w-3" strokeWidth={iconStroke} aria-hidden />{" "}
                  “Rain again. You&rsquo;re either brave or out of better plans.”
                </p>
              </div>
              <div className="studio-chat-line studio-chat-line-you">
                <p>Bit of both, honestly.</p>
              </div>
            </div>
          </Panel>
        </div>
      </Reveal>

      <Reveal index={3}>
        <div className="studio-controls-row">
          <div className="studio-control-block">
            <span className="studio-data studio-control-label">Buttons</span>
            <div className="studio-flex-row">
              <Button variant="ghost" size="sm">
                Ghost
              </Button>
              <Button variant="primary" size="sm">
                Primary
              </Button>
              <Badge>Badge</Badge>
            </div>
          </div>

          <div className="studio-control-block">
            <span className="studio-data studio-control-label">Tabs</span>
            <Tabs defaultValue="image">
              <TabsList>
                <TabsTrigger value="image">Image</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="studio-control-block">
            <span className="studio-data studio-control-label">Guidance</span>
            <Slider defaultValue={[62]} max={100} step={1} className="w-[160px]" />
          </div>

          <div className="studio-control-block">
            <span className="studio-data studio-control-label">Shape</span>
            <Select defaultValue="portrait">
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent portalContainer={portalEl}>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Reveal>

      <Reveal index={4}>
        <div className="studio-type-scale">
          <div>
            <span className="studio-data studio-control-label">Display — {font.name}</span>
            <p className="studio-display studio-display-sm">{font.sample.display}</p>
          </div>
          <div>
            <span className="studio-data studio-control-label">Body</span>
            <p className="studio-body-copy">{font.sample.body}</p>
          </div>
          <div>
            <span className="studio-data studio-control-label">Data / mono</span>
            <p className="studio-data studio-data-lg">{font.sample.data}</p>
          </div>
        </div>
      </Reveal>

      <Reveal index={5}>
        <p className="studio-gallery-foot">
          {LORAS.length} LoRAs · {CHECKPOINTS.length} base models
        </p>
      </Reveal>
    </div>
  );
}

function Reveal({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div className="studio-reveal" style={{ ["--studio-i" as string]: index }}>
      {children}
    </div>
  );
}
