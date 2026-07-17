# World Map

## Purpose

The world map is the central navigation model for Luna Vault.

It should show how stories, characters, and environments connect without forcing every story into one rigid chronological path.

## Initial Environments

- Lakehouse
- Farmhouse
- Track
- Park
- Coffee shop
- Downtown
- Garage
- Barn
- Dock
- Mountain roads
- Boat or marina
- Tyson's apartment

More environments will be added over time.

## Environment Hierarchy

```text
World
  Environment
    Area
      Object
        Content
```

Example:

```text
Lakehouse
  Exterior
    Dock
      Boat keys
        Boat memory
  Deck
    Journal
      Luna journal collection
  Yard
    Firepit
      Tyson and Luna fireside chapter
```

## Map Requirements

The map should:

- Support future locations
- Show locked and unlocked places
- Show new content
- Show progress without feeling like a dashboard
- Provide story and character filters
- Support mobile and desktop
- Remain usable with reduced motion
- Deep-link to environment URLs
- Avoid requiring a full 3D engine

## Possible Map Modes

### Illustrated World Map

A stylized overhead or cinematic regional map.

### Memory Constellation

Locations connected by lines representing emotional or story relationships.

### Environmental Carousel

A wide cinematic route through available places.

### Hybrid Map

An illustrated map on desktop and a location-card experience on mobile.

## Unlock Logic

Locations may be:

- Public
- Revealed after viewing a story
- Revealed through an object
- Available to free accounts
- Available to members
- Available through a purchase
- Temporarily featured

Unlocking should never block the core premise from new visitors.

## World State

The world may evolve with:

- Story release
- Season
- Time of day
- Weather
- Character presence
- User progress
- Membership
- Special events

World-state changes should be content-driven and stored as data.
