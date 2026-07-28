import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NoteCard } from "@/components/characters/NoteCard";
import { CatalogCard } from "@/components/browse/CatalogCard";
import { JournalCard } from "@/components/journal/JournalCard";
import { Reveal } from "@/components/motion/Reveal";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { noteKinds } from "@/lib/content/between-takes";
import type { CatalogItem } from "@/lib/content/catalog";
import {
  characters,
  contentFor,
  getCharacter,
  lockedCountFor,
  others,
} from "@/lib/content/characters";
import { clipAccess } from "@/lib/content/clips";
import { formatDuration } from "@/lib/content/videos";

interface CharacterPageProps {
  params: Promise<{ id: string }>;
}

/** Every character is a known, finite page — prerender all three. */
export function generateStaticParams() {
  return characters.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: CharacterPageProps): Promise<Metadata> {
  const character = getCharacter((await params).id);
  if (!character) return {};
  return {
    title: character.name,
    description: character.tagline,
    alternates: { canonical: `/characters/${character.id}` },
    openGraph: {
      title: `${character.name} — Luna Vale`,
      description: character.tagline,
      images: [character.portrait],
    },
  };
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const [{ active: member }, { id }] = await Promise.all([
    getMembership(),
    params,
  ]);

  const character = getCharacter(id);
  if (!character) notFound();

  const content = contentFor(character.id);
  const locked = lockedCountFor(character.id);

  // Scenes and galleries share the catalog card, so project them into the same
  // shape the browse index uses rather than growing a second card component.
  const scenes: CatalogItem[] = content.scenes.map((v) => ({
    id: `scene:${v.slug}`,
    kind: "scene",
    title: v.title,
    synopsis: v.synopsis,
    href: `/watch/${v.slug}`,
    poster: v.poster,
    meta: formatDuration(v.durationSeconds),
    access: v.access,
    mature: v.mature,
    feelings: [...v.feelings],
    place: v.place,
  }));

  const galleries: CatalogItem[] = content.galleries.map((g) => ({
    id: `gallery:${g.id}`,
    kind: "gallery",
    title: g.title,
    synopsis: g.description[0] ?? g.subtitle,
    href: `/gallery/${g.id}`,
    poster: g.cover,
    meta: `${g.count} stills`,
    access: g.access,
    mature: g.mature,
    feelings: [...g.feelings],
    place: g.place,
  }));

  return (
    <>
      <SiteHeader member={member} />

      <main className="flex-1 pb-24">
        {/* ------------------------------------------------------ the person */}
        <header className="relative">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12">
            <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-lg ring-1 ring-hairline lg:mx-0 lg:max-w-none">
              <Image
                src={character.portrait}
                alt={`${character.name}, from the cast interview`}
                width={900}
                height={1200}
                priority
                sizes="(max-width: 1024px) 20rem, 22rem"
                className="w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <nav aria-label="Breadcrumb">
                <Link
                  href="/characters"
                  className="text-xs uppercase tracking-[0.2em] text-amber transition-colors duration-(--duration-quick) hover:text-amber-soft"
                >
                  ← The three of them
                </Link>
              </nav>

              <h1 className="mt-4 font-display text-5xl font-light leading-none text-ivory sm:text-6xl">
                {character.name}
              </h1>
              <p className="mt-3 text-sm uppercase tracking-[0.14em] text-stone">
                {character.role}
              </p>

              <div className="mt-6 max-w-2xl space-y-4">
                {character.intro.map((para, i) => (
                  <p key={i} className="text-base leading-relaxed text-stone">
                    {para}
                  </p>
                ))}
              </div>

              <figure className="mt-7 border-l-2 border-amber/50 pl-5">
                <blockquote className="font-display text-2xl font-light leading-snug text-ivory">
                  “{character.pullQuote}”
                </blockquote>
                <figcaption className="mt-2 text-xs uppercase tracking-[0.14em] text-stone-dim">
                  {character.pullQuoteSource}
                </figcaption>
              </figure>

              <ul className="mt-7 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {character.details.map((detail) => (
                  <li
                    key={detail}
                    className="flex gap-2.5 text-sm leading-relaxed text-stone"
                  >
                    <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-amber/60" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          {/* --------------------------------------------- between takes */}
          {content.notes.length > 0 && (
            <Section
              id="between-takes"
              eyebrow="Between takes"
              title={`${character.name}’s notes from set`}
              blurb="What they wrote down while it was being made — the jokes, the reasons a beat was played the way it was, and the things about a scene they only worked out by shooting it."
            >
              <p className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-dim">
                {noteKinds.map((kind) => (
                  <span key={kind.id}>
                    <span className="font-semibold uppercase tracking-[0.12em] text-stone">
                      {kind.label}
                    </span>{" "}
                    {kind.blurb}
                  </span>
                ))}
              </p>
              <Reveal className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {content.notes.map((note) => (
                  <NoteCard key={note.id} note={note} unlocked={member} />
                ))}
              </Reveal>
            </Section>
          )}

          {/* ---------------------------------------------------- scenes */}
          {scenes.length > 0 && (
            <Section
              id="scenes"
              eyebrow="Scenes"
              title={`Where you see ${character.name}`}
              blurb="Every scene they are in, in the order the story tells it."
            >
              <Reveal className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {scenes.map((item) => (
                  <CatalogCard key={item.id} item={item} unlocked={member} />
                ))}
              </Reveal>
            </Section>
          )}

          {/* -------------------------------------------------- galleries */}
          {galleries.length > 0 && (
            <Section
              id="stills"
              eyebrow="Stills"
              title="Photographed"
              blurb="Sets of stills from the events they were part of."
            >
              <Reveal className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {galleries.map((item) => (
                  <CatalogCard key={item.id} item={item} unlocked={member} />
                ))}
              </Reveal>
            </Section>
          )}

          {/* ------------------------------------------------------ clips */}
          {content.clips.length > 0 && (
            <Section
              id="clips"
              eyebrow="Clips"
              title="Short cuts"
              blurb="Vertical cuts, a minute or two each."
            >
              <Reveal className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {content.clips.map((clip) => {
                  const clipLocked =
                    clipAccess(clip) === "premium" && !member;
                  return (
                    <Link
                      key={clip.id}
                      href={`/clips/${clip.id}`}
                      data-reveal-item
                      className="group relative block overflow-hidden rounded-lg bg-charcoal ring-1 ring-hairline transition-transform duration-(--duration-standard) ease-(--ease-standard) hover:-translate-y-1 focus-visible:-translate-y-1"
                    >
                      <div className="relative aspect-[9/16] overflow-hidden">
                        {/* A gated clip's poster is withheld, not dimmed — the
                            point of gating a sex scene includes its still. */}
                        {clipLocked ? (
                          <div className="absolute inset-0 bg-obsidian" />
                        ) : (
                          <Image
                            src={clip.poster}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover brightness-90 transition-transform duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-[1.04] group-hover:brightness-100"
                          />
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-3">
                          <p className="font-display text-base leading-tight text-ivory">
                            {clip.title}
                          </p>
                          <p className="mt-0.5 text-xs tabular-nums text-stone">
                            {formatDuration(clip.durationSeconds)}
                            {clipLocked && " · Members"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </Reveal>
            </Section>
          )}

          {/* ---------------------------------------------------- journal */}
          {content.journal.length > 0 && (
            <Section
              id="journal"
              eyebrow="Her journal"
              title={
                character.id === "luna"
                  ? "The pages she wrote about herself"
                  : `What Luna wrote about ${character.name}`
              }
              blurb={
                character.id === "luna"
                  ? "Her own account, filed under nobody but her."
                  : "Her private account of him, in her own hand."
              }
              action={{
                href: `/journal?about=${character.id}`,
                label: "All entries",
              }}
            >
              <Reveal className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {content.journal.slice(0, 6).map((entry) => (
                  <JournalCard key={entry.id} entry={entry} unlocked={member} />
                ))}
              </Reveal>
            </Section>
          )}

          {/* --------------------------------------------------- the pitch */}
          {!member && locked > 0 && (
            <section className="mt-16 rounded-xl border border-amber/25 bg-amber/[0.04] p-6 sm:p-8">
              <h2 className="font-display text-2xl font-medium text-ivory sm:text-3xl">
                {locked} of {character.name}’s pages are in the Vault
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone">
                The rest of the notebook, the scenes that are not public, and
                the pages of Luna&rsquo;s journal that have a turn in them.
                Eight dollars a month, cancel any time.
              </p>
              <Link
                href="/membership"
                className="mt-5 inline-flex min-h-10 items-center rounded-full bg-amber px-5 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
              >
                Open the Vault
              </Link>
            </section>
          )}

          {/* -------------------------------------------------- the others */}
          <section className="mt-16 border-t border-hairline pt-8">
            <h2 className="font-display text-xl font-medium text-ivory">
              The other two
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {others(character.id).map((other) => (
                <Link
                  key={other.id}
                  href={`/characters/${other.id}`}
                  className="group flex items-center gap-4 rounded-lg bg-charcoal p-3 ring-1 ring-hairline transition-colors duration-(--duration-quick) hover:ring-amber/40"
                >
                  <Image
                    src={other.portrait}
                    alt=""
                    width={72}
                    height={96}
                    sizes="72px"
                    className="h-24 w-[4.5rem] shrink-0 rounded object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block font-display text-xl text-ivory">
                      {other.name}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-stone">
                      {other.role}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function Section({
  id,
  eyebrow,
  title,
  blurb,
  action,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  blurb: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="mt-16">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            {eyebrow}
          </p>
          <h2
            id={`${id}-heading`}
            className="mt-2 font-display text-2xl font-medium text-ivory sm:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-stone">
            {blurb}
          </p>
        </div>
        {action && (
          <Link
            href={action.href}
            className="whitespace-nowrap text-sm text-amber underline decoration-hairline underline-offset-4 transition-colors duration-(--duration-quick) hover:decoration-amber"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
