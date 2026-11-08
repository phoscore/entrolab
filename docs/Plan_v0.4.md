# ENTROLAB v0.4 — Extreme Objects Lab

**Status:** Entwicklungsplan, noch keine Implementierung. Basis: erfolgreich gemergte v0.3 auf `main`, Commit `4a9c961ae709b909873c870cdd8c2e649b1c4505`. Arbeiten ausschließlich auf `develop/v0.4`. Keine Änderung an `main`, älteren Branches, `archive/v0.1` oder bestehender Website; kein Merge/Deployment ohne ausdrückliche Freigabe.

## Ziel und Reihenfolge

Ein eigener, visuell attraktiver Bereich **„Extreme Objects Lab“**, der extreme astronomische Körper und Temperaturen verständlich macht. Die v0.3-Gravitationssandbox und das vorhandene Black-Hole-Rechenlabor bleiben vollständig funktional. Priorität: **(A) anschauliche Schwarzes-Loch-Animation**, **(B) kompakte Vergleichsansicht für extreme Körper**, **(C) interaktive Extremtemperatur-Skala**. Kein grundloser Neubau der App.

Das Prinzip: verifizierbare Physik und idealisierte Modellrechnungen von der **schematischen bzw. künstlerischen Visualisierung** optisch und sprachlich trennen. Keine GR-Simulation behaupten, wenn nur Canvas-/CSS-Effekte benutzt werden. Kein neues Sci-Fi-Naturgesetz. Wenn einzelne Animationsfeatures ohne großen Mehraufwand nicht zuverlässig realisierbar sind, kleiner und ehrlich umsetzen.

## A — Schwarzes Loch, animierte Ansicht

1. Neue Lab-Ansicht mit attraktiver, flüssiger, responsiver Animation auf dunklem Hintergrund: zentraler Schatten/Horizont, optional ein- und ausschaltbare, rotierende, leuchtende **Akkretionsscheibe**, Hintergrundsterne und kontrollierbare Ansicht/Zoom soweit zuverlässig.
2. Labels und Vergleichsgeometrie für **nicht rotierendes, ungeladenes Schwarzschild-Loch**:
   - Ereignishorizont: Schwarzschild-Radius `r_s = 2GM/c²` (aus dem vorhandenen Physikmodul).
   - Photonensphäre: Radius `1,5 r_s` (schematisch; **nicht** gleichgesetzt mit dem visuell beobachteten Photonenring).
   - Innerste stabile Kreisbahn massiver Testteilchen (ISCO): `3 r_s` unter Schwarzschild-Annahmen; nicht allgemeiner Akkretionsscheibeninnenrand.
   - Masseneingabe bzw. einige Presets; Umrechnung des Radius mit vorhandenen Hilfsfunktionen; abhängige Skalen konsistent.
3. Akkretionsscheibe ist **optional**: Ein isoliertes Schwarzes Loch besitzt nicht zwangsläufig eine. Leuchten, Farben, Turbulenz, Relativitäts-Effekte und Lichtablenkung bei rein künstlerischer Canvas-Darstellung ausdrücklich als illustrativ kennzeichnen. Keine vorgetäuschte exakte Raytracing-Rechnung, keine exakte Emissionsfarbe/Strahlungsleistung aus reinem Artwork ableiten.
4. Bei Betrachtungswinkeländerung keine falsche Zusicherung, dass geometrische Verzerrung relativistisch berechnet wird. Falls keine seriöse Linsenrechnung im Budget: eine klar gekennzeichnete schematische Darstellung ist der bevorzugte Umfang.
5. Pause/Play, Animationstempo und ggf. einfache Qualitätsstufen. Rücksicht auf `prefers-reduced-motion` und ressourcenschwache Geräte. Kein Vollbild-Renderloop, wenn die Ansicht nicht sichtbar ist.

## B — Andere extreme Körper und Vergleich

1. Auswahl **Weißer Zwerg**, **Neutronenstern**, **Schwarzes Loch**. Für Weiße Zwerge/Neutronensterne representative, **explizit als Beispiel ausgewiesene** Massen und Radien; keine nicht begründete universelle Masse-Radius-Kurve oder eindeutige Zustandsgleichung behaupten. Geeignete Beispiele: Weißer Zwerg ungefähr 0,6 Sonnenmassen / ~7000 km Radius; Neutronenstern ungefähr 1,4 Sonnenmassen / ~12 km Radius. Kennzeichne dies als typische illustrative Werte, keine pauschalen Naturkonstanten.
2. Vergleich von Masse, Radius/Durchmesser, mittlerer Dichte **nur für Körper mit sinnvoll definiertem physischem Volumen**; beim Schwarzen Loch nicht die Horizontgröße als Materialoberfläche/Dichte eines festen Körpers ausgeben. Wenn eine formale mittlere Dichte innerhalb des Schwarzschild-Radius angezeigt wird, **als rein rechnerische Größe** kennzeichnen, nicht als reale lokale Materiedichte.
3. Grafischer Größenvergleich mit wählbarer linearer/logarithmischer Darstellung und Warnung, wenn Symbole visuell übertrieben sind. Keine falsche maßstabsgetreue Gleichzeitigdarstellung unterschiedlicher Größenordnungen.
4. Ruhige, hochwertige Animationen für die beiden Objekte; Pulsar-Kegel nur als optionales, eigens bezeichnetes Pulsar-Beispiel, nicht als Eigenschaft jedes Neutronensterns.
5. Sichtbare Quellen/Hinweise. Eine einfachere übersichtliche Ansicht ist besser als physikalisch unhaltbares Spektakel.

## C — Extreme Temperature Lab

1. Eigener Unterbereich oder aufklappbares Panel mit Kelvin/Celsius-Umrechnung **exakt**: `°C = K − 273,15`. Temperatur in Kelvin darf nicht negativ werden; Negative Celsiuswerte sind erlaubt.
2. **Beide vom Nutzer gewünschten Presets separat**: `0,1 K = −273,05 °C`, `0,001 K = −273,149 °C`. Optional außerdem 0 K als theoretischer Referenzpunkt. NIST als Referenz.
3. Gut bedienbare logarithmische Temperaturskala über viele Größenordnungen (nicht `log(0)`), mit nachvollziehbaren Beispielen (z. B. kosmische Hintergrundstrahlung ~2,725 K, Raumtemperatur, heiße Sterne), ohne falsche Gleichsetzung sehr unterschiedlicher physikalischer Situationen.
4. Eine **abstrakte, eindeutig illustrative** Animation für thermische Energie/Bewegung. Sie darf bei 0 K nicht pauschal behaupten, dass sämtliche quantenmechanische Bewegung „aufhört“; bei ultrakalten Systemen gelten Quanten-/Materialspezifika. Keine temperaturgetreue reale Darstellung von Materie ohne zugrunde liegendes Modell.
5. Getrennte Erklärung der **Hawking-Temperatur** eines schwarzen Lochs gegenüber einer gewöhnlichen Materialtemperatur; bestehende Formel nicht doppelt/abweichend implementieren.

## Code/Design/Umfang

- Vorhandene einfache Architektur (Browser-ES-Module, Canvas 2D, HTML/CSS, ohne Buildpflicht) bevorzugen. WebGL nur, wenn notwendig, mit reproduzierbaren Browser-Tests und Fallback.
- Bestehende `dist/physics.mjs` und der Integrator bleiben unverändert, sofern für ein neues, sauber getrenntes visuelles Modul keine zwingenden wissenschaftlichen Änderungen nötig sind.
- Neue Module logisch trennen: Daten/Einheiten, Visualisierung, UI. Kein heimlicher globaler Simulationszustand im Visualisierungscode.
- Die neue Ansicht soll visuell hochwertig aussehen, aber Menü, alte Experimente, wissenschaftliche Hinweise und Bedienbarkeit nicht verschlechtern.
- Keine Nutzerkonten, Server-Backend, externen Trackingdienste oder urheberrechtlich unklare Fremdmedien. Eigene prozedurale Effekte bevorzugen. Ggf. Quellenlinks als Dokumentation, nicht als unlizenzierte Bildressourcen.
- Hohe CPU/GPU-Auslastung vermeiden; Animation bei Inaktivität pausieren. Mobiltest vom Nutzer vorerst ausdrücklich **nicht als Freigabevoraussetzung**; trotzdem Basiskompatibilität bei 390 CSS-Pixeln berücksichtigen und nicht behaupten, realen Touch getestet zu haben.
- Wenn 3 große Teilbereiche die Qualität gefährden, **Black-Hole-Ansicht und korrekte Temperaturskala vorziehen**, Vergleich der kompakten Körper ggf. vereinfachen. Kein ungefragtes zweites Physiklabor mit Echtzeit-GR.

## Tests/Abnahme

1. **Alle bisherigen 58 Prüfungen** auf `main`/v0.3 unverändert erhalten, unveränderte historische Originalintegrität und zwölf numerische Benchmarks überprüfen.
2. Neue automatisierte Tests für exakte Kelvin/Celsius-Umrechnung inkl. 0,001 K/0,1 K/0 K, Negativ-Kelvin-Ablehnung, Log-Skalen-Grenzen und Nicht-Endlichkeit.
3. Schwarzes Loch: Radius-Massen-Skalierung, Photonensphäre/ISCO unter Schwarzschild-Annahmen, Einheiten/Konsistenz zu bestehendem Black-Hole-Labor; klare Trennung von visueller Scheinprojektion und abgeleiteter Physik.
4. Weißer Zwerg/Neutronenstern: geprüfte Referenzwerte/Quellen, korrekte Bezeichnung der Beispielannahmen, keine unzulässige Dichtebehauptung für BH.
5. Browser-Tests: UI-Wechsel, Play/Pause/Tab-Wechsel, schnelle Eingabeänderungen, mehrfache Wechsel, extreme zulässige/nicht-endliche Eingaben, keine Canvas-Ausnahmen, keine dauerhaften Animation-Leaks und ausreichende Responsivität auf kleinem Viewport.
6. Keine fachlich unbegründeten Präzisionsbehauptungen. Screenshots/Benchmarks nur als tatsächlich ausgeführt dokumentieren, keine Fantasiewerte.
7. Dokumentiere Änderungen, wissenschaftliche/visuelle Grenzen und Performance in `docs/Qualitaetsupdate_v0.4.md`; neue Tests in CI aufnehmen.
8. Kleine nachvollziehbare Commits; Pull Request **nach `main` zur unabhängigen Prüfung erstellen, nicht mergen**. Kein Deployment, keine Veröffentlichung.

## Physikalische Referenzen (zur fachlichen Prüfung)

- NIST Temperaturskala: https://www.nist.gov/pml/owm/si-units-temperature
- NASA Anatomy of Black Holes: https://science.nasa.gov/universe/black-holes/anatomy/
- NASA Black Hole Visualization: https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/
- NASA Extreme Conditions (white dwarfs / neutron stars): https://imagine.gsfc.nasa.gov/science/questions/conditions.html

Die Quellen sind Ausgangspunkte; spezifische Formeln, Objektparameter und Aussagen vor Veröffentlichung fachlich prüfen. Die NASA-Linsenvisualisierungen beruhen auf relativistischer Modellierung, die ENTROLAB nicht automatisch besitzt. Ihre bloße optische Nachahmung ist keine äquivalente Simulation.

## Vor Entwicklungsbeginn lesen

`AGENTS.md`, `docs/Plan_v0.4.md`, `docs/Qualitaetsupdate_v0.3.md`, `docs/Review_v0.3.md` sowie die v0.3-Tests. Veraltete v0.2/v0.3-spezifische Aussagen in branchlokalen Entwickleranweisungen nur auf `develop/v0.4` aktualisieren; Schutzregeln erhalten. Keine Änderung an `main` ohne Eigentümerfreigabe.
