# ENTROLAB v0.3 — Entwicklungsauftrag und Abnahmekriterien

Status: verbindliche Planung auf `develop/v0.3`, auf Basis des geprüften und gemergten `main`-Stands `af526999d15f477a288326b116e1d559a9a6bfb2`. Noch keine Implementierung. `main`, `archive/v0.1`, `develop/v0.2` und bestehende Website bleiben unverändert.

## Ziel

Kontrollierte Erweiterung der 2D-Newtonschen Gravitationssandbox um (A) sinnvoll vorbereitete Szenarien, (B) nachvollziehbare Messinstrumente und (C) eine **begrenzte numerische Bahnvorhersage**. v0.3 soll die vorhandenen wissenschaftlichen Grenzen klar kennzeichnen. Kein neuer Integrator und kein Ersatz der v0.2-Testbasis, sofern kein zwingender, nachweisbarer Grund entsteht.

## A. Neue Szenarien

Mindestens zwei, idealerweise drei reproduzierbare und in sich konsistente Presets:
1. **Dreikörper-Wechselwirkung**: drei Körper mit nachvollziehbaren Positionen/Geschwindigkeiten, empfindliche Dynamik statt vorgetäuschter Zufälligkeit. Keine pauschale Behauptung einer stabilen Bahn.
2. **Gravitationsschleuder**: vorbeifliegender sehr leichter Probekörper und ein bewegter massereicher Körper; die beobachtete Geschwindigkeitsänderung muss im gewählten Bezugssystem physikalisch sinnvoll sein. Benutze die bestehende paarweise Gravitation und dokumentiere Massenskalen und Näherungen.
3. Optional, nur wenn ohne Abstriche testbar: **Vorbeiflug eines kompakten massereichen Körpers** (z. B. Schwarzes Loch als Newtonsche Punktmasse, mit deutlichem Warnhinweis, dass keine Relativität, Gezeitenzerreißung oder realistische Akkretion simuliert wird).

Nutze die bestehenden Datenstrukturen und den Integrator. Keine fest einprogrammierten Bahnen, keine reine Animationsillusion. Anfangsbedingungen und Bedeutung der Szenarien dokumentieren. Vorhandene Presets und Reset-Funktionen erhalten.

## B. Messinstrumente

Im Inspector oder in einem kompakten, optional aufklappbaren Diagnosebereich:
- Auswahl eines Körpers; seine momentane Geschwindigkeit (km/s) und sein Abstand zu einem **klar benannten Referenzkörper** (km/AU), bei fehlendem Referenzkörper kein erfundener Zahlenwert;
- Gesamtenergie des Systems im **internen Modell** mit erläuterten Einheiten und relative Drift seit definierter Baseline;
- Gesamtimpuls und Gesamtdrehimpuls oder jeweils eine sinnvolle Abweichungsanzeige, mit Erklärung ihrer Grenzen und korrekter Normierung bei nahe null liegendem Ausgangswert;
- momentaner Integrations-Zeitschritt (simulierte Zeit, kein Anspruch auf realen Zeitschritt) und simulierter Zeitstand;
- automatische, verständliche Hinweise bei Kollisionen, manuellen Änderungen, Reset, Softening und situationsabhängigen numerischen Fehlern.

Die Anzeigen dürfen nicht so beschriftet werden, als seien die Ergebnisse exakte reale Naturbeobachtungen. Werte bei Kollisionen oder manuellen Änderungen müssen korrekt neu referenziert, zurückgesetzt oder ausdrücklich als nicht vergleichbar markiert werden. Keine überladene mobile Oberfläche.

## C. Bahnvorhersage (eng begrenzt)

- Für zunächst **einen ausgewählten Körper** eine deutlich unterscheidbare, gestrichelte zukünftige Bahn in der 2D-Canvas anzeigen, mit Ein/Aus-Schalter und 1–3 sinnvollen Prognosehorizonten.
- Vorhersage wird durch das gleiche physikalische Modell auf einer **separaten Kopie des aktuellen Zustands** berechnet, nicht über eine erfundene Ellipse. Andere Körper müssen bei der Prognose ebenfalls dynamisch mitberechnet werden.
- Prognose **darf niemals** den laufenden Simulationszustand, die Zeit, den ausgewählten Körper, Trails, Identitäten, Kollisionenzähler oder die Original-Diagnostik verändern. Kein unkontrolliertes Erzeugen globaler IDs bei der Kopie.
- Rechenbudget begrenzen (Schritt-/Zeit-/Körperzahl). UI responsiv halten, besonders auf Smartphones; Prognose cachen/drosseln oder asynchron in kleinen Arbeitsportionen ausführen, falls nötig. Kein Vollberechnungs-Loop bei jedem Animation-Frame.
- Bei nicht auflösbaren Kollisionen, numerischen Grenzfällen, ungültigen Werten oder überschrittenem Budget Prognose sauber abbrechen bzw. verkürzen und Grund anzeigen. Bekanntes Collision-Tunneling nicht als behoben darstellen.
- Prognosekennzeichnung: „numerische Modellvorhersage bei unveränderten Anfangsbedingungen“, keine Vorhersage realer Ereignisse; bei chaotischen Systemen Hinweis auf starke Empfindlichkeit und begrenzten Aussagewert. Keine Scheingenauigkeit / unbewiesenen Konfidenzintervalle.

## Qualität und Abnahme

1. Bestehende CI `node scripts/test.mjs`, Originalintegrität und **alle 35 vorhandenen Prüfungen** müssen erhalten bleiben und erfolgreich sein.
2. Neue Tests: deterministische Preset-Startwerte, finite Werte und erklärbare Größenordnungen, keine ungewollten unmittelbaren Kollisionen; korrekte Einheiten und Referenzwahl; Invarianten-/Baseline-Verhalten nach Reset/Kollision/Bearbeitung.
3. Neue Tests zur Vorhersage: Ergebnis reproduzierbar, keine Zustandsmutation (inkl. `trail`, IDs, Zeit, Zähler), erstes Prognoseintervall konsistent mit regulärem Integrator, korrekte Begrenzung/Abbruch bei Budget/NaN/Kollision.
4. Tests für Rückwärtskompatibilität (Sonnensystem, Doppelstern, BH-Preset; Black-Hole-Labor unverändert funktional).
5. Mindestens Desktop und kleiner mobiler Viewport exemplarisch prüfen, Touchziele und Performance kritisch bewerten. Wenn ein wirklicher Gerätetest nicht möglich ist, ausdrücklich sagen.
6. Auf `develop/v0.3` die Dokumentation `docs/Qualitaetsupdate_v0.3.md` ergänzen mit Testbefunden, Modellen, Leistungsgrenzen, bekannten Fehlern und ggf. UI-Screenshots.
7. Vor und nach Änderungen Tests ausführen; echten ausgeführten Tests und Aussagen ohne Ausführung klar trennen.
8. Änderungen in mehreren logischen Commits speichern und **Pull Request nach `main` eröffnen, nicht mergen**. CI muss grün sein. Kein Deployment, kein GitHub Pages, keine Änderung der Repository-Sichtbarkeit.

## Nicht Teil von v0.3

3D, relativistische Bahndynamik, exakte Ereignishorizontphysik, neue Sci-Fi-Naturgesetze, Multiplayer, Server/Backend, Benutzerkonten, Speicherung über Geräte hinweg, genereller Austausch des Integrators, vollständige kontinuierliche Kollisionserkennung, umfangreiche Design-Neufassung.

## Arbeitsregel

Lies `AGENTS.md`, `docs/Qualitaetsupdate_v0.2.md`, `docs/Reviewabschluss_v0.2.md` und vorhandene Tests. Wenn diese Planungsdatei mit alten v0.2-spezifischen Aussagen in `AGENTS.md` kollidiert, aktualisiere die branchlokalen Agentenanweisungen **nur für den aktuellen v0.3-Auftrag**, ohne Schutzregeln zu lockern. Kleiner, überprüfbarer Umfang hat Vorrang vor bloßer Featurezahl.
