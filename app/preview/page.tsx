import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setPreviewTier } from "@/app/actions/preview";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { previewAllowed, previewKeyValid, previewTier } from "@/lib/access/preview";
import { TIERS } from "@/lib/content/membership";

/*
  Never prerendered. Whether this page exists depends on PREVIEW_SECRET, which
  is a runtime value — statically rendering it bakes in whichever answer was
  true at build time, and the page 404s forever even after the secret is set.
*/
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preview",
  // Never indexed, never followed. It shouldn't be discoverable at all.
  robots: { index: false, follow: false, nocache: true },
};

interface PreviewPageProps {
  searchParams: Promise<{ key?: string }>;
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  // 404 rather than "forbidden": an unconfigured environment shouldn't even
  // admit this page exists.
  if (!previewAllowed()) notFound();

  const { key } = await searchParams;
  const authorised = previewKeyValid(key);
  const [{ tier, active }, previewing] = await Promise.all([
    getMembership(),
    previewTier(),
  ]);

  return (
    <>
      <SiteHeader member={active} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <p className="text-xs uppercase tracking-[0.2em] text-amber">
          Internal
        </p>
        <h1 className="mt-4 font-display text-3xl font-light text-ivory">
          Preview the member experience.
        </h1>
        <p className="mt-3 leading-relaxed text-stone">
          Switches what the whole site thinks you are, without buying anything.
          Nothing is charged and no real membership is created — every page that
          shows membership state will keep saying so.
        </p>

        {!authorised ? (
          <div className="mt-8 rounded-xl border border-hairline bg-charcoal/50 p-6">
            <h2 className="font-display text-lg text-ivory">Key required</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              Add <code className="text-amber-soft">?key=…</code> to this URL,
              matching <code className="text-amber-soft">PREVIEW_SECRET</code>{" "}
              in the environment.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 rounded-xl border border-hairline bg-charcoal/50 p-6">
              <p className="text-xs uppercase tracking-[0.15em] text-stone-dim">
                Currently viewing as
              </p>
              <p className="mt-1.5 font-display text-2xl text-ivory">
                {previewing
                  ? `${TIERS.find((t) => t.id === previewing)?.name ?? previewing} (preview)`
                  : active
                    ? "Real membership"
                    : "Visitor"}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {TIERS.filter((t) => t.id !== "free").map((t) => (
                <form key={t.id} action={setPreviewTier.bind(null, key, t.id)}>
                  <button
                    type="submit"
                    className={`inline-flex min-h-11 items-center rounded-full px-6 text-sm font-medium transition-colors duration-(--duration-quick) ${
                      previewing === t.id
                        ? "bg-amber text-void"
                        : "border border-hairline text-ivory hover:border-amber hover:text-amber"
                    }`}
                  >
                    View as {t.name}
                  </button>
                </form>
              ))}
              <form action={setPreviewTier.bind(null, key, "off")}>
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
                >
                  View as visitor
                </button>
              </form>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-stone-dim">
              Expires after eight hours on its own. Current tier:{" "}
              <span className="text-stone">{tier}</span>.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              {["/", "/membership", "/account", "/journal", "/browse"].map(
                (href) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm text-stone underline decoration-hairline underline-offset-4 transition-colors duration-(--duration-quick) hover:text-amber"
                  >
                    {href}
                  </Link>
                ),
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
