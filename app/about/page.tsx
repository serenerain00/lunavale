import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import {
  howToWatch,
  inProduction,
  premise,
  startingPoints,
  type AboutSection,
} from "@/lib/content/about";
import { journal } from "@/lib/content/journal";
import { getVideo } from "@/lib/content/videos";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "What this is",
  description:
    "Luna spent ten years with Josh, six months without him, and twenty years with Tyson as her best friend. Who everyone is, and why the scenes arrive out of order.",
  path: "/about",
});

/**
 * The orientation page — written for somebody who arrived from a thirty-second
 * clip and has no idea who any of these people are.
 *
 * The premise is free and stays free. It is the answer to a confused comment,
 * and putting the answer behind a paywall would be charging admission for
 * knowing what you are looking at.
 *
 * What IS behind the membership is the chronology at the bottom: the whole
 * story laid out in the order it happened. That is a navigation tool for
 * somebody already in, not the thing that makes the story make sense — see
 * `howToWatch`, which does that job for everyone.
 */
export default async function AboutPage() {
  const { active: member } = await getMembership();

  // Luna's journal is already the spine: lib/content/journal.ts keeps its
  // entries in story order and says so, and the index and prev/next links
  // both read from that order. So the chronology is derived rather than
  // written down a second time — one canon, no chance of the two drifting.
  const chronology = journal.map((entry) => ({
    id: entry.id,
    dateline: entry.dateline,
    scene: entry.sceneSlug ? getVideo(entry.sceneSlug) : undefined,
  }));

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-4 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            What this is
          </p>
          <h1 className="mt-4 font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            Ten years, six months apart, and the friend who stayed.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-stone">
            If you got here from a clip and weren&rsquo;t sure what you were
            watching, this page is for you. It takes about a minute and it
            gives nothing away.
          </p>
        </header>

        {premise.map((section) => (
          <Prose key={section.id} section={section} />
        ))}

        {/* The section the whole page is really for. Given a border and its own
            colour so a skimming reader lands on it — someone who thinks they
            are lost stops watching, and this is the paragraph that tells them
            they are not. */}
        <section
          aria-labelledby={howToWatch.id}
          className="mt-12 rounded-xl border border-amber/25 bg-amber/[0.04] px-5 py-6 sm:px-7 sm:py-7"
        >
          <h2
            id={howToWatch.id}
            className="font-display text-2xl font-light text-ivory"
          >
            {howToWatch.heading}
          </h2>
          {howToWatch.body.map((para, i) => (
            <p
              key={i}
              className="mt-3 max-w-2xl leading-relaxed text-stone first:mt-4"
            >
              {bold(para)}
            </p>
          ))}
        </section>

        {/* ------------------------------------------------------ where to go */}
        <section aria-labelledby="start" className="mt-14">
          <h2
            id="start"
            className="font-display text-2xl font-light text-ivory"
          >
            Where to start
          </h2>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {startingPoints.map((point) => (
              <li key={point.href}>
                <Link
                  href={point.href}
                  className="group block h-full rounded-lg border border-hairline px-4 py-4 transition-colors duration-(--duration-quick) hover:border-amber"
                >
                  <span className="font-display text-lg text-ivory transition-colors duration-(--duration-quick) group-hover:text-amber">
                    {point.label}
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-stone">
                    {point.detail}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Placed after "where to start" on purpose: orient, then let them
            begin, and only then say the thing that asks something of them.
            Leading with "you can shape it" would be pitching to somebody who
            still doesn't know who Luna is. */}
        <Prose section={inProduction} />

        {/* ------------------------------------------------- the order of it */}
        <section aria-labelledby="chronology" className="mt-14">
          <h2
            id="chronology"
            className="font-display text-2xl font-light text-ivory"
          >
            The order it actually happened in
          </h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-stone">
            The whole story so far, in sequence, from the first box out of the
            house to where it stands now — {chronology.length}{" "}
            entries in Luna&rsquo;s own hand, with the scene that sits beside
            each one.
          </p>

          {member ? (
            <ol className="mt-6 space-y-0">
              {chronology.map((item, i) => (
                <li
                  key={item.id}
                  className="flex gap-4 border-b border-hairline py-3 last:border-0"
                >
                  <span className="w-6 shrink-0 pt-0.5 text-right text-xs tabular-nums text-stone-dim">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/journal/${item.id}`}
                      className="text-[0.9375rem] leading-snug text-stone transition-colors duration-(--duration-quick) hover:text-amber"
                    >
                      {item.dateline}
                    </Link>
                    {item.scene && (
                      <Link
                        href={`/watch/${item.scene.slug}`}
                        className="mt-0.5 block text-xs text-stone-dim transition-colors duration-(--duration-quick) hover:text-amber"
                      >
                        Scene: {item.scene.title}
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-5 max-w-2xl rounded-lg border border-hairline px-4 py-3 text-sm leading-relaxed text-stone">
              Members get the sequence laid out end to end — useful precisely
              because the scenes do not arrive in it.{" "}
              <Link
                href="/membership"
                className="text-amber underline-offset-4 transition-colors duration-(--duration-quick) hover:underline"
              >
                What membership opens
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function Prose({ section }: { section: AboutSection }) {
  return (
    <section aria-labelledby={section.id} className="mt-12">
      <h2
        id={section.id}
        className="font-display text-2xl font-light text-ivory"
      >
        {section.heading}
      </h2>
      {section.body.map((para, i) => (
        <p
          key={i}
          className="mt-3 max-w-2xl leading-relaxed text-stone first:mt-4"
        >
          {bold(para)}
        </p>
      ))}
      {section.links && (
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {section.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-amber underline decoration-hairline underline-offset-4 transition-colors duration-(--duration-quick) hover:decoration-amber"
            >
              {link.label}
            </Link>
          ))}
        </p>
      )}
    </section>
  );
}

/**
 * **Name** → emphasis, and nothing else.
 *
 * The copy needs to lift two names out of a paragraph and that is the whole
 * requirement, so this is a split on asterisks rather than a markdown
 * dependency. If the About copy ever wants links or lists, take the dependency
 * then instead of growing this.
 */
function bold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-medium text-ivory">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
