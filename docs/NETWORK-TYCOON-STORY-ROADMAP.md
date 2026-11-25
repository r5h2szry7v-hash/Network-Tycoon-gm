# Network Tycoon story campaign roadmap

## Campaign plan

1. **Campaign frame** — make Story Chapters the clear featured setup option, add three achievable chapter goals, and explain that the campaign has no deadlines.
2. **Player-paced months** — keep time paused between player actions, make each month advance visibly, and let players control when the next month begins.
3. **Goal-centered responsive dashboard** — keep campaign progress visible and make guided cues jump to the part of the interface they explain on desktop and mobile.
4. **Story and consequences** — connect neighborhood moments, visible district changes, arcade/minigame invitations, and map surprises to the player's progress. After Year 2, surface the mini-game cue and the map-surprise cue, then return the player to the map with the clock ready to advance.
5. **Tune length and difficulty; preserve sandbox** — play through Chapters 2 and 3, adjust goals when they create repetition or make the next chapter redundant, and keep the open-ended sandbox available separately.

## Current implementation

- Story Chapters is the featured new-game option; the other modes remain available below it.
- The six-step dashboard tour and contextual first-build cues guide the initial connection.
- Chapter 1 asks the player to connect one neighborhood.
- Chapter 2 now asks for 250 customers.
- Chapter 3 asks the player to connect four neighborhoods.
- Time remains player-paced, with a prominent month-advance control.
- The Year 3 guidance includes “Have you tried the mini games? Find them in the MORE menu.” and “Keep an eye on the map for surprises as districts come online.” The map cue returns the player to the map and leaves time paused.

## Pacing checkpoint

The PR #48 preview playthrough reached Month 7 with three connected neighborhoods and 139 customers. Those districts' combined initial wireless capacity was 391, so the former 500-customer goal could not be completed without opening a fourth district. Because Chapter 3 already asks for four connected neighborhoods, that made Chapter 3's goal effectively overlap with the work required to finish Chapter 2. The 250-customer target keeps Chapter 2 within the three-district capacity observed in the preview and leaves the fourth-district goal for Chapter 3.

Next: resume the preview from a clean Story save, confirm the revised Chapter 2 transition and Chapter 3 goal, then continue the later-year cue sequence and adjust only if the playthrough shows another pacing bottleneck.

## Branch and preview

- Branch: `feat/story-chapter-experience`
- Review: PR #48 (draft)
- Preview channel: `story-chapters-preview`
