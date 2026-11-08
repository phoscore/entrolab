# ENTROLAB 🌌

Interaktiver Physik-Spielplatz von cosmic insignificance: Gravitation, idealisierte Schwarze Löcher, extreme Himmelskörper und ein erstes statistisches Entropy Lab. Browser-Titel: **entrolab - emptiness pro max**.

## Entwicklungsstand und Ausprobieren

**v0.6 auf `develop/v0.6` ist ein Prüfstand, keine Produktionsfreigabe.** Grundlage ist die freigegebene v0.5 auf `main` (`39fde20f812da1d371b4990b15062062cddd102f`). Änderungen gehen ausschließlich als Pull Request zur unabhängigen Prüfung. Kein automatischer Merge.

Die Anwendung ist buildlos: moderner Browser mit ES-Modulen, BigInt und Modul-Workern; Python 3 für einen lokalen HTTP-Server. Keine Paketinstallation und kein Backend zum Benutzen nötig.

```sh
git clone --branch develop/v0.6 https://github.com/phoscore/entrolab.git
cd entrolab
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Unter Windows gegebenenfalls `py` statt `python` verwenden. Dann <http://localhost:8000> öffnen. Wegen der ES-Module und Worker nicht über `file://` starten. Das private Repository benötigt beim Klonen einen berechtigten GitHub-Zugang.

Schriftarten von Google Fonts sind optional; Systemschrift funktioniert ohne sie. Die Berechnungen brauchen kein Internet. Externe Quellenlinks benötigen eine Verbindung. Eine restriktive eigene Content-Security-Policy muss lokale Modul-Worker erlauben; andernfalls melden die Selbstchecks einen Fehler, ohne die Sandbox als Ersatz-Rechenumgebung zu benutzen.

## Labs und Bedienung

- **Gravity Sandbox:** fünf Szenarien, Sterne/Planeten/Schwarze Löcher hinzufügen und bearbeiten, Pause/Tempo/Reset, Flugbahnen, Zoom/Vollbild, Messinstrumente und begrenzte numerische Bahnvorhersage. Körper per Klick oder Inspektor wählen. Beim Platzieren bestimmt Ziehen die Anfangsgeschwindigkeit.
- **Black Hole Lab:** Schwarzschild-Radius und Hawking-Temperatur; Leistung und Lebensdauer als ausdrückliche Modellschätzungen; Größen- und logarithmische Funktionsdiagramme.
- **Extreme Objects:** künstlerische Schwarzes-Loch- und Sternansichten, schematische Geometrie und optionaler schematischer Pulsar, Radienvergleich sowie Kelvin/Celsius-Temperaturlabor. Artwork ist keine GR- oder Emissionssimulation.
- **Entropy Lab:** standardmäßig zwölf nummerierte, unterscheidbare Marker in zwei gleich großen Kammern. `N` ist auf 1–32 begrenzt. Alle links starten, `k` manuell wählen, einzelne Zufallsschritte, automatisch mischen, pausieren und zurücksetzen. Mikrozustand anzeigen oder bei gleichem `k` neu auslosen. Exakte Multiplizität, Gleichgewichtsverteilung, Datentabelle und dimensionslose Modellentropie vergleichen.
- **Kontexthilfe:** „Was bedeutet das?“ öffnet das bestehende Glossar und fokussiert den passenden Begriff; „Zurück zum Labor“ oder Escape führt zum Ausgangslink zurück. Advanced-Infos sind freiwillig aufklappbar. Der Cosmic Field Guide ist nur eine kleine Vorschau.
- **Modell & Quellen:** zehn isolierte modellinterne Selbstchecks. Jeder Lauf zeigt einen Ausführungszähler, Ergebnisstatus und eine Screenreader-Meldung. Das ist weder die gesamte CI-Suite noch eine vollständige Physikverifikation.

DE/EN im Kopfbereich; auch dynamische Werte, Diagrammbeschriftungen und Fehler sind lokalisiert. Eingaben verwenden in beiden Sprachen einen **Dezimalpunkt**, etwa `0.1` oder `1e9`. Noch nicht angewendete Entwürfe bleiben beim Sprachwechsel erhalten. Der Browser-Titel bleibt in beiden Sprachen identisch. Fokusmodus in Sandbox/Extreme Objects, Escape zum Verlassen. Reduced Motion startet bestehende Simulationen pausiert und unterdrückt Markerübergänge; automatisches Entropy-Mischen beginnt immer erst nach ausdrücklicher Auswahl.

## Wissenschaftliche Grundlagen und Grenzen

Die Sandbox berechnet paarweise gewöhnliche dreidimensionale Newton-Gravitation in einer Ebene, intern in AU, Sonnenmassen und Tagen. Velocity Verlet mit adaptiven Schritten und Plummer-Glättung `ε = 10⁻⁷ AU` (≈ 15 km) bleibt unverändert. Adaptive Schritte liefern keine garantierte Fehlerschranke. Kollisionen werden über Modellradien als vollkommen unelastische Verschmelzungen behandelt; Masse/linearer Impuls bleiben erhalten, aufgelöster Bahndrehimpuls/Bewegungsenergie nicht. Große Schritte können Kontakte weiterhin übersehen. Keine GR, Gezeitenzerreißung, Materialphysik oder echte Ephemeriden.

Bahnvorhersage: separate Kopie, höchstens zwölf Körper, 1.500 Schritte und 301 Punkte; Horizonte 10/60/180 Tage. Keine reale Zukunftsprognose und keine laufende Neuberechnung. Näher am Horizont oder bei relativistischen Geschwindigkeiten ist die Newton-Sandbox physikalisch unzuverlässig.

Der BH-Rechner setzt ungeladene, nicht rotierende Löcher voraus. Leistung/Lebensdauer verwenden die idealisierte Photonen-Schwarzkörper-Näherung im leeren Universum, ohne Greybody-Faktoren, zusätzliche Teilchenarten oder Akkretion. Keine Vorhersage der letzten Quantenphase. Sternmassen/-radien sind gewählte Beispiele, keine gelöste Zustandsgleichung. Temperaturbilder sind abstrakte Illustrationen; Kelvin/Celsius wird mit dem exakt definierten Offset 273,15 umgerechnet.

**Entropy Lab:** `Ω(k) = C(N,k)`, insgesamt `2^N` individuelle Zuordnungen; im Gleichgewicht `P_eq(k) = Ω(k)/2^N`. Pro diskretem Schritt wechselt jeder Marker unabhängig und symmetrisch mit `q = 1/4` die Kammer. Die stationäre Verteilung ist binomial; sie ist **nicht** die anfängliche oder bedingte nächste Schrittverteilung. `S/k_B = ln Ω` bezeichnet ausschließlich eine dimensionslose Boltzmann-Modellentropie der groben `k`-Beschreibung. Einzelne Schritte können sie verringern. Keine realen Gasbahnen, Energien, Wärmeflüsse, Temperatur, Diffusionskoeffizienten oder kalibrierte physikalische Zeit. Nicht mit gravitativer oder Bekenstein-Hawking-Entropie gleichsetzen. Ausführlich: [Qualitätsbericht v0.6](docs/Qualitaetsupdate_v0.6.md).

## Tests reproduzieren

Node.js 22 oder neuer:

```sh
node scripts/test.mjs
node scripts/verify-original.mjs
node scripts/benchmark.mjs
node scripts/check-benchmarks.mjs
```

Der reguläre Einstieg enthält **138 Prüfungen**: zehn Original-Selbstchecks und 128 Node-Testfälle. Alle 129 vor dem v0.6-Review vorhandenen Prüfungen bleiben enthalten; neun gezielte Reviewregressionen kommen hinzu. DOM-/VM-Adapter bilden die benötigten Schnittstellen ab, ohne bestehende Assertions zu lockern. Für die Originalintegrität und den Vorher/Nachher-Benchmarkvergleich ist ein vollständiger Git-Klon erforderlich. `--working-tree` ist ausschließlich für den historischen Erstsicherungsstand gedacht und soll auf heutigen Entwicklungsständen nicht verwendet werden.

Die zwölf vollständigen Benchmarks stimmen im lokalen Node-24.22.1-Lauf exakt mit `docs/numerics-v0.2.json` überein. CI berechnet die genehmigte v0.5-Basis und den Kandidaten unter derselben Node-/V8-/Betriebssystem-Version und vergleicht alle Ergebnisse exakt; Rundungsunterschiede zwischen verschiedenen Laufzeiten werden nicht mit Codeänderungen verwechselt. Die historischen Quellen und die JSON-Referenz müssen zusätzlich bytegleich bleiben. Die Benchmarkreferenz wird nicht neu kalibriert. Integrator, Kräfte, Szenarien und Vorhersagemodell sind in v0.6 unverändert.

Für die zusätzlichen realen Chromium-Tests (nur Entwicklungsabhängigkeit, Playwright exakt per Lockfile):

```sh
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install --with-deps chromium
npm run test:browser
```

Die Browser-Suite umfasst **20 Fälle**: sieben bewahrte v0.5-Fälle, zehn bisherige v0.6-Fälle und drei neue Reviewregressionen zu Kontexthilfe/Fokus und Zustandsvalidierung. JSON-Messwerte und Screenshots entstehen unter `browser-results/` und werden in GitHub Actions als Artefakt aufgehoben. Messungen sind keine FPS-Garantie. CI prüft Physik, Originalintegrität und Chromium; sie ersetzt keine unabhängige Prüfung, echte Touchgeräte-/Safari-Prüfung oder technisch eingerichtete Branch Protection. Details und tatsächliche Laufresultate: [Qualitätsbericht v0.6](docs/Qualitaetsupdate_v0.6.md).

## Projektstruktur

| Datei | Aufgabe |
| --- | --- |
| `dist/physics.mjs` | Unveränderter Physikkern und Integrator |
| `dist/experiments.mjs`, `instruments.mjs`, `prediction.mjs` | Szenarien, Diagnostik, begrenzte Vorhersage |
| `dist/app.mjs` | Sandbox, BH-Rechner und Selbstcheck-Anzeige |
| `dist/checks.mjs`, `checks-worker.mjs`, `self-checks.mjs` | Originalrechnungen, isolierter Worker, Ablauf-/Fehlerkontrolle |
| `dist/extreme-*.mjs` | Daten, berechnete Werte und illustrative Renderer |
| `dist/entropy.mjs` | Reine Zählmathematik und stochastische Zustandsfunktionen |
| `dist/entropy-ui.mjs`, `entropy.css` | Kammern, Diagramm, Bedienung und Timer-Lifecycle |
| `dist/i18n.mjs`, `translations.mjs`, `ux.mjs`, `guide.mjs` | Sprache, Fokus, Hilfen und Kontextrückweg |
| `dist/index.html`, `favicon.svg` | Oberfläche, fester Browser-Titel und originales künstlerisches Logo |
| `scripts/test.mjs`, `.github/workflows/tests.yml` | Reguläre Suite und Browser-CI ohne Deployment |
| `docs/` | Pläne, Qualitätsberichte, Quellen und unveränderte historische Referenzen |

## Original und Freigabe schützen

Original v0.1: Commit `be2502d51a449de3e515faaf72ab5954b1a739d4`, zusätzlich unter `archive/v0.1`. Die sechs Originaldateien einschließlich historischer Hosting-Konfiguration sind über `docs/v0.1-original.sha256` und `docs/v0.1-original-commit.txt` gebunden. Diese Referenzen niemals auf neuere Versionen umstellen. `verify-original.mjs` liest ausdrücklich den Original-Commit; der v0.6-Auftrag verschiebt weder Archive noch Tags.

GitHub ist die zentrale Versionsverwaltung. Größere Änderungen auf Entwicklungsbranches, nachvollziehbare Commits und unabhängiger Review vor Freigabe. `main` nur nach ausdrücklicher Eigentümerfreigabe ändern/mergen. **Cloudflare Pages veröffentlicht `main` automatisch auf der bestehenden Produktionsseite.** Deshalb sind Merge und Produktionsveröffentlichung gesonderte Freigabeschritte; diese Entwicklung führt beides nicht aus. Kein neuer Hosting-Standort, kein Release, kein Force-Push und keine eigenmächtige Sichtbarkeitsänderung. Die historische `.openai/hosting.json` wird nicht als Deployment-Auftrag benutzt.

Korrekte Modelle und dokumentierte Grenzen haben Vorrang. Künstlerische Effekte und Humor sind ausdrücklich von berechneter Physik getrennt. „90 % wissenschaftlich fundiert“ ist eine Gestaltungspräferenz, keine gemessene Genauigkeitsgarantie.

## Quellen und bisherige Berichte

- [OpenStax §15.7: Mikrozustände und Boltzmann-Entropie](https://openstax.org/books/college-physics-ap-courses/pages/15-7-statistical-interpretation-of-entropy-and-the-second-law-of-thermodynamics-the-underlying-explanation) — statistische Grundlagen; die `q = 1/4`-Schrittregel ist eine eigene, explizite Modellwahl.
- [OpenStax §13.1: Newtonsche Gravitation](https://openstax.org/books/university-physics-volume-1/pages/13-1-newtons-law-of-universal-gravitation).
- [NASA/JPL: astronomische Einheit](https://ssd.jpl.nasa.gov/glossary/au.html), [NASA: Sternreste/Pulsare](https://science.nasa.gov/exoplanets/stars/), [NASA: BH-Geometrie](https://science.nasa.gov/universe/black-holes/anatomy/).
- [NIST: Konstanten](https://physics.nist.gov/cuu/Constants/), [Universität Zürich: Hawking-Strahlung](https://www.physik.uzh.ch/groups/jetzer/notes/PHY529_ART_III.pdf), [JILA: Hawking-Strahlung](https://jila.colorado.edu/~ajsh/courses/bh/hawk.html).
- Historische Qualitätsberichte: [v0.2](docs/Qualitaetsupdate_v0.2.md), [Review-Abschluss v0.2](docs/Reviewabschluss_v0.2.md), [v0.3](docs/Qualitaetsupdate_v0.3.md), [v0.4](docs/Qualitaetsupdate_v0.4.md), [v0.5](docs/Qualitaetsupdate_v0.5.md), [Codex-Review v0.5](docs/CodexReview_v0.5.md). Ihre damaligen Testzahlen/Entwicklungsstände sind keine aktuellen Versionsangaben.
