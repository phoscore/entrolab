# v0.2 – Abschluss der unabhängigen Qualitätsprüfung

Grundlage: `docs/Review_v0.2.md` und `tests/independent_kepler_review.mjs`, vor den Änderungen vollständig gelesen. Die unabhängigen Dateien bleiben unverändert. Bearbeitung ausschließlich auf `develop/v0.2`, keine Änderung am Original, kein Merge und kein Deployment.

## Neue CI-Regressionen

Der bestehende Einstieg `node scripts/test.mjs` führt weiterhin die zehn Originalchecks und 16 bisherigen Qualitätsfälle aus. Neu: sechs analytische Kepler-Bahnen, eine Selbstprüfung der Referenz und zwei Kollisionsregressionen. Insgesamt **35 Prüfungen**, davon 25 Node-Testfälle. Die vorhandene GitHub-Actions-Infrastruktur verwendet denselben Einstieg, inklusive Syntaxprüfung aller neuen Module.

`tests/kepler-reference.mjs` übernimmt die Methode des unabhängigen Reviews: Keplergleichung E − e sin E = M, Newton-Iteration mit Konvergenzprüfung, Zweikörper-Relativposition in AU. Die Referenz ist ungeglättet; der Simulator hat EPS=10⁻⁷ AU. Keine exakte Übereinstimmung der Modelle behauptet. Referenz-Selbstprüfung: Apozentrum, Perizentrum, Periode und Umlaufrichtung für alle drei Exzentrizitäten.

Die Phasenabweichung ist der Betrag der auf [−π, π] gewickelten Differenz der geometrischen Polarwinkel (wahre Anomalie) zur Referenz, nicht die ungewickelte Zahl der Umläufe. Position und Phase werden nach jedem Schritt geprüft; die Referenz wird nicht aus dem Verlet-Ergebnis erzeugt. Maximalfehler bedeutet Maximum an den ausgewerteten Zeitschritt-Endpunkten, nicht kontinuierliches Supremum.

| e | Verfahren | Tage | Endfehler km | max. Positionsfehler AU | max. Winkelfehler rad |
|---|---|---:|---:|---:|---:|
| 0 | adaptiv | 3652,5 | 231787,256 | 0,001556243 | 0,001556226 |
| 0 | fest 0,1 d | 3652,5 | 9271,737 | 0,0000622514 | 0,0000622509 |
| 0,5 | adaptiv | 365,25 | 10655,836 | 0,000188342 | 0,000561710 |
| 0,5 | fest 0,1 d | 365,25 | 10417,501 | 0,0000696367 | 0,0000755621 |
| 0,8 | adaptiv | 365,25 | 25067,440 | 0,000203331 | 0,001828979 |
| 0,8 | fest 0,1 d | 365,25 | 85896,967 | 0,001339227 | 0,001339229 |

Explizite Regressionsbudgets (Endposition AU / maximale Position AU / maximaler Winkel rad):

| e | adaptiv | fest 0,1 d |
|---|---|---|
| 0 | 0,002 / 0,002 / 0,002 | 0,00008 / 0,00008 / 0,00008 |
| 0,5 | 0,0001 / 0,00025 / 0,00075 | 0,0001 / 0,0001 / 0,0001 |
| 0,8 | 0,00023 / 0,0003 / 0,0024 | 0,0008 / 0,0018 / 0,0018 |

Die Budgets besitzen etwa 20–50 % Abstand zur geprüften Baseline. Sie sind Regressionstoleranzen, keine wissenschaftlich universelle Präzisionsgarantie. Kein Vergleichstest rechtfertigt einen pauschalen Integratorwechsel. Beim kreisförmigen adaptiven Lauf bleibt die maximale relative Energieabweichung 1,368126×10⁻⁹ trotz deutlich größerem Positionsfehler.

## Kollisions-Tunneling: Untersuchung und Entscheidung

Frontalfall des Reviews: je 3×10⁻⁶ Sonnenmassen, x=±10⁻⁴ AU, vx=∓0,02 AU/Tag; Kollisionsabstand 8,514272×10⁻⁵ AU.

| Steuerung | erkannte Kollisionen | Schritte bis Erkennung/Ende | simulierte Zeit Tage |
|---|---:|---:|---:|
| einzelner Schritt 0,02 d | **0 (bekannte Lücke)** | 1 | 0,02 |
| bestehend adaptiv | 1 | 6 | 0,003065170 |
| fest 0,0001 d | 1 | 29 | 0,0029 |
| fest 0,00005 d | 1 | 58 | 0,0029 |

Beim versetzten Vorbeiflug (y-Abstand 0,0003 AU) werden adaptiv und mit festem 0,0001-d-Schritt keine Körper verschmolzen. Diese positiven Fälle laufen als Regressionen; die bekannte Fehlfunktion des großen Schritts wird separat diagnostiziert, **nicht durch eine grüne „0 Kollisionen erwartet“-Assertion als korrekt festgeschrieben**.

**Keine Änderung an der produktiven Erkennung.** Bisher wird ausschließlich am Schrittende auf Überlappung geprüft. Kleinere Schritte reduzieren das Tunneling im untersuchten Fall, beweisen jedoch keine sichere Erkennung beliebig kurzer, streifender Kontakte. Eine gerade Swept-Sphere-Verbindung berücksichtigt die innerhalb des Schritts beschleunigte, gekrümmte Bahn nicht; eine allgemeine Time-of-Impact-Lösung müsste auch den Zustand zum Kontakt, Restschritt, Mehrfachkontakte und den Rechenaufwand konsistent behandeln. Dafür liegt hier kein hinreichender Sicherheits- und Nichtverschlechterungsnachweis vor. Ein eingebauter Unterteiler würde außerdem den deklarierten Festschrittvergleich ändern. Deshalb keine ungeprüfte Kollisionskorrektur und keine Behauptung, das Problem sei gelöst.

Die gemessenen Kollisionszeiten sind diskrete Erkennungszeiten, keine exakten Kontaktzeiten. Nach der Verschmelzung endet diese Diagnostik; sie simuliert nicht die restliche Zeit bis 0,02 Tage weiter. Keine allgemeine Kollisionsgarantie für die adaptive UI.

## Tatsächlich ausgeführte Prüfungen

- Unveränderte unabhängige Diagnostik erneut ausgeführt; alle sechs Kepler-Ergebnisse und der Kollisionsfall reproduziert.
- Vollständiger lokaler CI-Einstieg erneut ausgeführt: zehn Originalchecks plus 25 Node-Testfälle bestanden; keine übersprungenen oder TODO-Tests.
- Alle zwölf bisherigen Benchmarkläufe erneut ausgeführt: Ergebnisse einschließlich Schritte und Endpositionen identisch mit `docs/numerics-v0.2.json`.
- Sensitivitätsprobe ausschließlich in einer temporären Kopie: Beschleunigung um 0,1 % erhöht, Referenz unverändert; alle sechs Kepler-Bahnprüfungen schlugen fehl, Referenz-Selbstprüfung bestand. Temporäre Mutation nicht in der Anwendung oder im Repository gespeichert.
- Maschinenlesbare zusätzliche Messwerte: `docs/review-regression-v0.2.json`. Reproduktion: `node scripts/review-diagnostics.mjs`. Diese Diagnostik protokolliert Ergebnisse; CI-Assertions stehen separat in den `.test.mjs`-Dateien.
- Keine erneute Browser-/Mobilprüfung: Produktionsoberfläche und Physik wurden bei diesem Abschluss nicht verändert. Der bisherige manuelle Mobilbefund bleibt eine Plausibilitätsprüfung.
- Historische Originalintegrität wird im GitHub-CI-Lauf mit vollständiger Git-Historie geprüft; die lokale heruntergeladene Dateikopie ersetzt diese Prüfung nicht.

Es wird **kein numerischer Genauigkeitsgewinn der Anwendung** behauptet. Der Gewinn besteht in analytisch verankerter Fehlererkennung und einer überprüfbaren Dokumentation der offenen Kollisionsgrenze. PR #1 bleibt zur unabhängigen Prüfung, ohne Merge-Freigabe.
