# Schritt 03 – Entropie endlich wirklich verstehen

> **Aktueller Umsetzungsstand (09.11.2026):** Schritte 01–04 sind ausdrücklich zur Implementierung auf dem isolierten Entwicklungsbranch freigegeben. Frühere Aussagen „keine Work-/Codefreigabe“ in diesem Plan sind damit für 01–04 überholt. Monsterintegration erst nach Sichtfreigabe; Merge, Deployment, Domain-/öffentliches Rebranding und Schritte 05–08 bleiben gesperrt. Verbindliche Präzisierungen: [Umsetzungsvertrag v0.8](Umsetzungsvertrag_v0.8.md).
## Freigegebene Umsetzung v0.8 – kein Merge/Deployment

**Produkt:** Reincarnated as a Proton. **Phase:** v0.8, Schritt 03 von 08. **Priorität P0. Inhaltlich am 09.11.2026 durch den Eigentümer mit „perfekt, übernimm das einfach mal so“ bestätigt.** Grundlage [Roadmap](README.md), [freigegebener Schritt 02](02-warum-wozu-was-passiert.md), `AGENTS.md`, `docs/Plan_v0.7.md`, `docs/Qualitaetsupdate_v0.7.md`. Dieses Dokument beschreibt den **inhaltlich genehmigten Schritt 03**. Inhaltliche Kernentscheidung: **beide** Visualisierungen (Mikrozustände zum Anfassen und Energie-/Entropiebilanz), plus verständliche Häufigkeitsansicht und wenige hochwertige Alltagserklärungen. Die reichhaltigeren kosmologischen Themen nur als sorgsam begrenzte freiwillige Advanced-/Quellenverknüpfung, keine neue Kosmologie-Engine. Monster-Einzeiler selten und unaufdringlich, wissenschaftliche Kernerklärung sachlich; im Ausgangszustand keine zusätzlichen sichtbaren Erklärwände. Präzise Illustrationsdetails dürfen bei der Work-Umsetzung angepasst werden, ohne die Modellgrenzen oder Schritt-02-Minimalarchitektur zu verletzen. **Die separate Implementierungsfreigabe für 01–04 liegt inzwischen vor; Merge und Deployment bleiben gesperrt.**

## 1. Was das Lab *heute tatsächlich* kann – v0.7 auf main

### A: „Teilchen & Wahrscheinlichkeit“ (mathematisch: zwei-Zustands-Marker)
- `dist/entropy.mjs`: **N = 1–32 unterscheidbare Marker**, je links/rechts; jedes Links/Rechts-Muster ist ein Mikrozustand; Makrozustand `k` = Anzahl links; `Ω(N,k)=C(N,k)`, exakt mit BigInt; `P_eq(k)=Ω/2^N`; „Modellentropie“ `S/k_B=ln Ω` als dimensionslose Zahl.
- `dist/entropy-ui.mjs`: markerbasierte Kammerdarstellung, gegenwärtige Links/Rechts-Anordnung, aktuelle Werte, Histogramm der **stationären Gleichgewichtsverteilung**, Tabelle, Schieberegler, neu zufällige Anordnung bei festem k, manuelles Mischen / automatisches Mischen. **Wichtig:** pro Tick wechselt jeder Marker unabhängig mit `q=1/4` die Seite. Das Histogramm ist **nicht** die bedingte Verteilung des nächsten Schritts. Markerpositionen auf dem Bildschirm sind rein schematisch, keine Teilchenbahnen.
- Schon bestehende Erklärungstexte und ein Quellenbereich sind vorhanden. Hier geht es **nicht** um eine Neuerfindung der Rechenbasis, sondern um Verstehen und unmittelbare Rückkopplung zwischen den Anzeigen.

### B: „Wärme & Entropie“ (physikalisches, idealisiertes Temperaturmodell)
- `dist/thermal-physics.mjs`: zwei nach außen isolierte, jeweils intern homogene Körper; konstante Gesamtwärmekapazitäten `C_A, C_B` in J/K und fester Wärmeleitwert `G_th` in W/K, keine Arbeitsentnahme, keine Strahlung/Phasenwechsel/Außenverluste. `T_A,T_B` anfangs 250–600 K, `C` 1–10⁶ J/K, `G_th` 0,001–1000 W/K; analytisch berechneter Temperaturausgleich statt beliebiger Integration.
- `dist/thermal-ui.mjs`: Temperaturen, signierte Netto-Wärmeleistung, übertragene Energie, Gesamtenergie/Bilanz, `ΔS_A, ΔS_B, ΔS_total` in **J/K**, Entropieproduktion in W/K, Kurven und Tasten/Presets; Entwurfswerte werden **erst mit „Übernehmen“** angewendet.
- Das Temperatur-Lab bietet nur bei **zulässigen** 250–600 K eine Übertragung zum Wärme-Lab; Quellwert bleibt unangetastet. Formeln/Gültigkeit und visuelle Schematik sind bereits ausgewiesen.

### Grundsatz für die Überarbeitung
**Nicht beide Experimente zu einem „Entropiesimulator“ vermischen.** Der diskrete Markermechanismus ist kein Gasmodell und nicht die Wärmeleitungsphysik. Sie illustrieren **verschiedene Perspektiven**, die didaktisch miteinander verbunden, aber nicht mathematisch gleichgesetzt werden dürfen. Weiterhin fünf Hauptbereiche, kein neuer Haupttab.

## 2. Leitidee – die unsichtbare Logik sichtbar machen

Eine Person ohne Vorkenntnisse soll innerhalb weniger Minuten verständlich beantworten können:
1. **Was ist ein Mikrozustand?** Welche konkreten Zuordnungen sind anders, obwohl links/rechts die gleiche Anzahl steht?
2. **Was ist ein Makrozustand?** Was unterscheidet z. B. k=6 von einer bestimmten Markerkonfiguration?
3. **Warum kommt „gleichmäßig“ statistisch häufiger vor?** Es sind mehr unterschiedliche Mikrozustände kompatibel; **nicht** weil Teilchen „Balance wollen“.
4. **Was bedeutet Entropie?** Hier: Zahl kompatibler Möglichkeiten über einen Logarithmus; im Wärme-Modell: tatsächliche **Entropieänderung in J/K** unter klaren Annahmen.
5. **Warum hat Wärme eine spontane Flussrichtung?** Energieerhaltung genügt für die Erklärung nicht; das Gesamtentropie-Kriterium legt die erlaubte spontane Richtung fest.
6. **Warum geht Energie nicht verloren, aber nutzbare Temperaturdifferenz schon?** Keine falsche Aussage „Energie verbraucht sich“; thermodynamische Arbeitsmöglichkeiten hängen von Zuständen und Umgebung ab.
7. **Kann Entropie sinken?** Lokal ja; in einzelnen kleinen stochastischen Zustandswechseln auch; der makroskopische zweite Hauptsatz bezieht sich auf den Gesamtprozess eines isolierten Systems und ist kein Verbot von lokalen oder kurzzeitigen Fluktuationen.

## 3. Drei miteinander verbundene visuelle Aha-Stufen (Arbeitsvorschlag)

### Stufe A: „1 Zustand, viele Wege dorthin“ – Mikrozustand → Makrozustand
**Eine unabhängige, ausdrücklich als N=4-Beispiel bezeichnete optionale Anschauungsdemo innerhalb des BESTEHENDEN Markerbereichs**: mit 4 oder 6 unterscheidbaren Markern ein leicht lesbares Beispiel; einzelne Anordnung gegen dieselbe Links/Rechts-Anzahl mit vertauschten Markeridentitäten stellen. Nicht als sechstes Experiment, eher eine aufklappbare „Zeig mir den Unterschied“-Skizze.

Vorschlag vier Marker A B C D:
- `LLRR`, `LRLR`, `RLLR` etc. sind verschiedene **Mikrozustände** bei **demselben Makrozustand k=2**.
- Zeige maximal sechs Beispielanordnungen, optisch eindeutig identifizierbar, ohne für N=32 tatsächlich Milliarden Zustände einzeln zu rendern.
- In der separaten Vierer-Demo zählt k automatisch und Ω wird in deren eigener kleinen Vergleichsgrafik/-liste hervorgehoben. Die Demo verändert niemals N, k, Schritte oder RNG des laufenden Modells. Der Live-Histogrammvergleich ist ebenfalls nur eine Präsentationsmarkierung.
- **Merksatz:** „Der grobe Zustand kann gleich aussehen, obwohl die einzelnen Marker anders verteilt sind.“

### Stufe B: „Die große Zahl gewinnt“ – Häufigkeit und Rückschwankungen
**Bestehendes Histogramm/BigInt weiterverwenden**, aber einen sofort verständlichen Vergleich zwischen extremem k und ausgewogenem k einbauen:
- Bei N=12: k=12 → **1** Konfiguration; k=6 → **924** Konfigurationen; aus 4096 gleichwahrscheinlichen Links/Rechts-Konfigurationen entspricht das 1/4096 vs. 924/4096.
- Interaktive Markierung *eines* gewählten Vergleichs (z. B. „alle links“ und „hälftig“) im bestehenden Diagramm; verständliche Prozente/Verhältnisse, auch für N=1 und N=32 korrekt.
- Diagramm explizit als **Gleichgewichtsverteilung** beschriften, nicht als Vorhersage des **nächsten** Mischschritts. Eine schmale „Was gerade passiert“-Hilfe stellt klar, dass der Weg zum Gleichgewicht von q und Ausgangszustand abhängt.
- Kurzer optionaler Test: „Wird die Modellentropie wirklich bei JEDEM Mischschritt größer?“ Bei kleinen N können Rückschwankungen auftreten; das ist kein Widerspruch zur statistischen Tendenz bei großen Systemen. **Kein** fiktiver Beweis, dass sie in jeder einzelnen Realisierung monoton steigt.
- Für hohe N BigInt korrekt; keine Overflow-/Rundungsprobleme durch erfundene wissenschaftliche Signifikanz. Keine neue Zufallsregel nötig; `q=1/4` bleibt.

### Stufe C: „Temperaturen gleichen sich aus – Energie bleibt“ – Wärme und Entropie
Im existierenden thermischen Modell klar in **drei parallel lesbare** Werteketten aufgliedern:
1. **Temperatur:** `T_A` sinkt und `T_B` steigt (oder umgekehrt), bis `T_eq`. Wichtiger: Wärmeflussrichtung zeigt IMMER vom augenblicklich wärmeren zum kälteren Körper, nicht zwingend von A nach B.
2. **Energie:** `Q_A=-Q_B` bzw. die aufsummierte übertragene Wärme; Modell-Gesamtenergie bleibt konstant. Die Energiesumme ist im Modell mit festgelegtem Referenznullpunkt gebildet: nicht als absolute universelle messbare Energie verkaufen.
3. **Entropie:** `ΔS_{warm}<0`, `ΔS_{kalt}>0`, aber `ΔS_{total}>=0`; `dS_{total}/dt=G_th(T_A-T_B)^2/(T_A T_B)` (nur für das idealisierte passive Leitmodell mit positivem T).

**Visualisierungsempfehlung:** bestehende Körper-Animation und Temperaturkurve erhalten; zusätzlich ein sehr ruhiges, einfaches **„Energiebilanz + Entropiebilanz“-Paar** (zwei kleine, synchronisierte Balken oder numerische Erklärstreifen). Kein überflüssiges Glow-/Partikel-Feuerwerk. Die Richtungspfeile zeigen die **berechnete** Vorzeichenrichtung, reine Dekoration extra gekennzeichnet.
- Ein anschauliches Preset mit 350 K und 290 K, gleichen C; `T_eq=320 K`. Veränderung der Wärmekapazitäten führt zu **gewichteter** Gleichgewichtstemperatur. Keine unbegründete Aussage, beide würden unabhängig von C beim arithmetischen Mittel landen.
- „Gleich warm“ als Gegenbeispiel: keine Nettoleistung, keine weitere Entropieerzeugung im idealisierten Modell.
- Temperaturgleichheit ist nicht Energievernichtung. **„Was bleibt erhalten, was geht verloren?“**: Energie erhalten, *Temperaturdifferenz* abgebaut; diese kann in geeigneten Maschinen zu Arbeit beitragen, **aber unser Zwei-Körper-Modell enthält keine Wärmekraftmaschine und berechnet kein entnehmbares Arbeitsmaximum**.
- Eventuelle Abkühlungs-/Erwärmungsanimationen dürfen keine gegen die Formel laufende Indikatoren zeigen. Keine stillen automatischen Eingabe-Übernahmen.

## 4. Acht alltagsnahe und kosmische „Aha“-Fragen (freiwillige Vertiefung)

Diese erscheinen **nicht als acht sichtbare Hauptkarten**. Sie sind im Schritt-02-Wissensformat als optionaler `Mehr Fragen`-/Advanced-Bereich erreichbar, je Thema mit 1–3 verständlichen Absätzen und einem präzisen Modell-/Quellenhinweis:
1. **Warum wird Tee kalt?** Wärmeübertragung bei Temperaturunterschied; das echte Gefäß ist oft *nicht* isoliert, anders als unser Zwei-Körper-Modell.
2. **Warum funktioniert eine Thermoskanne?** Sie **vermindert** Wärmeübertragung, nicht Entropie selbst. Das vorhandene G ist nur ein **didaktischer Parameter** für Kopplung, kein vollständiges Thermosgefäß.
3. **Wie kann ein Kühlschrank innen kälter werden?** Arbeitszufuhr und Wärmeabgabe nach außen, Gesamtentropie-Bilanz. **Unser Lab simuliert keinen Kühlschrank!**
4. **Warum können Wärmekraftmaschinen aus Temperaturunterschieden Arbeit gewinnen?** Ursache und Grenzen, **keinen** ungetesteten Carnot-Rechner im bestehenden Wärme-Lab improvisieren.
5. **Warum kann Leben lokal Struktur aufbauen?** Offenes System mit Energie-/Entropieaustausch, nicht „Leben widerspricht dem zweiten Hauptsatz“; Evolution aus Entropie allein weder bewiesen noch widerlegt.
6. **Ist Entropie dasselbe wie sichtbares Chaos?** Nein; Anordnungsbilder sind nur eine Analogie, abhängig davon, wie Mikrozustände, Makrozustände und physikalische Randbedingungen gewählt wurden.
7. **Warum erinnern wir uns an die Vergangenheit und nicht an die Zukunft?** Die Verbindung von makroskopischer Irreversibilität und Zeitrichtung als **weiterführendes Thema**, keine Behauptung, die zwei Demos würden Gedächtnis oder kosmologische Anfangsbedingungen erklären.
8. **Wird das ganze Universum zwangsläufig gleichmäßig kalt?** Langzeitkosmologie ist komplex (Expansion, Gravitation, Horizonte, Schwarze Löcher, Unbekanntes); **keine** triviale Gleichsetzung mit einem endlichen isolierten Wärme-Paar oder einem Links/Rechts-Modell.

**Einbau:** zuerst 3–4 stärkste alltagsnahe Fragen hochwertig umsetzen; die kosmologischen Grenzfälle nur als sauber begrenzte Quellen-/Advanced-Verknüpfung. Bei drohender Überladung Priorität Stufen A–C.

## 5. Physikregeln und explizite Fehlannahmen

- Gleichwahrscheinliche **Mikrozustände im festgelegten Modellensemble** sind Voraussetzung für `P_eq(k)=C(N,k)/2^N`, keine allgemeine Regel beliebiger realer Verteilungen. In diesem Modell hat jede konkrete Links/Rechts-Anordnung stationär Wahrscheinlichkeit `1/2^N`.
- Das Marker-Modell hat weder Energien noch physikalische Zeit oder räumliche Dynamik. Es ist **nicht** das Wärme-Modell, eine Simulation diffuser Teilchen oder eine direkte numerische Bestätigung des zweiten Hauptsatzes.
- `S/k_B=ln Ω` im Marker-Modell ist eine **dimensionslose modellhafte Boltzmann-Zählgröße**. `ΔS` des Wärme-Modells besitzt Einheit J/K. Keine gemeinsame numerische Skala oder Additions-/Vergleichsgrafik, die beide als dieselbe Messreihe behandelt.
- Eine häufigste **einzelne** Gleichgewichtsverteilung ist nicht zwangsläufig häufiger als **alle anderen Verteilungen zusammen**; genau beim endlichen 12-Marker-Modell ist 6/6 nicht „meistens“ im Sinn einer Mehrheit aller Fälle. Immer konkrete Wahrscheinlichkeit angeben, nicht „praktisch immer“ behaupten.
- Isoliertes Gesamtsystem: Energieerhaltung und makroskopischer zweiter Hauptsatz sind unterschiedliche Aussagen. Der zweite Hauptsatz ist keine naive Teilchenregel „pro Zeitschritt Entropie immer höher“.
- **Entropie ist keine Flüssigkeit**, die von warm nach kalt fließt; ein Entropieproduktionswert ist keine Heizleistung. `P` in W, `ΔS` in J/K, `σ` in W/K klar trennen.
- Lokale Entropieabnahme ist mit dem zweiten Hauptsatz vereinbar, wenn die Gesamtbilanz einschließlich Umgebung entsprechend ist.
- Fachliche Aussagen nicht als physikalische Beweise für metaphysischen Nihilismus verkaufen; nihilistische Kommentare nur als klar fiktionalen Mascot-Humor.

## 6. Umfang, Design und geplante Umsetzungsschichten

**MUSS (v0.8 / P0)**
- Stufen A, B, C als **didaktische Überlagerungen** vorhandener Lehrmodelle, jeweils mit einem kompakten sichtbaren Einstieg nach Schritt 02; zusätzliche Erklärungen und Diagrammvergleiche freiwillig erweiterbar.
- Zugängliche Verbindung Marker → Wahrscheinlichkeitsverteilung → thermodynamisches Wärmeexperiment: **konzeptioneller** didaktischer Weg, niemals ein numerischer Zustands-Transfer von Marker-`S/k_B` in Wärme-`ΔS`.
- Klar benannte Messgrößen/Einheiten, Beispiele, Definitionen, Modellerläuterungen DE/EN und wenige kleine Prognoseversuche; bestehende Benutzerführung und zwei Subviews behalten.
- Keine zentrale Physikformel verändern, nur um ein schöneres Diagramm zu erhalten. Falls ein neuer Rechner wirklich benötigt wird: **eigenes, begründetes mathematisches Modell** mit unabhängigen Tests und ausdrücklicher Scope-Freigabe.

**SOLL (wenn Komplexität/Performance es erlauben)**
- Einzige ruhige, optionale Vergleichsansicht zur Gegenüberstellung zweier Makrozustände und ihrer Vielfachheiten.
- Optionales visuelles „Energie behalten / Temperaturdifferenz verlieren“-Lehrbeispiel mit textlicher Klarstellung.
- Seltene, kurze Reaktion des einen ausgewählten roten skizzenhaften Glitch-Monsters am Rand einer Erklärung, ohne Diagramm zu verdecken und ohne numerische Wechselwirkung.

**NICHT TEIL VON SCHRITT 03**
- Neue reale Gasdynamik, Wärmepumpen-Motor, Carnot-Simulator, Boltzmann-Solver, Leben/Evolutionssimulation, Gravitationsentropie-/Universums-Ende-Rechner, ad-hoc Nachahmung von Raytracing.
- Neue Haupttabs oder invasive Popup-Touren.
- Große Glossar-/Quellenarchitektur (Schritt 04), Erstnutzer-Lernpfade (Schritt 05), vollständiger Extreme-Temperature-Ausbau (Schritt 07), Website-weite Animationsüberarbeitung (Schritt 08).

## 7. Qualitätskriterien: wissenschaftlich, didaktisch, technisch

1. **N=4**: für k=2 genau 6 verschiedene Mikrozuordnungen; **N=12**: 924 vs. 1, korrekte Prozentanzeige relativ zu `2^12`; **N=1 und 32** numerisch sauber; bestehende BigInt- und Wahrscheinlichkeitsfunktionen unverändert korrekt.
2. Gleichgewichtsdiagramm **nie** als bedingte Verteilung des nächsten Schritts ausgeben. Bei `q=1/4` und `k=N` ergibt sich sofort andere Übergangswahrscheinlichkeit als `P_eq`; erklären ohne neue irreführende Kurve.
3. Einzelne kleine Markerfolgen können zu niedrigeren Makrozustands-`ln Ω` führen. UI/Erklärungen dürfen diesen Fall niemals als Programmfehler oder „Physik bricht“ kennzeichnen.
4. Thermalmodelle: `T_A,T_B,T_eq,Q,P,ΔS_A,ΔS_B,ΔS_total,σ,U` konsistent mit dem existierenden exakten Modell. Tests mit T_A>T_B, T_A<T_B, T_A=T_B, ungleichen Kapazitäten, Randwerten und langfristigem Gleichgewicht. `U(t)-U(0)` nahe numerischem Fehler; `ΔS_total` nicht negativ für zulässige passive Wärmeausgleichszeit.
5. Originaltests, v0.1-Integrität und ursprüngliche zwölf Benchmarks erhalten; **keine** Lockerung alter Toleranzen. Neu: UI-Snapshot/DOM-Checks, visuelle Chromium-Testfälle, deutsche/englische Texte, Smartphone 320/390 px, Tastatur, Screenreader-Namen, Reduced Motion.
6. Aufklappen, Prognoseauswahl, Sprachwechsel oder Mascot-Animation schreiben nicht in Modellparameter, Zufalls-Seeds oder unfertige Eingaben. Modellzeit bei laufender Simulation regulär fortschreiten lassen; vorhandene Sichtbarkeitspausen und Vorhersageabbrüche bei Tabwechsel bewahren. Ausdrücklich nur originaler „Übernehmen“-Vorgang ändert Thermalstart.
7. Nahe 0-/großen Entropieänderungen dürfen positive Werte nicht durch formatting oder subtraktive Auslöschung unphysikalisch falsch negativ wirken; vorhandene stabile Implementierung beibehalten. Keine erneute floating-point Randprüfung umgehen.
8. Belege und Modelleinschränkungen nahe allen neuen Aussagen; Quellen/Deep-Link-Struktur in Schritt 04 konsolidieren. Kein Anspruch „wissenschaftlich zertifiziert“.

## 8. Verifizierbare Grundlagen und Quellen für spätere Fachredaktion

- Stanford: [Introduction to Statistical Mechanics – The Statistical Description of Physical Systems](https://web.stanford.edu/~peastman/statmech/statisticaldescription.html) (Mikrozustand, Makrozustand, Ensemble).
- OpenStax: [Statistical Interpretation of Entropy](https://openstax.org/books/college-physics-2e/pages/15-7-statistical-interpretation-of-entropy-and-the-second-law-of-thermodynamics-the-underlying-explanation).
- Stanford: [Thermodynamics – Heat and Entropy](https://www.web.stanford.edu/~peastman/statmech/thermodynamics.html).
- OpenStax: [Second Law of Thermodynamics – Entropy](https://openstax.org/books/physics/pages/12-3-second-law-of-thermodynamics-entropy).
- OpenStax: [Heat Engines, Heat Pumps, Refrigerators](https://openstax.org/books/physics/pages/12-4-applications-of-thermodynamics-heat-engines-heat-pumps-and-refrigerators).
- Stanford Encyclopedia of Philosophy: [Philosophy of Statistical Mechanics](https://plato.stanford.edu/entries/statphys-statmech/) für fortgeschrittene Grenzen der Zeitrichtung/Gleichgewichtsargumente; **nicht** als inhaltliche Grundlage einer einfachen sofort wahren Gewissheit verkaufen.
- Diese Quellen legitimieren Lehrbuchaussagen, **nicht** die Richtigkeit jeder spezifischen Codeberechnung. Code eigenständig gegen Modelle/Referenzwerte prüfen.

## 9. Inhaltliche Entscheidungen – vom Eigentümer bestätigt

1. **Beide** visuellen Kernverbesserungen: kompakter interaktiver Mikro-/Makrozustandsvergleich **und** gleichzeitiger einfacher Energie-/Entropiebilanzvergleich; daneben das vorhandene Histogramm verständlicher machen. Die einzelnen bereits vorhandenen Lehrmodelle nicht verschmelzen.
2. **3–4 richtig gute Alltagsbeispiele als erste Vertiefung** (Wärme von Getränken, Thermoskanne, Kühlschrank und Motoren – immer unter deutlicher Benennung der Grenzen des aktuellen Modells); weitere Fragen über freiwillige tiefergehende Quellen-/Advanced-Verknüpfungen, statt alles auf einmal offen darzustellen.
3. **Zeitpfeil, Leben und Langzeitkosmologie** dürfen in v0.8 nur als vorsichtige, quellengestützte „Mehr verstehen“-Hinweise erscheinen, nicht als simulierte Gewissheit, Prognose über das Universumsende oder falsche Ableitung aus zwei Kammern.
4. **Monster-Humor selten und unaufdringlich**, Physiktext sachlich; eine sichtbare Monsterinstanz im gesamten Interface.
5. **Kein neuer offener Haupt-Infoblock:** eine sichtbare Leitfrage je aktivem Labor/Unterexperiment (Schritt 02), tiefergehende Inhalte bleiben freiwillig eingeklappt. Bestehende wichtige Messwerte und Modellkennzeichnungen natürlich weiterhin sichtbar.

**Status (09.11.2026):** Didaktische Erweiterungen auf dem isolierten Entwicklungsbranch umgesetzt und zur Prüfung vorbereitet; bestehende Physikmodelle unverändert. Monsterintegration bleibt bis zur Sichtfreigabe offen. Ergebnisse und verbleibende Prüfgrenzen stehen im [Qualitätsbericht](../Qualitaetsupdate_v0.8.md). Keine Freigabe für main, Deployment oder v0.8.5.
