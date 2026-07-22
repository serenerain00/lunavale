import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LockedNotice } from "@/components/membership/LockedNotice";
import { StillWall } from "@/components/browse/StillWall";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { canWatch, isMember } from "@/lib/access/entitlement";
import { galleries, getGallery } from "@/lib/content/gallery";
import { getPlace } from "@/lib/content/taxonomy";

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

  const description = `${gallery.images.length} stills — ${gallery.subtitle}.`;
  return {
    title: `${gallery.title} — Stills`,
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
            <span>{gallery.images.length} stills</span>
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
          </div>
          <h1 className="mt-2 font-display text-3xl font-light text-ivory sm:text-4xl">
            {gallery.title}
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-stone">
            {gallery.subtitle}
          </p>

          {place?.environmentSlug && (
            <Link
              href={`/world/${place.environmentSlug}`}
              className="mt-5 inline-block rounded-full border border-hairline px-5 py-2 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
            >
              See these hung in {place.label} →
            </Link>
          )}
        </header>

        {allowed ? (
          <StillWall images={gallery.images} title={gallery.title} />
        ) : (
          <div className="relative aspect-video overflow-hidden rounded-xl ring-1 ring-hairline">
            <LockedNotice cover={gallery.cover} subject="This set of stills" />
          </div>
        )}
      </main>
    </>
  );
}
