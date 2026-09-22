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
 *     does not autoplay (see components/posts/VerticalPlayer.tsx).
 *
 * Add entries as the story needs them; keep the labels short enough to sit on
 * one line under a title.
 */

export type ContentNoteId =
  | "danger"
  | "violence"
  | "control"
  | "panic"
  | "strangling"
  | "coercion"
  | "knocked-out";

export interface ContentNote {
  id: ContentNoteId;
  /** Shown inline, e.g. "Contains: physical violence." Lower case, no period. */
  label: string;
  /** One sentence of detail, for the places that have room for it. */
  detail: string;
  /**
   * Rendered in the raised treatment rather than the quiet one — see
   * ContentNotice. For the small number of notes where a reader who has lived
   * through the thing being depicted needs to see it without hunting for it.
   *
   * This is NOT the alarm styling the rules above rule out. It is the same
   * amber panel an explicit cut already uses to say so, and it still describes
   * rather than warns, still has nothing to dismiss, and still lets an adult
   * read one line and decide. What it does not do is sit in a hairline box the
   * same weight as "contains a panic attack".
   */
  severe?: boolean;
}

export const CONTENT_NOTES: Record<ContentNoteId, ContentNote> = {
  /*
   * DELIBERATELY GENERAL, 2026-09-21. Added for the pilot, which has a
   * sequence Melissa does not want described: "keep it general i dont wanna
   * give away the intro which is a big deal."
   *
   * So it names the WEIGHT and not the event — no weapon, no position in the
   * running order, nothing a reader could reverse-engineer the opening from.
   * That is a real tension with the module's first rule, which is to describe
   * rather than warn, and this is as close to describing as it can get without
   * spending the thing it is describing.
   *
   * `violence` was not reused because its detail says "a physical assault
   * between characters", which is accurate for the three pieces already
   * carrying it and would be a guess here.
   *
   * SEVERE, because the whole point of a note somebody needs is that they see
   * it without hunting, and a general note in the quiet box reads as boilerplate.
   */
  danger: {
    id: "danger",
    label: "violence and serious threat",
    detail: "There is a sequence in this where somebody is in real danger.",
    severe: true,
  },
  violence: {
    id: "violence",
    label: "physical violence",
    detail: "This scene includes a physical assault between characters.",
  },
  control: {
    id: "control",
    label: "controlling behavior",
    detail:
      "This scene includes possessive, controlling or coercive behavior in a relationship.",
  },
  // Added 2026-08-05 for the farmhouse confrontation. Both are SEVERE, and
  // both are deliberately specific: "physical violence" is true of that scene
  // and tells somebody almost nothing about what is in it. A person who has
  // been strangled by a partner is owed the actual word, before playback, not
  // a category that could equally mean a punch thrown in a barn.
  strangling: {
    id: "strangling",
    label: "strangulation",
    detail:
      "One character puts a hand around another's throat and holds them against a wall.",
    severe: true,
  },
  coercion: {
    id: "coercion",
    label: "sexual coercion",
    detail:
      "This scene includes sexual contact that one character does not want and does not consent to.",
    severe: true,
  },
  // Added for the truck drive, which is two unbroken minutes of one. Neither
  // of the notes above fits it — nothing is done to her on screen and nobody
  // else is in the frame — and "mature" would tell a viewer to brace for the
  // wrong thing entirely. Same rule as the rest of this file: it states what
  // is in the piece, at length, and lets an adult decide.
  panic: {
    id: "panic",
    label: "a panic attack",
    detail:
      "This scene shows a character having a prolonged panic attack, in real time.",
  },
  // Added 2026-09-02 for the farm fight, on the same argument that produced
  // `strangling`: "physical violence" is true of that scene and tells somebody
  // almost nothing about what is in it. What is in it is a woman stepping
  // between two men, taking a punch that was not aimed at her, going down on
  // her head, and losing consciousness with her face bleeding on both sides.
  // Somebody who has been knocked out, or who has watched it happen, is owed
  // the actual words before playback rather than a category that could equally
  // mean two men shoving each other in a barn.
  //
  // SEVERE, and this one is genuinely arguable — the two existing severe notes
  // are both intimate-partner violence and this is an accident inside somebody
  // else's fight. It is raised anyway because the last minute of the scene is
  // held on her injuries in close-up, and because the note has to carry the
  // preview too. Melissa's to downgrade.
  "knocked-out": {
    id: "knocked-out",
    label: "a woman knocked unconscious",
    detail:
      "A character is struck in the face during a fight she is trying to stop, falls, and loses consciousness. Her face is bleeding, and the scene stays with her.",
    severe: true,
  },
};

export function getContentNotes(ids: readonly ContentNoteId[] = []): ContentNote[] {
  return ids.map((id) => CONTENT_NOTES[id]).filter(Boolean);
}

/** True when any of these warrants the raised treatment. See `severe`. */
export function hasSevereNote(ids: readonly ContentNoteId[] = []): boolean {
  return getContentNotes(ids).some((n) => n.severe);
}

/** "physical violence" / "physical violence and controlling behavior". */
export function joinNoteLabels(ids: readonly ContentNoteId[] = []): string {
  const labels = getContentNotes(ids).map((n) => n.label);
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}
