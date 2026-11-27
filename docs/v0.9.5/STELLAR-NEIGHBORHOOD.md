# Cosmic Explorer · Stellar Neighborhood

Im Explorer die **Sonnenumgebung** wählen. Sie zeigt eine statische, drehbare Perspektive auf die geschätzten Positionen rund um die Sonne. Ziehen oder Pfeiltasten drehen und neigen die Kamera. Mit zwei Fingern, +/− oder dem Mausrad auf der fokussierten Karte zoomt man. **Zur Sonne** wechselt den Drehpunkt, **Übersicht** setzt zusätzlich Blickwinkel und Zoom zurück. Die Statuszeile gibt Drehpunkt und galaktische Blickrichtung an. Bei Auswahl erscheint der geschätzte räumliche Sonnenabstand in Lj oder pc, mit einer abschaltbaren Verbindungslinie als Orientierungshilfe. **Richtung auf der Himmelskarte** richtet die Winkelkarte auf die ursprünglichen ICRS-Koordinaten aus. Die All-Sky-Kataloge haben eigene Auswahlregeln.

## Daten- und Rechteprüfung

| Prüfung | Feststellung |
| --- | --- |
| Identitäten und Epoche | GAVO `gedr3dist.litewithdist` verbindet DR3-`gaia_source` und den geometrischen EDR3-Entfernungskatalog per exakter `source_id`. DR3 übernimmt die EDR3-Astrometrie, einschließlich des Bezugs der Richtungen auf J2016.0 (TCB). Eine Richtungs- oder Namenssuche wird für den Join nicht verwendet. |
| Gaia-Winkel und Fitwerte | ESA/Gaia/DPAC, **CC BY-NC 3.0 IGO**. Kommerzielle Nutzung erfordert separate ESA-Autorisierung. Die ESA-Lizenzseite und die Archivbedingungen waren bei der Vorprüfung direkt erreichbar. |
| Geometrische Distanzen | Bailer-Jones et al. (2021), **CC BY 4.0** laut GAVO. Der geometrische Posterior beruht auf Parallaxe, ihrer Unsicherheit und einem richtungsabhängigen Prior. Fotogeometrische Distanzen und eine direkte Parallaxeninversion werden hier nicht verwendet. |
| Pilot | Der vollständige 10-pc-Pilot bei Gaia `G ≤ 14` unter den unten genannten Kriterien ergab 198 Reihen und 26.448 B CSV. Synchrone Zählabfragen über 50 und 100 pc und der asynchrone 50-pc-Export liefen ins Zeitlimit. Der vollständige 25-pc-Export und der getrennte ID-Export gelangen synchron. Der 25-pc-Radius wurde auf Basis dieser Ergebnisse gewählt. |

[ESA Gaia-Lizenz](https://www.cosmos.esa.int/web/gaia-users/license) · [ESA-Archivbedingungen](https://www.cosmos.esa.int/web/esdc/terms-and-conditions) · [GAVO, Join und Lizenz](https://dc.g-vo.org/gedr3dist/q/cone/form) · [Bailer-Jones et al. (2021)](https://doi.org/10.3847/1538-3881/abd806) · [Gaia DR3](https://doi.org/10.1051/0004-6361/202243940)

## Auswahl und Messgrenzen

- Alle **2.753** eindeutigen Quell-IDs im Export mit geometrischem Median `r_med_geo ≤ 25 pc` und gemessenem Gaia `G ≤ 14 mag`. Die Zusatzauswahl in G begrenzt Übertragung und Punktmenge. Der Radius begrenzt den Median. Eine obere Intervallgrenze kann außerhalb liegen. Die [Abfrage im Capture-Beleg](../../cosmic-explorer/neighborhood/source/capture.json) enthält kein `LIMIT`. Eine eigene, vollständige ID-Abfrage und das Zeilen- und Bytebudget sichern gegen stilles Abschneiden. Die beiden Exporte enthalten dieselben sortierten IDs.
- Gültige ICRS-Winkel und 5- oder 6-Parameter-Lösungen (Masken 31/95), mindestens zehn Sichtbarkeitsperioden, `0 < RUWE < 1,4`, Parallaxe mindestens 5 mas, positive Fehlerangabe und Parallaxen-S/N ≥ 10. Die 5 mas sind eine Plausibilitätsgrenze für die Astrometrie. Aus diesem Wert werden weder eine Entfernung noch die Grenze der Karte berechnet.
- Die drei veröffentlichten Quantile müssen positiv geordnet sein. Die Breite `r_hi_geo − r_lo_geo` beträgt höchstens 20 % des Medians. Fehlende oder ungültige Pflichtfelder erfüllen die Abfrage nicht. Der Offline-Importer bricht bei inkonsistenten Reihen, Duplikaten und fehlgeschlagenen Integritätsprüfungen ab.
- Die Qualitätsschnitte schließen etwa Quellen mit instabiler Fünf- oder Sechs-Parameter-Lösung oder großen Fehlern aus. Gaia erfasst unter anderem manche sehr hellen oder sehr lichtschwachen Sterne nur eingeschränkt. Mehrere Quellen können zu einem physischen System gehören. Die Karte ist eine Auswahl von Gaia-Quellen und kein vollständiges Sterninventar. Die Namensliste enthält nur einzelne verifizierte Zuordnungen in genau dieser Gaia-Auswahl. Die Namensliste und ihre Belege stehen unten.

## Koordinaten und Unsicherheit

Für ICRS-`(α,δ)` wird `(cos δ cos α, cos δ sin α, sin δ)` mit der festen ICRS→Galactic-Rotation aus SOFA/ERFA gedreht und mit `r_med_geo` in pc multipliziert. Die Rotation verschiebt den Ursprung nicht. Die kleinen Unterschiede zwischen Sonne und Sonnensystembaryzentrum bleiben auf diesen Skalen unter der gezeigten Auflösung. +X bezeichnet `l=0°, b=0°`, +Y `l=90°, b=0°`, +Z den galaktischen Nordpol. Die Orbit-Kamera projiziert die im Binärpaket gespeicherten XYZ-Vektoren direkt. Der Inspector nutzt weiterhin die vollen Werte der verifizierten Detailseite. Für pc → Lj werden AU, Lichtgeschwindigkeit und Julianisches Jahr verwendet.

Das Intervall enthält die geometrischen Quantile 0,158655 und 0,841345, mit dem Median bei 0,5. Der Inspector erhält die asymmetrischen Endpunkte. Die Verbindung zur Sonne zeigt den projizierten Strahl zum gewählten Median. Die Anzeige rundet den Abstand auf höchstens zwei signifikante Stellen und bei breiterer Unsicherheit gröber. Ab einer Intervallbreite von 5 % des Medians erscheint zusätzlich ein nach außen gerundeter Bereich. Die vollständigen geometrischen Quantile stehen unter den Quelldetails. Der Datenstand bleibt J2016.0. Es gibt keine Eigenbewegungsfortschreibung. Punktformen und Sonnensymbol geben keine Sterndurchmesser an.

## Unabhängige Originalgegenproben

**61** IDs aus RA-/gleichflächigen Deklinationsstrata, verschiedenen Entfernungsquantilen und besonders breiten relativen Intervallen. Die Gaia-Richtungen, Parallaxen und Referenzepochendaten wurden über **`gaiadr3.gaia_source` im Gaia-Archiv des Leibniz-Instituts für Astrophysik Potsdam (AIP)** abgefragt. Für dieselben IDs wurden die drei Bailer-Jones-Quantile direkt aus **der Originaltabelle `gedr3dist.main` der Autoren bei GAVO** abgerufen. Der Entfernungsvergleich verwendet die separat abgefragte Originaltabelle beim selben Betreiber wie der DR3-Join. Zusätzlich wurden die Raumvektoren anhand der unabhängigen Winkel mit Astropy im Galactic-Frame berechnet. Der Offline-Build vergleicht alle drei Eingänge und protokolliert maximale Abweichungen. Die gespeicherten ICRS-Winkel und Quantile stimmen überein. Die größte Parallaxendifferenz beträgt 0,0000392 mas (Rundung der veröffentlichten Formate). Die größte Astropy-Vektorabweichung beträgt 0,00000295 pc. Die Originalvergleiche belegen Reproduzierbarkeit innerhalb der gespeicherten Formate, keine astrophysikalische Vollständigkeit.

[Capture, ADQL und Referenzmetadaten](../../cosmic-explorer/neighborhood/source/capture.json) · [Ausgelieferte Credits](../../cosmic-explorer/neighborhood/CREDITS.md) · [Astropy, Koordinatentransformationen](https://learn.astropy.org/tutorials/2_Coordinates-Transforms.html) · [SOFA/ERFA, ICRS→Galactic](https://github.com/liberfa/erfa/blob/master/src/icrs2g.c)

## Reproduzierbarer Release

[Manifest des ausgelieferten Katalogs](../../dist/explorer/data/v0.9.5-neighborhood-25pc-g14.1/manifest.json)

| Feld | Wert |
| --- | --- |
| Datenrelease | `v0.9.5-neighborhood-25pc-g14.1` |
| Manifest SHA-256 | `11a761b7a1ac61b18620e1f083ef739a97e72fababf725536add3c6ba911296d` |
| GAVO-Capture | 369.953 B · `b1db58b4d3154c810af5f0a9c4cfc220542b40cc0dd74acdeb75b7e8f7513f1e` |
| Größen | 21 Dateien · 440.557 B · 68.590 B Manifest und Übersicht |
| Nachladen | Größte Detailseite 21.599 B · höchstens ein Detailrequest gleichzeitig · 256 KiB Detailcache |

Das Browserpaket enthält einen kompakten Index mit uint64-IDs und float32-Positionen. Detailseiten laden erst bei Auswahl. Die ID-Suche erreicht sämtliche enthaltenen Quellen. Die ruhige Tiefenstaffelung und die Helligkeit im G-Band beeinflussen die Symbolgröße und das Leuchten der Marker. Die Sonne ist der markierte Ursprung. Der Maßstabsbalken gilt in der Tiefe des Kamerafokus. Er lässt sich deshalb bei einer perspektivischen Ansicht nicht auf den gesamten Bildschirm übertragen.

Beim Zoomen und Drehen zählt die Ansicht alle projizierbaren Quellen innerhalb des Bildausschnitts. Pro 4-CSS-Pixel-Zelle wird ein Marker gezeigt. Bei Kollisionen haben Auswahl und bekannte Namen Vorrang, danach die vordere Quelle. Ein Klick auf einen Marker zeigt bei Überlagerung die beteiligten Gaia-Quellen sowie direkt benachbarte Marker in der Liste. Ein Klick auf das Sonnensymbol setzt den Drehpunkt zur Sonne. Dicht dahinter liegende Quellen bleiben über die Liste und ID-Suche erreichbar. Nach Überlagerung gilt ein Zeichenbudget von 1.050 Markern für Canvas-Breiten unter 500 CSS-Pixeln, sonst 2.200. Die Legende weist beide Gründe für ausgelassene Marker getrennt aus. Die Sonne gehört zu keinem dieser Zähler. Eine Ansicht wird nur bei Änderungen von Kamera, Daten, Beschriftung oder Layout neu gezeichnet. Die Paketgröße und das Nachladen bleiben unverändert.

### Versionierte Sternhinweise `neighborhood-identities.1`

Die bestehenden Identitäten für Proxima Centauri, Barnards Stern und Lalande 21185 bleiben erhalten. Die Ergänzung im Quellcode enthält nur einzelne Namen, Aliase und veröffentlichte Spektraltypen mit Quellen. Sie verwendet die Gaia-DR3-ID als exakten Schlüssel. Die zusätzlichen Spektraltypen beeinflussen weder Farbe noch Markergröße. Für andere Quellen wird keine Klasse geschätzt.

| Gaia DR3 | Geprüfte Ergänzung |
| --- | --- |
| `35227046884571776` | Teegardens Stern · M7.0 V nach Zechmeister et al. (2019) |
| `3864972938605115520` | Wolf 359 |
| `1872046609345556480` | 61 Cygni A |
| `1872046574983497216` | 61 Cygni B |
| `762815470562110464` | Lalande 21185 · Gl 411 · M2 V nach Kirkpatrick et al. (2012) |

Die Namen und IDs stammen aus der ESA/Gaia/DPAC-Tabelle zu Eigenbewegungen. Ihre Zuordnung ist für diese wenigen Einträge in der bestehenden Gaia-Attribution dokumentiert. Die Spektraltypen sind einzeln referenzierte Literaturangaben. Es werden keine neuen Archivtabellen, Abbildungen oder Katalogdateien verteilt. [ESA Gaia](https://www.cosmos.esa.int/web/gaia/iow_20250513) · [Archivkopie der ESA-Tabelle](https://www.dejavu.org/cgi-bin/get.cgi?url=https%3A%2F%2Fwww.cosmos.esa.int%2Fweb%2Fgaia%2Fiow_20250513&ver=95) · [Zechmeister et al. (2019)](https://arxiv.org/abs/1906.07196) · [Kirkpatrick et al. (2012)](https://doi.org/10.1088/0004-637X/753/2/156)

### Vergleich und Messung

Der Chromium-Test nimmt die eingefrorenen X/Y- und X/Z-Ansichten aus `a4b1ce6` und die neue Gesamtansicht samt gedrehter Perspektive bei 1440, 390 und 320 px auf. Er ersetzt im Baseline-Browser nur die beiden tatsächlichen Kartendateien und das Stylesheet der Basisrevision. Der übrige Build und die gepinnten Katalogdaten sind bei beiden Aufnahmen gleich. Unter `neighborhood-3d/` stehen PNGs und `performance.json`. Die Messung erfasst Ladezeit, 20 Draw-Proben pro Profil, Nutzbytes der Übersicht, Speicher der Katalogarrays, den geschätzten Canvas-Pixelpuffer und den Detailcache. Das sind keine Messungen des gesamten Browser- oder GPU-Speichers. Die mobilen Messprofile sind emuliert und laufen mit vierfacher CPU-Drosselung.

```sh
node scripts/build-neighborhood.mjs --check
node scripts/build-real-sky.mjs --check
node scripts/build-deep-sky.mjs --check
node scripts/build-explorer.mjs --check
node scripts/test.mjs
node scripts/check-benchmarks.mjs
node scripts/verify-original.mjs
npm ci
npx playwright install chromium
npm run test:browser
```

`node scripts/build-neighborhood.mjs --build` erzeugt den Release vollständig aus dem eingefrorenen CSV und den Referenzen im Repository. Unter derselben Release-ID werden Konflikte abgelehnt. Der separate erneute Archivabruf lautet `python scripts/fetch-neighborhood.py <neues-verzeichnis> 25 14` mit Astropy 7.2.0. Vor einer Übernahme sind geänderte Quelle und Auswahl zu diffen und zu versionieren. Der CI-Review veröffentlicht Screenshots und `neighborhood-3d/performance.json` für 1440, 390 und 320 CSS-Pixel. Die Mobilprofile sind emuliert.

## Vorgemerkt für einen eigenen All-Sky-Designschritt

Nutzerfeedback zum All-Sky-Screenshot vom 15. November 2026. Die derzeitige Atlasoptik wirkt überladen und weniger einladend als beabsichtigt. Einen späteren Designpass auf die Hierarchie von Dichteflächen, Markern, Abdeckungshinweisen und Bedienelementen begrenzen. Wissenschaftliche Lesbarkeit, Kataloge und Orientierung erhalten. Dieser Feedbackpunkt gehört zur All-Sky-Ansicht. Die Raumkarte ist eine eigene Perspektive.

## Freie Kamera

**Freie Kamera** ergänzt den Orbit-Modus. WASD/QE oder die sechs Richtungstasten verschieben den Beobachter in galaktischen XYZ-Parsec. Ziehen und Pfeiltasten ändern den Blick. Die Geschwindigkeitsanzeige verwendet pc oder Lj pro realer Sekunde. Sonne, Auswahl und Übersicht bleiben als Rückkehrpunkte verfügbar. Der Maßstabsbalken erscheint im Orbit-Modus. [Steuerung, Grenzen und Prüfung](FINAL-POLISH-C.md#stellar-neighborhood).
