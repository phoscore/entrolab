# Reincarnated as a Proton v0.9.5

Entrolab’s eight bilingual labs now include a real-data sky atlas, a 3D stellar neighborhood and an interactive Solar System. This release also expands the experiments and explanations, unifies the lab interface and closes the confirmed findings from the final audit.

The development baseline is v0.9.25 Phase B (Null 3.0), commit `f705e551f845dd1d33af6ca95b6b430722efcde1`. Data package and source archive versions follow their own release IDs.

## Cosmic Explorer

- **Data foundation and first viewer.** The offline pipeline records sources, uncertainties, coordinate frames and content hashes. First Light introduced the searchable sky map, object inspector and read-only views of selected exoplanet systems. [#14](https://github.com/phoscore/entrolab/pull/14) · [#19](https://github.com/phoscore/entrolab/pull/19) · [#21](https://github.com/phoscore/entrolab/pull/21)
- **Sky atlas.** Selected Gaia DR3 sources and DESI DR1 galaxies add real catalog data, with density views, zoom, filtering and source inspection. The revised atlas clarifies coverage, scale, source categories and observing context. [#23](https://github.com/phoscore/entrolab/pull/23) · [#25](https://github.com/phoscore/entrolab/pull/25) · [#28](https://github.com/phoscore/entrolab/pull/28)
- **Stellar neighborhood.** A selected set of nearby sources is shown in Sun-centered Galactic coordinates with estimated distances, uncertainty and source records. The 3D view supports Orbit and Free cameras. Switching into Free enforces the ±1,000 pc coordinate limit before the first movement step. [#26](https://github.com/phoscore/entrolab/pull/26) · [#34](https://github.com/phoscore/entrolab/pull/34) · [#54](https://github.com/phoscore/entrolab/pull/54)
- **Our Home.** The Solar System adds time controls, heliocentric and relative measurements, 3D motion trails and an optional local Galactic-motion view. Expanded moon systems, dwarf and trans-Neptunian objects, asteroids, comets and Apophis’s 2029 encounter have their own source and time limits. The finalization adds a free 3D camera and refines mode transitions and orientation. [#29](https://github.com/phoscore/entrolab/pull/29) · [#31](https://github.com/phoscore/entrolab/pull/31) · [#33](https://github.com/phoscore/entrolab/pull/33) · [#36](https://github.com/phoscore/entrolab/pull/36) · [#43](https://github.com/phoscore/entrolab/pull/43) · [#45](https://github.com/phoscore/entrolab/pull/45) · [#46](https://github.com/phoscore/entrolab/pull/46) · [#47](https://github.com/phoscore/entrolab/pull/47)
- **Voyager and the heliosphere.** Voyager 1 and 2 have separately inspectable trajectories, distances, speeds and estimated signal times. The historical packages reach 26 November 2026 at 00:00 TDB. Forecasts have separately labeled coverage. The heliosphere illustration explains the solar wind and its boundary, with Voyager crossing records identified separately. [#42](https://github.com/phoscore/entrolab/pull/42) · [#44](https://github.com/phoscore/entrolab/pull/44)

## Labs and interface

- Gravity Sandbox draws trails from sampled integration states and validates position and total speed at input. Extreme Objects adds the Sun and revises its illustrations. Null appears across more parts of the site, with controls for decorative motion. [#37](https://github.com/phoscore/entrolab/pull/37) · [#38](https://github.com/phoscore/entrolab/pull/38) · [#39](https://github.com/phoscore/entrolab/pull/39) · [#40](https://github.com/phoscore/entrolab/pull/40)
- All eight labs use a consistent header, contextual help and distinct accents. Compact navigation, touch targets, keyboard focus, German and English labels and playback controls were refined. [#51](https://github.com/phoscore/entrolab/pull/51) · [#54](https://github.com/phoscore/entrolab/pull/54) · [#55](https://github.com/phoscore/entrolab/pull/55)
- Entrolab supports 1–512 distinguishable markers, with exact counts and a dense view for larger populations. The learning pass adds plain-language explanations and questions, an electric point-charge experiment, clearer distinctions between black-hole models and illustrations, sourced examples in Extreme Objects and a two-temperature gas comparison. [#53](https://github.com/phoscore/entrolab/pull/53)
- Engineering work improved CI and public repository readiness. The audit follow-up updated the README, localized the fonts, stabilized Chromium resource tests, fixed Explorer stylesheet recovery and keyboard focus, synchronized Entropy remounts, clarified Gravity input limits, and improved thermal precision and accessible power readouts. [#27](https://github.com/phoscore/entrolab/pull/27) · [#57](https://github.com/phoscore/entrolab/pull/57)

## Scientific scope

| Area | Model and limits |
| --- | --- |
| Gravity Sandbox | Planar Newtonian N-body gravity with softening, Velocity Verlet and perfectly inelastic merges. Input bounds keep coordinate resolution small relative to softening and total speed at or below 0.01c. Energy drift alone does not establish orbital accuracy. |
| Singularities and Extreme Objects | Schwarzschild quantities assume an uncharged, non-rotating black hole. Hawking power and lifetime are idealized photon-only estimates. Object properties come from selected, source-dependent estimates. Accretion, light paths and other artistic renderings have separately labeled scope. |
| Entrolab | The two-chamber experiment counts binary marker assignments and their equilibrium probabilities. Its discrete steps have no physical time scale. The separate heat experiment models two internally uniform bodies with constant heat capacities and conductance in an isolated system. It omits radiation and phase changes. |
| Extemp-lab and Matter & Fields | The gas comparison uses the classical Maxwell–Boltzmann speed distribution for independent particles with representative argon mass from 30 to 3000 K. Material examples are reference values. The electric-field lesson uses an idealized point charge in vacuum. The photon and deuteron lessons work with system invariant mass and measured rest-mass differences. |
| Cosmic Explorer | Catalog layers are selected samples with coverage limits and distance uncertainties. Planet positions and local Galactic motion use bounded approximations. Published spacecraft and minor-body data have explicit time coverage. Trails, density views and heliosphere illustrations have separate display assumptions. |

## Audit and verification

- The [project-wide audit](https://github.com/phoscore/entrolab/issues/56) and [independent meta-audit](https://github.com/phoscore/entrolab/issues/56#issuecomment-7229759061) checked the release candidate at `6c3cd68fdb55bb43abb0245d0f31185d1e0d0077` and identified the corrections tracked in PR #57.
- The [first independent follow-up](https://github.com/phoscore/entrolab/pull/57#issuecomment-7242970558) identified five residual findings. The [final independent follow-up](https://github.com/phoscore/entrolab/pull/57#issuecomment-7243611318) verified all five closures at `48fcc6492c650d9a285bb1bf92754a943377a094` and found the documented teaching scope ready for release. The verified merge base for final versioning, `7f3ea846b774b4f4dca2a66cab7b3a48c82d0bdd`, has the same Git tree as that audited head.
- [Integration run #407](https://github.com/phoscore/entrolab/actions/runs/46170791708) on the audited head passed 313 Node tests, 175 Chromium tests, all 12 historical benchmarks and all six original-file checks. The final version PR carries its own CI evidence.

## Remaining verification limits

The audits used representative states and emulated mobile profiles. They did not include real mobile devices, physical assistive technology, a full manual matrix of states in both languages, formal WCAG conformance, or multi-hour memory and load tests. Chromium accessibility-tree and resource counters cover specific behaviors. They do not establish long-running memory, worker or GPU behavior on production hardware.

Astronomy checks sampled the archived source rows, state vectors and ephemerides. They did not repeat every external source query, certify catalog completeness or classification, or establish global numerical error bounds for real trajectories. Full editorial source review, legal review of all dataset licenses, a dependency CVE audit and a penetration test were outside the audited coverage.

Checks used the relevant CI runs and available historical reports, without independently replaying every historical artifact. Browser retry tests exercised Chromium’s HTTP cache and the stylesheet timeout. An indefinitely pending module import and Cloudflare edge response headers, cache keys and policies were outside that test coverage.
