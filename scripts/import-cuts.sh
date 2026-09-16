#!/usr/bin/env bash
#
# import-cuts.sh — the manifest of which assembled cut belongs to which scene.
#
# Each shooting folder under stories/ holds dozens of raw takes beside the one
# finished edit. This file records that choice explicitly, so re-deriving the
# web copies is repeatable and so the decision is reviewable in a diff rather
# than living in someone's memory.
#
# Deliberately NOT imported:
#   luna-tyson-lakehouse/  lunatylakehouse.mp4 and lakehouse.mp4 are the same
#                          281s cut already published as tyson-luna-lakehouse-
#                          fire ("Fireside"). 0714 (1).mp4 is a different 7:21
#                          cut — possibly an extended version, needs a decision.
#   tyson-luna-park-fight/ nomusic.mp4 is the published tyson-park-fight cut
#                          without its music bed.
#   apt-luna-tyson-argue/  raw takes only (6–15s), no assembled edit yet.
#   josh-tyson-farm/       ditto.
#   luna-lakehs-bed/       ditto.
#   ty-josh-tractor/       stills only.
#
# Usage: ./scripts/import-cuts.sh [slug ...]     (no args = all)
set -euo pipefail
cd "$(dirname "$0")/.."

# AUDIO. The scored mixes live in stories/withAudio/ under camera filenames.
# Sources below were matched to scenes by frame content at 40% duration plus
# duration, not by filename — the names carry no meaning and guessing would
# put the wrong soundtrack under the wrong scene.
#
# Measured with `ffmpeg -af volumedetect`, four scenes turned out to ALREADY
# carry the scored mix, because the cut in the scene folder was itself
# exported with it (identical mean volume, to the decibel):
#   luna-bathtub              -14.3 dB   = ScreenRecording_07-13-2026 20-01-01
#   luna-josh-house           -19.4 dB   = ScreenRecording_07-12-2026 20-38-29
#   tyson-luna-lakehouse-fire -27.0 dB   = ScreenRecording_07-14-2026 22-43-02
#   tyson-park-fight          -22.0 dB   = ScreenRecording_07-16-2026 21-35-46
# Those keep their existing, higher-resolution sources — re-pointing them at a
# screen recording would cost picture quality and gain nothing.
#
# slug|source path|poster seconds (optional, default 3)|end seconds (optional,
#                                    trims trailing black; default = whole file)
#      |fade seconds (optional; fade to black with the sound on the same curve,
#                     applied to the proxy only. Default = no fade, cut ends
#                     on its last frame.)
CUTS=(
  # The night she leaves — 5:44, and already scored. Note the crossed names:
  # the folder is josh-luna-break, the cut inside it is luna-josh-break.mp4,
  # and the slug follows the CUT because that is what Melissa calls it.
  #
  # Poster at 25s: the two of them in profile under the lamp, before any of it
  # has happened. The opening eleven seconds are Josh alone in a hallway, which
  # on a card reads as a scene about him.
  "luna-josh-break|stories/josh-luna-break/luna-josh-break.mp4|25"
  "luna-tyson-bar|stories/luna-tyson-bar/luna-tyson-bar.mp4"
  # Josh and Tyson on the tractor — the two men, no Luna. Poster at 20s,
  # past the sunrise establishing shots and onto the pair working.
  "josh-tyson-barn|stories/josh-tyson-farm/josh-ty-barn.mp4|20"
  # The coffee Josh called about, which restarts everything. Identified from
  # the footage plus the story beat; it had no shooting folder of its own.
  "luna-josh-coffee|stories/withAudio/ScreenRecording_07-12-2026 08-15-54_1.mov|85"
  # THE SCORED EXPORT ARRIVED (Melissa, 2026-08-13), and this line is why the
  # note above it is gone. The published cut was stories/luna-josh-bed/0715.mp4
  # at -91 dB — digital silence, not a quiet mix — and nothing in withAudio/
  # matched it, so the scene has been streaming mute since it went up.
  #
  # The replacement is NOT the same picture with music over it. It runs
  # 151.8s against 86.3s, so sixty-five seconds of edit are new, and the
  # source folder is different too (luna-josh-room/, not luna-josh-bed/).
  # Audio measures -29.4 dB mean / -6.6 dB peak — a real scored mix.
  #
  # Poster at 6s: the new cut opens on a slow fade up off black, and a grab at
  # the default 3s lands on a near-empty frame.
  "luna-josh-bed|stories/luna-josh-room/luna-josh-bed.mov|6"
  # Her lying awake, and the night she goes back to. A DIFFERENT SCENE from
  # luna-josh-bed above, despite the folder name pointing at the same bed —
  # this one is framed in the present, in color, with the memory of Josh
  # graded sepia in the middle of it. Slug says flashback for that reason.
  #
  # Two masters were delivered (Melissa, 2026-08-17). Taking the .mov:
  #   luna-josh-bed-flashback-music.mov  133.5s  1316x802   -26.3 dB  SCORED
  #   luna-flashback-bed.mp4             127.5s  1920x1080  -39.9 dB  silent
  # The mp4 is the sharper file and the wrong one — near-silent, and six
  # seconds shorter, so it is a different edit rather than the same picture
  # waiting for a soundtrack. Same call as every other scored mix here: the
  # music is the scene, the pixels are the trade.
  #
  # 1316x802 is 1.64, so it pillarboxes slightly in the 16:9 player — between
  # the wall's 1.61 and luna-tyson-casey-bar's 1.55, both of which already do.
  #
  # Trimmed at 129.7s: delivered with 3.7s of black on the end (blackdetect,
  # not eyeballed), the same way the Casey cut arrived.
  #
  # Poster at 24s: the last of the present-day color before the memory takes
  # over — her awake on the pillow. The default 3s is her asleep, which sells
  # the scene as a woman sleeping, and anything past ~32s is the flashback and
  # would put Josh on a card that is about her being without him.
  "luna-josh-bed-flashback|stories/luna-flashback-bed/luna-josh-bed-flashback-music.mov|24|129.7"
  # Mexico. SCORED CUT, swapped in 2026-08-17, and the first entry here for a
  # scene that was ALREADY LIVE — the beach has been published since July off a
  # source that predates this manifest.
  #
  # The one it replaces was not silent, which is worth stating because every
  # other swap in this file was: the published proxy measured -28.2 dB, a
  # normal level. The new master is -16.1 dB mean / -2.5 dB peak, the loudest
  # mix in the library. So this is a louder, fuller mix over a scene that
  # already had sound, not a rescue of a mute one.
  #
  # NOT just the old picture with music laid over it. Sampled against the
  # published proxy at matching timestamps: some beats line up frame for frame
  # and others do not sit in the same place at all, so the edit moved too.
  #
  # THE PICTURE COST MORE HERE THAN ANYWHERE ELSE IN THIS FILE. The cut being
  # replaced came from stories/josh-luna-beach/luna-josh-beach.mp4, which is
  # 1920x1080 and true 16:9 — the best source any scene had. The scored master
  # is 1320x804 (1.64), so the beach now pillarboxes slightly in the player
  # like the wall and the Casey bar do, and its proxy is built from an 804-line
  # source rather than a 1080-line one. Melissa's call, 2026-08-17, asked for
  # directly. Worth an export at 16:9 whenever she is back in the timeline —
  # the old master is still in the folder and this is reversible by pointing
  # this line back at it.
  #
  # Trimmed at 285.0s. The delivered file runs 292.4s and the last 7.3s are
  # black (blackdetect) — which is nearly the whole of the "8 seconds longer
  # than the old cut" difference, so the picture is about the same length.
  #
  # Poster at 77s: the surf kiss. Chosen to reproduce the beat of the poster
  # this replaces, which was hand-picked rather than grabbed at the default
  # 3s, so the card does not change out from under a scene people have already
  # seen. Frames a few seconds later are stronger and barer, and this one sits
  # at a permanent ungated URL, so it takes the earlier one.
  #
  # FADE, 3s, added 2026-08-17 at Melissa's request and the first use of the
  # field. The scored master stops dead on a held frame with the music still
  # running, which reads as the file ending rather than the scene ending. Three
  # seconds is long enough to feel like a decision and short enough not to eat
  # the last beat: the picture goes at 282.0s, on the two of them in the water,
  # and the music goes down with it.
  #
  # The MASTER is untouched. This lives on the derived copy, so clearing the
  # field and re-running puts the hard ending back.
  "luna-josh-beach|stories/luna-josh-mexico/luna-josh-mexico-music.mov|77|285.0|3"
  # The garage, and the first scene that room has had — `the-garage` gallery
  # has been sitting there since 2026-08-05 with no scene to point at.
  #
  # NO MUSIC, and that is the delivery, not an oversight (Melissa, 2026-08-19).
  # It measures -35.5 dB, which is where a dialogue-only mix sits, and there is
  # no scored export to wait for. Do NOT go looking in withAudio/ for one, and
  # do not read the level as a fault: this scene is two people talking and the
  # words are the whole of it.
  #
  # Trimmed at 456.3s. The delivered file runs 505.9s and the last 49.5s are
  # black — by far the longest tail yet, and it would have put nearly a minute
  # of nothing on the end of durationSeconds.
  #
  # FADE, 3s, Melissa 2026-08-19: keep the trim, but do not let it stop dead.
  # The 49.5s of delivered black was the export padding rather than an ending,
  # so cutting it left the scene ending on a hard frame; this puts a real one
  # back at 453.3s. Same 3s as the beach, so the two scenes that fade do it
  # identically rather than each having its own house style.
  #
  # Poster at 88s: the two of them facing each other mid-argument. Earlier
  # frames are Tyson bent over the bike with Luna soft behind him, which sells
  # a scene about a man doing a job, and 47s is a good portrait of her alone
  # that makes it look like a solo scene. This is a two-hander and the card
  # says so.
  "ty-luna-garage|stories/luna-ty-garage/ty-luna-garage.mp4|88|456.3|3"
  # THE SIX MONTHS — a montage, not a scene, and the only entry in this file
  # that is one. It is Luna and Tyson across the whole stretch she was without
  # Josh: the talking, the arguments, the nights she could not breathe, and him
  # there for all of it. Cut and scored by Melissa (2026-08-19).
  #
  # Has music, and plenty of it: -16.8 dB mean / -1.3 dB peak, the second
  # loudest mix in the library after the beach.
  #
  # 1824x1080 (1.69), so it pillarboxes slightly like the wall and the beach.
  #
  # Trimmed at 352.9s — 11.5s of black on the end, and the picture does NOT
  # fade into it: checked frame by frame at 348/350/351/352, it is at full
  # brightness and then gone, with the music still at -17.8 dB. So it stopped
  # rather than ended.
  #
  # FADE 3s, the same as the beach and the garage. Applied without being asked
  # this time, because the two before it were asked for and a montage that cuts
  # dead mid-smile is the case the field was added for. One edit to remove.
  # Unlike the garage, the audio fade does real work here — there is a full
  # music mix running right up to the cut.
  #
  # Poster at 300s: the two of them at the bar, facing each other, her talking
  # and him listening. Deliberately NOT one of the bed frames, which are warm
  # and would put these two in a bed on a public card — they never got there,
  # and the card should not say otherwise. Also not the snow sign, which reads
  # as a couple's photograph for the same reason.
  "ty-luna-six-months|stories/mashup/luna-ty-mashup-compressed-full.MOV|300|352.9|3"
  # THE BATHROOM. Two weeks after she leaves, Josh will not stop ringing, she
  # finally picks up, and it takes her apart. Tyson is in the house and she
  # calls him in. Melissa, 2026-08-20.
  #
  # NO MUSIC — -29.4 dB, dialogue and breathing, and that is the delivery. Do
  # not go looking for a scored version.
  #
  # THE FULL CUT, swapped in 2026-08-20. The first version published here was
  # luna-ty-panicattackbathroom.mp4 and it opened with her already coming
  # apart. This one runs 6:31 against 2:57 and puts the CALL in front of it:
  # about three and a half minutes of the bedroom, the phone going, her
  # answering, and the argument — which is the thing that causes everything the
  # old cut opened in the middle of.
  #
  # The published cut is exactly the tail of this one. Verified rather than
  # assumed: old t=12 and new t=226.4 are the same frame, so the offset is
  # 214.4s and nothing in the back half was re-edited. That is why the poster
  # time below is the old 168 plus that offset.
  #
  # Trimmed at 390.4s: 0.9s of black, and the picture does not fade into it.
  #
  # FADE 3s, unchanged and for the same reason — the scene ends on the two of
  # them gone quiet, and a hard cut undoes the coming-down.
  #
  # Poster at 382.4s: the same frame the card has always used, her face and his,
  # both calm. NOT one of the frames of her mid-attack — those are the honest
  # center of the scene and also a woman at the worst moment of her month, and
  # a poster sits at a permanent ungated URL where anybody can meet it cold.
  "luna-ty-panic-attack|stories/luna-ty-panic-attack/luna-panicAttack-full.mp4|382.4|390.4|3"
  # THE DRIVEWAY. Josh is going away for three days, and it takes them the
  # length of the scene to let go of each other. Melissa, 2026-08-25.
  #
  # BEFORE THE BREAKUP — her placement, handed over with the footage. Inside
  # the ten years, so nothing between them is guarded yet.
  #
  # THIS IS THE UNSCORED CUT, AND IT IS TEMPORARY. -31.8 dB mean / -6.5 dB
  # peak, and the spectrogram is broadband with no sustained bands anywhere in
  # it: wind, the truck, and the two of them. Unlike the garage and the
  # bathroom, that is NOT the delivery — Melissa is exporting the mix with the
  # music and will upload it (2026-08-25, "I'll upload the one with music
  # later").
  #
  # WHEN IT LANDS: point the source below at the scored file and re-run this
  # slug, the same swap already done for luna-josh-bed, the beach and the
  # flashback. Re-check `durationSeconds` in lib/content/videos.ts against what
  # the import prints — a rescored export is usually a slightly different edit,
  # not the same picture with sound on it — and re-check the poster second and
  # the fade, which are both timed against THIS cut. Standing house rule: the
  # scored mix wins, even when it costs resolution or shape.
  #
  # NO TRAILING BLACK — blackdetect at pic_th=0.95 across the whole file, not
  # just the tail, finds none. So no `end` on this line, and it is the first
  # entry here to fade without trimming first.
  #
  # FADE 2s, the one line in this file that is not the house 3s. The last shot
  # is her alone in the drive once the truck is out of it, and it runs about
  # four seconds; a three-second fade would sit over nearly all of it and take
  # away the thing the scene ends on. Two seconds leaves her the look and still
  # takes the engine down rather than cutting it dead.
  #
  # Poster at 28s: the two of them holding on to each other beside the truck,
  # the porch and the whole of the light behind them. The frames after 88s are
  # better — her face, after — and they are also the ending, which a card
  # should not give away before anybody has pressed play.
  "luna-josh-truck-leaving|stories/luna-josh-truck-leaving/luna-josh-truck-leaving.mp4|28||2"
  # THE CAR PARK, and it is the second half of a night the site already has.
  # Melissa, 2026-08-26.
  #
  # IT PICKS UP FROM "Your Date" (luna-tyson-casey-bar) with about two hours in
  # between. That scene ends on "I'll let you get back to your date"; Tyson and
  # Casey leave, LUNA STAYS, and she keeps drinking bourbon on her own until
  # closing. This is what is waiting outside when she finally walks out.
  #
  # COLE IS THE MECHANISM AND IS NEVER ON CAMERA. He watches her all night, and
  # when she leaves he rings Tyson — she has been drinking, she has just gone,
  # she is going to try to drive. That call is why Tyson is standing in a car
  # park instead of wherever he went with Casey, and none of it is on screen.
  # Do not "fix" that in a recut: the whole scene is a man arriving out of
  # nowhere, which is what it looks like to her too.
  #
  # NO MUSIC in this cut — -30.0 dB mean / -4.6 dB peak, traffic and the two of
  # them. The Casey scene it follows is also unscored, so the pair are
  # consistent; if a score is made for one it should be made for both.
  #
  # EXTENDED CUT, swapped in 2026-08-26 the same evening the first one went up.
  # Same filename, so this line does not change — only the numbers do. The
  # picture goes from 3:14 to 5:02.
  #
  # IT IS PURELY AN EXTENSION, verified rather than assumed: frames at t=20,
  # 100 and 180 are identical to the cut it replaces, and the 0.2s dip to black
  # at 5.6s is in both. So the first 194s are untouched and 108s are new on the
  # end. That is why the poster time below is unchanged — the card does not
  # move under a scene people have already seen.
  #
  # WHAT THE NEW MINUTES ARE: the drive keeps going, they arrive somewhere, and
  # the last ninety seconds are the two of them alone in a room. See the note
  # in lib/content/videos.ts — the room is not the lakehouse Melissa described
  # and identifying it is her call, not a guess to make in a manifest.
  #
  # Trimmed at 302.4s. The delivered file runs 398.8s and the last 96.3s are
  # black AND silent (-91 dB, digital silence) — export padding, and by far the
  # longest tail in this file. The 0.2s dip at 5.6s is an edit and stays.
  #
  # FADE 3s, unchanged. The picture is at full brightness at 301 and gone at
  # 302.4, so it still stops rather than ends, and the new last shot is a held
  # close two-hander that a hard cut would wreck.
  #
  # Poster at 170s, UNCHANGED and now a third of the way in rather than near
  # the end: the two of them against the truck once she has come down, both
  # faces. Still not one of the frames of her sobbing, and still not the cab.
  # Nothing in the new material is a better card and one of them would give
  # away an ending that is the whole point of the extension.
  "luna-ty-bar-drunk|stories/luna-ty-bar-drunk/luna-ty-bar-drunk.mp4|170|302.4|3"
  # THE KITCHEN. Fifty-three seconds at the lakehouse: he says he is going out,
  # will not say where, and she asks him who she is. Melissa, 2026-08-28.
  #
  # THE SLUG FOLLOWS THE CUT, NOT THE FOLDER — same rule as luna-josh-break at
  # the top of this file. The shooting folder is stories/luna-ty-outforabit/,
  # named for his line; the cut inside it is luna-ty-wasntplanningonit.mp4,
  # named for hers, and hers is the one the scene ends on.
  #
  # THIRD DELIVERY IN ONE EVENING, and the only one that survives. Two earlier
  # files were replaced in place and are gone from disk:
  #   luna-ty-kitchen-outforabit.mp4  50.3s, dropped in luna-ty-bar-drunk/
  #   luna-ty-outforabit.mp4          46.6s, stopped after "Your face."
  # They were three different assemblies rather than three exports of one — no
  # frame in any of them matched another at any offset. This one is the 46.6s
  # edit continued: identical up to 30s, then the exchange it was missing.
  #
  # NO MUSIC, and no reason to expect one. -40.5 dB mean / -10.1 dB peak, which
  # is the quietest delivery in this file — a kitchen, a pen, and two people
  # talking at conversational volume. It is a dialogue mix in a room with
  # nothing in it, not a scored cut waiting to arrive. Do not go looking in
  # withAudio/ and do not read the level as a fault.
  #
  # Trimmed at 53.4s: 2.0s of black on the end, and the picture does NOT fade
  # into it — full brightness at 53.4 and gone one frame later.
  #
  # FADE 1.5s, and it is the shortest in this file. The house 3s and the
  # driveway's 2s both assume a last shot with room in it; this one runs
  # exactly 2.0s (shot change at 51.4). Three seconds would reach back through
  # the cut into the shot before it, and two would sit over the whole of the
  # last one. 1.5s leaves half a second of him clean and still takes the room
  # down rather than stopping dead on a man mid-turn.
  #
  # Poster at 3.5s: the wide. Both of them at the island, the lake through the
  # glass, before either has said anything — and the first card the lakehouse
  # kitchen has had. The close-ups later are stronger frames and every one of
  # them is a single face, which sells a two-hander as somebody's solo scene;
  # the ones at 36s and 48s are also her not looking up, which is the ending.
  "luna-ty-wasntplanningonit|stories/luna-ty-outforabit/luna-ty-wasntplanningonit.mp4|3.5|53.4|1.5"
  # Scored mix: -37.5 dB -> -26.8 dB. Runs 2.8s longer than the silent cut.
  "luna-josh-dinner-house|stories/withAudio/copy_A062089B-FB53-461E-BC18-DD0BD3F26458.MOV"
  # NEAR-SILENT (-51 dB). Its only candidate is portrait (1080x1822) and would
  # letterbox to a sliver in a 16:9 player, so it stays on the silent cut until
  # there is a landscape export.
  "luna-josh-kitchen-kiss|stories/luna-josh-farm-kitchen-kiss/luna-josh-kitchen-kiss.mp4"
  "luna-josh-house|stories/luna-josh-house/0715.mp4"
  # Scored mix: -31.4 dB -> -27.8 dB. NOTE this is also a shorter edit,
  # 162.1s against 172.1s — ten seconds of picture differ, not just the sound.
  "ty-luna-lake-fight|stories/withAudio/ScreenRecording_07-20-2026 01-28-11_1.mov"
  # Scored mix: -35.5 dB -> -27.3 dB. Runs 2.1s longer.
  "ty-luna-farm-road|stories/withAudio/ScreenRecording_07-20-2026 00-49-25_1.mov"
  # The groceries, the phone, and five seconds of the staring game.
  # Using the .mov: same cut as ty-luna-bathroom.mp4 but with the scored mix
  # (-33 vs -35.5 dB). Lower source res, but the 720p proxy barely notices and
  # the music matters more here than the extra pixels.
  "luna-tyson-bathroom|stories/luna-tyson-bathroom/luna-ty-bathroom.mov|46"
  # AMBIGUOUS: the folder also holds 0713.mp4 (285.6s, higher resolution).
  # Taking the newer date. Swap this line if 0713 is the keeper.
  # Poster at 0.5s: this cut opens on a brief cutaway that reads as a
  # different scene entirely on a card.
  "luna-bathtub|stories/luna-bathtub/0715(1).mp4|0.5"
  # Tyson and Luna, the lakehouse bedroom. Poster at 6s — the first seconds are
  # a slow fade up off black and grab as a near-empty frame.
  #
  # The identical cut also sits at tyson-luna-bed/luna-tyson-bed.mp4 (same
  # 227.346576s, re-export). This folder is the keeper.
  "ty-luna-bed|stories/ty-luna-bed/ty-luna-bed-morning.mp4|6"
  # THE FARM FIGHT. The first assembled cut to come out of the farm material:
  # josh-tyson-farm/ and ty-josh-tractor/ have sat in stories/ since July as
  # raw takes and stills with no edit, and both are listed as "not imported" at
  # the top of this file. This is where that footage finally landed.
  #
  # THE SCORED MIX, swapped in 2026-09-03 on Melissa's instruction ("replace
  # the existing video on the site with the new music version"). It replaces
  # ty-josh-fight.mp4, which is the dialogue export and is now nothing's
  # source. Same rule as luna-ty-shop-kiss: the scored one is the cut.
  #
  #   ty-josh-fight.mp4          1936x1080 h264 30fps  205.2s  -26.5 dB
  #   osh-ty-fight-music.mov     1320x758 hevc 60fps   210.5s  -22.4 dB
  #
  # The filename is the folder's own spelling and is missing the J. Left alone
  # deliberately — it is the name of a source file on disk, not a slug, and
  # "lkehouse" recurs across these folders for the same reason. Nothing public
  # inherits it: optimize-media.sh writes everything under the slug.
  #
  # LOWER RESOLUTION, and taken anyway. 1320x758 against 1936x1080 is a real
  # loss, but the streaming proxy is 720 tall and the reel is 1080 wide, so
  # both derive comfortably from it, and the score is the point. Same trade
  # already recorded for luna-tyson-bathroom. The framing is unchanged — the
  # new file is very slightly taller (1.741 against 1.793) and is NOT squeezed;
  # checked against the same frame in both.
  #
  # PICTURE RUNS ~1.5-2s BEHIND the old export, so nothing that indexes into
  # this scene survived the swap unchecked. The poster second and both preview
  # windows were re-found frame by frame against this file, not shifted by a
  # constant. See preview.segments in lib/content/videos.ts.
  #
  # POSTER AT 26s — the two of them with a fistful of each other's shirt. The
  # same frame that was at 24s in the dialogue export. It sits inside the free
  # preview window, so the card promises something anyone can watch, and it
  # carries no blood: her face is cut from about 2:05 on and a poster sits at a
  # permanent ungated URL.
  #
  # END 206.4, from blackdetect: the export runs on into 4.05s of black.
  #
  # AND NO FADE, which is a change from the line this replaces. That one asked
  # for 1.2s because the dialogue export stopped dead on a held frame. This
  # master fades itself — luminance falls 62 -> 20 across 204s to 206.3s — so a
  # second fade would darken an already-darkening shot. The score keeps
  # resolving under the black past the trim (-25.9 dB at 205s, -36.8 dB by
  # 208.5s); cutting at 206.4 loses the last of that tail, which is the price
  # of not leaving the player sitting on four seconds of nothing.
  "ty-josh-fight|stories/ty-josh-fight/osh-ty-fight-music.mov|26|206.4"
  # NEW YORK. The Whitmore, a lobby, a suite bar, and the two of them a long
  # way from the farm. Melissa dropped the folder 2026-09-08.
  #
  # 1920x1080 h264 30fps, 294.8s, and it is the best-conditioned master in this
  # file: true 16:9, full HD, no pillarbox, and NO TRAILING BLACK AT ALL —
  # blackdetect at pic_th=0.95 across the whole file finds nothing. So no `end`
  # on this line, only the second entry here to fade without trimming first.
  #
  # NO MUSIC: -32.6 dB mean / -3.6 dB peak, which sits with the garage (-35.5)
  # and the bathroom (-29.4) rather than with anything scored (-16 to -27).
  # UNLIKE those two, this is NOT known to be the delivery — nobody has said
  # whether a scored export is coming. If one arrives, point this line at it and
  # re-check every number below: the poster second, the fade, and
  # durationSeconds in lib/content/videos.ts. Standing house rule, unchanged —
  # the scored mix wins even when it costs resolution.
  #
  # FADE 3s, the house length, and applied without being asked for the same
  # reason ty-luna-six-months was: the cut stops dead. Luminance is 29.7 at
  # 290s and 26.9 at 294.5s — no self-fade — with the audio still running at
  # -26.9 dB through the last four seconds. The closing shot is him carrying
  # her to the bed, so a hard cut lands mid-movement. One edit to remove, and
  # the master is untouched.
  #
  # POSTER AT 32s: the two of them meeting in the lobby, his face over her
  # shoulder, and THE WHITMORE NEW YORK legible on the desk behind him. It says
  # who and where in one frame and gives away nothing — the card is a man
  # arriving to meet her, which is the first thirty seconds of the scene.
  #
  # Considered and rejected: 8s (her alone in the lobby — the best-composed
  # frame in the cut and it sells a two-hander as a woman waiting on her own);
  # 44s (her beaming at him — warmer, but her face and his shoulder, and it
  # loses the hotel); anything past 270s (both faces, laughing, and it is the
  # ending).
  "luna-ty-nyc-hotel|stories/luna-ty-nyc-hotel/luna-ty-nyc-hotel.mp4|32||3"
  # THE BAR, AND THE BLONDE GUY. Melissa, 2026-09-09, with the whole beat
  # written out — see `### The bar — the blonde guy` in LUNA_VALE_CONTEXT.md,
  # which has the placement (about a month after Luna goes back to Josh) and
  # what the bad day actually was.
  #
  # THE SLUG IS HERS, NOT THE FILENAME'S. She called the video
  # ty-luna-blonde-guy-bar and the folder matches; the file inside it has the
  # names the other way round. Left alone on purpose, the same as
  # "osh-ty-fight-music.mov" above: it is the name of a file on disk, not a
  # slug, and nothing public inherits it.
  #
  # REPLACED 2026-09-09, hours after the first import — she re-exported and
  # dropped luna-ty-blonde-guy-bar.mp4 (with the e) over
  # luna-ty-blond-guy-bar.mp4 (without). Only this line's source path changed;
  # every number below was re-checked against the new file and every one of
  # them still holds, because THE PICTURE IS IDENTICAL. Verified rather than
  # assumed: 365 frames compared at 2fps across the whole 3:03, mean
  # correlation 0.9997 and nothing anywhere below 0.97, with the duration
  # matching to six decimal places (182.648163s) and the audio envelope at
  # 0.995. If she fixed something specific it is below what a 720p proxy
  # comparison can resolve.
  #
  # WHY THE NUMBERS WERE RE-CHECKED ANYWAY, and why the next person should too:
  # a replacement export is usually a slightly different edit rather than the
  # same picture in a new container — see the beach and the flashback above,
  # where the poster second and the runtime both moved. This one happens not to
  # be. That is a finding, not an assumption.
  #
  # 1912x1080 h264 30fps, 182.6s. Effectively true 16:9 (1.77) like
  # ty-josh-fight's 1936x1080, so no pillarboxing worth mentioning.
  #
  # NO TRAILING BLACK anywhere in the file, so no `end` — the second cut in a
  # row to arrive clean that way.
  #
  # NO MUSIC: -30.8 dB mean / -4.6 dB peak, which sits with the garage, the
  # bathroom and the NYC hotel rather than with anything scored. Nobody has
  # said whether a score is coming; if one lands, re-point this line and
  # re-check every number below, the poster second and the preview window
  # included.
  #
  # FADE 3s, the house length, and for the established reason: the picture
  # holds full brightness to the last frame (luma 23-27 from 176s to 182.5s)
  # with the audio still running at -32 dB, so it stops rather than ends. The
  # closing shot is the two of them walking out onto a wet street with him
  # ahead of her, which a hard cut turns into a file ending mid-stride.
  #
  # POSTER AT 146.5s, and it took three attempts to land on. All four people
  # are in it doing exactly what the scene is: Luna at the left with her hand
  # flat on Tyson's chest, looking up at him; Tyson and the other man nose to
  # nose; and the friend at the right with a hand on his arm, trying to get him
  # out of there. The whole beat in one frame, and it gives away nothing about
  # how it goes.
  #
  # It is also the picture of what this scene is ABOUT, which no other frame
  # manages: she is not calming the stranger down. She is calming Tyson.
  #
  # It sits INSIDE the public window below, so the card promises something
  # anybody can watch — same rule as ty-josh-fight.
  #
  # Considered and rejected: 136s (the first pick, and wrong — a tight
  # two-shot of the two men with no Luna in it, which reads as a fight scene
  # and hides whose story this is); 0s (her alone at the bar, beautiful, and it
  # sells a two-hander as a woman waiting); 88s (his face as he walks in, the
  # best single frame in the cut and a single face); 154-156s (the collar and
  # the yell) — a poster sits at a permanent ungated URL and that one is the
  # violence.
  #
  # NOW THE SCORED CUT (2026-09-10), same swap as luna-lkehouse-wine-shatter
  # and josh-luna-wall on the same day. The unscored master is still at
  # luna-ty-blonde-guy-bar.mp4 if this needs reverting.
  #
  # SAME EDIT: picture runs to 183 in both, so the 2:26 poster, the 2:14
  # preview window and every timing note downstream are unchanged.
  #
  # END=183 — it arrived with 4s of black on the tail, like the wine cut an
  # hour earlier. Found with a frame-luma sweep; blackdetect at pic_th=0.98
  # misses this kind of tail.
  #
  # COSTS RESOLUTION: 1316x796 against 1912x1080. Same trade as the wine cut,
  # josh-luna-wall and luna-josh-fair. Worth a re-export at 1080 if the source
  # allows it.
  "ty-luna-blonde-guy-bar|stories/ty-luna-blonde-guy-bar/luna-ty-bar-blonde-guy-music.mov|146.5|183|3"
  # THE WINE GLASS. Melissa, 2026-09-10, and the folder name carries the
  # "lkehouse" spelling that recurs across these directories — left alone, it
  # is a path and nothing public inherits it.
  #
  # NO BACKSTORY CAME WITH IT, so everything below is read off the footage and
  # nothing here places it in the timeline. See lib/content/videos.ts for the
  # one reading worth putting to her.
  #
  # 1942x1080 h264 30fps, 148.2s. 1.798, so effectively 16:9.
  #
  # NO TRAILING BLACK. Third in a row to arrive clean.
  #
  # THE QUIETEST DELIVERY IN THIS FILE at -38.9 dB mean — quieter even than the
  # lakehouse kitchen's -40.5 — WITH A PEAK AT -0.2 dB, which is essentially
  # full scale. That combination is the scene: two and a half minutes of a
  # woman not making any noise, and one glass hitting a wall. Do not "fix" the
  # level; the gap between those two numbers is the whole point, and
  # normalising it would flatten the only loud thing in it.
  #
  # FADE 3s, house length, same reason as the last three: the picture holds
  # brightness to the final frame with room tone still running, so it stops
  # rather than ends. The last shot is her face after, which a hard cut turns
  # into a file running out.
  #
  # POSTER AT 6s: her close, hand in her hair, the glass of red still in it and
  # her face already gone. It says what the scene is in one look and shows
  # neither the throw nor what happens to her hand afterwards.
  #
  # THE POSTER IS OUTSIDE THE PUBLIC WINDOW, which breaks the rule
  # ty-josh-fight set, and it is a deliberate trade rather than an oversight.
  # The window below starts at 2:00 because that is where the hook is; the best
  # CARD is at 0:06. Both cannot be true at once here. What the rule protects
  # against is a card promising something better than what a stranger can
  # watch, and that is not the case — it is the same woman in the same room
  # eight seconds in. Move either one and the other still works.
  #
  # Considered: 103s (her standing in the room with the lake behind, the most
  # restrained frame in the cut and it says very little) and 111s (hands in her
  # hair, which is her at her worst and heavy to meet cold on a card).
  # THE CITY APARTMENT — Melissa, 2026-09-11, and the context is hers: Tyson
  # has been gone a MONTH, Luna tracks him down unannounced at HIS city
  # apartment, and finds him drinking again.
  #
  # THE ARC, read off the footage: she rides up alone in a lift with the city
  # behind her (0-30), walks a corridor to a door (42), he opens it — shirtless,
  # not expecting anybody (62), they argue (75+), there is a bottle on the
  # table (110), and at about 250 it stops being an argument. The Instagram
  # clip `her-place` is cut from that last stretch.
  #
  # POSTER AT 42s: Luna alone in the corridor, lit, walking towards a door.
  # Her face, her intent, and not one frame of what she is about to find.
  # Considered 62 (the door opening, both of them, the best two-shot in the
  # cut) and rejected for the card: it is the hinge, and a card should not
  # spend the hinge. Her back is to camera there anyway.
  #
  # NO TRIM. Runs to its last frame at luma 12 with no black — second delivery
  # running to bring it. The 3s fade is on the proxy as usual.
  #
  # 1320x790 against the unimported master's presumably higher resolution;
  # same trade as every other scored cut this week.
  # THE TRAILER — 1:40, the first one, ahead of the pilot. Melissa's final cut
  # with her own audio under the end title (2026-09-15).
  #
  # THE END CARD IS ALREADY IN IT. scripts/trailer-end-title.py built the
  # sequence and she laid it into her edit herself with the score carrying
  # underneath, which is what it needed — the version this repo concatenated
  # had eight silent seconds at the end. Nothing here re-appends anything.
  #
  # POSTER AT 8s: the photograph in a frame on the table, which is the
  # trailer's own opening image. Distinctive among forty-six moody two-shots,
  # and a photograph of two people being looked at later is what the whole
  # series is. 55s (her laughing, him behind her) is the warmer, more
  # clickable frame and is the alternative if this reads too quiet.
  #
  # NO TRIM AND NO FADE. It ends on the title card, which fades itself.
  "between-us-trailer-one|stories/trailer/between-us-trailer-one-final.mp4|8"

  # THE GARAGE, AGAIN — Luna and Tyson, 2:25, dropped 2026-09-14. Delivered
  # 1952x1080 and UNSCORED (-30.4 dB). Melissa: "no music in this one but im
  # gonna add it here shortly", so this source is expected to be replaced by a
  # scored export and the entry is staged hidden until it is.
  #
  # THE THIRD GARAGE SCENE, after ty-luna-garage (7:36) and luna-ty-shop-kiss
  # (4:24). Worth keeping straight when the copy is written: this is a
  # different conversation in the same room, not a recut of either.
  #
  # WHAT IS ON SCREEN, and the copy goes no further until she says what is
  # said: the two of them close among the tools, her hand on his arm while he
  # is turned away, and by about 2:00 she is mid-sentence and getting nothing
  # back. It reads as her doing the asking and him not answering, which is the
  # shape of everything else this month — but reading a scene off five frames
  # is how The Pool ended up with a synopsis that had them on opposite sides of
  # a pool they were sitting beside together.
  #
  # END=145.5. Picture holds to about 145.5 and is black by 146.
  "ty-luna-grg2|stories/ty-luna-grg2/luna-ty-grg2.mp4|40|145.5|3"

  # THE POOL — Josh and Luna, 4:22, dropped 2026-09-14. The ARGUMENT, and the
  # public half of a two-cut scene. Delivered 1912x1080 and unscored.
  #
  # THREE FILES ARRIVED IN THIS FOLDER and picking between them is the whole
  # decision. josh-luna-pool-argue.mp4 (4:22) is the argument and stops on a
  # near-kiss. luna-josh-poolArguePlus.mp4 (7:26) carries on past it.
  # luna-josh-poolFIght-plusMusic.mov (7:33) is that one scored, and is the cut
  # Melissa pointed at: "the end is explicit... basically the full pool scene".
  #
  # SO IT IS FILED THE WAY ty-luna-bed IS. The argument is the scene anybody
  # can meet; the full scored cut is the members' one and carries `explicit`.
  # That is not a scruple invented here — "explicit goes behind membership" is
  # Melissa's standing instruction, narrowed by name exactly once for
  # luna-josh-first-night. A single explicit entry would have had to forfeit
  # its public window entirely under that rule, and this way the first minute
  # of an argument by a pool is exactly what a stranger should be shown.
  #
  # POSTER AT 20s: the two of them either side of a lit pool, not looking at
  # each other, both dressed. The distance is the scene and the frame states it
  # without spending anything.
  #
  # NO TRIM. It ends on picture at luma 37 with no black.
  "josh-luna-pool|stories/josh-luna-pool-argue/josh-luna-pool-argue.mp4|20||3"

  # TYSON THINKING — 3:37, scored, dropped 2026-09-13. The folder is
  # tyson-car-thinking and the file is tyson-apt-thinking-music; both are
  # right, because the scene is both.
  #
  # WHAT IS ON SCREEN: Tyson alone in his apartment with a whisky and his
  # phone face-up on the table. Luna, intercut, on the phone in a bedroom.
  # Then the black Carrera on a city highway at night, and him driving it out
  # of the city with water and mountains going past. A man sitting still, and
  # then a man not sitting still.
  #
  # IT LANDS ON TWO THINGS ALREADY PUBLISHED without needing either explained.
  # The whisky is "drinking again" from luna-ty-apt-argue, and the car is the
  # black 2020 Carrera canon has had him treating like a child since the
  # beginning.
  #
  # POSTER AT 165s: his face lit by the dash, mid-drive. The decision rather
  # than the sitting. 5s — him over the whisky with the phone on the table —
  # is the more atmospheric frame and is in the free minute anyway, so nothing
  # is being hidden by not using it; it is simply the weaker card.
  #
  # END=213.5. The picture holds around luma 25-31 to 213.5 and is hard black
  # by 214, so there is about 3.5s of black on the tail. It ends ON picture,
  # which is why the 3s proxy fade still applies.
  "tyson-apt-thinking|stories/tyson-car-thinking/tyson-apt-thinking-music.mov|165|213.5|3"

  # RICK'S HOUSE — Josh, Tyson and Rick, 2:50, dropped 2026-09-11. No score
  # (mean -32.4 dB, dialogue-carried) and 1912x1080, so this is a delivered
  # master rather than a scored re-export.
  #
  # WHAT IS ON SCREEN, and the copy goes no further than this until Melissa
  # says what is said: Josh arrives at his father's house and takes his cap
  # off in the hall. Rick greets them both — his hand lands on TYSON'S
  # shoulder, not his son's. Then it is Josh and Tyson alone for the back two
  # thirds, face to face and close, through to the end.
  #
  # THIS IS THE ROOM THE SECRET LIVES IN. docs/content/BETWEEN_US_SECRET_CANON
  # .md §8 puts Stage Two — "Josh's father enters the equation" — in exactly
  # this configuration, and the site has never had a frame of Rick and Tyson
  # together. Which is why nothing here guesses at the dialogue.
  #
  # POSTER AT 115s: Josh and Tyson, both faces sharp, nose to nose. The frame
  # at 25 is the better story — three men and a hand on the wrong shoulder —
  # and that is precisely why it is not the card. If that gesture is the Stage
  # Two beat, a poster spends it before anybody presses play.
  #
  # NO TRIM. Runs to its last frame at luma 48.
  "josh-ty-ricks-house|stories/josh-ty-ricksHouse/josh-ty-ricksHouse.mp4|115||3"

  # ONE STRAY WORD REMOVED, AND IT TOOK TWO GOES. Melissa: "that 'shit' she
  # says in the beginning, her lips dont move" — "when shes knocking, no music
  # yet" — "when he opens the door".
  #
  # THE FIRST ATTEMPT CUT THE WRONG THING. It took the 0.44s event at 48.08s,
  # which is TYSON SAYING HER NAME as he comes to the door. That is a line of
  # the scene and deleting it was a real loss; it was reverted within the hour.
  #
  # THE ACTUAL WORD IS AT 45.42s, 0.26s long, and the frame at 45.4 is the
  # door opening with his face in the gap — exactly where she said it was.
  # What settles it is the spectrum: 81% of that event's energy sits above
  # 2.5kHz, which is a hard sibilant (the "sh" and the "t"), where Tyson's
  # "Luna" at 48.08 is 39% — two syllables carrying vowels. One syllable of
  # almost pure fricative against a two-syllable name; they are not close once
  # measured, and they were indistinguishable by duration alone, which is how
  # the first attempt went wrong.
  #
  # REPAIRED BY SPLICING ROOM TONE, not muting: 45.36-45.74 is replaced by the
  # 0.38s at 46.30-46.68 — same acoustic, after the door is open. Video is
  # stream-copied, duration holds.
  #
  # Verified: 45.36 drops -33.9 -> -40.7 dB (down to room tone) and 48.08 is
  # bit-for-bit unchanged at -23.4 dB, so his name is still in the scene.
  #
  # The delivered master sits beside it for reverting.
  "luna-ty-apt-argue|stories/apt-luna-tyson-argue/v2/luna-ty-apt-argue-music-clean.mov|42||3"

  #
  # NOW THE SCORED CUT (2026-09-10), the same move josh-luna-wall made. The
  # silent master is still at luna-lkehouse-wine-shatter.mp4 if this needs
  # reverting.
  #
  # IT IS THE SAME EDIT. Head frames match, the picture runs to 148.6s in both,
  # and the throw is still at 2:16 — so the poster second, the preview window
  # and every timing note downstream stay exactly as they were. Only the mix
  # and the resolution changed.
  #
  # THE MIX IS THE POINT and it inverts the old note. The silent cut measured
  # -38.9 dB mean, the quietest delivery this library had, and the entry in
  # videos.ts argued that the gap between that and a -0.2 dB peak WAS the
  # scene. This one is -17.2 dB mean, 0.0 dB peak: the score runs underneath
  # the whole thing. That reasoning is obsolete rather than wrong, and the
  # videos.ts comment is updated rather than left describing a file that is no
  # longer there.
  #
  # END=148 BECAUSE IT ARRIVED WITH 5.6s OF BLACK on the tail — the fourth of
  # the last five deliveries to do so. Picture holds full brightness to 148.6
  # and hard-cuts; blackdetect at pic_th=0.98 does NOT catch it, which is worth
  # knowing, and a frame-luma sweep does.
  #
  # THE 3s FADE STAYS. The picture still ends at full brightness with the audio
  # running, so it stops rather than ends. The trailing black is not a fade.
  #
  # IT COSTS RESOLUTION: 1320x798 against the silent master's 1942x1080, and
  # 1.65 rather than 1.80, so it pillarboxes slightly in a 16:9 player. Same
  # trade as josh-luna-wall and luna-josh-fair. Worth a re-export at 1080 if
  # the source allows it.
  "luna-lkehouse-wine-shatter|stories/luna-lkehouse-wine-shatter/luna-lkehouse-wine-shatter-music.mov|6|148|3"
)

# The members-only edit of a scene that also has a public one (Video.premium).
# Kept in its own list because these get NO poster: a poster lands in public/
# at an ungated URL, and the whole point of these cuts is that they are not
# public. The card and the /watch page both use the public cut's poster.
EXPLICIT_CUTS=(
  "ty-luna-bed-explicit|stories/tyson-luna-bed/explicit/ty-luna-bed-sex2.mp4"
  # The full pool scene, scored, ending explicit — the members' cut of
  # `josh-luna-pool`. END=443: it fades out by 7:23 and then runs about four
  # seconds of black, and because the master fades ITSELF the proxy gets no
  # extra fade on top.
  #
  # IT IS LOWER RESOLUTION THAN THE PUBLIC CUT, 1320x762 against 1912x1080,
  # which is backwards for a paid edit and is the same trade luna-josh-fair and
  # luna-truck-breakdown already carry. Worth a re-export at 1080 if the source
  # allows it.
  "josh-luna-pool-explicit|stories/josh-luna-pool-argue/luna-josh-poolFIght-plusMusic.mov|443"
)

want=("$@")

wanted() {
  [ ${#want[@]} -eq 0 ] && return 0
  for w in "${want[@]}"; do [ "$w" = "$1" ] && return 0; done
  return 1
}

for entry in "${CUTS[@]}"; do
  IFS='|' read -r slug src at end fade <<<"$entry"
  wanted "$slug" || continue
  # All four optional slots are always passed, with "-" standing in for the
  # ones this line does not set. Otherwise an omitted `at` would slide `end`
  # into the poster argument and quietly grab the poster from the wrong frame.
  ./scripts/optimize-media.sh import "$slug" "$src" \
    "${at:--}" "${end:--}" "${fade:--}"
done

# Proxy only, deliberately no poster — see the note on EXPLICIT_CUTS.
for entry in "${EXPLICIT_CUTS[@]}"; do
  IFS='|' read -r slug src end <<<"$entry"
  wanted "$slug" || continue
  ./scripts/optimize-media.sh proxy-only "$slug" "$src" "${end:--}"
done
