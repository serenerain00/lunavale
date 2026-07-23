import Image from "next/image";
import Link from "next/link";
import { CatalogCard } from "@/components/browse/CatalogCard";
import {
  Rail,
  RailItem,
  RAIL_ITEM_SIZES,
} from "@/components/browse/Rail";
import { Hero } from "@/components/home/Hero";
import { InterviewHero } from "@/components/home/InterviewHero";
import { Reveal } from "@/components/motion/Reveal";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { canWatch, getMembership } from "@/lib/access/entitlement";
import { catalog, shelves, type CatalogItem } from "@/lib/content/catalog";
import { heroForTime } from "@/lib/content/hero";
import { freeEntries, opening } from "@/lib/content/journal";
import { formatPrice, getTier } from "@/lib/content/membership";

export default async function Home() {
  const { active: member } = await getMembership();

  const free = catalog.filter((item) => item.access === "free");
  const premium = catalog.filter((item) => item.access === "premium");
  const vault = getTier("vault")!;

  // Rotates daily. Resolved per request rather than at build time, so the
  // turnover doesn't wait for a deploy.
  const hero = heroForTime();
  const heroUnlocked = hero ? await canWatch(hero.video) : false;

  return (
    <>
      <SiteHeader member={member} />

      <main className="flex-1 pb-24">
        {hero &&
          (hero.playInline ? (
            <InterviewHero hero={hero} member={member} />
          ) : (
            <Hero hero={hero} member={member} unlocked={heroUnlocked} />
          ))}

        {/* -------------------------------------------------------- journal */}
        {/* Leads the page, right under the hero: the writing is the hook,
            and free pages of Luna's hand are the strongest way to draw a
            stranger in — before the video rails. */}
        <section
          aria-labelledby="journal-heading"
          className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14"
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-amber">
                Her own hand
              </p>
              <h2
                id="journal-heading"
                className="mt-2 font-display text-2xl font-medium text-ivory sm:text-3xl"
              >
                Read from Luna&rsquo;s journal
              </h2>
              <p className="mt-2 max-w-lg leading-relaxed text-stone">
                What she wrote when nobody was going to read it. These few are
                free to read — the rest of the journal is part of the
                membership.
              </p>
            </div>
            <Link
              href="/journal"
              className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-hairline px-5 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
            >
              The whole journal
            </Link>
          </div>

          <Reveal className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {freeEntries()
              .slice(0, 3)
              .map((entry) => (
                <Link
                  key={entry.id}
                  href={`/journal/${entry.id}`}
                  data-reveal-item
                  className="group relative block overflow-hidden rounded-sm bg-paper shadow-[0_12px_34px_-12px_rgba(0,0,0,0.85)] transition-transform duration-(--duration-standard) ease-(--ease-standard) hover:-translate-y-1 focus-visible:-translate-y-1"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to bottom, transparent 0 21px, rgba(47,58,74,0.11) 21px 22px)",
                      backgroundPosition: "0 3.5rem",
                    }}
                  />
                  <div className="relative p-5">
                    <p className="font-hand text-xl leading-tight text-ink-soft">
                      {entry.dateline}
                    </p>
                    <p className="font-hand mt-3 line-clamp-4 text-xl leading-[1.4rem] text-ink">
                      {opening(entry, 150)}
                    </p>
                    <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-margin-rule/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#9a4b45]">
                      Free to read
                    </p>
                  </div>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-paper-shade to-transparent"
                  />
                </Link>
              ))}
          </Reveal>
        </section>

        {/* Then the scene rails — the streaming grammar everyone already
            reads: rows of frames to pick from. */}
        <div className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
          {free.length > 0 && (
            <Row
              heading="Start here"
              blurb="Open to everyone, in full. No account needed."
              href="/browse"
              hrefLabel="All scenes"
              items={free}
              member={member}
            />
          )}

          {premium.length > 0 && (
            <Row
              heading="In the Vault"
              blurb={
                member
                  ? "Yours, as part of your membership."
                  : "Members see these in full — and the locked rooms they came from."
              }
              href={member ? "/browse" : "/membership"}
              hrefLabel={member ? "All scenes" : "What membership opens"}
              items={premium}
              member={member}
            />
          )}
        </div>

        {/* ----------------------------------------------------- membership */}
        {!member && (
          <section
            aria-labelledby="join-heading"
            className="relative mt-6 overflow-hidden border-y border-hairline sm:mt-10"
          >
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber">
                  Membership
                </p>
                <h2
                  id="join-heading"
                  className="mt-4 max-w-xl font-display text-3xl font-light leading-[1.15] text-ivory sm:text-4xl"
                >
                  The rest of the house is behind one door.
                </h2>
                {/* Built as one string rather than JSX text around an
                    expression: JSX drops the whitespace either side of an
                    interpolation here, and "$8a month" is not a typo anyone
                    forgives on a page asking for money. */}
                <p className="mt-4 max-w-lg leading-relaxed text-stone">
                  {`The full scene library, the cuts that never go public, Luna’s journals, and the rooms you’ve already walked past without being able to open. From ${formatPrice(vault.priceMonthlyCents)} a month, cancel any time, and nothing that’s free today ever moves behind it.`}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/membership"
                    className="inline-flex min-h-12 items-center rounded-full bg-amber px-7 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
                  >
                    See what it opens
                  </Link>
                  <Link
                    href="/browse"
                    className="inline-flex min-h-12 items-center rounded-full border border-hairline px-7 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
                  >
                    Keep looking around
                  </Link>
                </div>
              </div>

              {/* Real locked frames — showing what's behind the door rather
                  than describing it. Flex, not a fixed 3-column grid: with two
                  premium items a grid leaves a visible empty cell. Dimmed
                  enough to read as withheld, bright enough to still sell. */}
              <Reveal className="flex gap-2 sm:gap-3">
                {premium.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    data-reveal-item
                    className="relative aspect-[2/3] flex-1 overflow-hidden rounded-lg ring-1 ring-hairline"
                  >
                    <Image
                      src={item.poster}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 30vw, 200px"
                      className="object-cover brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void/95 via-void/20 to-transparent" />
                    <span className="absolute inset-x-0 bottom-2.5 text-center text-[0.7rem] tracking-wide text-amber-soft">
                      Members
                    </span>
                  </div>
                ))}
              </Reveal>
            </div>
          </section>
        )}

        {/* --------------------------------------------------------- moods */}
        <section
          aria-labelledby="feeling-heading"
          className="mx-auto w-full max-w-6xl px-5 pt-16 sm:px-8 sm:pt-20"
        >
          <h2
            id="feeling-heading"
            className="font-display text-2xl font-medium text-ivory sm:text-3xl"
          >
            Or start from how it felt
          </h2>
          <p className="mt-2 max-w-lg leading-relaxed text-stone">
            Luna&rsquo;s world is filed by emotional context as much as by
            place. Pick the one you&rsquo;re in.
          </p>

          <Reveal className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {shelves().map((shelf) => (
              <Link
                key={shelf.feelingId}
                href={`/browse?feeling=${shelf.feelingId}`}
                data-reveal-item
                className="group relative flex aspect-[3/4] items-end overflow-hidden rounded-lg ring-1 ring-hairline"
              >
                <Image
                  src={shelf.items[0].poster}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover brightness-75 transition-[transform,filter] duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-105 group-hover:brightness-100"
                />
                {/* Scrim only where the label sits — the top two-thirds of the
                    frame stays as bright as the footage allows. */}
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 via-45% to-transparent" />
                <span className="relative p-3 font-display text-lg text-ivory">
                  {shelf.label}
                  <span className="block text-xs tabular-nums text-stone">
                    {shelf.items.length}
                  </span>
                </span>
              </Link>
            ))}
          </Reveal>
        </section>
      </main>
    </>
  );
}

/** One landing-page rail. Same slider the catalog uses, so it behaves the same. */
function Row({
  heading,
  blurb,
  href,
  hrefLabel,
  items,
  member,
}: {
  heading: string;
  blurb: string;
  href: string;
  hrefLabel: string;
  items: CatalogItem[];
  member: boolean;
}) {
  const headingId = `row-${heading.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section aria-labelledby={headingId} className="mb-14 sm:mb-16">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2
            id={headingId}
            className="font-display text-2xl font-medium text-ivory sm:text-3xl"
          >
            {heading}
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-stone">
            {blurb}
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-hairline px-5 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
        >
          {hrefLabel}
        </Link>
      </div>

      <Reveal>
        <Rail label={heading}>
          {items.map((item) => (
            <RailItem key={item.id}>
              <CatalogCard
                item={item}
                unlocked={member}
                sizes={RAIL_ITEM_SIZES}
              />
            </RailItem>
          ))}
        </Rail>
      </Reveal>
    </section>
  );
}
