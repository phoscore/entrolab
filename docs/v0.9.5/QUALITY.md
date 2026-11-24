# Cosmic Explorer Phase 1 · Qualitätsbericht

## Katalogprobe und Nachvollziehbarkeit

| Quelle | Enthaltene Reihen | Aussage und geprüfte Sonderfälle |
| --- | ---: | --- |
| Gaia DR3 + Bailer-Jones | 13 | Drei durch eine Gaia-Referenz identifizierte nahe Sterne und zehn Quellen ohne astrophysikalische Klassifikation. Zehn Quellen mit jeweils zwei separaten Entfernungsposterioren. Vier negative Parallaxen und drei reine Positionslösungen. Geometrische und photogeometrische Mediane können stark auseinanderliegen. |
| DESI DR1 | 6 | Primäre Galaxienspektren aus einem HEALPix, mit spektroskopischem z und Fehler. Drei Dimensionen werden für diese Probe nicht behauptet. |
| Open Exoplanet Catalogue | 3 | 51 Peg b, HR 8799 b, TRAPPIST-1 b. Drei schematisch verwendbare Parametersätze. Die Herkunft reicht für keinen als vollständige Kalenderbahn aus. |
| NASA Exoplanet Archive | separat 16 PS + 3 PSCompPars | Drei Planeten, nur lokal. Unterschiedliche Referenzen und Perioden bleiben getrennt. PS-Export `a283f93199b214c07dfa7c6ac163d070fa6537be27070b03a671615a81728a99`, PSCompPars `a1e2070686c9d430bd08dea395292f715e3dcb0eb2b337f6ddbf6ccd9af9e1ac` (SHA-256). |

Die Gaia-Gegenabfrage gegen NOIRLab bestätigte alle 13 IDs, 78 Feldvergleiche einschließlich fehlender Werte und alle Lösungsmasken. Größte Unterschiede zwischen Mirror-Formaten waren 4,51 × 10⁻¹⁷° für Dec, 3,92 × 10⁻⁵ mas für Parallaxe, 4,11 × 10⁻⁷ mas für ihren Fehler und 5,01 × 10⁻⁷ für RUWE. NOIRLab exportiert fehlende Felder dieser drei Positionslösungen als `NaN`, GAVO als leere Zelle. Die ESA-Direktgegenprobe lieferte HTTP 429. Eine unabhängige VizieR-Gegenprobe der Bailer-Jones-Reihen scheiterte an einem Verbindungsreset. Die Posterior-Werte stammen aus dem gepinnten GAVO-Export und werden in Offline-Tests geprüft. Für DESI stimmten sechs IDs und 36 Werte in einer separaten Abfrage beim selben Anbieter exakt überein. Die OEC-Projektion ist auf die drei XML-Quelldateien und deren Git-Blob-SHAs zurückführbar. Diese Gegenproben sind keine vollständige Freigabe eines breit stratifizierten Produktionskatalogs.

Die neue Node-Suite prüft Manifest/Digests, Eingabekonflikte, nichtnumerische oder fehlende Werte, Einheiten, asymmetrische Fehler und Limits, Bahn-Vollständigkeit, falsche Tile-Header, die RA-Naht, Kachelbudget, Suchtreffer/Inspector-Identität, Abbruch, LRU und beschädigte Ausgabe. Echte astronomische Eingaben und synthetische Lastdaten stammen aus verschiedenen Pfaden. Die vorhandene `dist/`, Physikmodelle, Null 3.0, alte Testdateien, historische Benchmarks und Originale werden über einen Git-Baumvergleich geschützt. Der bestehende Node-Einstieg erhält lediglich die neuen Modul- und Testregistrierungen.

## Gemessene Paketgrößen

Windows x64, Node 24.22.1, Gzip Stufe 6. Größen in Byte bzw. binären Einheiten. Die echte Probe enthält 22 Objekte mit 19 Himmelsrichtungen und zwölf Objekten ohne Distanz. Beide Winkeltiles benötigen zusammen 336 B roh bzw. 276 B gzip. Manifest 14.644 B roh bzw. 4.953 B gzip. Ein zusammengefasster Offline-Objektdump belegt 78.677 B roh bzw. 5.212 B gzip. Die einzelnen Inspector-Antworten belegen zusammen 16.183 B gzip, alle Suchshards 3.158 B gzip. Das ist der konkrete Zuschlag des kleinen Pakets. Bei vielen Objekten werden Details gebündelt und Abrufe separat gemessen.

### Synthetische Lastmessung

Drei Wiederholungen mit demselben Xorshift-Seed, in einem absichtlich verdichteten äquatorialen Band und über den übrigen Himmel verteilt. Keine astronomischen Objektidentitäten. Der Messablauf komprimiert alle Blattseiten und Suchseiten und nimmt danach die ersten 32 Blätter in der DFS-Reihenfolge als reproduzierbaren Transferpfad. Diese Reihenfolge modelliert keinen konkreten Kameraflug. Die gemessene Suche enthält je eine synthetische ID und einen Zeilenverweis, ohne reale Aliase oder Detailtexte. Die Verzeichnisse werden separat gezählt.

| Lastpunkte | Tiles | Tiles roh / gzip | Größtes Tile gzip | 32 Blattseiten gzip | Index gzip / größte Seite |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 100.000 | 88 | 1,53 / 0,96 MiB | 20,57 KiB | 351,78 KiB | 0,44 MiB / 9,79 KiB |
| 1.000.000 | 832 | 15,27 / 10,00 MiB | 27,40 KiB | 428,02 KiB | 4,48 MiB / 9,75 KiB |
| 10.000.000 | 3.520 | 152,64 / 101,21 MiB | 35,42 KiB | 1,05 MiB | 44,95 MiB / 9,75 KiB |

| Lastpunkte | Tilebau und Gzip, Median (Spanne) | Suchseiten und Gzip, Median | RSS nach Arbeit und GC, Spanne |
| ---: | ---: | ---: | ---: |
| 100.000 | 63 ms (60–66 ms) | 31 ms | 63–66 MiB |
| 1.000.000 | 588 ms (573–624 ms) | 315 ms | 108–118 MiB |
| 10.000.000 | 7,20 s (6,92–8,04 s) | 3,00 s | 349–374 MiB |

Bei 1 Mio. Punkten belegen synthetische Tiles plus Suchseiten bereits rund 14,49 MiB gzip. Hinzu kommen Namen, Fehler, Literatur, weitere Layer und Detaildaten. Der Top-Level-Aggregatblock belegt 120 B gzip und das Verzeichnis 11,47 KiB gzip. Der beispielhafte 32-Blatt-Pfad budgetiert bis knapp 2 MiB für dekodierte numerische Tile-Arrays. Der 16-MiB-LRU deckelt abgerechnete Nutzdaten separat. RSS ist eine Momentaufnahme des Offline-Builders, ohne Peakmessung. Beide Float64-Eingabekoordinaten belegen bei 1 Mio. Punkten bereits 15,26 MiB. Detailpakete und reale Durchläufe mit Netzwerk, Geräten und Rendering sind noch zu messen. Die Werte liefern keine Framerate, Latenzgarantie oder tatsächliche Hostingkosten.

## Reproduktion und Übergabe

Die [Reproduktionsbefehle](README.md#offline-wiederholen) laufen ohne wissenschaftliche Netzverbindungen. Die [Quellenmatrix](SOURCES.md) beschreibt die Unterschiede zwischen öffentlichem Zugriff, Forschungsnutzung und Weiterverteilung pro Produkt. Phase 2 beginnt mit einer repräsentativeren, gezielt geschichteten Stichprobe, separaten Footprints, einer unabhängig geprüften HEALPix-Implementierung oder einem dokumentierten Alternativindex sowie einer Offline-Probe für JPL-Ephemeriden. Danach folgen Referenzprüfungen der Kosmologie, echte Geräte- und Netzwerkbudgets und Renderer-Vergleiche. Die Phase-1-Probe begründet noch keine Releaseentscheidung.

## Heliosphere

The [Heliosphere verification](HELIOSPHERE.md#implementation-and-checks) exercises deterministic nested geometry, physical units and ephemeris coverage, and adds Chromium evidence for region selection, camera and epoch restoration, both Voyager trajectories, event navigation and 320/390 px layouts. It uses the existing source integrity and historical regression suites.
