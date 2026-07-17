# 360° Panorama Rooms (AI-Generated Environments)

An alternative to photogrammetry: give a room an **equirectangular 360° panorama**
and the engine renders it as a space you stand inside and look around. Faster to
produce than a scan and plays to AI generation — the tradeoff is you look around
from a fixed point rather than walking across the room.

Panorama and scan are interchangeable per room: fill whichever you have. Priority
is `pano` → `scan` → placeholder.

## Generating a panorama

Use a **360° / equirectangular skybox generator**, not a normal image generator
(a flat image can't be looked around inside). Options:

- **Blockade Labs Skybox AI** — the go-to. Free tier: 5/month, 8K, watermark-free
  — but the free license is **CC-BY-NC (non-commercial)**. Fine for prototyping;
  **commercial use needs the ~$24/mo Pro plan.**
- **PanoPulse / PanoramaGenerator / 3DTexel** — free-to-try alternatives; verify
  each tool's commercial license terms before shipping.

> Licensing matters: Luna Vault is a paid product. Only ship panoramas whose
> license permits commercial use.

## Prompt guidance

Describe the room, then append a shared style block so all rooms match:

> *...rustic modern farmhouse, honey-to-walnut reclaimed wood, hand-hewn beams,
> plaster and stone, warm amber low light, cream and greige neutrals, moody and
> intimate, cinematic, photoreal, soft even lighting, no people, no text.*

Keep the **same style + seed** across rooms so the house feels continuous.

## Export + delivery

- **Equirectangular, 2:1 ratio** (e.g. 4096×2048 or 8192×4096), JPG or PNG.
- Name by room id: `dining-room.jpg`, `master-bedroom.jpg`, `garage-shop.jpg`,
  `front-porch.jpg`.
- Files go to `public/panos/farmhouse/<room-id>.jpg`; I set each room's `pano`
  slot in `lib/content/world.ts`. Like scans and video, panorama files are large
  and **not committed to git**.

## After you send one

I set the `pano` slot, spawn you at the room's centre, place the interactive
objects around you, and we tune the entry-facing direction (`rotationY`). Start
with one room to prove it out before generating all four.
