// One bilingual catalog, consumed by the existing i18n engine. No independent translator.
const messages={
  "k.term.au.label": [
    "Astronomische Einheit (AU)",
    "Astronomical unit (AU)"
  ],
  "k.term.au.short": [
    "Eine AU ist exakt 149 597 870 700 m.",
    "One AU is exactly 149 597 870 700 m."
  ],
  "k.term.au.long": [
    "Die Sandbox rechnet Positionen in AU. Einheiten sagen nichts über die überhöhten gezeichneten Körperradien aus.",
    "Sandbox positions use AU. These units do not make the enlarged drawn body radii to scale."
  ],
  "k.term.mass.label": [
    "Masse",
    "Mass"
  ],
  "k.term.mass.short": [
    "Masse bestimmt in diesem Newton-Modell sowohl Trägheit als auch gravitative Wechselwirkung.",
    "Mass determines both inertia and gravitational interaction in this Newtonian model."
  ],
  "k.term.mass.long": [
    "Intern verwenden wir Sonnenmassen, im BH-Rechner Kilogramm. Ein gezeichneter größerer Körper muss nicht maßstäblich größer sein.",
    "Internal masses use solar masses; the BH calculator uses kilograms. A larger drawn body need not be larger to scale."
  ],
  "k.term.force.label": [
    "Kraft",
    "Force"
  ],
  "k.term.force.short": [
    "Eine Kraft verändert den Impuls eines Körpers; Newtonsche Gravitation wirkt anziehend.",
    "A force changes a body’s momentum; Newtonian gravity is attractive."
  ],
  "k.term.force.long": [
    "Für konstante Masse gilt F = ma. Das Lab glättet die Punktmassenkraft mit ε; es berechnet keine Raumzeitkrümmung.",
    "For constant mass, F = ma. This lab softens the point-mass force with ε; it does not calculate spacetime curvature."
  ],
  "k.term.acceleration.label": [
    "Beschleunigung",
    "Acceleration"
  ],
  "k.term.acceleration.short": [
    "Beschleunigung ist die Änderung der Geschwindigkeit pro Zeit, auch bei reiner Richtungsänderung.",
    "Acceleration is the change of velocity per unit time, including a change of direction alone."
  ],
  "k.term.acceleration.long": [
    "Eine Umlaufbahn benötigt Beschleunigung, auch wenn der Geschwindigkeitsbetrag konstant bleibt. In der Sandbox wirken alle Körper aufeinander.",
    "An orbit requires acceleration even at constant speed. Every sandbox body interacts with the others."
  ],
  "k.term.orbit.label": [
    "Umlaufbahn und Flucht",
    "Orbit and escape"
  ],
  "k.term.orbit.short": [
    "Seitliche Geschwindigkeit und Gravitation können eine gebundene Bahn ermöglichen.",
    "Tangential velocity and gravity can produce a bound orbit."
  ],
  "k.term.orbit.long": [
    "Die Startwerte und weitere Körper entscheiden über die Bahn. Unsere idealisierten Szenarien sind keine realen Ephemeriden; enge Begegnungen und Kollisionen begrenzen die numerische Vorhersage.",
    "Initial conditions and other bodies determine the path. These idealised scenarios are not real ephemerides; close encounters and collisions limit numerical predictions."
  ],
  "k.term.softening.label": [
    "Softening und numerischer Fehler",
    "Softening and numerical error"
  ],
  "k.term.softening.short": [
    "ε glättet die Kraft bei sehr kleinen Abständen. Kleine Energiedrift allein beweist keine genaue Bahn.",
    "ε smooths the force at very short distances. Small energy drift alone does not prove an accurate orbit."
  ],
  "k.term.softening.long": [
    "ε = 10⁻⁷ AU entspricht ungefähr 15 km. Die adaptive Schrittwahl ist eine Heuristik, keine garantierte Fehlerschranke; Kollisionen werden an Schrittendpunkten geprüft und Streifkontakte können fehlen.",
    "ε = 10⁻⁷ AU is about 15 km. Adaptive step selection is a heuristic, not a guaranteed error bound; endpoint collision checks can miss grazing contacts."
  ],
  "k.term.c.label": [
    "Lichtgeschwindigkeit",
    "Speed of light"
  ],
  "k.term.c.short": [
    "Licht bewegt sich im Vakuum mit exakt 299 792 458 m/s.",
    "Light travels in vacuum at exactly 299 792 458 m/s."
  ],
  "k.term.c.long": [
    "Die Newton-Sandbox erzwingt keine relativistische Geschwindigkeitsgrenze. Ihre Warnung bei hohen Geschwindigkeiten kennzeichnet eine Modellgrenze, keine relativistische Rechnung.",
    "The Newtonian sandbox does not enforce a relativistic speed limit. Its high-speed warning marks a model limit, not a relativistic calculation."
  ],
  "k.term.horizon.label": [
    "Ereignishorizont",
    "Event horizon"
  ],
  "k.term.horizon.short": [
    "Eine kausale Grenze: Aus ihrem Inneren kann kein zukünftiges Lichtsignal die ferne Außenwelt erreichen.",
    "A causal boundary: no future-directed light signal from inside can reach the distant exterior."
  ],
  "k.term.horizon.long": [
    "Ein Horizont ist keine Materialoberfläche. Der Newtonsche Absorptionsradius der Sandbox ist keine Simulation dieser Raumzeitgeometrie.",
    "A horizon is not a material surface. The sandbox’s Newtonian absorption radius does not simulate this spacetime geometry."
  ],
  "k.term.schwarzschild.label": [
    "Schwarzschild-Radius",
    "Schwarzschild radius"
  ],
  "k.term.schwarzschild.short": [
    "rₛ ist der Koordinatenradius des Horizonts eines ungeladenen, nicht rotierenden Schwarzen Lochs.",
    "rₛ is the horizon’s coordinate radius for an uncharged, non-rotating black hole."
  ],
  "k.term.schwarzschild.long": [
    "Eine Verdopplung der Masse verdoppelt rₛ. Das sagt nichts über die Helligkeit einer Akkretionsscheibe oder den Radius des beobachteten Emissionsrings aus.",
    "Doubling mass doubles rₛ. This does not determine an accretion disk’s brightness or the radius of an observed emission ring."
  ],
  "k.term.isco.label": [
    "ISCO und Photonensphäre",
    "ISCO and photon sphere"
  ],
  "k.term.isco.short": [
    "Beim Schwarzschild-Loch liegt die innerste stabile Kreisbahn massiver Testteilchen bei 3rₛ, die Photonensphäre bei 1,5rₛ.",
    "For Schwarzschild, the innermost stable circular orbit of massive test particles is at 3rₛ; the photon sphere is at 1.5rₛ."
  ],
  "k.term.isco.long": [
    "Diese Radien gelten für das nicht rotierende Modell. Photonensphäre, Horizont und sichtbarer Schatten sind verschiedene Begriffe; die Illustration löst keine Lichtbahnen.",
    "These radii apply to the non-rotating model. Photon sphere, horizon and visible shadow are distinct; the illustration does not solve light paths."
  ],
  "k.term.hawking.label": [
    "Hawking-Temperatur",
    "Hawking temperature"
  ],
  "k.term.hawking.short": [
    "Eine theoretische Strahlungstemperatur für ferne Beobachter, keine Scheiben- oder Materialtemperatur.",
    "A theoretical radiation temperature for distant observers, not disk or material temperature."
  ],
  "k.term.hawking.long": [
    "Temperatur ∝ 1/M. Leistung und Verdampfungsdauer sind idealisierte Photonen-Modellschätzungen ohne vollständige Greybody-/Teilchenspektren, Akkretion oder quantengravitative Endphase. Astrophysikalische Hawking-Strahlung ist nicht direkt nachgewiesen.",
    "Temperature ∝ 1/M. Power and evaporation time are idealised photon-model estimates without full greybody/particle spectra, accretion or a quantum-gravity endpoint. Astrophysical Hawking radiation has not been directly detected."
  ],
  "k.term.stars.label": [
    "Weiße Zwerge und Neutronensterne",
    "White dwarfs and neutron stars"
  ],
  "k.term.stars.short": [
    "Kompakte Sternreste sind nicht automatisch Schwarze Löcher; ihre materielle Struktur ist entscheidend.",
    "Compact stellar remnants are not automatically black holes; their material structure matters."
  ],
  "k.term.stars.long": [
    "Hier sind 0,6 M☉/7000 km und 1,4 M☉/12 km festgelegte Beispiele, keine universellen Masse-Radius-Kurven. Elektronenentartung stützt Weiße Zwerge; Neutronensterne erfordern dichte Kernmaterie und relativistische Strukturmodelle. Pulsarkegel sind nur schematisch.",
    "Here 0.6 M☉/7000 km and 1.4 M☉/12 km are chosen examples, not universal mass–radius curves. Electron degeneracy supports white dwarfs; neutron stars require dense nuclear matter and relativistic structure models. Pulsar cones are schematic only."
  ],
  "k.term.kelvin.label": [
    "Kelvin und Celsius",
    "Kelvin and Celsius"
  ],
  "k.term.kelvin.short": [
    "Eine Temperaturdifferenz von 1 K ist so groß wie 1 °C; die absoluten Zahlen unterscheiden sich um 273,15.",
    "A temperature difference of 1 K equals 1 °C; absolute readings differ by 273.15."
  ],
  "k.term.kelvin.long": [
    "0 K ist der theoretische absolute Nullpunkt und außerhalb der logarithmischen Skala. Das bedeutet nicht, dass jede Quantenbewegung aufhört. Die Celsiusanzeige hat begrenzte Dezimalauflösung.",
    "0 K is the theoretical absolute zero and lies outside the logarithmic scale. This does not mean all quantum motion ceases. The Celsius display has limited decimal resolution."
  ],
  "k.term.temperature.label": [
    "Temperatur",
    "Temperature"
  ],
  "k.term.temperature.short": [
    "Temperatur beschreibt einen thermischen Zustand, nicht allein die gesamte Energie eines Systems.",
    "Temperature describes a thermal state, not a system’s total energy on its own."
  ],
  "k.term.temperature.long": [
    "Menge, Stoff und Zustand sind zusätzlich wichtig. Das Extreme Temperature Lab vergleicht Skalen; es löst weder Materialphasen noch Plasma- oder Gasdynamik.",
    "Amount, material and state also matter. Extreme Temperature Lab compares scales; it solves neither material phases nor plasma or gas dynamics."
  ],
  "k.term.heat.label": [
    "Wärme",
    "Heat"
  ],
  "k.term.heat.short": [
    "Wärme ist Energieübertragung aufgrund eines Temperaturunterschieds.",
    "Heat is energy transferred because of a temperature difference."
  ],
  "k.term.heat.long": [
    "Im passiven Zwei-Körper-Modell gilt P_A→B = G_th(T_A−T_B). Positive Leistung bedeutet A→B, negative B→A; bei gleicher Temperatur ist die Nettoleistung null. Wärme ist keine gespeicherte Stoffmenge.",
    "In the passive two-body model P_A→B = G_th(T_A−T_B). Positive power means A→B, negative means B→A; equal temperatures give zero net power. Heat is not a stored substance."
  ],
  "k.term.mechanicalenergy.label": [
    "Mechanische Energie",
    "Mechanical energy"
  ],
  "k.term.mechanicalenergy.short": [
    "Die Sandbox summiert Bewegungsenergie und geglättete gravitative potenzielle Energie aller Körper: E = K + V_ε.",
    "The sandbox sums the kinetic energy and softened gravitational potential energy of all bodies: E = K + V_ε."
  ],
  "k.term.mechanicalenergy.long": [
    "Die Anzeige verwendet M☉·AU²/Tag², nicht Joule: Massen in Sonnenmassen, Abstände in AU und Geschwindigkeiten in AU/Tag. G ist entsprechend in AU³/(M☉·Tag²) umgerechnet. Jedes Körperpaar wird einmal gezählt, mit ε = 10⁻⁷ AU; V_ε geht bei unendlichem Abstand gegen null. In einem isolierten, kollisionsfreien Modell bleibt E bis auf numerische Fehler konstant. Eingriffe und unelastische Verschmelzungen setzen die Driftreferenz neu. Wärme, innere Energie und Spin werden hier nicht bilanziert. Negative Gesamtenergie garantiert bei mehreren Körpern nicht, dass jeder Körper gebunden bleibt.",
    "The readout uses M☉·AU²/day², not joules: masses in solar masses, distances in AU and velocities in AU/day. G is converted to AU³/(M☉·day²) accordingly. Each body pair is counted once, with ε = 10⁻⁷ AU; V_ε tends to zero at infinite separation. In an isolated, collision-free model E stays constant up to numerical error. Edits and inelastic mergers reset the drift reference. Heat, internal energy and spin are not accounted for here. Negative total energy does not guarantee that every body in a many-body system remains bound."
  ],
  "k.term.energy.label": [
    "Thermische innere Energie (Modell)",
    "Thermal internal energy (model)"
  ],
  "k.term.energy.short": [
    "Im isolierten Wärme-Paar ist U die thermische innere Modellenergie mit einem fest gewählten Nullpunkt. Sie bleibt beim passiven Austausch erhalten.",
    "In the isolated heat pair U is thermal internal model energy with a fixed reference. It is conserved during passive exchange."
  ],
  "k.term.energy.long": [
    "U = C_A T_A + C_B T_B ist hier eine festgelegte Modellreferenz mit konstantem C, kein absoluter Materialenergieinhalt. Die Demo berechnet keine entnehmbare Arbeit und keinen Kühlschrank.",
    "U = C_A T_A + C_B T_B is a chosen constant-C model reference, not absolute material energy. The demo calculates neither extractable work nor a refrigerator."
  ],
  "k.term.conductance.label": [
    "Wärmeleitwert",
    "Thermal conductance"
  ],
  "k.term.conductance.short": [
    "G_th beschreibt die thermische Kopplung in W/K und ist nicht die Gravitationskonstante G.",
    "G_th describes thermal coupling in W/K and is not the gravitational constant G."
  ],
  "k.term.conductance.long": [
    "Ein kleinerer Leitwert verlangsamt den Ausgleich, ändert aber bei sonst gleichen Startwerten nicht T_eq. Er ist kein vollständiges Modell einer Thermoskanne.",
    "A smaller conductance slows equilibration but does not change T_eq with other initial values fixed. It is not a complete model of a vacuum flask."
  ],
  "k.term.capacity.label": [
    "Wärmekapazität",
    "Heat capacity"
  ],
  "k.term.capacity.short": [
    "C ist die benötigte Energie pro Temperaturänderung, hier als konstante Gesamtwärmekapazität in J/K.",
    "C is energy per temperature change, here a constant total heat capacity in J/K."
  ],
  "k.term.capacity.long": [
    "Sie hängt bei realen Stoffen von Menge, Art und Zustand ab. Im genehmigten Modell ist C konstant; Phasenwechsel und Extrapolation zu beliebigen Temperaturen sind ausgeschlossen.",
    "For real materials it depends on amount, type and state. In this model C is constant; phase transitions and extrapolation to arbitrary temperatures are excluded."
  ],
  "k.term.microstate.label": [
    "Mikrozustand",
    "Microstate"
  ],
  "k.term.microstate.short": [
    "Hier legt ein Mikrozustand für jeden unterscheidbaren Marker links oder rechts fest.",
    "Here a microstate specifies left or right for each distinguishable marker."
  ],
  "k.term.microstate.long": [
    "Andere Markeridentitäten können bei gleicher Linksanzahl unterschiedliche Muster bilden. Bildschirmpositionen zählen nicht zusätzlich; es gibt keine echten Gasteilchenimpulse oder -energien.",
    "Different marker identities can give distinct patterns with the same left count. Screen positions add no states; real gas-particle momenta and energies are absent."
  ],
  "k.term.macrostate.label": [
    "Makrozustand",
    "Macrostate"
  ],
  "k.term.macrostate.short": [
    "k zählt hier nur, wie viele der N Marker links sind.",
    "Here k only counts how many of the N markers are on the left."
  ],
  "k.term.macrostate.long": [
    "Der Makrozustand unterscheidet nicht, welche Marker links sind. Die unabhängige N=4-Demo zeigt diese Zuordnung, ohne das laufende Markermodell zu verändern.",
    "The macrostate does not distinguish which markers are left. The independent N=4 demo illustrates this mapping without changing the live marker model."
  ],
  "k.term.multiplicity.label": [
    "Multiplizität Ω",
    "Multiplicity Ω"
  ],
  "k.term.multiplicity.short": [
    "Ω zählt die Mikrozustände, die zum ausgewählten Makrozustand passen.",
    "Ω counts the microstates compatible with the selected macrostate."
  ],
  "k.term.multiplicity.long": [
    "Für N=12, k=6 sind es 924 von insgesamt 4096 Mustern. Die Rechnung verwendet BigInt. Die stationäre Wahrscheinlichkeit ist 22,5586 %, keine absolute Mehrheit aller Fälle.",
    "For N=12, k=6 there are 924 of 4096 patterns. The calculation uses BigInt. The stationary probability is 22.5586%, not a majority of all outcomes."
  ],
  "k.term.equilibrium.label": [
    "Gleichgewicht",
    "Equilibrium"
  ],
  "k.term.equilibrium.short": [
    "Im Wärmemodell bedeutet gleiche Temperatur null Nettoleistung; im Markermodell ist Gleichgewicht eine stationäre Verteilung.",
    "In the heat model equal temperature gives zero net power; in the marker model equilibrium is a stationary distribution."
  ],
  "k.term.equilibrium.long": [
    "Der nächste Mischschritt hängt vom jetzigen Muster und q=1/4 ab. Bei N=12 alle links sind im nächsten Schritt im Mittel neun links, nicht sechs. Wärmekapazitäten gewichten T_eq.",
    "The next mixing step depends on the present pattern and q=1/4. Starting with all 12 left gives nine left on average next, not six. Heat capacities weight T_eq."
  ],
  "k.term.entropy.label": [
    "Entropie: zwei Modelle",
    "Entropy: two models"
  ],
  "k.term.entropy.short": [
    "Marker: ln Ω ist dimensionslos. Wärme: ΔS ist eine Änderung in J/K. Diese Zahlen werden nicht addiert.",
    "Markers: ln Ω is dimensionless. Heat: ΔS is a change in J/K. These values are not added."
  ],
  "k.term.entropy.long": [
    "ln Ω ist die Boltzmann-artige Zählgröße eines Makrozustands, nicht die vollständige Entropie eines realen Gases. Im Wärmemodell ergibt sich ΔS_i durch Integration bei konstantem C_i; ΔS_A und ΔS_B dürfen verschiedene Vorzeichen haben.",
    "ln Ω is a Boltzmann-style macrostate count, not the full entropy of a real gas. In the heat model ΔS_i follows by integration at constant C_i; ΔS_A and ΔS_B can have different signs."
  ],
  "k.term.fluctuation.label": [
    "Fluktuationen",
    "Fluctuations"
  ],
  "k.term.fluctuation.short": [
    "Eine einzelne kleine Markerfolge kann auch Makrozustände mit kleinerem ln Ω besuchen.",
    "A single small marker trajectory can also visit macrostates with smaller ln Ω."
  ],
  "k.term.fluctuation.long": [
    "Das ist innerhalb der symmetrischen Zufallsregel erlaubt und kein Programmfehler. Die makroskopische Gesamtentropiebilanz ist keine Vorschrift, jeden einzelnen Markertick monoton steigen zu lassen.",
    "The symmetric random rule permits this; it is not a program error. The macroscopic total-entropy balance is not a rule that every individual marker tick must increase."
  ],
  "k.term.firstlaw.label": [
    "Erster Hauptsatz",
    "First law"
  ],
  "k.term.firstlaw.short": [
    "Änderungen der Systemenergie ergeben sich aus Energieübertragung durch Wärme und Arbeit.",
    "Changes in system energy follow energy transfer as heat and work."
  ],
  "k.term.firstlaw.long": [
    "Im isolierten Wärme-Paar gibt es weder Außenverluste noch Arbeit; seine Gesamtenergie bleibt erhalten. Inelastische Sandboxkollisionen erhalten dagegen nicht die dargestellte Bewegungsenergie. W bezeichnet vom System geleistete Arbeit.",
    "The isolated heat pair has neither external losses nor work; its total energy stays constant. Inelastic sandbox collisions do not conserve the displayed kinetic energy. W denotes work done by the system."
  ],
  "k.term.secondlaw.label": [
    "Zweiter Hauptsatz",
    "Second law"
  ],
  "k.term.secondlaw.short": [
    "Im isolierten passiven Wärmemodell ist die Gesamtentropieänderung nicht negativ; ein einzelner Körper darf Entropie verlieren.",
    "In the isolated passive heat model total entropy change is nonnegative; one body may lose entropy."
  ],
  "k.term.secondlaw.long": [
    "Das positive Leitwertgesetz bestimmt den zeitlichen Wärmefluss. Die Entropieproduktion σ = G_th(T_A−T_B)²/(T_A T_B) ist dazu konsistent. Arbeitszufuhr bei realen Kühlschränken ist ein anderer Prozess.",
    "The positive-conductance law determines heat flow over time. Entropy production σ = G_th(T_A−T_B)²/(T_A T_B) is consistent with it. Work supplied to real refrigerators is a different process."
  ],
  "k.term.validity.label": [
    "Gültigkeitsbereich",
    "Validity range"
  ],
  "k.term.validity.short": [
    "Ein berechneter endlicher Wert ist nur unter den Modellannahmen aussagekräftig.",
    "A finite calculated value is meaningful only within the model’s assumptions."
  ],
  "k.term.validity.long": [
    "Das Wärmeexperiment erlaubt anfangs 250–600 K. Die extreme Skala 0–10¹² K erweitert diesen Bereich nicht. Newtonbahnen nahe Horizonten sind keine relativistische Vorhersage.",
    "The heat experiment allows initial temperatures of 250–600 K. The extreme 0–10¹² K scale does not extend that range. Newtonian orbits near horizons are not relativistic predictions."
  ],
  "k.term.universe.label": [
    "Universum und Gravitation",
    "Universe and gravity"
  ],
  "k.term.universe.short": [
    "Die Sandbox beschreibt ein begrenztes Newton-System in einer Ebene, keine Entwicklung des gesamten Universums.",
    "The sandbox describes a bounded Newtonian system in a plane, not the evolution of the whole universe."
  ],
  "k.term.universe.long": [
    "Kosmische Expansion, Horizontentropie und kosmologische Anfangsbedingungen werden hier nicht berechnet. Aussagen zum Zeitpfeil oder Universumsende benötigen weitergehende Modelle.",
    "Cosmic expansion, horizon entropy and cosmological initial conditions are not calculated here. Claims about time’s arrow or the universe’s fate require further models."
  ],
  "k.model.gravity.title": [
    "Gravitation und numerische Bahnen",
    "Gravity and numerical orbits"
  ],
  "k.model.gravity.overview": [
    "Wie Masse und Anfangsgeschwindigkeit die Bewegung bestimmen. Satelliten sind ein reales Anwendungsbeispiel; unsere Startbahnen sind idealisiert.",
    "How mass and initial velocity determine motion. Satellites are a real application; our initial orbits are idealised."
  ],
  "k.model.gravity.method": [
    "Paarweise geglättete Newton-Beschleunigungen; bestehendes Velocity-Verlet-Verfahren und adaptive Begegnungsschritte. 800 Schritte pro Bild, bis 60 Körper. Vorhersage: höchstens 12 Körper, 1500 Schritte und 301 gespeicherte Punkte. Kollisionen verwenden Erddichte für Planeten, Sonnendichte für Sterne und den Schwarzschild-Radius für BH; Absorption ist vereinfachtes Verschmelzen.",
    "Pairwise softened Newtonian accelerations; existing velocity-Verlet method and adaptive encounter steps. 800 steps per frame, up to 60 bodies. Prediction: at most 12 bodies, 1500 steps and 301 stored points. Collision radii use Earth density for planets, solar density for stars and the Schwarzschild radius for BHs; absorption is simplified merging."
  ],
  "k.model.gravity.units": [
    "Position AU, Zeit Tage, Masse M☉; Geschwindigkeitsfelder km/s. Diagnostik: E in M☉·AU²/Tag², p in M☉·AU/Tag, L in M☉·AU²/Tag.",
    "Position AU, time days, mass M☉; velocity fields km/s. Diagnostics: E in M☉·AU²/day², p in M☉·AU/day, L in M☉·AU²/day."
  ],
  "k.model.gravity.limits": [
    "ε = 10⁻⁷ AU ≈ 15 km. Kreisförmige koplanare Startbahnen statt Ephemeriden. Endpunktkollisionen können Streifkontakte übersehen. Verschmelzungen erhalten Masse und linearen Impuls, nicht Bewegungsenergie oder aufgelösten Bahndrehimpuls; Spin fehlt. Keine Relativität, Gezeiten oder Materialentwicklung.",
    "ε = 10⁻⁷ AU ≈ 15 km. Circular coplanar initial orbits, not ephemerides. Endpoint checks can miss grazing contacts. Mergers conserve mass and linear momentum, not kinetic energy or resolved orbital angular momentum; spin is absent. No relativity, tides or material evolution."
  ],
  "k.model.gravity.illustration": [
    "Gezeichnete Körpergrößen und Halos sind überhöhte visuelle Hilfen. Bahnlinien sind numerische Modellresultate.",
    "Drawn body sizes and halos are exaggerated visual aids. Orbit lines are numerical model results."
  ],
  "k.model.gravity.misconception": [
    "Kleine Energiedrift allein garantiert keine genaue Bahn. Ein Newton-BH ist keine Horizontsimulation.",
    "Small energy drift alone does not guarantee an accurate orbit. A Newtonian BH does not simulate a horizon."
  ],
  "k.model.blackhole.title": [
    "Schwarzschild- und Hawking-Rechner",
    "Schwarzschild and Hawking calculator"
  ],
  "k.model.blackhole.overview": [
    "Wie Radius und theoretische Strahlung im nicht rotierenden, ungeladenen Modell mit Masse skalieren.",
    "How radius and theoretical radiation scale with mass in the non-rotating, uncharged model."
  ],
  "k.model.blackhole.method": [
    "Geschlossene Formeln innerhalb der Schwarzschild-/semiklassischen Annahmen; P und τ als idealisierte Photonen-Modellschätzungen.",
    "Closed formulas within Schwarzschild/semiclassical assumptions; P and τ are idealised photon-model estimates."
  ],
  "k.model.blackhole.units": [
    "M in kg, rₛ in m, T_H in K, P in W, τ intern in s; Anzeigejahre haben 365,25 Tage. G, c, ℏ und k_B wie in den bestehenden Rechenkonstanten.",
    "M in kg, rₛ in m, T_H in K, P in W, τ internally in s; displayed years use 365.25 days. G, c, ℏ and k_B retain the existing calculation constants."
  ],
  "k.model.blackhole.limits": [
    "M = 1–10⁴¹ kg. Keine Rotation/Ladung, vollständigen Greybody-/Teilchenspektren oder Akkretion; quantengravitative Endphase unbekannt. Angezeigte Verdampfungsdauer gilt für die idealisierte leere Umgebung, nicht für ein reales Loch im heutigen Strahlungsfeld. Unter ungefähr 2,725 K kann im heutigen kosmischen Hintergrund die Strahlungsaufnahme überwiegen.",
    "M = 1–10⁴¹ kg. No rotation/charge, full greybody/particle spectra or accretion; the quantum-gravity endpoint is unknown. Displayed evaporation time assumes idealised empty surroundings, not a real black hole in today’s radiation field. Below about 2.725 K, radiation absorption from today’s cosmic background can dominate."
  ],
  "k.model.blackhole.illustration": [
    "Größen- und Funktionsgraphen sind berechnete logarithmische Vergleiche, kein Foto oder GR-Raytracing.",
    "Size and function charts are calculated logarithmic comparisons, not a photograph or GR ray tracing."
  ],
  "k.model.blackhole.misconception": [
    "Die Hawking-Temperatur ist keine Scheibentemperatur; astrophysikalische Hawking-Strahlung wurde nicht direkt nachgewiesen.",
    "Hawking temperature is not disk temperature; astrophysical Hawking radiation has not been directly detected."
  ],
  "k.model.objects.title": [
    "Extreme Objekte: gewählte Beispiele",
    "Extreme objects: chosen examples"
  ],
  "k.model.objects.overview": [
    "Sternreste und ein Schwarzschild-Loch mit klar getrennten Radien vergleichen.",
    "Compare stellar remnants and a Schwarzschild black hole with distinct radius meanings."
  ],
  "k.model.objects.method": [
    "Weißer Zwerg: 0,6 M☉ und 7000 km. Neutronenstern: 1,4 M☉ und 12 km. Nur die BH-Masse ist variabel. Mittlere Dichte aus sphärischem Volumen; keine gelöste Zustandsgleichung.",
    "White dwarf: 0.6 M☉ and 7000 km. Neutron star: 1.4 M☉ and 12 km. Only BH mass is variable. Mean density uses spherical volume; no equation of state is solved."
  ],
  "k.model.objects.units": [
    "Masse kg/M☉, Radius m mit passenden Längeneinheiten, mittlere Dichte kg/m³. Beim BH keine gewöhnliche Materialdichte.",
    "Mass kg/M☉, radius m with appropriate length units, mean density kg/m³. No ordinary material density for the BH."
  ],
  "k.model.objects.limits": [
    "Einzelne Beispielradien sind keine universellen Werte. Beobachtete Neutronensternradien hängen von Masse und Modellinterpretation ab. Photonensphäre/ISCO nur für Schwarzschild.",
    "Example radii are not universal values. Observed neutron-star radii depend on mass and model interpretation. Photon sphere/ISCO apply only to Schwarzschild."
  ],
  "k.model.objects.illustration": [
    "Objektleuchten, Akkretionsscheibe und optionale Pulsarkegel sind illustrativ. Logarithmische Balken sind nicht maßstabsgetreu; lineare kleine Balken dürfen verschwinden.",
    "Object glow, accretion disk and optional pulsar cones are illustrative. Logarithmic bars are not to scale; very small linear bars may disappear."
  ],
  "k.model.objects.misconception": [
    "Nicht jeder Neutronenstern ist ein beobachteter Pulsar. Die Animation berechnet weder Lichtbahnen noch Kernmaterie.",
    "Not every neutron star is an observed pulsar. The animation calculates neither light paths nor nuclear matter."
  ],
  "k.model.temperature.title": [
    "Temperaturskala und sichere Brücke",
    "Temperature scale and safe transfer"
  ],
  "k.model.temperature.overview": [
    "Temperaturgrößenordnungen verstehen, ohne Temperatur mit Gesamtenergie zu verwechseln.",
    "Understand temperature scales without confusing temperature with total energy."
  ],
  "k.model.temperature.method": [
    "Exakter SI-Offset, numerisch in Gleitkomma. Vergleichswerte und logarithmische Sliderposition; kein Material-, Gas- oder Wärmedynamik-Solver.",
    "Exact SI offset evaluated in floating point. Reference values and logarithmic slider position; no material, gas or heat-dynamics solver."
  ],
  "k.model.temperature.units": [
    "Direkte Eingabe 0–10¹² K; Slider 10⁻³–10¹² K. Celsiusdifferenzen entsprechen Kelvindifferenzen.",
    "Direct input 0–10¹² K; slider 10⁻³–10¹² K. Celsius intervals equal kelvin intervals."
  ],
  "k.model.temperature.limits": [
    "0 K ist eine gesonderte theoretische Grenze. Nur 250–600 K dürfen im separaten Wärmeexperiment vorgemerkt und erst dort bewusst übernommen werden; kein Clamping fremder Werte.",
    "0 K is a separate theoretical limit. Only 250–600 K may be drafted for the separate heat experiment and explicitly applied there; no clamping of external values."
  ],
  "k.model.temperature.illustration": [
    "Farbe und Bewegung zeigen abstrakte Anregung; keine Materialphase oder Maxwell-Verteilung. 5900 K ist ein grobes vorhandenes Sonnenbeispiel, keine präzise effektive Temperaturmessung.",
    "Colour and motion illustrate abstract excitation; no material phase or Maxwell distribution. 5900 K is an existing rough solar example, not a precise effective-temperature measurement."
  ],
  "k.model.temperature.misconception": [
    "Die Temperatur allein sagt nicht, welches Objekt insgesamt mehr Energie besitzt.",
    "Temperature alone does not tell which object has more total energy."
  ],
  "k.model.markers.title": [
    "Unterscheidbare Zwei-Zustands-Marker",
    "Distinguishable two-state markers"
  ],
  "k.model.markers.overview": [
    "Viele konkrete Muster können dieselbe Linksanzahl besitzen. Häufigkeit ergibt sich aus der gewählten Zählweise.",
    "Many concrete patterns can share the same left count. Frequency follows from the chosen counting convention."
  ],
  "k.model.markers.method": [
    "N = 1–32 Boolean-Marker; BigInt-Zählung. Pro Mischschritt unabhängiger Seitenwechsel mit q=1/4. Die stationäre Verteilung ist binomial.",
    "N = 1–32 Boolean markers; BigInt counting. Each mixing step independently flips each marker with q=1/4. The stationary distribution is binomial."
  ],
  "k.model.markers.units": [
    "N, k, Ω und ln Ω dimensionslos. Schritte sind keine Sekunden, Bildpositionen keine Gasbahnen.",
    "N, k, Ω and ln Ω are dimensionless. Steps are not seconds; screen positions are not gas trajectories."
  ],
  "k.model.markers.limits": [
    "Gleichwahrscheinliche Mikrozustände gelten im stationären Ensemble dieses Modells. Das Gleichgewichtshistogramm ist nicht die bedingte Verteilung des nächsten Schritts. Die N=4-Demo ist unabhängig vom laufenden Modell.",
    "Equiprobable microstates refer to this model’s stationary ensemble. The equilibrium histogram is not the conditional next-step distribution. The N=4 demo is independent of the live model."
  ],
  "k.model.markers.illustration": [
    "Markerpositionen sind schematisch. Die Vergleichsmarkierung im Histogramm verändert keinen Livezustand.",
    "Marker positions are schematic. A comparison highlight in the histogram changes no live state."
  ],
  "k.model.markers.misconception": [
    "Bei N=12 hat k=6 zwar die höchste Einzelwahrscheinlichkeit, aber nur etwa 22,56 %. Einzelne Folgen dürfen ln Ω senken.",
    "For N=12, k=6 has the largest individual probability, but only about 22.56%. Individual trajectories may decrease ln Ω."
  ],
  "k.model.thermal.title": [
    "Zwei isolierte Wärmekörper",
    "Two isolated thermal bodies"
  ],
  "k.model.thermal.overview": [
    "Passive Energieübertragung mit erhaltener Energie und nichtnegativer Gesamtentropieproduktion.",
    "Passive energy transfer with conserved energy and nonnegative total entropy production."
  ],
  "k.model.thermal.method": [
    "Analytische Lösung für zwei intern homogene Körper mit konstantem C_A, C_B und positivem G_th. Keine neue numerische Integration.",
    "Analytical solution for two internally uniform bodies with constant C_A, C_B and positive G_th. No new numerical integration."
  ],
  "k.model.thermal.units": [
    "T_A0,T_B0: 250–600 K; C: 1–10⁶ J/K; G_th: 0,001–1000 W/K; t: 0–10¹² s. Q/U in J, P in W, ΔS in J/K, σ in W/K.",
    "T_A0,T_B0: 250–600 K; C: 1–10⁶ J/K; G_th: 0.001–1000 W/K; t: 0–10¹² s. Q/U in J, P in W, ΔS in J/K, σ in W/K."
  ],
  "k.model.thermal.limits": [
    "Keine Umgebung, Arbeit, Strahlung, Strömung, Stoff- oder Phasenänderung. U = C_A T_A + C_B T_B verwendet einen Modellnullpunkt, keine absolute Materialenergie.",
    "No environment, work, radiation, flow, material or phase changes. U = C_A T_A + C_B T_B uses a model energy reference, not absolute material energy."
  ],
  "k.model.thermal.illustration": [
    "Temperaturkurven und Bilanzzahlen folgen der analytischen Lösung. Körperfarben und Verbindung sind schematisch. Balken bilden nur die bezeichneten berechneten Größen ab.",
    "Temperature curves and balance values follow the analytical solution. Body colours and connection are schematic. Bars represent only their labelled calculated quantities."
  ],
  "k.model.thermal.misconception": [
    "Der warme Körper verliert Entropie, während die Summe beider zunimmt. Das Lab berechnet keinen Motor, keine Exergie und keine kosmologische Zukunft.",
    "The warmer body loses entropy while the sum for both increases. The lab calculates no engine, exergy or cosmological future."
  ],
  "k.ui.short": [
    "Kurz erklärt",
    "In brief"
  ],
  "k.ui.advanced": [
    "Genauer verstehen",
    "Understand more"
  ],
  "k.ui.model": [
    "Modell & Quellen",
    "Model & sources"
  ],
  "k.ui.sources": [
    "Quellen für diese Aussage",
    "Sources for this claim"
  ],
  "k.ui.method": [
    "Was wird gerechnet?",
    "What is calculated?"
  ],
  "k.ui.units": [
    "Größen und Einheiten",
    "Quantities and units"
  ],
  "k.ui.limits": [
    "Annahmen und Grenzen",
    "Assumptions and limits"
  ],
  "k.ui.illustration": [
    "Was ist nur Darstellung?",
    "What is illustrative?"
  ],
  "k.ui.misconception": [
    "Häufiger Irrtum",
    "Common misconception"
  ],
  "k.ui.formulas": [
    "Formeln und Variablen",
    "Formulas and variables"
  ],
  "k.ui.index": [
    "Modelle nachschlagen",
    "Browse models"
  ],
  "k.ui.quick": [
    "Begriff kurz erklären: {term}",
    "Explain briefly: {term}"
  ],
  "k.ui.return": [
    "Zurück zur Ausgangsstelle",
    "Return to the starting point"
  ],
  "k.ui.sourceNote": [
    "Quellen belegen die genannten Konzepte. Sie sind keine unabhängige Zertifizierung dieser App.",
    "Sources support the stated concepts. They do not independently certify this app."
  ],
  "k.ui.sourceCode": [
    "Projektcode · Implementierungsbeleg, keine externe Fachquelle",
    "Project code · implementation evidence, not an external scientific source"
  ],
  "k.ui.guideNote": [
    "Ein Glossar, dieselben Begriffe in allen Laboren. Details und Quellen sind freiwillig.",
    "One glossary, the same terms across all labs. Details and sources are optional."
  ],
  "k.ui.close": [
    "Erklärung schließen",
    "Close explanation"
  ],
  "k.question.gravity.question": [
    "Warum kann ein Körper fallen und trotzdem auf einer Umlaufbahn bleiben?",
    "How can a falling body remain in orbit?"
  ],
  "k.question.gravity.observe": [
    "Die Körper ziehen sich an und bewegen sich mit ihrer gewählten Anfangsgeschwindigkeit.",
    "Bodies attract one another and move with their chosen initial velocities."
  ],
  "k.question.gravity.cause": [
    "Seitliche Bewegung und fortlaufende gravitative Ablenkung können eine Umlaufbahn ermöglichen. Die Startwerte entscheiden auch darüber, ob eine Bahn gebunden ist.",
    "Tangential motion and continual gravitational deflection can produce an orbit. Initial conditions also determine whether a trajectory is bound."
  ],
  "k.question.gravity.use": [
    "So lassen sich Satellitenbahnen und Raumfahrtmanöver grundsätzlich verstehen; konkrete Missionen benötigen genauere Daten und Modelle.",
    "This helps explain satellite orbits and spacecraft manoeuvres; actual missions require more precise data and models."
  ],
  "k.question.gravity.limit": [
    "Hier: geglättete Newton-Numerik, keine relativistische Bahnvorhersage. Endpunktprüfungen können Streifkollisionen übersehen.",
    "Here: softened Newtonian numerics, not relativistic orbit prediction. Endpoint checks can miss grazing collisions."
  ],
  "k.question.gravity.quiz": [
    "Ändert eine andere seitliche Anfangsgeschwindigkeit bei sonst gleichen Bedingungen die Bahn?",
    "Does a different tangential initial velocity change the trajectory when other conditions stay the same?"
  ],
  "k.question.gravity.answer": [
    "Ja. Masse, Position und Geschwindigkeit bestimmen gemeinsam die Bewegung. Eine Änderung kann eine andere gebundene oder ungebundene Bahn ergeben; nicht jeder Wert führt zum selben Orbittyp.",
    "Yes. Mass, position and velocity jointly determine motion. A change can produce a different bound or unbound path; not every value gives the same orbit type."
  ],
  "k.question.gravity.try": [
    "Wähle bewusst einen Körper und pausiere. Öffne „Körper bearbeiten“, ändere eine Geschwindigkeitskomponente und drücke selbst „Übernehmen“. Vergleiche die Bahn; Reset stellt das gewählte Szenario wieder her.",
    "Choose a body deliberately and pause. Open Edit body, change a velocity component and explicitly press Apply. Compare the path; Reset restores the selected scenario."
  ],
  "k.question.gravity.option0": [
    "Ja, die Anfangsgeschwindigkeit gehört zur Bahn.",
    "Yes, initial velocity helps determine the path."
  ],
  "k.question.gravity.option1": [
    "Nein, allein die Masse legt die Bahn fest.",
    "No, mass alone fixes the path."
  ],
  "k.question.blackhole.question": [
    "Was ist ein Ereignishorizont eigentlich?",
    "What is an event horizon?"
  ],
  "k.question.blackhole.observe": [
    "Der Rechner verbindet Masse, Horizont-Radius und theoretische Strahlungsgrößen im Schwarzschild-Modell.",
    "The calculator relates mass, horizon radius and theoretical radiation quantities in the Schwarzschild model."
  ],
  "k.question.blackhole.cause": [
    "Der Horizont ist eine kausale Grenze der Raumzeit, keine feste Kugeloberfläche. Aus seinem Inneren erreicht kein zukünftiges Lichtsignal die ferne Außenwelt.",
    "The horizon is a causal boundary of spacetime, not a solid sphere. No future-directed light signal from inside reaches the distant exterior."
  ],
  "k.question.blackhole.use": [
    "Das hilft, Beobachtungen kompakter Objekte von Modellaussagen zu unterscheiden. Ein beobachteter Emissionsring ist nicht der Horizont selbst.",
    "This helps distinguish observations of compact objects from model statements. An observed emission ring is not the horizon itself."
  ],
  "k.question.blackhole.limit": [
    "Ungeladen und nicht rotierend. Hawking-Leistung und Lebensdauer sind Modellschätzungen; keine berechnete Akkretionsscheibe oder Lichtbahn.",
    "Uncharged and non-rotating. Hawking power and lifetime are model estimates; no accretion disk or light path is calculated."
  ],
  "k.question.blackhole.quiz": [
    "Was geschieht mit rₛ, wenn die Masse im Schwarzschild-Modell verdoppelt wird?",
    "What happens to rₛ when mass doubles in the Schwarzschild model?"
  ],
  "k.question.blackhole.answer": [
    "rₛ = 2GM/c² ist proportional zu M. Doppelte Masse ergibt doppelten Horizont-Radius; die Hawking-Temperatur verhält sich dagegen umgekehrt zur Masse.",
    "rₛ = 2GM/c² is proportional to M. Twice the mass gives twice the horizon radius; Hawking temperature instead scales inversely with mass."
  ],
  "k.question.blackhole.try": [
    "Wähle selbst „Sonnenmasse“. Notiere rₛ, verdopple die Masseneingabe auf 3.97694e30 kg und verlasse das Feld. Vergleiche die Zahlen, nicht die scheinbare Größe eines Bildes.",
    "Choose Solar mass yourself. Note rₛ, double the mass input to 3.97694e30 kg and leave the field. Compare the numbers, not an image’s apparent size."
  ],
  "k.question.blackhole.option0": [
    "Der Radius verdoppelt sich.",
    "The radius doubles."
  ],
  "k.question.blackhole.option1": [
    "Der Radius halbiert sich.",
    "The radius halves."
  ],
  "k.question.blackhole.option2": [
    "Der Radius bleibt gleich.",
    "The radius stays unchanged."
  ],
  "k.question.objects.question": [
    "Warum ist ein dichter Sternrest nicht automatisch ein Schwarzes Loch?",
    "Why is a dense stellar remnant not automatically a black hole?"
  ],
  "k.question.objects.observe": [
    "Verglichen werden zwei festgelegte Sternrest-Beispiele und ein Schwarzschild-Loch.",
    "The comparison uses two chosen stellar-remnant examples and a Schwarzschild black hole."
  ],
  "k.question.objects.cause": [
    "Gravitation und mikrophysikalische Stützung bestimmen die Struktur. Hier werden die Sternradien vorgegeben; wir lösen keine Sternentwicklung oder Zustandsgleichung.",
    "Gravity and microscopic support determine structure. Stellar radii are prescribed here; we solve neither stellar evolution nor an equation of state."
  ],
  "k.question.objects.use": [
    "Weiße Zwerge und Pulsare machen kompakte Sternreste astronomisch zugänglich. Nicht jeder Neutronenstern wird als Pulsar beobachtet.",
    "White dwarfs and pulsars make compact remnants accessible to astronomy. Not every neutron star is observed as a pulsar."
  ],
  "k.question.objects.limit": [
    "Materialradius und Horizont sind verschieden. Leuchten, Scheibe und Pulsarkegel sind illustrativ; eine Logskala ist kein maßstäbliches Bild.",
    "A material radius and a horizon are different. Glow, disk and pulsar cones are illustrative; a logarithmic scale is not a picture to scale."
  ],
  "k.question.objects.quiz": [
    "Kann ein sehr kleiner Radiusbalken linear fast verschwinden, obwohl er auf der Logskala sichtbar ist?",
    "Can a tiny radius bar almost disappear on a linear scale while remaining visible on a logarithmic scale?"
  ],
  "k.question.objects.answer": [
    "Ja. Linear sind Balken proportional zum Radius. Der logarithmische Vergleich verteilt Größenordnungen auf die Anzeige; er vergrößert nicht das reale Objekt.",
    "Yes. Linear bars are proportional to radius. The logarithmic comparison spreads orders of magnitude across the display; it does not enlarge the real object."
  ],
  "k.question.objects.try": [
    "Schalte den vorhandenen Größenvergleich selbst zwischen linear und logarithmisch um. Lies die Radien und den Skalenhinweis gemeinsam.",
    "Switch the existing size comparison between linear and logarithmic yourself. Read the radii together with the scale note."
  ],
  "k.question.objects.option0": [
    "Ja, maßgeblich bleiben die Zahlen und die Skalenart.",
    "Yes; the numbers and scale type remain authoritative."
  ],
  "k.question.objects.option1": [
    "Nein, beide Skalen zeigen dieselben relativen Längen.",
    "No, both scales show the same relative lengths."
  ],
  "k.question.temperature.question": [
    "Bedeutet heißer auch insgesamt energiereicher?",
    "Does hotter mean more total energy?"
  ],
  "k.question.temperature.observe": [
    "Die Skala vergleicht Temperaturen, keine vollständigen Energiemengen beliebiger Stoffe.",
    "The scale compares temperatures, not complete energy contents of arbitrary materials."
  ],
  "k.question.temperature.cause": [
    "Temperatur allein genügt nicht: Menge, Stoff und Zustand sind ebenfalls wichtig. Ein winziges heißes System kann weniger Energie enthalten als ein sehr großes kühleres.",
    "Temperature alone is insufficient: amount, material and state also matter. A tiny hot system can contain less energy than a much larger cooler one."
  ],
  "k.question.temperature.use": [
    "Das ist für Heizungen und Kühlung ebenso wichtig wie beim Vergleich mit Sternplasmen. Die physikalischen Bedingungen sind dabei verschieden.",
    "This matters for heating and cooling as well as comparisons with stellar plasmas. Their physical conditions differ."
  ],
  "k.question.temperature.limit": [
    "Kein Material- oder Plasma-Solver. Die Übernahmebrücke erlaubt nur 250–600 K und schreibt erst einen Entwurf; „Übernehmen“ bleibt eine eigene Handlung.",
    "No material or plasma solver. The transfer bridge accepts only 250–600 K and creates a draft; Apply remains a separate action."
  ],
  "k.question.temperature.quiz": [
    "Kann man die gesamte thermische Energie allein aus einer Temperatur ablesen?",
    "Can total thermal energy be read from temperature alone?"
  ],
  "k.question.temperature.answer": [
    "Nein. Selbst bei konstantem C gilt ΔU = C·ΔT relativ zu einem Bezug. Eine Verdopplung der absoluten Kelvinzahl ist nicht allgemein eine Verdopplung derselben Energieänderung.",
    "No. Even at constant C, ΔU = C·ΔT uses a reference. Doubling an absolute kelvin value does not generally double the same energy change."
  ],
  "k.question.temperature.try": [
    "Wähle selbst ein Temperaturbeispiel. Nur ein zulässiger Wert kann im Wärmeexperiment vorgemerkt werden. Ändere dort bewusst eine Wärmekapazität und übernimm den Entwurf, um den Modellunterschied zu untersuchen.",
    "Choose a temperature example yourself. Only an allowed value can be drafted for the heat experiment. Deliberately change a heat capacity there and apply the draft to explore the model difference."
  ],
  "k.question.temperature.option0": [
    "Nein, weitere Eigenschaften des Systems sind nötig.",
    "No, other properties of the system are needed."
  ],
  "k.question.temperature.option1": [
    "Ja, doppelte Kelvinzahl bedeutet immer doppelte Energieänderung.",
    "Yes, twice the kelvin value always means twice the energy change."
  ],
  "k.question.markers.question": [
    "Warum gibt es viel mehr ungefähr ausgeglichene Anordnungen?",
    "Why are there many more roughly balanced arrangements?"
  ],
  "k.question.markers.observe": [
    "Nummerierte Marker ergeben ein konkretes Muster; k zählt lediglich die Marker links.",
    "Numbered markers form a concrete pattern; k only counts markers on the left."
  ],
  "k.question.markers.cause": [
    "Viele Muster können dieselbe Linksanzahl haben. Bei zwölf Markern passen 924 Muster zu k=6, aber nur eines zu k=12.",
    "Many patterns share the same left count. For twelve markers, 924 patterns have k=6, but only one has k=12."
  ],
  "k.question.markers.use": [
    "So wird Zählen zur Wahrscheinlichkeit: eine Grundlage von Statistik und statistischer Physik, keine Simulation realer Gasbahnen.",
    "Counting becomes probability: a basis of statistics and statistical physics, not a simulation of real gas trajectories."
  ],
  "k.question.markers.limit": [
    "Gleichgewichtsverteilung ≠ nächster Mischschritt. Bei N=12 beträgt P_eq(6) etwa 22,56 %, keine absolute Mehrheit. Einzelne Fluktuationen dürfen ln Ω senken.",
    "Equilibrium distribution ≠ next mixing step. For N=12, P_eq(6) is about 22.56%, not an absolute majority. Individual fluctuations may decrease ln Ω."
  ],
  "k.question.markers.quiz": [
    "Sind bei N=12 mehr Muster mit sechs links möglich als mit zwölf links?",
    "For N=12, are more patterns possible with six left than with twelve left?"
  ],
  "k.question.markers.answer": [
    "Ja. Ω = C(N,k) zählt die passenden Muster. Im stationären Ensemble sind die 4096 einzelnen Muster gleich wahrscheinlich; Makrozustände mit mehr passenden Mustern sind dadurch wahrscheinlicher.",
    "Yes. Ω = C(N,k) counts compatible patterns. In the stationary ensemble the 4096 individual patterns are equally likely, so macrostates with more compatible patterns are more probable."
  ],
  "k.question.markers.try": [
    "Stelle N selbst auf 12 und vergleiche mit dem Linksregler k=6 und k=12. Beobachte Ω und P_eq. Ein neuer Mischschritt ist eine andere Frage; die separate N=4-Demo verändert den Livezustand nicht.",
    "Set N to 12 yourself and compare k=6 with k=12 using the left-count slider. Observe Ω and P_eq. A new mixing step is a different question; the separate N=4 demo changes no live state."
  ],
  "k.question.markers.option0": [
    "Ja: 924 gegenüber 1.",
    "Yes: 924 versus 1."
  ],
  "k.question.markers.option1": [
    "Nein: beide Makrozustände haben gleich viele Muster.",
    "No: both macrostates have the same number of patterns."
  ],
  "k.question.thermal.question": [
    "Warum fließt Netto-Wärme von warm nach kalt?",
    "Why does net heat flow from hot to cold?"
  ],
  "k.question.thermal.observe": [
    "Zwei isolierte Modellkörper tauschen Energie aus. A muss dabei nicht der wärmere Körper sein.",
    "Two isolated model bodies exchange energy. A need not be the warmer one."
  ],
  "k.question.thermal.cause": [
    "Das passive Leitwertgesetz P = G_th(T_A−T_B) bestimmt bei positivem G_th die Flussrichtung. Die Gesamtentropieproduktion ist dazu nichtnegativ; Energie bleibt erhalten.",
    "With positive G_th, the passive conductance law P = G_th(T_A−T_B) sets the flow direction. Total entropy production is nonnegative and energy is conserved."
  ],
  "k.question.thermal.use": [
    "Wärmeisolierung verzögert den Ausgleich; reale Kühlschränke benötigen zusätzlich Arbeit. Das ist hier kein simulierter Kühlschrank.",
    "Thermal insulation delays equilibration; real refrigerators additionally require work. A refrigerator is not simulated here."
  ],
  "k.question.thermal.limit": [
    "Zwei homogene Körper, konstante C und G_th, 250–600 K anfangs; keine Umgebung, Arbeit oder Phasenwechsel. Die Energienullpunkte sind Modellreferenzen.",
    "Two uniform bodies, constant C and G_th, initial 250–600 K; no surroundings, work or phase changes. Energy zero points are model references."
  ],
  "k.question.thermal.quiz": [
    "Gibt es in diesem passiven Modell Netto-Wärmefluss, wenn beide Körper gleich warm starten?",
    "Does this passive model have net heat flow when both bodies start at the same temperature?"
  ],
  "k.question.thermal.answer": [
    "Nein. Die Temperaturdifferenz ist null, daher ist die Nettoleistung null. Auch nach einem Zeitschritt bleiben beide Temperaturen gleich, und die Gesamtentropieänderung bleibt null.",
    "No. The temperature difference is zero, so net power is zero. Both temperatures remain equal after a time step and total entropy change stays zero."
  ],
  "k.question.thermal.try": [
    "Wähle das Preset „Gleiche Anfangstemperatur“ selbst und drücke ausdrücklich „Übernehmen“. Gehe dann zehn Modellsekunden weiter und vergleiche P, ΔS und U.",
    "Choose the Equal initial temperature preset yourself and explicitly press Apply. Then advance ten model seconds and compare P, ΔS and U."
  ],
  "k.question.thermal.option0": [
    "Nein: P = 0 und σ = 0.",
    "No: P = 0 and σ = 0."
  ],
  "k.question.thermal.option1": [
    "Ja, die Energie muss trotzdem laufend hinüberfließen.",
    "Yes, energy must still continually flow across."
  ],
  "k.question.ui.observe": [
    "Was sehe ich?",
    "What am I seeing?"
  ],
  "k.question.ui.cause": [
    "Warum?",
    "Why?"
  ],
  "k.question.ui.use": [
    "Wozu ist das nützlich?",
    "Why is this useful?"
  ],
  "k.question.ui.limit": [
    "Modellgrenze",
    "Model limit"
  ],
  "k.question.ui.predict": [
    "Was glaubst du, passiert?",
    "What do you think will happen?"
  ],
  "k.question.ui.check": [
    "Antwort prüfen",
    "Check answer"
  ],
  "k.question.ui.show": [
    "Lösung anzeigen",
    "Show solution"
  ],
  "k.question.ui.choose": [
    "Wähle eine Antwort oder zeige die Lösung an.",
    "Choose an answer or show the solution."
  ],
  "k.question.ui.correct": [
    "Diese Vermutung passt zum Modell.",
    "This prediction matches the model."
  ],
  "k.question.ui.incorrect": [
    "Im beschriebenen Modell gilt die andere Erklärung.",
    "This model gives a different explanation."
  ],
  "k.question.ui.solution": [
    "Modellantwort",
    "Model answer"
  ],
  "k.question.ui.try": [
    "Im Labor ausprobieren",
    "Try it in the lab"
  ],
  "k.question.ui.locate": [
    "Steuerelement finden",
    "Find the control"
  ],
  "k.question.ui.unavailable": [
    "Das Steuerelement ist in diesem Kontext gerade nicht verfügbar.",
    "That control is not currently available in this context."
  ],
  "k.question.ui.more": [
    "Mehr Fragen und Anwendungen",
    "More questions and applications"
  ],
  "k.question.ui.markersTitle": [
    "Teilchen & Wahrscheinlichkeit",
    "Particles & probability"
  ],
  "k.question.ui.thermalTitle": [
    "Wärme & Entropie",
    "Heat & entropy"
  ],
  "k.learning.demo.title": [
    "Vier Marker selbst umlegen · unabhängiges Beispiel",
    "Move four markers yourself · independent example"
  ],
  "k.learning.demo.scope": [
    "Diese N=4-Demo ist unabhängig vom laufenden Experiment. A–D behalten ihre Identität; nur links/rechts zählt. Kein Zufall, keine Modellzeit, keine Änderungen an N oder k im laufenden Experiment.",
    "This N=4 demo is independent of the running experiment. A–D retain their identity; only left/right counts. No randomness, no model time, no changes to N or k in the running experiment."
  ],
  "k.learning.demo.toggle": [
    "Marker {marker}: {side}. Aktivieren wechselt die Kammer.",
    "Marker {marker}: {side}. Activate to switch chambers."
  ],
  "k.learning.demo.left": [
    "links",
    "left"
  ],
  "k.learning.demo.right": [
    "rechts",
    "right"
  ],
  "k.learning.demo.summary": [
    "Makrozustand: {left} links / {right} rechts · Ω = {omega} von 16 Mustern · P_eq = {probability} · ln Ω = {entropy} (dimensionslos).",
    "Macrostate: {left} left / {right} right · Ω = {omega} of 16 patterns · P_eq = {probability} · ln Ω = {entropy} (dimensionless)."
  ],
  "k.learning.demo.patterns": [
    "Alle {count} Mikrozustände mit dieser Anzahl links",
    "All {count} microstates with this number on the left"
  ],
  "k.learning.demo.pattern": [
    "Muster {index}: {pattern}",
    "Pattern {index}: {pattern}"
  ],
  "k.learning.demo.patternNote": [
    "Jede Zeile ordnet A, B, C und D einer Kammer zu. Zeilen sind gleich wahrscheinlich im festgelegten Gleichgewichtsensemble; Positionen im Bild erzeugen keine zusätzlichen Zustände.",
    "Each row assigns A, B, C and D to a chamber. Rows are equally probable in the defined equilibrium ensemble; image positions create no additional states."
  ],
  "k.learning.compare.title": [
    "Zwei Makrozustände vergleichen · Modell unverändert",
    "Compare two macrostates · model unchanged"
  ],
  "k.learning.compare.balanced": [
    "Ausgeglichenes k hervorheben",
    "Highlight a balanced k"
  ],
  "k.learning.compare.edge": [
    "Alle links hervorheben",
    "Highlight all on the left"
  ],
  "k.learning.compare.row": [
    "{label}: k = {k}, Ω = {omega}, P_eq = {probability}, ln Ω = {entropy}.",
    "{label}: k = {k}, Ω = {omega}, P_eq = {probability}, ln Ω = {entropy}."
  ],
  "k.learning.compare.labelBalanced": [
    "Ausgeglichen",
    "Balanced"
  ],
  "k.learning.compare.labelEdge": [
    "Alle links",
    "All left"
  ],
  "k.learning.compare.note": [
    "Orange Markierung: gewählter Vergleich im vorhandenen Gleichgewichtsdiagramm und in der Tabelle. Weißer Pfeil: tatsächliches k. Diese Auswahl versetzt keine Marker. Die häufigste einzelne Verteilung ist nicht automatisch eine Mehrheit aller Fälle; für N=1 sind beide gleich häufig.",
    "Orange highlight: selected comparison in the existing equilibrium chart and table. White arrow: actual k. This selection moves no markers. The most frequent individual split need not be a majority of all cases; for N=1 both are equally likely."
  ],
  "k.learning.compare.units": [
    "ln Ω ist hier eine dimensionslose Boltzmann-Zählgröße S_Modell/k_B. Das entspricht nicht der Entropie aller Gaspositionen oder Energien und lässt sich nicht zu den J/K des Wärmeexperiments addieren.",
    "Here ln Ω is a dimensionless Boltzmann counting quantity S_model/k_B. It does not include all gas positions or energies and cannot be added to the heat experiment’s J/K."
  ],
  "k.learning.compare.next": [
    "Gleichgewicht ist keine Vorhersage des nächsten Schritts: von k=N liegt der Erwartungswert danach bei 0,75 N (q=1/4 je Marker). Einzelne Schritte dürfen ln Ω verkleinern.",
    "Equilibrium does not predict the next step: from k=N the next expectation is 0.75 N (q=1/4 per marker). Individual steps may decrease ln Ω."
  ],
  "k.learning.balance.title": [
    "Energie bleibt. Entropie wird erzeugt.",
    "Energy is conserved. Entropy is produced."
  ],
  "k.learning.balance.scope": [
    "Die Balken lesen den angewandten Wärme-Modellzustand. Entwürfe verändern sie erst nach „Übernehmen“. J und J/K bleiben getrennt; keine gemeinsame Skala.",
    "The bars read the applied heat-model state. Drafts change them only after Apply. J and J/K remain separate; there is no shared scale."
  ],
  "k.learning.balance.energy": [
    "Energiebilanz · J",
    "Energy balance · J"
  ],
  "k.learning.balance.energyRow": [
    "Körper {body}: U = {energy} J · übertragen ΔU = {transfer} J",
    "Body {body}: U = {energy} J · transferred ΔU = {transfer} J"
  ],
  "k.learning.balance.total": [
    "U_A + U_B = {total} J · Anfang {initial} J · Rechenrest {error} J.",
    "U_A + U_B = {total} J · initial {initial} J · numerical residual {error} J."
  ],
  "k.learning.balance.energyNote": [
    "U_i = C_i T_i mit festem Modellnullpunkt. Balken: Anteil an der anfänglichen Gesamtenergie (gemeinsame Skala). Das ist eine Bilanzhilfe für konstantes C, keine universelle absolute Materialenergie.",
    "U_i = C_i T_i with a fixed model reference. Bars show fractions of initial total energy (shared scale). This is an accounting aid for constant C, not universal absolute material energy."
  ],
  "k.learning.balance.entropy": [
    "Entropiebilanz · ΔS in J/K",
    "Entropy balance · ΔS in J/K"
  ],
  "k.learning.balance.entropyRow": [
    "{body}: {value} J/K",
    "{body}: {value} J/K"
  ],
  "k.learning.balance.sum": [
    "Gesamt",
    "Total"
  ],
  "k.learning.balance.production": [
    "Entropieproduktion σ = {value} W/K. Dies ist keine Wärmeleistung.",
    "Entropy production σ = {value} W/K. This is not heat power."
  ],
  "k.learning.balance.entropyNote": [
    "Nullachse in der Mitte; negative Änderungen links, positive rechts. Gemeinsame Skala je Moment, Werte sind maßgeblich. ΔS_total wird numerisch stabil berechnet; gerundete Einzelwerte können in der letzten Stelle abweichen.",
    "Zero axis in the centre; negative changes left, positive right. Shared scale at each instant; numbers are authoritative. ΔS_total uses stable numerical evaluation; rounded individual values may differ in the last digit."
  ],
  "k.learning.balance.lesson": [
    "Beim passiven Ausgleich nimmt die Temperaturdifferenz ab, während die Gesamtenergie erhalten bleibt. Eine geeignete Maschine könnte aus Temperaturunterschieden Arbeit gewinnen; dieses Modell enthält keine Maschine und berechnet kein Arbeitsmaximum. Bei gleichen Temperaturen sind Nettoleistung und Entropieproduktion null.",
    "Passive equilibration reduces the temperature difference while conserving total energy. A suitable engine could extract work from temperature differences; this model contains no engine and computes no maximum work. At equal temperatures net power and entropy production are zero."
  ],
  "k.learning.extras.title": [
    "Mehr Fragen · Alltag und Modellgrenzen",
    "More questions · everyday physics and model limits"
  ],
  "k.learning.extras.tea.title": [
    "Warum wird Tee kalt?",
    "Why does tea cool?"
  ],
  "k.learning.extras.tea.text": [
    "Bei einem Temperaturunterschied kann Energie durch Wärmeleitung, Strömung, Verdunstung und Strahlung an die Umgebung gehen. Ein echtes Teeglas ist meist ein offenes System. Unser isoliertes Körperpaar zeigt nur den idealisierten Austausch zwischen zwei homogenen Körpern, ohne diese Mechanismen einzeln zu berechnen.",
    "With a temperature difference, energy can pass to the surroundings by conduction, convection, evaporation and radiation. A real cup of tea is usually an open system. Our isolated pair only illustrates idealised exchange between two uniform bodies; it does not calculate those mechanisms separately."
  ],
  "k.learning.extras.thermos.title": [
    "Was macht eine Thermoskanne?",
    "What does a vacuum flask do?"
  ],
  "k.learning.extras.thermos.text": [
    "Isolierung vermindert den Wärmeaustausch. Sie schaltet Entropie nicht ab. Kleineres G_th verlängert hier die Zeitkonstante, bildet aber weder Vakuumwände, Deckelverluste noch Strahlung eines echten Gefäßes vollständig ab.",
    "Insulation reduces heat exchange. It does not switch entropy off. A smaller G_th increases this model’s time constant, but does not fully describe vacuum walls, lid losses or radiation in a real flask."
  ],
  "k.learning.extras.fridge.title": [
    "Wie kann ein Kühlschrank innen kälter werden?",
    "How can a refrigerator become colder inside?"
  ],
  "k.learning.extras.fridge.text": [
    "Ein Kühlschrank braucht Arbeit und gibt Energie als Wärme an die Umgebung ab. Die Entropie des Innenraums darf abnehmen; die Bilanz muss Kühlschrank und Umgebung einschließen. Unser passives isoliertes Körperpaar hat weder Arbeitszufuhr noch Kältemittelkreislauf und simuliert keinen Kühlschrank.",
    "A refrigerator requires work and releases energy as heat to its surroundings. Entropy inside may decrease; accounting must include the refrigerator and surroundings. Our passive isolated pair has no work input or refrigerant cycle and does not simulate a refrigerator."
  ],
  "k.learning.extras.engine.title": [
    "Warum kann ein Motor aus Wärme Arbeit gewinnen?",
    "Why can an engine obtain work from heat?"
  ],
  "k.learning.extras.engine.text": [
    "Eine Wärmekraftmaschine kann beim Wärmetransport zwischen heißem und kaltem Reservoir einen Teil der Energie in Arbeit umsetzen. Der zweite Hauptsatz begrenzt den Wirkungsgrad; vollständige zyklische Umwandlung aus einem einzigen Reservoir ist nicht möglich. Hier fehlen Arbeitsentnahme und Kreisprozess: Die Energie bleibt im Körperpaar, ein Wirkungsgrad wird nicht berechnet.",
    "A heat engine can convert part of the energy into work while transferring heat between hot and cold reservoirs. The second law limits efficiency; complete cyclic conversion from a single reservoir is impossible. Work extraction and a cycle are absent here: energy stays in the pair, and no efficiency is calculated."
  ],
  "k.learning.extras.boundary.title": [
    "Weiterdenken: Struktur, Zeit und Universum",
    "Going further: structure, time and the universe"
  ],
  "k.learning.extras.boundary.text": [
    "Entropie ist nicht einfach sichtbares Chaos. Leben kann als offenes System lokal Struktur aufbauen und Energie sowie Entropie mit seiner Umgebung austauschen. Zeitpfeil und kosmologische Anfangsbedingungen verlangen weitere Annahmen. Expansion, Gravitation und Horizonte machen das Universum komplexer als zwei Kammern oder zwei Körper. Diese Demos beweisen weder Evolution noch ein bestimmtes Universumsende.",
    "Entropy is not simply visible chaos. As an open system, life can build local structure while exchanging energy and entropy with its surroundings. The arrow of time and cosmological initial conditions require further assumptions. Expansion, gravity and horizons make the universe more complex than two chambers or bodies. These demos prove neither evolution nor a particular fate of the universe."
  ],
};
export const knowledgeDE=Object.freeze(Object.fromEntries(Object.entries(messages).map(([k,v])=>[k,v[0]])));
export const knowledgeEN=Object.freeze(Object.fromEntries(Object.entries(messages).map(([k,v])=>[k,v[1]])));
