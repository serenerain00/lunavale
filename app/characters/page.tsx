import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Guest } from "@/components/access/Viewer";
import { Reveal } from "@/components/motion/Reveal";
import { SiteHeader } from "@/components/ui/SiteHeader";
import {
  characters,
  countFor,
  lockedCountFor,
  type Character,
} from "@/lib/content/characters";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "The Three of Them",
  description:
    "Luna, Tyson and Josh — every scene, still, clip and page filed under each of them, plus the notes they kept on set.",
  path: "/characters",
});

export default async function CharactersIndexPage() {

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-10 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            The three of them
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            Everyone this happens to.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            The world is browsable by where a thing happened and by how it felt.
            This is the third way in — by who it happened to. Everything filed
            under one person, in one place, including the notes they kept while
            it was being made.
          </p>
        </header>

        <Reveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </Reveal>
      </main>
    </>
  );
}

function CharacterCard({ character }: { character: Character }) {
  const total = countFor(character.id);
  const locked = lockedCountFor(character.id);

  return (
    <Link
      href={`/characters/${character.id}`}
      data-reveal-item
      className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-charcoal ring-1 ring-hairline transition-transform duration-(--duration-standard) ease-(--ease-standard) hover:-translate-y-1 focus-visible:-translate-y-1"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={character.portrait}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover brightness-90 transition-transform duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-[1.04] group-hover:brightness-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="font-display text-3xl font-light leading-none text-ivory">
            {character.name}
          </h2>
          <p className="mt-1.5 text-xs uppercase tracking-[0.14em] text-amber">
            {character.role}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm leading-relaxed text-stone">
          {character.tagline}
        </p>
        {/* Stated plainly rather than teased. A visitor deciding whether to pay
            is owed the actual size of what is behind the wall. */}
        <p className="mt-4 text-xs text-stone-dim">
          {total} pieces
          {/* Shown to a stranger, hidden from someone who already has them.
              Resolved on the client so this page can stay static — the count
              itself is derived from the public catalog, so nothing is
              disclosed by it being in the HTML. */}
          {locked > 0 && (
            <Guest>
              {" "}
              · {locked} members-only
            </Guest>
          )}
        </p>
      </div>
    </Link>
  );
}
