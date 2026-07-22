import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalPaper } from "@/components/journal/JournalPaper";
import { ContentNotice } from "@/components/ui/ContentNotice";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { canWatch, isMember } from "@/lib/access/entitlement";
import { getEntry, journal, opening } from "@/lib/content/journal";
import { getPerson, getPlace } from "@/lib/content/taxonomy";
import { getVideo } from "@/lib/content/videos";

interface EntryPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return journal.map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: EntryPageProps): Promise<Metadata> {
  const { id } = await params;
  const entry = getEntry(id);
  if (!entry) return { title: "Entry not found" };

  return {
    title: `${entry.dateline} — Luna's Journal`,
    // Premium entries describe themselves without quoting themselves: the
    // opening line is the visitor's taste to find, not the search engine's.
    description:
      entry.access === "free"
        ? opening(entry, 150)
        : `An entry from Luna's journal, written at ${
            getPlace(entry.place)?.label ?? "the house"
          }.`,
  };
}

export default async function JournalEntryPage({ params }: EntryPageProps) {
  const { id } = await params;
  const entry = getEntry(id);
  if (!entry) notFound();

  const [allowed, member] = await Promise.all([
    canWatch({ access: entry.access }),
    isMember(),
  ]);

  const place = getPlace(entry.place);
  const scene = entry.sceneSlug ? getVideo(entry.sceneSlug) : undefined;

  // Neighbours within the same place, so reading one entry leads to the rest
  // of that room rather than dead-ending.
  const siblings = journal.filter((e) => e.place === entry.place);
  const at = siblings.findIndex((e) => e.id === entry.id);
  const previous = siblings[at - 1];
  const next = siblings[at + 1];

  // A stable, tiny tilt derived from the id — the same page always sits the
  // same way, but no two pages sit alike.
  const tilt =
    ((entry.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 9) - 4) / 8;

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <nav className="py-5 text-sm">
          <Link
            href={`/journal?place=${entry.place}`}
            className="text-stone transition-colors duration-(--duration-quick) hover:text-ivory"
          >
            ← {place?.label ?? "The journal"}
          </Link>
        </nav>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone">
            {place && <span>{place.label}</span>}
            {entry.where && (
              <>
                <span aria-hidden>·</span>
                <span>{entry.where}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span>
              {entry.about
                .map((p) => getPerson(p)?.label ?? p)
                .join(" & ")}
            </span>
            {entry.mature && (
              <>
                <span aria-hidden>·</span>
                <span>Mature</span>
              </>
            )}
          </div>
          <h1 className="mt-2 font-display text-3xl font-light text-ivory sm:text-4xl">
            {entry.dateline}
          </h1>
        </header>

        <ContentNotice notes={entry.notes} className="mx-auto mb-6 max-w-2xl" />

        {allowed ? (
          <JournalPaper entry={entry} tilt={tilt} />
        ) : (
          <LockedEntry entry={entry} tilt={tilt} />
        )}

        {scene && (
          <p className="mt-10 text-center text-sm text-stone">
            Written the same night as{" "}
            <Link
              href={`/watch/${scene.slug}`}
              className="text-amber underline decoration-hairline underline-offset-4 transition-colors duration-(--duration-quick) hover:text-amber-soft"
            >
              {scene.title}
            </Link>
            .
          </p>
        )}

        {(previous || next) && (
          <nav
            aria-label="More from this place"
            className="mt-12 flex items-stretch justify-between gap-4 border-t border-hairline pt-6"
          >
            {previous ? (
              <Link
                href={`/journal/${previous.id}`}
                className="group max-w-[45%] text-left text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
              >
                <span className="block text-xs text-stone-dim">Previous</span>
                {previous.dateline}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/journal/${next.id}`}
                className="group max-w-[45%] text-right text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
              >
                <span className="block text-xs text-stone-dim">Next</span>
                {next.dateline}
              </Link>
            )}
          </nav>
        )}
      </main>
    </>
  );
}

/**
 * A locked entry, shown as a page turned face-down rather than as an error.
 *
 * The opening line is given away on purpose — enough to know what is being
 * withheld, and enough for the handwriting to make its own case. Below it the
 * page falls away into the dark instead of being cut off, so it reads as more
 * page rather than as a broken layout.
 */
function LockedEntry({
  entry,
  tilt,
}: {
  entry: (typeof journal)[number];
  tilt: number;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div
        style={{ rotate: `${tilt}deg` }}
        className="relative overflow-hidden rounded-sm bg-paper shadow-[0_18px_50px_-12px_rgba(0,0,0,0.75)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0 27px, rgba(47,58,74,0.13) 27px 28px)",
            backgroundPosition: "0 6.25rem",
          }}
        />
        <div className="relative px-6 pb-40 pt-10 sm:pl-20 sm:pr-14 sm:pt-12">
          <p className="font-hand text-2xl text-ink-soft">{entry.dateline}</p>
          {entry.where && (
            <p className="font-hand text-xl text-ink-soft">{entry.where}</p>
          )}
          <p className="font-hand mt-6 text-2xl leading-7 text-ink sm:text-[1.7rem]">
            {opening(entry, 130)}
          </p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-void via-void/85 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-void/70 px-3.5 py-1.5 text-sm text-amber-soft backdrop-blur-sm">
            Members only
          </span>
          <p className="max-w-sm text-balance text-sm leading-relaxed text-ivory">
            The rest of this page, and every other entry, is part of the Vault.
          </p>
          <Link
            href="/membership"
            className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
          >
            See what membership opens
          </Link>
        </div>
      </div>
    </div>
  );
}
