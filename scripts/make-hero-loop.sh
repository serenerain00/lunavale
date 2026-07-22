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

SOURCE="public/gallery/tyson-luna-bar/luna-tyson-bar.mp4"
# Luna and Tyson at the bar. Unlike a single locked-off shot, this span carries
# three cuts, so it reads as a trailer rather than a moving wallpaper — and the
# loop point lands on a cut, which is the one place a wrap is invisible.
# Recutting is just these two numbers.
START=26
DURATION=12

OUT_DIR="public/hero"
OUT_VIDEO="$OUT_DIR/bar-loop.mp4"
OUT_POSTER="$OUT_DIR/bar-loop.jpg"

if [ ! -f "$SOURCE" ]; then
  echo "Source not found: $SOURCE" >&2
  echo "Source media is gitignored — restore it before rebuilding the hero." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# 30fps and 1280 wide keep an ambient background well under a megabyte from a
# 1080p master. yuv420p + faststart so it plays inline on iOS and starts before
# the whole file has arrived.
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
