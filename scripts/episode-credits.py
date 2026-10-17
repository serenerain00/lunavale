#!/usr/bin/env python3
"""
Opening and closing credits for an episode.

Melissa, 2026-10-17, releasing Episode 4 that night: "can you add the opening
and closing credits? the title card at the end".

THE SAME OBJECT AS THE TRAILERS. The end title is scripts/trailer-end-title.py's
own render_frame — BETWEEN US, letters apart and drawing together, the hairline
rule, A LUNA VALE SERIES — so the episode closes on exactly the card the
trailers close on. The opening is the same gesture, quicker, with the episode
number under the rule instead of the series line (the pilot's main title,
stories/josh-luna-break/, is the same Didot setting).

WHERE THEY GO.
  OPENING, before the first frame, on black and in silence. Episodes cold-open
  on action; a title in the middle of a scene breaks it (Episode 4's nightmare
  cuts straight to Tyson waking, and a card there would undo the match cut).
  So the title comes first and the episode's first sound lands on it.
  CLOSING, where the episode's own picture has gone to black: `--end` trims the
  dead black and silence the export ends on, then "Created by Melissa Casole",
  then the end title. Silent, as the trailers are.

THE CARDS ARE RENDERED AT THE EPISODE'S OWN SIZE AND FRAME RATE, so nothing is
scaled and the join is a straight concat.

Usage:
  python3 scripts/episode-credits.py <episode> --number 4 --end 895.2 --still
  python3 scripts/episode-credits.py <episode> --number 4 --end 895.2 -o <out.mp4>
"""

import argparse
import importlib.util
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent

_spec = importlib.util.spec_from_file_location(
    "end_title", ROOT / "scripts" / "trailer-end-title.py")
end_title = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(end_title)

DIDOT = end_title.DIDOT
IVORY = end_title.IVORY
VOID = end_title.VOID
clamp01 = end_title.clamp01
ease_out_quint = end_title.ease_out_quint
ease_in_out_cubic = end_title.ease_in_out_cubic
tracked_width = end_title.tracked_width
draw_tracked = end_title.draw_tracked

# The opening is the end title's move, tightened: an episode's first seconds
# are not the place for a nine-second card.
O_HOLD, O_CONVERGE, O_SETTLE, O_FADE = 0.6, 2.2, 1.6, 1.0
O_TOTAL = O_HOLD + O_CONVERGE + O_SETTLE + O_FADE

CREDIT = "Created by Melissa Casole"
C_TOTAL = 3.6


# Spelled out: Didot's figures are old-style, and a "4" dropping below the
# line next to tracked capitals reads as a mistake.
WORDS = {str(i): w for i, w in enumerate(
    "ZERO ONE TWO THREE FOUR FIVE SIX SEVEN EIGHT NINE TEN ELEVEN TWELVE".split())}


def smooth(t):
    t = clamp01(t)
    return t * t * (3 - 2 * t)


def _finish(img, W, H, fade):
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow.paste((0, 0, 0, 120), (0, 0, W, H), img.split()[3])
    glow = glow.filter(ImageFilter.GaussianBlur(max(2, H // 90)))
    frame = Image.new("RGBA", (W, H), VOID + (255,))
    frame = Image.alpha_composite(frame, glow)
    frame = Image.alpha_composite(frame, img)
    if fade > 0:
        frame = Image.alpha_composite(frame, Image.new("RGBA", (W, H), (0, 0, 0, int(255 * fade))))
    return frame.convert("RGB")


def opening_frame(t, W, H, number):
    title_f = ImageFont.truetype(DIDOT, int(H * 0.115))
    sub_f = ImageFont.truetype(DIDOT, int(H * 0.038))
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    y_title, y_rule, y_sub = int(H * 0.415), int(H * 0.565), int(H * 0.590)

    letters = sum(d.textlength(c, font=title_f) for c in "BETWEEN US")
    track_start = max(end_title.TRACK_END,
                      (W * end_title.SPREAD_FILL - letters) / (len("BETWEEN US") - 1))
    p = ease_in_out_cubic(clamp01((t - O_HOLD) / O_CONVERGE))
    tracking = track_start + (end_title.TRACK_END - track_start) * p
    a = int(255 * clamp01(t / (O_HOLD * 0.8)))
    if a:
        draw_tracked(d, "BETWEEN US", title_f, tracking, y_title, IVORY + (a,), W)

    r = clamp01((t - (O_HOLD + O_CONVERGE - 0.25)) / 0.9)
    if r > 0:
        half = tracked_width(d, "BETWEEN US", title_f, end_title.TRACK_END) * 0.31 * ease_out_quint(r)
        d.line([(W / 2 - half, y_rule), (W / 2 + half, y_rule)],
               fill=IVORY + (int(120 * r),), width=max(1, H // 900))
    s = clamp01((t - (O_HOLD + O_CONVERGE + 0.1)) / 0.9)
    if s > 0:
        st = 24 + (12 - 24) * ease_out_quint(s)
        draw_tracked(d, f"EPISODE {WORDS.get(str(number), str(number))}", sub_f, st, y_sub, IVORY + (int(215 * s),), W)
    return _finish(img, W, H, clamp01((t - (O_TOTAL - O_FADE)) / O_FADE))


def credit_frame(t, W, H):
    f = ImageFont.truetype(DIDOT, int(H * 0.048), index=1)   # italic
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    a = smooth(t / 0.9) * (1 - smooth((t - (C_TOTAL - 0.9)) / 0.9))
    draw_tracked(d, CREDIT, f, 1, int(H * 0.47), IVORY + (int(235 * a),), W)
    return _finish(img, W, H, 0)


def probe(src):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate", "-of", "csv=p=0", str(src)],
        capture_output=True, text=True, check=True).stdout.strip().split(",")
    num, den = out[2].split("/")
    return int(out[0]), int(out[1]), round(int(num) / int(den))


def frames_to_movie(frames, fps, out, W, H):
    tmp = Path(tempfile.mkdtemp(prefix="credits-"))
    try:
        for i, im in enumerate(frames):
            im.save(tmp / f"f{i:05d}.png")
        dur = len(list(tmp.glob("*.png"))) / fps
        subprocess.run(
            ["ffmpeg", "-nostdin", "-v", "error", "-y", "-framerate", str(fps),
             "-i", str(tmp / "f%05d.png"), "-f", "lavfi", "-t", f"{dur:.3f}",
             "-i", "anullsrc=r=48000:cl=stereo", "-map", "0:v", "-map", "1:a",
             "-vf", f"scale={W}:{H},format=yuv420p", "-c:v", "libx264", "-crf", "14",
             "-preset", "medium", "-c:a", "pcm_s16le", "-shortest", str(out)],
            check=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--number", required=True)
    ap.add_argument("--end", type=float, required=True,
                    help="seconds: where the episode's own picture and sound are over")
    ap.add_argument("-o", "--out")
    ap.add_argument("--still", action="store_true", help="write a few frames to look at")
    a = ap.parse_args()
    src = Path(a.episode).resolve()
    W, H, fps = probe(src)

    if a.still:
        outdir = src.parent
        opening_frame(1.0, W, H, a.number).save(outdir / "credits-open-1s.jpg")
        opening_frame(O_HOLD + O_CONVERGE + 1.0, W, H, a.number).save(outdir / "credits-open-settled.jpg")
        credit_frame(C_TOTAL / 2, W, H).save(outdir / "credits-created-by.jpg")
        end_title.render_frame(end_title.TOTAL - end_title.FADE_OUT - 0.5, W, H, 0.038).save(outdir / "credits-end.jpg")
        print(f"stills in {outdir}")
        return

    out = Path(a.out or src.with_name(src.stem + "-credits.mp4")).resolve()
    tmp = Path(tempfile.mkdtemp(prefix="episode-credits-"))
    try:
        op, cl = tmp / "open.mov", tmp / "close.mov"
        n = int(round(O_TOTAL * fps))
        frames_to_movie((opening_frame(i / fps, W, H, a.number) for i in range(n)), fps, op, W, H)
        nc, ne = int(round(C_TOTAL * fps)), int(round(end_title.TOTAL * fps))
        closing = [credit_frame(i / fps, W, H) for i in range(nc)]
        closing += [end_title.render_frame(i / fps, W, H, 0.038) for i in range(ne)]
        frames_to_movie(iter(closing), fps, cl, W, H)

        # One pass: the cards and the episode (trimmed at --end) through the
        # concat filter, so differing codecs and audio rates are normalised.
        fc = (f"[1:v]trim=0:{a.end},setpts=PTS-STARTPTS,fps={fps},format=yuv420p[ev];"
              f"[1:a]atrim=0:{a.end},asetpts=PTS-STARTPTS,aresample=48000,"
              f"aformat=channel_layouts=stereo,afade=t=out:st={a.end - 0.4}:d=0.4[ea];"
              "[0:v]fps={fps},format=yuv420p[ov];[0:a]aresample=48000[oa];"
              "[2:v]fps={fps},format=yuv420p[cv];[2:a]aresample=48000[ca];"
              "[ov][oa][ev][ea][cv][ca]concat=n=3:v=1:a=1[v][a]").replace("{fps}", str(fps))
        subprocess.run(
            ["ffmpeg", "-nostdin", "-v", "error", "-stats", "-y", "-i", str(op), "-i", str(src), "-i", str(cl),
             "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
             "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-profile:v", "high",
             "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k",
             "-movflags", "+faststart", str(out)], check=True)
        print(f"wrote {out}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
