# Shared PWA update management

Network Tycoon portfolio pages use the root-scoped `public/service-worker.js` and the shared `public/update-manager.js`. The live and preview Firebase Hosting workflows inject the manager into every HTML file under `public/`, including the generated `/tycoon/` route, so new portfolio games receive the same update handling without local game changes.

## Release flow

Each hosting build writes `public/version.json` with the checked-out commit SHA and substitutes that SHA into the service worker. The unique worker bytes and cache name make each deployment detectable. Firebase serves HTML, JavaScript, CSS, the service worker, and the version file with revalidation or no-store policies. Images and fonts use a short cache lifetime.

On launch, foreground resume, reconnection, and every 30 minutes while the page is active, the manager checks the deployment version and asks the root registration to update. A new worker remains waiting until the player chooses **Update Now**. The manager then asks the waiting worker to activate, waits for the controller change, and reloads once. It does not reload automatically.

## State and offline behavior

Game code continues to own local saves and the existing cloud synchronization. The update manager does not clear local storage, IndexedDB, portfolio preferences, or game saves. The worker caches the portfolio and game entry pages, offline fallback, local shared modules, and static shell assets. Requests use network-first behavior while online and cached responses when the connection is unavailable.

## Validation in the preview workflow

The preview workflow checks JavaScript syntax, release-version substitution, Firebase configuration parsing, and manager injection into every generated HTML page before deploying a temporary Hosting channel. Browser smoke checks should confirm the manager is included and each game route loads. Device acceptance should additionally cover an installed iPhone Home Screen app across a subsequent deployment, offline/reconnect, foreground resume, safe update acceptance during/after a round, and desktop browsers. The preview pipeline does not emulate iOS standalone mode or actual offline network transitions.
