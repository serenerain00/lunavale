#!/usr/bin/env bash
#
# make-preview-cut.sh — assemble the short PUBLIC cut of a scene from beats
# taken out of the master.
#
# Some scenes are one long unbroken take. `Video.premium` can serve a short
# public cut and a long members' one, but only if a short cut exists, and you
# cannot make one by lopping the first fifteen seconds off a single take — the
# first fifteen seconds of a two-minute performance are the setup, not the
# scene. So the public cut is assembled: a handful of beats pulled from across
# the take and dissolved together.
#
# WHAT THE BEATS ARE FOR. A preview sells the rest; it does not summarize it.
# The spans below are chosen to show the state a character is in and to stop
# before the thing that state is heading towards. That turn is what the
# membership is. If you add a scene here, pick beats on the same rule and keep
# the reveal out — a preview that gives away the ending has nothing left to
# offer.
#
# Output is a MASTER, at the source's resolution. It is not what ships; feed it
# to optimize-media.sh, which makes the proxy and the poster:
#
#   scripts/make-preview-cut.sh luna-truck-breakdown
#   scripts/optimize-media.sh import luna-truck-breakdown \
#     stories/luna-truck-breakdown/luna-truck-breakdown-preview.mp4 3
#
# Usage: ./scripts/make-preview-cut.sh [slug ...]     (no args = all)
set -euo pipefail
cd "$(dirname "$0")/.."

DISSOLVE=0.5   # seconds of crossfade between beats
FADE_IN=0.6    # up from black
FADE_OUT=0.7   # and back down at the end

# slug|master|beat start seconds, space separated|beat duration seconds
#
# Total runtime = (beats × duration) − ((beats − 1) × DISSOLVE).
BEATS=(
  # The drive to Tyson: 2m52s of one wide shot, no dialogue, her alone in the
  # cab losing a fight with her own breathing. Five beats, in the order the
  # panic actually escalates — jaw set and holding on, the first broken
  # breath, both hands off the wheel talking herself down, the hand in her
  # hair, and her face going. 5 × 3.4 − 4 × 0.5 = 15.0s.
  #
  # It STOPS AT 70s of a 173s take, and that is the whole design. Tyson does
  # not appear until 2:06, and everything the scene is actually about — her
  # getting to him, and what she does when she does — is in the last forty
  # seconds. A visitor sees her alone and does not find out whether anyone is
  # waiting at the end of the drive.
  "luna-truck-breakdown|stories/luna-truck-breakdown/luna-truck-breakdown.mp4|12.4 27.6 41.8 50.5 66.8|3.4"
)

want=("$@")
for entry in "${BEATS[@]}"; do
  IFS='|' read -r slug src starts dur <<<"$entry"

  if [ ${#want[@]} -gt 0 ]; then
    match=0
    for w in "${want[@]}"; do [ "$w" = "$slug" ] && match=1; done
    [ "$match" = 1 ] || continue
  fi

  if [ ! -f "$src" ]; then
    echo "skip $slug — no master at $src" >&2
    continue
  fi

  out="$(dirname "$src")/$slug-preview.mp4"

  # One -ss/-t input per beat, then an xfade chain over the video and a
  # matching acrossfade over the audio so a seam is never visible in one and
  # audible in the other. Offsets accumulate: each dissolve overlaps the two
  # beats it joins, so the running length grows by (dur - DISSOLVE) a time.
  inputs=()
  vchain=""
  achain=""
  n=0
  running=0
  for start in $starts; do
    inputs+=(-ss "$start" -t "$dur" -i "$src")
    if [ "$n" = 0 ]; then
      vchain="[0:v]setpts=PTS-STARTPTS[v0];"
      achain="[0:a]asetpts=PTS-STARTPTS[a0];"
      running="$dur"
    else
      offset=$(echo "$running - $DISSOLVE" | bc)
      vchain="$vchain[$n:v]setpts=PTS-STARTPTS[s$n];[v$((n-1))][s$n]xfade=transition=fade:duration=$DISSOLVE:offset=$offset[v$n];"
      achain="$achain[$n:a]asetpts=PTS-STARTPTS[t$n];[a$((n-1))][t$n]acrossfade=d=$DISSOLVE[a$n];"
      running=$(echo "$running + $dur - $DISSOLVE" | bc)
    fi
    n=$((n + 1))
  done
  last=$((n - 1))
  fade_out_at=$(echo "$running - $FADE_OUT" | bc)

  ffmpeg -y -loglevel error "${inputs[@]}" \
    -filter_complex "${vchain}${achain}[v$last]fade=t=in:st=0:d=$FADE_IN,fade=t=out:st=$fade_out_at:d=$FADE_OUT[vout]" \
    -map "[vout]" -map "[a$last]" \
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -movflags +faststart \
    "$out"

  printf '%-28s %s beats -> %s (%ss, %s)\n' \
    "$slug" "$n" "$out" "$running" "$(du -h "$out" | cut -f1)"
done
