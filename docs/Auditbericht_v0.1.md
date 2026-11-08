# ENTROLAB v0.1 – unabhängiger Prüfbericht
**Datum:** 8. November 2026  
**Grundlage:** `ENTROLAB-v0.1-source.zip` (Quellstand laut Export: `095f7f4ae50453a373012ed870fa7175e5b4c5ee`)  
**Prüfstatus:** Quellcode, rechnerische Referenztests und exemplarische Desktop-/Mobil-Interaktionen untersucht. Keine Veränderung am Originalprojekt.

## Kurzurteil
ENTROLAB ist eine echte, interaktive Webanwendung mit Newtonscher N-Körper-Gravitation und auswertbaren Formeln für nichtrotierende Schwarze Löcher – **keine bloße Animation**. Die zentralen Formeln sind in den geprüften Fällen korrekt implementiert. Die wissenschaftlichen Einschränkungen werden überwiegend transparent erklärt. Allerdings ist die bestehende Testabdeckung begrenzt und die langfristige Genauigkeit des *adaptiven* Integrators nicht so gut wie die kurzen eingebauten Tests nahelegen.

**Wichtiger Hinweis:** Ein pauschales „90 % physikalisch korrekt“ ist kein wissenschaftlich definierter Qualitätswert. Korrektheit ist szenario- und modellabhängig; realistische Aussagen über Ereignishorizonte oder Hawking-Verdampfung erfordern andere Modelle als Newtonsche N-Körper-Dynamik.

## Geprüfte Dateien und Integrität
- `dist/physics.mjs`: Physik-Kern, Szenarien, Kollisionen
- `dist/checks.mjs`: zehn integrierte Tests
- `dist/app.mjs`: Benutzeroberfläche, Animation, Zeitsteuerung, Diagramme
- `dist/index.html`, `dist/style.css`: Oberfläche und Dokumentation
- `.openai/hosting.json`: Hosting-Konfiguration

Alle sechs SHA-256-Prüfsummen aus `SHA256SUMS.txt` stimmen mit den Dateien überein. Die zehn integrierten Tests liefen erfolgreich (10/10).

## Zusätzliche quantitative Prüfungen
| Test | Ergebnis | Einordnung |
|---|---:|---|
| Schwarzes Loch mit 1 Sonnenmasse: Radius | 2.953,339 m | Standardformel korrekt |
| Schwarzes Loch mit 1 Sonnenmasse: Temperatur | 6,17007 × 10⁻⁸ K | Standardformel korrekt |
| Schwarzes Loch mit Erdmasse: Radius | 8,87010 mm | Standardformel korrekt |
| Schwarzes Loch mit 10⁹ kg: Modell-Lebensdauer | 2.665,44 Jahre | Korrekt **innerhalb der gewählten vereinfachten Modellgleichung**, nicht allgemein exakte Lebensdauer |
| Zweikörper-Test bei 1 AU: nach einem Jahr Bahnpositionsabweichung | ~0,0000173 AU | Gut bei 0,05-Tage-Festschritt; leicht abweichender Bezug durch Zeit-/Periodendefinition |
| Zweikörper-Test: relative Energiedrift | ~7,1 × 10⁻¹⁵ | Gut bei festem Schritt |
| Sonnensystem: 100 Jahre, fester 0,5-Tage-Schritt | ~6,21 × 10⁻¹⁰ Energiedrift | Sehr gut für das idealisierte Startmodell |
| Sonnensystem: 100 Jahre, bestehender adaptiver Schritt | ~1,23 × 10⁻¹¹ Energiedrift | Gut, aber einzelne Szenarien können sich anders verhalten |
| Doppelsternsystem: 100 Jahre, bestehender adaptiver Schritt | ~3,702 × 10⁻⁴ = **0,0370 %** Energiedrift | Messbare kumulative Drift |
| Doppelsternsystem: 100 Jahre, fester 0,1-Tage-Schritt | ~1,53 × 10⁻⁷ = **0,0000153 %** Energiedrift | Im gleichen Test deutlich geringere Drift |
| Kollision zweier Körper: Gesamtmasse und Impuls | Erhalten | Vereinfachtes Verschmelzungsmodell entspricht Codeannahme |

Bei den Bahnprüfungen wurden die vorhandenen Physikfunktionen mit **zusätzlich konstruierten** Anfangsbedingungen und Prüfkriterien ausgeführt. Die Schwarzes-Loch-Ergebnisse wurden an bekannten analytischen Größenordnungen gespiegelt. Das ist eine technische Plausibilitätsprüfung, kein Ersatz für vollständige Validierung gegen unabhängige Simulationen oder Beobachtungsdaten.

## Browser-/Oberflächenprüfung
Die unveränderte Anwendungslogik wurde in einem lokalen Browser-Testaufbau mit eingebetteten Quelldateien ausgeführt (nur Importpfade und externe Schriftarten für den Testaufbau angepasst). Geprüft wurden unter anderem:
- Start und Initialisierung (neun Körper), zehn integrierte Tests;
- Wechsel zu Schwarze-Loch-Rechner, Massen-Presets und eigene Masseneingabe;
- Ausgabe von Radius, Temperatur, Leistung, Lebensdauer;
- Pause, Szenariowechsel, Parameteränderung, Entfernen, Zurücksetzen;
- Navigations- und Wissenschaftsbereich;
- Darstellung bei 1.400 px Desktop- und 390 px Mobil-Breite.

Es wurden dabei keine JavaScript-Laufzeitfehler beobachtet; auf dem getesteten Mobilviewport entstand keine horizontale Seiten-Überbreite. **Nicht getestet:** Live-Hosting und alle realen Browser-/Gerätekombinationen, umfassende Barrierefreiheit, extreme Eingaben und Langzeit-Verhalten sämtlicher möglichen Setups.

## Priorisierte Erkenntnisse und Verbesserungen

### P1 – Langfristige numerische Genauigkeit besser prüfen (mittel)
**Ort:** `dist/physics.mjs` (`safeStep`, `step`), `dist/app.mjs` (Hauptschleife), `dist/checks.mjs`.  
Das aktuelle Velocity-Verlet-Verfahren ist mit zustandsabhängig angepassten Zeitschritten nicht automatisch langfristig symplektisch. Im Doppelstern-Test lag die relative Energiedrift nach 100 Jahren bei 0,0370 %; bei einem festen 0,1-Tage-Schritt nur 0,0000153 %. Das bedeutet **nicht**, dass das adaptive Verfahren generell unbrauchbar ist; es muss über verschiedene Szenarien und Zeiträume validiert und ggf. mit einem besseren adaptiven Integrator oder sicherem Festschrittmodus ergänzt werden.  
**Empfehlung:** Langzeittests für kreisförmige und exzentrische Bahnen, Nahbegegnungen und Dreikörpersysteme; Energiedrift, Impuls, Drehimpuls und Bahnabweichung messen. Vergleichsmodus „Präzision/Festschritt“ und „Schnell/Adaptiv“ prüfen.

### P2 – Grenzen der Schwarzen-Loch-Simulation prominenter anzeigen (mittel)
**Ort:** `dist/physics.mjs` (`EPS`, `radius`, `step`), `dist/app.mjs` (`diagnostics`).  
Der Softening-Parameter beträgt 10⁻⁷ AU, also ~15 km. Ein Schwarzes Loch mit einer Sonnenmasse hat aber nur ~2,95 km Schwarzschild-Radius. **Innerhalb weniger Softening-Längen ist die wirkende Gravitationskraft künstlich geglättet; zusätzlich fehlen Relativität und Gezeiteneffekte.** Das dokumentiert die App bereits. Nutzer sollten noch deutlicher sehen, dass eine visuelle BH-Kollision **keine realistische Horizont- oder Akkretionssimulation** ist.  
**Empfehlung:** Bei stark relativistischen Fällen Status „physikalisch außerhalb des Modells“ mit Warnsymbol, idealerweise optional Simulationsstopp oder gesondert markierter Sci-Fi-/Näherungsmodus.

### P3 – Hawking-Schätzungen korrekt einordnen (mittel)
**Ort:** `dist/physics.mjs` (`blackHole`), `dist/index.html` (Dokumentation), `dist/app.mjs` (`bhNote`).  
Radius und Temperatur entsprechen den Formeln für Schwarzschild-Löcher. Leistung und Lebensdauer nutzen eine bekannte, sehr vereinfachte Schwarzkörper-Näherung. Das berücksichtigt **nicht** das vollständige Emissionsspektrum, Greybody-Faktoren, reale Teilchenarten oder Materiezufuhr; besonders bei kleinen heißen Löchern können reale Modellvorhersagen stark abweichen. Die Dokumentation sagt dies bereits ausdrücklich.  
**Empfehlung:** Ergebnisse konsequent „Modellschätzung“ nennen und bei kleinen Massen prominenten Warnhinweis setzen; später mehrere Modellannahmen vergleichbar machen, ohne Scheingenauigkeit vorzutäuschen.

### P4 – Eingebaute Tests erweitern (mittel)
**Ort:** `dist/checks.mjs`.  
Die zehn vorhandenen Tests sind ein guter Anfang, aber sie prüfen überwiegend Kurzläufe, einzelne Referenzwerte und einfache Kollisionen. Sie testen nicht die langfristige adaptive Stabilität, extreme Massen, viele Körper, sehr hohe Geschwindigkeiten oder UI-Grenzfälle.  
**Empfehlung:** Automatisierte Regressionstests hinzufügen, auch für bereits dokumentierte Modellgrenzen; Testbedingungen und tolerierte Fehler mit anzeigen.

### P5 – Verständlichkeit und Mobilbedienung (niedrig)
**Ort:** `dist/app.mjs`, `dist/index.html`, `dist/style.css`.  
Die Desktop-Oberfläche wirkt sauber und die Mobilansicht bricht nicht horizontal aus. Auf dem Handy sind Inspector-Eingabefelder und Diagnostik teilweise sehr eng, während bei der Schwarzes-Loch-Masse die Anzeige `0,009 m` den anschaulicheren Wert `8,87 mm` verdeckt.  
**Empfehlung:** Mobile Inspektorsektion untereinander statt in zwei schmalen Spalten; automatische sinnvolle Einheitendarstellung (mm/km/AU); nutzerfreundliche Hinweise bei extremen Parametern.

### P6 – Doppelszenario nach Wunsch beschriften (niedrig)
**Ort:** `dist/physics.mjs` (`scenario('binary')`).  
Das Doppelstern-Preset ist **keine Kreisbahn**, sondern startet bei 1 AU Trennung mit einer idealisierten Exzentrizität **e ≈ 0,5**. Das ist physikalisch zulässig, kein Fehler. Eine Beschriftung „elliptische Doppelsternbahn“ würde falsche Erwartungen vermeiden. Optional zusätzlich ein kreisförmiges Preset anbieten.

## Empfohlene nächste Schritte
1. **Original v0.1 sichern.** Keine ungeprüften Änderungen direkt am Originalstand.
2. Erste gezielte Iteration: Testsuite + numerische Stabilität + Warnungen. **Kein Feature-Bloat.**
3. Nach dem Update dieselben Langzeittests erneut ausführen und Ergebnisse vergleichen.
4. Danach erst neue Physics-/Sci-Fi-Experimente ergänzen; reale Physik und Fantasiemodelle deutlich voneinander abgrenzen.

## Externe Methodik-Referenz
Hairer & Söderlind (2005), *Explicit, Time Reversible, Adaptive Step Size Control*, SIAM Journal on Scientific Computing, DOI: `10.1137/040606995`. Zeigt, warum adaptive Schrittsteuerung bei geometrischen Integratoren besondere Sorgfalt braucht. Diese Arbeit wurde als externe methodische Plausibilitätsquelle herangezogen, nicht als Verifikation der App.
