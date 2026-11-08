# ENTROLAB v0.3 – Experimentierlabor: Qualität und Grenzen

## Umfang und unveränderte Basis

Plan und geforderte Agenten-/Qualitätsberichte vollständig gelesen. Arbeiten ausschließlich auf `develop/v0.3`. Keine Veröffentlichung, kein Merge; v0.1 und frühere Entwicklungsstände werden nicht überschrieben. Zwei neue Presets, ein aufklappbarer Messbereich und eine optionale numerische Vorschau; kein neuer Integrator und kein Sci-Fi-Modell.

Die Integrationsrechnung bleibt Velocity Verlet mit bisherigem `safeStep`. Einzige Kern-Erweiterung: `step` und `mergeCollisions` können optional eine Körper-Erzeugungsfunktion erhalten; Standard bleibt unverändert `body`. Der Prädiktor übergibt einen Abbruch-Callback. So kann eine prognostizierte Verschmelzung vor dem Aufruf von `body` abgebrochen werden, ohne globale IDs zu verbrauchen. Bei Kontakt sind ausschließlich bereits geklonte Werte verändert, und das ungültige Intervall wird nicht in den Pfad aufgenommen. Kein neuer Kollisionsdetektor, keine Tunneling-Korrektur.

## Reproduzierbare Presets

`dist/experiments.mjs` kapselt die neuen Anfangsdaten; die drei vorhandenen Presets werden unverändert delegiert.

### Dreikörper-Wechselwirkung

Massen 1 / 0,8 / 0,5 M☉; vor Schwerpunktkorrektur Positionen (−1,0), (1,0), (0,1,5) AU und Geschwindigkeiten (0,−0,004), (0,0,005), (−0,006,0) AU/d. Massenmittel von Position und Geschwindigkeit wird abgezogen. Endliche, deterministische Startwerte ohne anfängliche Berührung. Keine Zufallsbewegung, keine pauschale Langzeitstabilität oder numerisch bewiesene Chaosklassifikation.

180-Tage-Prüfung: 1006 Schritte, keine Kollision; relative Endenergieabweichung 2,037433×10⁻⁴ (0,02037 %), normierter Impulsfehler 2,76×10⁻¹⁵ und Drehimpulsfehler 3,01×10⁻¹⁶. Ein erfolgreiches 180-Tage-Beispiel validiert nicht beliebige Laufzeiten oder externen Dreikörper-Referenzen.

### Gravitationsschleuder

Bewegter Stern: 1 M☉, Start (0,0) AU, Geschwindigkeit (−0,005,0) AU/d. Sonde: 10⁻¹² M☉, Start (−2,0,4) AU, Geschwindigkeit (+0,03,0) AU/d. Gleiches paarweises Newton-Modell; Sternbewegung und kleine Rückwirkung der Sonde werden mitgerechnet. Modellradien aus der vorhandenen Dichtenäherung, keine echte Sonden-/Sternstruktur.

Das Laborsystem wird hier **nicht** auf Gesamtimpuls null verschoben: Der bewegte Stern ermöglicht einen verständlichen Energieaustausch im benannten System. Nach 180 Tagen: 452 Schritte, keine Kollision; Geschwindigkeit der Sonde im Laborsystem Faktor 1,038654 (Zunahme ≈3,865 %). Die relativen Anfangs-/Endgeschwindigkeiten zum Stern sind wegen verschiedener Abstände nicht gleich; ihr Verhältnis beträgt 0,932960. Deshalb wird stattdessen die relative spezifische Bahnenergie einschließlich Potential geprüft: Abweichung −1,313×10⁻⁶. Gesamtenergiedrift des Systems: 1,22×10⁻¹⁵, dominiert durch den massereichen Stern und allein kein hinreichender Beleg für Sondengenauigkeit. Kein asymptotischer Geschwindigkeitsgewinn für unendlich entfernte Messpunkte behauptet.

## Messinstrumente und Baseline

`dist/instruments.mjs` berechnet reine Momentanwerte ohne Zustandseingriff:

- Geschwindigkeit des gewählten Körpers in km/s, v(AU/d) × 149597870700 / 86400 / 1000.
- Abstand zu einem ausdrücklich benannten anderen Körper, Anzeige in geeigneten Längeneinheiten. Fehlender, gelöschter oder identischer Referenzkörper ergibt keine erfundene Distanz; „— (keine Referenz)“.
- Systemenergie inklusive geglättetem Potential in M☉·AU²/d²; bisherige relative Energiedrift seit letzter Baseline.
- Gesamtimpuls (Px,Py) in M☉·AU/d und Lz in M☉·AU²/d, bezogen auf feste Simulationsachsen und deren unveränderten Ursprung. Referenzwahl für den Abstand verändert dieses Bezugssystem nicht.
- Impulsänderung normiert auf Σ m|v| bei Baseline; Drehimpulsänderung auf Σ |m(x vy − y vx)|. Damit keine Division durch nahezu nullen Nettoimpuls. Wenn die Summe selbst null ist, keine relative Abweichung anzeigen. Energienorm bleibt |E₀|; bei fast nuller Gesamtenergie ist relative Energiedrift besonders empfindlich und kein Genauigkeitsbeweis.
- Letzter tatsächlich ausgeführter Integrationsschritt in simulierten Tagen und bestehende Zeitanzeige. Kein Versprechen einer Echtzeit-Schrittweite.

Reset/Szenario, manuelle Anwendung/Platzierung/Entfernung und echte Kollision setzen Baseline/Trails neu und verwerfen Prognosen. Der Anlass wird angezeigt. Verschmelzungen erhalten keine aufgelöste Bahnenergie-/Spinbilanz; Drift danach wird zur neuen Baseline gemessen. Bei numerisch nicht endlichen Simulationswerten wird angehalten und Reset verlangt. BH-/Softening-Warnungen aus v0.2 bleiben erhalten; kein Ereignishorizontmodell.

## Begrenzte Bahnvorhersage

`dist/prediction.mjs` integriert alle Körper auf einer separaten Kopie mit derselben `step`-/`safeStep`-Rechnung. Nur die Bahn eines ausgewählten Körpers wird dargestellt. Keine erzeugte Ellipse und keine Konfidenzintervalle.

- UI erstellt sofort eine Kopie des aktuellen Startzustands und seines Zeitstempels; der Generator verwendet ausschließlich eigene einfache Körperkopien mit leeren Trails. Keine `body()`-Aufrufe für Kopien.
- Grenzen: maximal 12 Körper, 1500 Schritte, 301 gespeicherte Punkte, intern maximal 365 Tage; UI 10/60/180 Tage.
- Generator gibt spätestens nach 50 Schritten zurück; UI lässt zwischen Portionen `setTimeout(...,0)` andere Ereignisse zu. **Nicht** bei jedem Frame neu berechnen. Manuell neu auslösbare Momentaufnahme; wiederholte Starts ersetzen den alten Auftrag, automatische Neuberechnung ist bewusst nicht implementiert.
- Auswahlschalter, Szenariowechsel, Edit, Kollision, Reset, Horizontwechsel, Abschalten und Wechsel ins Labor verwerfen veraltete Ergebnisse. Normale laufende Integration verändert die gespeicherte Prognose nicht; sie bleibt eine klar mit Startzeit bezeichnete historische Momentaufnahme.
- Ungültige Eingaben, Körper-/Schrittlimit, erkannter Kontakt oder numerische Grenzwerte stoppen sauber. Verkürzter Horizont und Grund erscheinen im UI. Bereits gültige Punkte bleiben bei Abbruch nutzbar; bei nicht berechenbarem Start gibt es keine Pfadpunkte.
- Abbruch bei diskret erkanntem Kontakt ist keine exakte Kontaktzeit. Bestehendes Tunneling und Gleitkomma-/Integratorfehler bleiben möglich; in empfindlichen Mehrkörpersystemen ist die Aussagekraft begrenzt. Kein relativer BH-Pfad, keine Vorhersage realer Ereignisse.
- Rechenbudget ist über Arbeitsschritte und Körperzahl begrenzt, keine harte Millisekunden-Garantie. Eine Portion wird nicht mitten im einzelnen N-Körper-Schritt unterbrochen.

## Tatsächlich durchgeführte Tests

Vor Implementierung: alle 35 vorhandenen Prüfungen erfolgreich. Nach Implementierung: **55 Prüfungen** erfolgreich (zehn ursprüngliche Checks + 45 Node-Testfälle; 20 neue Fälle). Bestehende Prüfkriterien wurden nicht gelockert. Neue Fälle prüfen deterministische Startwerte, Massenskalen/Schwerpunkt, finite 180-Tage-Läufe, Schleuder-Bezugssystem, Einheiten, fehlende Referenzen, Normierung/Baselines sowie echte Verschmelzungs-/Reset-Baselines.

Vorhersagetests: deterministisches Ergebnis, vollständiger Vorher-/Nachher-Vergleich inklusive IDs/Trails/umschließender Zeit/Zähler/Diagnostik, keine globale ID-Erzeugung selbst bei vorhergesagter Kollision, erster Schritt identisch zum normalen Integrator, andere Körper wirken dynamisch, harte Schritt-/Körpergrenzen, Nullbudget, NaN/fehlende Auswahl/Horizontfehler, Überlauf, Kontaktabbruch und abbrechbare 50-Schritt-Portionen.

Alle zwölf v0.2-Benchmarkläufe nochmals ausgeführt: numerische Ergebnisse inklusive Schritte und Endpositionen identisch mit `docs/numerics-v0.2.json`. Unveränderte analytische Kepler- und Kollisionsregressionen sind weiterhin Bestandteil des Testeinstiegs. Die historische Originalprüfung erfolgt zusätzlich im CI mit voller Git-Historie; sie wird nicht aus der heruntergeladenen lokalen Dateikopie behauptet.

Reproduktion:

```sh
node scripts/test.mjs
node scripts/benchmark.mjs
node scripts/benchmark-v0.3.mjs
```

## Gemessener Rechenaufwand

Messumgebung Node v24.22.1, Linux; fünf synchrone Wiederholungen pro Fall, jeweils maximal 50 Schritte pro Generatorportion. CPU-Zeit **ohne** Browser-Timer, Rendering und Geräteemulation; keine Smartphone-Leistungsbehauptung. Zeiten schwanken durch JIT/Hostlast und sind keine harten Testgrenzen.

| Fall, 180 d | Schritte | Punkte | CPU-Median ms (5 Läufe) | größte gemessene Portion ms |
|---|---:|---:|---:|---:|
| solar | 858 | 301 | 5.840 | 0.635 |
| triple | 1006 | 301 | 0.786 | 0.193 |
| assist | 452 | 301 | 0.187 | 0.443 |
| twelve | 360 | 301 | 4.025 | 0.820 |

Die vollständigen 10-/60-/180-Tage-Messungen und Daten stehen in `docs/messwerte-v0.3.json`. Alle aufgeführten Prognosen erreichten den angeforderten Horizont. Ein zusätzlicher 365-Tage-Sonnensystem-Test prüft das tatsächliche Abschneiden am 1500-Schritt-Limit.

## Bedienprüfung

Desktop-Chrome: Start, Pause, neues Schleuder-Preset, Körperauswahl, Referenzwahl, Messbereich und erfolgreiche 180-Tage-Prognose mit 452 Schritten; gestrichelte Bahn sichtbar. Bei der Prüfung fiel eine verzögert aktualisierte Auswahlmessung auf; Auswahl-/Referenz-/Anwendungsereignisse aktualisieren Instrumente jetzt sofort statt erst nach dem nächsten periodischen Diagnostikaufruf.

Kleine Ansicht: lokale QA-Seite mit gleichursprünglichem Iframe von 390×844 CSS-Pixeln (375 Pixel Inhaltsbreite neben der Scrollbar). Geprüft: Szenario, Pause, Prognose ein/180 Tage/neu berechnen, Messbereich aufklappen, Referenz entfernen, Geschwindigkeit auf 55 km/s ändern und anwenden. Die Änderung verwarf die Prognose, meldete neue Baseline und zeigte sofort 55 km/s. BH-Labor mit Erdmasse zeigte weiterhin 8,87 mm. Gemessen: kein horizontaler Überlauf (`scrollWidth=clientWidth=375`); alle fünf Inspektorfelder 44 Pixel hoch und 324,5 Pixel breit.

Dies ist ein echter schmaler Browser-Viewport in einer Testhülle mit Mausbedienung, **kein physisches Smartphone-/Touch-/Safari-Test**. Die lokale Testhülle ist nicht Teil des Commits. Keine umfassende Barrierefreiheitsprüfung oder Mobil-CPU-Messung. Auf Smartphones bleibt wegen der Instrumente vertikales Scrollen erforderlich; Bereiche sind standardmäßig eingeklappt.
