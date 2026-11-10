# ENTROLAB 🌌

Interaktiver Physik-Spielplatz von cosmic insignificance: Gravitation, idealisierte Schwarze Löcher, extreme Himmelskörper und zwei getrennte Entropie-Lehrmodelle für Wahrscheinlichkeit und Wärmeausgleich. Browser-Titel: **entrolab - emptiness pro max**.

## Entwicklungsstand und Ausprobieren

**v0.8 auf `feature/v0.8-learning-foundation` ist ein isolierter Prüfstand.** Grundlage ist die freigegebene v0.7 auf `main` (`8b856086877ea21579cf7d74190ad08155d70c7f`) mit dem genehmigten Planungsstand. Die Assetvarianten wurden am 09.11.2026 ausdrücklich freigegeben; Phase E ist integriert. Schritte 01–04 liegen vollständig zur unabhängigen Prüfung vor. Kein Merge, Deployment oder aktives öffentliches Rebranding. v0.8.5 bleibt Planung. [Umsetzungsvertrag](docs/v0.8/Umsetzungsvertrag_v0.8.md) und [Qualitätsbericht](docs/Qualitaetsupdate_v0.8.md).

Die Anwendung ist buildlos: moderner Browser mit ES-Modulen, BigInt und Modul-Workern; Python 3 für einen lokalen HTTP-Server. Keine Paketinstallation und kein Backend zum Benutzen nötig.

```sh
git clone --branch feature/v0.8-learning-foundation https://github.com/phoscore/entrolab.git
cd entrolab
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Unter Windows gegebenenfalls `py` statt `python` verwenden. Dann <http://localhost:8000> öffnen. Wegen der ES-Module und Worker nicht über `file://` starten. Das private Repository benötigt beim Klonen einen berechtigten GitHub-Zugang.

Schriftarten von Google Fonts sind optional; Systemschrift funktioniert ohne sie. Die Berechnungen brauchen kein Internet. Externe Quellenlinks benötigen eine Verbindung. Eine restriktive eigene Content-Security-Policy muss lokale Modul-Worker erlauben; andernfalls melden die Selbstchecks einen Fehler, ohne die Sandbox als Ersatz-Rechenumgebung zu benutzen.

## Labs und Bedienung

- **Gravity Sandbox:** fünf Szenarien, Sterne/Planeten/Schwarze Löcher hinzufügen und bearbeiten, Pause/Tempo/Reset, Flugbahnen, Zoom/Vollbild, Messinstrumente und begrenzte numerische Bahnvorhersage. Körper per Klick oder Inspektor wählen. Beim Platzieren bestimmt Ziehen die Anfangsgeschwindigkeit.
- **Black Hole Lab:** Schwarzschild-Radius und Hawking-Temperatur; Leistung und Lebensdauer als ausdrückliche Modellschätzungen; Größen- und logarithmische Funktionsdiagramme.
- **Extreme Objects:** künstlerische Schwarzes-Loch- und Sternansichten, schematische Geometrie und optionaler schematischer Pulsar, Radienvergleich sowie Kelvin/Celsius-Temperaturlabor. Artwork ist keine GR- oder Emissionssimulation.
- **Entropy Lab · Teilchen & Wahrscheinlichkeit:** standardmäßig zwölf nummerierte, unterscheidbare Marker in zwei gleich großen Kammern. `N` ist auf 1–32 begrenzt. Alle links starten, `k` manuell wählen, einzelne Zufallsschritte, automatisch mischen, pausieren und zurücksetzen. Mikrozustand anzeigen oder bei gleichem `k` neu auslosen. Exakte Multiplizität, Gleichgewichtsverteilung, Datentabelle und dimensionslose Modellentropie vergleichen.
- **Entropy Lab · Wärme & Entropie:** zwei idealisierte, gemeinsam isolierte Körper mit einstellbaren Anfangstemperaturen (250–600 K), konstanten Wärmekapazitäten und Wärmeleitwert. Analytischer Temperaturverlauf, vorzeichenbehaftete Wärmeleistung/übertragene Energie, Gesamtenergie und thermodynamisches ΔS in J/K. Start/Pause, Zehn-Sekunden-Schritte und Reset; neue Parameter/Beispiele bleiben bis „Übernehmen“ ein Entwurf. Das Extreme Temperature Lab kann ausschließlich zulässige Kelvinwerte für A oder B vormerken. Extreme Werte werden erklärt abgewiesen, niemals angepasst.
- **Erste Schritte:** vier freiwillige Schritte mit dezent hervorgehobenen echten Bedienelementen. Die Anleitung führt keine Modelländerung selbst aus, bewahrt beim Sprachwechsel den Schritt und lässt sich jederzeit schließen/erneut öffnen.
- **v0.8-Lernhilfen:** eine geschlossene Hauptfrage und eine freiwillige Prognose pro fachlichem Kontext; „Steuerelement finden“ fokussiert den echten Regler, wendet nichts an. Separate N=4-Demo mit A–D, optionaler Makrozustandsvergleich und Energie-/Entropiebalken lesen bestehende Ergebnisse, ohne die beiden Modelle zu vermischen. Vier Alltagsvertiefungen, vorsichtige Grenzfragen und 28 gemeinsame Fachbegriffe in DE/EN.
- **Kontexthilfe:** „Was bedeutet das?“ öffnet das bestehende Glossar und fokussiert den passenden Begriff; „Zurück zum Labor“ oder Escape führt zum Ausgangslink zurück. Advanced-Infos sind freiwillig aufklappbar. Ein gemeinsames Wissensfundament verbindet kurze Begriffe mit sechs Modellkapiteln, Formeln, Quellen und Rücksprung. Direkte Fachlinks und verschachtelte Glossar-/Quellenwege sind tastaturbedienbar.
- **Modell & Quellen:** zehn isolierte modellinterne Selbstchecks. Jeder Lauf zeigt einen Ausführungszähler, Ergebnisstatus und eine Screenreader-Meldung. Das ist weder die gesamte CI-Suite noch eine vollständige Physikverifikation.

DE/EN im Kopfbereich; auch dynamische Werte, Diagrammbeschriftungen und Fehler sind lokalisiert. Eingaben verwenden in beiden Sprachen einen **Dezimalpunkt**, etwa `0.1` oder `1e9`. Noch nicht angewendete Entwürfe bleiben beim Sprachwechsel erhalten. Der Browser-Titel bleibt in beiden Sprachen identisch. Fokusmodus in Sandbox/Extreme Objects, Escape zum Verlassen. Reduced Motion startet bestehende Simulationen pausiert und unterdrückt Markerübergänge; automatisches Entropy-Mischen und Wärme-Abspielen beginnen immer erst nach ausdrücklicher Auswahl. Beim Wechsel zu Reduced Motion pausiert das Wärmeexperiment; seine dekorativen Farb-/Flusseffekte werden unterdrückt.

## Wissenschaftliche Grundlagen und Grenzen

Die Sandbox berechnet paarweise gewöhnliche dreidimensionale Newton-Gravitation in einer Ebene, intern in AU, Sonnenmassen und Tagen. Velocity Verlet mit adaptiven Schritten und Plummer-Glättung `ε = 10⁻⁷ AU` (≈ 15 km) bleibt unverändert. Adaptive Schritte liefern keine garantierte Fehlerschranke. Kollisionen werden über Modellradien als vollkommen unelastische Verschmelzungen behandelt; Masse/linearer Impuls bleiben erhalten, aufgelöster Bahndrehimpuls/Bewegungsenergie nicht. Große Schritte können Kontakte weiterhin übersehen. Keine GR, Gezeitenzerreißung, Materialphysik oder echte Ephemeriden.

Bahnvorhersage: separate Kopie, höchstens zwölf Körper, 1.500 Schritte und 301 Punkte; Horizonte 10/60/180 Tage. Keine reale Zukunftsprognose und keine laufende Neuberechnung. Näher am Horizont oder bei relativistischen Geschwindigkeiten ist die Newton-Sandbox physikalisch unzuverlässig.

Der BH-Rechner setzt ungeladene, nicht rotierende Löcher voraus. Leistung/Lebensdauer verwenden die idealisierte Photonen-Schwarzkörper-Näherung im leeren Universum, ohne Greybody-Faktoren, zusätzliche Teilchenarten oder Akkretion. Keine Vorhersage der letzten Quantenphase. Sternmassen/-radien sind gewählte Beispiele, keine gelöste Zustandsgleichung. Temperaturbilder sind abstrakte Illustrationen; Kelvin/Celsius wird mit dem exakt definierten Offset 273,15 umgerechnet.

**Entropy Lab:** `Ω(k) = C(N,k)`, insgesamt `2^N` individuelle Zuordnungen; im Gleichgewicht `P_eq(k) = Ω(k)/2^N`. Pro diskretem Schritt wechselt jeder Marker unabhängig und symmetrisch mit `q = 1/4` die Kammer. Die stationäre Verteilung ist binomial; sie ist **nicht** die anfängliche oder bedingte nächste Schrittverteilung. `S/k_B = ln Ω` bezeichnet ausschließlich eine dimensionslose Boltzmann-Modellentropie der groben `k`-Beschreibung. Einzelne Schritte können sie verringern. Keine realen Gasbahnen, Energien, Wärmeflüsse, Temperatur, Diffusionskoeffizienten oder kalibrierte physikalische Zeit. Nicht mit gravitativer oder Bekenstein-Hawking-Entropie gleichsetzen. Ausführlich: [Qualitätsbericht v0.6](docs/Qualitaetsupdate_v0.6.md).

**Wärme & Entropie:** `dQ/dt = G_th(T_A−T_B)`, `C_A dT_A/dt = −dQ/dt`, `C_B dT_B/dt = +dQ/dt`. Die analytische Relaxation hat `T_eq = (C_A T_A0 + C_B T_B0)/(C_A+C_B)` und `τ = 1/[G_th(1/C_A+1/C_B)]`. Gesamtenergie `U=C_A T_A+C_B T_B` ist bis auf Rundung konstant; der Nullpunkt ist Modellkonvention. `ΔS_i=C_i ln(T_i/T_i0)`, Gesamtänderung in J/K, getrennt von `S/k_B` des Markermodells. Numerisch stabile `expm1`-/`log1p`-Auswertung ohne Entropie-Clamping. Gewählte Bereiche: T 250–600 K, C 1–10⁶ J/K, G_th 0,001–1000 W/K, Modellzeit 0–10¹² s. Keine Phasenwechsel, Strahlung, Arbeit, Außenverluste, inneren Temperaturgradienten oder Materialkalibrierung. Die Grenzen sind didaktisch, kein allgemeiner Materialgültigkeitsnachweis. Detaillierte Ableitung, Quellen, Referenzwerte und Messungen: [Qualitätsbericht v0.7](docs/Qualitaetsupdate_v0.7.md).

## Tests reproduzieren

Node.js 22 oder neuer:

```sh
node scripts/test.mjs
node scripts/verify-original.mjs
node scripts/benchmark.mjs
node scripts/check-benchmarks.mjs
node scripts/measure-thermal.mjs
```

Der reguläre Einstieg enthält **182 Prüfungen**: zehn Original-Selbstchecks und 172 Node-Fälle. Alle 159 Prüfungen der Audit-Basis bleiben erhalten; 23 neue Fälle prüfen Assets, Quellen, Erklärungen, unabhängige Zählung, Bilanzprojektionen und den rein dekorativen Monster-Lifecycle. Die zwölf vollständigen numerischen Benchmarks werden unter identischer Laufzeit exakt gegen den genehmigten historischen Stand verglichen; sechs Originalprüfungen verifizieren den archivierten Originalcommit. Quellen, Referenzen und Toleranzen werden nicht gelockert. Ein vollständiger Git-Klon ist für diese beiden historischen Prüfeinstiege erforderlich. `--working-tree` nur beim historischen Erstsicherungsstand verwenden.


Für die zusätzlichen realen Chromium-Tests (nur Entwicklungsabhängigkeit, Playwright exakt per Lockfile):

```sh
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install --with-deps chromium
npm run test:browser
```

Die Browser-Suite enthält **63 Fälle**: alle 38 Fälle der Audit-Basis und 25 neue Chromium-Fälle zu Wissens-/Fokusnavigation, freiwilligen Fragen, Zustandsbewahrung, N=4, Großzahlen, Bilanz, Monster-Modi, Lifecycle und 320/390/fractional-Ansichten. Screenshots und JSON-Messwerte unter `browser-results/` werden in CI als Artefakt aufgehoben. Zusätzlich vergleicht `node scripts/measure-v08-browser.mjs` dieselben Szenen auf derselben Maschine mit der Planungsbasis: acht 30-Sekunden-Stichproben in wechselnder Reihenfolge. Keine Garantie für beliebige Hardware, Safari oder reale Assistenztechnik; tatsächliche Resultate und Grenzen im [Qualitätsbericht v0.8](docs/Qualitaetsupdate_v0.8.md).

Die lokale Asset-Sichtvorschau liegt unter <http://localhost:8000/asset-review.html>. Sie lädt das unveränderte Original und die drei abgeleiteten Kandidaten; die freigegebenen WebP-Ableitungen sind als eine dekorative Figur integriert. „Monster“ im Kopfbereich bietet Dezente Bewegung, Ruhig oder Aus. Reduced Motion bleibt statisch; Fokusmodus, Eingaben und offene Einstellungen unterdrücken die Figur. Sie ist keine physikalische Messanzeige. 

Die CI erstellt außerdem `entrolab-v08-source.zip` im privaten Artefakt `chromium-review-measurements`. Herunterladen, entpacken und denselben Python-Befehl im Ordner `entrolab-v08` ausführen. Das ZIP enthält alle versionierten Projektdateien; historische Git-Prüfungen benötigen weiterhin den vollständigen Klon. Kein Deployment.

## Projektstruktur

| Datei | Aufgabe |
| --- | --- |
| `dist/knowledge.mjs`, `knowledge-text.mjs` | Gemeinsame Inhalte, Quellen-IDs und Schlüssel des bestehenden DE/EN-Systems |
| `dist/knowledge-ui.mjs`, `guide.mjs` | Begriffe, Modellkapitel, Fachlinks und Fokus-Rückwege |
| `dist/explanations-ui.mjs` | Sechs freiwillige Laborfragen und Prognosen ohne Modellschreibzugriff |
| `dist/learning-math.mjs`, `entropy-learning.mjs` | Unabhängige N=4-Demo, Makrovergleich und reine Bilanzprojektion |
| `dist/creature-ui.mjs`, `creature-policy.mjs`, `creature.css` | Eine dekorative Figur, eigener begrenzter Zustand, DE/EN, Ruhig/Aus/Reduced Motion; kein Physik- oder RNG-Zugriff |
| `dist/physics.mjs` | Unveränderter Physikkern und Integrator |
| `dist/experiments.mjs`, `instruments.mjs`, `prediction.mjs` | Szenarien, Diagnostik, begrenzte Vorhersage |
| `dist/app.mjs` | Sandbox, BH-Rechner und Selbstcheck-Anzeige |
| `dist/checks.mjs`, `checks-worker.mjs`, `self-checks.mjs` | Originalrechnungen, isolierter Worker, Ablauf-/Fehlerkontrolle |
| `dist/extreme-*.mjs` | Daten, berechnete Werte und illustrative Renderer |
| `dist/entropy.mjs` | Reine Zählmathematik und stochastische Zustandsfunktionen |
| `dist/entropy-ui.mjs`, `entropy.css` | Kammern, Diagramm, Bedienung und Timer-Lifecycle |
| `dist/thermal-physics.mjs`, `thermal-ui.mjs`, `thermal.css` | Getrenntes analytisches Wärme-/Entropiemodell und Oberfläche |
| `dist/discovery.mjs` | Freiwillige Anleitung mit tatsächlichen Bedienhandlungen |
| `scripts/measure-thermal.mjs` | Reproduzierbare Bilanz-/RK4-Messwerte ohne Referenzänderung |
| `dist/i18n.mjs`, `translations.mjs`, `ux.mjs`, `guide.mjs` | Sprache, Fokus, Hilfen und Kontextrückweg |
| `dist/index.html`, `favicon.svg` | Oberfläche, fester Browser-Titel und originales künstlerisches Logo |
| `scripts/test.mjs`, `.github/workflows/tests.yml` | Reguläre Suite und Browser-CI ohne Deployment |
| `docs/` | Pläne, Qualitätsberichte, Quellen und unveränderte historische Referenzen |

## Original und Freigabe schützen

Original v0.1: Commit `be2502d51a449de3e515faaf72ab5954b1a739d4`, zusätzlich unter `archive/v0.1`. Die sechs Originaldateien einschließlich historischer Hosting-Konfiguration sind über `docs/v0.1-original.sha256` und `docs/v0.1-original-commit.txt` gebunden. Diese Referenzen niemals auf neuere Versionen umstellen. `verify-original.mjs` liest ausdrücklich den Original-Commit; der v0.7-Auftrag verschiebt weder Archive noch Tags.

GitHub ist die zentrale Versionsverwaltung. Größere Änderungen auf Entwicklungsbranches, nachvollziehbare Commits und unabhängiger Review vor Freigabe. `main` nur nach ausdrücklicher Eigentümerfreigabe ändern/mergen. **Cloudflare Pages veröffentlicht `main` automatisch auf der bestehenden Produktionsseite.** Deshalb sind Merge und Produktionsveröffentlichung gesonderte Freigabeschritte; diese Entwicklung führt beides nicht aus. Kein neuer Hosting-Standort, kein Release, kein Force-Push und keine eigenmächtige Sichtbarkeitsänderung. Die historische `.openai/hosting.json` wird nicht als Deployment-Auftrag benutzt.

Korrekte Modelle und dokumentierte Grenzen haben Vorrang. Künstlerische Effekte und Humor sind ausdrücklich von berechneter Physik getrennt. „90 % wissenschaftlich fundiert“ ist eine Gestaltungspräferenz, keine gemessene Genauigkeitsgarantie.

## Quellen und bisherige Berichte

- [OpenStax Vol. 2 §1.6: Wärmeübertragung](https://openstax.org/books/university-physics-volume-2/pages/1-6-mechanisms-of-heat-transfer), [§1.4: Kalorimetrie](https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry), [§4.6: Entropie](https://openstax.org/books/university-physics-volume-2/pages/4-6-entropy) — Lehrbuchprinzipien; konstante C/G_th und Modellgrenzen sind eigene explizite Annahmen.
- [OpenStax §15.7: Mikrozustände und Boltzmann-Entropie](https://openstax.org/books/college-physics-ap-courses/pages/15-7-statistical-interpretation-of-entropy-and-the-second-law-of-thermodynamics-the-underlying-explanation) — statistische Grundlagen; die `q = 1/4`-Schrittregel ist eine eigene, explizite Modellwahl.
- [OpenStax §13.1: Newtonsche Gravitation](https://openstax.org/books/university-physics-volume-1/pages/13-1-newtons-law-of-universal-gravitation).
- [NASA/JPL: astronomische Einheit](https://ssd.jpl.nasa.gov/glossary/au.html), [NASA: Sternreste/Pulsare](https://science.nasa.gov/exoplanets/stars/), [NASA: BH-Geometrie](https://science.nasa.gov/universe/black-holes/anatomy/).
- [NIST: Konstanten](https://physics.nist.gov/cuu/Constants/), [Universität Zürich: Hawking-Strahlung](https://www.physik.uzh.ch/groups/jetzer/notes/PHY529_ART_III.pdf), [JILA: Hawking-Strahlung](https://jila.colorado.edu/~ajsh/courses/bh/hawk.html).
- Historische Qualitätsberichte: [v0.2](docs/Qualitaetsupdate_v0.2.md), [Review-Abschluss v0.2](docs/Reviewabschluss_v0.2.md), [v0.3](docs/Qualitaetsupdate_v0.3.md), [v0.4](docs/Qualitaetsupdate_v0.4.md), [v0.5](docs/Qualitaetsupdate_v0.5.md), [Codex-Review v0.5](docs/CodexReview_v0.5.md), [v0.6 samt Reviewkorrekturen](docs/Qualitaetsupdate_v0.6.md). Ihre damaligen Testzahlen/Entwicklungsstände sind keine aktuellen Versionsangaben.
