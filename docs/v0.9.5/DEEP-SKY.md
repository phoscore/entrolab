# Cosmic Explorer · Phase 2C-B: Deep Sky

Im Explorer unter **Himmelskarte** die Ebene **Galaxien · DESI DR1** einschalten. Warme Rasterzellen zählen Galaxien aus der Auswahl pro gleicher Himmelsfläche. Beim Zoomen wechseln sie zu einzeln auswählbaren, hohlen Rauten. Die Kontur gilt den beobachteten DESI-Bright-Feldern. Gaia und First Light behalten ihre eigenen Symbole und Kontrollen. Das Sonnensystem und **Gesamter Himmel** bleiben direkt erreichbar. Die Suche akzeptiert eine exakte DESI-`TARGETID`, mit oder ohne Präfix `DESI`. Detailkarten öffnen sich auch aus der Tastaturliste.

## Quellenwahl und Rechte

| Prüfung vor dem Import | Ergebnis |
| --- | --- |
| Katalog | DESI **DR1**, Iron Main Survey Bright, `desi_dr1.zpix` beim offiziellen NOIRLab-Spiegel. Der Datenbankzugang lieferte Katalogspalten und exakte CSV-IDs. |
| Risikobegrenzung | Die Count-Abfrage über dieselben Qualitätsprädikate ergab **32.392** Zeilen für `0,003 ≤ z < 0,025`, **50.134** bis `0,030` und **73.770** bis `0,035`. Gewählt wurde die kleinste dieser Schwellen. Bei rund 175 CSV-Bytes pro Zeile lag die Schätzung unter 6 MB Rohdaten. Der Export hatte ein hartes Limit von 8 MiB. |
| Unabhängige Referenz und Beobachtung | Das offizielle DESI-Archiv lieferte die Bright-Redrock-FITS und die 1.339.200 B große Datei `tiles-iron.fits`. Die Stichproben mussten gegen FITS-Zeilen bestehen. |
| Lizenz | **Creative Commons Attribution 4.0 International (CC BY 4.0)** für DESI DR1. Der Release enthält Zitation, Änderungsvermerk, Lizenz-URI und den offiziellen Acknowledgment-Text. Die Gaia-Datenlizenz und der Website-Code haben eigene Nutzungsbedingungen. |

Offizielle Referenzen: [DR1 und tatsächliche Abdeckung](https://data.desi.lbl.gov/doc/releases/dr1/), [Datenbank und Spaltenmodell](https://data.desi.lbl.gov/doc/access/database/), [DESI-Lizenz und Acknowledgments](https://data.desi.lbl.gov/doc/acknowledgments/), [DR1-Publikation](https://doi.org/10.3847/1538-3881/ae4c43), [Creative Commons](https://creativecommons.org/licenses/by/4.0/).

## Auswahl und wissenschaftliche Aussage

- Main Survey, Bright, `BGS_TARGET & 2 = 2` für das BGS-Bright-Targeting-Bit und `ZCAT_PRIMARY` für die primäre Kataloglösung. Die Galaxienklassifikation stammt getrennt davon aus der spektroskopischen Redrock-Bestklasse `SPECTYPE = GALAXY`. Targeting allein würde die Klassifikation nicht belegen. Siehe [DR1-Publikation, Tabelle B2](https://doi.org/10.3847/1538-3881/ae4c43).
- `ZWARN = 0`, `DELTACHI2 > 40`, numerisches positives `ZERR` und gültige mittlere Faserwinkel in Grad. `DELTACHI2` ist der Abstand zwischen den besten Template-Fits, keine Wahrscheinlichkeit. Die Qualitätsgrenze orientiert sich an den [BGS-Kriterien der DESI-Analyse](https://lss.fnal.gov/archive/2025/pub/fermilab-pub-25-0845-ppd.pdf).
- Vollständiger Bereich `0,003 ≤ z < 0,025` der gefilterten Datenbankabfrage über alle verfügbaren Himmelsrichtungen. Kein `LIMIT` und kein nach Himmelszellen gleichgemachtes Sampling. Die begrenzte Rotverschiebung ist eine anschauliche, budgetierte Auswahl, keine volumen- oder helligkeitsvollständige Stichprobe. Die erste Anzeigebandgrenze ist `z = 0,012`. Die beiden Bänder enthalten **6.055** und **26.337** Galaxien.
- **32.392 eindeutige IDs**, numerisch aufsteigend im originalen CSV, als dezimale Strings in Web-APIs und 64 Bit in Tiles. Ein separates `COUNT(*)` und eine feste Zeilenzahl schützen vor einer stillen Kürzung. Fehlende oder ungültige Pflichtfelder sind vom Exportprädikat ausgeschlossen oder stoppen die Validierung. Keine Ersetzung durch Null oder Schätzung. Mehrfachzeilen derselben ID stoppen den Build.
- RA/Dec sind mittlere beobachtete Faserwinkel. Die Redrock-Messwerte sind dimensionslose spektroskopische Rotverschiebung und formales `ZERR` aus baryzentrischen Spektralwellenlängen. Die Karte gibt Richtungen und Messwerte an. Eine räumliche Entfernung ist in diesem Paket unbekannt. Die Rauten geben die spektrale Klasse an und enthalten keine Aussage zu Form oder Größe. Die Beschriftung der ausgewählten Quelle verwendet den Katalognamen `DESI J…`.

## Abdeckung und Gegenproben

Die [eingefrorene Beobachtungstabelle](../../cosmic-explorer/deep-sky/source/tiles.csv) enthält die **2.275 Main/Bright-Tilezentren** aus HDU 1 `TILE_COMPLETENESS` des [offiziellen Iron-Tileprodukts](https://data.desi.lbl.gov/public/dr1/spectro/redux/iron/tiles-iron.fits). Vier Unterzellmittelpunkte pro gleichflächiger Rasterzelle messen die Vereinigung nominaler sphärischer Felder mit **1,605°** Radius. Die Näherung ergibt **9.616 Quadratgrad**, zum Vergleich nennt die DR1-Übersicht rund **9.739 Quadratgrad** für Main Bright. Die Näherung folgt tatsächlich im Release geführten Tilezentren. Sie erfasst keine individuelle Faserbelegung, Löcher, Masken oder Vollständigkeit. Die Rasterzellen zählen katalogisierte Galaxien unabhängig von der Kontur. Leere, gefilterte, nicht abgedeckte und fehlerhaft geladene Ausschnitte haben eigene Meldungen.

Die [Gegenproben](../../cosmic-explorer/deep-sky/source/reference.csv) stammen aus **50 verschiedenen offiziellen Einzel-HEALPix-Redrock-FITS-Dateien**, nicht aus einer zweiten Abfrage des Spiegels. Aus besetzten 45°-RA-Sektoren und drei gleichflächigen Deklinationsbändern wurden jeweils niedrige, mittlere und hohe z-Quantile gewählt, ergänzt durch fünf besonders niedrige `DELTACHI2`-Werte. `REDSHIFTS` und `FIBERMAP` mussten dieselbe TARGETID-Reihenfolge haben. Offline werden Identität, Pixel, Winkel, z, z-Fehler, Warnflag, `DELTACHI2`, Spektralklasse, BGS-Maske und die beobachtete Zielklasse `TGT` geprüft. Der [Capture-Beleg](../../cosmic-explorer/deep-sky/source/capture.json) enthält pro FITS-Datei SHA-256 und Größe sowie die konkrete SQL-Abfrage und Digest des Gesamt-Exports.

## Pakete und Reproduktion

| Paket | Gemessene Größe |
| --- | ---: |
| Vollständiger statischer Release | 350 Dateien · 3.918.029 B |
| Aktivierung der Übersicht | 164.418 B ungepackte Nutzlast · Manifest + Raster |
| Richtungs-Tiles | 230 · 7.672 B größtes Tile |
| Detailseiten | 85 Gzip-CSV-Seiten · 24.237 B größte gepackte Seite |
| Suchshards | 32 · 31.827 B größter Index |

Der [Release](../../dist/explorer/data/v0.9.5-desi-dr1-bgs-z025.1/manifest.json) trägt die ID `v0.9.5-desi-dr1-bgs-z025.1`. Manifest SHA-256 `3db89fbe3521f2395537aae88e0cb6a658c7374534e5106a2805815c07c7ea53`. Rohcapture **5.176.455 B**, SHA-256 `7aa3c2ad5d2ebaf7f34bb9dfd9591e5b8a8bb12a2779b951972953cd9a82e982`. Originaldaten werden als gzip-Archiv außerhalb von `dist` aufbewahrt. Die Kacheln nutzen CXT1 mit 64-Bit-ID-Anhang, die vorhandene gleichflächige Unterteilung und LOD-Selektion. Die Übersicht zählt ganze angeschnittene Rasterzellen. Das Kachelbudget beträgt 12 Blätter und 1.450 bzw. 2.200 Quellen mobil bzw. Desktop. Bei Überschreitung bleibt die vollständige Übersicht aktiv. Pixelentdichtung betrifft nur sichtbare Rauten. Die Detaildaten laden erst bei Auswahl. Such-, Detail- und Tilekanäle haben eigene Abbruchsignale, Zeitgrenzen und zusammen 896 KiB Cachebudget. DESI erzeugt höchstens vier gleichzeitige Paketrequests. Die zusätzliche Ebene ist beim ersten Öffnen ausgeschaltet und lädt keine Daten, bis sie aktiviert wird.

Die Werte liegen unter den [Pages-Grenzen](https://developers.cloudflare.com/pages/platform/limits/) von 20.000 Dateien auf Free und 25 MiB pro Einzeldatei. Die Berechnung verwendet statische Dateigrößen und setzt keinen zusätzlichen Dienst voraus.

```sh
node scripts/build-deep-sky.mjs --check
node scripts/build-real-sky.mjs --check
node scripts/build-explorer.mjs --check
node scripts/cosmic-data.mjs verify
node scripts/test.mjs
node scripts/check-benchmarks.mjs
node scripts/verify-original.mjs
npm ci
npx playwright install chromium
npm run test:browser
```

`node scripts/build-deep-sky.mjs --build` erzeugt das vollständige Paket aus dem eingefrorenen lokalen Capture. Abweichende Bytes unter derselben Release-ID werden abgelehnt. Zur expliziten erneuten Akquisition dient `python scripts/fetch-deep-sky.py <neues-verzeichnis>` mit Astropy 7.2.0. Diese externe Akquisition ist vom Offline-Build und vom Browser getrennt. Ein neuer Snapshot ist vor Übernahme zu diffen und zu versionieren.

Die Chromium-Suite archiviert Desktopübersicht, Inspector und Mobilansichten bei 320 und 390 px sowie `deep-sky-performance.json`. Sie misst Aktivierung und synchrone Canvas-/DOM-Arbeit bei echten Zoomschritten mit Zeit für den Tile-Loader. Die mobilen Profile verwenden DPR 2 und vierfache CPU-Drosselung. Das sind Runner-Messungen. Displaylatenz, GPU-Topologie, Energie und physische Smartphones sind dadurch nicht gemessen.
