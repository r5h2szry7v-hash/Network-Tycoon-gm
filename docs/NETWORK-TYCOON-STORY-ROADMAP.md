# Network Tycoon story campaign roadmap

## Roadmap

1. **Campaign frame** — feature Story Chapters in setup, introduce neighborhood goals, and explain that the campaign has no deadlines. **Complete.**
2. **Player-paced months** — keep time paused between actions and make each month advance visible. **Complete.**
3. **Goal-centered responsive dashboard** — keep campaign progress visible and make guide cues jump to the interface area they explain. **Complete.**
4. **Story and consequences** — connect neighborhood moments and visible district changes to progress. After Year 2, show the mini-game and map-surprise cues, then return to the paused map. **Complete.**
5. **Tune length and difficulty; preserve sandbox** — keep the opening arc quick, offer a choice between the next story and free build, and expand the campaign into meaningful regional goals. **In progress.**
6. **Playthrough calibration** — verify the expanded campaign’s actual playtime and difficulty curve. Target 3–4 hours of substantial story play. Adjust chapter pacing and add optional side-story contracts or decision chains if the measured run falls short.

## Current implementation

- Story Chapters is the featured new-game option; Open City and the other modes remain available.
- The six-step dashboard tour and contextual first-build cues guide the initial connection.
- Story One, “First Connections,” has three opening chapters: connect one neighborhood, welcome 250 customers, and connect four neighborhoods.
- Completing Story One presents **Begin the next story** and **Enter free build** choices.
- Story Two, “The Regional Network,” expands the campaign to 18 total chapters. Its 15 goals include neighborhood expansion, customer growth, reputation, entry into additional regions, fiber upgrades, consecutive profitable months, and lifetime revenue.
- Older saves that already completed the original three chapters are migrated to the Story One choice screen.
- A player may switch to free build after Story One, and the existing Open City setup remains available for players who want sandbox play from the start.
- Time remains player-paced, with a prominent month-advance control. Each advance now adds a short board bounce and calendar-style month flip; the effect respects reduced-motion settings.
- Dark-mode map labels use stronger foreground and outline contrast.
- After Year 2, the mini-game cue reads “Have you tried the mini games? Find them in the MORE menu.” The map cue reads “Keep an eye on the map for surprises as districts come online.” The map cue returns the player to the map and leaves time paused.
- The Year 3 cues remain available after the player finishes the story and switches to free building.

## Pacing and QA checkpoint

The PR #48 preview playthrough reached Month 7 with three connected neighborhoods and 139 customers. Those districts' combined initial wireless capacity was 391, so the former 500-customer goal forced a fourth build and overlapped with Chapter 3's four-neighborhood goal.

With the 250-customer target, the same save reached Chapter 2 at Month 12 with 257 customers, while all three original districts were online. Chapter 3 then showed 3/4. Connecting East Meadow completed Chapter 3 at Month 15, proving that the goals progress separately. A fresh preview run also confirmed the Year 2 mini-game and map-surprise cues, the Done return to the paused map, and the construction dialog’s fixed backdrop.

The new 18-chapter outline adds a longer regional growth curve and varied operational goals. Its 3–4 hour target still needs a complete playthrough to measure; do not treat that duration as verified until the preview is played end to end. Use measured time and difficulty to tune the targets and optional story content, rather than stretching the opening milestones.

## Branch and preview

- Branch: `feat/story-chapter-experience`
- Review: PR #48 (draft)
- Preview channel: `story-chapters-preview`
