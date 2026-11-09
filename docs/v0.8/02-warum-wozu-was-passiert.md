# Schritt 02 – Warum passiert das? Wozu sollte mich das interessieren?
## Diskussionsentwurf v0.8 – noch nicht zur Implementierung freigegeben

**Projektname:** Reincarnated as a Proton (vom Eigentümer gewählt, noch keine Domain-/Produktionsumstellung). **Scope:** v0.8 Phase 1, Schritt 02 von 08; siehe [Roadmap](README.md). **Entscheidungsstatus: ENTWURF.** Dieses Dokument hält einen Vorschlag fest, über den wir mit dem Eigentümer sprechen. Erst seine inhaltliche Freigabe erlaubt die spätere Umwandlung in einen Work-Implementierungsauftrag. Keine Codeänderung jetzt.

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
- Mindestens eine **funktionsfähige und physikalisch sachgerechte** Mini-Vorhersage/Aktion je relevantem Labor, wenn vorhandene Regler dies erlauben; keine neuen Physics-Engines nötig.
- Ein Besucher ohne Vorwissen erkennt je Beispiel Beobachtung, Ursache, Versuch, Anwendung und Modellgrenze, ohne Advanced öffnen zu müssen.
- Keine widersprüchliche oder doppelt gepflegte wissenschaftliche Faktenbasis gegenüber Schritt 04.
- Existing simulations/harness inspect() vor/nach bloßem Öffnen/Schließen und Sprachwechsel unverändert; kein Start/Pause/Reset ohne explizite Handlung; keine falschen Flow-/Timeline-Aussagen.
- Browser-Szenarien DE/EN, ESC, Tab, Screenreader/Labels, mobiles 320/390 px, Reduced Motion; Fokus und Rücksprung zuverlässig, keine Horizontal-Overflow-Fehler.
- Wissenschaftliche Aussagen mit seriösen Primär- oder etablierten Bildungsquellen verifizieren; Trennung idealisierter Modellwahl vs. beobachtete Natur.
- Frühere numerische Benchmarks und v0.1-Originalintegrität unverändert; neue Tests für neue Erklärungskomponenten, Zustands-/Navigationsschutz.

## 7. Offene gemeinsame Entscheidungen – vor Freigabe

1. Sollen die Erklärungen standardmäßig **geschlossen** sein (Empfehlung) und lediglich einen Satz als Einladung zeigen?
2. Soll jede Hauptansicht **eine** Hauptfrage besitzen und optional 2–3 alternative Fragen, oder direkt 2–3 sichtbare Themenkarten?
3. Ist ein kleines freiwilliges „**Was glaubst du, passiert?**“ als konkrete Mini-Prognose erwünscht, oder reichen Handlungsempfehlung + anschließende Deutung?
4. Soll die kurze „Warum/Wozu“-Funktion schon beim Start im Blick sein oder nur nach einem kleinen Info-Klick?
5. Welche Anwendungen sind für das Zielpublikum besonders wichtig: Alltag und Technik / Universum und Kosmos / ungefähr halb-halb (Empfehlung)?

**Nächster Schritt:** Diese fünf Entscheidungen gemeinsam besprechen; danach Inhalte, Verlinkungen, UI-Lage und Testkriterien verfeinern, als **inhaltlich freigegeben** markieren. Work erst nach separater Bauentscheidung einsetzen.
