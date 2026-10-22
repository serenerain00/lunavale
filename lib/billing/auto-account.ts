/**
 * Paying makes the account (2026-10-21).
 *
 * WHY. Checkout runs before sign-up, so for eight weeks every new member has
 * had to make an account AFTER paying, and that second step is where every
 * stranded customer came from: Prue and Fernanda paid and closed the tab;
 * Andrea signed up with a different email; Tina paid in Instagram's browser
 * and again in Safari. Melissa: "if they pay, that should already create an
 * acct for them." So /welcome now creates the account for the address that
 * just paid and signs them straight in with a one-time Clerk sign-in token.
 *
 * WHAT IT NEVER DOES, because existing members must not notice this exists:
 *   - It never edits, links or signs anybody into an account it did not make.
 *     An address that already has an account gets "sign in", exactly as the
 *     claim flow has always worked (verified email, or the paid session).
 *   - It never touches the webhook or the memberships rules. The payment is
 *     attached with claimPendingBySubscription(), the same call
 *     /membership/claim makes, with the same proof: the paid Checkout Session.
 *   - Any failure returns null and /welcome renders the old page, word for
 *     word. A buyer can never end up worse off than before this file.
 *
 * THE PROOF IS THE CHECKOUT SESSION, as everywhere in the pay-first flow: its
 * id only ever reaches the browser that paid, on Stripe's success URL. The
 * sign-in token is only issued for an account this file made for THAT
 * session, that has never been signed into, within a couple of hours of the
 * payment. Once they are in, a forwarded /welcome link gets nothing.
 *
 * OFF UNLESS AUTO_ACCOUNT=1. Unset it and /welcome is exactly what it was.
 */
import "server-only";
import { claimPendingBySubscription } from "@/lib/db/memberships";

/** How long after checkout a fresh account may still be signed into for them. */
const WINDOW_MS = 2 * 60 * 60 * 1000;

export function autoAccountEnabled(): boolean {
  return process.env.AUTO_ACCOUNT === "1";
}

export type AutoAccount =
  /** A fresh account made for this payment: sign them in with this ticket. */
  | { kind: "ticket"; ticket: string; email: string }
  /** The address already had an account before this payment: ask them to sign in. */
  | { kind: "existing"; email: string };

/** Marks an account as made here, for this payment. Private: never sent to the browser. */
interface Made {
  autoAccount?: { session: string; subscription: string | null; at: string };
}

export async function accountForPayment(
  sessionId: string,
  /** Tests pass the plain backend client; the site uses Next's. */
  clerkFor: () => Promise<Clerk> = async () => (await import("@clerk/nextjs/server")).clerkClient(),
): Promise<AutoAccount | null> {
  if (!autoAccountEnabled()) return null;
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) return null;
  try {
    const { stripe } = await import("@/lib/billing/stripe");
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid" || session.status === "complete";
    const email = (session.customer_details?.email ?? session.customer_email ?? "").trim().toLowerCase();
    if (!paid || !email) return null;
    if (Date.now() - session.created * 1000 > WINDOW_MS) return null;
    const subscription =
      typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null);

    const clerk = await clerkFor();

    let user = await findUser(clerk, email);
    if (user && !madeFor(user, sessionId)) return { kind: "existing", email };

    if (!user) {
      try {
        user = await clerk.users.createUser({
          emailAddress: [email],
          // Password is required at sign-up on this instance; they choose one
          // on the next screen, or sign in later with an email code / Google.
          skipPasswordRequirement: true,
          privateMetadata: {
            autoAccount: { session: sessionId, subscription, at: new Date().toISOString() },
          } satisfies Made,
        });
      } catch (error) {
        // Two loads of /welcome at once: the other one made it. Anything else
        // (Clerk refusing the address, an outage) falls back to the old page.
        user = await findUser(clerk, email);
        if (!user) throw error;
        if (!madeFor(user, sessionId)) return { kind: "existing", email };
      }
    }

    // Already signed into once, or too old: the account exists, so the answer
    // is "sign in". Never null here — the old page says "make your account",
    // which Clerk refuses for an address that already has one.
    if (user.lastSignInAt != null || Date.now() - user.createdAt > WINDOW_MS) {
      return { kind: "existing", email };
    }

    // Attach the payment now if the webhook has already parked it. If it has
    // not landed yet, nothing is lost: the address on this account is the
    // address that paid, so the ordinary claim-by-verified-email picks it up
    // on their next page (lib/access/entitlement.ts), as does /membership/claim.
    if (subscription) {
      try {
        await claimPendingBySubscription(user.id, subscription);
      } catch (error) {
        console.error("auto-account: claim failed, will retry on next page", error);
      }
    }

    const token = await clerk.signInTokens.createSignInToken({ userId: user.id, expiresInSeconds: 15 * 60 });
    return { kind: "ticket", ticket: token.token, email };
  } catch (error) {
    console.error("auto-account: falling back to make-your-account", error);
    return null;
  }
}

type Clerk = import("@clerk/backend").ClerkClient;
type User = Awaited<ReturnType<Clerk["users"]["getUser"]>>;

async function findUser(clerk: Clerk, email: string): Promise<User | null> {
  const list = await clerk.users.getUserList({ emailAddress: [email], limit: 1 });
  return list.data[0] ?? null;
}

function madeFor(user: User, sessionId: string): boolean {
  return (user.privateMetadata as Made).autoAccount?.session === sessionId;
}

/** Made by this file, for any payment — what the password step and the cron ask. */
export function autoMade(user: User): Made["autoAccount"] | undefined {
  return (user.privateMetadata as Made).autoAccount;
}
