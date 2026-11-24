# Extreme Objects · Spectacle & Sun

The Sun joins the seven previous exhibits as a G2 V reference star. The stage now keeps a short explanation directly below each illustration and expands the scale and rendering assumptions on request. The black-hole exhibit pairs its optional accretion artwork with the existing Schwarzschild coordinate diagram and links to the Black Hole Lab for calculations about the horizon and tides.

## Solar reference

| Quantity | Adopted value | Basis |
| --- | ---: | --- |
| Radius | 695,700 km | IAU nominal solar radius |
| Mass | 1 M☉, approximately 1.988 × 10³⁰ kg | Existing application solar mass constant, in agreement with the rounded NASA reference |
| Mean density | Approximately 1,410 kg/m³ | Spherical average derived from this mass and radius, rounded to agree at the displayed precision with NASA’s 1,408 kg/m³ |
| Effective temperature | 5,772 K | IAU nominal effective temperature |
| Surface escape speed | Approximately 618 km/s | NASA tabulation, cross-checked against √(2GM/R) |

The photosphere is the layer from which most visible sunlight escapes. Its outward brightness decreases near the limb, where the line of sight samples shallower, cooler layers. Small-scale convection gives it bright granular cells and darker lanes. The display introduces a few illustrative spots with darker umbrae and wider penumbrae. Granules and spots are enlarged for legibility. The warm palette, contrast and animated drift illustrate the surface and carry no wavelength, timing, observation date or activity forecast.

[NASA NSSDCA Sun Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html) · [IAU 2015 Resolution B3](https://arxiv.org/abs/1510.07674) · [NSO/DKIST first light](https://nso.edu/telescopes/dkist/first-light-full-image/) · [NASA Marshall photosphere](https://solarscience.msfc.nasa.gov/surface.shtml)

## Exhibit illustrations

| Object | Characteristics shown | Rendering limits |
| --- | --- | --- |
| Luhman 16B | Dark patchy clouds, quieter bright patches and broad bands on a projected sphere | False-colour thermal infrared impression. The bands define no measured cloud positions or velocities. [Crossfield et al.](https://doi.org/10.1038/nature12955) |
| Betelgeuse | Broad, irregular warm and dark regions with finer texture | Illustration of large-scale convection on a normalised disc. The image gives no photospheric temperature map or convection period. [ALMA](https://www.almaobservatory.org/en/audiences/alma-reveals-long-lived-hotspots-on-betelgeuses-bubbling-surface/) |
| 4U 0142+61 | A compact disc and a tilted dipole rotating about the dashed axis | Projected field geometry, with illustrative line spacing, orientation, colour, pole mark and speed. The surface disc indicates the generic stellar model. [McGill Magnetar Catalog](https://www.physics.mcgill.ca/~pulsar/magnetar/v201117/main.html) |
| WR 111 | A bright inner modelling boundary surrounded by a diffuse wind with outward-moving filaments | The filaments convey an outflow. Their shapes and apparent speed carry no measurements. The numerical reference radius is defined at τ = 20 within the wind model. [Gräfener & Hamann](https://arxiv.org/abs/astro-ph/0410697) |
| Black hole | Inclined, asymmetric disc illustration alongside the existing optional geometry view | The silhouettes and brightness are artistic. The geometry view reports coordinate radii for the Schwarzschild case. |

The linear and logarithmic comparisons use the same radii as before for the original seven entries. The Sun enters at one solar radius between the WR 111 model boundary and Betelgeuse at the default black-hole mass. The displayed radius convention for each object remains visible. Screen discs have separate display scales.

## Rendering and verification

Canvas 2D uses three lazy, fixed-size 512 × 256 surface maps and a reusable projected bitmap with a maximum side of 256 px. The decorative backdrop uses a single cached bitmap per canvas. The wind draws its static haze and background filaments into that bitmap, with at most 28 animated filaments per frame. Rendering targets up to 30 draws/s on desktop and 20 draws/s at widths up to 600 px. Pause, document visibility and offscreen handling cancel the animation loop. Reduced Motion starts paused and continues to offer explicit playback.

The Node checks cross-check solar reference values, finite accretion-disc geometry across supported angles and zoom values, and existing model invariants. Chromium checks the eight exhibits, DE/EN, keyboard navigation to the Black Hole Lab, both radius scales, Reduced Motion, pause, offscreen handling and horizontal fit at 320, 390 and 1440 CSS px. The before/after screenshots use the same version of Chromium and the pinned base `7f2af9ee36c912c6bca2aa3d9e9e3362421a73cc`.

Local headless Chromium measurements sampled one second per scene after 300 ms of warm-up, with Reduced Motion and explicit playback to isolate the exhibit from the background. Desktop used DPR 1 at full CPU speed. The narrow viewports used DPR 2 and 4× CPU throttling. P95 is the synchronous canvas paint duration as reported by the app. CDP task time also includes other page work. These figures describe the test browser and host.

| CSS width | Sun draws/s | Sun P95 paint | Sun tab task time/s | WR 111 tab task time/s, before → after |
| ---: | ---: | ---: | ---: | ---: |
| 1440 px | 30 | 0.8 ms | 41 ms | 20 → 37 ms |
| 390 px | 20 | 2.1 ms | 103 ms | 43 → 95 ms |
| 320 px | 20 | 2.0 ms | 89 ms | 47 → 96 ms |

The softer WR 111 wind raises the measured tab cost. Betelgeuse’s tab cost fell from 108 to 46 ms/s on desktop and from 142 to 95 ms/s at 390 px. The screenshot archive includes the raw measurements for the paired scenes.
