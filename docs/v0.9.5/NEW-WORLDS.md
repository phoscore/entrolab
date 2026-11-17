# Our Home: Moon systems and Pluto (Phase 2F-C1)

## Source and resource decision, before import

Checked 17 November 2026 against [JPL satellite ephemerides](https://ssd.jpl.nasa.gov/sats/ephem/files.html), [Horizons vector API](https://ssd-api.jpl.nasa.gov/doc/horizons.html), [SSD data terms](https://ssd.jpl.nasa.gov/faq.html) and [NAIF rules](https://naif.jpl.nasa.gov/naif/rules.html). JUP365 covers the four Galilean moons, PLU060 covers Pluto/Charon. Direct SPK downloads are large: JUP365 1,108,796,416 bytes, JUP347 876,787,712 bytes, PLU060 116,884,480 bytes (HTTP Content-Length, 17 November 2026). The official Horizons API returns precisely selected, geometric vectors for the same sources. Its small pilot request returned 200 OK and the required TDB / ecliptic J2000 / km and km/s metadata. We therefore use bounded Horizons captures, never fetch ephemerides in the browser, and do not copy SPICE Toolkit binaries into the repository.

NASA/JPL SSD describes the data it provides as public domain, requires that modifications be made clear and discourages excessive network calls. NAIF permits downloading and use of its kernels, and redistribution of *unmodified* NAIF kernels; its Toolkit redistribution rules are separate. Our numerical exports are **derived Horizons data**, labelled as such, with exact request parameters, source bytes and hashes archived. They do not grant any rights to Gaia (CC BY-NC 3.0 IGO), DESI or the site's own code. NASA/JPL/Caltech endorsement is not implied.

### Trial measurements

An independent 30-day J2000 pilot queried ten named target/center pairs, then queried **half-step epochs independently** for cubic Hermite comparison. Position / velocity maximum residuals from all pilot midpoints:

| Target relative to center | Step | Midpoints | Max position (km) | Max speed (km/s) |
| --- | ---: | ---: | ---: | ---: |
| Earth center / Earth–Moon barycenter | 6 h | 120 | 0.00023 | 0.00000000020 |
| Moon / Earth–Moon barycenter | 6 h | 120 | 0.019 | 0.000000016 |
| Jupiter center / Jupiter-system barycenter | 12 h | 60 | 0.53 | 0.0000044 |
| Io / Jupiter-system barycenter | 3 h | 240 | **44** | 0.00038 |
| Europa / Jupiter-system barycenter | 6 h | 120 | **72** | 0.00032 |
| Ganymede / Jupiter-system barycenter | 12 h | 60 | **105** | 0.00022 |
| Callisto / Jupiter-system barycenter | 12 h | 60 | 6.6 | 0.0000062 |
| Pluto-system barycenter / Sun | 24 h | 30 | 0.000003 | 0.00000000003 |
| Pluto / Pluto-system barycenter | 12 h | 60 | 0.33 | 0.00000074 |
| Charon / Pluto-system barycenter | 12 h | 60 | 2.7 | 0.0000061 |

The short-period Galilean moons require closer samples. The production choice is 1 h Io, 3 h Europa, 4 h Ganymede and 8 h Callisto; other pilot spacings remain. The exact maximum errors for the actual release need new independent interstitial samples across its time span; the pilot figures **must not** be presented as a global accuracy guarantee.

### Bounded release contract

Candidate window: 2025-01-01 00:00 through 2030-01-01 00:00 **TDB**, containing the current epoch but deliberately narrower than the old 1800–2050 approximate eight-planet model. Ten distinct target/center vectors (Earth, Moon; Jupiter, four moons; Pluto barycenter, Pluto, Charon) plus 30 or more independent off-grid reference checks per object. Expected ~105,000 vector records, ~25 MB raw API response before compression, ~6 MB compact binary hosting. Actual measured byte sizes, interpolation residuals and request count are required before shipping. Explicitly show unavailable states outside coverage; never extrapolate a new object or silently substitute a circular orbit.

**Frame combination.** Earth/Moon states are relative to the Earth–Moon barycenter (`3`); Jupiter and four moons are relative to the Jupiter-system barycenter (`5`); Pluto/Charon are relative to their barycenter (`9`), which is separately positioned relative to the Sun (`10`). All vector requests specify `TIME_TYPE=TDB`, `REF_SYSTEM=ICRF`, `REF_PLANE=ECLIPTIC`, `OUT_UNITS=KM-S`, `VEC_TABLE=2`, `VEC_CORR=NONE`. The old approximate Earth and Jupiter barycenter heliocentric positions are only anchors for their local systems; the relative satellite geometry remains internally consistent. Cross-system and Sun comparisons using those anchors are a **hybrid approximation** and must be labelled and checked against independent Horizons anchor vectors before display. The old planetary model is not replaced. No high-precision geocentric Earth or Jupiter center is claimed from its existing planet glyphs.

Scientific error can include kernel fit errors, mixed-model anchor differences and interpolation. Interpolation checks constrain only the last of these. Absolute values are rounded according to their actual combined validity.

## Release `v0.9.5-horizons-2025-2030.1`

The reconstruction in [GitHub Actions](https://github.com/phoscore/entrolab/actions/runs/44169053408) archived 31 independent HTTP responses (20,182,413 original bytes; 6,822,970 gzip bytes). The response headers identify `DE441`, `jup365_merged` and `plu060_merged`, depending on target and centre. Original-response and gzip SHA-256 hashes, URLs, and actual kernel names are in `cosmic-explorer/data/raw/v0.9.5-horizons-2025-2030.1/manifest.json`. Browser package SHA-256 hashes and all residuals are in `dist/explorer/data/v0.9.5-horizons-2025-2030.1/manifest.json`.

Each binary starts with an `EPM1` magic and a system identifier. Each regular time series then stores chronological little-endian Float64 X, Y, Z in km and VX, VY, VZ in km/s. Its implicit epochs follow the manifest grid from JD 2460676.5 to 2462502.5 inclusive (2025-01-01 to 2030-01-01, 00:00 TDB). Cubic Hermite interpolation uses the stored positions and velocities. Its derivative supplies the velocity at the same epoch. No extrapolation is performed. System data are loaded from the same versioned site assets: Earth 701,288 bytes, Jupiter 3,769,112 bytes, Pluto 438,392 bytes. The two inner packs are fetched only upon opening their system. The Pluto pack is also used for its overview marker during the covered interval.

### Independently queried Horizons comparisons

The sampler checked 32 off-grid epochs per series, stratified over the whole window and staggered within grid intervals. Observed maxima are 3D Euclidean residuals, measured against separately requested states from the same JPL numerical models. The results measure interpolation on this sample, rather than a bound on the physical ephemeris uncertainty or all possible epochs.

| Series | Maximum position residual (km) | Maximum velocity residual (m/s) |
| --- | ---: | ---: |
| Earth centre | 0.00021 | 0.000033 |
| Moon | 0.017 | 0.0027 |
| Jupiter centre | 0.525 | 0.0373 |
| Io | 0.532 | 0.464 |
| Europa | 4.432 | 1.281 |
| Ganymede | 1.299 | 0.279 |
| Callisto | 1.257 | 0.138 |
| Pluto centre | 0.324 | 0.0231 |
| Charon | 2.655 | 0.190 |
| Pluto-system barycentre from Sun | 0.0000028 | 0.00000013 |

Another 96 comparisons tested subtraction versus independently queried Moon-from-Earth-centre, Io-from-Jupiter-centre, and Charon-from-Pluto-centre states. Maxima were 2.979 km and 0.473 m/s across those pairs. A further 64 comparisons measured the old approximate heliocentric barycentre anchors: Earth 15,486 km / 2.197 m/s and Jupiter 617,657 km / 8.354 m/s (rounded upward). The UI labels Sun-relative results for those two systems as hybrid and rounds them more coarsely. The Pluto system uses the Horizons heliocentric barycentre. Same-system comparisons subtract states in their local common frame. Distances against arbitrary other planets aren't shown for the new objects because they would mix model levels. Light travel time is the instantaneous 3D separation divided by the exact speed of light, rather than an observed light-time solution.

Planet centres are visible local bodies. The common barycentre is the intersection of the ecliptic guide axes. Body glyphs are enlarged by default and their colours are illustrative. Turning enlargement off uses mean radii from [JPL satellite physical parameters](https://ssd.jpl.nasa.gov/sats/phys_par/) and the [NASA Pluto fact sheet](https://science.nasa.gov/dwarf-planets/pluto/facts/). In the overall Solar System, Pluto shows the measured portion of its path within the time window. Local trails draw only available past states, with a fixed upper limit of 49 samples per body. The legacy planetary orbit equations and TDB clock remain in use for the original overview.

```sh
node scripts/new-worlds.mjs --build   # network-free rebuild from the archived responses
node scripts/new-worlds.mjs --check   # validates source hashes, scientific residuals and output bytes
node --test tests/new-worlds.test.mjs
```

Use `--capture` only when acquiring a new source snapshot. It queries the official service serially, caches validated responses and records their SHA-256 hashes. A recapture can differ because the upstream source updates its ephemerides and includes generation timestamps. The archived bodies and manifest define the exact input for this release.
