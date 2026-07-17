# Stories Folder Specification

## Purpose

The `/stories` folder stores the narrative source material Claude and the application use to understand each story.

The user is initially adding three stories. The structure must support more stories later.

## Recommended Structure

```text
stories/
├── story-slug/
│   ├── STORY.md
│   ├── CANON.md
│   ├── CHARACTERS.md
│   ├── LOCATIONS.md
│   ├── TIMELINE.md
│   ├── SCENES.md
│   ├── COLLECTIONS.md
│   └── assets/
```

## STORY.md

Include:

- Title
- Logline
- Full premise
- Themes
- Tone
- Intended audience
- Story status
- Where a new viewer should begin
- Public summary
- Spoiler summary
- Planned arcs
- Open questions

## CANON.md

Include only established facts.

Do not place speculative ideas in canon.

Recommended sections:

- Confirmed history
- Character facts
- Relationship facts
- Location facts
- Established events
- Visual continuity
- Dialogue canon
- Unresolved questions

## CHARACTERS.md

Include:

- Stable character ID
- Name
- Age
- Role
- Appearance
- Personality
- Motivation
- Contradictions
- Relationships
- Associated environments
- Featured scenes

## LOCATIONS.md

Each location should reference a world environment ID.

A story can use:

- Shared environments
- Story-specific environments
- Multiple variants of the same environment

## TIMELINE.md

Keep separate fields for:

- Canonical chronological order
- Audience release order
- Flashbacks
- Memories
- Unknown placement
- Flexible placement

This allows the story timeline to remain open-ended during development.

## SCENES.md

For each scene include:

- Scene ID
- Title
- Summary
- Characters
- Environment
- Area
- Interactive object connection
- Timeline order
- Release order
- Access level
- Maturity
- Media status
- Continuity notes

## Cross-Story Rules

- Use stable IDs.
- Do not duplicate conflicting character profiles.
- Reference shared canon.
- Explicitly document crossovers.
- A location may contain content from multiple stories.
- Collections may combine stories.
- The UI should allow story filtering without isolating the world unnecessarily.
