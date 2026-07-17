# Environment System

## Definition

An environment is a cinematic story container representing a meaningful place.

It contains:

- Visual variants
- Areas
- Interactive objects
- Ambient sound
- Stories
- Scenes
- Characters
- Timeline events
- Premium discoveries
- Progress state

## Environment Schema

```ts
type Environment = {
  id: string
  slug: string
  name: string
  shortDescription: string
  storyIds: string[]
  characterIds: string[]
  heroMedia: MediaReference
  mapPosition?: { x: number; y: number }
  variants: EnvironmentVariant[]
  areaIds: string[]
  access: AccessLevel
  status: "hidden" | "teased" | "available" | "archived"
}
```

## Environment Variant

```ts
type EnvironmentVariant = {
  id: string
  environmentId: string
  name: string
  timeOfDay?: string
  season?: string
  weather?: string
  emotionalTone?: string
  backgroundMedia: MediaReference
  foregroundLayers?: MediaReference[]
  ambientAudio?: AudioReference
  musicCue?: AudioReference
  relatedStoryIds: string[]
  activeFrom?: string
  activeUntil?: string
}
```

## Area

```ts
type EnvironmentArea = {
  id: string
  environmentId: string
  slug: string
  name: string
  description?: string
  media?: MediaReference
  objectIds: string[]
  cameraPreset?: string
  access: AccessLevel
}
```

## Interactive Object

```ts
type InteractiveObject = {
  id: string
  areaId: string
  name: string
  label: string
  hotspot: {
    x: number
    y: number
    width?: number
    height?: number
  }
  action:
    | { type: "open-content"; contentRef: ContentReference }
    | { type: "move-area"; areaId: string }
    | { type: "open-collection"; collectionId: string }
    | { type: "unlock"; unlockId: string }
    | { type: "play-memory"; sceneId: string }
  access: AccessLevel
  discoveredState?: string
}
```

## Environment Design Template

Each environment document should define:

1. Story purpose
2. Emotional meaning
3. Visual identity
4. Ambient sound
5. Areas
6. Interactive objects
7. Stories and scenes
8. Characters associated with it
9. Environment variants
10. Public and premium discoveries
11. Mobile adaptation
12. Reduced-motion behavior
13. Future expansion

## Example: Lakehouse

Areas:

- Exterior arrival
- Deck
- Firepit
- Dock
- Living room
- Kitchen
- Bedroom

Objects:

- Journal
- Coffee mug
- Firepit stones
- Hoodie
- Boat keys
- Wine glass
- Phone
- Window overlooking the lake

## Example: Track

Areas:

- Parking area
- Garage
- Workbench
- Bike lift
- Helmet wall
- Pit lane
- Starting line
- Grandstands

Objects:

- Tyson's helmet
- Motorcycle
- Gloves
- Tools
- Race photo
- Timing board
- Spare key
- Oil-stained note
