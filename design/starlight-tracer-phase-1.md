# Starlight Tracer — Phase 1 Design

**Status:** Design direction for the first playable slice  
**Scope:** One polished tracing loop, responsive layout, theme selection, and motion preferences. No timed play, scoring pressure, lives, or locked content in this phase.

## Experience

A quiet, dark starfield fills the play area. A soft line connects a small set of stars into a simple shape. The player traces from the marked beginning to the marked finish. As their finger or pointer follows the route, the line warms into the selected theme color. Completing the trace reveals the constellation with a brief, gentle glow and makes the next shape available.

The desired feeling is unhurried and tactile: a relaxing doodle in space, not a precision test.

## First playable loop

1. Open on **Level 1** with one simple, closed or nearly closed constellation shape and a visible guide.
2. Show a short prompt: **“Trace the starlight”**. Mark the start star clearly.
3. Accept touch, pen, mouse, and trackpad input. Start tracing when the player presses near the start point.
4. Reveal the route progressively as the pointer follows it. Use a generous snap corridor; small deviations are corrected smoothly, with no error sound or penalty.
5. If the pointer is lifted mid-trace, preserve progress and let the player continue from the nearby point. Provide a visible restart control.
6. On completion, briefly brighten the traced shape, then show **“Constellation found”** and a large **Next shape** action.
7. The first few shapes vary in contour and point count while retaining the same interaction.

There is no countdown and no failure state. Level labels are calm and descriptive, for example “Drifting,” “Orbit,” and “First Light.”

## Screen composition

### Desktop

- Compact top bar: site return link, **Starlight Tracer** wordmark, level progress, and a prominent **Settings** button.
- Centered play field with a restrained starfield, large tracing shape, and start/finish markers.
- Small instruction and restart controls directly beneath the play field.
- Completion message appears in place, without moving the board or obscuring the shape.

### Mobile

- One-column layout with the controls reachable without scrolling on common phone screens.
- Play field uses the available width while preserving the shape’s aspect ratio and generous touch targets.
- Settings and restart remain visible; no hover-only instructions.
- Respect safe areas and avoid browser-edge gestures near the tracing surface.

## Visual direction

Use a deep, nearly black blue foundation, restrained star points, soft edge glows, and clear separation between the guide and active trace. Avoid rapid twinkling, flashing, and dense particle fields. Each theme keeps the background dark and changes the trace, star accents, and subtle nebula wash.

| Theme | Background | Trace | Accent |
|---|---|---|---|
| **Deep Orbit** | `#080F20` | `#72D7F2` | `#A7BDF7` |
| **Nebula** | `#160D22` | `#C6A0F5` | `#F2A9D2` |
| **Aurora** | `#08191B` | `#77D8BE` | `#A5C9F5` |
| **Lunar** | `#101722` | `#C7D7E8` | `#8CCFE0` |
| **Solar Drift** | `#171320` | `#FFC77A` | `#F49A82` |

All five themes are available from the beginning in Settings. The selected theme also colors the main action buttons and selection state, so the setting is easy to see. Keep text and path contrast legible in every theme.

## Settings

Open Settings from the game header. Keep the control style consistent with the other games:

- **Color theme:** five selectable space palettes, each shown as a labeled color swatch.
- **Motion:** honor `prefers-reduced-motion: reduce` by default. Provide an **Ignore device reduced-motion setting** switch. When enabled, restore the full effects even if the device requests reduced motion.
- **Sound:** include a simple on/off control if the phase-one completion sound is present; default to off until the player enables it.

Persist theme, motion override, sound choice, and current level locally. Store the motion override using the same `ignoreDeviceReducedMotion` preference convention used by Match Garden. The reduced-motion setting must affect all motion in the game, including path drawing, background effects, transitions, and the completion burst.

## Motion and completion feedback

Normal motion: a slow path reveal, a soft light traveling along the line, and one brief star bloom at completion. Keep the tracing input responsive throughout. Reduced motion: reveal the line immediately as it is traced, replace moving light and particles with a stable brighter outline, and show completion with a static halo and text. The **Ignore** switch restores the normal animation without changing the device setting.

## Phase-one acceptance checks

- A new player can understand how to start and finish a trace without a tutorial modal.
- The route is forgiving; a small miss or interrupted touch does not reset progress.
- A player can complete several shapes in sequence without a timer, lives, or a fail card.
- All five palettes remain dark, readable, and visibly distinct.
- Theme and motion preferences persist after reload.
- Reduced motion is honored on first load, while the override restores the full effect.
- Desktop pointer and mobile touch input use the same tracing rules.
- The completion effect is brief, calm, and never blocks the next action.
