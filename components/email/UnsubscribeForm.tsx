"use client";

/**
 * The unsubscribe button and what it says afterwards.
 *
 * A client component only because it has to show a result in place. The work
 * is a server action (app/unsubscribe/actions.ts); this holds the pending and
 * done states so that pressing the button produces a visible answer rather
 * than a page that appears to have ignored you.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { unsubscribe } from "@/app/unsubscribe/actions";

export function UnsubscribeForm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="rounded-xl border border-hairline p-6">
        <p className="text-base leading-relaxed text-ivory">
          Done. No more email to{" "}
          <span className="text-stone">{email}</span>.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone">
          Your membership and everything it opens are untouched — this was only
          the mailing list. If you ever want it back, ask on the{" "}
          <Link
            href="/help"
            className="text-ivory underline decoration-hairline underline-offset-4 hover:text-amber"
          >
            help page
          </Link>
          ; it is deliberately not a button, so that nothing puts you back on
          by accident.
        </p>
      </div>
    );
  }

  return (
    <form
      className="rounded-xl border border-hairline p-6"
      action={(formData) =>
        startTransition(async () => {
          const res = await unsubscribe(formData);
          if (res.ok) setDone(true);
          else setError(res.error);
        })
      }
    >
      <input type="hidden" name="e" value={email} />
      <input type="hidden" name="t" value={token} />

      <p className="text-base leading-relaxed text-ivory">{email}</p>
      <p className="mt-2 text-sm leading-relaxed text-stone">
        One press and this address comes off the list. It does not cancel a
        membership and it does not close an account — you keep everything you
        can open today.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-wine hover:text-ivory disabled:opacity-50"
      >
        {pending ? "Taking you off…" : "Stop sending me email"}
      </button>

      {error && (
        <p role="alert" className="mt-4 text-sm text-wine">
          {error}
        </p>
      )}
    </form>
  );
}
