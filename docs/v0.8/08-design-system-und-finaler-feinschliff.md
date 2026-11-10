# Schritt 08 – Das visuelle Gesamtsystem: Reincarnated as a Proton
## Inhaltlich freigegeben (09.11.2026) – behutsamer Design-Finalpass, NICHT implementiert

**Explizite Entscheidung des Eigentümers am 09.11.2026:** „behutsam modernisieren“, nicht zu aufwendig; Design ist vorerst zweitrangig gegenüber **funktionierenden Experimenten, sauberen Animationen, guter Bedienbarkeit und Tests**. Kein extremes Redesign und kein großflächiges Umstrukturieren. Die **bestehenden Hauptbereiche, Unterbereiche, Modelle, mathematischen Grundlagen, Regler und vertrauten Nutzungsabläufe bleiben grundsätzlich erhalten**; neue freigegebene Inhalte aus Schritten 02–07 werden in diese Struktur integriert. Begrenzter optischer Feinschliff ist gewünscht, aber nur risikobewusst und wo er die Benutzung verbessert. Damit ist Schritt 08 **inhaltlich freigegeben**, nicht technisch beauftragt. Jeder ambitioniertere unten noch als Idee beschriebene Designvorschlag ist gegenüber dieser Entscheidung **nachrangig**.

**Stand:** 09.11.2026. **Repository:** `phoscore/entrolab`, Planungsbranch `develop/v0.8`. **Releases:** Planung 01–08 vollständig vor Work; danach **Phase 1 v0.8 (01–04)**, testen und unabhängig reviewen, **Phase 2 v0.8.5 (05–08)** auf dem ausdrücklich genehmigten v0.8-Stand. Keine automatische Merge-/Domain-/Cloudflare-Freigabe. **Schritt 08 soll besonders sorgfältig gestaltet und mit echten Desktop-/Mobile-Vorschauen abgenommen werden.** Dieses Dokument beschreibt die technische und gestalterische Richtung, nicht die fertigen Screenshots oder den Work-Auftrag.

**Verbindliche Eingaben:** ausgewählter künftiger Website-Name `Reincarnated as a Proton`; vom Nutzer ausgewähltes **minimalistisches rot-schwarzes skizzenhaftes A3 / Glitched Entity** (nicht die ältere violett-türkise Monsterillustration), ein einziges In-Page-Monster; minimale Erklär-Einstiege (02); greifbare Entropievisualisierung (03); einheitliches, unaufdringliches Wissenssystem (04); freiwillige Guides (05); zwei BH-Ansichten plus schematischer Winkel (06); Temperaturkontext, Vergleich, **Material Explorer** (07). **Physik/Lesbarkeit stehen über Deko.**

## 1. Ausgangszustand und Designprobleme tatsächlich vorhandener Dateien

Auf aktuellem `main` wurden geprüft: `dist/style.css`, `dist/ux.css`, `dist/entropy.css`, `dist/thermal.css`, `dist/index.html`, `dist/extreme-render.mjs`, `dist/extreme-ui.mjs`, `dist/discovery.mjs`, `dist/guide.mjs` sowie die v0.8-Planung.

- **Vorhandene Basis ist nicht schlecht:** dunkel, echte lesbare Schriftgrößen auf vielen Controls, starke visuelle Hierarchie für einige Kennzahlen, zwei bestehende Schriften `DM Sans` und `Space Grotesk`, mobile Media Queries, Skip-Link, Fokuszustände, `prefers-reduced-motion`, viele schon sinnvolle Informationswarnungen.
- **In mehreren CSS-Dateien verstreute Tokens:** `:root` in `style.css` mit violettem `--accent`, überschriebenes `:root` in `ux.css`; zahlreiche statische violette `#hex`-Werte in `entropy.css`, `thermal.css`, UI und Canvas-Renderroutinen. Einfach `--accent` auf Rot drehen, ohne Komponentenaudit, wäre falsch und könnte Kontraste sowie Farbsemantik zerstören.
- **Unterschiedliche Layoutlogik je Labor:** Gravity ist desktopseitig dreispaltig, Entropy und Wärme zwei Spalten, Extreme enthält lange vertikale Bereiche, Black Hole Lab bis v0.7 primär Formeln/Diagramme. Der finale Designpass muss jeden Bereich **gezielt** behandeln, nicht alles in dieselben Karten zwängen.
- **Extremely long site title:** `Reincarnated as a Proton` passt nicht in jede mobile Header-Leiste. Gezielte mobile Brand-Zeilenumbrüche/kompakte Navigationsanordnung statt abgeschnittener Überschrift oder winziger Text.
- **Schritt 01 enthält historische widersprüchliche ältere Stilabschnitte (violett/türkis, 2.5D-Monster).** Das explizit zuletzt vom Nutzer ausgewählte **rote, schlichte A3-Skizzenmonster hat Vorrang**. **Die originale Bildreferenz liegt nun tatsächlich als [GitHub-Masterdatei](assets/a3-glitched-entity-master.jpg) vor** und muss Work als konkreter visueller Input dienen; die älteren Beschreibungen sind kein Ersatz für dieses Bild.

## 2. Visuelle Leitidee: behutsame Verbesserung statt Redesign

**Ästhetik:** Die bereits funktionierende dunkle Forschungsoberfläche **wird wiedererkennbar bleiben**. Nur offensichtliche Reibung beseitigen: kleinere Kontrast-/Typografiefehler, inkonsistente Abstände, eine sparsame rote Akzentführung zur bereits freigegebenen roten Skizzenfigur und saubere Darstellung neuer Features. Der frühere Arbeitstitel „Experimental Cosmic Notebook“ war eine mögliche Stimmung, **keine Freigabe für ein vollständiges Designkonzept**. Keine neuen Hero-Layouts, keine unnötige Navigation, kein großflächiger Farb-/Schriftenwechsel; vorhandene Farben für Graphenserien dürfen bestehen. Gut lesbare Daten, ruhige Erklärungen und solide Animationen zählen mehr als eine neue Optik.

**Visuelle Priorität in jedem View:**
1. **Hauptfrage** direkt unter der jeweiligen aktiven Laborüberschrift (02, geschlossen).
2. **Experiment / wesentliche Bedienung** und wichtigste echte Werte.
3. **Ergebnis / nachvollziehbare Gegenüberstellung** oder visualisierte Physik.
4. **Freiwillige Erklärungen / Mini-Vorhersagen / Modellgrenzen / Quellen**.
5. **Dekoration und Monster** mit kleinster Priorität.

Keine messbaren Inhalte unter permanente „parallax“ oder Atmosphäre-Layer legen. „Mehr Bild“ darf nicht „weniger Experiment“ bedeuten. Keine neue Pflicht-Landingpage, kein Carousel, kein Login, kein Backend, keine Werbung/Tracking, keine neuen Haupttabs.

## 3. Verbindliches Farb- und Formsystem: alte Palette korrigieren

**Primäres Markenzeichen:** nahezu schwarzer Hintergrund mit **roten skizzenhaften Linien des Monsters**, dessen zwei hellen Augen/Grinsen auch ohne Glow erkennbar bleiben. **Das frühere violette Monster-Concept ist verworfen.** Violett darf nur aus begründeter fachlicher Graphen-/Messfarbsemantik übernommen werden, nicht als konkurrierende Markennormalfarbe.

**Nur optionale, KEINE verpflichtende Neufärbung:** Die folgenden Tokens sind eine **unverbindliche Referenz**, keine Zielpalette, die überall eingeführt werden muss. Vorhandene dunkle Farben und Kontraste bevorzugt erhalten und nur konkrete inkonsistente Komponenten gezielt angleichen. Exakt diese Hexwerte nicht als Abnahmekriterium verwenden:
- `--cosmos-bg`: `#090B10` (tiefer dunkler Hintergrund);
- `--cosmos-panel`: `#12161E` (angehobene matte Versuchsfläche);
- `--cosmos-elevated`: `#1B222C` (Interaktionen, geöffnete Erklärungen);
- `--cosmos-line`: `#36404B` (ruhige sichtbare Trennlinien);
- `--cosmos-text`: `#F1F3F6` (primär); `--cosmos-muted`: `#BDC7D2` (Sekundärtext);
- `--cosmos-brand-red`: `#EF626E` (selektiv für Brand/aktive Navigation, nach Kontrastprüfung);
- **Semantische, nicht übermäßige Lab-Akzente:** kühles Türkis `#7ED4DB` für einen klar bezeichneten Messkanal, warmes Amber `#EFB876` für einen zweiten Kanal, Rot/Pink nur für Brand oder echten Fehler mit zusätzlichem Text/Symbol. Werte/Diagrammserien dürfen differenzierte Farben behalten, sofern Legende/Labels die Bedeutung tragen.
- Keine fünf knalligen Verlaufsflächen, keine Neon-Rahmen überall, keine flächige rote Warnfarbe für normalen Text, keine unlesbaren hellen Glows hinter Formeln.
- `--space-*`, `--radius-*`, `--font-*`, `--focus-ring`, `--touch-min`, `--canvas-backdrop` statt zufälliger Einzelpixelwerte. Verwendete Tokens werden aus zentraler Grundlage konsistent durch alle CSS-Schichten abgeleitet.
- **Contrast before color:** Ziel **WCAG 2.2 AA**: normale Textgrößen mindestens 4.5:1, großer Text mindestens 3:1 und wesentliche Nichttext-UI-Elemente mindestens 3:1 soweit jeweils zutreffend; durch programmatische Messung der tatsächlichen Vorder-/Hintergründe prüfen. Focus darf nie nur über einen minimalen kaum sichtbaren Farbwechsel vermittelt werden.

**Typografie:** bestehende Schriftgrößen und Hierarchie soweit funktionierend beibehalten; maximal zwei derzeit bestehende Schriftfamilien (Space Grotesk für Titel / DM Sans für Erklärung und Controls) mit zuverlässigen System-Fallbacks. Bestehenden Google-Fonts-Import und Offline-/Datenschutz-Aspekte beim Build prüfen; Ressourcen dürfen keine Voraussetzung für bedienbare UI sein. Basistext in normalen Lesebereichen ungefähr 16px, erklärende Absätze 16–18px, Hilfetext nicht zu klein (<13–14px) und nicht nur blassgrau. Messwerte mit tabellarischen Ziffern, Einheiten in gut lesbarer konstanter Nähe; lange Exponentenschreibweisen umbrechen, nicht abschneiden. `font-variant-numeric: tabular-nums` für Zahlenkarten.

## 4. Bestehende Layoutarchitektur erhalten – jedes Gerät bekommt denselben Inhalt

### Desktop (ca. >= 1200 CSS px)
- Begrenzte sinnvolle Inhaltsbreite; bei Gravity vorhandene Seitenkontrollen plus zentrale Bühne, Hilfen rechts oder darunter, aber wissenschaftliche Messanzeigen stets gut lesbar.
- Black Hole: neue visuelle Bühne aus 06 dominant **aber nicht auf Kosten der vier echten Werte**; Diagramme optional darunter, nicht verschwunden.
- Entropy: „Mikrozustände zum Anfassen“ plus Histogramm (03), Wärmebilanz in sinnvoller Nähe der Temperaturverläufe.
- Extreme: getrennte „Objekte“ und „Temperature“-Unterabschnitte, Material Explorer (07) optional statt 4 dauerhaft sichtbarer Karten.
- Science: schmales Inhaltsverzeichnis, strukturierte Kapitel ohne vier endlos schwere gleichgewichtete Kacheln.

### Tablet / schmaler Desktop (~768–1199 CSS px)
- Lange 3-Spalten-Labore auf zwei oder eine Spalte umbrechen; Eingaben und Ergebnisse nicht mit zu wenig Platz nebeneinander pressen.
- Header darf umbrechen; aktiver Haupttab bleibt klar und in DOM-Reihenfolge erreichbar, keine verschwundenen Buttons.
- Canvas aspektratiobasiert, kein Overflow durch Zoom/Einheiten/Werte.

### Smartphone (mindestens 320, 360, 390, 430 CSS px als Testmatrix)
- **Inhalt zuerst**: Brand in zwei Zeilen oder sauber umbrochen; Hauptnavigation als gut beschriftete erreichbare Scroll-/Wrap-Leiste, keine Minischrift für den langen Namen. Keine fixe riesige Hero-Illustration vor der eigentlichen Bedienung.
- Labore in lesbarer **einspaltiger** Reihenfolge: Laborfrage → wichtigsten Wert/Control → Experiment/Grafik → weitere Werte → Quellen/Advanced. Anker und kleine „zum Experiment“-Rückwege dürfen helfen; kein Layout-Sprung bei jeder Werteänderung.
- Mobile Touch-Ziele vorzugsweise >=44×44 CSS px, während WCAG-AA-Mindestzielgröße 24×24 CSS px samt definierten Ausnahmen gesondert nachzuweisen ist. Pointerdrag nur dort erforderlich, wo es eine gleichwertige alternative Tastatur-/Pointerbedienung gibt.
- Jede Beschriftung bleibt verständlich, Slider/Direktwert können beide bedient werden, Fokus ist sichtbar und nicht unter klebender Navigation verdeckt; kein horizontales Scrollen auf Seitenniveau, interne Diagramm-Tabellen dürfen explizit kontrolliert scrollen.
- Landscape-Mobil, 200%- und 400%-Zoom testen; `min-width:0`, responsive Canvas, Breakpoints aufgrund **Inhalt** statt nur Gerätetyp, sichere Details-/Dialoghöhen.

## 5. Komponentensystem: dieselbe Erklärung fühlt sich überall gleich an

**Die bestehenden DOM- und CSS-Strukturen behalten; lediglich ähnliche neue UI-Elemente (Schritte 02–07) konsistent gestalten. Die folgenden Bezeichnungen sind logische Muster, keine Forderung, eine neue Komponentenbibliothek oder flächendeckende Architektur zu refaktorieren; keine neue UI-Framework-Abhängigkeit:**
- `LabHeader`: Lab-Titel, kleines sachliches Modelllabel, genau **eine** sichtbare Hauptfrage (02) und optionaler zweiter Prognose-Ausklapper **innerhalb der geöffneten Frage**.
- `Metric`: beschriftete Einheit, gut lesbare Zahl, kurze ⓘ-Erklärung aus 04, optionales Vorzeichen/Fehlerlabel.
- `ControlGroup`: richtige HTML-`label`, Eingabe, optionaler Min/Max-/Apply-Zustand, Fehlertext und aussagekräftiges disabled-Verhalten.
- `ModelDisclaimer`: essentialisierte Modelleinordnung im sichtbaren Kontext, weitere Quellen im Advanced; **keine** Fiktion als wissenschaftliche Zahl.
- `ExperimentStage`: je Lab für Grafik/Canvas/SVG, klare Legenden, visueller Modus ohne physikalische Seiteneffekte.
- `Accordion`: einheitliche Headline, Tastatur und ARIA, geöffnet/geschlossen, Fokus.
- `SourceLink`, `GuideReturn`, `Preset`, `Status`: gemeinsame visuelle Zustände und Texte DE/EN; nicht durch neue CSS-Regeln Interaktionslogik brechen.

**Konkrete Protokolle:** Leere/ungültige Eingabe unterscheiden; Validierung und wissenschaftliche Bedeutung nicht ausschließlich über Farbe. Bei Wärmeübergabe bleibt „vormerken“ verschieden von „Übernehmen“. Öffnen/Schließen/Animation ändert keine Modellzeit oder Zufallsschritte. Alle 4 wichtigsten Werte bleiben priorisiert, nicht wegen Grafik in Kleinstschrift verbannt.

## 6. Das eine Monster – konkrete Design- und Bewegungsregeln

**Source of truth:** Benutzer hat eine **rote/fast schwarze skizzenhafte A3 Glitched Entity** gewählt. Die früheren violett-türkisen 2.5D-Farben aus dem historischen Teil des 01-Dokuments sind nur Entwurfshistorie, **nicht aktueller Auftrag**. Figur mit asymmetrischer spitzer Maskensilhouette, gebrochenem roten Ring, wenigen Fragmentlinien, zwei hellen Augen/Schlitzen, leicht schiefem weißen Grinsen, ringförmiger Brustlücke, vereinfachten Greifarmen, nach unten auslaufenden Segmenten. **Reduktion** für 32/48/64 px und bewegungsfreie Fallbackform. Keine massenhafte Illustration neben jeder Formel.
- **Ein einziger Creature-Manager/DOM-Root**: nie gleichzeitig mehrere sichtbare Instanzen. Unterschiedliche Kontexte = dieselbe Figur in anderer Pose/Position. Auch Dutzende Erklär-Klicks oder Tabwechsel dürfen keine zweite Spawn-Instanz erzeugen.
- Trigger nur **bewusst wenige bedeutungsvolle** Ereignisse: erster gelungener Miniversuch, sehr seltenes Vorbeischauen, Kontextwechsel auf große kosmische Themen; keine falschen Physik-Events, keine regelmäßigen Popup-Ketten, keine Sprüche mitten auf Kennzahlen.
- Höchstens ein sehr kurzer Glitch-Satz/-Versatz, keine flackernden Vollbildflächen, keine gefährlich blinkenden Effekte. Bewegung konzentriert, nicht permanent. Sound komplett **nicht** Bestandteil.
- **Globale Option „Monsterbewegung aus“** und möglichst „Monster aus“, beide unabhängig vom Betriebssystem-Reduced-Motion-Wunsch. Bei `prefers-reduced-motion: reduce` default alle nicht notwendigen Monsterbewegungen und Hintergrundbewegungen aus; Text/Bedienung weiterhin vollständig.
- Bei einer deaktivierten Figur bleibt die Hauptfrage an derselben Stelle und lässt sich selbst bedienen; Monster ist niemals selbst die einzige Schaltfläche für eine Aufgabe, Quelle oder Antwort.
- **Masterasset jetzt gesichert:** Die vom Nutzer ausdrücklich bestätigte [A3-Masterreferenz](assets/a3-glitched-entity-master.jpg) ist **auf GitHub vorhanden und bytegenau unverändert**. Nach separater Work-Baufreigabe die benötigten **Hero-, Rand-Peek- und Icon-/Favicon-Webderivate zuerst aus dem Master ableiten**, deren Ähnlichkeit auf Desktop und kleinen Größen zeigen und visuell abnehmen lassen; erst danach breit einbinden. PNG/WebP genügt, wenn echte SVG-Umsetzung die Vorlagentreue gefährden würde. **Nicht** die alte violette Beschreibung als Ersatz nutzen. Keine Fremdfiguren/Stock-Fotos einchecken.

## 7. Kosmischer Hintergrund & Motion Design: nur Hauch Entropie

**Nice-to-have, nicht Pflichtumfang:** ein optionaler extrem zurückhaltender **abstrakter Entropie-Hintergrund** (vereinzelte Fragmentlinien/Speckles, höchstens sehr langsame Richtungseffekte) **standardmäßig statisch bzw. weglassbar**, vorzugsweise CSS/SVG ohne neue WebGL-Pipeline. Ist dies wegen Performance, Layout oder Tests aufwendig, **vollständig streichen statt Kernfeatures zu gefährden**. **Er symbolisiert nur die Ästhetik; keine Entropie-Messung** und keine in das Marker-/Wärmemodell einschreibende Größe.

**Bewegungsbudget:**
- Hintergrund **nur wenn Seite sichtbar, Bedienung nicht fokuskritisch und Hardware hinreichend**; Standard darf sogar komplett statisch sein. `prefers-reduced-motion` und Nutzeroption „Atmosphäre aus“ zwingend. Beim Überschreiten eines Performancebudgets: zuerst Hintergrund deaktivieren, niemals echte Simulationen ausbremsen.
- Die **fachlich vorhandenen Animationsschleifen** (Gravity, Extreme, ggf. BH aus 06, Wärme) dürfen nur auf dem jeweils sichtbaren relevantem Canvas aktiv sein. Keine unnötige unabhängige Dauer-RAF nur für Monster oder Hintergrund. Eine dokumentierte zentrale Steuerung für optionale Dekoration oder CSS-Animationen.
- Eigene deterministische Parameter für Dekoration, **kein** Konsum der RNG-Folge des diskreten Entropy-Lehrmodells, keine Abhängigkeit von `blackHole(m)` außer ausdrücklich beschrifteten Modellgrößen. 
- `document.hidden`, View-/Unterview-Wechsel, `IntersectionObserver`, reduzierte Bewegung, Animationspause, Browser-Resize und mehrfaches Öffnen/Schließen der Erklärungen zuverlässig behandeln. Kein überlaufender Partikelpool, kein Canvas-DPR-Speicherwachstum oder `requestAnimationFrame`-Doppelbetrieb.
- **Keine** Dauer-Hintergrundanimation hinter mathematischen Kurven auf Handy, keine Pseudophysik, keine farbigen Explosionen beim Beantworten eines Quiz, keine gestalterischen Fake-Readouts.

## 8. Fachbereichs-spezifischer Finalpass, ohne Scope-Creep

### Gravity Sandbox
Schlanke Kontrollen, gut unterscheidbare Körper-/Bahnen/Prognosekennzeichnung; bei Auswahl/editierbaren Körpern klare Werte/Einheiten; wissenschaftliche Modellwarnung gut sichtbar. Keine grafische Gravitation-Krümmung, solange Newton-Simulation.

### Black Hole Lab
Die beschlossenen **zwei** visuellen Modi plus optionale rein schematische Blickwinkelwahl. Massenrechner und vier echte Kennzahlen stehen weiter im Vordergrund; „schematische Illustration / keine Licht-Geodätenrechnung“ im Bild. Presets, altes Radien-/Log-Plot behalten; kein Pseudo-EHT-„Foto“.

### Extreme Objects
Stern-/kompakte-Objekt-Vergleiche und log/linear nicht vermischen. Die bestehende schematische Akkretionsgrafik kann rendererartig mit Schritt 06 wiederverwendet werden, darf aber die BH- und Extreme-UI-Werte nicht koppeln. Pulsar-Kegel, Sternoberflächen-/Farben- und Dichtehinweise bleiben ehrlich.

### Extreme Temperature mit Material Explorer
Kelvin-/Celsius-Direkteingabe, 0-K-Sonderfall und Log-Skala bleiben; **Material Explorer mit vier Reinstoffen** und korrekten Phasengrenzen bei 1 atm als freiwilliger Block, optionaler Zwei-Temperaturen-Vergleich, keine Dauerflut an Karten. Belegte Wechsel, klare Auskunft „außerhalb dieses vereinfachten Zustandsmodells“ bei Extreme-T. Die strikten 250–600-K-Thermal-Übertragungsgrenzen und ursprünglichen Dezimalquellen bleiben geschützt.

### Entropy Lab
Mikro-/Makrozustand als klare anschauliche Gesten und Zusammenhang zum Histogramm; Wärme-/Energiebilanzen ruhig, Vorzeichen und Einheiten lesbar, `S/k_B` und `ΔS` niemals vermischen. Marker sind keine realen Gasbahnen. Interaktive Prognose-Ausklapper aus 02 standardmäßig geschlossen.

### Science, Glossar und „Erste Schritte“
Science ist ein gut gegliedertes ruhiges Nachschlagewerk (04), der neue Guide aus 05 ist nur bei Bedarf aktiv und zeigt **immer genau eine** Kernanweisung im Kontext. Deep-Link/Fokus-Rücksprung und bilingualer Inhalt sind stabil. Keine zweite separate Wiki-App.

## 9. Accessibility, Sprache und wissenschaftliche Vertrauenswürdigkeit

**Zielstandard:** [W3C WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) soweit für das Produkt einschlägig; Ausnahmen und manuelle Prüfgrenzen dokumentieren. Wichtig besonders:
- Schrift- und UI-Kontrast nach tatsächlichem Design prüfen, 4.5:1 normaler Text, 3:1 großer Text, 3:1 wichtige nichttextuelle Zustandsanzeige; keine allein farbbasierte Unterscheidung von warm/kalt, A/B, Fehler/Erfolg oder Modell/Illustration.
- Tastatur: Tab/Shift+Tab/Enter/Space/Escape/Arrow an allen sinnvollen Controls; sichtbarer Fokus, kein Fokusverlust bei dynamischen Labs/Guide, zugängliche Hilfe und Accordion-Zustände.
- Responsive Reflow/Zoom bis 400 %, text resize, Landscape, 320px, 390px; keine versteckten Teile der Tabellen oder Metriken. Alle status-Updates bei expliziten Änderungen sinnvoll, aber **keine** 60x/s `aria-live`-Dauerfeuer.
- Canvas-/Diagramme: kurze Bildschirmleser-Alternative / Daten-Zusammenfassung, Achsentitel + Einheiten, serielle Farben plus gestrichelte/verschiedene Linien oder Labels.
- Keine problematischen Glitch-Flashs, `prefers-reduced-motion` + manuelle Aus-Option für unnötige Bewegung; MDN: [Using Media Queries for Accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility).
- DE/EN vollständig und fachlich gleichwertig, keine rohen String-Keys, kein Modal-Overlay über ungespeicherte Eingaben; sprachabhängige Zahlenformate vs. bestehende **Dezimalpunkt-Eingabekonvention** klar darstellen.
- Klare Markierung, was **Beobachtung / theoretische Formel / idealisiertes Lehrmodell / schematischer Kosmos-Effekt / Mascot-Sci-Fi** ist. Der Plan verlangt Quellen und echte Testevidenz, aber **keine** Behauptung wissenschaftlicher Zertifizierung.

## 10. Technische Umsetzung: sichere Schichtung statt Global-CSS-Explosion

**Bestandsschutz:** Keine neue React-/Vue-/WebGL-App. Bei Implementierung gezielt moderne CSS-Features und kleine JS-Komponenten verwenden, wenn die Browsermatrix sie unterstützt.

**Technische Reihenfolge innerhalb Schritt 08 (risikoarm und mit klaren Stop-Kriterien):**
1. **Baseline:** relevante Desktop-/Handy-Screenshots, bestehende Render-/Animierungsperfomance, CSS-Kaskade und volle bestehende Tests **vor** dem Feinschliff erfassen. Keine unnötige Komplettinventur, die den Fortschritt an den Laboren blockiert.
2. **Zuerst funktionieren alle Fachfeatures:** Ergebnisse aus 01–07 in der vorhandenen Navigation, mit stabilen Modellen, gültigen Grenzwerten, echten Eingaben und gut funktionierenden Animationen. **Die BH-Animation aus Schritt 06 und die realitätsgetreue qualitative Materialansicht aus Schritt 07 bekommen Vorrang.**
3. **Nur gezielte UI-Korrekturen** an nachgewiesenen Problemen: zu lange Labels, abgeschnittene Zahlen, mobile Spalten, schlechte Kontraste, nicht erreichbare Bedienelemente, unklare aktive Auswahl, fehlerhafte Fokusführung. Wenn eine existierende Komponente gut ist: **nicht ändern**.
4. **Sparsame Markenangleichung:** Name, roter Skizzen-Mascot an geeigneten Stellen, einzelne Akzent-/Abstandsanpassungen. Keine CSS-Token-Migration ohne konkreten funktionalen/visuellen Nutzen. Vorhandene `style.css`/`ux.css`/`entropy.css`/`thermal.css` **nicht** ohne Not flächendeckend neu schreiben. Monster und dekorativer Hintergrund sind verzichtbare Atmosphäre, nicht Blocker für funktionierende Labore; **das ausgewählte Bildasset** bleibt allerdings für eine originalgetreue Mascot-Umsetzung erforderlich.
5. **Regressions- und UX-Prüfung:** Browser-Screenshots, Mobile, Tastatur, Reduced Motion, wissenschaftliche Testfälle, Idle-Performance; nach konkreten Problemen nachbessern, keine Refactor-Ketten starten. Dann unabhängiger Review und separater PR.

**Stop-Kriterien:** Wenn eine Designänderung eine größere Umstrukturierung aller Hauptansichten, neue Physikpfade, geänderte Navigationssemantik, zusätzliche nicht angefragte Animationen, erhebliche Leistungseinbußen oder neue ungeprüfte Abhängigkeiten erfordert, **abbrechen bzw. separat zur Freigabe vorlegen**. Ein moderater stilistischer Unterschied ist kein Grund für eine Komplettmigration.

**Design-Single-Source-of-Truth:** Das zuletzt vom Nutzer genehmigte rot-schwarze A3-Monster, nicht ältere violette Beschreibungen; zentrale Tokens statt verstreuten Farbduplikaten; die Fachquelle in Schritt 04 statt neuer Design-Fachtexte. Bei Kontrastkonflikten die Farbhelligkeit anpassen, **nicht** die wissenschaftliche Warnung entfernen.

## 11. Performance und Energieverbrauch – konkrete Prüfpflichten

- Auf einem mobilen CPU-Throttle-Profil **vorher/nachher reproduzierbar messen** (Geräteprofil dokumentieren). Schlechtere Performance nicht hinter einer optisch guten Desktopaufnahme verstecken.
- **No idle work:** Bei allen außer Sicht laufenden Views und bei `document.hidden`: keine Dekor-RAF, keine neuen BH-RAF und keine Render-Loop-Aufblähung; bestehende fachliche laufende Aufgaben auf bestehende definierte Pause-/Fortsetzungsregeln prüfen. Alle aufrufenden Timer/Observer sauber aufräumen.
- Keine großflächigen GPU-filter-/blur-Animationen oder 2000 DOM-Partikel in Standardansicht. High-/Low-Quality-Schalter, wo bestehend, erhalten, ggf. für neue BH-Bühne analog nutzen; DPR-Limit und Canvas-Backbuffers nachvollziehbar.
- Neue Bild-/Font-/SVG-/CSS-/JS-Assets mit Größe und Ladezeit protokollieren; Fonts dürfen im Offline-Modus nicht blockieren. **Keine spekulativen absoluten FPS-/Byte-Garantien** ohne technische Benchmarkbasis; Work muss vor Implementierung eine nachvollziehbare Baseline und strengere budgetierte Zielwerte festlegen, die auf Desktop und einem schwächeren mobilen Testprofil überprüfbar sind.
- Mindestens 100 strukturierte Tab-/Modal-/Guide-Wechsel und wiederholte Resize-/Language-Wechsel: **keine** wachsende Anzahl von Creature-Knoten, Canvas-Backingstores, Observern oder RAF-Loops; Speicher und CPU in wiederholten Läufen vergleichen.
- Anfertigen von Screenshots/Bewegtbild darf echte Messwerte, achsenabhängige Diagramme oder Modellstabilität nicht beeinträchtigen.

## 12. Nachweisbare visuelle und funktionale Definition of Done (MUSS-Kriterien)

**Sichtbare Qualität:**
1. Vorher-/Nachher-Screenshots (DE/EN) für alle fünf Haupttabs, beide Entropy-Unterexperimente, Extreme Objects, Extreme Temperature / Material Explorer, beide BH-Ansichten und statische Reduced-Motion-Zustände; mindestens **Desktop 1440px und Smartphone 320/390px**, weitere Breiten nach Risiko.
2. **Bestehende Komponenten gezielt verbessert statt komplett ersetzt**, keine gequetschten Messwertkarten, nicht skalierten Schriftbilder, verdeckten Buttons, Überläufe oder versetzten Touch-Targets. Hauptfrage unter aktivem Labtitel überall schnell auffindbar, Zusatzfragen standardmäßig geschlossen.
3. **Ausgewähltes rot-schwarzes Monster tatsächlich getroffen**, im Hero-/Rand-/Kompaktzustand erkennbar und in derselben Identität. Nicht einfach alte violette Wraith kopiert. Die **bereits auf GitHub hinterlegte Referenzdatei** gegen die Webderivate auf Screenshots verifizieren und die abgeleiteten Varianten vor der breiten Integration visuell freigeben lassen.
4. Nur ein In-Page-Monster, die Figure darf Texte/Werte nicht verdecken. „Monsterbewegung aus“, „Monster aus“ und Reduced Motion funktionieren auch nach Tab-/Sprachwechsel; Hintergrund ebenfalls optional und nicht irreführend.
5. Black Hole visuell nachvollziehbar, aber **schematisch** mit dem beschlossenen Blickwinkel, keine fiktiven GR-Metriken; Temperature Material Explorer zeigt bei hohem T Grenzen statt erfundene Ergebnisse. Wissenschaftliche Werte priorisiert.
6. Quellen/Modellhinweise, Steuerungen und Fehlertexte sind lesbar, nicht in Advanced verschoben, wenn für das Verständnis einer Zahl unentbehrlich.

**Funktionale Regression:**
7. Alle bestehenden zwölf historischen numerischen Benchmarks, `archive/v0.1` und Original-SHA-Schutz, alle v0.7-/v0.8-/v0.8.5-Tests bestehen. **Keine** Tolerenzlockerung, Löschung alter Tests oder stilles Ändern von Gleichungen, um Screenshotfehler zu beheben.
8. Tests über Tabwechsel, DE/EN, alle Vorhersagefragen, Settings/Guide/Glossar, Cancel/Apply, Materialvergleich, Zoom, Touch, Tastatur, mobile Landscape, Reduced Motion; keine Datenänderung durch bloße UI-Darstellung.
9. **Gezielte harte Regressionsprüfungen der reparierten Celsius/Kelvin-250-K-Grenze** einschließlich `-23.15°C ↔ 250K`, expliziter Dezimalwerte knapp darunter und rundungsbedingter Anzeigehinweise; keine automatische Übernahme.
10. Bekannte wissenschaftliche Grenzen bleiben sichtbar: Marker keine Gasdynamik; BH-Scheibe/Grafik keine berechneten Lichtbahnen; Entropy-Zähl-`S/k_B` nicht gleich thermische `ΔS`; 10¹² K ist Lab-Skalengrenze, kein Naturmaximum; Materialphasen gelten nur im dokumentierten Regime.

**Qualitätsworkflow:**
11. Browser-Automation (Chromium) plus bewusste manuelle Sichtprüfung für Screenreader/Kontrast/Touch. Falls reale Mobilhardwaretests nicht verfügbar sind, ausdrücklich so kennzeichnen; niemals als bestanden erfinden.
12. CI-Historie, geänderte CSS-Dateien, neue Assets, Performance-Messungen und vorher/nachher visuelle Evidenz im Qualitätsdokument; unabhängigen Codex-Review mit Antworten auf echte Befunde, kein Review „durch den Autor allein“ als unabhängig ausgeben.
13. Erst nachdem der Eigentümer die Vorschau sieht und ausdrücklich **Merge/Deployment** genehmigt: Release. Private Repo-/Domain-/Brand-Migration, Cloudflare-Schaltung und Short-URL nicht ungefragt ändern.

## 13. Abschließende Entscheidung: behutsames Design, stabile Experimente

**Vom Nutzer am 09.11.2026 ausdrücklich festgelegt und für Schritt 08 inhaltlich freigegeben:**

1. **Funktion vor Optik.** Alle vorhandenen Haupt- und Unterabschnitte, Modelle, Formeln, Datenflüsse und grundsätzlich vertrauten Workflows **beibehalten**, nur bereits beschlossene Feature-Erweiterungen aus Schritten 01–07 ergänzen.
2. **Animationen wirklich gut machen:** zuerst die anschauliche, solide Black-Hole-Darstellung (zwei Modi + illustrativer Blickwinkel), die Entropievisualisierungen und die Temperatur-/Materialdarstellungen funktional optimieren. Kein Grafik-Gimmick darf die fachliche Berechnung verschlechtern.
3. **Design nur behutsam modernisieren:** bestehende Dark-UI als Basis; leichte rote Branding-Akzente, einheitlichere Hilfen und lesbare Karten, gezielte Kontrast-/Spacing-/Mobilverbesserungen. **Kein extremes Redesign, kein globaler Komponenten-Neubau, keine neue Hauptnavigation.**
4. **Monster anhand des ausgewählten roten Skizzenentwurfs** an wenigen passenden Kontexten zeigen; dieselbe eine Figur, abschaltbar. **Originalasset ist vorhanden**, die von Work daraus abgeleiteten optimierten Websitegrafiken brauchen noch visuelle Abnahme; alte violette Variante ist verworfen.
5. **Dekorativen Entropie-Hintergrund optional und niedrig priorisieren**; wenn realer Aufwand/Performanceproblem entsteht: weglassen. Bereits funktionierende Animationen nicht allein für Einheitlichkeit neu schreiben.
6. **Echte Tests statt optischer Selbsttäuschung:** Wissenschafts-/Grenzregressionen, Desktop/320/390px, DE/EN, Fokus, Reduced Motion, Performance, kein Mehrfach-RAF. Qualitätsprobleme vor Merge beheben; nichts unabhängig vom Nutzer deployen.

### Prioritätenbudget innerhalb von Schritt 08

**P0 / MUSS:** Integration ohne Regression, bewährte Layoutstruktur, Animationen performant und bedienbar, korrekte Einheiten/Warnungen, kleinere Layout-/Kontrastprobleme beheben, Monster auf Basis des **bereits vorhandenen GitHub-Masters und visuell abgenommener Webderivate**, DE/EN und Accessibility. **Die im Schritt 01 bereits gewählte Monsteridentität und in 06/07 beschlossenen Features werden nicht stillschweigend aus Scope entfernt; lediglich zusätzliche Dekoration ist optional.**

**P1 / SOLL:** dezente Konsistenz von Button-/Panel-/Typografiedetails, ausgewählte Header-/Akzentänderungen, kleine unaufdringliche Monster-Animationen.

**P2 / KANN ENTFALLEN:** neue Hintergrundpartikel, zusätzliche Parallaxe, farbintensive Spezialeffekte, größere visuelle Neukompositionen und rein kosmetische Umschreibungen funktionierender Komponenten.

### Planung und Umsetzungsgates

**Status: SCHRITT 08 INHALTLICH FREIGEGEBEN (09.11.2026).** Dies beschließt **die achtstufige inhaltliche Planung**, nicht die technische Implementierung. **Die Monster-Masterbildreferenz wurde am 09.11.2026 in GitHub gesichert**. Vor Work bleiben: kontrollierte Konsistenzprüfung aller acht Planungsdokumente auf Widersprüche und ein **separater ausdrücklicher Work-Bauauftrag**. **Als erste visuelle Work-Aufgabe** werden daraus erforderliche kleine Webderivate mit Nutzer-Vorschau erstellt; für eine spätere öffentliche Domain-/Markenumstellung ist gesonderte Prüfung notwendig. Work zuerst auf v0.8 (01–04), Tests, unabhängiger Review und eigene Mergefreigabe; v0.8.5 danach getrennt (05–08). Keine Code- oder Cloudflare-Änderung jetzt.
