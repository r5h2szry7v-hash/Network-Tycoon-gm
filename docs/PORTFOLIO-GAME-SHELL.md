# Portfolio game shell

The shared browser shell owns account access, Firebase cloud-save startup, portfolio preferences, and common game controls. New games provide their own gameplay engine, game ID, local save keys, title, theme tokens, and settings-change callback. Tinker Factory is the first consumer, with a playable three-puzzle prototype under public/tinker/.

## Integration

Import mountPortfolioShell from ../portfolio-shell.js and call it during game startup:

    const shell = await mountPortfolioShell({
      gameId: "tinkerFactory",
      title: "Tinker Factory",
      homeUrl: "/",
      storageKeys: ["tinkerFactory"],
      themes: [
        { id: "workshop", label: "Workshop", tokens: { "--game-accent": "#d58a42" } },
        { id: "midnight", label: "Midnight", tokens: { "--game-accent": "#8b91e8" } }
      ],
      onSettingsChange(settings) {
        // Apply game-specific appearance or accessibility behavior.
      }
    });

The shell starts the existing Firebase account/cloud-save flow and exposes getSettings(), updateSettings(patch), and dispose(). Games may also listen for the portfolio:settings event.

## Preference model

    {
      "schemaVersion": 1,
      "themeByGame": { "tinkerFactory": "workshop" },
      "appearance": { "colorMode": "system" },
      "accessibility": { "motion": "system", "textScale": 1 }
    }

Theme IDs remain game-specific. Color mode, motion preference, and text scale are shared across the portfolio. Guest preferences remain in local storage; account preferences sync to /users/{uid}/settings/portfolio.

## Rollout

1. Build new games on the shell first, beginning with Tinker Factory.
2. Migrate existing games one at a time, preserving current local save keys and themes.
3. Keep Firestore rules aligned with registered game IDs and settings schema versions.
4. Review behavior on a development branch before merging to main; the main-branch workflow publishes to Firebase Hosting.
