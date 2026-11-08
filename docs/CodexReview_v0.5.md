# ENTROLAB v0.5 – Codex-Review und gezielte Korrekturen

Datum: 8. November 2026. Auftrag und Ausgangscode: `55a94f5b3af8f7d01d8b180ebdcb454475f842e9`, Branch `develop/v0.5`, bestehender PR #4. Diese Datei war zu Auftragsbeginn noch nicht im Branch vorhanden; die vom Nutzer übermittelten fünf Fehlergruppen und die zusätzliche wissenschaftliche Klarstellung werden hier mit den tatsächlich durchgeführten Gegenprüfungen dokumentiert. Keine Merge-Freigabe und kein Deployment.

## Ergebnis der Reproduktion

Alle fünf Fehlergruppen sind bestätigt. Die ursprünglichen 101 Prüfungen bestanden, deckten diese Fälle aber nicht ausreichend ab. Sie prüften insbesondere den Modellzustand beim Sprachwechsel, nicht sämtliche ungespeicherten Formularentwürfe und echten Browser-Fokuspfade. Die damalige schmale Browseransicht war 390 px breit; der wachsende 320-px-Fallback-Font-Fall fehlte.

Sieben neu hinzugefügte gezielte Node-Tests schlugen vor der Korrektur sämtlich fehl. Die echte Chromium-CI reproduzierte zusätzlich den initial deutschen Platzierungsbutton im EN-Modus, den Entwurfs-/Fokusfehler, den verlorenen Navigationsfokus, die fehlende Persistierung der bereits aktiven Sprache sowie den fehlenden kurzen Pulsarhinweis im Fokusmodus. Der erste Größenversuch scheiterte schon an Playwrights Stabilitätswartebedingung. Deshalb scrollt der Messtest ohne diese Vorbedingung zur Canvasfläche und misst die Instabilität selbst; der Grenzwert wurde nicht gelockert.

[Reproduktionslauf mit unverändert fehlerhaftem Anwendungscode](https://github.com/phoscore/entrolab/actions/runs/42493129436), Code-Stand der Anwendung weiterhin `55a94f5b`, Testcommit `d16bc338f75dbd69fbe6510f3fb22ffa6e3a5fac`.

## 1. P2 – Höhenwachstum der Sandbox

**Ursache:** `#universe` hatte eine flexible, intrinsisch mitbestimmte Höhe ohne eigene feste CSS-Basis. `resizeCanvas()` übernahm die gemessene CSS-Größe in ganzzahlig gerundete Bitmap-Attribute. Beim 320-px-Systemschrift-Fallback betrug die CSS-Breite 292,40625 px, die Bitmap-Breite bei DPR 1 aber 292 px. Das veränderte intrinsische Seitenverhältnis beeinflusste die nächste CSS-Höhe; Schreiben und erneutes Messen bildeten eine positive Rückkopplung. Eine pausierte Physik verhindert das Zeichnen und damit diese Layoutkopplung nicht.

**Korrektur:** Explizite responsive CSS-Höhe/Flex-Basis und `contain:size` entkoppeln die Anzeige von der intrinsischen Bitmap-Größe, auch für Fokus-/Fullscreenregeln. Die Bitmap darf weiterhin ganzzahlig sein. Der Context-Transform verwendet nun die tatsächlichen Quotienten `bitmapWidth / cssWidth` und `bitmapHeight / cssHeight`, statt bei gebrochenen Größen ungeprüft den nominellen DPR zu verwenden. Unsichtbare Nullgrößen werden ohne Division durch null behandelt. Kamera-, Kraft- und Zeitschrittparameter bleiben unverändert.

**Echte Messung in Chromium 151.0.7922.34**, Google Fonts blockiert, Systemschrift-Fallback, pausiert über echte Browser-Media-Emulation:

| 320×900 CSS px, DPR 1, 120 aufeinanderfolgende Frames | Vorher | Nach Korrektur |
|---|---:|---:|
| Canvas-Anzeigehöhe am Anfang | 385,53125 px | 370 px |
| Canvas-Anzeigehöhe am Ende | 504,6875 px | 370 px |
| Höhenänderung | **119,15625 px** | **0 px** |
| Verschiebung der Transportleiste | **119,15625 px** | **0 px** |

Zusätzlich 320, 320,5, 390,25 und 1360 CSS-Pixel Breite bei DPR 1 / 1,25 / 2: **12 Kombinationen**, je 120 Frames nach acht Warmup-Frames. Gebrochene Breiten werden in einem tatsächlich gebrochen breiten iframe geprüft; ganzzahlige Fälle in direkten Viewports. Nach der Korrektur in sämtlichen zwölf Messreihen Höhen- und Kontrollleistenänderung **0 px**; erlaubte numerische Testtoleranz höchstens 0,1 CSS px. Node prüft zusätzlich die exakte Bitmap-/CSS-Abbildung bei DPR 3 (Bitmap-DPR weiterhin auf 2 begrenzt).

[Messdaten aus den tatsächlichen CI-Logs](review-v0.5-browser.json). Die Stichprobe schließt das reproduzierte Wachstum aus; sie ist keine Garantie für unbegrenzt lange Sitzungen oder alle Browserimplementierungen.

## 2. P2 – Entwürfe, Eingabefokus und sichtbare Validierung

**Ursache:** Der Sprachwechsel rief `diagnostics()` auf, welches bei außerhalb des Formulars liegendem Fokus `fill()` ausführte. Auch spätere periodische Diagnostik konnte Entwürfe nach dem Verlassen eines Feldes überschreiben. Nur die Zahlen im Physikzustand waren bislang abgesichert.

**Korrektur:** Formularänderungen markieren einen noch nicht angewendeten Entwurf. Periodische Messanzeigen überschreiben ihn nicht. Beim Sprachwechsel werden lediglich Beschriftungen/Diagnostik aktualisiert, ohne Formularbefüllung. Erfolgreiches Anwenden, expliziter Körper-/Szenariowechsel bzw. Reset dürfen das Formular wieder aus dem Modell füllen; bloßes Verlassen des Felds nicht. Ein Pointer-Sprachwechsel merkt das vorher fokussierte Editorfeld und stellt dessen Fokus ohne Scrollsprung wieder her. Tastaturaktivierung der Sprachbuttons zieht den Fokus nicht willkürlich zurück.

**Prüfung:** Alle fünf Felder erhalten noch nicht angewendete Werte einschließlich abschließender Nullen. Mehrere DE/EN-Wechsel und nachfolgende Frames bewahren diese Texte; leere, erforderliche Masse und die sichtbare Fehlermeldung bleiben erhalten. Der Browser prüft zusätzlich tatsächliches `activeElement` und `validity.valueMissing`. Der vollständige geklonte Simulationszustand bleibt exakt gleich. Die bisherigen Vorhersage-/Zustandsregressionen bestehen weiter.

## 3. P2 – Dynamische Übersetzungen und native Custom Validity

**Ursachen:**

- Der Platzierungsbutton wurde beim englischen Erststart nicht von seinem Laufzeit-Renderer initialisiert; der statische deutsche HTML-Starttext blieb stehen. Spätere Sprachwechsel übersetzten ihn bereits, weshalb ein reiner DE→EN-Test den Fehler übersah.
- Die Abstandsanzeige interpolierte die Namen/Zahlen, verwendete aber einen unmarkierten deutschen Template-Text mit „zu“.
- Die sichtbare BH-Fehleranzeige wurde übersetzt, die mit `setCustomValidity()` gesetzte Meldung blieb im internen Browserzustand in der alten Sprache.

**Korrekturen:** Initialisierung und spätere Aktualisierung des Platzierungsbuttons verwenden denselben zustandsabhängigen Renderer. Die Abstandsaussage läuft vollständig über `tx` und den bestehenden Katalog. Ein gemeinsamer Renderer aktualisiert BH-Fehlermeldung und `setCustomValidity()` aus demselben ungültig/gültig-Status, auch bei Sprachwechsel, ohne ungültige Eingaben zu übernehmen. Vergleichbare dynamische Texte in Sandbox, Vorhersage, BH-Labor, Extremobjekten und Canvas wurden auf diese Pfade kontrolliert.

**Prüfung jenseits der Katalog-Parität:** frischer englischer Browser, Platzieren/Abbrechen/Escape und DE/EN-Zyklen; tatsächlich gerenderter Text **„1 AU from Sun“**; sichtbare und interne `validationMessage` nach mehreren Sprachwechseln identisch; Eingabetext `1e42` bleibt abgelehnt und erhalten. Node prüft zusätzlich die deutsche Rückkehr und das Leeren beider Meldungen nach gültiger Eingabe. Browser-eigene Meldungen für native Steuerelemente bleiben grundsätzlich vom Browser-/Betriebssystem-Locale abhängig; das ist von ENTROLABs eigener Custom Validity getrennt.

## 4. P2 – Navigationsfokus nach Fokusmodus

**Ursache:** Ein gemeinsamer Exit-Pfad fokussierte immer den ursprünglichen Fokusbutton. Nach Aktivierung eines anderen Haupttabs war dieser bereits verborgen; Chromium ließ den Fokus auf BODY fallen.

**Korrektur:** Direkter Ausstieg und Escape geben den Fokus weiterhin an den auslösenden Fokusbutton zurück. Ein Haupttabwechsel beendet den Modus ohne diese Rückgabe und fokussiert den neu aktivierten Navigationsbutton. Der Wechsel zwischen Fokusansichten benötigt ebenfalls keine zwischenzeitliche Rückgabe.

**Prüfung:** echter Tastaturpfad mit Enter → wiederholtem Shift+Tab bis „Extreme Objects“ → Enter; der neue Tab bleibt tatsächlich fokussiert. Escape aus dem Extremobjekt-Fokus führt weiterhin zum passenden Fokusbutton zurück. Zusätzlicher Node-Test unterscheidet Navigation, direkten Exit und Escape.

## 5. P3 – Explizite Wahl der bereits aktiven Sprache

**Ursache:** `setLanguage()` kehrte bei identischer Sprache zurück, bevor die manuelle Wahl gespeichert wurde.

**Korrektur:** Gültige explizite Auswahl wird vor dem Gleichheits-Return gespeichert. Bei identischer Sprache ist keine erneute Darstellung/Benachrichtigung nötig. Storage-Ausnahmen werden weiterhin abgefangen.

**Prüfung:** frischer deutscher Browser → DE erneut anklicken → `entrolab-language=de`. Übernahme dieses Storagezustands in einen englischen Browserkontext startet weiterhin auf DE. Node prüft den tatsächlichen Storage-Schreibvorgang ohne überflüssigen Änderungs-Callback; die vorherigen Tests für gesperrten Storage bleiben erhalten.

## 6. Wissenschaftliche Klarstellung beim Pulsar-Beispiel

Der ausführliche Hinweis bleibt im Seitenpanel. Zusätzlich erscheint bei aktivem Neutronenstern-Pulsarbeispiel ein kurzer übersetzter Hinweis **direkt innerhalb der Animation**, der auch im Fokusmodus erhalten bleibt: „Strahlungskegel rein schematisch · keine berechnete Emissionsphysik.“ Er ist nicht interaktiv und wird bei anderen Objektarten bzw. deaktiviertem Pulsarbeispiel verborgen. Keine Änderung am Renderer, an Masse, Radius oder physikalischen Ergebnissen.

Die echte Browserregression prüft DE/EN, Fokusmodus, sichtbaren Hinweis innerhalb der Canvasfläche, unveränderten numerischen Radius sowie das Verbergen beim Wechsel zum Weißen Zwerg. Nicht jeder Neutronenstern ist ein Pulsar; Kegel und Lichtstärke bleiben Illustration.

## Tatsächlich ausgeführte Qualitätssicherung

- Ausgangsstand: **101/101** reguläre Prüfungen bestanden.
- Vor Fix: sieben neue Node-Regressionen **0/7**; die übrigen Bestandsprüfungen unverändert erfolgreich. Absichtlich rote Reproduktionscommits sind Belege, keine Freigabestände.
- Nach Fix: `node scripts/test.mjs` **108/108** (zehn originale Rechenchecks + 98 Node-Testfälle), keine übersprungenen Fälle. Alle 101 vorherigen Prüfungen erhalten; der VM-Hilfsadapter ergänzt lediglich ein optionales Start-Locale und eine `validationMessage`-Eigenschaft.
- Neue separate echte Chromium-Suite: **7/7** Fälle bestanden, darunter die zwölf Größen-/DPR-Kombinationen. [Erfolgreicher Implementierungslauf](https://github.com/phoscore/entrolab/actions/runs/42493273081), Commit `5b2f9905170bfa5395a06093407ece3930d18bb1`. Beide CI-Jobs erfolgreich; sechs historische Originalintegritätskontrollen bestanden. Der letzte Dokumentations-/Testisolierungsstand wird ebenfalls vor Abschluss geprüft; konkreter finaler Lauf im PR.
- Zwölf vollständige numerische Benchmark-Ergebnisobjekte vor/nach Korrektur per `assert.deepEqual` exakt identisch, auch zur bestehenden Referenz `docs/numerics-v0.2.json`. Kein numerischer Referenzwert verändert.
- Playwright **1.62.1** ist ausschließlich eine gepinnte Entwicklungs-/Testabhängigkeit mit Lockfile. Die statische App benötigt weiterhin weder npm-Installation noch Build. Der zusätzliche CI-Job installiert Chromium und stellt strukturierte Messungen als privates Repository-CI-Artefakt bereit; kein Deployment.

### Reproduktion

```sh
node scripts/test.mjs
node scripts/benchmark.mjs
node scripts/verify-original.mjs  # mit vollständiger Git-Historie
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install --with-deps chromium
npm run test:browser
```

Die Browsersuite verwendet nur einen lokalen Testserver, blockiert Google Fonts gezielt und schreibt `browser-results/measurements.json`. Der Ordner und `node_modules/` sind ignoriert. Bei gebrochenen Breiten wird zu einer separaten gleichursprünglichen Testserverroute mit iframe navigiert; deren Layout wird nicht mit einem weiterlebenden Root-App-Scheduler vermischt. Eine zwischenzeitliche `about:blank`-Isolierung lief beim Laden des iframe-Moduls in einen Timeout und wurde durch diese gleichursprüngliche Route ersetzt. Messdauer, Größen/DPR und Grenzwerte bleiben unverändert.

### Grenzen

Der lokale Cloud-Executor verweigerte einen eigenen Chromium-Prozess weiterhin mit `socket() failed: Operation not permitted`; lokale Browserergebnisse werden deshalb nicht behauptet. Die dokumentierten echten Browserergebnisse stammen aus der nachweislich ausgeführten GitHub-Chromium-CI. Reduced Motion wird dort als echte Browser-Media-Query emuliert und geprüft, nicht als physische Betriebssystemeinstellung. Echter 200-%-Browserzoom, Safari, physische Smartphone-/Touchbedienung und Langzeit-GPU-/Speichermessungen bleiben offen. Die neuen Tests sind keine allgemeine wissenschaftliche Zertifizierung oder vollständige Übersetzungs-/Accessibility-Zertifizierung.

Ausschließlich `develop/v0.5`, bestehender PR #4. `main`, Hosting, gesicherter Tag/Originaldaten und wissenschaftliche Kernmodule unverändert. Kein Merge, kein Deployment; erneute unabhängige Prüfung erforderlich.
