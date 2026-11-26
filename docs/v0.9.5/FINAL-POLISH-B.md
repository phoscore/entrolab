# Final Polish B – Physics for Everyone

Scope: [Issue #49](https://github.com/phoscore/entrolab/issues/49). Baseline: merge of Phase A at `6e0a207971363cd87c20af1dae2c0107f9558b6e`.

## Entrolab

Every integer from 1 through 512 is supported. The preset buttons cover 8, 16, 32, 64, 128, 256 and 512. Up to 32 markers retain individual numbers. Larger chambers display filled fractions and exact left/right counts, including fully occupied and empty states. The microstate disclosure exposes the complete ordered marker sequence. The distribution shows all equilibrium states in one line and exposes the selected k as an exact integer row. Rounded metrics use scientific notation where useful.

The model is N distinguishable binary markers. Each switches chambers independently with probability 1/4 per step. Its equilibrium law is binomial with p=1/2. This law differs from the distribution conditional on the current state and the next step. One BigInt recurrence constructs all N+1 coefficients in O(N) coefficient updates. Only probabilities and logarithms use binary64. At N=512 all coefficients remain below the binary64 overflow range and both tails are 2⁻⁵¹² ≈ 7.46 × 10⁻¹⁵⁵. Ω and 2ᴺ remain exact integers. Larger populations would require an additional UI and numerical acceptance pass. This discrete experiment does not resolve molecular motion.

## Learning

The glossary has 29 simple bilingual explanations and the six model chapters have corresponding plain-language entries. The original advanced material, source links and glossary targets remain available. The new optional question panels cover all eight main labs. The six existing prediction interactions keep their original behavior. The new questions store only a selected radio answer and leave experiments alone.

Matter & Fields adds a test position and an electric point charge with adjustable sign and magnitude. The point-charge model uses E = kq r̂/r², in vacuum. Inputs are nanocoulombs and metres, outputs newtons per coulomb. A dashed disk marks the excluded idealized near region below 0.2 m. The fixed-length arrow gives direction, and the numeric magnitude gives strength. The panel also covers field excitations, photon energy and momentum, binding energy, and the scheme dependence of QCD mass decompositions. See [OpenStax, Electric Field](https://openstax.org/books/university-physics-volume-2/pages/5-4-electric-field) and [CERN, Standard Model](https://home.cern/science/physics/standard-model).

Singularities separates causal horizons from incomplete free-fall and light paths and distinguishes ideal Schwarzschild and Kerr interiors. Quantitative black-hole calculations are unchanged. See [Einstein Online, Black Holes](https://www.einstein-online.info/en/spotlight/black-holes/).

The eight observed references are Gaia BH1, Sirius B, RX J1856.5−3754, Luhman 16B, Betelgeuse, 4U 0142+61, WR 111 and the Sun. The disclosure identifies published estimates, approximate distances and source-specific properties separately from the illustration above it. The sources are linked with each example in `dist/polish-b-references.mjs`. Different distance analyses for objects with model-dependent estimates can give different results.

Extemp-lab labels the existing two-chamber classical argon demonstration with a comparison of mean translational energy in joules per particle, plus the distinction between three-dimensional speed and the displayed components. Both curves share a speed axis and may overlap. Classical gas assumptions have a limited domain, and the scale still handles temperatures outside it as references only. The 0.1 K preset shows a Null aside in both languages. See [OpenStax, Distribution of Molecular Speeds](https://openstax.org/books/university-physics-volume-2/pages/2-4-distribution-of-molecular-speeds).

## Verification

The standard Node suite adds checks for all marker counts, exact tails, electrostatics, explanation coverage and reference identities. The Chromium suite takes snapshots of the desktop learning and experiment panels and both mobile widths. It checks actual gas and marker playback, sign reversal and the excluded field region. Its performance report samples seven marker counts at 1440, 390 and 320 CSS px, at 4× CPU slowdown on the mobile viewports. The report records the 90th percentile calculation, synchronous update including forced layout, and two-animation-frame interval. DOM node and listener counts after forced collection are proxies for retained resources. Mobile results use Chromium touch emulation.

Explorer rendering, release/version work, and further Null changes belong to Phase C.
