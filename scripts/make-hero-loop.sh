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
# FREE SCENES ONLY (Melissa, 2026-08-05). The hero used to rotate through
# premium scenes, so the front page led with footage a visitor could not watch
# and a play button that opened a locked door. hero.ts now drops any non-free
# slug outright, so adding a premium one here does nothing — but do not add one
# and wonder why.
#
# OUTPUT IS EXACTLY 1280x720, cropped to fill rather than scaled to fit. The
# hero is a full-bleed background with a headline over it, so a 3:2 source was
# going to be cropped by CSS anyway; doing it here means the crop is visible at
# build time, identical everywhere, and "widescreen" is true by construction
# rather than by hoping.
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
  # Night, warm, string lights and movement in depth. The strongest of them.
  "luna-josh-fair|stories/luna-josh-fair.proxy.mp4|8|40"
  # Daylight, big windows, the warmest room in the story.
  "luna-josh-coffee|stories/luna-josh-coffee.proxy.mp4|20|40"
  # The lake through the glass — the only hero with real daylight distance in it.
  "luna-cathy-phone|stories/luna-cathy-phone.proxy.mp4|4|35"
  # Bodies moving, coloured light, a crowd. Reads as a film from across a room.
  "luna-tyson-dance|stories/luna-tyson-dance-full.proxy.mp4|30|40"
  # Night interior, lamplight, one figure. Quiet counterweight to the dance.
  "luna-avery-ipad|stories/luna-avery-ipad.proxy.mp4|4|35"
  # Day exterior through the barn door, two men working. Green and open.
  "josh-tyson-barn|stories/josh-tyson-barn.proxy.mp4|10|40"
  # Hands, a wrench, someone actually doing something.
  "josh-luna-bolt|stories/josh-luna-bolt.proxy.mp4|6|40"
  #
  # Sources are the 720p proxies rather than masters: the output is 720 tall,
  # so a master buys nothing here, and every free scene is guaranteed to have a
  # proxy while masters live in differently-named per-scene folders.
  #
  # DELIBERATELY ABSENT:
  #   luna-tyson-bar, luna-josh-kitchen-kiss, ty-luna-farm-road — premium.
  #   josh-rick-study — free and 16:9, but almost unlit. A hero carries a
  #     headline; that one reads as a black rectangle behind text.
  #   luna-josh-first-morning — free, but 3:2. Cropping it to 16:9 loses a
  #     fifth of the frame.
  #   interview — has a loop and stays in the rotation, but it is not cut by
  #     this script; it is the pinned-style inline hero and its loop predates
  #     this list.
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
    -vf "fps=30,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p \
    -crf 28 -preset slow -movflags +faststart \
    "$video"

  # The poster is the loop's own first frame, so there is no visible jump when
  # playback takes over — and it is what everyone sees when motion is reduced,
  # data is saved, or autoplay is refused.
  ffmpeg -y -v error \
    -ss "$start" -i "$src" \
    -frames:v 1 -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" -q:v 4 \
    "$poster"

  printf '%-26s loop %-6s poster %s\n' \
    "$slug" "$(du -h "$video" | cut -f1)" "$(du -h "$poster" | cut -f1)"
done
