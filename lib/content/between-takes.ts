/**
 * Between Takes — the cast notebook.
 *
 * Notes they keep on set: what was actually going on between the takes, why a
 * beat went the way it went, and the occasional thing about a scene they only
 * worked out by shooting it.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ DRAFT PROSE, written to Melissa's canon (LUNA_VALE_CONTEXT.md) but not │
 * │ by her, and not by the cast. Replace freely. The `id`, `author`,        │
 * │ `sceneSlug`/`clipId`/`gallerySlug` and `access` fields are structural.  │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * THEY ARE PLAYING THEMSELVES (Melissa, 2026-08-13), and this is the single
 * rule that governs every word below. Luna, Tyson, Josh, Rick, Cathy and Avery
 * are real people appearing as themselves — there is no separate performer
 * behind a character. So every note is FIRST PERSON about the writer's own
 * life: "I kept my hands off the wrench", never "he keeps his hands off it".
 *
 * The notes used to be written as actors discussing characters in the third
 * person, which quietly invented a cast that does not exist and made the whole
 * notebook read at arm's length from the people in it. When one of them writes
 * about another, they use that person's name, because that is who they are.
 *
 * WHAT THIS IS NOT
 *
 * It is not Luna's journal. lib/content/journal.ts is her private interior
 * voice, in world, and it is the most canon-sensitive writing in the product.
 * This is the opposite register: the same people, off camera, talking about the
 * work. Warm, funny, specific about craft. The two are meant to sit side by
 * side on a character page precisely because they do not sound alike — one is
 * the story, the other is how the story got made.
 *
 * TONE: kind. These people like each other and the book is where that shows.
 * Teasing is aimed at the writer's own expense, never used to score a point off
 * somebody who has to read it tomorrow, and where one of them is right about
 * another they say so plainly. An earlier draft let several notes end on a jab;
 * they now end on the generous reading, which is both truer to these people and
 * a great deal better to read.
 *
 * ACCESS: 5 of the 32 pages are open, deliberately few. They are the funny ones
 * and the ones that give away a technique rather than a turn — enough for a
 * visitor to know exactly what the rest of the notebook is, which is the whole
 * job of a shop window. Everything that explains a scene the visitor cannot
 * watch yet stays in the LunaVerse, because otherwise the note spoils the scene
 * membership is meant to sell. A reply under an open page is kept open too, so
 * a free page never ends on a lock.
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

  /**
   * Left FOR someone, rather than written to nobody in particular.
   *
   * The conceit the notebook runs on: it is one physical book that lived on the
   * table at the edge of set, so people wrote in it knowing the others would
   * read it. A note with `to` set is addressed — "Tyson —" at the top, in that
   * person's direction.
   */
  to?: PersonId;

  /**
   * Scribbled UNDER another note, answering it. The id of the note it answers.
   *
   * Renders as marginalia on the same page rather than as a page of its own,
   * because that is what it physically is: someone found the book open at
   * somebody else's page and wrote underneath it. Keeping replies off the page
   * count also stops a two-line "ha" from being leafed to as if it were a
   * chapter.
   */
  replyTo?: string;
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
      "Josh spent the whole morning trying to make me laugh before we rolled. Three separate takes. Once by ordering, out loud, completely straight, the most complicated drink that shop has ever been asked for.",
      "The take we kept is the one where I finally lost it and Melissa let the camera keep running. So if I look like I am trying not to laugh in the middle of a serious conversation — I am. We watched it back and agreed it was the truest one, so it stayed.",
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
      "Tyson putting the groceries away in all the wrong cupboards is real. We did that scene fourteen times and he put something somewhere new every single take, just to see whether I would look up.",
      "By take nine there were canned tomatoes in with the towels. I did not look up. Twenty years of knowing someone is a hard thing to fake, and it got a lot easier with him quietly trying to break me the entire time.",
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
      "I asked Melissa if we could shoot the run at the end of the day instead of first thing. She asked why. I said because I want to already be tired when we start.",
      "You cannot fake the face you make at mile five. It is not a nice face and it is not a film face. It is the one stretch in the whole thing where I am not putting anything on for anybody, and it felt wrong to arrive there fresh and pretend.",
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
      "The whole note going in was: nothing happens, and it is the longest you are on screen on your own.",
      "We kept going long after I had run out of things to do, and that was on purpose. Everything I had planned was gone inside the first ninety seconds. Then there was a lot of time left and no ideas, and that is exactly when it started to work.",
      "There is a moment where I reach down to check whether the water is still warm. Nobody asked me for it. It is my favorite thing I do in the whole film.",
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
      "Melissa set the rule before we shot any of it: when one of us thinks the other is lying, we go quiet, we get closer, and we wait. No lines. Tyson and I have genuinely done this since we were kids, usually over who finished the coffee.",
      "The part that gets me is that it has always been funny. That is what makes it hard later. Once it stops being a game neither of us can stop doing it, because it is the only way we know how to have this conversation, and we built it as a joke.",
      "We spent two days running it as the joke before we shot a serious one. I think you can feel those two days in it.",
    ],
  },
  {
    id: "luna-already-decided",
    author: "luna",
    kind: "insight",
    heading: "I had already decided",
    dateline: "Day 14 · the long table",
    sceneSlug: "luna-josh-dinner-house",
    place: "farmhouse",
    access: "premium",
    body: [
      "I kept playing the dinner as though I were still weighing it up, and it kept coming out flat and I could not work out why.",
      "Melissa finally said: you decided in the car. You are not showing us the decision, you are showing us what it is going to cost you. That turned it into a completely different evening. I am not undecided at that table. I am watching myself go through with it.",
    ],
  },
  {
    id: "luna-no-fear-in-it",
    author: "luna",
    kind: "insight",
    heading: "No fear in it",
    dateline: "Day 17 · the lakehouse",
    place: "lakehouse",
    access: "premium",
    body: [
      "The direction for this one was four words: no fear in it.",
      "Nearly everything else I have with either of them has some fear sitting underneath — of being left, of being seen, of what I am about to do. This is the one place in the whole story with none of that. Which is also why it undoes me, because afterward I know the difference and I cannot go back to not knowing it.",
      "We shot it slower than anything else we made. Nobody hurries here. That is the entire scene.",
    ],
  },
  {
    id: "luna-eight-words-from-my-side",
    author: "luna",
    kind: "craft",
    heading: "The other end of eight words",
    dateline: "Day 19 · the park",
    sceneSlug: "tyson-park-fight",
    place: "park",
    access: "premium",
    body: [
      "My whole job in the park is to ask one question and then get through the silence before the answer. The silence is long. On the day it felt far too long and I was sure it would be trimmed.",
      "It was not trimmed. Watch what my hands are doing in it — I had no idea they were doing that until I saw the cut.",
    ],
  },
  {
    id: "tyson-eight-words",
    author: "tyson",
    kind: "craft",
    heading: "Eight words",
    dateline: "Day 19 · the park",
    sceneSlug: "tyson-park-fight",
    place: "park",
    access: "premium",
    body: [
      "Melissa gave me eight words and about forty seconds of not looking at Luna. I asked more than once whether I could have one more line.",
      "She said no, and she was right. The whole thing is that I will not say a ninth word. I worked out on the drive home that an extra line would have let me off, and being let off is the last thing that moment needs.",
    ],
  },
  {
    id: "tyson-the-carrera",
    author: "tyson",
    kind: "joke",
    heading: "About the car",
    dateline: "Day 8 · the farm road",
    place: "garage",
    access: "free",
    body: [
      "For the record, I asked three separate times whether the Carrera was insured for that shot, and everybody on the unit found this funnier than I did.",
      "Here is the thing I actually like about it. I will take a motorcycle around a bend at a speed I am not going to write down here, and I will not take a hard corner with Luna in the passenger seat. That is not a detail about a car. It is the first honest thing I do in the whole story, and I do it with my right foot instead of saying it.",
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
      "Luna will tell you I moved the groceries around to make her laugh. That is partly true. The other part is that I could not remember where any of it actually went and decided to commit.",
      "By take nine I had put canned tomatoes in with the towels and she still did not look up. Twenty years and she has never once given me that one. I admire it more than I let on.",
    ],
  },
  {
    id: "tyson-last-call",
    author: "tyson",
    kind: "insight",
    heading: "Saying it without saying it",
    dateline: "Day 9 · the bar",
    place: "bar",
    access: "premium",
    body: [
      "A bar is loud for a reason. You can say the real thing in one and nobody can prove afterward that you said it — including the person sitting across from you.",
      "I have spent weeks putting distance in by then. Doing the gate, saying the right amount, leaving early. That night I let one thing slip on purpose, and then I watch to see whether she catches it.",
      "She catches it. Neither of us says a word about it. That is the whole scene.",
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
      "Almost nothing gets said here, so the only thing carrying it is where the two of us are sitting.",
      "We shot it three ways: me closer, her closer, and the one in the film, where the gap between us does not change at all for four minutes. The first two played like two people about to do something. The third plays like two people who have decided not to, and that is the true one.",
      "The fire does the rest of the work. It keeps moving, so the frame is never still, so you keep watching two people who are not moving at all.",
    ],
  },
  {
    id: "tyson-the-barn",
    author: "tyson",
    kind: "insight",
    heading: "A day of work with Josh",
    dateline: "Day 13 · the barn",
    sceneSlug: "josh-tyson-barn",
    place: "farmhouse",
    access: "premium",
    body: [
      "Two of us doing a job together and talking about nothing much. We are family by now. We work together. One of us is in love with the other one's partner, and neither of us says a single word about any of it.",
      "The hardest note I got on this whole film came here: play it easy. Not tense, not loaded — genuinely easy, because we genuinely do like each other. If the audience does not enjoy watching the two of us together, none of what comes later costs anything at all.",
    ],
  },
  {
    id: "tyson-the-distance",
    author: "tyson",
    kind: "insight",
    heading: "Why I back off",
    dateline: "Day 15 · between setups",
    place: "farmhouse",
    access: "premium",
    body: [
      "People are going to read the distance as me being hurt about the dinner. It is not that. I already knew about the dinner — Josh mentioned it that morning, easily, the way you tell family something.",
      "So I let her have the story she wants to tell me. That costs more than saying something would have, and I do it anyway. Then I start putting space in, because by then space is the only thing left that still hides it.",
    ],
  },
  {
    id: "tyson-the-doorway",
    author: "tyson",
    kind: "insight",
    heading: "The doorway",
    dateline: "Day 9 · the barn",
    sceneSlug: "josh-luna-bolt",
    place: "farmhouse",
    access: "premium",
    body: [
      "I am in this one for about four seconds and I have no lines. I stand in the barn door, I watch the two of them get a bolt loose, and I go.",
      "It is the hardest thing I do in the film. Everywhere else, if Josh is careless with her, I have somewhere to put that. Here he is patient with her, and he is good at it, and he steps back and lets her have the win. There is nothing for me to hold against him. That is the whole problem.",
      "Melissa's note was: you are not allowed to look hurt. Just look at it slightly too long, then leave before either of them turns around.",
      "I never say a word about it afterward. Not that day, not ever. And when you read Luna's account of that afternoon I am not in it — she does not mention me once, because as far as she knew there was nothing to mention.",
    ],
  },
  {
    id: "tyson-the-morning",
    author: "tyson",
    kind: "craft",
    heading: "Slower than everything else",
    dateline: "Day 17 · the lakehouse",
    place: "lakehouse",
    access: "premium",
    body: [
      "Every other intimate scene here has something running underneath it — something being avoided, or proved, or got through. This one has nothing underneath it, and that turned out to be much harder.",
      "There is no tension to lean on and nothing to play against. You have to just be there, unhurried, for a long time. We kept the takes long and Melissa used the ends of them, after we had both stopped trying.",
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
    access: "premium",
    body: [
      "This is the most rehearsed half-second in the film. I am mid-sentence, I do not stop talking, and I brush her lower lip with my thumb like it is nothing at all.",
      "It only works if the sentence does not change. The moment the line falters it becomes a move, and it is not a move — it is me reminding her of ten years in a way she cannot really argue with. Melissa had me run the dialogue underneath it over and over until I could do it without hearing myself do it.",
    ],
  },
  {
    id: "josh-not-the-villain",
    author: "josh",
    kind: "insight",
    heading: "Not the villain",
    dateline: "Day 2 · the read-through",
    access: "premium",
    body: [
      "The trap in all of this is playing where it ends up. If I let one frame of who I become into that coffee shop, the audience starts protecting her from me and the story is over before it has begun.",
      "So I played the first half the way it actually was: I was genuinely trying. I was funny, I was there, and I was paying attention to her for the first time in years. All of that was real, and I am not going to soften it or apologize for it being likable. It is the reason the rest of it lands at all.",
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
      "Nobody warned me how many eggs a morning scene needs. I cooked eleven. I ate four of them, because there is one take where Melissa let it run long and I genuinely had nothing else to do with my hands.",
      "Somewhere there is a version of this scene that is just a man eating eggs while his entire life quietly puts itself back together around him. I lobbied hard for it. I lost, and honestly she was right.",
    ],
  },
  {
    id: "josh-sunday",
    author: "josh",
    kind: "insight",
    heading: "Comfortable, not careless",
    dateline: "Day 7 · the farmhouse bedroom",
    sceneSlug: "luna-josh-bed",
    place: "farmhouse",
    access: "premium",
    body: [
      "By the end of the ten years I had stopped noticing the house, the calendar, her. The difficult part to play is that from the inside none of that feels like neglect. It just feels comfortable.",
      "So we shot it as a good Sunday. I am not ignoring her. I am simply not looking, and I could not tell you the day I stopped, because there was not a day. That is the part I find hardest to watch.",
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
      "We blocked this one entirely around a countertop. I keep ending up on her side of it. Never once dramatically — just always, in a room with plenty of space in it.",
      "By the end of the scene there is nowhere for her to stand that I am not already standing. Neither of us says anything about it. It is the first time in the whole film that me being close is not only a good thing.",
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
      "Tyson and I spent an entire day carrying the same equipment from one end of a barn to the other and back again, so that both of us always had something to do with our hands.",
      "He is much better at it than I am. He can carry something and say a line and it looks like a man carrying something. I carry something and it looks like a man who has been asked to carry something. I watched him do it all day and I still cannot tell you how.",
    ],
  },
  {
    id: "josh-the-long-table",
    author: "josh",
    kind: "craft",
    heading: "Why the table is that long",
    dateline: "Day 14 · the farmhouse",
    sceneSlug: "luna-josh-dinner-house",
    place: "farmhouse",
    access: "premium",
    body: [
      "It is an absurd table for two people, and that is both the joke and the point. We built that life for a version of it with more people in it than there turned out to be.",
      "We tried it with the two of us down at one corner, close together. It played warm and it meant nothing. Sat at full length instead, it plays like two people being polite in a room they used to own together.",
    ],
  },
  {
    id: "josh-the-bolt",
    author: "josh",
    kind: "insight",
    heading: "Hands off it",
    dateline: "Day 9 · the barn",
    sceneSlug: "josh-luna-bolt",
    place: "farmhouse",
    access: "premium",
    body: [
      "The whole scene is one decision, and the decision is about my hands. I could get that bolt loose in a second and everybody watching knows it. If I touch the wrench even once, even to help, it turns into me doing it for her and the scene is worth nothing.",
      "So I keep my hands off it for four minutes, which is far harder than it sounds, and I get one instruction the entire time: give it one more.",
      "Melissa was very clear that I do not get to look pleased with myself afterward. No I-knew-you-could. The second I take any credit I have taken it off her, and this is the one thing in the film that is entirely hers.",
      "It is the scene I would show someone who thinks they already know how this goes. I am good here — genuinely, quietly good — and that is not a set-up for anything. It is just true, and everything that comes later costs more because of it.",
    ],
  },
  {
    id: "josh-the-study",
    author: "josh",
    kind: "insight",
    heading: "Where I got it",
    dateline: "Day 18 · the study",
    sceneSlug: "josh-rick-study",
    place: "the-study",
    access: "premium",
    body: [
      "Melissa staged this one before either of us had said a line. We both sit, and neither of us is allowed to stand up. I asked twice. The answer was no both times, and the second no explained it: I do not stand up to my father. Not once, not ever, not even to leave the room.",
      "Everything I later do to Luna is in this room first. Charm that is also an instruction. Being wanted and being obeyed treated as though they are the same thing. I am not doing anything to her that I was not taught here.",
      "It is the only scene where I get to be somebody's kid, and it took me two takes to stop performing it and simply sit there and wait to be told I had done badly.",
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
      "The suspicion arrives before any evidence does, and it does not arrive as anger. It arrives as attention. I start noticing her — the calendar, the phone, how long the drive back took — after years of not noticing much of anything.",
      "That is the cruel part, and we played it completely straight. The thing she wanted from me for ten years is the exact thing that is about to be turned on her. I am finally paying attention. It is the worst news of her life.",
    ],
  },

  /* ------------------------------------------------------------------ Rick */
  {
    id: "rick-the-chair",
    author: "rick",
    kind: "craft",
    heading: "I get up once",
    dateline: "Day 18 · the study",
    sceneSlug: "josh-rick-study",
    place: "the-study",
    access: "premium",
    body: [
      "Nobody stands in this scene. We are both in chairs and both of us are told to stay in them, which sounds like nothing until you are doing it and realize you have no way to hold a room except with your face and the pause before you answer.",
      "Then, right at the end, I get up. Once, and I am the only one who does. That is the architecture of the whole thing: you spend the scene establishing that neither man moves, so the one who finally moves owns everything after it.",
      "It buys exactly one line. “You think you’re handling it? You’re not.” I am talking about Luna and I will not say her name, and that is the closest I come in the entire film to admitting I thought she was worth something.",
      "The photograph on the shelf behind me is the two of them, years ago. Nobody looks at it and nobody mentions it. It is doing more work in that room than I am.",
    ],
  },

  /* ==================================================================
     WRITTEN TO EACH OTHER
     ------------------------------------------------------------------
     DRAFT PROSE, same standing as everything above: written to Melissa's
     canon, not by her and not by the cast. Replace freely.

     These are the entries that make the book a book rather than three
     separate sets of notes. Two shapes:

       `to`      — left for a named person, who has not answered yet.
       `replyTo` — written underneath somebody else's page, answering it.

     The rule they are written to: nobody is performing here. A reply is
     short, because it was written standing up, at the end of a day, on
     somebody else's page. Where one of these is funny it is at the
     writer's own expense — this is a working book between people who
     like each other, not a place anyone is scoring points off anyone.

     ACCESS follows the same logic as the rest of the file: a reply that
     gives away only a technique or a joke can stay open; one that
     explains a scene a visitor cannot watch yet is members-only, or the
     note spoils the thing the membership is meant to sell. Where a reply
     sits under an open page it is kept open too, so a free page never
     ends on a lock.
     ================================================================== */

  {
    id: "tyson-to-luna-cupboards-reply",
    author: "tyson",
    kind: "joke",
    heading: "Re: the wrong cupboards",
    dateline: "Day 6 · later, same table",
    replyTo: "luna-wrong-cupboards",
    to: "luna",
    place: "lakehouse",
    access: "free",
    body: [
      "Fourteen. You counted. You have written in the book that you counted.",
      "For the record I would have gone to twenty. I had a whole plan for the towels.",
    ],
  },
  {
    id: "luna-to-tyson-towels-reply",
    author: "luna",
    kind: "joke",
    heading: "Under his answer",
    dateline: "Day 6 · after he went to bed",
    replyTo: "luna-wrong-cupboards",
    to: "tyson",
    place: "lakehouse",
    access: "free",
    body: [
      "I know about the towels. Everyone knows about the towels. You told the sound department about the towels.",
    ],
  },
  {
    id: "josh-to-luna-the-take-we-kept-reply",
    author: "josh",
    kind: "joke",
    heading: "In my defense",
    dateline: "Day 3 · the coffee shop, wrap",
    replyTo: "luna-the-take-we-kept",
    to: "luna",
    sceneSlug: "luna-josh-coffee",
    place: "coffee-shop",
    access: "free",
    body: [
      "I ordered it three times because you held the first two. You are much harder to break than you are letting on in this entry.",
      "Also it is a real drink. My sister actually drinks it. I have never once been able to say that out loud without it sounding like a lie, and it is the truest thing in this book so far.",
    ],
  },
  {
    id: "luna-to-josh-before-the-kitchen",
    author: "luna",
    kind: "craft",
    heading: "Josh — before tomorrow",
    dateline: "Day 15 · the night before",
    to: "josh",
    sceneSlug: "luna-josh-kitchen-kiss",
    place: "farmhouse",
    access: "premium",
    body: [
      "Leaving this here because I know I will not manage to say it in the morning, and then we will already be doing it.",
      "Try not looking at me for the first half. I know that is the opposite of the note we were both given. But I am not asking you a question in that scene, I am deciding something — and if you are looking at me while I decide it, it turns into a conversation, and it is not one.",
      "Then look at me when I stop talking. That is the whole scene, and you will be much better at that half than I will.",
    ],
  },
  {
    id: "josh-to-luna-after-the-kitchen",
    author: "josh",
    kind: "insight",
    heading: "You were right, and I want it written down",
    dateline: "Day 16 · after the kitchen",
    replyTo: "luna-to-josh-before-the-kitchen",
    to: "luna",
    sceneSlug: "luna-josh-kitchen-kiss",
    place: "farmhouse",
    access: "premium",
    body: [
      "I tried it your way on the second take and it came out worse, and I want that in the book too, because it is the part I would otherwise quietly leave out.",
      "On that take I was not looking at you and I was still listening to you, and those are not the same thing — the camera knows the difference even when I do not. On the third one I stopped listening as well. Actually stopped, actually somewhere else. That is the one Melissa kept.",
      "So you were right about the looking and I think the reason is slightly different: it is not that I am giving you room. It is that by then I have already gone. Thank you for leaving the note. Do it again.",
    ],
  },
  {
    id: "tyson-to-luna-the-park-note",
    author: "tyson",
    kind: "craft",
    heading: "Luna — about the park",
    dateline: "Day 19 · before we go again",
    to: "luna",
    sceneSlug: "tyson-park-fight",
    place: "park",
    access: "premium",
    body: [
      "You have been apologizing between every take for how hard you are pushing me, and I would gently like you to stop, because it is starting to show up in the take itself.",
      "Twenty years. You have shoved me in a kitchen, in a parking lot, and once off a dock. I do not brace for it and I should not have to, and I will not be able to keep not bracing while you are saying sorry afterward — because then part of you is getting ready to be sorry before you have even done it.",
      "Push me properly. I promise I will tell you if it is too much. I have never once not told you.",
    ],
  },
  {
    id: "luna-to-tyson-the-park-reply",
    author: "luna",
    kind: "insight",
    heading: "Under Tyson's note",
    dateline: "Day 19 · after",
    replyTo: "tyson-to-luna-the-park-note",
    to: "tyson",
    sceneSlug: "tyson-park-fight",
    place: "park",
    access: "premium",
    body: [
      "I stopped apologizing and we got it in two takes. So, noted, and thank you for writing it down instead of just letting me keep doing it.",
      "The thing I could not work out until I read this is that I am not angry with you in that scene. I am angry, and you are the only person I am allowed to be angry in front of. Which is a different scene entirely, and a much worse one to be standing on the end of. I am sorry about that part. Not about the push.",
    ],
  },
  {
    id: "josh-to-tyson-never-shared",
    author: "josh",
    kind: "insight",
    heading: "Tyson — we have never had a scene",
    dateline: "Day 21 · the parking lot, waiting",
    to: "tyson",
    access: "premium",
    body: [
      "Twenty-two days in and the two of us have been on camera together exactly once. I only worked that out this afternoon, sitting out here while they turned the house around.",
      "It cannot be an accident. Melissa has built a whole film about two men who between them take up every hour of this woman's life, and she almost never puts us in the same room — so mostly we exist to each other in what Luna says about one of us to the other.",
      "Which I think is why it is hard between us. Not because you know anything. Because I have mostly been a thing you were told about.",
    ],
  },
  {
    id: "tyson-to-josh-never-shared-reply",
    author: "tyson",
    kind: "insight",
    heading: "Answering Josh, three days later",
    dateline: "Day 24 · the parking lot again",
    replyTo: "josh-to-tyson-never-shared",
    to: "josh",
    access: "premium",
    body: [
      "Found this. Sat with it for a while before writing under it.",
      "You have the shape of it right. I would put it slightly differently: it is not that you were described to me. It is that every description I ever got came from her, late, when she was upset — so the version of you I have been carrying around is the one she needed to say out loud at the worst hour of her day. That is not really you, and it was never fair to you.",
      "There is no scene where I find out I had it wrong. Melissa and I talked about whether there should be. We agreed there should not. But you should have this written down somewhere, so here it is.",
    ],
  },
  {
    id: "luna-to-all-still-going",
    author: "luna",
    kind: "joke",
    heading: "Everyone — it is not just me, then",
    dateline: "Day 24 · still going",
    access: "free",
    body: [
      "This book has been sitting on that table since day one and I genuinely thought nobody was writing in it except me.",
      "Whoever drew the car on page eleven: I know it was you, Tyson, because it is drawn badly and it is drawn correctly, and there is exactly one person on this unit capable of both at the same time.",
      "Leaving it open. We are nowhere near done, and there is a lot of book left.",
    ],
  },
];

export function getNote(id: string): SetNote | undefined {
  return notes.find((n) => n.id === id);
}

/**
 * The shooting day a note was written on, read off its dateline.
 *
 * The dateline is prose ("Day 6 · the lakehouse kitchen") because that is what
 * somebody actually writes at the top of a page, and it stays prose — this
 * reads the number out rather than adding a second field that could disagree
 * with the words underneath it. Anything without a day sorts to the back.
 */
function dayOf(note: SetNote): number {
  const match = /day\s+(\d+)/i.exec(note.dateline);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

/**
 * The notebook, in the order it was written in.
 *
 * `notes` is grouped by author, which is right for a character page — you are
 * reading one person. It is wrong for the book, which is one object three
 * people are still writing in as the film is shot, and reading it
 * author-by-author would
 * hide the only thing that makes it a book: that they answer each other.
 *
 * Replies are excluded. They are not pages; they are what somebody wrote under
 * a page, and they render there.
 */
export function notebookPages(): SetNote[] {
  return notes
    .filter((n) => !n.replyTo)
    .map((note, i) => ({ note, i }))
    .sort((a, b) => dayOf(a.note) - dayOf(b.note) || a.i - b.i)
    .map(({ note }) => note);
}

/**
 * What was scribbled under a page, oldest first.
 *
 * Ordered by day like the pages themselves, so an exchange that ran across
 * three days reads down the page in the order it happened.
 */
export function repliesTo(id: string): SetNote[] {
  return notes
    .filter((n) => n.replyTo === id)
    .map((note, i) => ({ note, i }))
    .sort((a, b) => dayOf(a.note) - dayOf(b.note) || a.i - b.i)
    .map(({ note }) => note);
}

/**
 * The highest shooting day the notebook has reached.
 *
 * DERIVED, never typed, for the same reason the journal counts are derived: the
 * film is being shot right now, and a number written into the copy would be
 * announcing a wrap that has not happened the moment it stopped matching the
 * pages. Add a note dated Day 31 and the page says 31 by itself.
 */
export function shootingDaysSoFar(): number {
  const days = notes.map(dayOf).filter((d) => d !== Number.MAX_SAFE_INTEGER);
  return days.length ? Math.max(...days) : 0;
}

/**
 * Whether a member sees anything more on this page than a visitor does.
 *
 * A page is "open" only if the note AND everything written under it are open —
 * otherwise a free page ends on a lock, which is the nagging the membership
 * rules forbid.
 */
export function pageIsOpen(note: SetNote): boolean {
  return (
    note.access === "free" &&
    repliesTo(note.id).every((r) => r.access === "free")
  );
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
