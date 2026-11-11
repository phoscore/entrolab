// Read-only, model-scoped content registry. No DOM, solver, RNG or network calls.
function freeze(value){if(value&&typeof value==='object'){for(const v of Object.values(value))freeze(v);Object.freeze(value)}return value}
export const sources=freeze({
  "newton": {
    "publisher": "OpenStax",
    "title": "University Physics 1 · 13.1 Newton’s law",
    "url": "https://openstax.org/books/university-physics-volume-1/pages/13-1-newtons-law-of-universal-gravitation",
    "section": "13.1",
    "kind": "textbook",
    "checked": "2026-11-09"
  },
  "orbits": {
    "publisher": "OpenStax",
    "title": "University Physics 1 · 13.4 Satellite orbits and energy",
    "url": "https://openstax.org/books/university-physics-volume-1/pages/13-4-satellite-orbits-and-energy",
    "section": "13.4",
    "kind": "textbook",
    "checked": "2026-11-09"
  },
  "jpl-au": {
    "publisher": "NASA/JPL",
    "title": "Astronomical unit",
    "url": "https://ssd.jpl.nasa.gov/glossary/au.html",
    "section": "AU definition",
    "kind": "institution",
    "checked": "2026-11-09"
  },
  "si": {
    "publisher": "NIST",
    "title": "SP 330 · The International System of Units",
    "url": "https://www.nist.gov/pml/special-publication-330/sp-330-section-2",
    "section": "2.3.1; kelvin, Celsius and defining constants",
    "kind": "standard",
    "checked": "2026-11-09"
  },
  "bh-anatomy": {
    "publisher": "NASA",
    "title": "Anatomy of a black hole",
    "url": "https://science.nasa.gov/universe/black-holes/anatomy/",
    "section": "Event horizon / accretion / shadow",
    "kind": "institution",
    "checked": "2026-11-09"
  },
  "hawking": {
    "publisher": "AEI / Einstein Online",
    "title": "Hawking temperature",
    "url": "https://www.einstein-online.info/en/explandict/hawking-temperature/",
    "section": "Schwarzschild temperature",
    "kind": "institution",
    "checked": "2026-11-09"
  },
  "jila": {
    "publisher": "JILA / Andrew Hamilton",
    "title": "Hawking radiation",
    "url": "https://jila.colorado.edu/~ajsh/courses/bh/hawk.html",
    "section": "Temperature formula; illustration caveat",
    "kind": "lecture",
    "checked": "2026-11-09"
  },
  "schwarzschild-orbits": {
    "publisher": "Goethe-Universität Frankfurt / M. Hanauske",
    "title": "Schwarzschild: ISCO & Photonensphäre",
    "url": "https://itp.uni-frankfurt.de/~hanauske/VARTC/2026/python/GeodSchwarzschildIII/GeodSchwarzschildIII.html",
    "section": "Teil III",
    "kind": "lecture",
    "checked": "2026-11-09"
  },
  "stellar-types": {
    "publisher": "NASA",
    "title": "Stars: types",
    "url": "https://science.nasa.gov/universe/stars/types/",
    "section": "White dwarfs / neutron stars",
    "kind": "institution",
    "checked": "2026-11-09"
  },
  "nicer": {
    "publisher": "Miller et al. / NASA NTRS",
    "title": "The Radius of PSR J0740+6620 from NICER and XMM-Newton Data",
    "url": "https://ntrs.nasa.gov/citations/20210026095",
    "section": "2021 · radius constraints, not a universal fixed radius",
    "kind": "research",
    "checked": "2026-11-09"
  },
  "statmech": {
    "publisher": "P. Eastman / Stanford",
    "title": "Statistical description of physical systems",
    "url": "https://web.stanford.edu/~peastman/statmech/statisticaldescription.html",
    "section": "2.1–2.3 · microstates, macrostates, multiplicity",
    "kind": "lecture",
    "checked": "2026-11-09"
  },
  "heat-entropy": {
    "publisher": "OpenStax",
    "title": "University Physics 2 · 4.6 Entropy",
    "url": "https://openstax.org/books/university-physics-volume-2/pages/4-6-entropy",
    "section": "Reversible path and entropy as a state function",
    "kind": "textbook",
    "checked": "2026-11-09"
  },
  "thermodynamics": {
    "publisher": "P. Eastman / Stanford",
    "title": "Thermodynamics",
    "url": "https://web.stanford.edu/~peastman/statmech/thermodynamics.html",
    "section": "5.2 · energy and entropy laws",
    "kind": "lecture",
    "checked": "2026-11-09"
  },
  "foundations": {
    "publisher": "Stanford Encyclopedia of Philosophy",
    "title": "Philosophy of Statistical Mechanics",
    "url": "https://plato.stanford.edu/entries/statphys-statmech/",
    "section": "Foundations, irreversibility and recurrence",
    "kind": "reference",
    "checked": "2026-11-09"
  },
  "physics-code": {
    "publisher": "ENTROLAB",
    "title": "physics.mjs",
    "url": "physics.mjs",
    "section": "Implementation / not an independent scientific source",
    "kind": "implementation",
    "checked": "2026-11-09"
  },
  "marker-code": {
    "publisher": "ENTROLAB",
    "title": "entropy.mjs",
    "url": "entropy.mjs",
    "section": "Implementation of exact counting and q=1/4",
    "kind": "implementation",
    "checked": "2026-11-09"
  },
  "thermal-code": {
    "publisher": "ENTROLAB",
    "title": "thermal-physics.mjs",
    "url": "thermal-physics.mjs",
    "section": "Implemented model and strict domains",
    "kind": "implementation",
    "checked": "2026-11-09"
  },
  "openstax-applications": {
    "publisher": "OpenStax",
    "title": "Physics · Applications of Thermodynamics",
    "section": "12.4 · heat engines, heat pumps and refrigerators",
    "url": "https://openstax.org/books/physics/pages/12-4-applications-of-thermodynamics-heat-engines-heat-pumps-and-refrigerators",
    "kind": "textbook",
    "checked": "2026-11-09"
  },
  "phase-changes": {
    "publisher": "OpenStax",
    "title": "University Physics 2 · Phase changes",
    "url": "https://openstax.org/books/university-physics-volume-2/pages/1-5-phase-changes",
    "section": "1.5 · normal-pressure references, coexistence and pressure dependence",
    "kind": "textbook",
    "checked": "2026-11-11"
  },
  "nist-ethanol": {
    "publisher": "NIST",
    "title": "Chemistry WebBook · Ethanol",
    "url": "https://webbook.nist.gov/cgi/cbook.cgi?ID=C64175&Mask=4",
    "section": "Phase change data · compilation averages and spread",
    "kind": "reference",
    "checked": "2026-11-11"
  },
  "pdg-ethanol": {
    "publisher": "Particle Data Group",
    "title": "Atomic and nuclear properties · Ethanol",
    "url": "https://pdg.lbl.gov/2026/AtomicNuclearProperties/HTML/ethanol.html",
    "section": "2026 · melting / normal boiling reference, independently rounded",
    "kind": "reference",
    "checked": "2026-11-11"
  },
  "rsc-aluminium": {
    "publisher": "Royal Society of Chemistry",
    "title": "Aluminium · Element 13",
    "url": "https://periodic-table.rsc.org/element/13/aluminum",
    "section": "Fact box · normal melting / boiling references",
    "kind": "reference",
    "checked": "2026-11-11"
  },
  "rsc-iron": {
    "publisher": "Royal Society of Chemistry",
    "title": "Iron · Element 26",
    "url": "https://periodic-table.rsc.org/element/26/iron",
    "section": "Fact box · normal melting / boiling references",
    "kind": "reference",
    "checked": "2026-11-11"
  },
  "cmb-firas": {
    "publisher": "NASA LAMBDA",
    "title": "COBE/FIRAS overview",
    "url": "https://lambda.gsfc.nasa.gov/product/cobe/firas_overview.html",
    "section": "CMB blackbody radiation temperature, not arbitrary matter",
    "kind": "institution",
    "checked": "2026-11-11"
  },
  "sun-temperature": {
    "publisher": "NASA",
    "title": "Sun fact sheet",
    "url": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html",
    "section": "Solar atmosphere · effective temperature 5772 K",
    "kind": "institution",
    "checked": "2026-11-11"
  },
  "cern-mass": {
    "publisher": "CERN",
    "title": "The other 99%",
    "url": "https://home.cern/other-99/",
    "section": "2025-02-05 · didactic mass comparison, not a universal decomposition",
    "kind": "institution",
    "checked": "2026-11-11"
  },
  "cms-partons": {
    "publisher": "CMS Collaboration",
    "title": "How are the quarks moving?",
    "url": "https://cms.cern/news/how-are-quarks-moving",
    "section": "2022-06-13 · valence excess and partonic description",
    "kind": "research",
    "checked": "2026-11-11"
  },
  "qcd-decomposition": {
    "publisher": "Yang et al.",
    "title": "Proton Mass Decomposition from the QCD Energy Momentum Tensor",
    "url": "https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.121.212001",
    "section": "PRL 121, 212001 (2018) · rest energy, scheme and scale",
    "kind": "research",
    "checked": "2026-11-11"
  },
  "clay-gap": {
    "publisher": "Clay Mathematics Institute",
    "title": "Yang–Mills & the Mass Gap",
    "url": "https://www.claymath.org/millennium/yang-mills-the-maths-gap/",
    "section": "Current official status: Unsolved",
    "kind": "institution",
    "checked": "2026-11-11"
  },
  "clay-definition": {
    "publisher": "Jaffe & Witten / Clay",
    "title": "Quantum Yang–Mills Theory",
    "url": "https://www.claymath.org/wp-content/uploads/2022/06/yangmills.pdf",
    "section": "Official problem description §4, page 6 · existence and positive gap",
    "kind": "research",
    "checked": "2026-11-11"
  },
  "proton-mass": {
    "publisher": "Particle Data Group",
    "title": "Proton mass · pdgLive",
    "url": "https://pdgprod.lbl.gov/pdgprod/pdgLive/DataBlock.action?home=sumtabB&node=S016M",
    "section": "Mass evaluation · 2022 CODATA, quoted only as 938.27 MeV/c²",
    "kind": "reference",
    "checked": "2026-11-11"
  },
  "higgs-quarks": {
    "publisher": "CMS Collaboration",
    "title": "Higgs boson",
    "url": "https://cms.cern/news/higgs-boson",
    "section": "Elementary particle masses, distinct from composite rest energy",
    "kind": "institution",
    "checked": "2026-11-11"
  }
});
export const terms=freeze([
  {
    "id": "au",
    "target": "guide-au",
    "label": "k.term.au.label",
    "short": "k.term.au.short",
    "long": "k.term.au.long",
    "model": "gravity",
    "sources": [
      "jpl-au"
    ],
    "equation": ""
  },
  {
    "id": "mass",
    "target": "guide-mass",
    "label": "k.term.mass.label",
    "short": "k.term.mass.short",
    "long": "k.term.mass.long",
    "model": "gravity",
    "sources": [
      "newton"
    ],
    "equation": "m [kg]; M☉ = 1.98847 × 10³⁰ kg"
  },
  {
    "id": "force",
    "target": "guide-force",
    "label": "k.term.force.label",
    "short": "k.term.force.short",
    "long": "k.term.force.long",
    "model": "gravity",
    "sources": [
      "newton"
    ],
    "equation": "F [N] = m [kg] · a [m/s²]"
  },
  {
    "id": "acceleration",
    "target": "guide-acceleration",
    "label": "k.term.acceleration.label",
    "short": "k.term.acceleration.short",
    "long": "k.term.acceleration.long",
    "model": "gravity",
    "sources": [
      "newton",
      "orbits"
    ],
    "equation": "a = dv/dt [m/s²]"
  },
  {
    "id": "orbit",
    "target": "guide-orbit",
    "label": "k.term.orbit.label",
    "short": "k.term.orbit.short",
    "long": "k.term.orbit.long",
    "model": "gravity",
    "sources": [
      "orbits"
    ],
    "equation": ""
  },
  {
    "id": "softening",
    "target": "guide-softening",
    "label": "k.term.softening.label",
    "short": "k.term.softening.short",
    "long": "k.term.softening.long",
    "model": "gravity",
    "sources": [
      "physics-code"
    ],
    "equation": "aᵢ = G Σⱼ mⱼ (rⱼ−rᵢ)/(|rⱼ−rᵢ|²+ε²)³ᐟ²"
  },
  {
    "id": "c",
    "target": "guide-c",
    "label": "k.term.c.label",
    "short": "k.term.c.short",
    "long": "k.term.c.long",
    "model": "blackhole",
    "sources": [
      "si"
    ],
    "equation": "c = 299 792 458 m/s"
  },
  {
    "id": "horizon",
    "target": "guide-event-horizon",
    "label": "k.term.horizon.label",
    "short": "k.term.horizon.short",
    "long": "k.term.horizon.long",
    "model": "blackhole",
    "sources": [
      "bh-anatomy"
    ],
    "equation": ""
  },
  {
    "id": "schwarzschild",
    "target": "guide-horizon",
    "label": "k.term.schwarzschild.label",
    "short": "k.term.schwarzschild.short",
    "long": "k.term.schwarzschild.long",
    "model": "blackhole",
    "sources": [
      "bh-anatomy",
      "jila"
    ],
    "equation": "rₛ = 2GM/c² [m]"
  },
  {
    "id": "isco",
    "target": "guide-isco",
    "label": "k.term.isco.label",
    "short": "k.term.isco.short",
    "long": "k.term.isco.long",
    "model": "blackhole",
    "sources": [
      "schwarzschild-orbits"
    ],
    "equation": "r_ISCO = 3rₛ; r_ph = 1.5rₛ"
  },
  {
    "id": "hawking",
    "target": "guide-hawking",
    "label": "k.term.hawking.label",
    "short": "k.term.hawking.short",
    "long": "k.term.hawking.long",
    "model": "blackhole",
    "sources": [
      "hawking",
      "jila"
    ],
    "equation": "T_H = ℏc³/(8πGk_BM) [K]"
  },
  {
    "id": "stars",
    "target": "guide-stars",
    "label": "k.term.stars.label",
    "short": "k.term.stars.short",
    "long": "k.term.stars.long",
    "model": "objects",
    "sources": [
      "stellar-types",
      "nicer"
    ],
    "equation": ""
  },
  {
    "id": "kelvin",
    "target": "guide-kelvin",
    "label": "k.term.kelvin.label",
    "short": "k.term.kelvin.short",
    "long": "k.term.kelvin.long",
    "model": "temperature",
    "sources": [
      "si"
    ],
    "equation": "t [°C] = T [K] − 273.15"
  },
  {
    "id": "temperature",
    "target": "guide-temperature",
    "label": "k.term.temperature.label",
    "short": "k.term.temperature.short",
    "long": "k.term.temperature.long",
    "model": "temperature",
    "sources": [
      "si",
      "thermodynamics"
    ],
    "equation": ""
  },
  {
    "id": "heat",
    "target": "guide-thermal",
    "label": "k.term.heat.label",
    "short": "k.term.heat.short",
    "long": "k.term.heat.long",
    "model": "thermal",
    "sources": [
      "thermodynamics",
      "thermal-code"
    ],
    "equation": "P = dQ/dt [W]; Q [J]"
  },
  {
    "id": "mechanicalenergy",
    "target": "guide-mechanical-energy",
    "label": "k.term.mechanicalenergy.label",
    "short": "k.term.mechanicalenergy.short",
    "long": "k.term.mechanicalenergy.long",
    "model": "gravity",
    "sources": ["orbits", "physics-code"],
    "equation": "E = Σᵢ mᵢ|vᵢ|²/2 − Σᵢ<ⱼ G mᵢmⱼ/√(rᵢⱼ²+ε²) [M☉·AU²/d²]"
  },
  {
    "id": "energy",
    "target": "guide-energy",
    "label": "k.term.energy.label",
    "short": "k.term.energy.short",
    "long": "k.term.energy.long",
    "model": "thermal",
    "sources": [
      "thermodynamics",
      "thermal-code"
    ],
    "equation": "U [J]; ΔU = Q − W"
  },
  {
    "id": "conductance",
    "target": "guide-conductance",
    "label": "k.term.conductance.label",
    "short": "k.term.conductance.short",
    "long": "k.term.conductance.long",
    "model": "thermal",
    "sources": [
      "thermal-code"
    ],
    "equation": "G_th = P/(T_A−T_B) [W/K]"
  },
  {
    "id": "capacity",
    "target": "guide-capacity",
    "label": "k.term.capacity.label",
    "short": "k.term.capacity.short",
    "long": "k.term.capacity.long",
    "model": "thermal",
    "sources": [
      "thermodynamics",
      "thermal-code"
    ],
    "equation": "ΔU = C·ΔT; C [J/K]"
  },
  {
    "id": "microstate",
    "target": "guide-entropy",
    "label": "k.term.microstate.label",
    "short": "k.term.microstate.short",
    "long": "k.term.microstate.long",
    "model": "markers",
    "sources": [
      "statmech"
    ],
    "equation": ""
  },
  {
    "id": "macrostate",
    "target": "guide-macrostate",
    "label": "k.term.macrostate.label",
    "short": "k.term.macrostate.short",
    "long": "k.term.macrostate.long",
    "model": "markers",
    "sources": [
      "statmech"
    ],
    "equation": "0 ≤ k ≤ N"
  },
  {
    "id": "multiplicity",
    "target": "guide-multiplicity",
    "label": "k.term.multiplicity.label",
    "short": "k.term.multiplicity.short",
    "long": "k.term.multiplicity.long",
    "model": "markers",
    "sources": [
      "statmech",
      "marker-code"
    ],
    "equation": "Ω(N,k) = N!/[k!(N−k)!]; P_eq(k) = Ω/2ᴺ"
  },
  {
    "id": "equilibrium",
    "target": "guide-equilibrium",
    "label": "k.term.equilibrium.label",
    "short": "k.term.equilibrium.short",
    "long": "k.term.equilibrium.long",
    "model": "thermal",
    "sources": [
      "statmech",
      "thermal-code"
    ],
    "equation": "T_eq = (C_A T_A0 + C_B T_B0)/(C_A+C_B)"
  },
  {
    "id": "entropy",
    "target": "guide-entropy-measures",
    "label": "k.term.entropy.label",
    "short": "k.term.entropy.short",
    "long": "k.term.entropy.long",
    "model": "thermal",
    "sources": [
      "statmech",
      "heat-entropy"
    ],
    "equation": "S_model/k_B = ln Ω; ΔS_i = C_i ln(T_i/T_i0) [J/K]"
  },
  {
    "id": "fluctuation",
    "target": "guide-fluctuation",
    "label": "k.term.fluctuation.label",
    "short": "k.term.fluctuation.short",
    "long": "k.term.fluctuation.long",
    "model": "markers",
    "sources": [
      "statmech"
    ],
    "equation": ""
  },
  {
    "id": "firstlaw",
    "target": "guide-firstlaw",
    "label": "k.term.firstlaw.label",
    "short": "k.term.firstlaw.short",
    "long": "k.term.firstlaw.long",
    "model": "thermal",
    "sources": [
      "thermodynamics"
    ],
    "equation": "ΔU = Q − W"
  },
  {
    "id": "secondlaw",
    "target": "guide-secondlaw",
    "label": "k.term.secondlaw.label",
    "short": "k.term.secondlaw.short",
    "long": "k.term.secondlaw.long",
    "model": "thermal",
    "sources": [
      "heat-entropy",
      "thermal-code"
    ],
    "equation": "σ [W/K] = d(ΔS_total)/dt ≥ 0"
  },
  {
    "id": "validity",
    "target": "guide-validity",
    "label": "k.term.validity.label",
    "short": "k.term.validity.short",
    "long": "k.term.validity.long",
    "model": "thermal",
    "sources": [
      "thermal-code",
      "physics-code"
    ],
    "equation": ""
  },
  {
    "id": "universe",
    "target": "guide-universe",
    "label": "k.term.universe.label",
    "short": "k.term.universe.short",
    "long": "k.term.universe.long",
    "model": "gravity",
    "sources": [
      "physics-code",
      "foundations"
    ],
    "equation": ""
  }
]);
export const models=freeze([
  {
    "id": "gravity",
    "target": "model-gravity",
    "title": "k.model.gravity.title",
    "overview": "k.model.gravity.overview",
    "method": "k.model.gravity.method",
    "units": "k.model.gravity.units",
    "limits": "k.model.gravity.limits",
    "illustration": "k.model.gravity.illustration",
    "misconception": "k.model.gravity.misconception",
    "equations": [
      "aᵢ = G Σⱼ mⱼ(rⱼ−rᵢ)/(|rⱼ−rᵢ|²+ε²)³ᐟ²",
      "r(t+h) = r(t) + v(t)h + a(t)h²/2",
      "v(t+h) = v(t) + [a(t)+a(t+h)]h/2"
    ],
    "sources": [
      "newton",
      "orbits",
      "physics-code"
    ]
  },
  {
    "id": "blackhole",
    "target": "model-blackhole",
    "title": "k.model.blackhole.title",
    "overview": "k.model.blackhole.overview",
    "method": "k.model.blackhole.method",
    "units": "k.model.blackhole.units",
    "limits": "k.model.blackhole.limits",
    "illustration": "k.model.blackhole.illustration",
    "misconception": "k.model.blackhole.misconception",
    "equations": [
      "rₛ = 2GM/c²",
      "T_H = ℏc³/(8πGk_BM)",
      "P ≈ ℏc⁶/(15360πG²M²)",
      "τ ≈ 5120πG²M³/(ℏc⁴)"
    ],
    "sources": [
      "hawking",
      "jila",
      "physics-code"
    ]
  },
  {
    "id": "objects",
    "target": "model-objects",
    "title": "k.model.objects.title",
    "overview": "k.model.objects.overview",
    "method": "k.model.objects.method",
    "units": "k.model.objects.units",
    "limits": "k.model.objects.limits",
    "illustration": "k.model.objects.illustration",
    "misconception": "k.model.objects.misconception",
    "equations": [
      "ρ_mean = M/(4πR³/3) [kg/m³]",
      "r_ph = 1.5rₛ; r_ISCO = 3rₛ"
    ],
    "sources": [
      "stellar-types",
      "nicer",
      "schwarzschild-orbits"
    ]
  },
  {
    "id": "temperature",
    "target": "model-temperature",
    "title": "k.model.temperature.title",
    "overview": "k.model.temperature.overview",
    "method": "k.model.temperature.method",
    "units": "k.model.temperature.units",
    "limits": "k.model.temperature.limits",
    "illustration": "k.model.temperature.illustration",
    "misconception": "k.model.temperature.misconception",
    "equations": [
      "t [°C] = T [K] − 273.15"
    ],
    "sources": [
      "si",
      "thermodynamics"
    ]
  },
  {
    "id": "markers",
    "target": "model-markers",
    "title": "k.model.markers.title",
    "overview": "k.model.markers.overview",
    "method": "k.model.markers.method",
    "units": "k.model.markers.units",
    "limits": "k.model.markers.limits",
    "illustration": "k.model.markers.illustration",
    "misconception": "k.model.markers.misconception",
    "equations": [
      "Ω(N,k) = N!/[k!(N−k)!]",
      "P_eq(k) = Ω/2ᴺ",
      "S_model/k_B = ln Ω",
      "E[k_next | k] = (1−q)k + q(N−k)"
    ],
    "sources": [
      "statmech",
      "marker-code"
    ]
  },
  {
    "id": "thermal",
    "target": "model-thermal",
    "title": "k.model.thermal.title",
    "overview": "k.model.thermal.overview",
    "method": "k.model.thermal.method",
    "units": "k.model.thermal.units",
    "limits": "k.model.thermal.limits",
    "illustration": "k.model.thermal.illustration",
    "misconception": "k.model.thermal.misconception",
    "equations": [
      "T_eq = (C_A T_A0 + C_B T_B0)/(C_A+C_B)",
      "τ = C_A C_B/[G_th(C_A+C_B)] [s]",
      "T_A−T_B = (T_A0−T_B0) exp(−t/τ)",
      "P_A→B = G_th(T_A−T_B) [W]",
      "ΔS_i = C_i ln(T_i/T_i0) [J/K]",
      "σ = G_th(T_A−T_B)²/(T_A T_B) [W/K]"
    ],
    "sources": [
      "thermodynamics",
      "heat-entropy",
      "thermal-code"
    ]
  }
]);
export const termById=freeze(Object.fromEntries(terms.map(t=>[t.id,t])));
export const modelById=freeze(Object.fromEntries(models.map(m=>[m.id,m])));
export const CONTEXTS=freeze({gravity:{tab:"gravity",model:"gravity"},blackhole:{tab:"blackhole",model:"blackhole"},objects:{tab:"extreme",model:"objects"},temperature:{tab:"extreme",model:"temperature"},markers:{tab:"entropy",view:"particles",model:"markers"},thermal:{tab:"entropy",view:"thermal",model:"thermal"}});
export function contentKeys(){return [...articles.flatMap(a=>[a.title,a.intro,a.limit,...a.sections.flatMap(s=>[s.title,...s.text])]),...terms.flatMap(t=>[t.label,t.short,t.long]),...models.flatMap(m=>[m.title,m.overview,m.method,m.units,m.limits,m.illustration,m.misconception]),...applications.flatMap(a=>[a.title,a.text]),...explanations.flatMap(q=>[q.question,q.observe,q.cause,q.use,q.limit,q.quiz,q.answer,q.try,...q.options.map(o=>o.label)])]}

export const explanations=freeze([
  {
    "id": "gravity",
    "model": "gravity",
    "question": "k.question.gravity.question",
    "observe": "k.question.gravity.observe",
    "cause": "k.question.gravity.cause",
    "use": "k.question.gravity.use",
    "limit": "k.question.gravity.limit",
    "quiz": "k.question.gravity.quiz",
    "options": [
      {
        "id": "a",
        "label": "k.question.gravity.option0"
      },
      {
        "id": "b",
        "label": "k.question.gravity.option1"
      }
    ],
    "answer": "k.question.gravity.answer",
    "try": "k.question.gravity.try",
    "target": "velY",
    "correct": "a"
  },
  {
    "id": "blackhole",
    "model": "blackhole",
    "question": "k.question.blackhole.question",
    "observe": "k.question.blackhole.observe",
    "cause": "k.question.blackhole.cause",
    "use": "k.question.blackhole.use",
    "limit": "k.question.blackhole.limit",
    "quiz": "k.question.blackhole.quiz",
    "options": [
      {
        "id": "a",
        "label": "k.question.blackhole.option0"
      },
      {
        "id": "b",
        "label": "k.question.blackhole.option1"
      },
      {
        "id": "c",
        "label": "k.question.blackhole.option2"
      }
    ],
    "answer": "k.question.blackhole.answer",
    "try": "k.question.blackhole.try",
    "target": "bhMass",
    "correct": "a"
  },
  {
    "id": "objects",
    "model": "objects",
    "question": "k.question.objects.question",
    "observe": "k.question.objects.observe",
    "cause": "k.question.objects.cause",
    "use": "k.question.objects.use",
    "limit": "k.question.objects.limit",
    "quiz": "k.question.objects.quiz",
    "options": [
      {
        "id": "a",
        "label": "k.question.objects.option0"
      },
      {
        "id": "b",
        "label": "k.question.objects.option1"
      }
    ],
    "answer": "k.question.objects.answer",
    "try": "k.question.objects.try",
    "target": "comparisonMode",
    "correct": "a"
  },
  {
    "id": "temperature",
    "model": "temperature",
    "question": "k.question.temperature.question",
    "observe": "k.question.temperature.observe",
    "cause": "k.question.temperature.cause",
    "use": "k.question.temperature.use",
    "limit": "k.question.temperature.limit",
    "quiz": "k.question.temperature.quiz",
    "options": [
      {
        "id": "a",
        "label": "k.question.temperature.option0"
      },
      {
        "id": "b",
        "label": "k.question.temperature.option1"
      }
    ],
    "answer": "k.question.temperature.answer",
    "try": "k.question.temperature.try",
    "target": "kelvinInput",
    "correct": "a"
  },
  {
    "id": "markers",
    "model": "markers",
    "question": "k.question.markers.question",
    "observe": "k.question.markers.observe",
    "cause": "k.question.markers.cause",
    "use": "k.question.markers.use",
    "limit": "k.question.markers.limit",
    "quiz": "k.question.markers.quiz",
    "options": [
      {
        "id": "a",
        "label": "k.question.markers.option0"
      },
      {
        "id": "b",
        "label": "k.question.markers.option1"
      }
    ],
    "answer": "k.question.markers.answer",
    "try": "k.question.markers.try",
    "target": "entropyK",
    "correct": "a"
  },
  {
    "id": "thermal",
    "model": "thermal",
    "question": "k.question.thermal.question",
    "observe": "k.question.thermal.observe",
    "cause": "k.question.thermal.cause",
    "use": "k.question.thermal.use",
    "limit": "k.question.thermal.limit",
    "quiz": "k.question.thermal.quiz",
    "options": [
      {
        "id": "a",
        "label": "k.question.thermal.option0"
      },
      {
        "id": "b",
        "label": "k.question.thermal.option1"
      }
    ],
    "answer": "k.question.thermal.answer",
    "try": "k.question.thermal.try",
    "target": "[data-thermal-preset=balanced]",
    "correct": "a"
  }
]);

export const applications=freeze([{"id": "tea", "title": "k.learning.extras.tea.title", "text": "k.learning.extras.tea.text", "model": "thermal", "sources": ["openstax-applications", "thermodynamics"]}, {"id": "thermos", "title": "k.learning.extras.thermos.title", "text": "k.learning.extras.thermos.text", "model": "thermal", "sources": ["openstax-applications", "thermodynamics"]}, {"id": "fridge", "title": "k.learning.extras.fridge.title", "text": "k.learning.extras.fridge.text", "model": "thermal", "sources": ["openstax-applications", "thermodynamics"]}, {"id": "engine", "title": "k.learning.extras.engine.title", "text": "k.learning.extras.engine.text", "model": "thermal", "sources": ["openstax-applications", "thermodynamics"]}, {"id": "boundary", "title": "k.learning.extras.boundary.title", "text": "k.learning.extras.boundary.text", "model": "markers", "sources": ["foundations", "statmech"]}]);

// Voluntary science article, deliberately not a seventh numerical model.
export const articles=freeze([{id:'proton',target:'model-proton',title:'v85.qcd.title',intro:'v85.qcd.intro',limit:'v85.qcd.limit',sections:[
 {title:'v85.qcd.valence.title',text:['v85.qcd.valence.text'],sources:['cms-partons']},
 {title:'v85.qcd.mass.title',text:['v85.qcd.mass.text','v85.qcd.reference','v85.qcd.percent','v85.qcd.higgs'],sources:['proton-mass','cern-mass','qcd-decomposition','higgs-quarks']},
 {title:'v85.qcd.gap.title',text:['v85.qcd.gap.text','v85.qcd.status'],sources:['clay-gap','clay-definition']}
]}]);
