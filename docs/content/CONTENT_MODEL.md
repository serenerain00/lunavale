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
