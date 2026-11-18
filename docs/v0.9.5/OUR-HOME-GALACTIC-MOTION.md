# Our Home · Galactic Motion (Phase 2F-D)

In **Solar System → 3D spatial view**, choose **Galactic motion**. The default is a scale view of the Sun and eight planets. Switch to **Sun-centred** for the existing planetary ellipses. A Moon system button opens its existing Horizons view. Pluto and the moons use their existing views and data coverage.

- **Oblique**, **Across motion** and **Along motion** change the camera direction. Drag or use arrows to rotate, and pinch or use +/− to zoom. **Fit flight trails** frames the plotted interval and fixes the camera centre. **Follow Sun** tracks the Sun while the trails still depict earlier model positions in a fixed frame. **Inner planets** follows the Sun from a closer distance. **To the Sun** centres it once.
- The existing TDB clock offers pause, playback at 1/10/100 model days per real second, ±1-day steps and J2000.0 reset. Playback stops at the upper boundary and when the map loses visibility. Reduced Motion offers manual time controls. Direct calendar changes and reset translate the camera with the new solar position, preserving the framing across large date jumps. Switching frames pauses. Within the common window the date is preserved. Entering from an out-of-range date opens at J2000.0 with a notice. Returning at that epoch restores the previous date.
- Trails cover 30, 90, 180 or 365 model days (default 180). The beginning is clipped to the supported window. The Sun advances about 52 AU per Julian year transverse to much of the planetary orbital geometry. A few inner-planet tracks look almost coincident at full-system scale. Zoom in or select the inner planets to resolve them.
- **Schematic · planetary displacement ×3** triples all three displayed Sun-relative components at each sample epoch. The Sun's trajectory, the actual model and the inspector values keep their original scale. The scale bar is available in physical view and applies at camera focus depth. Body symbols are enlarged by default.

## Adopted frame and epoch

The following parameters are fixed to the named **Astropy Galactocentric `v4.0`** convention. The Galactocentric frame is parameterised, so the application pins this convention explicitly. The axes are right-handed: near the Sun, +X points approximately inward, +Y approximately in the direction of Galactic rotation and +Z approximately north of the Galactic midplane.

| Input | Value |
| --- | --- |
| ICRS Galactic centre (RA, Dec) | 266.4051°, −28.936175° |
| Astropy roll convention | roll 0°, intrinsic alignment 58.5986320306° |
| Distance to Galactic centre, height above the plane | 8,122 pc, +20.8 pc |
| Solar velocity (X, Y, Z) | (+12.9, +245.6, +7.78) km/s |
| Rotation from J2000 ecliptic into ICRS-aligned equatorial axes | fixed obliquity 84,381.448 arcsec |
| Epoch origin and closed time interval | JD 2451545.0 TDB (2000-01-01 12:00), 1970-01-01 through 2030-01-01 00:00 TDB |
| AU and day | 149,597,870.7 km, 86,400 s |

The velocity includes the Sun's bulk rotation about the Galaxy. A velocity relative to the local standard of rest or to another nearby star uses a different reference. Recent Sgr A* proper-motion estimates give azimuthal components near 250 km/s for some choices of Galactic-centre distance and solar velocity convention. The atlas uses the self-consistent named Astropy parameter set, whose vector norm is about 246 km/s. Sources: [Astropy convention and primary references](https://docs.astropy.org/en/stable/api/astropy.coordinates.Galactocentric.html), [Astropy transform](https://docs.astropy.org/en/stable/coordinates/galactocentric.html), [Reid & Brunthaler 2020](https://arxiv.org/abs/2001.04386), [Placing the Solar system in its astrophysical context, MNRAS 541 (2025)](https://doi.org/10.1093/mnras/staf1149).

Let `R` rotate ecliptic vectors by the JPL fixed obliquity into ICRS-aligned equatorial vectors, then apply Astropy's centre alignment, roll and height tilt. With active right-handed rotations and column vectors, the product is `Ry(tilt) Rx(-roll0) Ry(dec) Rz(-ra) Rx(obliquity)`. There is no epoch-dependent precession in the rendering. The plotted origin is a fixed translation to the Sun's **J2000.0** position. The model is evaluated in AU over a precision-friendly neighbourhood, without adding and subtracting a kiloparsec-scale offset each frame.

```text
r_sun(t) = v_sun [km/s] · 86400 [s/day] · (JD_TDB − 2451545.0) / AU_KM
r_planet(t) = r_sun(t) + R r_JPL(t)
v_planet(t) = v_sun + R v_JPL(t)
```

The input is the unchanged [JPL approximate planetary solution, Table 1](https://ssd.jpl.nasa.gov/planets/approx_pos.html), including the Earth–Moon barycentre. See the [Horizons fixed J2000 obliquity convention](https://ssd.jpl.nasa.gov/horizons/manual.html#ecliptic-of-standard-epoch-j2000-or-b1950). The common translation cancels in same-epoch comparisons. Rotation preserves separation, relative speed and radial speed. The inspector continues to calculate those observables and the explicitly J2000 ecliptic X/Y projection from the existing model.

## Accuracy and validity

The Sun moves along a local constant-velocity tangent. The smooth Galactic acceleration of the Solar System barycentre measured by Gaia EDR3 is about `(2.32 ± 0.16) × 10^-10 m/s²`. Thirty Julian years from J2000.0, the corresponding tangent truncation estimate `a Δt²/2` is about 104,000 km (0.00070 AU). An independent circular reference with radius 8.122 kpc and speed 246 km/s gives about 108,000 km. With a deliberately generous conditional Galactic acceleration envelope of `4 × 10^-10 m/s²`, the tangent truncation is below 180,000 km (0.0012 AU) and 0.38 m/s over the implemented interval. These estimates apply to omitted Galactic curvature. The solar velocity convention and parameter uncertainty, the Sun's motion about the Solar System barycentre, and JPL fit errors are separate. For scale, a 1 km/s velocity change alone would move the endpoint by about 6 AU. A long-term orbit integrator would need an adopted Galactic potential. Sources: [Gaia Collaboration, A&A 649 A9](https://doi.org/10.1051/0004-6361/202039734), [galpy](https://docs.galpy.org/en/stable/).

This local view concerns distances of tens of AU over a trail window. The Galactic centre distance is about 1.7 billion AU. A whole-Galaxy view would require a separate scale and model.

## Sampling, drawing and verification

Interior nodes are anchored to J2000.0 on one fixed cadence per body. The fastest of three cadences governs each body: 14 days, 6° of estimated peak orbital motion, and a 0.001 AU chord-deviation target using the peak Kepler acceleration and a 2% timestep margin for the slowly changing fit. Window start and current epoch are evaluated directly. The renderer clips segments against the near plane, orders strokes and body symbols by camera depth, and fades from the present to the configured trail age. It keeps one window in memory, reuses unchanged time nodes during playback and reprojects the same world points during paused camera interaction. Changing the display scale changes only the rendering coordinates. At 365 days the nine trails have a mathematical cap of 765 vectors. In 72,018 off-node checks at one-quarter, half and three-quarters of segments across 32 epochs, the largest measured chord deviation was 0.000961 AU (about 144,000 km). This is a rendering error within the approximation, distinct from physical uncertainty.

`tests/solar-galactic.test.mjs` compares the transform against Astropy 7.2.0, checks coordinate handedness, all body-pair distances and relative velocities, and differentiates composed positions independently. It checks sample identity, intermediate chord deviations, clipping, fitting and the effect of schematic view. Regenerate the reference vectors with Python and `astropy==7.2.0`:

```python
import numpy as np
from astropy import units as u
from astropy.coordinates import ICRS, Galactocentric, SkyCoord, galactocentric_frame_defaults

with galactocentric_frame_defaults.set("v4.0"):
    frame = Galactocentric()
    e = (84381.448 * u.arcsec).to_value(u.rad)
    x, y, z = np.array([[1,0,0], [0,1,0], [0,0,1], [.7,-2.3,1.9], [0,0,0]]).T
    source = SkyCoord(x=x*u.kpc, y=(y*np.cos(e)-z*np.sin(e))*u.kpc,
                      z=(y*np.sin(e)+z*np.cos(e))*u.kpc,
                      representation_type="cartesian", frame=ICRS())
    rows = source.transform_to(frame).cartesian.xyz.to_value(u.kpc).T
    print(rows[:-1] - rows[-1])
    print(frame.galcen_v_sun.d_xyz.to(u.km/u.s))
```

`tests/our-home-3d-browser.test.mjs` exercises Galactic mode at 1440/390/320 px, camera inputs, Reduced Motion, DE/EN, time controls, all playback rates, the date boundary, switching into a Horizons system and back, 100 mode/camera cycles, and zero paused redraws. The Chromium CI archive contains PNG screenshots (sun-centred references plus oblique, across, along and schematic views), observed readiness times, draw times, maximum sample counts and canvas backing-store byte estimates.

### Local Chromium sample

Headless Chromium 153.0.8010.0, one measured opening per viewport. Readiness is the click-to-settled-frame time, not a cold site load. Canvas bytes are width × height × 4 for one RGBA8 backing store.

| Viewport | Ready | Single draw | Stored samples, 180 / 365 days | Canvas |
| --- | ---: | ---: | ---: | ---: |
| 1440 px | 288 ms | 5.1 ms | 377 / 756 | 2.62 MiB |
| 390 px | 149 ms | 4.0 ms | 377 / 756 | 0.48 MiB |
| 320 px | 251 ms | 5.8 ms | 377 / 756 | 0.38 MiB |

In one-second playback samples at 1440 px, draw-time p95 was 4.4 ms at 1 day/s, 4.8 ms at 10 days/s and 7.2 ms at 100 days/s. The first two cases used a 180-day window and the last used 365 days, reaching 760 points. Chromium reported 4.83 MB of exposed JS heap before and 5.01 MB after 100 cycles and forced collection in the same page state. That sample includes unrelated page code and does not measure GPU allocations. The final 200 ms of paused observation added zero draws. No binary data was requested by the Galactic mode tests. The test archives repeat these measurements in CI.
