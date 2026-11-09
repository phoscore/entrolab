# Schritt 02 – Warum passiert das? Wozu sollte mich das interessieren?

> **Aktueller Umsetzungsstand (09.11.2026):** Schritte 01–04 sind ausdrücklich zur Implementierung auf dem isolierten Entwicklungsbranch freigegeben. Frühere Aussagen „keine Work-/Codefreigabe“ in diesem Plan sind damit für 01–04 überholt. Monsterintegration erst nach Sichtfreigabe; Merge, Deployment, Domain-/öffentliches Rebranding und Schritte 05–08 bleiben gesperrt. Verbindliche Präzisierungen: [Umsetzungsvertrag v0.8](Umsetzungsvertrag_v0.8.md).
## Plan v0.8 – Umsetzung 01–04 freigegeben

**Projektname:** Reincarnated as a Proton (vom Eigentümer gewählt, noch keine Domain-/Produktionsumstellung). **Scope:** v0.8 Phase 1, Schritt 02 von 08; siehe [Roadmap](README.md). **Entscheidungsstatus: VOM EIGENTÜMER INHALTLICH FREIGEGEBEN (09.11.2026)**. Die Auswahl des minimalen Erklärformats, der kleinen optionalen Prognose-Ausklapper in allen Laboren sowie der Positionierung und des Anwendungsmixes ist beschlossen. Alle Beispieltexte, Antwortmöglichkeiten und Verbindungen zu Controls müssen bei der Umsetzung gegen die echte App und wissenschaftliche Quellen geprüft werden. **Dies ist keine Freigabe, Code zu schreiben, in main zu mergen oder die Website zu deployen.**

## Verbindliche Nutzerentscheidung – Minimal-Variante (09.11.2026)

**Eine einzige Hauptfrage pro definiertem Fachkontext im jeweiligen vorhandenen Abschnitt** (inkl. eigenständigem Entropy-Marker- oder Wärme-Unterexperiment und Extreme-Objects-/Temperature-Kontext). Keine sichtbaren Mehrfach-Fragenkacheln, kein vorgeschaltetes Pflicht-Tutorial, kein permanent offener Erklärblock.

- Standardansicht: **geschlossen**, aber mit **einer gut sichtbaren, prägnanten Frage als kleinem Erklär-Trigger** nahe der jeweiligen Laborüberschrift oder dem Haupt-Experiment; die Frage selbst ist der verständliche Zugang, nicht ein bloßes ⓘ-Symbol. Die eigentliche Simulation bleibt visuell dominant.
- Öffnen per Klick, Enter oder Space: eine überschaubare Antwort mit **Was passiert? / Warum? / Probier es aus / Wo ist das nützlich?**. Optionaler Link zu **Modellgrenzen & Quellen**. Die kurze Erklärung darf mehrere 1–2-Satz-Absätze enthalten, aber keine Textwand.
- **Weitere verwandte Fragen, Beispiele und Fachdetails werden standardmäßig versteckt** und sind erst über einen freiwilligen „Mehr Fragen / genauer verstehen“-Bereich abrufbar. Sie verdrängen die Hauptfrage nicht und lösen keine automatische Änderung an Eingaben/Simulationen aus.
- Bei Labor- oder Unteransichtswechsel wird exakt die **neue** passende Hauptfrage sichtbar; verborgene Tabs dürfen nicht zusätzliche sichtbare Fragen oder Monsterinstanzen erzeugen. Extreme Objects und Temperature sind gleichzeitig sichtbare Abschnitte: jeder besitzt seine eigene geschlossene Frage, ohne neue Hauptnavigation oder scrollgesteuerten Austausch. Im Glossar/Science-Bereich gelten kontextuelle Begriffslinks, keine falsche „sechste Simulation“.
- Bei Sprachwechsel die gewählte Frage und offene/geschlossene Erklärzustände sinnvoll erhalten, keine Übersetzungsschlüssel als Text zeigen. Mobile: maximal eine kompakte Erklärung im sichtbaren Kontext, kein Overlap mit Bedienknöpfen.
- **Zusatzentscheidung vom Nutzer:** Jedes Labor (inklusive beider Entropy-Unteransichten und der Temperature-Ansicht) erhält **ein kleines freiwilliges, standardmäßig eingeklapptes „Was glaubst du, passiert?“-Vorhersageexperiment** innerhalb seiner Hauptfrage. Es erscheint nie als zusätzliche sichtbare Hauptkachel. Erst die Person entscheidet, ob sie es aufklappt, eine Vermutung wählt, eine Erklärung einblendet und das Ergebnis im echten Lab überprüft. Details unten.
- **Abschließende Nutzerentscheidung vom 09.11.2026:** Die eine Hauptfrage steht **direkt unter der jeweiligen Laborüberschrift**, gut auffindbar und anfangs geschlossen. Erklärungen enthalten ungefähr **halb Alltag/Technik und halb Universum/Kosmos**, aber **nur bei fachlich passenden Themen** – je Lab darf die Gewichtung abweichen. Die vorgesehene kompakte „Warum/Wozu“-Struktur und der freiwillige Prognose-Ausklapper sind damit **inhaltlich freigegeben**, vorbehaltlich der fachlichen Prüfung konkreter Beispielwerte und der späteren gesonderten Baufreigabe.

### Konkret zu testender UI-Entwurf (Textskizze)

```text
┌───────────────────────────────────────────────┐
│ ENTROPY LAB — Teilchenverteilung              │
│                                               │
│ › Warum sind ungefähr gleiche Verteilungen   │
│   so viel häufiger?                           │
│                                               │
│ [Hier unverändert die eigentliche Simulation] │
└───────────────────────────────────────────────┘

Nach freiwilligem Öffnen der Frage:
▾ Warum sind ungefähr gleiche Verteilungen so viel häufiger?
  Weil viel mehr einzelne Anordnungen zur ungefähr
  hälftigen Verteilung passen als zu einer Extremverteilung.
  → Probier es: Vergleiche die Möglichkeiten im Diagramm.
  → Bezug: Zufall und große Zahlen in der statistischen Physik.
  [Modell & Quellen] [Mehr Fragen ...]
```

**Wichtig:** Das ist eine **didaktische Layoutskizze**, nicht die endgültige Entropy-Erklärung. Der vorhandene Markermechanismus bleibt nur ein gewähltes statistisches Lehrmodell, keine echte mikroskopische Gasdynamik.

## Verbindliche Ergänzung – freiwilliges Vorhersageexperiment in allen Laboren (09.11.2026)

**Überall, wo es ein aktives, experimentelles Labor gibt, soll genau ein passendes interaktives Miniexperiment angeboten werden**, erreichbar **erst nach dem freiwilligen Aufklappen** der Hauptfrage, und darin standardmäßig ebenfalls **eingeklappt**. Die Fragen leiten nicht nur zum Raten an, sondern zu einer sichtbaren Veränderung oder einem prüfbaren Zusammenhang im bestehenden Lab.

### Interaktionsvertrag

1. Geschlossen: nur eine gut sichtbare Hauptfrage je aktiver Ansicht; **kein** sichtbares Multiple-Choice-Quiz auf der Standardoberfläche.
2. Nach Öffnen der Hauptfrage: kurz erklären, was und warum; daneben ein unaufdringlicher, ausdrücklich optionaler Ausklapper **„Was glaubst du, passiert?“**.
3. Nach Öffnen des Miniversuchs: eine klare physikalische Prognosefrage mit **2–3 kurzen verständlichen Möglichkeiten** oder wo sachgerechter einer qualitativen Vorhersage. Nichts vorab als falsch/richtig markieren. Bei fachlich nicht sauber binärer Vorhersage einen ehrlichen Ergebnisbereich/Modellbezug angeben.
4. Erst nach Auswahl bzw. explizitem **„Antwort prüfen“** die Erklärung zeigen; freundlich bei Irrtum, niemals Nutzer bewerten. Alternativ **„Lösung anzeigen“** anbieten, niemand muss raten.
5. Anschließend eine **„Im Labor ausprobieren“**-Anleitung, die auf **einen tatsächlich verfügbaren Regler, Preset oder Anzeigewert** zeigt. Die Anweisung muss genau zu dem aktuell simulierten, gegebenenfalls idealisierten Modell passen. **Nicht automatisch** Werte verändern, Simulation starten, Reset/Apply ausführen oder physikalische Zustände verändern.
6. Beim Schließen, Navigation oder Sprachwechsel keine verlorenen Entwurfswerte, Fokusfehler oder ungewollte Nebenwirkungen. Antwortwahl darf ohne Simulationsseitenwirkung zurückgesetzt werden. DE/EN, Tastatur und Screenreader bedienen können. Keine Punkte, Streaks, Profile, Bewertung oder Datensammlung.
7. Der Monstercharakter darf **selten** mit einer Blickänderung/einem scherzhaften Einzeiler erscheinen, **nicht** Antworten verraten, falsche Daten vermitteln oder die richtigen Erklärungen ersetzen. Maximal ein sichtbares In-Page-Wesen.

### Erste zu prüfende Prognosefragen je aktivem Lab / Unterlab

| Bereich | Vorschlag für die im Ausklapper versteckte Frage | Erwartete Erkenntnis / realer Test |
|---|---|---|
| Gravity Sandbox | „Ändert sich die Bahn, wenn ein Körper eine andere seitliche Anfangsgeschwindigkeit erhält?“ | **Ja**; im vorhandenen Sandbox-Setup, mit konstanten übrigen Parametern, verschiedene Startgeschwindigkeiten/Trajektorien vergleichen. Nicht so tun, als gäbe es für alle Parameter nur einen Orbittyp. |
| Black Hole Lab | „Was passiert im nicht rotierenden Schwarzschild-Modell mit dem Horizont-Radius, wenn du die Masse verdoppelst?“ | **Er verdoppelt sich** (\(r_s = 2GM/c^2\)); Masse und Radius mit vorhandener Anzeige vergleichen. |
| Extreme Objects Lab | „Wird auf einer linearen Vergleichsskala ein viel kleinerer Radius eher unsichtbar als auf einer logarithmischen?“ | **Ja, relativ zum größeren Objekt**; vorhandenen linear/logarithmisch-Umschalter vergleichen; Logskala bedeutet **nicht** maßstabsgetreues Größenbild. |
| Extreme Temperature Lab | „Reicht die Temperatur eines Objekts, um seine gesamte thermische Energie zu kennen?“ | **Nein**; hängt unter anderem von Menge/Stoff/Zustand ab. Mit Temperatur- und anschließender eingeschränkter Wärmeexperiment-Ansicht nachvollziehen; **keine numerische Energievorhersage allein aus der Extremtemperatur** vortäuschen. |
| Entropy Lab: diskrete Marker | „Bei zwölf unterscheidbaren Markern: Sind mehr Anordnungen mit sechs links/sechs rechts möglich als mit zwölf links/null rechts?“ | **Ja**: \(\binom{12}{6}=924\) gegenüber \(\binom{12}{12}=1\), sofern aktuelle Zählkonvention genau so gilt; Zähler/Verteilung im bestehenden Lehrmodell ablesen. Keine reale Gasdynamik daraus behaupten. |
| Entropy Lab: Wärmeausgleich | „Fließt zwischen zwei gleich warmen Körpern in unserem passiven Leitmodell Netto-Wärme?“ | **Nein**, solange beide Anfangstemperaturen gleich sind (\(P = G_{th}(T_A - T_B)=0\)); mit bereits vorhandenem Gleichgewichts-Preset und **bewusstem Übernehmen** testen. Energieerhaltung und Entropieproduktion erklären. |

**Kein Quiz für Science/Glossar als „eigenes sechstes Labor“:** Der Bereich ist eine Referenz und soll Erklärungen/Begriffe verbinden, nicht zusätzliche obligatorische Spielmechanik erhalten.

Diese Beispiele sind **didaktische Vorschläge** und müssen vor dem fertigen Work-Auftrag gegen aktuelle UI-Controls und vorhandene Physikregeln geprüft, sprachlich DE/EN ausgearbeitet und nach Nutzerfreigabe finalisiert werden. Schritt 03 darf die Entropy-Prognosen später inhaltlich vertiefen, muss die **minimalistisch eingeklappte Schnittstelle** aber erhalten.

## 1. Das eigentliche Problem

Die existierenden Simulationen können technisch korrekt und faszinierend aussehen, aber Besuchende ohne Vorkenntnisse wissen häufig nicht:
- Warum sollte ich überhaupt einen Regler bewegen?
- Was ist eine erkennbare Ursache und was nur eine zufällige Beobachtung?
- Wofür kann ich dieses Wissen außerhalb der Website verwenden?
- Wo hört das vereinfachte Modell auf?

**Ziel:** Jede Hauptfunktion liefert einen schnell erkennbaren Zugang von Beobachtung → Ursache → eigenes Experiment → Bedeutung → weiterführendem Wissen. Keine Zwangsquizze, keine textlastige Einführung vor jeder Aktion, keine erfundenen Alltagsanwendungen für sehr spekulative Themen.

## 2. Wiederverwendbare Bausteine (Vorschlag)

Ein **gemeinsames, stilistisch einheitliches Erklärungsmuster** für relevante Labs, nicht viele technisch unabhängige Popup-Systeme. Inhalte in Deutsch und Englisch, jeweils an das aktive Experiment gebunden.

**Kompaktstufe – sofort verständlich, vor allem für Anfänger:**
1. **Eine Frage**, die neugierig macht; ein Satz ohne Fachjargon.
2. **Was du gerade siehst:** echte Zuordnung zu sichtbarer Simulation; Zustand und Einheit korrekt benennen.
3. **Warum:** kurze zutreffende Ursache; kein „wegen Entropie“ ohne Erklärung.
4. **Probier es:** eine freiwillige, klar benannte Aktion („ändere X“); konkrete Erwartung / Vorhersage und anschließend passende Deutung.
5. **Warum relevant:** alltagsnahe Technologie ODER kosmisches Naturverständnis; ehrliches „Verstehen statt unmittelbarer Nutzen“, wenn der praktische Transfer indirekt ist.

**Optional darunter:** „Genauer verstehen“, verknüpft mit Schritt 04 („Modelle & Quellen / Begriffe“). Diese Sektion darf Formeln, Belege, Voraussetzungen und Grenzen enthalten, soll aber **nicht** als zweite widersprüchliche Wissensdatenbank implementiert werden.

**Ton:** knapp, erklärend, neugierig, nachvollziehbar. Monster kann selten einen einzelnen ironischen Satz beisteuern, aber niemals erforderliche Erklärung ersetzen oder physikalisch Falsches als Fakt setzen.

## 3. Inhalt je Hauptbereich – Vorschläge für die gemeinsame Abnahme

### A. Gravity Sandbox

**Einstiegsfrage:** „Warum fällt der Mond nicht auf die Erde – oder tut er das gerade die ganze Zeit?“
- **Beobachtung:** Körper ziehen einander an und bewegen sich mit einer Anfangsgeschwindigkeit.
- **Warum:** Gravitation verändert die Bewegungsrichtung, tangentiale Geschwindigkeit ermöglicht einen Orbit statt direkten Aufprall. Der Mond ist im anschaulichen Sinn ständig im freien Fall.
- **Mini-Versuch:** Im bestehenden Szenario einen Körper mit unterschiedlicher seitlicher Anfangsgeschwindigkeit starten, Pausen-/Vorschau-Mechanik nutzen, Orbit vs. Flucht vs. Kollision vergleichen (nur wenn wirklich unterstützt und numerisch stabil).
- **Wirklichkeit:** Satellitenbahnen, Raumfahrt, geostationäre Satelliten; konkrete reale Bahnen nur mit passenden Daten und Näherungen vergleichen.
- **Grenzen:** N-Körper-Numerik statt universell exakter Bahnvorhersage, andere Körperkräfte fehlen, idealisierte Massen/Skalen.

**Weitere Einstiegsfragen:** „Warum kann eine kleine Geschwindigkeitsänderung eine große Bahnänderung bewirken?“; „Warum ist ein Dreikörperproblem schwieriger als zwei Körper?“

### B. Black Hole Lab

**Einstiegsfrage:** „Was bedeutet ein Ereignishorizont – und warum kommt Licht nicht wieder heraus?“
- **Beobachtung:** Radius, Masse und andere angezeigte Größen hängen im vorhandenen Schwarzschild-Modell zusammen.
- **Warum:** Horizont ist eine kausale Grenze der Raumzeit, kein fester schwarzer Ball. Erklärungen nicht auf eine falsche rein Newtonsche „Fluchtgeschwindigkeit größer c“-Mechanik reduzieren.
- **Mini-Versuch:** Masse ändern und Verhältnis zum Schwarzschild-Radius beobachten; als Prognose zunächst z. B. „Verdoppelt sich der Radius bei doppelter Masse?“
- **Wirklichkeit:** Beobachtungen und Modellinterpretation astrophysikalischer kompakter Objekte, EHT-/Gravitationswellen-Beispiele, jeweils korrekt zuordnen.
- **Grenzen:** Modell ohne Rotation/Ladung, Hawking-Strahlung theoretisch/nicht astrophysikalisch direkt gemessen, Bilder teils stilisiert; kein unbelegter Akkretionsscheiben-Realismus.

**Weitere Einstiegsfrage:** „Warum ist ein Schwarzes Loch nicht automatisch ein kosmischer Staubsauger?“

### C. Extreme Objects + Extreme Temperature

**Einstiegsfrage:** „Wie können Sterne extrem dicht werden, ohne sofort Schwarze Löcher zu sein?“
- **Beobachtung:** Größen- und Dichtevergleiche Weißer Zwerg/Neutronenstern/schematischer BH, sorgfältige Definition der angezeigten Größen.
- **Warum:** Nach einem Sternleben spielen Gravitation und mikrophysikalische Stützung eine Rolle; verständlich unterscheiden, welche Näherung in welchem Objekt gilt.
- **Mini-Versuch:** Vordefinierte Objektvergleiche und lineare/logarithmische Skalierung bewusst kontrastieren.
- **Wirklichkeit:** Sternentwicklung, Supernova-Überreste, Pulsare, astronomische Messungen; keine Behauptung, ein beliebiger Stern werde direkt zu einem dieser Objekte.
- **Grenzen:** Schwarzschild-Radius kein Materialradius; pulsierende Lichtstrahlen sind Illustrationen.

**Temperatur-Kurzfrage:** „Ist etwas mit 1.000.000 K immer energiereicher als etwas mit 300 K?“
- **Warum:** Temperatur ist nicht einfach die gesamte gespeicherte Energie; diese hängt etwa von Material, Menge und Zustand ab. Extreme Temperaturen physikalisch kontextualisieren.
- **Mini-Versuch:** Niedrige/hohe Temperaturskalen vergleichen; eine **zulässige** Temperatur im Wärmeexperiment vormerken und erst dort übernehmen. Keine ungültige Temperatur in das 250–600-K-Thermalmodell übertragen.
- **Wirklichkeit:** Wärmeisolierung, Kühlsysteme, Thermometerskalen, Sternplasmen; nicht dieselben Materialgesetze auf alle Kontexte übertragen.
- **Hauptausbau des Temperatur-Labs** bleibt **Schritt 07 / v0.8.5**; Schritt 02 ergänzt nur das verbindende „Warum/Wozu“-Format.

### D. Entropy Lab – diskrete Marker

**Einstiegsfrage:** „Warum tritt eine ungefähr gleichmäßige Verteilung häufiger auf als alle Marker auf einer Seite?“
- **Beobachtung:** einzelne Mikrozustände vs. Anzahl möglicher Anordnungen eines Makrozustands.
- **Warum:** viel mehr passende Mikrozustände in der Mitte (bei der gewählten Zählweise, festem N), nicht „Teilchen wollen von Natur aus Ordnung zerstören“.
- **Mini-Versuch:** Markerzahl bzw. Verteilung ändern, zuerst Ergebnis schätzen, dann Häufigkeit und Einzelschrittverlauf unterscheiden.
- **Wirklichkeit:** Wahrscheinlichkeit, Statistik, qualitative Motivation für thermodynamische Phänomene; ausdrücklich **kein reales Gasdiffusionsmodell**.
- **Grenzen:** Modellregel q, diskrete Marker, endliche Fluktuationen; einzelne Zufallsverläufe können Entropie senken.
- **Vertiefter didaktischer Entropie-Umbau** gehört **Schritt 03**, Schritt 02 liefert die gemeinsame Erklärungsschablone und verlinkt darauf.

### E. Entropy Lab – Wärme & Entropie

**Einstiegsfrage:** „Warum wird warmer Kaffee kalt, aber kalter Kaffee im selben Raum nicht spontan heiß?“
- **Beobachtung:** Energieübertragung heiß → kalt, Energieerhaltung, Annäherung an Gleichgewicht.
- **Warum:** für zwei passive endliche Wärme-Reservoire in einem isolierten Modell ist Gesamtentropieproduktion nicht negativ; die beiden Temperaturen entwickeln sich analytisch gemäß Modell.
- **Mini-Versuch:** unterschiedliche Anfangstemperaturen und Wärmekapazitäten vergleichen; Energie- und Entropieanzeigen gemeinsam lesen, keine automatische Änderung ohne „Übernehmen“.
- **Wirklichkeit:** Kühlung, Wärmeisolierung, Wärmepumpen und Maschinen; Wärmepumpen benötigen zusätzliche Arbeit und sind kein Gegenbeweis.
- **Grenzen:** zwei Körper, konstante Wärmekapazitäten und Leitwert, definierter Modellbereich, keine räumliche Strömung und keine Materiephasen.

### F. Science / Begriffe verstehen – Verbindung statt sechstem Labor

Science/Glossar ist **Nachschlage- und Vertiefungsbereich**, keine zusätzliche Simulation. Auf allen Erklärungen ein verlässlicher Kontext-Link zur passenden Definition und belastbaren Quelle. Begriffs-UI und Wissenschafts-Quellen-Architektur werden in **Schritt 04** abschließend spezifiziert.

## 4. Ablauf im Interface

1. Im sichtbaren Lab gibt es eine **kleine, klar benannte Einladung** „Warum passiert das?“ / „Wozu ist das gut?“ – nicht überall ein riesiger Erklärblock.
2. Klick/Tastatur öffnet eine kompakte, gut lesbare Erklärung **neben** dem relevanten Experiment bzw. sinnvoll darunter auf Handy; kein ungewollter Labwechsel.
3. „Probier es aus“ leitet auf einen vorhandenen, sichtbaren Regler oder eine sichere Presetaktion; Hervorhebung **ohne** automatische Parametermutation. Wenn ein Experiment eine tatsächliche Aktion erfordert, wird der Original-Apply-Schritt gewahrt.
4. Bei passenden bestehenden Interaktionen kann die Erklärung **kontextuell** aktualisieren, aber nur auf verlässlichen realen Zustandsdaten. Kein falsches „Dein Experiment zeigt ...“ bei einem anderen Preset oder Hidden-Tab.
5. Die freiwillige Vertiefung führt zur korrekten passenden Science-Stelle und bietet einen Rückweg (Fokus-/Scroll-Erhaltung); möglichst die vorhandene Guide-Mechanik erweitern.
6. Das Monster darf gelegentlich aus der Erklärung peeken, aber **nicht** bei jedem Öffnen; immer nur ein Creature-Manager, niemals den Text verdecken.

## 5. Technischer Umfang und Schutz vor Chaos

- Ein klarer, gemeinsam genutzter Aufbau für Erklärsektionen; keine neue Routing-/Framework-/Backend-Pflicht.
- Bestehende fünf Hauptbereiche und beide Entropie-Modelle unverändert bedienbar lassen. Exakte fachliche Bindungen möglichst an reale bestehende Funktionen koppeln, keine „Fake-UI“.
- Schritt 02 entwickelt **wiederverwendbare Struktur und erste beispielhafte Erklärungen**, **keine** komplette Neuschreibung aller Entropie-Lehrtexte (Schritt 03), keine Totalumstellung aller Quellen (Schritt 04), keine neuen Black-Hole-Shader (Schritt 06), keine vollständige Temperaturdidaktik (Schritt 07).
- Langtext vorzugsweise in aufklappbaren Ebenen; kurze „Aha“-Aussage zuerst. Keine überbordenden Quiz- oder Achievement-Systeme. Texte sollten 2–4 verständliche Sätze pro Kompaktstufe als Orientierung, keine starre Wortzahl zulasten der fachlichen Präzision.
- Keine externen Analytics-/Nutzerprofile, keine versteckten Telemetrie-Signale.
- DE/EN von Anfang an; keine „im Deutschen korrekt, im Englischen irreführend“-Texte.

## 6. Akzeptanzkriterien und Tests (später von Work nachweisen)

- Alle fünf Hauptbereiche besitzen mindestens einen leicht auffindbaren, relevanten Warum/Wozu-Einstieg; Entropy Lab behandelt **beide** Unterexperimente.
- In **jedem der sechs aktiven Labor-/Unterlaborkontexte** mindestens ein **optional doppelt eingeklapptes**, physikalisch sachgerechtes Vorhersageexperiment mit nachvollziehbarer Antwort, freiwilliger Lösung und konkretem Testhinweis; vorhandene Bedienmöglichkeiten/Modellgrenzen verbindlich prüfen, keine neuen Physics-Engines nötig. Beim Öffnen/Auswählen darf sich kein Simulationszustand ändern. Verhalten zusätzlich per Chromium-Regressionen DE/EN, Fokus, Hidden-Tab und Mobile prüfen.
- Ein Besucher ohne Vorwissen erkennt je Beispiel Beobachtung, Ursache, Versuch, Anwendung und Modellgrenze, ohne Advanced öffnen zu müssen.
- Keine widersprüchliche oder doppelt gepflegte wissenschaftliche Faktenbasis gegenüber Schritt 04.
- Angewandte Modellwerte und Entwürfe vor/nach Öffnen/Schließen/Sprache unverändert; bei laufender Simulation gleiche Modellzeit vergleichen. Bestehende Sichtbarkeitspausen und Abbruch abgeleiteter Vorhersagen bei Haupttabwechsel bleiben erhalten (Umsetzungsvertrag A01). Kein zusätzlicher Start/Reset/Apply.
- Browser-Szenarien DE/EN, ESC, Tab, Screenreader/Labels, mobiles 320/390 px, Reduced Motion; Fokus und Rücksprung zuverlässig, keine Horizontal-Overflow-Fehler.
- Wissenschaftliche Aussagen mit seriösen Primär- oder etablierten Bildungsquellen verifizieren; Trennung idealisierter Modellwahl vs. beobachtete Natur.
- Frühere numerische Benchmarks und v0.1-Originalintegrität unverändert; neue Tests für neue Erklärungskomponenten, Zustands-/Navigationsschutz.

## 7. Entscheidungen abgeschlossen – technische Verifikation vor Umsetzung

**Inhaltlich freigegeben durch den Eigentümer:**
1. Eine gut erkennbare **Hauptfrage direkt unter jedem aktiven Labortitel** (einschließlich Unterexperimente); standardmäßig geschlossen.
2. Zusätzliche Inhalte und Fragen versteckt und freiwillig erweiterbar, keine sichtbare Fragenkachel-Flut.
3. Im Inneren der geöffneten Frage je Lab ein **zweiter optionaler, standardmäßig eingeklappter Prognose-Ausklapper** („Was glaubst du, passiert?“), verständliche Alternativen, Auflösung und manuelle Laborprobe.
4. Reale Anwendungsbeispiele **ungefähr 50 % Alltag/Technik und 50 % Kosmos/Universum** über die Website, mit fachlich sinnvollen Abweichungen je Labor. Keine künstlich konstruierten Bezüge.
5. Keine automatischen Eingabewertänderungen, keine Pflichtquizze, keine Fake-Physik, keine Merge-/Deployment-Erlaubnis.

**Umsetzungsaufgaben (keine neuen Produktentscheidungen):** Alle konkreten Hauptfragen, Kurzantworten, Vorhersageoptionen, Regler-/Preset-Zuordnungen, Modellgrenzen und Quellen gegen den dann aktuellen Code prüfen und in DE/EN final redigieren. Die sechs Tabellenbeispiele sind Ausgangspunkte, **keine Lizenz für nicht existierende UI-Controls**. Änderungen der didaktischen Grundentscheidungen erst wieder mit Eigentümer abstimmen.

**Status:** Inhaltliche Planung abgeschlossen; aktuelle Baufreigabe gemäß Umsetzungsvertrag. Merge/Deployment gesperrt.
