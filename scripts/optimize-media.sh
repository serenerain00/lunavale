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
#   scripts/optimize-media.sh private-stills <id>    # stills-src/<id> -> stills-private/<id> (gated) + public cover
#   scripts/optimize-media.sh cover   <event-id> NN  # make gallery card cover from still NN
#   scripts/optimize-media.sh poster  <slug>         # frame from stories/<slug>.mp4 -> public/posters
#   scripts/optimize-media.sh video   <slug>         # stories/<slug>.mp4 -> <slug>.proxy.mp4
#   scripts/optimize-media.sh import  <slug> <src> [at] [end] # cut -> proxy + poster
#                                                     # [at]=poster seconds, [end]=trim trailing black
#   scripts/optimize-media.sh vertical <slug> <src> [at] # same, for 9:16 portrait cuts
#   scripts/optimize-media.sh proxy-only <slug> <src> # proxy, NO poster (members' cut)
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
PROXY_HEIGHT=720      # streaming proxy height (landscape: sized by height)
VERTICAL_WIDTH=720    # portrait proxy width — 9:16 is sized by width instead
VERTICAL_HEIGHT=1280
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

  private-stills)
    # Members-only stills. Unlike `stills`, the optimized copies do NOT go in
    # /public — a premium still must never sit at a permanent public URL
    # (CLAUDE.md). They land in stills-private/<id>/ (gitignored), get uploaded
    # to PRIVATE Vercel Blob by scripts/upload-media.mjs, and reach a viewer only
    # through the gated /api/still route after an entitlement check.
    #
    # Two sizes per still: NN.jpg (full, for the lightbox) and NN.t.jpg (thumb,
    # for the grid) so a phone isn't pulling 1600px frames to fill a wall.
    # The ONE public artefact is the card cover, built from still 01 — a teaser
    # is meant to be seen, exactly like a premium scene's poster.
    id="${1:?usage: optimize-media.sh private-stills <id>}"
    src="stills-src/$id"
    out="stills-private/$id"
    [ -d "$src" ] || die "no source stills at $src"
    mkdir -p "$out" "public/gallery/$id"

    n=0
    while IFS= read -r f; do
      n=$((n + 1))
      printf -v full "%s/%02d.jpg" "$out" "$n"
      printf -v thumb "%s/%02d.t.jpg" "$out" "$n"
      ffmpeg -y -loglevel error -i "$f" \
        -vf "scale='min($STILL_WIDTH,iw)':-2" -q:v "$STILL_Q" "$full"
      ffmpeg -y -loglevel error -i "$f" \
        -vf "scale='min(640,iw)':-2" -q:v 6 "$thumb"
      echo "  $(basename "$f") -> $full ($(du -h "$full" | cut -f1)) + thumb ($(du -h "$thumb" | cut -f1))"
    done < <(find "$src" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) | sort)

    # Open preview stills, when the gallery declares a freePreviewCount. These
    # are the ONLY frames of a gated set that sit at a public URL, and they are
    # deliberate — see `freePreviewCount` in lib/content/gallery.ts.
    free="${2:-0}"
    if [ "$free" -gt 0 ]; then
      for k in $(seq 1 "$free"); do
        nn=$(printf %02d "$k")
        [ -f "$out/$nn.jpg" ] || continue
        cp "$out/$nn.jpg" "public/gallery/$id/$nn.jpg"
        echo "  open preview -> public/gallery/$id/$nn.jpg"
      done
    fi

    # Public card cover from the first still.
    ffmpeg -y -loglevel error -i "$out/01.jpg" \
      -vf "scale=$CARD_WIDTH:$CARD_HEIGHT:force_original_aspect_ratio=increase,crop=$CARD_WIDTH:$CARD_HEIGHT" \
      -q:v "$STILL_Q" "public/gallery/$id/cover.jpg"

    echo "$n private stills -> $out  (+ public/gallery/$id/cover.jpg)"
    echo "Remember: set count in lib/content/gallery.ts, then run scripts/upload-media.mjs"
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

  import)
    # Bring an assembled cut out of a per-scene working folder and into the
    # shape the app expects. Shooting folders hold dozens of raw takes beside
    # the finished edit, with names nobody chose (kling_…_0.mp4), so the source
    # is named explicitly rather than guessed — publishing the wrong take is
    # not a mistake you want a glob to be able to make.
    #
    # Everything downstream keys off <slug>, so the proxy lands in stories/
    # root under the standard name and no route or content field needs to know
    # the cut came from a subfolder.
    slug="${1:?usage: optimize-media.sh import <slug> <source> [poster-seconds] [end-seconds]}"
    src="${2:?usage: optimize-media.sh import <slug> <source> [poster-seconds] [end-seconds]}"
    # A few seconds in clears any fade-up, but some cuts open on a flash-
    # forward or a cutaway that misrepresents the scene on a card. Override
    # per scene rather than shipping a poster that promises the wrong thing.
    at="${3:-3}"
    # Where the PICTURE ends, when the delivered file runs on past it. Timeline
    # exports arrive with seconds of trailing black often enough to be worth a
    # switch: left in, it pads durationSeconds with time nobody is watching and
    # leaves the player sitting on an empty frame at the end of the scene.
    # Measure it with `ffmpeg -vf blackdetect` rather than by eye, and record
    # the number in scripts/import-cuts.sh so the trim is reviewable.
    end="${4:-}"
    [ -f "$src" ] || die "no source at $src"

    out="stories/$slug.proxy.mp4"
    ffmpeg -y -loglevel error -i "$src" ${end:+-t "$end"} \
      -vf "scale=-2:$PROXY_HEIGHT" \
      -c:v libx264 -preset medium -crf "$PROXY_CRF" -pix_fmt yuv420p \
      -c:a aac -b:a 128k -movflags +faststart \
      "$out"

    ffmpeg -y -loglevel error -ss "$at" -i "$src" -frames:v 1 \
      -vf "scale=$CARD_WIDTH:$CARD_HEIGHT:force_original_aspect_ratio=increase,crop=$CARD_WIDTH:$CARD_HEIGHT" \
      -q:v "$STILL_Q" "public/posters/$slug.jpg"

    # Report the runtime of what was WRITTEN, not of the source — the whole
    # point of `end` is that those two differ, and durationSeconds is copied
    # from this line into lib/content/videos.ts.
    dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")
    printf '%-34s proxy %-6s poster %-6s durationSeconds: %.0f\n' \
      "$slug" "$(du -h "$out" | cut -f1)" \
      "$(du -h "public/posters/$slug.jpg" | cut -f1)" "$dur"
    ;;

  proxy-only)
    # Like `import`, minus the poster — for a members-only cut of a scene that
    # also has a public one (Video.premium).
    #
    # The missing poster is the entire point, not an omission. public/ is
    # served ungated and permanently, so generating a card frame from an
    # explicit cut would publish exactly the thing membership is meant to
    # gate. These cuts are displayed using the public cut's poster.
    slug="${1:?usage: optimize-media.sh proxy-only <slug> <source>}"
    src="${2:?usage: optimize-media.sh proxy-only <slug> <source>}"
    [ -f "$src" ] || die "no source at $src"

    out="stories/$slug.proxy.mp4"
    ffmpeg -y -loglevel error -i "$src" \
      -vf "scale=-2:$PROXY_HEIGHT" \
      -c:v libx264 -preset medium -crf "$PROXY_CRF" -pix_fmt yuv420p \
      -c:a aac -b:a 128k -movflags +faststart \
      "$out"

    dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
    printf '%-34s proxy %-6s poster %-6s durationSeconds: %.0f\n' \
      "$slug" "$(du -h "$out" | cut -f1)" "none" "$dur"
    ;;

  vertical)
    # Portrait cuts (the Instagram ones). Same idea as `import`, but sized by
    # WIDTH — scaling a 9:16 clip to 720 tall would leave it 405 wide, which is
    # smaller than the phone it was made for.
    slug="${1:?usage: optimize-media.sh vertical <slug> <source> [poster-seconds]}"
    src="${2:?usage: optimize-media.sh vertical <slug> <source> [poster-seconds]}"
    at="${3:-3}"
    [ -f "$src" ] || die "no source at $src"

    out="stories/$slug.proxy.mp4"
    ffmpeg -y -loglevel error -i "$src" \
      -vf "scale=$VERTICAL_WIDTH:-2" \
      -c:v libx264 -preset medium -crf "$PROXY_CRF" -pix_fmt yuv420p \
      -c:a aac -b:a 128k -movflags +faststart \
      "$out"

    # Portrait poster, cropped to a true 9:16 so the cards tile evenly.
    ffmpeg -y -loglevel error -ss "$at" -i "$src" -frames:v 1 \
      -vf "scale=$VERTICAL_WIDTH:$VERTICAL_HEIGHT:force_original_aspect_ratio=increase,crop=$VERTICAL_WIDTH:$VERTICAL_HEIGHT" \
      -q:v "$STILL_Q" "public/posters/$slug.jpg"

    dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
    printf '%-26s proxy %-6s poster %-6s durationSeconds: %.0f\n' \
      "$slug" "$(du -h "$out" | cut -f1)" \
      "$(du -h "public/posters/$slug.jpg" | cut -f1)" "$dur"
    ;;

  *)
    sed -n '3,20p' "$0"
    exit 1
    ;;
esac
