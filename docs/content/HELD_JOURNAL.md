# Held journal entries

Written, finished, and deliberately **not on the site**.

Melissa, 2026-09-28: *"dont post anything about the detective scene since that
hasnt technically happened yet."* The detectives scene is the latest point in
the story, and the journal runs in story order, so a page about it would be
Luna writing about something that has not happened to her yet.

Each block below is a complete `JournalEntry` in the exact shape
`lib/content/journal.ts` uses. **To publish one:** paste it back into
`journal.ts` in story order (both belong at the very end), update `addedOn` to
the day it goes up, and run `npm run health`, which checks that its
`sceneSlug` resolves.

Order matters between them: `josh-said-nothing` is the hour before,
`forty-five-minutes` is the night of.

```ts
  /*
    THE CALL, added 2026-09-28. The hour before `luna-ty-detectives`, which
    only refers to it: "I called Josh because I thought he'd tell me. He
    didn't." and, earlier, "What did Josh say?" / "Nothing. Which was weird."

    THE PAGE IS THE WORD "WEIRD" TAKEN SERIOUSLY. Josh is the man who owns a
    dinner table and lands the truck story forty times (`everybodys-josh`);
    silence from him is the loudest thing he could do. She notices that, and
    notices that he asked no questions — the same tell she catches Tyson in an
    hour later ("you knew what they were asking me before I finished"). She
    does not connect the two. The reader can.

    WHAT IT MUST NOT DO: name the accident, Rick, a death, or anything the
    detectives actually asked. Canon is only that they asked about Josh and
    Tyson and knew a great deal about her. It also says nothing about where
    she and Josh stand by this point, which is not settled on the site.

    Invented and hers to cut: "okay", "I'll call you", the car park.

    DRAFT PROSE. Replace it.
  */
  {
    id: "josh-said-nothing",
    addedOn: "2026-09-28",
    dateline: "Still in the car park, and I have called Josh",
    place: "lakehouse",
    about: ["luna", "josh"],
    access: "premium",
    mature: false,
    body: [
      "I am writing this in the car because I cannot drive yet. My hands are fine. It is the rest of me.",
      "I called Josh first. Before my mother, before anybody. I sat in this car park and rang him because whatever else is true, he is the one who always has something to say. He has never in ten years walked into a room and not known what to do with it.",
      "I told him all of it. The room, the two of them, forty-five minutes. That they asked about him. That they asked about Tyson. That they knew things about me that I have never told anybody I have not met.",
      "And he let me talk. That was the first strange thing. Josh does not let anybody talk. He interrupts because he already knows where you are going and he wants to get there first.",
      "When I stopped there was a silence long enough that I said his name to check the line.",
      "He said okay.",
      "Not what did they ask. Not what did you tell them. Not are you all right, which I would not have wanted but would have recognised. Okay. And then that he would call me, and then he was gone.",
      "I have sat here for twenty minutes trying to make that into something ordinary and I cannot. He did not ask a single question. Everybody asks. My mother would have asked forty. A stranger would have asked what the detectives were like.",
      "He did not ask because he did not need to. I do not know what that means and I am not going to write down what I am afraid it means.",
      "He has not called.",
      "So I am going to ask Tyson. Tyson tells me the truth. That is the one fixed thing in my life and it has been since a car park behind a Waffle House, and I am going to go and stand in front of it.",
    ],
  },
```

```ts
  /*
    FORTY-FIVE MINUTES, added 2026-09-28, against `luna-ty-detectives`. The
    latest thing on the site, and the page sits last for the same reason.

    WHAT IT KNOWS IS WHAT SHE KNOWS: two detectives, questions about Josh and
    Tyson, how much they knew about her, Josh saying nothing, and Tyson
    telling her to leave it alone because "the less you know, the less you can
    tell them". It names no accident, no death and no Rick — §8 of
    docs/content/BETWEEN_US_SECRET_CANON.md has her short of Stage Four here,
    and the addition of 2026-09-24 is explicit that she does not know what
    she is standing next to.

    TWO CALLBACKS CARRY IT. The rule from `the-rule` ("then we do not do that.
    Either of us. Ever."), which she calls in and loses — and her own line from
    `what-i-would-say`, "it did not say anything about what we are allowed to
    not say", which she wrote as a clever observation and now has turned on
    her. That is the whole scene.

    THE SENTENCE IN THE CAR IS THE BREADCRUMB MELISSA ASKED FOR: this ties
    back to `the-year-he-went-quiet`, where Tyson's one answer was "I would
    have lost the whole thing". She remembers that a sentence has come back.
    She does not write it down and she does not work out why. A reader who has
    read both pages does the rest.

    Lines from the scene: "Don't protect me by making me the stupidest person
    in the room", "No secrets, remember?", "I've got you", "Don't".

    DRAFT PROSE. Replace it.
  */
  {
    id: "forty-five-minutes",
    addedOn: "2026-09-28",
    dateline: "Late, and I have locked a door I never lock",
    place: "lakehouse",
    sceneSlug: "luna-ty-detectives",
    about: ["luna", "tyson", "josh"],
    access: "premium",
    mature: false,
    body: [
      "Forty-five minutes. A room with a table in it and two people across the table who were very polite to me, which I have since decided was the worst part.",
      "They asked about Josh. They asked about Tyson. They knew my name before I said it. They knew where I live. They knew how long I have known him, to the year, and they said it the way you say something you have written down.",
      "I answered everything, because I did not know a single thing worth not answering. I have never felt so stupid in my life, and I have been in some rooms.",
      "Josh said nothing. So I went to Tyson.",
      "I did the thing. I went quiet and I got close and I waited, and he gave me the silence right back, and for about a minute we were nineteen in my mother's kitchen and it was almost funny. Then I said no secrets, remember, and I watched it land, and it did not work.",
      "It has always worked. That is the entire point of it.",
      "He told me I do not need to know anything else. He told me to leave it alone. And when I asked him why — I asked him three times — he said the less I know, the less I can tell them.",
      "Tell them what.",
      "I have been sitting here for two hours with that sentence. Not what it is hiding. What it is. It is a man deciding, on my behalf, standing in a kitchen, that the safest place for me is not knowing. And I believe he thinks it is kindness. I believe that completely, and it is making it much worse.",
      "I told him not to protect me by making me the stupidest person in the room. I meant every word. And he said he has got me, and I said don't, and he didn't.",
      "Here is the part I keep coming back to, and I am the one who wrote it. A few weeks ago, in this book, pleased with myself: the rule was we do not lie to each other, and it did not say anything about what we are allowed to not say.",
      "I thought I had found a loophole I was using. I did not know he had been living in it.",
      "There is a sentence he said to me in a car when I was twenty-nine that I have not thought about in years. I have thought about it four times tonight. I am not going to write it down. I do not know why it has come back, and I would very much like it to go away again.",
      "I am in this house on my own and I have locked the back door, which I have never once done in this house. I do not even know who I have locked it against.",
    ],
  },
```

