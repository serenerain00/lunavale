import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LockedNotice } from "@/components/membership/LockedNotice";
import { StillGalleryView, type ViewStill } from "@/components/browse/StillGalleryView";
import { ContentNotice } from "@/components/ui/ContentNotice";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { canWatch, isMember } from "@/lib/access/entitlement";
import {
  galleries,
  getGallery,
  stillMeta,
  stillSrc,
} from "@/lib/content/gallery";
import { getEntry } from "@/lib/content/journal";
import { signGalleryStills } from "@/lib/media/presign";
import { getPlace } from "@/lib/content/taxonomy";
import { getVideo } from "@/lib/content/videos";

interface GalleryPageProps {
  params: Promise<{ id: string }>;
}

// Pre-render the known gallery routes; access is still checked per request.
export function generateStaticParams() {
  return galleries.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: GalleryPageProps): Promise<Metadata> {
  const { id } = await params;
  const gallery = getGallery(id);
  if (!gallery) return { title: "Gallery not found" };

  const description = `${gallery.count} stills — ${gallery.subtitle}. ${gallery.description[0] ?? ""}`.trim();
  return {
    title: `${gallery.title} — Stills | Luna Vault`,
    description,
    openGraph: {
      title: `${gallery.title} — Stills`,
      description,
      images: [gallery.cover],
    },
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { id } = await params;
  const gallery = getGallery(id);
  if (!gallery) notFound();

  const [allowed, member] = await Promise.all([
    canWatch({ access: gallery.access }),
    isMember(),
  ]);
  const place = getPlace(gallery.place);
  const scene = gallery.sceneSlug ? getVideo(gallery.sceneSlug) : undefined;
  const entry = gallery.journalEntryId
    ? getEntry(gallery.journalEntryId)
    : undefined;

  // A gated gallery may open its first few stills to everybody
  // (`freePreviewCount`), so a non-member gets a list too — just a short one.
  const shown = allowed ? gallery.count : (gallery.freePreviewCount ?? 0);

  // Sign the gated stills in one batch instead of letting each tile call
  // /api/still — one function invocation per image, and another on every
  // reload, since a 307 is not cacheable. The open preview stills are ordinary
  // /public files and are left alone. See lib/media/presign.ts; null means no
  // Blob configured, and stillSrc's route URLs still work.
  const gatedNumbers =
    gallery.gated && allowed
      ? Array.from({ length: shown }, (_, i) => i + 1).filter(
          (n) => n > (gallery.freePreviewCount ?? 0),
        )
      : [];
  const signed = gatedNumbers.length
    ? await signGalleryStills(gallery.id, gatedNumbers)
    : null;

  const items: ViewStill[] = shown
    ? Array.from({ length: shown }, (_, i) => {
        const n = i + 1;
        const meta = stillMeta(gallery, n);
        const j = meta?.journal;
        const jEntry = j ? getEntry(j.entryId) : undefined;
        const direct = signed?.get(n);
        return {
          thumb: direct?.thumb || stillSrc(gallery, n, "thumb"),
          full: direct?.full || stillSrc(gallery, n, "full"),
          caption: meta?.caption,
          journal:
            j && jEntry
              ? {
                  excerpt: j.excerpt,
                  href: `/journal/${j.entryId}`,
                  dateline: jEntry.dateline,
                }
              : undefined,
        };
      })
    : [];

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 sm:px-8">
        <nav className="py-5 text-sm">
          <Link
            href="/browse"
            className="text-stone transition-colors duration-(--duration-quick) hover:text-ivory"
          >
            ← Back to the catalog
          </Link>
        </nav>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone">
            <span>{gallery.count} stills</span>
            {place && (
              <>
                <span aria-hidden>·</span>
                <span>{place.label}</span>
              </>
            )}
            {gallery.mature && (
              <>
                <span aria-hidden>·</span>
                <span>Mature</span>
              </>
            )}
            {gallery.access === "premium" && (
              <>
                <span aria-hidden>·</span>
                <span className="text-amber-soft">Members</span>
              </>
            )}
          </div>
          <h1 className="mt-2 font-display text-3xl font-light text-ivory sm:text-4xl">
            {gallery.title}
          </h1>
          <p className="mt-1 text-sm uppercase tracking-[0.2em] text-stone-dim">
            {gallery.subtitle}
          </p>

          <div className="mt-4 max-w-2xl space-y-3">
            {gallery.description.map((para) => (
              <p key={para} className="leading-relaxed text-stone">
                {para}
              </p>
            ))}
          </div>

          <ContentNotice notes={gallery.notes} className="mt-5 max-w-2xl" />

          <div className="mt-5 flex flex-wrap gap-3">
            {scene && (
              <Link
                href={`/watch/${scene.slug}`}
                className="inline-flex min-h-11 items-center rounded-full border border-hairline px-5 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
              >
                Watch the scene →
              </Link>
            )}
            {entry && (
              <Link
                href={`/journal/${entry.id}`}
                className="inline-flex min-h-11 items-center rounded-full border border-hairline px-5 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
              >
                Read what she wrote →
              </Link>
            )}
            {place?.environmentSlug && (
              <Link
                href={`/world/${place.environmentSlug}`}
                className="inline-flex min-h-11 items-center rounded-full border border-hairline px-5 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
              >
                See these hung in {place.label} →
              </Link>
            )}
          </div>
        </header>

        {/* A member sees the wall. A visitor sees the open preview stills when
            the set has any, then the lock stating exactly how many are behind
            it — real frames plus an honest count, rather than one cover image
            and a promise. Only a set with nothing open falls back to the
            bare notice. */}
        {items.length > 0 ? (
          <>
            <StillGalleryView
              items={items}
              title={gallery.title}
              gated={gallery.gated}
            />
            {!allowed && (
              <div className="mt-8 rounded-xl border border-amber/25 bg-amber/[0.04] p-6 sm:p-8">
                <h2 className="font-display text-2xl font-medium text-ivory sm:text-3xl">
                  {gallery.count - items.length} more from this set
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone">
                  You&rsquo;re seeing {items.length} of {gallery.count}. Members
                  get the whole set at full resolution, and the scene it was cut
                  from in full.
                </p>
                <Link
                  href="/membership"
                  className="mt-5 inline-flex min-h-10 items-center rounded-full bg-amber px-5 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
                >
                  Join the LunaVerse
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="relative aspect-video overflow-hidden rounded-xl ring-1 ring-hairline">
            <LockedNotice cover={gallery.cover} subject="This set of stills" />
          </div>
        )}
      </main>
    </>
  );
}
