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
 * ACCESS: about four in five entries are members-only, the split Melissa
 * asked for. The six that stay open are the shop window — the last box, Tyson
 * turning up in week two, the Carrera, Josh's call, the coffee, and the hour
 * in the bath. They establish the voice, the friendship and the premise
 * without giving away a single turn: a visitor can read them and know exactly
 * what they'd be paying for, which is her deciding what to do about it.
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
  /* ------------------------------------------------- five years in: Mexico ---
   * A FLASHBACK, and the only material in the journal that predates the
   * breakup — which is why it sits at the top rather than in sequence. The
   * journal now opens on the best week she ever had with him and then goes
   * straight to the last box going out the door.
   *
   * Both are FREE, per Melissa. They are the strongest free pages in the
   * product: a visitor reads them, likes Josh, and is then far more invested in
   * what the locked entries are about. Nothing is withheld here because nothing
   * needs to be — the whole point is that this week was good.
   */
  {
    id: "mexico-on-the-way",
    dateline: "Five years in — somewhere over the water",
    place: "mexico",
    about: ["luna", "josh"],
    access: "free",
    mature: false,
    body: [
      "He booked this himself. Not me — him. He booked it, paid for it, and told me on a Tuesday like it was nothing, and I have been turning that over since the taxi and I cannot get it to sit still.",
      "Because here is the part I would not say out loud to anybody: I don't know what we're going to be like when we get there. The last few months I have been talking to the back of his head. The shop takes him at six. I have got very good at having whole conversations with a man who is already thinking about a delivery.",
      "And a week away is an expensive way to find out whether two people still like each other. That is the fear. Not that we'll fight — we don't really fight. That we'll get there and it will be the same two people in a nicer room, and I will have to look straight at it with nothing to do all day but look.",
      "I am writing this down on the plane so that if it goes well I have to sit here afterwards and admit I was wrong. Which I would like to be. I would very much like to be wrong about this.",
    ],
  },
  {
    id: "mexico-the-last-night",
    dateline: "Five years in — the last night, and I don't want to go home",
    place: "mexico",
    about: ["luna", "josh"],
    sceneSlug: "luna-josh-beach",
    access: "free",
    mature: false,
    body: [
      "I was wrong. Writing that first, because I said I would.",
      "He put his phone in the safe on the first morning and never mentioned it once. Not as a gesture, not as a thing I was supposed to notice — he just put it away and left it there for six days. I noticed on the third day and did not say anything either.",
      "Whatever we were carrying, we put it down at the airport and neither of us went back for it. I keep waiting for the sentence where one of us picks it up again and it hasn't come.",
      "And he looked at me. That is all it is, in the end. He looked at me and he waited for the ends of my sentences and he laughed at the thing I said about the man with the pelican, and today he took me down to the water and we stayed in it until the light went, and there was nothing else he was doing, nowhere else he was.",
      "This is the man I met. He was in there the whole time. I don't think he went anywhere — I think we just stopped making room for him.",
      "So: a reset. That is what this week has been. We go back Thursday and I am taking this with me.",
      "I want to remember it exactly. In case I need it.",
    ],
  },
  /* ---------------------------------------------------- the six months ---- */
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
    access: "free",
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
    access: "free",
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
    access: "free",
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
    access: "free",
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
    access: "free",
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
