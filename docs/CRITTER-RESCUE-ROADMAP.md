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

### Phase 1 — Playable foundation ✅
- Add Critter Rescue to the shared game hub.
- Build a responsive, single-page game shell with the first motif and three board sizes.
- Implement reveal, flag, first-click safety, adjacent clues, empty-area expansion, timer, reset, and win/loss states.
- Add a simple rescue count and celebratory home animation.
- Save the selected motif and motion preference locally.
- Honor device reduced-motion settings by default, with a setting to opt into motion.

### Phase 2 — Fairness and onboarding ✅
- Add a short skip-friendly tutorial that can be replayed from the game header.
- Certify each generated board with deterministic clue and subset deductions from the player's first reveal; regenerate layouts that require a guess.
- Add one optional logic hint and one local 3×3 danger scan per trail. Track assists separately from rescue progress.
- Review the three board profiles: Cozy 6×6 with 5 hazards, Wander 8×8 with 11 hazards, and Explore 10×10 with 18 hazards. Hazard density rises from about 14% to 18%.

### Phase 3 — Worlds and progression ✅
- Add four visual motifs: Moonlight Meadow, Coral Cove, Autumn Hollow, and Cloudtop Grove.
- Add a 12-critter Rescue Journal. Campaign discoveries are saved locally as the player finds critters.
- Add a campaign: clear two trails in each world to unlock the next setting.
- Add a shared UTC-date Daily Rescue on a fixed 8×8 certified board with a marked safe start and a personal best time. Daily runs do not advance campaign unlocks or collection.
- Keep the win feedback compact so the logic puzzle stays central.

### Phase 4 — Shared ecosystem and polish ✅
- Align account sync, home navigation, settings, reduced-motion override, and mobile behavior with Match Garden and Network Tycoon.
- Add sound controls, color-accessible clue palettes, and board-size preferences.
- Review the settings dialog, responsive header, shared save integration, and rendered board before merging to main and publishing.

## Phase 4 implementation notes

Critter Rescue uses the shared Firebase account flow in public/cloud-save.js. Signed-in saves include campaign wins, journal discoveries, daily best times, reduced-motion preference, tutorial status, sound preference, clue palette, and default board size. Guest progress remains on the device. The settings dialog keeps optional sound off by default, offers a high-contrast clue palette, and lets players set the default trail size. The account control joins the top navigation and wraps for narrow screens.

The rendered preview was reviewed after resolving a startup-order issue in preference loading. The game board, campaign panel, journal/tutorial/help controls, settings controls, and initial safe-step state render correctly. The HTML preview service does not execute the Firebase ES module import, so account login itself is verified through the shared module wiring and will be checked on the deployed Firebase route.

## Phase 1 and Phase 2 notes

The first two phases provide the playable logic loop, first-click safety, solvability certification, tutorial, and optional assists. A board is accepted only when the built-in logical solver can reveal every safe tile from the player's first clear. If the generator cannot find a certified layout after its retry limit, it asks the player to start a new trail.

The certification currently uses direct clue deductions and pairwise subset deductions. More advanced deduction patterns may be added if later playtesting exposes boards that feel overly constrained. Campaign unlocks, collection, and the daily puzzle are implemented in Phase 3. Phase 4 adds optional cloud sync and syncable player preferences.

## Final queued item — Board-wide rescue celebration (planned)

When the last cactus is cleared and the rescue objective is complete:

- Briefly reveal every animal still on the board.
- Give the animals a playful growing and wiggling celebration.
- Return the board to its normal state before showing the rescue-complete card.
- Add a confetti burst styled after Match Garden’s celebration.
- Keep the sequence brief, readable, and respectful of reduced-motion preferences.
