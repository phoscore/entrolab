# ENTROLAB 🌌

Ein interaktiver Physik-Spielplatz von cosmic insignificance: Newtonsche N-Körper-Simulation und ein Rechner für idealisierte Schwarze Löcher.

## Stand und Original

Diese Erstsicherung enthält die sechs Originaldateien der Anwendung **v0.1** bytegenau, einschließlich `.openai/hosting.json`. Die ursprüngliche Site-Quellrevision ist `095f7f4ae50453a373012ed870fa7175e5b4c5ee`. Der bei der Übertragung anzulegende Git-Tag `v0.1` soll ausschließlich den Originalstand sichern; README, AGENTS.md und CI werden in einem nachfolgenden Infrastruktur-Commit ergänzt. Es gibt hier noch keine Version 0.2.

Die Originaldateien sind in `docs/v0.1-original.sha256` mit SHA-256 dokumentiert. Ein Git-Tag ist technisch verschiebbar und muss zusätzlich organisatorisch beziehungsweise durch passende GitHub-Regeln geschützt werden. Niemals `v0.1` verschieben oder löschen.

## Lokal starten

Voraussetzungen: moderner Browser; Python 3 für den lokalen HTTP-Server. Kein npm, Build-Schritt oder Backend erforderlich.

```sh
git clone https://github.com/phoscore/entrolab.git
cd entrolab
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Unter Windows gegebenenfalls `py` statt `python` verwenden. Dann <http://localhost:8000> öffnen. HTML nicht direkt über `file://` starten, da Browser ES-Module dabei blockieren können.

Schriftarten werden optional von Google Fonts geladen; ohne Verbindung greifen Systemschriftarten. Die Physikberechnungen benötigen keinen Netzwerkzugriff. Quellenlinks benötigen Internet.

## Funktionen

- Gravity Sandbox: Sterne, Planeten und Schwarze Löcher hinzufügen/entfernen; Masse, Position und Geschwindigkeit bearbeiten.
- Bewegung, Flugbahnen, Kollisionen, Pause, Zeitraffer, Zurücksetzen, Zoom und optionales Vollbild.
- Szenarien: Sonnensystem mit acht Planeten, Doppelstern und Erde mit Schwarzem Loch.
- Black Hole Lab: Masse zwischen 1 und 10⁴¹ kg, Schwarzschild-Radius, Hawking-Temperatur, geschätzte Strahlungsleistung und Verdampfungszeit; logarithmische Diagramme und Größenvergleiche.
- Modellbeschreibung, Quellen und zehn vorhandene Rechentests in der App.

Körper anklicken oder über den Inspektor auswählen. Beim Platzieren legt Klicken den Ort und Ziehen die Anfangsgeschwindigkeit fest. Der Inspektor zeigt Masse in Sonnenmassen, Position in AU und Geschwindigkeit in km/s.

## Projektstruktur

| Datei | Zweck |
| --- | --- |
| `dist/physics.mjs` | Konstanten, Gravitation, Integrator, Kollisionen, Szenarien und Black-Hole-Gleichungen |
| `dist/app.mjs` | Simulationsschleife, Interaktion, Canvas und Rechneransicht |
| `dist/checks.mjs` | Zehn unveränderte Originaltests |
| `dist/index.html` | Oberfläche, Modellbeschreibung und Quellen |
| `dist/style.css` | Darstellung und responsive Layouts |
| `.openai/hosting.json` | Unveränderte Konfiguration der bestehenden Site |
| `scripts/test.mjs` | CI-Einstieg mit Fehler-Exitcode und Syntaxprüfungen |
| `scripts/verify-original.mjs` | Prüft Originaldateien oder deren Inhalt am Tag `v0.1` |
| `.github/workflows/tests.yml` | Automatisierte Tests ohne Deployment |
| `AGENTS.md` | Verbindliche Entwicklungsregeln |

## Technische Grundlagen und Grenzen

Browser-ES-Module, HTML, CSS und Canvas 2D; keine Framework-Abhängigkeiten. Intern verwendet die Simulation AU, Sonnenmassen und Tage. Alle Körper beeinflussen einander paarweise, mit O(N²)-Aufwand.

Die Beschleunigung nutzt Newtonsche Gravitation mit Plummer-Glättung ε = 10⁻⁷ AU (ungefähr 15 km). Velocity Verlet mit an Begegnungszeiten angepassten Zeitschritten integriert die Bewegung. Adaptive Schritte garantieren weder dauerhaft symplektisches Verhalten noch eine feste Fehlerschranke. Das Schrittlimit pro Bild kann den tatsächlichen Zeitraffer reduzieren.

Kollisionen werden nach Integrationsschritten anhand modellierter Kugelradien erkannt und als vollkommen unelastische Verschmelzung behandelt. Masse und linearer Impuls bleiben erhalten. Energieerhaltung, Spin, Gezeitenzerreißung, Gasdynamik und Materialstruktur werden dadurch nicht vollständig modelliert. Für Planeten gilt Erddichte, für Sterne Sonnendichte; dies ist kein realistisches Sternstrukturmodell.

Startbahnen sind koplanar und idealisiert kreisförmig, keine astronomischen Ephemeriden. Überhöhte Körpergrößen und Leuchthöfe sind Darstellungshilfen; Flugbahnen beruhen auf berechneten Positionen. Kleine Energiedrift allein beweist keine korrekte Simulation.

Im Labor gelten für ein ungeladenes, nicht rotierendes, isoliertes Schwarzes Loch:

- `r_s = 2 G M / c²`
- `T = ℏ c³ / (8 π G M k_B)`
- `P ≈ ℏ c⁶ / (15360 π G² M²)`
- `τ ≈ 5120 π G² M³ / (ℏ c⁴)`

Leistung und Lebensdauer verwenden ein perfektes Schwarzkörpermodell mit Horizontfläche und nur Photonen, ohne Greybody-Faktoren, weitere Teilchensorten oder Akkretion. Die Lebensdauer gilt für ein leeres Universum, nicht für ein Loch in der heutigen kosmischen Hintergrundstrahlung. Die letzte Quantenphase ist nicht beschrieben. Hawking-Strahlung astrophysikalischer Schwarzer Löcher ist nicht direkt beobachtet.

In der Gravity Sandbox sind Schwarze Löcher dagegen Newtonsche Massen mit vereinfachtem Absorptionsradius. Keine allgemeine Relativität, Zeitdilatation, Lichtablenkung, Präzession, Gravitationswellen oder Hawking-Massenverluste. Nahe dem Horizont oder bei relativistischen Geschwindigkeiten ist dieses Modell unzuverlässig. Versionssicherung bedeutet keine unabhängige wissenschaftliche Zertifizierung; vorhandene Fehler werden im Originalstand bewusst nicht korrigiert.

## Tests

Mit Node.js 22 oder neuer, ohne Paketinstallation:

```sh
node scripts/test.mjs
node scripts/verify-original.mjs --working-tree
node scripts/verify-original.mjs
```

Der erste Befehl prüft Syntax und führt die zehn vorhandenen Rechentests aus (Referenzwerte, idealisierte Erdbahn, Energiedrift, Verschmelzung und Szenarien). Der zweite prüft die sechs aktuellen Dateien gegen das Original. Der dritte prüft ausschließlich den unveränderlichen Original-Tag; er setzt den vorhandenen Tag `v0.1` voraus und bleibt für spätere Entwicklung verwendbar, wenn Arbeitsdateien sich ändern.

CI führt Syntax-/Rechentests und die Tag-Prüfung für Pull Requests, Branch-Pushes und manuelle Starts aus. Die vorhandenen Tests decken keine vollständige UI-, Stabilitäts- oder unabhängige Physikprüfung ab. Ohne GitHub-Branch-Regeln sind erfolgreiche Tests noch keine technisch erzwungene Merge-Sperre.

## Entwicklung und Veröffentlichung

GitHub ist nach Abschluss der Erstsicherung die zentrale Versionsverwaltung. Abgeschlossene Arbeit wird mit nachvollziehbaren Commits gespeichert. Größere Änderungen erfolgen auf separaten Branches und per Pull Request. Nach der ausdrücklich autorisierten Erstsicherung sind Änderungen an `main` und Merges nur nach Freigabe des Eigentümers erlaubt. Keine Auto-Merges, Force-Pushes oder Releases/Deployments ohne ausdrückliche Zustimmung.

Wissenschaftliche Modelle brauchen Einheiten, Quellen, Näherungen und Referenzprüfungen. Sci-Fi-Experimente müssen separat und sichtbar als fiktiv beziehungsweise spekulativ gekennzeichnet werden. Ungefähr 90 % wissenschaftliche Fundierung ist eine Gestaltungspräferenz, keine messbare Genauigkeitsgarantie.

Dieses Repository besitzt keine automatische Veröffentlichung. Die bestehende Site bleibt eine separate Laufzeitumgebung; eine GitHub-Sicherung ersetzt oder veröffentlicht sie nicht automatisch. Zugriffssichtbarkeit des Repositorys und Web-Deployment sind unterschiedliche Entscheidungen.

## Quellen

- [NIST: Fundamentalkonstanten](https://physics.nist.gov/cuu/Constants/)
- [Universität Zürich: Hawking-Strahlung, Kapitel 6](https://www.physik.uzh.ch/groups/jetzer/notes/PHY529_ART_III.pdf)
- [JILA: Hawking radiation](https://jila.colorado.edu/~ajsh/courses/bh/hawk.html)
- [Einstein Online: Hawking temperature](https://www.einstein-online.info/en/explandict/hawking-temperature/)

## Stand der GitHub-Erstsicherung

Original-Commit: `be2502d51a449de3e515faaf72ab5954b1a739d4`, zusätzlich unter `archive/v0.1` erreichbar. Der GitHub-Connector unterstützt keine Tag-Erstellung. Der Tag `v0.1` ist daher noch ausstehend. CI prüft bis dahin und dauerhaft den expliziten Original-Commit aus `docs/v0.1-original-commit.txt` gegen die sechs Prüfsummen. Diese Datei und die Prüfsummen dürfen nicht auf spätere Versionen umgestellt werden. Die Hinweise zur Tag-Prüfung weiter oben beschreiben das Ziel; der aktuelle Prüfbefehl verwendet den Original-Commit.

Zum einmaligen Anlegen des Tags in einem authentifizierten lokalen Git-Klon:

```sh
git fetch origin
git tag v0.1 be2502d51a449de3e515faaf72ab5954b1a739d4
git push origin refs/tags/v0.1
```

Branch- und Tag-Schutz wurden nicht technisch eingerichtet. AGENTS.md legt die Freigaberegeln fest; sie ersetzen keine GitHub-Regeln.
