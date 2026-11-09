// Canonical bilingual content, merged into the existing i18n catalogs. No independent translator.
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
  "k.term.energy.label": [
    "Energie",
    "Energy"
  ],
  "k.term.energy.short": [
    "Energie wird übertragen und umgewandelt. Ihre Erhaltung bedeutet nicht, dass sie vollständig als Arbeit verfügbar bleibt.",
    "Energy is transferred and transformed. Conservation does not imply that it all remains available as work."
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
  ]
};
export const knowledgeDE=Object.freeze(Object.fromEntries(Object.entries(messages).map(([k,v])=>[k,v[0]])));
export const knowledgeEN=Object.freeze(Object.fromEntries(Object.entries(messages).map(([k,v])=>[k,v[1]])));
