# Photoreal Rooms with Gaussian Splatting

Gaussian splatting is the highest-realism option for the explorable rooms: a real
space is captured from photos/video and rendered **photorealistically in real
time** in the browser. It's the modern successor to the scan/pano pipeline.

The engine already supports it — a room with a `splat` slot renders the splat
instead of placeholder geometry (priority: splat → pano → scan → placeholder).
Drop in a file and it appears.

## What you get — and the tradeoffs (read first)

- **Photoreal.** Far beyond hand-built geometry; real light, materials, depth.
- **Baked lighting.** The captured lighting is fixed. The Day/Night toggle won't
  change a splat room — the room looks however it was lit when captured. Capture
  in the light you want (warm evening for the cozy look).
- **Capture volume, not infinite.** You move *within* the captured area and look
  around; you can't walk somewhere the camera never went.
- **Hotspots overlay it.** The note/mug/journal are still separate 3D items placed
  on top; we tune their positions to match the splat on delivery.
- **Big files.** Splats are large binaries — gitignored, delivered/hosted out of
  band like the video and scans.

## Creating a splat

Use a Gaussian-splat capture tool. Easiest first:

1. **Luma AI** (free, phone or web) — record a video orbiting the room, it
   processes to a splat, export `.ply`. Best starting point.
2. **Polycam** — has a Gaussian Splat mode; exports `.ply` / `.splat`.
3. **Postshot** or **Nerfstudio** (desktop) — higher quality, more control.
4. **KIRI Engine** — phone app with splat export.

### Capture technique

- **Even, warm lighting** — whatever mood you capture is permanent. For the cozy
  farmhouse look, capture in warm lamplight/evening.
- **Move slowly and orbit** the whole space; cover every angle, high and low.
- **Nothing moving** (people, curtains, pets); avoid mirrors and big glass.
- 1–3 minutes of smooth video, or a few hundred overlapping photos.

## Export + delivery

- **Format:** `.splat` (compressed, preferred) or `.ply`.
- **Optimize for web:** crop to the room and reduce splat count so the file is a
  reasonable size (aim under ~40 MB if you can; bigger works but loads slower).
- Name by room and hand it over:

  ```text
  living-room.splat   (or .ply)
  ```

- Files go to `public/splats/farmhouse/<name>.splat`; I set the room's `splat`
  slot and tune `position` / `rotation` / `scale` so you spawn standing in it
  (splats often come in rotated / flipped, which is a one-line fix).

## Try it fast

To see splatting live before committing: capture **any** cozy room with **Luma
AI** (free, ~5 minutes on your phone), send me the `.ply`, and I'll load it into
the living room so you can judge the look. Then decide whether to capture the real
farmhouse spaces.
