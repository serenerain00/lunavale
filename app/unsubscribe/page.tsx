import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { UnsubscribeForm } from "@/components/email/UnsubscribeForm";
import { tokenValid } from "@/lib/email/unsubscribe";

export const metadata: Metadata = {
  title: "Unsubscribe",
  // Nobody should arrive here from a search engine, and the address is in the
  // URL. Keep it out of every index.
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Coming off the email list.
 *
 * ONE BUTTON, NO QUESTIONS, NO OFFER. There is no "are you sure", no survey,
 * no "would you rather hear from us monthly" — the same rule that keeps a
 * retention flow out of the cancel path applies here, and more sharply,
 * because the cost of making this hard is that the next click is "Report
 * spam" and it costs the sending domain rather than the list.
 *
 * WHY THE PAGE DOES NOT JUST DO IT. See app/unsubscribe/actions.ts: link
 * scanners fetch every URL in an email, and a GET that unsubscribes would
 * remove people who never clicked anything.
 *
 * MEMBERSHIP IS UNAFFECTED, and the page says so. Somebody who wanted less
 * mail and discovers they have also cancelled their subscription has been
 * robbed, and would be right to say so.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  const { e = "", t = "" } = await searchParams;
  const valid = Boolean(e) && tokenValid(e, t);

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-16 sm:pt-24">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Email
          </p>
          <h1 className="mt-4 font-display text-3xl font-light leading-[1.15] text-ivory sm:text-4xl">
            {valid ? "Stop these emails." : "This link isn’t valid."}
          </h1>
        </header>

        {valid ? (
          <UnsubscribeForm email={e} token={t} />
        ) : (
          <div className="rounded-xl border border-hairline p-6">
            <p className="text-sm leading-relaxed text-stone">
              It may have been cut in half by a mail client, or it may be older
              than the last time the link signing changed. Either way, nothing
              has happened to your address.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-stone">
              Write to Melissa on the{" "}
              <Link
                href="/help"
                className="text-ivory underline decoration-hairline underline-offset-4 hover:text-amber"
              >
                help page
              </Link>{" "}
              and she&rsquo;ll take you off by hand.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
