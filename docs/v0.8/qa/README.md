# v0.8 – gespeicherte Prüfevidenz

Die drei UI-/Lifecycle-JSON-Dateien und die schmale EN-Demoaufnahme stammen aus GitHub Actions Run 42693187935 auf 8b31ae3715edb42449c6e9982482c3068e33f01c, Artefakt 13707379909. Die Performance-JSON-Datei stammt aus dem normalisierten Lauf 42694107657 auf c3e0485516593296b0cc31961ffe3518a5f697e9, Artefakt 13707589220. Header `evidence` ergänzt die Herkunft, Messwerte unverändert übernommen.

`learning-desktop-de.png` ist ein nativer Screenshot aus der privaten interaktiv bedienten gemeinsamen Chrome-Vorschau vom 09.11.2026. Kein Mockup. Der Viewport zeigt den oberen Teil der aufgeklappten Demo; sämtliche sechs Muster sind in der darunter fortgesetzten echten UI erreichbar. Die schmale Aufnahme dokumentiert den nach einem bewussten Markerwechsel gewählten Zustand k=1 (vier passende Muster).

Weitere Screenshots aller getesteten Ansichten sind im CI-Artefakt zugänglich. Die hohe Elementaufnahme der Wärmebilanz zeigte eine Fixed-Layer-Überlagerung des Skip-Links; sie wird nicht als perfekte visuelle Abnahme ausgewählt. Native Desktop-Viewportaufnahme und DOM-Stilprüfung zeigten den ungefokussierten Skip-Link korrekt bei top=-100px außerhalb des Bildes. Dieser Capture-Unterschied ist im Qualitätsbericht dokumentiert.

Einzelne GC-/Heap-Stichproben sind kein allgemeiner Beweis für vollständige Speicherleckfreiheit. Performancevergleiche gelten nur für dokumentierte Szenen/Umgebung. Sie ersetzen weder reale Assistenztechnik noch Mobilhardware oder eine spätere Monsterabnahme.

`v08-performance-repeat.json`: erneuter Lauf 42695465392, Commit23e4084745777cb1953cd783db2e844327cb7360, Artefakt13709022667. Einschließlich höherer gemessener Gravity-Taskmehrarbeit (+11,06 %); keine Auswahl nur des günstigeren Laufs. Beide Rohdatenreihen bleiben erhalten.
