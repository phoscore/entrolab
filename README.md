# Reincarnated as a Proton

**Entrolab** is a bilingual, interactive physics and astronomy learning project by cosmic insignificance. It puts explicit models, their assumptions, and their limits beside the visualizations.

**Current state: v0.9.5 RC.** The public site is [entrolab.pages.dev](https://entrolab.pages.dev/); the public source repository is [github.com/phoscore/entrolab](https://github.com/phoscore/entrolab).

## Run the site

The application is static and has no build step or backend. Serve the `dist` directory over HTTP so ES modules and module workers work:

```sh
git clone --branch main https://github.com/phoscore/entrolab.git
cd entrolab
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

On Windows, use `py` if `python` is not available. Open <http://127.0.0.1:8000>. Do not open `dist/index.html` with `file://`.

The calculations, data packages, and fonts used by the page are served locally; normal use does not require a third-party font service or an internet connection. External reference links need a connection when opened.

## The eight areas

- **Gravity Sandbox** — edit and place bodies in a two-dimensional Newtonian model; inspect energy, momentum, angular momentum, and bounded short forecasts.
- **Singularities (Black Hole Lab)** - explore Schwarzschild radius, Hawking temperature, idealized photon power, and lifetime estimates.
- **Extreme Objects** — compare selected astrophysical examples and explore clearly labeled illustrative renderings.
- **Entropy Lab** — two separate lessons: a stochastic two-chamber model with **1–512 distinguishable markers**, and an isolated two-body heat-transfer model.
- **Extreme Temperature Lab** — explore Kelvin and Celsius values, selected material data, and temperature scales without turning those examples into a material-phase solver.
- **Matter & Fields** — inspect a small, idealized electric-field model and its source charges.
- **Cosmic Explorer** — explore the selected sky catalogs, stellar neighborhood, solar-system states, and spacecraft trajectories.
- **Model & Sources** — read model assumptions, references, source records, and run the page's isolated self-checks.

The interface is available in German and English. At more than 32 Entropy markers, the distribution is aggregated for display; the model still supports up to 512 marker assignments.

## Scientific models and limits

- **Gravity:** pairwise Newtonian gravity in a plane, with AU, solar masses, and days; adaptive Velocity Verlet and Plummer softening `ε = 10⁻⁷ AU`. Contacts merge as perfectly inelastic collisions. The model has no general relativity, tides, material response, or guaranteed integration-error bound; large steps can miss a contact. Inspector edits and new placements retain the mass domain `10⁻¹⁵–10¹¹ M☉`, limit each coordinate to `|x|, |y| ≤ 3.52×10⁶ AU`, and limit total speed to `0.01 c`. At the coordinate limit, binary64 spacing stays below 1% of the force-softening length; at `0.01 c`, the first relativistic corrections are of order `10⁻⁴`. These broad input bounds do not limit the regular solar-system and stellar scenarios.
- **Black holes and extreme objects:** the black-hole calculator assumes an uncharged, non-rotating Schwarzschild hole. Hawking power and lifetime are idealized photon-only estimates without greybody factors, extra particle species, or accretion. Selected stellar and compact-object values are examples with source-specific uncertainties, not new fits to the underlying literature. Illustrations are not general-relativistic or emission simulations.
- **Entropy:** the particle model counts `Ω(k) = C(N,k)` and displays `S/k_B = ln Ω`, a dimensionless Boltzmann model entropy for the coarse macrostate. Each discrete step independently switches each marker with probability `q = 1/4`; the step rate is a presentation choice, not physical time. This is not a gas trajectory or a heat-flow model.
- **Heat transfer:** two internally uniform bodies exchange heat in an isolated pair with constant heat capacities and constant conductance. The teaching domain is 250–600 K, `C = 1–10⁶ J/K`, and `G_th = 0.001–1000 W/K`. There are no phase changes, radiation, work, external losses, temperature-dependent capacities, or internal gradients. Small changes can fall below the displayed temperature precision while the analytical heat flow remains nonzero.
- **Matter & Fields:** the field view is a simplified electrostatic model; it is not a plasma, quantum-field, or material-response simulation.
- **Cosmic Explorer:** published catalogs are selected, versioned samples, not complete surveys. Distances and classifications retain their documented uncertainty and selection limits. Planet positions use a documented approximation over its stated interval, not Horizons precision. Galactic motion is a local linear tangent approximation, not a long-term orbit. Voyager data are bounded by their published time coverage.

All scientific colors and diagrams follow their own model meanings; decorative artwork is identified separately. Historical documents under `docs/` describe the version named in each document and do not replace the current product limits above.

## Development checks

Node and npm are needed for development checks, not for normal site use. The browser suite uses Playwright with Chromium.

```sh
node scripts/test.mjs
node scripts/check-benchmarks.mjs
node scripts/verify-original.mjs
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install chromium
npm run test:browser
```

The Explorer data and its reproducible offline builds are checked with the scripts in `scripts/`; the source pins, licenses, and known limits are documented under `docs/v0.9.5/`.
