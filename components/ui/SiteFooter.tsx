import Link from "next/link";
import { PAGE } from "@/components/ui/layout";

/**
 * The line at the bottom of every page: who runs this, how to reach them, and
 * the terms. Added 2026-11-15 after a viewer asked why there were no company
 * details or refund policy anywhere.
 *
 * "Luna Vale" and the hello@ address only. Melissa's name stays off it (her
 * call, 2026-11-15).
 *
 * NO HELP LINK: Help is members-only in the nav (her call, see SiteHeader),
 * and the address above is the way to reach us for everyone else.
 *
 * Server component, no state: it renders the same for everyone, so it costs
 * statically cached pages nothing.
 */
export function SiteFooter() {
  const link =
    "underline decoration-hairline underline-offset-4 transition-colors duration-(--duration-quick) hover:text-amber";
  return (
    <footer className="mt-auto border-t border-hairline">
      <div className={`${PAGE} flex flex-wrap items-center gap-x-5 gap-y-2 py-6 text-xs text-stone-dim`}>
        <span>&copy; {new Date().getFullYear()} Luna Vale</span>
        <a href="mailto:hello@lunavale38.com" className={link}>
          hello@lunavale38.com
        </a>
        <Link href="/terms" className={link}>
          Terms &amp; refunds
        </Link>
      </div>
    </footer>
  );
}
