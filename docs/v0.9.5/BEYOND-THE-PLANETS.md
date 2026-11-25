# Our Home · Beyond the Planets

**Cosmic Explorer → Our Solar System → Small bodies · 3D** opens an optional heliocentric view. It starts with the four new dwarf planets and the existing Pluto entry. Other groups and schematic belts can be enabled independently. The object picker supplies a camera jump; the selected small body has its own inspector. **Fit orbital arc** frames the selected object’s archived positions, and **Fit asteroid belt** frames the inner guide. Closing the mode restores the previous camera, selection, date, view and trail preference. Opening from a date outside the dwarf-planet coverage chooses the current calendar day labelled as midnight TDB, clamped to coverage. The original date is retained for return. Galactic, moon, Voyager and Heliosphere modes retain their own entry rules. Close the small-body mode to use the overview’s Pluto–Charon entry.

## Catalogue and coverage

The new release has **22 objects**. Ceres, Pluto, Haumea, Makemake and Eris are the five dwarf planets listed by [NASA](https://science.nasa.gov/dwarf-planets/). Pluto (134340) continues to use the versioned [Pluto–Charon release](NEW-WORLDS.md), with coverage 2025-01-01 to 2030-01-01. Large TNOs in the candidate list have proposed dwarf-planet status; their inclusion confers no recognition. Arrokoth is shown as a TNO. Hygiea and Ceres both inhabit the main belt, but only Ceres is in the recognized dwarf-planet group. The source's dynamical SBDB class (such as MBA, APO or TNO) describes an orbit, independently of the displayed physical classification. [IAU planet definition](https://www.iau.org/static/resolutions/Resolution_GA26-5-6.pdf) · [Small-Body Database](https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html).

All limits below are inclusive at **00:00 TDB**. Error columns give observed maxima in **km / m/s**, rounded upward. Separate ephemeris and catalogue IDs are retained where appropriate. Each exact Horizons target label and centre solution is in the generated manifest.

| Object | Designation / SBDB SPK-ID | Group / SBDB orbit class | Coverage | Grid | Horizons solution | Pos. / vel. residual |
| --- | --- | --- | --- | --- | --- | ---: |
| Ceres | 1 / 20000001 | dwarf / MBA | 2025-01-01 → 2029-01-01 | 2 d | JPL#48 | 0.007 / 0.001 |
| Haumea | 136108 / 20136108 | dwarf / TNO | 2025-01-01 → 2029-01-01 | 2 d | JPL#132 | 0.001 / 0.001 |
| Makemake | 136472 / 20136472 | dwarf / TNO | 2025-01-01 → 2029-01-01 | 2 d | JPL#130 | 0.001 / 0.001 |
| Eris | 136199 / 20136199 | dwarf / TNO | 2025-01-01 → 2029-01-01 | 2 d | JPL#103 | 0.001 / 0.001 |
| Vesta | 4 / 20000004 | asteroid / MBA | 2025-01-01 → 2029-01-01 | 2 d | JPL#36 | 0.016 / 0.001 |
| Pallas | 2 / 20000002 | asteroid / MBA | 2025-01-01 → 2029-01-01 | 2 d | JPL#74 | 0.022 / 0.001 |
| Hygiea | 10 / 20000010 | asteroid / MBA | 2025-01-01 → 2029-01-01 | 2 d | JPL#129 | 0.005 / 0.001 |
| Bennu | 101955 / 20101955 | asteroid / APO | 2025-01-01 → 2029-01-01 | 0.5 d | ORX_merged_DE424 | 0.006 / 0.001 |
| Ryugu | 162173 / 20162173 | asteroid / APO | 2025-01-01 → 2029-01-01 | 0.5 d | JPL#270 | 0.005 / 0.001 |
| Apophis | 99942 / 20099942 | asteroid / ATE | 2025-01-01 → 2029-01-01 | 0.25 d | JPL#220 | 0.001 / 0.001 |
| Eros | 433 / 20000433 | asteroid / AMO | 2025-01-01 → 2029-01-01 | 0.5 d | JPL#659 | 0.002 / 0.001 |
| Sedna | 90377 / 20090377 | tno / TNO | 2025-01-01 → 2029-01-01 | 4 d | JPL#51 | 0.001 / 0.001 |
| Quaoar | 50000 / 20050000 | tno / TNO | 2025-01-01 → 2029-01-01 | 4 d | JPL#52 | 0.001 / 0.001 |
| Orcus | 90482 / 20090482 | tno / TNO | 2025-01-01 → 2029-01-01 | 4 d | JPL#61 | 0.001 / 0.001 |
| Gonggong | 225088 / 20225088 | tno / TNO | 2025-01-01 → 2029-01-01 | 4 d | JPL#25 | 0.001 / 0.001 |
| Salacia | 120347 / 20120347 | tno / TNO | 2025-01-01 → 2029-01-01 | 4 d | JPL#42 | 0.001 / 0.001 |
| Arrokoth | 486958 / 20486958 | tno / TNO | 2025-01-01 → 2029-01-01 | 4 d | JPL#3 | 0.001 / 0.001 |
| Halley | 1P / 1000036 | comet / HTC | 1985-01-01 → 2064-01-01 | 1 d | JPL#75 | 1.899 / 0.068 |
| Churyumov–Gerasimenko | 67P / 1000012 | comet / JFc | 2014-01-01 → 2031-01-01 | 1 d | JPL#K284/1 | 0.039 / 0.002 |
| Encke | 2P / 1000025 | comet / ETc | 2023-01-01 → 2030-01-01 | 0.5 d | JPL#K273/32 | 1.688 / 0.121 |
| Swift–Tuttle | 109P / 1000140 | comet / HTC | 1990-01-01 → 2031-01-01 | 2 d | JPL#32 | 2.625 / 0.047 |
| Hale–Bopp | C/1995 O1 / 1000132 | comet / COM | 1995-01-01 → 2031-01-01 | 2 d | JPL#226 | 3.403 / 0.061 |

The current release intentionally ends the Apophis series before its April 2029 Earth encounter. The periodic-comet target selection uses the closest available Horizons apparition solution without fragments. The long-period Hale–Bopp selector accepts the source's designation presentation. Separate SBDB snapshots supply identification, osculating period, eccentricity, inclination and available approximate diameters with uncertainties when present. Such parameters belong to the SBDB orbit epoch. They are neither inferred from the rendering nor assumed to be the same solution as the Horizons vector fit. Effective diameters do not describe the axes of elongated objects. An absent parameter is shown as unavailable. [SBDB API](https://ssd-api.jpl.nasa.gov/doc/sbdb.html) · [Horizons manual](https://ssd.jpl.nasa.gov/horizons/manual.html).

## Reference frame and model limits

The geometric states use Sun centre (`500@10`), ICRF with the J2000 ecliptic reference plane, TDB Julian days, km and km/s. The camera uses the exact AU conversion used by the existing Solar System viewer. The inspector gives heliocentric range and speed from these vectors. Planet context is from the older JPL analytic approximation and is removed beyond its time window. A missing small-body state suppresses that body's marker and readout. The picker still reports coverage and offers a jump to the first available date.

Interpolation uses cubic Hermite positions and the analytic velocity derivative. Grids are fixed per object, with an explicitly sampled final shorter segment when needed. The grid was tightened for faster asteroids and selected periodic comets. The independent vector calls cover stratified off-grid epochs and concentrate additional samples at the fastest intervals, including near perihelion. Over 1,211 checks, maximum measured residuals were **3.403 km** in position and **0.121 m/s** in velocity. This measures interpolation relative to the captured solutions, not observational uncertainty, a physical accuracy bound, or the error of future comet forecasts. Some solutions depend on fitted nongravitational terms from outgassing or other forces. SBDB's model-parameter codes are preserved separately. No browser code integrates an extrapolation model or contacts NASA/JPL.

## Spatial guides and visualisation

The optional main-belt band spans 2.1–3.3 AU. The Kuiper guide spans 30–50 AU, a representative band rather than a physical outer boundary. Both use lightly shaded ecliptic slices with illustrative vertical offsets (0.24 AU and 5 AU). These offsets provide depth cues and are not a fitted inclination or density distribution. The main-belt band and Kuiper guide contain no synthetic object markers. [ESA belt ranges](https://www.esa.int/media/small-objects-in-the-solar-system) · [NASA Kuiper Belt context](https://science.nasa.gov/resource/kuiper-belt-in-depth/).

Symbols distinguish dwarf planets, asteroids, TNOs and comets by shape and colour. Sun and planet context glyphs have a smaller screen-space cap in this mode. Their radii are illustrative. Collision avoidance favours the selection. The full view cannot resolve every inner object at outer-Solar-System scales; the picker and belt preset provide closer views. The optional selected-body line draws a simplified polyline of at most 640 points from covered states. It shows the archive's extent and may remain open or include repeated passes. It is a spatial orbit guide, not a tail, trajectory extrapolation, or display of current activity. The view keeps the existing orbit camera and Reduced Motion lifecycle.

## Reproduction

The 25 November 2026 capture archives 107 original Horizons and SBDB replies in compressed form, 4,974,458 bytes in total. Each archive records its exact URL, lengths and SHA-256 digests. A compact group package is fetched only when requested and retained in memory once checked. The largest package, for comets, is 3,037,768 bytes. The runtime independently pins the byte length and digest. It checks group identity, epoch layout and vector finiteness. A failure offers an explicit retry.

```sh
node scripts/small-bodies.mjs --capture # serial source capture, for new source snapshots
node scripts/small-bodies.mjs --build   # offline, from raw snapshots
node scripts/small-bodies.mjs --check   # compare manifests, pins, packages and references
```

## Verification

`tests/small-bodies.test.mjs` covers identity, format, coverage, units, invalid values and Halley's geometry. The Chromium suite covers progressive loading, group toggles, camera fit, dates beyond the planet model, missing positions, retry, return state, English and German, Reduced Motion, viewport widths down to 320 CSS px and repeated mode switches. The normal CI runs these and the existing physics and browser regressions. The Draft PR records the exact revision, independent audit, visual observations and native screenshot archive.

The additional moon systems of Eris, Haumea and Makemake were deferred because no candidate planet-centred vector release and independent off-grid checks were established for this change. Pluto–Charon stays available. The Oort Cloud has explanatory text only. Free spatial camera movement, broader stellar and extragalactic catalogues, telemetry updates and the v0.9.6 architecture lie outside this change.
