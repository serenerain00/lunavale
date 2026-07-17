# Transition System

## Transition Categories

### World to Environment

Example: map to lakehouse.

Sequence:

1. Select location
2. Map focus
3. Camera push or travel
4. Atmospheric transition
5. Environment reveal
6. Controls appear

### Environment to Area

Example: lakehouse exterior to deck.

Use:

- Pan
- Dolly
- Layered parallax
- Foreground occlusion
- Doorway or architectural wipe

### Area to Object

Example: deck to journal.

Use:

- Object focus
- Background blur
- Scale and positional focus
- Ambient audio reduction
- Memory or content panel reveal

### Object to Memory

Example: firepit to Tyson and Luna scene.

Use:

- Light flicker or environmental bridge
- Sound carryover
- Fade through foreground
- Video reveal
- Context metadata after the visual entry

### Memory to World

Return through:

- Pull back
- Object reappears
- Environment sound restores
- Discovery state updates

### Premium Lock

The response should feel intriguing, not punitive.

Possible behavior:

- Object reacts subtly
- Camera moves closer but stops
- Lock information appears
- Preview media or text is offered
- Membership action is clear
- User can dismiss immediately

## Transition State Machine

Avoid conflicting animation by defining states:

```text
idle
focusing
exiting
navigating
entering
interactive
locked
error
```

Only one major environment transition should run at a time.

## Deep Linking

When a user opens a direct URL, do not force them through every prior transition.

Use a brief destination reveal and provide context.
