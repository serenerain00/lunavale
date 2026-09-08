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

# slug|source|poster seconds|preview seconds (optional)
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
  "luna-ty-nyc-vertical|stories/luna-ty-nyc-hotel/luna-ty-nyc-IGvertical.mov|24|60"
)

want=("$@")
for entry in "${CLIPS[@]}"; do
  IFS='|' read -r slug src at preview <<<"$entry"
  if [ ${#want[@]} -gt 0 ]; then
    match=0
    for w in "${want[@]}"; do [ "$w" = "$slug" ] && match=1; done
    [ $match -eq 1 ] || continue
  fi
  ./scripts/optimize-media.sh vertical "$slug" "$src" "$at"

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
