# Technischer Audit vor v0.8 / v0.8.5

**Projekt:** ENTROLAB → geplanter Produktname „Reincarnated as a Proton“  
**Datum:** 09.11.2026 · **Auftrag:** ausschließlich Analyse, Tests und Audit-Dokumentation  
**Untersuchter Planungsstand:** `d43f2a2d864011794fc95a1d75b56167f39921ca` auf `develop/v0.8`  
**Produktionsbasis:** `8b856086877ea21579cf7d74190ad08155d70c7f` auf `main` (freigegebene v0.7)

## 1. Urteil und Reichweite

Die vorhandenen Rechenkerne und die begrenzte Vanilla-JavaScript-Architektur eignen sich grundsätzlich für beide geplanten Releases. Ein Wechsel des Integrators, ein neues Framework, WebGL als Voraussetzung oder ein zentraler Ersatz aller Simulationszustände ist dafür nicht erforderlich. Die größte Gefahr liegt in der Integration: Hilfe, Navigation, Sprachwechsel und Dekoration dürfen keine zusätzlichen Schreibwege in die Modelle einführen.

**Kein P0-Befund nachgewiesen. Vor einer vollständigen Implementierung müssen mehrere P1-Voraussetzungen geklärt werden:** Zustands- und Navigationsverträge, die Zugehörigkeit der Erklärungen zu gleichzeitig sichtbaren Unterbereichen, die neue Markerinteraktion und die wissenschaftliche Datengrundlage des Material Explorers. Außerdem besteht bereits eine Tastaturbarriere beim Platzieren neuer Sandboxkörper. Die grünen Tests sind eine belastbare Ausgangsbasis, aber keine vollständige Accessibility- oder Physikzertifizierung.

Die Roadmap ist **mit den unten genannten Auflagen umsetzbar**. Dieses Urteil ist keine Baufreigabe. Die in der Roadmap getrennten Freigaben für Umsetzung, Merge und Veröffentlichung bleiben bestehen. Insbesondere darf v0.8.5 erst auf der unabhängig geprüften und ausdrücklich freigegebenen v0.8 beginnen.

### Prioritäten dieses Audits

| Stufe | Bedeutung |
| --- | --- |
| P0 | Akuter schwerer Fehler, Verlust geschützter Originaldaten oder grundlegende wissenschaftliche Unbrauchbarkeit. Hier nicht nachgewiesen. |
| P1 | Vor dem betroffenen Umsetzungsschritt zu entscheiden/beheben; andernfalls hohes Risiko wissenschaftlich falscher Aussagen, unbedienbarer Funktionen oder Zustandsregressionen. |
| P2 | Begrenzter bestehender Mangel, Dokumentationskonflikt oder gezielt abzusicherndes Integrations-/Qualitätsrisiko. |

**Nicht verwechseln:** „P0“ in den acht Produktplänen bedeutet häufig „MUSS-Funktion“. Die zwei BH-Ansichten, der optionale Winkelregler und der Material Explorer bleiben verbindlicher Produktumfang; ihre Planpriorität ist keine Aussage über einen akuten Fehler.

## 2. Vorgehen, unveränderte Basis und Belege

Vollständig gelesen wurden `AGENTS.md`, die Roadmap und alle acht Dokumente `01`–`08`. Hinzu kamen die einschlägigen Qualitäts- und Reviewberichte v0.2–v0.7, CI, Integritätsskripte, numerische Referenzen sowie die relevanten Rechen-, Darstellungs-, Sprach-, Hilfe- und Testmodule. Wesentliche Quellstellen sind unten jeweils mit Dateiname und Zeile bezeichnet. Zeilen beziehen sich auf den genannten Planungsstand; einige bestehende Module enthalten sehr lange Einzelzeilen.

Der GitHub-Vergleich `main` → ursprünglicher Planungs-HEAD enthält ausschließlich die neun Planungsdateien und das Master-JPEG. Die produktiven Dateien entsprechen der freigegebenen v0.7. Eine lokal zunächst vorhandene ältere v0.7-Kopie wurde **vor den maßgeblichen Messungen** gegen den gepinnten Planungscommit abgeglichen und aktualisiert. Ältere Zwischenmessungen zählen hier nicht als Ergebnis.

Im Audit wurden ausschließlich folgende zusätzliche Prüfmittel angelegt:

- `.github/workflows/audit-v0.8.yml`: separater CI-Lauf mit `contents: read`, ohne Deployment und ohne Schreibzugriff im Job.
- `audit/browser-audit.mjs`: tatsächliche Chromium-Messungen, Screenshots, Prüfung der unveränderten Masterdatei.
- `audit/model-probes.mjs`: deterministische zusätzliche Rechenproben und ein Kollisions-Grenzfall.
- Dieser Bericht und maschinenlesbare Messergebnisse unter `audit/`.

**Keine Änderung an `dist/`, den bestehenden Tests, den acht Plänen, `AGENTS.md`, Benchmarks oder Originaldateien.** Es wurden keine optimierten Produktionsassets erzeugt. Die Assetgrößen-Vorschau skaliert ausschließlich das bestehende JPEG im Prüf-Browser.

Die Zusatzprüfungen liefen in privaten GitHub Actions, da der lokale Chromium-Prozess bereits beim Start an `socket() failed: Operation not permitted` scheiterte. Der lokale Fehlstart ist **kein bestandener Browsertest**. Der zusätzliche Workflow ermöglicht zugleich die binäre Sichtprüfung des Masters; die verwendete Repository-Schnittstelle liefert selbst nur UTF-8-Dateien.

### Tatsächlich ausgeführte Prüfungen

| Prüfung | Umgebung und Ergebnis | Aussagegrenze |
| --- | --- | --- |
| `node scripts/test.mjs` | Lokal Node `v24.22.1`: **159 reguläre Prüfungen bestanden** = 10 Selbstchecks + 149 Node-Testfälle; zusätzlich Syntaxprüfungen. In CI ebenfalls bestanden. | Nicht 159 voneinander unabhängige wissenschaftliche Referenzen. |
| Bestehende Chromium-Suite | GitHub Actions, Node `v22.23.4`: **38/38 bestanden**. | Aktuelle Basis, nicht die älteren 29/36/37 Fälle aus früheren Berichten. Enthält auch ausdrücklich bezeichnete historische Reproduktions-Fixtures. |
| `node scripts/check-benchmarks.mjs` | CI: **12/12 vollständige historische Ergebnisse exakt gleich**, Vergleich mit `39fde20f812da1d371b4990b15062062cddd102f`. | Sechs Newton-Szenarien × adaptiv/fest; keine Referenz für jede neue Darstellung. |
| `node scripts/benchmark.mjs` | Lokal erneut ausgeführt; Ausgabe bytegleich `docs/numerics-v0.2.json`, SHA-256 `743a9773953b40848fb8596e15df1a60ab8ef507222b62400cb23c32c23f307a`. | Die historische Genauigkeit wird bewahrt, nicht verbessert. |
| `node scripts/verify-original.mjs` | CI: **6/6 Originaldateien bestanden**. | Prüft den dokumentierten Originalcommit, nicht das Vorhandensein des Tags; siehe A12. |
| Zusätzliche Wärmeproben | **20.000** deterministische Parameter-/Zeitkombinationen, unabhängige geschlossene Vergleichsauswertung; lokal und zusätzlich in CI ausgeführt. | Stichprobe im bestehenden zulässigen Bereich, kein Beweis für alle IEEE-754-Werte. Keine 20.000 zusätzlichen regulären Testfälle behauptet. |
| BH- und Markerproben | Sieben BH-Massen, Skalengesetze; exakte Marker-Kombinatorik; reproduzierbarer Streifkontakt. | Algebraische Selbstkonsistenz ist keine experimentelle Bestätigung von Hawking-Strahlung. |
| Zusatz-Chromium-Audit | Chromium **151.0.7922.34**: fünf Bereiche bei Desktop und vier mobilen Viewports; Navigation, Tastatur, Lifecycle, Reduced Motion, Originalasset. | Kein Safari/Firefox, kein reales Handy und kein echter Screenreader. |

Erste vollständige CI-Belege: [reguläre Suite](https://github.com/phoscore/entrolab/actions/runs/42634969524). Präzisierter Messlauf: [Audit-Evidenz](https://github.com/phoscore/entrolab/actions/runs/42636513623), [unveränderte reguläre Suite](https://github.com/phoscore/entrolab/actions/runs/42636513747), jeweils auf `c38bf782b93d5870152efe4905f69e2e17ce25d0`. Der abschließende Prüflauf und die JSON-Belege sind im Abschlussabschnitt verzeichnet.

## 3. Priorisierte Befunde

### A01 · P1 · Zustandsbewahrung ist noch nicht hinreichend definiert

**Beleg:** `04-wissenssystem-modelle-quellen.md:104,116`, `05-erste-schritte-3.0.md:100`, `06-black-hole-visualisierung.md:108`; `dist/app.mjs:24,56`, `dist/entropy-ui.mjs`, `dist/thermal-ui.mjs`.

Die Pläne verlangen teilweise unveränderte komplette `inspect()`-Ergebnisse und Modellzeiten beim Öffnen von Hilfe, Sprachwechsel oder Navigation. Bei laufender Simulation ändern sich Zeit und Resultate legitim. Sichtbarkeitswechsel stoppen vorhandene Scheduler absichtlich. Außerdem verwirft bereits die bestehende Hauptnavigation eine berechnete Bahnvorhersage.

**Reproduziert:** Vorhersage aktivieren und fertig rechnen lassen → Science → Gravity. `forecast` wechselt von vorhanden auf `null`; Körper bleiben identisch, die Vorhersagegeneration steigt. Nach 100 weiteren Tabwechseln bleiben pausierte Körper, Markerzustand und Wärmeparameter/-zeit unverändert; der Generationszähler steigt weiter. Das ist keine nachgewiesene Mutation des Physikmodells, widerspricht aber einer wörtlichen Komplettvergleichs-Abnahme.

**Empfehlung:** Vor Schritt 04 vier Zustandsarten festlegen: (1) angewandtes Modell mit Modellzeit, (2) nicht angewandte Formulare samt Fehlern/Fokus, (3) Präsentations-/Hilfestatus, (4) abgeleitete, abbrechbare Rechenarbeit wie Vorhersage. Bestehendes Sichtbarkeitspausieren erhalten. Hilfen dürfen weder Reset/Apply noch RNG-Aufrufe auslösen. Entscheidung ausdrücklich festhalten, ob fertig berechnete Vorhersagen beim Quellenbesuch künftig erhalten bleiben sollen; diese Änderung wäre ein eigener eng begrenzter Auftrag.

**Abnahme:** Pausiert: exakte physikalische Snapshots vor/nach Hilfe, Sprache und Tour. Laufend: gleiche Modellzeit vergleichen oder die Zeit-/Schedulerereignisse kontrollieren; keine zusätzliche Zustandsänderung durch Hilfe. Entwürfe und native `validationMessage` getrennt prüfen. Erwartete Abbrüche und Pausen explizit testen, nicht aus Snapshots entfernen, bis alles grün wird.

### A02 · P1 · Gemeinsame Wissensgrundlage muss vor breiter Inhaltsintegration stehen

**Beleg:** `02-warum-wozu-was-passiert.md:170` und Ziele aus 03/04; `dist/guide.mjs:14–21`, `dist/i18n.mjs`, `tests/i18n.test.mjs:14`.

02 und 03 benötigen Begriff-IDs, Quellenzuordnung, DE/EN, Rückwege und wiederverwendbare Erklärungen aus 04. Eine starre Reihenfolge 01 → 02 → 03 → 04 würde dieselben Inhalte leicht zweimal modellieren. `initGuide()` bindet die zu diesem Zeitpunkt vorhandenen `[data-explain]`-Elemente genau einmal. Später dynamisch erzeugte Trigger werden dadurch nicht automatisch bedienbar. Ein erneutes globales Initialisieren kann dagegen Listener vervielfachen.

**Empfehlung:** Nach der separat abgenommenen Assetvorbereitung einen **kleinen technischen Unterbau aus 04** vorziehen: stabile fachliche IDs, Quellen-IDs, bestehende Übersetzungsschlüssel, wiederverwendbare Inline-Erklärung und klarer Öffnen-/Schließen-/Fokuspfad. Statische Inhalte bevorzugen. Bei dynamischen Triggern entweder ein delegierter Listener oder kontrolliertes einmaliges Mount/Unmount; keine zweite Glossar-App und kein generisches CMS.

**Abnahme:** Alle Referenzen auflösbar; DE/EN rekursiv einschließlich Quizantworten/Fehlern/ARIA vollständig; drei nacheinander geöffnete Begriffe, Escape, native `details`-Schließung und Tabwechsel ohne verwaiste Ursprungsreferenz. 100 Wiederholungen ohne zusätzliche Listener/Timer. Bestehende Quellen- und Hilfepfade bleiben nutzbar.

### A03 · P1 · „Ein aktiver Kontext“ ist für Extreme Objects/Temperature mehrdeutig

**Beleg:** `README.md:38`, `02-warum-wozu-was-passiert.md` (sechs Kontexte); `dist/index.html`, `dist/extreme-ui.mjs:8–13`.

Extreme Objects und Extreme Temperature liegen heute im **gleichen Hauptbereich** und können gleichzeitig sichtbar sein. Sie sind keine zwei exklusiv aktivierten Haupttabs. Ein globaler einzelner Fragen-/Monsterkontext kann deshalb nicht einfach aus `[data-tab].active` abgeleitet werden.

**Empfehlung / offene Entscheidung:** Je bestehendem Unterabschnitt genau eine zugehörige geschlossene Hauptfrage zulassen, auch wenn beide Abschnitte sichtbar sind; weiterhin nur **ein** Monster insgesamt. Alternativ müsste eine andere eindeutige Kontextwahl ausdrücklich beschlossen werden. Kein neuer Haupttab und keine automatische, fokusverändernde Umschaltung beim Scrollen als stiller Work-Entscheid.

**Abnahme:** Zuordnung von sechs fachlichen Kontexten zu fünf Hauptbereichen schriftlich festlegen. Desktop mit beiden Extreme-Abschnitten im Viewport und Mobile mit Scrollen prüfen. Kein verschwundener Fokus, keine ausgetauschte Antwort während des Lesens, keine zweite Figur.

### A04 · P1 · Die neue interaktive Mikro-/Makrozustandsansicht braucht einen Zustandsvertrag

**Beleg:** `03-entropie-verstehen.md:34–41,108–110`; `dist/entropy.mjs`, `dist/entropy-ui.mjs`.

Das bestehende Modell hat ein echtes N und einen aktuellen Boolean-Zustand. Der Plan verlangt klickbare Marker und bis zu sechs Beispielanordnungen, legt aber noch nicht eindeutig fest, ob die neue Viereransicht eine getrennte Demonstration oder eine manuelle Änderung des laufenden N-Markermodells ist. Ein Hilfeklick darf nicht heimlich N=12 auf N=4 setzen, neu mischen oder einen echten Zustand durch ein Beispiel ersetzen.

**Empfehlung:** Als kleinste Lösung eine ausdrücklich „N=4-Beispiel“-Ansicht mit eigenem begrenztem Präsentationszustand; echte N/k-Anzeige daneben unverändert. Falls Eingriffe in das laufende Modell gewünscht sind, sie als explizite Modellaktion spezifizieren und testen. Alle sechs N=4/k=2-Anordnungen sind einfach vollständig darstellbar; für N=32 niemals alle `2^N` Konfigurationen erzeugen.

**Abnahme:** Geöffnete Demo, sechs Wechsel, Sprachwechsel und Schließen lassen echten Markerzustand, Schrittzahl, playing und RNG-Verbrauch unverändert. Nur eine ausdrücklich bezeichnete Modellaktion darf diese Werte verändern. N=1/32, k=0/N und kleine Fluktuationen prüfen.

### A05 · P1 · Material Explorer: Datenpräzision und wissenschaftliche Gültigkeitsfenster fehlen noch

**Beleg:** `07-extreme-temperature-kontext.md:37–85,136–157`; Primär-/Institutionsquellen in Abschnitt 10.

Der geplante Vier-Stoff-Vergleich ist mit statischen Referenzdaten umsetzbar. Ein Normal-Schmelz-/Siedepunkt allein legitimiert jedoch keine Stoffvorhersage von 0 bis `10^12 K`. Reinstoff, Referenzdruck, Temperaturbereich, Zersetzung/Dissoziation und Datenrundung sind unterschiedliche Voraussetzungen. Insbesondere ist eine universelle scharfe „Ethanol zerfällt ab X K“-Grenze ohne weitere Bedingungen nicht aus der Siedepunkttabelle ableitbar.

**Konkreter Datenkonflikt:** Der Plan nennt für Ethanol ungefähr 351,5 K / 78,3 °C. Die verlinkte PDG-Seite zeigt 351,4 K und 78,29 °C, selbst unterschiedlich gerundet. RSC nennt für Al 933,473 K / 660,323 °C und 2792 K / 2519 °C; für Fe 1811 K / 1538 °C und 3134 K / 2861 °C. Ein hartes `T === threshold` mit getrennt gespeicherten K- und °C-Werten würde scheinpräzise oder widersprüchliche Phasen anzeigen.

**Empfehlung:** Pro Stoff eine kanonische Kelvin-Referenz mit Quelle, Referenzdruck `101325 Pa`, Anzeigerundung und ausdrücklich dokumentiertem Vergleichsfenster. Celsius daraus berechnen. Übergänge als nominelle Tabellenwerte mit endlicher Darstellungsschärfe kennzeichnen. Daten-/Rundungsband und reine Gleitkommatoleranz getrennt halten. Außerhalb des begründeten Fensters „keine verlässliche Aussage dieses Vergleichs“, ohne die aktive Labortemperatur zu verändern. An Übergängen Koexistenz/Übergangsbereich, aber keine aus T allein berechneten Phasenanteile oder latente Wärme versprechen.

**Abnahme:** Quellenfreigabe für alle acht Übergangswerte; Tests knapp unter/am/über dem definierten Band in K/°C; Druckhinweis immer beim Ergebnis; keine Stoffklassifikation bei unzulässigen/extremen Werten; 0 K, `10^12 K`, leere/ungültige Eingabe und Sprachwechsel. Keine Änderungen am Wärmeausgleichsmodell und keine automatische Temperaturübernahme.

### A06 · P1 · Temperaturquiz und Größenverhältnisse benötigen präzisere Mathematik

**Beleg:** `07-extreme-temperature-kontext.md:29–30` und Abnahmekriterien; `dist/extreme-ui.mjs:15,20–30`, `dist/extreme-data.mjs:2–6`.

„Bei gleicher Wärmekapazität Temperatur verdoppeln → doppelte Energieänderung“ ist ohne Bezugstemperatur falsch beziehungsweise unbestimmt: Im festen-C-Modell gilt `ΔU=C·ΔT`. Beispielsweise sind von 250 K aus 300 K und 600 K zwei zulässige Ziele mit `ΔT=50 K` und `350 K`; das Verhältnis beträgt **7**, nicht 2. Eine willkürliche Energienullpunktwahl darf nicht als allgemeines Materialgesetz erscheinen. Die alternativ vorgeschlagene qualitative See-/Plasmafrage ist fachlich besser und benötigt keinen neuen Rechner.

Auch zwei **positive endliche** Kelvinwerte garantieren keinen endlichen Quotienten: `1e12 / Number.MIN_VALUE === Infinity`. Direkte sehr kleine positive Eingaben sind im bestehenden Temperaturlabor zulässig. Bei 0 K ist ein Verhältnis ohnehin nicht definiert.

**Empfehlung:** Qualitative Hauptfrage verwenden oder ausdrücklich eine Verdopplung **derselben Temperaturänderung** bei gleichem C und Bezug beschreiben. Verhältnisse nur in Kelvin, Differenzen in K; für extrem große Quotienten logarithmische/wissenschaftliche Darstellung mit begrenzter Mantisse und großem Exponenten. Kein Clamping des Originals, keine Celsiusquotienten. Unterhalb der numerischen Auflösung der Celsiusdarstellung auf diese Auflösung hinweisen, nicht aus dem gerundeten Celsiusfeld wieder in Kelvin zurückrechnen.

**Abnahme:** Unabhängige Gegenbeispiele 250→300/600 K; 300/600 K, 0, `0.001`, `1e-300`, `Number.MIN_VALUE`, `1e12`, ungültige Texte. Kein sichtbares `Infinity`/`NaN`, keine stille Eingabeänderung und kein Freischalten der 250–600-K-Brücke durch großzügige Toleranzen.

### A07 · P1 · Neue Körper lassen sich bisher nicht vollständig per Tastatur platzieren

**Beleg:** `dist/app.mjs:45–54`; `dist/index.html` (`#universe`, `.adding-options`, `#add`). Bestehende Körper können über `#objectList` ausgewählt und im Formular bearbeitet werden; diese vorhandene Alternative wurde berücksichtigt.

Neue Körper entstehen dagegen ausschließlich in `canvas.onpointerup`. Das Canvas hat `tabIndex=-1`, keinen Tastatur-Platzierungspfad und keine Koordinateneingabe zum Erzeugen eines Körpers. Der per Tastatur aktivierbare Platzierungsbutton aktiviert nur den Mausmodus. Die Funktion „Körper hinzufügen“ erfordert keine pfadabhängige Eingabe und hat damit keine erkennbare Ausnahme vom Tastaturprinzip in WCAG 2.2, 2.1.1.

**Reproduktion:** Sandbox pausieren → „Körper hinzufügen & bearbeiten“ öffnen → Platzierungsbutton fokussieren → Enter → mit Tab und Enter eine Position festlegen wollen. Es gibt kein geeignetes Tastaturziel zum Abschließen. Escape bricht ab. Der zusätzliche Browserpfad dokumentiert Aktivierungsbeschriftung, Tabfolge und unveränderte Körperzahl; die fehlende Alternative wird zusätzlich durch Codeinspektion belegt.

**Empfehlung:** Vor einer Guided-Discovery-Aufgabe zum Hinzufügen einen ausdrücklich freizugebenden kleinen Tastaturalternativpfad planen, zum Beispiel Position/Anfangsgeschwindigkeit eingeben und explizit erzeugen. Bestehende Pointerbedienung und Integrator erhalten. Eine Tour muss bis dahin die Grenze ehrlich nennen und unabhängiges Überspringen erlauben. **Im Audit nicht repariert**, weil neue Bedienfunktionen nicht autorisiert sind.

**Abnahme:** Hinzufügen, Auswählen, Bearbeiten, Löschen und Abbrechen ohne Pointer; Fokus bleibt sichtbar; dieselben Modellwerte wie bei äquivalentem Pointereingriff, keine zusätzlichen Körper-IDs bei Abbruch. Auch Panning/Drag-Alternativen gesondert prüfen; Zoom-/Fit-Buttons sind bereits vorhanden.

### A08 · P2 · Neue Deep-Links werden vom bisherigen Tab-Lifecycle nicht aufgelöst

**Beleg:** `04-wissenssystem-modelle-quellen.md:103,115`; `dist/app.mjs:56`, `dist/guide.mjs:14`.

**Reproduziert in einem frisch geladenen Dokument:** `/?audit-fresh=1#science` → Hash `#science`, aktive Ansicht `gravity`, Science unsichtbar. Ein Fragmentwechsel im schon geöffneten Science-Tab wäre kein gültiger Direktaufruftest; der Prüfaufbau erzwingt deshalb einen neuen Dokumentladevorgang.

**Empfehlung:** Für die neuen fachlichen Deep-Links einen kleinen erlaubten ID-/Kontextresolver spezifizieren. Kaltstart, versteckten Elternbereich, DE/EN, ungültiges Fragment und Browser Zurück/Vorwärts berücksichtigen. Bestehende interne Hilfelinks brauchen nicht pauschal auf einen neuen Router migriert zu werden.

**Abnahme:** Jeder dokumentierte Link öffnet den korrekten bestehenden Bereich/Abschnitt, erzeugt einen sinnvollen Fokus und einen definierten Rückweg. Kein fremder Modellreset. Eine ungültige ID bleibt harmlos. Die heutige Anwendung verspricht bislang keine vollständige Hashnavigation; der Befund ist vor allem eine Voraussetzung für 04.

### A09 · P2 · Monster-Spezifikation enthält überholte Detailabnahmen und fehlende Lifecycle-Verträge

**Beleg:** `01-monster-identitaet.md:16,24–30,43–64,93–119,134`; `08-design-system-und-finaler-feinschliff.md`, `README.md:31,64,76`.

Der Vorrang des **gewählten roten/schwarzen A3-Skizzenmasters** ist eindeutig. Ältere Forderungen nach violett/türkiser Fantasy-Anatomie, tiefen Ebenen und umfangreicher Mimik dürfen nicht zusätzlich als Pflicht interpretiert werden. Die kleine Icon-/Peek-/Hero-Ansicht ist dieselbe Figur und darf nie zu drei gleichzeitig sichtbaren Instanzen führen. „Voll/dezent/aus“, allgemeines Bewegung-aus und Reduced Motion brauchen eine einheitliche Rangfolge.

**Empfehlung:** Vor breiter Integration eine einzige Creature-Instanz mit erlaubten Ankern, Ereignispriorität, Abbruch bei Navigation/Hidden/Offscreen und genau einem Cleanup-Pfad. „Aus“ verhindert Anzeige und geplante Reaktionen; Reduced Motion verhindert automatische Bewegung. Keine zweite RAF neben deklarativen Effekten ohne Bedarf. Dekoration `aria-hidden`, keine Pointerblockade; echte Einstellungen als unabhängige zugängliche Buttons. Visueller Zufall darf den Marker-RNG nicht konsumieren.

**Abnahme:** 32/64/128/240-px-Montage gegen Master, menschliche Sichtabnahme; gleichzeitig nie mehr als eine sichtbare Instanz einschließlich Schatten/Augen/Peeks; 100 Kontextwechsel, schnelle Eingaben, Touch, Fokusmodus, Reduced Motion und ausschalten. Keine verdeckten Werte/Controls und keine noch ausstehende Reaktion nach Deaktivieren. Bestehende wissenschaftliche Diagrammfarben bleiben erhalten.

### A10 · P2 · BH-Wiederverwendung braucht getrennte Szenenzustände und realistische Abnahme

**Beleg:** `06-black-hole-visualisierung.md:81–88,107–119`; `dist/extreme-render.mjs`, `dist/extreme-ui.mjs:8–16`, BH-Teil in `dist/app.mjs`.

Der vorhandene Renderer ist als Darstellungskern wiederverwendbar; er zeichnet jedoch eine normierte Illustration und löst keine Lichtgeodäten. Der private Extreme-UI-Zustand mit Masse, Winkel, Disk, Zeit und Zoom darf nicht für das neue BH-Lab mitbenutzt werden. Masseneingabe allein bestimmt keine physikalische Akkretionsscheibe. Eine identische normierte Silhouette bei anderer Masse ist zulässig, wenn Maßstab und Zahlen korrekt sind und das Bild nicht als maßstäbliches Allfoto erscheint.

Die Forderung nach keinen Performance-Effekten/Canvas-Neuinitialisierungen beim Sprachwechsel ist als Verbot unnötiger Resets sinnvoll. Ein gezieltes Neuzeichnen **übersetzter Canvasbeschriftungen** muss aber möglich bleiben. Sonst kollidiert die Abnahme mit vollständiger DE/EN-Unterstützung.

**Empfehlung:** Zwei unabhängige UI-Szenenzustände, ein wiederverwendbarer Zeichenkern, Scheduler pro sichtbarer Darstellung. Im neuen BH-Lab die verbindlichen Ansichten „Umgebung“ und „Licht & Horizont“ plus optionalen schematischen Winkel umsetzen. Unwirksamen Winkel im passenden Modus erklären/deaktivieren. Warnung zum qualitativen Charakter direkt an der Grafik, einschließlich Fokusmodus; Photonensphäre nicht mit beobachtetem Schatten oder Emissionsring gleichsetzen.

**Abnahme:** Kein gegenseitiges Ändern der Massen/Entwürfe in beiden Labs; keine Änderungen an `blackHole(m)`. Nur erforderliches Label-Redraw statt Loop-/Zeit-/Backing-Store-Reset bei Sprache. Versteckt null fortgesetzte Frames nach Cleanup, keine doppelten Scheduler, korrektes Resize/DPR-Limit. Keine GR-, Plasma- oder Hawking-Abstrahlungsanimation als berechnetes Ergebnis ausgeben.

### A11 · P2 · Streifkontakte bleiben trotz adaptivem Schritt übersehbar

**Beleg:** `dist/physics.mjs:8–10`; `tests/collision-review.test.mjs:4–5`; reproduzierbar mit `node docs/v0.8/audit/model-probes.mjs`.

Die bestehende Endpunktprüfung erkennt die getesteten frontalen adaptiven Zusammenstöße. Sie ist keine kontinuierliche Kollisionserkennung. Die zusätzliche Probe verwendet zwei Erdmassen, relative Geschwindigkeit 1 AU/Tag ≈ 1731,46 km/s, y-Abstand `R·(1−10^-6)` und x-Anfang `−0.075R`, wobei R die Summe der Kollisionsradien ist.

| Größe | Gemessener Wert |
| --- | --- |
| Adaptiv gewähltes `dt` | `1.2812121443840436e-5` Tage ≈ 1,107 s |
| Kontaktabstand R | `8.517500911194453e-5` AU |
| Startabstand | `8.541414295893624e-5` AU > R |
| Abstand bei `dt/2` in der quadratischen Driftfortsetzung | `8.517492083993742e-5` AU < R |
| Endabstand | `8.541681339993996e-5` AU > R |
| Erfasste Kollisionen / verbleibende Körper | **0 / 2** |

Die Zwischenprüfung benutzt die tatsächliche Anfangsbeschleunigung und die kontinuierliche quadratische Fortsetzung der numerischen Drift. Sie ist **keine unabhängige exakte Lösung des gesamten Gravitationsproblems**, zeigt aber nachvollziehbar, dass Endpunktkontakt kein vollständiger Kontaktschutz ist. Die geringe Eindringtiefe macht dies zu einem bewusst gezielten Grenzfall.

**Empfehlung:** Bekannte Grenze in Quellenhilfe und Vorhersageerklärungen erhalten. Keine „alle Kollisionen garantiert erkannt“-Tour oder Quizantwort. Für diese geplanten Inhalts-/Darstellungsreleases keinen ungeprüften Integrator-/CCD-Umbau einschleusen. Eine spätere kontinuierliche Erkennung benötigt einen eigenen Physikauftrag samt Mehrkörper-, Gleichzeitigkeit-, Impuls-, Streif- und Fehlalarmtests.

**Abnahme für v0.8:** Bestehende frontale/versetzte Regressionen und zwölf Benchmarks bleiben exakt. Grenze sichtbar und fachlich korrekt erläutert. Ein Audit-Grenzfall ist nicht durch erzwungene neue Verschmelzung oder gelockerte Benchmarkschutzregeln zu „beheben“.

### A12 · P2 · Originalbytes sind gesichert, der vorgeschriebene Tag ist nicht auffindbar

**Beleg:** `AGENTS.md:12–14,37`; `scripts/verify-original.mjs`; `docs/v0.1-original-commit.txt`, `docs/v0.1-original.sha256`; GitHub-Refabfragen am Auditdatum.

Die sechs Prüfsummen bestehen gegen Originalcommit `be2502d51a449de3e515faaf72ab5954b1a739d4`. `archive/v0.1` zeigt auf genau diesen Commit. **`refs/tags/v0.1` liefert jedoch 404; `git/matching-refs/tags/v0.1` und die Tag-Refsammlung liefern leere Listen.** Damit ist der in AGENTS zugesagte Tag mit der verfügbaren Verbindung nicht nachweisbar.

`verify-original.mjs` prüft tatsächlich den dokumentierten Commit mit `git show`; die Beschreibung in AGENTS, das Skript prüfe den Tag, ist ungenau. Auch ein verschobener Archiv-Ref oder geändertes Manifest würde durch die sechs Dateiprüfungen allein nicht vollständig abgedeckt.

**Empfehlung:** Eigentümer soll die Ref-Situation bestätigen. Falls der Tag tatsächlich fehlt, ihn nur in einem ausdrücklich erlaubten separaten Repository-Verwaltungsschritt auf den **verifizierten Originalcommit** setzen; keinen vorhandenen Tag verschieben. Künftigen Integritätsschutz für Commit, Manifest und erwartete geschützte Refs getrennt planen. Kein Rewrite und keine Änderung archivierter Dateien.

**Abnahme:** Sechs Originalbytes unverändert, Archiv-/Tagziel eindeutig dokumentiert, vorgeschriebener Tag lesbar und auf dem korrekten Originalcommit. **Im Audit kein Tag erzeugt oder verschoben.** Das Ergebnis bedeutet keine nachgewiesene Beschädigung der vorhandenen Originaldateien.

### A13 · P2 · Idle-Rendering und Live-Ansagen brauchen getrennte Budgets

**Beleg:** `dist/app.mjs` (Gravity-Rendering), `dist/thermal-ui.mjs` (`#thermalStatus`), `dist/extreme-ui.mjs:11–16`; Browsermessungen.

Die pausierte sichtbare Sandbox rendert weiterhin ungefähr pro Displayframe: im präzisierten Lauf **60 zusätzliche Frames in einer Sekunde**. Das ist kein Höhenwachstum und kein nachgewiesenes Speicherleck, lässt aber wenig Grund für zusätzliche permanent laufende Dekoration. `#thermalStatus` wurde während zwei Sekunden Wiedergabe **neunmal** als Live-Region aktualisiert. Echte Screenreader könnten dadurch unnötig viele Ansagen erhalten; tatsächliches Vorlesen wurde nicht geprüft.

Extreme Objects zeichnete in einer Ein-Sekunden-Stichprobe 39 Frames; der zuletzt gemeldete Paint lag bei 0,6 ms. Nach Wegnavigation änderte sich der Framezähler während 600 ms nicht; nach Reduced Motion ebenfalls nicht. Diese Werte sind Runner-Stichproben, **keine garantierte Bildrate oder P95-Messung**.

**Empfehlung:** Keine globale Scheduler-Neuentwicklung vornehmen. Neue Monster-/BH-Loops nur sichtbar und nötig. Für Live-Regionen Ereignisse/erreichbare Meilensteine statt jeden Wertetick vorsehen, normale Zahlen weiterhin visuell aktuell halten. Eine spätere Idle-Optimierung nur mit Zustands-/Renderregression und messbarem Vorteil.

**Abnahme:** Vorher/nachher unter identischem Runner mit warmem Cache, gleicher Szene/DPR und mindestens 30 s vergleichen; Paint-Verteilung, Long Tasks und Framezeiten erfassen. Als zu vereinbarendes Arbeitsbudget höchstens 10 % Verschlechterung vergleichbarer P95-Zeiten durch reine Inhaltsintegration, Ausreißer separat erklären. Dieses Budget ist ein Vorschlag, keine hier bestandene Messung. Screenreader-Handtest und Stop/Start/Hidden/Offscreen sind eigenständige Kriterien.

### A14 · P2 · Dokumentations- und Umfangskonflikte sollten vor Work bereinigt werden

**Beleg:** `AGENTS.md:6,36–38`; `04-wissenssystem-modelle-quellen.md:86,145`; `05-erste-schritte-3.0.md:120`; `README.md:3,21–24,76`; bestehender Titel-/Favicon-Test in `tests/entropy-browser.test.mjs`.

- AGENTS nennt noch `develop/v0.7` und 138/20 als aktuellen Auftrag. Für diesen Audit gilt der spätere explizite Nutzerauftrag auf `develop/v0.8`; das ist kein Anlass, auf dem falschen Branch zu arbeiten. Historische Berichte bleiben historische Momentaufnahmen. Die neu ermittelte Baseline ist **159/38**, nicht eine übernommene alte Zahl.
- 04 nennt ungefähr 12–18 Anfangsbegriffe, verlangt aber eine längere verbindliche Begriffsliste plus Modellkapitel. Vorhandene Definitionen dürfen diese abdecken. Die vollständige fachliche Pflichtliste hat Vorrang vor einer willkürlichen Obergrenze.
- Bei 05 legt die spätere Entscheidung „letzten begonnenen Weg während dieser Seite wieder öffnen; Neu beginnen explizit“ das Verhalten fest. Keine sitzungsübergreifenden Profile nötig.
- Der neue Produktname ist beschlossen, der Zeitpunkt für Titel/Favicon-/Domainumstellung aber separat freizugeben. Bestehende Browserassertionen erwarten exakt den bisherigen v0.6-Titel/Favicon. Eine spätere freigegebene Brandingänderung erfordert eine ausdrücklich begründete Anpassung dieser **Präsentationsassertionen**; „alle bisherigen Tests unverändert“ und gleichzeitig neuer Titel wären sonst widersprüchlich. Physikassertionen/Benchmarks dürfen dabei nicht angepasst werden.

**Empfehlung:** Kurzen Umsetzungsvertrag mit aktueller Baseline, Rangfolge späterer Entscheidungen und Branding-Gate festhalten. Aktuelle Hauptbereiche, CSS-Schutzregeln und DOM-IDs erhalten. Keine flächendeckende Token-/DOM-Migration aus 08 ableiten. **Im Audit sind diese Plandokumente unverändert geblieben.**

## 4. Bewertung aller acht Pläne und Abhängigkeiten

| Plan | Einschätzung | Voraussetzung / begrenzte Umsetzung | Wichtigste Abnahme |
| --- | --- | --- | --- |
| 01 Identität/Monster | Machbar; Asset ist vorhanden. Risiko vor allem Lifecycle und Bildtreue, nicht Rechenphysik. | Zuerst nach Baufreigabe optimierte Derivate und Sichtabnahme; dann eine Instanz, erlaubte Anker und Abbruchpfade. Alte violette Anatomieforderungen nicht zusätzlich umsetzen. | A09 + Assetkriterien in Abschnitt 7. Branding-/Domainfreigabe getrennt. |
| 02 Warum/Wozu/Prognose | Wissenschaftlich sinnvolle freiwillige Ebene, Gefahr redundanter Karten. | Minimaler 04-Unterbau vorziehen; sechs Kontexte klären, genau eine geschlossene Hauptfrage pro definiertem Kontext und getrennte optionale Mini-Prognose. Keine automatische Modellaktion beim Antworten. | Vollständiges DE/EN, Fragen fachlich/UI-seitig wirklich ausprobierbar, pausierte Zustände/Entwürfe erhalten. |
| 03 Entropieverständnis | Höchster didaktischer Nutzen, ohne neuen Solver machbar. | A04 entscheiden; exakte bestehende Kombinatorik wiederverwenden; Energie-/Entropiebalken nur aus vorhandenen Resultaten. | N=4/12/1/32, Gleichgewicht ≠ nächster Schritt, Vorzeichen/Einheiten/Fluktuationen, begrenztes Rendering. |
| 04 Wissen/Quellen | Technisches Fundament auch für v0.8.5. Gefahr eines unnötigen CMS oder doppelter Übersetzungskataloge. | Stabile fachliche IDs, kleine Registry mit Verweisen auf bestehende Sprachschlüssel/Quellen, gemeinsamer Fokuspfad. Kein kompletter App-Neubau. | A01/A02/A08, Link-/ID-/Formel-/Quellenprüfung und echter Rückweg. |
| 05 Erste Schritte 3.0 | Erweiterung des existierenden Controllers; nicht in v0.8 vorziehen. | Freigegebene 02–04 wiederverwenden. Drei kurze Einstiegsschritte und begrenzte Labpfade; echte beobachtete Aktionen oder ehrliche manuelle Bestätigung/Überspringen. | Kein synthetischer Apply/Reset/Klick auf Physikcontrols; Resume/Escape/Tastatur/DE/EN; A07 berücksichtigen. |
| 06 BH-Visualisierung | Mit 2D/2.5D und vorhandenem Renderer realistisch; kein GR-Löser nötig. | Zwei Ansichten + schematischer Winkel bleiben MUSS. Zeichenkern von privatem UI-/Zeitstatus trennen, Grafik ehrlich kennzeichnen. | A10/A13, isolierte Massen, unveränderte Kennzahlen, Lifecycle/DPR/Focus/Mobile. |
| 07 Temperaturkontext/Material | Größtes fachliches Datenrisiko, aber statisch begrenzbar. | A05/A06 vor Klassifikationscode entscheiden. Zwei Werte als Vergleich, vier Stofftabellen, keine Temperaturdynamik/Phasenanteile/automatische Brücke. | Druck/Datenquellen/Übergangsband und Gültigkeitsfenster, robuste Verhältnisse/Einheiten/Originaleingaben. |
| 08 Behutsamer Feinschliff | Nur abschließend und lokal anwenden. Keine neue Architekturvoraussetzung. | Stabilen Stand aus 05–07 messen, konkrete Kontrast-/Layoutprobleme gezielt beheben. Hintergründe optional weglassen. | Keine Physics-/Animation-/Keyboardregression; lange Marke, 320 px, Zoom, Fokusmodus und originale Canvas-CSS-Schutzregeln. |

**Reihenfolge ist nicht Kapitelnummernabarbeitung:** Asset-Sichtvorbereitung aus 01 → kleiner 04-Unterbau → ein vertikaler 02/03-Pfad → restliche 02/03-Inhalte → begrenzte 01-Integration → v0.8-Abnahme. Anschließend erst 05–08 auf freigegebener v0.8. Das verhindert doppelte Hilfesysteme und hält die zwei Releases getrennt.

## 5. Bestehende Architektur und Erweiterbarkeit

### Was erhalten bleiben sollte

- Statische Website mit nativen ES-Modulen, ohne Laufzeitpakete oder Backend. Rechenkerne `physics.mjs`, `entropy.mjs`, `thermal-physics.mjs` sind vom großen Teil der UI getrennt und direkt testbar.
- `experiments.mjs`, `instruments.mjs`, `prediction.mjs` kapseln Szenarien, Diagnostik und begrenzte Vorhersage. Die Vorhersage klont Körper; Abbruchgeneration und Grenzen verhindern unbeschränkte Arbeit. Aktuell höchstens 12 vorhergesagte Körper, 1500 Integrationsschritte und 301 gespeicherte Punkte; die Sandbox selbst begrenzt auf 60 Körper. Diese Limits nicht aus didaktischen Beispielen heraus entfernen.
- Der Wärmeausgleich ist analytisch, kein neuer Integrator. `thermal-view.mjs` trennt Darstellungslogik und numerisch robuste Eingabeprüfung; die begrenzte frühzeitige Kurvenabtastung aus der v0.7-Reviewkorrektur bleibt erhalten.
- Isolierter Selbstcheck-Worker schützt globale Körper-IDs und Simulation; echte Chromium-Regressionen prüfen wiederholte Ausführung und Fehler-/Retry-Verhalten.
- Zentrale DE/EN-Texte, Einheitenformatierung, native Formulare/`details` und vorhandene Fokuskorrekturen sind eine geeignete Basis.

### Erweiterungsrisiken ohne Bedarf für einen Totalumbau

`app.mjs` enthält weiterhin Gravity-Controller, Navigation, BH-Rechner und Rendering; `extreme-ui.mjs` hält seinen Zustand privat und greift beim Import direkt auf erwartete DOM-IDs zu. Das ist für die kleine statische Anwendung tragbar, erschwert aber das Einhängen zusätzlicher Help-/Tour-/Creature-Controller. Mehrere Module hören bereits auf dieselben Tabklicks, `visibilitychange`, Resize und Sprache. Die Reihenfolge von Capture-/Bubble-Handlern ist für Fokus relevant.

Empfohlen sind **wenige ausdrücklich lesende Adapter** für aktiven Fachkontext und benötigte validierte Werte sowie ein idempotenter Präsentationscontroller mit Cleanup. Kein kopierter zweiter Simulationszustand und kein globaler Store als Selbstzweck. Ein eventuell neues Ereignis muss vom echten Nutzercontrol stammen, darf keinen Apply simulieren und keine zweimalige Modellrechnung auslösen. Dynamische Sprache/Validierung ohne kompletten Formularersatz aktualisieren.

Das Temperaturlabor stellt den validierten Kelvinwert derzeit über `#temperatureTransferValue` bereit. Der Material Explorer darf weder die gerundete sichtbare Ausgabe parsen noch in ein fremdes Formular schreiben. Ein kleiner read-only Zugriff auf den bereits validierten Wert wäre beim späteren Bau sauberer als zusätzliche DOM-Abhängigkeiten. Die vollständigen physikalischen und visuellen Zustände sind heute nicht überall über `inspect()` verfügbar; Browserassertionen müssen deshalb auch echte Controls, Eingabefehler und Zeichenlebenszyklen beobachten.

**Komplexität bewusst vermeiden:** keine acht neuen Labs, kein Tour-CMS, kein Quellenbackend, keine Live-Webabfragen beim Appstart, kein Tracking, keine Procedural-Monster-Engine und kein GR-/Materialsolver. Layout-/Tokenanpassungen erst dort, wo eine echte Messung oder ein konkreter Befund sie begründet.

## 6. Wissenschaft und Numerik

### 6.1 Gravitation, Erhaltung und Vorhersage

Die Codeinspektion bestätigt paarweise Newtonkräfte mit Plummer-artigem Softening `ε=10^-7 AU` ≈ 15 km, Velocity-Verlet und bestehender adaptiver Schrittwahl. Positionen in AU, Massen in M☉ und Zeiten in Tagen werden für Geschwindigkeitsfelder in km/s korrekt umgerechnet. Diagnostik-Einheiten für Energie, Impuls und Drehimpuls sind in der Oberfläche ausdrücklich genannt; ein angebliches Fehlen dieser Einheiten wäre ein falscher Befund.

Der adaptive Schritt ist ein heuristischer Sicherheits-/Genauigkeitskompromiss, kein eingebetteter Fehlerregler mit garantierter lokaler Toleranz. Festschritt-Verlet ist bei konstantem Schritt symplektisch; eine zustandsabhängige variable Schrittwahl erbt diese Eigenschaft nicht einfach global. Die historischen Vergleiche liefern **keinen universellen Vorteil eines Wechsels**:

| Szenario / Dauer | Schritte adaptiv / fest h=0,1 d | Max. relativer Energiefehler adaptiv / fest |
| --- | --- | --- |
| Doppelstern / 100 Jahre | 118807 / 365251 | `4.69148e-4` / `5.32605e-5` |
| Sonnensystem / 100 Jahre | 173974 / 365251 | `8.26207e-11` / `1.92442e-11` |
| Erde/BH / 100 Jahre | 73050 / 365251 | `1.14597e-9` / `6.76779e-12` |
| Exzentrisch / 10 Jahre | 13582 / 36526 | `5.10642e-4` / `2.33502e-3` |
| Dreifach / 10 Jahre | 7886 / 36526 | `3.60668e-5` / `1.90568e-6` |
| Begegnung / 30 Tage | 65 / 300 | `1.20185e-5` / `1.25125e-6` |

Diese Werte wurden unverändert reproduziert. Sie sind kein Vergleich bei gleichem Rechenaufwand. Fest ist in mehreren Fällen genauer, benötigt aber mehr Schritte; im exzentrischen Fall ist der maximale Energiefehler adaptiv kleiner. Analytische Kepler-Tests sind deshalb zusätzlich zu Erhaltung und goldenen Ergebnissen wichtig und bleiben erhalten. **Integrator beibehalten.**

Bei Verschmelzungen werden Masse und linearer Impuls erhalten. Kinetische Energie ist bei inelastischer Behandlung nicht konserviert; interner Spin wird nicht als Freiheitsgrad verfolgt, daher ist vollständige Drehimpulsbilanz nach Kollisionen nicht aus den Punktkörperdaten ableitbar. Hilfe und Quiz dürfen Energie-/Drehimpulserhaltung hier nicht pauschal behaupten. Die Driftreferenz wird nach Eingriffen/Kollisionen erneuert; kleine angezeigte Drift zertifiziert keine korrekte Bahn. Endpunkterkennung bleibt A11.

Newtonsche BH-Körper sind keine GR-Simulation. Horizontnähe, hohe Geschwindigkeit, Lichtablenkung, Gezeiten, Präzession, Gravitationswellen und Hawking-Massenverlust sind nicht dynamisch gelöst. Eine dekorative „Licht & Horizont“-Ansicht darf an dieser Modellgrenze nichts ändern. Die Vorhersage muss weiterhin als begrenzte numerische Vorschau desselben Modells erscheinen, mit Abbruch/Limit und ohne Garantie für den Zeitpunkt der nächsten Kollision.

### 6.2 Schwarze Löcher und kompakte Objekte

Die vorhandenen Formeln sind unter ihren ausdrücklich begrenzten Annahmen konsistent:

`r_s=2GM/c²`, `T_H=ℏc³/(8πGk_BM)`, `P≈ℏc⁶/(15360πG²M²)`, `τ≈5120πG²M³/(ℏc⁴)`.

| Beispiel | Erneut berechnet |
| --- | --- |
| 1 Sonnenmasse | `r_s=2953.3393820668784 m`, `T_H=6.170073828591918e-8 K` |
| 1 Erdmasse | `r_s=0.0088701028718461 m`, `T_H=0.020543529530056212 K` |
| `10^9 kg` | `P≈3.561622144778495e14 W`, `τ≈8.411477899702106e10 s` |
| UI-Massengrenzen 1 und `10^41 kg` | Alle vier Ausgaben in den geprüften Fällen endlich. |

Alle sieben Massenproben erfüllen bei M→2M die Faktoren 2, 1/2, 1/4 und 8; `P(M)τ(M)/(Mc²)=1/3` bis Rundungsfehler. Das letzte Verhältnis ist die korrekte Folge der während Verdampfung veränderlichen Leistung; `M c²/P(M)` ist nicht die verwendete Lebensdauer. Die algebraische Verdopplungsprobe am oberen Massenwert reicht außerhalb der UI-Grenze und ist **nur** eine Formelprüfung, keine Erweiterung des Eingabebereichs.

P und τ bleiben idealisierte **Modellschätzungen**: nichtrotierend/ungeladen, keine detaillierten Greybody-Faktoren/Teilchenspektren, keine externe Akkretion/Strahlungsumgebung, keine quantengravitative Endphase. Hawking-Strahlung astrophysikalischer BH ist nicht als direkt beobachtete Messung auszugeben. Scheibenleuchten ist gewöhnliche umgebende Materie, nicht die berechnete Hawking-Temperatur. `1.5r_s` und `3r_s` bezeichnen Photonensphäre/ISCO für Schwarzschild, nicht automatisch den sichtbaren Ringradius.

Weißer Zwerg (0,6 M☉ / 7000 km) und Neutronenstern (1,4 M☉ / 12 km) sind festgelegte Beispiele, keine universellen Masse-Radius-Gesetze. Die mittlere Dichte `M/(4πR³/3)` ist eine sphärische Volumennäherung. Beim BH wird korrekt keine gewöhnliche Materialdichte behauptet. Pulsarkegel müssen auch ohne Seitenpanel ausdrücklich schematisch bleiben.

### 6.3 Marker und thermodynamische Entropie

Die dichten Boolean-Arrays, N=1–32, exakte BigInt-Multiplizität und `q=1/4` sind bewahrt. Frühere Sparse-Array-Korrekturen und RNG-Verbrauchsprüfungen sind weiterhin Teil der Suite.

Für N=12: `Ω(12,6)=924`, `P_eq(6)=924/4096=0.2255859375` = **22,55859375 %**; ein bestimmtes extremes Makro hat `1/4096`. „Hälftig“ ist der wahrscheinlichste einzelne Makrozustand, **keine absolute Mehrheit aller Zustände**. Von „alle links“ ist der erwartete Linksbestand nach einem Mischschritt dagegen 9, nicht 6. Dies folgt direkt aus q=1/4 und ist kein Widerspruch zur stationären Binomialverteilung.

`ln Ω` ist die dimensionslose Boltzmann-artige Modellentropie des definierten **Makrozustands** im Zweizustandsensemble. Sie ist weder die Shannon-Entropie einer beliebigen laufenden Ensembleverteilung noch die gesamte thermodynamische Entropie eines realen Gases. Marker enthalten keine kontinuierlichen Impulse, Energien oder echten Gasbahnen. Keine Umrechnung in Wärme-ΔS durch bloßes Gleichsetzen; keine zwangsläufig monotone Entropiekurve einer einzelnen kleinen stochastischen Folge.

Die thermische Bilanz liefert dagegen `ΔS_i=C_i ln(T_i/T_i0)` in J/K und `σ=G_th(T_A−T_B)²/(T_A T_B)≥0` in W/K. Warmer Körper negativ, kalter positiv, Summe nichtnegativ. Energie bleibt im isolierten Modell erhalten; diese Aussage begründet keine universelle absolute Energie `U=CT` ohne Referenz und keine automatisch berechnete Exergie.

### 6.4 Wärmegleichung und zusätzliche Messungen

Erhaltene Modellannahmen: zwei intern homogene Körper, konstante Wärmekapazitäten `1–10^6 J/K`, Leitwert `0.001–1000 W/K`, Anfangstemperaturen `250–600 K`, keine Umgebung, Arbeit, Strahlung, Phasenänderungen oder chemischen Prozesse. `T_eq=(C_A T_A0+C_B T_B0)/(C_A+C_B)`; `τ=C_A C_B/[G_th(C_A+C_B)]`. Das Extremtemperaturlabor ist ein anderer Kontext, nicht die Fortsetzung dieses Modells.

Die zusätzliche deterministische Stichprobe (Seed 123456789, 20.000 Fälle, logarithmisch verteilte C/G/Zeiten) vergleicht mit einer unabhängig geschriebenen geschlossenen Temperaturauswertung:

- maximaler relativer Energiefehler **`4.425782961667732e-16`**;
- größte Temperaturabweichung **`2.2737367544323206e-13 K`**;
- kleinste in der Stichprobe berechnete Gesamtentropie **`1.4625672222468494e-18 J/K`**, kein negativer Fall.

Die Stichprobe enthält überwiegend ungleiche Temperaturen, ersetzt also nicht die vorhandenen gezielten Tests für t=0, Gleichgewicht, ungültige Eingaben, nahe gleiche Temperaturen und Vorzeichen. Die Verwendung von `expm1`, `log1p` und stabiler Restreihe ist fachlich sinnvoll; kein Änderungsgrund am Rechenkern festgestellt. Die Wärmeflussrate folgt aus dem vorausgesetzten positiven Leitwertgesetz, nicht allein aus der Aussage des zweiten Hauptsatzes.

## 7. Masterasset und sichere spätere Webableitung

**Unveränderte Quelle:** `assets/a3-glitched-entity-master.jpg`  
Git-Blob `b6f41e288ac18b60dd19bd79773e205c73048f15`  
SHA-256 `5dfb6a91195d7c3925cee9ae202332c26476de257b1a2f5b1469da1c08536ab3`

| Tatsächlich geprüft | Ergebnis |
| --- | --- |
| Dateisignatur und Decoder | JPEG `ffd8ff`, erfolgreich in Chromium und Pillow gelesen |
| Abmessung / Dateigröße | **1536 × 1536 px / 144400 Byte** |
| Farbmodus / Metadaten | RGB, kein Alphakanal, keine EXIF-Einträge; ICC-Profil 456 Byte vorhanden |
| Decodierte RGBA-Näherung | **9437184 Byte = 9 MiB** für eine volle Bildfläche, ohne zusätzliche GPU-/Browserkopien |
| Eckpixel | Nahe Schwarz, Alpha 255; sichtbares schwarzes Rechteck vor weißem Hintergrund |
| Echte Browsergrößenprobe | 32, 64, 128 und 240 CSS-px nebeneinander aus demselben Master, Screenshot im Audit-Artefakt |

Die Silhouette, der gebrochene rote Halo und die hellen Gesichtszüge stimmen mit der ausgewählten Referenz überein. In voller Darstellung ist kein Neuentwurf nötig. Bei 32 px verliert die volle Körperdarstellung viel Gesichts-/Fingerdetail; das ist eine gestalterische Sichtprüfung, kein automatisches bestanden/nicht-bestanden der Figurenidentität. Ein gezielter Kopf-/Fragmentausschnitt ist für das kleine Icon plausibler als immer die gesamte Figur zu verkleinern.

Der Master enthält **keine getrennten Körper-/Arm-/Augenebenen**. Tiefe Mimik oder unabhängige Gliedmaßenbewegung müsste zusätzliche Assets oder Masken erzeugen. Für den ersten Umfang sind Gesamtbild-Transform, sparsame Fragment-/Haloeffekte und wenige abgenommene Zustände risikoärmer. Schwarze innere Aussparungen und rote Antialiasingkanten dürfen beim Freistellen nicht versehentlich gelöscht werden. Einfach „alle schwarzen Pixel transparent“ erzeugt wahrscheinlich unerwünschte Löcher und Halos.

### Vorschlag für die nach Baufreigabe zu prüfende Pipeline

1. Master schreibgeschützt behandeln und Hash prüfen. Kein Ersatz durch neu generierte ähnliche Monsterbilder.
2. Hero, Peek und Icon als nachvollziehbare Ausschnitte/Ableitungen erstellen; bei Transparenz die tatsächlichen Kanten separat abnehmen. Zielformat lokal laden, beispielsweise WebP mit Alpha; PNG-Fallback nur bei begründetem Bedarf. SVG nur bei ausdrücklich akzeptierter Vektorableitung und Sichtabnahme, nicht als angeblich verlustfreie automatische Konvertierung.
3. Kandidatengrößen aus tatsächlichen CSS-Größen/DPR ableiten, z. B. Hero 512 px für 240 CSS-px bis DPR 2, Peek 256 px für 128 CSS-px, Icon 64 px für 32 CSS-px. Das sind **Vorschläge, keine erzeugten Dateien**. RGBA-Flächenbedarf dann 1 MiB / 256 KiB / 16 KiB. Dateigrößenvorteile messen; ein Alpha-/verlustfreies Format ist nicht garantiert kleiner als das bereits kompakte JPEG.
4. Montage auf echtem dunklem UI-Hintergrund und zusätzlich hell/neutral zur Kantenprüfung; 1×/2× und 32/64/128/240 CSS-px. Natürliches Seitenverhältnis, `width`/`height`, Lade-/Fehlerfall und Crop prüfen. Nur benötigte Variante laden; kein 1536-px-Master als kleines Live-Icon.
5. Nutzer bestätigt Bildtreue und Bewegungsumfang **vor** breiter Integration. Master bleibt unverändert; Derivate erhalten Manifest mit Quelle, Crop, Pixelmaß, Bytes, Hash, Transparenz, Werkzeug/Parametern und Zweck.

Die Herkunft als ausdrücklich gewählter Projektmaster ist dokumentiert. Das ist keine externe urheberrechtliche Markenprüfung; Domain-/Produktfreigabe bleibt der spätere getrennte Prozess. Im Audit wurden weder Bildrechte neu vergeben noch Name/Domain veröffentlicht.

## 8. Browser, Mobilbedienung, Accessibility, DE/EN und Animation

### Beobachtete Browserergebnisse

- Desktop **1440 × 1000 CSS-px**, Deutsch: alle fünf Bereiche ohne Seitenüberlauf; sichtbare untersuchte Controls hatten ermittelbare Namen.
- Touch-emulierte **320×900, 390×844, 844×390 und 360×900**, Englisch: jeweils alle fünf Bereiche, **20/20 Kombinationen** mit `scrollWidth == viewport width`; keine unbehandelten JavaScript-Seitenfehler. Die Temperaturgrenze −23,15 °C aktivierte weiterhin die gültige Übernahme. Screenshots liegen im CI-Artefakt.
- Bestehende Suite zusätzlich: gebrochene Viewportbreiten/DPR, 120-Frame-Höhenregression, Entwürfe/Validierung, Fokus-/Tabrückwege, Sprachpersistenz, Pulsarhinweis, Worker/IDs, Thermalbrücke, Guide und Reduced Motion. **38/38 bestanden.**
- 100 zusätzliche Bereichswechsel: DOM-Knotenzahl **1241 vor und nach**; pausierte physikalische Zustände gleich. Das ist kein Heap-/Listener-Leakbeweis; abgeleitete Vorhersagegeneration ändert sich erwartbar (A01).
- Sichtbare Extreme-Animation läuft, versteckt/Reduced Motion keine weitergezählten Frames im gemessenen Intervall. Sichtbare pausierte Gravity zeichnet weiter (A13).
- Versuch nativen Browserzooms mit Tastenkürzel: DPR vorher/nachher 1, daher **nicht als echter Browserzoom bestätigt**. Ein schmaler Viewport ist kein Ersatz für einen bestandenen 200-/400-%-Zoomtest.

### Accessibility: positive Basis und verbleibende Lücken

Skiplink, native Bedienelemente, sichtbar benannte Controls, gesetzte Dokumentensprache und korrigierte Rückwege sind vorhanden. Im zusätzlichen begrenzten Kontrastscan gab es in den untersuchten Standardzuständen keine Textkontrast-Kandidaten unter dem jeweiligen Schwellenwert. Der Scan deckt weder alle Zustände noch Canvaspixel, komplexe Verläufe, sämtliche Hover-/Fehlerzustände oder vollständige Accessible-Name-Berechnung ab. **Keine pauschale WCAG-Konformität behaupten.**

Die 18×18-px-Checkboxen sind zunächst nur Kandidaten: Ihre umgebenden klickbaren Labels und Abstände müssen berücksichtigt werden. Die reine Checkboxgröße beweist keinen Verstoß gegen die 24-px-/Abstandsregel aus WCAG 2.2. Für neue Buttons sind 44-px-Ziele auf Touch sinnvoll; 44 px sind nicht pauschal die WCAG-AA-Mindestgröße. Die bestätigte Tastaturlücke A07 bleibt unabhängig davon relevant.

Canvasdiagramme haben Namen und benachbarte Zahlen/Erklärungen; beim BH-Funktionsgraphen fehlt eine vollständige tabellarische Kurvenalternative. Ob die vorhandene Text-/Formelerklärung als gleichwertige Information genügt, benötigt einen konkreten Screenreader-/Aufgabenvergleich. Neue Information darf jedenfalls nicht ausschließlich durch Farbe, Bewegung, eine Monsterreaktion oder ein unbeschriftetes Bild transportiert werden. Warnungen zu schematischen Ansichten müssen in Fokusmodi beim Bild sichtbar bleiben.

Offene Handprüfungen: echter Screenreader (z. B. NVDA/VoiceOver), nativer Zoom 200/400 %, Textabstände, Hochkontrast/Forced Colors, reale Touchgesten/virtuelle Tastatur und mobile Landscape-Fokusfolge. Ein langer neuer Markenname braucht 320-px-/Zoomnachweis; aus der bisherigen kurzen Marke lässt sich dieser nicht ableiten. Diese Prüflücken sind Abnahmearbeit, keine bereits beobachteten Fehler.

### DE/EN und Animationslebenszyklen

Die aktuelle Sprache wird zentral gewählt, auch die bestätigte bereits aktive Sprache gespeichert. Dynamische Texte und Validierung sind durch die vorhandenen Reviewregressionen abgesichert. Die Tests erfassen jedoch nicht automatisch jeden künftig neu registrierten Quellen-/Quiz-/Tourtext: Der bestehende Literal-Key-Scan in `tests/i18n.test.mjs` betrachtet nur eine explizite Modulliste und einfache Literalformen. Eine neue Registry muss selbst rekursiv geprüft werden, einschließlich Platzhaltern, ARIA, Antwortzuständen, Fehlern und Quellenlabels.

Sprache darf neue Formularzweige nicht vollständig ersetzen. Vor/nach Umschalten sind Entwurfstext, Fokus, Selektion soweit unterstützt, sichtbarer Fehler und interne Validierung zu vergleichen; nicht nur der angewandte Modellwert. Fremde Benutzernamen nicht als Übersetzungsschlüssel behandeln. Für alle neuen Controller gilt: Initialisierung genau einmal, abonnierte Listener kontrollierbar, Offscreen/Hidden/Navigation abbrechen, keine Nachhol-Zeitsprünge. Reduced Motion ist sowohl beim Start als auch bei Änderung während der Sitzung zu prüfen.

## 9. Tests, historische Schutzregeln, CI und Sicherheitsgrenzen

Die bestehende CI führt echte Tests aus und enthält keinen Deploymentjob. Der vollständige Checkout ermöglicht historische `git show`-Vergleiche. `check-benchmarks.mjs` schützt nicht nur gerundete Tabellen, sondern die vollständigen numerischen Ausgaben und zentrale Benchmarkdateien gegen die gepinnte Referenz. Das ist für Regressionen wertvoll; auch bei grüner Golden-Datei bleiben unabhängige analytische Prüfungen nötig.

Der Originalschutz prüft sechs Dateien aus dem dokumentierten Originalcommit und darf nicht auf aktuelle `dist`-Dateien umgebogen werden. A12 trennt den gesicherten Byteinhalt von den zusätzlich zugesagten Git-Refs. Weder ein grüner CI-Lauf noch eine Workflowdatei erzwingt allein Branchschutz oder Mergefreigabe. Es wurden keine Repository-Schutzregeln verändert.

Bestehende gute Abdeckung: Energie/Impuls/Drehimpuls ohne unerlaubte Pauschalisierung bei Kollisionen, Keplerreferenz, langfristige Bahnen, begrenzte Vorhersage ohne Modellmutation, Entropievalidierung, Wärmegleichung und Grenzwerte, i18n, UI-Fixtures sowie echte Chromium-Reviews. Verbleibende Lücken sind die **neuen** Verträge aus A01–A10, reale Assistenztechnik, Browserübergreifung, Heap-/Listenerprofil und empirisch bewertete neue Inhalte. Testanzahl ist keine Prozentangabe zur wissenschaftlichen Richtigkeit.

Neue Testdateien werden heute nicht automatisch entdeckt: `scripts/test.mjs` und der Browser-CI-Befehl listen Dateien ausdrücklich. Jeder neue Schritt muss seinen Test im tatsächlichen Einstieg eintragen und einmal in CI nachweisen. Ein neuer Test unter `tests/` allein reicht nicht.

Es gibt keine produktiven npm-Laufzeitabhängigkeiten. Der Dev-Lock pinnt Playwright; vorhandene CI installiert mit `--ignore-scripts`. Für den Audit wurde kein vollständiger Vulnerability-/Lizenz-/Supply-Chain-Scan durchgeführt. Ein Update von Abhängigkeiten oder Actions nur wegen ihres Alters wäre kein begründeter Teil dieses Auftrags. Der Runner meldet Node-20-Abkündigung für die vorhandenen v4-Actions und führt sie bereits auf Node 24 aus; die eigentlichen Testschritte verwenden Node 22. Das ist ein dokumentierter Wartungspunkt, kein hier beobachteter Testausfall.

Externe Google-Fonts konnten im zusätzlichen Audit blockiert werden, ohne Kernfunktionen zu verlieren; Fallback wurde damit tatsächlich geprüft. Das bestätigt keine vollständige Offlinefähigkeit. Neue Quellen-/Erklärtexte lokal und mit `textContent` oder kontrollierten statischen Templates rendern; keine aus Quellenmetadaten zusammengesetzten ungeprüften `innerHTML`-Blöcke. SVG-Ableitungen dürfen keine externen Referenzen/Skripte mitbringen. Keine zusätzlichen Tracker/externen Ausführungs-CDNs für die neuen Funktionen.

## 10. Quellenprüfung und fachliche Zuordnung

Alle 19 unterschiedlichen externen URLs aus den acht Plänen wurden am Auditdatum geöffnet beziehungsweise versucht. „Erreichbar“ bedeutet hier, dass ein lesbarer Abruf gelang, nicht die Validierung jedes Satzes des gesamten Dokuments. Die heiklen Definitionen und Tabellenwerte wurden gezielt gegengeprüft. Die folgenden Zuordnungen sollen später in die fachliche Registry einfließen, nicht als unspezifische Linkwand in die Grundansicht.

| Quelle / tatsächlich geprüft | Zugehörige Aussage und Grenze |
| --- | --- |
| [Stanford: Statistical Description](https://web.stanford.edu/~peastman/statmech/statisticaldescription.html) | Mikro-/Makrozustand, Ensemble und Voraussetzungen; geeignet für die Markerbegriffe. |
| [OpenStax College Physics 15.7](https://openstax.org/books/college-physics-2e/pages/15-7-statistical-interpretation-of-entropy-and-the-second-law-of-thermodynamics-the-underlying-explanation) | Kombinatorische Zustände und Gleichwahrscheinlichkeitsannahme. Keine allgemeine Behauptung „Entropie ist sichtbares Chaos“ daraus übernehmen. |
| [Stanford: Thermodynamics, kanonische URL](https://web.stanford.edu/~peastman/statmech/thermodynamics.html) | Erster/zweiter Hauptsatz und Voraussetzungen. Die im Plan mit `www.web.stanford.edu` angegebene Variante lief im Abruf in Timeout; kanonische Variante erfolgreich. Nicht pauschal als dauerhaft toten Link einstufen. |
| [OpenStax Physics 12.3](https://openstax.org/books/physics/pages/12-3-second-law-of-thermodynamics-entropy), [12.4](https://openstax.org/books/physics/pages/12-4-applications-of-thermodynamics-heat-engines-heat-pumps-and-refrigerators) | Grundlagen und Anwendungen erreichbar; vereinfachende „Unordnung“-Erklärungen brauchen den präziseren Projektkontext. Kein Ersatz der temperaturabhängigen Entropieintegration durch allgemeines `Q/T`. |
| [SEP: Philosophy of Statistical Mechanics](https://plato.stanford.edu/entries/statphys-statmech/) | Als freiwillige begriffliche/philosophische Vertiefung erreichbar, kein Beleg einer aus Thermodynamik bewiesenen Sinnlosigkeit. |
| [OpenStax University Physics 1.5](https://openstax.org/books/university-physics-volume-2/pages/1-5-phase-changes) | Phasengrenzen hängen vom Druck ab; Übergänge/Koexistenz. Tabellenrundung ist keine exakte universelle Schwelle. |
| [PDG 2026: Ethanol](https://pdg.lbl.gov/2026/AtomicNuclearProperties/HTML/ethanol.html) | Normal-Schmelz-/Siedereferenz; 159,0 K und 351,4 K sowie gerundete Celsiuswerte. Keine Zersetzungs-/Plasmaprognose. |
| [RSC Aluminium, Original-Planlink](https://periodic-table.rsc.org/element/13/aluminum), [RSC Eisen](https://periodic-table.rsc.org/element/26/iron) | Beide lesbar; konkrete Tabellenwerte in A05 geprüft. US-Schreibweise `/aluminum` ist hier **kein nachgewiesener kaputter Link**. |
| [NIST SP 330 §2](https://www.nist.gov/pml/special-publication-330/sp-330-section-2) | Exakter Celsiusoffset 273,15 K; Kelvinunterschied und Celsiusintervall gleich groß. Thermodynamische Temperatur und tabellierte praktische Messwerte nicht verwechseln. |
| [NASA FIRAS](https://lambda.gsfc.nasa.gov/product/cobe/firas_overview.html) | Strahlungsspektrum mit ungefähr 2,725 K; keine Temperatur eines beliebigen Teilchens. |
| [NASA Sun Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html) | Nennt effektive Temperatur **5772 K**, daneben unterschiedliche Photosphärenwerte. Bestehendes „~5900 K Sonnenoberfläche“ ist ein grobes Beispiel, darf dieser Quelle nicht als exakter effektiver Messwert zugeschrieben werden. Bestehenden Presetwert im Audit nicht verändert. |
| [NASA BH-Anatomie](https://science.nasa.gov/universe/black-holes/anatomy/), [NASA SVS 13326](https://svs.gsfc.nasa.gov/13326/) | Akkretion, Lichtablenkung, Winkel-/Helligkeitsasymmetrie. NASA zeigt berechnete Visualisierungen; die eigene rein schematische Grafik erhält dadurch keine Rechenvalidierung. |
| [EHT FAQ](https://eventhorizontelescope.org/faq/can-we-really-photograph-black-hole-are-they-not-entirely-dark-no-light-can-escape-them) | Beobachtetes Radio-/Schattenbild, kein klassisches Foto einer leuchtenden materiellen Horizontoberfläche. |
| [EHT 2019 Paper I, arXiv](https://arxiv.org/abs/1906.11238) | Primärabstract und zugehöriger DOI `10.3847/2041-8213/ab0ec7` bestätigt. DOI-Verlagsabruf durch robots-/Zugriffssperre nicht lesbar; nicht als inhaltlich geprüfter Volltext oder defekter DOI ausgeben. |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [MDN Accessibility-Mediaqueries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility) | Normative Tastatur-/Reflow-/Kontrast-/Zielgrößenkriterien und technische Umsetzungshinweise. Erreichbar; der Audit ist kein vollständiger Konformitätstest. |

Ergänzend wurden [OpenStax University Physics 4.6](https://openstax.org/books/university-physics-volume-2/pages/4-6-entropy) und die [AEI-Erklärung zur Hawking-Temperatur](https://www.einstein-online.info/en/explandict/hawking-temperature/) zur Gegenprüfung herangezogen. Die erste unterstützt die Zustandsfunktions-/Wärmeentropieerklärung; die zweite bestätigt die Größenordnung `~6·10^-8 K` für eine Sonnenmasse. Die numerischen Konstanten und bestehenden Referenzkonventionen wurden nicht modernisiert oder auf neue Rundungswerte umgestellt.

## 11. Vor Umsetzung verbindlich zu entscheidende Punkte

| Entscheidung | Vorschlag | Spätestens vor |
| --- | --- | --- |
| Zustandserhaltung einschließlich Vorhersage/Playing | Physik, Entwurf, Präsentation, Scheduler/abgeleitete Arbeit explizit unterscheiden; heutige Pausen bewahren. | Technischer 04-Unterbau |
| Sechs Kontexte in fünf Bereichen | Eine zugehörige Frage pro bestehendem Unterabschnitt; keine neue Hauptnavigation. | Integration 02 |
| Mikroansicht | Begrenzte, explizit getrennte N=4-Demo statt verstecktem Eingriff in Live-N. | 03-Interaktion |
| Creature-Derivate und Bewegungsstufen | Montage zuerst abnehmen; eine Instanz; aus/reduced schlägt automatisches Verhalten. | Breite 01-Integration |
| Begriffs-/Quellenumfang | Pflichtbegriffe abdecken, vorhandene Texte wiederverwenden; keine starre 18er-Obergrenze. | Quellen-/Contentreview v0.8 |
| Neues Branding aktivieren | Eigene Freigabe für Titel/Favicon/Domain; bis dahin Produktionsidentität unverändert. | Präsentationsassertionen ändern |
| v0.1-Tag | Ref-Situation bestätigen und gegebenenfalls gesondert ursprünglichen Tag herstellen, keine Originaldaten ändern. | Historischer Integritätsabschluss |
| Materialdaten / Gültigkeitsfenster | Quellenwerte, Rundungs-/Übergangsregeln und fehlende Aussagen vor Code beschließen. | 07-Rechnerteil v0.8.5 |
| Tastatur-Platzierung | Kleiner expliziter Alternativpfad als eigener freizugebender UX-Fix; Tour bis dahin überspringbar. | Guided-Discovery-Aufgabe „Körper hinzufügen“ |
| Performance-/Handtestverantwortung | Gleiche Szenen/Runner und Budgets festhalten; reale Assistenztechnik/Handy/Zoom gesondert abnehmen. | Jeweilige Releaseabnahme |

Nicht jede dieser Entscheidungen benötigt eine neue große Spezifikation. Ein kurzer zustimmungsfähiger Absatz mit prüfbaren Beispielen genügt. Nicht offene Fragen durch zusätzliche UI, unbegründete Physik oder stilles Entfernen bestehenden Verhaltens „lösen“.

## 12. Sicherer Work-Implementierungsplan mit Gates

### Etappe 0 · Auftrag und Baseline festziehen

Erst nach separater Baufreigabe. Aktuellen Branch/Produktionscommit prüfen, 159 reguläre/38 Chromium-Fälle sowie 12 Benchmarks/6 Originalprüfungen als Basis protokollieren. A01–A04 und benötigte Entscheidungen beschließen. AGENTS/Statusdokumentation in einem dafür autorisierten Dokumentationscommit aktualisieren. Keine alten Tests oder numerischen Grenzen löschen/lockern. Keine automatischen Deploy-Hooks hinzufügen.

**Gate:** genehmigter Umfang für v0.8, aktuelle CI grün, unveränderte Original-/Benchmarkanker und ausdrückliche Aufteilung zu v0.8.5. Ein Auditbericht allein passiert dieses Gate nicht.

### Etappe 1 · Nur Monster-Webvarianten vorbereiten und abnehmen

Nach dem ausdrücklich verlangten Ablauf der Roadmap zuerst Derivate aus dem Master anfertigen. Noch kein flächiges Einbauen in Labs. Manifest, Bildgrößen/-bytes und Vergleichsmontage liefern; Alpha-/Kanten-/Kleinansicht, Dateiladefehler und Reduced-Motion-Standbild prüfen. Eigenname kann offen bleiben, solange keine fehlende Namensentscheidung mit neuer Produktidentität vermischt wird.

**Gate:** menschliche Sichtabnahme von Mastertreue und kleinen Varianten. Fehlt sie, keine breite Mascot-Integration; fachliche Grundlagen dürfen im genehmigten Umfang unabhängig vorbereitet werden.

### Etappe 2 · Kleines Wissens-/Hilfefundament aus 04

Stabile IDs, Quellenmetadaten, bestehende DE/EN-Schlüssel, fokussierbare Inline-Trigger und ein gemeinsamer Rückweg. Zuerst **ein** vertikales Beispiel im Entropy Lab bis zu Science durchprüfen. Keine komplette Neuarchitektur der Hauptnavigation. Deep-Linkresolver nur so weit wie nötig, Lifecycle mit dynamischen Triggern ausdrücklich absichern.

**Gate:** A01/A02/A08 erfüllt, Link-/Quellen-/Übersetzungsregression tatsächlich im CI-Einstieg, echte Browserprüfung für Rückweg, Escape, Tabwechsel, drei Begriffe, Entwürfe und Modellzustand.

### Etappe 3 · 02/03 in kleinen fachlichen Scheiben

Zuerst Marker-Demo und präzises stationäres Histogramm mit N=4/12; danach Wärme-Energie-/Entropiebilanz aus vorhandenen Werten. Anschließend dieselben kompakten Erklär-/Prognosebausteine auf die übrigen definierten Kontexte anwenden. Änderungen an Erklärtexten separat von Visualisierungen committen, damit fachliche Diffs prüfbar bleiben. Nichts automatisch anwenden, keine neue Physik und keine echten Materialeffekte vortäuschen.

**Gate:** N=1/4/12/32, Vorzeichen/Einheiten, Reversals/Fluktuationen, DE/EN und 320/390/fractional/DPR; Wissen/Quiz lässt Livezustand unberührt. Keine unbeschränkten Zustandslisten. Alle bisherigen Suiten und historischen Ergebnisse bestehen.

### Etappe 4 · Begrenzte Creature-Integration und v0.8-Abschluss

Abgenommene Varianten an wenigen erlaubten Ankern integrieren. Eine Instanz, seltene Reaktionen, abschaltbar, sauberer Abbruch. Erst danach auf weitere freigegebene Kontexte ausweiten. Keine großflächige CSS-/DOM-Erneuerung. Aktuelle fünf Hauptbereiche und beide Entropy-Experimente erhalten.

**Gate v0.8:** Performancevergleich, Fokus/mobile/Zoom/Screenreader-Handprüfung soweit möglich, dokumentierte Lücken statt behaupteter Ergebnisse, alle Suiten/12/6 grün. Pull Request zur **unabhängigen** Prüfung und Nutzerpreview; **kein Merge ohne eigene Freigabe**. Danach gesonderte Release-/Deploymententscheidung. v0.8.5 beginnt nicht allein wegen grünem PR.

### Etappe 5 · Erst auf freigegebener v0.8: Guided Discovery aus 05

Neuen v0.8.5-Branch von der tatsächlich freigegebenen Basis anlegen. Kurze freiwillige Einstiegsroute und begrenzte Labpfade auf vorhandenen fachlichen Daten; echte Aktionen beobachten, manuelle Bestätigung ehrlich kennzeichnen, immer überspringbar. Resume nur während laufender Seite. A07 vor einer betreffenden verpflichtenden Bedienaufgabe lösen oder als freigegebene Einschränkung deutlich dokumentieren.

**Gate:** Kein Guide-Apply/Reset/RNG-Verbrauch; Navigation/Fokus/Resume/Close/Escape/Sprache im echten Browser; bestehende vierstufige Anleitung durch genehmigtes Verhalten ersetzen, ihre Sicherheitsassertionen erhalten.

### Etappe 6 · BH-Ansichten aus 06

Wiederverwendbaren Zeichenkern klein herauslösen, private Controllerzustände getrennt halten. Erst statische korrekte Beschriftungen und zwei Modi, dann die optionale schematische Perspektive und begrenzte Animation. Bewegung darf keine Kennzahlenberechnung oder globale Diagramm-Neuerzeugung treiben. Bestehende Extreme-Ansicht vor/nach Änderung direkt vergleichen.

**Gate:** A10/A13 erfüllt; normierter Maßstab/physikalische Zahlen klar, Fokusmodus mit Warnung, keine behauptete Raytracingvalidierung, keine Massenkopplung. Lifecycle/Performance und alte Renderregressionen bestanden.

### Etappe 7 · Temperaturkontext und Material Explorer aus 07

Zuerst freigegebene Stoffdaten/Übergangsregeln als unabhängig testbare statische Tabelle und reine Auswertung; dann read-only UI zur vorhandenen validierten Temperatur. Zweiten Vergleichsmarker getrennt halten. Keine Erweiterung des 250–600-K-Wärmemodells. Tabellenvergleich und Illustration am Ort des Ergebnisses kenntlich machen.

**Gate:** A05/A06 erfüllt, echte Quellen-/Boundarytests, K/°C-Äquivalenz, 0/tiny/huge, Fehler/Entwurf/Sprachwechsel, kein automatischer Transfer. Fehlt eine belastbare Gültigkeitsaussage, Ergebnis begrenzen statt frei erfundenen Zustand anzeigen.

### Etappe 8 · Nur gezielter Feinschliff aus 08 und v0.8.5-Abschluss

An konkreten Befunden Kontrast, Abstände, Header und Diagrammlesbarkeit verbessern. Vorhandene `ux.css`-Regeln gegen Canvas-/Backing-Store-Rückkopplung bewahren; `aspect-ratio` nicht blind über bestehende Größen-/Containmentregeln legen. Optionale Hintergründe weglassen, wenn sie Budget oder Lesbarkeit belasten. Branding nur nach eigenem Gate.

**Gate v0.8.5:** vollständige alte und neue Suiten, unveränderte zwölf numerischen Ergebnisse und sechs Originaldateien, alle relevanten Entscheidungen/Handtestlücken dokumentiert. Unabhängiger PR-Review, Nutzerabnahme, eigene Mergefreigabe; Deployment nochmals getrennt. Keine automatische Freigabe durch einen Performancewert oder die Anzahl bestandener Tests.

## 13. Reproduktion, Evidenz und Abschluss

```sh
node scripts/test.mjs
node scripts/check-benchmarks.mjs
node scripts/verify-original.mjs
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install --with-deps chromium
node --test tests/browser-review.test.mjs tests/entropy-browser.test.mjs tests/thermal-browser.test.mjs
node docs/v0.8/audit/model-probes.mjs
node docs/v0.8/audit/browser-audit.mjs
```

Historische Skripte benötigen einen vollständigen Git-Checkout. Die Browserinstallation ist eine Entwicklungsabhängigkeit, keine neue Produktionsabhängigkeit. Zusatzmessungen schreiben ausschließlich nach `audit-results/`; sie ändern keine Appdateien. Die Browserinventur sammelt Befundkandidaten und Messwerte, sie behauptet keinen vollständigen WCAG-Pass. Die Streifkontaktprobe dokumentiert gerade eine Modellgrenze und soll daher nicht fälschlich als „Kollisionstest bestanden“ gezählt werden.

**Dauerhafte maschinenlesbare Belege in diesem Branch:** `audit/browser-audit.json`, `audit/model-probes.ci-node22.json`, `audit/model-probes.local-node24.json`, `audit/execution-summary.json`. Screenshots und unmodifizierte Masterkopie liegen in den verlinkten privaten CI-Artefakten; GitHub kann diese nach der konfigurierten Aufbewahrungsfrist entfernen. Der echte Master bleibt im Repository. Die Prüfskripte erlauben ein erneutes Erzeugen der Messungen und Screenshots.

**Abschlussstatus:** Vollständige reguläre Suite und zusätzlicher Auditlauf auf Prüfcommit `3212db998e691b0d099edf5c6f589da3730d1e01` erfolgreich: [reguläre CI](https://github.com/phoscore/entrolab/actions/runs/42637035279), [zusätzlicher Auditlauf](https://github.com/phoscore/entrolab/actions/runs/42637035015), [Screenshots/Asset-Evidenz](https://github.com/phoscore/entrolab/actions/runs/42637035015/artifacts/13683736744). Die in diesem Dokument und den JSON-Dateien verwendeten Zusatz-Browsermessungen stammen aus diesem letzten Lauf. Der anschließende Dokumentationscommit ändert keine produktiven oder bestehenden Testdateien; dessen CI-Abschluss wird bei Übergabe zusätzlich kontrolliert.

Keine neuen Produktfunktionen, keine Änderungen an bestehenden Physikmodellen/Integratoren, kein Merge, kein Deployment und keine Änderung an `main` oder `archive/v0.1`. Die festgestellten Punkte werden als Auditbefunde übergeben; insbesondere wurden weder der fehlende Tag noch die Tastatur-/Navigationslücken oder die Kollisionsgrenze in diesem Auftrag stillschweigend repariert.
