# Final Polish C · Explorer & Release Preparation

[Issue #50 and its four comments](https://github.com/phoscore/entrolab/issues/50) define the scope. The implementation starts at `d55bfe889c3bf4ae453fd1a03bd62c66666d1234`. [Phase A](FINAL-POLISH-A.md), [Phase B](FINAL-POLISH-B.md) and [Our Home finalization](OUR-HOME-FINALIZATION.md) contain the preceding changes.

## Stellar Neighborhood

Orbit is the starting camera. Free camera beside the fit and centring buttons enables WASD translation, Q/E vertical movement, arrow-key look and direct drag. The six direction buttons accept touch or mouse holds and short keyboard steps. The selected speed setting follows the stellar camera. The unit selector converts the displayed rate between pc and light years per real second. Sun, overview and selection actions reposition the current camera type. Switching back to Orbit places the focus forward along the current view at the prior depth, subject to the 0–2.4 zoom interval at the current viewport aspect ratio.

The solar and stellar views use the same orthonormal basis, perspective transform, motion bindings and elapsed-time limit of 80 ms. Stellar inputs and projection stay in the existing Sun-centred Galactic XYZ frame in parsecs. The reference-depth speed multiplier is 0.16 at the central setting. The 17 slider levels change this by factors of square root of ten before limits of 0.0001–50 pc per real second. Position components are bounded to ±1,000 pc. The free near plane is 2.5% of reference depth clamped between 0.001 and 0.05 pc. The Sun-to-selection segment can be clipped there. The focus-depth scale bar appears in Orbit. The free-camera glyph uses the camera basis, and observer status gives the Galactic XYZ coordinates and look direction. Catalogue positions, all 2,753 Gaia identifiers, estimated distance posteriors, J2016.0 and the existing 1,050/2,200 marker budgets stay tied to the same published release.

Frame scheduling reuses the existing invalidation queue. Held controls request movement frames until release, offscreen exit, focus loss or navigation. Camera changes have immediate effect and work with Reduced Motion. The motion controls are hidden in Orbit. At observer locations with few visible stars, use Overview or Sun to restore orientation.

## Lab shell

Each header reads as a title, accented Null tagline, one thematic disclosure and a short lead. A contextual help action follows immediately below it. Seven labs link to the appropriate existing glossary target. Cosmic Explorer explains the difference between recorded direction and estimated position with its own short disclosure, simpler explanation and source link. Its heading and questions are mounted independently of loading, changing or retrying map modes.

All twelve Phase B questions retain their choices, feedback and scientific assumptions. Four existing predictions are already in their lab headers. In Entrolab the marker question leads the header and the added heat question stays with the thermal model. The two pre-existing experiment questions give Entrolab four across its two experiments. Each other lab offers two. The upper duplicate Extemp-lab shortcut is removed while the main navigation retains the original link. Each lab with decimal inputs shares one small hint at its first relevant numeric input group. The original parsing and validation rules apply. Integer marker input retains its nearby count instructions.

The old pause clip polygon connected the two bars through one path. Two painted bars with a clear central gap represent running. Paused control paint uses a triangle. Disabled illustration controls use a muted horizontal mark. Existing language keys for actions, the 44 px hit area, keyboard focus and playback choices are retained.

## Backlog and evidence

- #20: Observer context, categories, representative object labels, source coverage and reset controls are available. The all-sky design expansion remains a separate future effort.
- #24: Existing Our Home, Voyager archive and 2027 forecast, Apophis encounter, moons, minor bodies, galactic context and heliosphere keep their dedicated mode and ephemeris tests.
- #30: The stellar spatial map remains a single 3D perspective with Orbit and Free cameras. Source IDs and positional estimates remain the same.
- #32: Compare the all-sky and local screenshots with the existing Gaia and DESI coverage and transition regressions. Catalogue edges and the Canvas border have distinct roles. This phase adds no decorative catalogue sources.
- #41: Initial in-range moon epoch, object labels and Null’s existing motion policy are retained and tested by the prior regression suites.

The visible app version is **v0.9.5 RC** in both languages. Data package IDs, historical fixture versions and scientific archive pins retain their own meaning. The browser loads the same static module graph as before. The candidate can proceed to the explicitly separate project-wide audit after review.

The Node suite covers stellar coordinate transforms, independent aim, pose preservation, clipping and bounds. Native Chromium checks navigation, lab layout and local hints, playback symbols, active movement and rotation, 100 camera switches, and exact accessible names and hidden/exposed marker content at N=512. Chromium Accessibility domain data verifies the accessibility tree. This evidence has no Windows screen-reader playback component. Mobile widths use Chromium touch emulation.

The Chromium artifact includes the presentation evidence at 1440, 390 and 320 CSS px and `polish-c-performance.json`. It records 12 samples of measured JS drawing duration and two animation-frame intervals after input in each camera mode. The latter includes refresh intervals and runner contention. The mobile profiles use 4× CPU slowdown. Resource indicators are the packaged array bytes, Canvas backing-store estimate and Chromium node/listener counts after collection. Link final run and reviewed head from the draft PR.
