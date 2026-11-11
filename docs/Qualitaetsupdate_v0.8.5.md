# v0.8.5 – Labor-Upgrades · Entwicklungs- und Prüfbericht

Stand: 11.11.2026. Entwicklungsstand zur unabhängigen Prüfung; keine Releasefreigabe.

## Ausgangsstand und Arbeitsvertrag

`main` und Merge von PR #7 bestätigt: `25e72c639d66677c1629886141e3671a4c696ef6`, Baum `df22450778c46ce73b7a760f8571e8ce25cc0370`. Isolierter Entwicklungsbranch `feature/v0.8.5-lab-upgrades`, vom exakten Merge abgeleitet. Jeder Commit einschließlich der Ref-Anlage trägt `[CF-Pages-Skip]`; keine neue Vorschau und kein Deployment. Cloudflare meldet für den Merge ein erfolgreiches Deployment (`cddbdb79.entrolab.pages.dev`); tatsächliche Produktionsbytes werden separat geprüft.

Alle elf geforderten Grundlagen vollständig gelesen, einschließlich des historischen Audits mit 14 Befunden. Schritte 05–08 und QCD sind jetzt ausdrücklich autorisiert; historische Planungsgrenzen bleiben als Geschichte erhalten. Titel/Favicon/Domain werden nicht eigenständig umgestellt.

Lokal vor Änderungen: `node scripts/test.mjs` bestanden, 10 Selbstchecks + 176 Node-Fälle = **186**. GitHub auf dem Merge: Physics/Original und Chromium grün. Neuer Ausgangslauf auf dem vorbereitenden Dokumentationsstand folgt. Lokales Source-Verzeichnis besitzt keine Git-Objekthistorie; 12/6 werden im vollständigen CI-Klon geprüft.

Vier Ebenen bleiben getrennt: angewandte Physik, unveränderte Rohentwürfe, neue Präsentationszustände, abbrechbare Jobs. Hilfen/Tour/Materialbild/BH-Illustration schreiben keine Solverwerte und konsumieren keinen Modellzufall. Echte Tabnavigation behält bestehende Pausen und Vorhersageabbrüche. Keine Änderung an Rechenkernen, numerischen Toleranzen, archivierten Originalen oder Monsterdateien.

## Fachliche und technische Abgrenzung vor Implementierung

- Einführung: freiwilliger Wähler, kurzer Einstieg und sieben Laborpfade; echte Controls nur fokussieren/beobachten. Kein synthetisches Apply/Reset. Session-Resume im Speicher, jederzeit Zurück/Überspringen/Schließen. Die alte Wärme-Lernroute bleibt als eigener Pfad mit ihren Zustandsassertionen erhalten. Keine Pflichtaufgabe zum bisher nicht vollständig tastaturbedienbaren Körperplatzieren (A07).
- BH: bestehender reiner `drawObject`-Zeichenkern wird wiederverwendet, eigener Controllerzustand. Umgebung / Licht & Horizont und optionaler Projektionswinkel. Keine Geodäten, kein Raytracing, keine quantitative Scheiben-/Hawkingemission. Normierte Darstellung unabhängig von berechneter Masse. Sichtbarkeit/Reduced Motion/Pause begrenzen eine eigene Schleife, maximal 30 Zielbilder/s und begrenzter DPR.
- Materialvergleich: reine Referenzdaten, 1 atm = 101325 Pa, kanonische Kelvinwerte und daraus abgeleitete Celsiuswerte. Nominale Übergangsbänder aus dokumentierter Anzeigenauflösung, keine Phasenanteile. Konservative didaktische Vergleichsfenster werden vor der UI dokumentiert; außerhalb keine Zustandsbehauptung, keine universelle chemische Zersetzungsschwelle. Kein Transfer ins Wärmemodell.
- QCD: freiwilliger Artikel im selben Science-/Quellensystem, keine neue Hauptnavigation oder Physikberechnung. Protonenmasse und mathematisches reines Yang–Mills-Mass-Gap-Problem deutlich getrennt.
- Performance: tatsächliche v0.8-Basis, gleiche Szenen/Geometrie und Reihenfolgeumkehr. Für unveränderte Szenen gelten als Arbeitsbudget höchstens +10 % vergleichbares Paint-p95; Ausnahmen offen berichten. Neue BH-Animation separat nach absoluter Renderdauer, Frameintervall und versteckter Nullaktivität prüfen; Ziel 30 fps, kein universelles Hardwareversprechen. Zusätzlich 390-px-/4×-CPU-Profil als Emulation, keine Behauptung eines realen Handytests. Die alte A13-Ausnahme wird nicht übernommen.

## Ausstehende Prüfungen

Implementierung, neue Regressionen, vollständige 186/65/12/6-Nachprüfung, Quellenverifikation, Produktionshashprobe, Screenshots, Lifecycle-/Performancewerte, unabhängiger lesender Review und Draft-PR werden im Verlauf ergänzt. Keine dieser Prüfungen ist hier bereits als bestanden behauptet.

## Vorab festgelegte Materialkonvention (A05/A06)

Alle Stoffe sind hypothetische Reinstoffe im Gleichgewicht bei 101325 Pa, ohne chemische Reaktionen oder Oxidation. Kein Materialsolver. Die Zustandsaussage ist ein begrenzter Tabellenvergleich, keine Vorhersage eines realen Experiments. Die Fenster sind **bewusst gewählte didaktische Auswertungsgrenzen**, keine gemessenen Zersetzungs-, Ionisations- oder Stabilitätsschwellen. Sie umfassen die beiden normalen Übergänge und einen kleinen angrenzenden Fest-/Dampfbereich; Metallfenster beginnen bei Raumtemperatur, damit kryogene Phasen/Materialdetails nicht behauptet werden. Oberhalb bleibt selbst dann „außerhalb“, wenn ein vereinfachtes Diagramm noch Dampf vermuten ließe. Es wird keine universelle Stoffaussage bei Astro-/Plasmatemperaturen gemacht.

| Stoff | Schmelzen K / Vergleichsband ±K | Sieden K / Band ±K | Darstellungsfenster K | Grundlage |
| --- | --- | --- | --- | --- |
| Wasser | 273,15 / 0,05 | 373,15 / 0,05 | 250–400 | OpenStax, didaktische Normaldruckwerte 0/100 °C; Band entspricht Anzeige 0,1 K, keine Messunsicherheit |
| Ethanol | 159 / 2 | 351,5 / 0,2 | 140–375 | NIST WebBook-Mittelwerte und dort angegebene Streuung; PDG 159,0/351,4 K als gerundete Gegenprobe |
| Aluminium | 933,473 / 0,0005 | 2792 / 0,5 | 273,15–2850 | RSC; Band halbe letzte publizierte Kelvinstelle, keine behauptete Stofftoleranz |
| Eisen | 1811 / 0,5 | 3134 / 0,5 | 273,15–3200 | RSC; ebenso nominelle Darstellungsauflösung |

Quellen am 11.11.2026 tatsächlich geöffnet: OpenStax University Physics 2 §1.5, NIST WebBook CAS 64-17-5 / Phase change data, PDG2026 Ethanol, RSC Elemente 13/26. Gegenüber dem frühen PDG-Vorschlag wird für Ethanol absichtlich die NIST-Kompilation 351,5 ±0,2 K verwendet; keine vermeintliche exakte Gleichheit zwischen unabhängig gerundeten K-/°C-Spalten. Kelvin ist kanonisch. Übergangsband bedeutet nur „Tabellen-Übergangsbereich / Koexistenz möglich“, nicht einen aus Temperatur bestimmten Phasenanteil oder breites reales Schmelzintervall.

Die Behauptung gültiger Chemie innerhalb dieser Fenster wird ausdrücklich nicht erhoben. Wärmekapazitäten, latente Wärme, Dissoziation, Reaktionszeiten und Druckänderungen werden nicht berechnet. Die bewusst enge Begrenzung ist Teil der wissenschaftlichen Vereinfachung, kein neuer experimentell validierter Stoffdatensatz. Materialdaten werden nie als Parameter an das bestehende Wärmeexperiment übergeben.


## Lesender Zwischenreview und korrigierte Grenzfälle

Der unabhängig lesende Review hat zwei eigene neue Inhalte/Bedienfälle beanstandet: negative absolute Temperaturen dürfen nicht pauschal als Nichtgleichgewicht bezeichnet werden (unnötigen Satz entfernt); leere optionale Zahlenfelder sind nativ gültig, obwohl der Temperaturcontroller sie ablehnt. Der Lernpfad prüft jetzt zusätzlich die tatsächliche Laborfehlermeldung und Leertext, bevor er eine Handlung bestätigt. Neue Chromium-Fälle prüfen auch −0 und negative Unterläufe. Physikwerte bleiben unverändert.

Mathematische Präzisierung gegenüber A06 des historischen Audits: Für A=0 und B>0 ist A/B=0, nur B=0 verhindert den Quotienten. Das neue Vergleichsmodul zeigt deshalb den tatsächlichen Nullquotienten; beide Nullrichtungen sind getrennt getestet. Das ist neue Präsentationsmathematik im genehmigten Umfang, keine Änderung des bestehenden Temperaturlabors oder Wärmemodells. Positive extrem kleine Quotienten werden bei Gleitkomma-Unterlauf weiterhin logarithmisch dargestellt, nicht als Null ausgegeben.

Die Celsiusreferenzen werden aus Kelvin abgeleitet und auf die jeweilige publizierte Präzision gerundet (Eisen 1811 K → ungefähr 1538 °C, keine scheinexakten 1537,850 °C). Der mobile BH-Moduswähler erhält eine volle Zeile, damit seine Namen bei320 px lesbar bleiben.


Ein weiterer Zwischenlauf auf89cece fand einen von uns verursachten mobilen Headerüberlauf: der lange Zusatz „development“ im Versionsbadge vergrößerte das nicht umbrechende Markenfeld um10 px über320 px. Der Badge wird auf die kurze Versionsnummer begrenzt; keine alte Overflow-Assertion wurde gelockert. Die Entwicklungseigenschaft steht in Branch/PR/Qualitätsbericht, nicht als lange Headerdekoration. Alle bisherigen Layoutregressionen werden erneut ausgeführt.


Echte Chromium-Lifecycle-Gegenprobe: nach synthetischem Hidden→Visible meldete die MediaQuery bereits `matches=true`, während ihr Change-Callback noch nicht den privaten Pausenstatus gesetzt hatte (Renderer war bereits gestoppt). Der eigene BH-Controller gleicht Reduced Motion jetzt vor dem RAF-Aktivitätsguard ab und synchronisiert Beschriftungen auch bei Sichtbarkeits-/Kontextwechsel. Keine neue Polling-Schleife. Die strenge Regression behält denselben kombinierten Ablauf bei. Die30-fps-Dekorationskadenz verwendet Zeitraster statt eines anfälligen 33,333-ms-Schwellwertvergleichs; das betrifft ausschließlich Bildbewegung, keine physikalische Schrittweite/Toleranz.


## Implementierter Umfang 05–08

| Bereich | Umsetzung | Bestehende Funktionen |
| --- | --- | --- |
| Einführung | Kompakter Wähler: drei kurze Schnellbeispiele und sieben gezielte Wege. Sichtbarer Zurück-/Überspringen-/Menüpfad, echter Controlfokus, Ereigniserkennung, Session-Resume ohne Konten oder Datenbank. | Die vierstufige Wärmehandlung bleibt als eigener wählbarer Weg mit allen bisherigen Sicherheitsassertionen erhalten. Zwei alte Browseraufbauten wählen nun ausdrücklich diesen Weg; keine wissenschaftliche Assertion entfernt. |
| Black Hole | Umgebung und Licht/Horizont, optionaler Projektionswinkel und hypothetische Scheibe, Pause und Reduced Motion. Wiederverwendung von `drawObject`, eigene Präsentation ohne Massenschreibzugriff. | Eingaben, vier Werte, Größenvergleich, Diagramme, Warnungen und Schwarzschild-/Hawkingfunktionen erhalten. Extreme Objects besitzt weiter seinen eigenen privaten Zustand. |
| Temperatur | Read-only Adapter zum tatsächlich validierten Kelvinwert; Kontext/Quellen; eigener A/B-Vergleich mit Differenz, robustem Verhältnis und zwei Logskalenmarkierungen. | Alle acht Presets, Kelvin/Celsius, abstrakte Animation und exakte bestehende 250–600-K-Brücke unverändert. Ungültige Entwürfe verändern den letzten gültigen Kontextwert nicht. |
| Materialien | Optionaler Vergleich Wasser/Ethanol/Aluminium/Eisen, zweiter Stoff bei derselben Labortemperatur; nominelle Übergangsbänder und begrenzte Phasensymbole. | Keine Masse/Wärmekapazität/latente Wärme oder Chemie berechnet; kein Datentransfer zum Wärmemodell. |
| QCD | Ein freiwillig geschlossener Artikel im vorhandenen Wissens-/Quellen-/Fokussystem, eine statische schematische SVG, echte Direktlinks. | Weiter fünf Hauptbereiche, sechs Modellkapitel, 29 Begriffe; kein Teilchensolver oder neues Labor. |
| Feinschliff | Ergänzende kleine CSS-Datei für neue Komponenten, volle mobile Modusauswahl, tabellarische Zahlen, präzise Vergleichswerte, vorhandene44 px-Controls und Fokusregeln wiederverwendet. | Dunkler Stil, freigegebenes einzelnes Monster, Hauptnavigation und bestehende Canvas-CSS erhalten. Titel/Favicon und Domain unverändert. |

Neue Hauptdateien: `discovery-paths.mjs`, `blackhole-view.mjs`, `material-data.mjs`, `temperature-format.mjs`, `temperature-context.mjs`, `upgrade-text.mjs`, `upgrades.css`. Gezielt erweitert: Discovery, Guide, Knowledge/Knowledge-UI, bestehende Übersetzungseinbindung, UX-Fokusrückgabe und der rein lesende Temperaturadapter in Extreme-UI. Keine neue Abhängigkeit; das vorhandene Lockfile bleibt unverändert.

## Wissenschaft und Quelle pro Aussage

| Aussage | Geprüfte Fachquelle / Zuordnung | Grenze |
| --- | --- | --- |
| Horizont, Scheibe, Schatten | [NASA Anatomy](https://science.nasa.gov/universe/black-holes/anatomy/), [NASA SVS13326](https://svs.gsfc.nasa.gov/13326/) | NASAs berechnete Visualisierung validiert nicht unsere künstlerischen Kurven. Keine Geodäten-/Strahlungstransportlösung oder Ablenkwinkel. |
| Celsiusoffset und Kelvinintervalle | [NIST](https://www.nist.gov/pml/owm/si-units-temperature) | Temperatur ist keine Wärmemenge/innere Energie. Quantenbewegung endet nicht pauschal bei0K. |
| CMB und Sonnenreferenz | [NASA FIRAS](https://lambda.gsfc.nasa.gov/product/cobe/firas_overview.html), [Sun fact sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html) | Strahlungstemperatur≈2,725K;5772K effektive Sonne ist vom vorhandenen groben5900K-Beispiel zu unterscheiden. |
| Phasen und Druck | [OpenStax1.5](https://openstax.org/books/university-physics-volume-2/pages/1-5-phase-changes) | Tabellenreferenz, Gleichgewicht und Koexistenz; keine aus T allein bestimmten Anteile. |
| Ethanolübergänge | [NIST WebBook](https://webbook.nist.gov/cgi/cbook.cgi?ID=C64175&Mask=4), [PDG2026](https://pdg.lbl.gov/2026/AtomicNuclearProperties/HTML/ethanol.html) | NIST-Mittelwerte159±2 und351,5±0,2K; PDG-K/C-Spalten unabhängig gerundet. |
| Aluminium/Eisen | [RSCAl](https://periodic-table.rsc.org/element/13/aluminum), [RSCFe](https://periodic-table.rsc.org/element/26/iron) | Kein vollständiges chemisches/pT-Modell. Gewählte Fenster sind didaktische Grenzen. |
| Valenzüberschuss und Partonen | [CMS](https://cms.cern/news/how-are-quarks-moving) | uud ist keine vollständige statische Dreiteilchenkonfiguration. |
| QCD-Ruheenergie und Prozentvergleich | [CERN](https://home.cern/other-99/), [Yang et al., PRL121,212001](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.121.212001) |1%/99% ist eine Größenordnung, keine universelle eindeutige Quark/Gluon-Zerlegung; quantitative Beiträge können Schema-/Skalenabhängigkeit haben. |
| Protonenmasse und Higgsabgrenzung | [PDGLive/CODATA](https://pdgprod.lbl.gov/pdgprod/pdgLive/DataBlock.action?home=sumtabB&node=S016M), [CMS Higgs](https://cms.cern/news/higgs-boson) |938,27MeV/c² nur gerundet; Live-Ansicht kann einen künftigen Review-Header tragen, verwendeter Wert ist ausdrücklich2022CODATA. Keine Änderung bestehender Naturkonstanten. |
| Reines Yang–Mills-Problem | [Clay Status](https://www.claymath.org/millennium/yang-mills-the-maths-gap/), [Jaffe/Witten §4](https://www.claymath.org/wp-content/uploads/2022/06/yangmills.pdf) | Strenge nichttriviale Theorie auf R⁴ und positive Lücke für jede kompakte einfache Eichgruppe; ohne Quarks, kein Prozentwert der Protonenmasse. Offiziell ungelöst am Prüftag. |

Alle aufgeführten Seiten wurden am 11.11.2026 tatsächlich geöffnet; Tabellen/Aussagen gezielt abgeglichen. Der erste direkte NIST-CODATA-Einzelwertabruf war fehlerhaft; für den Protonenwert ist deshalb die tatsächlich lesbare PDG-Auswertung belegt, kein erfolgreicher NIST-Einzelabruf behauptet. Quellenaussagen stehen in der gemeinsamen Registry, keine Live-Webabfrage beim Appstart. Vor einer späteren öffentlichen Freigabe den Status erneut prüfen.

Im Artikel gilt `E₀=Mc²` im Ruhesystem des ganzen gebundenen Systems, allgemein `M²c⁴=E²−|p|²c²`. Masselose Gluonen können Energie und Impuls tragen; „Energie“ ist keine99%-Substanz neben Materie. Physikalisch bestimmte Hadronmassen und erfolgreiche Gitter-QCD sind nicht vom ausstehenden mathematischen Existenz-/Lückenbeweis abhängig.

## Zustand, Speicher und Darstellung

Der Material-/Kontextcontroller hat keine RAF, Timer oder Observer. Eine kontrollierte Subscription liest den validierten Wert; Dispose entfernt sie und alle eigenen Listener/Sprachcallbacks. Der BH-Controller hat zwei Observer und höchstens eine eigene RAF. Licht/Horizont und Reduced Motion sind statisch; Offscreen/Hidden/Navigation stoppen die Bewegung ohne Nachholzeitsprung. Die Skizze verwendet feste, offen bezeichnete Bezierkurven. Maximale Zeichenfläche1200 × 400 CSS-Pixel bei DPR ≤ 1,25: höchstens750.000 Backing-Pixel, ungefähr3 MB für eine RGBA-Fläche, ohne zusätzliche Browserkopien. CSS-Anzeigegröße und Backing-Store sind durch einen begrenzten Container getrennt.

Tour, QCD, Materialsymbolik und Monster greifen nicht auf Modell-RNG zu. Der genehmigte Monster-Master und alle Derivate sind unverändert; keine zweite Figur oder zusätzliche Hintergrundanimation. Unveränderte Live-Region-Texte werden im neuen Tourcontroller nicht bei jedem fremden Klick erneut geschrieben.

## Prüfumfang und noch einzutragende Endergebnisse

Baselinerun [42929354626](https://github.com/phoscore/entrolab/actions/runs/42929354626) auf dem vorbereitenden reinen Dokumentationscommit hat die Ausgangssuiten ausgeführt; die nachfolgende Discovery-CI [42929876332](https://github.com/phoscore/entrolab/actions/runs/42929876332) bestand188 reguläre/68 Chromium/12/6. Der unveränderte Produktionscode ist dabei die verifizierte25e72c-Basis. Im final erweiterten Testbestand werden197 reguläre und81 Chromium-Fälle erwartet; die endgültigen tatsächlichen Resultate und Artefakte stehen im nachfolgenden Abschlussnachweis, nicht als Prognose in dieser Zeile.

Bisher tatsächlich bestanden: lokal und im unabhängigen lesenden Review197 reguläre. Mehrere vollständige CI-Physikläufe mit197/12/6. Auf72180bestand die Browserprobe78/79, auf23e82579/81. Die verbleibenden Fälle waren die dokumentierte MediaPolicy sowie eine neue Regex, die nach präziserer Zahlenformatierung fälschlich ein Leerzeichen vor dem Semikolon erwartete. Das ist kein Beleg einer erfolgreichen vollständigen Browserabnahme; die nachfolgenden Korrekturen werden erneut geprüft.

Lokaler Playwrightstart erneut versucht und vor Seitenstart vom Laufzeitbetriebssystem verhindert; echte Browserresultate stammen aus GitHub Actions. Zusätzlich gemeinsame native Chrome-Ansicht beider BH-Modi tatsächlich angesehen und Animation/Pause, vorhandene Werte und sichtbare Schematahinweise kontrolliert. Schmale Ansichten, DPR, Touch-Emulation, Tastatur, Sprache, Reduced Motion, Lifecycle und Screenshots werden automatisch geprüft; kein reales Handy/Safari/Firefox/Screenreader oder bestätigter nativer200/400%-Zoom behauptet.

Historisch bekannte Grenzen bleiben bestehen: Gravity-Körperplatzierung nicht vollständig tastaturbedienbar; Tour macht sie nicht zur Pflicht. Newtonsche Nahhorizont-/Streifkontaktgrenzen, heuristische Schrittwahl, Hawking-Modellschätzungen und begrenzte Wärme-/Markerannahmen werden nicht geändert. Der fehlende v0.1-Tag wird nicht eigenmächtig erzeugt. Keine Releasefreigabe aus Testanzahl oder diesem Bericht ableiten.


Zusätzliche Barrierefreiheitsabsicherung des neuen BH-Panels: Wird ein gerade fokussiertes Bewegungs-/Winkelcontrol durch Reduced Motion beziehungsweise Ansichtswechsel deaktiviert, bleibt ein sichtbares logisches Fokusziel im Moduswähler erhalten. Kein Fokuswechsel bei fremden aktiven Controls oder verborgenem Dokument. Die strenge kombinierte Reduced-Motion-Probe prüft diesen Rückfall ausdrücklich.

Viewport-Aufnahmen werden zusätzlich zu hohen Elementaufnahmen erzeugt. Bei letzteren zeigt Chromium gelegentlich den eigentlich außerhalb des Viewports liegenden Skiplink im zugeschnittenen Bild; dies ist als Capture-Artefakt zu unterscheiden. Die echten Viewport-Aufnahmen und die native Chrome-Gegenprobe werden nicht durch weggeblendete Produktcontrols retuschiert.
