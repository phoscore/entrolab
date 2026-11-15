# Cosmic Explorer · Phase 2B: Home & Systems

Open **Cosmic Explorer**, then choose **Sky map** or **Solar System**. The sky map represents directions around our Solar System. Its frame covers the whole sky and its data sample contains 19 directions. The optional “How do I read this map?” disclosure explains the change from a sphere of directions to a flat map. The Solar System mode switches to a local coordinate frame and the return button restores the sky camera, selection and query.

| View | What the scale describes | Meaning of symbols |
| --- | --- | --- |
| Sky map | Angular projection of catalogue directions. The bar denotes a right ascension difference at the equator. | Four-point stars, diamonds for galaxies, hollow circles for unclassified Gaia sources and counted hexagons for groups. Symbol size and colour distinguish type and selection. |
| Solar System | Linear AU or km in the projected J2000 ecliptic plane. The Inspector reports the separate 3D distance from the Sun. | Enlarged body symbols by default. The colours, shading and drawn Saturn ring illustrate identity. Uncheck enlargement for body radii at the orbital scale. Selection halos and hit targets are UI indicators. |
| Exoplanet system cards | List of verified host and planet identities, with sample measurements in the Inspector. | Catalogue names alone for companion planets outside the Phase 1 sample. Positions and trajectories are absent. |

Pan by dragging or using the arrow keys. Scroll to zoom when the map has focus, pinch with two fingers or use the slider and +/- controls. Home fits the active view and Escape returns to the fit control. The **Inner planets** button fits the inner system more closely. The Sun and all eight planets are selectable from the list at any zoom. Model time starts at J2000.0. Use a date, the day-step buttons or playback with 1, 10 or 100 model days per real second. Reduced Motion keeps date and day-step controls available.

## Model and data

- **Planet positions.** NASA/JPL Solar System Dynamics, [Approximate Positions of the Planets, Table 1](https://ssd.jpl.nasa.gov/planets/approx_pos.html), retrieved 2026-11-15. The tabulated six elements and secular rates are transcribed into `solar-model.mjs`. JPL [publishes the data as public domain](https://ssd.jpl.nasa.gov/faq.html) and recommends local approximation for visualisation. The browser evaluates this approximation offline.
- **Frame and time.** Heliocentric mean ecliptic and equinox of J2000, state vectors in AU. The model evaluates Julian Date in barycentric dynamical time (TDB), using 36525 days per Julian century from JD 2451545.0. Inputs use a proleptic Gregorian TDB calendar, with a supported interval from 1800-01-01 00:00 through 2050-01-01 00:00 TDB. JavaScript date functions are used for Gregorian calendar arithmetic. The time control does not convert current UTC to TDB.
- **Position calculation.** The six fitted elements are evaluated at the requested time. A bounded solution of Kepler’s equation determines the position on that ellipse. The orbital frame rotates into J2000 ecliptic axes, with the north-side map showing positive ecliptic X to the right and positive Y up. Orbit lines show the fitted ellipses at the displayed epoch. The Sun is the coordinate origin. Earth’s position uses the Earth–Moon barycentre, as specified by JPL. These positions are computed from a fit, with no archived Horizons vectors or live ephemeris requests in the viewer.
- **Size conventions.** IAU 2012 adopts 1 AU = 149597870700 m. The Sun uses the IAU 2015 B3 [nominal solar radius](https://www.iau.org/common/Uploaded%20files/IAUGA2015-Resolution-B3-recommended-nominal-conversion.pdf) of 695700 km. Planets use the [JPL mean radii](https://ssd.jpl.nasa.gov/planets/phys_par.html). Radius mode draws circular discs at that radius without rings, limb distortion or body oblateness.
- **Independent comparison.** The checked-in test fixture holds the eight corresponding heliocentric vectors at JD 2415020.0 and 2451545.0 from Bretagnon and Francou’s [VSOP87A check file](https://github.com/ctdk/vsop87/blob/faa11898fc4c683e068fc056a9a68c71534e0d42/vsop87.chk), blob `22196967dcfc3f045a7dc70c48e75d63d94db1d6`. Earth is compared to the Earth–Moon vector. The 16 residuals range from about 0.0000067 to 0.02938 AU. Saturn has the largest residual in this comparison. The observed residuals check the implementation at these epochs and do not bound the errors across the interval. See the JPL table for nominal errors by body.
- **Named stars.** The three already classified Gaia DR3 records are labelled Proxima Centauri, Barnard’s Star and Lalande 21185 using exact source IDs from the [ESA Gaia nearby-star comparison](https://www.cosmos.esa.int/web/gaia/iow_20250513). Other Gaia records retain their unclassified status. Canvas labels give selected and identified objects priority and avoid occupied screen rectangles.
- **Exoplanet systems.** The pinned OEC XML for [51 Peg](https://github.com/OpenExoplanetCatalogue/open_exoplanet_catalogue/blob/4a61419b92d4a57366b111b2d11d0a03eb0b5df0/systems/51%20Peg.xml), [TRAPPIST-1](https://github.com/OpenExoplanetCatalogue/open_exoplanet_catalogue/blob/4a61419b92d4a57366b111b2d11d0a03eb0b5df0/systems/TRAPPIST-1.xml) and [HR 8799](https://github.com/OpenExoplanetCatalogue/open_exoplanet_catalogue/blob/4a61419b92d4a57366b111b2d11d0a03eb0b5df0/systems/HR%208799.xml) places the confirmed planets below the respective single host star. The resolver matches the sample release, OEC revision, identity, row and source blob. Names alone are carried over for the other confirmed planets. Measured values and uncertainties still come from the unmodified Phase 1 record for each `b` planet. Unknown phase or timing, missing geometry and incomplete solutions remain unavailable for computing coordinates. Catalogue licence and credits ship with the sample.

## Verification

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

The First Light sample stays at `v0.9.5-sample.1`, schema 1. The offline build checks the existing 61 artifacts byte for byte, including the 57 sample files. The scientific fixture, solar input tables and host lookups are covered by the Node suite. The browser suite checks mode switching, zoom anchors, clock changes, true scale, keyboard selection, mobile pinch, reduced motion, offscreen/inactive scheduling and unchanged lab state. It provides screenshots of the sky, catalogue system card, desktop Solar System and 320 px Solar System in the Chromium review artifact.

The solar modules load when that mode first opens. A single Canvas frame draws the grid, eight affine ellipses and up to nine bodies at a device pixel ratio capped at 1.75. The map redraws on input while paused. Playback pauses when the canvas goes offscreen or the tab or mode is left. The sky tile loader aborts pending work when the Solar System opens. The current mobile checks use emulated viewports and touch input.
