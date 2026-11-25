# Network Tycoon story campaign roadmap

## Campaign plan

1. **Campaign frame** — feature Story Chapters in setup, introduce three clear neighborhood goals, and explain that the campaign has no deadlines.
2. **Player-paced months** — keep time paused between player actions, make month advances visible, and let players control the pace.
3. **Goal-centered responsive dashboard** — keep campaign progress visible and make each guide cue jump to the interface area it explains on desktop and mobile.
4. **Story and consequences** — connect neighborhood moments and visible district changes to progress. After Year 2, surface the mini-game cue and map-surprise cue, then return the player to the map with the clock ready to advance.
5. **Tune length and difficulty; preserve sandbox** — play through Chapters 2 and 3, remove redundant goals, and keep open-ended sandbox play available.

## Current implementation

- Story Chapters is the featured new-game option; the other modes remain available below it.
- The six-step dashboard tour and contextual first-build cues guide the initial connection.
- Chapter 1 asks the player to connect one neighborhood.
- Chapter 2 asks the player to welcome 250 customers.
- Chapter 3 asks the player to connect four neighborhoods.
- Time remains player-paced, with a prominent month-advance control.
- After Year 2, the mini-game cue reads “Have you tried the mini games? Find them in the MORE menu.” The map cue reads “Keep an eye on the map for surprises as districts come online.” The map cue returns the player to the map and leaves time paused.
- The Year 3 cues remain available after the player finishes the story and switches to free building.

## Pacing and QA checkpoint

The PR #48 preview playthrough reached Month 7 with three connected neighborhoods and 139 customers. Those districts' combined initial wireless capacity was 391, so the former 500-customer goal forced a fourth build and overlapped with Chapter 3's four-neighborhood goal.

With the revised target, the same save reached Chapter 2 at Month 12 with 257 customers, while all three original districts were online. Chapter 3 then showed 3/4. Connecting East Meadow completed Chapter 3 at Month 15, proving that the goals progress separately. The Year 2 playthrough also confirmed visible monthly recaps and a repair decision during construction.

Next: confirm the post-story Year 3 mini-game and map cues on the preview, including the return to the paused map, then continue any final tuning based on that playthrough.

## Branch and preview

- Branch: `feat/story-chapter-experience`
- Review: PR #48 (draft)
- Preview channel: `story-chapters-preview`
