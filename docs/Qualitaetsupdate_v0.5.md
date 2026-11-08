# ENTROLAB v0.5 – UX & Visual Upgrade

Datum: 8. November 2026. Ausschließlich `develop/v0.5`. Basis `main`: `5a13686fa16213d811e7ba73f37d94638f5a219a`; vorbereiteter Branch: `9fadbe69e7851af068827b5e8b01e252efa670cd`.

## Umfang und unveränderte Wissenschaft

Plan, AGENTS, Qualitätsbericht v0.4 und Codex-Review v0.4 wurden vollständig vor der Umsetzung gelesen; zusätzlich die im Plan verlangten v0.4-Plan-/Reviewdateien und die relevanten Module/Tests. Änderungen betreffen Oberfläche, Textausgabe und illustrative Canvas-Gestaltung. Keine neue Physik und kein Sci-Fi-Physikmodus.

Bytegleich zur Branch-Basis bleiben `dist/physics.mjs`, `prediction.mjs`, `instruments.mjs`, `experiments.mjs`, `extreme-data.mjs`, `checks.mjs`, numerische Referenzen, Original-Prüfsummen, bestehender Workflow und Hostingkonfiguration. Newton-Kräfte, Integrator, Kollisionen, Szenariodaten, Vorhersage, Schwarzschild-/Hawking-Formeln sowie Sternmassen/-radien sind unverändert. Das Darstellungsmodul `display.mjs` lokalisiert ausschließlich Formatierung und Modellhinweise.

**Keine Übernahme nach main, kein Deployment und keine Änderung der archivierten Originalversion.** Die bestehende Produktionswebsite bleibt außerhalb dieses Auftrags. Der Branch ist zur unabhängigen Prüfung bestimmt.

## Lesbarkeit und Orientierung

- Neue ergänzende `ux.css`, bestehende Gestaltung und violette Akzente erhalten. Normaler Text 16–17 px, wesentliche Labels 14 px, Summarys 16 px, Messwerte überwiegend 21–28 px; deutlich größere zentrale Temperaturanzeige. Im tatsächlichen Desktopbrowser: Body **16 px / 24,8 px Zeilenhöhe**, Kontrolllabel **14 px**, Farbe `rgb(199,191,212)`.
- Hellere Nebeninformationen und Eingabegrenzen, sichtbare 3-px-Tastaturfokusrahmen, überwiegend mindestens 44 px hohe zentrale Bedienelemente. Schrift-/Farbwerte sind keine vollständige WCAG-Zertifizierung.
- Hinzufügen, Körperbearbeitung, Darstellungsoptionen und Ansichtsparameter sind native `<details>`-Bereiche; Diagnostik und Vorhersage behalten ihre vorhandenen zugänglichen Disclosures. Das BH-Diagramm lässt sich aufklappen und startet offen.
- Wesentliche Modellwarnungen und der Hinweis **„illustrativ, keine exakte GR-, Emissions- oder Oberflächensimulation“** bleiben sichtbar. Die ausführliche Bild-Erklärung ist zusätzlich aufklappbar. Quellen und vollständiges Modellkapitel bleiben erreichbar.
- Freiwillige, wieder öffnende Erste-Schritte-Hilfe, schließbar mit Button/Escape; kein blockierender Dialog. Erklärungskatalog für AU, Schwarzschild-Radius, ISCO, Hawking-Temperatur und Energieerhaltung.
- Fokusmodus für Sandbox und Extreme Objects ohne Fullscreen-Abhängigkeit. Seitenpanels werden reduziert, Navigation, Start/Pause und Exit bleiben bedienbar. Escape und Tabwechsel verlassen den Modus; der auslösende Button erhält den Fokus zurück. Im Extreme-Fokus bleibt die Objektauswahl auch ohne sichtbares Label über einen übersetzten Accessible Name bezeichnet.
- Mobile simulierte Zeit wieder sichtbar; sie war im bisherigen CSS ausgeblendet. Zahlen und Einheiten dürfen umbrechen. Footer exakt: **„Kein Zauber. Leider. Nur ziemlich seltsame Physik. ✧“**

## DE/EN-Architektur und Eingabeverhalten

`dist/translations.mjs` enthält zwei gleich aufgebaute Plaintext-Kataloge. Vollständige Quellmeldungen dienen als lesbare stabile Schlüssel; einzelne historisch englische Navigations-/Rubrikschlüssel besitzen zusätzlich deutsche Werte. `i18n.mjs` übernimmt Auswahl, Locale, Interpolation, sichere DOM-Text-/Attributausgabe und Änderungsabonnements. Keine HTML-Auswertung von Übersetzungen und keine neue Laufzeitabhängigkeit.

Abgedeckt: vier Bereiche, Navigation/Footer/Hilfe, statische Texte und Attribute, Szenariohinweise, eingebaute Körpernamen, Inspektor/Diagnostik, Fehler/Modellwarnungen, Vorhersagestatus einschließlich Abbruchgründen, die zehn Selbstcheck-Ausgaben, BH-Vergleichs-/Canvaslegenden, Extremobjekt-Geometrie und thermische Canvasbeschriftung. Eigene Quellen-/Objekteigennamen und mathematische Symbole bleiben, wo sinnvoll, gleich.

Browsersprache schlägt EN bei englischem Browser vor, sonst DE. Eine manuelle Wahl wird unter `entrolab-language` lokal gespeichert und hat Vorrang; fehlender/gesperrter Storage verhindert die Bedienung nicht. `html.lang` wird nachgeführt. Fehlende Schlüssel liefern einen lesbaren Quelltext-Fallback und werden in `missingKeys` registriert; sie werden nicht als vollständig übersetzt kaschiert.

Sprachwechsel ruft keine Szenarioladung, kein Rebase und keine neue Vorhersage auf. Gespeicherte Check-Ergebnisse werden nur neu beschriftet: die Physik-Selbstchecks werden dabei **nicht** erneut ausgeführt, da diese zusätzliche globale Körper-IDs anlegen könnten. Körpernamen werden nur in einer schwach referenzierten Präsentationszuordnung lokalisiert; die Namen im Simulationsobjekt bleiben unverändert. Nicht registrierte bzw. nachträglich benutzerdefinierte Namen werden nicht pauschal übersetzt.

**Zahleneingaben bleiben in beiden Sprachen gleich:** Dezimalpunkt, z. B. `0.1` oder `1e9`, keine Tausendertrennzeichen. Ein sichtbarer gemeinsamer Hinweis erklärt dies. Anzeigen verwenden DE-/EN-Locale; ein Komma wird nicht durch Entfernen zu einer anderen gültigen Zahl gemacht. App-eigene Validierungsfehler sind übersetzt und behalten den gültigen Modellzustand. Native Browser-Auswahl-/Zahleneingabe-Steuerelemente können weiterhin browser-/betriebssystemeigene Texte verwenden; sie sind kein eigener ENTROLAB-Übersetzungskatalog.

Die vorhandenen Temperatur-Randkorrekturen bleiben erhalten: toleranzbehafteter Hinweis am Celsius-/Kelvin-Sliderminimum, Ablehnung negativer Null/negativem Unterlauf und konsistenter Massenfehlerstatus. Beim Sprachwechsel bleiben auch ungültige gerade sichtbare Extremobjekt-/Temperaturtexte und ihre Warnungen erhalten. Die Körperbearbeitung erhält eine eigene übersetzte Validierung statt sprachabhängiger nativer Submit-Meldungen, mit den bisher im HTML angegebenen Massenlimits 10⁻¹⁵ bis 10¹¹ M☉.

## Stern-Artwork und Komfortfunktion

Weißer Zwerg: mehrere ruhige Halo-/Hüllenschichten, schattierte Kugel mit Gliedabdunklungs-Eindruck und subtil projizierter Oberflächentextur. Keine Atmosphären-, Strahlungstransport- oder Eruptionsrechnung. Neutronenstern: kompakte schattierte violette Kugel, zurückhaltende feldlinienartige Bögen; diese sind **keine berechneten Magnetfeldlinien**.

Optionales **Pulsar-Beispiel**, standardmäßig aus und nur beim Neutronenstern sichtbar: zwei langsam rotierende schematische Strahlungskegel. Keine quantitative Emissionsintensität, Magnetosphärenlösung, beobachtete Pulsform oder physikalische Periodenvorgabe. Nicht jeder Neutronenstern ist ein Pulsar. Keine Stroboskopblitze. Auch Glühen, Farben, Projektionswinkel und Oberflächenmuster sind illustrative Gestaltung. Massen/Radien stammen weiterhin unabhängig aus den unveränderten v0.4-Daten.

Schwarzes-Loch-Artwork grundsätzlich erhalten; Texte sind größer/übersetzt, geometrische Labels werden zusätzlich horizontal innerhalb des Canvas gehalten. Die Ringsignatur wird weiterhin nicht als Raytracing oder beobachteter Photonenring bezeichnet. Die optischen Objektgrößen sind weiterhin normalisiert.

Kleines Komfortfeature: **Ansicht zentrieren** setzt nur den Extremobjekt-Zoom auf 1 und den Betrachtungswinkel auf 22 zurück. Keine Masse, Temperatur oder physikalischen Parameter werden zurückgesetzt. Kein zusätzlicher Bildexport oder Clipboard-Komplex.

## Animationslebenszyklen und Messungen

Die neue Sterntextur verwendet höchstens 150 (fein) bzw. 68 (sparsam) projizierte Texturpunkte, zusätzlich zum bestehenden Sternfeld. Pulsar hat zwei Kegel und sieben schematische Bögen. Kein zusätzlicher Scheduler. Bestehende Qualitätsziele 60/30 fps und DPR-Grenzen bleiben; dies sind **Ziele, keine gemessenen FPS**.

Extreme Objects zeichnet bei inaktivem App-Tab, verstecktem Dokument, Pause oder beiden außerhalb des Viewports liegenden Canvasflächen nicht fort. Auch die Sandbox fordert jetzt bei inaktivem App-Tab, verstecktem Dokument oder nicht sichtbarer Canvasfläche keine weiteren RAF-Frames an. Sichtbare pausierte Sandbox darf weiter zeichnen, damit Kamera/Selektion bedienbar bleiben. Beim Wiedererscheinen wird die Wandzeitreferenz neu gestartet; es gibt kein Nachholen versteckter Zeit.

Reduced Motion startet beide Ansichten pausiert; ein Wechsel zur reduzierten Bewegung pausiert erneut. Explizites Starten ist weiterhin ein bewusster Opt-in. CSS-Übergänge/Einblendungen werden bei Reduced Motion abgeschaltet. Verifizierter realer Tabwechsel: Extremobjekt-Zeichenzähler **5 → 5**, `data-animating=false`.

Stichproben im Shared Chrome bei Qualitätswechseln; nur Objektcanvas sichtbar, prozedurales Artwork, drei Werte je Kombination, `performance.now()` um den JS-Zeichenaufruf:

| Objekt | Fein: drei JS-Zeichenzeiten / ms | Sparsam: drei JS-Zeichenzeiten / ms |
|---|---|---|
| Weißer Zwerg | 1,4 / 1,5 / 1,6 | 1,7 / 1,7 / 1,7 |
| Neutronenstern, Kegel aus | 1,6 / 2,0 / 1,7 | 1,7 / 1,6 / 1,6 |
| Schwarzes Loch, Scheibe an | 1,7 / 1,9 / 1,6 | 1,6 / 1,6 / 1,6 |

Keine GPU-Fertigstellungszeit, Durchsatz-/FPS-Messung, belastbare Rangfolge der Qualitätsstufen oder Verbesserung gegenüber v0.4 behauptet. Die Umgebung drosselt Frames und die geringe Stichprobe enthält Scheduling-/Messrauschen. Kein Heap-/Langzeitlastnachweis.

## Tatsächlich ausgeführte automatisierte Prüfungen

Baseline: `node scripts/test.mjs`: **79/79 bestanden** (zehn Originalchecks + 69 Node-Testfälle). Final: derselbe Einstieg **101/101 bestanden** (zehn Originalchecks + 91 Node-Testfälle), kein Skip/TODO. **22 zusätzliche Prüfungen**, in die vorhandene CI eingebunden.

Alle bisherigen Testfälle und Grenzwerte bleiben erhalten. Nur die zwei bestehenden VM-Testadapter in `edge-regression.test.mjs` und `extreme-lifecycle.test.mjs` erhalten den neuen i18n-Import und dessen Symbole im kontrollierten Auswertungskontext. Nach Entfernen dieser Adapterergänzungen ist ihr restlicher Quelltext exakt gleich zur Baseline. Keine alte Assertion wurde angepasst oder entfernt. Alle übrigen bisherigen Testdateien sind bytegleich.

Neue Prüfungen:

- 8 i18n-Tests: Key-/Placeholder-Parität, statische/Attribut-/Laufzeitabdeckung, Szenario-/Checktexte, sichere Textausgabe, dynamische Umschaltung und offene Details, Sprache/Storage-Fehler, Fallback, Locale-/Extremformatierung und unveränderte benutzerdefinierte Namen.
- 8 lokalisierte UI-Tests mit tatsächlichem App-/Extremmodul: alle fünf Szenarien mit unveränderten Körpern/Trails/Selektion/Zeit/Tempo/Pause; erhaltene fertige Vorhersage und kein Verbrauch weiterer Körper-IDs beim Sprachwechsel; übersetzte Fehler/Canvaslabels; RAF/Hidden/Reduced Motion; Temperatur-Randfälle/ungültige Texte; Pulsar/Ansichtszentrierung; gleiche Dezimalpunkt-Regel und Komma-Ablehnung; Stop/Restart beider IntersectionObserver-Pfade ohne Zustandsänderung.
- 4 UX-Tests: Fokus/Escape/Fokusrückgabe, wiederholter Tabwechsel, freiwillige Hilfe und Sprachwechsel während geöffneter Hilfe/Fokus.
- 2 Renderer-Tests: optionale, finite, begrenzte Pulsarkegel in Qualitäts-/Zoomextremen und englische Labels aller Objekt-/Geometriemodi.

Die DOM/Canvas/RAF-Adapter prüfen wirklichen Modulcode mit kontrollierter Umgebung; sie ersetzen keinen Browser oder Gerätestest. Die tiefen Vergleiche des vollständigen Simulationszustands werden dort ausgeführt. Der Shared-Browser-Inspektionskontext stellt `window.entrolab` nicht bereit; im realen Browser wurden stattdessen unveränderte sichtbare Eingabewerte/Selektion/Tempo bei pausiertem Sprachwechsel verglichen.

`node scripts/benchmark.mjs` vor und nach der Umsetzung: **alle zwölf vollständigen Ergebnisobjekte per `assert.deepEqual` exakt gleich**, auch zu `docs/numerics-v0.2.json`. Keine Referenzwerte überschrieben. Das ist ein Regressionsergebnis, keine neue Genauigkeitsbehauptung.

Originalintegrität: lokale Dateikopie hat keine Git-Historie, deshalb `verify-original.mjs` nicht als lokal bestanden behauptet. Die echte Git-Historienprüfung bestand im GitHub-Baseline-Lauf [42445955970](https://github.com/phoscore/entrolab/actions/runs/42445955970) und im ersten Implementierungslauf [42448018578](https://github.com/phoscore/entrolab/actions/runs/42448018578), jeweils einschließlich „Verify preserved v0.1 source commit“. Abschließender Commit-/CI-Status wird im PR separat mit konkretem Lauf festgehalten.

## Tatsächliche Browserprüfung und Grenzen

Shared Chrome, Desktop etwa **1363 × 936 CSS-Pixel**; zusätzliche gleichursprüngliche Testhüllen mit **1024 × 900** und **390 × 844 CSS-Pixeln**. Dies sind Browseransichten, **keine physischen Smartphone-Tests**. Die Testhüllen sind nach der Prüfung entfernt und nicht Teil des Projekts.

- Desktop: vier Bereiche, DE/EN inklusive vollständigem Modellkapitel und Checkresultaten; offene Bild-Erklärung bleibt bei Sprachwechsel offen. Pausierter Sprachwechsel erhält sieben Inspector-/Auswahl-/Tempo-Feldwerte exakt. Fokusmodi, Enter/Escape, Hilfen öffnen/schließen, Referenzlabor und Canvaslegenden gesichtet.
- Schmale Ansicht: alle fünf bisherigen Szenarien auswählbar; 9/2/3/2/2 Körper und passende Auswahl Earth/Star A/Star A/Test body/Earth. Simulierte Zeit wird wieder angezeigt. Extreme-Objektwahl, Pulsar, Fokus/Escape, EN-Fehler bei −1 K, 0,001-K-Preset → **−273.149 °C** im EN-Browser, BH-Rechner mit Erdmasse weiterhin **8.87 mm** (EN) bzw. **8,87 mm** im DE-Desktoptest.
- Kein horizontaler Überlauf in den geprüften Ansichten: schmal `scrollWidth=clientWidth=375`, Laptop `1009=1009` (jeweils mit Scrollbar). Desktop ebenfalls kein beobachteter Überlauf. Keine pauschale Garantie für jede mögliche Systemschrift/Übersetzung/Vergrößerung.
- Tastatur: Enter aktiviert beide Fokusmodi und native Details/Hilfe; Escape schließt Fokus/Hilfe mit Fokusrückgabe. Dies ist ein Smoke-Test, keine umfassende Screenreader-/Accessibility-Zertifizierung.
- Ein eigener Chromium-/Playwright-Prozess scheiterte konkret an `process_singleton_posix.cc: socket() failed: Operation not permitted`. Der Shared Chrome funktionierte. Vier Browser-Zoom-Tastenkürzel änderten dort weder `innerWidth` noch DPR: **ein echter 200-%-Browserzoom wurde daher nicht nachgewiesen**. Keine simulierte Vergrößerung wird als erfolgreicher Zoomtest ausgegeben.
- Reduced Motion und Document Hidden sind in kontrollierten automatisierten Tests geprüft. Eine echte Betriebssystem-/Browser-Media-Emulation war über diesen Browserzugang nicht verfügbar; sie wird nicht als durchgeführt behauptet. CSS-Reaktion ist implementiert, kein physischer Touch-/Safari-/Langzeit-GPU-Test.
- Erfasste Browserlogs zeigten Metadatenfehler einer Browsererweiterung. Keine ENTROLAB-Seitenfehler wurden in den erfassten Ansichten beobachtet. Ein zunächst versuchter Zugriff auf den nicht verfügbaren Browser-Inspektionsglobal `window.entrolab` war ein Testwerkzeugfehler, kein Fehler des App-Moduls.

## Visueller Nachweis

Eigene Browser-Screenshots vor/nach der Umsetzung; keine generierten Bilder. Die Ansichten sind qualitative Vergleichsbelege, keine pixelgleichen Timing-/Maßstabsbenchmarks. Unterschiedliche Sprachen, Scrollpositionen und Phasen sind sichtbar.

| Objekt | v0.4 vor Änderung | v0.5 nach Änderung |
|---|---|---|
| Weißer Zwerg | [vorher](screenshots/v0.5/before-white.png) | [nachher](screenshots/v0.5/after-white.png) |
| Neutronenstern | [vorher](screenshots/v0.5/before-neutron.png) | [nachher, optionales Pulsar-Beispiel](screenshots/v0.5/after-neutron.png) |
| Schwarzes Loch | [vorher](screenshots/v0.5/before-blackhole.png) | [nachher](screenshots/v0.5/after-blackhole.png) |

[390-px-Browseransicht](screenshots/v0.5/after-mobile.png). Die typografische Hierarchie ist größer, die alten gleichartigen Linienkugeln sind durch differenzierte Sternillustrationen ersetzt; BH-Grundgestaltung bleibt erhalten.

## Reproduktion und offene Kontrolle

```sh
node scripts/test.mjs
node scripts/benchmark.mjs
node scripts/verify-original.mjs  # benötigt die vollständige Git-Historie
python3 -m http.server 8000 --directory dist
```

`http://localhost:8000` öffnen. DE/EN während Pause und laufender Simulation wechseln; Inspector und fertige Vorhersage kontrollieren. Beide Fokusbuttons mit Enter/Escape bedienen; offene Details beim Wechsel behalten. Extreme Objects → Neutronenstern → Pulsar-Beispiel; danach Weißer Zwerg und Schwarzes Loch vergleichen. Kalte Grenzwerte und ungültige Eingaben prüfen. Für die unabhängige Geräteprüfung bleiben echter 200-%-Browserzoom, echte Reduced-Motion-Browsereinstellung, Smartphone/Touch und Safari ausdrücklich offen.

Physikalische Quellen und Gültigkeitsgrenzen aus dem v0.4-Bericht bleiben maßgeblich. Das Release fügt keine validierte Oberflächen-, Magnetosphären-, Emissions- oder GR-Lichtbahnsimulation hinzu. Pull Request nur zur Prüfung; Freigabe zum Merge bleibt erforderlich.
