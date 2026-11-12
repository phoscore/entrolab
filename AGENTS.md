# ENTROLAB — Entwicklungsregeln

## Autorisierung und Umfang

- Autorisiert am 12.11.2026: v0.9 Physics Reimagined auf `feature/v0.9-physics-reimagined` ab v0.8.5-Merge `ec2c4f1a5957478ab255f286a0ca2a9341cabcbe`. Genehmigte v0.9-Pläne aus PR #9 als Referenz. v0.9.5 bleibt gesondert.
- Alle Branch-Commits beginnen mit `[CF-Pages-Skip]`. Den neuen Ref direkt auf dem ersten Skip-Commit anlegen. GitHub-CI bleibt aktiv.
- GitHub-Repository `phoscore/entrolab` bleibt zentrale Versionsverwaltung. Abschluss als Draft-PR, unabhängig lesender Review; keine eigene Releasefreigabe.
- Nach der Erstsicherung `main` nur mit ausdrücklicher Freigabe des Eigentümers verändern oder zusammenführen. Ein Prüfauftrag, erfolgreiche CI oder ein fertiger Branch sind keine Merge-Freigabe.
- Keine Veröffentlichung, Releases, Deployment, GitHub Pages oder automatische Produktionsaktualisierung ohne ausdrückliche Zustimmung. Repository-Sichtbarkeit nicht eigenmächtig ändern.

## Original dauerhaft erhalten

- Die sechs Originaldateien sind im dokumentierten Originalcommit be2502d51a449de3e515faaf72ab5954b1a739d4 und archive/v0.1 bytegenau gesichert. Der laut Erstsicherungsplan vorgesehene Tag v0.1 war im Audit nicht auffindbar. Nur prüfen und dokumentieren; ohne gesonderte Freigabe weder erstellen noch verändern.
- Tag `v0.1` niemals verschieben, überschreiben oder löschen. Zugehörige Historie erhalten; kein Force-Push oder Rewrite.
- `docs/v0.1-original.sha256` dokumentiert die Originaldateien. Baseline nicht an spätere Fehlerkorrekturen anpassen.
- Spätere Verbesserungen sind neue Commits auf neuen Branches. Originalfehler nicht rückwirkend reparieren.

## Arbeitsweise

- Größere Änderungen auf benannten Branches: `feature/<thema>`, `fix/<thema>`, `science/<thema>` oder `scifi/<thema>`.
- Abgeschlossene Änderungen als kleine, nachvollziehbare Commits speichern. Keine Zugangsdaten, persönlichen Daten oder lokalen Git-Konfigurationen committen.
- Vor Übernahme in `main`: automatisierte Tests erfolgreich, Änderungen und Modellfolgen dokumentiert, ausdrückliche Eigentümerfreigabe. Kein Auto-Merge.
- Vorhandene fremde Dateien und Commits erhalten. Historische Berichte nicht rückwirkend umschreiben. Planungswidersprüche nur im autorisierten Umfang bereinigen und die Abweichungen dokumentieren.
- Testergebnisse wahrheitsgemäß berichten; lokale Prüfungen und GitHub-Actions-Läufe unterscheiden. CI-Konfiguration ist keine Branch Protection.

## Wissenschaftliche Regeln

- Korrekte etablierte Physik priorisieren. Einheiten, Konstanten, Quellen, Annahmen, Gültigkeitsbereiche und Näherungen dokumentieren.
- Zwischen etabliertem Modell, numerischer Näherung und reiner Visualisierung deutlich unterscheiden.
- Wissenschaftliche Änderungen an unabhängigen Referenzwerten und sinnvollen Erhaltungs-/Konvergenzprüfungen prüfen. Kleine Energiedrift allein ist kein Genauigkeitsbeweis.
- Sci-Fi ist erlaubt, muss sichtbar als fiktiv/spekulativ gekennzeichnet und vom wissenschaftlichen Modus getrennt sein. Keine erfundenen Gesetzmäßigkeiten als reale Ergebnisse ausgeben.
- Leitbild: „No plot armor. Just physics.“ Wissenschaft, Illustration und Fiktion sind erkennbar getrennt. Die frühere 90/10-Zahl war eine Stilbeschreibung.
- Ungeklärte oder bekannte Grenzen offen benennen; vorhandene Rechentests sind keine unabhängige Zertifizierung.

## Prüfungen

- `node scripts/test.mjs`: Syntaxprüfungen, zehn bestehende Selbstchecks und vollständige reguläre Node-Suite. Neue Testdateien im tatsächlichen Einstieg registrieren.
- `node scripts/verify-original.mjs`: sechs Dateien des dokumentierten Originalcommits gegen Original-Prüfsummen prüfen; das Skript beweist nicht das Vorhandensein des Tags.
- `node scripts/check-benchmarks.mjs`: zwölf vollständige historische Ergebnisse exakt vergleichen; Physikmodule, Referenzen und numerische Toleranzen nicht verändern.
- `npm run test:browser`: bestehende vollständige Chromium-Suite plus registrierte neue Browserregressionen.
- Nur bei der Erstsicherung zusätzlich `node scripts/verify-original.mjs --working-tree` verwenden; spätere Arbeitsdateien dürfen sich auf Entwicklungsbranches ändern.
- Je nach Änderung passende weitere Regressionstests, Einheiten-/Konvergenzprüfungen oder Browserprüfung ergänzen. Fehlgeschlagene Tests nicht durch Lockerung der Grenzen kaschieren.



## Zustands- und Inhaltsvertrag

- Vier Ebenen trennen: angewandtes Physikmodell, Eingabeentwürfe, Präsentation und abbrechbare Hintergrundberechnung. Hilfe/Quiz/Assets schreiben nicht in Physik oder RNG. Laufende Modellzeit und bisherige Sichtbarkeitspausen bleiben bestehen; reguläre Tabwechsel dürfen wie bisher Vorhersagen abbrechen.
- Sechs bestehende Laborkontexte plus Materie & Felder. Die Wissenschaftsseite behält ihre Quellenfunktion. Extreme Objects und Temperature dürfen je eine geschlossene Frage im vorhandenen eigenen Abschnitt zeigen; keine automatische Kontextumschaltung beim Scrollen.
- N=4-Mikrozustandsdemo ist eigene, klar bezeichnete Präsentation ohne Zugriff auf Live-Marker, deren RNG oder N.
- Eine gemeinsame Begriffs-/Quellenstruktur mit bestehendem DE/EN-System; eine gemeinsame Inhaltsquelle und native Module. Neue Berechnungen nur im genehmigten Laborumfang.
- Monsterzustände: aus verbirgt und bricht Effekte ab; ruhig/Reduced Motion statisch; dezente Bewegung nur sichtbar und nach Sichtfreigabe. Höchstens eine sichtbare Instanz. Masterhash unverändert.
- Physik und Integratoren sowie etablierte numerische Toleranzen nur nach zusätzlicher ausdrücklicher Freigabe ändern. Tastatur-Platzierung gegebenenfalls als separaten begrenzten Accessibility-Commit behandeln.
- Für den ausdrücklich verlangten unabhängigen Abschlussreview darf ein separater Review-Agent ausschließlich lesend eingesetzt werden. Ein solcher Review ist keine formale externe Zertifizierung.
