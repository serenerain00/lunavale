import { SignIn } from "@clerk/nextjs";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { InAppNotice } from "@/components/access/InAppNotice";
import { HIDE_SOCIAL } from "@/lib/access/clerk-appearance";
import { inAppBrowser } from "@/lib/access/in-app";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Reads the user agent since 2026-10-18 (which makes this page dynamic): inside
 * Facebook's or Instagram's browser the Google button is hidden and the page
 * says why — Google refuses sign-in there. See lib/access/in-app.ts.
 */
export default async function SignInPage() {
  const inApp = inAppBrowser((await headers()).get("user-agent"));
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center px-5 pb-24 pt-16 sm:px-8">
        <h1 className="mb-8 font-display text-3xl font-light text-ivory">
          Welcome back.
        </h1>
        {inApp && <InAppNotice app={inApp} />}
        <SignIn appearance={inApp ? HIDE_SOCIAL : undefined} />
      </main>
    </>
  );
}
