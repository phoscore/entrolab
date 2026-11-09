# v0.8 – Wissensfundament und Entropie-Lernansichten

Stand: 09.11.2026. **Prüfstand, keine Releasefreigabe.** [Draft-PR #7](https://github.com/phoscore/entrolab/pull/7), Branch `feature/v0.8-learning-foundation`.

**Phase A sowie B–D sind implementiert und geprüft. Phase E ist ausdrücklich ausstehend:** Die drei Monster-Assets benötigen die verlangte Sichtfreigabe des Nutzers. Bis dahin gibt es keine sichtbare Monsterinstanz in der Anwendung, keinen Creature-Manager und keine Monsteranimation. Dieser Zwischenstand ist deshalb nicht die vollständig abgeschlossene v0.8. Kein Merge, Deployment, Domain-/Repositorywechsel oder aktives öffentliches Rebranding. v0.8.5 / 05–08 bleibt unimplementiert.

## 1. Ausgangspunkt und Schutz

- Produktive v0.7 auf `main`: `8b856086877ea21579cf7d74190ad08155d70c7f`.
- Genehmigte Planungsbasis: `33947cfeccd738512c83d21bab47a696ee57e923` auf `develop/v0.8`.
- Während der Umsetzung wurden auf dem Planungsbranch extern zwei Dokumentationscommits bis `0f477a80cab165fd46581331e93e682fc2731a29` ergänzt: optionaler QCD-/Mass-Gap-Artikel ausschließlich für spätere v0.8.5. Auf dem Featurebranch per regulärem Merge erhalten; weder implementiert noch Planungsbranch überschrieben.
- Original: `archive/v0.1` / `be2502d51a449de3e515faaf72ab5954b1a739d4`. Der fehlende Tag `v0.1` wurde erneut nur geprüft: weiterhin kein passender Tag gefunden. Nicht erstellt oder verändert.
- Audit-Baseline: **159 reguläre Prüfungen, 38 Chromium-Fälle, zwölf historische vollständige Benchmarkresultate, sechs Originalprüfungen.** Alle erhalten.
- `physics.mjs`, `entropy.mjs`, `thermal-physics.mjs`, `thermal-view.mjs`, `app.mjs`, `extreme-data.mjs`, `extreme-render.mjs`, `extreme-ui.mjs`, `prediction.mjs`, `instruments.mjs`, `experiments.mjs`, ursprüngliche Tests, Lockfile und Favicon sind gegenüber der Planungsbasis unverändert. Keine Solver-, Integrator-, Referenz- oder Toleranzänderung. Die bisherige Canvas-CSS in `ux.css` bleibt unverändert.

Der [Umsetzungsvertrag](v0.8/Umsetzungsvertrag_v0.8.md) trennt angewandte Modelle, Rohentwürfe, Präsentation und abbrechbare Arbeit. UI-Hilfen schreiben keine Modellwerte, lösen kein Apply/Reset aus und verbrauchen keine Zufallszahlen. Laufende Modellzeit und vorhandene Sichtbarkeitspausen bleiben regulär; explizite Haupttabnavigation darf die bestehende Bahnvorhersage abbrechen.

## 2. Umsetzung und bewusste Grenzen

### A: Ausschließlich aus dem vorhandenen Master abgeleitete Assets

Der JPEG-Master (1536², 144.400 Byte) bleibt bytegleich. SHA-256: `5dfb6a91195d7c3925cee9ae202332c26476de257b1a2f5b1469da1c08536ab3`. `scripts/prepare-creature-assets.mjs` prüft den Hash vor und nach der deterministischen Ableitung mit ImageMagick 7. Keine generative Neuerfindung, keine Retusche oder erfundene Transparenz.

| Kandidat | Pixel | Byte | Ableitung |
| --- | ---: | ---: | --- |
| Figur | 512 × 512 | 23.636 | Vollständiges Original verkleinert |
| Peek | 256 × 256 | 13.904 | Dokumentierter Ausschnitt |
| Icon | 128 × 128 | 5.114 | Dokumentierter Maskenausschnitt |

Zusammen **42.654 Byte**. Das Original ist opak; der schwarze Hintergrund bleibt auch auf hellen Flächen sichtbar. Keine falsche Freistellungsbehauptung. [Manifest](v0.8/assets/creature-candidates.json), [Originalvergleich](v0.8/assets/comparison-candidates.png), separate lokale Seite `/asset-review.html`. Der unveränderte Original-Review-JPEG wird nur dort geladen, nicht beim Appstart. Varianten bei 16/32/64/128/240 CSS-Pixeln und in echten Chromium-Ansichten geprüft. Die Icon-Lesbarkeit ist Gegenstand der noch offenen Sichtentscheidung.

### B: Gemeinsames Wissensfundament aus 04

`knowledge.mjs` enthält stabile IDs für **28 Begriffe, sechs Modellkapitel, 18 Quellen, sechs Hauptfragen und fünf optionale Anwendungen/Grenzthemen**. `knowledge-text.mjs` liefert **262 DE/EN-Schlüssel** an das bestehende Übersetzungssystem. Kein Framework, zweiter Übersetzer, CMS oder Onlineabruf beim Appstart. Die Begriffsdefinitionen werden im bestehenden Glossar und an 16 Inline-Ankern wiederverwendet; alte statische Definitionen wurden entfernt. Die sieben bisherigen Glossar-IDs bleiben gültig.

Alle Modellkapitel erläutern Annahmen, Methode, Einheiten, Formeln, Darstellung, Grenzen, typische Fehlannahmen und Quellen. Quellen besitzen Aussage-/Abschnittszuordnung und Prüftag. Implementationsdateien sind als Codebeleg getrennt von Fachquellen markiert. Fachlinks führen in den vorhandenen Science-Bereich. Der gemeinsame Guide hat sichere bekannte Fragmentziele, Rücksprung, Escape, direkte Navigation und einen begrenzten verschachtelten Glossar-Rückweg.

Abweichung von der früheren weichen Begrenzung auf 12–18 Begriffe: 28 decken die verbindlichen Pflichtbegriffe und sechs Kontexte ab. Alle bleiben freiwillig aufklappbar; keine neue offene Lexikonwand auf den Laborseiten. Der Umfang wurde gegenüber einer allgemeinen Wissens-App eng begrenzt.

### C: Sechs freiwillige Fragen und Prognosen aus 02

Eine standardmäßig geschlossene Hauptfrage direkt unter dem zugehörigen Titel für Gravity, BH-Rechner, Extreme Objects, Temperature, Marker und Wärme. Die vorhandenen fünf Haupttabs bleiben erhalten. Objekt- und Temperaturabschnitt besitzen je einen eigenen Kontext; kein Kontextwechsel durch Scrollen.

Jede Frage enthält kurze Beobachtung/Ursache/Nutzen/Grenze, einen weiteren freiwillig geschlossenen Prognoseversuch mit 2–3 Antworten, Lösung, reale Handlungsanleitung und Modelllink. Auswahl, Prüfen, Auflösung und Sprachwechsel verändern keine Physik. „Steuerelement finden“ öffnet nötige Eingabe-Details und fokussiert das Originalcontrol; weder dessen Wert noch Apply werden ausgelöst. Erwartete Ergebnisse erscheinen erst nach freiwilliger Auflösung, nicht als behauptete Messung des gerade gewählten Zustands.

### D: Bestehende Entropiemodelle verständlicher darstellen

- **Unabhängige N=4-Demo:** vier eigene Boolean-Marker A–D, selbst umschaltbar; 16 mögliche Zuordnungen vollständig, für festes k höchstens sechs Muster. Vorhandene reine Kombinatorik wird wiederverwendet. Kein Zugriff auf Live-Marker, Live-N/k, deren RNG oder Modellschritte. Fokus bleibt beim verschobenen Markerbutton.
- **Makrovergleich:** zwei exakte Multiplizitäten mit Gleichgewichtswahrscheinlichkeiten und ln Ω. Optionale orange Markierung im vorhandenen Diagramm und in der Tabelle erscheint nur bei geöffnetem Vergleich. Die tatsächliche k-Markierung und `aria-current` bleiben unverändert. N=1 wird nicht fälschlich als stärker ausgeglichen behandelt. Kein Enumerieren von 2³² Mustern.
- **Wärmebilanz:** liest ausschließlich den angewandten analytischen Zustand. Energiebalken zeigen C_i T_i relativ zur anfänglichen Gesamtenergie, Transfers −Q/+Q. Separate, signierte Entropiebalken zeigen ΔS_A, ΔS_B und die stabil berechnete Summe in J/K; σ bleibt W/K. Positive/negative Achse klar markiert, kein künstlicher Minimalbalken. Bei null Änderungen sind alle entsprechenden Balken null. Diagrammskalierung verändert nur die Anzeige.
- Vier Alltagsvertiefungen zu Tee, Thermoskanne, Kühlschrank und Wärmekraftmaschine. Ein weiterer vorsichtiger Advanced-Abschnitt zu Struktur, Zeit und Kosmologie ist nur ein Quellen-/Grenzhinweis. Keine neuen Material-, Maschinen- oder Kosmologierechner.
- Keine zusätzliche laufende Animation: zwei eng gefilterte MutationObserver und vorhandener Sprachcallback; keine neuen RAF-/Timeout-/Intervall-Schleifen. Mount/Dispose idempotent und kontrolliert.

## 3. Wissenschaftliche Aussagen und Referenzwerte

Beide Entropiemodelle bleiben getrennt. Die Markerdemo zählt ein definiertes diskretes Gleichgewichtsensemble, keine realen Gaspositionen, Energien oder Diffusionszeiten. `ln Ω = S_Modell/k_B` ist dimensionslos. Das Wärmeexperiment liefert ΔS in J/K. Es gibt keine gemeinsame Skala und keinen numerischen Transfer zwischen ihnen.

| Referenz | Tatsächlich geprüftes Ergebnis |
| --- | --- |
| N=4, k=0…4 | Ω = 1, 4, 6, 4, 1; zusammen 16 unterschiedliche Muster |
| N=4, k=2 | Ω=6, P_eq=6/16=37,5 %, ln Ω=1,791759469228055 |
| N=12, k=6 gegenüber k=12 | 924 gegenüber 1; P_eq(k=6)=924/4096=22,55859375 %, keine Mehrheit aller Fälle |
| N=1 | Beide Zuordnungen gleich häufig, je 1/2 |
| N=32, k=16 | Ω=601.080.390 exakt; insgesamt 4.294.967.296 Muster |
| N=32, k=32 | P_eq=2⁻³²; keine Auslöschung auf null |
| Wärme: 350/290 K, C_A=C_B=1000 J/K, G_th=10 W/K, t=10 s | Q=5438,077407660545 J; T_A=344,56192259233944 K, T_B=295,43807740766056 K |
| Derselbe Wärmezustand | U=640000 J, U−U₀=0 J; ΔS_A=−15,659333905425246 J/K, ΔS_B=18,578339986631367 J/K; stabile Summe 2,9190060812061196 J/K; σ=0,2370560030181005 W/K |
| Gleiche Anfangstemperaturen | Nettoleistung, weitere Entropieproduktion und Änderungen null |
| BH-Frage, Masse ×2 | Schwarzschild-Radius exakt ×2 im unveränderten Rechner |

Neue Node-Referenzen vergleichen Q zusätzlich mit der unabhängig ausgeschriebenen analytischen Exponentialform. Bilanzprojektionen werden für umgekehrte Richtung, ungleiche Kapazitäten, gleiche Temperaturen, Randparameter und Zeiten von 0 bis 10¹² s gegen das bestehende angewandte Ergebnis geprüft. Das ist keine zusätzliche reale Materialvalidierung.

Wichtige Grenzen bleiben sichtbar: q=1/4 pro Markerschritt; stationäres Histogramm ist nicht die nächste Schrittverteilung (von k=N ist deren Erwartung 0,75 N); endliche Fluktuationen dürfen ln Ω verkleinern. Im Wärmeexperiment bleiben T=250–600 K, konstante C/G_th, Isolation und fehlende Arbeit/Phasenwechsel/Strahlung unverändert. U=C T hat einen gewählten Modellnullpunkt, keine universelle absolute Materialenergie. Keine Exergie oder maximal entnehmbare Arbeit berechnet. Kühlschrank/Wärmekraftmaschine werden erklärt, nicht simuliert.

Newton/Softening/Kollisionen bleiben unverändert, einschließlich der bekannten übersehenen Streifkontakte. BH-Leistung und Lebensdauer sind Modellschätzungen, keine direkte Hawking-Messung; reale Akkretion, Greybody-Faktoren und Quanten-Endphase fehlen. Sternbilder bleiben illustrative Ansichten festgelegter Beispiele, keine Zustandsgleichung. Keine angeblich wissenschaftliche Herleitung metaphysischer Aussagen.

## 4. Tatsächlich ausgeführte Prüfungen

### Reguläre und historische Prüfungen

| Prüfung | Ergebnis | Umgebung / Nachweis |
| --- | --- | --- |
| Unveränderte Baseline vor Implementierung | 159 reguläre bestanden | Lokal; Basis-CI [42638764065](https://github.com/phoscore/entrolab/actions/runs/42638764065) grün |
| Finale reguläre Suite | **176 bestanden = 10 Selbstchecks + 166 Node-Fälle** | Lokal Node 24.22.1; außerdem echter Node-22-CI-Lauf [42693187935](https://github.com/phoscore/entrolab/actions/runs/42693187935) auf `8b31ae3715edb42449c6e9982482c3068e33f01c` |
| Echte Chromium-Suite | **55 bestanden = 38 bisherige + 17 neue** | Chromium 151.0.7922.34; derselbe grüne CI-Lauf; [Artefakt](https://github.com/phoscore/entrolab/actions/runs/42693187935/artifacts/13707379909) |
| Historische Benchmarks | **12/12 exakt unverändert** | CI berechnet genehmigte Basis `39fde20f…` und Kandidat unter derselben Laufzeit; vollständige Ergebnisobjekte, Quellen und JSON-Referenz exakt verglichen |
| Originalintegrität | **6/6 bestanden** | Tatsächlicher CI-Checkout mit Originalhistorie, keine Gleichsetzung mit Existenz des fehlenden Tags |
| Separater lesender Codex-Review | **176 reguläre erneut bestanden**, drei korrigierte P2-Fälle nachgeprüft | Kontrollierte Node-DOM-Reproduktionen und Code-/Dateivergleich; keine eigene Chromium-/historische Git-Prüfung durch den Review-Agenten |

Neue reguläre Fälle: 3 Asset-/Mastertests, 6 Wissens-/Quellen-/Kernintegritätstests, 2 Frage-/Referenztests, 6 unabhängige Demo-/Vergleich-/Bilanztests. Alle in `scripts/test.mjs` registriert. Die 17 neuen Chromium-Fälle verteilen sich auf 7 Wissen/Fokus/Assets, 4 Fragen/Zustand/Vorhersage und 6 Entropie/Bilanz/Lifecycle. Keine alte Assertion entfernt oder gelockert.

**Ausführungsgrenzen offen:** Lokal wurde der echte Chromium-Prozess versucht, aber vom Laufzeitbetriebssystem vor Seitenstart mit `socket() failed: Operation not permitted` beendet. Deshalb keine erfundene lokale Playwright-Erfolgsmeldung; automatisierte Browsernachweise stammen aus GitHub Actions. Zusätzlich wurde der vorhandene gemeinsame Chrome interaktiv bedient und visuell kontrolliert. Die beiden historischen Git-Skripte können im lokalen quellenbasierten Arbeitsverzeichnis ohne Git-Objektdaten nicht laufen; dort tatsächlich versucht und am fehlenden Git-Repository gescheitert. Die 12/6-Erfolgsaussagen beruhen ausdrücklich auf CI mit vollständiger Historie.

### UI, Accessibility und Zustandsschutz

Tatsächlich mit Chromium geprüft: 320/390 CSS px, fractional iframe 320,5 px (Chromium rundet `innerWidth` auf 321), DPR 1/2/1,25, Systemschrift-Fallback, DE/EN, Reduced Motion, Native-Details, Radios, Escape und Rücksprung. Keine horizontale Dokumentüberbreite in diesen Fällen; sichtbares Fokusziel. Neue Lernkomponenten haben im Reduced-Motion-Fall null laufende Animationen.

Pausierte Gravity-/Marker-/Wärmezustände und RNG-Zähler werden vor/nach Hilfe, Quiz, Demo, Vergleich und Sprache exakt verglichen. Rohentwurf `42.7500`, Wärmeentwurf `399.2500`, offene Details und Antwortauswahl bleiben erhalten. Vorhersage wird durch Inlinefragen nicht verworfen; explizite Science-Hauptnavigation behält den bisherigen Abbruch. Calculatorwerte bleiben bei Präsentationsaktionen erhalten. Neue Bilanz ignoriert noch nicht angewandte Wärmeentwürfe.

Fokusfälle umfassen alte Labor→Glossar-Rückwege, kalte `#guide-horizon`-/`#model-thermal`-Links, Browser vor/zurück, unbekannte Fragmente, direkte Tabnavigation sowie globales Glossar→Advanced→Modell→Rückweg/Escape→ursprünglicher Laborbutton. Die Hauptnavigation und der bisherige Fokusmodus bleiben erhalten.

Interaktive Handkontrolle im gemeinsamen Chrome: Desktop in DE/EN, 320-px-iframe mit echten nativen Scrollbars, Markerwechsel inklusive Fokusbewegung, Begriffs-/Quellenrückwege und Wärmebilanz nach zehn Modellsekunden. Rechenwerte, Vorzeichen und das Fehlen einer irreführenden Entropie-Heizleistungsanzeige visuell kontrolliert. [Desktop DE](v0.8/qa/learning-desktop-de.png), [schmale EN-Demo](v0.8/qa/v08-demo-320.png). Die automatisierte hohe Elementaufnahme der Wärmebilanz enthält gelegentlich eine Skip-Link-Layerüberlagerung; beim nativen Desktop-Viewport war der nicht fokussierte Skip-Link korrekt außerhalb des Bildes (top −100 px). Nicht als perfekte Screenshotabnahme ausgeben; rohe CI-Aufnahmen bleiben zugänglich.

Keine reale NVDA-/VoiceOver-/TalkBack-Ausführung, kein Safari/Firefox, kein echtes Smartphone oder physisch gedrosseltes Mobilgerät. Screenreader-Namen/Fokus wurden über die tatsächliche Accessibility-Struktur und Chromium geprüft, kein Anspruch auf vollständige Assistenztechnikabnahme. Nativer Browserzoom ist kein eigenständiger nachgewiesener Test; schmale Ansichten ersetzen ihn nicht.

## 5. Lifecycle und Performance

[Wissensmesswerte](v0.8/qa/v08-knowledge-measurements.json), [Lernmesswerte](v0.8/qa/v08-learning-measurements.json), [Fragen/Mobil](v0.8/qa/v08-questions-measurements.json) aus dem oben genannten grünen Lauf sind als JSON gesichert.

| 100 Mount-/Dispose-Zyklen, jeweils mit tatsächlichem Chromium-CDP-GC | Vorher | Nachher |
| --- | ---: | ---: |
| Wissen/Guide: DOM-Knoten | 4742 | 4742 |
| Wissen/Guide: native JS-Listener | 247 | 247 |
| Wissen/Guide: used JS heap (Byte) | 2124776 | 2333664 |
| Fragen/Demo: DOM-Knoten | 4746 | 4746 |
| Fragen/Demo: native JS-Listener | 260 | 260 |
| Fragen/Demo: used JS heap (Byte) | 2828484 | 3003564 |

Keine zusätzlichen behaltenen DOM-Knoten/Listener in diesen Stichproben. Heapänderungen werden nicht als null ausgegeben: JIT-/Engine-/Layout-Caches und Messvarianz sind nicht vollständig getrennt. Ein bounded GC-Sample beweist keine universelle Speicherleckfreiheit. Controller sind idempotent; Entsorgen meldet null eigene Subscriptions/Observer/Timer. Neue Lernmodule besitzen keine eigenen Timer oder RAF-Schleifen.

Die sieben neuen Wissens-/Lernmodule inklusive CSS umfassen zusammen 118929 UTF-8-Byte. Keine zusätzliche Laufzeitabhängigkeit; Playwright bleibt die vorhandene gepinnte Entwicklungsabhängigkeit. Assets werden von der App noch nicht geladen.

### Vergleich mit identischer Zeichenfläche

Tatsächlich ausgeführt auf Commit `c3e0485516593296b0cc31961ffe3518a5f697e9`: [grüner normalisierter CI-Lauf 42694107657](https://github.com/phoscore/entrolab/actions/runs/42694107657), [Artefakt](https://github.com/phoscore/entrolab/actions/runs/42694107657/artifacts/13707589220), [vollständige Rohmesswerte](v0.8/qa/v08-performance.json). Auch die 55 Browserfälle und 176 regulären/12 historischen/6 Originalprüfungen sind auf diesem Stand grün.

`measure-v08-browser.mjs` rekonstruiert die feste Planungsbasis per `git archive`. Gleicher GitHub-Runner, Chromium 151.0.7922.34, 1360×1000 CSS px, DPR 1, DE, Systemschrift-Fallback, keine reduzierte Bewegung; je Variante frischer Context und 60 Warm-up-Frames. Zwei Szenen, zwei Wiederholungen, Reihenfolge der Varianten im zweiten Paar umgekehrt: insgesamt **acht 30-Sekunden-Stichproben**. Beobachter messen RAF-Abstände, echte Long Tasks und CDP-Main-Thread-Zeit. Keine Verbesserung von Physikrechenzeit behauptet.

Im ersten nativen Layoutvergleich vergrößerten die neuen Seitenhilfen die Gravity-Zeichenfläche von etwa 704,4×715,9 auf 704,4×769,9 px. Das ist kein Endloswachstum, aber keine identische Renderarbeit. Für den obigen Vergleich setzt ausschließlich die Messfixture auf beiden Versionen 704×600 px, mit zentrierter Scrollposition. Die eigentliche App/CSS bleibt unangetastet. Extreme Objects bleibt auf beiden bei 938,4×520 px. Die Rohdaten protokollieren jede tatsächliche Geometrie.

| Szene (Mittel aus zwei Stichproben) | Basis Main-Thread-Taskzeit / 30 s | v0.8 / 30 s | Änderung | p95 Frameintervall, Basis / v0.8 |
| --- | ---: | ---: | ---: | --- |
| Gravity pausiert, sichtbare Zeichenfläche | 3,496549 s | 3,6456595 s | **+4,26 %** | 16,7 / 16,7–16,8 ms |
| Vorhandene BH-Animation sichtbar | 6,931176 s | 7,0461185 s | **+1,66 %** | 16,8 / 16,7 ms |

Alle acht Stichproben: 1801 gemessene Frameintervalle in etwa 30,016 s (rund 60 Hz), **null beobachtete Long Tasks über 50 ms**, keine Seitenfehler. Taskzeit ist gemessene Main-Thread-Arbeit, nicht gleichbedeutend mit CPU-Gesamtauslastung oder ausschließlich App-JavaScript. Die App ist hier etwas aufwendiger, nicht schneller. Zwei Stichproben erlauben keine belastbare universelle Prozent-/10-%-Garantie; beide Szenen liegen in diesem Lauf unter 10 % Mehrarbeit. Offene Lernpanels, reale Mobilhardware und eine nach Sichtfreigabe integrierte Monsteranimation brauchen ihre eigene Abnahme.


### Erneute Gegenprobe am Dokumentationsstand

Nach der ersten Tabelle wurde derselbe unveränderte Laufzeitcode auf `23e4084745777cb1953cd783db2e844327cb7360` erneut gemessen: [Run 42695465392](https://github.com/phoscore/entrolab/actions/runs/42695465392), [Rohdaten der Gegenprobe](v0.8/qa/v08-performance-repeat.json), [Artefakt](https://github.com/phoscore/entrolab/actions/runs/42695465392/artifacts/13709022667). Auch 176/55/12/6 vollständig grün.

| Erneute acht 30-s-Stichproben | Basis Taskzeit / 30 s | Kandidat / 30 s | Änderung | Frame-p95 Basis / Kandidat |
| --- | ---: | ---: | ---: | --- |
| Gravity pausiert | 3,3035655 s | 3,6688725 s | **+11,06 %** | 16,7 / 16,7 ms |
| Vorhandene BH-Animation | 6,834299 s | 6,916494 s | **+1,20 %** | 16,7–16,8 / 16,7 ms |

Auch hier keine beobachteten Long Tasks >50 ms. Die Frameintervalle sind stabil, die CPU-/Taskzeitdifferenz schwankt und liegt für Gravity in dieser Gegenprobe über 10 %. **Das wird nicht als Messfehler wegdefiniert oder durch den günstigeren früheren Lauf ersetzt.** Größere DOM-/Layoutarbeit ist als Ursache möglich; Runner- und Engineeffekte sind nicht hinreichend getrennt. Keine universelle CPU-Mehrarbeitsgarantie und keine nachgewiesene numerische Beschleunigung.

A13 schlägt ein Budget für vergleichbare p95-Zeiten vor, nicht pauschal für kumulierte CPU-Taskzeit. Hier sind Frame-p95 und kumulierte CDP-Arbeit gemessen; eine isolierte Paint-Dauerverteilung wurde **nicht** aufgezeichnet. Deshalb keine vollständige Paint-Budgetabnahme behaupten. Vor endgültiger Freigabe, besonders nach Phase E, bleiben längere Messreihen und gezieltes Paint-/Layoutprofil sinnvoll. Eine Änderung des geschützten bisherigen Idle-Renderers wurde für diesen Inhaltsauftrag bewusst nicht als Nebenprojekt begonnen.

## 6. Gefundene und behobene Probleme

1. **BigInt als gerundete exakte Anzahl (P2):** Die neue Vergleichsansicht verwendete zunächst sechs signifikante Stellen auch für Ω und zeigte bei N=32 601.080.000 statt 601.080.390. Getrennte Ganzzahlformatierung ohne signifikante Rundung für BigInt; DE/EN exakt. Tatsächliche Chromium-Assertion prüft den vollständigen N=32-Text.
2. **Kalter Fachlink ohne Escape-Rückweg (P2):** Guide brauchte zuvor eine gespeicherte Herkunft, die beim Direktaufruf fehlte. Sichtbaren logischen Tab als Fallback mit zugehörigem Fragment setzen; Return und Escape sind möglich. Kontrolliert im separaten Review reproduziert und echte Chromium-Regression ergänzt.
3. **Globales Glossar→Modell verlor die sichtbare Herkunft (P2):** Das Schließen des vorherigen Hilfekontexts verbarg den Quellenlink, der als Rücksprung gespeichert war. Ein einziger begrenzter suspendierter Glossarkontext stellt notwendige Details und die ursprüngliche Laborherkunft wieder her. Kein allgemeiner Router oder unbegrenzter Stack. Direkte Navigation verwirft diesen Kontext. Return, Escape und anschließendes Escape separat getestet/nachgeprüft.
4. **Schmaler Kartenüberlauf:** Neue Inlinehilfen erhöhten min-content-Breiten im alten Metrikraster. Ausschließlich neue additive CSS begrenzt die betroffenen Karten/Spans mit `min-width:0` und Umbruch. Kein Ändern der Canvas-CSS. Chromium-Gegenprobe wieder grün.
5. **Vergleichsmarkierung bei geschlossenem Ausklapper:** Nur bei geöffnetem optionalem Vergleich anzeigen, mit aufräumbarem Toggle-Listener. Modell und echter k-Pfeil bleiben unverändert.

Fehlgeschlagene Zwischenläufe werden nicht verschwiegen: `c706c8c…` hatte zwei falsche neue Test-Textannahmen und den beschriebenen Mobilüberlauf. `5e97c0a…`/`6a1ea26…` hatten einen Vergleich von DOM-Stringnull mit IEEE−0 im neuen Bilanztest. Nullvorzeichen ist in dieser numerischen Beschriftung bedeutungslos; ausschließlich der neue Test normalisiert +0/−0 beim Lesen. Alle Nichtnullwerte werden weiterhin exakt verglichen. Keine Physiktoleranz wurde dafür gelockert. Frühere Originaltests blieben grün.

Der separate lesende Review hat Korrekturen erneut mit dem tatsächlichen Guide in kontrolliertem Node-DOM verifiziert, alle bisherigen 29 Testdateien und geschützten Module gegen die lokale Basis verglichen und die volle reguläre Suite erneut ausgeführt. Danach keine offenen blockierenden Befunde gemeldet. Das ist ein unabhängiger Agenten-Codecheck, keine formale GitHub-Fremdfreigabe, Fachzertifizierung oder Ersatz für die erneute Nutzerprüfung.

## 7. Alle 14 Auditbefunde

| Audit | Behandlung / Abnahme im Umfang v0.8 |
| --- | --- |
| A01 Zustand | Vier Ebenen schriftlich geklärt; genaue Zustands-/Entwurfs-/RNG- und Vorhersage-Browserprüfungen. Reguläre Sichtbarkeitspausen bleiben. |
| A02 Wissensabhängigkeit | Gemeinsames 04-Fundament vor 02/03; bestehende i18n/Guide statt zweiter Datenbank. |
| A03 Kontexte | Sechs definierte fachliche Kontexte in fünf vorhandenen Hauptbereichen, keine Scrollnavigation. |
| A04 N=4 | Eigene Präsentationsmarker, exakte begrenzte Enumeration, keine Live-Zustandsänderung; Node und Chromium. |
| A05 Stoffdaten | Vollständig spätere v0.8.5; keine unvalidierten Materialphasen implementiert. |
| A06 Temperatur/Energie | Qualitativ korrekte Frage; keine T-Verdopplung als universelle Energieverdopplung. Kein neuer Rechner. |
| A07 Tastaturplatzierung | Bekannte bestehende Canvas-Platzierungsgrenze dokumentiert, keine neue Touraufgabe. Nicht stillschweigend am Gravity-Modell geändert; ein künftiger Fix benötigt einen eigenen begrenzten Accessibility-Commit. |
| A08 Fachlinks | Bekannte sichere IDs, alte Ziele erhalten, kalte Links/History/verschachtelte Rückwege mit Fokusregression. |
| A09 Monster | Mastergetreue Varianten und Vorschau vorhanden. **Sichtfreigabe und Phase E noch offen**; noch keine Animation-/Instanzabnahme behauptet. |
| A10 BH-Rendering | Schritte 06/v0.8.5 unimplementiert; bestehender Renderer, Animation und Zahlen bytegleich. |
| A11 Kollisionen | Endpunkt-/Streifkontaktgrenze weiter ausdrücklich erklärt; kein CCD-/Integratorumbau und keine garantierte Prognose. |
| A12 Originaltag | Nur erneut geprüft, fehlend dokumentiert, Archiv/Original/Referenzen unangetastet. |
| A13 Rendering/Ansagen | Ereignisbasierte eigene Anzeige ohne neue Loop; eigene Liveansage nur zur Demo, nicht zu jeder laufenden Wärmerechnung. Lifecycle/CDP und vergleichende Messung. Bestehendes Idle-RAF nicht als Nebenprojekt umgebaut. |
| A14 Regeln | AGENTS/Umsetzungsvertrag/01–04/Roadmap und Start-README aktualisiert. Spätere Planung bewusst unimplementiert, Audit als historischer Befund unverändert. |

## 8. Quellen und Prüflücken

Die kanonische Zuordnung steht in `dist/knowledge.mjs`, Texte im bestehenden DE/EN-System. Fachliche Primär-/Institutionsquellen wurden am 09.11.2026 geöffnet und abgeglichen: OpenStax (Newton/Orbits, Entropie, thermodynamische Anwendungen), Stanford (statistische Beschreibung/Thermodynamik), NIST (Kelvin/SI), JPL (AU), NASA (BH-Anatomie/Sterntypen), AEI/Einstein Online und JILA (Hawking), universitäre Schwarzschild-Orbitunterlagen, NICER-Forschungsbeleg für Sternradien sowie SEP für Grenzen statistischer Zeitpfeilargumente. Diese belegen allgemeine Aussagen; sie zertifizieren nicht diese App.

- [Statistische Beschreibung, Stanford](https://web.stanford.edu/~peastman/statmech/statisticaldescription.html)
- [Thermodynamik, Stanford](https://web.stanford.edu/~peastman/statmech/thermodynamics.html)
- [Entropie, OpenStax](https://openstax.org/books/university-physics-volume-2/pages/4-6-entropy)
- [Maschinen/Kühlschrank, OpenStax](https://openstax.org/books/physics/pages/12-4-applications-of-thermodynamics-heat-engines-heat-pumps-and-refrigerators)
- [SI-Einheiten, NIST](https://www.nist.gov/pml/special-publication-330/sp-330-section-2)
- [BH-Anatomie, NASA](https://science.nasa.gov/universe/black-holes/anatomy/)
- [Hawking-Temperatur, AEI](https://www.einstein-online.info/en/explandict/hawking-temperature/)
- [Hawkingmodell, JILA](https://jila.colorado.edu/~ajsh/courses/bh/hawk.html)
- [Statistische Mechanik und ihre Grenzen, SEP](https://plato.stanford.edu/entries/statphys-statmech/)

Weiter offen: ausdrückliche visuelle Assetabnahme und anschließende Phase E; erneuter unabhängiger Gesamt-PR-Review nach deren Integration; reale Assistenztechnik, native Zoom-/Safari-/Touchhardwareprüfungen und längerfristiges Speicherprofil. Keine behauptete didaktische Nutzerstudie, keine Garantie für 16-px-Maskenerkennbarkeit ohne Nutzer-Sichtprüfung. Titel/Favicon/Domain bleiben gesonderte Release-/Brandingentscheidungen.

## 9. Reproduzieren und Freigabe

Vollständigen privaten Klon des Featurebranchs verwenden. Die App selbst braucht keine Paketinstallation:

```sh
git clone --branch feature/v0.8-learning-foundation https://github.com/phoscore/entrolab.git
cd entrolab
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

`http://localhost:8000` für die App, `/asset-review.html` für den Originalvergleich. Auf Windows ggf. `py`. Keine `file://`-Ausführung von Modulen/Workern.

```sh
node scripts/test.mjs
node scripts/check-benchmarks.mjs
node scripts/verify-original.mjs
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install --with-deps chromium
npm run test:browser
node scripts/measure-v08-browser.mjs
```

Die CI führt dieselben relevanten Einträge aus und bewahrt Screenshots/JSON als Artefakt. Ein späterer reiner Dokumentationscommit wird ebenfalls geprüft; der konkrete abschließende Commit-/CI-Link wird im PR vermerkt, damit keine sich selbst referenzierende Commit-ID in diesem Dokument nötig ist.

**Nächster zwingender Schritt:** Nutzer bestätigt die gezeigten Monster-Kandidaten oder benennt eine konkrete visuelle Änderung. Erst danach Phase E implementieren/testen. PR bleibt bis dahin Draft. Es besteht weiterhin keinerlei Erlaubnis für Merge, Produktion oder v0.8.5.
