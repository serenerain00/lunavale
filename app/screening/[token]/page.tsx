import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cookieName, openScreening, unlocked } from "@/lib/db/screenings";
import { PasswordForm } from "./PasswordForm";

/**
 * A private screening: one film, a password, nothing else.
 *
 * For festival judges (2026-11-16). Deliberately NOT part of the site: no
 * header, no menus into the series, not in any catalog or sitemap, noindex,
 * no referrer, and no Clarity (see components/analytics/ClarityScript.tsx).
 * Membership does not open it — only the token and the password do. A wrong
 * or closed token is an ordinary 404, so the page admits nothing.
 *
 * Rows come from scripts/screening.mjs; lib/db/screenings.ts has the checks.
 */

export const dynamic = "force-dynamic";

const PRIVATE: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const s = await openScreening((await params).token);
  return { ...PRIVATE, title: s ? `${s.title} — screening` : "Not found" };
}

export default async function ScreeningPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const s = await openScreening(token);
  if (!s) notFound();

  const isIn = unlocked(s, (await cookies()).get(cookieName(s))?.value);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-amber">
          Private screening
        </p>
        <h1 className="mt-3 font-display text-3xl font-light text-ivory sm:text-4xl">
          {s.title}
        </h1>
        {s.credit && <p className="mt-2 text-sm text-stone">{s.credit}</p>}
      </header>

      {isIn ? (
        <div className="mt-8">
          <video
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"
            disablePictureInPicture
            poster={s.posterPath ? `/api/screening/${s.token}/poster` : undefined}
            src={`/api/screening/${s.token}/video`}
            className="aspect-video w-full rounded-lg bg-black"
          />
          <p className="mt-4 text-center text-xs text-stone-dim">
            Please don&rsquo;t share this link or password. Best with sound on.
          </p>
        </div>
      ) : (
        <PasswordForm token={s.token} />
      )}
    </main>
  );
}
