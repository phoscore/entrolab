# v0.2 – Qualitätsupdate und Messprotokoll

Grundlage: `docs/Auditbericht_v0.1.md`, vor der Implementierung vollständig gelesen. Keine Fehlerkorrektur oder Überschreibung der Originalversion. Keine neue physikalische Theorie und keine Sci-Fi-Funktion hinzugefügt.

## Entscheidung zum Integrator

`dist/physics.mjs` und die Zeitintegration in der UI bleiben unverändert. Der gleiche Velocity-Verlet-Schritt wird mit zustandsadaptiver Steuerung und festem h = 0,1 Tag verglichen. Der Festschritt ist ein Vergleichsverfahren, kein neuer auswählbarer UI-Modus.

Beim elliptischen Doppelstern (e ≈ 0,5) über 100 Jahre sinkt die Endenergieabweichung im Vergleich von 3,702203e-4 auf 1,532889e-7 (Faktor ≈ 2415). Die maximale Energieabweichung sinkt von 4,691480e-4 auf 5,326045e-5 (Faktor ≈ 8,81). Dafür braucht der Festschritt etwa 3,07-mal so viele Schritte.

Das ist KEINE allgemeine Verbesserung: Für die exzentrische Bahn e=0,8 steigt die maximale Energieabweichung bei h=0,1 von 5,106415e-4 auf 2,335018e-3 (Faktor ≈ 4,57 schlechter), obwohl die Endenergie besser aussieht. Endenergie alleine kann ungünstige Phasenfehler verdecken. Deshalb kein Austausch des Standardintegrators und keine Behauptung einer numerischen Verbesserung von v0.2 gegenüber v0.1. v0.2 verbessert die Überprüfbarkeit und Kennzeichnung.

## Reproduzierbarkeit

- `node scripts/test.mjs`: zehn Originaltests, Syntaxprüfungen und 16 zusätzliche Testfälle.
- `node scripts/benchmark.mjs > docs/numerics-v0.2.json`: zwölf vollständige Vergleichsläufe mit deterministischen Anfangsbedingungen, keinerlei Zufall.
- Messumgebung: v24.22.1, Linux. Reproduzierbarkeit innerhalb von Gleitkomma-/Runtime-Unterschieden; keine Laufzeitgarantie.
- Endzeit für beide Verfahren identisch; letzter Schritt auf Restzeit gekürzt. Das ist bei Festschritt ein einzelner verkürzter Endschritt, kein laufendes adaptives Verfahren.
- Energieabweichungen relativ zu |E(0)|; Impulsfehler normiert auf Σ m|v|(0); Drehimpulsfehler auf Σ |m(x vy − y vx)|(0). Gemessen nach jedem Schritt, Maxima über den ganzen Lauf.
- Binary, solar und hole: 36525 Tage; exzentrisches Paar und Dreikörper: 3652,5 Tage; Nahbegegnung: 30 Tage. Definitionen in `tests/numerics.mjs`.
- UI-Bildraten, Restzeit-Akkumulator und Schrittlimit sind in diesen Physikbenchmarks nicht enthalten. Sie sind keine gemessenen Echtzeit-UI-Trajektorien.
- Feste Regressionstoleranzen stehen in `tests/quality.test.mjs`. Tests prüfen finite Zustände, kollisionsfreie Benchmarks, Energie, linearen Impuls und Drehimpuls. Die Toleranzen sind Schutz vor groben Regressionen, keine universelle Genauigkeitsgarantie.

| Szenario | Tage | Verfahren | Schritte | Endenergie relativ | max. Energie relativ | max. Impuls normiert | max. Drehimpuls normiert |
|---|---:|---|---:|---:|---:|---:|---:|
| binary | 36525 | adaptive | 118807 | 3.702203e-04 | 4.691480e-04 | 0.000000e+00 | 1.936170e-14 |
| binary | 36525 | fixed | 365251 | 1.532889e-07 | 5.326045e-05 | 0.000000e+00 | 2.521055e-14 |
| solar | 36525 | adaptive | 173974 | 1.230001e-11 | 8.262067e-11 | 9.231305e-15 | 1.469867e-14 |
| solar | 36525 | fixed | 365251 | 6.494219e-13 | 1.924422e-11 | 3.007914e-14 | 1.770521e-14 |
| hole | 36525 | adaptive | 73050 | 4.746548e-14 | 1.145970e-09 | 6.261055e-15 | 2.676915e-14 |
| hole | 36525 | fixed | 365251 | 8.492599e-15 | 6.767787e-12 | 3.044106e-14 | 3.752805e-14 |
| eccentric | 3652.5 | adaptive | 13582 | 1.390133e-04 | 5.106415e-04 | 2.386034e-14 | 2.150443e-14 |
| eccentric | 3652.5 | fixed | 36526 | 8.838776e-08 | 2.335018e-03 | 1.526276e-14 | 2.021417e-14 |
| triple | 3652.5 | adaptive | 7886 | 3.835665e-06 | 3.606682e-05 | 4.220447e-15 | 5.586779e-15 |
| triple | 3652.5 | fixed | 36526 | 9.805657e-09 | 1.905681e-06 | 1.313930e-14 | 2.126080e-14 |
| encounter | 30 | adaptive | 65 | 1.809686e-06 | 1.201853e-05 | 0.000000e+00 | 6.203855e-16 |
| encounter | 30 | fixed | 300 | 1.510378e-08 | 1.251253e-06 | 0.000000e+00 | 1.240771e-15 |

## Weitere Prüfungen

Die feste Verlet-Integration wird mit h = 0,1 / 0,05 / 0,025 Tag gegen eine feinere h=0,0125-Referenz verglichen (e=0,8, zwei Jahre). Die Bahndifferenzen müssen bei Halbierung jeweils unter 35 % fallen; dies ist eine numerische Konvergenzprüfung, kein unabhängiger analytischer Orbitnachweis.

Kollisionstests: Masse und Impuls; kinetische/gesamte Modellenergie im gewählten überlappenden Testfall; Dreier-Verschmelzung; Nichtkollision; BH-Typ bei Absorption; bewusst verlorener aufgelöster Drehimpuls beim außermittigen Verschmelzen. Der Test behauptet keine Drehimpulserhaltung bei Verschmelzung ohne Spinmodell. Kein kontinuierlicher Kollisionsdetektor ergänzt.

## Oberfläche und Warnungen

- Prominentes BH-Banner bereits im Newtonschen Fernfeld; verschärfte Warnung bei r ≤ max(10 r_s, 5 ε) und bei v ≥ 0,1 c. Schwellen sind heuristische Warnbereiche, keine scharfen physikalischen Gültigkeitsgrenzen.
- Hawking-Leistung und Lebensdauer ausdrücklich Modellschätzungen. Annahmen bleiben auch beim kalten Loch sichtbar. Heiß-Warnung bei T > 10⁹ K ist ein Hinweis, keine Emissionsspektrumberechnung.
- Reine Anzeigehelfer in `dist/display.mjs`: keine Physikänderung. mm bis fm, km, AU und Lichtjahre; echte hochgestellte Exponenten und signifikante Ziffern. Erdmasse ergibt sichtbar 8,87 mm statt gerundet 0,009 m.
- Bei ≤600 CSS-Pixeln einspaltige Steuerung/Inspektor, gestapelte Koordinatenfelder, größere Touch-Ziele und Schrift; ursprüngliche Farbgestaltung bleibt.

## Tatsächlich durchgeführte Validierung und Grenzen

Lokal: zehn Originaltests und 16 neue Testfälle erfolgreich; zwölf Benchmarkläufe durchgeführt. Desktop-Browser: Start, Szenariowechsel, BH-Banner, Labornavigation, Erdmasse-Preset, 8,87-mm-Anzeige und Modellschätzungslabels kontrolliert. Keine Anwendungsfehler in den erfassten Browserlogs; die Browsererweiterung selbst protokollierte Metadatenfehler.

Kein echter Mobilgeräte-/Touch-Test und keine erfolgreich umgestellte schmale Browserbreite in dieser Umgebung. Mobile CSS-Änderungen benötigen weiterhin eine unabhängige Prüfung bei beispielsweise 390 px und auf realem Gerät. Kein vollständiger UI-Automatentest, keine externe Orbitreferenz, keine allgemeine Stabilitätsgarantie für beliebige Benutzereingaben. Der Original-Prüfsummenlauf erfordert die Git-Historie und wird durch GitHub CI ausgeführt, nicht aus der lokalen Dateikopie heraus behauptet.
