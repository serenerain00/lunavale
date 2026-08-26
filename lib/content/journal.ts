/**
 * Luna's journal — her private account, filed by where it was written and who
 * it is about.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ DRAFT PROSE, written to Melissa's canon (2026-07-22) but not by her.    │
 * │ The beats below are hers; the sentences are not. This is Luna's         │
 * │ interior voice, the most canon-sensitive writing in the product, so     │
 * │ treat every `body` as a first pass to be replaced.                      │
 * │                                                                         │
 * │ The `id`, `place`, `about` and `sceneSlug` fields are structural.       │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * THE CANON THESE ARE WRITTEN AGAINST
 *
 *   Luna and Josh: ten years, then six months apart. He had gone lazy by the
 *   end — but he was also caring, passionate, commanding, and she loved that
 *   in him. He called. Coffee, then dinner the same night, and it started
 *   again. She doesn't yet know it is about to get worse.
 *
 *   Tyson: her best friend of twenty years. Ex-military. Helps Josh on the
 *   farm, friend of the family, Josh's distant cousin. Snowboarding,
 *   motorcycles, track days, a black 2020 Carrera he treats like a child.
 *   Through the six months he kept her head above water, and somewhere in
 *   there it stopped being only that — on both sides. Neither will say it.
 *
 *   The break: she had dinner with Josh and didn't tell Tyson. Josh had
 *   already told him that morning. They have never lied to each other, which
 *   is what makes one lie enough. Tyson starts putting distance in, because
 *   distance is the only way he can keep hiding it.
 *
 *   Then Josh starts to suspect, and jealousy turns into possessiveness,
 *   control, and worse.
 *
 * ORDER MATTERS. The entries below run in story order, and the index and the
 * previous/next links both read from that order. Insert new entries in place
 * rather than appending.
 *
 * ACCESS: FIVE entries are open and every other one is not (Melissa,
 * 2026-08-10, cutting the free set down from fourteen).
 *
 * The five is the number that matters and it is fixed; the locked count is
 * not, and is deliberately not written down here. It said "forty-nine" for
 * long enough to be wrong by thirteen, because every entry added since went
 * in without anyone thinking to re-count.
 *
 * The five are chosen as an ARC rather than as a sample, because five is too
 * few to be representative and just enough to be a story:
 *
 *   the-last-box    ten years ending, and her carrying it out herself
 *   tyson-shows-up  who Tyson is, before anybody has a reason to wonder
 *   the-carrera     the friendship working — and the entry the home page
 *                   quotes, so it has to stay readable or that link is a wall
 *   he-called       Josh comes back
 *   coffee          she says yes, having meant to say no
 *
 * It stops exactly where it starts to get complicated, which is the point: a
 * stranger can read all five, understand the situation completely, and be left
 * with the one question all the locked ones answer.
 *
 * WHAT CAME OUT, and what it cost: the Mexico entries (the strongest writing
 * in the free set, now a members' reward), her mother's call, Avery's, the day
 * at work, Josh's father, and the quiet ones. Mexico in particular used to do
 * real work — a visitor read it, liked Josh, and cared more about everything
 * locked. That argument was sound and it lost to a smaller number.
 *
 * There are THREE Mexico entries as of 2026-08-17, not two, and they are no
 * longer a flashback at the top of the file — see the block above
 * `the-part-i-forgot`. Nothing about the free five changed; they were already
 * out of it.
 *
 * Everything with a turn in it — the growing feelings, the lie, the night — is
 * behind the LunaVerse, because that is the story and the story is the product.
 */

import type { AccessLevel } from "@/lib/content/videos";
import type { ContentNoteId } from "@/lib/content/content-notes";
import type { PersonId, PlaceId } from "@/lib/content/taxonomy";

export interface JournalEntry {
  /** Stable id — appears in /journal/<id>. Do not rename casually. */
  id: string;
  /**
   * In-world dateline, written the way she'd write it at the top of a page.
   * Deliberately relative rather than calendar dates: the chronology is fixed
   * in sequence, not in specific days, and a wrong date is worse than none.
   */
  dateline: string;
  /** Which place it was written in — the browse axis. */
  place: PlaceId;
  /**
   * The specific spot, when it matters: "The firepit", "The porch". Free text,
   * because rooms are finer-grained than the place taxonomy.
   */
  where?: string;
  /** Who the entry is about. */
  about: PersonId[];
  /**
   * The day this page went up, ISO `YYYY-MM-DD`. Mirrors `Video.addedOn` and
   * exists for the same reason: the home page shows the release rhythm, and a
   * journal entry is a release. Without this the cadence looks half as busy as
   * it is, because only the scenes could be dated.
   *
   * Only set where the date is KNOWN. Most of this file predates the field and
   * is deliberately left undated rather than back-filled by guesswork — an
   * undated entry is treated as older than every dated one, which is true.
   */
  addedOn?: string;
  /** The scene this sits beside, when it's the same day. */
  sceneSlug?: string;
  /**
   * The vertical clip it sits beside. Several of the most intimate moments
   * exist only as 9:16 cuts and never as a landscape scene, so without this
   * her account of them has nothing to point at.
   */
  clipId?: string;
  /** Paragraphs, in order. One entry fits one sheet of paper. */
  body: string[];
  access: AccessLevel;
  mature: boolean;
  /** See lib/content/content-notes.ts. Shown above the page. */
  notes?: ContentNoteId[];
}

export const journal: JournalEntry[] = [
  /*
    THE REASON, written months before she acts on it. Melissa's canon
    (2026-08-15): Josh loves her almost obsessively AND is obsessed with work,
    believes work ethic is the thing that matters, and cannot see that those
    two facts collide. She comes second and she notices — and that, not a
    fight, is eventually what makes her go.
  */
  {
    id: "second",
    dateline: "He said he'd be an hour",
    place: "farmhouse",
    about: ["josh"],
    access: "premium",
    mature: false,
    body: [
      "He said he'd be an hour. That was at two. It is ten past nine.",
      "I am not writing this down because he was late. He has been late for ten years. I married the lateness. It is genuinely fine.",
      "I am writing it down because of what I did with the six hours. I cooked. I put it in the oven on low. I took it out. I put a plate in the microwave. I changed twice. At one point — and I am putting this in because it is true — I hoovered a room that was already clean.",
      "Six hours of being ready for a man who was not coming.",
      "Here is the part I keep circling and cannot land on. He does love me. I am not one of those women who is confused about that. He loves me in a way that is almost too much for the room, he is obsessed with me, he will tell anybody who stands still long enough.",
      "But the work gets him at six in the morning. It gets the good hours and it gets the version of him that is awake. I get whatever is left at nine at night, and he genuinely cannot see that those are different things.",
      "If I said it out loud he would say the work IS for me. For us. And he would mean it, which is the problem.",
      "That is what makes it impossible. There is nobody to be angry at. He is not choosing something over me. He has just never had to choose, because it has never once occurred to him that a choice is being made.",
      "I have stopped saying it. That should frighten me more than it does.",
    ],
  },
  /*
    THREE MORE FROM THE TEN YEARS (2026-08-15). Melissa's canon: Josh is
    charismatic, sociable, funny, universally liked in public and a different
    man once the door shuts — and Luna is the only person who has seen every
    piece of him. He is impatient, physical, wants things now. She spends the
    marriage making everybody happy and putting herself last.
  */
  {
    id: "everybodys-josh",
    dateline: "Home from the Harknesses'",
    place: "farmhouse",
    about: ["josh"],
    access: "premium",
    mature: false,
    body: [
      "He was wonderful tonight. I want to start there because it is true and because I am about to write the rest of it.",
      "He had that whole table. The story about the truck and the fence — he has told it forty times and he still lands it, and he waits for the laugh he knows is coming and he is never once wrong about where it is. Cathy had tears on her face. Somebody's husband put a hand on his shoulder on the way out.",
      "In the car on the way home he said eleven words to me. I counted, which tells you something about me and nothing good.",
      "And this is the thing nobody would believe. If I said any of this out loud to any person who was at that table tonight, they would think I was the difficult one. They would be kind about it and they would think it.",
      "Because they have met that man. Everyone has met that man. He is genuinely, actually him — that is not a performance, that is really Josh, that is the man I fell in love with and he is in there.",
      "It is just that he spends all of him out there. And what comes home is a man who has been generous all evening and has nothing left over, and I am the person he does not have to be charming for.",
      "I used to think that was intimacy. Being the one he could switch off around. I have started to think it might just be being last in the queue.",
    ],
  },
  {
    id: "last-on-my-own-list",
    dateline: "Sunday, everything done",
    place: "farmhouse",
    about: ["luna"],
    access: "premium",
    mature: false,
    body: [
      "Fed everybody. Rang his mother because he was going to forget. Moved the appointment I had made for myself so I could take the truck in for him.",
      "Sat down at nine and could not think of one thing I wanted to do.",
      "That is the bit that got me. Not that there was no time. There was an hour, and I sat in it, and I genuinely could not produce an answer to what do you want.",
      "I am very good at what does everybody else want. I could do that one in my sleep. I think I have been doing it in my sleep.",
    ],
  },
  {
    id: "he-wants-it-now",
    dateline: "The morning of the delivery",
    place: "farmhouse",
    about: ["josh"],
    access: "premium",
    mature: false,
    body: [
      "There is no such thing as later with him. There is now, or there is a bad hour.",
      "The pallet came at seven and it was wrong, and he had it on the phone before I had got the coffee on. Not shouting. He does not really shout on the phone — that is for the house. Just that flat, fast, immovable thing where the person on the other end can hear that this is going to be sorted out today whether they had planned to be part of that or not.",
      "And it works. That is what I have to keep being honest about in here. It works, it has always worked, he has built a whole life out of it, and half of what I have I have because he does not know how to wait.",
      "It is only ever a problem when it is pointed at a person.",
      "He wanted an answer from me about the weekend at ten past seven this morning, in a kitchen, before either of us had eaten, because he had decided at that moment that he wanted to know. And when I said let me think, I watched his face do the thing it does when a delivery is late.",
      "I said yes so the morning could carry on. I would like to be the sort of woman who does not do that. I have been meaning to be her for about six years.",
    ],
  },
  /*
    THE DRIVEWAY, 2026-08-25, and the last page from inside the ten years.
    Sits beside `luna-josh-truck-leaving` — Josh going away for three days,
    the long goodbye at the truck, and her still standing in the drive after.

    IT IS THE SAME CANON AS `second` COMING FROM THE OTHER SIDE. That entry is
    six hours of being ready for a man who was not coming. This one is four
    minutes of him being entirely, undividedly there — and her working out on
    the spot that she got them because he was leaving. Nothing is wrong with
    the morning, which is the point: the scene is warm the whole way through
    and so is she, and the only thing in either of them that points forward is
    what her face does once the truck is out of the drive.

    THE RELIEF PARAGRAPH IS THE ENTRY. Everything else here she could say to
    him; that one she could not, and it is the first sign in this file of a
    woman who has started to want the house to herself. `the-night-i-left` is
    the same thought with nine months on it.

    PREMIUM, against a free scene. Same pairing as `asking-for-less` and for
    the same reason — the open five are an arc, not a sample, and a sixth
    would undo that decision (see the top of this file).

    DRAFT PROSE, like everything else here that is not marked otherwise.
  */
  {
    id: "four-minutes",
    addedOn: "2026-08-25",
    dateline: "Three days, he said",
    place: "farmhouse",
    where: "The drive",
    about: ["josh"],
    sceneSlug: "luna-josh-truck-leaving",
    access: "premium",
    mature: false,
    body: [
      "He kissed me goodbye for four minutes in the drive this morning and I have spent the whole day working out why it made me sad.",
      "Three days. He told me twice, which he only ever does when some part of him thinks I might mind.",
      "And he was there. That is what I want to get down properly before it goes soft on me. For four minutes there was no phone in it and no clock in it and nothing behind his eyes that was already in the truck. He had my face in both hands like we were nineteen. He is not performing when he does that. That is really him — that is all of him, pointed at one person, and there is not a woman alive who would walk away from it.",
      "Then the dust went down and I was standing in the drive on my own, and the thought arrived before I could stop it being unkind.",
      "That was the most of him I have had in about three weeks. And I got it because he was going.",
      "I don't think he knows that's the arrangement. I am fairly sure I didn't either until I was standing there in it.",
      "Here is the part I would not say out loud. Under all of that, somewhere I am not proud of, I was relieved. Three days of the house being only mine. Nobody needing the day to go a particular way. I can eat standing up at the sink and go to bed at nine and not be waiting for a truck.",
      "That is not the same as wanting him gone. I want that on the page in my own handwriting, because I know exactly what it will look like if I ever read this back.",
      "He'll ring tonight from wherever he stops and he will be lovely on the phone, and I will be glad, and all of that will be true.",
      "I just wish I didn't already know that the best four minutes of my week happened in a driveway with the engine running.",
    ],
  },
  /* ---------------------------------------------------- the six months ---- */
  /*
    THE NIGHT ITSELF, which the six months had no first page for. `the-last-box`
    opened this section and it is the AFTERMATH — boxes, a truck, the boring
    part. What was missing was the hinge: the afternoon she packed, the man in
    the doorway, and the drive.

    Written to Melissa's account of 2026-08-15 (recorded in full above
    luna-josh-break in lib/content/videos.ts). Premium, so the opening line is
    the whole shop window — JournalCard shows the real first sentence and then
    the wall, which is why the first paragraph is built to survive being cut at
    about 130 characters and still land.
  */
  {
    id: "the-night-i-left",
    dateline: "The afternoon I packed, and after",
    place: "lakehouse",
    about: ["josh", "tyson"],
    sceneSlug: "luna-josh-break",
    access: "premium",
    mature: false,
    notes: ["control"],
    body: [
      "I packed the bags at four in the afternoon with the radio on, like a woman doing something ordinary, and I have never been more frightened in my life.",
      "I called Tyson before I did it. Not to be talked out of it. To have one person know, so it would already be true by the time Josh got home and started making it not true.",
      "He said he messed up. He does say it — he is always so ready to say it. He said it standing between me and the door, and the terrible part is that I believe him. I believe him every single time. It has just stopped meaning anything, because believing him and him changing turned out to be two different things and I have spent ten years mistaking one for the other.",
      "That isn't fair. He has changed. He has got worse at noticing and better at apologising, and that is a change.",
      "I didn't go because I stopped loving him. I want that written down somewhere I can find it later, because in six months I will have tidied this into a cleaner story than it was. I went because I got tired of waiting to be chosen by a man who was already in the room.",
      "So I drove to the lake. Of course I did. Atlanta is too far to run to in one night, and this is the only place that is mine — Mom and Dad's really, and everybody's, but mine.",
      "I got here after dark and I have not turned on more than the one lamp. Every room I have walked through tonight has people in it who aren't here. Dad carrying me down to the dock. Mom laughing so hard at cards she had to put them face down on the table. Tyson at nineteen. Josh at twenty-eight, soaking, lifting me out of the water like I weighed nothing at all.",
      "Nothing bad has ever happened in this house. That is the thing I cannot get past. I have brought the bad thing here myself, and it is in the house now too, and by tomorrow it will be one of the things these rooms remember.",
    ],
  },
  /*
    THE FIRST MORNING, and it goes here because `the-night-i-left` ends with
    her arriving after dark and this is what she wakes up to.

    MELISSA'S OWN WORDS, delivered 2026-08-17 — the body below is verbatim and
    is NOT draft prose like the entries around it. The banner at the top of
    this file says to treat every `body` as a first pass to be replaced; this
    one is the replacement. Only the apostrophes were touched, to match the
    straight quotes used everywhere else in the file. Do not rewrite it.

    Pairs with luna-josh-bed-flashback, which is the same morning: she wakes,
    finds his side empty, and goes back to the mornings this entry is about.
    The entry is what makes the scene legible — nothing in the footage says
    which bed is the present one or that anybody has left.

    PREMIUM, against a FREE scene, which is the only pairing like it on the
    site and is deliberate. The free journal set is five entries chosen as an
    arc (see the top of this file) and adding a sixth would undo that decision
    for one entry's sake. A visitor watches the whole scene for nothing and
    then meets the wall at her account of it — which is the membership pitch
    working the way it is supposed to, on the strength of the writing.
  */
  {
    id: "asking-for-less",
    addedOn: "2026-08-17",
    dateline: "First morning here, on my own",
    place: "lakehouse",
    about: ["josh"],
    sceneSlug: "luna-josh-bed-flashback",
    access: "premium",
    mature: false,
    body: [
      "I used to think missing someone meant they had to be gone.",
      "Josh taught me that isn't true.",
      "Sometimes I missed him while he was still lying next to me.",
      "I remember mornings when I would try to keep him in bed. Nothing important. I just wanted him close. Five more minutes. A few kisses. A morning where nothing needed either of us.",
      "He'd kiss me back like he wanted the same thing.",
      "And then he'd leave anyway.",
      "I don't think I understood what those moments were doing to me at the time. Each one seemed too small to be upset about. He had work. He had responsibilities. There was always a perfectly reasonable explanation.",
      "So I never really blamed him.",
      "I just started asking for less.",
      "That's the part I see now.",
      "Somewhere along the way, I stopped expecting to come first because it hurt less than noticing when I didn't.",
      "And God, I miss him.",
      "I miss those mornings.",
      "But I don't miss wondering how long I had before something else needed him more than I did.",
    ],
  },
  {
    id: "the-last-box",
    dateline: "The day the last box went",
    place: "lakehouse",
    about: ["josh"],
    access: "free",
    mature: false,
    body: [
      "Ten years fits into fewer boxes than you would think. I counted them while he loaded the truck because counting was something to do with my head.",
      "The thing nobody warns you about is that it doesn't end at the bad part. It ends at the boring part. It ends with a man who stopped noticing the house, stopped noticing the calendar, stopped noticing me, and who could not tell you the day it started because there wasn't one.",
      "I keep waiting to be angry. What I am is tired, and underneath the tired is something I'm not writing down yet.",
    ],
  },
  /* ------------------------------------------------------------ her work ---
   * FREE, and the first entry anywhere about the job. Melissa settled on
   * 2026-08-05 that Luna MODELS and that it is her income — "the only thing in
   * the story that is entirely her own: not Josh's farm, not a job he found
   * her, and it travels" — and until now the journal had not mentioned it once
   * in forty-six entries. A woman with no visible means of support reads as
   * somebody's dependent, which is the opposite of who she is.
   *
   * It gives away nothing, which is what qualifies it for the shop window: no
   * Tyson, no turn, just a competent adult having a good day at work.
   */
  {
    id: "the-work",
    dateline: "A shoot day, and I needed one",
    place: "downtown",
    about: ["luna"],
    access: "premium",
    mature: false,
    body: [
      "Up at five, in the chair by six, and a woman I have never met spent forty minutes on my face while I thought about nothing at all. Best I have felt in three weeks.",
      "People assume this job is about being looked at. It isn't, not from the inside. From the inside it is a room full of people solving a problem, and for eight hours the problem is not me — it's that the light is wrong, the wall is the wrong grey, the jacket does something stupid at the shoulder. I am the least complicated thing in the room. I get to stand still and be handled and nobody wants anything from me except my chin two inches left.",
      "And it is mine. That is the part I would not say at a dinner table without sounding like I was making a point. The farm is his. The shop is his. This is the one thing nobody found for me and nobody has a view on, and it travels, which means there is always somewhere I am expected that has nothing to do with anybody else's day.",
      "I don't think he has ever had to understand that. Everything he has, he built or was handed, and either way it has his name on it.",
      "Eight hours of being good at something, and a cheque with my name on it, and I drove back with the window down.",
      "Writing it here because I want to be able to find it later: today I remembered I am a person who is good at something.",
    ],
  },
  {
    /* Cathy's first appearance in the journal, sitting the same week as the
     * last box. Free, like the entries either side of it — this run is the
     * shop window, and a mother-and-daughter phone call gives away nothing.
     *
     * The scene is 31 seconds of Cathy talking while Luna stands at the
     * window with her back turned, so what Luna writes afterwards is mostly
     * what she did NOT say on the phone. That is the entry: the argument she
     * had silently, at the glass, while her mother filled the air.
     *
     * She does not land on being angry with Cathy, and must not. Melissa's
     * canon is explicit that nothing is wrong between them — Cathy is a good
     * mother working from incomplete information, and Luna knows it while it
     * is happening. An entry that made her mother the problem would be a
     * different, cheaper story.
     */
    id: "my-mother-called",
    dateline: "She finally got me on the phone",
    place: "lakehouse",
    about: ["luna", "cathy", "josh"],
    sceneSlug: "luna-cathy-phone",
    access: "premium",
    mature: false,
    body: [
      "Nine days of watching her name come up and putting the phone face down. Today I picked up, and the first thing out of her was pick up the phone when I call, which is fair, and which I let her have.",
      "She is two thousand miles away with a lamp on and a shelf full of photographs of all of us, and she cannot see any of this, and she is doing the only thing she can do about it, which is ring me.",
      "Then she told me Josh has been calling her. That he doesn't sound like himself. That he's hurting.",
      "I walked to the window while she said it. I want to write that down honestly: I didn't argue, I didn't correct her, I just turned around and looked at the water and let her talk, and she talked for a long time.",
      "Because what am I supposed to say. She has known him ten years and she has never once been in a room with him when the door was shut. She isn't wrong about what she heard. He does sound like that. He is hurting. Both of those are true and neither of them is the thing.",
      "She's not the problem. She has never been the problem. She is just holding one half of it and asking me why I'm not being kinder about the half she can see.",
      "I could give her the rest. I'd have to give her all of it, and then she'd be up at two in the morning in Atlanta with a lamp on, unable to do anything about it, and there would be two of us like that instead of one.",
      "So I said I was fine and that I'd call Sunday. And she said okay in the voice that means she knows I won't.",
    ],
  },
  /* -------------------------------------------- what her mother was told ---
   * PREMIUM, and the turn the free entry beside it cannot carry: Josh got to
   * Cathy first. Canon (2026-08-03) is explicit that she has known him ten
   * years and never once from inside the room, so when he rings her sounding
   * wrecked she believes him — "and she is not wrong about what she heard".
   * That last part is the whole entry. He is not performing.
   *
   * Shares luna-cathy-phone with `my-mother-called`; the watch page renders
   * every entry filed to a scene, so the free account of the call and the
   * private one sit next to each other, which is the point.
   */
  {
    id: "my-mother-likes-him",
    dateline: "After she rang off, and I have worked something out",
    place: "lakehouse",
    about: ["luna", "cathy", "josh"],
    sceneSlug: "luna-cathy-phone",
    access: "premium",
    mature: false,
    body: [
      "She defended him. My mother, who has been in a room with that man perhaps eleven times in ten years, defended him to me, down the phone, in my own kitchen.",
      "It took me until this evening to work out why, and the answer is that he got there first.",
      "He rang her. Of course he rang her. Before I had said one word to anybody he had already been the man on the phone who could not get through a sentence, and she heard that, and here is the part I cannot get around: she was not wrong about what she heard. He wasn't performing. He was wrecked. He is entirely capable of being genuinely wrecked about a thing he chose to do.",
      "So there is now a version of this in Atlanta that I did not write and cannot correct without sounding like a woman keeping score.",
      "And if I gave her the rest of it she would not sleep. She is sixty-five and two thousand miles away and there is nothing she could do with it except carry it around, so what I would actually be doing is handing my mother a weight to hold on my behalf and calling it honesty.",
      "So I said I'm fine. She said okay in the voice that means she knows I'm not. Then we did her neighbour's roof for twenty minutes and both of us were glad of the roof.",
      "I am not angry with her. I want that on the page. She is being kind to somebody with the only information anybody gave her.",
    ],
  },
  {
    /* Avery's first appearance, a night or two after the call with their
     * mother — Cathy got nothing out of Luna and rang her other daughter
     * about it.
     *
     * THE DEVICE IS IN THE FOOTAGE, not invented: the scene opens on Luna
     * writing in this journal, pen in hand, when the iPad lights up. So the
     * entry is the one she was in the middle of, abandoned mid-thought and
     * finished afterwards. It is the only entry in the book that gets
     * interrupted, and the interruption is the good news.
     *
     * Free, and it should stay free even if the run around it is gated. The
     * pages either side of it are Luna managing people; this is the one where
     * somebody manages her, and it is the least guarded she is in the whole
     * first act.
     */
    id: "avery-called",
    dateline: "Interrupted, and I'm glad",
    place: "apartment",
    about: ["luna", "avery", "cathy"],
    sceneSlug: "luna-avery-ipad",
    access: "premium",
    mature: false,
    body: [
      "I was three lines into feeling sorry for myself when the iPad went off, and it was my sister, and I have left those three lines in because they were true at the time.",
      "Mom got nothing out of me on Tuesday, so obviously she rang Avery. That is how it works in our family — she cannot fix it, so she deploys the one person I have never once been able to lie to.",
      "And Avery didn't ask how I was. She has never asked me that in her life. She said hi and then talked for eleven minutes about a man at her work who microwaves fish, and by the end of it I was laughing so hard I had to put the pen down.",
      "Ten years between us. When she was born I was already old enough to hold her properly, and for a long time she was a small person I was responsible for. I don't know exactly when that turned around. Tonight it was very obviously the other way up and neither of us said anything about it.",
      "She let me get to it myself. Somewhere around minute forty I said the thing out loud — that I don't know what I'm doing — and she didn't flinch and she didn't advise me. She said okay. Tell me the rest.",
      "That is the difference between her and Mom and I would never say it to either of them. Mom loves me at me. Avery just leaves the door open and waits.",
      "She's coming out at some point. She said it like it was already booked and I think she may have actually booked it.",
      "Two hours. My face hurts. I have not laughed like that since before the boxes, and I want it written down that it was my little sister who did it, because she will absolutely ask me one day and I intend to have proof.",
    ],
  },
  {
    id: "tyson-shows-up",
    dateline: "Week two, and he's here again",
    place: "lakehouse",
    where: "The kitchen",
    about: ["tyson"],
    access: "free",
    mature: false,
    body: [
      "Tyson turned up with groceries I didn't ask for and put them away in the wrong cupboards, which he knows are the wrong cupboards, because that has been the joke since we were nineteen.",
      "Twenty years of him and I have never once had to explain myself. He doesn't ask how I am. He asks what I've eaten. Then he sits there until I have.",
      "He didn't mention Josh. He won't, unless I do. That is the entire arrangement and I don't know how he learned it, because nobody taught either of us anything useful about this.",
    ],
  },
  /*
    THE NIGHT SHE ANSWERED. Melissa, 2026-08-20: two weeks after she leaves,
    Luna has been dodging Josh's calls; he will not stop; she picks up and the
    argument triggers a panic attack. Tyson is in the house and she calls him
    into the bathroom to sit with her through it.

    PLACED AFTER `tyson-shows-up`, which is the other week-two entry and
    establishes him turning up with groceries and not asking how she is. This
    is the same fortnight and the first time she asks him for something out
    loud.

    IT IS THE FRONT END OF AN ARC, and the arc is the reason it earns its
    place. Here, two weeks in, she calls for him without deciding to. Months
    later in `the-bad-one` she is on a bathroom floor again, nearly rings him,
    and does not. Nothing in either entry points at the other; the distance
    between them is the whole story of what those six months did to her.

    THIS IS WHERE TYSON FINDS OUT, and that is the scene (Melissa, 2026-08-20).
    He knew the small ones from when they were young. He did not know they had
    come back, or what they had grown into — she spent two years making sure
    nobody did. Tonight she gets no warning, so there is no time to go and have
    it somewhere else, and he walks into the real thing with nothing prepared.

    So he is improvising off a twenty-year-old memory, not following a routine.
    Anything written about this must not have him practised at it. The counting
    is the one thing he brings from back then, and she notices her body
    recognise it before she does.

    The last beat is Josh's half, which is what she is really writing about and
    does not say until the end.

    DRAFT PROSE, written to the brief. Replace it.
  */
  {
    id: "i-picked-up",
    addedOn: "2026-08-20",
    dateline: "Two weeks, and I should not have answered",
    place: "lakehouse",
    where: "The bathroom",
    about: ["luna", "tyson", "josh"],
    sceneSlug: "luna-ty-panic-attack",
    access: "premium",
    mature: false,
    notes: ["panic"],
    body: [
      "He rang nine times. I counted them afterwards, which tells you most of what you need to know about the kind of evening it became.",
      "I had not answered anything in eleven days. Not as a strategy — I did not have one then and I do not have one now. I knew that the second I heard his voice I would start negotiating with myself, and I was not steady enough to be in a room with that.",
      "On the ninth one I answered. I have tried to write down why and I cannot give a reason that would stand up in front of anybody. It was not hope and it was not weakness. The phone kept going, and I am a person, and there is a limit to how long you can sit in a quiet house listening to a thing ring.",
      "I am not going to put down what was said. Some of it was mine and mine was not better. The short version is that he is sorry, and he is always sorry, and somewhere in the middle of being sorry he told me what I had done to him — and the thing about Josh is that he can say the cruellest sentence of his life in exactly the voice he uses to ask what time I'll be home.",
      "And then I was on the bathroom floor and I do not properly remember the part in between.",
      "It came faster than any of them ever have. There is normally a runway. A whole afternoon of it stacking up where I can at least see the shape of the thing coming and clear the decks and make sure I am on my own for it. This went from a phone call to no air in about ninety seconds.",
      "Tyson was in the front room with the game on. I called him.",
      "That is the part I keep going back over, because I did not think about it. There is no moment in it where I chose — I have looked for one. I said his name and then he was in the doorway.",
      "He used to know about these. The small ones, when we were young — I would go strange and quiet and he would walk me outside and that would be the end of it, and neither of us ever gave the thing a name. What he does not know is what they have turned into. Nobody knows that. I have spent two years getting it down to something I do privately in a bathroom while somebody else watches television in another room, and I have got very good at it, and tonight I did not get the twenty minutes of warning I need in order to be good at it somewhere else.",
      "So he had not seen one since we were about twenty-three, and he walked into that and did not ask a single question. He sat down on the tile with his back against the bath and he did not put a hand on me until I reached for him, which I did not know I was going to do until it was done. If it frightened him he did not let me see it, which with him is the same service.",
      "He counted. Out loud, slowly, and wrong on purpose — he skipped six, and I noticed, and noticing is not a thing you can do and panic at the same time. I am fairly sure that is the entire trick, and I am fairly sure he did it to me in a car park when we were nineteen, because my body remembered it before I did.",
      "I asked him not to leave until it was finished. I said it out loud, in a plain sentence, with no joke in it. I could not tell you the last time I did that with anybody.",
      "It took about forty minutes. Afterwards he made tea I did not drink and put the game back on and did not say one word about Josh, and I sat at the other end of that sofa feeling like a person again.",
      "Here is the thing I do not want to write down and am going to anyway. I have been having these since I was twenty-three. There is exactly one person alive who has ever been in the room for the start of one, and he is not the man I lived with for ten years.",
      "I have read that back twice and I am leaving it in.",
    ],
  },
  {
    id: "the-carrera",
    dateline: "Sunday, and he had the car out",
    place: "lakehouse",
    about: ["tyson"],
    access: "free",
    mature: false,
    body: [
      "The Carrera came out of the garage, which means he had decided I was getting out of the house today whether or not I agreed to it.",
      "He drives that thing like it's on loan from someone he respects. I have seen him ride a motorcycle at a speed I refuse to write down and he will not take a corner hard with me in the passenger seat. Twenty years and he still thinks I don't notice the difference.",
      "We didn't go anywhere. Two hours of roads that lead back to the same place, and I laughed at something around the second hour and heard myself do it, and so did he, and neither of us said anything about it.",
      "First good day. Writing that down so I can find it later.",
    ],
  },
  {
    id: "the-things-only-we-do",
    dateline: "Thursday, the usual",
    place: "lakehouse",
    about: ["tyson"],
    access: "premium",
    mature: false,
    body: [
      "Diner at the bottom of the hill, same booth, and he ordered for both of us wrong on purpose, which is a thing we have been doing to each other since we were twenty-two and which has never once been funny to anybody else.",
      "That's the part I couldn't explain to Josh in ten years. It isn't the big things. It's that there is an entire language in this world that only two people speak, and I am one of them.",
      "He asked if I wanted to go up to the mountain when the snow comes. I said only if he stops pretending he isn't slowing down for me. He said he doesn't slow down for me. He slows down for the car.",
      "Twenty years. I have never had to be anybody in front of him.",
    ],
  },
  {
    // Month one, so it sits after the ordinary Thursdays and before "month
    // four" — the night the pattern between them stops being only a pattern.
    // Members-only: there is a turn in it, which is the rule the rest of the
    // journal follows. The scene's 30s teaser is free; this is what she thought.
    id: "the-night-at-the-bar",
    dateline: "A month, and he made me go out",
    place: "bar",
    about: ["luna", "tyson"],
    sceneSlug: "luna-tyson-dance",
    access: "premium",
    mature: false,
    body: [
      "A month. I have started counting in months, which is new, and which I do not love.",
      "Tyson turned up at seven and did not ask whether I wanted to go out. He asked what I was wearing, which is the same question with the argument already won.",
      "He asked once whether I had heard from Josh. I said a couple of texts. He didn't ask what they said, and I didn't tell him I haven't answered them, and I have spent the rest of the night working out which of those two omissions is the worse one.",
      "Then I made him dance, because I did not want to sit in a booth being handled.",
      "He does the thing where he claims he can't. Twenty years of claiming he can't, and he moves like a man who has been to a great many weddings and enjoyed every one of them. He was ridiculous. He was doing it to be ridiculous. And I laughed — properly, out loud, in a room full of strangers, for what must have been half an hour. I had genuinely forgotten I could still do that.",
      "Then the song changed, and the room changed with it, and neither of us said anything about that either.",
      "I went to step back. I could not tell you what I was stepping back from. And he moved his hand about an inch and kept me exactly where I was.",
      "He said: you're thinking. He said he could see it happening, on my face, in real time. That is the cost of being known for twenty years — there is no expression of mine he has not already read at least once.",
      "He said let the night be simple.",
      "I said I don't know why I do this to myself. He didn't answer that, which I think was the kindest available option.",
      "And here is the part I am only putting down because it is nearly four and nobody is ever going to read this.",
      "For about a minute, somewhere in the middle of that song, I was not thinking about Josh at all. Not managing not to. Not deciding not to. Just — not.",
      "I don't know what to do with that yet. It was easier when the problem was one man.",
    ],
  },
  /*
    FOUR ENTRIES ADDED 2026-08-15 from Melissa's account of who Luna actually
    is, none of which the journal had anywhere to say:

      why-i-write-this-down  the racing head at night, and the page as the only
                             thing that makes it go one thought at a time
      he-found-me            the bourbon, and Tyson turning up uncalled
      nowhere-to-put-it      overwhelm that will not convert into words and
                             comes out of her physically instead
      two-kinds-of-quiet     Tyson goes quiet and she waits; Josh goes quiet and
                             she works. The same behaviour, and not the same
                             thing at all.

    NOTE FOR MELISSA: `he-found-me` is about drinking to cope. There is no
    content note for that in lib/content/content-notes.ts and I have not
    invented one — the vocabulary in that file is yours, and every note in it
    was added on your say-so. If you want one, it is a two-line addition and
    this entry is where it goes first.
  */
  {
    id: "why-i-write-this-down",
    dateline: "Half past two, again",
    place: "farmhouse",
    about: ["luna"],
    access: "premium",
    mature: false,
    body: [
      "Half past two. It is always half past two.",
      "I do not write this because I am a writer. I write it because if I do not put it somewhere it stays in my head and goes round, and by four it has picked up speed and stopped being about the thing it started as.",
      "On paper it has to be one sentence at a time. It has to go in order. That is the entire trick — my head will not do one at a time, and a page makes it.",
      "Half the time I do not know what I think until I have watched myself write it. Tonight I found out I was angry about something I would have sworn I was fine about.",
      "So. Useful book.",
    ],
  },
  {
    id: "he-found-me",
    dateline: "I did not call him",
    place: "bar",
    about: ["luna", "tyson"],
    access: "premium",
    mature: false,
    body: [
      "I did not call him. I want that at the top of this before I write the rest, because it matters to me and it will not matter to him at all.",
      "Bad day. Not a specific bad day — one of the ones where it is all just sitting on my chest and I cannot get out from under it. I got in the car at nine and drove to the one place I always go.",
      "Three bourbons in and I was doing fine. That is the sentence I would have used if anybody had asked. Doing fine.",
      "He came in at eleven. He did not say how he knew. He never says how he knew. He sat down on the stool next to me and ordered a soda water like it was a Tuesday and he had always been coming.",
      "He did not ask what was wrong. He did not say one word about the glass. He asked whether I had eaten, which I had not, so we ate.",
      "Around one he said: next time call me first and we will go together. Not do not come. Not you should not be here. Call me first and we will go together.",
      "I have been told off about this by people who love me. That was not being told off. I do not know what that was, and I have been lying here for two hours trying to find the name for it.",
    ],
  },
  {
    id: "nowhere-to-put-it",
    dateline: "After I broke the blue bowl",
    place: "farmhouse",
    about: ["luna"],
    access: "premium",
    mature: false,
    body: [
      "I broke the blue bowl. On purpose. I am writing that down honestly instead of the version where it slipped, because the version where it slipped is the one I will have by morning.",
      "Here is the thing I cannot explain to anybody. It builds. All day, small things, not one of them worth mentioning on its own — and I keep saying it is fine, because it IS fine, each one is fine — and by six there is so much of it in me that I can feel it in my hands.",
      "And it has to go somewhere. It will not go as words. I have tried, for years. It comes out of me physically or it does not come out at all, and then it just sits there and gets heavier.",
      "Normal people get annoyed and then stop being annoyed. I have watched them do it. I do not understand the mechanism.",
      "So: a bowl. Twelve dollars. And I felt better, and then I felt so ashamed of feeling better that I sat down on the kitchen floor for twenty minutes.",
      "I am going to sweep it up before he is home and I am not going to mention it, which I suspect is the part I should actually be worried about.",
    ],
  },
  {
    id: "two-kinds-of-quiet",
    dateline: "Working something out about both of them",
    place: "lakehouse",
    about: ["josh", "tyson"],
    access: "premium",
    mature: false,
    body: [
      "Worked something out tonight and I want it written down before I talk myself back out of it.",
      "They both go quiet. I have spent my whole life around two men who go quiet and I always assumed it was the same thing. It is not. It is not remotely.",
      "When Tyson goes quiet, nothing is happening to me. He takes it somewhere and sits with it and it burns down on its own time, and then he comes back and he is the same man he was. The military did that to him, or it was always in there and the military gave it a shape. Either way I have never had to do anything about it except wait, and I have never minded waiting, because I have always known he was coming back.",
      "When Josh goes quiet it is weather. It is pressure, and the whole house knows. I can tell by the way he puts his keys down. And I start moving around it — softer, faster, doing more, saying less — so that by the time it breaks I have usually already spent the day trying to stop it.",
      "One of them goes quiet and I am alone for a while. The other goes quiet and I am working.",
      "I have never said that to anybody. I am not sure I could say it out loud without it sounding like a complaint about a man who has never once raised his hand to me.",
    ],
  },
  /*
    TWO HEAVIER ONES (2026-08-15), and the second is the heaviest thing in this
    file. Melissa: Luna is broken and trying to fix herself, gets overwhelmed
    far past what a normal person does, and has had a breakdown. `the-bad-one`
    is that night. It carries the `panic` note, which already exists for the
    truck drive and is the right vocabulary for this — it names what is in the
    piece and lets an adult decide.

    CORRECTED 2026-08-19. `the-bad-one` used to say "nobody in my life knows
    this about me. Ten years and Josh has never seen one." That was wrong, and
    it had been live. Melissa's canon: Luna is PRONE to panic attacks and BOTH
    MEN KNOW — Tyson for twenty years, Josh for ten. What is true is the
    asymmetry, not the secret: she does not call Josh, and never has.

    The paragraph was rewritten rather than deleted, because the entry needs
    what it was reaching for. It now lands on the real point — knowing is not
    the thing, being the one who gets rung is — which is sharper than the
    version where she is simply hiding, and it is what `the-six-months` further
    down picks up.
  */
  {
    id: "why-not-the-bear",
    dateline: "Two in the morning, being honest for once",
    place: "lakehouse",
    about: ["tyson", "josh"],
    access: "premium",
    mature: false,
    body: [
      "Nobody has ever asked me this so I am going to ask myself it and then answer it properly, because I am tired and there is nobody here.",
      "Why not Tyson. Twenty years. He has never once let me down, not one time, not in a way I could point at. He is the calmest thing in any room he is in. When everything went wrong the first person I called was him and the first person I called the second time was him.",
      "And I have never looked at him. Not once. Not in twenty years.",
      "He was my big bear. That is genuinely what I called him, out loud, for years — and you do not think about your bear like that, that is the whole point of a bear. He is the thing you hold on to when the room is bad.",
      "Josh came at me like weather. Sideways, fast, no warning, and I was twenty-eight and I had never had anybody look at me like that in my life. Not fondly. Not kindly. Like something he had already decided about.",
      "I want to write down that I picked wrong and I cannot make myself write it, because it would not be true. I did not pick badly. I picked the one that made my heart go, and my heart has terrible judgement and I knew that at the time.",
      "Here is the honest answer. Safe never felt like being chosen. It felt like being kept. And I was twenty-eight and I wanted to be chosen so badly I would have taken it in almost any form.",
      "I do not know what to do with the fact that I am writing this in his lake house, on a mattress he made up for me, having eaten food he brought.",
    ],
  },
  {
    id: "the-bad-one",
    dateline: "Wrote this the next day. Could not have written it that night.",
    place: "lakehouse",
    about: ["luna"],
    access: "premium",
    mature: false,
    notes: ["panic"],
    body: [
      "I am writing this down because if I do not write it down I will do the thing where I decide it was not that bad.",
      "It was that bad.",
      "It started over nothing. It always starts over nothing — that is the tell, and I know the tell, and knowing it has never once stopped it. Something small went wrong at about four and by six I could not get a full breath and by eight I was on the bathroom floor with the light off.",
      "Not crying. Past crying. That flat white place where you are not sad any more, you are just a body doing something on its own, and some part of you is standing in the corner watching it happen and taking notes.",
      "I could not tell you how long. Hours. I know it got dark and I know at some point it was not dark any more.",
      "The worst of it is not the night. The worst of it is the next morning, when you get up and put a wash on and the whole thing is just gone, filed, and you are a normal woman making toast — and you understand that it is going to come back, and that there will be no warning, and that you will be exactly as unable to stop it then as you were this time.",
      "I did not call anybody. There was a whole hour where I nearly called Tyson and did not, because what do you say. Come here, nothing has happened.",
      "It is not that nobody knows. Tyson knows now. He found out on a bathroom floor in this house in the first fortnight, and he has been careful with me ever since in a way I can feel from the other side of a room. And Josh knows I am like this — ten years, he is not blind. What neither of them has is the number, or what the last two years of them actually looked like, and I have gone to some trouble about that.",
      "Knowing is not the thing, though. The thing is who you ring. In ten years Josh has never once been the person I rang, and it is not because he would not have come. Somewhere very early on I decided this was a thing I did not hand him, and I cannot now remember deciding it.",
      "I am putting it in the book because the book is where I do this honestly. I have got extraordinarily good at having them on my own, which is not a skill a well person develops, and I am aware of that.",
    ],
  },
  {
    id: "month-four",
    dateline: "Somewhere around month four",
    place: "lakehouse",
    where: "The back deck",
    about: ["luna", "tyson"],
    access: "premium",
    mature: false,
    body: [
      "I am going to write one sentence in this book that I will not say out loud, and then I am going to close it and go to bed.",
      "When his truck comes up the drive, something in me lifts before I have decided to let it.",
      "That's the sentence. That's all of it. He is my oldest friend and he has spent six months making sure I ate, and if I am starting to feel something else about it then that is my problem to carry quietly, because the alternative is losing the one thing that got me through this.",
    ],
  },
  {
    id: "not-just-a-friend",
    dateline: "I noticed something tonight",
    place: "lakehouse",
    where: "The back deck",
    about: ["luna", "tyson"],
    access: "premium",
    mature: false,
    body: [
      "He was fixing the rail on the deck and had his sleeves up, and I looked at his forearms for slightly too long, and then I looked away, and then I sat with the fact that I had needed to look away.",
      "Twenty years. I have seen this man in every state a person can be in. I have never once had to manage my own face around him.",
      "I want to be careful here, because I know what I'm like at the moment and I don't trust my own readings. It would be very convenient to fall for the person holding me up. That's a story, and I've read it, and it usually ends with the woman having wrecked the one good thing she had.",
      "But it isn't gratitude. I know what gratitude feels like. This is not that.",
    ],
  },
  {
    id: "firepit-not-saying",
    dateline: "Late — the first cold night",
    place: "lakehouse",
    where: "The firepit",
    about: ["tyson"],
    sceneSlug: "tyson-luna-lakehouse-fire",
    access: "premium",
    mature: false,
    body: [
      "He built the fire the way he does everything — like it had already been decided and he was just catching up to it. Ex-military hands. No wasted movement. I watched him crouched over the wood and thought: I am not going to say anything tonight.",
      "I said something. Not the thing. Something next to the thing, close enough that he could have reached over and picked it up if he wanted to. He didn't. He let it sit between us and get warm and go out.",
      "I have never been so grateful to anyone for pretending not to understand me.",
      "The lake was completely still. I keep thinking about that. All that water and not one bit of it moving.",
    ],
  },

  /* -------------------------------------------------- josh comes back ---- */
  {
    id: "he-called",
    dateline: "He called this morning",
    place: "lakehouse",
    about: ["josh"],
    access: "free",
    mature: false,
    body: [
      "Six months of nothing and then his name on my phone at seven in the morning like no time had passed at all.",
      "Coffee. That was the whole ask. Not a speech, not an apology with a run-up to it — just coffee, and that old voice he uses when he already knows the answer.",
      "I said yes before I had decided to. I want that recorded honestly, because I am going to want to tell myself later that I thought about it.",
    ],
  },
  {
    id: "coffee",
    dateline: "Sitting in the car outside, writing this before I drive",
    place: "coffee-shop",
    about: ["josh"],
    sceneSlug: "luna-josh-coffee",
    access: "free",
    mature: false,
    body: [
      "He did the thing with my lip.",
      "Reached over and grazed my bottom lip with his thumb, in the middle of a sentence, like it was nothing, like it was still his to do. And then carried on talking.",
      "That's all it takes. Six months. A whole rebuilt life. An entire personality I put together out of being fine — and it came down in about a second and a half because a man touched my mouth in a coffee shop.",
      "I hate that. I want that written down. I HATE that he can still do that, and I hate more that he knows he can.",
      "And he kept at it all morning. My wrist. The back of my hand when he took the cup off me. Getting closer than he needed to be. Nothing you could point at, nothing you could complain about, everything deliberate.",
      "And making me laugh. Not politely — the ugly one, the one I can't stop once it starts. Nobody else has ever got that out of me.",
      "That was him. Not the man who stopped noticing the house or the calendar or me. The one I met. The original. He walked back in wearing that like he'd never taken it off.",
      "He asked me to dinner. Tonight.",
      "I said yes.",
      "I wanted to say no. I had the no ready — I have had the no ready for six months, I have practiced it, I have said it out loud in this car. And it did not come out of my mouth.",
      "What is wrong with me.",
      "Six months of work. Six months of Tyson driving out here to make sure I'd eaten. Six months of turning into somebody who does not do this. And I'm about to put all of it out the window of a coffee shop because he touched my lip.",
      "I'm going to go home and pick something to wear. That's the honest end of this entry.",
    ],
  },
  /* --------------------------------------------------------- Josh's father ---
   * FREE, and the journal's first word about Rick in forty-six entries — he
   * had not appeared once, despite being, in Melissa's canon, "most of the
   * reason Josh is the way he is". This is the job the /about page gives him:
   * he explains Josh, and explaining Josh gives away nothing, which is what
   * makes it publishable.
   *
   * WRITTEN AS REFLECTION, NOT AN EVENT. She has known the man ten years, so
   * she can think about him without a scene having to happen — deliberately,
   * so this invents no beat. Canon used: dominance with charisma, never has to
   * raise his voice, proud in a way that never lands as pride, and the thing
   * he holds at once — disappointed in Josh for losing her, and always having
   * thought she was too good for him.
   */
  {
    id: "joshs-father",
    dateline: "Thinking about Rick, of all people",
    place: "farmhouse",
    about: ["luna", "josh", "rick"],
    access: "premium",
    mature: false,
    body: [
      "I have been thinking about Josh's father, which is not a sentence I expected to write this year.",
      "Ten years and I have never heard that man raise his voice. Not once. He doesn't need to. He comes into a room, takes the best chair without appearing to choose it, and everybody quietly rearranges themselves around what he might want next. It is the most impressive thing I have ever watched a person do and I would not wish it on anybody's son.",
      "Because here is what I have finally understood, a decade late. Josh is doing an impression. All of it — the certainty, the way a decision arrives already made and the rest of us are simply told — he learned in that family from a man who does it better and does not have to try. Josh does a louder version because he isn't sure it's working.",
      "And Rick is proud of him in a way that has never once landed as pride. He watches his son the way you watch somebody carry something expensive across a room.",
      "He has always been kind to me, and it has a strange quality to it. Twice now he has said something to me that, if you turn it over afterwards, is not really a compliment to Josh.",
      "I don't think he knows he does it. I think he means well and it comes out as weather.",
      "Anyway. I understand my own life slightly better than I did this morning, which is not the same as it being any easier.",
    ],
  },
  {
    id: "back-pocket",
    dateline: "Getting ready, and he turned up",
    place: "lakehouse",
    where: "The kitchen",
    about: ["tyson", "josh"],
    access: "premium",
    mature: false,
    body: [
      "I can't tell him.",
      "I have turned it over all afternoon and I cannot make myself do it. Things have been strange between us for weeks in a way I could not describe to a third party if you paid me — nothing said, nothing happened, everything different, and both of us walking around it.",
      "And on top of that I'm supposed to say: by the way, I'm having dinner with Josh tonight.",
      "After six months. After everything he has sat through with me out at that firepit. After every single thing I have said about that man in this kitchen with Tyson standing right there hearing all of it.",
      "He'd disown me. Not shout — he has never once shouted at me — he'd just go quiet and go home, and something would be permanently different afterwards.",
      "So, no. Keeping that one in my back pocket.",
      "That's his truck on the drive now. Of course it is.",
    ],
  },
  {
    id: "the-bathroom",
    dateline: "In the bathroom, and I'm shaking a bit",
    place: "lakehouse",
    where: "The bathroom",
    about: ["tyson", "josh"],
    sceneSlug: "luna-tyson-bathroom",
    access: "premium",
    mature: true,
    body: [
      "He let himself in with groceries I didn't ask for, because of course he did, and I was standing at the mirror with my phone in my hand texting Josh about tonight.",
      "He asked what I was up to. Easiest question in the world.",
      "I lied. Out loud, to his face, in my own bathroom, to the person who has never once needed me to explain myself. Not a careful lie either — it came out smooth and quick and I heard myself do it.",
      "It doesn't matter. He knew. I'd put money on him having known before he got out of the truck.",
      "Because then he did the thing. Went quiet and came closer and just stood there, and I counted it — five seconds, maybe six of him waiting for me to fill it.",
      "I didn't. First time in twenty years I have not been the one who broke.",
      "But his face. I am going to be carrying his face around for a while. Not angry. Not even hurt exactly. Something further down than that, like he'd just had something confirmed that he'd been hoping he was wrong about.",
      "This does not feel like winning. I held, and I feel sick.",
      "And here's the thought I can't get rid of, the one I'm only writing because nobody will read it: I keep wondering what his face would have done if I'd cracked. If I'd stood there and told him the truth — that Josh called, and I said yes, and I said yes to dinner tonight, and I'm going.",
      "I want to know what that would have cost him. That's a horrible thing to want.",
      "I have to leave in twenty minutes.",
    ],
  },
  {
    id: "the-long-table",
    dateline: "The same night, after dinner",
    place: "farmhouse",
    where: "The long table",
    about: ["josh"],
    sceneSlug: "luna-josh-dinner-house",
    access: "premium",
    mature: false,
    body: [
      "Ten years and he can still do that thing where the rest of the room quietly stops existing.",
      "This is the part people don't understand about him, because they only ever met the version that got comfortable. He is not a small man in a room. When he decides on something he decides with his whole body, and for ten years the thing he had decided on was me, and I have never in my life felt anything like being on the receiving end of that.",
      "That's what I lost. Not the routine. That.",
      "I got home at one in the morning and did not call Tyson.",
    ],
  },
  {
    id: "i-said-yes",
    dateline: "Days later, correcting myself",
    place: "farmhouse",
    where: "Our bedroom",
    about: ["josh"],
    access: "premium",
    mature: true,
    body: [
      "I didn't go home at one in the morning. I want the real version in here, because the version I have been telling myself since is already softer than what happened.",
      "He asked. Not carefully. He has never once asked me carefully, and six months apart hadn't taught him to start.",
      "And I said yes. First night. Six months of silence, one coffee, one dinner, and I said yes before he had finished asking, the way I have said yes to that man since I was twenty-eight.",
      "Here is the part I'm not proud of and am writing down anyway: I wasn't swept away. I knew exactly what I was doing. There is something in me that goes towards the drop rather than away from it, and it has been in me a long time, and Josh is the only person who has ever looked at it straight and not tried to talk me out of it.",
      "I lay awake after and thought about Tyson putting the shopping in the wrong cupboards.",
    ],
  },
  {
    /* The morning of the same night, and it sits HERE rather than before
     * `i-said-yes` on purpose: `the-long-table` ends on "I got home at one in
     * the morning", `i-said-yes` takes that back, and an in-the-moment page
     * from that bedroom placed any earlier gives the correction away.
     *
     * CANON, from Melissa (2026-08-12), and it reads against `i-said-yes` more
     * closely than it looks. What she said yes to that night was staying —
     * "I lay awake after" is her, awake, in his bed. Six in the morning is when
     * it is actually the first time in six months, and it starts with him
     * unable to sleep and waking her, which is the whole reason the scene is
     * called First Night and not something about the dinner.
     *
     * The other new fact is the ignored call: Tyson rang DURING dinner and she
     * turned the phone over. She does not know yet that Josh had already told
     * him that morning — that lands two entries later, in `he-already-knew` —
     * so nothing here can hint that she knows why he was ringing.
     *
     * Her defence is the six months, not the bathroom: the chances she gave him
     * are `firepit-not-saying` and `not-just-a-friend`, both of which are her
     * leaving a gap he declines to step into. The staring game in the yard has
     * not happened yet.
     */
    id: "first-night",
    dateline: "Six in the morning — he's asleep now and I'm not",
    place: "farmhouse",
    where: "Our bedroom",
    about: ["luna", "josh"],
    sceneSlug: "luna-josh-first-night",
    access: "premium",
    mature: true,
    body: [
      "He woke me up. I want that down before the rest of it crowds it out, because the rest of it is what I'll be carrying around all day and this is the part that actually got me.",
      "It was still dark. He couldn't sleep — he never can when a day has gone well, which is a thing about that man I had somehow managed to forget entirely — and rather than lie there being awake on his own, he woke me. Anybody else does that at six in the morning and gets an elbow.",
      "And he didn't want anything. That's the bit I keep going back to. He got his face into the back of my neck and said something so stupid that I laughed before I had my eyes properly open, and then he just held on. For a long time. Long enough that I stopped waiting for it to turn into something else.",
      "Then it turned into something else, and I'm not writing that part down like a girl of nineteen. What goes in here is this: six months, and I had to tell him nothing. Not one thing. He remembered the order of it. He remembered things I have never once said out loud to him in my life, because I never had to — he watched, and he kept it, and that is the thing about him nobody outside this house has ever understood.",
      "Somewhere in the middle of it I was twenty-eight again. Not remembering being twenty-eight — being it. The flat over the shop, no money, laughing at four in the morning about nothing. I have not been that far out of my own head since the last box went out of the door.",
      "And last night was good, and I'm putting that down while it's still allowed to be simply true. He was funny. He asked me things and stayed for the answers. He put his hand flat on my back going through the door the way he has always done and I nearly said something about it and didn't.",
      "Tyson rang while we were eating. I watched his name come up on the table between the water and the bread, and I turned the phone over, and I did not go outside, and I did not ring him back, and then I picked my glass up with the same hand.",
      "Nobody made me do that. That one is mine.",
      "So here is my defence, made at six in the morning to absolutely nobody. I left it open for him for six months. At the firepit, out on the deck, on every one of those nights I put the thing down next to the thing and waited, and he let it go cold every single time. He is the bravest man I have ever met about everything on this earth except this. And I am not going to spend the rest of my life standing in a doorway waiting on one sentence.",
      "It's a good defence. I have been rehearsing it since about four, which tells me something I would rather not look at this morning.",
      "My bag is by the door because I have to drive back to the lake to change for work, which is a sentence I would like somebody to explain to me.",
      "He's asleep now. He can sleep now, apparently. And I am sat up in the dark with a pen, and the last thing I did before I picked it up was check my phone to see whether Tyson had rung a second time.",
      "He hadn't.",
    ],
  },
  {
    id: "what-i-didnt-say",
    dateline: "The next day, still haven't said it",
    place: "lakehouse",
    about: ["tyson"],
    access: "premium",
    mature: false,
    body: [
      "Tyson called at eleven about the far gate needing doing before the weather turns. Eight minutes on the phone about a gate.",
      "He asked what I got up to last night. I said not much. Quiet one.",
      "We have known each other twenty years and I have never done that before. Not once, not about anything, not even the things you'd lie about to spare somebody. It came out of my mouth so smoothly that I've been sitting here since trying to work out where I learned it.",
      "I could call him back right now. I'm writing this instead, which I suppose is my answer.",
    ],
  },
  {
    id: "he-already-knew",
    dateline: "He already knew",
    place: "farmhouse",
    about: ["tyson", "josh"],
    access: "premium",
    mature: false,
    body: [
      "Josh told him. Yesterday morning, before the coffee. Mentioned it in the yard like it was the weather, because to Josh it was — Tyson is family, Tyson is on the farm twice a week, why on earth wouldn't you say it.",
      "So Tyson asked me what I got up to last night already knowing the answer. He gave me the chance to say it and I looked at it and chose not to.",
      "He didn't correct me. That's the part I can't put down. He let me have the lie, and now it's mine, and there is no version of the next conversation where I get to give it back.",
    ],
  },

  /* --------------------------------------------------- it begins again ---- */
  {
    id: "the-thing-we-do",
    dateline: "He did the thing",
    place: "farmhouse",
    where: "The yard",
    about: ["tyson"],
    access: "premium",
    mature: false,
    body: [
      "I should write down what the staring game actually is, because if anyone ever reads this book they will need it explained, and because I think it stopped being a game this week.",
      "When one of us thinks the other is lying, we go quiet. That's the whole thing. No accusation, no question, nothing you could repeat back to somebody. You just stop talking — and then, instead of giving the other person room, you take it. You come closer. And closer. And you stand there in their space, saying absolutely nothing, until they crack.",
      "He brought it back from the army. He explained it to me once, years ago, in the way he explains things — flatly, like he was reading a manual he was slightly embarrassed to own. People will fill a silence. If you get close enough, they will fill it faster. You don't have to ask anybody anything.",
      "We have used it on each other for twenty years over absolutely nothing. Who finished the good coffee. Who put the dent in the tailgate and let his brother take it. I have cracked in under nine seconds and been furious about it for a week.",
      "He did it to me again on Tuesday. Properly, this time — not five seconds in a bathroom. Came up for the gate, and somewhere between the truck and the barn he stopped talking, and then he was just there, close enough that I could see him deciding not to say it, and he waited.",
      "And I didn't crack. Twice now.",
      "Twenty years of that thing never failing on either of us, and I stood in my own yard and held it, and he saw me hold it, and that told him more than anything I could have confessed.",
      "Then I did it back to him. Stood there and gave him the silence and closed the distance and waited.",
      "He didn't crack either.",
      "So now we both know. Not what the other one is holding — just that there is something, and that for the first time in our lives it's worth more to us than the truth is.",
    ],
  },
  {
    id: "first-morning-back",
    dateline: "First morning back",
    place: "farmhouse",
    where: "The kitchen island",
    about: ["josh"],
    sceneSlug: "luna-josh-first-morning",
    access: "premium",
    mature: false,
    body: [
      "A note on the island. Didn't want to wake you. Coffee's still warm.",
      "I have thrown away every note that man ever wrote me, because they were about the truck or the vet or what time. I put this one in the drawer.",
      "Coffee was cold. I drank it standing at the counter in his shirt anyway, and if you had shown me this morning six months ago I would have cried at it.",
      "So why am I writing it down like evidence.",
    ],
  },
  {
    id: "the-kitchen",
    dateline: "Tuesday, nothing happening",
    place: "farmhouse",
    where: "The kitchen",
    about: ["josh"],
    sceneSlug: "luna-josh-kitchen-kiss",
    access: "premium",
    mature: true,
    body: [
      "He came in from the field with dirt on him and stood in the doorway not saying anything, and I kept cutting, because if I looked up I'd have had to decide what my face was doing.",
      "Ten years. He still comes across a room like he's asking and has already been answered.",
      "That's the whole entry. I want a record that on an ordinary Tuesday, with nothing happening, it was still like that — because I know what I'm capable of telling myself later.",
    ],
  },
  {
    // Placed here on purpose: the warmest entry she writes about him sits
    // immediately before the one where week three starts going the way week
    // three went the first time. The doubt in the last three lines is the
    // whole point of the entry — she gets to the question and then does not
    // answer it, which is how she handles everything about him.
    id: "the-bolt",
    dateline: "After, and my hands won't close properly",
    place: "farmhouse",
    where: "The barn",
    about: ["luna", "josh"],
    sceneSlug: "josh-luna-bolt",
    clipId: "one-more",
    access: "premium",
    mature: false,
    body: [
      "There is a bolt on that tractor that has been seized since before either of us. I got maybe a degree out of it and told him I was done, and I meant it — I had already turned it into a fact about me instead of a fact about the bolt, which is a thing I do and have always done and did not know I did until this afternoon.",
      "He didn't take the wrench. That's the part. Ten years and I know exactly how fast he could have done it himself, and he stood there with his hands off it and said give it one more. Not loudly. No speech about it. Just — one more, Luna.",
      "So I gave it one more and it went. It just went, all at once, and I nearly put myself on the floor of the barn, and the noise I made was not a dignified noise.",
      "And he didn't make it about himself either. He didn't say he'd known I could. He didn't stand there looking pleased with his own patience, which is a thing men do and I have watched them do it. He said there it is, and went back to what he was doing, and let it be mine.",
      "I have been carrying that around all evening — that I can be walked right up to the edge of what I think I'm capable of and pushed one step past it, and the person who did that to me was him. I learned something today and he is the reason. I want that written down while it's still exactly true.",
      "And then the other thing, which I'm only writing because nobody is reading this.",
      "I gave it one more because he asked me to. Not because I had anything left. What if it hadn't moved? If I'd stood there and pulled and it had stayed exactly where it was — what would his face have done.",
      "Nothing. I know the answer. He'd have shrugged and taken the wrench and it would have been fine and he'd have forgotten it by dinner.",
      "So why did I need to know.",
    ],
  },
  {
    // FREE and PG-13 by construction: the entry is about restraint, so there is
    // nothing to withhold. It is also the best advert the journal has — a
    // visitor who reads this understands exactly what the locked pages are.
    id: "close-quarters",
    dateline: "An hour in the truck, waiting out the rain",
    place: "farmhouse",
    where: "The farm road",
    about: ["luna", "tyson"],
    clipId: "close-quarters",
    access: "premium",
    mature: false,
    body: [
      "Nothing happened. I am putting that at the top because I know how this will read back to me in a year and I want the record to be accurate before I start editing it.",
      "The rain came in and we sat it out in the truck, and there is not enough room in that cab for two people to pretend they are unaware of each other. So we didn't talk. And the not-talking got extremely loud.",
      "At one point he went to change gear and stopped, because there was nowhere to put his arm that wasn't near me, and he put it back on the wheel. That is the entire event. That is everything that happened.",
      "An hour. Two adults who have known each other since we were nineteen. Nothing happened, and I have thought about it four times today, and here I am writing it down.",
    ],
  },
  {
    /* Week two of trying again, and the first time the distance is a thing
     * happening TO her rather than something she has noticed in herself. Sits
     * between the truck in the rain (nothing happened, and she thought about
     * it four times) and week three (Josh asleep in the chair) — she is being
     * closed out at one end while the other end goes quiet.
     *
     * She does not know why, and this entry must not know either. The reader
     * has more than she does by now, and that gap is the whole tension: he is
     * putting a field between them because he cannot trust himself in a room
     * with her, and she is reading it as something she did.
     */
    id: "the-fair",
    dateline: "The fair, and I've come back to the truck to write this",
    place: "fair",
    about: ["luna", "tyson", "josh"],
    sceneSlug: "luna-josh-fair",
    access: "premium",
    mature: false,
    body: [
      "Josh saw him before I did. He said it lightly — did you know he'd be here — and I said no, and it was true, and I have been turning over why I felt caught out by a question I could answer honestly.",
      "Eight days. Two calls and I don't know how many messages, and what I get back is that he's been busy. Tyson has been busy in front of me for twenty years and it has never once meant he was unavailable.",
      "So I went over. And he was pleasant, which is the part I cannot get past. Pleasant is what he is with people he doesn't know.",
      "I told him he can talk to me. I told him we don't do this — we have never once been two people who avoid each other, that is not a thing that has ever been true about us, and I asked him not to start.",
      "That's when he took my elbow and moved me out of the light, round the side of the barn where nobody was, and I want to be honest about the half-second where I thought he was finally going to say something.",
      "What he said was: not here. It's complicated. I'll talk to you.",
      "Three sentences. I have taken them apart four times sitting in this truck and they do not add up to anything. Not here — where, then. Complicated by what. I'll talk to you — when.",
      "And the worst of it is I said okay. I stood there in the dark behind a barn and let a man I have known since I was nineteen hand me nothing, and I said okay, and I went and found Josh and rode the ferris wheel.",
      "He is not going to talk to me. I knew it while he was saying it. I don't know how I knew and I am writing it down here so that when he doesn't, I have proof I wasn't surprised.",
    ],
  },
  /* -------------------------------------------------- seven days: Mexico ---
   * THE TRIP MOVED (Melissa, 2026-08-17), and it moved the whole meaning of
   * it. Mexico used to be a flashback to five years into the ten, sitting at
   * the top of this file out of sequence. It is now SEVEN DAYS, and it happens
   * AFTER they get back together — Josh books it, having spent six months
   * missing her and working some things out about himself.
   *
   * WHY THAT IS NOT A COSMETIC CHANGE. As a flashback, Mexico was the evidence
   * Luna had in her pocket when she decided to give him another chance: she
   * had seen this version of him once, so taking him back was not stupid. Run
   * afterwards, it cannot do that job — she has already chosen him by the time
   * the plane lands. It does something better and worse instead. It is the
   * proof arriving AFTER the bet, the best week of her life happening inside
   * the reconciliation, and it is what makes the next entry cost what it
   * costs. LUNA_VALE_CONTEXT.md carries the same correction.
   *
   * PLACED HERE, immediately before `the-part-i-forgot`, so the trip runs
   * roughly weeks two and three and they land home into "Three weeks in" —
   * him asleep in the chair before she has finished telling him about her day.
   * Mexico is the top of the arc and the drop starts on the page after it.
   * If Melissa wants it earlier or later, moving this block is the whole job.
   */
  {
    id: "mexico-on-the-way",
    dateline: "Seven days away — somewhere over the water",
    place: "mexico",
    about: ["luna", "josh"],
    access: "premium",
    mature: false,
    body: [
      "He booked this himself. Not me — him. He booked it, paid for it, and told me on a Tuesday like it was nothing, and I have been turning that over since the taxi and I cannot get it to sit still.",
      "Because here is the part I would not say out loud to anybody, least of all to him: I have been waiting for the other thing to come back. Weeks of him being exactly who he says he is, and I have spent most of them standing slightly to one side of it, checking.",
      "That is not fair to him. I know it is not fair to him. It is also the only way I currently know how to be, because you do not get handed back the man you lost and simply take him.",
      "And a week away is an expensive way to find out whether two people still like each other. That is the fear. Not that we'll fight — we don't really fight. That we'll get there and it will be the same two people in a nicer room, and I will have to look straight at it with nothing to do all day but look.",
      "I am writing this down on the plane so that if it goes well I have to sit here afterwards and admit I was wrong. Which I would like to be. I would very much like to be wrong about this.",
    ],
  },
  {
    /*
      THE PRIVATE ONE. Melissa's brief, 2026-08-17: there was nothing in the
      journal about what Josh is actually like behind a closed door, and there
      needed to be — because Luna's attraction to him is not a mystery, it is
      specific, and the story keeps asking the reader to believe she would take
      this man back twice.

      What it has to carry: how attentive he is to her body, that he talks and
      listens, that this is the man she fell in love with ten years ago, that
      she cannot work out how it got lost, and that she is in love with him —
      "at least this version", which is the last line and the whole hinge.

      MATURE, and it is the most explicit page in the journal by some way. It
      carries no content note: `mature` already means sex on this site, and the
      notes vocabulary is reserved for the things a reader might need warning
      about rather than for two people who both want to be there. Nothing here
      is coercive and nothing here is a note's business.

      DRAFT PROSE, unlike `asking-for-less` — this is written to the brief
      above, not delivered by her. Replace it.
    */
    id: "mexico-the-fourth-night",
    addedOn: "2026-08-17",
    dateline: "The fourth night, and I am writing this one down properly",
    place: "mexico",
    about: ["luna", "josh"],
    access: "premium",
    mature: true,
    body: [
      "I am going to write this one down properly and then be embarrassed about it for the rest of my life, and I have decided I don't care. This book is mine. Nobody is ever reading it.",
      "Four days in and I have stopped being able to pretend I'm watching any of this from a sensible distance. So. In the order it actually happens.",
      "He doesn't start where men start. That's the first thing, and I had genuinely forgotten it — not forgotten; I had filed it under things I'd made bigger in my head across ten years. I hadn't. He comes in and he takes his time about the door and the lamp and my hair, and by the time he's anywhere near me I have already been handed twenty minutes of a man deciding that nothing else on this earth is happening tonight.",
      "He puts his mouth on parts of me nobody has ever bothered with. A shoulder. The inside of an elbow. He'll spend a quarter of an hour at the back of my neck like there is nowhere either of us has to be, and on the first night here I laughed, and he stopped and looked up and asked what — and I couldn't tell him it was because I'd forgotten anyone did that.",
      "He knows my body better than I do and he has never once been smug about it. He knows what the backs of my knees do. He knows I go quiet before I go loud, and he doesn't take the quiet for a no, because he knows the difference, because he learned it at twenty-eight and never stopped paying attention.",
      "And he talks. God, he talks. Not a performance — he just says the thing he's thinking about me while he's thinking it, in the same flat calm voice he uses for tractor parts, and it takes me apart every single time and he knows that too.",
      "And then he asks. That's the part I couldn't explain to anybody. He'll stop in the middle of it and ask me something and actually wait for the answer, and I tell him, and he does it. No negotiation. No wounded silence, nothing to manage afterwards. I have been with men who took a request as a review.",
      "He keeps the light on. He always has. Not to be watched — to see me. Ten years of that and I have only this week stopped reaching for the switch.",
      "I have never been with anybody this invested in me. I want that sentence left exactly as blunt as it is. Not this attracted to me. Invested. Like I am the thing he came here to do.",
      "It's the same thing he has always had. He does everything like that. It is why I fell in love with him watching him rebuild an engine he couldn't afford to break, and it is what I have been quietly starving for, and I did not know how badly until this week.",
      "What I can't work out — what I have been lying here at two in the morning not working out — is where it went. Nobody took it. There wasn't a year it stopped. It just got given away to other things, one small allocation at a time, until I was the last item on a list he never got to the end of.",
      "And it's all still here. Every bit of it. It got on the plane with us and it has been in this room all week.",
      "So: I'm in love with him. Not the memory of him. This one — the one through there getting ice, who has spent four days looking at me like I'm the reason he came.",
      "At least this version. I've written that and I'm leaving it in, because it's two in the morning and this book gets the true thing. I don't know yet whether this is who he is or who he can be for seven days.",
      "I know which one I'm about to bet on.",
    ],
  },
  {
    id: "mexico-the-last-night",
    dateline: "Seven days away — the last night, and I don't want to go home",
    place: "mexico",
    about: ["luna", "josh"],
    sceneSlug: "luna-josh-beach",
    access: "premium",
    mature: false,
    body: [
      "I was wrong. Writing that first, because I said I would.",
      "He put his phone in the safe on the first morning and never mentioned it once. Not as a gesture, not as a thing I was supposed to notice — he just put it away and left it there for six days. I noticed on the third day and did not say anything either.",
      "Whatever we were carrying, we put it down at the airport and neither of us went back for it. I keep waiting for the sentence where one of us picks it up again and it hasn't come.",
      "And he looked at me. That is all it is, in the end. He looked at me and he waited for the ends of my sentences and he laughed at the thing I said about the man with the pelican, and today he took me down to the water and we stayed in it until the light went, and there was nothing else he was doing, nowhere else he was.",
      "This is the man I met. He was in there the whole time. I don't think he went anywhere — I think we just stopped making room for him.",
      "So this is what it is supposed to be. I have it now in my own handwriting, which means it is not something I invented when I was twenty-eight and have been comparing him to unfairly ever since.",
      "We go back Thursday and I am taking this with me.",
      "I want to remember it exactly. In case I need it.",
    ],
  },
  {
    id: "the-part-i-forgot",
    dateline: "Three weeks in",
    place: "farmhouse",
    about: ["josh"],
    access: "premium",
    mature: false,
    body: [
      "The shop takes him at six and gives him back at eight, and the farm takes what's left, and I know all of this because I lived it for a decade.",
      "Tonight he fell asleep in the chair before I'd finished telling him about my day. Not unkindly. He just wasn't there for the end of it.",
      "It is week three. I remember week three. I remember it going like this the first time, only slower, and I remember telling myself the same thing I am about to write down here, which is that he is tired and it is a busy season and this is not the same.",
    ],
  },
  {
    // The second free one. Also PG-13, also about an absence rather than an
    // event — and it does the thing the free pages are supposed to do: it is
    // warm right up until the third paragraph, which is where the story is.
    id: "the-quiet-after",
    dateline: "Sunday, and neither of us has said anything",
    place: "farmhouse",
    about: ["luna", "josh"],
    clipId: "morning-after",
    access: "premium",
    mature: false,
    body: [
      "Neither of us has said a word all morning and it isn't awkward. That's the bit I want to look at.",
      "Ten years buys you that. You can be in a room with somebody and not have to perform being in a room with them. He made the coffee, I read, and neither of us was working at it.",
      "And here is the part I don't like. I could not tell you whether that is intimacy or whether we have both just stopped bothering. From the inside they are identical. They were identical the first time too, right up until the day I noticed they weren't.",
      "I'm going to put this down and go and sit with him and not find out.",
    ],
  },
  {
    id: "two-kinds",
    dateline: "Late, and nobody is asking me this",
    place: "farmhouse",
    about: ["luna", "josh", "tyson"],
    access: "premium",
    mature: true,
    body: [
      "Nobody has asked me this, so I am going to ask myself and answer honestly, once, and then put the book away.",
      "With Josh I never know what is coming. He decides and the room changes and I go with it, and there is a part of me that has been chasing that feeling since long before I met him. It is not comfort. It is closer to standing near an edge. I like it. I have always liked it, and I have never entirely trusted that about myself, and there are nights now when the same thing that thrills me is the thing making my heart go before I've worked out why.",
      "With Tyson — and I have thought about this more than I will ever admit to another living person — it would be the opposite of an edge. Twenty years of knowing exactly who somebody is. Being looked after without having to ask, or explain, or perform. Safe. Familiar. Not one thing about it unknown.",
      "And the humiliating part is that I want both. Not one and then the other. Both.",
      "So which one am I? The woman who goes towards the drop, or the woman who is loyal to the person who has never let her fall? Because I have been both my whole life and I have never had to pick before.",
    ],
  },
  /*
    WHAT HE WAS, written to Melissa's brief of 2026-08-19: Luna on her and
    Tyson through the six months — the talking, the arguments, the panic
    attacks, his patience, her stubbornness — set down NOW, while she is back
    with Josh and Tyson has started going quiet without being gone.

    PLACED HERE ON PURPOSE, between `two-kinds` and `distance`. `two-kinds`
    ends on her asking which woman she is; this answers it by remembering what
    he actually did; and then `distance` shows him withdrawing, which costs
    more having just been told what is being withdrawn.

    CANON, and it took two passes to land (Melissa, 2026-08-19 and 08-20).
    LUNA IS PRONE TO PANIC ATTACKS. She had SMALL ones when she was young and
    Tyson knew about those. They got much worse across the Josh years and
    worse again with the breakup, and for the last two years she has had them
    PRIVATELY — Tyson did not know they had come back, and Josh knows she is
    like this without having seen what they became.

    So there are two separate facts and they are easy to collapse into one:
    who knows she is prone (both men), and who has ever been in the room
    (Tyson, once, on the bathroom floor at week two — `i-picked-up`).

    The first draft of this entry had Tyson discovering it during the six
    months by noticing, which was invented to protect a line in `the-bad-one`
    ("nobody in my life knows this about me. Ten years and Josh has never seen
    one"). That line was itself wrong, and it has been rewritten rather than
    written around — see the note above `the-bad-one`. Inventing a secret to
    keep a mistaken sentence standing is how a story quietly acquires canon
    nobody chose.

    So this entry is about what he DOES with knowing, not about him finding
    out, and it sets the asymmetry beside it: Josh knows and is never the one
    called. That is the thing she is actually circling. It leaves room for
    luna-truck-breakdown ("Breathe"), which comes later and is the night she
    finally drives to him.

    DRAFT PROSE, written to the brief — not delivered by her, unlike
    `asking-for-less`. Replace it.
  */
  {
    id: "the-six-months",
    addedOn: "2026-08-19",
    dateline: "Before I forget what it was actually like",
    place: "farmhouse",
    about: ["luna", "tyson"],
    sceneSlug: "ty-luna-six-months",
    access: "premium",
    mature: false,
    notes: ["panic"],
    body: [
      "Tyson is going. Not gone — going. He still comes when I ask, he still answers on the second ring, he still does the thing he came up to do. But there was a version of him who stayed for another coffee afterwards, and that one has not been in this kitchen in a month.",
      "So I am going to write down what those six months were actually like while I can still do it accurately. I know what I am. Give me a year and I will have tidied the whole thing into something smaller and easier to carry.",
      "We talked more in six months than most people manage in a marriage. Not about him — he does not do that. About everything else, and about me, endlessly, at hours no reasonable adult is awake. I would go round the same three sentences four times in a night and he never once said you have already told me this.",
      "And we fought. He does not raise his voice, which is genuinely infuriating, because it means I am always the only person in the room shouting. He would say the true thing instead of the kind one, and I would take it as an attack because that was easier than taking it as information, and then I would say something built to land. It landed every time. He would sit there and let it.",
      "I was not easy. I want that in my own handwriting. I turned down help for a fortnight out of pure pride and then rang him at one in the morning, and he came, and he has never once made me apologise for the fortnight.",
      "He knew about the small ones from when we were young, in the vague way you know a thing about a friend. He did not know what they had become — I made sure of that for two years and I made sure of it well — and he found out in the first fortnight, on a bathroom floor, with no warning and no version of it I had prepared. He has never once let me feel caught.",
      "After that he simply took it on. No conversation, no plan, nothing said out loud that either of us would have to acknowledge in daylight. He does not ask whether I am all right; he can see whether I am all right, and he has not said the word attack to my face once in six months.",
      "Josh knows I am like this. Ten years, of course he does. What he does not know is what the last two of them looked like, because I arranged for him not to, and I have never let myself write down whether that was a kindness I did him or a verdict I passed on him.",
      "He never told me to calm down. Not once, not ever, and if you have had one you will know exactly what that is worth. He got down on the floor with me and put my hand flat on his chest so I had something to copy, and then he talked about nothing whatsoever — the boat, a gearbox, a dog he had when he was nine — in that flat voice, until my breathing gave up arguing and went along with his.",
      "Twenty minutes, some nights. Over an hour, once. He never looked at his watch and he has never mentioned it since, to me or to anybody, and I would know.",
      "That is a thing a person learns somewhere. I have never asked him where.",
      "And here is what I could not see at the time, because you do not stop to study the man holding you up while you are going under. He did every bit of it as somebody who was not allowed to want anything. Six months of keeping me alive, and he never once put his thumb on the scale.",
      "Now I am back with Josh, and Tyson has gone quiet, and I have spent three weeks presenting those to myself as two unrelated facts.",
      "They are not two unrelated facts. I have known it since about the second week and I have been carefully not knowing it, and I am writing it down so that I cannot go on not knowing it.",
      "I do not know what you are meant to do with a debt like that. I know what I have been doing with it, which is nothing.",
    ],
  },
  {
    id: "distance",
    dateline: "Walking back up the road",
    place: "farmhouse",
    where: "The farm road",
    about: ["tyson"],
    sceneSlug: "ty-luna-farm-road",
    access: "premium",
    mature: false,
    body: [
      "He left the truck at the bottom and walked up, which added twenty minutes and gave neither of us anything to do with our hands.",
      "He's been up here twice this month. It used to be twice a week. He does the gate, he does the fence line, he says the right amount, and he leaves before there's a gap in it big enough for anything to get through.",
      "We talked about the weather coming in. Underneath every sentence was the sentence, and we both let it stay under.",
      "He isn't punishing me. I know him well enough to know the difference. He's protecting something — and I am fairly sure it isn't himself.",
    ],
  },
  {
    id: "out-at-the-lake",
    dateline: "Out at the water",
    place: "lake",
    where: "The dock",
    about: ["tyson"],
    // sceneSlug: "ty-luna-lake-fight" — restore when the recut scene is back.
    access: "premium",
    mature: false,
    body: [
      "Far enough out that nobody could hear, which is how I knew we had both come to say it.",
      "Neither of us did. Twenty years of being able to finish each other's sentences and we stood on that dock in the rain finding other ones.",
      "He said one true thing: that I lied to him, and that he'd have taken any answer except that one. I said one true thing back, which was that I knew.",
      "Then we went in out of the rain and talked about the boat. THE BOAT. I want that written down, because if this ever ends up being the night everything turned, I don't want to remember it as anything more dignified than that.",
    ],
  },
  {
    id: "last-call",
    dateline: "Home from the bar, and I'm not going to sleep",
    place: "bar",
    about: ["tyson"],
    sceneSlug: "luna-tyson-bar",
    access: "premium",
    mature: false,
    body: [
      "He said he'd been noticing me.",
      "That is not what he said. What he said was about four words long and it was about something else entirely, and anybody at the next table would have heard nothing at all. But that is what he said, and he knew it when he said it, and he watched me to see whether I'd caught it.",
      "I caught it.",
      "Twenty years of a man who does not waste words, and tonight he was rationing them. Two, three words at a time. Long gaps. And in the gaps he just looked at me — not quickly, not the way you glance at a friend across a table, but properly, for slightly too long, and then he did not look away when I noticed. He let me have it. He wanted me to have it.",
      "I know his silences. I have twenty years of them cataloged — the one when he's angry, the one when he's working something out, the one he uses to make you crack. This was a new one. This was a man holding a thing down with both hands and letting me see the effort.",
      "So I sat in a bar too loud to talk in, and had a conversation that never happened, and understood every word of it.",
      "I am not stupid. Whatever else I am at the moment, I am not that.",
      "Something is happening.",
    ],
  },
  {
    id: "reading-it-back",
    dateline: "The next day, still on it",
    place: "lakehouse",
    about: ["luna", "tyson"],
    access: "premium",
    mature: false,
    body: [
      "Ran it back all day like a tape. Every gap. Every look. Testing it for other explanations, because I have been wrong before and there is a version of this where I am a woman inventing something to survive on.",
      "It doesn't come apart. I have taken it apart eleven times and it holds.",
      "And here's the thing I actually can't get past: he has been building a field between us for weeks. He comes up, does the gate, says the right amount, leaves. That's deliberate — that is a man managing something.",
      "So last night wasn't a slip. He drove home after. He had the whole way there to decide not to, and he did it anyway.",
      "Which means either he has stopped being able to hold it, or he has decided I should know and cannot make himself say it in a sentence I could quote back to him.",
      "Knowing him, both.",
    ],
  },

  /* ---------------------------------------------------------- it turns ---- */
  {
    id: "he-asked-about-tyson",
    dateline: "He asked about Tyson tonight",
    place: "farmhouse",
    where: "Our bedroom",
    about: ["josh", "tyson"],
    sceneSlug: "luna-josh-bed",
    access: "premium",
    mature: true,
    notes: ["control"],
    body: [
      "Josh asleep beside me, breathing the way he has breathed next to me for ten years, and I lay there running a two-minute conversation on a loop.",
      "How often does Tyson come up here. Said lightly, at the sink, not looking at me. And I heard myself do the arithmetic before I answered — not the truth, the number that would land best — and that is a thing I have never had to do in this house.",
      "He is his cousin. He has been on this farm since before I was on it. There is no version of that question that is really about the gate.",
      "I want to be clear with myself, since this book is the only place I'm allowed to be: nothing has happened. I am not writing a confession. I am writing down that I have started keeping track of what I don't mention, and the list is now long enough to be its own kind of work.",
    ],
  },
  /* ------------------------------------------------- the night with Casey ---
   * PLACED HERE on purpose. It only works once she has admitted to herself
   * what Tyson is to her (last-call, reading-it-back) and once Josh has
   * started asking about him — a woman who had not yet worked out her own
   * feelings would have had no reason to care who Casey was. It reads as
   * jealousy because by this point it is.
   *
   * The dateline deliberately echoes last-call's "Home from the bar". Same
   * bar, same walk home, and the difference between the two nights is the
   * whole point: that one she came home understood, this one she came home
   * having been the problem.
   *
   * MOVE IT if Melissa's chronology puts the fight with Josh somewhere else —
   * the order is the story and this is my inference, not her instruction.
   */
  {
    id: "your-date",
    dateline: "Home from the bar again, and this one is mine",
    place: "bar",
    about: ["tyson", "casey"],
    sceneSlug: "luna-tyson-casey-bar",
    access: "premium",
    mature: false,
    body: [
      "I said it like a line. I even left a gap before it, so it would land. I'll let you get back to your date.",
      "I had been in there about two hours before any of this. Josh and I had it out again and I could not be in that house, and the bar is where I go, so that is where I went. That is the honest order of it. I did not go there looking for Tyson.",
      "But I was pleased when he walked in. For about four seconds I was so pleased I nearly stood up. Then I saw who came in behind him.",
      "Her name is Casey. She's a friend from the track. That is what he told me, and it is almost certainly the truth, and I decided it was a lie somewhere around the second time he said it.",
      "Here is the part I want on the page while I still think it, because tomorrow I will have talked myself out of it: I was not angry that she exists. He is allowed people. I was angry that I had never heard her name. Twenty years. I know which corner at the track he hates. I know what he calls the man who services the car. And there is a woman he sees out there often enough to bring to our bar, and in twenty years the name has never once come up.",
      "That is not nothing. He kept her separate. I would like to know why, and I would like to have asked it in a way that got me an answer.",
      "Instead I asked it like that.",
      "And then he worked out how long I'd been sitting there. He didn't say it unkindly — four words, no edge on them, the way he says everything. I have never wanted to throw something at him before tonight.",
      "Because the moment he said it, everything I'd said stopped counting. That is the trick of it. You can be right about a thing and be drinking at the same time, and only one of those gets discussed.",
      "I know what I sounded like. I'm not going to sit here and pretend I don't.",
      "He hasn't done anything. That's where I keep arriving and then walking away from. He hasn't done a single thing wrong. He is allowed a whole life I am not in — he is supposed to have one, he doesn't belong to me, I am not even—",
      "I'm not finishing that sentence.",
      "I'll apologise tomorrow. I'll do it badly.",
    ],
  },
  /* ------------------------------------------------------- the car park ---
   * THE SAME NIGHT, TWO HOURS LATER, and it is new canon (Melissa,
   * 2026-08-26) rather than an inference. What happens after `your-date`:
   * Tyson and Casey leave, LUNA STAYS, and she drinks bourbon on her own until
   * closing. Cole watches her the whole time and rings Tyson when she walks
   * out, because she is about to drive. Cole is never on camera, here or in
   * the scene.
   *
   * SHE KNOWS IT WAS COLE (Melissa, 2026-08-26, correcting the first draft of
   * this entry, which was built on her not knowing). It is his bar, she has
   * met him at birthdays and barbecues for years, and she knows he and Tyson
   * were SEALs together — all of which was already in the character canon and
   * none of which the entry was using.
   *
   * That is a better page. A mystery about who made the call is a small thing
   * and she would have solved it before breakfast anyway; knowing exactly who
   * did it, and being unable to be angry with him because he was right, is the
   * thing that actually keeps somebody awake.
   *
   * WHAT IT UNLOCKED — the line the entry is built on now. Cole rang TYSON. He
   * did not ring the man she lives with. She notices, and she cannot say it to
   * anybody, and it is the first time somebody else's instinct has told her
   * what she and Tyson look like from outside.
   *
   * AND IT RHYMES WITH THE FIRST HALF OF THE NIGHT. `your-date` is her finding
   * out there is a woman she had never heard of. This is her working out that
   * Cole has the ten years Tyson was away serving — a version of him she does
   * not have and never will. Twice in one night, the same wound.
   *
   * WRITTEN THE NEXT DAY, not that night. She was in no state, and a page that
   * admits most of the night is missing is truer than a lucid one.
   *
   * IT STOPS AT THE TRUCK, and as of the extended cut (2026-08-26, same
   * evening) that is no longer the end of the night. The scene now carries on
   * past the drive: they arrive somewhere, there is an argument on a sofa, and
   * it ends with the two of them inches apart. This page ends on "He didn't
   * ask me anything. He just drove."
   *
   * LEFT THAT WAY ON PURPOSE, and it needs to stay a decision rather than
   * become an oversight. A woman who writes down the whole humiliation in
   * detail and stops dead at the hour that actually frightened her is exactly
   * this character — she refuses the page for the wall, too. But Melissa
   * should decide whether the entry acknowledges the gap or pretends there
   * isn't one, because those are different women.
   *
   * TWO WRINKLES THIS CREATES IN WHAT IS ALREADY PUBLISHED, both left alone on
   * purpose because each is a story decision with a scene attached:
   *
   *   `your-date` is headed "Home from the bar again" and reads as written
   *   after getting herself home. She did not get herself home.
   *
   *   `i-apologised` has her driving over the next day — but her truck spent
   *   the night in that car park, and how it got back to her is a beat
   *   somebody has to decide on rather than a detail to paper over here.
   *
   * Melissa's call, both of them. Flagged, not fixed.
   */
  {
    id: "cole-rang-him",
    addedOn: "2026-08-26",
    dateline: "The next day, and most of it is missing",
    place: "bar",
    about: ["tyson", "cole"],
    sceneSlug: "luna-ty-bar-drunk",
    access: "premium",
    mature: false,
    body: [
      "It was Cole who rang him. Of course it was Cole. It is his bar and he was standing behind it all night, and I have spent this morning trying to work up some feeling about that and getting absolutely nowhere.",
      "Because he was right. I had my keys in my hand. I want that written down while I still have the nerve for it, because by Thursday I will have this filed under a bad night and moved on.",
      "But he didn't come out and take them off me himself. He picked up a phone.",
      "And here is the thing I have been turning over since about six o'clock this morning, and cannot put down, and am not going to be able to say out loud to a single person alive.",
      "He rang Tyson. He did not ring my partner.",
      "A man watches a woman drink on her own for four hours, decides she should not be driving, and reaches for the phone — and the name he goes to is not the one she lives with. He didn't even think about it. That is what I keep arriving at. It was not a decision he had to make.",
      "So that is what we look like from the outside. Somebody who has known us both for years, with no stake in it and no reason to be clever, worked out who to ring in about a second and a half.",
      "And he has ten years of Tyson that I don't have. The ten years he was away — the ones where I got a phone call when he could manage one and no address to write to. Cole was there for all of that. He knows a whole man I have never met.",
      "Twice in one night. First a woman I had never heard of, then a man who knows the version of him I missed. I have spent twenty years being the person who knows everything about him and it turns out I know the part he is willing to leave lying around.",
      "I don't remember the middle of the car park. I remember being held up, which is not the same as being held, and I remember knowing the difference at the time and saying it out loud, which I imagine was a joy for him.",
      "I have been in that car park at the end of a night before. Laughing, both of us. I have never had to be collected from it.",
      "And nobody made me. That is where I keep landing. I picked the fight with Josh, I picked the bar, I picked the second half of that bottle, and then I stood in a car park being furious with the only man who came.",
      "He didn't ask me anything. He just drove.",
      "I keep coming back to that, and I still can't tell whether it was kindness or whether he has simply stopped asking.",
    ],
  },
  /* ------------------------------------------------ the apology, next day ---
   * PREMIUM, and the other half of `your-date` — she ends that entry saying
   * she will apologise tomorrow and do it badly, and an unkept promise in a
   * diary is a loose end.
   *
   * TYSON SAYS ALMOST NOTHING, deliberately. Anything he explains about Casey
   * here becomes canon about Casey, and she is four hours old; keeping him to
   * two words is both truer to the man and leaves Melissa's hands free.
   */
  {
    id: "i-apologised",
    dateline: "Did it badly, as advertised",
    place: "lakehouse",
    about: ["luna", "tyson", "casey"],
    access: "premium",
    mature: false,
    body: [
      "Apologised. Did it badly, exactly as forecast.",
      "I had the whole thing ready in the truck on the way over. Measured, adult. One sentence about the drinking, one about the tone, and nothing whatsoever about Casey, because Casey was never the point and I had known that since about six in the morning.",
      "What came out was that I was out of order, and that I don't like not knowing who she is.",
      "Which is the true version, and the one I had specifically decided not to say.",
      "He let it sit there a while, which is how that man tells you that you were right about yourself. Then he said it's fine. Two words. He meant them, and that made it worse, because I had driven over wanting him to be annoyed with me. If he had been annoyed we could have had it out properly and I would have something to push against. Instead he was kind and I drove home feeling precisely as small as I had earned.",
      "Here is the thing I did not say and am not going to.",
      "I wasn't asking who she is. I was asking what I am.",
      "Which is a question I have no business putting to a man I am not with, about a woman he has done nothing with, at the end of a night I started by drinking on my own because of a man I am with.",
      "I know. It's in the book now, so I can't pretend tomorrow that I didn't.",
    ],
  },
  {
    id: "the-window",
    dateline: "The city, very late, and I should be asleep",
    place: "downtown",
    where: "The window",
    about: ["luna", "tyson"],
    clipId: "apartment-window",
    access: "premium",
    mature: true,
    body: [
      "We were talking about nothing. Whether he should sell the bike. Whether I should cut my hair. The conversation you have when you have both decided not to have the other one.",
      "And then there was a gap in it, and I knew exactly where he was standing without looking, and he knew that I knew, and neither of us filled it. Twenty years of filling every silence between us and we let that one sit there.",
      "He said my name. Just that. Not a question and not the start of a sentence — he said it the way you put something down carefully because you have decided not to carry it any further.",
      "I said what. He said nothing. Then he said he should go, and he went, and I stood at that window for a long time afterwards being a person I do not particularly want to be.",
      "Here is what I am not writing down: what I would have said if he had stayed another ten seconds. I know the answer. I have known it for months. I am not putting it in my own handwriting, because as long as it isn't on paper I can still be somebody who never said it.",
    ],
  },
  /* ------------------------------------------------------ three days away ---
   * PREMIUM. Josh's possessiveness, written as the thing it feels like from
   * inside rather than as an incident — no shouting, nothing quotable, a man
   * who misses her. It is placed in the run where canon has jealousy turning
   * into control, and it uses her work as the pressure point because the work
   * is the one part of her life with nothing of his in it (see `the-work`).
   *
   * The last line is the whole entry: she does not catch him doing something,
   * she catches herself having already changed.
   */
  {
    id: "the-job",
    dateline: "Three days in the city, and the phone did not stop",
    place: "downtown",
    about: ["luna", "josh"],
    access: "premium",
    mature: false,
    notes: ["control"],
    body: [
      "Three days of work. Booked eight weeks ago, in the diary he looks at, on a job he called good news at the time and meant it.",
      "He rang at seven. Then at ten. Then at half eleven, and when I didn't pick up — because I was standing on a mark with three people around me and my phone in another room — he rang the hotel.",
      "Not angry. I want that written down, because it is the whole difficulty. Not once angry. Warm. Funny about the traffic. Asking how the shoot went and actually listening to the answer.",
      "And by the third day I had started checking the time before I did anything.",
      "That is the bit I have only just noticed, and I have had to sit down about it. Not that he called. That I have begun arranging my day around the next one, and nobody asked me to, and if I described any single one of those calls out loud it would sound like a man who misses his girlfriend.",
      "Nine weeks ago this job was good news. It is the same job.",
      "I got dressed this morning and thought about what he would make of it. I am two thousand miles from him and he was never going to see it.",
    ],
  },
  {
    id: "the-park",
    dateline: "The park, and he wouldn't look at me",
    place: "park",
    about: ["luna", "tyson"],
    sceneSlug: "tyson-park-fight",
    access: "premium",
    mature: false,
    body: [
      "He agreed to meet me. Drove out there, parked, walked over, and then stood in front of me and said nothing for what I am fairly sure was twenty minutes.",
      "I talked. I asked him what was wrong. I asked him what I'd done. I asked him to look at me — out loud, more than once, in a public park like a woman losing an argument with herself — and he would not do it. He looked at the water. He looked at the ground. He had his jaw set in a way I have never seen on him in twenty years and there was something in his face I could not read at all, and I have been able to read that man since we were teenagers.",
      "Why agree to come if you aren't going to speak. What is the point of driving out here to stand in front of me being a wall.",
      "How can one person be that stubborn and that kind at the same time. Because he was still being kind — that's the maddening part. He wasn't punishing me. Whatever he was doing was costing him more than it was costing me and I could see it going through him.",
      "And then he said it. Eight words. He said: you're standing here, and I can't do anything about it.",
      "That's all. He didn't explain it, he didn't take it back, he didn't wait to see what I'd do with it. Eight words with a whole life underneath them.",
      "That is Tyson. Nothing, nothing, nothing, and then one sentence you'll be carrying around for a year. He'll stand in front of you and try to crack you with silence, or he'll hand you three syllables and let you do the rest of the work yourself, and either way you come away knowing exactly what he meant and unable to prove a word of it.",
      "It was the truth. It was the truth with vagueness draped all over it so that neither of us would have to be the one who said it.",
      "And I couldn't do it either. That's the part I have to write down. I stood there wanting one straight sentence from him — just tell me, say it plainly, say it so I don't have to guess — and the entire time I had my own, ready, sitting behind my teeth.",
      "I can't say mine until he says his. He can't say his until I say mine.",
      "So we stood in a park and said almost nothing and both of us went home knowing.",
    ],
  },
  {
    id: "on-paper",
    dateline: "Our bed, and I'm writing it down anyway",
    place: "farmhouse",
    where: "Our bedroom",
    about: ["luna", "tyson"],
    access: "premium",
    mature: false,
    body: [
      "I'm in love with Tyson.",
      "There. I said it. Not out loud — I am never saying it out loud — but it is on paper now, and paper counts. I think that might be the entire reason I keep this book.",
      "Nobody needs to know that. I didn't want to know that. I have spent months arranging my own head so that I wouldn't have to, and it turns out you can only do that for so long before the arranging is itself the thing that gives you away.",
      "How he feels: no idea. Still. After the bar, after the park, after eight words in a public place that I have been carrying around like a stone in my pocket ever since.",
      "He won't talk. I have pushed. I have pushed harder than I have ever pushed that man about anything in twenty years — and he is ex-military and I am a woman with a notebook, so I am fairly confident I will die of old age before he cracks.",
      "Unless he cracks. Who knows. That is exactly the problem: I don't know, and he knows I don't know, and he is letting it sit there anyway.",
      "That's the part I can't forgive this week. He's dangling it. He has put a true thing out where I can see it and will not hand it over, and I don't believe for a second that he's being cruel, and it is torture regardless.",
      "How does somebody make you see a thing that is invisible to both of you? He's managed it. I have never known anything so clearly in my life and I could not produce one shred of evidence for it in front of another human being.",
      "And I am with Josh. I am in this bed, in this house, with that man asleep beside me, writing this down.",
      "So what do I even want. If Tyson said it plainly tomorrow — said it in a sentence, no gaps left for me to fill in — what would I actually do?",
      "I don't know. I don't know. I want him to say it and I have no idea what I would do with it, which probably makes me the worst person in this whole situation.",
      "All I have got is this: I have not stopped thinking about him. Not for one full day. Not since the park.",
      "It's not okay. None of it is okay. I am so bad at this.",
    ],
  },
  /* ------------------------------------------------ the gap Avery leaves ---
   * PREMIUM, and it only works here — after `on-paper`, where she writes down
   * that she is in love with Tyson. Before that entry she has nothing to
   * nearly-say.
   *
   * Canon (2026-08-04): Avery does not ask how she is and never has. She calls
   * and talks about nothing until Luna is laughing, and then waits. The free
   * entry `avery-called` is that method working. This is the same method not
   * working, which is a different and better scene.
   */
  {
    id: "nearly-told-avery",
    dateline: "She left the gap and I didn't take it",
    place: "apartment",
    about: ["luna", "avery"],
    access: "premium",
    mature: false,
    body: [
      "She did the thing again. Forty minutes of nothing — a man at her work, a dog she has decided she is going to steal, a story about a patient with every identifying detail sanded off — until I was laughing properly.",
      "And then the pause.",
      "She never asks. That's her entire method and she has been running it on me since she was about nineteen: she doesn't ask, she just stops talking at exactly the moment I could say something, and waits to find out whether I will.",
      "I had it in my mouth. All of it. That I am in love with a man who has been my best friend since before she could read.",
      "I said the fridge is making a noise.",
      "And she let me have that too, which is somehow worse. She didn't push. She said which noise, and we did four minutes on the fridge, and she knew exactly what had just happened and let it go past like weather.",
      "Why I didn't say it, honestly, since this is the only place I have to be honest: because on this page it is a thing I think, and out loud to Avery it is a thing that is true in the world.",
      "And because she would tell me to leave. Not cruelly — she'd say it once, in a completely ordinary voice, the way she says everything. And then I would have to live in a world where somebody had said it out loud, and I am not ready for that world, and I would like it noted that I know exactly how that sentence sounds.",
    ],
  },
  {
    id: "the-shape-of-it",
    dateline: "Late, and he's still up",
    place: "farmhouse",
    about: ["josh"],
    sceneSlug: "luna-josh-house",
    access: "premium",
    mature: true,
    notes: ["control"],
    body: [
      "My phone was face-down on the counter and it is now face-up, and I know that I left it face-down.",
      "The first time around he never once asked me where I'd been. I used to take that as trust. I am no longer certain what it was, but I know what this is, because it has a shape and the shape is getting more familiar every week.",
      "He was not like this. That's the sentence I keep starting. He was not like this — and then I have to be honest about which parts are new and which parts were always there with the volume down.",
      "I am not frightened of him. I want that on the page in my own handwriting, in case I read it back later and disagree with myself.",
    ],
  },
  {
    id: "still-water",
    dateline: "Late, alone",
    place: "farmhouse",
    where: "The bathroom",
    about: ["luna"],
    sceneSlug: "luna-bathtub",
    access: "premium",
    mature: true,
    body: [
      "Candles, because the overhead light is honest and I wasn't up to it.",
      "An hour in there. For the first forty minutes I thought about both of them, and for the last twenty I didn't think about either of them, and those twenty are the only rest I have had in a month.",
      "Note for whoever I turn out to be after this: it was possible. Even in the middle of it. That's worth knowing.",
    ],
  },
  {
    id: "the-sentence",
    dateline: "Alone, and I've been carrying this about a month",
    place: "lakehouse",
    about: ["luna"],
    clipId: "said-out-loud",
    access: "premium",
    mature: true,
    body: [
      "I have been carrying a sentence around for about a month and tonight I said it out loud in an empty room to find out what it sounded like.",
      "It sounded true. That is the whole problem.",
      "It is not a nice sentence and it is not the version of me I would like to be. It has his name in it and it is not about friendship, and it is not the name of the man I live with.",
      "I am not writing it here, and I know exactly what I am doing by not writing it. As long as it is not in my own handwriting I get to stay a person who never said it, and I would like to keep that for a little longer.",
      "What I will put down is this: I said it, the room did not fall in, and I have been a different person for four hours.",
    ],
  },
  {
    id: "day-by-day",
    dateline: "No date, I've lost track",
    place: "farmhouse",
    about: ["luna"],
    access: "premium",
    mature: false,
    body: [
      "Sad in the morning. Angry by about four. By the evening I am mostly just tired and slightly amazed at how much a person can feel in one day about a situation that hasn't moved an inch.",
      "I have stopped trying to think it through. Every time I think it through I arrive somewhere different, and I have started to suspect the thinking is the problem — that I am a woman looking for an answer in a situation that doesn't have one yet.",
      "So: today. Just today. Get through today and see what today wants to be.",
      "Whatever is meant to happen is going to happen whether or not I sit up at two in the morning arranging it in my head. That is either wisdom or it is the most convenient thing I have ever told myself, and honestly, at the moment, I'll take either.",
      "I am not lost. I am somewhere, and I don't know where it is yet. Those are different.",
    ],
  },
  /* ---------------------------------------------------- the four versions ---
   * PREMIUM. Distinct from `day-by-day`, which is her internal weather; this
   * is the performance she runs on everybody else, and it ties the family
   * entries and the work entry into one place.
   *
   * The last line is the point of it: the person who would notice is the one
   * she is lying to about the one thing.
   */
  {
    id: "the-version-i-give",
    dateline: "The one I hand people",
    place: "farmhouse",
    about: ["luna"],
    access: "premium",
    mature: false,
    body: [
      "There are four versions of this in circulation and I wrote every one of them.",
      "Mom gets busy, tired, fine. Avery gets a bit more because she can hear it anyway, but still nothing with a name attached. The women I work with get a funny version, in which Josh is a character and the farm is charming and I am somebody with an interesting life.",
      "Tyson gets nearly all of it. Which is its own problem, given the one thing I keep from him is the thing that is about him.",
      "And this book gets the rest, and the book is the only reason I can run the other four without going mad.",
      "I used to think that made me a liar. I have decided it doesn't, quite — everybody edits. What bothers me is how good I have got at it. I can do the fine voice now while thinking about something else entirely, the way you drive a road you know.",
      "Here's the test, and I already don't like the answer. If all four of them compared notes tonight, would any of them recognise the same woman?",
      "Mom would say she's tired. Avery would say something is wrong. Work would say she's great, honestly, great. Tyson wouldn't say anything at all.",
      "He'd just get in the truck.",
    ],
  },
  {
    id: "what-im-deciding",
    dateline: "Back at the firepit, on my own",
    place: "lakehouse",
    where: "The firepit",
    about: ["luna", "josh", "tyson"],
    access: "premium",
    mature: false,
    body: [
      "Same chairs. Same wood pile. I built the fire myself and made a worse job of it than he does, and sat in his chair on purpose to see what it would do to me.",
      "Let me set it down plainly, because I have been avoiding the plain version for weeks.",
      "I love Josh. Ten years of him, the good and the flat stretches, and when he is the man he was at that dinner there is nowhere else I want to be. I am also keeping a list of the things I don't tell him, and that list started the week he came back.",
      "And I love Tyson. I have loved him for a while, probably longer than the six months, and I have never said it, and he has never said it, and now he is putting a field between us every time he comes up here — and I am fairly sure he is doing it because he does not trust himself in the same room as me any more.",
      "So: do I leave. Do I tell him. Do I tell him and stay. Do I say nothing and let both of them go on being half-answered.",
      "The lake was moving tonight. Wind off the far shore. I don't think it means anything. I'm writing it down anyway, because the last time I sat out here it was completely still, and I want the record to show that things move.",
    ],
  },

  /* --------------------------------------------------------- the drive ----
   * The hinge. Everything above is her deciding; this is the night the
   * deciding stops being hers to do slowly. It sits last in "it turns" and
   * immediately before the lakehouse, because the scene ends with Tyson
   * telling her that is where they are going — which is where "much later"
   * opens.
   *
   * SHE STILL DOES NOT SAY WHAT JOSH DID, and it now takes one reason rather
   * than two. It used to be partly because the fight was unwritten canon;
   * that closed on 2026-08-05 — it is the wall, and it is on screen in full
   * as "The Way You Looked at Him" (josh-luna-wall). So the prose did NOT
   * change, because the remaining reason was always the real one: she gets
   * three words out on screen and stops, and she refuses the page here the
   * same way she refused it in "the-sentence". That is character.
   *
   * If anything, it is stronger now. A reader who has watched the wall knows
   * exactly what she is not writing down, and the withholding stops being a
   * gap and becomes a person unable to put a sentence to it.
   *
   * NOTES: still `control` and `panic`, still NOT `violence`, and now for a
   * cleaner reason than before — the assault has its own scene carrying
   * `strangling` and `coercion`. This entry is the morning after, not the
   * night, and tagging it as an assault would misdescribe what is on the
   * page.
   */
  {
    id: "the-drive",
    dateline: "The lakehouse. Not my choice — his",
    place: "lakehouse",
    about: ["luna", "josh", "tyson"],
    sceneSlug: "luna-truck-breakdown",
    access: "premium",
    mature: false,
    notes: ["control", "panic"],
    body: [
      "I drove to him with both hands on the wheel and told myself to breathe about four hundred times, and the record should show that it did not work once.",
      "I had nothing on. No radio, no window down. I have thought about why since and I think it was that I did not want anything in the truck that could be louder than my own head — I was trying to talk myself down, and you cannot do that over a chorus.",
      "It came in waves. I would get it back for about a mile — sit up, unlock my hands, do the counting — and then lose it again over nothing at all. A set of headlights. The sign for the exit. My arms would not stay where I put them. I kept moving them like there was somewhere better to be.",
      "I cried in the middle of it and then stopped, and stopping was worse, because it felt like evidence I was fine.",
      "I got as far as him and then I did not have to hold it any more, so I didn't. I have never done that in front of anybody. Not once in ten years, not even at the worst of it.",
      "He didn't ask me anything. He put his arms around me and said breathe — the same instruction I had been failing all the way there, except this time somebody else was doing the counting.",
      "I said I can't. He knew I did not mean the drive.",
      "Then I started a sentence about Josh and stopped three words into it, and I am going to stop three words into it here as well. I know exactly what I am doing by not writing it down. It is the same thing I did with the sentence, and that bought me about a month, and I do not expect this one to last as long.",
      "There is an entry a few pages back where I wrote that I was not frightened of him, and asked to be held to it if I ever read it back and disagreed. I am reading it back.",
      "He said we're going to the lakehouse. Not asked — said. Somebody made a decision for me tonight and it did not feel like being managed, and I am too tired to work out whether that is because it wasn't, or because it was him.",
    ],
  },

  /* ------------------------------------------------------ much later ---- */
  {
    id: "the-night",
    dateline: "Much later — and I need to write this down properly",
    place: "lakehouse",
    about: ["tyson"],
    // Filed to ty-luna-bed 2026-08-09. That scene is "Twenty years of not
    // saying it, and then a room with the light coming up in it" — this night,
    // from outside. It was the only scene with Luna in it and no entry beside
    // it, and the entry existed all along; nothing linked the two.
    sceneSlug: "ty-luna-bed",
    access: "premium",
    mature: true,
    body: [
      "It happened. I'm not going to be coy about it in my own book.",
      "There was no moment. That's the thing I want on the page. Twenty years and it did not arrive as a decision — we were in the kitchen arguing about something so small I genuinely cannot reconstruct it, and he stopped mid-sentence and looked at me, and I had a full second to step back and I did not step back.",
      "And it was not what I had spent months imagining, because what I had imagined was nervous. It wasn't nervous. It was the least nervous I have been with anybody in my life. He already knew everything about me. There was nothing to explain and nothing to perform and nowhere in the whole night that I had to be a version of myself.",
      "He kept checking. Not out loud — he wouldn't insult either of us like that. He just watched, the way he has watched me for twenty years, and adjusted, and I have never in my life been paid attention to like that.",
      "I cried afterwards. Not sad. He didn't ask why, he just stayed, which is the entire man in one sentence.",
      "It is four in the morning and he is asleep in my house and I have never felt safer or more certain that I have just made everything considerably worse.",
    ],
  },
  {
    id: "what-it-was",
    dateline: "The morning after that",
    place: "lakehouse",
    where: "The kitchen",
    about: ["luna", "tyson", "josh"],
    access: "premium",
    mature: true,
    body: [
      "He made coffee. Put the cups back in the wrong cupboard on purpose. Neither of us said one word about it and the whole kitchen was full of it.",
      "I keep waiting to feel like I did something wrong and what I actually feel is that I came home, and I do not know what to do with that, because I am supposed to be somebody's partner and I have a whole life sitting on the other side of that door.",
      "The truth, in the only place I'm allowed to have it: what I have with Josh makes me feel alive and half of that is fear, and I have been calling the fear passion for so long that I genuinely cannot separate them any more.",
      "What happened last night had no fear in it at all. Not one second.",
      "So now I know. That is the problem with finding out — you can't go back to the part where you were only wondering.",
    ],
  },
];

/* ------------------------------------------------------------------ query */

export function getEntry(id: string): JournalEntry | undefined {
  return journal.find((e) => e.id === id);
}

/** Entries written in a place, in story order. */
export function entriesInPlace(place: PlaceId): JournalEntry[] {
  return journal.filter((e) => e.place === place);
}

/** Entries about a person. */
export function entriesAbout(person: PersonId): JournalEntry[] {
  return journal.filter((e) => e.about.includes(person));
}

/** Entries sitting beside a scene, for cross-linking from /watch. */
export function entriesForScene(slug: string): JournalEntry[] {
  return journal.filter((e) => e.sceneSlug === slug);
}

/**
 * The lines the home page can quote, and where each one comes from.
 *
 * HAND-PICKED, not derived. `opening()` would give the first sentence of an
 * entry, and the first sentence is rarely the quotable one — the line that has
 * been on the home page for weeks is the fourth paragraph of `the-carrera`.
 *
 * Two rules, both load-bearing:
 *   FREE ENTRIES ONLY. The link under the quote opens the entry, and sending
 *   somebody from a beautiful sentence straight into a paywall is the bait
 *   MONETIZATION.md rules out.
 *   NO TURNS. Each of these aches without giving away a single event. A woman
 *   noting a good day because she expects to need the evidence later tells you
 *   everything about her and nothing about the plot.
 */
export const pullQuotes: { entryId: string; line: string }[] = [
  {
    entryId: "the-carrera",
    line: "First good day. Writing that down so I can find it later.",
  },
  {
    entryId: "the-last-box",
    line: "I keep waiting to be angry. What I am is tired, and underneath the tired is something I'm not writing down yet.",
  },
  {
    entryId: "he-called",
    line: "Six months of nothing and then his name on my phone at seven in the morning like no time had passed at all.",
  },
  {
    entryId: "coffee",
    line: "I hate that he can still do that, and I hate more that he knows he can.",
  },
];

/**
 * Today's quote.
 *
 * ROTATES BY THE DAY rather than per request, which is the deliberate reading
 * of "shuffle". A line that changes every time the page is drawn changes while
 * somebody is still reading it — they click into the journal, come back, and
 * the sentence that made them click is gone. A day is long enough to read a
 * sentence and short enough that a regular visitor never sees the same one
 * twice in a row.
 */
export function quoteOfTheDay(): { entryId: string; line: string } {
  const day = Math.floor(Date.now() / 86_400_000);
  return pullQuotes[day % pullQuotes.length];
}

/** The entries free to read, in story order — the journal's shop window. */
export function freeEntries(): JournalEntry[] {
  return journal.filter((e) => e.access === "free");
}

/** The first line, used as a card preview. */
export function opening(entry: JournalEntry, max = 110): string {
  const first = entry.body[0] ?? "";
  if (first.length <= max) return first;
  // Cut on a word boundary so the preview never ends mid-word.
  return `${first.slice(0, first.lastIndexOf(" ", max))}…`;
}

/** Places that actually hold entries, in taxonomy order. */
export function placesWithEntries(): PlaceId[] {
  const seen = new Set<PlaceId>();
  for (const entry of journal) seen.add(entry.place);
  return [...seen];
}
