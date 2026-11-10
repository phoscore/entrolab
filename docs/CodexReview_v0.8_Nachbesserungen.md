# v0.8: Nachbesserungen nach unabhängigem Codex-Audit

Auftrag vom 10.11.2026. Repository `phoscore/entrolab`, ausschließlich PR #7 / `feature/v0.8-learning-foundation`. Geprüfte Ausgangsversion: `d4b6bd1b2e6bd0e136b36a555b7df16d3cbe1d9d`. Keine Releasefreigabe.

Die drei bestätigten Befunde und externen Referenzmessungen stammen aus dem ausführlichen Nachbesserungsauftrag des Eigentümers. Im Featurebranch wurde kein gesonderter nachgelagerter Codex-Bericht gefunden. Der ältere Planungs-Audit bleibt unverändert als historischer Befund erhalten.

## 1. Korrigierte Wissenschaft: zwei verschiedene Energiebegriffe

**Vor Korrektur tatsächlich reproduziert:** `dist/knowledge-ui.mjs` verband `systemEnergy` mit dem Begriff `energy`. Dessen Modell war `thermal`; der DE/EN-Langtext erklärte `U = C_A T_A + C_B T_B`. Die Zuordnung eines gemeinsamen, in Wahrheit thermisch spezifizierten Begriffs war die Ursache. Die Zahlenberechnung der Sandbox war davon unabhängig und korrekt implementiert.

**Korrektur:** Ein eigener Begriff `mechanicalenergy` mit Ziel `guide-mechanical-energy` gehört zum bestehenden Gravity-Modell. Nur die Zuordnung des Messwerts wird darauf umgestellt. Der bestehende Begriff und Direktlink `energy` / `guide-energy` bleiben für das Wärmemodell erhalten und sind ausdrücklich als thermische innere Modellenergie beschriftet. Kein zweites Wissenssystem, keine Änderung an Rechenmodulen.

Mechanische Energie der Sandbox:

\[
E=\frac12\sum_i m_i|\mathbf v_i|^2-
\sum_{i<j}\frac{Gm_i m_j}{\sqrt{|\mathbf r_i-\mathbf r_j|^2+\varepsilon^2}}.
\]

- Jedes Paar genau einmal; dieselbe Glättung wie in `physics.mjs`, `ε = 10⁻⁷ AU`.
- Einheit der tatsächlichen Anzeige: **M☉·AU²/Tag²**, keine Joule. G ist entsprechend in AU³/(M☉·Tag²) umgerechnet.
- Das Potential geht bei unendlichem Abstand gegen null. Geschwindigkeit und kinetische Energie beziehen sich auf die verwendeten Koordinatenachsen.
- Isolation ohne Kollisionen: bis auf numerische Fehler konstant. Eingriffe und unelastische Verschmelzungen setzen die bestehende Driftreferenz neu; Wärme, innere Energie und Spin werden nicht bilanziert. Negative Gesamtenergie eines Mehrkörpersystems bindet nicht automatisch jeden einzelnen Körper.

Thermisches Modell: `U = C_A T_A + C_B T_B` in **J**, konstante gesamte Wärmekapazitäten, ausdrücklich gewählter Modellnullpunkt. Energieänderung durch den vorhandenen passiven Wärmeaustausch, keine Arbeit und keine universelle absolute Materialenergie. Keine Addition mit der mechanischen Anzeige oder dem dimensionslosen Marker-`ln Ω`.

Referenzen: [OpenStax 13.3](https://openstax.org/books/university-physics-volume-1/pages/13-3-gravitational-potential-energy-and-total-energy), [13.4](https://openstax.org/books/university-physics-volume-1/pages/13-4-satellite-orbits-and-energy), bestehende Lehrbuchquellen im Wissenssystem. Die geglättete genaue Formel und Skalierung belegt der unveränderte Implementationscode; die neue SI-Referenzprüfung wertet die Energie unabhängig in Metern, kg und Sekunden aus und rechnet erst danach zurück.

**Vergleichbare Verweise geprüft:** alle 16 Inline-Bindungen sowie ihre Begriffs-, Modell-, Formel- und Quellenzuordnung in DE/EN inspiziert. Die gemeinsame Entropiehilfe erläutert ausdrücklich beide unterschiedlichen Größen/Einheiten. Weitere wissenschaftlich falsche Energieformelzuordnungen wurden dabei nicht gefunden. Das ist ein begrenzter Inhaltsreview, keine vollständige Zertifizierung aller astronomischen Aussagen.

## 2. Bestehende öffentliche Vorschau: tatsächliche Sicherheitsprüfung

Die frühere Behauptung einer ausschließlich privaten Vorschau war falsch. Der Cloudflare-Bot und die GitHub-Checks dokumentieren den automatischen Featurebranch-Build auf:

- `https://567f7dd7.entrolab.pages.dev`
- `https://feature-v0-8-learning-founda.entrolab.pages.dev`

Der Eigentümer akzeptiert die öffentliche Lesbarkeit unter seinen Sicherheitsbedingungen. Das private GitHub-Repository und seine CI-Artefakte sind davon getrennt. **Diese Nachbesserung veröffentlicht keine neue Version:** alle Commits beginnen mit `[CF-Pages-Skip]`, gemäß [Cloudflare-Dokumentation](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/#skipping-a-build-via-a-commit-message). GitHub-CI bleibt aktiv. Die bestehende öffentliche Vorschau zeigt damit weiterhin den geprüften Altstand, einschließlich der alten Energiehilfe, bis eine neue Veröffentlichung ausdrücklich freigegeben wird.

### Tatsächlich ausgeführt

[Read-only Prüfcode](../scripts/audit-v08-preview.mjs), [Rohprotokoll](v0.8/qa/v08-preview-security.json), [CI-Evidenz](https://github.com/phoscore/entrolab/actions/runs/42915407613/artifacts/13808644421). Der Evidenzjob war erfolgreich; der Gesamtlauf hatte einen unten offengelegten Fehler im neuen Browser-Testaufbau.

| Prüfung | Beobachtung |
| --- | --- |
| Öffentlicher Abruf beider bestehender URLs ohne Authentisierung | HTTP 200, identisches HTML |
| Auslieferungsbaum | 43 Dateien; 30 JS-/MJS-Dateien auf Netz-/Backendkandidaten geprüft |
| Begrenzte HTTP-Probes | 63 insgesamt: 61 GET und zwei OPTIONS; keine schreibenden Methoden |
| Secretmuster in veröffentlichtem Text/Antworten | Keine Treffer für private Schlüssel, typische GitHub-, AWS- oder API-Secrets |
| Öffentliche interne Pfade | 16 untersuchte Ziele, darunter `.env`, `.git`, Dokumente, Paketdateien, Backups und API-/Adminpfade, liefern exakt dasselbe Root-HTML; **SPA-Fallback, keine Offenlegung dieser Dateien** |
| Server-/Schreibimplementierung | Keine `functions/`, `_worker.js` oder Wrangler-Einstiege im geprüften Projekt; keine entsprechenden Netzwerk-/Backendkandidaten in Laufzeitmodulen |
| OPTIONS `/` und `/api/deploy` | HTTP 405; allein daraus wird kein Vollnachweis für alle Methoden abgeleitet |
| Bildmetadaten | Master-Review-JPEG und drei WebP-Derivate ohne EXIF-Felder; JPEG enthält ein Farbprofil/JFIF-Metadaten |

Root-HTML-SHA-256: `866af2b2f364006b201655eefd938e45792511a4b350e7d24f47007a8b57e339`. Der Branchalias war bytegleich. Die öffentliche App enthält statische Browsermodule, lokale Zustände, Worker für lokale Berechnungen und freiwillige externe Quellenlinks. Es wurde kein öffentliches Repository-/Deployment-Schreibinterface oder offengelegtes Secret gefunden. Die im GitHub-Botkommentar genannten App-Berechtigungen sind keine an Seitenbesucher ausgegebene Autorisierung.

**Grenzen:** Vier hochspezifische Secretmuster erkennen nicht jedes denkbare Geheimnis. Kein Zugriff auf Cloudflare-Adminrechte, accountweite Routes/Workers, Secret-Vault oder fremde Dienste; keine vollständige Penetrationsprüfung. GET/OPTIONS beweist nicht, dass jede denkbare fremd konfigurierte Schreibroute ausgeschlossen ist. Kein POST/PUT/PATCH/DELETE, kein Login-/Rechteänderungsversuch. Der lokale HTTP-Zugriff war durch die Laufzeit mit 403 eingeschränkt; die tatsächlichen HTTP-Probes stammen ausdrücklich aus GitHub Actions. Im geprüften Umfang kein konkreter Sicherheitsbefund, der eine Abschaltung der akzeptierten Vorschau rechtfertigt.

## 3. Paint-Mehrarbeit: reproduziert und begrenzt untersucht

Externe bestätigte Werte laut Auftrag: 0,307 → 0,364 ms (+18,57 %); weitere CI-Messungen etwa +19,66 % / +35,91 %. Diese Werte werden nicht durch einen günstigeren Lauf ersetzt.

Neue Ursachenmessung auf `5a4040d3…`: [Rohdaten](v0.8/qa/v08-correction-causes.json). Gleicher Runner/Chromium, 1360×1000 CSS-px, DPR 1, DE, Systemschrift; pausierte Gravity, **704×600 px Zeichenfläche** und zentrierter Canvas, 180 Aufwärmframes. Zwei Reihen in umgekehrter Reihenfolge. Hauptvergleiche jeweils 30 s, explorative Varianten jeweils 15 s. Der eingefrorene Prüfcommit und die aktuelle Energie-Korrektur werden separat geladen. Alle Eingriffe an Varianten geschehen nur in Testseiten; keine Physikparameter oder Produktionsdateien werden dafür geändert.

| Variante | Paint-p95 je Stichprobe / ms | Mittel / ms | Differenz zum Prüfcommit | Taskzeit / reale Wallsekunde, Mittel |
| --- | --- | ---: | ---: | ---: |
| Planungsbasis | 0,253 / 0,256 | 0,2545 | −0,1240 ms | 0,13507 s/s |
| Prüfcommit d4b6bd1 | 0,369 / 0,388 | 0,3785 | Bezug | 0,14011 s/s |
| Energie-Korrektur ohne Renderänderung | 0,315 / 0,383 | 0,3490 | −0,0295 ms / −7,79 % | 0,14338 s/s |
| Prüfcommit ohne Monster | 0,323 / 0,276 | 0,2995 | −0,0790 ms / −20,87 % | 0,13730 s/s |
| Prüfcommit ohne Inlinehilfen | 0,320 / 0,359 | 0,3395 | −0,0390 ms / −10,30 % | 0,13641 s/s |
| Nur Test: `contain: layout paint` am Simulationspanel | 0,443 / 0,360 | 0,4015 | +0,0230 ms / +6,08 % | 0,14476 s/s |
| Nur Test: identische Diagnose-Textschreibvorgänge unterdrücken | 0,397 / 0,388 | 0,3925 | +0,0140 ms / +3,70 % | 0,14234 s/s |

Prüfcommit gegen Basis in diesem Lauf: **+48,72 % / +0,1240 ms**; Energie-Korrektur gegen Basis: **+37,13 % / +0,0945 ms**. Der Mittelwert zweier p95 ist kein gepooltes p95. Die scheinbare Verbesserung zwischen den beiden inhaltlichen Versionen ist kein Nachweis einer Renderoptimierung: es wurde dort keine implementiert, die Stichproben schwanken. Normierte Taskraten berücksichtigen die unterschiedlichen realen Messdauern; rohe 15-/30-s-Summen sind nicht vergleichbar. Alle 14 Stichproben hatten Frame-p95 16,7–16,8 ms, keine beobachteten Long Tasks >50 ms und keine Seitenfehler.

### Wahrscheinliche Ursachen und Entscheidung

Zusätzliche sichtbare Paint-Items, insbesondere die statische Figur samt Kommentar, und zusätzliche UI-Strukturen sind wahrscheinliche Beiträge. Entfernen des Monsters verändert auch Layout und Scrollposition (316 statt 424 px), trotz identischem Canvasrechteck. Die Varianten liefern Hinweise, **keinen isolierten Kausalbeweis** und keine additive Zerlegung der Mehrarbeit. Die Initialreaktion ist nach dem Aufwärmen beendet; es gibt keinen neuen Monster-RAF-/Timerloop. Die bestehende pausierte Sandbox zeichnet weiterhin pro Frame; das wurde nicht als Nebenprojekt umgebaut.

Die beiden einfachen Optimierungsexperimente liefern keinen verlässlichen Paint-Vorteil. Die Textunterdrückung senkt zwar Layout-p95 von 0,395 auf 0,3345 ms, nicht aber Paint/Taskrate. Deshalb **keine Übernahme** von Paint-Containment, globalem Setterpatch, Render-/Schedulerumbau oder Funktionsentfernung. Alle neuen CSS-/Monsterfunktionen und Originalrenderer bleiben erhalten. Keine Eigenschaft wird zur Messwertkosmetik dauerhaft abgeschaltet.

**Ausnahmevorschlag, keine Akzeptanzentscheidung:** Die reproduzierte Abweichung darf wegen geringer absoluter Dauer, stabiler Frameintervalle und fehlenden Nutzens der kleinen Versuche separat bewertet werden. Das 10-%-Paintbudget ist weiterhin nicht erfüllt. Die endgültige Entscheidung liegt beim Eigentümer nach unabhängiger Sichtung. Keine universelle Mobil-/GPU-/FPS-Garantie, keine Worst-Case-Messung offener Panels oder initialer Reaktionen. Finaler Standardvergleich und finale CI werden zusätzlich im PR verlinkt.

## 4. Regressionen, betroffene Dateien und Schutz

- Laufzeit: nur `dist/knowledge.mjs`, `knowledge-text.mjs`, `knowledge-ui.mjs` für getrennte Energieinhalte und Zuordnung. Jetzt 29 kanonische Begriffe; bestehende Ziele bleiben gültig. Physik, App-Renderer, CSS, Integratoren, Toleranzen und Master unverändert.
- Tests: vier neue Fälle in `tests/knowledge-energy.test.mjs`; zwei echte Browserfälle für DE/EN, Fokus-/Modellrückweg, Rohentwürfe, Zustandsisolierung und 320/390-px-Direktlinks. Die bestehende genaue Begriffsanzahl wird fachlich notwendig von 28 auf 29 angepasst, keine Erhaltungs-/Fehlerschranke gelockert. Regulärer Einstieg registriert die neuen Fälle.
- Diagnose/CI: `scripts/audit-v08-preview.mjs`, `scripts/measure-v08-causes.mjs`, `.github/workflows/tests.yml`. Lange Ursachenstudie nach erster Erfassung nur noch bei ausdrücklicher Workflow-Dispatch-Wiederholung; die vorhandene komplette Browser-/Physik-/Standardvergleichsinfrastruktur bleibt aktiv.
- Dokumentation: `AGENTS.md`, README, Qualitätsbericht, Umsetzungsvertrag, dieser Nachbesserungsbericht und zwei unveränderte Rohmessdateien mit Herkunftsheader in `docs/v0.8/qa`.

Tatsächlich lokal: **186 bestanden = 10 Selbstchecks + 176 Node-Fälle**. Separater lesender Review führte dieselbe Suite unabhängig erneut erfolgreich aus und prüfte die Energieformel/Einheiten. Die lokale Chromium-Ausführung wurde versucht und vor Seitenstart vom Betriebssystem mit `socket() failed: Operation not permitted` / verweigertem `ptrace` abgebrochen; echte Browserresultate stammen aus CI.

Der erste CI-Lauf bestand 186 reguläre, zwölf historische und sechs Originalprüfungen sowie 64/65 Browserfälle. Ein neuer Test versuchte die Energiehilfe zu öffnen, während das vorhandene übergeordnete Instrumenten-Details noch geschlossen war. Der Test öffnet jetzt dieses echte Bedienelement vor der Tastaturaktion. Außerdem vergleicht er formatierte Messwerte erst nach Rückkehr in dieselbe Sprache (DE/EN haben unterschiedliche Dezimalzeichen). Keine Produktkorrektur oder abgeschwächte wissenschaftliche Assertion dafür. Der erfolgreiche Evidenzjob wird nicht mit einem vollständig grünen Gesamtlauf verwechselt.

**Finale CI:** wird nach tatsächlicher Ausführung ergänzt und am konkreten Abschlusscommit im PR verlinkt. Alle bisherigen 182 regulären Prüfungen und 63 Chromium-Fälle bleiben erhalten; erwarteter erweiterter Umfang 186/65, dazu 12/6. Kein Merge, kein neues Deployment, keine Änderung an `main`, Originalarchiv oder v0.8.5.
