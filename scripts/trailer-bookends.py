#!/usr/bin/env python3
"""
Bookends for a trailer: a film-style opening card, a tagline, and the BETWEEN
US end title — built around an existing cut without touching its edit.

Melissa, 2026-10-09, on the interview trailer: "create an intro to the video
and an outro. I need the intro to say that this is what's coming (film style —
think HBO Max, feature film) and the outro will show Between Us title, where
the letters come together like we did with the trailer before this. I wanna
also say 'Some secrets don't stay buried'."

THE END TITLE IS NOT REDRAWN HERE. It is imported from
scripts/trailer-end-title.py — the same frames the first trailer ended on —
so the two trailers close on one object rather than two similar ones.

THE SHAPE:

  INTRO, on black, before a word of voice-over:
    "LUNA VALE PRESENTS" — small, wide-tracked, a credit.
    then "A FIRST LOOK" in Didot, a hairline rule, and beneath it
    "FROM A FUTURE SEASON OF BETWEEN US".
  SIZED FOR A PHONE (Melissa: "make sure it's mobile friendly"; 80% of the
  audience is on one). A landscape frame plays about 390pt wide on a phone —
  roughly 30% of 1320 — so every line is set to land at 12pt or more there:
  the credit and the sub-line at 5.4% and 4.4% of frame height, and the end
  title's credit at 4.2% (SUB_SIZE, passed into trailer-end-title.py, whose
  own default stays as the first trailer had it).

  Each beat fades up out of black and back into it, and the whole card drifts
  in by a few per cent over its life — a slow push, which is what keeps a title
  on black reading as a frame of film rather than a slide.

  OUTRO, where the cut goes to black (its own fade, not ours):
    "Some secrets don't stay buried." in Didot Italic, over the last of the
    song as it dies away — then the end title, in silence.

AUDIO. The intro is silent: the trailer's first sound is the voice-over, and a
cold open into a voice is the point. The trailer's audio runs on past its
picture so the song's own fade carries the tagline; after that, silence for
the title, as the first trailer had.

Usage:
  python3 scripts/trailer-bookends.py --still intro:2  # look at one frame
  python3 scripts/trailer-bookends.py --still tag:2
  python3 scripts/trailer-bookends.py <trailer> --picture-end S --audio-end S
"""

import argparse
import importlib.util
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent

_spec = importlib.util.spec_from_file_location(
    "end_title", ROOT / "scripts" / "trailer-end-title.py")
end_title = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(end_title)

SUB_SIZE = 0.042   # the end title's "A LUNA VALE SERIES", phone-legible
DIDOT = end_title.DIDOT
IVORY = end_title.IVORY
VOID = end_title.VOID
AMBER = (201, 138, 62)     # app/globals.css --color-amber
clamp01 = end_title.clamp01
ease_out_quint = end_title.ease_out_quint
tracked_width = end_title.tracked_width
draw_tracked = end_title.draw_tracked


def smooth(t: float) -> float:
    """Fades. Smoothstep, so nothing starts or stops with a visible edge."""
    t = clamp01(t)
    return t * t * (3 - 2 * t)


def beat_alpha(t, start, fade_in, hold, fade_out) -> float:
    if t < start:
        return 0.0
    u = t - start
    if u < fade_in:
        return smooth(u / fade_in)
    u -= fade_in
    if u < hold:
        return 1.0
    u -= hold
    return 1.0 - smooth(u / fade_out)


# ---- intro timing, seconds --------------------------------------------------
LEAD = 0.5                                    # black before anything
A_IN, A_HOLD, A_OUT = 1.0, 1.3, 0.8           # LUNA VALE PRESENTS
GAP = 0.35
B_AT = LEAD + A_IN + A_HOLD + A_OUT + GAP
B_IN, B_HOLD, B_OUT = 1.3, 2.1, 0.9           # A FIRST LOOK
INTRO_TOTAL = B_AT + B_IN + B_HOLD + B_OUT + 0.25
PUSH = 0.035                                  # the whole card drifts in 3.5%

# ---- tagline ----------------------------------------------------------------
TAG = "Some secrets don’t stay buried."
TAG_LEAD, TAG_IN, TAG_HOLD, TAG_OUT = 0.3, 1.2, 2.6, 1.0
TAG_TOTAL = TAG_LEAD + TAG_IN + TAG_HOLD + TAG_OUT + 0.3


def _glow_and_composite(layer: Image.Image, W: int, H: int) -> Image.Image:
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow.paste((0, 0, 0, 120), (0, 0, W, H), layer.split()[3])
    glow = glow.filter(ImageFilter.GaussianBlur(max(2, H // 90)))
    frame = Image.new("RGBA", (W, H), VOID + (255,))
    frame = Image.alpha_composite(frame, glow)
    return Image.alpha_composite(frame, layer)


def _push(img: Image.Image, scale: float) -> Image.Image:
    """Scale about the centre and crop back to size — the camera move."""
    W, H = img.size
    w2, h2 = int(W * scale), int(H * scale)
    big = img.resize((w2, h2), Image.LANCZOS)
    x, y = (w2 - W) // 2, (h2 - H) // 2
    return big.crop((x, y, x + W, y + H))


def render_intro(t: float, W: int, H: int) -> Image.Image:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    small = ImageFont.truetype(DIDOT, int(H * 0.054))
    big = ImageFont.truetype(DIDOT, int(H * 0.092))
    sub = ImageFont.truetype(DIDOT, int(H * 0.044))

    # Beat A — the credit. Tracking opens a touch as it sits, so it breathes.
    a = beat_alpha(t, LEAD, A_IN, A_HOLD, A_OUT)
    if a > 0:
        u = clamp01((t - LEAD) / (A_IN + A_HOLD + A_OUT))
        tr = 12 + 5 * u
        y = int(H * 0.5 - small.size * 0.6)
        draw_tracked(d, "LUNA VALE PRESENTS", small, tr, y, IVORY + (int(225 * a),), W)

    # Beat B — the title of the card, the rule, and what it is a look at.
    b = beat_alpha(t, B_AT, B_IN, B_HOLD, B_OUT)
    if b > 0:
        u = clamp01((t - B_AT) / (B_IN + B_HOLD + B_OUT))
        tr = 12 + 5 * u
        y_big = int(H * 0.40)
        draw_tracked(d, "A FIRST LOOK", big, tr, y_big, IVORY + (int(255 * b),), W)

        r = clamp01((t - B_AT - 0.45) / 1.0)
        if r > 0:
            full = tracked_width(d, "A FIRST LOOK", big, 12) * 0.42 / 2
            half = full * ease_out_quint(r)
            y_rule = int(H * 0.545)
            d.line([(W / 2 - half, y_rule), (W / 2 + half, y_rule)],
                   fill=AMBER + (int(170 * r * b),), width=max(1, H // 900))

        s = clamp01((t - B_AT - 0.7) / 1.0)
        if s > 0:
            st = 10 - 2 * ease_out_quint(s)
            draw_tracked(d, "FROM A FUTURE SEASON OF BETWEEN US", sub, st,
                         int(H * 0.575), IVORY + (int(200 * s * b),), W)

    frame = _glow_and_composite(layer, W, H)
    frame = _push(frame, 1.0 + PUSH * clamp01(t / INTRO_TOTAL))
    return frame.convert("RGB")


def render_tag(t: float, W: int, H: int) -> Image.Image:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    italic = ImageFont.truetype(DIDOT, int(H * 0.060), index=1)
    a = beat_alpha(t, TAG_LEAD, TAG_IN, TAG_HOLD, TAG_OUT)
    if a > 0:
        u = clamp01((t - TAG_LEAD) / (TAG_IN + TAG_HOLD + TAG_OUT))
        tr = 1.5 + 2.5 * u
        y = int(H * 0.5 - italic.size * 0.62)
        draw_tracked(d, TAG, italic, tr, y, IVORY + (int(250 * a),), W)
    frame = _glow_and_composite(layer, W, H)
    frame = _push(frame, 1.0 + 0.02 * clamp01(t / TAG_TOTAL))
    return frame.convert("RGB")


def render_seq(fn, total, W, H, fps, out: Path):
    tmp = Path(tempfile.mkdtemp(prefix="bookend-"))
    try:
        n = int(round(total * fps))
        for i in range(n):
            fn(i / fps, W, H).save(tmp / f"f{i:05d}.png")
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps),
             "-i", str(tmp / "f%05d.png"),
             "-c:v", "libx264", "-preset", "slow", "-crf", "14",
             "-pix_fmt", "yuv420p", str(out)], check=True)
        print(f"  wrote {out.name}  {n / fps:.2f}s")
        return n / fps
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def probe(src: Path):
    v = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,r_frame_rate", "-of", "csv=p=0",
         str(src)], capture_output=True, text=True, check=True).stdout.strip().split(",")
    num, den = v[2].split("/")
    rate = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0",
         "-show_entries", "stream=sample_rate", "-of", "csv=p=0", str(src)],
        capture_output=True, text=True, check=True).stdout.strip() or "48000"
    return int(v[0]), int(v[1]), round(int(num) / int(den)), rate


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("trailer", nargs="?")
    ap.add_argument("--picture-end", type=float,
                    help="where the trailer's picture goes to black")
    ap.add_argument("--audio-end", type=float,
                    help="where its sound has finished fading")
    ap.add_argument("--still", metavar="PART:T",
                    help="intro:T, tag:T or title:T — one frame, then stop")
    ap.add_argument("--size", default="1320x804")
    a = ap.parse_args()

    W, H = (int(x) for x in a.size.split("x"))
    if a.trailer:
        W, H, fps, rate = probe(Path(a.trailer))

    if a.still:
        part, t = a.still.split(":")
        fn = {"intro": render_intro, "tag": render_tag,
              "title": lambda t, W, H: end_title.render_frame(t, W, H, SUB_SIZE)}[part]
        out = ROOT / "stories" / "trailer" / f"bookend-{part}-{float(t):g}s.jpg"
        out.parent.mkdir(parents=True, exist_ok=True)
        fn(float(t), W, H).save(out, quality=95)
        print(f"wrote {out}")
        return

    if not (a.trailer and a.picture_end and a.audio_end):
        sys.exit("need <trailer> --picture-end S --audio-end S")
    src = Path(a.trailer)
    print(f"matching {src.name}: {W}x{H} @ {fps}fps, audio {rate}Hz")

    work = Path(tempfile.mkdtemp(prefix="bookends-"))
    try:
        intro_len = render_seq(render_intro, INTRO_TOTAL, W, H, fps, work / "intro.mp4")
        tag_len = render_seq(render_tag, TAG_TOTAL, W, H, fps, work / "tag.mp4")
        title_len = render_seq(lambda t, W, H: end_title.render_frame(t, W, H, SUB_SIZE),
                               end_title.TOTAL, W, H, fps,
                               work / "title.mp4")

        pe, ae = a.picture_end, a.audio_end
        # The song is allowed to run under the tagline; whatever of the outro
        # is left after it has faded is silence.
        tail = tag_len + title_len - (ae - pe)
        out = src.with_name(src.stem + "-bookended.mp4")
        graph = (
            f"[0:v]trim=0:{pe},setpts=PTS-STARTPTS,scale={W}:{H},setsar=1,fps={fps}[tv];"
            f"[1:v]setsar=1,fps={fps}[iv];[2:v]setsar=1,fps={fps}[gv];[3:v]setsar=1,fps={fps}[ev];"
            f"[iv][tv][gv][ev]concat=n=4:v=1:a=0[v];"
            f"anullsrc=r={rate}:cl=stereo,atrim=0:{intro_len}[ia];"
            f"[0:a]atrim=0:{ae},asetpts=PTS-STARTPTS,aformat=sample_rates={rate}:channel_layouts=stereo[ta];"
            f"anullsrc=r={rate}:cl=stereo,atrim=0:{max(0.0, tail):.3f}[sa];"
            f"[ia][ta][sa]concat=n=3:v=0:a=1[a]"
        )
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
             "-i", str(work / "intro.mp4"), "-i", str(work / "tag.mp4"),
             "-i", str(work / "title.mp4"),
             "-filter_complex", graph, "-map", "[v]", "-map", "[a]",
             "-c:v", "libx264", "-preset", "slow", "-crf", "16",
             "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k",
             "-movflags", "+faststart", str(out)], check=True)
        print(f"wrote {out}")
        print(f"  intro {intro_len:.2f}s — the trailer starts at {intro_len:.2f}s in this file")
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    main()
