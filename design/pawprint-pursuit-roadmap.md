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
- Keep a gentle idle bob on the home page and an energetic hop on maze movement. Cats get distinct direct-pounce, intercept-scamper, and wandering animations; stun pickups pause them with orbiting sparkles.
- Celebrate pickups, cat encounters, and completed mazes with visual reactions. Both dogs join the level-end scene, and the caught scene gives the cats a playful reveal. Respect the portfolio reduced-motion preference throughout.
- Later polish can add blink and tail-swish details without changing the established character art.

## Home page and tutorial

The game home page has Start/Continue, How to Play, Pup & Colors, and a direct link back to the game selector. The compact illustrated tutorial explains movement, objectives, cat encounters, and the exit with four visual cues. It is available from the game home page at any time and can be closed or skipped.

## Progression and difficulty

Early levels use compact 17×13 mazes. The map expands gradually to 19×15, 21×15, and 23×17. Later stages tighten cat movement intervals and add more prizes. Goals cycle in a predictable pattern so players know what kind of task to expect while maze routes remain randomized.

The maze is carved from a connected randomized path network, then some walls are opened to create loops. The exit and objectives are placed on walkable cells. Future progression can add one-way doors, switches, and challenge variants after play pacing is established.

## Portfolio integration

The game uses `pawprintPursuit` as its cloud-save game ID, the shared portfolio settings shell, and the shared home link. A local game record keeps the current level, best cleared level, and selected dog. The shared portfolio preference stores palette, dark mode, motion, and text scale. The service worker precaches the entry page and character art for offline launches.

## Roadmap

1. **Playable foundation:** game home page, four-step tutorial, selectable dogs, six color palettes, generated maze, movement controls, three rotating goals, three cat characters, and three prizes. Keep cloud save and shared settings connected from the start.
2. **Character animation pass:** add distinct idle and movement cycles, pickup bursts, cat stun motion, startled dog reactions, and animated win/caught scenes. Preserve reduced-motion behavior. First pass implemented; tune during play review.
3. **Maze and opponent tuning:** review maze reachability, spawn fairness, objective pacing, cat pursuit speed, and level sizing across the early progression. First balance pass completed: 3,000 generated mazes across levels 1–30 had reachable goals and exits; cats began at least seven path steps from the player and three tiles from the exit. Cat movement now ramps from about 1.21 seconds per step at level 1 to 0.64 seconds by level 17; each cat keeps its own slower pace/behavior.
4. **Presentation polish:** implemented a brief level-and-goal reveal, optional synthesized sound cues saved with the game record, a colorful win celebration, and roomier small-screen controls/status layout. Reduced-motion preferences suppress the transition and confetti animation.
5. **Release review:** code review confirmed the game and character assets are in the offline cache and the cloud save key is registered. The shared portfolio shell now starts in local mode if Firebase modules are unreachable, then reconnects and syncs when online. Palette contrast was strengthened for Sunshine and Mint. Browser screenshots remain unavailable in this environment, so a hands-on mobile/desktop visual pass is still needed before publishing.

## Current implementation slice

The playable foundation, character animation pass, maze/opponent tuning, and presentation polish are in progress on `feat/pawprint-pursuit-prototype`. Generated objectives and exits are connected; cat spawns avoid the start, objectives, and exit approach; lives and temporary boosts reset at the next maze; and speed boosts now take effect during continuous movement. A randomized generator check covered 3,000 mazes across levels 1–30, including the cat path-step choice. The draft change has not been published to the production game selector. The offline boot and palette-contrast issues found during release review are fixed. The remaining release task is hands-on mobile/desktop visual review.
