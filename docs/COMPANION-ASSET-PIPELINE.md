# Companion asset and animation pipeline

This lightweight pipeline keeps Mack and Pooch consistent wherever the shared portfolio layer appears.

## Runtime sources of truth

- `public/companion-assets.js` registers character IDs, names, roles, image paths, fallback lines, supported motion states, and the shared Mack and Pooch visibility preference.
- `public/companion-layer.css` owns card styling, responsive sizing tokens, dark-mode colors, and motion keyframes.
- `public/companion-layer.js` owns rendering and game-specific mount points. It reads the registry instead of repeating the character assets and fallback lines.
- Games using the shared companion card load the stylesheet and both shared scripts from the portfolio root. The shared settings control stores the visibility preference in same-origin local storage, so it follows the player across supported games and browser tabs. Network Tycoon loads the shared stylesheet and registry before `tycoon-companions.js`, so its narrators, hints, and event reactions use the same Mack and Pooch image source, visibility preference, and thinking/reassuring motion while retaining Tycoon-specific presentation and cat behavior. Existing Tycoon guidance preferences migrate into the shared setting when it has not been chosen.

## Current image assets

| Character | Runtime image | Current dimensions | Format |
| --- | --- | ---: | --- |
| Mack | `/images/dog-dark.webp` | 420 × 415 px | WebP with transparency |
| Pooch | `/images/dog-tan.webp` | 420 × 384 px | WebP with transparency |

Use optimized transparent WebP for runtime portraits. Keep the full silhouette and similar visual scale inside the canvas so changing characters does not move the guidance text. The shared CSS scales the portrait from 44 to 52 pixels; retain sufficient source detail for that range.

## Adding an asset or motion state

1. Add the approved runtime image under `public/images/` and note its source and dimensions in this document.
2. Add the character to `characters` in `public/companion-assets.js` with a stable lowercase ID, display name, role, image path, and short fallback lines.
3. To add a motion state, add its key to the manifest’s `moods` list, define a matching `[data-mood]` rule and keyframes in `public/companion-layer.css`, and pass that state through the shared `announce` API.
4. Keep companion portraits decorative to assistive technology when the nearby text names the character and carries the message. The message card remains a polite status announcement.
5. Preserve the existing dark-mode selectors and both reduced-motion overrides. New animation must become still when either system reduced motion or the game’s reduced-motion class is active.
6. Add the stylesheet and ordered deferred scripts to each game that adopts the shared layer. For Network Tycoon, load `companion-layer.css` and `companion-assets.js` before `tycoon-companions.js`; set supported `data-mood` states on the Tycoon-specific cards while keeping the cat registry in its own module. Preview the integration before merging.

## Responsive and motion conventions

- Adjust shared card dimensions with the CSS custom properties at the top of `companion-layer.css`; do not add per-game portrait sizes.
- Use a small looping motion that reads at card size. Celebration can be more energetic; thinking and reassuring states should stay gentle.
- Keep copy concise and useful without audio. A companion card should not replace the game’s existing status text or obscure a required control.
- Add new moods to the registry and stylesheet together so unsupported state names fall back to the idle treatment.
