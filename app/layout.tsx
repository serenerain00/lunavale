import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { ViewerProvider } from "@/components/access/Viewer";
import { ClerkViewerSync } from "@/components/access/ClerkViewerSync";
import { authConfigured } from "@/lib/billing/provider";
import { Caveat, Fraunces, Inter } from "next/font/google";
import { BackToTop } from "@/components/ui/BackToTop";
import "./globals.css";

// Display serif for titles; highly readable sans for controls and metadata.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Luna's hand, for the journal pages only. Caveat over the more authentic-
// looking script faces on purpose: those become genuinely unreadable at
// paragraph length, and an entry nobody can read is not atmosphere, it is a
// locked door. Every page can still be switched to plain text — see
// components/journal/JournalPaper.tsx.
const caveat = Caveat({
  // Named for the face; app/globals.css aliases it to --font-hand, matching
  // how the display and sans faces are wired.
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

/**
 * One sentence for a share card, one for a search result. Written out here
 * rather than imported from lib/content so this file has no dependency that
 * could fail during a metadata render.
 */
const SHORT_DESCRIPTION =
  "A cinematic drama series about three people, twenty years of history, and one question nobody wants answered.";
const LONG_DESCRIPTION =
  "Between Us \u2014 a cinematic drama series about Luna, Josh and Tyson. Watch the clips in order, read her journal, and get season one first as a member.";

export const metadata: Metadata = {
  /*
    The real domain. This said lunavault.com until 2026-08-13 — a domain
    Melissa does not own, parked and listed for sale. metadataBase is what
    every relative Open Graph and Twitter image URL is resolved against, so
    each time anyone shared a link the preview card was pointed at a
    squatter's page rather than at the site.

    Apex rather than www, matching what Clerk already treats as home
    (its home_url and after_sign_in_url are both the apex). Both hosts
    currently serve the app directly with no redirect between them, so this
    is also the file that decides which of the two is the canonical one.
  */
  metadataBase: new URL("https://lunavale38.com"),
  title: {
    default: "Luna Vale",
    template: "%s · Luna Vale",
  },
  /*
   * REWRITTEN 2026-09-17. This said "An explorable cinematic universe of
   * original stories. Enter the world, discover scenes, and unlock deeper
   * access." Three things wrong with it by then, and it is the most-seen copy
   * on the site: it is the Google result, and it is what renders when somebody
   * pastes a link into Instagram or a message.
   *
   *   "explorable ... universe"  the world came off the site on 09-15
   *   "Enter the world"          that route 404s
   *   "discover scenes"          they are called clips since 09-16
   *
   * It also never said what the thing IS. Somebody deciding whether to tap a
   * shared link needs a genre and a premise, not a description of a website.
   */
  description: LONG_DESCRIPTION,
  openGraph: {
    title: "Between Us \u2014 a Luna Vale series",
    description: SHORT_DESCRIPTION,
    siteName: "Luna Vale",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Between Us \u2014 a Luna Vale series",
    description: SHORT_DESCRIPTION,
  },
};

/**
 * `viewportFit: "cover"` lets full-bleed surfaces (the lightbox, rails that
 * run to the screen edge) reach into a phone's rounded corners, with
 * env(safe-area-inset-*) keeping controls out of the notch and home indicator.
 * Pinch-zoom is left enabled on purpose — disabling it fails WCAG 1.4.4.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0908",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${caveat.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-void text-ivory">
        {/*
          Wraps everything so a statically cached page can still tell a member
          from a stranger. It asks /api/me once after hydration and swaps the
          handful of labels and links that differ — see components/access/Viewer.tsx
          for why the alternative (reading the cookie during render) made every
          page uncacheable and cost $118 in August 2026.

          This provider decides what buttons SAY. It never decides what anyone
          RECEIVES; that stays server-side in /api/stream and canWatch().
        */}
        {/*
          The focus target for "back to top". A skip-link-style anchor: it
          takes focus but never a tab stop, so a keyboard visitor sent back to
          the top lands there rather than being moved visually and left at the
          bottom of the document.
        */}
        <div id="top" tabIndex={-1} className="outline-none" />

        <ViewerProvider>
          {/*
            Inside the provider so it can refresh it, and rendered only where
            Clerk exists so useAuth() has a ClerkProvider above it. Without
            this, signing in leaves the header saying "Sign in" until the
            visitor reloads by hand — see the component for the whole story.
          */}
          {authConfigured() && <ClerkViewerSync />}
          {children}
        </ViewerProvider>

        {/* Every page, outside the provider — it needs nothing from it. */}
        <BackToTop />

        {/*
          Microsoft Clarity — traffic + session analytics. Production only, so
          local dev and preview deploys don't pollute the numbers.
          afterInteractive loads it once the page is usable, off the critical
          path. Project id xr14rpnqlh.
        */}
        {process.env.NODE_ENV === "production" && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "xr14rpnqlh");`}
          </Script>
        )}
      </body>
    </html>
  );

  /*
    Wrapped only when Clerk has keys. ClerkProvider throws without a
    publishable key, and the site is live — a deploy that hasn't been given
    credentials yet has to keep rendering rather than white-screen.
  */
  return authConfigured() ? <ClerkProvider>{body}</ClerkProvider> : body;
}
