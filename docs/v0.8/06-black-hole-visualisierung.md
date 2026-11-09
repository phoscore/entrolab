# Schritt 06 – Black Hole Lab: eindrucksvolle, aber wissenschaftlich ehrliche Visualisierung

## Ausführlicher DISKUSSIONSENTWURF für v0.8.5 – noch NICHT freigegeben

**Projekt:** Reincarnated as a Proton. **Phase:** Schritt 06 von 08, nach dem bereits freigegebenen Schritt 05. **Planungsort:** `develop/v0.8/docs/v0.8/`, ausschließlich zur gemeinsamen Abstimmung. **Spätere Umsetzung:** v0.8.5 auf eigenem Branch, der erst aus geprüfter und separat veröffentlichungsfreigegebener v0.8 erstellt wird. Bis dahin **keine Codeänderung, kein GitHub-Merge und kein Cloudflare-Deployment**.

**Abhängigkeiten:** Name/rotes skizzenhaftes Monster (Schritt 01), eine sichtbare freiwillige Hauptfrage je aktivem Lab mit optionalem Prognose-Experiment (Schritt 02), kanonisches Wissen/Modelle/Quellen (Schritt 04), freiwilliger neuer Guide (Schritt 05), konsistentes Design/Performance (Schritt 08). `AGENTS.md` und bestehende Qualitätsnachweise vor jeder Umsetzung erneut lesen.

## 1. Bestandsaufnahme des tatsächlichen v0.7-Codes

Aus `dist/index.html`, `dist/app.mjs`, `dist/physics.mjs` auf dem aktuellen freigegebenen `main`-Stand:

- **Black Hole Lab besteht heute primär aus einem Massenexperiment, vier numerischen Größen und zwei Canvas-Diagrammen.** Bestehender Input `#bhMass` mit gültiger Masse **1–10^41 kg**, logarithmischer Slider `#bhSlider`, Presets u. a. 10^9 kg, Erd-/Sonnenmasse, Sagittarius A* und M87*. Referenzmassen sind Orientierungswerte.
- `blackHole(m)` liefert `r_s=2GM/c²` (m), semiklassische Hawking-`T=ℏc³/(8πGMk_B)` (K), **stark idealisierte** nur-Photonen-`P=ℏc⁶/(15360πG²M²)` (W), `τ=5120πG²M³/(ℏc⁴)` (s). Schätzungen für leeres Universum/Schwarzkörper: keine Greybody-Faktoren, kein vollständiges Teilchenspektrum, keine Akkretion, keine zuverlässige Aussage über letzte Quantenphase. Der Kommentar zu kosmischer Hintergrundstrahlung muss erhalten bleiben.
- `drawLab()` zeichnet ein **logarithmisches Radienvergleichs-Canvas `#sizes`** und ein **log–log-Skalierungsdiagramm `#bhChart`**. Weder Bildzeichen noch Diagramm berechnen relativistische Lichtgeodäten. `app.mjs` besitzt bislang **keine dedizierte photorealistische Akkretionsscheiben-/Lensing-/Photon-Ring-Simulation im Black Hole Lab.**
- Im getrennten Gravity-Canvas kann ein typisierter `hole`-Körper schematisch dunkel/glühend gezeichnet werden. Die Newtonsche 2D-Sandbox simuliert **keine** relativistischen geodätischen Lichtbahnen oder Akkretion; diese Darstellung ist kein Ersatz für einen visuellen Black-Hole-Lab-Kernbereich.
- **Bestehende Funktionen unverändert korrekt erhalten:** Massenvalidierung, alle vier Zahlen/Formeln, Quellen/Begrenzungshinweise, Radienvergleich und Logarithmusskalen. Im Umsetzungsprozess prüfen, ob UI-Details sich durch v0.8 verändert haben.

## 2. Zielbild: ein zentraler visueller „Aha“-Bereich, kein Sci-Fi-Solver

Das Labor soll ein außergewöhnliches, ruhiges und erkennbares **kosmisches Hauptmotiv** bekommen, das auf Eingaben reagiert und die korrekten Rechenwerte emotional und didaktisch greifbar macht. Der Nutzer darf die Darstellung auch bei schwacher Hardware problemlos abschalten; eigentliche Physikwerte bleiben dominierend.

**Gestaltungsrichtung:**
- Dunkle, nahezu schwarze Szene, wenige gezielte Glanz-/Rot-/Orange-/Weiß-Akzente als leuchtendes Gas und Licht, harmonisiert mit der **rot-schwarzen einfachen Skizzen-Brandfigur**. Ein bewusst stilisiertes 2D/2.5D-Bild wirkt aufgeräumter und schneller als ein pseudo-physikalischer 3D-Materialsimulator.
- **Ein einzelner Visualisierungsbereich**, keine drei konkurrierenden ständig bewegten Canvas-Kacheln. Darstellung mit klaren, optionalen Ansichtsumschaltern; Messwerte, existierende Charts und Quellen bleiben erreichbar und identifizierbar.
- In der Standardansicht eine dunkel-scharfe Zentralsilhouette, verformte leuchtende Akretionsscheiben-Anmutung **nur als schematisches Beispiel**, dezent wandernde Helligkeit und gebogene Lichtlinien. Keine „schwarze Kugeloberfläche“; keine Explosion oder frei erfundene Jet-Automatik.
- Das neue Bild zeigt **kein konkretes Teleskopfoto** und keine wissenschaftliche Vollberechnung. Ruhiger, sinnvoller Animationstakt, optionale Pause und ein statisches Ersatzbild.

## 3. Drei mögliche Ansichten – als Layoutkonzept, keine drei Engines

### Ansicht A – „Schwarzes Loch & Umgebung“ (empfohlene Startansicht)

- **Schematische schwarze Horizont-Region** (nicht als Materialoberfläche), dynamischer, dünner Glühring und **optional** eine schräg betrachtete ringförmige Akkretionsscheibe als explizites *hypothetisches* Umgebungsbeispiel. Der helle Ring der Umgebung ist nicht gleich dem Ereignishorizont. Schwacher Lichteffekt/Versatz als Illustration; Halo nicht als physikalisch exakter Strahlengang ausgeben.
- Beschriftete Umschaltzustände **„ruhig / Umgebung mit Gas“** (falls für die UI erwünscht) sind ehrlicher als die automatische Behauptung, jedes Loch habe eine Akkretionsscheibe. Bei Kleinstmassen bleibt die Gas-Scheibe aus oder klar als rein künstlerisch, nicht astrophysikalisch sinnvoll markiert. **Die Eingabemasse allein bestimmt nicht Akkretionsrate, Scheibentemperatur, Lichtfarbe oder Beobachterposition.**
- Die bestehende `r_s`-Zahl ist präzise (innerhalb Schwarzschild-Modell), aber die Pixelgröße des Zentrumselements **nicht** über alle 41 Dekaden linear maßstabsgetreu. Symbolische Größen-Skalierung explizit angeben. Warnung, falls jemand die gemalte Dunkelfläche mit dem gemessenen Schatten verwechselt.

### Ansicht B – „Wohin geht das Licht?“ (qualitativer Lernblick)

- Ruhige, einzeln erkennbare **schematisch gekrümmte Lichtwege** um das zentrale Loch: von weit außen umlaufende/abgelenkte und innen nicht wieder herausführende Richtungen als **qualitative Bilder**, **ohne** vorzutäuschen, sie seien per Einstein-Gleichungen numerisch integriert oder für einen konkreten Emissionswinkel maßstabstreu.
- „Warum kann Licht nicht entkommen?“ per Hauptfrage aus Schritt 02. Erklärung: **Ereignishorizont ist eine kausale Grenze der Raumzeit**, nicht ein Absorptionsfeld, das Photonen „einsaugt“. Keine rein Newtonsche Fluchtgeschwindigkeit als hinreichende Erklärung. Nicht behaupten, jedes Photon nahe des Horizonts müsse direkt hinein; Flugbahnen hängen von Ausrichtung und Aufenthaltsort ab.
- **Optionaler physikalisch beschrifteter analytischer Maßstab für Schwarzschild** erst nach eigener Quellenprüfung und isolierten Tests: Photonensphäre bei `r_ph = 3GM/c² = 1,5 r_s` im Schwarzschild-Arealradius. **Kein** Gleichsetzen mit heller Scheibe, Bild-Schattenradius oder beobachtetem EHT-Ring. Keine frei erfundene zylindrische „Orbitspur“. Wenn Implementierung den richtigen Koordinaten- und Beobachterbezug nicht nachweisen kann: diese Zusatzlinie **weglassen**.
- Ein klarer Hinweis, dass echte Lichtablenkung und Bildverzerrung von Beobachtergeometrie, Emission und relativistischer Rechnung abhängen; **keine** exakten Lensing-Winkel aus Illustrationspfaden ablesen.

### Ansicht C – „Was ist hier eigentlich real?“

- Ein kleiner **Erklär-Overlay-Schalter**, nicht ein neuer wissenschaftlicher Simulator: die Hauptelemente werden einzeln benannt: Ereignishorizont (berechneter Radius als Zahl), Dunkelzone/„Shadow“ (visuelle Idee, nicht dieselbe Grenze), leuchtendes Gas (mögliche Umgebung, **nicht** zwingende Eigenschaft jedes BH), abgelenktes Licht (qualitativ), ggf. begrenztes Photonensphäre-Konzept.
- **Ein/aus statt Dauerlabels**, damit das Motiv weiterhin visuell stark ist; auf Touch als sichtbare kurze Liste neben/unter dem Bild, nicht versteckte Hover-Hotspots.
- Übergang zu `Modelle & Quellen` aus Schritt 04 und zur freiwilligen Hauptfrage/Prognose aus Schritt 02. Die `M87*`-/`Sagittarius A*`-Presets zeigen Referenzmassen und **keine** aus Originaldaten berechnete EHT-Radiokarte.

**Produktentscheidung offen:** Nutzer kann wählen zwischen **einem** zentralen animierten Bild mit einem optionalen Lichtschaubild (**MVP**) und drei Modi (**komfortabler**). Zusätzliche Modi nicht nur aus ästhetischen Gründen bauen, wenn sie Performance oder Zugänglichkeit verschlechtern.

## 4. Was an der Masse visuell gekoppelt wird

- Die **vier vorhandenen Werte** Radius, Hawking-Temperatur, modellierte Leistung und Lebensdauer werden weiterhin allein von `blackHole(m)` berechnet. Keine zufallsbasierten visuellen Parameter fließen zurück in Formeln, Anzeigen, Presets oder Benchmarks.
- Wenn sich `m` ändert, darf der **schematische Maßstabsring** oder ein beschrifteter Proportionshinweis auf `r_s ∝ m` reagieren. **Keine Darstellung, dass eine 10^9-kg-Mikroloch-Illustration eine helle Supermassive-Akkretionsscheibe hat.** Nicht im selben Plot physikalische Meter und arbitrary Pixel als gleiche Skala ausgeben.
- Hawking-Temperatur `T∝1/m` als Zahl/Diagramm bereits vorhanden. Eine hellere, farbigere Akkretionsscheibe **ist kein direktes Ergebnis** hoher Hawking-Temperatur. Hawking-Strahlung bei astrophysikalischen Massen lässt sich nicht als sichtbare Gas-Glut darstellen.
- Bei Preset-Sprüngen und starken Änderungen keine visuelle Täuschung über tatsächliche Zeit oder ausgedachte „Ladung“/„Spin“: Die bisherige Masseneingabe ist kein kontinuierlicher Akkretions-/Evaporationsprozess.
- Den aktuellen Hinweis zu Hintergrundstrahlung und umweltabhängigem netto Energiefluss erhalten. Ein rein künstlerischer schematischer Gasring ersetzt nicht die an den vier Formeln stehenden Validitätsgrenzen.

## 5. Darstellungs- und Physik-Ehrlichkeit als sichtbares Interface

- Standard-Label direkt am Bild z. B. **„Schematische Illustration – keine berechneten Lichtbahnen“**. Noch detaillierter in Step-04-Wissenssystem: „Horizont aus Formel; Gas/Glühen/Farbverlauf künstlerisch; abgelenkte Lichtwege qualitativ; keine echte Beobachtung, kein relativistisches Raytracing“.
- Eine echte astronomische Datenabbildung aus EHT ist **eine interferometrisch rekonstruierte Radiointensitätskarte**; nicht die sichtbare orange Oberfläche eines BH. Keine direkte Gleichsetzung von EHT-Dunkelzentrum, Ereignishorizont und dem hellen Ring der künstlerischen Illustration.
- „Schwarzschild“ bedeutet nicht rotierend, ungeladen. Asymmetrische Helligkeit einer realen/gerenderten Scheibe hängt unter anderem von Bewegung und Blickwinkel ab; **nicht** ohne Berechnung eine exakte Doppler-Verteilung behaupten. Visuelle Asymmetrie ist hier illustrativ.
- Keine automatische Behauptung, BH besitze eine Scheibe oder Jet. Die reine Loch-Lösung ist vom Gas/Plasma seiner Umgebung zu unterscheiden.

## 6. Wissenschaftlich bessere Referenzen für Design & Erklärtexte

**Diese Quellen sind Referenzmaterial; Wissenschaftsgehalt der Site muss bei der Work-Realisierung auf konkrete Textbehauptungen und gegebenenfalls neue Rechnungen geprüft werden. Keine NASA-/EHT-Medien einfach ohne Lizenz-/Attributionprüfung einchecken.**

- [NASA – Black Hole Anatomy](https://science.nasa.gov/universe/black-holes/anatomy/): Unterscheidung von Ereignishorizont, Schatten, Photonensphäre/Akkretionsscheibe sowie Doppler-Aufhellung.
- [NASA SVS – Black Hole Accretion Disk Visualization](https://svs.gsfc.nasa.gov/13326/): didaktisch gut erläuterte Perspektive, Gravitationslinsen-Effekt und Scheiben-Helligkeitsasymmetrie in **berechneten** Forschungsvisualisierungen. Unser Produkt darf diese Methode **nicht** behaupten, wenn wir sie nicht implementieren.
- [Event Horizon Telescope – How can we photograph a black hole?](https://eventhorizontelescope.org/faq/can-we-really-photograph-black-hole-are-they-not-entirely-dark-no-light-can-escape-them): radiointerferometrisch rekonstruierte Beobachtungsbilder des Schattens, kein normales fotografisches sichtbares Licht.
- [Event Horizon Telescope 2019 – First M87 Results I](https://doi.org/10.3847/2041-8213/AB0EC7): Primärpublikation zu gemessenem M87-Ring und GR-Verträglichkeit; nicht als wissenschaftliches Gutachten über die einfache Webillustration verwenden.

## 7. Realistische technische Umsetzung, Scope und Performance

**P0 – das muss funktionieren:**
- Ein neuer, sinnvoll platzierter, visuell deutlich besserer, aber leichtgewichtiger zentraler **Black-Hole-Illustrationsbereich** im existierenden Layout; skalierbar und unverwechselbar, kein schwerer WebGL-Shader-Stack als Standardzwang.
- **Zwei Ansichten** als sicherer Grundumfang: „Umgebung“ (optional Scheibe, stilisiert) und „Licht & Horizont“ (qualitative Pfade/Erklärungen). Detailmarker/„Was ist real?“ kann als zuschaltbare Beschriftung innerhalb derselben Darstellung erfolgen.
- Pausen-/Animation-aus-Knopf und `prefers-reduced-motion`: bei reduziertem Bewegungswunsch statische informative Darstellung von Anfang an. Wenn `document.hidden`, Tab gewechselt oder Bild nicht sichtbar: Animations-Loop stoppen, beim Wiederzeigen sauber wiederaufnehmen ohne Zeitsprung.
- Maximal **eine** aktive BH-Animationsschleife; kein unlimitierter Timer, keine ständige Neuzeichnung aller Zahlen/Charts bloß wegen Animation. Rendern nur bei sichtbarer Szene / Eingabe / Resize. `requestAnimationFrame` wenn erforderlich, sauber `cancelAnimationFrame`; ResizeObserver auf existierenden Container, DPR und Canvas-Limit gegen Speicherwachstum abgesichert.
- Keine Performance-Effekte oder Canvas-Neuinitialisierungen bei bloßen Klicks ins Quellen-Glossar, Hilfetext, Sprachwechsel.
- Mobil 320/390 px: visuelle Bühne unter/nach Kernkennzahlen, kein Covering von Masseneingabe/Charts. Klare Beschriftungen, Kontrast, Fokus, Screenreader-Kurzbeschreibung des inhaltlich relevanten Diagramms. Animation allein darf nie Information transportieren.
- Keine externen Assets/CDNs, die für die Kernfunktion nötig wären; wenn Bilder als Illustration genutzt werden, Rechte und lokale Ladeleistung prüfen. Kein verstecktes Tracking.
- Keine zusätzliche Physik-Engine, kein echter 3D-Renderer, keine massenhafte Partikeldynamik in v0.8.5.

**P1 – nur wenn P0 und Tests bereits robust:**
- Ein kleiner optionaler Perspektivwechsel **als ausdrücklich nur gestalterische Kamera-/Illustrationsansicht**; niemals eine neu berechnete astronomische Eigenschaft vortäuschen.
- Feine Sternen-/Ringlichtakzente und wenige organische, glaubwürdige Bewegungsdetails.
- Eine seltene stille Reaktion des **einen** rot-schwarzen Glitch-Monsters am Rand, das die Messwerte nicht verdeckt.

**Nicht Bestandteil:** Allgemeinrelativistischer Raytracer, wissenschaftlich berechnete Akkretionsdynamik, Strömungs-/Magnetohydrodynamik, spektrale Beobachtungssimulation, Kerr-Geometrie/Spin-Parameter, genaue Gravitationsrotverschiebungs-Farbkarte, animierter echter Hawking-Massenverlust. Jede solcher Erweiterungen wäre eine **neue** Modell- und Freigabeentscheidung.

## 8. Barrierefreiheit, Tests und Definition of Done

1. Alle vorhandenen Massen-Presets, Massengrenzen 1–10^41 kg, vier numerischen Outputs und beide vorhandenen Canvas-Diagramme bleiben korrekt und bedienbar. Keine Rechenformeln ohne gesonderte Prüfung ändern; Originalbenchmarks, v0.1-Hashschutz und CI-Suiten unverändert.
2. Die Illustration zeigt **messbare Werte**, **schematische Effekte** und **optionale Umgebung** inhaltlich sauber getrennt. In normaler Ansicht ist die schematische Einschränkung lesbar; bei deaktivierter Animation ebenso.
3. Zwei visuelle Modi bleiben bei Massenwechsel, Tabwechsel, Sprachwechsel, Zoom und Mobile stabil. Ein gewählter Modus darf bei den genannten Aktionen nicht verschwinden, sofern technisch einfach erhalten.
4. Keine gezeichnete Lichtlinie als gelöste Geodäte oder bildschirmgenauer Winkel behaupten; Nutzer kann durch „Modell & Quellen“ nachvollziehen, warum die Szene nur qualitativ ist.
5. Bei leuchtender Scheibe wird klar beschrieben, dass Gas/Plasma **optional** ist und dessen Helligkeit/Temperatur **nicht** aus Hawking-`T` oder dem Massenregler berechnet wurde.
6. Bei `prefers-reduced-motion: reduce` und Animation-aus ist die statische Darstellung vollständig verständlich. Hidden-Page/Offscreen: kein BH-RAF aktiv. Mehrfachklicks erzeugen nie doppelte Loops. Kein Memory-/CPU-Leak über 100 Tab-/Ansichtswechsel.
7. Echter Chromium-Test Desktop, 320/390 px, Zoom/DPR, Tastatur, Screenreader-Labels, DE/EN, Fokus und Änderung `bhMass`/Slider/Preset während Animation und ohne Animation. Kein horizontaler Overflow, keine verschluckten Bedienfelder.
8. Tests: Öffnen/Schließen von Erklärung, Wissenssystem, Vorhersageausklapper und Guide verändert weder `blackHole(m)` noch Massenentwurf/validierte Masse oder Orbit-/Entropy-Zustand. Visuelle Bewegung kein Testresultat/Sollwert.
9. Vergleichsscreenshots von statischem Normal-/Reduced-Motion-Modus auf Handy und Desktop; Verständlichkeitsprüfung „Was ist berechnet, was ist nur Bild?“ mit klarer Frage.
10. Unabhängiger Codex-Review vor Work-Merge; Nutzer schaut auf Vorschau und genehmigt main/Deployment gesondert. Weiterhin gleiche gültige DE/EN-Quellen- und Wahrheitsansprüche.

## 9. Offene Entscheidungen mit dem Nutzer

1. **Visualisierungstiefe:** lieber **eine sehr starke Hauptanimation** mit einem optionalen Licht-Overlay (**ultraminimal**) oder **zwei kleine umschaltbare Ansichten** `Umgebung` + `Licht/Horizont` (**Empfehlung**)? Beide sind ein einziger visueller Bereich, kein neuer Haupttab.
2. **Designstil:** **Rot/Schwarz plus sparsames Orange/Weiß** als heiße Gasfarben (Empfehlung: farblicher Kontrast zum roten Monster), oder nahezu rein monochromes Schwarz/Rot als Marke? Das Monster bleibt rot-skizzenhaft.
3. **Interaktion:** nur Ansicht wechseln / Animation pausieren oder zusätzlich **eine optionale schematische Blickwinkelwahl**? Empfehlung: Blickwinkel erst P1, nicht beim ersten P0-Release erzwingen.
4. **Realismusanspruch:** das eindrückliche Bild ausdrücklich „Illustration, keine gerechneten Lichtbahnen“ nennen und keine echte GR-Raytracing-Engine bauen (Empfehlung, passend zu Performance und Wissenschaftsehrlichkeit).
5. **Scope-Budget:** Priorität `BH-Bild` vor visuellem Feinschliff der bereits vorhandenen Charts; Charts müssen erhalten bleiben. Neue, noch ungetestete Physikformeln nur mit ausdrücklicher Extrafreigabe.

**Nächster Schritt:** Mit dem Nutzer Gestaltung/Interaktions-Tiefe festlegen; dann Schritt 06 als inhaltlich freigegeben markieren. Danach Schritt 07 – Extreme Temperature Lab. **Keine Implementierung und keine Freigabe an Work ohne spätere getrennte Genehmigung der Gesamtspezifikation.**
