/**
 * Character areas — everything in the world that belongs to one person,
 * gathered in one place.
 *
 * This file adds no new media. Scenes, clips, galleries, journal entries and
 * Between Takes notes all already know who they are about; what was missing was
 * a surface that asks the question the other way round — not "what happened at
 * the lakehouse" but "show me Tyson." That is the question an audience actually
 * has once they are attached to someone, and it is the one the catalog's
 * feeling/place axes cannot answer.
 *
 * The prose below is DRAFT, written to the canon in LUNA_VALE_CONTEXT.md
 * (Melissa's, 2026-07-22) and, since 2026-10-14, to her character bible,
 * docs/content/BETWEEN_US_CHARACTER_BIBLE.md. The beats are hers; the sentences
 * are not. `id` is load-bearing — it is the PersonId from taxonomy.ts and
 * appears in URLs.
 *
 * THE BIBLE IS WRITER KNOWLEDGE, AND MOST OF IT STAYS OFF THIS PAGE. What came
 * across (2026-10-14): personality, wants, fears, blind spots, build and ink —
 * who they are on any given day. What did not: everything it says about the
 * accident beyond what "What Was Agreed" already shows for free, where the
 * story goes after the reconciliation, Tyson's drinking history, and Miller
 * (still PROPOSED). Melissa asked for the cast page to make them read as real
 * people; none of that needs a spoiler.
 *
 * PORTRAITS. Luna, Tyson and Josh were frames from the cast interview until
 * 2026-10-14, when Melissa asked for new headshots. They are now 3:4 crops of
 * stills from published scenes, picked for being the person rather than the
 * moment: nobody mid-argument, mid-kiss or in tears. New filenames rather than
 * overwriting, so no image cache goes on serving the old faces. On
 * 2026-10-15 Melissa picked Tyson's (white shirt, lakehouse) and Josh's (by
 * the pool) herself, from her Dropbox stills, and Luna's (at the
 * event) too.
 */

import { clipAccess, clips, type Clip } from "@/lib/content/posts";
import { galleries, type StillGallery } from "@/lib/content/gallery";
import { journal, type JournalEntry } from "@/lib/content/journal";
import { notes, type SetNote } from "@/lib/content/between-takes";
import { getPerson, type PersonId } from "@/lib/content/taxonomy";
import { videos, type Video } from "@/lib/content/videos";

export interface Character {
  /** The PersonId from taxonomy.ts. Appears in /characters/<id>. */
  id: PersonId;
  /** Display name. */
  name: string;
  /** Their standing in one phrase — sits under the name. */
  role: string;
  /** The hook, one sentence. Used on the index card and as meta description. */
  tagline: string;
  /** Portrait under /public. 3:4. */
  portrait: string;
  /** Where the portrait is from, for its alt text: "Tyson, at the lakehouse". */
  portraitAlt: string;
  /** Two or three paragraphs. Who they are, without spoiling where it goes. */
  intro: string[];
  /**
   * Underneath — what they want, what they are afraid of, what they are good
   * at and where they get in their own way. From the character bible. Shown as
   * four short rows after the intro, because this is the part that makes a
   * character a person, and it reads better scannable than buried in prose.
   */
  inner?: { label: string; text: string }[];
  /**
   * The dossier — the scannable facts, shown as a table above the prose.
   *
   * A LIST RATHER THAN A FIXED SCHEMA, because a fixed one would demand rows
   * that do not exist. Luna has no military history; Tyson has no children;
   * nobody has established what Josh drives. Fixed fields would leave those
   * blank or, worse, invite somebody to fill them in — and this is a story
   * where a made-up fact becomes canon the moment it is on a page.
   *
   * So: only what LUNA_VALE_CONTEXT.md actually establishes. Labels are kept
   * consistent where they apply (Age, From, Lives, Work) so the pages still
   * read as one set. If a row you want is missing, the canon is missing it.
   */
  facts?: { label: string; value: string }[];
  /**
   * The small, concrete things — the details that make a character feel like a
   * person rather than a role. Shown as a short list, deliberately specific.
   */
  details: string[];
  /**
   * A line of theirs worth pulling out. Sourced from the interview or the
   * scenes; attributed in `pullQuoteSource`.
   */
  pullQuote: string;
  pullQuoteSource: string;
}

export const characters: Character[] = [
  {
    id: "luna",
    name: "Luna",
    role: "The one it happens to",
    tagline:
      "Ten years with one man, twenty with the other, and no version of this where nobody gets hurt.",
    portrait: "/characters/luna-event.jpg",
    portraitAlt: "Luna, at the Denver Foundation event",
    intro: [
      "The story is her interior life. Everything else — the farmhouse, the lake, both men — is weather moving across it.",
      "She is from Atlanta. Josh was a man she met there on business, and for a while they did it long distance — and then, ten years ago, she left her mother, her sister and everyone she had known since she was a child, and moved to Colorado to live on his farm. That is the size of the bet, and it is worth holding onto when she is deciding whether to make another one.",
      "She has a streak: she likes danger, and she is loyal, and those two things point at different people. She is not a victim and she is not stupid. She sees the situation clearly, chooses badly, and knows she is doing it while she does it.",
      "She is warm, quick and funny — the one who notices first when somebody in the room has gone quiet, and the one who makes it all right for everybody else, even when it costs her. Ask her something hard and she is as likely to change the subject, or trail off, as answer it. That is not evasion so much as a woman who can see that every possible answer hurts somebody.",
      "When she left Josh she had not stopped loving him, and she still hasn't. What she wants from him is not another promise, or another request to come home. It is to watch him be different, and keep being different.",
      "What she is actually trying to work out is not which one of them to keep. It is whether there is a version of her life that she chose on purpose.",
    ],
    inner: [
      { label: "Wants", text: "To know who she is when she isn't somebody's partner, or the one holding everybody together" },
      { label: "Afraid of", text: "That asking for what she needs will cost her people she loves — and that going back to what she knows will mean disappearing into it again" },
      { label: "At her best", text: "Warm, funny, perceptive, loyal. Reads a change in somebody before they've said a word, and remembers everything" },
      { label: "Gets in her own way", text: "Keeps everybody comfortable at her own expense. Puts off the hard conversation. Mistakes being kind for being responsible for how other people feel" },
    ],
    facts: [
      { label: "Age", value: "38" },
      // Melissa, 2026-09-01. She and Josh are BOTH Scorpios and Tyson is a
      // Libra — which is not decoration: two all-or-nothing people in one
      // house for ten years, and the third man is the one constitutionally
      // unable to start the fight that would settle it.
      { label: "Sign", value: "Scorpio" },
      { label: "From", value: "Atlanta, Georgia" },
      { label: "Lives", value: "Denver, Colorado — the lakehouse" },
      { label: "Work", value: "Models, and has since she was eighteen. Her own income, and the only part of her life that was never Josh's" },
      { label: "Family", value: "Cathy and Tony, forty years married. Avery, her sister, ten years younger" },
      { label: "Josh", value: "Ten years, six months apart, and back again" },
      { label: "Tyson", value: "Twenty years. Best friend, and the thing neither of them says" },
    ],
    details: [
      "Models for a living — the one part of her life that was never his",
      "Writes everything down, then argues with what she wrote",
      "Runs six miles when she cannot think straight",
      "Moved to the lakehouse alone and has not stopped calling it temporary",
      "Has never once lied to Tyson, until she does",
      "Kept a journal all through her first year with Josh — the burnt eggs, the paint, the nights she waited up",
      "Would rather lose a fight with a light bulb than be helped with it",
      "Changes the subject sooner than explain herself",
      "Survives her trainer, and reports back",
    ],
    pullQuote: "She's trying to choose herself.",
    pullQuoteSource: "The cast interview",
  },
  {
    id: "tyson",
    name: "Tyson",
    role: "Her best friend of twenty years",
    tagline:
      "Ex-military, few words, and six months of keeping her head above water that turned into something neither of them will say.",
    portrait: "/characters/tyson-white.jpg",
    portraitAlt: "Tyson, in a white shirt at the lakehouse",
    intro: [
      "Twenty years of friendship, and a rule underneath it that neither of them ever wrote down: they do not lie to each other. Not about anything. It has survived two decades of things worth lying about.",
      "He is ex-military, which shows up less in how he talks than in what he does not say. Extreme sports, motorcycles, track days — and a black 2020 Carrera he treats like something on loan from a man he respects. He will ride recklessly alone and will not take a hard corner with Luna in the passenger seat.",
      "He is funnier than he lets on — dry, almost throwaway, and genuinely his rather than armor. He looks after people with what he does, not what he says: bossy about whether she has eaten, never about how she feels. He wants peace, and he cannot leave a wrong alone, and most of what is hard about him lives between those two.",
      "Ten years in the Navy made him quieter, calmer and harder to read. Luna noticed it the first time he came home and has never entirely got the old version back. It did not take the kindness out of him. In a crisis he gets quieter and more focused, not louder; it is afterward, when there is nothing left to do, that he has no words for any of it.",
      "Through the six months she was on her own, he made himself responsible for her getting through it. Somewhere in there it stopped being only that, on both sides. When Josh comes back, Tyson starts putting distance in — because distance is the only way left to keep hiding it.",
      "When he goes quiet on her, though, it is rarely only that. Not jealousy, and not something carried for twenty years — but where he fits now, between the two of them, and who he is when he isn't in the Navy.",
    ],
    inner: [
      { label: "Wants", text: "To keep his people safe, and be somebody they can count on without having to ask" },
      { label: "Afraid of", text: "Seeing the danger too late. Being made to choose between the people he is loyal to" },
      { label: "At his best", text: "Reads a room before he is properly in it. Steady when everybody else isn't. Can get her laughing without making her explain herself" },
      { label: "Gets in his own way", text: "Goes straight to fixing it when she only wanted to be heard. Carries things alone — and keeps things from people, to protect them" },
    ],
    facts: [
      { label: "Age", value: "38" },
      // Melissa, 2026-09-01, and it is characterisation rather than trivia:
      // a Libra between two Scorpios. The man who cannot be in a room with an
      // argument in it is the reason the argument never happens.
      { label: "Sign", value: "Libra" },
      { label: "From", value: "Atlanta, Georgia" },
      { label: "Lives", value: "Denver — moved after he retired, for a change of pace" },
      // Melissa, 2026-08-30: he was still serving when Luna met Josh. It is
      // the most load-bearing fact on this card — it means he did not watch
      // the ten years begin, he was told about them once on a bad line.
      {
        label: "Service",
        value:
          "Navy SEAL, ten years. Still in when Luna met Josh — he got the beginning of it in a nine-minute phone call",
      },
      { label: "Joined up", value: "At eighteen, in 2006. He told her on a tailgate at a party, already signed" },
      { label: "Work", value: "Several things at once. Contract work on Josh's farm is one of them" },
      { label: "Drives", value: "A black 2020 Porsche Carrera he treats like something on loan" },
      { label: "Build", value: "Six foot two, about two hundred pounds, and all of it strong" },
      { label: "Ink", value: "Sleeves to the wrists, his hands and fingers, his whole neck. A cross on a chain, hoops in his ears" },
      // SECOND cousins, settled by Melissa 2026-09-04. This card used to
      // say "second or third, still being decided", which put a production
      // note on a character page: these people are drawn from real ones and
      // a fact about them is either known or not stated at all.
      { label: "Family", value: "Josh's second cousin — and it shows" },
      { label: "Cole", value: "Ten years a SEAL beside him, and the only person he can say it to" },
      { label: "Luna", value: "Twenty years. He was there for all six months she was alone" },
      // Published free in "What Was Agreed", and no further than that: what
      // happened and who knew are the mystery, and stay off this page.
      { label: "Nine years ago", value: "He was there, the night something happened at Josh's family business. Luna wasn't, and nobody has told her since" },
    ],
    details: [
      "Josh's second cousin, and helps him on the farm",
      "Puts the groceries away in the wrong cupboards on purpose",
      "Does not ask how she is — asks what she has eaten, then waits",
      "Started the staring game with her at nineteen, over nothing",
      "Was at the races the night she called to be picked up at eighteen, and came anyway",
      "Lost his hoodie to her on her way out to a date, and let her keep it",
      "Called her from deployment near the end of his ten years, and got a full report on her date",
      "Has had the same sign on his wall for years and never once mentioned it",
      "Gets quieter in a crisis, never louder",
    ],
    pullQuote: "He carries everything alone.",
    pullQuoteSource: "The cast interview",
  },
  {
    id: "josh",
    name: "Josh",
    role: "Her partner of ten years",
    tagline:
      "He called after six months apart, and she said yes to dinner when she had meant to say no.",
    portrait: "/characters/josh-pool.jpg",
    portraitAlt: "Josh, by the pool",
    intro: [
      "He is not the villain of this, and the story never treats him as one. Intense, driven, physically imposing, used to being the man who gets things done — and capable of real tenderness, mostly in ordinary things rather than declarations. Their ten years had good years in them: cooking, dancing, laughing, wanting each other. None of it was one long mistake.",
      "Ten years, and by the end of them he had gone lazy — stopped noticing the house, the calendar, her. He could not tell you the day it started, because there wasn't one.",
      "When she leaves, he thinks it will be days. Weeks at most. He is not ready for anybody at the company to know, and he hears her going as an obstacle to get past rather than a line she has drawn — which is the whole problem, in one misunderstanding.",
      "That is only half of him, and the half that makes the other half land. He is caring, passionate, commanding, genuinely funny, and she loved all of it. He owns a shop and a large farm and puts work first, which for most of the ten years read as reliability.",
      "Where he learned it is not a mystery. His father is the same combination — magnetic and in charge, and unable to tell the difference. Josh grew up being run rather than loved, and became a man who does that to the woman he wants to keep.",
      "Then he calls. Coffee, then dinner the same night, and it starts again — and once he begins to suspect what Luna and Tyson are to each other, the same intensity that made him magnetic turns into jealousy, then possession, then control. It comes out of fear, and out of loving her. That is what makes it frightening rather than simple.",
    ],
    inner: [
      { label: "Wants", text: "A life with Luna. Continuity — the sense that what he built still counts for something" },
      { label: "Afraid of", text: "Losing her, and finding out that providing for her and being devoted to her were never a substitute for paying attention" },
      { label: "At his best", text: "Committed, generous, protective, the first to act. He loves her, and it shows most in the everyday things" },
      { label: "Gets in his own way", text: "Treats a problem as something to manage or negotiate. Runs on his own timetable. When he feels it slipping he pushes, when what it needed was for him to listen" },
    ],
    facts: [
      // Melissa, 2026-09-01. He and Luna are BOTH Scorpios — ten years of two
      // people who go all in and never let a thing go.
      { label: "Sign", value: "Scorpio" },
      { label: "From", value: "Denver, Colorado" },
      { label: "Lives", value: "The farm — where he and Luna spent the ten years" },
      { label: "Work", value: "Owns a shop and a large farm. Work first, always" },
      { label: "Family", value: "Rick, his father. Tyson, his second cousin" },
      { label: "Luna", value: "Met her in Atlanta on business. Long distance, and then she moved" },
      { label: "Build", value: "Six foot, about two hundred and twenty pounds, broad with it" },
      { label: "Ink", value: "Sleeves to the wrists, his neck and his chest. Nothing on his hands" },
      { label: "Nine years ago", value: "Something happened at the family business. He, Tyson and his father know what. Luna was a year in, and was never told" },
    ],
    details: [
      "Owns the shop and the farm; work comes first and always has",
      "Grazes her lower lip mid-sentence and knows exactly what it does",
      "Told Tyson about the dinner the same morning, casually, as family do",
      "Takes it sitting down, in the one room where he never argues back",
      "Is not sorry in the way she needs him to be sorry",
      "Won't take the wrench off her — tells her to give it one more",
      "Asks questions that come out sounding like expectations",
      "Hasn't told anybody at the company she's gone",
    ],
    pullQuote: "That I'm not the villain.",
    pullQuoteSource: "The cast interview",
  },
  {
    // Supporting, and deliberately given a page anyway: he is the explanation
    // for the lead. Thin on content for now — one scene and two notes — which
    // the hub states honestly rather than padding.
    id: "rick",
    name: "Rick",
    role: "Josh's father",
    tagline:
      "Dominance with charisma, and no idea how to put love into a form his son could use.",
    // NEW PORTRAIT 2026-09-29, from Melissa: Rick at the house, by the safe,
    // mountains through the doors behind him. The source is 609x786, so the
    // head-and-shoulders crop is enlarged about 1.9x to match the others and
    // is a touch softer than them. A larger export would sharpen it.
    portrait: "/characters/rick-house.jpg",
    portraitAlt: "Rick, at his house",
    intro: [
      "Think boss. He runs a room by sitting still in it, and he has never once had to raise his voice to end a conversation.",
      "Josh did not invent himself. The charm that gets used as control, the certainty, the way being wanted and being obeyed blur into the same thing — all of it was learned in his father's study, from a man who is genuinely strong and genuinely cares, and who has never managed to deliver either in a form his son could do anything with.",
      "He is disappointed in Josh for losing Luna. He also always thought Luna was too good for him. He holds both at once without difficulty, and says neither in a way that helps — which is the whole inheritance, handed down intact.",
    ],
    facts: [
      { label: "Lives", value: "Denver, Colorado" },
      { label: "Work", value: "A CEO, and he owns a brewery" },
      { label: "Drinks", value: "Very fine liquor. Never anything cheap" },
      { label: "Family", value: "Josh's father" },
      { label: "Luna", value: "Always thought she was too good for his son. Never told his son" },
    ],
    details: [
      "The only man in the room who gets up, and only for the last line",
      "The framed photograph on the shelf behind him is the two of them",
      "Thought Luna was too good for his son, and never told his son that",
      "Cares, demonstrably. Not once in a language Josh can read",
    ],
    pullQuote: "You think you're handling it? You're not.",
    pullQuoteSource: "The Study",
  },
  {
    // PORTRAIT BREAKS THE RULE at the top of this file, and it has to. The
    // others are frames from the cast interview precisely so a character hub
    // is about the person rather than one moment of theirs — but Cathy is not
    // in the interview, which was shot before she existed. This is a 3:4 crop
    // from "Long Distance", chosen for being the most neutral frame of her in
    // it: listening, not yet upset. Replace it if she is ever interviewed.
    id: "cathy",
    name: "Cathy",
    role: "Luna's mother",
    tagline:
      "Two thousand miles away, defending a man she has only ever met with the door open.",
    portrait: "/characters/cathy.jpg",
    portraitAlt: "Cathy, from Long Distance",
    intro: [
      "Sixty-five, and in Atlanta with Tony — which is the problem. Her daughter is in Colorado, alone in a lakehouse in the dark, and the only thing Cathy can actually do about that is call her.",
      "She and Luna's father have been married forty years. They met in Italy, they fell in love there, and four decades later he still cannot walk past her chair without touching her shoulder. It is the happiest marriage either of her daughters has ever seen up close, and it is quietly the hardest thing in Luna's life — her mother has been loved easily for forty years and has no working picture of what it is to be managed by somebody who loves you.",
      "She is a good mother and she is a pushy one, and those are not in tension. She calls until you answer. She asks the question again. Luna needs a breath before she picks up, the way most daughters do, and there is nothing underneath it — no damage, no old wound, a childhood that was genuinely fine.",
      "What there is, is a gap. She has known Josh for ten years and never once from inside the room, so when he calls her sounding wrecked she believes him, because he is not lying. She is holding one half of it and asking her daughter to be kinder about the half she can see.",
    ],
    facts: [
      { label: "Age", value: "65" },
      { label: "Lives", value: "Atlanta, Georgia — two thousand miles from all of it" },
      { label: "Married", value: "Forty years to Antonio — Tony. They met in Italy" },
      { label: "Family", value: "Two daughters: Luna, and Avery ten years behind her" },
      { label: "Tyson", value: "Has known him twenty years. Made the two of them lunches as teenagers" },
      { label: "Josh", value: "Ten years, and never once from inside the room" },
    ],
    details: [
      "Made Luna and Tyson lunches when they were teenagers",
      "Was there for Luna the whole time Tyson was deployed",
      "Loves Tyson like a son, and knows exactly whose best friend he is",
      "A shelf of framed photographs of people she cannot get on the phone",
      "Still tells the Italy story, and still gets one detail wrong on purpose",
      "Two daughters, and she will get one of them to call the other",
    ],
    // Written to Melissa's canon rather than transcribed off the cut — the
    // same standing as the prose above, and the same caveat.
    pullQuote: "He doesn't sound like himself.",
    pullQuoteSource: "Long Distance",
  },
  {
    // A REAL PORTRAIT SINCE 2026-09-29. Until then this was a crop of Luna's
    // iPad screen, upscaled and soft, because Avery had never been in a room
    // with a camera — she existed only on the other end of a video call. The
    // note here said to replace it the day she was shot in a room, and this
    // is that day: Melissa's still of her on her own sofa in Atlanta, skyline
    // through the window and an ATLANTA print behind her, which is her whole
    // character in one frame — the one who stayed.
    //
    // New filename rather than overwriting avery.jpg, so no browser or
    // image-optimizer cache can go on serving the old face.
    id: "avery",
    name: "Avery",
    role: "Luna's sister",
    tagline:
      "Ten years younger, two thousand miles away, and the only one who doesn't have to ask.",
    portrait: "/characters/avery-atlanta.jpg",
    portraitAlt: "Avery, at home in Atlanta",
    intro: [
      "Twenty-eight, ten years behind Luna, and close to her for every one of them. Luna wanted a baby sister before there was one, and got her — and until Luna left for Colorado she was the person Avery took everything to first. Less big sister than best friend, and it shows in how alike they are, down to the face.",
      "She is still in Atlanta, where their mother is, three years into a psychiatry residency and on the hours that come with it. So she does not call often. Usually there is a family matter, or their mother has worn her down into it — and Luna is no good at saying anything real down a phone line anyway.",
      "Which is why the call works when it works. Cathy calls to find out how her daughter is. Avery already knows, because their mother told her and because she would have known regardless. So she doesn't ask. She talks about nothing in particular until Luna is laughing, and then she waits, and lets her get to it herself.",
    ],
    facts: [
      { label: "Age", value: "28" },
      { label: "Lives", value: "Atlanta, Georgia, with their mother nearby" },
      { label: "Work", value: "Third-year psychiatry resident. Two years off qualifying, and the hours to match" },
      { label: "Family", value: "Cathy, her mother. Luna, ten years ahead of her" },
      { label: "Tyson", value: "Has known him as long as she has been alive. Calls him a brother" },
    ],
    details: [
      "Has never once asked Luna how she is",
      "Third-year psychiatry resident, which is most of why she doesn't call",
      "Opened with eleven minutes about a man at her work who microwaves fish",
      "Says okay rather than advice",
      "Has known Tyson as long as she has been alive, and calls him a brother",
      "The one person Luna has never been able to lie to",
    ],
    // From "avery-called" rather than from the scene: the line is in Luna's
    // account of the call, not in dialogue on screen. Draft prose, same
    // standing as the rest of the journal — see the header of journal.ts.
    pullQuote: "Okay. Tell me the rest.",
    pullQuoteSource: "Luna's journal",
  },
  {
    // Launched 2026-10-20 with the studio clip, from Melissa's reference of
    // the same day (LUNA_VALE_CONTEXT.md, "Simone — Luna's studio manager").
    // Only what that reference states. The 10-19 background (family,
    // heritage, how she and Luna met) is still OPEN and stays off this page.
    // Her wondering about Luna and Tyson is hers and is not on the card: the
    // clip shows it, and nothing here may suggest Tyson felt anything first.
    //
    // Portrait: Melissa's Dropbox still, at the light table in the studio.
    id: "simone",
    name: "Simone",
    role: "Luna's studio manager, and a longtime friend",
    tagline:
      "Runs Luna's studio, says what she's thinking, and notices what Luna isn't saying.",
    portrait: "/characters/simone-studio.jpg",
    portraitAlt: "Simone, at the light table in Luna's studio",
    intro: [
      "Thirty-eight, from Manhattan, and the person who actually runs Luna's modeling studio in Denver. Schedules, photographers, models, shoots, the people on the floor, and the hundred small things that keep a day from falling apart. The studio is Luna's. Most days, the day is Simone's, and she makes the call without asking first.",
      "She and Luna go back years, and it shows in how little either of them has to explain. They talk while they work — clients, gossip, photographs, whatever Luna is busy not talking about — and most of it is fun. Simone knows Luna works too much, and has to have a hand in everything. She says so anyway.",
      "She is direct the way New Yorkers are, quick when something amuses her, and she sees what people leave out. She will ask the slightly uncomfortable question. She also knows when to stop asking.",
      "She met Tyson after he came home from the Navy, and she finds him very funny: all that size and ink, and around Luna he is a big teddy bear.",
    ],
    facts: [
      { label: "Age", value: "38" },
      { label: "Sign", value: "Sagittarius" },
      { label: "From", value: "Manhattan, New York" },
      { label: "Lives", value: "Denver" },
      { label: "Work", value: "Manages Luna's modeling studio" },
      { label: "Ink", value: "Florals from her shoulder to her wrist, on one arm" },
      { label: "Luna", value: "A longtime friend. Knows she's been struggling with Josh" },
      { label: "Tyson", value: "Met him after he came home from the Navy. They give each other a hard time" },
    ],
    details: [
      "Calls Luna \"Lu\"",
      "Makes decisions without asking, and Luna still wants to hear about every one",
      "Thinks one of these days Luna will actually let somebody else run the place",
      "Charcoal top, tailored black trousers, a belt, and nothing to prove",
      "Calls Tyson Luna's big teddy bear",
    ],
    pullQuote: "Yeah, you're done.",
    pullQuoteSource: "The Studio",
  },
];

export function getCharacter(id: string): Character | undefined {
  return characters.find((c) => c.id === id);
}

/* --------------------------------------------------------- what they're in */

/**
 * Everything filed under one person, in the order a hub wants to show it.
 *
 * Access is NOT filtered here. The pages need to know a locked thing exists in
 * order to show it locked — a hub that silently omitted premium material would
 * make membership look like it unlocks nothing, which is the opposite of what
 * these pages are for. Gating happens at render, per card, as everywhere else.
 */
export interface CharacterContent {
  scenes: Video[];
  clips: Clip[];
  galleries: StillGallery[];
  journal: JournalEntry[];
  notes: SetNote[];
}

export function contentFor(id: PersonId): CharacterContent {
  return {
    // `hidden` keeps the cast interview out, the same way the catalog does.
    // It is about all three and belongs to none of them.
    scenes: videos.filter((v) => !v.hidden && v.about.includes(id)),
    clips: clips.filter((c) => c.about.includes(id)),
    galleries: galleries.filter((g) => g.about.includes(id)),
    journal: journal.filter((e) => e.about.includes(id)),
    notes: notes.filter((n) => n.author === id),
  };
}

/** Total pieces of content filed under a person — the index card's meta line. */
export function countFor(id: PersonId): number {
  const c = contentFor(id);
  return (
    c.scenes.length +
    c.clips.length +
    c.galleries.length +
    c.journal.length +
    c.notes.length
  );
}

/**
 * How much of a person's material is behind the LunaVerse. Drives the honest
 * "N of M are members-only" line on the hub rather than a vague promise of
 * "more inside".
 */
export function lockedCountFor(id: PersonId): number {
  const c = contentFor(id);
  return (
    c.scenes.filter((s) => s.access === "premium").length +
    c.clips.filter((x) => clipAccess(x) === "premium").length +
    c.galleries.filter((g) => g.access === "premium").length +
    c.journal.filter((e) => e.access === "premium").length +
    c.notes.filter((n) => n.access === "premium").length
  );
}

/** The other two, for the "elsewhere in the world" row at the foot of a hub. */
export function others(id: PersonId): Character[] {
  return characters.filter((c) => c.id !== id);
}

/** Label for a person id, falling back to the taxonomy. */
export function nameFor(id: PersonId): string {
  return getCharacter(id)?.name ?? getPerson(id)?.label ?? id;
}
