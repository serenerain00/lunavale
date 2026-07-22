# Content Model

## Core Hierarchy

```text
Story Universe
  Story
    Arc
      Chapter
        Episode
          Scene
```

The environment system intersects with this hierarchy:

```text
Environment
  Area
    Object
      Content Reference
```

## Story

```ts
type Story = {
  id: string
  slug: string
  title: string
  logline: string
  description: string
  status: "development" | "releasing" | "complete" | "archived"
  heroImage: MediaReference
  posterImage: MediaReference
  trailer?: VideoReference
  characterIds: string[]
  environmentIds: string[]
  arcIds: string[]
  tags: string[]
  access: AccessLevel
}
```

## Scene

```ts
type Scene = {
  id: string
  storyId: string
  arcId?: string
  chapterId?: string
  episodeId?: string
  slug: string
  title: string
  shortDescription: string
  storyContext?: string
  chronologicalOrder?: number
  releaseOrder?: number
  placementStatus: "fixed" | "flexible" | "unknown"
  durationSeconds?: number
  video: VideoReference
  posterImage: MediaReference
  gallery?: MediaReference[]
  characterIds: string[]
  environmentId: string
  areaId?: string
  objectIds?: string[]
  tags: string[]
  access: AccessLevel
  maturityRating?: string
  spoilerLevel?: "none" | "minor" | "major"
  status: PublishStatus
  nextSceneId?: string
  previousSceneId?: string
}
```

## Discovery

```ts
type Discovery = {
  id: string
  title: string
  description?: string
  objectId: string
  contentRef: ContentReference
  access: AccessLevel
  prerequisiteIds?: string[]
  rewardType:
    | "memory"
    | "scene"
    | "journal"
    | "character-detail"
    | "artifact"
    | "location"
    | "collection"
  repeatable: boolean
}
```

## User Progress

```ts
type UserProgress = {
  userId: string
  visitedEnvironmentIds: string[]
  visitedAreaIds: string[]
  discoveredObjectIds: string[]
  completedSceneIds: string[]
  unlockedDiscoveryIds: string[]
  updatedAt: string
}
```

## Shared Types

```ts
type AccessLevel =
  | "public"
  | "free-account"
  | "member"
  | "premium-tier"
  | "purchase-only"

type PublishStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "unlisted"
  | "archived"

type ContentReference = {
  type:
    | "story"
    | "episode"
    | "scene"
    | "character"
    | "bts"
    | "journal"
    | "collection"
  id: string
}
```

## Design Requirement

Content must be reusable across:

- World exploration
- Watch library
- Character pages
- Story pages
- Timeline
- Search
- Collections
- Membership teasers

Never duplicate the same narrative content solely for different UI surfaces.

## Browse Taxonomy (the catalog)

`/browse` is the conventional index into the world. It sorts and filters on two
axes, both defined in `lib/content/taxonomy.ts`:

- **Feeling** — emotional context (`trust`, `desire`, `distance`, `lies`,
  `hurt`, `grief`). An item may carry several.
- **Place** — where it happens (`farmhouse`, `lakehouse`, `park`). One per item,
  and a place may point at an explorable `environmentSlug` so the catalog can
  hand off into the world.

Both lists are open sets. Declare a feeling or place before content exists for
it — facets with nothing behind them are never rendered, and filter chips that
would lead to an empty result render disabled.

### Adding content

1. Add the scene to `lib/content/videos.ts` (or the still set to
   `lib/content/gallery.ts`) with `feelings` and `place`.
2. That's all — `lib/content/catalog.ts` projects every content kind into one
   `CatalogItem`, so it appears on `/browse`, in its feeling shelves, and under
   the matching filters automatically.

To add a *new kind* of content (journals, BTS, artifacts), write one more
projection in `lib/content/catalog.ts`. The browse UI needs no changes.

### Filter semantics

Within a facet, selections are OR'd; across facets they are AND'd — "anything
that feels like hurt *or* lies, *and* happens at the park". Filtering runs on
the server from URL params, so every filtered view is shareable, crawlable, and
works with JavaScript disabled.

## Media Pipeline

Nothing uncompressed ships. Source material (camera-native stills, masters)
stays out of git; `scripts/optimize-media.sh` derives the committed web copies:

```bash
scripts/optimize-media.sh stills <event-id>     # -> public/gallery/<id>/NN.jpg
scripts/optimize-media.sh cover  <event-id> NN  # -> catalog card art
scripts/optimize-media.sh poster <slug>         # -> public/posters/<slug>.jpg
scripts/optimize-media.sh video  <slug>         # -> stories/<slug>.proxy.mp4
```

Targets: stills 1600px long edge, card art 1280×720, video proxies 720p
(x264 CRF 23, `+faststart`). Requires ffmpeg.
