# ENTROLAB v0.6 — Emptiness Pro Max / erstes Entropy Lab

Stand: 8. November 2026. Entwicklungsbranch ausschließlich `develop/v0.6`. Verbindlicher Umfang: `docs/Plan_v0.6.md`; Plan, AGENTS.md, README, v0.5-Plan und beide v0.5-Qualitätsberichte wurden vor der Umsetzung vollständig gelesen.

## Freigabe und Schutzumfang

Basis ist die freigegebene v0.5 auf `main`, Commit `39fde20f812da1d371b4990b15062062cddd102f`. Der vorbereitete Plan-Commit war `cce07550cf01d49b2fba86d8a171dce099d688d7`. Dieser Bericht ist ein Entwicklungsnachweis, keine unabhängige Zertifizierung oder Freigabe.

`main`, `archive/v0.1`, Original-Commit `be2502d51a449de3e515faaf72ab5954b1a739d4`, Originalprüfsummen und historische Hosting-Konfiguration wurden nicht verändert. Keine Tags verschoben, kein Merge, Release, Deployment oder neuer Hosting-Standort. Cloudflare Pages veröffentlicht `main` automatisch; deshalb bleibt der Entwicklungsstand ausschließlich auf dem Review-Branch.

## Umsetzung und Bedienung

- Eigenständiger fünfter Navigationsbereich **Entropy Lab**, standardmäßig N=12, zulässiger Bereich 1–32.
- Zwei gleich große Kammern mit stabil nummerierten Markern; Links/Rechts wird durch Position, Farbe und eine explizite Zeichenfolge kenntlich. Positionen sind keine weiteren Mikrozustände.
- Alle links / Reset, manuelle Wahl von k, ein Zufallsschritt, automatisches Mischen und Pause. Änderung von N setzt den Zustand zurück. Manuelle k-Wahl pausiert und legt die ersten k Marker nach links. Gleichverteiltes Auslosen bei gleichem k ist ein separater Eingriff, keine zeitliche Entwicklung; Wiederholung desselben Mikrozustands ist möglich.
- Große Werte für Ω, 2ᴺ, Gleichgewichtswahrscheinlichkeit und S/kᵦ; normiertes SVG-Balkendiagramm mit aktuellem k und zugänglicher Datentabelle. Der zusätzliche Dreiecksmarker bleibt auch bei verschwindend kleinen Randwahrscheinlichkeiten sichtbar, ohne die berechneten Balkenhöhen zu übertreiben.
- Kurze Erklärung und freiwilliger Advanced-Bereich mit Formeln, Modellannahmen, Algorithmus, Fluktuationen und Quellenzuordnung. Ein ausdrücklich als Kommentar gekennzeichneter nihilistischer Satz liefert keine physikalische Interpretation.
- Bestehendes Glossar um wenige Themen ergänzt: Universum/Gravitation, Sternreste/Pulsar, Entropie/Mikro-/Makrozustand/Fluktuationen. Kontexteinstiege in allen vier Labs. Sie öffnen das vorhandene Glossar, fokussieren den Begriff und erlauben Rückkehr per Button oder Escape, ohne Navigation oder Modellreset. Vollständiger Cosmic Field Guide bleibt späteren Versionen vorbehalten.
- Exakter Browser-Titel in beiden Sprachen: `entrolab - emptiness pro max`. Originales lokales SVG-Favicon: schwarzes Zentrum, Kontrastring und kleines `:)`. Künstlerisches Logo, kein physikalisches Horizontbild. Footer-Spruch bewahrt.
- DE/EN für neue statische und dynamische Texte, SVG/ARIA-Beschriftungen, Fehler, Ergebnisse und Zahlen. Ein ungültiger N-Entwurf bleibt beim Sprachwechsel erhalten, einschließlich Custom Validity. Zeigerbedienter Sprachwechsel gibt den Fokus auch an das neue Entropy-Eingabefeld zurück; Tastaturwechsel lässt den Fokus auf der bedienten Sprachauswahl.

Reine Mathematik/Zustandsfunktionen: `dist/entropy.mjs`. Darstellung/Lifecycle: `dist/entropy-ui.mjs`, `dist/entropy.css`. Kontextrückweg: `dist/guide.mjs`. Keine Änderung am Integrator oder am vorhandenen Gravitations-, BH-, Stern- oder Temperaturmodell.

## Wissenschaftliches Modell und Gültigkeit

Ein Mikrozustand x ist ein Vektor von N unterscheidbaren Links/Rechts-Markern. Der Makrozustand k zählt nur die linke Belegung. Die Anzahl der zu k passenden Vektoren ist

`Ω(k) = C(N,k)`, `Σ Ω(k) = 2^N`, `P_eq(k) = Ω(k)/2^N`.

Die Binomialkoeffizienten werden multiplikativ als BigInt berechnet, ohne unsichere Gleitkomma-Fakultäten. Für den begrenzten Bereich sind sämtliche Zählwerte exakt. Wahrscheinlichkeiten und Logarithmen verwenden Gleitkomma; Anzeigen werden lokalisiert gerundet.

Pro diskretem Schritt wechselt jeder Marker unabhängig mit q=1/4 die Seite, symmetrisch in beide Richtungen. Alle übrigen bleiben. Die Übergangswahrscheinlichkeit zweier Vektoren mit Hamming-Abstand d ist `T(x,y)=q^d(1−q)^(N−d)`. Sie ist symmetrisch; alle Übergänge einschließlich Verbleiben haben positive Wahrscheinlichkeit. Damit ist die endliche Kette ergodisch und ihre stationäre Mikrozustandsverteilung gleichförmig. Die Binomialverteilung folgt durch Zusammenzählen der Ω Vektoren.

**Gleichgewicht ist nicht der nächste Schritt.** Beim Start „alle links“ gilt k=N mit Wahrscheinlichkeit eins. Nach einem Schritt ist jeder Marker mit Wahrscheinlichkeit 3/4 links; die Verteilung ist dann binomial mit p=3/4 statt p=1/2. Beispielsweise ist für N=2 die nächste Wahrscheinlichkeit für „beide links“ 9/16, im Gleichgewicht dagegen 1/4. Die UI beschriftet das Diagramm und Pₑq ausdrücklich als Gleichgewichtsreferenz, nicht als tatsächliches Histogramm der kurzen Trajektorie.

`S(k)/kᵦ = ln Ω(k)` bezeichnet ausschließlich eine **dimensionslose Boltzmann-Modellentropie der gewählten groben k-Beschreibung**. Sie ist weder die Shannon-Entropie der gesamten zeitabhängigen Verteilung noch eine gemessene Gasentropie. Einzelne stochastische Schritte können kleinere Ω und damit kleinere S/kᵦ besuchen. Das illustriert endliche Fluktuationen und beweist keinen thermodynamischen Zeitpfeil. Bei ungeradem N existieren zwei gleich wahrscheinliche zentrale Makrozustände; auch der häufigste Zustand hat niemals Wahrscheinlichkeit eins.

Nicht berechnet: realer Phasenraum, Impulse, Energien, Wärme, Temperatur, Stöße, Öffnungsgeometrie, Diffusionskoeffizienten, Materialphysik, Quantengase oder reale Transportzeiten. Die visuelle Bewegung zwischen Kammern ist schematisch. Zwei Schritte pro Sekunde sind eine frei gewählte Abspielrate, keine SI-Zeitkalibrierung. Keine Gleichsetzung mit gravitativer oder Bekenstein-Hawking-Entropie. Wärmefluss-/Bilanzmodelle, BH-Entropielabor und Kosmologie/Wärmetod bleiben außerhalb von v0.6.

Quellenzuordnung:

- [OpenStax College Physics §15.7](https://openstax.org/books/college-physics-ap-courses/pages/15-7-statistical-interpretation-of-entropy-and-the-second-law-of-thermodynamics-the-underlying-explanation): Mikro-/Makrozustände, Multiplizität und Boltzmann-Beziehung. Die q=1/4-Übergangsregel und die beschränkte Markerzählung sind **eigene explizite Lehrmodellannahmen**, keine aus dem Lehrbuch übernommene reale Gasdynamik. Die populäre „Unordnung“-Metapher wird nicht mit Sinnlosigkeit oder jeder Form räumlicher Struktur gleichgesetzt.
- [OpenStax University Physics §13.1](https://openstax.org/books/university-physics-volume-1/pages/13-1-newtons-law-of-universal-gravitation): Newtonsche Punktmassenkraft; die App ergänzt ihre bereits vorhandene numerische Glättung.
- [NASA/JPL: au](https://ssd.jpl.nasa.gov/glossary/au.html): exakte Längendefinition. Die vorhandene App-Abkürzung AU bleibt aus Kompatibilitätsgründen bestehen; die formale IAU-Schreibweise ist au.
- [NASA: Sternreste und Pulsare](https://science.nasa.gov/exoplanets/stars/), [NASA: BH-Anatomie](https://science.nasa.gov/universe/black-holes/anatomy/): qualitative Begriffe für die kleine Kontexthilfe. Bestehende BH-Formel-/Konstantenquellen bleiben im Modellbereich erhalten.

### Nachgerechnete Referenzwerte

| N | k | Ω(k) | 2ᴺ | Pₑq(k), ungerundet | ln Ω(k) |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 1 | 2 | 0,5 | 0 |
| 2 | 1 | 2 | 4 | 0,5 | 0,6931471805599453 |
| 12 | 0 | 1 | 4096 | 0,000244140625 | 0 |
| 12 | 6 | 924 | 4096 | 0,2255859375 | 6,828712071641684 |
| 32 | 16 | 601080390 | 4294967296 | 0,13994993409141898 | 20,214239243953692 |

Für alle 32 zulässigen N werden exakte Zählsumme, Symmetrie, Normierung und endliche Werte geprüft. Zusätzlich reproduziert eine unabhängige Enumeration aller 4096 Bitmuster die vollständige N=12-Verteilung. Für N=2 wird die ganze 4×4-Übergangsmatrix auf Normierung, Symmetrie und stationäre Gleichverteilung geprüft. Reproduzierbare Schritte verwenden eine injizierte Zufallsquelle / festgelegten LCG-Seed; die Browser-UI verwendet Math.random und ist kein kryptographischer Zufallsgenerator.

## Rechentests: Ursache, Isolation und Rückmeldung

Vorher wurden beim Klick tatsächlich dieselben zehn deterministischen Prüfungen erneut berechnet, aber identische Ergebniszeilen wirkten wie eine ausbleibende Aktion. Außerdem erzeugt `checks()` Körper und Szenarien über den globalen Körper-ID-Zähler des Physikmoduls. Eine direkte UI-Ausführung konnte dadurch spätere Live-Körper-IDs verändern, selbst wenn Positionen und Geschwindigkeiten unberührt blieben.

Jetzt führt `dist/checks-worker.mjs` die **unveränderten Originalrechnungen** in einer eigenen Modul-Worker-Umgebung aus. Deren ID-Zähler ist vom Hauptfenster getrennt. `self-checks.mjs` verwaltet einen echten offenen Auftrag, Doppelaufrufschutz, Abschluss-/Fehlerstatus und einen 10-Sekunden-Watchdog. Worker und Watchdog werden bei Abschluss oder Fehler freigegeben. Kein künstlicher Fortschritt, kein verzögertes Scheinladen und kein physikverändernder Fallback. Wird der Worker blockiert oder ist er nicht verfügbar, erscheint ein übersetzter Fehler mit erneuter Versuchsmöglichkeit.

Jeder abgeschlossene Versuch erhöht den sichtbaren Zähler; nur eine valide tatsächliche Worker-Antwort mit zehn Resultaten kann einen normalen Ergebnisstatus erzeugen. Fehlgeschlagene Versuche sind ausdrücklich fehlgeschlagen, kein behaupteter Rechenpass. Gültige Ergebnisse mit einzelnen `ok=false` werden von technischen Worker-Fehlern unterschieden. `role=status`, `aria-live=polite`, `aria-atomic=true` und `aria-busy` bilden den Status ab. Der Button ist nur während des echten Auftrags gesperrt. Falls dies den gerade dort stehenden Fokus auf BODY fallen lässt, erhält er nach Abschluss den Fokus zurück; neue Navigation oder andere Fokusziele werden nicht überstimmt.

Node-Tests führen die Originalchecks mehrfach in echten separaten Worker-Threads aus und zählen Anfragen/Freigaben. Nach drei Ausführungen unterscheiden sich vor-/nachgelagerte Sentinel-Körper-IDs genau um eins, Körperzustand und berechnete Vorhersage bleiben identisch. Chromium prüft denselben Einstieg mit einer vollständigen Vorhersage sowie tatsächliche Buttonklicks mit neu angeforderten Worker-Modulen, Zähler 3/4, zehn Ergebniszeilen, Fokus und DE/EN. Ein ausdrücklich injizierter Worker-Fehler prüft die sichtbare Fehlerbehandlung und Erholung; dies ist ein Fehlertest, kein echter Physikfehler.

Der UI-Text grenzt zehn modellinterne Selbstchecks von vollständiger Formelverifikation, der gesamten GitHub-Testsuite und Hardwaretests ab. Der vorhandene `window.entrolab.checks()`-Diagnoseeinstieg liefert nun ein Promise für den isolierten Lauf; UI und Browserregression verwenden denselben Einstieg.

## Automatische Prüfungen und tatsächliche Ausführungen

Ausgangsbasis: lokaler Node-Lauf **108/108** (zehn Originalchecks + 98 Node-Fälle). Bestehende GitHub-CI des Plan-Commits [42499418785](https://github.com/phoscore/entrolab/actions/runs/42499418785): dieselben 108, **7/7 Chromium** und sechs Originaldateien erfolgreich.

Erster vollständig grüner Implementierungslauf: Commit `ee56e537368a0af51bacd52f808b11a4b1eed3c8`, GitHub Actions [42503387218](https://github.com/phoscore/entrolab/actions/runs/42503387218), vollständig erfolgreich:

| Prüfung | Ergebnis |
| --- | --- |
| Regulär, Node 22.23.4 in GitHub CI | 10 Originalchecks + 119 Node-Fälle = **129/129** |
| Regulär, lokal Node 24.22.1 | **129/129** |
| Ursprüngliche Chromium-Regressionen | **7/7**, bestehende Fälle/Assertions unverändert |
| Neue v0.6-Chromium-Fälle | **10/10** |
| Chromium gesamt, Version 151.0.7922.34 | **17/17**, keine erfassten Seitenfehler |
| Vollständige numerische Vergleiche | **12/12 exakt gleich**, gleiche Laufzeit vor/nach |
| Historische Originaldateien im Original-Commit | **6/6 SHA-256-Prüfungen bestanden** |

Die 21 neuen regulären Fälle: zehn Mathematik-/Stochastikprüfungen, sieben UI-/Sprach-/Kontexthilfeprüfungen und vier Selbstcheck-Controllerprüfungen. Der bestehende Einstieg bleibt erhalten. Zwei alte VM-Adapter bekommen nur den neuen Controller-Import und benötigte DOM-Eigenschaften; keine ihrer bisherigen Assertions wird entfernt oder gelockert. `tests/browser-review.test.mjs` mit den sieben Alt-Fällen bleibt bytegleich.

Neue Chromium-Fälle: Referenzwerte/Marker/Reset; laufender Sprachwechsel und ungültiger Entwurf/Custom Validity/Fokus; echte Navigation/Offscreen; Glossar/Tastatur/Rückweg und Sandboxentwurf; echte Selbstcheck-Neuausführung mit IDs/Vorhersage; Worker-Fehler/Retry; Desktop/mobile/gebrochene Breite/DPR; Reduced Motion; Titel/Favicon; begrenzter Renderaufwand ohne Zustandsänderung der Gravitation.

Lokaler automatischer Chromium-Start wurde tatsächlich versucht. Mit der verfügbaren Systeminstallation scheitert er an `process_singleton_posix.cc: socket() failed: Operation not permitted`. Die komplette Browser-Suite wurde deshalb **wirklich in GitHub Actions ausgeführt**, nicht durch DOM-Mocks als Browserprüfung ausgegeben. Zusätzlich wurde die interne gemeinsame Chrome-Vorschau interaktiv kontrolliert: Titel, DE/EN, k=6/12 → Ω=924, Glossarbegriffe/Rückweg und Rechentests-Abschlussstatus #2. Eine schmale eingebettete Ansicht diente der visuellen Gegenprobe, nicht als physischer Touchscreen-Test.

### Während der Prüfung behobene bzw. aufgeklärte Befunde

1. Bei 320 px und blockierten Webfonts ragte „Gleichgewichtsverteilung“ als langes deutsches Wort um ca. 13 px hinaus (Dokumentbreite 333 statt 320). Der Umbruch wird jetzt gezielt an neuen Lab-Überschriften erlaubt. Fünf Navigationsfelder verwenden auf schmalen Ansichten schrumpfbare Spalten. Die Ursache wurde mit DOM-Überlaufdiagnostik eingegrenzt; es wurde kein `overflow:hidden` zum Verstecken des Problems benutzt.
2. Der erste Offscreen-Test scrollte nur bis zum Footer eines kurzen Dokuments. Ein Teil der Kammer blieb dabei sichtbar; der Timer lief zu Recht weiter. Der Test öffnet nun den echten Advanced-Inhalt, scrollt bis zum Footer und prüft ausdrücklich, dass die **gesamte** Kammer oberhalb des Viewports liegt, bevor er einen gestoppten Timer verlangt. Die Anhaltebedingung wurde nicht abgeschwächt.
3. Ein zunächst eingebauter CI-Vergleich gegen alte JSON-Zahlen direkt über unterschiedliche Node-Versionen war zu streng bezüglich plattformabhängiger Rundung, aber ungeeignet zur Erkennung von Codeänderungen. Beispiel: relative Endenergiedrift der adaptiven Doppelsternbahn lokal `0.0003702202852304622`, unter Node 22 `0.0003702202853540551`. Der endgültige Guard berechnet **beide Quellstände in derselben Node-/V8-/OS-Umgebung** und verlangt vollständige exakte Gleichheit. Zusätzlich bleiben Physikkern, Benchmarkquellen und historische JSON-Referenz bytegleich. Keine Toleranzvergrößerung, keine Neugenerierung der Referenz.

## Performance, Viewports und Zugänglichkeit

- Maximal 32 DOM-Marker, 33 Diagrammbalken/Tabellenzeilen. Kein neuer Canvas-Backing-Store und keine unabhängige Entropy-RAF-Schleife.
- Ein einzelner 500-ms-Timer nur bei ausdrücklichem Mischen, aktiver Ansicht, sichtbarem Dokument und sichtbarer Kammer. Beim Verstecken wird er gelöscht; Rückkehr erzeugt höchstens einen neuen Timer, keinen Zeitnachholstau. Manuelle Änderung, Reset und Reduced-Motion-Wechsel pausieren. Dokument-Sichtbarkeit wird deterministisch im UI-Adapter geprüft; App-Tabwechsel und tatsächliches Offscreen-Scrollen zusätzlich im echten Chromium.
- Reduced Motion unterdrückt die CSS-Markerübergänge; initial immer pausiertes Entropy Lab. Bei ausdrücklicher Auswahl können auch dann diskrete Zustandswechsel abgespielt werden. Bestehende Sandbox-/Extreme-Lifecycles bleiben separat.
- Die sieben alten Browsertests prüfen weiterhin zwölf Breite-/DPR-Kombinationen über je 120 Frames: 320, 320,5, 390,25 und 1360 CSS-px × DPR 1/1,25/2. Höhen-/Bedienelementverschiebung jeweils **0 CSS-px** im grünen Lauf, unter der bestehenden Grenze von 0,1 px.
- Das Entropy Lab wird mit N=32/k=16 bei 320 px/DPR1, 390 px/DPR2, 320,5 px/DPR1,25 (iframe) und 1360 px/DPR1 geprüft. Kein horizontaler Überlauf; Kammerhöhe 320 px. Hauptbuttons mindestens 44×44 CSS-px (gemessene Höhen 45 oder 66 px). Bei einer gebrochenen iframe-Breite rundet `innerWidth` auf 321; das ist kein 321-px-Testersatz, die iframe-CSS-Breite wird ausdrücklich auf 320,5 gesetzt.
- Natürliche Buttons, Range-/Zahleingaben und Details/Summary, sichtbare Fokusmarkierung, Text statt alleiniger Farbcodierung, ARIA-Kammer-/Diagrammbeschreibung, Datentabelle und zurückführende Kontexthilfe. Kein behaupteter vollständiger Screenreader-Audit.

Im grünen Chromium-Lauf wurden 500 synchrone Einzel-Schritt-Klicks bei N=32 gemessen: **Median 0,20 ms, p95 0,30 ms, Maximum 0,80 ms**. Enthalten sind Ereignisverarbeitung, Zufallsschritt und synchrone DOM-Aktualisierung; nicht enthalten ist eine vollständige Layout-/Paint-/Display-Latenzmessung. Kein FPS-, Touchgerät- oder Energiebudgetversprechen. Nach 500 Klicks: keine automatische Entropy-Zeitplanung und identischer Gravitationsmodellzustand.

Favicon im echten Chromium bei nativen **16×16 und 32×32 CSS-px**, jeweils auf hellem und dunklem Hintergrund gerendert und visuell angesehen: heller Ring/dunkles Zentrum und kleines seitliches `:)` erkennbar. Alle Bilder sind eigene SVG-Pfade, keine Fremdlogos oder heruntergeladenen Bildassets. Systemschrift-Screenshots für Desktop und 320/390/320,5 px wurden ebenfalls angesehen; sie sind Nachweise konkreter Ansichten, keine universelle Lesbarkeitsgarantie.

Messwerte und Screenshots: GitHub-Actions-Artefakt `chromium-review-measurements` am genannten grünen Lauf (`measurements.json`, `v06-measurements.json`, vier Lab-Screenshots und `favicon-16-32.png`). Artefakte laufen nach GitHub-Aufbewahrungsfrist ab; wesentliche Zahlen stehen deshalb zusätzlich in diesem Bericht. Die historischen numerischen Referenzen im Repository bleiben unverändert.

## Zwölf numerische Benchmarks: unverändert

`node scripts/benchmark.mjs` wurde lokal vor und nach Umsetzung tatsächlich ausgeführt. Die vollständigen beiden JSON-Ausgaben und `docs/numerics-v0.2.json` waren unter Node 24.22.1 bytegleich; SHA-256 der Ausgabe: `743a9773953b40848fb8596e15df1a60ab8ef507222b62400cb23c32c23f307a`.

`scripts/check-benchmarks.mjs` extrahiert die drei unveränderten Benchmark-/Physikquellen aus dem genehmigten v0.5-Commit in ein temporäres Verzeichnis und führt Basis und Kandidat mit demselben Node-Prozessprogramm in separaten Prozessen aus. Alle zwölf kompletten Resultate einschließlich Schrittzahl, Drift, Impuls-/Drehimpulsfehler und Endpositionen müssen exakt gleich sein. Historische JSON-Datei und Quellen werden zusätzlich byteweise geprüft. CI führt dies als eigenen Schritt aus; keine Änderung an den zwölf Fällen oder ihren Referenzwerten.

Es gibt **keine behauptete numerische Verbesserung**: Änderung gegenüber der Basis innerhalb derselben Laufzeit überall exakt null. Es wurde kein Integratorvergleich zur Rechtfertigung eines neuen Verfahrens benötigt, weil das Verfahren überhaupt nicht geändert wurde. Die bekannten Modell-/Kollisionsgrenzen bleiben bestehen.

Lokale Node-24.22.1-Orientierungswerte (vollständige Daten weiterhin in `docs/numerics-v0.2.json`):

| Szenario | Verfahren | Schritte | maximale relative Energiedrift | Änderung v0.6 |
| --- | --- | --- | --- | --- |
| binary | adaptive | 118807 | 0.000469147994821 | exakt 0 |
| binary | fixed | 365251 | 5.32604530599e-05 | exakt 0 |
| solar | adaptive | 173974 | 8.26206739211e-11 | exakt 0 |
| solar | fixed | 365251 | 1.92442233129e-11 | exakt 0 |
| hole | adaptive | 73050 | 1.14597032031e-09 | exakt 0 |
| hole | fixed | 365251 | 6.76778676014e-12 | exakt 0 |
| eccentric | adaptive | 13582 | 0.000510641529683 | exakt 0 |
| eccentric | fixed | 36526 | 0.00233501809285 | exakt 0 |
| triple | adaptive | 7886 | 3.60668205356e-05 | exakt 0 |
| triple | fixed | 36526 | 1.90568087714e-06 | exakt 0 |
| encounter | adaptive | 65 | 1.20185324157e-05 | exakt 0 |
| encounter | fixed | 300 | 1.25125340141e-06 | exakt 0 |

## Verbleibende Grenzen und unabhängiger Review

- Kein empirisch kalibriertes Thermodynamik-, Wärmefluss- oder Gravitationsentropiemodell. Die Binomialmathematik ist geprüft, ihre Illustration ist kein Beweis über die reale Entwicklung des Universums.
- Keine neuen Einschränkungen der bekannten Newton-/BH-/Sternmodelle verborgen; insbesondere bleibt mögliches Kollisions-Tunneling bestehen.
- Keine echten Smartphone-Hardware-/Touchscreen-, iOS-/Safari-/Firefox-, Browserzoom-200-%- oder vollständigen Screenreader-Tests durchgeführt. Die genannten Viewports/DPR und Reduced Motion sind Chromium-Emulationen. Kein universeller Performance-/Zufallsqualitätsnachweis.
- Modul-Worker sind Voraussetzung für die isolierten Selbstchecks; bei Sperre erscheint ein ehrlicher Fehler. Die Sandbox bleibt unabhängig davon bedienbar.
- Die kleine Kontexthilfe ersetzt keinen vollständigen Cosmic Field Guide. Keine Spekulation wird als berechnete Physik ausgegeben.
- Abschließende Dokumentations-/Messpräzisierungen werden im PR gesondert durch CI kontrolliert. Vor einem Merge ist weiterhin unabhängiger Review und ausdrückliche Eigentümerfreigabe notwendig.

## Nachtrag: unabhängige Codex-Reviewkorrekturen

8. November 2026, geprüft gegen `f084d203c171e30fd9069a72c2baad55ffb253bb`; weiterhin ausschließlich `develop/v0.6`, bestehender PR #5. Dieser Nachtrag korrigiert zwei technische Restfehler. Wissenschaftliche Annahmen, q=1/4, Formeln, gültige Zustandsausgaben und alle bestehenden Physikmodelle/Integratoren bleiben unverändert.

### P2: Kontextnavigation und Fokus-Lifecycle

**Vor der Korrektur tatsächlich reproduziert:** Entropy Lab → Kontextlink → Black Hole Lab → „Zurück zum Labor“ endete in der gemeinsamen echten Chrome-Vorschau mit `document.activeElement.tagName === 'BODY'`. Das Entropy Lab war unsichtbar. Die Rückwegfunktion hatte den ursprünglichen Kontextlink über den Labwechsel hinweg gespeichert, schloss dann das Glossar und versuchte, den inzwischen verborgenen Link zu fokussieren.

**Korrektur in `dist/guide.mjs`:** Ein Capture-Listener an der bestehenden Hauptnavigation verwirft den Hilfekontext vor dem Ausblenden seines Ursprungs, schließt die kontextuelle Erklärung und verbirgt den Rückwegbutton **ohne** Fokusrückgabe. Die bestehende Navigation behält ihren Fokus auf dem neu aktivierten Labbutton. Ein späterer/alter Rückwegaufruf ist wirkungslos. Normales Zurück und Escape innerhalb einer Erklärung fokussieren weiterhin den Ursprung. Bei einem entfernten, verborgenen, deaktivierten oder anderweitig nicht fokussierbaren Ursprung wird zuerst der sichtbare aktive Navigationstab, danach gegebenenfalls der Hauptinhalt als Rücksprungziel versucht. Die Funktion prüft sowohl DOM-Verbindung/Anzeigerechteck als auch den tatsächlich erhaltenen Fokus. Das native Schließen von Details beendet ebenfalls den Kontext; manuell geöffnetes allgemeines Glossar ohne Kontext wird durch Navigation nicht ungefragt geschlossen. Escape außerhalb der Erklärung wird nicht abgefangen.

Node-Regressionen prüfen direkten Rückweg und Escape, wiederholtes Schließen, Navigation mit Capture-Reihenfolge, alte Rückwegaufrufe, verborgene/deaktivierte/entfernte Ursprünge, natives Details-Schließen und Escape außerhalb der Erklärung. Der bestehende Entropy-UI-DOM-Adapter bekommt nur `isConnected` und `getClientRects()` entsprechend der nun genutzten DOM-Schnittstelle; seine bisherigen Testfälle und Assertions bleiben erhalten.

Echte Chromium-Regressionen ergänzen die Folge über alle vier Labs bei Desktop/DE (1360 px) und schmaler Ansicht/EN (390 px). Aktivierung und Rückweg erfolgen mit Enter, Schließen mit Escape, danach wird die nächste Tab-Taste auf den erwarteten Hauptnavigationsbutton geprüft. Direkte Mausnavigation und natives Schließen/erneutes Öffnen des Glossars sind ebenfalls enthalten. Nach einem Labwechsel ist die Erklärung geschlossen, der alte Rückweg verborgen und der neue Navigationstab fokussiert. Alte programmatisch ausgelöste Rückwegereignisse stellen keinen versteckten Fokus wieder her.

Verglichen werden Körper inklusive IDs/Trails, Auswahl, Pause, simulierte Zeit, Kollisionszahl, Ansicht und bestehender Vorhersagewert sowie der Entropy-Zustand. Die Modellwerte bleiben identisch; Sentinel-Körper-IDs vor/nach den Hilfefolgen unterscheiden sich genau um eins, also keine zusätzliche Körperallokation. Der bereits vor dem Review bei Navigation erhöhte interne `predictionGeneration`-Abbruchzähler ist kein physikalischer Wert und wird durch diese Korrektur nicht verändert. Die bestehende Navigationsbehandlung von Vorhersagen bleibt erhalten. Zusätzlich wurde die korrigierte Originalfolge mit Tastatur im gemeinsamen Chrome interaktiv gegengeprüft: Fokus auf dem Black-Hole-Labbutton; normaler Rückweg und Escape danach auf dem zugehörigen sichtbaren Kontextlink.

### P3: Sparse Arrays und ungültige Zustandstypen

**Vor der Korrektur tatsächlich reproduziert:** `validateState(new Array(2))` akzeptierte das Array; `macrostate(new Array(2))` gab fälschlich 0 zurück, und `randomStep()` erzeugte wieder ein Array mit Länge zwei, aber ohne eigene Indexeinträge. `Array.prototype.every()` und nachfolgende Arraymethoden überspringen Lücken; eine plausible Arraylänge war daher kein Beleg für zwei Marker. Auch ein Array-ähnliches Objekt mit vorgetäuschtem `every()` konnte die alte Prüfung umgehen.

**Korrektur in `dist/entropy.mjs`:** Zuerst `Array.isArray`, dann die unveränderte N-Grenze 1–32, schließlich eine indexweise Prüfung auf **eigene** Einträge und primitive Boolean-Werte. Leere/zu lange echte Arrays bleiben Bereichsfehler (`RangeError`); falsche Zustandstypen, Lücken, geerbte Slots und Nicht-Booleans erzeugen `TypeError`. Die Prüfung liefert ein gültiges Array weiterhin unverändert zurück. `macrostate()` und `randomStep()` nutzen denselben zentralen Guard; ungültige Zustände werden vor RNG-Verbrauch zurückgewiesen und weder aufgefüllt noch verändert. Das ist eine Eingabevertragskorrektur, keine Änderung der Statistik oder der Wechselregel. Interne API-Fehlertexte sind wie die bestehenden Bereichsfehler keine neu sichtbaren UI-Meldungen; die übersetzte Formularvalidierung bleibt unverändert.

Fünf neue Node-Fälle decken vollständig/teilweise sparse Arrays bei N=1/2/12/32, führende/mittlere/letzte Lücken, geerbte Indizes, überschriebenes `every`, Array-ähnliche Objekte, Typed Arrays, primitive Werte, Wrapper, explizites undefined/null und weitere Nicht-Booleans ab. Alle drei zustandslesenden Exporte (`validateState`, `macrostate`, `randomStep`) werden geprüft. RNG-Aufrufzahl und unveränderte Eigenschaftsdeskriptoren sichern den frühen, mutationsfreien Abbruch ab. Für sämtliche zulässigen N/k werden außerdem echte, dichte Zustände aus `arrangement`, `sampleArrangement` und `randomStep` validiert und mit `distribution`/`multiplicity` abgeglichen. Eine zusätzliche echte Chromium-Prüfung importiert dieselben Produktionsmodule, prüft 39 ungültige Funktionsaufrufe, null RNG-Aufrufe und acht gültige Grenzzustände; der Live-Modellzustand bleibt erhalten.

### Ausgeführte Prüfungen und Bewahrung

Vorher: **129/129 reguläre Prüfungen** lokal erneut bestanden. Die neun neu geschriebenen Node-Regressionen wurden noch gegen die unkorrigierten Module ausgeführt: **2 bestanden / 7 fehlgeschlagen**. Nach beiden Korrekturen: **9/9 neue Fälle bestanden** und lokal unter Node 24.22.1 **138/138 regulär** (zehn Original-Selbstchecks + 128 Node-Fälle). Kein bestehender Test und keine alte Assertion wurde entfernt oder gelockert.

Implementierungscommit `c7ab04a2bbaedeb1c4bdaea122837127cd0be80a`; grüner [PR-CI-Lauf 42510109940](https://github.com/phoscore/entrolab/actions/runs/42510109940):

| Prüfung | Ergebnis |
| --- | --- |
| Bisherige reguläre Fälle | **129/129 erhalten und bestanden** |
| Neue Node-Regressionen | **9/9** |
| Regulär insgesamt | **138/138** |
| Bisherige Chromium-Fälle | **17/17 erhalten und bestanden** |
| Neue Chromium-Regressionen | **3/3** |
| Chromium insgesamt | **20/20** |
| Numerische Vorher/Nachher-Vergleiche im selben Runtime | **12/12 exakt gleich** |
| Original-Commit-Integrität | **6/6 SHA-256-Prüfungen bestanden** |

Der gesamte vor dem Review bestehende Inhalt von `tests/entropy-browser.test.mjs` wurde bytegleich bewahrt; die drei Fälle sind angehängt. `tests/browser-review.test.mjs` ist unverändert. Syntax-/Node-Tests sind über den bestehenden Einstieg eingebunden; der bestehende Browserbefehl/Workflow führt die angehängten Chromium-Fälle automatisch aus.

Die zwölf lokalen Benchmark-Ausgaben wurden vor/nach dem Reviewfix erneut vollständig berechnet und sind unter Node 24.22.1 bytegleich, ebenso zur unangetasteten historischen JSON-Referenz. SHA-256 weiterhin `743a9773953b40848fb8596e15df1a60ab8ef507222b62400cb23c32c23f307a`. Der bereits vorhandene CI-Guard bestätigt dieselben zwölf vollständigen Resultate gegen die genehmigte v0.5 unter derselben Laufzeit. Keine neue Toleranz oder Referenzkalibrierung.

Lokaler automatisierter Chromium-Start wurde erneut versucht und scheitert weiterhin an `socket() failed: Operation not permitted`. Die angegebenen 20 automatisierten Browserfälle wurden tatsächlich in GitHub Actions ausgeführt. Reale Smartphone-/Touchhardware, Safari/Firefox und vollständige Screenreader-Prüfung bleiben wie zuvor offen. Die abschließende Dokumentation wird zusätzlich am endgültigen PR-Head durch CI kontrolliert. Kein Merge, Deployment, Produktionsupdate oder Eingriff in `main`/v0.1 ist Teil dieser Reparatur. PR #5 bleibt zur erneuten unabhängigen Prüfung offen.
