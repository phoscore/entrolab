# v0.9 · Physics Reimagined

**Basis** `ec2c4f1a5957478ab255f286a0ca2a9341cabcbe` (v0.8.5)  
**Entwicklung** `feature/v0.9-physics-reimagined`  
**Geprüfter Funktionsstand** `0883bb29990563e65dfabff47c23a5f3629b7ffc`  
**Plan** [Roadmap aus PR #9](v0.9/README.md) und [Umsetzungsfreigabe](v0.9/Umsetzungsfreigabe.md)

## Änderungen und Prüfpfade

| Bereich | Umsetzung | Einstieg im Code |
| --- | --- | --- |
| Branding und Navigation | Titel, Metadaten, Header, Footer und Quellenbereich tragen **Reincarnated as a Proton**. Dekorative Abschnittsziffern entfallen. Die Tour ist in der Website ausgesetzt. Die alten Tour-Fälle laufen mit wiederhergestelltem Test-Markup weiter. Labore behalten ihre direkt erreichbaren Fragen, Prognosen und Quellen. | [Seitenstruktur](../dist/index.html), [Übersetzungen](../dist/reimagined-text.mjs), [Kontextnavigation](../dist/guide.mjs), [Tour-Fixture](../tests/legacy-tour-fixture.mjs) |
| Black Hole 3.0 | Eigenständige 2.5D-Umgebung mit Perspektive, abschaltbarer Scheibe, Pause und weitem/nahem Lichtvergleich. Statisches SVG bei nicht verfügbarem Canvas. Bestehende Messwerte und Diagramme bleiben bedienbar. | [Renderer](../dist/accretion-render.mjs), [Lebenszyklus](../dist/blackhole-view.mjs) |
| Extreme Temperature | Gas-A/B im großen Beobachtungsfenster mit Stichprobe, theoretischer Verteilung, Kennzahlen, Pause und Bildtempo. Ein expliziter Knopf kann einen gültigen Temperaturwert in A kopieren. Material Explorer und Wärmeexperiment behalten ihre Modelle und Daten. | [Gasrechnung](../dist/gas-model.mjs), [Gasansicht](../dist/gas-view.mjs), [Layout](../dist/physics-reimagined.css) |
| Materie & Felder | Nach Entropy. Kompakte Stationen für Photonenimpuls und Deuteron-Bindung. Ein Kanon für den QCD-Artikel mit umschaltbarem Valenzquark-/Feldschema und Rücksprung zu Science. | [Invarianten und Referenzwerte](../dist/matter-model.mjs), [Messstationen](../dist/matter-view.mjs), [Wissens-UI](../dist/knowledge-ui.mjs) |
| Null | Eine Figur in eigener Fläche, mit **Beobachter** und seltenerem **Riss**. Das vorhandene Hero-WebP liefert eine gemeinsame Textur für beschnittene CSS-Ebenen. Augen, Kopf, Arme und Ring werden separat bewegt. Standbild, Abschalten, Reduced Motion und kontrollierte Wiederholung sind direkt erreichbar. Der Master und die bereits freigegebenen Ableitungen bleiben bytegleich. | [Steuerung](../dist/creature-ui.mjs), [Auslösepolitik](../dist/creature-policy.mjs), [CSS-Regie](../dist/creature.css) |

## Wissenschaftliche Modelle und Einheiten

- **Schwarzes Loch.** Die Umgebung zeigt eine physikalisch motivierte Illustration. Die eingezeichneten Kreise im Lichtmodus markieren den Schwarzschild-Horizont und die Photonensphäre bei `1,5 rₛ` im Koordinatenschnitt. Der scheinbare dunkle Schatten in der Umgebung ist eine eigene Bildgröße. Lichtkurven, Leuchtfarben und Fluss der Scheibe sind schematisch. Das Bild liefert weder Ablenkwinkel noch Strahlungs- oder Plasmavorhersagen. Die bisherige Schwarzschild-/Hawking-Rechnung, einschließlich der gekennzeichneten Leistung und Lebensdauer als Modellschätzungen, läuft separat. [NASA, Anatomie](https://science.nasa.gov/universe/black-holes/anatomy/) · [NASA SVS, Referenzvisualisierung](https://svs.gsfc.nasa.gov/13326/)
- **Gas.** Klassisches, nicht wechselwirkendes Gleichgewichtsmodell mit drei unabhängigen normalverteilten Geschwindigkeitskomponenten. Die Masse repräsentiert ein Argonatom mit `39,948 u`. Aus `σ² = k_B T/m` folgen `v_rms = √3 σ`, `⟨v⟩ = √(8/π) σ` und `⟨E_kin⟩ = 3 k_B T/2`. Das Histogramm misst den 3D-Betrag in `m/s`, seine Dichte hat Einheit `(m/s)⁻¹`. Die zweidimensionale periodische Projektion nutzt nur x/y und eine für die Beobachtung verlangsamte Bildzeit. Je 160 Partikel, gemeinsamer unabhängiger Seed für den A/B-Vergleich und explizit ausgewiesene Histogramm-Ausläufer. Das UI-Fenster 30–3.000 K dient dem idealisierten Vergleich, auch dort, wo reales Argon bei Normaldruck eine andere Phase hätte. Kein Kollisions-, Material- oder Wärmemodell. [OpenStax, Geschwindigkeitsverteilung](https://openstax.org/books/university-physics-volume-2/pages/2-4-distribution-of-molecular-speeds) · [NIST, SI-Temperatur](https://www.nist.gov/pml/owm/si-units-temperature)
- **Photonen.** Für zwei freie Photonen gilt `M²c⁴ = (E_A+E_B)² − |p_A+p_B|²c²`. Der numerisch stabile Ausdruck ist `Mc² = 2√(E_A E_B) sin(θ/2)`. UI-Energien sind in MeV, Masse in MeV/c². Jedes Photon hat Ruhemasse null. Parallele Photonen haben Systemmasse null und kein gemeinsames Ruhesystem. Bei je 1 MeV liefern 0°, 90° und 180° jeweils 0, √2 und 2 MeV Ruheenergie des Systems. [PDG, Kinematics](https://pdg.lbl.gov/2024/reviews/rpp2024-rev-kinematics.pdf)
- **Deuteron.** Die Differenz aus freien nuklearen Ruheenergien `938,27208943 + 939,56542194 MeV` und der Deuteron-Ruheenergie `1875,61294500 MeV` ergibt `2,22456637 MeV` vor UI-Rundung. Es werden keine Atom- oder Elektronenmassen addiert und keine Bindungsdynamik simuliert. Die Differenz ist Kernbindungsenergie. Der QCD-Artikel behandelt getrennt die Masse eines einzelnen Protons. [NIST, CODATA 2022](https://physics.nist.gov/cuu/Constants/index.html)
- **Proton.** Das Feldbild illustriert den dynamischen Quark-/Gluonenzustand. Das Valenzbild beschreibt die Valenzstruktur. Es gibt keine eindeutigen universellen Prozentanteile aus der Grafik und keine QCD-Zeitentwicklung. Der mathematische Mass-Gap für reine Quanten-Yang–Mills-Theorie ist weiterhin offen. [CMS, Quarks im Proton](https://cms.cern/news/how-are-quarks-moving) · [Yang et al., Gitter-QCD](https://doi.org/10.1103/PhysRevLett.121.212001) · [Clay Mathematics Institute](https://www.claymath.org/millennium/yang-mills-the-maths-gap/)
- **Null.** Die Animation ist als Fiktion gekennzeichnet. Keine Zufallszahlen oder Zustandsschreibzugriffe in den Simulationen. Die Sequenzen teilen einen vorhandenen 23.636-Byte-WebP ohne neuen Sprite-Transfer. Diese Bytezahl misst den komprimierten Asset-Inhalt. Eine Messung der dekodierten GPU-Speicherbelegung steht aus.

## Regression und unabhängiger Zwischenreview

Die veröffentlichten Solver, Konstanten, Toleranzen, Referenzdateien und das Originalarchiv sind im Vergleich zur Basis unverändert. Die neuen Modellprüfungen integrieren die Maxwell-Dichte numerisch, prüfen ihr zweites Moment, bestätigen die Stichproben- und Histogrammnormierung und vergleichen die Photonenformel mit einer unabhängigen Vierervektor-Subtraktion. Die vierfache Temperatur von 150 auf 600 K liefert die doppelte RMS-Geschwindigkeit (etwa 306 und 612 m/s). Der Deuteron-Test kontrolliert die Differenz separat gegen die Referenz.

Ein separater lesender Review auf `600f36af42ad33531756cb070b152ecb9a75a237` bestätigte die Modelltrennung und identifizierte einen SVG-Sichtbarkeitsfehler sowie veraltete Fragmente beim Tabwechsel. Folgecommit `0883bb2` behebt beides. Er ergänzt den Rückfall auf direkte Canvas-Zeichnung bei fehlendem Cache-Kontext, Fokusübergabe beim Deaktivieren von Gasbewegung, die Temperatur-Sprungmarke vor ihrem Ziel und die auf vorhandene Materialkarten passende Kompaktgestaltung. Der erste Chromium-Lauf fand fünf Ausfälle durch geänderte Navigations-/Subscription-Erwartungen, eine fehlende Tour-Fixture, den geänderten QCD-Zugriff und eine Motion-Timing-Annahme. Die Korrekturen stellen die ursprünglichen Prüfziele wieder her und ergänzen eine gezielte Gas-Teardown-Prüfung.

| Prüfung | Ergebnis auf dem Funktionscommit |
| --- | --- |
| Lokaler regulärer Lauf und GitHub Actions | 205 bestanden (195 Node-Fälle und 10 Anwendungsselbstchecks). Basis 200. |
| Echte Chromium-Suite in GitHub Actions | 94 bestanden (85 aus v0.8.5, neun neue Fälle). Ein separater Browserstart in der lokalen Ausführungsumgebung war durch deren Socket-Beschränkung nicht möglich. |
| Historische Benchmarks | 12 vollständige Ergebnisse exakt gleich, einschließlich Quell- und Referenzvergleich. |
| Originalintegrität | 6 Datei-Prüfsummen aus `be2502d51a449de3e515faaf72ab5954b1a739d4` stimmen. GitHub-Ref `archive/v0.1` zeigt weiterhin auf diesen Commit. |

Die Browserfälle decken 320/390/1.440 CSS-px, Geräte-DPR 2 und Systemschrift-Fallback, Fokus und Rücksprung, DE/EN, persistente Entwürfe, die Zustände der alten Labore, die beiden Null-Sequenzen, Reduced Motion, Canvas-Fallback, Sichtbarkeit und wiederholten Teardown ab. Die bestehende Laufbahn-, Kollisions- und Erhaltungsabdeckung bleibt aktiv. [CI und Prüfarbelege](https://github.com/phoscore/entrolab/actions/runs/43122648369)

## Performance und Grenzen der Messung

Gleicher CI-Runner, Chromium 151.0.7922.34, DPR 1, Systemschrift-Fallback, 650 ms Warm-up. Bewegte BH-Messungen jeweils dreimal im Wechsel über rund 4 s bei fester, je Profil gleicher Bildgröße. Das Desktop-Messprofil nutzt 1.360 CSS-px, die mobile Emulation 390 CSS-px mit 4× CPU-Drosselung. Statische und Gravity-Proben je einmal 1,8 s. Gas je einmal rund 4 s. Die P95-Angaben der animierten BH-Zeilen sind Mediane der drei P95-Werte. Die absoluten und relativen Unterschiede beziehen sich auf den Median der CDP-`TaskDuration` des gesamten Tabs.

| Szene | v0.8.5 → v0.9 TaskDuration | Zeichnungen und Zeit |
| --- | --- | --- |
| BH aktiv, Desktop | 622,83 → 172,97 ms (−449,87 ms, −72,2 %). Spannen 617,33–832,49 bzw. 169,47–189,36 ms. | Je 120–121 Draws. Draw-P95 0,50 → 0,60 ms, Frameintervall-P95 33,4 ms auf beiden Ständen. |
| BH aktiv, 390 px/4× CPU | 1.828,49 → 545,58 ms (−1.282,91 ms, −70,2 %). Spannen 1.818,13–1.841,52 bzw. 487,79–736,71 ms. | 121 → 120–121 Draws. Draw-P95 2,00 → 2,70 ms, Frameintervall-P95 33,4 ms auf beiden Ständen. |
| BH statisch, Desktop / 4× CPU | 1,53 → 1,39 ms / 6,33 → 4,94 ms. Diese kleinen Einzeldifferenzen liegen nahe am Messrauschen. | Jeweils 0 Draws und kein eigener geplanter RAF. |
| Gas neu, Desktop / 4× CPU | 172,57 / 392,94 ms. Gas-A/B hat keine gleichartige Basisszene. | Je 120 Draws, P95-Abstand 33,4 ms, Draw-P95 0,20 / 0,80 ms. |
| Gravity pausiert, Desktop | 237,35 → 1,54 ms (−235,81 ms, −99,4 % in dieser Einzelprobe). | 108 → 0 Draws nach Warm-up. Der Browserfall prüft eine Neuzeichnung bei Zoom und Wiederanlauf nach Start. |

In den Stichproben wurden keine Long Tasks registriert. Die beobachtete Bildfrequenz von rund 30 fps und die P95-Intervalle bleiben innerhalb der entsprechenden Roadmap-Ziele. Die BH-Draw-P95 ist in beiden Profilen höher. Die stark gesunkene Gesamt-TaskDuration schließt andere Seitenarbeit ein, unter anderem den entfallenen Leerlauf des Gravity-Canvas. Sie lässt sich nicht allein der neuen Szene zuschreiben. Profilgrößen für BH sind 710 × 345 bzw. 272 × 240 CSS-px. Mobile und Desktop nutzen eine Backing-Store-Obergrenze von DPR 1,25.

Die zwei Canvas-Prototypen wurden pro Profil in der Reihenfolge ohne/mit/mit/ohne Cache mit jeweils 32 Zeichnungen gemessen. Draw-P50 Desktop ohne Cache 3,5 ms, mit Cache 0,5 ms. 390 px/4× CPU ohne Cache 11,0–11,6 ms, mit Cache 1,1–1,4 ms. Die Werte messen synchrone Zeichnungsaufrufe, kein Ende der GPU-Arbeit. [Messrohdaten](v0.9/qa/v09-performance.json)

Canvas 2D mit Caches für statische Szenenteile blieb nach dem Vergleich zweier Canvas-Prototypen die technische Wahl. Der Vergleich misst gleichartige Bildkompositionen mit/ohne Cache und liefert keine Aussage zu WebGL2. Die Balken und Bilder beschreiben Zeichenszenen, keine identische wissenschaftliche Rechnung. Statische Ansichten starten keinen dauerhaften Loop. Gas und BH haben je einen Rendering-Besitzer, laufen nur sichtbar und fallen bei Reduced Motion auf statische Aktualisierung zurück. Null verwendet CSS-Animationen mit Sichtbarkeitssteuerung. Der pausierte Gravity-Canvas zeichnet nach Bedarf, ohne Solveränderung.

Automatische Chrome-Prüfungen und Softwaremessungen ersetzen keine Prüfung auf physischem Smartphone, Safari/Firefox, Screenreader-Hardware oder auf Mobil-GPUs. Die 4×-CPU-Emulation erfasst weder GPU, Energieverbrauch noch thermische Drosselung. Der rohe Transfer neu geladener Module und die exakte dekodierte Speicherbelegung wurden nicht mit Netzwerk-/GPU-Profilen gemessen. Ein Browserfall erfasst nach 100 Gas-Mounts/Disposes Listener und Zustandsisolation. Das deckt keine langfristige GPU-Speichermessung ab. Die alte Gravity-Platzierung per Zeigegerät behält ihren bekannten Tastaturmangel. Der Cosmic Explorer bleibt ein separates v0.9.5-Vorhaben.

Der ältere v0.8-Browserprobe-Workflow suchte nach der durch Gas-A/B ersetzten Teilchenfläche. Die Probe verwendet ab v0.9 die neue Bühne, protokolliert den Canvas-Selektor und kennzeichnet die unterschiedlichen Szenen. Die Laufzeiten dieses historischen Stufenvergleichs gelten nicht als direkte Gas-Leistungsverbesserung. Die zwölf numerischen Referenzläufe sind davon unabhängig.

## Vorschau und Produktionsnachweis

Alle Entwicklungscommits tragen `[CF-Pages-Skip]`. Der Funktionscommit zeigt in GitHub Actions keine Cloudflare-Statusmeldung. Vier Nur-Lese-GETs auf der bestehenden Produktionsdomain lieferten HTTP 200 und die exakten v0.8.5-SHA-256-Prüfsummen für HTML, Physik, BH-Ansicht und Monster-Steuerung. Der GitHub-Ref `main` stand beim Abgleich auf dem angegebenen v0.8.5-Merge. Ein Zugriff auf das Cloudflare-Administrationsprotokoll stand für die Kontrolle weiterer Preview-Builds nicht zur Verfügung. [Produktionsnachweis](v0.9/qa/v09-production.json)

Die Prüfbilder zeigen tatsächliche Chromium-Ansichten bei 1.440 und 390 CSS-px. Die beiden Null-Proben tasten die CSS-Sequenzen in elf Frames ab. Die Akkretionsprobe enthält zwölf aufeinanderfolgende Stichproben des laufenden Renderers. Die Bildfolgen dienen der Sichtprüfung, die Laufzeitmessungen stehen separat in den JSON-Rohdaten. Für interaktives Ausprobieren den privaten Entwicklungsbranch lokal auschecken oder das private CI-Quellarchiv entpacken. Im Projektordner starten:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Unter Windows funktioniert auch `py` anstelle von `python`. Dann [localhost:8000](http://localhost:8000/) öffnen. Für die App sind keine npm-Abhängigkeiten nötig. Historische Git-Prüfungen benötigen einen vollständigen Git-Klon. Der private Draft dient der unabhängigen Prüfung vor der Releaseentscheidung.
