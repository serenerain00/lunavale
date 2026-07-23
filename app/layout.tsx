import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { authConfigured } from "@/lib/billing/provider";
import { Caveat, Fraunces, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://lunavault.com"),
  title: {
    default: "Luna Vault",
    template: "%s · Luna Vault",
  },
  description:
    "An explorable cinematic universe of original stories. Enter the world, discover scenes, and unlock deeper access.",
  openGraph: {
    title: "Luna Vault",
    description:
      "An explorable cinematic universe of original stories.",
    siteName: "Luna Vault",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luna Vault",
    description: "An explorable cinematic universe of original stories.",
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
        {children}

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
