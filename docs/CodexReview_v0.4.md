# ENTROLAB v0.4 – Codex-Review: reproduzierte UI-Randfälle

Stand: 2026-11-08; PR #3, Branch `develop/v0.4`, Ausgangscommit `06a835b02df5f60c036737aa38dc307b8fa9e5f2`. Dieser Nachtrag dokumentiert die von Codex berichteten Fälle und einen unabhängigen Code-/JavaScript-Abgleich. **Keine Implementierung, kein Merge, kein Deployment.**

## Ergebnis

Codex meldet 76/76 bestandene Bestandsprüfungen, sechs historische Integritätskontrollen, zwölf numerisch unveränderte Benchmarks und eigene Ergänzungsprüfungen (1001 Logskalen-Rundläufe, unabhängige SI-/Schwarzschild-Kontrollen, Chrome-Tests). **Drei niedrige UI-/Hinweisfehler** sind gemeldet. Die wissenschaftlichen Radien, Verhältnisse, Beispiele und gemessenen thermischen Umrechnungen waren im geprüften Umfang konsistent. Die Browser- und Performanceangaben entstammen Codex; der unabhängige Abgleich hier war kein neuer vollständiger Browserlauf.

### 1. Celsius-Rundung am Skalenminimum

Reproduktion: in der Celsius-Eingabe `-273.149` eingeben. In JavaScript liefert `-273.149 + 273.15` den Wert `0.0009999999999763531`, also binär etwas kleiner als `0.001`; die Bedingung `k < .001` in `dist/extreme-ui.mjs` zeigt irrtümlich „Unterhalb des Sliderbereichs“ an. Kelvin-Preset `0.001` zeigt die Warnung nicht. Die eigentliche Umrechnung ist innerhalb der angegebenen numerischen Genauigkeit richtig.

**Fixziel:** Toleranzbehaftete *UI-Grenzklassifikation* (nicht die zugrunde liegende SI-Formel oder das v0.3-Physikmodell) und Regression für äquivalente Kelvin-/Celsius-Eingaben am unteren Skalenende.

### 2. Negatives Kelvin bei Zahlenunterlauf

Reproduktion: `-1e-999` als Text in Kelvin eingeben und Eingabe abschließen. `Number('-1e-999')` liefert `-0`; `Number.isFinite(-0)` ist wahr und `-0 < 0` ist falsch. Damit landet der als negative Temperatur eingegebene Text als **0 K** im aktiven Zustand. `Object.is(Number('-1e-999'),-0)` ist wahr.

**Fixziel:** Bewusst negativ eingegebene Kelvinwerte auch dann ablehnen, wenn sie beim Parsen zu `-0` unterlaufen. Prüfung soll bei direktem `input` und `change` greifen. Nicht einfach alle extrem kleinen *positiven* Werte verwerfen; echte 0 K und die vorhandenen Kälte-Presets bleiben möglich. Absichern mit Regression für `-1e-999`, normale negative Zahlen, `0`, `0.001`, `0.1`. Kein Eingriff in globale `Number`-Semantik.

### 3. Zurückgebliebene Masse-Fehlermeldung

Reproduktion: im Schwarzloch-Massenfeld `1e42` eingeben, Eingabe verlassen, danach die Animationsqualität wechseln. Nach `refresh()` erscheint wieder die aktive gültige Masse (z. B. `1.98847e31` kg), aber `massError` bleibt mit einer Fehlermeldung gefüllt. Ursache im aktuellen Code: `massInput` setzt die Warnung im `catch`, während `refresh()` bei Normalisierung der sichtbaren Masse die Fehlermeldung nicht zurücksetzt.

**Fixziel:** Anzeige und Validierungsstatus synchronisieren, wenn wieder ein gültiger aktiver Wert im Feld sichtbar ist. Ungültige gerade *bearbeitete* Texte müssen weiterhin korrekt zurückgewiesen werden. Test für 1e42 → blur → Qualitätswechsel, danach Rückkehr zu gültiger Anzeige ohne alte Fehlermeldung.

## Zwei Darstellungsrisiken – keine nachgewiesenen Formelfehler

1. Das Artwork zeichnet auch bei deaktivierter Akkretionsscheibe noch einen warmen Halo; der Text „isoliert ohne Scheibe“ könnte dadurch Eigenleuchten nahelegen. Fachlich sollte klar sein: isolierte Schwarzschild-Löcher besitzen ohne strahlende Umgebung nicht automatisch einen sichtbaren warmen Halo. Ein dezenter, eindeutiger künstlerischer Hinweis direkt an der Szene oder das Entfernen des warmen Halos in diesem Modus sind Optionen.
2. Künstlerische Leuchtringe, oberer Bogen und Helligkeitsasymmetrie ähneln relativistisch gerechneten Linsenbildern, sind aber *nicht* durch Raytracing oder Geodäten erzeugt. Bestehende Warnungen sind fachlich richtig; optional „künstlerische Projektion, kein berechneter Schatten-/Photonenring“ noch sichtbarer anbringen. Geometrie: „Schwarzschild-Koordinatenradien (schematisch), keine Eigenabstände“ als hilfreiche Präzisierung.

**Wichtig:** Artwork muss nicht neu gebaut und nicht realistischer behauptet werden. Die Risiken sind Verständlichkeits-/Gestaltungshinweise, keine wissenschaftlich validierte Raytracing-Anforderung.

## Abnahme einer gezielten Korrektur

- Auf `develop/v0.4` bleiben **alle 76 bisherigen Tests** unverändert gültig; die drei Fehler erhalten zusätzliche automatisierte Regressionstests.
- Der bestehende Integrator, Schwarzschild/Hawking-Berechnungen, Sternbeispiele, Massen-Presets und Vorhersage bleiben unverändert.
- Alle zwölf numerischen Benchmarks mit den bisherigen Referenzen vergleichen, Originalintegrität und GitHub Actions kontrollieren.
- Browser-Smoke-Test der drei UI-Fälle, soweit verfügbar; zwischen kontrolliertem DOM-Test und tatsächlichem Chrome klar unterscheiden.
- Einfache, klar gekennzeichnete optische Präzisierungen nur, wenn sie ohne Regression und ohne unnötigen Umfang möglich sind.
- Änderungen und Grenzen dokumentieren; PR #3 aktualisieren, **nicht mergen und nicht deployen**.
