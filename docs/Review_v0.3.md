# ENTROLAB v0.3 – unabhängiger Prüfnachtrag

Datum: 8. November 2026. Prüfstand: Pull Request #2, `develop/v0.3`, Head `3344fa46c27800c2fdf59a2b371540742c3b95b9` vor diesem Bericht. Die Prüfung verändert weder die produktive Physik noch die Benutzeroberfläche. **Keine Merge-Freigabe und kein Deployment.**

## Kurzurteil

Die implementierten Funktionen entsprechen dem vereinbarten Umfang. GitHub Actions meldete für den geprüften Branchstand erfolgreiche Prüfläufe (u. a. Run `42435046649`). Die neue CI umfasst laut `scripts/test.mjs` weiterhin die zehn Originalchecks sowie insgesamt 45 Node-Tests (zusammen 55 Prüfungen). Im Source sind die vorhandenen v0.2-Testdateien weiterhin angebunden. Grüne CI ist keine vollständige wissenschaftliche Zertifizierung.

Die optionale numerische Vorhersage berechnet **wirklich mit `step` und `safeStep` auf separaten Körperkopien**. Der Standardintegrator wurde nicht ausgetauscht: `dist/physics.mjs` ergänzt für Kollisionsfälle lediglich einen optionalen Körper-Erzeugungsparameter, dessen Default weiterhin die normale `body`-Funktion ist.

## Unabhängig ausgeführte Zusatzprüfungen

Die tatsächlich abgerufenen JavaScript-Quellen `physics.mjs`, `experiments.mjs`, `instruments.mjs` und `prediction.mjs` wurden in einer separaten JavaScript-Testumgebung ausgeführt (Modul-Import/Export-Hülle entfernt, fachliche Funktionskörper unverändert). Das ist ein gezielter Modultest, **kein vollständiger Browser-/Smartphone-Test**.

- Dreikörper-Preset: 180-Tage-Vorhersage erreicht den Horizont (`complete`), 1006 Schritte, 301 Punkte, ursprüngliche Körper unverändert.
- Gravitationsschleuder: nach 180 Tagen 452 adaptive Schritte, Geschwindigkeit der „Sonde“ im Laborsystem steigt um Faktor `1.0386542127504397`; relative Änderung der **gesamten** Modellenergie nur etwa `−1.22×10⁻¹⁵`. Das bestätigt die gemeldeten Größenordnungen, nicht eine asymptotische Streuung.
- Ein **eingefrorenes** Eingabe-Array mit eingefrorenen Objekten und Trails lässt sich 60 Tage fehlerfrei prognostizieren (`complete`, 154 Schritte): Das ist zusätzliche Evidenz dafür, dass der Prognosekern nicht in seine Eingaben schreibt.
- Unterbrechung des Prognose-Generators nach der ersten Portion: Rückgabe nach 50 Schritten, Abbruch über `return()` möglich; ursprüngliche Körper bleiben bytegleich in der JSON-Darstellung.
- Ein einzelner Körper ohne Gravitationspartner: 10 Tage Prognose, Endpunkt `(2.2, −1.3)` AU bis auf Gleitkommarundung für Start `(2, −1)` AU und Geschwindigkeit `(0.02, −0.03)` AU/Tag. Das ist ein zusätzlich unabhängiger Einfachfall.
- Tatsächliches 1500-Schritt-Limit: im Sonnensystem bei angeforderten 365 Tagen Abbruch nach 1500 Schritten bei ungefähr 314.92 Tagen; auch wenn `maxSteps=200000` als Option übergeben wird. UI bietet ohnehin nur 10/60/180 Tage.
- Der Browser-Code verwendet Generationsnummern, um alte Prognoseaufträge nach Auswahländerung, Szenariowechsel etc. zu verwerfen, und kennzeichnet historische Prognosen mit ihrem Startzeitstempel.

## Konkreter fachlicher Korrekturpunkt: Bezeichnung „Sonde“

Im Schleuder-Preset beträgt die Masse des Objekts `1e-12 M☉`, also **1.98847×10¹⁸ kg**. Das ist kein gewöhnliches Raumsonden-Massenmaß, sondern eher ein beträchtlicher kleiner Himmelskörper. Die bestehende Planetendichte-Näherung ergibt einen **Modellradius von ca. 44,16 km**. Die interne Beschriftung „Sonde“ und die intuitive Vorstellung einer Raumsonde sind daher irreführend, selbst wenn die Masse relativ zum Stern vernachlässigbar klein ist.

**Empfehlung vor dem Merge:** In Preset, Hinweistext, Dokumentation und Tests den Körper als `Testkörper`/`Kleinkörper` bezeichnen und die künstliche Massenskala erläutern. Alternativ kann ein physikalisch realistisches Raumsondenmodell mit passender Massenskala eingebaut werden; **das wäre für v0.3 unnötige Zusatzkomplexität** und ist hier nicht empfohlen. Die numerischen Anfangsdaten, Integrator, Benchmarks und die Laborgeschwindigkeit sollten unverändert bleiben. Nicht den astrophysikalischen Testkörper als realistische Sonde ausgeben.

Zusätzlich sollte die Geschwindigkeitszunahme weiterhin **ausschließlich auf das benannte Laborsystem und den gemessenen 180-Tage-Endpunkt** bezogen werden. Ein Nettogewinn einer idealisierten Fernbegegnung wurde nicht separat nachgewiesen.

## Weiterhin bekannte Grenzen

- Kollisions-Tunneling bei großen Einzelschritten bleibt ungelöst; Prognose-„Kontakt“ bedeutet erkannte diskrete Überlappung, keine exakte Kontaktzeit.
- Vorhersage hat keine numerisch bewiesene Fehlerschranke und keine garantierte zeitliche Gültigkeit für chaotische Bahnen. Die Linie ist eine einzelne Modellfortsetzung, kein Konfidenzintervall.
- Performance wurde laut Entwicklungsbericht in Node gemessen, nicht auf einem physischen Smartphone. UI braucht einen kurzen realen Touch-/Performance-Test.
- Es wurde kein vollständiger visueller Browser-Regressionstest durch den unabhängigen Prüfer durchgeführt.

## Empfohlene Freigabereihenfolge

1. Bezeichnung/Masseneinordnung der „Sonde“ auf `develop/v0.3` korrigieren; relevante Tests und Benutzerdokumentation angleichen, **ohne** physikalische Formeln oder Parameter zu ändern.
2. Den kompletten Einstieg `node scripts/test.mjs` und die CI nach diesem kleinen Fix erneut laufen lassen.
3. Nutzer prüft v0.3 kurz auf einem echten Smartphone (Auswahl, Bahnvorhersage, Referenzwechsel, Neustart/Zurücksetzen).
4. Erst dann PR #2 nach ausdrücklicher Nutzerfreigabe nach `main` mergen. Kein Deployment ohne gesonderte Zustimmung.

Bewertung: **weitgehend bereit**, mit einer kleinen, fachlich sinnvollen Korrektur vor der Freigabe.
