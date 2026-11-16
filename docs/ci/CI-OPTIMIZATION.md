# CI-Optimierung · 16. November 2026

Basis: `b186f5213d0627bf481d3cc0ef7fa1b367a12782`. Messwerte stammen aus GitHub Actions, nicht aus einer lokalen Chromium-Simulation.

## Auslöser und Prüfvertrag

`.github/workflows/tests.yml` prüft PRs gegen `main`, Pushes auf `main` und bewusste manuelle Starts. Ein Feature-Commit mit offenem PR startet damit genau einen Integration-Workflow. Neue Commits im selben PR brechen über die PR-Nummer als Concurrency-Key überholte Runs ab. `main` hat einen eigenen Key. Die Jobs **Physics and data integrity** und **Chromium UX regressions** behalten unabhängig stabile Checknamen für Branch Protection. Beide sind erforderlich. Es gibt keine Pfadfilter, mit denen Änderungen die wissenschaftlichen, Browser- oder Datenprüfungen umgehen könnten.

Der Node-Job führt unverändert `scripts/test.mjs`, `scripts/check-benchmarks.mjs` und `scripts/verify-original.mjs` aus. Der Browser-Job führt die unveränderte vollständige `npm run test:browser`-Suite aus. Keine Assertions oder Toleranzen wurden verändert. `npm ci` verwendet den vorhandenen npm-Cache, der durch den Lockfile-Schlüssel von setup-node begrenzt ist. Die Chromium-Binärdateien und Systemabhängigkeiten werden mit Playwright pro Runner neu installiert. Dieser Schritt kostete in den betrachteten Läufen etwa 26–27 Sekunden. Ein zusätzlicher Browsercache könnte durch Entpacken/Download oder fremde PRs schwerer prüfbar sein. Die wesentliche Ersparnis stammt aus einem vermiedenen vollständigen Run und aus dem ausgelagerten Renderingvergleich. Jeder Job hat nur `contents: read`, Checkout bewahrt keine Schreib-Credentials auf. Review-Artefakte bleiben sieben Tage verfügbar.

Der `workflow_dispatch`-Workflow `historical-rendering.yml` erhält die vier gezielt wählbaren Studien v0.8, v0.8.5, v0.9 und v0.8-Korrektur. Er führt die bestehenden Vergleichsskripte und Produktionsprüfungen aus, ohne sie in jedem neuen Explorer-PR zu wiederholen. Der gesonderte alte `audit-v0.8.yml` bleibt für die dokumentierte Branch-/manuelle Prüfung erhalten.

## Beobachtete Minutenverbraucher

| Fall | Node-Job | Browser-Job | Workflow-Wandzeit | Runner-Minuten näherungsweise |
| --- | ---: | ---: | ---: | ---: |
| 2D-A Push `43771275044`, erfolgreich | 0:41 | 11:25 | 11:27 | 12,1 |
| 2D-A PR `43771279718`, erster Versuch | 0:31 | 12:20, Joblimit | 12:20 | 12,9 |
| Erster PR-Head `66e9729`, beide Auslöser | je Node und Browser | Browser jeweils mit älterem Fehler | 6:53 und 7:13 | ungefähr 15,2 zusammen |

Beim erfolgreichen Push-Lauf dauerte `npm ci` etwa 1 Sekunde, Chromium plus Betriebssystempakete 27 Sekunden, die 122 Browser-Tests 6:05 und der historische Renderingvergleich 4:35. Der Node-Job benötigte für 253 Tests etwa 19 Sekunden und für zwölf Benchmarks weitere 15 Sekunden. Ein späterer `main`-Push `43777574063` bestand seine Browser-Regressionen und traf danach beim historischen Vergleich erneut das Joblimit. Gleichzeitige Push-/PR-Läufe verdoppelten die belasteten Runner für denselben Feature-Head. Frühere schnelle Commits verursachten weitere abgebrochene, aber bereits verbrauchte Runner-Zeit. Die Meldung `ENOTEMPTY` beim Chromium-Tab-Cleanup von Null trat in `43770470633` auf. Sie ist eine zeitabhängige Testumgebungsstörung in einem bestehenden Test. Der Nachlauf auf dem korrigierten Head bestand 122/122. Ein Testfehler bleibt als Jobfehler sichtbar und wird nicht durch automatische Wiederholung überdeckt.

## Vorher/Nachher für einen typischen offenen PR

| Maß | Vorher, tatsächlich auf 2D-A | Nachher, erwarteter PR-Lauf |
| --- | --- | --- |
| Integration-Auslöser pro Feature-Commit | Push und PR, zwei vollständige Workflows | ein PR-Workflow |
| Automatische Jobs | je Workflow Node und Browser, zusammen vier Runner-Jobs | zwei Runner-Jobs |
| Vollständige Browser-Regressionen | zweimal 122 Tests | einmal 122 Tests |
| Historischer v0.8-Vergleich | automatisch zweimal bis zu rund 4:35, gelegentlich abgeschnitten | nur auf bewussten manuellen Auftrag |
| Runner-Minuten | rund 24 bei zwei erfolgreichen Duplikaten | aus gemessenen Teilschritten rund 7–8 |
| Zeit bis zum grünen Integrationsergebnis | ungefähr 11:27 im erfolgreichen Push, PR teils 12-Minuten-Abbruch | Browser-Suite rund 6:05 plus Setup, ungefähr 6:40–7:30 |

Die Nachher-Zahlen sind Prognosen aus den gemessenen Schritten. Der reale PR-Lauf und seine Jobminuten werden im Draft-PR dokumentiert. Ein schneller zweiter Commit sollte den laufenden ersten PR-Run per Concurrency abbrechen. Ein tatsächlicher Zwei-Commit-Probelauf wäre angesichts des Monatsbudgets eine zusätzliche volle CI-Ausführung und wurde nicht künstlich erzeugt. Nach dem Merge ist ein neuer `main`-Push eine eigenständige Integrationsprüfung des Merge-Commits.

## Schutz und Bedienung

Das Standard-PR-Ereignis verwendet kein `pull_request_target` und keine Secrets. Mit Branch Protection müssen beide genannten Jobs für `main` verpflichtend sein. `workflow_dispatch` bleibt für vollständige manuelle Diagnose verfügbar. Die historischen Vergleiche brauchen einen bewussten Start. Bei einem transienten Infrastrukturfehler kann der konkrete Job nach Ursachenprüfung einzeln neu gestartet werden. Die Workflow-Timeouts gelten pro Job. Branch Protection und Actions-Fork-Freigaben werden erst bei der späteren Veröffentlichung im Repository selbst konfiguriert.
