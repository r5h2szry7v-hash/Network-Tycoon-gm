# Pawprint Pursuit

## Game concept

A colorful, mobile-friendly maze chase starring the two portfolio dogs and three mischievous cats: a sleek black cat, a fluffy black cat, and a gray cat. Each level generates a new connected maze with a few alternate routes. The player completes one of three rotating goals, gathers temporary boosts, and reaches the glowing exit while avoiding the cats.

The first playable slice uses three goal types:

- Collect the treat trail, then reach the exit.
- Find three squeaky toys, then reach the exit.
- Ring three bells, then reach the exit.

Map prizes have distinct effects: zoomies briefly increase movement speed, a squeaker distracts and stuns the cat crew, and a treat magnet collects nearby treats. Lives, an optional pause, restart, and keyboard, swipe, and direction-pad controls are included in the first slice.

## Characters and animation direction

- Use the existing tan and dark dog assets as selectable heroes.
- Use the three matching cat illustrations as the pursuing characters.
- Keep a gentle idle bob on the home page and an energetic hop on maze movement. Cats get their own shorter, cheekier chase bounce; stun pickups pause them with orbiting sparkles.
- Celebrate treats, boosts, cat encounters, and completed mazes with small visual reactions. Respect the portfolio reduced-motion preference throughout.
- Later animation polish can add blink, tail swish, startled reactions, and a short dog-and-cat victory scene without changing the established character art.

## Home page and tutorial

The game home page has Start/Continue, How to Play, Pup & Colors, and a direct link back to the game selector. The compact illustrated tutorial explains movement, objectives, cat encounters, and the exit with four visual cues. It is available from the game home page at any time and can be closed or skipped.

## Progression and difficulty

Early levels use compact 17×13 mazes. The map expands gradually to 19×15, 21×15, and 23×17. Later stages tighten cat movement intervals and add more prizes. Goals cycle in a predictable pattern so players know what kind of task to expect while maze routes remain randomized.

The maze is carved from a connected randomized path network, then some walls are opened to create loops. The exit and objectives are placed on walkable cells. Future progression can add one-way doors, switches, and challenge variants after play pacing is established.

## Portfolio integration

The game uses `pawprintPursuit` as its cloud-save game ID, the shared portfolio settings shell, and the shared home link. A local game record keeps the current level, best cleared level, and selected dog. The shared portfolio preference stores palette, dark mode, motion, and text scale. The service worker precaches the entry page and character art for offline launches.

## Roadmap

1. **Playable foundation:** game home page, four-step tutorial, selectable dogs, six color palettes, generated maze, movement controls, three rotating goals, three cat characters, and three prizes. Keep cloud save and shared settings connected from the start.
2. **Character animation pass:** tune the dog run and cat chase cycles, add clear pickup and stun reactions, and design win/caught poses. Preserve reduced-motion behavior.
3. **Maze and opponent tuning:** review maze reachability, spawn fairness, objective pacing, cat pursuit speed, and level sizing across the early progression.
4. **Presentation polish:** add level transitions, sound toggle and sound cues, stronger celebration moments, and small-screen layout refinements.
5. **Release review:** review mobile and desktop behavior, dark and light palettes, cloud save continuity, and offline assets before publishing to the portfolio.

## Current implementation slice

The first slice is in progress on `feat/pawprint-pursuit-prototype`. It includes the page shell, home and tutorial screens, generated maze gameplay, animated dog and cat art, the three objectives and prizes, shared shell mounting, cloud-save rules, and portfolio navigation. It has not been published to the production game selector.
