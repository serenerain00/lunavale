/**
 * Content notes — what's in a piece, told before someone opens it.
 *
 * Deliberately separate from the `mature` flag. "Mature" has come to mean sex
 * and nudity, and that is how a viewer reads it; using it for a slap or for
 * coercive control means somebody braced for one thing gets another. The story
 * turns toward possessiveness and abuse, so it needs its own vocabulary.
 *
 * Two rules for this list:
 *
 *   - It describes, it does not warn. "Physical violence" states what is in
 *     the piece and lets an adult decide. No alarm styling, no interstitial to
 *     click past, nothing that treats the audience as fragile — this is a
 *     story for adults and the tone is restrained everywhere else.
 *   - It appears BEFORE playback, not in the credits. A note nobody sees until
 *     afterwards is decoration. That constraint is why a clip carrying a note
 *     does not autoplay (see components/clips/VerticalPlayer.tsx).
 *
 * Add entries as the story needs them; keep the labels short enough to sit on
 * one line under a title.
 */

export type ContentNoteId = "violence" | "control";

export interface ContentNote {
  id: ContentNoteId;
  /** Shown inline, e.g. "Contains: physical violence." Lower case, no period. */
  label: string;
  /** One sentence of detail, for the places that have room for it. */
  detail: string;
}

export const CONTENT_NOTES: Record<ContentNoteId, ContentNote> = {
  violence: {
    id: "violence",
    label: "physical violence",
    detail: "This scene includes a physical assault between characters.",
  },
  control: {
    id: "control",
    label: "controlling behaviour",
    detail:
      "This scene includes possessive, controlling or coercive behaviour in a relationship.",
  },
};

export function getContentNotes(ids: readonly ContentNoteId[] = []): ContentNote[] {
  return ids.map((id) => CONTENT_NOTES[id]).filter(Boolean);
}

/** "physical violence" / "physical violence and controlling behaviour". */
export function joinNoteLabels(ids: readonly ContentNoteId[] = []): string {
  const labels = getContentNotes(ids).map((n) => n.label);
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}
