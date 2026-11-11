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
