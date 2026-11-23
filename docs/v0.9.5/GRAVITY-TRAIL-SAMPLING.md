# Gravity Sandbox trail sampling

The original Gravity Sandbox recorded a position every third rendered frame. At high time acceleration, consecutive points could land on far-apart phases of the same orbit. Reproduction and earlier timing measurements are in [Issue #15](https://github.com/phoscore/entrolab/issues/15) and [Lean Polish](LEAN-POLISH.md#gravity-trail-reproduction-and-follow-up).

The renderer now reads the position and velocity after each successful existing integration step. It keeps a real intermediate position before the accumulated arc would exceed 0.06 AU or 12 CSS pixels at the recording scale, the heading changes by about 3.7 degrees, or eight model days pass. A single oversized step, an abrupt velocity turn over about 7.4 degrees, or a missing time span starts a new subpath. A later zoom also breaks a recorded chord that would span over 24 CSS pixels. The last observed position is available immediately as the trail endpoint. There are no fitted curves or interpolated positions.

Each body has a ring capped at 1,024 recorded samples plus one pending endpoint, with approximately constant insertion work. Existing limits of 60 bodies and 800 steps per frame bound the sampler to 48,000 observations and the renderer to 61,500 trail positions per draw. These are counts of objects and operations, since actual JS heap usage varies by runtime. Drawing a paused view does not schedule a trail update. Reset, collision or an edit discard old trails through the existing rebase path. Changing playback rate changes how many steps ran since the previous draw.

## Reproduction and verification

The Chromium test loads the pinned baseline app module and the branch app in separate browser contexts. The test delivers identical animation timestamps, switches from roughly 30 to 1,000 model days per second and back, and compares every non-trail body field at all three checkpoints. The fast checkpoint reaches about 580 model days, covering about six Mercury and two Venus orbits. The single most recent recorded position or rendered timestamp is not a new integration step. The local numerical test independently follows real step states over more than 2,500 model days, checks sample provenance and bounded storage, and compares the complete model states and energy. Additional tests exercise collision lifecycle, missing paths, and the draw limit after zoom.

Local Chromium 151 at 80 CSS px/AU measured these longest connected chords for Mercury and Venus respectively. Desktop and emulated mobile produced the same positions.

| Body | Before | After |
| --- | ---: | ---: |
| Mercury | 0.757 AU | 0.029 AU |
| Venus | 0.931 AU | 0.051 AU |

In that local run the full simulated frame callback (integration, diagnostics and Canvas calls) measured a 95th percentile of 1.9/1.6/1.4 ms before and 1.3/1.4/1.3 ms after at 1440/390/320 px. The measurements are brief and include CPU submission time, not a GPU or native mobile benchmark. All three ran with zero Gravity callbacks in the paused probe. The displayed drift at the fast checkpoint matched at about 1.03 × 10⁻⁹%, with no step limit indicated in that scenario. The 12 historical physics benchmark results match exactly. This measurement concerns the reproduced path and cannot rule out integration issues in unrelated configurations.

The browser test writes paired Canvas PNGs at 1440, 390, and 320 px plus the raw metrics. Look for gravity-trails-* in the Chromium review archive attached to GitHub Actions.
