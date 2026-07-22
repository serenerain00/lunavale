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
 * ACCESS: the open entries are the shop window. They were picked to run as a
 * readable sequence rather than a scatter — the end of the ten years, Tyson
 * turning up in week two, the diner, the Carrera, the evening she notices him,
 * month four, the firepit, Josh's call, and the hour before the dinner. A
 * visitor can read that straight through and arrive at a real cliff: she is
 * about to have dinner with the man who left, and she has just decided not to
 * tell her best friend.
 *
 * Everything after that point is members-only, because everything after that
 * point is the story: the lie, Josh having already told him, the silence
 * ritual failing, the bar, the park, and the night.
 *
 * docs/monetization/MONETIZATION.md lists journals under Vault Membership and
 * the membership page sells "Luna's writing, in her own words", so the bulk
 * has to stay behind it or those claims stop being true.
 *
 * If you move a flag, keep the shape: open the entries that establish the
 * voice and the situation, keep the ones that turn it.
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
    access: "free",
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
    access: "free",
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
    access: "free",
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
    access: "free",
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
    id: "day-by-day",
    dateline: "No date, I've lost track",
    place: "farmhouse",
    about: ["luna"],
    access: "free",
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
