#!/usr/bin/env bash
#
# import-takes.sh — bring a scene's raw attempts in as members-only takes.
#
# THE FOLDER IS THE DATA. There is no manifest to hand-write and no ids to
# invent; the layout under a scene's videos/ folder says everything, and this
# script turns it into proxies, poster frames and a generated TypeScript file.
#
#   stories/<scene-folder>/videos/
#     01 he catches her arm/
#       kling_….mp4                 <- attempt 1
#       kling_….mp4                 <- attempt 2
#       used-kling_….mp4            <- attempt 3, AND the one in the scene
#     02 luna turns away/
#       …
#
#   - One folder per BEAT — the moment the run was trying to get. Its name
#     becomes the label, so write it the way it should read on the page. A
#     leading number orders the beats and is stripped from the label.
#   - Files sort by name within a beat, which is the order they were made in
#     and the order the story is told in. Kling's own filenames already sort
#     correctly; leave them alone.
#   - Prefix exactly one file per beat with `used-` — the take that made the
#     final cut. That star is doing most of the narrative work here, and a beat
#     without one just shows no star.
#
# WHY THE HORRIBLE ONES STAY. The failures are the only evidence that the good
# frames were chosen rather than found, which is the entire reason a member
# would watch this. Do not curate the folder; curate nothing.
#
# Usage:
#   ./scripts/import-takes.sh <scene-slug> [scene-folder]
#
#   <scene-slug>    the slug in lib/content/videos.ts, e.g. luna-josh-fair
#   [scene-folder]  the folder under stories/ when it differs from the slug
#
# Requires ffmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."

TAKE_HEIGHT=720   # matches scene proxies; a paying member should not get 360p
TAKE_CRF=26       # a little tighter than a scene — these are reference clips
THUMB_WIDTH=640

slug="${1:?usage: import-takes.sh <scene-slug> [scene-folder]}"
folder="${2:-$slug}"

src_root="stories/$folder/videos"
[ -d "$src_root" ] || { echo "error: no takes folder at $src_root" >&2; exit 1; }

command -v ffmpeg >/dev/null || { echo "error: ffmpeg not found" >&2; exit 1; }

poster_dir="takes-private/$slug"
data_file="lib/content/takes-data/$slug.ts"
mkdir -p "$poster_dir" "lib/content/takes-data"

# kebab: lower-case, strip a leading order prefix, collapse anything else.
kebab() {
  printf '%s' "$1" \
    | sed -E 's/^[0-9]+[[:space:]._-]*//' \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'
}

# label: strip the order prefix, leave the words alone.
label_of() {
  printf '%s' "$1" | sed -E 's/^[0-9]+[[:space:]._-]*//'
}

beats_ts=""
total=0
used_total=0
beat_count=0

# Beat folders in name order — which is why a numeric prefix controls sequence.
while IFS= read -r beat_dir; do
  beat_name="$(basename "$beat_dir")"
  beat_id="$(kebab "$beat_name")"
  beat_label="$(label_of "$beat_name")"
  [ -n "$beat_id" ] || continue

  takes_ts=""
  n=0
  beat_used=0

  while IFS= read -r take_src; do
    n=$((n + 1))
    nn="$(printf '%02d' "$n")"
    take_slug="take-$slug-$beat_id-$nn"
    out="stories/$take_slug.proxy.mp4"

    # Flat in stories/, deliberately: the stream route requires media to sit
    # directly in that directory and refuses anything that resolves elsewhere.
    # Long filenames are the cost of keeping that check as simple as it is.
    ffmpeg -y -loglevel error -i "$take_src" \
      -vf "scale=-2:$TAKE_HEIGHT" \
      -c:v libx264 -preset medium -crf "$TAKE_CRF" -pix_fmt yuv420p \
      -c:a aac -b:a 128k -movflags +faststart \
      "$out"

    # Poster frame for the grid. NOT in public/ — a take's frame is as
    # members-only as the take, so it lives beside the private stills and is
    # served through the gated /api/take route.
    ffmpeg -y -loglevel error -ss 0.5 -i "$take_src" -frames:v 1 \
      -vf "scale=$THUMB_WIDTH:-2" -q:v 5 "$poster_dir/$take_slug.jpg"

    dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$take_src")"

    used=""
    case "$(basename "$take_src")" in
      used-*|USED-*|used_*) used="
      used: true,"; beat_used=$((beat_used + 1)); used_total=$((used_total + 1)) ;;
    esac

    takes_ts="$takes_ts
    {
      slug: \"$take_slug\",
      n: $n,
      durationSeconds: $(printf '%.0f' "$dur"),$used
    },"
    total=$((total + 1))
  done < <(find "$beat_dir" -maxdepth 1 -type f \
    \( -iname '*.mp4' -o -iname '*.mov' -o -iname '*.webm' \) | sort)

  [ "$n" -gt 0 ] || continue
  beat_count=$((beat_count + 1))

  if [ "$beat_used" -gt 1 ]; then
    echo "  warning: beat '$beat_label' marks $beat_used takes as used — at most one should be" >&2
  elif [ "$beat_used" -eq 0 ]; then
    echo "  note: beat '$beat_label' has no used- take, so nothing will be starred" >&2
  fi

  beats_ts="$beats_ts
  {
    id: \"$beat_id\",
    label: \"$beat_label\",
    takes: [$takes_ts
    ],
  },"
done < <(find "$src_root" -mindepth 1 -maxdepth 1 -type d | sort)

if [ "$total" -eq 0 ]; then
  echo "error: no take files found under $src_root" >&2
  echo "       expected one folder per beat, each holding .mp4/.mov files" >&2
  exit 1
fi

# camelCase via awk, not `sed \U` — that is a GNU extension and this repo runs
# on macOS, where BSD sed silently emits a literal U instead of upper-casing.
const_name="$(printf '%s' "$slug" | awk -F- '{
  out = $1
  for (i = 2; i <= NF; i++) out = out toupper(substr($i, 1, 1)) substr($i, 2)
  print out
}')Takes"

cat > "$data_file" <<EOF
/**
 * GENERATED by scripts/import-takes.sh — do not edit.
 *
 * Every attempt at every beat of "$slug", in the order they were made,
 * with the one that made the final cut marked. Regenerate by changing the
 * folders under stories/$folder/videos/ and re-running:
 *
 *   scripts/import-takes.sh $slug${2:+ $folder}
 */

import type { SceneTakes } from "@/lib/content/takes";

export const $const_name: SceneTakes = {
  sceneSlug: "$slug",
  beats: [$beats_ts
  ],
};
EOF

echo
printf '%s: %s takes across %s beats (%s used, %s never made it in)\n' \
  "$slug" "$total" "$beat_count" "$used_total" "$((total - used_total))"
echo "  proxies  -> stories/take-$slug-*.proxy.mp4"
echo "  posters  -> $poster_dir/"
echo "  data     -> $data_file"
echo
echo "Add to lib/content/takes.ts:"
echo "  import { $const_name } from \"@/lib/content/takes-data/$slug\";"
echo "  export const takes: SceneTakes[] = [$const_name];"
echo
echo "Then: node scripts/upload-media.mjs"
