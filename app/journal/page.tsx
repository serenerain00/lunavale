import type { Metadata } from "next";
import Link from "next/link";
import { JournalCard } from "@/components/journal/JournalCard";
import { Reveal } from "@/components/motion/Reveal";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import {
  freeEntries,
  journal,
  type JournalEntry,
} from "@/lib/content/journal";
import {
  getPerson,
  getPlace,
  people,
  places,
  type PersonId,
  type PlaceId,
} from "@/lib/content/taxonomy";

export const metadata: Metadata = {
  title: "Luna's Journal",
  description:
    "Luna's private account, in her own hand — filed by where each entry was written and who it is about.",
  alternates: { canonical: "/journal" },
};

interface JournalPageProps {
  searchParams: Promise<{ place?: string; about?: string }>;
}

export default async function JournalIndexPage({
  searchParams,
}: JournalPageProps) {
  const [{ active: member }, params] = await Promise.all([
    getMembership(),
    searchParams,
  ]);

  // Unknown values are dropped rather than 404'd, so a hand-edited URL can
  // never land on an impossible filter — same rule as the catalog.
  const place = places.find((p) => p.id === params.place)?.id as
    | PlaceId
    | undefined;
  const about = people.find((p) => p.id === params.about)?.id as
    | PersonId
    | undefined;

  const entries = journal.filter(
    (e) =>
      (!place || e.place === place) && (!about || e.about.includes(about)),
  );
  const filtering = Boolean(place || about);

  // Grouped by location when unfiltered — the way she'd have kept them, and
  // the way the question "what did she write at the lakehouse" gets answered.
  const groups = places
    .map((p) => ({
      place: p,
      entries: entries.filter((e) => e.place === p.id),
    }))
    .filter((g) => g.entries.length > 0);

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Her own hand
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            Luna&rsquo;s journal.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            What she wrote when nobody was going to read it — filed by the room
            she wrote it in, and by who it&rsquo;s about. One page each.
          </p>
        </header>

        {/* Plain links, no client JavaScript: filtering survives a refresh, is
            shareable, and stays crawlable. */}
        <nav
          aria-label="Filter the journal"
          className="border-y border-hairline py-3 sm:py-4"
        >
          <FacetRow
            legend="Where"
            options={places}
            active={place}
            hrefFor={(id) => href(id, about)}
            clearHref={href(undefined, about)}
          />
          <div className="mt-2 sm:mt-3">
            <FacetRow
              legend="About"
              options={people}
              active={about}
              hrefFor={(id) => href(place, id)}
              clearHref={href(place, undefined)}
            />
          </div>
        </nav>

        {entries.length === 0 ? (
          <Empty />
        ) : filtering ? (
          <section aria-label="Entries" className="pt-8">
            <h2 className="mb-5 font-display text-2xl font-medium text-ivory">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
              <span className="ml-2 text-base font-normal text-stone">
                {describe(place, about)}
              </span>
            </h2>
            <Grid entries={entries} member={member} />
          </section>
        ) : (
          <div className="pt-10">
            {/* Lead with the free pages so a visitor lands on an open door,
                not a wall of locks. Members already have everything, so this
                shop-window row is only worth showing to non-members. */}
            {!member && freeEntries().length > 0 && (
              <section
                aria-labelledby="free-heading"
                className="mb-14 rounded-xl border border-amber/25 bg-amber/[0.04] p-5 sm:p-6"
              >
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <div>
                    <h2
                      id="free-heading"
                      className="font-display text-2xl font-medium text-ivory sm:text-3xl"
                    >
                      Start here — free to read
                    </h2>
                    <p className="mt-1 max-w-md text-sm leading-relaxed text-stone">
                      A handful of her pages, open to everyone. No account
                      needed.
                    </p>
                  </div>
                  <span className="text-sm text-stone-dim">
                    {freeEntries().length} of {journal.length} entries
                  </span>
                </div>
                <Grid entries={freeEntries()} member={member} />
              </section>
            )}

            {groups.map((group) => (
              <section
                key={group.place.id}
                aria-labelledby={`place-${group.place.id}`}
                className="mb-14"
              >
                <div className="mb-5">
                  <h2
                    id={`place-${group.place.id}`}
                    className="font-display text-2xl font-medium text-ivory sm:text-3xl"
                  >
                    {group.place.label}
                  </h2>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-stone">
                    {group.place.blurb}
                  </p>
                </div>
                <Grid entries={group.entries} member={member} />
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function Grid({
  entries,
  member,
}: {
  entries: JournalEntry[];
  member: boolean;
}) {
  return (
    <Reveal className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <JournalCard key={entry.id} entry={entry} unlocked={member} />
      ))}
    </Reveal>
  );
}

// Generic over the facet's id type so `hrefFor` receives a PlaceId or a
// PersonId rather than a bare string — the ids are unions, and widening them
// here is how a typo in a filter link would get through.
function FacetRow<Id extends string>({
  legend,
  options,
  active,
  hrefFor,
  clearHref,
}: {
  legend: string;
  options: readonly { id: Id; label: string }[];
  active?: Id;
  hrefFor: (id: Id) => string;
  clearHref: string;
}) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <h2 className="w-14 shrink-0 text-[0.6875rem] uppercase leading-tight tracking-[0.15em] text-stone-dim sm:w-16 sm:text-xs sm:tracking-[0.2em]">
        {legend}
      </h2>
      {/* Scrolls sideways on a phone rather than wrapping to three lines. */}
      <ul className="rail-scroller -mr-5 flex min-w-0 flex-1 flex-nowrap gap-2 overflow-x-auto pr-5 sm:mr-0 sm:flex-wrap sm:pr-0">
        {options.map((option) => {
          const on = active === option.id;
          return (
            <li key={option.id} className="shrink-0">
              <Link
                href={on ? clearHref : hrefFor(option.id)}
                scroll={false}
                aria-current={on ? "true" : undefined}
                aria-label={
                  on ? `Remove filter: ${option.label}` : `Filter by ${option.label}`
                }
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm transition-colors duration-(--duration-quick) sm:py-1.5 ${
                  on
                    ? "border-amber bg-amber/15 text-amber-soft"
                    : "border-hairline text-stone hover:border-amber hover:text-amber"
                }`}
              >
                {option.label}
                {on && <span className="text-xs opacity-70">×</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Empty() {
  return (
    <div className="mt-10 rounded-lg border border-hairline bg-charcoal/50 p-10 text-center">
      <p className="text-stone">
        She didn&rsquo;t write anything down about that.
      </p>
      <Link
        href="/journal"
        className="mt-4 inline-block text-sm text-amber underline decoration-hairline underline-offset-4"
      >
        Back to every entry
      </Link>
    </div>
  );
}

function href(place?: PlaceId, about?: PersonId): string {
  const parts: string[] = [];
  if (place) parts.push(`place=${place}`);
  if (about) parts.push(`about=${about}`);
  return parts.length ? `/journal?${parts.join("&")}` : "/journal";
}

function describe(place?: PlaceId, about?: PersonId): string {
  const bits: string[] = [];
  if (place) bits.push(`at ${getPlace(place)?.label.toLowerCase() ?? place}`);
  if (about) {
    const label = getPerson(about)?.label ?? about;
    bits.push(about === "luna" ? "about herself" : `about ${label}`);
  }
  return bits.join(" · ");
}
