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
  # this one is framed in the present, in colour, with the memory of Josh
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
  # Poster at 24s: the last of the present-day colour before the memory takes
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
  "luna-josh-beach|stories/luna-josh-mexico/luna-josh-mexico-music.mov|77|285.0"
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
)

# The members-only edit of a scene that also has a public one (Video.premium).
# Kept in its own list because these get NO poster: a poster lands in public/
# at an ungated URL, and the whole point of these cuts is that they are not
# public. The card and the /watch page both use the public cut's poster.
EXPLICIT_CUTS=(
  "ty-luna-bed-explicit|stories/tyson-luna-bed/explicit/ty-luna-bed-sex2.mp4"
)

want=("$@")

wanted() {
  [ ${#want[@]} -eq 0 ] && return 0
  for w in "${want[@]}"; do [ "$w" = "$1" ] && return 0; done
  return 1
}

for entry in "${CUTS[@]}"; do
  IFS='|' read -r slug src at end <<<"$entry"
  wanted "$slug" || continue
  # `end` needs `at` present to reach the right argument slot, so a line that
  # trims but takes the default poster frame still has to spell the 3 out.
  ./scripts/optimize-media.sh import "$slug" "$src" ${at:+"$at"} ${end:+"$end"}
done

# Proxy only, deliberately no poster — see the note on EXPLICIT_CUTS.
for entry in "${EXPLICIT_CUTS[@]}"; do
  IFS='|' read -r slug src <<<"$entry"
  wanted "$slug" || continue
  ./scripts/optimize-media.sh proxy-only "$slug" "$src"
done
