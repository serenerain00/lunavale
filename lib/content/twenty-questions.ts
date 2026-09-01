/**
 * Twenty questions — a reader Q&A with Luna, written as a published piece.
 *
 * Melissa, 2026-09-01: an article rather than a video, framed as somebody
 * interviewing her, twenty questions, "some spicy some not some mundane like
 * life stuff" — horoscope, family, favourite time of year, sitting beside the
 * real ones about Josh and Tyson and her parents. Things people would want to
 * ask her and never get to.
 *
 * IT IS A READER Q&A, NOT A MAGAZINE PROFILE (Melissa's call). That decision
 * does more work than it looks like it does. A journalist would make her
 * perform, and she would answer in her public register — the one she describes
 * in `the-version-i-give` as the funny version she hands people. Readers are
 * somebody who already care, which is what licenses the horoscope question and
 * the Tyson question to sit four inches apart without the piece feeling
 * schizophrenic. It also means she can be short with a question, which a
 * profile subject cannot.
 *
 * THE SHAPE IS DELIBERATE and it is the standard AMA escalation: mundane first,
 * life in the middle, the two men last. Nobody answers a question about the
 * worst six months of their life as question three. The trivia at the top is
 * not filler — it is what buys the reader the right to ask nineteen.
 *
 * QUESTION 18 IS THE ONE. "Is there anything you have never told Tyson?" She
 * starts to answer it and stops, and Melissa's instruction was precisely that:
 * almost says it, then stops. Nothing factually new is revealed, so the canon
 * and the journal keep their secrets and the deadlock is untouched — but she
 * INVERTS her own signature move to do it. Everywhere else in the journal she
 * writes the unflattering thing, reads it back and leaves it in; that is the
 * habit that makes a reader trust her. Here, for the only time, she reads it
 * back and takes it out, and says so. The refusal carries more than an answer
 * would.
 *
 * VOICE: first person about her own life, per the cast-play-themselves rule —
 * she is a real person appearing as herself, never an actor discussing a
 * character. Specific, self-revising, funny at her own expense, sharp when
 * cornered, never explicit on the page. American English.
 *
 * GROUNDED IN CANON, with everything checked against LUNA_VALE_CONTEXT.md and
 * the journal: she is 38; met Josh at 28 in Atlanta on business and moved to
 * Colorado for him; the lakehouse is HERS; she has modelled since eighteen;
 * Cathy and Tony have been married forty years and met in Italy; Avery is ten
 * years younger and in Atlanta; she met Tyson at eighteen and did not like him;
 * he served ten years and does not raise his voice; she runs six miles; she
 * keeps the journal. Q11, Q12 and Q20 deliberately echo lines she has already
 * written, because a person repeats themselves and it rewards anybody who has
 * read the journal.
 *
 * STAR SIGNS ARE CANON, given by Melissa 2026-09-01: Luna is a Scorpio, Josh is
 * a Scorpio, Tyson is a Libra. Q1 is the only place they are used and it is the
 * best argument in the piece for asking somebody a trivial question — two
 * Scorpios in one house for ten years explains the intensity and the grudges,
 * and a Libra explains the man who will not raise his voice and will not start
 * the fight that would settle it. She notices the second one MID-ANSWER and
 * moves past it, which is the light version of what she does at Q19. Notice,
 * then deflect, then refuse.
 *
 * INVENTED AND HERS TO CUT — there is no canon for any of these and they are
 * the only things here not traceable to a source:
 *
 *   Q3   October as her favourite month, and the four-o'clock light.
 *   Q4   Coffee standing up, before it is light.
 *   Q19 The specific shape of the regret.
 *
 * Josh's father Rick, Cole, and the panic attacks are all deliberately ABSENT.
 * Rick and Cole are not hers to introduce in a puff piece, and the attacks are
 * the journal's to disclose, not an interview's.
 */

export interface Question {
  /** The reader's question, as printed. */
  q: string;
  /** Her answer, in paragraphs. */
  a: string[];
}

export const interviewIntro = [
  "We asked readers what they would ask Luna if they ever got the chance. Several hundred questions came in. She took twenty of them, on the condition that she got to see them all at once and answer them in her own time, in writing.",
  "She answered nineteen.",
];

export const twentyQuestions: Question[] = [
  {
    q: "What's your sign? Do you even believe in it?",
    a: [
      "Scorpio. So is Josh — and everybody who knows what that means has already made a face.",
      "Two of us, in one house, for ten years. All in or nothing at all, twice over, and neither of us has ever once let a thing go.",
      "Tyson is a Libra. Balance. Fairness. Cannot sit in a room with an argument in it and will do a very great deal to keep one out. I have known that about him for twenty years and I have never once put the two words together until just now, and I am going to move on.",
      "My mother believes in all of it completely and reads mine down the phone whether or not I asked. I have never acted on it. I have also never told her to stop, which is probably a fairly efficient summary of the two of us.",
    ],
  },
  {
    q: "Tell us about your family.",
    a: [
      "My parents have been married forty years, which is not a normal sentence to be able to write. They met in Italy. She was twenty-five and on a trip, my father had about nine words of English, and he used all nine of them on her inside the first hour and then simply kept standing there.",
      "My sister Avery is ten years younger than me and considerably better at her own life. They are all still in Atlanta. I am not.",
    ],
  },
  {
    q: "Favorite time of year?",
    a: [
      "October, here. The light goes long and gold around four in the afternoon and for about twenty minutes everything looks like it means something. It does not mean anything. I take it anyway.",
      "It is also when I get to stop pretending I like summer.",
    ],
  },
  {
    q: "What are your mornings like?",
    a: [
      "Coffee before anything, standing up, usually before it is light.",
      "If I sit down with it I start having opinions about the day. Standing at the counter, the day has not started yet. That is not a system anybody taught me and I would not recommend building a personality on it.",
    ],
  },
  {
    q: "How did you get into modeling?",
    a: [
      "At eighteen, by accident, and I stayed because it paid.",
      "Twenty years later it is the one part of my life that nobody else has ever had a vote in. My money, my calendar, my name on the invoice. That matters to me far more now than it did at eighteen, and I could not have explained to you then why it would.",
    ],
  },
  {
    q: "What made you move to Colorado?",
    a: [
      "A man. Obviously.",
      "I left my mother, my sister and everyone I had known since I was a child, and I moved two thousand miles to a farm, because I was twenty-eight and in love and I thought that was what you were supposed to do with a feeling that size.",
      "I try to keep the scale of that in view when I am deciding whether to make another one.",
    ],
  },
  {
    q: "What's your relationship with your mom like?",
    a: [
      "She loves me at me. That is the most accurate way I have found to say it.",
      "She is kind and she is certain and I am not sure she has ever asked a question she did not already have the answer to. Avery leaves the door open and waits to see whether I come through it. Mom comes in.",
    ],
  },
  {
    q: "Are you and your sister close?",
    a: [
      "Every week, and she knows more than I have actually told her, which is the entire basis of it.",
      "Avery is ten years behind me and roughly ten years ahead.",
    ],
  },
  {
    q: "What do you do when you can't sleep?",
    a: [
      "I write. There is a book. It is mostly this handwriting and I have been keeping it long enough now to be embarrassed by the early pages, which I am told is the correct outcome.",
      "If writing is not working I run. Six miles, no music. By about mile four I have usually stopped arguing with somebody who is not there.",
    ],
  },
  {
    q: "Tell us about the lakehouse.",
    a: [
      "It is mine. I would like that in print, because for about a year people said his lakehouse to my face and I kept not correcting them, and I have thought about why.",
      "Water through the glass on three sides and very quiet. I have been describing it as temporary for long enough that I should probably either stop saying it or start meaning it.",
    ],
  },
  {
    q: "What are you bad at?",
    a: [
      "Wanting things out loud.",
      "I am extremely good at what does everybody else want. I could do that one in my sleep. I have a growing suspicion I have been doing it in my sleep.",
    ],
  },
  {
    q: "What do people get wrong about you?",
    a: [
      "That I do not know.",
      "Whatever else is going on with me, I am not confused about it. I see the situation clearly, I choose badly, and I watch myself doing it while it happens. That is worse than being fooled, and I would rather it went down accurately than kindly.",
    ],
  },
  {
    q: "You've been with Josh ten years. What drew you to him?",
    a: [
      "He walked into a room and the room rearranged itself around him, and he never once appeared to ask it to. I was twenty-eight. I had never been near anybody who took up space like that.",
      "He is also very funny, which nobody believes when I say it. He can still get the ugly laugh out of me — the one I cannot stop once it has started. Nobody else has ever managed it. Not one person.",
    ],
  },
  {
    q: "What's the thing about him you'd want people to understand?",
    a: [
      "That he is not a villain in a story. He is a man who is very sure of himself and has been rewarded for it his entire life, and nobody has ever sat him down and explained what that is like to stand next to.",
      "He is generous. He is loyal to people who have nothing to offer him. He will do a hard thing for you without being asked and then never mention it again.",
      "All of that is true at the same time as the rest of it, and the fact that people want me to pick one is exactly the part I cannot do.",
    ],
  },
  {
    q: "The six months apart — what were they actually like?",
    a: [
      "I am not going to be cute about it. They were the worst months of my life.",
      "They were also the first stretch in ten years where I found out what I thought about something without checking first.",
      "Both of those are true. I have stopped trying to make them cancel each other out.",
    ],
  },
  {
    q: "Did you know what you were going back to?",
    a: [
      "Yes.",
      "I had the no ready. I had practiced it out loud, in the car, more than once. And it did not come out of my mouth, and I have had a long time now to sit with that and I am not finished sitting with it.",
    ],
  },
  {
    q: "How did you and Tyson meet?",
    a: [
      "We were eighteen. I did not like him.",
      "I thought he was arrogant and he was, in fact, just quiet, and it took me an embarrassingly long time to learn the difference between those. He has never let me forget it. He is entitled to it.",
    ],
  },
  {
    q: "What's he actually like? People have a lot of theories.",
    a: [
      "He does not raise his voice. I want people to understand what that does to you — it means I am permanently the only person in the room shouting, which makes me the problem in every photograph.",
      "He says the true thing instead of the kind one, which I have historically received as an attack because that was easier than receiving it as information.",
      "And in twenty years he has never once told me what to do. Not advised. Not steered. I have known him since I was eighteen and I could not tell you what he thinks I should do about anything, because he has never said, and I have started to think that is not restraint. I think it costs him something.",
    ],
  },
  {
    q: "Is there anything you've never told Tyson?",
    a: [
      "Yes.",
      "I wrote the rest of that answer out. Then I read it back, the way I read everything back.",
      "For the first time I can remember, I am not leaving it in.",
      "Next question.",
    ],
  },
  {
    q: "Where do you want to be in a year?",
    a: [
      "Somewhere I picked.",
      "That is the whole answer and it is not a small one. I am thirty-eight and I genuinely could not tell you which parts of this life I chose on purpose and which parts I just kept agreeing to until they hardened.",
      "I am not lost. I am somewhere, and I do not know where it is yet. Those are different.",
    ],
  },
];
