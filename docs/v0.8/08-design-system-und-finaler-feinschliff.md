# Schritt 08 – Das visuelle Gesamtsystem: Reincarnated as a Proton
## Umfassender Diskussionsentwurf für v0.8.5 – noch NICHT freigegeben oder implementiert

**Stand:** 09.11.2026. **Repository:** `phoscore/entrolab`, Planungsbranch `develop/v0.8`. **Releases:** Planung 01–08 vollständig vor Work; danach **Phase 1 v0.8 (01–04)**, testen und unabhängig reviewen, **Phase 2 v0.8.5 (05–08)** auf dem ausdrücklich genehmigten v0.8-Stand. Keine automatische Merge-/Domain-/Cloudflare-Freigabe. **Schritt 08 soll besonders sorgfältig gestaltet und mit echten Desktop-/Mobile-Vorschauen abgenommen werden.** Dieses Dokument beschreibt die technische und gestalterische Richtung, nicht die fertigen Screenshots oder den Work-Auftrag.

**Verbindliche Eingaben:** ausgewählter künftiger Website-Name `Reincarnated as a Proton`; vom Nutzer ausgewähltes **minimalistisches rot-schwarzes skizzenhaftes A3 / Glitched Entity** (nicht die ältere violett-türkise Monsterillustration), ein einziges In-Page-Monster; minimale Erklär-Einstiege (02); greifbare Entropievisualisierung (03); einheitliches, unaufdringliches Wissenssystem (04); freiwillige Guides (05); zwei BH-Ansichten plus schematischer Winkel (06); Temperaturkontext, Vergleich, **Material Explorer** (07). **Physik/Lesbarkeit stehen über Deko.**

## 1. Ausgangszustand und Designprobleme tatsächlich vorhandener Dateien

Auf aktuellem `main` wurden geprüft: `dist/style.css`, `dist/ux.css`, `dist/entropy.css`, `dist/thermal.css`, `dist/index.html`, `dist/extreme-render.mjs`, `dist/extreme-ui.mjs`, `dist/discovery.mjs`, `dist/guide.mjs` sowie die v0.8-Planung.

- **Vorhandene Basis ist nicht schlecht:** dunkel, echte lesbare Schriftgrößen auf vielen Controls, starke visuelle Hierarchie für einige Kennzahlen, zwei bestehende Schriften `DM Sans` und `Space Grotesk`, mobile Media Queries, Skip-Link, Fokuszustände, `prefers-reduced-motion`, viele schon sinnvolle Informationswarnungen.
- **In mehreren CSS-Dateien verstreute Tokens:** `:root` in `style.css` mit violettem `--accent`, überschriebenes `:root` in `ux.css`; zahlreiche statische violette `#hex`-Werte in `entropy.css`, `thermal.css`, UI und Canvas-Renderroutinen. Einfach `--accent` auf Rot drehen, ohne Komponentenaudit, wäre falsch und könnte Kontraste sowie Farbsemantik zerstören.
- **Unterschiedliche Layoutlogik je Labor:** Gravity ist desktopseitig dreispaltig, Entropy und Wärme zwei Spalten, Extreme enthält lange vertikale Bereiche, Black Hole Lab bis v0.7 primär Formeln/Diagramme. Der finale Designpass muss jeden Bereich **gezielt** behandeln, nicht alles in dieselben Karten zwängen.
- **Extremely long site title:** `Reincarnated as a Proton` passt nicht in jede mobile Header-Leiste. Gezielte mobile Brand-Zeilenumbrüche/kompakte Navigationsanordnung statt abgeschnittener Überschrift oder winziger Text.
- **Schritt 01 enthält historische widersprüchliche ältere Stilabschnitte (violett/türkis, 2.5D-Monster).** Das explizit zuletzt vom Nutzer ausgewählte **rote, schlichte A3-Skizzenmonster hat Vorrang**. Die ursprüngliche konkrete Bildreferenz muss Work als tatsächlicher visueller Input bereitgestellt werden; diese Textspezifikation ist kein Ersatz für den ausgewählten Bildstand.

## 2. Visuelle Leitidee: „Experimental Cosmic Notebook“

**Ästhetik:** ein präzises, fast schwarzes Forschungs-Interface trifft eine kleine fehlerhafte kosmische Entität. **Nicht** die Seite wie ein generisches Neon-Gaming-Dashboard umbauen: großzügiger Raum, zurückhaltende Linien, große gut lesbare Ergebnisse, charakteristische kompakte Beschriftungen, sparsame starke Farbe, seltene handgezeichnete rote Glitch-Elemente. Ruhig genug für echte wissenschaftliche Werte; neugierig genug, dass man weiterklickt.

**Visuelle Priorität in jedem View:**
1. **Hauptfrage** direkt unter der jeweiligen aktiven Laborüberschrift (02, geschlossen).
2. **Experiment / wesentliche Bedienung** und wichtigste echte Werte.
3. **Ergebnis / nachvollziehbare Gegenüberstellung** oder visualisierte Physik.
4. **Freiwillige Erklärungen / Mini-Vorhersagen / Modellgrenzen / Quellen**.
5. **Dekoration und Monster** mit kleinster Priorität.

Keine messbaren Inhalte unter permanente „parallax“ oder Atmosphäre-Layer legen. „Mehr Bild“ darf nicht „weniger Experiment“ bedeuten. Keine neue Pflicht-Landingpage, kein Carousel, kein Login, kein Backend, keine Werbung/Tracking, keine neuen Haupttabs.

## 3. Verbindliches Farb- und Formsystem: alte Palette korrigieren

**Primäres Markenzeichen:** nahezu schwarzer Hintergrund mit **roten skizzenhaften Linien des Monsters**, dessen zwei hellen Augen/Grinsen auch ohne Glow erkennbar bleiben. **Das frühere violette Monster-Concept ist verworfen.** Violett darf nur aus begründeter fachlicher Graphen-/Messfarbsemantik übernommen werden, nicht als konkurrierende Markennormalfarbe.

**Start-Tokens als Designprototyp, erst nach echten Kontrast-/Browserchecks festschreiben:**
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

**Typografie:** maximal zwei derzeit bestehende Schriftfamilien (Space Grotesk für Titel / DM Sans für Erklärung und Controls) mit zuverlässigen System-Fallbacks. Bestehenden Google-Fonts-Import und Offline-/Datenschutz-Aspekte beim Build prüfen; Ressourcen dürfen keine Voraussetzung für bedienbare UI sein. Basistext in normalen Lesebereichen ungefähr 16px, erklärende Absätze 16–18px, Hilfetext nicht zu klein (<13–14px) und nicht nur blassgrau. Messwerte mit tabellarischen Ziffern, Einheiten in gut lesbarer konstanter Nähe; lange Exponentenschreibweisen umbrechen, nicht abschneiden. `font-variant-numeric: tabular-nums` für Zahlenkarten.

## 4. Layoutarchitektur – jedes Gerät bekommt denselben Inhalt

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

**Nur ein Satz wiederverwendbarer Bausteine; keine neue UI-Framework-Abhängigkeit:**
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
- **Asset-Abhängigkeit vor Umsetzung:** Das ausgewählte Originalbild ist laut Schritt 01 bislang **nicht als GitHub-Asset eingecheckt**. Vor Work eine tatsächliche hochauflösende Bildreferenz bzw. ein ausdrücklich visuell abgenommenes reproduzierbares SVG bereitstellen. **Nicht** die alte violette Beschreibung als zufällige Ersatzgrafik implementieren. Keine Font-Dateien, urheberrechtlich geschützten Fremdfiguren oder Stock-Fotos einchecken.

## 7. Kosmischer Hintergrund & Motion Design: nur Hauch Entropie

Ein optionaler sehr zurückhaltender **abstrakter Entropie-Hintergrund** (vereinzelte Fragmentlinien/Speckles, wenige langsame Richtungswechsel), vorzugsweise CSS/SVG ohne neue WebGL-Pipeline. **Er symbolisiert nur die Ästhetik; keine Entropie-Messung** und keine in das Marker-/Wärmemodell einschreibende Größe.

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

**Technische Reihenfolge innerhalb Schritt 08:**
1. **Audit und Baseline:** echte Screenshots/Viewportvideos, DOM-Kontrollinventar, Page-Gewichte, CSS-Token/Kaskade, bestehende Performance und Tests auf dem v0.8.5-Branch **vor** Änderungen dokumentieren.
2. **Design-Tokens konsolidieren:** Farben/Typo/Abstände/Fokus/Status anhand der vorhandenen `style.css`, `ux.css`, `entropy.css`, `thermal.css`; spezifische Farben dort lassen, wo sie fachliche Graphserien codieren. Nicht die Site durch eine letzte gigantische `!important`-CSS-Datei manipulieren. Farbkontrast automatisiert checken.
3. **Globale Komponenten und mobile Hierarchie** zuerst (Header, Tabs, Panels, Labels, Hauptfragen, Formulare, Message-Styles, Quellenlinks). Dann Lab **für Lab** kontrollieren.
4. **Monster- und Hintergrundintegration** als *letzter* optionaler Atmosphäre-Layer mit klaren Performance-Guards, einer sichtbaren Entität und passenden ausgeschalteten Zuständen.
5. **Visuelle/Accessibility-Regressions**, Screenshots/Browser-Interaktion und manuelles Nutzerfeedback; erst korrigieren, dann unabhängige Codex-Review und separat ein PR.

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
2. **Einheitliche Komponenten**, keine gequetschten Messwertkarten, nicht skalierten Schriftbilder, verdeckten Buttons, Überläufe oder versetzten Touch-Targets. Hauptfrage unter aktivem Labtitel überall schnell auffindbar, Zusatzfragen standardmäßig geschlossen.
3. **Ausgewähltes rot-schwarzes Monster tatsächlich getroffen**, im Hero-/Rand-/Kompaktzustand erkennbar und in derselben Identität. Nicht einfach alte violette Wraith kopiert. Die echte Referenz vor Implementierung bereitstellen und auf Screenshots explizit freigeben.
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

## 13. Planungsabschluss / noch Nutzerentscheidungen

**Meine vorausgewählte Empfehlung für die Freigabebesprechung von Schritt 08:**
1. **Ruhiges dunkles Wissenschaftsdesign mit roten Markenakzenten**, aber semantisch weiterhin wenige andere gut kontrastierende Farben für Messungen. Nicht alles rot einfärben.
2. **Schlichte responsive Layouts**, die auf dem Handy **so lesbar wie Desktop** sind; keine „Mobile Lite“-Version mit ausgelassenen Inhalten.
3. **Reduziertes kosmisches Hintergrundrauschen** nur außerhalb der eigentlichen Experimente; am besten standardmäßig dezent/statisch, mit abschaltbarer Bewegung.
4. **Ein rot-skizzenhaftes Monster**, selten, eigenständig abschaltbar; ausgewählte Chatbildreferenz muss vor Umsetzung als Datei/SVG verfügbar sein und visuell abgenommen werden.
5. **Wissenschaft/Bedienung hat immer Vorrang**; als Qualitätssignal priorisieren wir abgenommene echte Screenshots, mobile Bedienbarkeit, messbare Performance und fachlich stabile Regressionsprüfungen.

**Offen vor technischer Umsetzung, nicht als Zustimmung unterstellen:** Welche endgültige rote Brand-Akzentabstimmung am besten gefällt, ob atmosphärischer Hintergrund standardmäßig bewegt oder statisch sein soll, und wie häufig das Monster in der realen Vorschau auftauchen darf. Diese visuellen Details können **anhand echter UI-Vorschauen** statt anhand abstrakter Farbnamen entschieden werden. Der bereits ausgewählte rote Monsterentwurf, dessen Asset noch fehlt, bleibt unverrückbare visuelle Referenz.

**Planungsstatus:** **UMFASSENDER DISKUSSIONSENTWURF**, kein Work-Bauauftrag. Auf Nutzerfreigabe warten; danach als inhaltlich freigegeben markieren, die gesamten Schritte 01–08 auf Widersprüche prüfen und die **Work-Aufträge samt expliziten Implementierungs-/Merge-Gates** vorbereiten. 
