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

# slug|source|poster seconds
CLIPS=(
  # Daylight, running, headphones in. The one clip here that is not intimate.
  "run-at-the-lake|stories/withAudio/ScreenRecording_07-20-2026 08-46-45_1.mov|31"
  # Apartment at night, city in the window.
  "apartment-window|stories/withAudio/ScreenRecording_07-12-2026 23-37-11_1.mov|15"
  "close-quarters|stories/withAudio/3F0761B4-7985-4C8B-8CE2-EAE508DAE5D1.MP4|8"
  "still-awake|stories/withAudio/ScreenRecording_07-09-2026 22-06-35_1.mov|32"
  "morning-after|stories/withAudio/copy_2983A1B7-D3AE-4D16-BA2A-8385701504AC.MOV|23"
  "said-out-loud|stories/withAudio/copy_F73B2C7E-2355-459B-9F22-D84FDE635960.MOV|10"
)

want=("$@")
for entry in "${CLIPS[@]}"; do
  IFS='|' read -r slug src at <<<"$entry"
  if [ ${#want[@]} -gt 0 ]; then
    match=0
    for w in "${want[@]}"; do [ "$w" = "$slug" ] && match=1; done
    [ $match -eq 1 ] || continue
  fi
  ./scripts/optimize-media.sh vertical "$slug" "$src" "$at"
done
