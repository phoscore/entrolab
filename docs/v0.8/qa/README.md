# v0.8 – gespeicherte Prüfevidenz

Die drei UI-/Lifecycle-JSON-Dateien und die schmale EN-Demoaufnahme stammen aus GitHub Actions Run 42693187935 auf 8b31ae3715edb42449c6e9982482c3068e33f01c, Artefakt 13707379909. Die Performance-JSON-Datei stammt aus dem normalisierten Lauf 42694107657 auf c3e0485516593296b0cc31961ffe3518a5f697e9, Artefakt 13707589220. Header `evidence` ergänzt die Herkunft, Messwerte unverändert übernommen.

`learning-desktop-de.png` ist ein nativer Screenshot aus der privaten interaktiv bedienten gemeinsamen Chrome-Vorschau vom 09.11.2026. Kein Mockup. Der Viewport zeigt den oberen Teil der aufgeklappten Demo; sämtliche sechs Muster sind in der darunter fortgesetzten echten UI erreichbar. Die schmale Aufnahme dokumentiert den nach einem bewussten Markerwechsel gewählten Zustand k=1 (vier passende Muster).

Weitere Screenshots aller getesteten Ansichten sind im CI-Artefakt zugänglich. Die hohe Elementaufnahme der Wärmebilanz zeigte eine Fixed-Layer-Überlagerung des Skip-Links; sie wird nicht als perfekte visuelle Abnahme ausgewählt. Native Desktop-Viewportaufnahme und DOM-Stilprüfung zeigten den ungefokussierten Skip-Link korrekt bei top=-100px außerhalb des Bildes. Dieser Capture-Unterschied ist im Qualitätsbericht dokumentiert.

Einzelne GC-/Heap-Stichproben sind kein allgemeiner Beweis für vollständige Speicherleckfreiheit. Performancevergleiche gelten nur für dokumentierte Szenen/Umgebung. Sie ersetzen weder reale Assistenztechnik noch Mobilhardware oder eine spätere Monsterabnahme.

`v08-performance-repeat.json`: erneuter Lauf 42695465392, Commit23e4084745777cb1953cd783db2e844327cb7360, Artefakt13709022667. Einschließlich höherer gemessener Gravity-Taskmehrarbeit (+11,06 %); keine Auswahl nur des günstigeren Laufs. Beide Rohdatenreihen bleiben erhalten.

## Phase E · 10.11.2026

`v08-creature-measurements.json`, `v08-performance-phase-e.json` sowie die beiden `v08-creature-desktop/mobile.png` stammen aus dem vollständig grünen Lauf [42729560620](https://github.com/phoscore/entrolab/actions/runs/42729560620), Commit `8ebe83fc0b1ef450c6a9dd9e07c09fe4bcf97cf6`, Artefakt `13723619465`. 182 reguläre, 63 Chromium-, zwölf historische und sechs Originalprüfungen bestanden. Die JSON-Messwerte sind unverändert, nur ein Herkunftsheader ergänzt.

`v08-creature-native-en.png` ist der tatsächliche Viewport des interaktiv bedienten gemeinsamen Chrome am 10.11.2026, Englisch, Entropy Lab, Monster „Still“. Kein Mockup. Es wurde kein Produktionsserver geöffnet oder verändert.

Der Phase-E-Performancevergleich verwendet nun 180 Warm-up-Frames und CDP-Timeline-Tracing auf beiden Varianten. Er misst stationäres Rendering nach der ersten Reaktion, nicht den Worst Case des Einblendens, alle offenen Lernpanels oder GPU-Endlatenz. Paint-p95 der Gravity-Stichproben ist höher (Mittel +20,04 % / +0,050 ms), die vorgeschlagene 10-%-Paintgrenze deshalb nicht als bestanden ausgewiesen. Fehlende Paint-/Raster-Ereignisse sind keine Dauer von null. Vollständige Einordnung im Qualitätsbericht; ältere, anders instrumentierte Läufe bleiben erhalten.


## Nachaudit: Energie, öffentliche Vorschau und Paint-Ursachen

`v08-preview-security.json` und `v08-correction-causes.json` stammen aus dem erfolgreichen Evidenzjob im Run 42915407613 auf Commit 5a4040d3df8e11938c5294e830bc9cc7230e347f, Artefakt 13808644421. Rohe Werte unverändert, nur Herkunftsheader ergänzt. Der gesamte Run war wegen eines neuen Browser-Testaufbaus nicht grün; reguläre/12/6 und der separate Evidenzjob bestanden. Details und Grenzen im [Nachbesserungsbericht](../../CodexReview_v0.8_Nachbesserungen.md).

Die Cloudflare-Vorschau war tatsächlich öffentlich lesbar. Dies ist inzwischen vom Eigentümer akzeptiert; es ersetzt keine Freigabe eines neuen Deployments. Lokale Chrome-Aufnahmen und private GitHub-Artefakte bleiben andere Prüfwege. Keine neue Pages-Veröffentlichung im Nachbesserungsauftrag, ausschließlich Commit-Prefix `[CF-Pages-Skip]`.
