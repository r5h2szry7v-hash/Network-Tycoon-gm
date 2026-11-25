# Network Tycoon story campaign roadmap

## Roadmap

1. **Campaign frame** — feature Story Chapters in setup, introduce neighborhood goals, and explain that the campaign has no deadlines. **Complete.**
2. **Player-paced months** — keep time paused between actions and make each month advance visible. **Complete.**
3. **Goal-centered responsive dashboard** — keep campaign progress visible and make guide cues jump to the interface area they explain. **Complete.**
4. **Story and consequences** — connect neighborhood moments and visible district changes to progress. After Year 2, show the mini-game and map-surprise cues, then return to the paused map. **Complete.**
5. **Tune length and difficulty; preserve sandbox** — keep the opening arc quick, offer a choice between the next story and free build, and expand the campaign into meaningful regional goals. **In progress.**
6. **Playthrough calibration** — capture visible playtime overall and per chapter, then verify the expanded campaign’s actual playtime and difficulty curve. Target 3–4 hours of substantial story play. Adjust chapter pacing and add optional side-story contracts or decision chains if the measured run falls short.

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
- Story Two now pairs its chapter goals with action-by-action Mack and Pooch guidance: selecting an eligible district, choosing a network, planning construction, advancing the month, moving into a new region, converting to Fast Fiber, and reviewing cash flow or reputation.
- Chapter targets 4–18 are aligned with the campaign definitions in code so cues track the correct goal and the player’s current action stage.
- Any Story Mode decision modal includes a companion cue explaining that the clock is paused while the player decides. Low-cash, rival-market, and six-month event pauses point to the relevant dashboard section.
- At each year mark, an optional activity reminder points to mini-games in MORE and map surprises. It can open MORE or be dismissed; it does not change the story objective.
- Guidance uses the existing mobile view switcher, scrolls smoothly to the target area, and keeps the cue inline with the section. Dark-mode and reduced-motion behavior continue to use the shared presentation layer.
- The pacing-calibration build records foreground Story Mode playtime overall and by chapter in the campaign save. The completion card will show the total and a collapsible chapter breakdown; time in another tab is excluded. The run still needs a complete playthrough to validate the 3–4 hour target.
- The mobile Story coach now spans the full company-tile grid row, with its companion voice text allowed to wrap inside the card. This prevents a narrow Pooch dialog from stretching the neighboring management tile.
- Preview QA checks now cover the 18-chapter list, chapter 4–18 cue coverage, action guidance, pause cues, timing summary, companion text wrapping, and embedded module syntax.

## Pacing and QA checkpoint

The PR #48 preview playthrough reached Month 7 with three connected neighborhoods and 139 customers. Those districts' combined initial wireless capacity was 391, so the former 500-customer goal forced a fourth build and overlapped with Chapter 3's four-neighborhood goal.

With the 250-customer target, the same save reached Chapter 2 at Month 12 with 257 customers, while all three original districts were online. Chapter 3 then showed 3/4. Connecting East Meadow completed Chapter 3 at Month 15, proving that the goals progress separately. A fresh preview run also confirmed the Year 2 mini-game and map-surprise cues, the Done return to the paused map, and the construction dialog’s fixed backdrop.

The new 18-chapter outline adds a longer regional growth curve and varied operational goals. Its 3–4 hour target still needs a complete playthrough to measure; do not treat that duration as verified until the preview is played end to end. Use measured time and difficulty to tune the targets and optional story content, rather than stretching the opening milestones.

## Active review

- Branch: `feat/story-pacing-calibration`
- Scope: measure foreground Story Mode time overall and by chapter, display a campaign timing report on completion, and correct mobile companion dialog wrapping and tile alignment.
- Preview: pending branch validation and Firebase Hosting preview.
- Calibration: the 3–4 hour playtime target remains unverified until a full playthrough.
