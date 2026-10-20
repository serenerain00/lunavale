#!/usr/bin/env bash
#
# import-clips.sh — the vertical cuts, the ones that ran on Instagram.
#
# These are 9:16 and already public, which is what makes them a separate
# category rather than more scenes: they will not sit in a 16:9 rail without
# looking broken, and they have nothing to be gated behind.
#
# Sources are camera-named exports in stories/withAudio/. This file is the only
# record of which is which, so it is written down rather than remembered. Each
# was identified by pulling frames at 15%, 45% and 75% of its runtime.
#
# Usage: ./scripts/import-clips.sh [slug ...]     (no args = all)
set -euo pipefail
cd "$(dirname "$0")/.."

# slug|source|poster seconds|end seconds (optional)|preview seconds (optional)
#
# END SECONDS trims trailing black, the same field `optimize-media.sh vertical`
# has carried since luna-josh-rain arrived with 6.6s of it. Measure it —
# `ffmpeg -vf blackdetect` — rather than eyeballing, and remember the runtime
# printed at the end of a run is the PROXY's, which is the number clips.ts
# wants.
#
# PREVIEW SECONDS cuts <slug>-preview.proxy.mp4, the public opening of a gated
# clip — always from 0:00, always from the PROXY rather than the source, and
# never fading in, because a clip preview has no hookStart to arrive at (see
# Clip.preview). Set it only where clips.ts gates the clip; a preview file with
# nothing pointing at it is dead weight in Blob.
#
# Scenes get theirs from scripts/make-previews.mjs, which walks videos.ts and
# does not know clips exist. Rather than teach it a second content kind for one
# entry, the cut lives here beside the import that produced the proxy.
CLIPS=(
  # Daylight, running, headphones in. The one clip here that is not intimate.
  "run-at-the-lake|stories/withAudio/ScreenRecording_07-20-2026 08-46-45_1.mov|31"
  # Apartment at night, city in the window.
  "apartment-window|stories/withAudio/ScreenRecording_07-12-2026 23-37-11_1.mov|15"
  "close-quarters|stories/withAudio/3F0761B4-7985-4C8B-8CE2-EAE508DAE5D1.MP4|8"
  "still-awake|stories/withAudio/ScreenRecording_07-09-2026 22-06-35_1.mov|32"
  "morning-after|stories/withAudio/copy_2983A1B7-D3AE-4D16-BA2A-8385701504AC.MOV|23"
  "said-out-loud|stories/withAudio/copy_F73B2C7E-2355-459B-9F22-D84FDE635960.MOV|10"
  # NEW YORK, vertical. Melissa, 2026-09-08, dropped beside the landscape cut
  # in the same folder — so this is the first clip whose source is a scene
  # folder rather than stories/withAudio/, and it does not need identifying by
  # frame content because it arrived named.
  #
  # IT IS ITS OWN EDIT, not a crop of luna-ty-nyc-hotel. 250.1s against the
  # landscape's 294.8, and where that cut opens on the lobby and takes its time
  # arriving, this one is faces from the first frame: close, closer, and the
  # room only where it has to be. 1320x2208 (0.598 — a shade wider than 9:16,
  # which the player handles: see VerticalPlayer, which lets the element size
  # itself rather than forcing an aspect).
  #
  # hevc 60fps in, h264 at 720 wide out, same as every other clip here.
  #
  # NO TRAILING BLACK — blackdetect across the whole file finds none, so no
  # `end`, the same as the landscape master it came from.
  #
  # Unscored at -32.3 dB, matching the landscape cut to within 0.3 dB. If a
  # scored mix ever arrives, it arrives for both and both get re-imported.
  #
  # POSTER AT 24s: the two of them close at the bar, both faces readable. It
  # sits INSIDE the public first minute on purpose — same rule as
  # ty-josh-fight — so the card promises something anybody can actually watch.
  #
  # PREVIEW 60s, and it is the first on a clip. Melissa, 2026-09-08: "behind
  # membership. show the first 1min." Four times the fifteen seconds a scene
  # gets, deliberately — a scene's window is bait for a scene, and this one has
  # to carry a whole vertical cut on its own.
  "luna-ty-nyc-vertical|stories/luna-ty-nyc-hotel/luna-ty-nyc-IGvertical.mov|24||60"
  # THE BLONDE GUY, cut for Instagram. Melissa, 2026-09-09, dropped beside the
  # full scene it comes from (ty-luna-blonde-guy-bar).
  #
  # NEARLY SQUARE — 1320x1256, which is 1.05 and the first clip here that is
  # neither 16:9 nor 9:16. It plays correctly: VerticalPlayer lets the element
  # size itself rather than forcing an aspect. The POSTER is the compromise —
  # `vertical` crops posters to a true 9:16 so the grid tiles evenly, and on a
  # 1.05 source that keeps the middle 53% of the width. So the poster second
  # below is chosen for a frame that SURVIVES that crop, not just for a good
  # frame; a two-shot would lose one of the two people.
  #
  # IT IS SCORED, and it is the only cut of this material that is: -26.3 dB
  # against the full scene's -30.9. Worth knowing that a scored mix of these
  # beats exists — if a scored export of the whole scene ever follows, the
  # standing rule applies and import-cuts.sh should point at it.
  #
  # hevc 60fps in, h264 at 720 wide out.
  #
  # TRIMMED AT 89.0s. The delivered file runs 96.8s and blackdetect puts 7.7s
  # of black on the end — by some way the longest tail any clip here has had,
  # and the reason this manifest learned an `end` field.
  #
  # POSTER AT 1s: Tyson centered, walking in, before any of it has happened.
  # It survives the 9:16 crop, it is unmistakably him, and it gives nothing
  # away. Considered: 25s (Luna lit and looking up, the better hook for a
  # stranger — and she is beside a man nobody knows, which reads as her scene
  # with him when the whole point is that this scene is Tyson's) and 61s (his
  # face mid-confrontation, the most arresting frame in the cut and the
  # violence).
  # RENAMED 2026-09-10 to ...-ig.mov. The path here was stale and a re-import
  # would have failed outright — which is the good failure, but only if
  # somebody runs it.
  # HER PLACE, added 2026-09-11 — the Instagram cut from
  # apt-luna-tyson-argue/v2/. Square, 1320x1280, like the-blonde-guy, so the
  # clip entry declares `aspect`.
  #
  # THE FOLDER SAYS "ARGUE" AND THE CUT DOES NOT. The full master beside it
  # (ty-luna-apt.MP4, 287MB, unimported) may well open on a fight; these
  # sixty-five seconds are the other half — foreheads together, his hand on
  # her jaw, and a kiss. Titled off what is in the file rather than off the
  # folder name, which is how you end up calling an intimate cut "The
  # Argument".
  #
  # POSTER AT 48s: both faces, both hands, her forearm tattoo in frame. The
  # closer frames around 34 are a mouth filling the card, which is the wrong
  # thing to meet on a public grid.
  #
  # NO TRIM. Runs to its last frame at luma 11.8 — no black anywhere, which is
  # the first delivery in five to arrive that way.
  "her-place|stories/apt-luna-tyson-argue/v2/luna-ty-apt-ig-short.mov|48"

  # ONE WEEK IN — the Instagram cut of `luna-lkehouse-wine-shatter` ("The
  # Glass"), added 2026-09-13. Vertical, 1320x2238, 2:00, scored.
  #
  # THE THROW IS NOT IN IT, and that is the whole reason this split works.
  # Melissa: "she ends up breaking her glass against the wall - but thats in
  # the membership full video." The scene throws at 2:16; this clip ends at
  # 2:00. So the free cut is two minutes of a woman holding it together and the
  # paid one is the fourteen seconds where she stops — which is the cleanest
  # free/paid line any pairing on this site has.
  #
  # POSTER AT 8s: her face, hand at her head, crying. It is the strongest frame
  # in the cut for a portrait card and it gives away nothing at all.
  #
  # END=118.5 — the picture holds to about 118.5 and is black by 119.
  "one-week-in|stories/luna-lkehouse-wine-shatter/luna-wine-crash-clip.mov|8|118.5"

  # THE PILOT INTERVIEW, added 2026-09-10. A film crew comes to the lakehouse
  # and sits Luna down — 46s, shot 9:16, made to promote the pilot dropping
  # this month. Not a scene from the story: it is the story being talked about.
  #
  # POSTER AT 14s and it is the whole pitch in one frame — her on the sofa with
  # the mug, the lake and the sunset through the glass behind her, and the
  # camera rig in the foreground. It says "interview" without a word of copy.
  # 8s is the better portrait of her and says nothing about what this is.
  #
  # END=45.3. It fades to near-black by 43 (luma 2.8) and goes truly black at
  # 45.5; the fade is part of the edit and stays.
  "pilot-interview|stories/pilot-interview.MP4|14|45.3"
  "the-blonde-guy|stories/ty-luna-blonde-guy-bar/luna-ty-blonde-guy-short-music-ig.mov|1|89.0"

  # WHERE TO WATCH, added 2026-10-20 — Luna to camera in a bright studio,
  # telling people the series is on lunavale38.com and to start with Episode 1.
  # 21s, 1080x1920, 24fps. Out of the story, like pilot-interview: it is the
  # show talking about itself. Free; it runs on Instagram.
  #
  # POSTER AT 19.5 would be the end card; 17s is her smiling, which sells it.
  # NO END: blackdetect flags 18.4–21.0, but that is the "Between Us now
  # streaming" card (small white text on black), part of the edit.
  "luna-brief-about-site|stories/luna-brief-about-site.MP4|17"

  # THE RAIN, added 2026-10-02 — Luna and Tyson in a downpour at night.
  # Vertical, 1320x2230, 60fps, scored. Members only, no preview: the middle
  # 30s goes to Instagram, and that is the public window.
  #
  # THE DIALOGUE IS TURNED DOWN ON PURPOSE (Melissa): this happens a year or
  # two ahead of the story, at whenever Tyson tells her, so what they say is
  # not for hearing yet. Never "fix" the mix.
  #
  # POSTER AT 2s: both of them, her looking up at him, before anything has
  # happened. Gives nothing away; the kiss frames from ~150s do.
  #
  # END=286.5. Picture is black from 279.8 but the score runs on under it to
  # 286.5 — kept, the same way music leads these mixes. Only the last 1.2s of
  # silence goes.
  "luna-ty-rain-ig|stories/luna-tyson-rainstorm/luna-ty-rain-ig.mov|2|286.5"

  # THE COUCH, added 2026-10-03 — Luna and Josh, close and intimate, faces
  # throughout. Vertical, 1320x2234, 60fps, scored. Free: it is on Instagram.
  #
  # POSTER AT 86s: the closing kiss, both faces, warm and readable. Most of
  # the cut is a mouth or a throat filling the frame, which is the wrong thing
  # to meet on a public grid — the same reason her-place moved off 34s.
  #
  # END=87.7. blackdetect puts black from 87.76 to the end.
  "luna-josh-couch|stories/luna-josh-couch/luna-josh-couch.mov|86|87.7"

  # AFTER THE DETECTIVES, added 2026-10-06 — Luna confronts Josh, the night
  # before she goes to Tyson (luna-ty-detectives). Near-square, 1320x1282,
  # 60fps, scored. Free: it is on Instagram.
  #
  # POSTER AT 60s: both faces, her mid-line, him turned to her. Readable and
  # not the grab — 75s is the physical stretch and the wrong thing to meet on
  # a grid.
  #
  # END=111.0. blackdetect puts black from 110.99; "Who?" lands at ~110 and is
  # the last line, so nothing spoken is lost.
  "luna-josh-fight-45m|stories/josh-luna-fight-45m/luna-josh-fight-45m.mov|60|111.0"

  # THE JOURNAL MEMORY, added 2026-10-07 — Luna reading her old journal,
  # cut against early mornings with Josh: eggs, painting, the barn. From the
  # episode 3 material (stories/ep3/). Vertical, 1320x2222, 60fps, scored.
  # Free: it is on Instagram.
  #
  # POSTER AT 3s: her, smiling down at the open journal. Says what the piece
  # is in one frame.
  #
  # END=176.0. blackdetect puts black from 176.02; nothing is said after 2:58.
  "luna-josh-journal-mem|stories/ep3/luna-josh-journal-mem.mov|3|176.0"

  # LUNA AND JOSH, IN BLACK AND WHITE, added 2026-10-10 — the Instagram cut
  # of `luna-josh-bed-land`. Vertical, 1320x2212, 59.94fps, scored. MEMBERS
  # ONLY (Melissa) — so no preview: a gated post with no window is a closed
  # door, the right treatment for a love scene (see Clip.preview).
  #
  # POSTER AT 25s: the kiss. Withheld on the index anyway while gated.
  #
  # NO END: black from 169.1, the song fading under it to the end.
  "luna-josh-bed-ig|stories/luna-josh/luna-josh-bed-ig.mov|25"

  # THE CALL FROM THE FIELD, 2026-10-14 (Melissa: "tyson calling from the
  # field... about 28... getting close to tyson getting out of the navy, still
  # on deployment"). Vertical, 1320x2208 like New York, hevc 60fps, scored.
  # Arrived as stories/tyson-luna-callFromField/; the slug is that name
  # hyphenated, since ids are lower-case.
  #
  # FIRST MINUTE FREE, rest members (Melissa). The preview runs to 67.5s, not
  # 60: "Because you know I'm right" ends at ~67.45 and the shot changes at
  # 67.56; at 60.0 it would cut "It's purple and it has protein" in half.
  #
  # POSTER AT 10s: Luna laughing on the phone, drink in hand (the "purple"
  # drink) — inside the free minute. 45s was Tyson, but cropped to half a face.
  #
  # NO END: black from 130.5, the score fading out under it to the end.
  "tyson-luna-call-from-field|stories/tyson-luna-callFromField/luna-ty-call-field.mov|10||67.5"
)

want=("$@")
for entry in "${CLIPS[@]}"; do
  IFS='|' read -r slug src at end preview <<<"$entry"
  if [ ${#want[@]} -gt 0 ]; then
    match=0
    for w in "${want[@]}"; do [ "$w" = "$slug" ] && match=1; done
    [ $match -eq 1 ] || continue
  fi
  # "-" for an unset `at` so an omitted poster second cannot slide `end` into
  # its place, the same guard import-cuts.sh uses.
  ./scripts/optimize-media.sh vertical "$slug" "$src" "${at:--}" "${end:-}"

  # Cut from the proxy the line above just wrote, so the public minute is
  # bit-for-bit the opening of the file a member gets rather than a second
  # encode of the source.
  if [ -n "${preview:-}" ]; then
    ffmpeg -nostdin -y -loglevel error \
      -i "stories/$slug.proxy.mp4" -t "$preview" \
      -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p \
      -c:a aac -b:a 128k -movflags +faststart \
      "stories/$slug-preview.proxy.mp4"
    printf '%-26s preview %ss\n' "$slug" "$preview"
  fi
done
