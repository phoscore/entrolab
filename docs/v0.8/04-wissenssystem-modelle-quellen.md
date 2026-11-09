# Schritt 04 – Modelle, Quellen und Begriffe als ein Wissenssystem
## Inhaltlich freigegeben – technische Umsetzung weiterhin nicht autorisiert

**Website:** Reincarnated as a Proton (Name beschlossen; Domain und öffentliches Rebranding noch offen). **Version:** v0.8, Schritt 04 von 08, Abschluss der ersten vier Planungsbereiche. **Grundlage:** [Roadmap](README.md), [freigegebene Erklärungskarten Schritt 02](02-warum-wozu-was-passiert.md) und [freigegebener Entropie-Ausbau Schritt 03](03-entropie-verstehen.md), `AGENTS.md`, `docs/Plan_v0.7.md`, `docs/Qualitaetsupdate_v0.7.md`. **Freigabe:** Der Eigentümer hat am 09.11.2026 das gesamte vorgestellte Schritt-04-Paket mit „passt“ bestätigt: dezente kontextuelle ⓘ-Hilfen, ein vorhandener und sinnvoll gegliederter Science-Tab, kurze Erklärungen mit optionalen Formeln und Quellen, konkrete belegte Aussagen und eine überschaubare kanonische Begriffsmenge. **Dies ist nur die inhaltliche Planfreigabe**, keine Erlaubnis für Work, Code, Merge oder Deployment.

## 1. Bestandsaufnahme: was bereits existiert (v0.7, main)

- Die App ist heute eine weitgehend **buildlose HTML-/CSS-/JavaScript-Seite**. Im Header sind Haupttabs für Gravity, Black Hole, Extreme Objects, Entropy und `Modell & Quellen`.
- `dist/index.html` enthält ein globales `<details id="physicsGuide">` mit „ⓘ Begriffe verstehen“, Definitionen, einigen optionalen Advanced-Abschnitten und Links. Beispiele: AU, Schwarzschild-Radius, ISCO, Hawking-Temperatur, Energieerhaltung, Gravitation, extreme Sternreste, Entropie als Mikro-/Makrozustand sowie thermische Entropie.
- `dist/guide.mjs` verwaltet bestehende `data-explain`-Links: Glossar aufklappen, zu Zielterm fokussieren/scrollen, per `guideReturn` oder Escape zur ursprünglichen Ansicht zurück. Tabwechsel räumt Herkunftsbezug auf. **Dieses vorhandene funktionierende Verhalten bewahren und robust erweitern, statt das System blind auszutauschen.**
- `dist/index.html` hat zudem eigene `<section id="science">` mit vier Bereichen: Gravitation, Schwarze Löcher, Darstellung & Kontrolle und Gleichungen & Quellen. Dort stehen Newtonschen Integrator, Singularitätsweichung, Kollisionen, Modellgrenzen, HW-/Worker-Selbsttests und einige Belege. Entropie- und Wärme-Modelltext stehen zusätzlich bei den betreffenden Laboren. Manche Begriffserklärungen oder Grenzen können mehrfach auftauchen.
- `dist/i18n.mjs` und `dist/translations.mjs` übersetzen per `data-i18n` und `t()` DE/EN und verwalten Sprachwechsel. Neue Inhalte benötigen vollständige, getestete Übersetzungen; keine zweite inkompatible i18n-Mechanik.
- Existierende wissenschaftliche Link-Familien: NIST CODATA, NASA/JPL, OpenStax, Max-Planck/Einstein Online, JILA/Uni-Lehrunterlagen. **Links sind vorhandene Referenzen, keine in diesem Plan frisch verifizierten Beweise.** Work muss jede konkret verwendete Aussage und Quelle wirklich prüfen.
- v0.7 stellt bereits Modellkennzeichnungen, Warnhinweise, Quellen und Animationseinschränkungen zur Verfügung. Nicht unbegründet eine fehlende Funktion behaupten: Ziel ist bessere **Konsistenz, Zugänglichkeit, Vollständigkeit und Zuordnung**.

## 2. Leitprinzip: 1 Inhalt – 3 Tiefen, einheitliche Navigation

### Ebene I: Inline-Schnellhilfe (1–3 Sätze)
Direkt bei schwer verständlichen Begriffen, Diagrammachsen, Einheiten und Werten eine **zurückhaltende, klar beschriftete** Hilfe („Was bedeutet das?“ oder gut fokussierbares kleines `ⓘ` beim Begriff, **nicht nur Farbe**). Kurze Definition in DE/EN und *eine* sinnvolle Einschränkung. Nicht sämtliche Wörter mit blinkenden Symbolen überladen.

Beispiel bei `ΔS_total` im Wärme-Lab:
> **Gesamte Entropieänderung (J/K):** Sie addiert die Entropieänderungen beider Körper seit dem Start. Im isolierten passiven Zwei-Körper-Modell ist die Summe nicht negativ; dies ist kein Messwert eines realen Getränks.

### Ebene II: „Genauer verstehen“ / kontextuelle Vertiefung
Kleine freiwillig aufklappbare Sektion zur gerade sichtbaren Frage / Laborausgabe. **Was wird gerechnet? Welche Bedeutung hat die Formel? Welche Annahme ist entscheidend? Wo endet das Modell?** 1–2 Formeln mit konsistenten Symbolen/Einheiten, passend zu diesem Kontext. Transparenter Link „Modell & Quellen“ zum entsprechenden Hauptartikel. Die v0.8-Erklärungskarte aus Schritt 02 und die Entropie-Skizzen aus Schritt 03 werden mit dieser Ebene verbunden, **nicht** dupliziert.

### Ebene III: bestehender Science-Haupttab als belastbare Referenz
Die bisherige `Modell & Quellen`-Seite bleibt **ein vorhandener Haupttab, kein sechstes Labor**. Sie wird zur strukturierten Referenz mit Abschnitten oder verlinkbaren Unterankern für jedes existierende Labor und alle wichtigen Modellgrenzen. Ein Abschnitt beantwortet stets:
1. **Fragestellung / Realität:** Welches reale Phänomen oder theoretische Konzept soll erläutert werden?
2. **Im Modell gerechnet:** explizite Gleichungen, Variablen, Einheiten, Konstanten und Anfangsbedingungen.
3. **Methodik:** exakte analytische Lösung innerhalb des Modells, numerische Integration/Algorithmus oder Zählung; was davon ist tatsächlich implementiert?
4. **Annahmen & Gültigkeit:** Bereich, fehlende Effekte und die Bedingungen einer Aussage.
5. **Darstellung:** Was ist maßstäblich/berechnet, und was nur schematisch oder rein dekorativ?
6. **Vergleich mit Wissenschaft:** welche Aussagen durch Theorie, Beobachtung, Messung, Lehrbuch oder Veröffentlichung belegt sind, und wofür die Quelle nicht gilt.
7. **Typische Fehlinterpretation:** wenigstens ein kurzer Satz („Wieso das nicht bedeutet, dass ...“), wenn relevant.
8. **Quellen:** gezielte Referenzen **neben oder verknüpft mit den Aussagen**, nicht nur vier Links am Fuß der gesamten Website.

**Wichtig:** Das sind drei Ansichten **derselben gepflegten Faktenbasis**, keine drei voneinander getrennt zu aktualisierenden Lexika. Lange Texte bleiben freiwillig zugänglich; wichtige Warnungen nahe Zahlen weiterhin direkt sichtbar.

## 3. Vorschlag für Daten- und UI-Architektur

- Nach Bestandsaufnahme eine **kleine, zentrale, statische Inhaltsstruktur** für wiederverwendete Definitionen/Modellmetadata, passend zum bestehenden Framework-losen Projekt. Beispielsweise eine mit JS-Modulen kompatible Registry `knowledge.mjs` oder mehrere kleine statische Module; **kein neuer Content-Server, kein CMS und kein Framework notwendig**.
- Logische Inhaltseinträge mit stabiler ID, DE-/EN-Kurztext, weiterführender Erklärung, Formeln/Einheiten, Modellbezug, Art der Aussage (siehe unten), Quell-IDs, Linkziel/Anker, Revision/Redaktionshinweis (kein Pflicht-Wartungssystem). Keine HTML-Zeichenketten aus unkontrollierten Quellen in `innerHTML` interpolieren.
- Nutzerfreundliche Oberfläche aus einem gemeinsamen `knowledge-ui.mjs` oder gezielt erweitertem `guide.mjs`; alte `data-explain`-IDs und Deep-Links kompatibel halten, soweit Links tatsächlich existieren. Nur wenn nötig eine kleine Adapter-Schicht einsetzen. Bestehende `science`-DOM-Struktur, Simulationen und Lab-Navigation nicht unnötig neu aufbauen.
- Quellinformationen als konsistente Liste (Autor/Herausgeber, Titel, Link, relevanter Abschnitt, Claim-/Modellbezug, Quellenart; falls wichtig Version/Zugriffsdatum) referenzieren. Gleiches Papier in drei Begriffen per einer Quellen-ID nutzen statt widersprüchliche Kopien zu pflegen. Links beim Bauen verifizieren und später auf Linkrot prüfbar halten.
- Lokalisierung eng an vorhandenes `i18n.mjs` koppeln. DE/EN-Texte gleichwertig und nicht nur maschinell wortgetreu übersetzen; physikalische Bedeutung, Einheiten und Vorzeichen müssen identisch sein. Wechsel zwischen Sprachen verändert **keine** Laborparameter, Presets oder Entwürfe.
- Wenn Pflege in einer kanonischen Datenstruktur trotz statischer Website zu groß wird, **pragmatisch** beschränken: zunächst die 12–18 meistbenötigten Schlüsselbegriffe und alle fünf Hauptbereiche plus Untermodelle sauber verknüpfen, danach erweitern. Der Nutzer soll nicht für interne Architektur bezahlen.

### Aussage-Typen – wichtig, aber nicht als farbiger Badge-Wald
Eine Aussage/ein Bild kann mehreren Typen zugeordnet werden; **im Text präzise benennen**, nicht jeder Satz mit farbigen Chips.
- **Gesicherte Theorie innerhalb ihrer Voraussetzungen:** etwa Newtonsche Gravitation im passenden Grenzbereich; gerade keine Behauptung universeller Gültigkeit.
- **Berechnung exakt innerhalb des gewählten Modells:** z. B. analytische Lösung des begrenzten Zwei-Körper-Wärme-Modells oder binomiale Zählung bei N Markern; nicht „absolute Realität“.
- **Numerische Näherung:** etwa integrierte Orbitkurven, Fehler-/Schrittgrenzen, Beurteilung nur zusammen mit anderen Checks.
- **Schematische Illustration:** Halos, Körpergrößen, BH-Glows, Sternpuls-Kegel, Mal-/Zeichenebenen; NICHT gemessene Photonenbahnen.
- **Empirische Beobachtung / Messung:** wenn eine tatsächliche Mess- oder Forschungsquelle zugrunde liegt; theoretische Hawking-Strahlung nicht mit direktem astrophysikalischem Nachweis gleichsetzen.
- **Fiktion / Mascot-Kommentar:** ausdrücklich nicht als wissenschaftliche Datenquelle.

## 4. Konkrete Pflichtabdeckung je Fachgebiet

### Gravity Sandbox / Newtonsches Modell
- Kraftgesetz, 2D-Ebene, Einheiten AU/M☉/Tage, Softening `ε`, Kollisionen, integrierte Zeit, Velocity-Verlet-Näherung, Energie/Impuls/Kollisionsgrenzen, vereinfachte Startbahnen vs. echte Ephemeriden, Orbitvorhersage als **Modellprognose** statt astronomisch garantierter Zukunft.
- Begriffshilfen zu Schwerpunkt, Masse vs. Beschleunigung, Fluchtgeschwindigkeit/Orbit, integrator-/Energiedrift und beobachteten vs. schematischen Bahnlinien.
- Das „Erde & Schwarzes Loch“-Szenario ist keine Allgemeine-Relativitäts-Simulation; nahe Horizonte explizit begrenzen.

### Black Hole Lab
- Schwarzschild-Radius, Ereignishorizont, mögliche Stabilitätsgrenzen wie ISCO, Hawking-Temperatur, idealisierte Strahlungsleistung/Lebensdauer, Skalierung mit Masse und Hinweis auf semiklassische/theoretische Grenzen.
- Echte astrophysikalische Akkretion oder Raytracing **nicht** behaupten, wenn nur Bildanimation. Noch nicht implementierte Step-06-Konzepte (Lichtkrümmung/Blickwinkel) nur mit **späterem** Wissensteil vorbereiten; keine neuen Visualisierungen in Schritt 04.
- Erklärung der Nichtrotation/Nichtladung (Schwarzschild-Modell); Masse/Radius/Temperatur nicht zwischen Szenarien unbemerkt vermischen.

### Extreme Objects Lab
- Weißer Zwerg vs. Neutronenstern vs. BH, Größen-/Massendaten, Dichte als modellabhängige Größe, degenerationsdruckbedingte Stützung als **konzeptionelle** Erklärung, Unterschiede von Oberfläche/Horizont und schematischen Pulsar-Bildern.
- Keine einzelne Zahl als exakt universellen Neutronensternradius ausgeben, keine implizit universell gültige Zustandsgleichung.

### Extreme Temperature Lab
- Kelvin/Celsius, absoluter Nullpunkt, Temperatur vs. Gesamtenergie, Extrapolationen zur hohen Temperatur, Größenordnungen, Beispiele mit Unsicherheiten und Differenz zwischen idealisiertem Temperaturvergleich und tatsächlich berechnetem thermischen Prozess.
- **Nur 250–600 K** kontrolliert zur Zwei-Körper-Wärme-Ansicht vormerken; numerische Grenzpräzision und bewussten `Übernehmen`-Schritt nicht umgehen. Darüber keine stillschweigende Wärmeleitungs-/Materialphysik.

### Entropy Lab – Zwei **separat** definierte Modelle
**Statistisches Markermodell:** Mikrozustand vs. Makrozustand, `Ω=C(N,k)`, `P_eq=Ω/2^N`, `ln Ω`, Ensemble-Gleichwahrscheinlichkeit im stationären Zustand, `q=1/4` je Marker und Schritt, **Histogramm ≠ nächster Schritt**, diskrete Fluktuationen. Rein didaktische Marker, keine realen Gasbahnen.

**Zwei-Körper-Wärmemodell:** `C_A,C_B,G_th,T_A,T_B,T_eq`, `P,G,ΔS_i,ΔS_total,σ,Q,U` mit **konsistenten Einheiten**, Vorzeichen und Grenzen; `G_th` ist nicht Gravitations-`G`; `U=C_AT_A+C_BT_B` ist eine Modellreferenz, kein universeller absoluter Energieinhalt. Reale Kühlschränke und Thermoskannen nicht als simuliert darstellen.

**Verbindung:** beide Modelle können helfen, statistische und thermodynamische Denkweisen zu verstehen, aber `S/k_B` (dimensionslos) und `ΔS` (J/K) **niemals numerisch gleichsetzen/addieren**; Schlussfolgerungen über makroskopische reale Systeme nur unter korrekten Voraussetzungen.

### Querschnitt: Begriffe, die wir definitiv brauchen
Mindestens: Masse, Kraft, Beschleunigung, Orbit, Softening/Modellfehler, Lichtgeschwindigkeit, Ereignishorizont, Schwarzschild-Radius, Hawking-Strahlung, Kelvin, Wärme, Temperatur, Energie, Wärmeleitwert, Wärmekapazität, Mikrozustand, Makrozustand, Multiplizität `Ω`, Gleichgewicht, Entropie, Fluktuation, Erster/Zweiter Hauptsatz, Gültigkeitsbereich. Umfang darf durch fachlich gute bestehende Definitionen abgedeckt werden, nicht alles neu schreiben.

## 5. Quellenqualität – überprüfbare Aussagen statt Referenz-Friedhof

**Vorrang:** Primärpublikationen, wissenschaftliche Institutionen/Fachinstitute, CODATA/NIST für Konstanten, etablierte offene Universitäts-/Lehrbuchquellen wie OpenStax für Grundlagen, Forschungsprogramme für tatsächliche Beobachtungen. Für Begriffe bevorzugt etablierte Institutionen/verlässliche Fachlehrmaterialien. Ein Link zu einem populären Blog ersetzt keinen Primär- oder Lehrbuchbeleg für heikle Aussagen.

**Pro zentraler Behauptung:** 1–2 passende verifizierte Referenzen mit verständlicher Beschriftung; Quellenstand/Version bei zeitabhängigen Werten. Bei Unsicherheit oder uneinheitlichen Messständen Range, Modellcharakter und Stand sichtbar kennzeichnen; keine fingierten Paper, DOIs, Autoren oder direkte experimentelle Bestätigung. Für sehr allgemeine Formeln muss nicht hinter jedem Satz ein Link stehen, aber die konkrete Herleitung muss im passenden Modellkapitel nachvollziehbar und referenziert sein.

**Konkrete noch zu prüfende Quellfamilien:** NASA/JPL, NIST, OpenStax, Max-Planck/Einstein Online, NASA Science/ESA, Lehrunterlagen der Hochschulen sowie bei statistischer Mechanik Stanford-Lehrmaterialien. Vor dem Einchecken aktueller URLs: Seitenreichweite prüfen, fachliche Aussage tatsächlich belegt, keine Link-404 oder irrelevante Landingpage.

**Urheberrecht:** Fachinhalte eigenständig erklären; keine unlizenzierte Grafik / lange wörtliche Textübernahme in Site-Assets.

## 6. UX- und Accessibility-Vorgaben

- **Keine neue Pflichtführung und keine globale Popup-Flut.** Alles optional; das eine gute Hauptfrage-Element aus Schritt 02 bleibt weiterhin an der Laborüberschrift. Begriffs-Info daneben oder bei zugehörigem Wert – ein klarer, auf Tastatur nutzbarer Trigger, kein bloßer schwer treffbarer Hover-Hotspot.
- Popup/Popover nur, wenn wirklich nötig; auf schmalem Mobile ein lesbarer und fokussierbarer Inline-/Drawer-Ersatz, niemals außerhalb des sichtbaren Viewports. `prefers-reduced-motion` und Browserzoom respektieren.
- Klick auf „Genauer verstehen“ kann erweiterten Absatz direkt öffnen oder gezielt zur bestehenden Science-Referenz springen; Rückkehr zu genau dem vorherigen Begriff/Regler. Fokus nach Escape, Close, Tabwechsel robust. Keine ungebetene Umschaltung des aktiven Labors.
- Deep-Links zu Begriffen und Fachabschnitten müssen stabil sein und bei DE/EN dasselbe Konzept treffen. Das bestehende `guideReturn`-`data-explain`-Verhalten darf nicht durch neue Listenlinks regressieren.
- Wissenschaftskarten dürfen weder Parameter, Modellzeit, `Math.random`-RNG-Aufrufe noch laufende Animationen unbemerkt ändern. Auf- und Zuklappen ist dokumentierte **reine Präsentation**.
- Monster dezent, höchstens eine sichtbare Figur, **nie** vor Belegen/Formeln und nie als einziges verständliches Hilfselement. Rote Dekorfarben bei wissenschaftlich wichtigen Statusanzeigen nie alleinige Kodierung.
- Performance: keine kompletten Neurenders aller Diagramme bei reinem Glossarklick; statische lokale Texte/Metadaten; möglichst wiederverwenden, nicht die fünf Labs neu architektieren.

## 7. Konkret überprüfbare Abnahme

1. Alle fünf Hauptbereiche, beide Entropy-Unterexperimente sowie Temperature-Unteransicht haben passende **kurze Inline-Begriffshilfen** und in Science die zugehörige strukturierte Modell-/Quellenreferenz; klickbare IDs/Anker sind konsistent.
2. Mindestens alle physikalisch heiklen Werte (Einheiten, Gültigkeitsgrenzen, Näherungen) erklären **am Ort der Anzeige** ihre Modellbedeutung. Keine „ausdrücklich schematische“ Warnung nur drei Seiten weiter, falls Grafik leicht missverstanden werden kann.
3. Ein Begriff wird in kurzer, mittlerer und langer Stufe **gleich** definiert; automatisierter statischer Link-/ID- und Übersetzungs-Key-Check für die kanonischen Einträge. Keine widersprüchlichen DE-/EN-Inhalte.
4. Jede fachlich wesentliche Formel hat Einheit, Variablendefinition, Gültigkeitsbereich und eine kontrollierte Quelle in unmittelbarer Fachsektion; exakte Modellrechnung vs. numerisch vs. schematisch klar. Keine Versprechen wissenschaftlicher Zertifizierung.
5. Quelllinks sind zum Review-Zeitpunkt manuell oder per verträglichem Check erreichbar und bestätigen die ihnen zugeordneten Aussagen. Falls Quelle wegbricht, verlässliche Ersatzquelle oder ehrlich als offen markieren; **nicht** einfach tote Links ignorieren.
6. Regression bei Glossar-Rücknavigation und Escape; direkte Deep-Links, Sprachwechsel, Lab-/Untertabwechsel, Verstecken/Anzeigen, Touch + 320/390 px, Zoom und Tastatur. Test für „3 nacheinander geöffnete Begriffe“ darf keine Fokusfallen oder verwaiste Origins erzeugen.
7. Bloßes Aufklappen/Anzeigen/Sprachwechsel ändert nie `entrolabEntropy.inspect()`, `entrolabThermal.inspect()`, Gravitation, Extreme-/Temperature-Entwürfe oder vorhandene Zeit-/Wertefunktionen. Wo DOM-Inspection nur Teil der Wahrheit liefert, zusätzliche gezielte UI-Regression.
8. Alle originalen zwölf historischen Benchmarks, v0.1-Originalprüfung, vorhandene Node-/Chromium-Tests und wissenschaftliche Grenzprüfungen erhalten, neue Tests hinzufügen ohne bestehende Toleranzen zu lockern.
9. Vorher-/Nachher-Beispiele für eine einfache Frage aus jedem Themengebiet, je ein Screenshot Desktop/320px, DE/EN und ein dokumentierter Handtest für Screenreader/Keyboard; keine Textwüste aus fünf großen Karten beim Aufruf.
10. Bestehender `Modelle & Quellen`-Bereich wird sinnvoll **ausgebaut**, nicht mit neuer, technisch unabhängiger Navigation überschrieben. Auf der alten URL / innerhalb des bestehenden Tab bleibt er erreichbar.

## 8. Priorisierte Umsetzung und klare Abgrenzung

**P0:**
- Die vorhandenen Inhalte inventarisieren, doppelte Fachdefinitionen vereinheitlichen, Direktlinks/Formeln/Annahmen/Quellen pro Modell sinnvoll zuordnen.
- Ein kleines wiederverwendbares DE/EN-Definitions-/Source-System und für Labore punktuelle Inline-Hilfen erstellen; vorhandenes `guide.mjs` und die Science-Navigation mit Rückweg erhalten.
- Science auf alle relevanten Modelle aktualisieren, vor allem **Entropie/Wärme** und **Extreme Temperature/Extreme Objects**, ohne Gravity/BH zu verschlechtern.
- Jede reale Zahl und wichtiges Modellversprechen wissenschaftlich verifizieren; auf mobilem Bildschirm lesbar.

**P1 nur innerhalb des Zeit-/Testbudgets:**
- Komfortables kleines Inhaltsverzeichnis und interne Sprunganker in Science.
- Kontextabhängige „Mehr dazu“-Empfehlungen, ohne komplexe Pfad-/Fortschrittssoftware; die eigentlichen geführten Lernpfade gehören zu **Schritt 05 / v0.8.5**.

**Ausdrücklich nicht Schritt 04:**
- Neue wissenschaftliche Solver/Physikalgorithmen, kostenpflichtige oder externe Online-KI, Online-CMS, Account-System, Datensammlung.
- Neue Simulationsansichten, 3D-Raytracing, neue Monster-Großanimation; die jeweiligen v0.8.5-Phasen bleiben separat.
- Umbau der existierenden fünffachen Hauptnavigation in ein neues Paradigma.
- Komplette wissenschaftliche Fachmonographie, die die gesamte Webseite überfrachtet. Es geht um **präzise Nachvollziehbarkeit auf Abruf**.

## 9. Vom Nutzer bestätigte Produktentscheidungen

1. **Schnellhilfe:** kleine, ausreichend große und per Tastatur/Touch bedienbare **ⓘ-Hinweise direkt bei schwierigen Fachbegriffen und Werten** mit 1–3 Sätzen; Fachbegriffe bei Bedarf dezent als Links, niemals reine Hover-Abhängigkeit.
2. **Science-Seite:** der vorhandene Tab **„Modell & Quellen“ bleibt**, wird **ein einziges gut gegliedertes Nachschlagewerk** mit verständlichen kompakten Kapiteln, Sprungzielen und optionalen Formeln; keine zusätzliche Hauptnavigation.
3. **Tiefe:** kurze verständliche Erklärung sichtbar, Advanced-Formeln, Präzisionsdetails und ausführliche Quellen freiwillig aufklappbar. **Sicherheitsrelevante und physikalisch wesentliche Modellwarnungen bleiben auch ohne Advanced sichtbar.**
4. **Quellen:** 1–2 geeignete, beim Review verifizierte Referenzen direkt an relevante Behauptungen und eine zusammengefasste Referenzliste je Modell. Keine ungeprüften Quellenzitate oder globale Linkwand.
5. **Umfang:** ungefähr **12–18 häufig benötigte Begriffe** plus alle Modellkapitel zuerst zuverlässig ausarbeiten; bei fachlich nötigen Ergänzungen kann Work den Umfang begründet erhöhen, aber keine enzyklopädische Totalumstellung.

**Status: Schritt 04 am 09.11.2026 inhaltlich freigegeben.** Schritt 01 (Brand-/Monster-Verarbeitung), 02, 03 und 04 bilden die erste Implementierungsetappe, **doch vorher werden auf Wunsch des Nutzers auch Schritte 05–08 vollständig geplant**. Danach gesonderte Work-Baufreigabe für Phase 1, Reviews/Tests und erst anschließend Phase 2; keine automatische Freigabe für main, Produktionsdeployment oder Domainwechsel.
