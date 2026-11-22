# Tinker Factory difficulty roadmap

## Goal

Make later puzzles reward planning, routing, and efficient construction while preserving the quick place, rotate, and run loop. Difficulty should rise by combining mechanics players already understand, with clear recovery paths when a build fails.

## Shipped in this release

1. **Tighter part budgets:** Early generated puzzles retain a small belt reserve. Precision builds later in the generated sequence receive only the parts needed for the intended route, plus at most two extra pieces overall. The tray shows the active budget and prevents overbuilding until a piece is removed.
2. **Checkpoint gates:** Precision builds mark two route checkpoints. Every marked location must be crossed before the bell can ring. A later tier raises the requirement to three checkpoints. Breather puzzles temporarily remove checkpoint pressure.
3. **Switch routing:** From the next difficulty tier, generated solutions include a required switch turn. The mission explains that its branch direction matters. Checkpoint routes and switch branches combine in higher tiers.
4. **Efficiency medals:** Precision builds award up to three workshop medals based on total pieces placed relative to the generated route. Players can replay a solved puzzle and improve their best result. Medal records are saved with the existing local game state and included in the existing cloud-synced save key.

## Progression

| Stage | Puzzle feel | Added pressure |
| --- | --- | --- |
| First generated rounds | Explore routes and part behavior | Existing board-size ramp and light part reserves |
| Precision introduction | Build a route through marked checkpoints | Two checkpoint gates, clear total part budget, medal score |
| Switch workshop | Route through a required switch | Switch choice is explained; checkpoints remain visible |
| Advanced workshop | Plan a longer route through three checkpoints | Larger boards and tighter stock combine familiar rules |
| Breather rounds | Experiment and reset mentally | Shorter route, no checkpoints |

## Follow-up expansion

- Add an explicit checkpoint gate tile only after the branch behavior is well learned; keep the bell visible as the final goal.
- Introduce movable blockers or one-use parts in isolated tutorial puzzles before combining them with precision builds.
- Add puzzle-specific optional badges, such as “no extra parts” or “use the spring,” without making those badges mandatory to advance.
- Review generated puzzle completion and medal rates before tightening budgets further. Keep every generated challenge solvable by its saved route and keep reduced-motion, mobile layout, and existing saves compatible.

## Acceptance notes

- Checkpoints are generated from the intended route, never on its entry or bell.
- A run succeeds only when the machine reaches the bell after crossing all checkpoints.
- Budget limits can be recovered from by removing a part; the player is not forced to restart.
- Medal bests are monotonic: replaying with a lower score cannot erase a previous best.
- Breather puzzles keep the difficulty curve from becoming a long uninterrupted sequence of strict constraints.
