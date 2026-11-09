# Verbindlicher Umsetzungsvertrag v0.8

Stand: 09.11.2026. Umsetzung von 01–04 ausdrücklich durch Nutzer beauftragt; ausgehend von `33947cfeccd738512c83d21bab47a696ee57e923`, isoliert auf `feature/v0.8-learning-foundation`. `develop/v0.8` bleibt der geprüfte Planungsstand. `main` bleibt `8b856086877ea21579cf7d74190ad08155d70c7f`; Archiv unverändert.

## Schutz und Baseline

159 reguläre Prüfungen (10 Selbstchecks + 149 Node-Fälle), 38 echte Chromium-Fälle, zwölf vollständige historische Benchmarkresultate und sechs Originaldateien bleiben erhalten. Lokal wurde die unveränderte reguläre Suite vor Implementierung erneut ausgeführt: 159 bestanden. Gepinnte Basis-CI: https://github.com/phoscore/entrolab/actions/runs/42638764065, grün. Originaltag `v0.1` bleibt am 09.11.2026 nicht auffindbar; keine Erstellung/Änderung erlaubt.

Keine neuen Solver, Änderungen an `physics.mjs`, `entropy.mjs`, `thermal-physics.mjs`, Integratoren, Modelltoleranzen oder historischen Referenzen. Keine Arbeiten an 05–08 außer notwendiger Planpräzisierung. Kein Merge, Deployment, Domainwechsel, Repository-Rename oder aktives öffentliches Rebranding. Bestehender Browsertitel/Favicon bleiben auch im laufenden Entwicklungsexemplar zunächst erhalten; Asset-/Markenvorschauen sind getrennt.

## A01: Vier getrennte Zustandsebenen

| Ebene | Beispiele | Vertrag für neue Präsentation |
| --- | --- | --- |
| Angewandtes Physikmodell | Körper, Masse, Position, Geschwindigkeit, Modellzeit, Markerzustand/-schritte, Wärmeparameter/-zeit/-resultat | Hilfe, Antworten, Demo und Dekoration schreiben niemals hinein; keine Apply/Reset/Start/RNG-Aufrufe. |
| Eingabeentwurf | Noch nicht übernommene Werte, Rohtext, sichtbarer Fehler, native Validität, Fokus/Selektion | Sprache/Erklärungen ersetzen keine Formulare und verwerfen keinen Rohtext. Explizites Anwenden bleibt am Originalcontrol. Eingaben, die bisher beim Ändern wirksam werden, behalten dieses Verhalten. |
| Präsentation | Offene Details, aktuelle Frage/Antwort, N=4-Beispiel, Tabellenmarkierung, aktive Ansicht, Kamera | Eigener begrenzter Zustand; Sprache erhält offene Details/Antwortauswahl. Labwechsel über vorhandene Navigation, keine scrollgesteuerte Navigation. |
| Abbrechbare Arbeit und Scheduler | Vorhersagegeneration, laufender Vorhersagejob, RAF/Timeout, Sichtbarkeitsstatus | Bisherige Abbrüche und Pausen bleiben: Haupttabwechsel verwirft Vorhersage; Offscreen/Hidden pausiert vorhandene Schleifen. Keine neue automatische Wiederaufnahme außerhalb bestehender Regeln. |

Pausierte Modelle vor/nach Präsentationsaktionen exakt vergleichen. Laufende Modelle bei gleicher Modellzeit oder mit kontrolliertem Scheduler vergleichen; normaler Zeitfortschritt ist keine Mutation durch Hilfe. Nach explizitem Science-Tab-/Quellenwechsel darf der bestehende Vorhersageabbruch erfolgen; bloße Inlinehilfe verändert Vorhersage nicht. Kein neuer Vorhersagecache und keine globale Scheduler-Neuentwicklung.

## A02: Ein Wissensfundament

Eine kleine statische Registry mit stabilen fachlichen IDs, Quellen-IDs und **Schlüsseln des bestehenden DE/EN-Systems**. Einträge werden für Schnellhilfe, vertiefte Erklärung und bestehendes Science-/Glossarsystem wiederverwendet. Keine zweite Sprachumschaltung, kein CMS, keine Online-Datenabfrage beim Appstart. Dynamische Inhalte ausschließlich kontrolliert/textuell rendern.

Bestehende Glossar-IDs/`data-explain` bleiben kompatibel. Neue Trigger kontrolliert einmal initialisieren oder delegieren. Sichtbarer Rücksprung zum tatsächlichen Ursprung; beim Labwechsel Herkunft schließen, Fokus auf gewähltem Tab belassen. Neue direkte Fachlinks müssen verborgene Eltern öffnen und besitzen dieselbe ID in DE/EN. Unbekannte Fragmente bleiben harmlos.

## A03: Sechs Kontexte, fünf bestehende Hauptbereiche

| Kontext-ID | Vorhandener Ort | Frage/Prognose |
| --- | --- | --- |
| `gravity` | Gravity Sandbox | Je eine geschlossene Hauptfrage, darin eine weitere geschlossene Prognose. |
| `blackhole` | Black Hole Lab | Ebenso; Schwarzschild-/Hawkinggrenzen bewahren. |
| `objects` | Extreme Objects, bestehender Objektabschnitt | Eigene Frage direkt unter dessen Überschrift. |
| `temperature` | Extreme Objects, bestehender Temperature-Abschnitt | Eigene Frage direkt unter dessen Überschrift; keine neuen Temperaturfunktionen. |
| `markers` | Entropy, aktives Marker-Unterexperiment | Eigene Frage, nur im Marker-Unterexperiment sichtbar. |
| `thermal` | Entropy, aktives Wärme-Unterexperiment | Eigene Frage, nur im Wärme-Unterexperiment sichtbar. |

Science bleibt Referenz ohne Quiz. Objects und Temperature dürfen gleichzeitig sichtbar sein: jeder bestehende Abschnitt besitzt genau eine zugehörige Frage. Kein Austausch von Frage/Antwort durch Scrollen. Höchstens eine Monsterinstanz insgesamt, auch wenn beide Abschnitte sichtbar sind. Auflösung und Verweis auf echte Controls wenden niemals Werte an.

## A04: Unabhängige Vierer-Demo

Die neue optionale Demo besitzt genau vier unterscheidbare Boolean-Marker A–D und eigenen Präsentationszustand. Sie ist ausdrücklich als **separates N=4-Beispiel** bezeichnet. Marker umschalten zählt deren eigenes k und Ω; maximal sechs passende Anordnungen darstellen. Kein Zugriff auf Live-N/k, dessen Array, RNG oder Schrittzahl. Vorhandene reine Kombinatorik wiederverwenden. Ein Live-Histogrammvergleich markiert Werte, ohne sie anzuwenden. N=1/32 und Fluktuationen korrekt beschreiben.

Die Wärmebilanz liest ausschließlich vorhandene Resultate. Energie in J, ΔS in J/K, σ in W/K; Vorzeichen von A/B bleiben erhalten. Kein Addieren von Marker-`ln Ω` und Wärme-ΔS, keine absolute Materialenergie oder berechnete Exergie behaupten.

## Weitere Auditpunkte und Scope

| Befund | Behandlung in v0.8 |
| --- | --- |
| A05 Stoffdaten | Schritt 07 bleibt unimplementiert; keine Phasen-/Materialklassifikation vorziehen. Datenpräzisionsentscheidung später. |
| A06 Quiz/Temperaturverhältnis | In 02 nur die freigegebene qualitative Temperatur-vs.-Energiefrage; kein Verdopplung-von-T-Fehlschluss, kein neuer Verhältnisrechner. |
| A07 Tastaturplatzierung | Bestehende Grenze zunächst dokumentiert. Falls korrigiert: eigener kleiner Accessibility-Commit, keine Änderung an Kraft/Schritt/Kollision. Keine neue Touraufgabe. |
| A08 Deep-Links | Bestehendes Hilfesystem um beschränkten sicheren Fach-ID-Pfad erweitern; kein Router-/Navigationsumbau. |
| A09 Monster | Ausschließlich Master-Ableitungen; alte violette/komplexe Anatomieforderungen entfallen. Sichtfreigabe steht aus. `aus` verbirgt und bricht Effekte ab; `ruhig`/Reduced Motion statisch; dezente Bewegung nur sichtbar und nach Freigabe. |
| A10 Neue BH-Ansichten | Vollständig Schritt 06/v0.8.5, hier keine neuen Ansichten/Renderer. Bestehende Darstellung, Zustände und Label-Redraws bewahren. |
| A11 Endpunktkollision | Als numerische Grenze klar dokumentieren, weder CCD noch Integrator ändern; keine garantierte Kontakt-/Kollisionsprognose versprechen. |
| A12 Originaltag | Nur prüfen und dokumentieren; `archive/v0.1` und sechs Originaldateien schützen. |
| A13 Rendering/Ansagen | Neue Präsentation benötigt keine laufende Rechenschleife. Datenanzeige eventbasiert; zusätzliche Liveansagen nur bei Nutzeraktion, nicht jeder Animation. Bestehendes Idle-Verhalten nicht nebenbei umbauen. |
| A14 Veraltete Regeln | AGENTS und 01–04/Roadmap präzisiert; bestehender Audit als historischer Befund unverändert. Pflichtbegriffe haben Vorrang vor einer starren 18er-Grenze. |

## Gates und Nachweise

1. Vorbereitungscommit → Assetvarianten/Manifest/Originalvergleich → **ausdrückliche Sichtfreigabe vor breiter Integration**.
2. Während diese fehlt: Wissensfundament, sechs Erklär-/Prognosekontexte, N=4-Demo und Wärmebilanz unabhängig fertigstellen/testen.
3. Neues Verhalten mit Node **und** echtem Chromium prüfen; Testdateien im tatsächlichen Einstieg registrieren. 320/390/fractional/DPR, DE/EN, Fokus, Entwürfe, Reduced Motion, Lifecycle und Grenzen separat nachweisen.
4. Neue Komponenten wiederholt initialisieren/entsorgen, DOM-/Listener-/Timerzahlen kontrollieren und Speicherstichproben dokumentieren; keine vollständige Leakfreiheit aus einer einzelnen Stichprobe behaupten. Performancevergleich mit gleichen Szenen/Runnern, Messmethodik und offenen Handtestlücken.
5. Thematische Commits, Qualitätsbericht, private lokale Vorschau und PR nach main. Separater lesender Codex-Review soweit verfügbar. Kein Selbst-Approve, kein Merge/Deployment.

Die Sichtfreigabe ist aktuell offen. Ohne sie endet ein Zwischenstand ausdrücklich mit „Phase E ausstehend“, statt v0.8 fälschlich als vollständig abgeschlossen zu melden.
