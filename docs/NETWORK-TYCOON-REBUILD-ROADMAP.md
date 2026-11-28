# Network Tycoon Rebuild Roadmap

**Scope:** `public/rebuild/index.html` on `feat/network-tycoon-rebuild-preview`  
**Snapshot:** 2026-11-28, source commit `842c4b2`  
**Purpose:** Extend the map-first prototype into a sequence of short, visually legible problem-solving loops.

## Current build

The preview has a seven-challenge finite Starter Pack:

1. First Connection — budget and build-time trade-off
2. Market Square Mix-Up — rival response
3. Capacity Rescue — network-capacity upgrade
4. Customer Comeback — trust recovery and district connection
5. Storm Warning at Bayview — preparation versus cash reserve
6. No-Dig Neighborhood — technology restriction
7. Rival’s Final Bid — harder rival and customer target

The common loop is: challenge briefing → inspect the highlighted district → select an optional response and network technology → start a build → advance one or more months → evaluate success or failure → retry or advance. The map is full-screen, has four interactive districts, supports pan and pinch zoom, and opens contextual actions from the target district. Route, construction, target, success, and failure visuals are present. Mack and Pooch provide prompts and reactions.

The latest map art is a simplified coastal city illustration at **1122 × 1402**, matching the prior asset’s exact dimensions. The camera transform is animation-frame scheduled; pan momentum is smoothed. Preview deployments have succeeded.

### Known limits

- All seven challenges still use the same basic build-and-advance loop. Challenge variety currently comes mostly from rules and response choices.
- Actual 2–5 minute completion times have not been measured.
- Cash, deadline, objective, and other challenge metrics still drive the simulation, but the recently removed top tiles also hid their HUD presentation. Restore only the essential, active-challenge values as a compact map-adjacent status line or small contextual indicators; do not bring back stacked cards.
- Gesture code has not had a hands-on iPhone playtest. Treat smoothness as implemented in code, pending device validation.
- The challenge actions are still predominantly button choices. The next pack should make the map itself the place where players diagnose and solve problems.

## Design targets

Each challenge should take **2–5 minutes** of engaged play, with a single clear problem and a visible resolution:

- **0:00–0:25 — Notice:** Mack or Pooch introduces a short problem cue; the affected district shows an animated visual symptom.
- **0:25–1:00 — Inspect:** The player explores or taps the affected map area to reveal a clue, blocked segment, overloaded node, or vulnerable site.
- **1:00–3:30 — Solve:** Complete one tactile, map-native interaction. Keep it to roughly 3–6 meaningful inputs.
- **3:30–4:30 — Commit:** Make one strategic trade-off if needed, then advance no more than 1–2 months in the ordinary case.
- **4:30–5:00 — See the result:** Animate the district’s recovery or failure and show a concise consequence and retry/continue choice.

The time bands are targets for playtesting, not current measured performance. Harder rounds may use two linked steps, but should still stay within five minutes.

## Roadmap

### 1. Close the mobile information loop

**Goal:** Keep the uncluttered screen while making active decisions understandable.

- Show only the current challenge’s essential values: available cash, time remaining, and one mechanic-specific value such as trust or capacity.
- Present those values as a slim, map-integrated line or context-sensitive markers, not challenge cards.
- Keep the goal visible on the map and let the Mack/Pooch cue point to the next relevant place or action.
- Verify the floating action tray, map controls, turn control, companion cue, safe areas, and map fit at iPhone portrait sizes.

**Acceptance:** A new player can tell what is wrong, what success requires, and what a chosen action costs without scrolling or reopening a panel. No more than one persistent information strip competes with the map.

### 2. Add the first map-native puzzle in a second scenario pack

**Recommended first build: “The Detour.”** Keep the existing seven Starter Pack challenges and their pass/fail rules unchanged.

- A road closure blocks the direct path to a district. The map marks the exchange, target, usable junctions, and closure.
- Enter a clear route-solving mode from the target district. The player traces a cable through legal junctions; a longer detour costs more or takes longer.
- Show the proposed route as a bright animated line. Invalid paths explain the obstruction; valid paths pulse into the city and start construction.
- Offer tap-to-select junctions as an accessible alternative to dragging. Provide undo and cancel.
- Preserve pinch/pan in explore mode. During route drawing, prevent a one-finger gesture from accidentally panning the city.

**Acceptance:** The player solves a clear street-routing problem on the map in under 90 seconds; route length has a visible, predictable cost or time consequence; no pixel-perfect drawing is required; the action works with touch, mouse, keyboard, and assistive technology.

### 3. Build a small set of distinct operational mechanics

Add one mechanic at a time, each attached to a concrete network problem and a map animation:

| Scenario | Map interaction | Decision it teaches |
| --- | --- | --- |
| Quiet the Outage | Trace or tap the damaged relays in the correct order, avoiding a congested node | Restore service quickly while protecting trust |
| Too Many Neighbors | Drag bandwidth tokens to neighborhoods with visible demand; tap-based allocation is also available | Prioritize capacity instead of treating every district equally |
| Storm Shelf | Place a limited crew or backup asset at vulnerable map sites before a weather front arrives | Trade preparation cost against likely disruption |
| Rival Signal | Capture two customer clusters by linking service coverage through contested blocks before the rival | Use local coverage and timing, not only a “market” button |

Keep one primary puzzle per round. A strategic response can follow the puzzle, but should not become a second unrelated minigame.

### 4. Escalate through short linked scenarios

Use a second pack of about six rounds, with complexity increasing in this order:

1. **The Detour:** one route and one blocked segment
2. **Quiet the Outage:** follow a clue, then restore a short route
3. **Too Many Neighbors:** allocate limited capacity across two or three demands
4. **Storm Shelf:** solve a placement problem under a visible countdown
5. **Rival Signal:** combine coverage and timing with one budget trade-off
6. **Citywide Crunch:** combine two previously learned mechanics, then make one final network decision

Introduce one new rule per round. Reuse familiar interactions before combining them. Every challenge retains a visible success condition, a fair failure explanation, retry, and advancement.

### 5. Polish, balance, and validate

- Build dynamic overlays as lightweight SVG/CSS on the existing high-resolution art; keep the background asset and map coordinate system stable.
- Animate only meaningful state changes: a route trace, a relay response, weather movement, a district glow, or a connection celebration.
- Respect reduced-motion settings, preserve readable contrast, and avoid relying on color alone.
- Ensure all touch targets are generous, all drag interactions have tap alternatives, and no critical control conflicts with pan/pinch.
- Playtest every new round on a real phone. Time several first attempts and retries; tune clue clarity and puzzle length from observed results.
- Preserve cloud save/sync, personalization, current campaign results, and the existing seven challenge rules through the expansion.

**Acceptance:** Each new round is understood without outside explanation, normally finishes in 2–5 minutes, works in portrait on one screen, and produces an obvious before/after change in its district. Device playtests must validate gesture feel and pacing before calling the pack complete.

## Next implementation slice

Start with **Close the mobile information loop**, then build **The Detour** as the first second-pack scenario. The route mechanic is the best first test because it uses the new district map directly, gives the player a physical problem to solve, creates an immediate animated payoff, and can coexist with the existing technology/build economy without rewriting the Starter Pack.
