# Our Home · Voyager beyond the heliopause (Phase 2F-E1)

Open **Cosmic Explorer → Our Solar System → Voyager · 3D**. The view uses the existing local orbit camera at a mission-wide AU scale. Select either probe from the object list to centre it or choose a date on its mission timeline. The Sun and Earth centre are reference markers. The return button restores the previous Solar System view, epoch, selection and camera. The historic flyby geometry is seen on Solar System scales. Planetary radii or close-approach distances should be read from the NASA mission sources. The diagram uses symbolically enlarged markers and models no heliosphere surface.

## Archived source and frame

Release `v0.9.5-voyager-1977-2026.1` was acquired on 24 November 2026 from the [JPL Horizons vector API](https://ssd.jpl.nasa.gov/api/horizons.api). The returned headers verified Voyager 1 spacecraft (`-31`), Voyager 2 spacecraft (`-32`), and Earth centre (`399`). All series use the centre of the Sun (`500@10`), ICRF with the J2000 ecliptic reference plane, geometric vectors (`VEC_CORR=NONE`), TDB Julian days, km and km/s. The probes use `Voyager_1_ST+refit2022_m` and `Voyager_2_ST+refit2022_m`; Earth uses DE441. The Earth–Moon barycentre from the old planet view is a separate model and is not used here.

| Series | First covered TDB date (00:00) | Last covered TDB date (00:00) | Samples | Independent off-grid epochs | Largest position residual | Largest velocity-vector residual |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Voyager 1 | 1977-09-06 | 2026-11-26 | 4,500 | 62 | 0.985 km | 1.032 m/s |
| Voyager 2 | 1977-08-21 | 2026-11-26 | 5,044 | 104 | 5.981 km | 0.294 m/s |
| Earth centre | 1977-08-21 | 2026-11-26 | 8,998 | 20 | 1.099 km | 0.022 m/s |

Maxima rounded upward. The capture compares interpolated position and analytic Hermite velocity with original states requested separately via `TLIST`. They bound the observed residuals in the test set. Uncertainty in the trajectory fitted by Horizons is separate. Probe sampling uses eight days in cruise, two days in the early transfer arcs, and six or one hour around launches and flybys. Earth uses two days. Final partial intervals use shorter steps.

An independent comparison revealed a trajectory discontinuity in the returned Voyager 2 source after the Neptune encounter. A supplemental five-minute Horizons export verified a ~13,362 km discrepancy across the bracket **1989-08-29 08:00–08:05 TDB**, after accounting for linear displacement. The reason for the source discontinuity is undetermined. The browser keeps the two verified endpoint states and returns unavailable within the open interval. The trail breaks at that bracket. This does not establish a physical impulse or probe behaviour.

The current-date shortcut uses **00:00 TDB** on the current UTC calendar date within the archived interval. Past the last release date it explicitly opens the final available epoch. It is a dated numerical ephemeris and is never presented as live telemetry. Historical event dates are UTC calendar dates from [NASA Voyager 1](https://science.nasa.gov/mission/voyager/voyager-1/) and [NASA Voyager 2](https://science.nasa.gov/mission/voyager/voyager-2/). The Voyager 2 Saturn date uses 26 August UTC from the [JPL mission support report](https://ipnpr.jpl.nasa.gov/progress_report/42-66/66E.PDF). The 5 November 2018 heliopause date follows the [NASA crossing announcement](https://science.nasa.gov/missions/voyager-program/nasas-voyager-2-probe-enters-interstellar-space/). Jumping to an event opens 00:00 TDB on that day. The button does not imply the precise time of an encounter.

Earth distance is simultaneous geometric Earth-centre separation. The displayed speed is the norm of the heliocentric velocity vector. One-way signal time is Earth distance divided by the exact speed of light. Light-time-corrected reception epochs and propagation effects are outside this estimate. For 2026-11-24 00:00 TDB the computed Sun and Earth distances are about 172 and 173 AU for Voyager 1, and 145 and 145 AU for Voyager 2. These give approximate one-way times of 24.0 and 20.1 hours.

The [heliosphere](https://science.nasa.gov/mission/voyager/interstellar-mission/) is the domain shaped by the solar wind. The heliopause marks its contact with the interstellar medium. NASA identifies crossings by Voyager 1 in 2012 and Voyager 2 in 2018. The wider Solar System includes distant gravitationally associated objects such as those in the Oort Cloud.

## Offline build and runtime integrity

```sh
python3 scripts/voyager-capture.py      # strictly for capturing or restoring original API responses
node scripts/voyager-build.mjs --build # network-free reproduction from archived responses
node scripts/voyager-build.mjs --check # independently queried residuals, provenance and byte-for-byte outputs
node --test tests/voyager.test.mjs
```

The raw manifest records the exact request URL, returned identifiers and source labels, SHA-256 of each response and its gzip archive. The production manifest records package digests and the validation results. Browser code pins the SHA-256 and exact sizes independently of that manifest. It streams the same-origin packages through the same bounded reader as the moon ephemerides, validates digests before decoding and rejects wrong identity, layout, coverage or non-finite values. Failure hides probe geometry and readouts and offers a retry. Successful packages are reused within the mounted view. There are no browser calls to Horizons.

The `VOY1` format stores target ID, record count, and increasing epoch + six state components as little-endian Float64 payload. The two trails each have at most 1,100 points, drawn from model-time samples with three-hour spacing near flybys. Camera rotation and zoom use the existing perspective projection and do not affect measurement. The dormant tab, paused view and Reduced Motion reuse the existing rendering lifecycle.

Sources: [Horizons API specification](https://ssd-api.jpl.nasa.gov/doc/horizons.html), [Horizons manual](https://ssd.jpl.nasa.gov/horizons/manual.html), [JPL SSD data and attribution terms](https://ssd.jpl.nasa.gov/faq.html), [NASA Voyager fast facts](https://science.nasa.gov/mission/voyager/fast-facts/). JPL raw exports are archived as supplied. The compact binary and sampled trails are derived products. NASA/JPL endorsement is not implied.
