# v0.8.5 – Labor-Upgrades · Entwicklungs- und Prüfbericht

Stand: 11.11.2026. In Arbeit, keine Releasefreigabe.

## Ausgangsstand und Arbeitsvertrag

`main` und Merge von PR #7 bestätigt: `25e72c639d66677c1629886141e3671a4c696ef6`, Baum `df22450778c46ce73b7a760f8571e8ce25cc0370`. Isolierter Entwicklungsbranch `feature/v0.8.5-lab-upgrades`, vom exakten Merge abgeleitet. Jeder Commit einschließlich der Ref-Anlage trägt `[CF-Pages-Skip]`; keine neue Vorschau und kein Deployment. Cloudflare meldet für den Merge ein erfolgreiches Deployment (`cddbdb79.entrolab.pages.dev`); tatsächliche Produktionsbytes werden separat geprüft.

Alle elf geforderten Grundlagen vollständig gelesen, einschließlich des historischen Audits mit 14 Befunden. Schritte 05–08 und QCD sind jetzt ausdrücklich autorisiert; historische Planungsgrenzen bleiben als Geschichte erhalten. Titel/Favicon/Domain werden nicht eigenständig umgestellt.

Lokal vor Änderungen: `node scripts/test.mjs` bestanden, 10 Selbstchecks + 176 Node-Fälle = **186**. GitHub auf dem Merge: Physics/Original und Chromium grün. Neuer Ausgangslauf auf dem vorbereitenden Dokumentationsstand folgt. Lokales Source-Verzeichnis besitzt keine Git-Objekthistorie; 12/6 werden im vollständigen CI-Klon geprüft.

Vier Ebenen bleiben getrennt: angewandte Physik, unveränderte Rohentwürfe, neue Präsentationszustände, abbrechbare Jobs. Hilfen/Tour/Materialbild/BH-Illustration schreiben keine Solverwerte und konsumieren keinen Modellzufall. Echte Tabnavigation behält bestehende Pausen und Vorhersageabbrüche. Keine Änderung an Rechenkernen, numerischen Toleranzen, archivierten Originalen oder Monsterdateien.

## Fachliche und technische Abgrenzung vor Implementierung

- Einführung: freiwilliger Wähler, kurzer Einstieg und sieben Laborpfade; echte Controls nur fokussieren/beobachten. Kein synthetisches Apply/Reset. Session-Resume im Speicher, jederzeit Zurück/Überspringen/Schließen. Die alte Wärme-Lernroute bleibt als eigener Pfad mit ihren Zustandsassertionen erhalten. Keine Pflichtaufgabe zum bisher nicht vollständig tastaturbedienbaren Körperplatzieren (A07).
- BH: bestehender reiner `drawObject`-Zeichenkern wird wiederverwendet, eigener Controllerzustand. Umgebung / Licht & Horizont und optionaler Projektionswinkel. Keine Geodäten, kein Raytracing, keine quantitative Scheiben-/Hawkingemission. Normierte Darstellung unabhängig von berechneter Masse. Sichtbarkeit/Reduced Motion/Pause begrenzen eine eigene Schleife, maximal 30 Zielbilder/s und begrenzter DPR.
- Materialvergleich: reine Referenzdaten, 1 atm = 101325 Pa, kanonische Kelvinwerte und daraus abgeleitete Celsiuswerte. Nominale Übergangsbänder aus dokumentierter Anzeigenauflösung, keine Phasenanteile. Konservative didaktische Vergleichsfenster werden vor der UI dokumentiert; außerhalb keine Zustandsbehauptung, keine universelle chemische Zersetzungsschwelle. Kein Transfer ins Wärmemodell.
- QCD: freiwilliger Artikel im selben Science-/Quellensystem, keine neue Hauptnavigation oder Physikberechnung. Protonenmasse und mathematisches reines Yang–Mills-Mass-Gap-Problem deutlich getrennt.
- Performance: tatsächliche v0.8-Basis, gleiche Szenen/Geometrie und Reihenfolgeumkehr. Für unveränderte Szenen gelten als Arbeitsbudget höchstens +10 % vergleichbares Paint-p95; Ausnahmen offen berichten. Neue BH-Animation separat nach absoluter Renderdauer, Frameintervall und versteckter Nullaktivität prüfen; Ziel 30 fps, kein universelles Hardwareversprechen. Zusätzlich 390-px-/4×-CPU-Profil als Emulation, keine Behauptung eines realen Handytests. Die alte A13-Ausnahme wird nicht übernommen.

## Ausstehende Prüfungen

Implementierung, neue Regressionen, vollständige 186/65/12/6-Nachprüfung, Quellenverifikation, Produktionshashprobe, Screenshots, Lifecycle-/Performancewerte, unabhängiger lesender Review und Draft-PR werden im Verlauf ergänzt. Keine dieser Prüfungen ist hier bereits als bestanden behauptet.

## Vorab festgelegte Materialkonvention (A05/A06)

Alle Stoffe sind hypothetische Reinstoffe im Gleichgewicht bei 101325 Pa, ohne chemische Reaktionen oder Oxidation. Kein Materialsolver. Die Zustandsaussage ist ein begrenzter Tabellenvergleich, keine Vorhersage eines realen Experiments. Die Fenster sind **bewusst gewählte didaktische Auswertungsgrenzen**, keine gemessenen Zersetzungs-, Ionisations- oder Stabilitätsschwellen. Sie umfassen die beiden normalen Übergänge und einen kleinen angrenzenden Fest-/Dampfbereich; Metallfenster beginnen bei Raumtemperatur, damit kryogene Phasen/Materialdetails nicht behauptet werden. Oberhalb bleibt selbst dann „außerhalb“, wenn ein vereinfachtes Diagramm noch Dampf vermuten ließe. Es wird keine universelle Stoffaussage bei Astro-/Plasmatemperaturen gemacht.

| Stoff | Schmelzen K / Vergleichsband ±K | Sieden K / Band ±K | Darstellungsfenster K | Grundlage |
| --- | --- | --- | --- | --- |
| Wasser | 273,15 / 0,05 | 373,15 / 0,05 | 250–400 | OpenStax, didaktische Normaldruckwerte 0/100 °C; Band entspricht Anzeige 0,1 K, keine Messunsicherheit |
| Ethanol | 159 / 2 | 351,5 / 0,2 | 140–375 | NIST WebBook-Mittelwerte und dort angegebene Streuung; PDG 159,0/351,4 K als gerundete Gegenprobe |
| Aluminium | 933,473 / 0,0005 | 2792 / 0,5 | 273,15–2850 | RSC; Band halbe letzte publizierte Kelvinstelle, keine behauptete Stofftoleranz |
| Eisen | 1811 / 0,5 | 3134 / 0,5 | 273,15–3200 | RSC; ebenso nominelle Darstellungsauflösung |

Quellen am 11.11.2026 tatsächlich geöffnet: OpenStax University Physics 2 §1.5, NIST WebBook CAS 64-17-5 / Phase change data, PDG2026 Ethanol, RSC Elemente 13/26. Gegenüber dem frühen PDG-Vorschlag wird für Ethanol absichtlich die NIST-Kompilation 351,5 ±0,2 K verwendet; keine vermeintliche exakte Gleichheit zwischen unabhängig gerundeten K-/°C-Spalten. Kelvin ist kanonisch. Übergangsband bedeutet nur „Tabellen-Übergangsbereich / Koexistenz möglich“, nicht einen aus Temperatur bestimmten Phasenanteil oder breites reales Schmelzintervall.

Die Behauptung gültiger Chemie innerhalb dieser Fenster wird ausdrücklich nicht erhoben. Wärmekapazitäten, latente Wärme, Dissoziation, Reaktionszeiten und Druckänderungen werden nicht berechnet. Die bewusst enge Begrenzung ist Teil der wissenschaftlichen Vereinfachung, kein neuer experimentell validierter Stoffdatensatz. Materialdaten werden nie als Parameter an das bestehende Wärmeexperiment übergeben.


## Lesender Zwischenreview und korrigierte Grenzfälle

Der unabhängig lesende Review hat zwei eigene neue Inhalte/Bedienfälle beanstandet: negative absolute Temperaturen dürfen nicht pauschal als Nichtgleichgewicht bezeichnet werden (unnötigen Satz entfernt); leere optionale Zahlenfelder sind nativ gültig, obwohl der Temperaturcontroller sie ablehnt. Der Lernpfad prüft jetzt zusätzlich die tatsächliche Laborfehlermeldung und Leertext, bevor er eine Handlung bestätigt. Neue Chromium-Fälle prüfen auch −0 und negative Unterläufe. Physikwerte bleiben unverändert.

Mathematische Präzisierung gegenüber A06 des historischen Audits: Für A=0 und B>0 ist A/B=0, nur B=0 verhindert den Quotienten. Das neue Vergleichsmodul zeigt deshalb den tatsächlichen Nullquotienten; beide Nullrichtungen sind getrennt getestet. Das ist neue Präsentationsmathematik im genehmigten Umfang, keine Änderung des bestehenden Temperaturlabors oder Wärmemodells. Positive extrem kleine Quotienten werden bei Gleitkomma-Unterlauf weiterhin logarithmisch dargestellt, nicht als Null ausgegeben.

Die Celsiusreferenzen werden aus Kelvin abgeleitet und auf die jeweilige publizierte Präzision gerundet (Eisen 1811 K → ungefähr1538 °C, keine scheinexakten1537,850 °C). Der mobile BH-Moduswähler erhält eine volle Zeile, damit seine Namen bei320px lesbar bleiben.


Ein weiterer Zwischenlauf auf89cece fand einen von uns verursachten mobilen Headerüberlauf: der lange Zusatz „development“ im Versionsbadge vergrößerte das nicht umbrechende Markenfeld um10px über320px. Der Badge wird auf die kurze Versionsnummer begrenzt; keine alte Overflow-Assertion wurde gelockert. Die Entwicklungseigenschaft steht in Branch/PR/Qualitätsbericht, nicht als lange Headerdekoration. Alle bisherigen Layoutregressionen werden erneut ausgeführt.
