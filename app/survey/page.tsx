import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { SurveyForm } from "@/components/survey/SurveyForm";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { ANSWERED_COOKIE, sceneOptions } from "@/lib/content/survey";
import { hasAnswered } from "@/lib/db/survey";

export const metadata: Metadata = {
  title: "Tell her what you think",
  description:
    "Six questions about the scenes so far — what's landing, and whether you'd watch this as a series or a film. No account needed.",
  alternates: { canonical: "/survey" },
};

export const dynamic = "force-dynamic";

/**
 * The audience survey.
 *
 * WHY IT ASKS THE STREAMING QUESTION OUT LOUD. Melissa's reason for running
 * this is partly to find out whether there is an audience for a series, and a
 * survey that buries that behind "how likely are you to recommend us" gets a
 * worse answer than one that says what it is for. People answer honestly when
 * they can see why they are being asked.
 *
 * ALREADY-ANSWERED IS A DIFFERENT PAGE rather than a silently pre-filled form.
 * Showing somebody the same six questions again is how you collect a second,
 * worse answer from a person being polite.
 */
export default async function SurveyPage() {
  const [{ active: member }, jar] = await Promise.all([
    getMembership(),
    cookies(),
  ]);
  const answered = await hasAnswered(jar.get(ANSWERED_COOKIE)?.value ?? "");

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-2 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Six questions
          </p>
          <h1 className="mt-4 font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            Tell her what you think.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-stone">
            Luna is being made right now, by a very small number of people, and
            what gets shot next is still an open question. This is the short
            version of asking you about it — about a minute, no account, no
            email.
          </p>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-stone">
            There&rsquo;s also a real question in here about whether this should
            be a series or a film, and whether you&rsquo;d watch it somewhere
            like Netflix. That one is not idle curiosity.
          </p>
        </header>

        {answered ? (
          <div className="mt-10 rounded-xl border border-hairline bg-charcoal/40 p-6 sm:p-8">
            <h2 className="font-display text-2xl font-light text-ivory">
              You&rsquo;ve already answered this one.
            </h2>
            <p className="mt-3 max-w-lg leading-relaxed text-stone">
              And it was counted — thank you. If something has changed your
              mind since, or you&rsquo;ve watched something that got under your
              skin, the box at the end of any scene goes straight to Melissa
              and she reads every one.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/journal"
                className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
              >
                Read her journal
              </Link>
              <Link
                href="/browse"
                className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
              >
                Back to the scenes
              </Link>
            </div>
          </div>
        ) : (
          <SurveyForm scenes={sceneOptions()} />
        )}
      </main>
    </>
  );
}
