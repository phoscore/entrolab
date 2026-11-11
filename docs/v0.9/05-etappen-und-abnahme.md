# Etappen, Risiken und Abnahme

## Reihenfolge nach Nutzen, Machbarkeit und Risiko

| Etappe | Ergebnis und Abhängigkeit | Nutzen / Wirkung / Risiko | Grobe Arbeitsspanne |
| --- | --- | --- | --- |
| **v0.9 · Orientierung** | Nach Roadmapfreigabe Branch von der dann bestätigten v0.8.5-Basis. Baseline sichern, aktive Marke und Navigation anpassen, Tour-Mount aussetzen, Wissensfunktionen entkoppeln. | Hoch / mittel / mittel. Fragmente, Fokus und Entwürfe sichern. | 3–5 Personentage |
| **v0.9 · Monster- und BH-Proben** | Nach Sichtwahl Derivate/Storyboard und zwei Rendereransätze prototypisch vergleichen. Rechte, Masterhash und Gerätebudgets prüfen. | Mittel / sehr hoch / hoch. Zwei getrennte Proben statt einer globalen Grafikänderung. | 4–7 Personentage |
| **v0.9 · BH und Temperature** | BH-Regler und Legacy-Fallback nach Bildfreigabe. Getrennte Gasrechnung mit A/B, Materialschema und bestehende Wärmebrücke. | Sehr hoch / hoch / hoch. Modellgrenzen und Idle-Verhalten vor Politur. | 7–12 Personentage |
| **v0.9 · Materie, Monster und Design** | Systemmasse-/Bindungsversuche, QCD und Quellenpfad. Nach Bewegungsabnahme Einbindung eines Animationsbesitzers. Kleine Layoutkorrekturen je Labor. | Hoch / hoch / mittel. QCD-Aussagen und Bildschirmelemente separat abnehmen. | 7–11 Personentage |
| **v0.9 · Review** | Vollständige CI, Geräteprobe, physikalischer Review, Bericht. Eigentümer beurteilt Vorschau und entscheidet über Release getrennt. | Hoch / mittel / mittel. | 3–5 Personentage |
| **v0.9.5 · Datenprobe und Freigabe** | Erst nach eigenem Auftrag. Lizenzmatrix, 3–4 typische Quellenrepräsentanten, Epoche/Schema/Tile-Import, Kataloggrößen und Kosten abschätzen. | Hoch / gering / hoch. Detaillierte Speicherung und Releasebedingungen klären. | 5–9 Personentage |
| **v0.9.5 · Kamera, Orbit und Viewer** | Für mehrere reale Systeme dieselbe Abfrage und Navigation. Messdaten und Fallbacks einschließlich Katalog ohne Distanz. | Sehr hoch / sehr hoch / hoch. Numerische Präzision und Zeitbasis. | 9–15 Personentage |
| **v0.9.5 · Große Kataloge und Tiefenansichten** | Datenlastprobe, frustum-/LOD-Logik, Suche/Inspector, Milchstraßen- und Galaxienlayer, cosmo Distanzarten und Abdeckung. | Sehr hoch / sehr hoch / hoch. Streaming, Auswahlbias, Kosten und Rechte. | 12–22 Personentage |
| **v0.9.5 · Qualität und Rollout-Entscheidung** | Release-Pinning, reproduzierbarer Paketbau, Geräte-/Fokus-/Offline-/GPU-Fallbacks, Quellenprüfung, Review und Abnahme. | Hoch / mittel / hoch. | 6–10 Personentage |

Ein Personentag ist eine Aufwandsgröße, kein Kalendertermin. Summen grob **24–40** Personentage v0.9 und **32–56** v0.9.5, ohne Wartezeiten auf Feedback, Rechte und Infrastruktur. Optische Schwarzschild-Stufe 3, WebGPU sowie zusätzliche Collider-/Materialdynamik sind darin nicht als Pflicht eingeplant. Größen und Fristen nach Proben neu schätzen.

## Leistungs- und Ressourcenbudgets

Startwerte für später zu messende Prototypen. Sie sind Budgets, keine bereits gemessenen Werte.

| Profil | v0.9 | v0.9.5 Explorer |
| --- | --- | --- |
| Desktop (1440 px, repräsentativer PC) | Aktive BH-/Gasbühne Ziel 30–60 Bilder/s je Qualität. P95 Frameintervall ≤ 36 ms in der 30-fps-Stufe, separater Ausweis der 60-fps-Stufe. Canvas-DPR adaptiv bis 1,75, Fläche und Anzahl der Layers begrenzen. | WebGL2 bei Vorteil. P95 ≤ 36 ms während Drag/Zoom im Standardprofil, bis ca. 75–150k sichtbare GPU-Punkte als Startkorridor, 50 Beschriftungen. Datenbestand kann viel größer sein. |
| Durchschnittliches Smartphone (390 px, echtes Gerät plus 4× CDP) | Sichtbare Animationsstufe 24–30 fps, P95 ≤ 45 ms im 24-fps-Profil. DPR initial 1–1,25, keine blockierenden Decodes im ersten Laboraufbau. | P95 ≤ 45 ms im Standardprofil, 15–30k sichtbare gebatchte Punkte, ca. 20 Labels, Budget automatisch reduzieren bevor Steuerung stockt. 2D-Fallback verwendet weniger Punkte/Aggregate. |
| Schwach/320 px und Reduced Motion | Still/Low-Profile, Bild und Daten vollständig bedienbar. Statisch bei unverändertem Zustand **0 eigene RAF und 0 Neuzeichnungen**. | 2D-Karte/Orbitbild, Suche, Quellen und manuelle Zeitaktion. Qualitative Dichtekacheln, ca. 2–5k sichtbare Einzelmarker nur bei Bedarf. Keine automatischen Flüge. |
| Transfer und Speicher | Erste Ansicht ohne neue optionale Bildpakete. Monster-Standbild/Animation Startbudget insgesamt ≤ 350 KiB komprimiert, ≤ 8 MiB zusätzliche dekodierte Ebenen. BH/Gas jeweils initial ≤ 1 MiB zusätzlich nach Anwahl. | Nach Aufruf ≤ 1 MiB komprimierter neuer Starttransfer einschließlich kleinem Manifest und Übersicht, Tile-Ziel ≤ 256 KiB komprimiert, typischer begrenzter Kamera-Suchablauf ≤ 10 MiB. Mobil initial ≤ 100 MiB zusätzlich für Daten-/JS-Speicher und ≤ 64 MiB geschätztes GPU-Bufferbudget. Cache-/Kontextlimits explizit. |
| Interaktion und Haltbarkeit | Kein wiederkehrender Long Task > 50 ms aus neuen aktiven Effekten bei normaler Interaktion. Keine neu ausgelöste Scroll-/Resize-Schleife. Bestehende unveränderte Szene gegen gleichen Releasebaum messen. | Such-/Kameraantwort in bereits geladenen Bereichen p95 ≤ 150 ms. Tile-Latenz separat nach Netzprofil; sichtbar weiter bedienbar. Höchstens 4 gleichzeitige Tile-Ladevorgänge mobil, versionsgebundene Cachegrenzen, kein Wachstum bei 100 Wechseln. |

Vergleiche unter gleicher Browser-/Geräteversion, DPR, Bühne, Ansicht, Warm-up, Dauer und Bewegungsmodus. Desktop und 390 px/4× CPU aus der v0.8.5-Messmethode beibehalten; echte Mobilgeräte ergänzen. Mindestens drei Wiederholungen in wechselnder Reihenfolge, P50/P95, Renderaufrufe, TaskDuration, Long Tasks, Speicher und Kalt-/Warm-Transfer dokumentieren. Absolute Werte, Streuung, Stichprobenlänge und relative Deltas gemeinsam angeben. Kein gleicher Renderer-Benchmark für ungleiche Szeneninhalte behaupten. Reine 4×-CPU-Drosselung sagt wenig über mobile GPU, Energie und Thermik. Bei Budgetüberschreitung erst Qualität, Sampling, Shaderauflösung und Effekte begrenzen. Messwerte, Quellen und Bedienelemente bleiben verfügbar.

## Abnahme v0.9

| Gegenstand | Überprüfbare Abnahme |
| --- | --- |
| Bestand | Mindestens gleiche fachliche Abdeckung wie 200 reguläre Prüfungen und 85 Release-Chromium-Fälle. Gezielte Aktualisierung allein der bewusst veränderten UI-Erwartungen, keine gelockerte Physikassertion. Exakte 12 Historienergebnisse und sechs Originalprüfungen. Stabile Formeln und Validierungsgrenzen. Master und freigegebene Ausgangsderivate per Hash schützen. |
| Sprache, Branding, Navigation | Tab- und Seitentitel, Meta, Footer und aktive Brandingtexte für DE/EN prüfen. Alte gültige Fragmente öffnen das richtige Ziel. Schriftfallback 320/390/1440, Zoom/Reflow, keine abgeschnittenen entscheidenden Beschriftungen. Tour-Entrypoint und Tour-Listener in der normalen App ausgesetzt; Glossar und kontextuelle Fragen erreichbar. |
| A/B und Zustandsisolation | Szenarien mit nicht angewandten Entwürfen und laufenden/statischen Simulationen. Vor-/Nachzustand für Physikwerte, RNG und Body-IDs. Gezielte Eingaben nur im betreffenden Versuch. Wärmeübernahme 250/600 und knapp außerhalb in °C/K. Tabs, Back/Escape, Quellen, Ausklappen, Fehlereingaben und Sprache. |
| BH und Extreme Objects | Zwei Modi, Winkeleinstellung, Schemahinweis, Pause und Scheibe aus. Bei Stillstand nach Warm-up 0 Draws/RAF. Ein Renderer bei schnellen Wechseln, kein Catch-up. Alle vier Anzeigen und beide Charts gegen Release-Referenz. Extreme Objects besitzt eigenen Zustand und behält Vergleich. Stufe 3 separat gegen unabhängige GR-Referenzfälle testen oder weglassen. |
| Temperature | Deterministische Verteilung, Wurzelskalierung, feste Einheiten, Projektion vs. Histogramm. Extreme 0 K und 10¹² K zeigen Modellgrenze. Alle vier Reinstoffe, Bänder, Vergleichsfenster, maschinennahe Rundung und keine Wärme-Mutation. |
| Materie | Photonen bei 0°, 90°, 180° für gleiche/ungleiche E, Massenausdruck endlich und positives Vorzeichen; kleine Winkel numerisch stabil, z. B. über `1−cos θ=2sin²(θ/2)`. Kernmassen-Differenz gegen CODATA, unveränderte Quellenmetadaten, keine Prozent-/Higgs-/Yang–Mills-Verwechslung. |
| Monster | Maximal eine sichtbare Figur, keine Überdeckung und keine Layoutsprünge durch Eintritt/Austritt. Mindestens zwei unterscheidbare Sequenzen, Still/Off/Reduced Motion, 100 Mount-/Dispose-/Kontextwechsel ohne Listenerwachstum oder nachträgliche Reaktion. Fiktion klar markiert, Tastaturbedienung von Einstellungen, keine Fokusübernahme. Sichtprüfung des Originals und Gerätemessung. |

Automatisierte Node-/Chromium-Prüfungen um echte Mobilgeräte, Safari/Firefox, Tastatur, Reduced Motion und mindestens einen realen Screenreader-Pfad ergänzen. Kamera-/Pinchfunktionen immer mit Tastatur-/Button-Alternative. Responsive Maßstäbe 320/390 px, Desktop, DPR 1/2 und relevante gebrochene Breiten. Farbenblindheits-/Kontrastprobe, sichtbarer Fokus, keine Hover-Pflicht. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Abnahme v0.9.5

- **Katalogqualität.** Manifest mit gepinnten Releases, IDs, Credits, Umfang und Filter, quantifizierten Lücken/Fehlerklassen. Mindestens 30 nach Quelle und Qualität geschichtete Vergleiche gegen Originaldaten einschließlich fehlender Entfernung, Mehrfachobjekten und unsicherem Crossmatch. Kein Datensatz ohne geklärte Auslieferungsbasis. Keine erfundenen realen Körper oder Positionen.
- **Skalen und Präzision.** Sonnen-/Planetensystem, pc/kpc und Mpc/Gpc, 1/2/5-Raster, Einheitentests, konsistente Distanzart und sichtbare Projektionsgrenzen. Scrollanker und Auswahl bei Ursprung-/LOD-Wechsel. Cosmology-Distanzen gegen unabhängiges Referenzwerkzeug bzw. numerische Integration (z. B. bei z=0,1 / 1 / 3 für dieselben Parameter), getrennte Rückblickzeit und Warnung für geringe z. Katalogfehler werden nicht in Nullentfernungen umgewandelt.
- **Orbits.** Kreis, Ellipse, e→1-Grenzfälle, Peri-/Aphel, Periodizität, Lage des Massenzentrums und Gesamtimpuls im Schwerpunktsystem und Ausfallpfade. Im Sonnensystem publizierte Ephemeriden und Interpolationsgrenzen separat prüfen. Testmatrix für fehlende Knoten/Phase/Epoche, uneindeutige Mehrsternzuordnung und Kompositparameter. Schematische Zeit im UI erkennbar; keine Kalenderposition aus unbekannten Daten.
- **Skalierung.** Repräsentative Tile- und Suchlast bei 100k und 1 Mio. Objekten, 10-Mio.-synthetischer Stresstest unabhängig von den tatsächlich verfügbaren Daten. Unterschied zwischen Gesamtbestand, gefilterter Auswahl und dargestellten Punkten sichtbar. Stress bei rasantem Zoom, langsamem Netz, Cache Miss, Fehler, Offline, Versionswechsel, Verlassen des Atlas, WebGL-Kontextverlust und 100 Lifecycle-Wechseln.
- **Zugänglichkeit.** Gleichwertige Suche, tabellarische Objektwahl, Quellen und Distanzlesbarkeit in Canvas-/GPU-Fallback. Pause und Zeitfortschritt am selben Steuerelement, Reduced Motion und kein erzwungener Kameraflug. Gesten übernehmen weder Dokument-Scroll noch Fokus ohne erkennbare Aktivierung.
- **Abgrenzung.** Explorer wird bei geöffneten Laboren nicht geladen und ändert keine Gravity-Zeit, Körper oder Entwürfe. Bereits vorhandene v0.9-Tests weiterführen. Versionierte neue Tests für Auslieferung, Fehlersuche und Daten-/Inhaltsregression.

## Risiken und Vereinfachungen

| Risiko | Beobachtbarer Auslöser | Vereinfachung im genehmigten Umfang |
| --- | --- | --- |
| Animation kostet zu viel oder weicht vom Original ab | Idle-Work, Long Tasks, schlecht lesbare Kontur oder fehlende Abnahme | Weniger animierte Ebenen oder kurze geprüfte Spritefolge. Ruhestand und Identität erhalten. |
| BH-Bild verwischt Wissenschaft | Nutzer setzt Schatten mit Horizont gleich, erwartet exakten Winkel oder liest Farbe als Hawking-Wert | Modi deutlich trennen und Erklärung direkt am Bild. Künstlerisches 2.5D mit festem Schema behalten; Optikstufe 3 auslassen. |
| Gas-/Stoffmodell führt zu falschen Vorstellungen | Temperatur verhält sich wie Energie, 2D-Pixel werden als 3D-Betrag verstanden | Projektion und Verteilung nebeneinander beschriften, exakte Rechenwerte zeigen, Stoffe über Schemata statt improvisierte Molekulardynamik. |
| QCD wird zu 99-%-Anteilsgrafik | Verwechslung von Gluonenenergie, elementarer und gebundener Masse | Zwei berechnete Interaktionen priorisieren. Prozentgraphik durch Quellenbezug und dynamisches Schema ersetzen. |
| Katalogrechte, Kosten oder Footprint unklar | Kein belastbarer Terms-Nachweis, wenig astrometrische Qualität oder großer Transfer | Geprüften Teilkatalog/Survey austauschen, Tiles und Auswahlregeln erhalten. Nicht auffindbare Felder transparent, vorhandene Quellen per Link. |
| Falsche 3D-Präzision oder Scope wächst | Koordinaten springen, Bahnlücken werden gefüllt, globale Kamera überfordert Mobile | Lokale Frames, explizite Maßstabs-/Projektionsebene, statische Orbits bei fehlender Referenz. Mehr Datensätze über vorhandene Pipeline statt manueller Beispielkatalog. |

## Entscheidungen des Eigentümers

1. **v0.9-Plan und Layout.** Beobachtungsfenster für Bildexperimente, Messstation für dichte Vergleiche oder eine durchgängige Richtung. Sichtbare Tour pausieren wie beschrieben.
2. **Monster.** Name, Regie und sichtbare Frequenz. Empfehlung geriggte Ebenen mit optionaler Sprite-Geste, später Originalvergleich und Bewegungsfreigabe.
3. **BH.** Künstlerisch/physikalisch motiviertes 2.5D als Pflicht. Entscheiden, ob eine getrennte Geodätenprobe später überhaupt Aufwand erhalten soll.
4. **Explorer.** Zur v0.9.5-Freigabe zwischen Atlas, zusätzlichem 3D-Flug und wissenschaftlicher Himmelsansicht gewichten. Dann erst Katalogumfang, Hosting, Datenkosten und Stichproben festlegen.
5. **Release.** Baufreigaben, Bildintegration und Merge/Deployment bleiben getrennte Entscheidungen. PRs privat und im Entwurf, Cloudflare-Skip-Präfix wie im Projektvertrag.

Die visuellen Tafeln gehören zur Roadmapfreigabe. Für v0.9.5 folgen ein eigener Implementierungsplan mit gemessenen Datenpaketen und eine separate Freigabe.
