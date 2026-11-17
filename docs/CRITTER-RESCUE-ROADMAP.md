# Critter Rescue: roadmap and design framework

## Product direction

**Critter Rescue** is a friendly logic puzzle about clearing a safe trail and getting hidden critters home. It uses the familiar reveal, number-clue, and mark-danger loop of Minesweeper, with welcoming feedback, optional assistance, and several illustrated worlds.

The title is intentionally broad. **Moonlight Meadow** is the first motif, with future worlds such as **Coral Cove**, **Autumn Hollow**, and **Cloudtop Grove** planned as visual sets rather than separate rulesets.

## Core rules

- Each covered tile may be safe or contain a hazard.
- A revealed number shows how many hazards touch that tile, including diagonals.
- Players reveal tiles and mark suspected hazards.
- The first reveal is always safe.
- Revealing an empty tile opens its connected empty area and bordering clues.
- Three critters are placed on safe tiles. Finding one sends it along the cleared trail to the exit.
- The round is won when all safe tiles are revealed and all critters have reached safety.
- A hazard ends the round. The board then shows the remaining hazard locations and the critters are returned safely to camp.

## Roadmap

### Phase 1 — Playable foundation
- Add Critter Rescue to the shared game hub.
- Build a responsive, single-page game shell with the first motif and three board sizes.
- Implement reveal, flag, first-click safety, adjacent clues, empty-area expansion, timer, reset, and win/loss states.
- Add a simple rescue count and celebratory home animation.
- Save the selected motif and motion preference locally.
- Honor device reduced-motion settings by default, with a setting to opt into motion.

### Phase 2 — Fairness and onboarding
- Add a short skip-friendly tutorial and contextual controls for mouse, touch, and keyboard.
- Add deterministic solvability checks and regenerate boards that require a guess.
- Add optional hint and scan tools, clearly separated from normal scoring.
- Review board sizes, hazard density, and difficulty progression across the first ten rounds.

### Phase 3 — Worlds and progression
- Add distinct motifs such as Moonlight Meadow, Coral Cove, Autumn Hollow, and Cloudtop Grove.
- Add critter collections and rescue journal with lightweight unlocks.
- Add a gradual campaign and optional daily rescue.
- Keep visuals and rewards brief so the logic puzzle remains central.

### Phase 4 — Shared ecosystem and polish
- Align account sync, home navigation, settings, reduced-motion override, and mobile behavior with Match Garden and Network Tycoon.
- Add sound controls, color-accessible clue palettes, and board-size preferences.
- Run a cross-game regression and touch-layout review before merging to main and publishing.

## Phase 1 acceptance notes
The first build is a playable framework, not the full campaign. It uses randomly generated boards with first-click safety, but does not yet guarantee that every board can be solved without guessing. Phase 2 addresses that fairness requirement before difficulty progression is expanded.
