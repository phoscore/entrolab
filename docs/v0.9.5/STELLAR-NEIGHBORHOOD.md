# Cosmic Explorer · Stellar Neighborhood

Im Explorer die **Sonnenumgebung** wählen. Die Sonne markiert den Ursprung. Punkte zeigen geschätzte Positionen katalogisierter Quellen. X/Y zeigt die galaktische Ebene, X/Z die Höhe darüber und darunter. Beim Wechsel bleibt die gewählte Quelle ausgewählt. Der Inspector gibt den geschätzten räumlichen Abstand zur Sonne, den Abstand in der Projektion sowie die beiden Grenzen des geometrischen Posteriorintervalls an. Die Ringe lassen sich zwischen pc und Lichtjahren umschalten. **Richtung auf der Himmelskarte** richtet die Winkelkarte auf die ursprünglichen ICRS-Koordinaten aus. Die All-Sky-Kataloge haben eigene Auswahlregeln.

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
- Die Qualitätsschnitte schließen etwa Quellen mit instabiler Fünf- oder Sechs-Parameter-Lösung oder großen Fehlern aus. Gaia erfasst unter anderem manche sehr hellen oder sehr lichtschwachen Sterne nur eingeschränkt. Mehrere Quellen können zu einem physischen System gehören. Die Karte ist eine Auswahl von Gaia-Quellen und kein vollständiges Sterninventar. Vorhandene sichere Namen werden nur für die in First Light belegten DR3-IDs in dieser Auswahl übernommen.

## Koordinaten und Unsicherheit

Für ICRS-`(α,δ)` wird `(cos δ cos α, cos δ sin α, sin δ)` mit der festen ICRS→Galactic-Rotation aus SOFA/ERFA gedreht und mit `r_med_geo` in pc multipliziert. Die Rotation verschiebt den Ursprung nicht. Die kleinen Unterschiede zwischen Sonne und Sonnensystembaryzentrum bleiben auf diesen Skalen unter der gezeigten Auflösung. +X bezeichnet `l=0°, b=0°`, +Y `l=90°, b=0°`, +Z den galaktischen Nordpol. In X/Y bzw. X/Z bleibt die jeweilige dritte Koordinate in der Quellenkarte erhalten. Die kartesischen Beträge und der Projektionsabstand `hypot(X,Y)` bzw. `hypot(X,Z)` haben unterschiedliche Bedeutungen. Für pc → Lj werden AU, Lichtgeschwindigkeit und Julianisches Jahr verwendet.

Das Intervall enthält die geometrischen Quantile 0,158655 und 0,841345, mit dem Median bei 0,5. Der Inspector erhält die asymmetrischen Endpunkte. Die kurze Linie auf der Karte ist das projizierte radiale Intervall bei festgehaltener Katalogrichtung. Sie enthält weder Winkelkovarianzen noch Modell- oder systematische Fehler. Der Datenstand bleibt J2016.0. Es gibt keine Eigenbewegungsfortschreibung. Punktformen und Sonnensymbol geben keine Sterndurchmesser an.

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

Das Browserpaket enthält einen festen kompakten Index mit uint64-IDs und float32-Positionen. Detailseiten laden erst bei Auswahl. ID-Suche nutzt den validierten Index und funktioniert für jede enthaltene Quelle. Hellere Quellen mit `G < 10` erhalten etwas größere Symbole. Der gestrichelte Kreis markiert den gewählten maximalen Medianradius in der Projektion. Die Karte begrenzt gezeichnete Punkte auf 1.050 mobil und 2.200 auf größeren Flächen. Sie clippt den Ausschnitt und entdichtet Überlagerungen im Bildschirmraster. Die Zahlen nennen Katalogumfang, Quellen im Ausschnitt und tatsächlich gezeichnete Punkte getrennt. Canvas zeichnet bei Kamera-, Daten- und Layoutänderungen. Im Leerlauf ist kein Zeichenloop aktiv. Astronomiearchive sind reine Akquisitionsquellen. Der Browser prüft Hashes, Versions- und Bytebudgets und setzt bei Fehlern Wiederholungsoptionen.

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

`node scripts/build-neighborhood.mjs --build` erzeugt den Release vollständig aus dem eingefrorenen CSV und den Referenzen im Repository. Unter derselben Release-ID werden Konflikte abgelehnt. Der separate erneute Archivabruf lautet `python scripts/fetch-neighborhood.py <neues-verzeichnis> 25 14` mit Astropy 7.2.0. Vor einer Übernahme sind geänderte Quelle und Auswahl zu diffen und zu versionieren. Der CI-Review veröffentlicht Screenshots und `neighborhood-performance.json` für 1440, 390 und 320 CSS-Pixel. Die Mobilprofile sind emuliert.

## Vorgemerkt für einen eigenen All-Sky-Designschritt

Nutzerfeedback zum All-Sky-Screenshot vom 15. November 2026. Die derzeitige Atlasoptik wirkt überladen und weniger einladend als beabsichtigt. Einen späteren Designpass auf die Hierarchie von Dichteflächen, Markern, Abdeckungshinweisen und Bedienelementen begrenzen. Wissenschaftliche Lesbarkeit, Kataloge und Orientierung erhalten. Dieser Feedbackpunkt gehört zur All-Sky-Ansicht. Die Raumkarte ist eine eigene Perspektive.
