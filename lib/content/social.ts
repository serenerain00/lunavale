/**
 * Where Between Us lives off-site. Melissa, 2026-10-18: "lets also add the
 * social links … left of the sign in/join button, subtle icons that link to
 * the IG and FB". An empty string hides that icon, so a link is never shown
 * pointing nowhere.
 */
export const SOCIAL: { instagram: string; facebook: string } = {
  instagram: "https://www.instagram.com/lunavale1986/",
  // Confirmed by Melissa, 2026-10-18. A new Page with no username yet, so
  // profile.php?id — swap in facebook.com/<username> if she sets one.
  facebook: "https://www.facebook.com/profile.php?id=61595253394243",
};
