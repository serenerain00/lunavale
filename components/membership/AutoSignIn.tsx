"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { choosePassword, type PasswordState } from "@/app/welcome/actions";

/**
 * /welcome's account step when paying has already made the account
 * (lib/billing/auto-account.ts): sign in with the one-time ticket, then offer
 * one field — a password, for other devices.
 *
 * If the ticket fails for any reason it renders `fallback`: "sign in", since
 * the account exists by now and "make your account" would be refused for
 * that address. Nobody is left on a spinner.
 */
export function AutoSignIn({
  ticket,
  email,
  next,
  fallback,
}: {
  /** Null when they are already signed in (the page refreshed after the ticket). */
  ticket: string | null;
  email: string;
  /** Where to go once done: the claim route, carrying the paid session. */
  next: string;
  fallback: React.ReactNode;
}) {
  const clerk = useClerk();
  const [phase, setPhase] = useState<"signing" | "in" | "failed">(ticket ? "signing" : "in");
  const started = useRef(false);

  useEffect(() => {
    if (!ticket || !clerk.loaded || !clerk.client || started.current) return;
    started.current = true;
    (async () => {
      try {
        // The classic resource API, not useSignIn()'s newer one: that wrapper
        // kept a stale sign-in after the ticket was spent, said
        // "needs_identifier", and finalize() found no session (2026-10-21,
        // both seen in the test-mode run). This returns the session itself.
        const attempt = await clerk.client!.signIn.create({ strategy: "ticket", ticket });
        if (attempt.status !== "complete" || !attempt.createdSessionId) {
          throw new Error(`sign-in ${attempt.status}`);
        }
        await clerk.setActive({ session: attempt.createdSessionId });
        setPhase("in");
      } catch (error) {
        console.error("welcome: ticket sign-in failed", error);
        setPhase("failed");
      }
    })();
  }, [clerk, clerk.loaded, ticket]);

  const [state, action, pending] = useActionState<PasswordState, FormData>(choosePassword, {});
  useEffect(() => {
    if (state.ok) window.location.assign(next);
  }, [state.ok, next]);

  if (phase === "failed") return <>{fallback}</>;

  if (phase === "signing") {
    return (
      <p className="mt-8 text-sm text-stone" role="status">
        Setting up your account for <span className="text-ivory">{email}</span>&hellip;
      </p>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-sm leading-relaxed text-stone" role="status">
        Your account is ready, and you&rsquo;re signed in as{" "}
        <span className="text-ivory">{email}</span>.
      </p>
      <form action={action} className="mt-6">
        <label htmlFor="welcome-password" className="block text-sm text-ivory">
          Choose a password
        </label>
        <p className="mt-1 text-xs text-stone-dim">So you can sign in on your other devices.</p>
        {/* The email rides along, hidden, so password managers save the pair. */}
        <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
        <input
          id="welcome-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "welcome-password-error" : undefined}
          className="mt-3 w-full rounded-lg border border-hairline bg-void px-4 py-3 text-base text-ivory placeholder:text-stone-dim focus:border-amber focus:outline-none"
        />
        {state.error && (
          <p id="welcome-password-error" className="mt-2 text-sm text-amber" role="alert">
            {state.error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="inline-flex min-h-11 items-center rounded-full bg-amber px-7 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "Saving…" : "Save and start watching"}
          </button>
          <a href={next} className="text-sm text-stone underline underline-offset-2 hover:text-ivory">
            Skip for now
          </a>
        </div>
      </form>
      <p className="mt-6 text-xs leading-relaxed text-stone-dim">
        Skip it and you can still sign in anywhere with {email}: we&rsquo;ll email you a code
        {/gmail\.com$/.test(email) ? ", or use Continue with Google" : ""}.
      </p>
    </div>
  );
}
