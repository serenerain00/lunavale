/**
 * Set by /welcome on the browser that just paid: the paid Checkout session id.
 *
 * Lets a second press of Join, before any account exists, go back to that
 * payment (/welcome → make your account → claim) instead of taking a second
 * one. Holding the id proves nothing new: it only ever reaches the browser
 * that completed the payment, on Stripe's success URL. Plain data, so the
 * client component that sets it can import this too.
 */
export const PAID_COOKIE = "lv_paid";

/** Long enough to cover "paid, closed the tab, came back next week". */
export const PAID_COOKIE_MAX_AGE = 60 * 60 * 24 * 45;
