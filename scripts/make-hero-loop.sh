#!/usr/bin/env bash
#
# make-hero-loop.sh — build the rotating landing-page hero loops.
#
# These are TRAILER assets, deliberately published: cut from story footage but
# served straight from /public, never through /api/stream. The gated route
# stays the only way to reach a scene's actual bytes, so publishing a hero can
# never widen what a non-member can watch. If you add a source below, you are
# choosing to make twelve seconds of it public.
#
# Output is silent by design (no audio stream at all, not just muted): the page
# autoplays it, and autoplay with sound is against the content rules.
#
# NAMING IS LOAD-BEARING. Each loop is named for the scene slug it was cut
# from, because the hero's play button plays that scene — lib/content/hero.ts
# derives both the media paths and the link target from the slug. A loop whose
# name doesn't match a slug in lib/content/videos.ts will not appear.
#
# Usage: ./scripts/make-hero-loop.sh [slug ...]     (no args = all)
set -euo pipefail
cd "$(dirname "$0")/.."

# scene-slug|source|start seconds|duration seconds
#
# Spans are picked for two things: a composition that leaves the lower left
# free for the headline, and a wrap-around you can't see — either a near-static
# shot, or one where the loop point lands on a cut.
HEROES=(
  # Night interior, warm. Three cuts; the wrap lands on one.
  "luna-tyson-bar|stories/luna-tyson-bar/luna-tyson-bar.mp4|26|12"
  # Day interior, warm. Opens wide on the kitchen as Josh comes through.
  "luna-josh-kitchen-kiss|stories/luna-josh-farm-kitchen-kiss/luna-josh-kitchen-kiss.mp4|2|12"
  # Night exterior, cool. Rain on the dock, lantern and far-shore lights.
  "ty-luna-lake-fight|stories/ty-luna-farm-lake/ty-luna-lake-fight.mp4|18|12"
  # Day exterior, green. The road, the truck, and the walk up it.
  "ty-luna-farm-road|stories/ty-luna-farmRd/Ty-luna.mp4|0.5|12"
)

OUT_DIR="public/hero"
mkdir -p "$OUT_DIR"

want=("$@")
for entry in "${HEROES[@]}"; do
  IFS='|' read -r slug src start duration <<<"$entry"

  if [ ${#want[@]} -gt 0 ]; then
    match=0
    for w in "${want[@]}"; do [ "$w" = "$slug" ] && match=1; done
    [ $match -eq 1 ] || continue
  fi

  if [ ! -f "$src" ]; then
    echo "Source not found: $src" >&2
    echo "Story media is gitignored — restore it before rebuilding the hero." >&2
    exit 1
  fi

  video="$OUT_DIR/$slug.mp4"
  poster="$OUT_DIR/$slug.jpg"

  # 30fps and 1280 wide keep an ambient background well under a megabyte from a
  # 1080p master. yuv420p + faststart so it plays inline on iOS and starts
  # before the whole file has arrived.
  ffmpeg -y -v error \
    -ss "$start" -t "$duration" -i "$src" \
    -an \
    -vf "fps=30,scale=1280:-2" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p \
    -crf 28 -preset slow -movflags +faststart \
    "$video"

  # The poster is the loop's own first frame, so there is no visible jump when
  # playback takes over — and it is what everyone sees when motion is reduced,
  # data is saved, or autoplay is refused.
  ffmpeg -y -v error \
    -ss "$start" -i "$src" \
    -frames:v 1 -vf "scale=1280:-2" -q:v 4 \
    "$poster"

  printf '%-26s loop %-6s poster %s\n' \
    "$slug" "$(du -h "$video" | cut -f1)" "$(du -h "$poster" | cut -f1)"
done
