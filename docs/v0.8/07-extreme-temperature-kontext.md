# Schritt 07 – Extreme Temperature Lab: von absurden Kelvinzahlen zu Verständnis

## Ausführlicher Diskussionsentwurf für v0.8.5 – NICHT inhaltlich oder technisch freigegeben

**Projekt:** Reincarnated as a Proton. **Release:** v0.8.5, Schritt 07/08. **Ort der Dokumentation:** `develop/v0.8/docs/v0.8/` – nur Planungsbranch; die spätere **Implementierung der Schritte 05–08** erfolgt nach geprüfter und separat freigegebener v0.8 auf einem gesonderten Branch. **Keine Änderung an main oder öffentlicher Website; Work noch nicht beauftragen.**

**Abhängigkeiten:** Ein kompakter Haupt-Frageausklapper + freiwillige Mini-Prognose je aktivem Lab aus Schritt 02, verlinkte Modell-/Quellenhilfen aus Schritt 04, optionaler Erstnutzerweg aus Schritt 05, visueller Feinschliff aus Schritt 08. Physik bleibt zu mindestens 90 % real und überprüfbar, Monsterkommentare sind klar fiktional.

## 1. Faktenbasierte Bestandsaufnahme v0.7 (main)

Relevante Module `dist/extreme-data.mjs`, `dist/extreme-ui.mjs`, `dist/extreme-render.mjs`, `dist/thermal-ui.mjs`, `dist/thermal-view.mjs`, `dist/thermal-physics.mjs`, `dist/index.html` sowie v0.7-Qualitätsdokumentation:

- Das **Extreme Temperature Lab liegt bereits im Haupttab Extreme Objects**, als eigener Unterabschnitt. Es ist keine extra Hauptnavigation nötig.
- **Eingabebereich:** direkte gültige Kelvinwerte **0 bis 10¹² K** einschließlich, Celsiusumrechnung mit exakt definiertem SI-Offset `T[K]=t[°C]+273.15`; zugehöriger Log-Slider **0,001 K bis 10¹² K**. 0 K erhält einen **gesonderten Zustand**, da `log(0)` nicht existiert; Werte **0 < T < 0,001 K** können direkt eingegeben, aber nicht durch den Slider proportional repräsentiert werden. Die Eingabefelder zeigen bei extremen Werten unterschiedlich formatierte Werte. Das ist kein physikalischer Widerspruch, sondern UI- und numerische Darstellung, die präziser erklärt werden sollte.
- **Beispiele sind bereits vorhanden:** 0 K, 0,001 K, 0,1 K, ~2,725 K kosmischer Hintergrund, 293,15 K = 20 °C, ~5900 K Sonnenoberfläche, 10⁹ K als heißes Plasma-Skalenbeispiel, 10¹² K als Skalenende **ohne Behauptung eines physikalischen Temperaturmaximums**. Ein vorhandenes abstraktes Canvas zeigt farbige Punkte / Geschwindigkeit, jedoch **keine** thermodynamischen Mikrozustände, Maxwell-Verteilung, Quantenmaterie oder echte Wärmeübertragung.
- Es existiert bereits eine **validierte Verknüpfung** zum separaten Zwei-Körper-Experiment im Entropy Lab: Nur Temperaturen in **250–600 K**, einschließlich der Grenzen, dürfen zu Körper A oder B **vorgemerkt** werden. Kein automatisches Starten/Anwenden; erst im Wärme-Lab führt **Übernehmen** eine tatsächliche Anfangszustandsänderung herbei. Das Wärme-Modell hat darüber hinaus eigene Wärmekapazitäten, Leitwerte und Gültigkeitsgrenzen.
- Besonders wichtig: Die letzten v0.7-Reviews haben numerische **Grenz- und Anzeigefehler bei −23,15 °C ⇔ 250 K** und bei ausdrücklich eingegebenen Werten *unterhalb* 250 K trotz gerundeter Anzeige identifiziert und behoben. Die verifizierte dezimale Prüfung in `dist/thermal-view.mjs` und der Originaltext-/Display-Hinweis dürfen **auf keinen Fall** durch eine vereinfachte Temperatur-UI ausgehebelt oder durch tolerantes Clamping ersetzt werden.
- Das Temperatur-Lab enthält bereits einige Modellhinweise und wissenschaftliche Quellen. Ziel ist **nicht** eine reine Neugestaltung der Farbe, sondern eine verständliche, explorierbare Einordnung der Skala und ihrer echten Grenzen.

## 2. Kernziel und Form der neuen Bedienung

Besuchende sollen an der gigantischen 15-Dekaden-Skala nicht nur eine Zahl hin- und herschieben, sondern **erkennen, welche Art von Temperatur das ist**, **warum der Wert physikalisch interessant ist** und **welche Aussagen gerade NICHT daraus folgen**.

**P0 – ein kleiner zentraler didaktischer Informationsbereich, kein zweites Temperaturmodell:**
1. **„Wo bin ich auf der Skala?“**: Beim gewählten Temperaturwert ein kleines, ruhiges, direktes Kontextfeld mit **Temperaturtyp/Referenz**, z. B. „Raumtemperatur“, „kosmische Hintergrundstrahlung“, „Sonnenphotosphäre“, „heißes Plasma“ – aber nur bei fachlich passenden Bereichen und niemals als Behauptung, dass jede Substanz bei diesem T gleich reagiert. Bei frei gewählten T ohne echten Messbezug: **„gewählter Vergleichswert“** statt frei erfundene reale Situation.
2. **„Was bedeutet das?“**: ein kurzer Aha-Satz zur relevanten Größenordnung und Grenze der Analogie, maximal etwa 1–3 verständliche Sätze. Mehr Hintergrund über den freigegebenen ⓘ-/„Genauer verstehen“-Pfad in Schritt 04, kein neue Doppellexikon.
3. **„Vergleiche zwei Temperaturen“**: Nutzer darf freiwillig einen zweiten Wert **als reinen Vergleichsmarker** fixieren (A/B-Marker auf der bestehenden logarithmischen Skala). Zeige beide Werte mit **richtiger Einheit und Verhältnis**, wenn beide positiv sind, sowie Temperaturdifferenz in K (numerisch gleich dem Intervall in °C). Bei 0 K **kein Verhältnis zu 0**, kein `Infinity`, keine Behauptung „doppelt so heiß“ als thermischer Gesamtnutzen; Vergleich darf nicht einen fremden Simulatorzustand überschreiben.
4. **„Probier es aus“**: Das freiwillige, standardmäßig geschlossene Mini-Prognoseelement aus Schritt 02 zeigt z. B.: **„Wenn wir bei gleicher Gesamtwärmekapazität die Temperatur verdoppeln, ist die in einem einfachen festen-\(C\)-Modell zugeordnete Energieänderung doppelt so groß?“** Besser und fachlich klarer als eine unqualifizierte Frage „Ist 600 K doppelt so viel Wärme wie 300 K?“. Konkret vorgeschlagene Hauptfrage: **„Ist eine winzige Wolke heißen Plasmas bei 1.000.000 K automatisch mehr thermische Energie als ein ganzer See mit 300 K?“** – Antwort: **Nein**, Gesamtsystemenergie hängt von Menge, Art und Zustand ab; thermodynamische Temperatur alleine reicht nicht. Die Temperatur ist eine **statistische Zustandsgröße eines geeigneten Systems**; keine wohldefinierte thermodynamische Temperatur einem einzelnen isolierten Teilchen zuordnen. Dies ist eine **qualitative** Verständnisfrage und **kein** numerischer See-/Plasma-Rechner. Bei einem echten Mini-Lab-Test zuerst alle relevanten Parameter klar angeben, andernfalls „Mehr verstehen“ statt Fake-Messwert.
5. **„Warum kann ich das nicht übertragen?“**: Der bereits vorhandene Wärmeübergabe-Hinweis zeigt bei Werten außerhalb 250–600 K neben der deaktivierten Aktion **knapp und konkret**: „Nur der idealisierte Wärmekörper-Bereich 250–600 K; dieser Wert würde andere Materiephysik erfordern.“ Ein Button darf für ungültige Werte nicht durch verstecktes Setzen auf Grenzwerte aktiv werden.

**Wichtige UX-Entscheidung offen:** Zweitem Vergleichsmarker dauerhaft sichtbar neben Skala anbieten oder nur über einen kleinen `Vergleich hinzufügen`-Ausklapper. **Empfehlung:** minimal verborgen, um die Grundseite sauber zu halten.

## 3. Eine fachlich ehrliche Temperaturreise statt 100 beliebiger Presets

Behalte die bestehenden Presets, erweitere ihre Wirkung um **kleine kontextuelle Fakten** und einen **„Vergleich mit …“**-Link. Keine massive Presetgalerie oder erfundene extreme Messwerte. Redaktionsvorschläge:

| Orientierung | Zahl und Bedeutung | Was im UI sachlich gesagt werden darf |
|---|---|---|
| Absoluter Nullpunkt | **0 K = −273,15 °C**, separater Referenzpunkt der Thermodynamik | idealisierter Grenzwert; **keine** Behauptung, alle Quantenbewegung stoppe oder der Slider könne `log(0)` darstellen |
| Ultrakalt | **0,001 K = 1 mK** | Referenz-Kältebereich des Skalenreglers, nicht automatisch eine selbst gemessene Materialtemperatur |
| Kosmischer Mikrowellenhintergrund | **ca. 2,725 K** | Temperatur des nahezu perfekten **Strahlungs-Schwarzkörperspektrums**, nicht „die Temperatur jedes Teils des Weltraums“ |
| Raumbeispiel | **293,15 K = 20 °C** | Beispiel ohne Materialaussage |
| Sonne – Oberfläche | derzeit Preset **ungefähr 5900 K** | NASA nennt **effektive Sonnen-Temperatur ca. 5772 K**; Preset ist grob, ausdrücklich `~5900`; bei Quellenangleich kann gesondert korrekt gerundet werden |
| Sonne – Zentrum | **ca. 1,57 × 10⁷ K** | ein optionales faktenbasiertes Vergleichsbeispiel für ein spezifisches Sterninneres, **nicht** die Oberfläche |
| Heißes Plasma | z. B. bestehendes **10⁹-K-Skalenbeispiel** | realer Zustand hängt von System, Dichte und Zusammensetzung ab; keine Material- oder Plasma-Emissionsberechnung in unserem abstrakten Canvas |
| Skalenende | **10¹² K** | **nur Obergrenze der App-Skala**, ausdrücklich **kein höchstmöglicher Naturwert** |

**Quellen für die konkreten im Entwurf genannten Werte (bei Implementation aktuell prüfen, pro Claim verlinken):**
- [NIST SP 330 – SI Kelvin und Celsius](https://www.nist.gov/pml/special-publication-330/sp-330-section-2), exakter 273,15-Offset und Definition der Kelvin-Skala;
- [NASA LAMBDA/FIRAS – Cosmic Microwave Background](https://lambda.gsfc.nasa.gov/product/cobe/firas_overview.html), CMB-Spektrum um 2,725 K mit Messunsicherheit;
- [NASA GSFC Sun Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html), `T_eff ≈5772 K`, `T_c ≈1,571×10^7 K`.

Nicht alle Einträge sind physikalisch gleichartige Temperaturen: **Strahlungsspektrum** (CMB), **effektive Photosphärentemperatur** (Sonne), **thermodynamische Temperatur** eines Materials und **Grenzwert 0 K** sind verschieden zu interpretieren. Genau DAS muss die Benutzerführung erklären.

## 4. Drei zentrale Irrtümer als kurze freiwillige Vertiefungen

1. **„Temperatur = gesamte gespeicherte Energie?“ – Nein.** Für eine vollständig angegebene einfache Modellbeschreibung kann `ΔU ≈ C·ΔT` bei fester Gesamtwärmekapazität gelten. Das ist keine allgemeine Gleichung für jede Temperatur, Materialphase oder Quantenmaterie. Ein kleiner heißer Stoff kann weniger Gesamtenergie haben als ein viel größerer kühlerer Stoff.
2. **„Je heißer, desto heller sichtbar?“ – Nicht grundsätzlich.** Emission hängt von Art und Zustand des Systems, Materialeigenschaften, Wellenlänge und Beobachtungsgeometrie ab; ein `T` aus Schwarzkörper-Näherung liefert ohne weitere Annahmen weder „Lichtfarbe jedes Materials“ noch optische Leuchtstärke der Illustrationspunkte. Kein automatisch rot-blau codierter Temperatur-„Spektralsimulator“.
3. **„Bei 0 K bewegt sich gar nichts mehr?“ – Nein als universelle Behauptung.** Quantenmechanische Nullpunktsbewegung und Grundzustandsenergie können bestehen. 0 K ist ein thermodynamischer Grenzwert, nicht ein garantiert erreichbarer Zustand der Animation.
4. **„Weltraum ist immer 2,7 K kalt?“ – Missverständlich.** Das kosmische Hintergrundstrahlungsspektrum hat diese Temperatur; lokale Materie und Strahlungsumgebungen können völlig andere Temperaturen besitzen. Keine Leerraum-Temperatur als Materialeigenschaft erfinden.

**Ton:** verständlich und verifizierbar. Maximal ein gelegentlicher Mascot-Spruch, keine ätzende nihilistische Falscherklärung. Freiwillige Vorhersagen/Leitfragen und Quellen aus Schritt 02/04 wiederverwenden.

## 5. Verbindung zum Zwei-Körper-Wärmeexperiment: absichtlich strikt

Der neue Temperaturvergleich ist **lokal im Temperature Lab** und **kein automatischer thermischer Prozess**. Die bereits bestehende Brücke bleibt exakt:

1. Nutzer wählt K / °C in **0–10¹² K** (Kelvin-Unterranges `0 < T < 0,001 K` weiter möglich).
2. Brücke prüft den **ursprünglich explizit eingegebenen Dezimalwert**, falls vorhanden, gegen äquivalente Bereiche: `250 ≤ K ≤ 600` und `−23,15 ≤ °C ≤ 326,85` (beide inkl.). Internes JS-Binary-Rounding um eine äquivalente Grenze darf zulässige Quellen nicht fälschlich blockieren; explizit zu niedrige/hohe dezimale Originale dürfen nicht akzeptiert werden.
3. Bei Eignung auf `Diese Temperatur im Wärmeexperiment verwenden`: **nur als Entwurf für A oder B vormerken**, Navigationswechsel, Feld sichtbar; keine unaufgeforderte Änderung an Thermal-`params`, `time`, `applied`, Leistung, Wärme-/Entropiebilanz. Der Nutzer muss selbst **Übernehmen** bestätigen.
4. Nicht geeignete Temperaturen bleiben in der Temperaturansicht gespeichert und dürfen mit anderen Vergleichswerten gegenübergestellt werden; Brücke bleibt deaktiviert und erklärt **warum**. Kein heimliches Clamping auf 250 oder 600 K.
5. Angemeldete / gerundete Temperaturen? **Explizit ursprüngliche Eingabe versus Anzeige** erklären, falls sie unterschiedlich bewertet werden; keine neue UI-Rundung, die z. B. `249.99999999999999999 K` wie zulässige `250 K` aussehen lässt, ohne den Widerspruch zu dokumentieren. Ebenso `−23.15 °C` muss sich wie `250 K` verhalten.
6. Der neue Zwei-Marker-Vergleich verändert **niemals** den für die Brücke geltenden aktiven Kelvinwert. Nur ein echter ausdrücklicher Wertewechsel in bestehenden Eingaben darf einen anderen aktiven Wert erzeugen.

**Nicht in Schritt 07:** komplette thermodynamische Theorie für Sterne, Quark-Gluon-Plasma, Wärmepumpen mit Wirkungsgraden, negative absolute Temperaturzustände spezieller Quantenensembles, echte Materialgleichungen, Phasenübergangs- und Sternatmosphären-Simulation. Diese Themen benötigen eigene Physikmodelle. Kelvin-Skala endet weiterhin bewusst bei 10¹² K als UI-Grenze.

## 6. Design und mobile Präsentation

- **Keine zweite rein dekorative Partikelwolke:** vorhandene `drawThermal`-Grafik bleibt, wird als `ABSTRAKT` gekennzeichnet. P0 ist die verständliche Skalen-Kontextansicht und ggf. ein **kleines Paar gespeicherter Temperaturmarker** in der bestehenden Achse; keine echte Kinetik visualisieren, die nicht berechnet wird.
- Direkt unter **„Extreme Temperature Lab“** die **eine** aufklappbare Leitfrage („Ist heißer immer energiereicher?“) gemäß Schritt 02. Optionaler 2. Ausklapper für eine qualitative Vermutungsfrage; keine Textwand oberhalb der eigentlichen Skala.
- Sofort sichtbar: aktuelle Kelvin-/Celsiuswerte, vorhandene Skala, Presets, Status-/Gültigkeitsmeldung. Kontextsatz darf unter der Achse dynamisch passen, aber nicht Datenwerte verdecken.
- Inline Vergleichswert nur nach Nutzerwunsch anzeigen; 0-K-Vergleich als Referenz getrennt von Logarithmusmarkierungen.
- Einfache kleine Messgrößen-Typografie, klare Größenordnungen, auf 320/390 px kein Überlaufen durch 10^12-Notation; `Intl.NumberFormat`-Verhalten DE/EN und Dezimalpunkt-Konvention beachten.
- Animation, wenn aktiv, nur bei sichtbarem Tab/Canvas und mit `prefers-reduced-motion`. Keine neue RAF-Schleife für einen statischen Kontexttext; auf mobilen Geräten nicht unnötig neu rendern.

## 7. Technische Kriterien und Regressionen

1. **Bestand geschützt:** Input `0..1e12 K`, Slider `.001..1e12 K`, Sonderfall `0 K`, direkte Werte darunter, Celsiusumrechnung inklusive `-273.15 °C`, bereits vorhandene Presets, wissenschaftliche Warnungen und heutige Brücke bleiben gültig.
2. **Zahlen/Arithmetik:** `0 K ≠ 0.001 K`, `0 K` im Vergleichsverhältnis nur als **nicht definiert** (nicht NaN/Infinity), `1 K` Differenz = `1 °C` Differenz. Verhältnisse nur für absolut positive und endliche Kelvinwerte, nicht für Celsiuszahlen. Besonders Test `1e-12 K` über direkte Eingabe, ohne heimliches Aufrunden auf Sliderminimum.
3. **Anwendungssperre und Grenzpräzision:** `250 K ↔ -23.15 °C`, `600 K ↔ 326.85 °C` korrekt; explizit außerhalb liegende Dezimalquellen wie `249.99999999999999999 K` strikt zurückweisen und Hinweis zu Rundungsanzeigen. Kein Spannungswechsel/Apply bei ungültiger Eingabe; 250.000... und 600.000... Grenztests.
4. **Vergleich:** Zwei-Marker-Ansicht ändert nur eigene UI-Auswahl; `extreme-ui`-Hauptwert und `entrolabThermal.inspect()` bleiben ohne ausdrückliche Nutzeraktion unverändert. Kein Duplicate Listener/Timer bei 50 Wechseln.
5. **Quellen-/Kontextqualität:** CMB als Strahlung, Photosphäre/Zentrum der Sonne unterscheiden, 10¹² K nicht als universelles Maximum, „Temperatur ≠ Gesamtenergie“ fachlich richtig, Kelvin-Offset offiziell; jeder Wert hat Label, Quellen-ID oder eine klare Einordnung als **frei gewähltes Beispiel**.
6. **Drei Benutzungspfade:** `Presets → Kontext lesen`, `zwei Werte vergleichen`, `gültige Temperatur vormerken → Wärmeexperiment aufrufen → bewusst anwenden`. DE/EN, Tastatur, 320/390px, Screenreader-Status, Zoom/DPR, `prefers-reduced-motion`, Rückkehr/Fokus, keine unerwartete Änderung von Entwürfen.
7. Erhaltene `extreme-data.mjs`-Konvertierungsinvarianten, zwölf alte numerische Benchmarks, v0.1-SHA-Originale, v0.7-Härtefälle; keine Tests entfernen oder alte Toleranzen lockern. Weitere deterministische Node-/Chromium-Tests für Vergleich, Quellenzuordnung, numerische Grenzen und UI-Zustände.
8. Wirkt ein extremer T-Wert im Quanten-/Sterninneren materiell anders, soll der erklärende Text die Grenze nennen – niemals eine neue Formel aus `T` allein erfinden.

## 8. Empfehlenswerte Umsetzungsreihenfolge nach gesonderter Baufreigabe

1. Die vorhandenen Presets, Temperaturen/Umrechnungswerte und wissenschaftlichen Links auf reale Aussage prüfen; keine bloßen geschätzten Werte als präzise Messwerte ausgeben.
2. Neue kurze Kontextinformation und optionales „Vergleichswert merken“ zuerst als **reine Präsentationskomponente** auf dem bestehenden Temperature Lab. Kein neuer physikalischer Algorithmus.
3. An Schritt-02-/04-Infrastruktur anbinden und zwei einfache qualitative Testfragen implementieren; keine UI-Duplikation.
4. Vollständige Browser- und numerische Grenzregression, insbesondere die reparierten Celsius/Kelvin-Boundary-Tests.
5. In der späteren Schritt-08-Designrunde nur Darstellung/Responsiveness ändern, ohne mit neuen Controls die Validierung zu umgehen.

## 9. Noch gemeinsam zu entscheiden – keine implizite Freigabe

1. **Vergleichsmodus:** Ein **freiwillig aufklappbarer Zwei-Temperaturen-Vergleich** mit A/B-Markern und korrekter Differenz/Verhältnis, statt zwei ganze zusätzliche Regler dauerhaft sichtbar (Empfehlung: freiwillig und minimal)?
2. **„Wofür ist das interessant?“**: Dynamischer kurzer Kontext direkt unter der Skala zu den vorhandenen Presets, optional ergänzt um 1–2 wissenschaftlich belegte Anker wie Sonnenzentrum, aber **kein** endloses Preset-Menü (Empfehlung)?
3. **Animation:** Bestehende abstrakte thermische Partikelgrafik mit besserer Beschriftung **behalten** (Empfehlung) oder zugunsten eines nüchternen Skalenvergleichs ganz entfernen?
4. **Vertiefungsumfang:** Fokus auf gut verständliche, konkrete Unterschiede zwischen Temperatur, Wärme, Energie und extremen Strahlungs-/Plasmakontexten, statt ein neues Gas-/Quanten-Simulationsprojekt zu starten (Empfehlung)?

**Status:** detaillierter **Diskussionsentwurf** für Schritt 07. Nach expliziter Nutzerfreigabe inhaltlich fixieren und dann **Schritt 08 – Gesamtdesign** besprechen. Work-Implementierung erst später, nach Planung aller Schritte und gesonderter Zustimmung.
