import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { isOwner } from "@/lib/access/owner";
import { allRefs, allShots, databaseConfigured } from "@/lib/db/studio";
import { studioBlobConfigured } from "@/lib/studio/storage";
import { people, places } from "@/lib/content/taxonomy";
import { videos } from "@/lib/content/videos";
import { Studio } from "@/components/studio/Studio";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Studio — the shot workshop.
 *
 * WHAT IT IS, said plainly because the alternative wastes an afternoon: this
 * does not generate images and nothing that runs without a model could. It
 * builds the exact input to whatever does — the reference set, the camera in
 * film language, the anchor prompt, the motion prompt for image-to-video — and
 * it keeps the recipe, so the same shot can be remade in a month or varied on
 * one axis without losing the other nine. Continuity across forty shots is the
 * expensive part of this workflow, not any single picture.
 *
 * IT READS THE PUBLISHED STORY rather than a second copy of it. Cast and places
 * come from lib/content/taxonomy.ts, the scene list from lib/content/videos.ts,
 * and the environment style suffixes in lib/studio/prompt.ts are lifted
 * verbatim from docs/world/PANORAMA_PROMPTS.md — the same strings eighteen
 * rooms were generated against. A shot of the farmhouse that describes the
 * farmhouse differently will not sit in the same world as the farmhouse.
 *
 * OWNER-ONLY, and gated exactly like /admin: server-side, before anything
 * renders, 404 rather than 403. The reference images are private Blob and reach
 * the browser only through /api/studio/refs, which checks the same gate.
 */
export default async function StudioPage() {
  if (!(await isOwner())) notFound();

  const [refs, shots] = await Promise.all([allRefs(), allShots()]);

  // Cast first, in story order, so the three-hander is at the top of every
  // picker rather than alphabetical with Avery first.
  const order = ["luna", "tyson", "josh", "cathy", "avery", "rick", "cole", "casey", "tony"];
  const cast = [...people]
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
    .map((p) => ({ id: p.id, label: p.id === "luna" ? "Luna" : p.label }));

  const scenes = videos
    .filter((v) => !v.hidden)
    .map((v) => ({
      slug: v.slug,
      title: v.title,
      placeId: v.place,
      characterIds: [...v.about],
    }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-10 sm:px-8">
        <header className="mb-8 space-y-2">
          <Link href="/admin" className="text-[13px] text-stone hover:text-ivory">
            ← Admin
          </Link>
          <h1 className="font-display text-3xl text-ivory">Studio</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-stone">
            Build a shot from what you already have: pick the cast and the references, set the
            camera in film language, and take away the anchor prompt, the motion prompt and the
            reference brief. It does not draw anything — it makes the input, and it remembers it,
            so shot forty still looks like shot one.
          </p>
        </header>

        <Studio
          refs={refs}
          shots={shots}
          people={cast}
          places={places.map((p) => ({ id: p.id, label: p.label }))}
          scenes={scenes}
          configured={databaseConfigured()}
          blobConfigured={studioBlobConfigured()}
        />
      </main>
    </>
  );
}
