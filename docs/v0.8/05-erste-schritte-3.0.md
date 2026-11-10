# Schritt 05 – „Erste Schritte 3.0“: freiwillige Entdeckungswege

## Inhaltlich vom Nutzer freigegeben – Work-/Merge-/Deployment-Freigabe steht aus

**Freigabe vom 09.11.2026:** Der Eigentümer hat den vorgestellten Schritt 05 ausdrücklich mit „great, dann nehmen wir schritt 05 so“ bestätigt. Damit stehen das kompakte Wahlmenü, ein freiwilliger Schnellstart, eine auswählbare kurze Anleitung je Labor/Unterlabor, echtes selbstständiges Bedienen mit optionaler Schritterkennung/Überspringen, Wiederaufnahme des letzten Guide-Schritts innerhalb der laufenden Seite und seltene kleine Monsterkommentare inhaltlich fest. Keine Genehmigung für Work-Implementierung, PR-Merge oder Veröffentlichung.

**Website:** Reincarnated as a Proton. **Phase:** Planung vor der Implementierung; später v0.8.5, Schritt 05 von 08. **Technische Ausgangsbasis:** v0.7 auf main, danach bei Implementierung die **geprüfte v0.8 mit Schritten 01–04**. Der Eigentümer möchte ausdrücklich alle acht Themen **vor** dem Beginn der Work-Implementierung durchsprechen. Dieser Plan darf jetzt auf dem Planungsbranch `develop/v0.8` dokumentiert werden; der spätere Code für 05–08 kommt erst auf einem eigenen, nach Freigabe von v0.8 abgeleiteten Entwicklungsbranch. Keine Änderung an main/öffentlicher Website und keine Work-Ausführung ohne ausdrückliche Baufreigabe.

## 1. Ist-Zustand in v0.7: solide, aber zu eng

Der vorhandene Schnellstart (`dist/discovery.mjs` und `#quickStart` in `dist/index.html`) ist ein **vierstufiger** freiwilliger Hilfspfad, der fast nur einen Vorgang im **Entropy / Wärme & Entropie**-Experiment erklärt:
1. Entropy-Tab auswählen.
2. Unteransicht Wärme & Entropie auswählen; Ausgangstemperaturen vergleichen.
3. 10 Modellsekunden vorwärts, Temperatur-/Energieverhalten beobachten.
4. Eigene Anfangstemperatur einstellen und erst nach `Übernehmen` den gültigen Modellstart ändern.

Die Hilfe hebt echte Steuerelemente hervor, kann sie fokussieren und dorthin scrollen, ist per Schließen/Escape abbrechbar, erkennt wenige sinnvolle Erfolgsschritte und ändert Laborparameter nicht eigenmächtig. DE/EN ist vorhanden. **Das ausdrücklich bewahren.**

Grenze: Neue Nutzer bekommen keine gut verständliche, gleichwertige Einführung in Gravity, Black Hole, Extreme Objects oder Extreme Temperature; Science-Modellgrenzen und Quellen bleiben ohne Einstieg. Wer nur kurz sehen will, was möglich ist, landet sofort in einer geführten Unteransicht.

## 2. Ziel: Einladende, wählbare Hilfe – nicht noch ein Quiznetz

Der Guide erklärt **wo** man anfängt, **welches echte Bedienelement** man benutzen kann, **was sich ungefähr zeigen sollte** und **wo die zugehörige kurze Erklärung** aus Schritt 02 sowie die vertiefte Modell-/Quellenhilfe aus Schritt 04 zu finden ist.

Prinzipien:
- **Freiwillig und standardmäßig geschlossen**; kein Zwang beim ersten Besuch, keine sperrenden Modals, kein „erst fertig machen, dann darfst du simulieren“.
- **Kurze Entdeckungsroute** für neugierige Anfänger plus **Labor auswählen / etwas mehr verstehen** für gezielte Interessenten. Keine endlose horizontale Stepper-Leiste.
- Die Inhalte aus Schritt 02 („eine Hauptfrage + optionales Miniexperiment“), Schritt 03 (Mikrozustände/Energie-/Entropiebilanz) und Schritt 04 (Begriffe, Quellen) **wiederverwenden**, nicht eine zweite widersprüchliche Sammlung von Physikaussagen schaffen.
- **Einfacher Ausstieg** an jedem Punkt, wiederholbar. Der Guide soll eine Anleitung sein, **kein neuer Zustand der Simulation**.

## 3. Zwei Ebenen des Einstiegs (Vorschlag zur Nutzerentscheidung)

### Weg A – „Schnell mal ausprobieren“

Ein kompakter Start mit 3 allgemein gültigen Schritten:
1. **Labor auswählen**: Wo sind die 4 experimentellen Haupttabs? Gravity, Black Hole, Extreme Objects (einschließlich Temperature), Entropy (mit 2 Unterexperimenten). `Modell & Quellen` ist die wissenschaftliche Bibliothek, kein fünftes Experiment.
2. **Eine Sache verändern**: Nutzer wählt eines von **3 leicht verständlichen Beispielen** oder ein frei gewähltes Labor. Beispiel Gravity: vorhandenes Szenario umschalten; Black Hole: Masse ändern; Entropy: einzelne Marker-Schritte oder thermische Modellzeit. **Kein Beispiel muss alle Labore bei einem Besuch ablaufen.**
3. **Etwas daraus lernen**: Passende Hauptfrage aus Schritt 02 öffnen, freiwillig „Was glaubst du, passiert?“ testen, bei Bedarf zum Modell-/Quellenkapitel aus Schritt 04 springen. Danach Abschluss mit „Frei experimentieren“ statt Newsletter, Belohnungssystem oder Zwang.

**Dauer nicht als Countdown.** Jeder einzelne Schritt bleibt freiwillig; keine Blockade, wenn ein Interaktionsereignis wegen Eingabe oder Modelldetails nicht wie erwartet erreicht wird. Sichtbar „Überspringen“ neben „Weiter“.

### Weg B – „Ein Labor genauer kennenlernen“

Auswahl einer **kleinen Liste fachlich ehrlicher Laborminiwege** (als freiwillige Unterpfade); maximal 3–5 klare Handlungen je Weg, die an tatsächlich vorhandenen Controls getestet werden:
- **Gravity:** Szenario (z. B. Doppelsterne oder ein Körper mit veränderter Anfangsgeschwindigkeit) bewusst wählen → einen Parameter verändern → Bahn/Trajektorie vergleichen → Annahmen/Bahnmodell prüfen. Nicht garantieren, dass ein bestimmte Bahn bei unkontrollierten Einstellungen immer entsteht.
- **Black Hole:** Masse einstellen → berechneten Schwarzschild-Radius und Hawking-Temperatur vergleichen → knappe Modellfrage öffnen → erklären, was die schematische Grafik NICHT darstellt. Kein vorgetäuschtes Raytracing.
- **Extreme Objects:** Sterne/kompakte Objekte vergleichen → Größen-/Dichtedarstellung bewusst interpretieren → eine Modellgrenze (z. B. typischer Wert vs. Materialradius/Horizont) kennenlernen.
- **Extreme Temperature:** Kelvin/Celsius vergleichen → ein echtes Temperaturbeispiel auswählen → bei **250–600 K** eine Temperatur zum Wärmeexperiment lediglich **vormerken** und dort ausdrücklich **Übernehmen** betätigen. Keine Übernahme für extreme außerhalb des Modells liegende Temperaturen, kein heimlicher Reset.
- **Entropy – Marker:** Mikrozustand/Makrozustand unterscheiden → denselben k-Wert mit verschiedenen Markeridentitäten erleben → Gleichgewichtsverteilung von einem einzelnen nächsten Schritt unterscheiden. Bei N=12 z. B. k=6 hat 924 mögliche Zuordnungen.
- **Entropy – Wärme:** Zwei Starttemperaturen vergleichen → 10 Modellsekunden explizit selbst schalten → berechneten Temperatur-, Energie- und Entropieverlauf lesen → ein Preset oder einen zulässigen Anfangswert bewusst **Übernehmen**. Erhaltungs- und Bilanzwerte als eigene Aussagen.
- **Science / Quellen:** Optionaler **Wegweiser**, keine physikalische Simulation: Modellhinweis finden, Begriff nachschlagen, zur geöffneten Laboransicht **mit Fokus** zurückkehren.

Nicht sieben lange Pflicht-Touren; jede Route bleibt auswählbar und überspringbar. Dass die Schnellroute nicht *alle* Labore abdeckt, ist **Absicht**; die Labortouren sind der tiefe Weg.

## 4. Kleine UI-Skizze

Vorschlag: bestehende `Erste Schritte`-Schaltfläche im Header und `#quickStart` als Ausgangspunkt behalten; beim Aufruf eine kompakte Entscheidung:
```text
Erste Schritte
Entdecke die Labore, ohne etwas kaputtzumachen.
[ Schneller Einstieg ]       [ Ein Labor auswählen ]
---------------------------------------------
Wenn „Ein Labor auswählen“:
Gravity  ·  Black Hole  ·  Extreme Objects
Temperature  ·  Entropy: Teilchen  ·  Entropy: Wärme
[ Model & Quellen kennenlernen ] (optional)
---------------------------------------------
[ Weg überspringen ] [ Schließen ] 
```
- Falls das Monster in Schritt 01 und 08 schon existiert: dieselbe zentral verwaltete rote skizzenhafte Figur darf **einmal klein** am Rand peeken. Nie zweite Instanz, keine Daueranimation, kein blockiertes UI.
- Je Guide-Schritt nur **eine Kernanweisung**, genau **ein** sinnvoller visuell markierter Zielbereich und optional ein knapper „Warum?“-/ⓘ-Hinweis. Keine großen Texttafeln.
- Auf Handy besser ein kompakter Inline-/Top-Bereich nahe oberem sichtbarem Lab; nicht fünf aneinandergereihte seitliche Tooltipblasen, die den Bildschirm verdecken.

## 5. Ereignisse, Navigation und sichere Zustände

- Bestehende fachliche Events/Controls **prüfen**, bevor ein Schritt als automatisch abgeschlossen gilt. `dist/discovery.mjs` kennt derzeit `data-tab`, `data-entropy-view`, `thermal-stepped` und `thermal-applied`. Weitere Ereignisse nur hinzufügen, wenn tatsächliche Nutzeraktion zuverlässig erkannt wird.
- Bei Guide-Navigation darf eine explizite Aktion **zum entsprechenden Lab wechseln**, wenn der Nutzer tatsächlich auf „Zum Labor“ klickt. **Nie** die konkreten Simulationsparameter ungefragt mutieren. Bereits begonnene Eingaben und Spielzustände über Tab-/Sprachwechsel bewahren.
- Ein Schritt kann „erledigt“ zeigen, wenn echter Zustand das Ziel erfüllt; aber **„Überspringen“ muss unabhängig davon funktionieren**. Kein Stepper-Deadlock bei Sonderwerten, versteckten Ansichten oder eingeschränkten Geräten.
- Beim Sprachwechsel: ausgewählten Weg, Guide-Schritt, offene Erklärung, Simulatorentwürfe, Fokus (so weit sinnvoll) erhalten. Hauptausgabe des Modells unverändert.
- Beim Wechsel von Unteransichten: Highlight vom alten Ziel entfernen, nur sichtbare/verbundene Elemente fokussieren; keine verwaisten Selektoren oder DOM-Knoten.
- Bei offenem Glossar/Science muss ein „Zurück zum Labor“ den letzten sinnvollen Kontext wiederherstellen. Guide darf die bereits funktionierende `guide.mjs`-Fokusrückgabe nicht zerstören.
- Escape, Schließen, Unterbrechung durch Tabwechsel, Hidden-Page, reduziertes Bewegungssetting und Zoom vorhersehbar behandeln. Standardweg reinitialisiert beim erneuten Start oder bietet bewusst „Fortsetzen/Neu beginnen“ – **noch offen** (siehe Entscheidungen).
- Keine Telemetrie, Profile, Cookies, Punkte, Achievements oder externe Bibliotheken als versteckte Nebenkosten.

## 6. Didaktische Regeln

- Ein Guide-Schritt nennt **genau das existierende UI-Element** und beschreibt dessen Wirkung wissenschaftlich zutreffend. **Keine** Behauptung, der Guide selbst stelle kosmische Ergebnisse her.
- **„Woran erkenne ich es?“** anhand echter sichtbarer Laborausgabe. Beispielsweise im Wärme-Lab: Wärme fließt im aktuellen passiven Modell von heiß nach kalt; Energiegesamtwert bleibt, aber die Temperaturdifferenz verringert sich.
- Das Marker-Experiment bleibt eine diskrete Zähl-/Markov-Illustration, **keine Gasbewegung**. Die Schwarzschild-Ansicht ist kein realistischer Lichtstrahl-Solver.
- Die Extreme-Temperature-Brücke darf nur zulässige 250–600 K als Entwurf übernehmen; Nutzer muss bewusst selbst „Übernehmen“ ausführen. Handbuchbeispiele wie `-23.15 °C` müssen mathematisch korrekt als 250 K behandelt werden.
- **Besser ein verifizierbares Beispiel als vier suggestive Behauptungen.** Fachliche Quellen über das neue Step-04-Wissenssystem, keine extra Guide-Wissenschaftsdatenbank.
- Die roten Monster-Sprüche sind selten und leicht spöttisch, aber **kein Ersatz für Hilfetexte**.

## 7. Acceptance Tests / Definition of Done für Work

1. Freiwillige Hilfsschaltfläche öffnet einen kompakten Wahlbereich; keine automatische Tour bei Erstanmeldung/erstem Besuch, und keine Pflichtauswahl.
2. Schnellroute deckt **Orientierung → eine Handlung → Erkenntnis** ab und lässt die freie Laborwahl zu; Laborroute für jedes aktive Lab/Unterlab führt über **reale** UI-Regler und Werte zum Abschluss. Auf keinem Weg darf eine erfundene Schaltfläche im Text stehen.
3. Abschluss, „Überspringen“, „Zurück“, „Schließen“, Escape, Wiederöffnen und Sprachwechsel sind vollständig keyboard-/mobile- und screenreader-sicher. Stufenwechsel verursacht weder Fokusfalle noch Scroll-Jank.
4. Test mit Thermaleingabe als noch **nicht übernommener Entwurf**: Guide-Wechsel verändert weder `params`, `time`, `applied`, noch Inhalte der Felder. `thermalTransferCandidate`-Grenzen erhalten, ungültige Werte nicht übernommen.
5. Marker-N, k, Schritte, RNG-Zustand und playing bleiben bei Guide-Navigation unverändert, sofern keine **explizite** Nutzeraktion den Originalcontrol bedient. Thermale Darstellung bleibt beim bloßen Vorwärtsklicken im Guide unberührt.
6. Hidden-/Offscreen-Ansichten, Reduced Motion und Pausenverhalten: keine Timer-Leaks, keine unendliche Guide-Schleife und keine Hintergrundanimation durch bloß geöffneten Guide.
7. DE/EN vollständig, auch auf 320 und 390 px ohne Horizontalüberlauf, Button-Overlap, Cut-offs und nicht erreichbare Ziele. Gesicherte Integrationsregression mit Schritt 02/03/04.
8. Bestehende Test- und Originalintegrität einschließlich zwölf numerischer Benchmarks unverändert. Neue echte Chromium-Tests für das Guide-Wahlmenü, jede Laborroute, Navigation/Back/Skip und barrierefreies Fokussieren.
9. Kurze Dokumentation, welche Ziele und Events tatsächlich geprüft wurden und welche Labfunktionen mangels vorhandenem Controller nur als manuelle Anleitung möglich sind. Keine gefälschte „automatisch abgeschlossen“-Funktion.

## 8. Scope-Grenzen / Zusammenarbeit

**MUSS:** wählbarer schneller Einstieg + gezielte Labor-Miniwege + eine funktionierende reale Beispielhandlung je aktivem Labor, robuste Navigation, übersetzte Kurztexte, mobile Zugänglichkeit.

**SOLL:** optionaler Deep-Link zur exakt passenden Schritt-02-Hauptfrage, zu Advanced und Schritt-04-Quellen; dezente Monsterreaktion; ggf. „diesen Weg erneut ausprobieren“.

**NICHT:** riesiger Gaming-Quest-Baum, Chatbot, Tutor-KI, Server, Lernkonten, Progress-Ranking, tägliche Streaks, umfangreiches Kursprogramm oder zusätzliche Hauptnavigation.

**Abhängigkeit:** Erst nach v0.8-Review/Entscheidung werden die Details auf den tatsächlich implementierten Schritt-02-bis-04-UI-Elementen verbindlich verankert. Der v0.8.5-Plan darf **vorher** komplett ausformuliert werden; **die Realisierung beginnt später**. Keine Implementierung als Nebenwirkung dieser Dokumentation.

## 9. Vom Nutzer bestätigte Produktentscheidungen

1. **Wahlmenü statt Pflichtmarathon:** kompakter 3-Schritte-Schnellstart oder jederzeit auswählbare Labor-Miniführungen für jede aktive Experimentansicht, mit Wahlfreiheit und Abbruchfunktion.
2. **Echte Interaktionen:** Nutzende bedienen die vorhandenen Steuerelemente selbst. Ein Schritt kann anhand realer passender Aktionen als erfüllt gelten; **Überspringen und Zurück jederzeit**, keine automatische Simulation oder Modelldatenmutationen.
3. **Wiederöffnung:** den letzten angefangenen Weg/Schritt während der aktuell laufenden Seite wieder aufrufen und bei Wunsch ausdrücklich **Neu beginnen**. Keine Speicherung über Sitzungen, kein Nutzerprofil und kein Tracking.
4. **Monster:** sehr gelegentlich eine dezente Randreaktion der einen roten skizzenhaften Figur. Wissenschaftliche Informationen und Guide-Bedienung sind auch ohne Monster vollständig zugänglich.

**Planungsstatus: SCHRITT 05 INHALTLICH FREIGEGEBEN (09.11.2026).** Nach Abschluss der Planung 06–08 zuerst v0.8 implementieren, prüfen und nur nach Merge-/Releasefreigabe die v0.8.5-Implementierung auf eigenem Branch starten. **Keine Work-Implementierung ohne spätere ausdrückliche Freigabe.**
