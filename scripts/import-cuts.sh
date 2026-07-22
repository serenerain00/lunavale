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

# slug|source path|poster seconds (optional, default 3)
CUTS=(
  "luna-tyson-bar|stories/luna-tyson-bar/luna-tyson-bar.mp4"
  "luna-josh-bed|stories/luna-josh-bed/0715.mp4"
  "luna-josh-dinner-house|stories/luna-josh-dinner-house/0717.mp4"
  "luna-josh-kitchen-kiss|stories/luna-josh-farm-kitchen-kiss/luna-josh-kitchen-kiss.mp4"
  "luna-josh-house|stories/luna-josh-house/0715.mp4"
  "ty-luna-lake-fight|stories/ty-luna-farm-lake/ty-luna-lake-fight.mp4"
  "ty-luna-farm-road|stories/ty-luna-farmRd/Ty-luna.mp4"
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
