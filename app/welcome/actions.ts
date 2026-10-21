"use server";

/**
 * The one field on /welcome after paying: choose a password.
 *
 * Server-side through the Backend API rather than user.updatePassword() in the
 * browser, because this instance has reverification on and a first password
 * from the client would ask somebody who signed in four seconds ago to prove
 * who they are again.
 *
 * Only for an account lib/billing/auto-account.ts made, that has no password
 * yet, for the person signed into it. Anything else is refused — this is not
 * a general "set my password" endpoint.
 */
import { autoMade } from "@/lib/billing/auto-account";

export interface PasswordState {
  ok?: boolean;
  error?: string;
}

export async function choosePassword(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters." };

  const { auth, clerkClient } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return { error: "You've been signed out. Sign in with your email to carry on." };

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (!autoMade(user) || user.passwordEnabled) return { ok: true };

  try {
    await clerk.users.updateUser(userId, { password });
    return { ok: true };
  } catch (error) {
    // Clerk's own wording for a weak or leaked password is clear enough to show.
    // Except "Given password is not strong enough.", which is rewritten.
    const message = (error as { errors?: { longMessage?: string; message?: string }[] }).errors?.[0];
    const said = message?.longMessage ?? message?.message ?? "";
    if (/not strong enough/i.test(said)) {
      return { error: "That one's too easy to guess. Try something longer, like a few words together." };
    }
    return { error: said || "That password didn't work. Try another." };
  }
}
