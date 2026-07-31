import type { Metadata } from "next";
import Link from "next/link";
import { HelpForm } from "@/components/help/HelpForm";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { authConfigured } from "@/lib/billing/provider";

export const metadata: Metadata = {
  title: "Help",
  description:
    "Something not working, a question about your membership, or something you just want to say — it reaches Melissa directly.",
  alternates: { canonical: "/help" },
};

export const dynamic = "force-dynamic";

/**
 * Help and contact.
 *
 * The common answers are on the page so that most people never need to write
 * anything — a contact form that is the only route to an answer generates work
 * for both sides. What is left goes to Melissa.
 */
export default async function HelpPage() {
  const [{ active: member }, email] = await Promise.all([
    getMembership(),
    signedInEmail(),
  ]);

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">Help</p>
          <h1 className="mt-4 font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            Ask, and she&rsquo;ll answer.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            Luna Vale is made by one person. There&rsquo;s no support desk —
            what you write here reaches Melissa, and she answers most of it
            herself.
          </p>
        </header>

        {/* Answered up front so most people never have to write anything. */}
        <section aria-labelledby="common" className="mb-10">
          <h2
            id="common"
            className="mb-4 text-xs uppercase tracking-[0.2em] text-stone-dim"
          >
            Probably this
          </h2>
          <dl className="divide-y divide-hairline">
            <Answer q="I paid and something is still locked.">
              Sign out and back in — access is read when you sign in, so a
              membership bought in another tab sometimes needs that. If it is
              still locked after that, write below and say which page; it is a
              real bug and she will want to know.
            </Answer>
            <Answer q="How do I cancel?">
              <Link href="/account" className="text-amber underline decoration-hairline underline-offset-4">
                Your account page
              </Link>{" "}
              has the billing portal. Cancelling is immediate and you keep
              access until the end of the period you have already paid for. No
              email required, and nobody will try to talk you out of it.
            </Answer>
            <Answer q="A video won't play.">
              Tell her which one, and what you were using — phone or computer,
              and which browser. That is usually enough to find it.
            </Answer>
            <Answer q="Can I use a still or a clip somewhere?">
              Ask. The answer is often yes with a credit, but it has to be
              asked — everything here is her work.
            </Answer>
            <Answer q="Something in the story is wrong, or upsetting.">
              Say so plainly below. Content notes exist for a reason and if one
              is missing where it should be, that is worth fixing quickly.
            </Answer>
          </dl>
        </section>

        <HelpForm defaultEmail={email ?? undefined} />

        <p className="mt-6 text-xs leading-relaxed text-stone-dim">
          Your message is stored so she can answer it, and is never shown to
          anyone else or published anywhere. If you want to say something in
          public instead, that is what{" "}
          <Link
            href="/overheard"
            className="text-amber underline decoration-hairline underline-offset-4"
          >
            Overheard
          </Link>{" "}
          is for.
        </p>
      </main>
    </>
  );
}

function Answer({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="py-4">
      <dt className="font-display text-lg text-ivory">{q}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-stone">{children}</dd>
    </div>
  );
}

/** Pre-fills the reply address for someone already signed in — one less thing
 *  to type, and it is an address she already has. */
async function signedInEmail(): Promise<string | null> {
  if (!authConfigured()) return null;
  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();
    return user?.primaryEmailAddress?.emailAddress ?? null;
  } catch {
    return null;
  }
}
