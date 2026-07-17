# Capturing Farmhouse Rooms (Photogrammetry)

This guide is for capturing the real farmhouse into 3D scans that drop directly
into the Luna Vault explorable world. Capture quality is the single biggest
factor in how good the final experience looks — a careful scan looks
photoreal; a rushed one looks melted. Read this before shooting.

## Rooms to capture (first pass)

| Room id         | Space                                   |
| --------------- | --------------------------------------- |
| `master-bedroom`| Luna & Josh's bedroom                   |
| `dining-room`   | Dining room                             |
| `garage-shop`   | The farm garage / shop Josh works out of|
| `front-porch`   | The front porch                         |

The app already has these four rooms wired up with placeholder geometry. Each
one is waiting for a scan file — nothing else needs to change to swap real art in.

## What to capture with

Best results, in order:

1. **iPhone Pro / iPad Pro (has LiDAR)** + **Polycam** or **Scaniverse** (both
   free). LiDAR captures room-scale geometry fast and handles low light well.
2. **Any recent phone** + **Polycam** (Photo mode) or **Luma AI**. No LiDAR, so
   it relies on photos — works, just needs more care and good light.
3. **DSLR/mirrorless + desktop photogrammetry** (RealityScan, Metashape). Highest
   quality, most effort. Only if you want to go pro on a hero room.

For interiors, **LiDAR room mode is the sweet spot** — do that if you have a Pro
device.

## How to shoot a room (technique)

Good scans come from boring, methodical capture:

- **Light it evenly.** Turn on every lamp; open curtains for soft daylight but
  avoid direct sun stripes and hard shadows — lighting gets *baked into* the scan,
  so shadows you capture are permanent. Overcast daylight is ideal.
- **Declutter and freeze the scene.** Remove anything you don't want immortalized.
  Nothing should move mid-scan (no people, pets, curtains blowing).
- **Move slowly, overlap a lot.** Keep ~60–70% overlap between viewpoints. Walk
  the perimeter, then do a second loop at a different height.
- **Capture high and low.** Get the floor, the ceiling, and into every corner.
  Corners and edges are where cheap scans fall apart.
- **Avoid mirrors, glass, and shiny metal** — they confuse photogrammetry. In the
  garage, matte tools scan fine; chrome and glossy surfaces may ghost.
- **Porch (outdoors/covered):** shoot in soft, consistent light (overcast, or a
  short window at golden hour). Avoid moving foliage.

Aim for a few hundred photos or a slow 2–4 minute LiDAR sweep per room.

## Export settings (important for the web)

Raw scans are huge and won't run in a browser. Export web-friendly:

- **Format: `.glb`** (glTF binary). This is what the app loads today. If your app
  also offers **Gaussian Splat (`.ply`)**, keep it — that's a higher-fidelity
  option we can add later, but send GLB first.
- **Optimize / decimate** to roughly **≤ 150k triangles** per room.
- **Textures 2K–4K**, baked.
- **Target file size: under ~25 MB** per room if you can. Bigger works but loads
  slower.
- In Polycam: use the **Optimized/Web** export preset. In Scaniverse: choose a
  **medium** decimation and GLB export.

## Orientation (saves us fiddling)

If your app lets you set it before export:

- **Y is up**, and try to make the floor sit near **y = 0**.
- Center the room roughly on the origin.

If not, don't worry — I can re-orient, scale, and drop the floor in code. It's
just faster if it arrives close.

## Delivering the files

Name each file by its room id and hand them over:

```text
master-bedroom.glb
dining-room.glb
garage-shop.glb
front-porch.glb
```

I place them at `public/scans/farmhouse/<room-id>.glb` and set each room's `scan`
slot in `lib/content/world.ts`. The placeholder room is replaced automatically.

**Note:** like the story video, scan files are large and are **not committed to
git** (`.gitignore` excludes them). For now they live locally / get handed to me
directly; when we set up hosted storage in a later phase, scans move there too.

## What happens after you send one

1. I load it into the room, re-orient/scale so you spawn standing in it.
2. I place the interactive objects (journal, workbench, etc.) at the right spots
   in the real space.
3. You walk through it and we tune lighting, spawn point, and object positions.

Start with **one** room (the dining room or bedroom is easiest — enclosed, evenly
lit). We'll get the full pipeline working end-to-end on that one before you spend
time capturing all four.
