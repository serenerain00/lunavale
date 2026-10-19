/**
 * Clerk appearance that hides the social sign-in buttons (and the "or"
 * divider under them). Used inside Facebook's and Instagram's in-app browsers,
 * where Google sign-in is refused — see lib/access/in-app.ts.
 */
export const HIDE_SOCIAL = {
  elements: {
    socialButtonsRoot: { display: "none" },
    socialButtons: { display: "none" },
    dividerRow: { display: "none" },
  },
} as const;
