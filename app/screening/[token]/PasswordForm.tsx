"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { unlock, type UnlockResult } from "./actions";

export function PasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<UnlockResult | null, FormData>(
    async (_prev, formData) => {
      const result = await unlock(token, formData);
      if (result.ok) router.refresh();
      return result;
    },
    null,
  );

  return (
    <form action={action} className="mx-auto mt-8 w-full max-w-sm">
      <label htmlFor="password" className="block text-sm text-stone">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="off"
        className="mt-2 w-full rounded-lg border border-hairline bg-void px-4 py-2.5 text-base text-ivory focus:border-amber focus:outline-none"
      />
      {state && !state.ok && (
        <p role="alert" className="mt-3 text-sm text-amber-soft">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft disabled:opacity-60"
      >
        {pending ? "Checking…" : "Watch"}
      </button>
    </form>
  );
}
