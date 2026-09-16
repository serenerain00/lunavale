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
# AUDIO IS OFF BY DEFAULT AND OPT-IN PER LINE — the fifth field. The page
# autoplays these, and autoplay WITH sound is refused by every browser for a
# visitor with no prior engagement, so the hero starts muted regardless; the
# audio exists only so the sound button on the hero has something to unmute
# (components/home/Hero.tsx).
#
# ONLY TURN IT ON WHERE THE SPAN SITS INSIDE THAT CLIP'S PUBLIC PREVIEW WINDOW.
# The video for a span can be public while its audio is not: the older lines
# below were cut before that rule existed, and luna-tyson-casey-bar is the
# worked example — its loop is 86-116s, its preview starts at 131s, so shipping
# that audio would publish dialogue from a members-only stretch of the scene.
# Those stay silent, and the hero simply shows no sound button when the loop
# it is playing has no audio track.
#
# A 0.6s fade in and out sits at the loop boundary, because a 30-second span
# lifted from the middle of a scene hard-cuts on wrap and the click is the
# thing people notice.
#
# NAMING IS LOAD-BEARING. Each loop is named for the scene slug it was cut
# from, because the hero's play button plays that scene — lib/content/hero.ts
# derives both the media paths and the link target from the slug. A loop whose
# name doesn't match a slug in lib/content/videos.ts will not appear.
#
# FREE SCENES, OR PREMIUM ONES WITH A PUBLIC PREVIEW. The hero used to rotate
# through premium scenes with nothing to watch behind them, so the front page
# led with a play button that opened a locked door; the rule was free-only from
# 2026-08-05 until previews existed. hero.ts now drops any scene that has
# neither free access nor a preview, so adding one of those here does nothing —
# but do not add one and wonder why.
#
# Publishing a loop from a members-only scene is a deliberate choice each time:
# those seconds become public permanently, at a public URL, the way a premium
# scene's poster already is. It still cannot widen what a non-member can watch
# of the scene itself, because the gated route remains the only way to its
# bytes.
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

# scene-slug|source|start seconds|duration seconds|audio (1 = keep, blank = silent)
#
# Spans are picked for two things: a composition that leaves the lower left
# free for the headline, and a wrap-around you can't see — either a near-static
# shot, or one where the loop point lands on a cut.
HEROES=(
  # THE TRAILER, 2026-09-15. 38s from 0:12, which clears the opening
  # photograph-on-a-table (a static object makes a dead ambient loop) and stops
  # well short of the BETWEEN US end card at 1:33 — a hero loop that contains
  # the title card would show the title twice on one screen.
  #
  # IT IS A MONTAGE, so the lower-left rule the spans below are chosen for
  # cannot hold across every shot in it. Accepted: this one is pinned and is
  # meant to read as a film playing behind the headline rather than as a single
  # composed frame.
  "between-us-trailer-one|stories/between-us-trailer-one.proxy.mp4|12|38"
  # Night, warm, string lights and movement in depth. The strongest of them.
  "luna-josh-fair|stories/luna-josh-fair.proxy.mp4|8|40"
  # Daylight, big windows, the warmest room in the story.
  "luna-josh-coffee|stories/luna-josh-coffee.proxy.mp4|20|40"
  # The lake through the glass — the only hero with real daylight distance in it.
  "luna-cathy-phone|stories/luna-cathy-phone.proxy.mp4|4|35"
  # Bodies moving, colored light, a crowd. Reads as a film from across a room.
  "luna-tyson-dance|stories/luna-tyson-dance-full.proxy.mp4|30|40"
  # Night interior, lamplight, one figure. Quiet counterweight to the dance.
  "luna-avery-ipad|stories/luna-avery-ipad.proxy.mp4|4|35"
  # Day exterior through the barn door, two men working. Green and open.
  "josh-tyson-barn|stories/josh-tyson-barn.proxy.mp4|10|40"
  # Hands, a wrench, someone actually doing something.
  "josh-luna-bolt|stories/josh-luna-bolt.proxy.mp4|6|40"
  # The bar, mid-argument. THE FIRST MEMBERS-ONLY HERO — allowed because the
  # scene has a public preview, so the play button does not open a locked door
  # (see lib/content/hero.ts).
  #
  # 30 SECONDS FROM THE MIDDLE, Melissa's ask. 86s is just after a cut and
  # 86+30=116 lands on the next one, so the wrap-around reads as an edit rather
  # than a jump — and it centres on 101s of a 205s scene, which is the middle.
  #
  # SOURCE IS THE MASTER, unlike every line above. This scene's proxy is
  # 1116x720, so cropping it to 1280x720 would upscale; the 1320x852 master
  # crops down instead.
  "luna-tyson-casey-bar|stories/luna-tyson-casey-bar/luna-tyson-casey-bar-music.mov|86|30"

  # ─── 2026-09-16: the hero now leads with what went up most recently, so the
  # pool has to be deep enough at the top for "newest" to mean something. Five
  # added, all from the last three weeks.
  #
  # EVERY SPAN BELOW SITS INSIDE THAT CLIP'S EXISTING PUBLIC PREVIEW WINDOW.
  # That is the rule this batch was cut under and it should hold for every one
  # after it: a hero loop is permanently public, so taking it from footage that
  # is already public means publishing a loop can never widen what a
  # non-member has seen. Windows are `preview.hookStart` to
  # `hookStart + preview.durationSeconds` in lib/content/videos.ts — check
  # them before adding a line here, because they are not all from zero.
  #
  # Preview 0–60. Night, lit water, candles, the warmest frame in the library.
  # 18s clears the opening singles and lands on the seated two-shot; the whole
  # span holds one composition with the pool behind them and the lower left on
  # loungers. The explicit material in this scene is in the members' cut only
  # (josh-luna-pool-explicit), never in this file.
  "josh-luna-pool|stories/josh-luna-pool.proxy.mp4|18|30|1"
  # Preview 90–135. Lamplit room, one figure, the lake and a moon through the
  # glass. The quiet one.
  "luna-lkehouse-wine-shatter|stories/luna-lkehouse-wine-shatter.proxy.mp4|103|30|1"
  # Preview 89–149. Bar, bokeh, a crowd in depth — reads as a film from across
  # a room, the same job luna-tyson-dance does.
  "ty-luna-blonde-guy-bar|stories/ty-luna-blonde-guy-bar.proxy.mp4|100|30|1"
  # Preview 0–60. Night apartment, lamplight, city through the window.
  "tyson-apt-thinking|stories/tyson-apt-thinking.proxy.mp4|26|30|1"
  # Preview 0–45. Daylight, a truck on a mountain road, then the two of them in
  # the cab. The only recent one with real exterior distance in it.
  "josh-ty-ricks-house|stories/josh-ty-ricks-house.proxy.mp4|5|24|1"
  #
  # NOT ADDED, and the reason matters because it is the standing test:
  #   luna-ty-apt-argue — the newest clip of the lot and excluded anyway. Its
  #     preview window is almost unlit (a hero carries a headline; that one is
  #     a black rectangle behind text, the same objection that keeps
  #     josh-rick-study out) and it reaches partial nudity inside the window.
  #     Being newest does not get a clip into the hero.
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
  IFS='|' read -r slug src start duration audio <<<"$entry"

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

  # Keep the audio only where the line asked for it AND the source actually has
  # some — a missing stream would otherwise fail the filter rather than
  # degrading to silence.
  has_audio=0
  if [ "${audio:-}" = "1" ]; then
    if ffprobe -v error -select_streams a:0 -show_entries stream=index \
         -of csv=p=0 "$src" | grep -q .; then
      has_audio=1
    else
      echo "  $slug: asked for audio, source has none — writing it silent" >&2
    fi
  fi

  if [ "$has_audio" = "1" ]; then
    fade_out=$(python3 -c "print(max(0, $duration - 0.6))")
    audio_args=(-af "afade=t=in:st=0:d=0.6,afade=t=out:st=${fade_out}:d=0.6"
                -c:a aac -b:a 96k -ac 2)
  else
    audio_args=(-an)
  fi

  # 30fps and 1280 wide keep an ambient background well under a megabyte from a
  # 1080p master. yuv420p + faststart so it plays inline on iOS and starts
  # before the whole file has arrived.
  ffmpeg -y -v error \
    -ss "$start" -t "$duration" -i "$src" \
    "${audio_args[@]}" \
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

  printf '%-26s loop %-6s poster %-6s %s\n' \
    "$slug" "$(du -h "$video" | cut -f1)" "$(du -h "$poster" | cut -f1)" \
    "$([ "$has_audio" = "1" ] && echo 'with audio' || echo 'silent')"
done
