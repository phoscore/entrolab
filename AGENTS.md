# ENTROLAB — Entwicklungsregeln

## Autorisierung und Umfang

- GitHub-Repository `phoscore/entrolab` ist nach Abschluss der Erstsicherung die zentrale Versionsverwaltung.
- Aktuell autorisiert: UX & Visual Upgrade v0.5 ausschließlich auf `develop/v0.5` gemäß `docs/Plan_v0.5.md` und Nutzerauftrag. Plan und geforderte Qualitätsberichte zuerst vollständig lesen. Alle 101 vor dem Codex-Review vorhandenen Prüfungen und zwölf numerischen Benchmarks bewahren. Reviewkorrekturen zusätzlich mit gezielten Node- und Chromium-Regressionen prüfen. Physikmodelle und Integratoren unverändert lassen. Keine Änderungen an main, kein Merge oder Deployment; abschließend Pull Request zur unabhängigen Prüfung. Original v0.1 bleibt erhalten.
- Nach der Erstsicherung `main` nur mit ausdrücklicher Freigabe des Eigentümers verändern oder zusammenführen. Ein Prüfauftrag, erfolgreiche CI oder ein fertiger Branch sind keine Merge-Freigabe.
- Keine Veröffentlichung, Releases, Deployment, GitHub Pages oder automatische Produktionsaktualisierung ohne ausdrückliche Zustimmung. Repository-Sichtbarkeit nicht eigenmächtig ändern.

## Original dauerhaft erhalten

- Die sechs Originaldateien von v0.1 werden zunächst bytegenau importiert. Der Tag `v0.1` zeigt auf diesen Original-Commit, vor Ergänzung der Entwicklungsstruktur.
- Tag `v0.1` niemals verschieben, überschreiben oder löschen. Zugehörige Historie erhalten; kein Force-Push oder Rewrite.
- `docs/v0.1-original.sha256` dokumentiert die Originaldateien. Baseline nicht an spätere Fehlerkorrekturen anpassen.
- Spätere Verbesserungen sind neue Commits auf neuen Branches. Originalfehler nicht rückwirkend reparieren.

## Arbeitsweise

- Größere Änderungen auf benannten Branches: `feature/<thema>`, `fix/<thema>`, `science/<thema>` oder `scifi/<thema>`.
- Abgeschlossene Änderungen als kleine, nachvollziehbare Commits speichern. Keine Zugangsdaten, persönlichen Daten oder lokalen Git-Konfigurationen committen.
- Vor Übernahme in `main`: automatisierte Tests erfolgreich, Änderungen und Modellfolgen dokumentiert, ausdrückliche Eigentümerfreigabe. Kein Auto-Merge.
- Vorhandene fremde Dateien und Commits erhalten. In dieser Erstsicherung README gezielt erweitern; die vorhandene GitHub-Schreibtest-Datei nicht ungefragt löschen.
- Testergebnisse wahrheitsgemäß berichten; lokale Prüfungen und GitHub-Actions-Läufe unterscheiden. CI-Konfiguration ist keine Branch Protection.

## Wissenschaftliche Regeln

- Korrekte etablierte Physik priorisieren. Einheiten, Konstanten, Quellen, Annahmen, Gültigkeitsbereiche und Näherungen dokumentieren.
- Zwischen etabliertem Modell, numerischer Näherung und reiner Visualisierung deutlich unterscheiden.
- Wissenschaftliche Änderungen an unabhängigen Referenzwerten und sinnvollen Erhaltungs-/Konvergenzprüfungen prüfen. Kleine Energiedrift allein ist kein Genauigkeitsbeweis.
- Sci-Fi ist erlaubt, muss sichtbar als fiktiv/spekulativ gekennzeichnet und vom wissenschaftlichen Modus getrennt sein. Keine erfundenen Gesetzmäßigkeiten als reale Ergebnisse ausgeben.
- Leitbild: ungefähr 90 % wissenschaftlich fundiert, verbleibender kreativer Spielraum für klar markierte Sci-Fi-Ideen. Keine pauschale 90-%-Genauigkeitsbehauptung.
- Ungeklärte oder bekannte Grenzen offen benennen; vorhandene Rechentests sind keine unabhängige Zertifizierung.

## Prüfungen

- `node scripts/test.mjs`: Syntaxprüfung und vorhandene v0.1-Rechentests.
- `node scripts/verify-original.mjs`: Inhalt des Tags `v0.1` gegen Original-Prüfsummen prüfen.
- Nur bei der Erstsicherung zusätzlich `node scripts/verify-original.mjs --working-tree` verwenden; spätere Arbeitsdateien dürfen sich auf Entwicklungsbranches ändern.
- Je nach Änderung passende weitere Regressionstests, Einheiten-/Konvergenzprüfungen oder Browserprüfung ergänzen. Fehlgeschlagene Tests nicht durch Lockerung der Grenzen kaschieren.


