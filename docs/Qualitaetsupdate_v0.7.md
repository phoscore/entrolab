# ENTROLAB v0.7 — Thermal Entropy & Guided Discovery

Stand: 8. November 2026. Ausschließlich `develop/v0.7`. Grundlage ist die freigegebene v0.6 auf `main`, `4fe3c48295f66750775fa4fe42c596c26c361830`; vorbereiteter Plan-Commit `dbc9cb7b9c5196638d90749e253d3c1a64a71584`. Plan, AGENTS, Qualitätsberichte v0.5/v0.6 einschließlich Reviewnachträgen und relevante Module/Tests wurden vollständig gelesen. Dies ist ein Entwicklungsnachweis für die unabhängige Prüfung, keine Zertifizierung oder Mergefreigabe.

## Umfang und Bedienung

Das bestehende Entropy Lab hat zwei getrennte Experimentsansichten: **Teilchen & Wahrscheinlichkeit** und **Wärme & Entropie**. Kein zusätzlicher Haupttab. Das Markerexperiment, seine Zählmathematik, Zufallsregel und Grenzwerte bleiben erhalten. Die aktive Modellkennzeichnung wechselt zwischen statistischem und thermodynamischem Lehrmodell. `S/k_B` und thermodynamisches `ΔS` in J/K werden sichtbar unterschieden und weder gleichgesetzt noch addiert.

Das Wärmeexperiment startet pausiert bei 350 K / 290 K, gleichen Wärmekapazitäten von 1000 J/K und `G_th=10 W/K`. Anzeige: beide Temperaturen, vorzeichenbehaftete Nettoleistung, übertragene Energie, Gesamtenergie samt Bilanzfehler, gesamte/individuelle Entropieänderung, Entropieproduktionsrate und Temperaturkurven mit aktuellem Zustand. Start/Pause, Zehn-Modellsekunden-Schritte und Abspielrate 1/10/100 Modellsekunden pro Sekunde. Die Körperfarben sind relative illustrative Warm-/Kaltfarben; die Kurvenfarben identifizieren A/B unabhängig davon. Pfeil und Zahlen folgen dem berechneten Vorzeichen, auch bei B → A und gleichem T.

Neue Anfangswerte und drei ehrlich bezeichnete Beispiele sind **Entwürfe**. Erst „Übernehmen“ setzt Parameter, Zeit und Bilanzreferenz auf einen neuen Anfangszustand; „Startzustand wiederherstellen“ verwirft Entwürfe und stellt die zuletzt angewendeten Parameter bei t=0 her. Ungültige Eingaben ändern den gültigen Modellzustand nicht. Seltenere Parameter sowie Formeln/Annahmen/Quellen bleiben freiwillig aufklappbar.

Das Extreme Temperature Lab behält seine Skala, Umrechnung und Grenzfälle. Eine neue Aktion merkt den aktuellen **gültigen** Kelvinwert für Körper A oder B vor und öffnet das Wärmeexperiment. Sie verändert weder angewendete Wärmeparameter noch Bilanz oder Modellzeit, startet keine Simulation und klemmt keine Werte stillschweigend auf eine Grenze. Nur 250–600 K sind übernehmbar. Bei einer ungültigen Temperatureingabe wird ausdrücklich nicht der letzte gültige Hintergrundwert übertragen. Ziel, Wert und noch nötiges Anwenden werden erklärt. Rücknavigation erhält den Temperaturwert und beide unabhängigen Modelle.

## Wissenschaftliches Modell

Zwei endliche Körper mit je einer homogenen Temperatur und konstanter positiver **Gesamtwärmekapazität** C in J/K. Das Paar ist nach außen isoliert. Ein konstanter Wärmeleitwert `G_th` in W/K koppelt die Körper; dies ist nicht die Gravitationskonstante G. Keine Arbeit, Phasenwechsel, Strahlung, Außenverluste, räumlichen Temperaturgradienten, temperaturabhängigen Kapazitäten oder Materialdaten.

Die Grenzen sind bewusst didaktisch gewählt:

| Größe | Zulässiger Bereich | Einordnung |
| --- | --- | --- |
| Beide Anfangstemperaturen | 250–600 K einschließlich | Gewöhnlicher positiver Bereich, kein universeller Materialgültigkeitsnachweis |
| Beide Wärmekapazitäten | 1–10⁶ J/K einschließlich | Positive, konstante Gesamtgrößen, keine spezifische Materialwärmekapazität |
| Wärmeleitwert G_th | 0,001–1000 W/K einschließlich | Freier Modellparameter, keine gelöste räumliche Leitung |
| Modellzeit | 0–10¹² s einschließlich | Endliche Rechengrenze; am Limit pausiert die UI |

Auch 350 K garantieren für ein beliebiges reales Material keine konstanten Eigenschaften. Extreme Sterne/Plasmen oder der absolute Nullpunkt werden nicht in dieses Modell übernommen. Die Abspielrate ist eine Bedienoption, kein gemessener Kühlprozess.

Vorzeichenkonvention: Q > 0 bedeutet Energieübertragung von A nach B, negative Werte B nach A. Wärme ist Übertragung von Energie, kein Wärmevorrat; Temperatur ist keine Energie.

```text
P = dQ/dt = G_th (T_A − T_B)
C_A dT_A/dt = −P                 C_B dT_B/dt = +P
T_eq = (C_A T_A0 + C_B T_B0)/(C_A + C_B)
C_eff = C_A C_B/(C_A + C_B)      τ = C_eff/G_th
f(t) = 1 − exp(−t/τ)
Q(t) = C_eff (T_A0 − T_B0) f(t)
T_A(t) = T_A0 − Q/C_A            T_B(t) = T_B0 + Q/C_B
U = C_A T_A + C_B T_B            U₀ = C_A T_A0 + C_B T_B0
ΔS_i = C_i ln(T_i/T_i0)          ΔS_total = ΔS_A + ΔS_B
σ = dΔS_total/dt = G_th (T_A − T_B)²/(T_A T_B) ≥ 0
```

Für dieses lineare Modell wird der Zustand **analytisch aus Anfangsparametern und absoluter Modellzeit** berechnet. Kein Euler-Schritt, keine akkumulierte Integratordrift und kein Eingriff in den Gravitationsintegrator. Wärmeleistung in W, Q/U in J, Entropieänderung in J/K, σ in W/K. Der gewählte Nullpunkt `U=CT` ist Modellkonvention, kein absoluter Materialenergieinhalt. Die logarithmische Entropieänderung verwendet den Zustandsfunktionscharakter der Entropie; der reale endliche Wärmeausgleich selbst ist irreversibel. Die abkühlende Seite verliert Entropie, die Summe wächst. Eine spontane Umkehr ist keine Lösung des hier gewählten passiven Modells; thermische Fluktuationen werden nicht aufgelöst.

### Stabile Auswertung und Rundung

`f = −expm1(−t/τ)` erhält kleine Zeitänderungen. Individuelle ΔS verwenden `log1p`. Nahezu gleiche Anfangstemperaturen führen bei einer naiven Summe zweier größerer, entgegengesetzter Entropieterme zu Auslöschung. Deshalb wird die identische Summe als

```text
x_A = −Q/(C_A T_A0), x_B = Q/(C_B T_B0)
ΔS_total = Q (T_A0−T_B0)/(T_A0 T_B0)
           + C_A[ln(1+x_A)−x_A] + C_B[ln(1+x_B)−x_B]
```

berechnet. Für |x| < 0,001 wird `ln(1+x)−x` bis zum zwölften Potenzterm ausgewertet. Dies vermeidet die Auslöschung des linearen Terms. **Kein Positivitäts-Clamping** und keine Korrektur der Energieanzeige. Bei numerisch vollständig erreichtem Gleichgewicht werden beide Temperaturen auf das analytische T_eq gesetzt. Gleiches Anfangs-T bleibt exakt gleich; Q, P und ΔS sind dann null. Individuelle gerundete Werte können in der Anzeige anders summieren als die genauer ausgewertete Gesamtgröße.

## Unabhängige Referenzen und echte Messungen

Reproduktion: `node scripts/measure-thermal.mjs`. Vollständige Ausgabe: [thermal-v0.7-measurements.json](thermal-v0.7-measurements.json), tatsächlich unter Node **24.22.1** erstellt; keine historische Benchmarkreferenz. Tests verwenden zusätzlich eine eigene RK4-Integration der zwei Differentialgleichungen und differenzieren Q/ΔS gegen P/σ.

Bei Standardparametern gilt τ=50 s, T_eq=320 K. Nach `50 ln 2 = 34,657359027997266 s` ist der Temperaturunterschied halbiert:

| Größe | Unabhängiger Sollwert | Tatsächliche Modellausgabe |
| --- | --- | --- |
| T_A / T_B | 335 K / 305 K | 335 K / 305 K |
| Q / P | 15000 J / 300 W | 15000 J / 300 W |
| U / Bilanzfehler | 640000 J / 0 J | 640000 J / 0 J |
| ΔS_total | 1000 ln(335/350) + 1000 ln(305/290) | 6,628230968498983 J/K |
| Grenzgleichgewicht | 320 K / 320 K, Q=30000 J | 320 K / 320 K, Q=30000 J |
| ΔS_total im Grenzgleichgewicht | 1000 ln(102400/101500) | 8,827914123565389 J/K |

Das Grenzgitter umfasst **1.458 Zustände**: je drei Werte für T_A/T_B/C_A/C_B/G_th und sechs Zeiten einschließlich t=0, sehr kleiner Zeit, τ/1000, τ, 5τ und 10¹² s. Gemessen:

- Größter absoluter Energiefehler **1,1920928955078125 × 10⁻⁷ J**, größter relativer Fehler **2,0553300978909378 × 10⁻¹⁶**. Das sind unterschiedliche Maxima des Gitters.
- Minimaler Gesamtentropiewert **0 J/K**, kleinster zeitlicher Zuwachs **0 J/K**, größtes Überschwingen außerhalb der Anfangstemperaturen **0 K**. Gleichheit ist insbesondere für gleiche Anfangstemperaturen und numerisch erreichtes Gleichgewicht erwartet.
- Unabhängige RK4-Gegenrechnung mit T_A0=400 K, T_B0=280 K, C_A=500 J/K, C_B=1500 J/K, G_th=4 W/K: **10.000 Schritte à 0,01 s**. Nach 100 s maximale Temperaturabweichung **2,6716406864579767 × 10⁻¹² K** (A: 1,5347723092418164 × 10⁻¹² K).

Die festen automatischen Toleranzen wurden vor dem CI-Lauf gewählt: Energie höchstens `4·Number.EPSILON·U₀`, Temperaturbereich 10⁻¹² K Rundung, ΔS ≥ −10⁻¹⁰ J/K und zeitliche Monotonie mit höchstens 10⁻⁹ J/K Rundung; die gezielten Nahgleichgewichtsprüfungen verlangen ΔS ≥ 0. Referenz-ΔS 10⁻¹² J/K, unabhängige RK4-Temperaturen höchstens 2×10⁻¹⁰ K. Kalorimetrie und zentrale Differenzen haben eigene strenge, im Test lesbare Toleranzen. Keine Grenzwerte nach einem Fehlschlag gelockert. Die Stichproben sind kein vollständiger Beweis jeder IEEE-754-Eingabekombination.

## Anleitung, Hilfe und Sprache

„Erste Schritte“ ist eine freiwillige Anleitung mit vier echten Bedienhandlungen: Entropy Lab wählen; Wärmeansicht wählen; einen Zehn-Sekunden-Schritt auslösen; eine Anfangstemperatur bearbeiten und ausdrücklich übernehmen. „Zum hervorgehobenen Bedienfeld“ fokussiert/scrollt nur das tatsächlich passende sichtbare Element, auch nach Navigation in ein anderes Lab. Es klickt keine physikalische Aktion selbst. Ein Schritt wird erst durch die entsprechende Nutzerhandlung erfüllt. ⓘ und Advanced bleiben freiwillig; jederzeit schließen, Escape, neu öffnen oder Anleitung neu beginnen. Letzteres setzt ausschließlich die Anleitung zurück.

Schritt, Entwürfe, Fehler/Custom Validity und Modellwerte bleiben bei DE/EN erhalten. Hauptnavigation behält sichtbaren Fokus; Schließen/Escape der Anleitung führt zum sichtbaren Hilfebutton. Keine Fokusfalle oder automatische Tour. Die bestehende Glossar-Infrastruktur wird genutzt; ein gemeinsamer Entropy-Erklärlink zeigt abhängig von der Experimentsansicht auf den passenden Begriff. So bleibt der Rückweg sichtbar und alte Eindeutigkeits-/Fokustests bleiben gültig.

Neue statische/dynamische Texte, Diagramm-/ARIA-Beschreibungen, Modellkennzeichnung, Fehler, Übergabehinweise und Anleitung sind deutsch/englisch. Eingaben verwenden weiterhin Dezimalpunkt, Anzeigen das aktive Locale. Der exakte Browser-Titel und das SVG-Favicon bleiben unverändert. Keine neue Laufzeitabhängigkeit, Accounts, Telemetrie, Speicherpflicht oder neue Netzanfrage im normalen Modellbetrieb.

## Automatisierte Prüfungen und CI

Baseline lokal: **138/138** reguläre Prüfungen. Vorbereiteter Branch-CI-Lauf [42514961235](https://github.com/phoscore/entrolab/actions/runs/42514961235) erfolgreich. Erster vollständig grüner Implementierungsstand: **`ff2785749b5fe4581fc7fade25f852fe93cf4856`**, [CI 42519350878](https://github.com/phoscore/entrolab/actions/runs/42519350878). Beide Jobs erfolgreich:

| Prüfung | Tatsächliches Ergebnis |
| --- | --- |
| Alte reguläre Prüfungen | **138/138 unverändert erhalten** |
| Neue reguläre Fälle | **11/11** |
| Regulär insgesamt, lokal Node 24.22.1 und CI Node 22.23.4 | **149/149**, zehn Originalchecks + 139 Node-Fälle |
| Alte Chromium-Fälle | **20/20 unverändert erhalten** |
| Neue Chromium-Fälle | **9/9** |
| Chromium 151.0.7922.34 insgesamt | **29/29**, keine erfassten Seitenfehler, kein Skip |
| Vollständige numerische Benchmarks, gleiche Laufzeit vor/nach | **12/12 exakt gleich** |
| Historischer Original-Commit | **6/6 SHA-256-Prüfungen bestanden** |

Neue Node-Fälle: halbierte Relaxation/Endentropie; Grenzgitter; gleiches T; A/B-Symmetrie/Vorzeichen; Kalorimetrie und Ableitungsbilanz; unabhängige RK4-Rechnung; sehr kleine Zeit-/Temperaturunterschiede; ungültige Parameter/Zeit und Mutationsfreiheit; Transferbereich ohne Clamping; unveränderliche Grenzen/dichte Abtastung; dynamische Übersetzungen und Titel/Favicon.

Neue Chromium-Fälle: Werte/Apply/Reset und übersetzte ungültige Entwürfe; sichere Übernahme einschließlich ungültiger Extreme-Entwürfe und Rücknavigation; Stop/Resume bei Unteransicht, Offscreen, Hauptnavigation und synthetischer Document-Sichtbarkeit; vier tatsächlich interaktive Lernschritte; Hilfe/DEEN/Navigation/Escape/Fokus; vier schmale/gebrochene/DPR-Konfigurationen; echte Reduced-Motion-Media-Emulation; Beispiele, umgekehrter Wärmefluss und Kontext-Escape; begrenzter Renderaufwand und gemeinsamer Hilferückweg. Alte Körperzustände einschließlich IDs, Trails, Zeit, Selektion und Markerzustand werden vor/nach Wärme-/Hilfebedienung verglichen. Die vorhandenen Tests sichern weiterhin Vorhersage und isolierte Selbstchecks.

**Während der CI-Prüfung behoben:** Im ersten Stand existierten zwei Erklärlinks innerhalb `#entropy`, von denen einer verborgen war. Zwei unveränderte v0.6-Browserfälle fanden deshalb keine eindeutige Locatorzuordnung. Alle acht damaligen neuen Fälle bestanden bereits, die gesamte Suite war aber 26/28. Ein einzelner gemeinsamer, stets sichtbarer Link mit dynamischem Kontext behebt die Ursache; kein alter Test wurde angepasst. Anschließend wurde zusätzlich dessen Verhalten bei Unteransichts-/Sprachwechsel getestet. Alle historischen Testdateien und Assertions bleiben bytegleich.

Der abschließende Dokumentations-/Messstand wird vor Übergabe erneut durch CI am PR-Head geprüft; der konkrete End-Hash und Lauf stehen im Pull Request, damit kein selbstreferentieller Dokumentations-Commit nötig ist.

## Browser, Performance und Lebenszyklus

Ein einzelner 200-ms-Timer ist nur bei bewusstem Abspielen, aktivem Wärmeexperiment, sichtbarem Dokument und sichtbarer Körperdarstellung geplant. Versteckte Ansichten löschen ihn; beim Wiedererscheinen gibt es höchstens einen neuen Termin, kein Nachholen vergangener Wandzeit. Modellzeit wird ausdrücklich um die gewählte Schrittgröße erhöht; verzögerte Browserintervalle sind keine behauptete physische Echtzeituhr. Die Markeransicht erhält nur die zusätzliche Sichtbarkeitsbedingung ihrer Unteransicht und stoppt ebenfalls verborgen. Kein neuer RAF-Scheduler und kein neues Canvas mit Bitmap-/Layout-Rückkopplung.

Reduced Motion: initial pausiert, dekorative Übergänge/Fading unterdrückt; Wechsel der Präferenz pausiert das Wärmeexperiment. Explizites Starten bleibt erlaubt. Die Kurven werden mit **65 analytischen Stützstellen je Körper** und zwei aktuellen Punkten gezeichnet; Polyline-Interpolation ist visuell, keine Änderung der berechneten Werte. Bei sehr ungleichen Kapazitäten/Zeitskalen oder langer Zeitachse zeigt die begrenzte Abtastung nicht jedes frühe Detail. Zahlen/Diagramm-ARIA bleiben separat zugänglich. Keine gemessenen Materialdaten oder Vorhersage für reale Objekte.

Echte CI-Messung mit Systemschrift (Google Fonts blockiert), Touch **emuliert**, EN aktiv:

| Angeforderte CSS-Breite / DPR | innerWidth / scrollWidth | Diagrammbreite | Höhen der drei Hauptbuttons |
| --- | --- | --- | --- |
| 320 / 1 | 320 / 320 | 256,40625 px | 45 / 45 / 45 px |
| 390 / 2 | 390 / 390 | 320,8125 px | 45 / 45 / 45 px |
| 320,5 / 1,25, echter iframe | 321 / 321 | 257,34375 px | 45 / 45 / 45 px |
| 1360 / 1 | 1360 / 1360 | 586,203125 px | 66 / 66 / 66 px |

`innerWidth` rundet beim 320,5-px-iframe; die tatsächlich gebrochene CSS-Breite wird vom Testserver gesetzt. Kein beobachteter horizontaler Überlauf. Die alten Sandboxprüfungen erhalten zusätzlich zwölf Kombinationen über je 120 Frames und prüfen weiter das frühere Höhenwachstum.

300 synchrone Wärme-Schrittklicks inklusive analytischer Berechnung und DOM-/SVG-Aufbau: **Median 0,30 ms, p95 0,60 ms, Maximum 1,00 ms**. Danach t=3000 s, **11 SVG-Knoten**, kein geplanter Timer und unveränderte Gravitations-/Markerwerte. Kein harter Timing-Grenzwert, keine FPS-/GPU-/Paint-/Touch-Latenzgarantie. Rohdaten: [thermal-v0.7-browser.json](thermal-v0.7-browser.json). Screenshots aus demselben tatsächlichen Lauf: [Desktop](screenshots/v0.7/thermal-1360.png), [320 px](screenshots/v0.7/thermal-320.png); beide visuell geprüft. Weitere Screenshots und alte Messdaten im CI-Artefakt `chromium-review-measurements` (GitHub-Aufbewahrungsfrist beachten).

Lokaler Playwright-/Chromium-Start wurde versucht und scheitert vor der Anwendung an `socket() failed: Operation not permitted`. Die 29 automatisierten Browserergebnisse stammen daher ausdrücklich aus GitHub CI. Zusätzlich wurde die gemeinsame Chrome-Vorschau interaktiv geprüft: Haupt-/Unteransicht, zehn Sekunden, DE/EN mit erhaltenem t=10 s, Modellkennzeichnung, freiwillige Anleitung und Escape zurück zum Hilfebutton.

## Bewahrung und Prüflücken

Alle zwölf vollständigen lokalen Benchmark-JSON-Ergebnisse vor/nach v0.7 und `docs/numerics-v0.2.json` sind unter Node 24.22.1 bytegleich, SHA-256 **`743a9773953b40848fb8596e15df1a60ab8ef507222b62400cb23c32c23f307a`**. CI bestätigt zusätzlich exakte Gleichheit zur genehmigten Basis unter derselben Node-/V8-/OS-Version und schützt die historischen Benchmarkquellen. Keine neuen Toleranzen oder Referenzkalibrierung. Es wird keine Verbesserung der alten Numerik behauptet.

Physikkern/Integrator, Newtonkräfte, Kollisionen, Szenarien, Messinstrumente, Bahnvorhersage, BH-/Hawking-Formeln, `extreme-data.mjs`, Renderer und statistisches `entropy.mjs` bleiben unverändert. Die einzige Ergänzung an `extreme-ui.mjs` stellt den bereits validierten ungerundeten Kelvinwert lokal für die bewusste Übergabe bereit. `entropy-ui.mjs` bekommt die notwendige Unteransichts-Sichtbarkeit und das Wechselereignis. Die vorhandenen i18n-/UX-/Guide-/Worker-Module werden nicht ersetzt. Archivierte v0.1, Tag/Original-Commit, Prüfsummen und Hostingkonfiguration bleiben unangetastet.

Offen bleiben physische Smartphone-/Touchhardware, Safari/Firefox/iOS, echter 200-%-Browserzoom, vollständiger Screenreader-/Kontrast-Audit und Langzeit-GPU-/Speicherprüfung. Document Hidden wird im neuen Chromium-Fall kontrolliert durch eine synthetische Sichtbarkeitseigenschaft/-meldung geprüft, nicht durch eine behauptete Betriebssystem-Minimierung. Das Grenzgitter ersetzt keine Materialvalidierung. Alte bekannte Newton-/Kollisions-/BH-Grenzen bleiben bestehen; der spätere Cosmic Field Guide wird nicht vorweggenommen.

## Quellen und Reproduktion

- [OpenStax University Physics Vol. 2 §1.6](https://openstax.org/books/university-physics-volume-2/pages/1-6-mechanisms-of-heat-transfer): Wärmeübertragungsmechanismen und linearer Leitungsansatz. Unsere konstante G_th-Kopplung ist eine ausdrücklich gewählte konzentrierte Parametrisierung.
- [OpenStax §1.4](https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry): Kalorimetrie, Wärmekapazität und Energiebilanz. Die konstanten Gesamt-C und fehlenden Phasenwechsel sind eigene Modellannahmen.
- [OpenStax §4.6](https://openstax.org/books/university-physics-volume-2/pages/4-6-entropy): Entropie als Zustandsfunktion und reversible Integrationsstrecke zur Berechnung einer Zustandsänderung. Die künstlerischen Farben werden durch keine Quelle als Emissionsphysik ausgegeben.

```sh
node scripts/test.mjs
node scripts/measure-thermal.mjs
node scripts/benchmark.mjs
node scripts/check-benchmarks.mjs  # vollständiger Git-Klon erforderlich
node scripts/verify-original.mjs  # vollständige Git-Historie erforderlich
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install --with-deps chromium
npm run test:browser
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

`http://localhost:8000` → Entropy Lab → Wärme & Entropie oder „Erste Schritte“. README und branchlokaler AGENTS-Umfang aktualisiert. Ausschließlich Entwicklungscommits und Review-PR nach main; **kein Merge, Deployment, Release, Produktionsupdate oder neue Veröffentlichung**. Die öffentliche Website ändert sich erst nach ausdrücklich freigegebenem Merge/Deployment.
