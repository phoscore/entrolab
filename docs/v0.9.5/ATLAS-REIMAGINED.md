# Cosmic Explorer · Atlas Reimagined (Phase 2E-A)

## Gestaltungsentscheidung

Die Karte erhält mehr Platz und einen ruhigen dunklen Hintergrund. Die Moduswahl bleibt direkt oberhalb aller drei Ansichten; ihr aktiver Zustand ist sichtbar und für Screenreader über `aria-pressed` verfügbar. Die Blickrichtungsansicht nennt ihren Beobachter und bietet eine freiwillige Erklärung. Sonnensystem und Sonnenumgebung behalten ihre eigenen Bezugssysteme und Zurück-zur-Übersicht-Bedienelemente.

Die Gaia-Übersicht zeigt dieselben 128 × 128 gezählten Himmelszellen in einem lokal geglätteten, interpolierten, dreifach aufgelösten **Anzeigeraster**. Die Glättung über benachbarte Zellen und die gedämpften Farben verändern weder Zellen, Zählwerte, Filter, Tile-Planung, Hit-Test noch die Auswahl. Sie sind keine zusätzlichen Quellen und zeigen keine kleinteiligen Strukturen unterhalb der Rasterauflösung. Beim Detail-LOD erscheinen die realen Gaia-Einträge als Kreise. DESI erhält gedämpfte, eigenständig lesbare Flächen für die Auswahlhäufigkeit und eine hellere Kontur für die Näherung beobachteter Bright-Felder; einzelne spektroskopisch klassifizierte Galaxien bleiben hohle Rauten. Das Footprint-Raster beschreibt weder Faserbelegung noch Vollständigkeit. Die Legenden und die getrennten Zählwerte bleiben sichtbar.

Der Inspector stellt Name/Kategorie, eine kurze wissenschaftliche Einordnung und einen vorhandenen Schlüsselwert voran. Gaia bleibt eine **unklassifizierte Quelle ohne abgeleitete Entfernung**; DESI zeigt z ausdrücklich ohne räumliche Entfernung. Die vollständigen Katalogfelder, Unsicherheiten, Quellen und Lizenzen liegen in einem nativen aufklappbaren Abschnitt. Ein Sprachwechsel erhält dessen geöffneten Zustand für dieselbe Auswahl. First Light behält seine verifizierten Namen, Systemverknüpfungen und jeden bisherigen Messwert.

In der Raumkarte markieren hellere Datenpunkte weiterhin nur katalogisierte Positionen; der warme Halo bezeichnet ausschließlich die Sonne als Ursprung. Die Ringe sind Projektionsabstände, der Inspector nennt den geschätzten 3D-Abstand und das asymmetrische Posteriorintervall. X/Y und X/Z ändern keine Daten. Lange Kartenlabels werden nur **auf dem Canvas** gekürzt; volle Identität, Suche und Inspector bleiben erhalten. Reduced Motion benötigt keine Sonderanimation, weil keine neue Animation und kein zusätzlicher Renderloop eingeführt wurde.

## Nachweise

Der Vergleichstest `tests/atlas-reimagined-browser.test.mjs` startet die echte Anwendung zweimal: den eingefrorenen `main`-Stand `eec181cec59e7219c3d8161b0b37acf4f54f9436` aus `git archive` und den PR-Stand. Er erstellt bei identischen Viewports und Bedienwegen `before-*` und `after-*` für Gaia, Gaia+DESI, Zoom, Inspector, Sonnenumgebung sowie 320/390/1440 px. `comparison.json` enthält Browser-Version, Overflow, Katalogzustand, Interaktionsmessungen und Leerlaufprüfung. Der Test läuft als Teil der verpflichtenden Chromium-Suite; die Bilder liegen im CI-Artefakt `chromium-review-measurements`. Die Zahlen sind Runner-Messungen, keine Aussage über physische Mobilgeräte oder GPU-Energie. Die visuelle Bewertung und Sichtfreigabe erfolgen anhand **dieser tatsächlichen App-Bilder** nach dem CI-Lauf.

Lokal prüfen:

```sh
node scripts/test.mjs
node scripts/build-real-sky.mjs --check
node scripts/build-deep-sky.mjs --check
node scripts/build-neighborhood.mjs --check
node scripts/build-explorer.mjs --check
node scripts/cosmic-data.mjs verify
node scripts/check-benchmarks.mjs
node scripts/verify-original.mjs
npm run test:browser
```

Die Datenreleases, Capture-Dateien, wissenschaftlichen Modelle und historischen Referenzen sind nicht Teil dieses Designpasses. Der manuelle historische v0.8-Renderingvergleich ist vor einer späteren Mergefreigabe gesondert auszuführen; seine Vergleichsbilder sind von den neuen Explorer-Screenshots zu unterscheiden.
