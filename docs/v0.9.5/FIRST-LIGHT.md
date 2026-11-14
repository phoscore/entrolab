# Cosmic Explorer · Phase 2A: First Light

Open **Cosmic Explorer** in the site navigation. Drag the map or use its arrow keys to pan. Click or focus it before using the wheel, or use two fingers on a touch screen. The buttons and logarithmic slider also work without pointer gestures. Home fits the whole sky and Escape returns focus to the fit button. On touch screens, scroll the page outside the map. DE/EN follows the site setting.

Select a marker or use the source list with Tab, arrow keys and Enter. Selecting a source with coordinates centers the map. A group marker lists its members and zooms in. Search uses prefixes of names, aliases and catalogue IDs, such as `Bellerophon`, `Gaia` and `5853498713190525696`. The inspector shows measurement units and provenance by field, including the source release, row, columns and available references.

## Data and scientific scope

The viewer uses [the Phase 1 sample](README.md), `v0.9.5-sample.1`, schema v1. The pinned manifest SHA-256 is `570dc33b4824bd01e39a3c7065caf0e4a9db2f977aa8699c486a552441ddea6e`. Its 22 records are 3 identified stars and 10 unclassified Gaia sources, 6 DESI galaxies and 3 OEC exoplanets. The planets have no direction in this sample, so they appear in the list and inspector. Twelve records have no distance estimate. The map uses directions alone. DESI redshifts remain redshifts. Distance estimates, uncertainty bounds and physical limits have separate labels in the inspector.

The map is a cylindrical equal-area projection of catalogue RA and Dec. The frame marks the seam at RA 0°/360° and the poles. Shapes and separations distort, especially near the poles. The scale bar is a difference in RA at Dec 0°. The camera multiplies the fit scale by `10^z`, with `z` from 0 through 5. Pointer and pinch anchors remain fixed unless the camera reaches the projection boundary. Gaia directions use DR3 J2016.0 and DESI uses the catalogue's mean fibre directions. The viewer displays fixed directions and published elements. It does not propagate proper motion or derive orbital phase trajectories.

Blank regions mean there are no sample sources in the view. Catalogue coverage is unknown. A failed request or digest check has a separate retry state. The viewer fetches exclusively the packaged sample on the same origin and checks release, byte length and SHA-256 before decoding packages. NASA exports retain their local-only status.

## Packaging and performance

`node scripts/build-explorer.mjs` copies the 57 reproducible sample files into the static distribution, alongside byte copies of the three browser-safe foundation modules and a generated release pin. `node scripts/build-explorer.mjs --check` compares the 61 output files against the offline build. The committed sample and physics modules retain their original bytes. Serve `dist/` over HTTPS or localhost for module loading and Web Crypto.

The 57 sample files are approximately 168 KiB before HTTP compression. The catalogue, manifest and visible tiles load on first open. Search shards load on demand. The existing tile loader allows two concurrent package requests and holds at most 1 MiB and 64 cache entries. The camera uses one requested frame at a time and draws when state changes, with device pixel ratio capped at 1.75. An inactive tab stops drawing and cancels pending requests. Camera and selection are preserved when reopened. Reduced Motion uses the same direct camera controls and disables CSS motion.

The Chromium tests produce all-sky, selected-source and mobile screenshots plus `explorer-performance.json` in `browser-results/`, available in the Actions artifact. One Windows run with headless Edge 146 opened the view in 269 ms on localhost, including the tab click and first visible markers. It requested 155 KiB of decoded Explorer resources after opening and recorded a 1.7 ms Canvas draw. The idle check verifies that the draw count stops advancing. The 320 px test emulates touch input and a mobile viewport. These measurements establish the sample's local behaviour. Device and network performance still need measurement on physical phones.

## Reproduce verification

```sh
node scripts/cosmic-data.mjs verify
node scripts/build-explorer.mjs --check
node scripts/test.mjs
node scripts/check-benchmarks.mjs
node scripts/verify-original.mjs
npm ci
npx playwright install chromium
npm run test:browser
```

For a focused browser check, run `node --test tests/explorer-browser.test.mjs`. The cases cover deferred loading, keyboard and marker selection, provenance and localisation, camera anchors, a two-finger pinch at 320 CSS pixels, tab switching, idle rendering and recovery after a failed manifest request.

## Next phases

For system views, establish host and planet identities and preserve the chosen published solution, reference frame and epoch. Animate only solutions with the elements and epoch needed for the displayed trajectory. Show the measured elements without a trajectory where the solution is underdetermined.

For larger catalogues, add defensible coverage metadata and a separate row-detail endpoint or shard format so the client can avoid downloading the entire object catalogue. Render LOD aggregates distinctly from catalogue sources and measure decoding, eviction, frame time and touch input on actual mid-range phones before raising tile or point budgets. Evaluate a worker or WebGL once those measurements justify it.
