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

### Phase 3: Portfolio character layer

- Extract shared character presentation and reaction data into a reusable portfolio module.
- Bring the same characters into other games only where they add useful feedback or guidance.
- Build a small asset and animation pipeline so future character states remain consistent across screen sizes.

## First implementation notes

Phase 1 reuses /images/dog-dark.webp for Mack, /images/dog-tan.webp for Pooch, and the existing three /paws/images/cat-*.webp files. Narration is on-screen text with animated portraits, so the guidance remains available without audio. Cat cameos live inside the SVG map and follow its pan and zoom. The free-play hint panel stays collapsed until requested.
