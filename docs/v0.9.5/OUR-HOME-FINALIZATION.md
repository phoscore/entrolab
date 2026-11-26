# Our Home · Finalization

[Free camera](FREE-CAMERA.md) documents the two observer modes, settings and scene boundaries. [Voyager](VOYAGER.md), [Moon Systems](MOON-SYSTEMS.md), [New Worlds](NEW-WORLDS.md), [Heliosphere](HELIOSPHERE.md) and [Beyond the Planets](BEYOND-THE-PLANETS.md) describe the underlying releases. Their original observation markers, time scales and packages remain versioned.

## Voyager trajectory forecast

A separate local package presents the Horizons prediction through **26 November 2027, 00:00 TDB**. The historical archive and its 1989 Voyager 2 discontinuity remain preserved. The regular Voyager time shortcut still offers the covered current calendar day or the last position in the historical archive, with a corresponding label. **Open JPL forecast** loads the extension on demand and opens an explicitly labelled forecast date. This is a precomputed trajectory even when a displayed date is later in the past. The historical trail is retained and forecast positions extend from its final sample.

Capture on 25 November 2026 from [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/manual.html), the existing geometric heliocentric J2000 ecliptic frame and TDB. The source names are Voyager_1_ST+refit2022_m, Voyager_2_ST+refit2022_m and DE441 (Earth centre). Position and velocity match exactly at the joint boundary in the original files. The extension uses daily nodes. There are 32 separate off-grid position and velocity checks per body. Maximum measured position residuals rounded upward are 0.012 m, 0.012 m and 87.101 m for Voyager 1, Voyager 2 and Earth. Corresponding velocity-vector residuals are under 0.000001 m/s for both spacecraft and below 0.003025 m/s for Earth. These numbers describe agreement with the same upstream model, not prediction uncertainty. The camera has no effect on the readouts or trajectories.

## Apophis

The 99942-series uses JPL#220 and extends the original series from 1 January to **1 May 2029, 00:00 TDB**. From 12 to 15 April it uses 10-minute samples in both heliocentric and geocentric frames. The remainder of the extension uses six-hour heliocentric samples. The archived geocentric series refers directly to Horizons Earth target centre 399. In this encounter interval the displayed heliocentric Earth-centre vector is computed as Sun-to-Apophis minus Earth-to-Apophis. The inspector's range is the norm of the geocentric vector. The height is relative to a deliberately spherical surface of radius 6,371 km. The other planet context uses the existing JPL approximation. In the near encounter view, the Earth marker is labelled and the Apophis trail shows only the dense heliocentric interval from 12 to 15 April. Earth is displayed at the selected epoch. The existing orbital-arc fit still shows the full heliocentric arc at overview scale.

The event button opens the minimum found by bracketing the sign change of **r·v** around the smallest dense-grid distance and applying bisection to the Hermite vectors. It occurs at about **21:46 TDB on 13 April 2029**, with a modelled distance about **38,011 km from the Earth centre**, or **31,640 km** above the stated sphere. NASA reports approximately 32,000 km above the surface. Independent vector requests include 35 separate epochs for each frame, with offsets as short as a minute around the computed event and a direct query at the event. The largest sampled residuals were <9.27 m and <0.044 m/s. These are interpolation checks. A published alternative orbital fit reports 38,011.8 ± 1.6 km (formal 1σ), which illustrates the distinction from interpolation error. No formal uncertainty for JPL#220 is inferred from those numbers. [NASA](https://science.nasa.gov/solar-system/asteroids/apophis/) · [Published alternative solution](https://doi.org/10.1038/s43247-021-00337-x).

## Offline verification

```sh
node scripts/our-home-ephemerides.mjs --check
```

The command verifies gzip and original response digests, queries and source labels, frames and timestamps, sample residuals and bytes of the two released packages and runtime pin module against the archived snapshots. The optional `--capture` mode makes serial source calls and is for preparing a source refresh. It is not part of an offline build. Runtime checks exact lengths and hashes before decoding same-origin additions and rejects invalid or out-of-range series. The previous history packages have their own integrity commands and remain usable when an optional extension fails.

See [Draft PR #47](https://github.com/phoscore/entrolab/pull/47) for the exact-head test evidence, native Chromium capture review, and the independent audit. The work preserves the current Canvas renderer. The planned larger catalogue, expanded 3D exploration and the project-wide polish pass remain separate work.
