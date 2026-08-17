import { SignUp } from "@clerk/nextjs";
import { SiteHeader } from "@/components/ui/SiteHeader";

export const metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

/**
 * Sign-up, which is reached two completely different ways and used to talk to
 * both of them the same way.
 *
 * THE BUG THIS FIXES (Melissa, 2026-08-10). Somebody who has just pressed a
 * button that said "keep reading her" is HALFWAY THROUGH BUYING. The page met
 * them with "An account keeps your place in Luna's world. Membership is a
 * separate step, and you can stop before it." — which is accurate, and is an
 * invitation to stop, offered at the exact moment they had decided not to.
 * It was copy written for a free-account funnel, on the one path that is
 * supposed to end in a payment.
 *
 * So the page now reads the redirect it was handed. Arriving from
 * /membership/start, it says what is actually happening: this is step one of
 * two, and the next screen is the card. Arriving any other way — the "Sign in"
 * link, a bookmark — it keeps the old, honest, no-pressure version, because
 * that person genuinely is not buying anything.
 *
 * The redirect is only READ here, never followed: Clerk owns where it goes
 * next. Getting it wrong changes a sentence, not a destination.
 */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirect = String(params.redirect_url ?? "");
  const buying = redirect.includes("/membership/start");

  return (
    <>
      <SiteHeader member={false} />
      <main className="flex flex-1 flex-col items-center px-5 pb-24 pt-16 sm:px-8">
        <h1 className="mb-2 text-center font-display text-3xl font-light text-ivory">
          {buying ? "One step, then you're in." : "Create an account."}
        </h1>
        <p className="mb-8 max-w-md text-center text-sm leading-relaxed text-stone">
          {buying ? (
            <>
              This is where your membership lives, so you can read on any
              device and pick up where you stopped. Payment is the next screen.
            </>
          ) : (
            <>
              An account keeps your place in Luna&rsquo;s world. Membership is a
              separate step, and you can stop before it.
            </>
          )}
        </p>
        <SignUp />
      </main>
    </>
  );
}
