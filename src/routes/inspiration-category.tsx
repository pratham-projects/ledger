/**
 * One Inspirations category, on its own page — what "See all" on `/home` opens onto.
 * The home band only ever shows a preview strip per category; this is the full shelf,
 * reached the way this app's own "Templates" page is reached, as a real navigation
 * rather than an in-place expansion.
 */
import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { HubShell } from "@/components/hub/hub-shell";
import { TemplateLightbox } from "@/components/hub/template-lightbox";
import { VideoTile } from "@/components/hub/video-tile";
import { INSPIRATION_CATEGORIES, templatesFor, type Template } from "@/lib/templates";

const PAGE_COUNT = 24;

export function InspirationCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = INSPIRATION_CATEGORIES.find((c) => c.id === categoryId);
  const [viewing, setViewing] = React.useState<Template | null>(null);

  if (!category) return <Navigate to="/home#insp" replace />;

  const templates = templatesFor(category.id, category.label, category.blurb, PAGE_COUNT);

  return (
    <>
      <HubShell label="Inspirations">
        <section className="hub-band">
          <Link
            to={`/home#insp-${category.id}`}
            className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted no-underline hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Inspirations
          </Link>

          <header className="hub-insp-banner">
            <p className="desk-pill-label m-0 mb-2">Inspirations</p>
            <h1 className="desk-display m-0 text-[clamp(1.8rem,3.6vw,2.9rem)] text-ink">
              {category.label}
            </h1>
            <p className="mt-2 max-w-[60ch] text-[15px] leading-[1.6] text-ink-muted">
              {category.blurb}
            </p>
          </header>

          <div className="hub-tpl-grid mt-8">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                className="hub-tpl-tile"
                style={{ aspectRatio: t.aspect }}
                onClick={() => setViewing(t)}
                aria-label={`Open ${t.title}`}
              >
                <VideoTile src={t.url} label={t.title} />
              </button>
            ))}
          </div>
        </section>
      </HubShell>

      {viewing && <TemplateLightbox template={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
