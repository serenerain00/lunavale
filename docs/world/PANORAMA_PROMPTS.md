# Panorama Prompts — one per room

Every one of the 18 rooms is currently placeholder geometry. This is the
shot list for fixing that: a ready-to-paste prompt per room, written from that
room's real description in `lib/content/world.ts`.

Read `PANORAMA_ENVIRONMENTS.md` first for the format, the licensing warning, and
the delivery path. The short version:

- **Equirectangular, 2:1**, 8192×4096 preferred (4096×2048 acceptable)
- Save as `public/panos/<environment>/<room-id>.jpg` — the ids below are exact
- **Same seed per environment**, so its rooms feel like one building
- Licensing is a real constraint: Blockade Labs' free tier is CC-BY-NC and Luna
  Vale is a paid product. Ship only panoramas licensed for commercial use.

Send me one and I set the `pano` slot, spawn the camera, place the objects and
tune the entry-facing angle. **Do the garage first** — it is the room that
prompted this, and one room proves the pipeline before you spend on eighteen.

---

## Shared style suffixes

Append the matching block to every prompt in that environment. Do not vary it.

**FARMHOUSE / BARN** — `rustic modern farmhouse, honey-to-walnut reclaimed wood, hand-hewn beams, plaster and stone, warm amber low light, cream and greige neutrals, moody and intimate, cinematic, photoreal, no people, no text`

**LAKEHOUSE / LAKE** — `modern lakeside timber and glass, pale oak and charcoal stone, big windows onto dark water, cool blue hour outside and warm firelight inside, moody and intimate, cinematic, photoreal, no people, no text`

**BAR / DOWNTOWN** — `low-lit interior, deep green and oxblood, brass and smoked glass, pools of warm light against darkness, film-noir contrast, cinematic, photoreal, no people, no text`

**TRACK** — `working motorsport garage, polished concrete, steel shelving, cold overhead fluorescents against warm task lamps, cinematic, photoreal, no people, no text`

**COFFEE SHOP / PARK** — `soft naturalistic daylight, muted earth tones, unstyled and real, cinematic, photoreal, no people, no text`

---

## farmhouse → `public/panos/farmhouse/`

**`garage-shop.jpg`** — *start here*
> Interior 360° of a working home garage and woodshop attached to a farmhouse. Engine parts laid out on a steel bench, a half-stripped motorcycle, sawdust on a concrete floor, pegboard of hand tools, a project car under a dust sheet, jars of screws on a shelf, a single warm work lamp and grey daylight through a dusty window. Lived-in and used, not tidy.

**`kitchen.jpg`**
> Interior 360° of an open farmhouse kitchen flowing into a living room with a great stone fireplace. Long timber island, open shelving, worn plank floor, deep sofa, wood stacked by the hearth, low amber evening light. Warm, occupied, a little untidy.

**`master-bedroom.jpg`**
> Interior 360° of a quiet farmhouse master bedroom. Unmade linen bed, a chair with clothes over it, a dresser with small personal objects, curtains half-drawn on a grey morning. Still and slightly abandoned.

**`front-porch.jpg`**
> 360° from the middle of a covered farmhouse porch at dusk. Painted boards, two chairs not quite facing each other, a screen door, fields and a fence line beyond, one bulb on overhead.

## lakehouse → `public/panos/lakehouse/`

**`deck.jpg`**
> 360° on a timber deck over dark water at blue hour. A firepit with two chairs, low flames, pines on the far shore, the lake very still, the house glowing behind.

**`great-room.jpg`**
> Interior 360° of a lakehouse great room. Floor-to-ceiling glass onto black water, a lit fire, low modern furniture, pale oak and charcoal stone, a blanket left on the sofa.

**`bedroom.jpg`**
> Interior 360° of a bedroom under a pitched roof facing the water. Low bed, exposed rafters, a window full of lake and early light, quiet and spare.

**`dock.jpg`**
> 360° from the end of a wooden dock. A small boat tied up, water on three sides, the yard and house behind, mist, early morning.

## bar → `public/panos/bar/`

**`the-bar.jpg`**
> Interior 360° of a small late-night bar. Backlit bottles, brass rail, dark green booths, pendant lights over the counter, a few empty glasses, everything just dark enough to talk in.

## lake → `public/panos/lake/`

**`the-shore.jpg`**
> 360° on a rough shoreline at the far edge of a lake. Reeds and stones, water on one side and open field on the other, no buildings anywhere, overcast, wind on the surface.

## coffee-shop → `public/panos/coffee-shop/`

**`the-cafe.jpg`**
> Interior 360° of a small neighbourhood café, mid-morning. Wooden two-tops, a worn counter, plants in the window, soft grey daylight, half the seats empty.

## park → `public/panos/park/`

**`open-ground.jpg`**
> 360° in the middle of open parkland with nowhere to hide. Mown grass, a path, scattered bare trees, flat overcast light, distance in every direction.

## track → `public/panos/track/`

**`the-pit.jpg`**
> Interior 360° of a motorsport pit garage. A black Porsche 911 on jack stands, helmets on a steel shelf, tyre stacks, tool chests, cables on polished concrete, cold overhead light with one warm lamp at the bench.

**`trackside.jpg`**
> 360° trackside at a road course. Tarmac and kerbing, armco and tyre walls, run-off grass, empty grandstand, low sun, heat haze.

## barn → `public/panos/barn/`

**`the-barn.jpg`**
> Interior 360° of a working farm barn at first light. A tractor mid-service, hay bales stacked at one end, tools on the wall, shafts of dusty light through gaps in the boards, dirt floor.

## downtown → `public/panos/downtown/`

**`the-restaurant.jpg`**
> Interior 360° of an intimate candlelit restaurant. Small tables with white cloths, banquette seating, warm pools of light, dark walls, mostly full but unhurried.

**`the-drive.jpg`**
> 360° from the middle of a two-lane road leaving a city at night. Headlights and tail lights, the skyline receding behind, dark trees closing in ahead, wet asphalt reflecting the light.

---

## After the first one lands

Order the rest by what the site actually points at. The farmhouse and lakehouse
carry the most content and the most character-page traffic; the track and
downtown can wait. There is no benefit to having all eighteen half-right, and
one photoreal room next to seventeen honest "in progress" labels reads far
better than eighteen mediocre ones.
