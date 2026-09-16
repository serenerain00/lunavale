#!/usr/bin/env python3
"""
The end title for a trailer: BETWEEN US, letters apart and drawing together.

Melissa, 2026-09-15: "create a ending frame sequence (pro film trailer style)
that displays the title of the series... I want Between Us - the letters to be
separeted then slowly come together."

WHY A FRAME SEQUENCE AND NOT `drawtext`. This ffmpeg is built without freetype,
so drawtext does not exist — the repo has hit this before and the answer is
always the same: render the type with PIL and hand ffmpeg pictures. Because
the tracking changes every frame, this renders a PNG per frame rather than one
card, and ffmpeg only has to encode them.

IT INHERITS THE SETTING RATHER THAN INVENTING ONE. Didot, the site's ivory, the
hairline rule, "A LUNA VALE SERIES" beneath it — all of it from
stories/josh-luna-break/between-us-maintitle.build.py and
stories/trailer/title.py, so the end card and the main title read as one
object. The animation is the only new thing.

WHY IT LIVES IN scripts/ AND NOT BESIDE THE FOOTAGE. The two existing title
builders sit in stories/, which is gitignored in its entirety — so they are one
`rm` from gone and no version of them exists anywhere. This is source, not
media. It goes where source goes and writes its output into stories/.

THE MOVE, and every number in it is a decision rather than a default:

  TRACKING 150px -> 16px on an ease-out-quint. Quint because the interesting
  part of this move is the settle, not the travel: it covers half the distance
  in the first fifth of the time and then spends the rest arriving. A linear
  converge reads as a slide; this reads as letters finding their places.

  THE LETTERS ARRIVE AT THE TRACKING THE MAIN TITLE ALREADY USES (16), so the
  frame it settles on is the frame the film itself carries.

  OPACITY 0 -> 1 over the first 45% of the converge, so they are still moving
  when they become legible. Fading up after the move lands is what makes a
  title look like a slide in a deck.

  THE RULE DRAWS OUT FROM THE CENTRE once the type has essentially settled —
  the same gesture as the letters, running the other way, and it is what makes
  the card feel composed rather than animated.

  THE SUBTITLE IS LAST AND BARELY MOVES. 24 -> 11 tracking over its fade. It is
  a credit, not a title, and it should look like it was always there.

Usage:
  python3 scripts/trailer-end-title.py --still      # one frame to look at
  python3 scripts/trailer-end-title.py              # the card, as a movie
  python3 scripts/trailer-end-title.py --append <trailer.mp4>
"""

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "stories" / "trailer"

DIDOT = "/System/Library/Fonts/Supplemental/Didot.ttc"
IVORY = (242, 236, 228)
VOID = (10, 9, 8)          # app/globals.css --color-void, not pure black

# ---- timing, in seconds -----------------------------------------------------
#
# THE SPREAD IS HELD BEFORE IT MOVES, and that is the whole correction. The
# first cut of this ran ease-out-quint straight from frame one, which front-
# loads the travel so hard that the letters were 98% together by 1.5s — they
# were apart for about half a second, while still fading up, and nobody would
# have seen it. The brief was "separated then slowly come together", and it was
# doing the second half only.
#
# So: they fade up at full spread and SIT there for most of a second, then
# travel on an ease-in-out. Slow away, slow into place, and the middle is where
# the distance actually gets covered — which is the move you can watch.
SPREAD_HOLD = 0.9  # up, wide, and completely still
CONVERGE = 2.9     # letters travelling
RULE_AT = SPREAD_HOLD + CONVERGE - 0.25
RULE_LEN = 1.0
SUB_AT = SPREAD_HOLD + CONVERGE + 0.25
SUB_LEN = 1.1
HOLD = 2.0         # everything up, nothing moving
FADE_OUT = 1.3
TOTAL = SPREAD_HOLD + CONVERGE + 1.35 + HOLD + FADE_OUT

# THE SPREAD IS DERIVED FROM THE FRAME, NOT A CONSTANT. It was a flat 150px,
# which is fine at 1920 and runs the B and the S off the edge at 1952 — the
# spread title is wider than the picture, so the first thing the card does is
# crop its own title. A fixed letterspacing cannot know how wide the frame is.
#
# So the opening tracking is whatever makes the spread title fill SPREAD_FILL
# of the width, and it is correct at any size this is ever rendered at.
SPREAD_FILL = 0.88
TRACK_END = 16.0
SUB_TRACK_START, SUB_TRACK_END = 24.0, 11.0


def ease_out_quint(t: float) -> float:
    """Used for the rule and the subtitle, where a quick settle is right."""
    return 1 - pow(1 - t, 5)


def ease_in_out_cubic(t: float) -> float:
    """The letters. Eases away from the spread and eases into place, so the
    distance is covered in the middle where it can be watched."""
    return 4 * t * t * t if t < 0.5 else 1 - pow(-2 * t + 2, 3) / 2


def clamp01(x: float) -> float:
    return 0.0 if x < 0 else 1.0 if x > 1 else x


def tracked_width(draw, text, fnt, tracking) -> float:
    return sum(draw.textlength(c, font=fnt) for c in text) + tracking * (len(text) - 1)


def draw_tracked(draw, text, fnt, tracking, y, fill, width):
    x = (width - tracked_width(draw, text, fnt, tracking)) / 2
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + tracking


def render_frame(t: float, W: int, H: int) -> Image.Image:
    title_f = ImageFont.truetype(DIDOT, int(H * 0.115))
    sub_f = ImageFont.truetype(DIDOT, int(H * 0.025))

    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    y_title = int(H * 0.415)
    y_rule = int(H * 0.565)
    y_sub = int(H * 0.590)

    # Nothing moves until the spread has been up long enough to register.
    letters = sum(d.textlength(c, font=title_f) for c in "BETWEEN US")
    track_start = max(TRACK_END, (W * SPREAD_FILL - letters) / (len("BETWEEN US") - 1))

    p = ease_in_out_cubic(clamp01((t - SPREAD_HOLD) / CONVERGE))
    tracking = track_start + (TRACK_END - track_start) * p
    # Fully up before the travel starts, so the separation is what you see
    # first rather than something that resolves out of a fade.
    alpha = int(255 * clamp01(t / (SPREAD_HOLD * 0.8)))
    if alpha:
        draw_tracked(d, "BETWEEN US", title_f, tracking, y_title, IVORY + (alpha,), W)

    r = clamp01((t - RULE_AT) / RULE_LEN)
    if r > 0:
        full = tracked_width(d, "BETWEEN US", title_f, TRACK_END) * 0.62 / 2
        half = full * ease_out_quint(r)
        d.line(
            [(W / 2 - half, y_rule), (W / 2 + half, y_rule)],
            fill=IVORY + (int(120 * r),),
            width=max(1, H // 900),
        )

    s = clamp01((t - SUB_AT) / SUB_LEN)
    if s > 0:
        st = SUB_TRACK_START + (SUB_TRACK_END - SUB_TRACK_START) * ease_out_quint(s)
        draw_tracked(d, "A LUNA VALE SERIES", sub_f, st, y_sub,
                     IVORY + (int(205 * s),), W)

    # The type, blurred and darkened under itself. On black it does almost
    # nothing at full opacity and a great deal while the letters are still
    # spread — it keeps thin Didot strokes from buzzing as they move.
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow.paste((0, 0, 0, 120), (0, 0, W, H), img.split()[3])
    glow = glow.filter(ImageFilter.GaussianBlur(max(2, H // 90)))

    frame = Image.new("RGBA", (W, H), VOID + (255,))
    frame = Image.alpha_composite(frame, glow)
    frame = Image.alpha_composite(frame, img)

    # Whole-card fade to black at the end.
    f = clamp01((t - (TOTAL - FADE_OUT)) / FADE_OUT)
    if f > 0:
        black = Image.new("RGBA", (W, H), (0, 0, 0, int(255 * f)))
        frame = Image.alpha_composite(frame, black)
    return frame.convert("RGB")


def build(W, H, fps, out: Path):
    tmp = Path(tempfile.mkdtemp(prefix="endtitle-"))
    try:
        n = int(TOTAL * fps)
        for i in range(n):
            render_frame(i / fps, W, H).save(tmp / f"f{i:05d}.png")
            if i % 24 == 0:
                print(f"  {i}/{n}", end="\r", flush=True)
        print(" " * 24, end="\r")
        out.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps),
             "-i", str(tmp / "f%05d.png"),
             "-c:v", "libx264", "-preset", "slow", "-crf", "16",
             "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out)],
            check=True,
        )
        print(f"wrote {out}  ({TOTAL:.1f}s, {W}x{H} @ {fps}fps)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--still", type=float, metavar="T",
                    help="render one frame at T seconds and stop")
    ap.add_argument("--append", metavar="TRAILER",
                    help="concatenate the card onto this file, matching its format")
    ap.add_argument("--src-end", type=float, metavar="SECONDS",
                    help="trim the trailer here first. A trailer that already "
                         "fades to black leaves several seconds of it on the "
                         "tail, and a card arriving after four seconds of dead "
                         "air reads as a mistake rather than a beat.")
    ap.add_argument("--width", type=int, default=1920)
    ap.add_argument("--height", type=int, default=1080)
    ap.add_argument("--fps", type=int, default=24)
    a = ap.parse_args()

    W, H, fps = a.width, a.height, a.fps

    if a.append:
        src = Path(a.append)
        if not src.exists():
            sys.exit(f"no trailer at {src}")
        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0",
             "-show_entries", "stream=width,height,r_frame_rate",
             "-of", "csv=p=0", str(src)],
            capture_output=True, text=True, check=True).stdout.strip().split(",")
        W, H = int(probe[0]), int(probe[1])
        num, den = probe[2].split("/")
        fps = round(int(num) / int(den))
        rate = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "a:0",
             "-show_entries", "stream=sample_rate", "-of", "csv=p=0", str(src)],
            capture_output=True, text=True, check=True).stdout.strip() or "48000"
        print(f"matching {src.name}: {W}x{H} @ {fps}fps, audio {rate}Hz")

    if a.still is not None:
        OUT_DIR.mkdir(parents=True, exist_ok=True)
        p = OUT_DIR / f"end-title-{a.still:g}s.jpg"
        render_frame(a.still, W, H).save(p, quality=95)
        print(f"wrote {p}")
        return

    card = OUT_DIR / "between-us-end-title.mp4"
    build(W, H, fps, card)

    if a.append:
        src = Path(a.append)
        out = src.with_name(src.stem + "-titled.mp4")
        # Re-encode both through one graph rather than concat-demuxing: the
        # trailer and the card will not share an encoder, and a stream copy of
        # mismatched files is how you get a second half that will not seek.
        trim = f"-t {a.src_end} " if a.src_end else ""
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error"]
            + (["-t", str(a.src_end)] if a.src_end else [])
            + ["-i", str(src), "-i", str(card),
             "-filter_complex",
             f"[0:v]scale={W}:{H},setsar=1,fps={fps}[v0];"
             f"[1:v]scale={W}:{H},setsar=1,fps={fps}[v1];"
             f"[0:a]aformat=sample_rates={rate}:channel_layouts=stereo[a0];"
             f"anullsrc=r={rate}:cl=stereo,atrim=0:{TOTAL}[a1];"
             f"[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]",
             "-map", "[v]", "-map", "[a]",
             "-c:v", "libx264", "-preset", "slow", "-crf", "18",
             "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
             "-movflags", "+faststart", str(out)],
            check=True,
        )
        print(f"wrote {out}")


if __name__ == "__main__":
    main()
