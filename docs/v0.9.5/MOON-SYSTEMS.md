# Our Home · Outer planet moon systems

Open **Cosmic Explorer → Our Solar System** and choose the Saturn, Uranus or Neptune system. Selecting a host planet also offers **Open moon system** in its inspector. Each view opens in the existing rotatable 3D camera. **Fit system** resets the camera, and **Inner moons** gives Saturn and Neptune a closer view without changing coordinates. At Neptune's full scale, Proteus and Triton can appear near the same pixels as Neptune. The inner preset separates these small orbital scales from Nereid’s extended orbit. Labels use the shared collision avoidance, with the current selection and reference placed first. The selectable object list remains available for overlapping or offscreen objects.

| System | Included moons | Horizons centre | Source shown in Horizons headers |
| --- | --- | ---: | --- |
| Saturn | Titan, Enceladus, Rhea, Dione, Tethys, Iapetus, Mimas | 699 | sat441l |
| Uranus | Titania, Oberon, Umbriel, Ariel, Miranda | 799 | ura184_merged |
| Neptune | Triton, Proteus, Nereid | 899 | nep098_merged |

The closed coverage window is **2026-07-01 00:00 to 2027-07-01 00:00 TDB** (JD 2461222.5–2461587.5). The centre of each planet is the local origin, so its relative position and velocity are zero. All lunar states are geometric, in ICRF aligned to the J2000 ecliptic, with distance in km and velocity in km/s. Conversion to AU is only for shared projection and display math. The ecliptic axes give an orientation guide. Moon positions and paths retain all three coordinates, including Uranus's tilted arrangement, Triton's retrograde orbit and Nereid's eccentric orbit. Scientific radii and mean semimajor axes are descriptive values. Marker radii and Saturn's decorative ring can be symbolic. The paths show sampled intervals from the ephemerides, with brighter optional histories, and are not closed Kepler ellipses fitted to display points.

## Navigation and epochs

From an unsupported date, opening one of these systems chooses 00:00 TDB on the current UTC calendar date if it falls inside coverage, else 00:00 TDB on the first supported day. The caption discloses the fallback. Returning restores the previous camera, view and selection and restores the previous date if the fallback was automatic. Deliberate date changes carry over under the existing Our Home rules. Calendar controls and playback respect the supported interval. Status and retry controls report unavailable, loading or rejected data. Playback respects the existing offscreen, visibility and Reduced Motion rules.

The three outer systems restrict comparisons to the local planet-centred vectors. The existing separately validated Earth/Jupiter hybrid Sun references and Pluto's solar anchor remain available in their existing modes. Voyager and Heliosphere keep their own data, framing and return state.

## Capture and offline verification

The versioned release `v0.9.5-horizons-outer-2026-2027.1` archives 34 original Horizons replies (12,120,495 bytes uncompressed, 4,120,673 bytes gzipped) with exact queries, source identifiers, frame metadata and SHA-256. Targets, centres, geometric-vector headers, sample count and dates are checked on capture and rebuild. Headers identify the same source for a target and its reference centre, including off-grid captures. Source snapshots were obtained on 25 November 2026 (Europe/Berlin). The shared EPM1 codec stores little-endian Float64 states at fixed cadences. Three browser packages total 2,909,064 bytes. The browser fetches each package on demand from the same origin and validates its SHA-256, size, centre and finite states before use. No browser request goes to Horizons.

```sh
node scripts/outer-moons.mjs --capture # serial network operation
node scripts/outer-moons.mjs --build   # reproduce packages, manifest and runtime pins offline
node scripts/outer-moons.mjs --check   # compare archived sources and generated output byte for byte
```

Interpolation is cubic Hermite using tabulated positions and velocities. The returned velocity is the derivative of the same curve. A separate Horizons TLIST response for each object supplies 48 off-grid epochs stratified over the window. Below are the observed maximum norms of vector residuals, rounded upward. These sample the interpolation error within the pinned numerical solution. They do not bound physical ephemeris uncertainty or every possible epoch.

| Moon | Target | Cadence | Position (km) | Velocity (m/s) |
| --- | ---: | ---: | ---: | ---: |
| Titan | 606 | 8 h | 1.188 | 0.128 |
| Enceladus | 602 | 1 h | 0.857 | 0.733 |
| Rhea | 605 | 4 h | 3.994 | 0.855 |
| Dione | 604 | 2 h | 1.339 | 0.574 |
| Tethys | 603 | 2 h | 4.538 | 1.942 |
| Iapetus | 608 | 24 h | 0.535 | 0.022 |
| Mimas | 601 | 1 h | 3.357 | 2.874 |
| Titania | 703 | 6 h | 1.225 | 0.175 |
| Oberon | 704 | 8 h | 0.905 | 0.098 |
| Umbriel | 702 | 3 h | 0.911 | 0.264 |
| Ariel | 701 | 2 h | 0.928 | 0.398 |
| Miranda | 705 | 1 h | 0.403 | 0.345 |
| Triton | 801 | 4 h | 0.932 | 0.2 |
| Proteus | 808 | 1 h | 0.91 | 0.779 |
| Nereid | 802 | 8 h | 0.028 | 0.005 |

[Horizons manual](https://ssd.jpl.nasa.gov/horizons/manual.html) · [Vector API](https://ssd-api.jpl.nasa.gov/doc/horizons.html) · [Current satellite ephemerides](https://ssd.jpl.nasa.gov/sats/ephem/) · [JPL mean elements](https://ssd.jpl.nasa.gov/sats/elem/) · [JPL physical parameters](https://ssd.jpl.nasa.gov/sats/phys_par/) · [JPL data and attribution policy](https://ssd.jpl.nasa.gov/faq.html). Moon feature notes link to NASA's object pages. The runtime packages are derived from the archived NASA/JPL responses.

## Checks and limits

The regular Node suite includes offline reproduction, bounds, package integrity, units, linked object records and spatial geometry. Chromium exercises opening, return state, camera, selection, dates, error recovery, DE/EN, mobile controls and repeated mode switches. Native screenshots and the review contact sheet are named `moon-systems-*` in the Chromium artifact. The draft PR holds exact-head test and visual-review results. The selected moons cover the requested systems. The site contains no complete satellite catalogue, live telemetry or trajectories outside source coverage.
