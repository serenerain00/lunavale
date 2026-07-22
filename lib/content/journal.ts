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
 * ACCESS: roughly four in five entries are members-only, which is the split
 * Melissa asked for. docs/monetization/MONETIZATION.md lists journals under
 * Vault Membership and the membership page sells "Luna's writing, in her own
 * words", so the bulk has to sit behind it or those claims stop being true.
 *
 * The four that are open were chosen to be worth reading on their own without
 * giving the plot away: the end of the ten years, Tyson turning up in week
 * two, the afternoon in the Carrera, and the hour in the bath. They prove the
 * writing is worth paying for. The turns — the lie, Josh already having told
 * him, the park — are the ones you buy.
 *
 * If you change a free/premium flag, keep that shape: open the entries that
 * show the voice, keep the ones that move the story.
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
  /** Paragraphs, in order. One entry fits one sheet of paper. */
  body: string[];
  access: AccessLevel;
  mature: boolean;
  /** See lib/content/content-notes.ts. Shown above the page. */
  notes?: ContentNoteId[];
}

export const journal: JournalEntry[] = [
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
    access: "free",
    mature: false,
    body: [
      "Diner at the bottom of the hill, same booth, and he ordered for both of us wrong on purpose, which is a thing we have been doing to each other since we were twenty-two and which has never once been funny to anybody else.",
      "That's the part I couldn't explain to Josh in ten years. It isn't the big things. It's that there is an entire language in this world that only two people speak, and I am one of them.",
      "He asked if I wanted to go up to the mountain when the snow comes. I said only if he stops pretending he isn't slowing down for me. He said he doesn't slow down for me. He slows down for the car.",
      "Twenty years. I have never had to be anybody in front of him.",
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
    access: "premium",
    mature: false,
    body: [
      "Six months of nothing and then his name on my phone at seven in the morning like no time had passed at all.",
      "Coffee. That was the whole ask. Not a speech, not an apology with a run-up to it — just coffee, and that old voice he uses when he already knows the answer.",
      "I said yes before I had decided to. I want that recorded honestly, because I am going to want to tell myself later that I thought about it.",
    ],
  },
  {
    id: "coffee",
    dateline: "After the coffee",
    place: "coffee-shop",
    about: ["josh"],
    sceneSlug: "luna-josh-coffee",
    access: "premium",
    mature: false,
    body: [
      "Somewhere public, in the middle of the morning, because both of us knew what we'd be like anywhere else.",
      "He has been paying attention. That's the part I wasn't ready for. He asked about things I mentioned once, two years ago, back when I had stopped believing he heard any of it. Six months on his own and the man has come back with his eyes open.",
      "And I sat there thinking: this is what I asked for. For ten years. And it arrived the moment I stopped asking.",
      "He suggested dinner. Tonight. I said yes to that as well.",
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
    sceneSlug: "ty-luna-lake-fight",
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
    dateline: "After the bar",
    place: "bar",
    about: ["tyson"],
    sceneSlug: "luna-tyson-bar",
    access: "premium",
    mature: false,
    body: [
      "Loud enough in there that you have to lean in to be heard, which is a thing bars know about themselves.",
      "He asked me a direct question. I gave him a true answer. I have been turning it over all the way home, because I could have given him a kind one instead, and I didn't, and he didn't flinch.",
      "There's a version of me that finds that unbearable. She wasn't out tonight.",
      "He drove me home and left the engine running the whole time I was getting out.",
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
  {
    id: "the-park",
    dateline: "After the park",
    place: "park",
    about: ["josh", "tyson"],
    sceneSlug: "tyson-park-fight",
    access: "premium",
    mature: true,
    notes: ["violence"],
    body: [
      "Open ground. Nowhere for either of them to put their eyes except on each other, and nowhere for me to stand that wasn't a side.",
      "The worst of it isn't what was said. It's that they have both clearly been carrying it long enough to have it ready.",
      "Tyson took it. Twenty years of that man and I have never seen him raise his hands to anything, and he stood there and took it, and I understood halfway through that he was doing it for me and that it would cost him more than being hit.",
      "I have spent months telling myself that keeping quiet was a way of protecting people. Today I watched what it protected.",
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
      "The first time round he never once asked me where I'd been. I used to take that as trust. I am no longer certain what it was, but I know what this is, because it has a shape and the shape is getting more familiar every week.",
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
      "Same chairs. Same wood pile. I built the fire myself and made a worse job of it, and sat in his chair on purpose to see what it would do to me.",
      "Let me set it down plainly, because I have been avoiding the plain version for weeks.",
      "I love Josh. Ten years of him, the good and the flat stretches, and when he is the man he was at that dinner there is nowhere else I want to be. I am also keeping a list of the things I don't tell him, and that list started the week he came back.",
      "And I love Tyson. I have loved him for a while, probably longer than the six months, and I have never said it, and he has never said it, and now he is putting a field between us every time he comes up here — and I am fairly sure he is doing it because he does not trust himself in the same room as me any more.",
      "So: do I leave. Do I tell him. Do I tell him and stay. Do I say nothing and let both of them go on being half-answered.",
      "The lake was moving tonight. Wind off the far shore. I don't think it means anything. I'm writing it down anyway, because the last time I sat out here it was completely still, and I want the record to show that things move.",
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
