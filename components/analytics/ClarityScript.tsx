"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Microsoft Clarity, everywhere except private screenings.
 *
 * Clarity records full URLs and session replays on a third-party service, and
 * a screening's URL IS its secret (/screening/<token>, 2026-11-16). So the
 * script is not loaded there at all. If a visitor reaches a screening after
 * Clarity has already loaded on another page, the token still never goes out:
 * nothing links from the site to a screening.
 */
export function ClarityScript() {
  const pathname = usePathname();
  if (pathname?.startsWith("/screening/")) return null;
  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "xr14rpnqlh");`}
    </Script>
  );
}
