/**
 * Between Takes — the cast notebook.
 *
 * Notes the three of them kept on set: jokes at each other's expense, why a
 * beat was played the way it was played, and the occasional thing about the
 * scene they only worked out by shooting it.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ DRAFT PROSE, written to Melissa's canon (LUNA_VAULT_CONTEXT.md) but not │
 * │ by her, and not by the cast. Replace freely. The `id`, `author`,        │
 * │ `sceneSlug`/`clipId`/`gallerySlug` and `access` fields are structural.  │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * WHAT THIS IS NOT
 *
 * It is not Luna's journal. lib/content/journal.ts is the character's private
 * interior voice, in world, and it is the most canon-sensitive writing in the
 * product. This is the opposite register: the people who play them, off camera,
 * talking about the work. Warm, funny, specific about craft. The two are meant
 * to sit side by side on a character page precisely because they do not sound
 * alike — one is the story, the other is how the story got made.
 *
 * They are signed with character names because that is the convention the cast
 * interview already set, and introducing separate performer names here would
 * contradict it.
 *
 * ACCESS: seven of the twenty-four are open. They are the funny ones and the
 * ones that give away a technique rather than a turn — enough for a visitor to
 * know exactly what the rest of the notebook is, which is the whole job of a
 * shop window. Everything that explains a scene the visitor has not been able
 * to watch yet stays in the Vault, because otherwise the note spoils a scene
 * membership is meant to sell.
 *
 * TONE RULE, inherited from CLAUDE.md: lead with story and craft. These are
 * notes from a film set — performance, blocking, light, what a director asked
 * for and why. Production methodology belongs in dedicated behind-the-scenes
 * material, not scattered through the cast's notebook.
 */

import type { PersonId, PlaceId } from "@/lib/content/taxonomy";
import type { AccessLevel } from "@/lib/content/videos";

/**
 * What kind of note it is. Drives a small label on the card, and lets a reader
 * who only wants the funny ones find them.
 */
export type NoteKind = "joke" | "craft" | "insight";

export const noteKinds = [
  {
    id: "joke",
    label: "Off camera",
    blurb: "What was actually happening between the takes.",
  },
  {
    id: "craft",
    label: "How it was done",
    blurb: "A decision about the shot, and the reason behind it.",
  },
  {
    id: "insight",
    label: "What it's about",
    blurb: "The thing under the scene, worked out by playing it.",
  },
] as const satisfies readonly { id: NoteKind; label: string; blurb: string }[];

export function getNoteKind(id: NoteKind) {
  return noteKinds.find((k) => k.id === id);
}

export interface SetNote {
  /** Stable id — appears in /characters/<who>#note-<id>. */
  id: string;
  /** Who wrote it. Filed on that person's character page. */
  author: PersonId;
  kind: NoteKind;
  /** Short heading, the way you'd label a note to yourself. */
  heading: string;
  /** Shooting-day marker. Relative, never a calendar date — same rule as the journal. */
  dateline: string;
  /** The scene it was written beside (lib/content/videos.ts). */
  sceneSlug?: string;
  /** Or the still set (lib/content/gallery.ts). */
  gallerySlug?: string;
  /** Or the vertical clip (lib/content/clips.ts). */
  clipId?: string;
  place?: PlaceId;
  /** Paragraphs, in order. Short — these are notes, not essays. */
  body: string[];
  access: AccessLevel;
}

export const notes: SetNote[] = [
  /* ------------------------------------------------------------------ Luna */
  {
    id: "luna-the-take-we-kept",
    author: "luna",
    kind: "joke",
    heading: "The take we kept",
    dateline: "Day 3 · the coffee shop",
    sceneSlug: "luna-josh-coffee",
    place: "coffee-shop",
    access: "free",
    body: [
      "Josh spent the entire morning trying to break me before the roll. Three separate takes. THREE. Once by ordering, out loud, in character, the most complicated drink that shop has ever been asked for.",
      "The one that is in the film is the take where I lost it and Melissa kept rolling anyway. If you think Luna looks like she is trying not to laugh in the middle of the most serious conversation of her year — she is. We decided that was correct.",
    ],
  },
  {
    id: "luna-wrong-cupboards",
    author: "luna",
    kind: "joke",
    heading: "The wrong cupboards",
    dateline: "Day 6 · the lakehouse kitchen",
    sceneSlug: "luna-tyson-bathroom",
    place: "lakehouse",
    access: "free",
    body: [
      "The bit where he puts the shopping away in the wrong cupboards is real, in the sense that we did it fourteen times and he put them somewhere different every single take to see whether I would react.",
      "By take nine the tinned tomatoes were in with the towels. I did not react. Twenty years of friendship is a thing you can act, but it is easier if someone is genuinely trying to make you break and you have decided he does not get to win.",
    ],
  },
  {
    id: "luna-six-miles",
    author: "luna",
    kind: "craft",
    heading: "We actually ran it",
    dateline: "Day 8 · the lake road",
    clipId: "run-at-the-lake",
    place: "lake",
    access: "free",
    body: [
      "I asked whether we could shoot the run at the end of the day instead of the start. Melissa asked why. I said because I want to already be tired.",
      "You cannot fake the face someone makes at mile five. It is not a nice face. It is not a film face. It is the only hour in the whole story where Luna is not performing for anybody, and it seemed wrong to arrive at it fresh.",
    ],
  },
  {
    id: "luna-an-hour-in-the-bath",
    author: "luna",
    kind: "craft",
    heading: "An hour in a bath",
    dateline: "Day 11 · the farmhouse",
    sceneSlug: "luna-bathtub",
    place: "farmhouse",
    access: "premium",
    body: [
      "The note going in was: nothing happens, and it has to be the longest she is on screen alone.",
      "We ran it far past the point I had anything left to play. That was deliberate. Everything I had prepared came out in the first ninety seconds, and then there was a lot of time left and no ideas, and that is when it started working.",
      "There is a moment where I check whether the water is still warm. Nobody asked for it. It is my favourite thing I do in this film.",
    ],
  },
  {
    id: "luna-the-staring-game",
    author: "luna",
    kind: "insight",
    heading: "The staring game",
    dateline: "Day 12 · between setups",
    place: "lakehouse",
    access: "premium",
    body: [
      "Melissa gave us the rule before we shot any of it: when one of you thinks the other is lying, you go quiet, you get closer, and you wait. No lines. It is a thing they learned young and have used for twenty years over who finished the coffee.",
      "The trick is that it has always been funny. That is what makes it unbearable later. When it stops being a game, neither of them can stop doing it, because it is the only language they have for this and they built it as a joke.",
      "We rehearsed it as a joke for two days before we shot a serious one. I think you can feel that.",
    ],
  },
  {
    id: "luna-already-decided",
    author: "luna",
    kind: "insight",
    heading: "She has already decided",
    dateline: "Day 14 · the long table",
    sceneSlug: "luna-josh-dinner-house",
    place: "farmhouse",
    access: "premium",
    body: [
      "I kept playing the dinner as a woman weighing something up, and it kept coming out flat. Melissa finally said: she decided in the car. You are not playing the decision, you are playing her finding out what it costs.",
      "Completely different scene after that. She is not undecided. She is watching herself go through with it.",
    ],
  },
  {
    id: "luna-no-fear-in-it",
    author: "luna",
    kind: "insight",
    heading: "No fear in it",
    dateline: "Day 17 · the lakehouse",
    sceneSlug: "ty-luna-bed",
    place: "lakehouse",
    access: "premium",
    body: [
      "The direction for this one was four words: no fear in it.",
      "Everything else she has with either of them has some fear underneath — of being left, of being seen, of what she is about to do. This is the only place in the whole story where there is none, and it is the thing that undoes her, because now she knows the difference and cannot unknow it.",
      "We shot it slower than anything else in the film. Nobody hurries here. That is the entire point of the scene.",
    ],
  },
  {
    id: "luna-eight-words-from-my-side",
    author: "luna",
    kind: "craft",
    heading: "Being on the other end of eight words",
    dateline: "Day 19 · the park",
    sceneSlug: "tyson-park-fight",
    place: "park",
    access: "premium",
    body: [
      "My job in the park is to ask a question and then survive the gap before the answer. The gap is long. On the day it felt far too long and I was certain it would be cut.",
      "It is not cut. Watch what my hands do in it — I had no idea they were doing that until I saw it.",
    ],
  },

  /* ----------------------------------------------------------------- Tyson */
  {
    id: "tyson-eight-words",
    author: "tyson",
    kind: "craft",
    heading: "Eight words",
    dateline: "Day 19 · the park",
    sceneSlug: "tyson-park-fight",
    place: "park",
    access: "free",
    body: [
      "Melissa gave me eight words and about forty seconds of not looking at her. I asked, more than once, whether I could have one more line.",
      "She said no. She was right. The whole man is in the fact that he will not say a ninth word, and I spent the drive home working out that if I had got my extra line I would have wrecked him.",
    ],
  },
  {
    id: "tyson-the-carrera",
    author: "tyson",
    kind: "joke",
    heading: "About the car",
    dateline: "Day 8 · the farm road",
    sceneSlug: "ty-luna-farm-road",
    place: "farmhouse",
    access: "free",
    body: [
      "I would like it recorded that I asked three times whether the Carrera was insured for the shot, and that everybody found this funnier than I did.",
      "He will take a motorcycle round a bend at a speed I am not going to write down, and he will not take a hard corner with her in the passenger seat. That is not a car detail. That is the only place in the first hour where he tells the truth about how he feels, and he does it with his right foot.",
    ],
  },
  {
    id: "tyson-cupboards-my-side",
    author: "tyson",
    kind: "joke",
    heading: "The cupboards, from my side",
    dateline: "Day 6 · the lakehouse kitchen",
    sceneSlug: "luna-tyson-bathroom",
    place: "lakehouse",
    access: "premium",
    body: [
      "She will tell you I moved the shopping around to make her break. Partly true. The other part is that I could not remember where anything went and committed to it as a choice.",
      "By take nine there were tinned tomatoes in with the towels and she still did not look up. Twenty years. I have never once won this.",
    ],
  },
  {
    id: "tyson-last-call",
    author: "tyson",
    kind: "insight",
    heading: "Saying it without saying it",
    dateline: "Day 9 · the bar",
    sceneSlug: "luna-tyson-bar",
    gallerySlug: "the-bar",
    place: "bar",
    access: "premium",
    body: [
      "A bar is loud on purpose. You can say the real thing in one and nobody can prove afterwards that you said it — including the person across the table.",
      "He has spent weeks building distance. Doing the gate, saying the right amount, leaving early. Tonight he lets one thing slip, on purpose, and then watches to see whether she catches it.",
      "She catches it. Neither of them says a word about it. That is the scene.",
    ],
  },
  {
    id: "tyson-fireside",
    author: "tyson",
    kind: "craft",
    heading: "Firelight and no dialogue",
    dateline: "Day 10 · the lakehouse firepit",
    sceneSlug: "tyson-luna-lakehouse-fire",
    gallerySlug: "the-firepit",
    place: "lakehouse",
    access: "premium",
    body: [
      "Almost nothing is said here, which meant the only thing carrying it was where we were sitting.",
      "We shot it three ways: him closer, her closer, and the version in the film, where the gap does not change at all for four minutes. The other two played as a scene about two people about to do something. This one plays as a scene about two people who have decided not to, which is the truthful one.",
      "Fire does the rest. It moves, so the frame is never still, so you keep watching two people who are not moving.",
    ],
  },
  {
    id: "tyson-the-barn",
    author: "tyson",
    kind: "insight",
    heading: "Playing it with Josh",
    dateline: "Day 13 · the barn",
    sceneSlug: "josh-tyson-barn",
    place: "farmhouse",
    access: "premium",
    body: [
      "Two men doing a job together, talking about nothing. They are family. They are co-workers. One of them is in love with the other one's partner and neither of them says a word about anything.",
      "The hardest note I got on this film was here: play it easy. Not tense, not loaded — genuinely easy, because they genuinely like each other, and the audience has to like them together or none of what comes later costs anything.",
    ],
  },
  {
    id: "tyson-the-distance",
    author: "tyson",
    kind: "insight",
    heading: "Why he backs off",
    dateline: "Day 15 · between setups",
    place: "farmhouse",
    access: "premium",
    body: [
      "People will read the distance as him being hurt about the dinner. It is not that. He already knew about the dinner — Josh told him that morning, casually, the way you tell family something.",
      "He lets her have the lie. That costs more than confronting her would, and he does it anyway. Then he starts putting space in, because space is the only thing left that still hides it.",
    ],
  },
  {
    id: "tyson-the-doorway",
    author: "tyson",
    kind: "insight",
    heading: "The doorway",
    dateline: "Day 9 · the barn",
    sceneSlug: "josh-luna-bolt",
    gallerySlug: "josh-luna-bolt",
    place: "farmhouse",
    access: "premium",
    body: [
      "I am in this one for about four seconds and I have no lines. I stand in the door of the barn, I watch the two of them get a bolt loose, and I go.",
      "It is the hardest thing I do in the film. Everywhere else he is careless with her, or worse, and that gives Tyson somewhere to put it. Here he is patient with her, and good at it, and he steps back and lets her have the win. There is nothing to hold against him. That is the whole problem.",
      "Melissa's note was: you are not allowed to look hurt. Just look at it, for slightly too long, and then leave before either of them turns round.",
      "He never says a word about it. Not that day, not ever. And when you read her account of that afternoon he is not in it — she does not mention him once, because as far as she knows there was nothing to mention.",
    ],
  },
  {
    id: "tyson-the-morning",
    author: "tyson",
    kind: "craft",
    heading: "Slower than everything else",
    dateline: "Day 17 · the lakehouse",
    sceneSlug: "ty-luna-bed",
    gallerySlug: "the-night",
    place: "lakehouse",
    access: "premium",
    body: [
      "Every other intimate scene in this film has something underneath it — something being avoided, or proved, or got through. This one has nothing underneath it, and that turned out to be much harder to play.",
      "There is no tension to lean on. You have to just be there, unhurried, for a long time. We kept the takes long and used the ends of them.",
    ],
  },

  /* ------------------------------------------------------------------ Josh */
  {
    id: "josh-the-lip",
    author: "josh",
    kind: "craft",
    heading: "The lower lip",
    dateline: "Day 3 · the coffee shop",
    sceneSlug: "luna-josh-coffee",
    place: "coffee-shop",
    access: "free",
    body: [
      "This is the most rehearsed half-second in the film. He is mid-sentence, he does not stop talking, and he grazes her lower lip with his thumb as though it is nothing.",
      "The whole thing only works if the sentence does not change. The second you let the line falter it becomes a move, and he is not making a move — he is reminding her of ten years in a way she cannot argue with. Melissa made me run the dialogue underneath it until I could do it without hearing myself do it.",
    ],
  },
  {
    id: "josh-not-the-villain",
    author: "josh",
    kind: "insight",
    heading: "Not the villain",
    dateline: "Day 2 · the read-through",
    access: "free",
    body: [
      "The trap in this part is playing where it ends up. If you let one frame of the man he becomes into the coffee shop, the audience protects her from him and the story is over before it starts.",
      "So I played the first half of this film as a man who is genuinely trying, because he is. He is funny and he is present and he is paying attention to her for the first time in years. All of that is real. It is what makes the rest of it land, and it is the reason I will not apologise for him being likeable.",
    ],
  },
  {
    id: "josh-first-morning",
    author: "josh",
    kind: "joke",
    heading: "The eggs",
    dateline: "Day 5 · the farmhouse",
    sceneSlug: "luna-josh-first-morning",
    place: "farmhouse",
    access: "premium",
    body: [
      "Nobody warned me how many eggs a morning scene needs. I cooked eleven. I ate four of them, because there is a take where Melissa let it run long and I had nothing else to do with my hands.",
      "Somewhere there is a version of this scene that is just a man eating eggs while his entire life quietly reassembles itself. I lobbied for it. I lost.",
    ],
  },
  {
    id: "josh-sunday",
    author: "josh",
    kind: "insight",
    heading: "Playing lazy as comfort",
    dateline: "Day 7 · the farmhouse bedroom",
    sceneSlug: "luna-josh-bed",
    gallerySlug: "josh-luna-bed",
    place: "farmhouse",
    access: "premium",
    body: [
      "By the end of the ten years he had stopped noticing the house, the calendar, her. The difficulty is that from the inside that does not feel like neglect. It feels like being comfortable.",
      "So this is played as a good Sunday. He is not ignoring her. He is just not looking, and he could not tell you the day he stopped, because there was not one.",
    ],
  },
  {
    id: "josh-the-kitchen",
    author: "josh",
    kind: "craft",
    heading: "Standing too close",
    dateline: "Day 11 · the farmhouse kitchen",
    sceneSlug: "luna-josh-kitchen-kiss",
    gallerySlug: "farmhouse-kitchen",
    place: "farmhouse",
    access: "premium",
    body: [
      "We blocked this one entirely around a countertop. He keeps ending up on her side of it. Not once dramatically — just always, in a room with plenty of space in it.",
      "By the end of the scene she has nowhere to stand that he is not already standing. Nobody says anything about it. It is the first time in the film that his being close is not only a good thing.",
    ],
  },
  {
    id: "josh-the-barn",
    author: "josh",
    kind: "joke",
    heading: "A full day of pretending to work",
    dateline: "Day 13 · the barn",
    sceneSlug: "josh-tyson-barn",
    place: "farmhouse",
    access: "premium",
    body: [
      "Tyson and I spent an entire day moving the same equipment from one end of a barn to the other and back so that both of us always had something to do with our hands.",
      "He is better at this than me. He can carry something and say a line and it looks like a man carrying something. I carry something and it looks like a man who has been told to carry something.",
    ],
  },
  {
    id: "josh-the-long-table",
    author: "josh",
    kind: "craft",
    heading: "Why the table is that long",
    dateline: "Day 14 · the farmhouse",
    sceneSlug: "luna-josh-dinner-house",
    gallerySlug: "josh-luna-dinner",
    place: "farmhouse",
    access: "premium",
    body: [
      "It is a genuinely absurd table for two people and that is the whole joke and the whole point. They built this life for a version of it that has more people in it.",
      "We tried it with them at the corner, close together. It played warm and meant nothing. Full length apart, it plays like two people being polite in a room they used to own.",
    ],
  },
  {
    id: "josh-the-bolt",
    author: "josh",
    kind: "insight",
    heading: "Hands off it",
    dateline: "Day 9 · the barn",
    sceneSlug: "josh-luna-bolt",
    gallerySlug: "josh-luna-bolt",
    place: "farmhouse",
    access: "free",
    body: [
      "The whole scene is one decision and it is a decision about my hands. He could undo that bolt in a second and everybody watching knows it. If I touch the wrench once, even to help, he becomes a man doing it for her and the scene is worth nothing.",
      "So I keep my hands off it for four minutes, which is much harder than it sounds, and I get one instruction: give it one more.",
      "Melissa was very clear that he does not look pleased with himself afterwards. No I-knew-you-could. The second he takes any credit he has taken it off her, and this is the one thing in the film that is entirely hers.",
      "It is the scene I would show somebody who thinks they already know what happens to these two. He is good here. Genuinely, unshowily good. That is not a set-up for anything — it is just true, and everything later costs more because of it.",
    ],
  },
  {
    id: "josh-the-study",
    author: "josh",
    kind: "insight",
    heading: "Where he got it",
    dateline: "Day 18 · the study",
    sceneSlug: "josh-rick-study",
    place: "the-study",
    access: "free",
    body: [
      "Melissa staged this before either of us said a line. We both sit, and neither of us is allowed to get up. I asked twice. The answer was no both times, and the second no was the one that explained it: Josh does not stand up to this man. Not once, not ever, not even to leave.",
      "Everything Josh does to Luna is in this room first. The charm that is also an instruction. Being wanted and being obeyed treated as the same thing. He is not doing anything to her he was not taught.",
      "It is the only scene in the film where I get to play Josh as somebody's kid, and it took me two takes to stop performing and just wait to be told I had done badly.",
    ],
  },
  {
    id: "josh-the-house",
    author: "josh",
    kind: "insight",
    heading: "Where it turns",
    dateline: "Day 16 · the farmhouse",
    sceneSlug: "luna-josh-house",
    place: "farmhouse",
    access: "premium",
    body: [
      "The suspicion arrives before the evidence does, and it does not arrive as anger. It arrives as attention. He starts noticing her — the calendar, the phone, the drive back — after years of not noticing anything.",
      "That is the cruel part and we played it straight: the thing she wanted from him for ten years is the exact thing that is about to be used against her. He is finally paying attention. It is the worst news of her life.",
    ],
  },
  /* ------------------------------------------------------------------ Rick */
  {
    id: "rick-the-chair",
    author: "rick",
    kind: "craft",
    heading: "He gets up once",
    dateline: "Day 18 · the study",
    sceneSlug: "josh-rick-study",
    place: "the-study",
    access: "premium",
    body: [
      "Nobody stands in this scene. We are both in chairs and both of us are told to stay there — which sounds like nothing until you are doing it, and you realise you have no way to win a room except with your face and the pause before you answer.",
      "Then, at the very end, I get up. Once, and I am the only one who does. That is the whole architecture of it: you spend the scene establishing that neither man moves, so the one who finally does owns everything after it.",
      "It buys one line. “You think you’re handling it? You’re not.” He is talking about Luna, and he will not say her name, and that is the closest he comes in the whole film to admitting he thought she was worth something.",
      "The photograph on the shelf behind me is the two of them, years ago. Nobody looks at it and nobody mentions it. It is doing more work than I am.",
    ],
  },
];

export function getNote(id: string): SetNote | undefined {
  return notes.find((n) => n.id === id);
}

/** The open notes — the notebook's shop window. */
export function freeNotes(): SetNote[] {
  return notes.filter((n) => n.access === "free");
}

/**
 * Notes written beside a given scene.
 *
 * Nothing calls this yet. It is the hook for showing a scene's notes under the
 * player on /watch/<slug> — the note about a scene is worth most immediately
 * after watching it, and most of them are members-only, which makes that the
 * strongest conversion moment the notebook has.
 */
export function notesForScene(slug: string): SetNote[] {
  return notes.filter((n) => n.sceneSlug === slug);
}
