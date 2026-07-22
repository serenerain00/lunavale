#!/usr/bin/env bash
#
# optimize-media.sh — compress source media into the web copies the app ships.
#
# Nothing large or uncompressed belongs in /public or in git. Source material
# (camera-native stills, masters) stays out of the repo (see .gitignore); this
# script derives the committed, compressed copies from it.
#
# Usage:
#   scripts/optimize-media.sh stills  <event-id>     # public/stills/<id> -> public/gallery/<id>
#   scripts/optimize-media.sh cover   <event-id> NN  # make gallery card cover from still NN
#   scripts/optimize-media.sh poster  <slug>         # frame from stories/<slug>.mp4 -> public/posters
#   scripts/optimize-media.sh video   <slug>         # stories/<slug>.mp4 -> <slug>.proxy.mp4
#
# Requires ffmpeg (brew install ffmpeg).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# --- Targets -----------------------------------------------------------------
# Stills are viewed full-bleed in the lightbox, so they get more pixels than a
# card would need; next/image resizes down per breakpoint from there.
STILL_WIDTH=1600      # long edge for gallery stills
STILL_Q=5             # ffmpeg mjpeg quality (2 best … 31 worst); ~5 keeps grain
CARD_WIDTH=1280       # 16:9 card art (covers, posters)
CARD_HEIGHT=720
PROXY_HEIGHT=720      # streaming proxy height
PROXY_CRF=23          # x264 quality; lower = larger file

die() { echo "error: $*" >&2; exit 1; }
need_ffmpeg() { command -v ffmpeg >/dev/null || die "ffmpeg not found (brew install ffmpeg)"; }

cmd="${1:-}"; shift || true
need_ffmpeg

case "$cmd" in
  stills)
    id="${1:?usage: optimize-media.sh stills <event-id>}"
    src="public/stills/$id"
    out="public/gallery/$id"
    [ -d "$src" ] || die "no source stills at $src"
    mkdir -p "$out"

    n=0
    # Sorted so the committed numbering matches the source order.
    while IFS= read -r f; do
      n=$((n + 1))
      printf -v dst "%s/%02d.jpg" "$out" "$n"
      ffmpeg -y -loglevel error -i "$f" \
        -vf "scale='min($STILL_WIDTH,iw)':-2" -q:v "$STILL_Q" "$dst"
      echo "  $(basename "$f") -> $dst ($(du -h "$dst" | cut -f1))"
    done < <(find "$src" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) | sort)

    echo "$n stills written to $out"
    echo "Remember: set images/cover + count in lib/content/gallery.ts"
    ;;

  cover)
    id="${1:?usage: optimize-media.sh cover <event-id> <NN>}"
    nn="${2:?usage: optimize-media.sh cover <event-id> <NN>}"
    src="public/gallery/$id/$nn.jpg"
    [ -f "$src" ] || die "no still at $src"
    ffmpeg -y -loglevel error -i "$src" \
      -vf "scale=$CARD_WIDTH:$CARD_HEIGHT:force_original_aspect_ratio=increase,crop=$CARD_WIDTH:$CARD_HEIGHT" \
      -q:v "$STILL_Q" "public/gallery/$id/cover.jpg"
    echo "cover -> public/gallery/$id/cover.jpg ($(du -h "public/gallery/$id/cover.jpg" | cut -f1))"
    ;;

  poster)
    slug="${1:?usage: optimize-media.sh poster <slug>}"
    src="stories/$slug.mp4"
    [ -f "$src" ] || die "no master at $src"
    # A frame a few seconds in — past any fade-up from black.
    ffmpeg -y -loglevel error -ss 3 -i "$src" -frames:v 1 \
      -vf "scale=$CARD_WIDTH:$CARD_HEIGHT:force_original_aspect_ratio=increase,crop=$CARD_WIDTH:$CARD_HEIGHT" \
      -q:v "$STILL_Q" "public/posters/$slug.jpg"
    echo "poster -> public/posters/$slug.jpg ($(du -h "public/posters/$slug.jpg" | cut -f1))"
    ;;

  video)
    slug="${1:?usage: optimize-media.sh video <slug>}"
    src="stories/$slug.mp4"
    [ -f "$src" ] || die "no master at $src"
    # faststart puts the moov atom first so playback can begin while streaming.
    ffmpeg -y -loglevel error -i "$src" \
      -vf "scale=-2:$PROXY_HEIGHT" \
      -c:v libx264 -preset slow -crf "$PROXY_CRF" -pix_fmt yuv420p \
      -c:a aac -b:a 128k -movflags +faststart \
      "stories/$slug.proxy.mp4"
    echo "proxy -> stories/$slug.proxy.mp4 ($(du -h "stories/$slug.proxy.mp4" | cut -f1))"
    ;;

  *)
    sed -n '3,16p' "$0"
    exit 1
    ;;
esac
