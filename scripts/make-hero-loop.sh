#!/usr/bin/env bash
#
# Build the public hero loop for the landing page.
#
# This is a TRAILER asset, deliberately published: it is cut from story footage
# but served straight from /public, never through /api/stream. The gated route
# stays the only way to reach a scene's actual bytes, so publishing a hero can
# never widen what a non-member can watch. Keep it that way — if you swap the
# source below, you are choosing to make that footage public.
#
# Output is silent by design (no audio stream at all, not just muted): the page
# autoplays it, and autoplay with sound is against the content rules.
#
# Usage: ./scripts/make-hero-loop.sh
set -euo pipefail

cd "$(dirname "$0")/.."

SOURCE="stories/tyson-luna-lakehouse-fire.proxy.mp4"
# A near-static shot: the couple by the fire, lake and sunset behind them. The
# loop point is invisible precisely because the framing barely moves — pick the
# same kind of shot if you recut this.
START=118
DURATION=12

OUT_DIR="public/hero"
OUT_VIDEO="$OUT_DIR/lakehouse-loop.mp4"
OUT_POSTER="$OUT_DIR/lakehouse-loop.jpg"

if [ ! -f "$SOURCE" ]; then
  echo "Source not found: $SOURCE" >&2
  echo "Story media is gitignored — restore it before rebuilding the hero." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# 30fps is plenty for an ambient background and halves the bitrate of the 60fps
# source. yuv420p + faststart so it plays inline on iOS and starts before the
# whole file has arrived.
ffmpeg -y -v error \
  -ss "$START" -t "$DURATION" -i "$SOURCE" \
  -an \
  -vf "fps=30,scale=1280:-2" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 28 -preset slow -movflags +faststart \
  "$OUT_VIDEO"

# The poster is the loop's own first frame, so there is no visible jump when
# playback takes over — and it is what everyone sees when motion is reduced,
# data is saved, or autoplay is refused.
ffmpeg -y -v error \
  -ss "$START" -i "$SOURCE" \
  -frames:v 1 -vf "scale=1280:-2" -q:v 4 \
  "$OUT_POSTER"

printf 'hero loop  %s\n' "$(du -h "$OUT_VIDEO" | cut -f1)"
printf 'hero poster %s\n' "$(du -h "$OUT_POSTER" | cut -f1)"
