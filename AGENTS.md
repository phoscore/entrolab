# ENTROLAB — Entwicklungsregeln

## Autorisierung und Umfang

- Nachbesserungsauftrag vom 10.11.2026: ausschließlich gezielte Energiehilfe-, Sicherheits-, Performance- und Regressionstestkorrekturen in PR #7 auf `feature/v0.8-learning-foundation`. Die bereits bestehende Cloudflare-Vorschau darf nach Sicherheitsprüfung öffentlich lesbar bleiben. Das erlaubt keine neue Veröffentlichung. Cloudflare baut auch Featurebranches automatisch: **jeder Commit dieses Auftrags beginnt mit `[CF-Pages-Skip]`**, damit GitHub-CI weiterläuft, aber kein neues Pages-Deployment ausgelöst wird. Skip und unveränderte bestehende Preview am Ende überprüfen. `main`, Produktionsdomain, Originalarchiv, Master und Physikmodelle bleiben geschützt.

- GitHub-Repository `phoscore/entrolab` ist nach Abschluss der Erstsicherung die zentrale Versionsverwaltung.
- Aktuell autorisiert (09.11.2026): v0.8, ausschließlich Schritte 01–04 gemäß Nutzerauftrag, docs/v0.8/README.md und docs/v0.8/Umsetzungsvertrag_v0.8.md. Isolierter Branch feature/v0.8-learning-foundation ab freigegebenem Planungscommit 33947cfeccd738512c83d21bab47a696ee57e923. Baseline: 159 reguläre Prüfungen (10 Selbstchecks + 149 Node-Fälle), 38 Chromium-Fälle, zwölf vollständige historische Benchmarks und sechs Originalprüfungen. Vor Änderungen alle vier Pläne und Audit vollständig lesen; 05–08 nur als spätere Schnittstellenvorgaben berücksichtigen. Kein Beginn von v0.8.5, kein Merge/Deployment/öffentliche Brandingaktivierung. Assetvarianten zuerst zeigen; breite Monsterintegration ausschließlich nach ausdrücklicher Sichtfreigabe. Diese wurde am 09.11.2026 mit „approved!“ für Hero/Peek/Icon erteilt; Phase E ist damit auf dem isolierten Featurebranch autorisiert. Kein Merge/Deployment/öffentliches Branding.
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
- Leitbild: ungefähr 90 % wissenschaftlich fundiert, verbleibender kreativer Spielraum für klar markierte Sci-Fi-Ideen. Keine pauschale 90-%-Genauigkeitsbehauptung.
- Ungeklärte oder bekannte Grenzen offen benennen; vorhandene Rechentests sind keine unabhängige Zertifizierung.

## Prüfungen

- `node scripts/test.mjs`: Syntaxprüfungen, zehn bestehende Selbstchecks und vollständige reguläre Node-Suite. Neue Testdateien im tatsächlichen Einstieg registrieren.
- `node scripts/verify-original.mjs`: sechs Dateien des dokumentierten Originalcommits gegen Original-Prüfsummen prüfen; das Skript beweist nicht das Vorhandensein des Tags.
- `node scripts/check-benchmarks.mjs`: zwölf vollständige historische Ergebnisse exakt vergleichen; Physikmodule, Referenzen und numerische Toleranzen nicht verändern.
- `npm run test:browser`: bestehende vollständige Chromium-Suite plus registrierte neue Browserregressionen.
- Nur bei der Erstsicherung zusätzlich `node scripts/verify-original.mjs --working-tree` verwenden; spätere Arbeitsdateien dürfen sich auf Entwicklungsbranches ändern.
- Je nach Änderung passende weitere Regressionstests, Einheiten-/Konvergenzprüfungen oder Browserprüfung ergänzen. Fehlgeschlagene Tests nicht durch Lockerung der Grenzen kaschieren.



## v0.8 Zustands- und Inhaltsvertrag

- Vier Ebenen trennen: angewandtes Physikmodell, Eingabeentwürfe, Präsentation und abbrechbare Hintergrundberechnung. Hilfe/Quiz/Assets schreiben nicht in Physik oder RNG. Laufende Modellzeit und bisherige Sichtbarkeitspausen bleiben bestehen; reguläre Tabwechsel dürfen wie bisher Vorhersagen abbrechen.
- Sechs fachliche Kontexte in fünf Hauptbereichen: gravity, blackhole, objects, temperature, markers, thermal. Extreme Objects und Temperature dürfen je eine geschlossene Frage im vorhandenen eigenen Abschnitt zeigen; keine automatische Kontextumschaltung beim Scrollen.
- N=4-Mikrozustandsdemo ist eigene, klar bezeichnete Präsentation ohne Zugriff auf Live-Marker, deren RNG oder N.
- Eine gemeinsame Begriffs-/Quellenstruktur mit bestehendem DE/EN-System; keine neue unabhängige Wissensdatenbank, kein Framework und kein neuer Solver.
- Monsterzustände: aus verbirgt und bricht Effekte ab; ruhig/Reduced Motion statisch; dezente Bewegung nur sichtbar und nach Sichtfreigabe. Höchstens eine sichtbare Instanz. Masterhash unverändert.
- Physik und Integratoren sowie etablierte numerische Toleranzen nur nach zusätzlicher ausdrücklicher Freigabe ändern. Tastatur-Platzierung gegebenenfalls als separaten begrenzten Accessibility-Commit behandeln.
- Für den ausdrücklich verlangten unabhängigen Abschlussreview darf ein separater Review-Agent ausschließlich lesend eingesetzt werden. Ein solcher Review ist keine formale externe Zertifizierung.
