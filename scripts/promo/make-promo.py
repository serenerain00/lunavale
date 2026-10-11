#!/usr/bin/env python3
"""
Cut a vertical promo for Instagram from an edit list.

Melissa, 2026-10-11: "i would really like it if you could create custom
videos, trailer feel, montages... stuff that makes people FEEL something."
And: under 30 seconds for IG, music is fine.

ONE SCRIPT, MANY SPECS. Every promo is a JSON edit list in scripts/promo/specs/
— shots, a music bed, a few lines of type, an end card. This file is the
machine that turns one into an MP4; the creative decisions live in the spec,
where they can be read and changed without touching code.

THE MIX IS A TRAILER MIX, NOT THE SCENE'S MIX. Picture and dialogue come from
the clean export (no music). The music comes from the `-music` export, taken
only from stretches where nobody is talking, and laid under the cut as one
continuous bed: low under the banter, then up at `swell`. Cutting the scene's
own mix shot-to-shot would make the song jump at every cut, which is the single
fastest way to make an edit look amateur.

THE FRAME. Sources are landscape two-shots with the faces far apart, so a 9:16
crop loses one of them. Each shot is cropped 4:5 around a chosen centre, scaled
to 1080x1350, and placed high on a 1080x1920 black canvas (top at PIC_Y) —
clear of the caption and buttons Instagram lays over the bottom ~350px.

NO DRAWTEXT (this ffmpeg has no freetype). Type is rendered with PIL, in Didot
and the site's ivory, exactly like scripts/trailer-end-title.py.

NO LINE IS EVER CUT OFF (Melissa, 2026-10-11: "make sure no dialogue is
abruptly cut off"). Before anything renders, every cut point that has audible
source sound is checked against where people are actually speaking, measured
from the clean export's own audio — speech sits ~20 dB over the room tone
there. Whisper's timings are not used for this: they snap to whole seconds at
the start of each line, which is exactly where a cut lands. A cut inside speech
stops the render with the nearest safe points; `--snap` moves it outward to the
pause instead (in earlier, out later), so snapping can only ever add words,
never clip them.

NO FLASH FRAMES (Melissa, same day: "a shot start, then another one shows
up... it needs to cut cleanly"). The sources are already edited, with their own
camera cuts inside them. A promo shot that starts or ends within MIN_PIECE of
one of those shows a sliver of the other angle before the real shot settles.
Every shot is checked against the source's cuts (ffmpeg scene detection), and
`--snap` moves the picture edge onto the source cut.

When that would clip a line — the camera cuts a beat before somebody speaks —
the sound and the picture part company, the way trailer editors do it: a shot
may carry `lead` (its audio starts that many seconds before its picture, under
the end of the previous shot: a J-cut) or `tail` (its audio runs on under the
next shot: an L-cut). The dialogue guard checks the audio edges, the picture
guard checks the picture edges, and both have to pass.

Usage:
  python3 scripts/promo/make-promo.py scripts/promo/specs/it-suits-you.json
  python3 scripts/promo/make-promo.py <spec> --plan      # print the timeline only
  python3 scripts/promo/make-promo.py <spec> --sheet     # contact sheet of the cut

Output goes to stories/_promos/ (gitignored, never deployed).
"""

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent.parent
OUT_DIR = ROOT / "stories" / "_promos"

W, H, FPS = 1080, 1920, 30
PIC_W, PIC_H = 1080, 1350          # 4:5 picture area
PIC_Y = 230                        # top of the picture on the canvas
DIDOT = "/System/Library/Fonts/Supplemental/Didot.ttc"
IVORY = (242, 236, 228)
VOID = (10, 9, 8)
AR = 48000


def run(cmd):
    subprocess.run(cmd, check=True)


def probe_size(src: Path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height", "-of", "csv=p=0", str(src)],
        capture_output=True, text=True, check=True).stdout.strip()
    w, h = out.split(",")[:2]
    return int(w), int(h)


# ---- type ------------------------------------------------------------------

def font(size, italic=False):
    # Didot.ttc: index 0 regular, 1 italic, 2 bold.
    return ImageFont.truetype(DIDOT, size, index=1 if italic else 0)


def tracked_width(d, text, f, tr):
    return sum(d.textlength(c, font=f) for c in text) + tr * (len(text) - 1)


def draw_tracked(d, text, f, tr, y, fill):
    x = (W - tracked_width(d, text, f, tr)) / 2
    for ch in text:
        d.text((x, y), ch, font=f, fill=fill)
        x += d.textlength(ch, font=f) + tr


def with_glow(layer):
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow.paste((0, 0, 0, 170), (0, 0, W, H), layer.split()[3])
    glow = glow.filter(ImageFilter.GaussianBlur(14))
    return Image.alpha_composite(glow, layer)


def card_png(text, y_frac, size_frac, italic, tracking, path):
    """A line of type on a transparent full frame, for overlaying."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f = font(int(W * size_frac), italic)
    lines = text.split("\n")
    lh = int(W * size_frac * 1.25)
    y0 = int(H * y_frac) - lh * len(lines) // 2
    for i, line in enumerate(lines):
        draw_tracked(d, line, f, tracking, y0 + i * lh, IVORY + (255,))
    with_glow(img).save(path)


def ease_in_out_cubic(t):
    return 4 * t * t * t if t < 0.5 else 1 - pow(-2 * t + 2, 3) / 2


def ease_out_quint(t):
    return 1 - pow(1 - t, 5)


def clamp01(x):
    return 0.0 if x < 0 else 1.0 if x > 1 else x


def end_frame(t, dur, title, url, kicker):
    """BETWEEN US drawing together (the series' end-title gesture, sized for a
    phone), the clip's title above it, and the address beneath."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    big = font(int(W * 0.105))
    small = font(int(W * 0.040), italic=True)
    tiny = font(int(W * 0.031))

    letters = sum(d.textlength(c, font=big) for c in "BETWEEN US")
    tr_end = W * 0.012
    tr_start = max(tr_end, (W * 0.94 - letters) / 9)
    hold, conv = 0.35, min(1.9, dur * 0.55)
    p = ease_in_out_cubic(clamp01((t - hold) / conv))
    tr = tr_start + (tr_end - tr_start) * p
    a = int(255 * clamp01(t / 0.3))
    y_title = int(H * 0.40)
    if title:
        ta = int(230 * clamp01((t - 0.1) / 0.5))
        draw_tracked(d, title, small, 2, y_title - int(W * 0.10), IVORY + (ta,))
    draw_tracked(d, "BETWEEN US", big, tr, y_title, IVORY + (a,))

    r = clamp01((t - hold - conv + 0.2) / 0.6)
    y_rule = y_title + int(W * 0.15)
    if r > 0:
        half = tracked_width(d, "BETWEEN US", big, tr_end) * 0.31 * ease_out_quint(r)
        d.line([(W / 2 - half, y_rule), (W / 2 + half, y_rule)],
               fill=IVORY + (int(130 * r),), width=2)
    s = clamp01((t - hold - conv + 0.35) / 0.6)
    if s > 0:
        if kicker:
            draw_tracked(d, kicker, tiny, 7, y_rule + int(W * 0.035), IVORY + (int(190 * s),))
        draw_tracked(d, url, small, 1, y_rule + int(W * 0.075), IVORY + (int(245 * s),))

    frame = Image.new("RGBA", (W, H), VOID + (255,))
    frame = Image.alpha_composite(frame, with_glow(img))
    f = clamp01((t - (dur - 0.45)) / 0.45)
    if f > 0:
        frame = Image.alpha_composite(frame, Image.new("RGBA", (W, H), (0, 0, 0, int(255 * f))))
    return frame.convert("RGB")


# ---- sources ---------------------------------------------------------------

def src_of(spec, it) -> Path:
    """A shot's own `src` (a montage across scenes), else the spec's picture."""
    return ROOT / (it.get("src") or spec["picture"])


# ---- speech guard ----------------------------------------------------------

GUARD = 0.10      # a cut must sit at least this far from any speech
MERGE_GAP = 0.18  # shorter silences than this are inside a line, not between


def speech_regions(src: Path):
    """[(start, end)] of speech in `src`, cached beside the promos."""
    import numpy as np
    cache = OUT_DIR / ".cache" / (src.stem + ".speech.json")
    if cache.exists() and cache.stat().st_mtime > src.stat().st_mtime:
        return json.loads(cache.read_text())
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(src), "-vn", "-ac", "1", "-ar", "16000",
         "-af", "highpass=f=120,lowpass=f=4000", "-f", "s16le", "-"],
        capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.int16).astype(float) / 32768
    hop = 160                                        # 10 ms
    n = len(a) // hop
    frames = a[: n * hop].reshape(n, hop)
    db = 10 * np.log10((frames ** 2).mean(axis=1) + 1e-12)
    # Smooth over 30 ms so a single click is not a word.
    db = np.convolve(db, np.ones(3) / 3, mode="same")
    floor = float(np.percentile(db, 15))
    regs = []
    for i in np.where(db > floor + 12)[0]:
        t = i / 100
        if regs and t - regs[-1][1] <= MERGE_GAP:
            regs[-1][1] = t + 0.01
        else:
            regs.append([t, t + 0.01])
    regs = [r for r in regs if r[1] - r[0] >= 0.08]
    cache.parent.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(regs))
    return regs


def _hit(regs, t):
    for s, e in regs:
        if s - GUARD < t < e + GUARD:
            return s, e
    return None


def guard_dialogue(spec, snap: bool):
    """Check (and with `snap`, fix) every audible cut. Returns problems left."""
    problems = []
    for i, it in enumerate(spec["cut"]):
        kind = it.get("kind", "shot")
        regs = speech_regions(src_of(spec, it)) if kind in ("shot", "black") else []
        if kind == "shot" and it.get("audio", "dia") != "none":
            it["_a_in"] = it["in"] - it.get("lead", 0)
            it["_a_out"] = it["out"] + it.get("tail", 0)
            keys = ("_a_in", "_a_out")
        elif kind == "black" and it.get("audio_in") is not None:
            it.setdefault("out_audio", it["audio_in"] + it["dur"])
            keys = ("audio_in", "out_audio")
        else:
            continue
        for k in keys:
            hit = _hit(regs, it[k])
            if not hit:
                continue
            s, e = hit
            outward = round(s - GUARD, 2) if k in ("_a_in", "audio_in") else round(e + GUARD, 2)
            if snap and k == "_a_in":
                # Sound moves earlier; the picture keeps its clean start.
                it["lead"] = round(it["in"] - outward, 2)
            elif snap and k == "_a_out":
                it["tail"] = round(outward - it["out"], 2)
            elif snap:
                it[k] = outward
            else:
                problems.append(
                    f"  #{i} {it.get('note', '')!r}: sound {k.strip('_')}={it[k]:.2f} is inside speech "
                    f"{s:.2f}-{e:.2f}  (safe: {s - GUARD:.2f} or {e + GUARD:.2f})")
        if kind == "black" and "out_audio" in it:
            it["dur"] = round(it.pop("out_audio") - it["audio_in"], 2)
        it.pop("_a_in", None)
        it.pop("_a_out", None)
    return problems


# ---- picture guard ---------------------------------------------------------

MIN_PIECE = 1.0   # no fragment of another camera angle shorter than this


def source_cuts(src: Path):
    """Times of the camera cuts already inside `src`, cached.

    Threshold 0.18, lowered from 0.25 on 2026-10-11: a soft cut in Sit Still
    (40.47s) scored 0.24 and slipped through. A false positive only makes the
    guard stricter; a miss lets a flash through, so err low."""
    import re
    cache = OUT_DIR / ".cache" / (src.stem + ".cuts.json")
    if cache.exists() and cache.stat().st_mtime > src.stat().st_mtime:
        return json.loads(cache.read_text())
    log = subprocess.run(
        ["ffmpeg", "-v", "info", "-i", str(src), "-an", "-vf",
         "scale=320:-2,select='gt(scene,0.18)',showinfo", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    cuts = [float(m) for m in re.findall(r"pts_time:([0-9.]+)", log)]
    cache.parent.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(cuts))
    return cuts


def guard_picture(spec, snap: bool):
    problems = []
    for i, it in enumerate(spec["cut"]):
        if it.get("kind", "shot") != "shot":
            continue
        for c in source_cuts(src_of(spec, it)):
            if not (it["in"] < c < it["out"]):
                continue
            if c - it["in"] < MIN_PIECE:
                if snap:
                    new_in = round(c + 0.04, 2)
                    # Keep the sound where it was: what the picture loses
                    # becomes a J-cut lead.
                    it["lead"] = round(it.get("lead", 0) + new_in - it["in"], 2)
                    it["in"] = new_in
                else:
                    problems.append(
                        f"  #{i} {it.get('note', '')!r}: camera cut at {c:.2f}, only "
                        f"{c - it['in']:.2f}s after in={it['in']:.2f} — a flash of the "
                        f"previous angle (start the shot at {c + 0.04:.2f})")
            elif it["out"] - c < MIN_PIECE:
                if snap:
                    new_out = round(c - 0.02, 2)
                    it["tail"] = round(it.get("tail", 0) + it["out"] - new_out, 2)
                    it["out"] = new_out
                else:
                    problems.append(
                        f"  #{i} {it.get('note', '')!r}: camera cut at {c:.2f}, only "
                        f"{it['out'] - c:.2f}s before out={it['out']:.2f} — a flash of "
                        f"the next angle (end the shot at {c - 0.02:.2f})")
    return problems


# ---- timeline --------------------------------------------------------------

def timeline(spec):
    t, items = 0.0, []
    for it in spec["cut"]:
        dur = it["out"] - it["in"] if "in" in it else it["dur"]
        items.append({**it, "start": t, "dur": dur})
        t += dur
    return items, t


def render(spec, tmp: Path, out: Path):
    items, total = timeline(spec)

    # 1. Each item to an intermediate with identical format, then concat.
    parts = []
    extra_audio = []   # (src_start, length, timeline_at, volume, fade): J/L cuts
    for i, it in enumerate(items):
        p = tmp / f"p{i:02d}.mp4"
        kind = it.get("kind", "shot")
        fa = 0.03
        src = src_of(spec, it)
        if kind == "shot":
            sw, sh = probe_size(src)
            cw = round(sh * 4 / 5 / 2) * 2          # 4:5 crop at full height
            cx = it.get("x", 0.5) * sw
            x = int(min(max(cx - cw / 2, 0), sw - cw))
            vol = {"dia": 1.0, "amb": 0.35, "none": 0.0}[it.get("audio", "dia")]
            vf = (f"crop={cw}:{sh}:{x}:0,scale={PIC_W}:{PIC_H}:flags=lanczos,"
                  f"pad={W}:{H}:0:{PIC_Y}:color=0x0a0908,fps={FPS},format=yuv420p")
            # Where a lead or tail carries the sound on, the edge is not an
            # edge — no fade there, or the line dips at the picture cut.
            fin = "" if it.get("lead") else f",afade=t=in:d={fa}"
            fout = "" if it.get("tail") else f",afade=t=out:st={it['dur'] - fa}:d={fa}"
            af = (f"aresample={AR},aformat=channel_layouts=stereo,volume={vol}"
                  f"{fin}{fout}")
            for side, length in (("lead", it.get("lead", 0)), ("tail", it.get("tail", 0))):
                if not length:
                    continue
                a0 = it["in"] - length if side == "lead" else it["out"]
                at = it["start"] - length if side == "lead" else it["start"] + it["dur"]
                fade = (f"afade=t=in:d={fa}" if side == "lead"
                        else f"afade=t=out:st={length - fa}:d={fa}")
                extra_audio.append((src, a0, length, at, vol, fade))
            run(["ffmpeg", "-v", "error", "-y", "-ss", str(it["in"]), "-t", str(it["dur"]),
                 "-i", str(src), "-vf", vf, "-af", af,
                 "-c:v", "libx264", "-crf", "14", "-preset", "medium",
                 "-c:a", "pcm_s16le", str(p.with_suffix(".mov"))])
            p = p.with_suffix(".mov")
        elif kind == "black":
            a_in = it.get("audio_in")
            inputs = ["-f", "lavfi", "-t", str(it["dur"]), "-i",
                      f"color=c=0x0a0908:s={W}x{H}:r={FPS}"]
            if a_in is not None:
                inputs += ["-ss", str(a_in), "-t", str(it["dur"]), "-i", str(src)]
                amap = ["-map", "0:v", "-map", "1:a"]
            else:
                inputs += ["-f", "lavfi", "-t", str(it["dur"]), "-i",
                           f"anullsrc=r={AR}:cl=stereo"]
                amap = ["-map", "0:v", "-map", "1:a"]
            af = (f"aresample={AR},aformat=channel_layouts=stereo,"
                  f"afade=t=in:d={fa},afade=t=out:st={it['dur'] - fa}:d={fa}")
            p = p.with_suffix(".mov")
            run(["ffmpeg", "-v", "error", "-y", *inputs, *amap,
                 "-vf", "format=yuv420p", "-af", af,
                 "-c:v", "libx264", "-crf", "14", "-c:a", "pcm_s16le", str(p)])
        elif kind == "end":
            fr = tmp / f"end{i}"
            fr.mkdir()
            n = int(round(it["dur"] * FPS))
            for k in range(n):
                end_frame(k / FPS, it["dur"], it.get("title", ""), it["url"],
                          it.get("kicker", "")).save(fr / f"f{k:04d}.png")
            p = p.with_suffix(".mov")
            run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS),
                 "-i", str(fr / "f%04d.png"), "-f", "lavfi", "-t", str(it["dur"]),
                 "-i", f"anullsrc=r={AR}:cl=stereo", "-map", "0:v", "-map", "1:a",
                 "-vf", "format=yuv420p", "-c:v", "libx264", "-crf", "14",
                 "-c:a", "pcm_s16le", "-shortest", str(p)])
        parts.append(p)

    lst = tmp / "parts.txt"
    lst.write_text("".join(f"file '{p}'\n" for p in parts))
    body = tmp / "body.mov"
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
         "-c", "copy", str(body)])

    # 2. Type overlays, each attached to a timeline item.
    ov_inputs, ov_chain, last = [], [], "0:v"
    for j, ov in enumerate(spec.get("overlays", [])):
        png = tmp / f"ov{j}.png"
        card_png(ov["text"], ov.get("y", 0.70), ov.get("size", 0.064),
                 ov.get("italic", True), ov.get("tracking", 1), png)
        base = items[ov["on"]]["start"]
        at = base + ov.get("offset", 0.0)
        dur = ov.get("dur", 2.0)
        ov_inputs += ["-loop", "1", "-t", str(dur), "-i", str(png)]
        k = j + 1
        ov_chain.append(
            f"[{k}:v]format=rgba,fade=t=in:st=0:d=0.35:alpha=1,"
            f"fade=t=out:st={dur - 0.4}:d=0.4:alpha=1,setpts=PTS+{at}/TB[o{k}]")
        nxt = f"v{k}"
        ov_chain.append(f"[{last}][o{k}]overlay=0:0:eof_action=pass[{nxt}]")
        last = nxt

    # 3. The bed: segments of the music export, crossfaded into one track.
    bed = spec["bed"]
    music = ROOT / bed["src"]
    seg_inputs, seg_labels = [], []
    base_idx = 1 + len(spec.get("overlays", []))
    for s_i, seg in enumerate(bed["segments"]):
        seg_src, a, b = (ROOT / seg[0], seg[1], seg[2]) if len(seg) == 3 else (music, seg[0], seg[1])
        seg_inputs += ["-ss", str(a), "-t", str(b - a), "-i", str(seg_src)]
        seg_labels.append(f"[{base_idx + s_i}:a]")
    xf = bed.get("crossfade", 1.0)
    chain, cur = [], seg_labels[0]
    for s_i, lab in enumerate(seg_labels[1:], 1):
        chain.append(f"{cur}{lab}acrossfade=d={xf}:c1=tri:c2=tri[b{s_i}]")
        cur = f"[b{s_i}]"
    lo, hi, sw_at = bed.get("low_db", -16), bed.get("high_db", -5), bed.get("swell", 0)
    ramp = bed.get("ramp", 1.5)
    # Linear-in-dB ramp from lo to hi across [swell, swell+ramp].
    gain = (f"volume='pow(10,(({lo})+(({hi})-({lo}))*min(max((t-{sw_at})/{ramp},0),1))/20)'"
            f":eval=frame")
    chain.append(f"{cur}aresample={AR},aformat=channel_layouts=stereo,{gain},"
                 f"apad,atrim=0:{total},afade=t=out:st={total - 1.6}:d=1.6[bed]")
    dia = "[0:a]"
    if extra_audio:
        ex_base = base_idx + len(bed["segments"])
        labels = []
        for e_i, (e_src, a0, length, at, vol, fade) in enumerate(extra_audio):
            seg_inputs += ["-ss", str(a0), "-t", str(length), "-i", str(e_src)]
            ms = int(round(at * 1000))
            chain.append(f"[{ex_base + e_i}:a]aresample={AR},aformat=channel_layouts=stereo,"
                         f"volume={vol},{fade},adelay={ms}|{ms}[x{e_i}]")
            labels.append(f"[x{e_i}]")
        chain.append(f"[0:a]{''.join(labels)}amix=inputs={1 + len(labels)}:"
                     f"duration=first:normalize=0[dia]")
        dia = "[dia]"
    chain.append(f"{dia}[bed]amix=inputs=2:duration=first:normalize=0,"
                 "loudnorm=I=-14:TP=-1.5:LRA=11[aout]")

    fc = ";".join(ov_chain + chain)
    vmap = f"[{last}]" if ov_chain else "0:v"
    out.parent.mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-v", "error", "-y", "-i", str(body), *ov_inputs, *seg_inputs,
         "-filter_complex", fc, "-map", vmap, "-map", "[aout]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high",
         "-pix_fmt", "yuv420p", "-r", str(FPS),
         "-c:a", "aac", "-b:a", "192k", "-ar", str(AR),
         "-movflags", "+faststart", "-t", str(total), str(out)])
    return total


def sheet(out: Path, total: float):
    tmp = Path(tempfile.mkdtemp(prefix="promo-sheet-"))
    try:
        n = 12
        for k in range(n):
            t = (k + 0.5) * total / n
            run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(out),
                 "-frames:v", "1", "-vf", "scale=270:-2", str(tmp / f"s{k:02d}.jpg")])
        ins = sum((["-i", str(tmp / f"s{k:02d}.jpg")] for k in range(n)), [])
        row = lambda r: "".join(f"[{r * 6 + c}]" for c in range(6)) + f"hstack=6[r{r}]"
        dst = out.with_suffix(".sheet.jpg")
        run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex",
             f"{row(0)};{row(1)};[r0][r1]vstack", str(dst)])
        print(f"sheet {dst}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--plan", action="store_true")
    ap.add_argument("--sheet", action="store_true")
    ap.add_argument("--snap", action="store_true",
                    help="move cuts that land in speech out to the nearest pause")
    a = ap.parse_args()
    spec = json.loads(Path(a.spec).read_text())
    problems = guard_picture(spec, a.snap)
    problems += guard_dialogue(spec, a.snap)
    if a.snap:
        Path(a.spec).write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n")
        print(f"snapped cuts to the nearest pauses and saved {a.spec}")
    items, total = timeline(spec)
    for i, it in enumerate(items):
        label = it.get("note", it.get("kind", "shot"))
        print(f"{i:2d}  {it['start']:6.2f}  +{it['dur']:.2f}  {label}")
    print(f"total {total:.2f}s")
    if problems:
        print("\nNOT RENDERING — a line would be cut off, or a cut would flash:")
        print("\n".join(problems))
        sys.exit("fix the cuts above, or run with --snap")
    if total > spec.get("max_seconds", 30) + 0.01:
        sys.exit(f"too long: {total:.2f}s > {spec.get('max_seconds', 30)}s")
    if a.plan:
        return
    out = OUT_DIR / f"{spec['name']}.mp4"
    tmp = Path(tempfile.mkdtemp(prefix="promo-"))
    try:
        render(spec, tmp, out)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print(f"wrote {out}")
    if a.sheet:
        sheet(out, total)


if __name__ == "__main__":
    main()
