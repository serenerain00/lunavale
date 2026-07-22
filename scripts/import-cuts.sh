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
# slug|source path|poster seconds (optional, default 3)
CUTS=(
  "luna-tyson-bar|stories/luna-tyson-bar/luna-tyson-bar.mp4"
  # The coffee Josh called about, which restarts everything. Identified from
  # the footage plus the story beat; it had no shooting folder of its own.
  "luna-josh-coffee|stories/withAudio/ScreenRecording_07-12-2026 08-15-54_1.mov|85"
  # SILENT (-91 dB, digital silence). No match found in withAudio/ — the only
  # unclaimed cuts are portrait or the wrong length. Needs a scored export.
  "luna-josh-bed|stories/luna-josh-bed/0715.mp4"
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
  "luna-tyson-bathroom|stories/luna-tyson-bathroom/ty-luna-bathroom.mp4|46"
  # AMBIGUOUS: the folder also holds 0713.mp4 (285.6s, higher resolution).
  # Taking the newer date. Swap this line if 0713 is the keeper.
  # Poster at 0.5s: this cut opens on a brief cutaway that reads as a
  # different scene entirely on a card.
  "luna-bathtub|stories/luna-bathtub/0715(1).mp4|0.5"
)

want=("$@")
for entry in "${CUTS[@]}"; do
  IFS='|' read -r slug src at <<<"$entry"
  if [ ${#want[@]} -gt 0 ]; then
    match=0
    for w in "${want[@]}"; do [ "$w" = "$slug" ] && match=1; done
    [ $match -eq 1 ] || continue
  fi
  ./scripts/optimize-media.sh import "$slug" "$src" ${at:+"$at"}
done
