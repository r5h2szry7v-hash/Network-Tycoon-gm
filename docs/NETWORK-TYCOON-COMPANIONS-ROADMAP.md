# Network Tycoon Character Companions

## Direction

Use the existing Pawprint Pursuit characters as a small cast that gives the world personality and makes guidance feel like it belongs in the game.

- **Mack** is the dark pup, a steady observer who spots risks and plans ahead.
- **Pooch** is the tan pup, an upbeat guide who celebrates progress and helps players get started.
- **Kitty, Kit’n, and Westley** are the mischievous map visitors. A tap earns a short, character-specific reaction.

Character moments should be brief, optional where they interrupt play, readable without sound, and compatible with reduced-motion settings. Keep story direction clear; jokes and animation support the guidance rather than replacing it.

## Roadmap

### Phase 1: Network Tycoon introduction

- Add Mack or Pooch as an illustrated narrator in each story chapter card.
- Pair the story-mode cue card with a pup portrait and a short supporting line.
- Add an on-demand Mack and Pooch hint control to open/free-build and endless play. Hints should reflect cash pressure, service issues, and expansion progress.
- Let one of the three cats appear at a random interval in an open map area. Make the cameo keyboard reachable and respond to touch or click with a brief reaction bubble.
- Use existing dog and cat assets, CSS animation, accessible labels, dark-mode styling, and reduced-motion behavior.

### Phase 2: Gameplay-aware reactions

- Give the pups event-specific reactions for service outages, capacity alerts, completed builds, customer milestones, and financial decisions.
- Add a light settings control for companion appearances and animation frequency.
- Tune cameo timing so cats do not appear during modals, urgent story guidance, or repeated map interactions.

Phase 2 review build adds brief Mack and Pooch reactions after build, service, capacity, customer-count, and financing events. Reactions wait for open dialogs and active story guidance to clear, then appear as dismissible animated status cards. Settings can turn dog guidance off, set cat visit frequency, and choose a gentle or playful animation pace. Cat visits average about one minute, 35 seconds, or 20–25 seconds apart depending on the selected frequency. Cats stay visible for 28 seconds (18 seconds at the most frequent setting) of quiet map time; dialogs, story cues, and active map gestures pause and hide the cameo timer. Reduced-motion behavior and dark-mode styling cover the new surfaces.

### Phase 3: Portfolio character layer

- Extract shared character presentation and reaction data into a reusable portfolio module.
- Bring the same characters into other games only where they add useful feedback or guidance.
- Build a small asset and animation pipeline so future character states remain consistent across screen sizes.

Phase 3 progress: Tinker Factory, Critter Rescue, and Match Garden use the shared companion layer for celebrations and gameplay guidance. Network Tycoon now reads Mack and Pooch image paths from the shared asset registry; its story narration, hints, event reactions, and map cats remain in the Tycoon-specific module. The same shared thinking and reassuring animations now guide on-demand hints, chapter cues, and service/capacity/finance reactions.

Phase 3 review pilot extracts Mack and Pooch presentation into `/companion-layer.js` and adds animated, accessible character reactions to Tinker Factory's win card, Critter Rescue's rescue-complete card, and Match Garden's round-win card. Each uses the same small presentation API, with dark-mode and reduced-motion support.

The shared component now supports idle, celebration, thinking, and reassuring motion states. Game integrations choose the state that fits the moment while using the same dog assets and reduced-motion behavior.

The companion guidance review branch applies thinking and reassuring reactions to practical help moments in Tinker Factory, Critter Rescue, and Match Garden. Mack helps players focus on a Tinker hint, a guaranteed-safe rescue tile, or the cards revealed by a helper. Pooch reassures players when a hint or scan is unavailable, a safe move is not yet deducible, or extra time is added. These brief guidance cards use the shared presentation API and clear automatically.

The portfolio now shares one Mack and Pooch visibility preference across supported games. Tinker Factory, Critter Rescue, Match Garden, Starlight Tracer, and Network Tycoon expose the same show/hide control in Settings; the preference is saved on the shared origin. Existing Network Tycoon guidance preferences migrate into the shared setting when it has not been chosen yet. Kitty, Kit’n, and Westley map cameo frequency remains independently configurable.\n\nThe companion asset and animation pipeline is now split into `/companion-assets.js` for the character registry and `/companion-layer.css` for shared appearance, responsive sizing, and motion. Portfolio games load the same registry, stylesheet, and presentation module; the preview workflow checks the registry script before publishing. Starlight Tracer now uses a quiet Pooch reassurance after a constellation is traced or a coloring scene is complete, with the message arriving after its existing starburst sequence.

## First implementation notes

Phase 1 reuses /images/dog-dark.webp for Mack, /images/dog-tan.webp for Pooch, and the existing three /paws/images/cat-*.webp files. Narration is on-screen text with animated portraits, so the guidance remains available without audio. Cat cameos live inside the SVG map and follow its pan and zoom. The free-play hint panel stays collapsed until requested.
