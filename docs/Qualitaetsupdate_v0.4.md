# ENTROLAB v0.4 – Extreme Objects Lab

## Arbeitsstand und Umfang

Entwicklung ausschließlich auf `develop/v0.4`, nach vollständiger Lektüre von Plan, AGENTS und den angeforderten v0.3-Berichten. Neues, statisches Browser-ES-Modul-Labor; keine Build-, Backend-, WebGL- oder Medienabhängigkeit. Keine Änderung an `dist/physics.mjs`, Integrator, Prognosekern, bisherigen Experimenten oder `dist/app.mjs`. Alte Laboransichten verwenden weiter dieselben Module. Keine Veröffentlichung, kein Merge und keine Überschreibung der Originalversion.

Neue Dateien: `extreme-data.mjs` (Formeln/Beispiele/Skalen), `extreme-render.mjs` (Canvas-Artwork), `extreme-ui.mjs` (Bedienung und Animationslebenszyklus). HTML/CSS erweitert; Menü und vorhandene Struktur bleiben erhalten. Keine Sci-Fi-Naturgesetze.

## A. Schwarzes Loch: berechnete Geometrie, künstlerische Ansicht

Das Datenmodul verwendet ausschließlich die vorhandene `blackHole(m)`-Funktion für Horizont und Hawking-Temperatur. Für ungeladene, nicht rotierende Schwarzschild-Löcher werden abgeleitet:

- rₛ = 2GM/c²;
- Photonensphäre bei 1,5 rₛ;
- ISCO massiver Testteilchen bei 3 rₛ.

Beispiel 1 M☉: rₛ ≈ 2,953 km, Photonensphäre ≈ 4,430 km, ISCO ≈ 8,860 km. Alle drei Radien wachsen linear mit Masse. Eingabebereich 1 bis 10⁴¹ kg; Presets 1/10 M☉ sowie gerundete 4,3 Millionen M☉ als Sagittarius-A*-Orientierung.

**Zwei Darstellungen bewusst getrennt:**

1. Artwork: zentrale dunkle Silhouette, rotierende leuchtende Scheibenstriche, Glühen, perspektivische Ellipsen und eine illustrative obere Bogenform. **Keine Geodäten, kein Raytracing, keine berechnete Lichtablenkung, keine berechnete relativistische Strahlungsverstärkung oder Emission.** Silhouette und Leuchtring werden nicht als exakter Schatten oder beobachteter Photonenring bezeichnet. Winkel, Farbe, Teilchenzahl und Tempo sind Gestaltungsparameter, keine Messwerte. Die Scheibe kann ausgeschaltet werden; isolierte Löcher besitzen nicht zwingend eine.
2. Geometrie: beschriftete konzentrische Kreise in einer schematischen Ebene mit Radienverhältnis 1 : 1,5 : 3. Keine optische Projektion oder beobachtetes Foto. Photonensphäre ist nicht mit einem beobachteten Photonenring gleichzusetzen; ISCO ist kein universeller Scheibeninnenrand.

Beide Bilder normalisieren die Objektgröße an den Bildschirm. Massenänderung ändert deshalb Zahlen/Skalenvergleich, nicht automatisch die Pixelgröße der Silhouette. Zoom ist ein relativer Ansichtszoom; bei Vergrößerung können Teile abgeschnitten werden. Der Maßstabs-Hinweis ist sichtbar. Geometriebeschriftungen werden innerhalb des Canvas gehalten.

## B. Kompakte Körper: explizite Beispiele

Weißer Zwerg: gewählte 0,6 M☉ und 7000 km Radius. Neutronenstern: gewählte 1,4 M☉ und 12 km Radius. Diese Werte sind anschauliche, plausible Beispiele, **keine universellen Konstanten oder Masse-Radius-Kurve**. Für Sternbeispiele ist die Masseneingabe deaktiviert. Oberflächentextur/Leuchten sind schematisch; kein Pulsarstrahl oder universeller Pulsarstatus wird hinzugefügt.

Angezeigte mittlere Sternbeispiel-Dichten verwenden M/(4πR³/3), also eine sphärische Volumennäherung: etwa 8,304×10⁸ kg/m³ für den Weißen Zwerg und 3,846×10¹⁷ kg/m³ für das Neutronensternbeispiel. Keine lokale Dichte oder Zustandsgleichung, keine exakte relativistische Eigenvolumenberechnung.

Das Schwarze Loch erhält **keine Materialdichte**. rₛ wird ausdrücklich nicht als feste Materialoberfläche ausgegeben. Der Vergleich bietet:

- Linear: Balken proportional zum Radius, ohne künstliche Mindestlänge; winzige Balken dürfen unsichtbar werden.
- Logarithmisch: relative Log-Position vom kleinsten zum größten Radius der aktuellen Dreierauswahl. Der kleinste Balken hat null Länge; numerische Radien sind stets angegeben. Keine maßstabsgetreuen Objektsymbole.

## C. Extremtemperatur

Die Beziehung °C = K − 273,15 verwendet den exakt definierten SI-Offset. JavaScript rechnet jedoch binär mit endlicher Genauigkeit; es wird keine beliebige Dezimalpräzision behauptet. Celsius-Anzeige: auf 0,001 °C gerundet, Kelvin-Wert separat. Kälte-Presets sind getrennt:

| Kelvin | Celsius |
|---:|---:|
| 0 K | −273,150 °C |
| 0,001 K | −273,149 °C |
| 0,1 K | −273,050 °C |

Slider: log₁₀(K) von −3 bis +12. 0 K ist ein separater theoretischer Referenzpunkt und gelangt niemals in log(0). Kleinere positive direkte Kelvin-Eingaben sind möglich, werden als unterhalb des Sliderbereichs gekennzeichnet; dort ist der Kelvin-Wert aussagekräftiger als die gerundete Celsius-Anzeige. Der direkte Laborbereich ist 0 bis 10¹² K. Negative Kelvin, leere/nicht endliche Eingaben und Werte außerhalb des Laborbereichs werden nicht in den aktiven Modellzustand übernommen. Negative Celsius sind gültig bis zum absoluten Nullpunkt. Gültige Texteingaben aktualisieren direkt, ohne den gerade editierten Text bei jedem Tastendruck zu überschreiben.

Beispiele: Hintergrundstrahlung ≈2,725 K, 20 °C als Raumpunkt, gerundete Sonnenoberfläche ≈5900 K. 10⁹ K und 10¹² K sind ausdrücklich Skalen-/Plasmabeispiele, keine allgemeine Stoffzustandskurve; 10¹² K ist kein universelles Temperaturmaximum.

Thermisches Artwork: deterministische, abstrakte Punkte mit logarithmisch verknüpfter Bewegung und Gestaltungsfarbe. Keine Maxwell-Verteilung, Quantenstatistik, Phasenübergänge oder Materialsimulation. Ein statisches Bild bei 0 K bedeutet nicht, dass reale quantenmechanische Bewegung vollständig aufhört. Hawking-Temperatur bleibt separat erklärt: theoretische Strahlungstemperatur für entfernte Beobachter, keine gewöhnliche Material- oder Scheibentemperatur. Keine zweite Hawking-Formel implementiert.

## Performance und Animationslebenszyklus

- Ein eigener RAF-Scheduler mit höchstens einer ausstehenden Anforderung. Kein Renderloop der neuen Ansicht bei inaktivem Tab, verstecktem Dokument, Pause oder wenn beide zugehörigen Canvasflächen außerhalb des sichtbaren Bereichs liegen.
- Qualitätsziele: 60 bzw. 30 Zeichnungen pro Sekunde, **keine garantierten gemessenen fps**. Canvas-Pixeldichte gedeckelt auf 1,75 bzw. 1,25; maximal 210 bzw. 90 animierte Scheibenstriche, 70 bzw. 38 thermische Punkte. Prozedural, keine Netzwerkanfragen für Artwork, kein neuer Worker/Backend.
- `prefers-reduced-motion` startet pausiert. Explizites Starten ist möglich; ein nachträglicher Wechsel zu reduzierter Bewegung pausiert erneut. Statische Eingabeänderungen dürfen ein einzelnes neues Bild zeichnen.
- Browser-Stichproben `performance.now()` um den Canvas-JavaScriptaufruf bei Qualitätsschaltern: hoch 2,3 / 2,3 / 2,6 ms; sparsam 3,0 / 2,5 / 1,8 ms. Keine statistisch belastbare Qualitätsrangfolge, keine GPU-Fertigstellungszeit, kein Durchsatz-/Speicherbenchmark und keine Smartphone-Messung. Zusätzliche Anfangsstichproben waren 3,9 bzw. 1,9 ms. Die Umgebung kann Browser-Frames drosseln.
- Im realen Browser blieb der Renderzähler nach Tabwechsel unverändert (46 → 46), `data-animating=false`. Automatisierte Lebenszyklustests prüfen wiederholte Tab-/Objektwechsel und höchstens einen RAF; keine Behauptung eines umfassenden Heap-Leak-Nachweises.

## Tatsächlich ausgeführte Tests

Vorher: zehn Originalchecks plus 48 Node-Testfälle = **58 bestanden**. Nachher: zehn Originalchecks plus 66 Node-Testfälle = **76 bestanden**, keine übersprungenen/TODO-Fälle. Alle alten Testdateien und Grenzwerte unverändert; 18 neue Fälle hinzugefügt.

Neue CI-Prüfungen:

- fünf Kelvin/Celsius-Referenzfälle einschließlich separater Kälte-Presets und Nullpunkt;
- ungültige Temperaturen sowie Logskalen-Grenzen und Umkehrabbildung;
- Schwarzschild-Konsistenz zur alten Funktion über alle Massen-Presets, lineare Radiusskalierung, inverse Temperaturskalierung und ungültige Massen;
- feste Beispielannahmen, sphärische Dichteformel, keine BH-Materialdichte, lineare/logarithmische Vergleichsskalen;
- drei Tests des tatsächlichen UI-Modulcodes mit kontrolliertem DOM/RAF und Renderer-Stubs: inaktiv/aktiv/Pause, wiederholte Wechsel, Reduced Motion, Dokumentverbergen und direkte/ungültige Eingaben;
- ein Renderer-Test mit kontrolliertem Canvas-Adapter: finite Zeichenargumente für alle drei Objektarten/Qualitäten/Zoomstufen und in der Bildhöhe liegende Geometriebeschriftungen bei 940×500 und 350×350.

DOM-/Canvas-Adaptertests sind gezielte Modulprüfungen, keine echte Browser-Emulation. Zusätzlich wurden die zwölf vollständigen numerischen Benchmarks mit `node scripts/benchmark.mjs` ausgeführt; sämtliche Ergebnisobjekte einschließlich Schrittzahlen und Endpositionen stimmen exakt mit `docs/numerics-v0.2.json` überein. Historische Originalintegrität wird zusätzlich im CI aus der Git-Historie geprüft, nicht aus der lokalen Dateikopie behauptet.

Reproduktion: `node scripts/test.mjs`; `node scripts/benchmark.mjs`. Keine neue Paketinstallation oder Buildpflicht für die Anwendung.

## Tatsächliche Browserprüfung

Der zuerst versuchte separate Chromium-/Playwright-Start scheiterte mit einem durch die Umgebung abgewiesenen Prozess-Singleton-Socket; der direkte Serverport war im vorhandenen Browser nicht erreichbar. Anschließend funktionierte der bestehende lokale Vorschauweg. Kein Deployment.

Shared Chrome, Desktopansicht etwa 1363 CSS-Pixel breit: neuer Tab, optische Artwork-/Geometrieprüfung, Play/Pause, Scheibe an/aus, Objektwechsel, linearer Vergleich, Kälte-Presets, 0 K, negative Eingabe, direkte Masse 10⁴¹ kg (≈992,8 AU Horizont-Radius) und Ablehnung von 1e309; Rückkehr ins bisherige BH-Labor mit Erdmasse ergibt weiterhin 8,87 mm. Geometrie-ISCO-Beschriftung wurde nach einer bei der Sichtprüfung bemerkten Randabschneidung korrigiert und erneut angesehen.

Kleine Ansicht: gleichursprüngliche Testhülle mit 390×844 CSS-Pixeln, 375 Pixel Inhaltsbreite neben Scrollbar. Geprüft: Temperatureingabe/-Presets, Fehlermeldung bei −1 K, alle drei Objekte, Scheiben-/Geometrieschalter, Pause, Referenzlabor und Gravitationsschleuder/Testkörper. `scrollWidth=clientWidth=375`, Kelvin-Feld 44 Pixel hoch. Keine horizontalen Überbreiten beobachtet. Die Testhülle ist nicht Teil des Commits.

In den erfassten Browserlogs keine Anwendungsfehler von localhost. Browsererweiterung meldete eigene Metadatenfehler; diese sind keine ENTROLAB-Seitenfehler. Keine langfristige GPU-/Speicherlastprüfung, kein physischer Smartphone-/Touch-/Safari-Test. Reduced Motion/Document Hidden wurden im kontrollierten UI-Modultest geprüft, nicht als echte Betriebssystem-/Geräteeinstellung im Browser nachgewiesen.

## Fachliche Quellen und Einordnung

Die folgenden Primärquellen wurden zur Umsetzung abgerufen/geprüft; Beispielwerte bleiben als solche gekennzeichnet:

- [NIST: SI Units – Temperature](https://www.nist.gov/pml/owm/si-units-temperature): exakter Offset, gerundete Raum-/Sonnenbeispiele.
- [NASA: Anatomy of Black Holes](https://science.nasa.gov/universe/black-holes/anatomy/): optionale Akkretionsscheiben, Schatten und relativistische Lichtwege. Unsere optische Illustration besitzt diese Rechnung ausdrücklich nicht.
- [Universität Frankfurt: Schwarzschild-Geodäten, Photonensphäre und ISCO](https://itp.uni-frankfurt.de/~hanauske/VARTC/2026/python/GeodSchwarzschildIII/GeodSchwarzschildIII.html): r_ph=3M und r_ISCO=6M in geometrischen Einheiten, entsprechend 1,5rₛ und 3rₛ.
- [ESA: XMM-Newton uncovers a celestial Rosetta stone](https://www.esa.int/Science_Exploration/Space_Science/XMM-Newton_uncovers_a_celestial_Rosetta_stone): typische Weiße Zwerge um 0,6 M☉ und Erdgröße. 7000 km ist unsere gerundete Beispielannahme, kein dort exakt bestimmter universeller Radius.
- [NASA NTRS: The Radius of PSR J0740+6620 from NICER and XMM-Newton Data](https://ntrs.nasa.gov/citations/20210026095): modell-/datenabhängige Neutronenstern-Radien; 12 km bei 1,4 M☉ als plausibles gerundetes Beispiel, keine universelle Eigenschaft.
- [NASA LAMBDA: COBE/FIRAS](https://lambda.gsfc.nasa.gov/product/cobe/firas_overview.html): Hintergrundtemperatur um 2,725 K.

Newtonsche Sandbox-, Softening-, Kollisions-Tunneling- und Hawking-Modellgrenzen bleiben unverändert. Animation und Vergleich bilden keine neue physikalisch exakte Extremmateriesimulation. Der Entwicklungsstand ist zur unabhängigen Prüfung bestimmt, nicht zur automatischen Übernahme oder Veröffentlichung.
