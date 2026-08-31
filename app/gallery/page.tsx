import type { Metadata } from "next";
import { CatalogCard } from "@/components/browse/CatalogCard";
import { Reveal } from "@/components/motion/Reveal";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { catalog } from "@/lib/content/catalog";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Stills",
  description:
    "Still galleries from Luna's world — the bar, the park, the firepit, the farmhouse — with her journal threaded through them. Most are members-only.",
  path: "/gallery",
});

export default async function StillsIndexPage() {
  const galleryItems = catalog.filter((item) => item.kind === "gallery");

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">Stills</p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            The frames between the frames.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            Sets of stills from the scenes that matter, each read the way Luna
            would — with the pages of her journal turned to the same night.
            Members see them at full size.
          </p>
        </header>

        {galleryItems.length === 0 ? (
          <p className="text-stone">No galleries yet.</p>
        ) : (
          <Reveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((item) => (
              <CatalogCard key={item.id} item={item} />
            ))}
          </Reveal>
        )}
      </main>
    </>
  );
}
