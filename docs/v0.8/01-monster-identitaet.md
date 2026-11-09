# Schritt 01 – Das Entropie-Wesen: Entropy Wraith / Void Beast

> **Aktueller Umsetzungsstand (09.11.2026):** Schritte 01–04 sind ausdrücklich zur Implementierung auf dem isolierten Entwicklungsbranch freigegeben. Frühere Aussagen „keine Work-/Codefreigabe“ in diesem Plan sind damit für 01–04 überholt. Monsterintegration erst nach Sichtfreigabe; Merge, Deployment, Domain-/öffentliches Rebranding und Schritte 05–08 bleiben gesperrt. Verbindliche Präzisierungen: [Umsetzungsvertrag v0.8](Umsetzungsvertrag_v0.8.md).
## Ausführliche Design- und Implementierungsspezifikation – ENTWURF

**Produktkontext:** v0.8 / v0.8.5, siehe [Roadmap](README.md). **Stilrichtung A + Glitch bereits ausdrücklich gewünscht.** Anatomie, Namen, finale Grafik und genaue Auftrittsfrequenz bleiben für gemeinsame Sichtung offen. Noch **keine Freigabe für Work-Implementierung**. **Gewählter Website-/Produktname ist „Reincarnated as a Proton“ (Nutzerentscheidung am 09.11.2026)**; die Domain-/Markenprüfung und Umstellung stehen aus. „Entropy Wraith“ und „Void Beast“ sind weiterhin nur **Arbeitstitel für die Figur**, nicht für die Website.

### Verbindliche Quellen-Hierarchie für v0.8 / v0.8.5 – 09.11.2026

**Unmissverständlich:** Der **neuere, konkret ausgewählte minimalistische rot-schwarze A3/Glitched-Entity-Bildentwurf** und dessen sichtbare Merkmale in diesem Dokument haben **Vorrang** vor dem älteren generischen Stil-A-Text im Folgenden. Die nachstehenden **violetten/türkisen Farbwerte und komplexen 2.5D-Anatomiedetails sind ausschließlich historische Konzeptreste und ausdrücklich NICHT die Produktionsvorgabe**. Sie sollen beim Bauen nicht ohne Freigabe wieder auftauchen. **Aktuelle Sollpalette:** fast Schwarz + kräftige schmale rote Brush-/Glitch-Striche + wenig Weiß für Augen/Grinsen, keine Pflicht zu violettem Glow oder Türkis-Metallpanzer. Siehe [Schritt 08 – finale Designarchitektur](08-design-system-und-finaler-feinschliff.md).

**Asset-Status (09.11.2026): DIE ORIGINALBILDREFERENZ IST JETZT IM REPOSITORY.** [Originale A3-Glitched-Entity-Mastergrafik](assets/a3-glitched-entity-master.jpg) liegt bytegenau unverändert auf `develop/v0.8` unter `docs/v0.8/assets/a3-glitched-entity-master.jpg` (**JPEG**, 1536×1536 px, 144400 Byte, Git-Blob `b6f41e288ac18b60dd19bd79773e205c73048f15`, SHA-256 `5dfb6a91195d7c3925cee9ae202332c26476de257b1a2f5b1469da1c08536ab3`). Der hochgeladene Originalname trug fälschlich `.png`, die Daten waren jedoch JPEG; das Masterbild wurde **nicht neu kodiert**. **Option A vom Nutzer ausdrücklich bestätigt:** exakt dieses Bild ist die offizielle und verbindliche visuelle Quelle; nicht eine frei interpretierte Neugenerierung. **Mastergetreue kleinere Assets und Originalvergleich sind inzwischen erstellt; ihre ausdrückliche Sichtfreigabe steht noch aus.** Projektname entschieden; eigener Monstername kann offen bleiben. Der separate Auftrag für 01–04 ist erteilt; breite Integration erst nach ausdrücklicher Sichtfreigabe.

### Visuelle Auswahl vom Nutzer – 09.11.2026

**Gewählter Designentwurf:** stark vereinfachte, skizzenhafte **A3 / Glitched Entity** (vorherige aufwendige violette A3-Variante ausdrücklich als zu detailliert verworfen). Das im Chat generierte und vom Nutzer ausdrücklich erneut bestätigte **Originalbild ist als GitHub-Datei verfügbar**: [Master-Referenz](assets/a3-glitched-entity-master.jpg). Work muss dieses konkrete Bild als Vorlage lesen, nicht nur alte Textbeschreibungen. **Vor der Webintegration soll Work als erste visuelle Teilaufgabe aus der Masterreferenz die wirklich benötigten derivativen Assets herstellen**, mit sichtbarer Nutzerprüfung der Ähnlichkeit.

**Bindende visuelle Merkmale:** nahezu rein schwarzer Hintergrund; kräftige, sparsame **rote Skizzen-/Brush-Striche** als Körperkontur, wenige hellweiße Augenschlitze und schiefes Grinsen. Deutlich asymmetrische, gehörnte/fragmentierte Maskensilhouette mit hohlem Kreis im Stirnbereich, grober gebrochener Ring um den Kopf; dunkler leichter Oberkörper mit einer ringförmigen Leerstelle in der Brust, zwei vereinfachte kantige Greifhände, abstrakter nach unten auslaufender Schweif. Nur vereinzelte eckige Glitch-Striche an der Maske, keine komplizierte 3D-Rüstung, keine Fototexturen, kein violett-türkiser Effektnebel, kein bildfüllendes Poster und keine filigranen 200 Einzelteile. Der ausgewählte Entwurf ist **noch kein finaler produktionsfertiger UI-Asset**: auf 32–64 px muss er gezielt vereinfacht und mit reduziertem Bewegungsaufwand sinnvoll erkennbar gemacht werden. Keine Gameplay-/Physikdaten überlagern.

**Namensstand:** Der Eigentümer hat **„Reincarnated as a Proton“** als zukünftigen Website-/Produktnamen ausdrücklich festgelegt. `entrivial-lab` war ausschließlich provisorischer Text auf früheren Entwürfen und ist verworfen. **Noch keine Umbenennung der bestehenden Domain, GitHub-Repo, öffentlichen UI oder Metadaten:** erst Domain-/Marken- und Migrationsentscheidung. Der Name der Monsterfigur selbst ist unabhängig davon noch offen.

### Asset-First-Workflow für die spätere Work-Umsetzung (vom Nutzer gewünscht)

**Sequenz:** Nach dem initialen reinen Audit und einer gesonderten Work-Baufreigabe soll die erste **visuelle** Umsetzung die Herstellung schlanker Web-Assets aus der hier verlinkten Masterreferenz sein. **Zuerst Derivate zeigen und prüfen**, dann großflächige Monster-Integration.

1. **Master unverändert lassen.** Referenzdatei in `docs/v0.8/assets/` nicht überschreiben, beschneiden, umkodieren oder für normale Seitenaufrufe automatisch laden; `dist/` erhält bei Bedarf nur optimierte Ableitungen. Original erkennbar mit relativem Pfad in der Dokumentation verlinken.
2. **Mindestens drei zielgerichtete Ableitungen vorbereiten**, sofern technisch sinnvoll: (a) **Hero/halber Körper** für größere gelegentliche Szenen, (b) **kompakter Rand-Peek** (Silhouette / Kopf / Greifhand) für Hilfe und Labore, (c) **winziges Markensymbol/Favicon** (reduzierter Kopf/Ring, im Kleinen erkennbar). Nicht zwingend drei völlig verschiedene Illustrationen; nur Ausschnitte/vereinfachte Versionen **derselben Figur**. Optional (d) eine zweite kleine Reaktion/Pose, wenn Qualität und Zeitbudget passen.
3. **Formate technisch ehrlich wählen:** optimierte WebP/PNG (auch mit Transparenz, **nur** wenn ein sauberer Freisteller ohne schwarze Artefakte gelingt) und ggf. präzises SVG für einfache Linien-/Logo-Version. **Keine automatische Pixelfoto-als-SVG-Einbettung als „echte Vektorisierung“ verkaufen**. Wenn detailtreue SVG-Vektorisierung scheitert, gute Rasterderivate verwenden.
4. **Ausdruck erhalten:** markanter gebrochener roter Ring/Halo, schwarze spitze Maskensilhouette mit roter Kontur und hohler Stirn, zwei schmale weiße Augen und schiefes weißes Grinsen, hohler Brustkreis, asymmetrisch greifende Hände sowie wenige gebrochene Glitch-Kanten. Keine violetten Rüstungsteile, keine detaillierte Neuzeichnung.
5. **Abnahme als Montage:** Work zeigt die Derivate **nebeneinander mit dem echten Master** auf dunklem Hintergrund, möglichst mit 32/64/128/240px Vorschauen; meldet Bildmaße, Dateigrößen, Transparenz/Format und Browser-Testbarkeit. Nutzer kann Ausschnitte / Vereinfachung ändern. **Kein eigenmächtiger Ersatz des vereinbarten Bildes.**
6. **Animation:** Vorzugsweise wenige günstige Transform-/Opacity-Bewegungen bzw. kurze, klare Glitch-Zustände auf denselben Ableitungen; kein schwerer Sprite-Generator nötig. `prefers-reduced-motion`, Pause, Monster aus, keine mehrfache In-Page-Instanz, keine Rechen-/RNG-Seiteneffekte; nur einen visuellen Manager.
7. **Bauauftrag in zwei Etappen:** Bildderivate sind Bestandteil der späteren v0.8-/Schritt-01-Implementierung nach Freigabe. Die weitergehenden, nur falls sinnvoll ausgebauten Animations-/Brand-Feinheiten können in v0.8.5/Schritt 08 optimiert werden. Die Freigabe eines Bilds bedeutet **keine** Erlaubnis für GitHub-Merge, öffentliche Domainumstellung oder Deployment.

### 1. Identität und Aufgabe

Das Wesen ist **das lebendige Markenzeichen** der ganzen Wissenschaftswebsite. Es soll gleichzeitig:
- visuell einen eigenständigen Wiedererkennungswert schaffen;
- Besuchern durch kleine Überraschungen und Blickführung helfen, neugierig zu bleiben;
- ohne belehrende Popup-Flut an passende Erklärungen und nächste Experimente erinnern;
- mit leicht boshaftem, nihilistisch-sarkastischem Humor eine konstante Persönlichkeit aufbauen;
- in gravitativen, thermischen, statistischen und astronomischen Laboren in verschiedenen Gesten auftreten, **ohne die Physik selbst zu manipulieren oder falsche Aussagen zu vermitteln**.

**Leitsatz:** „Kosmischer Beobachter mit eigenem Charakter, nicht schwarzer Kreis mit Smiley.“ Das alte SL-Smile-Favicon darf als historische Vorversion erhalten bleiben, soll aber nicht die neue volle Kreatur definieren. Keine Vermarktung der erfundenen Figur als wissenschaftlich beobachtbares Phänomen.

### 2. Verbindliche Grafik und Größenvarianten

Die unveränderte rote/schwarze Masterreferenz ist alleinige gestalterische Quelle. Frühere violett/türkise 2.5D-, Panzer-, Tiefenlagen- und Mimikforderungen sind verworfene Konzepte und keine zusätzliche Abnahme. Hero, Peek und Icon sind Ausschnitte/Skalierungen derselben Figur. Keine freie Neugenerierung oder neue Anatomie. Derivat-Montage mit 32/64/128/240 px und Original zuerst visuell abnehmen. Kein aktiver Faviconwechsel ohne separates Branding-Gate.

### 3. Sparsame Bewegung statt neuer Anatomie

**Glitch:** kein zufälliges Stroboskop, keine kaputten Schriften. Stattdessen:
- Für **einzelne sehr kurze Momente** 1–3 px Segmentversatz an Augen/Ringen oder Farbkanten;
- eine „fehlende“ Konturscheibe, die nach wenigen Frames wieder andockt;
- ein Fragment, das sich in 2–5 geometrische Splitter auflöst und zurückkehrt;
- minimaler chromatischer Saum an der Kreatur, nicht an Messwerten, Labels oder dem eigentlichen Canvas;
- gelegentliche statische „unmögliche Perspektive“ durch gegensinnig driftende Vorder-/Hintergrundteile.

**Frequenz und Reizdosierung:** Standard bei Ruhe **langsames Schweben/Beobachten**, keine Dauer-Glitches. Glitch-Signal nur gezielt (z. B. neue Kontextkarte, überraschender Zustand, Laborwechsel) und kurz, nicht bei jedem Klick. Vorschlag: unabhängige spontane Effekte haben einen großzügigen Cooldown (ca. 45–90 s), kontextgebundene Reaktionen sind deutlich subtiler und dürfen oft nur eine Blick-/Haltungsänderung sein. Keine abrupten großen Bildschirmverschiebungen, kein lautes Audio, keine unkontrolliert blinkenden Flächen. Nach Möglichkeit über 3 Hz blinkende Kontraste vollständig vermeiden. Bei „Reduced Motion“ und Modus „ruhig“ keine Glitches oder automatischen Bewegungen.

### 4. Persönlichkeit, Ausdruck und Texte

**Grundtemperament:** beobachtend, leicht überlegen, ironisch, manchmal schelmisch-böse, aber neugierig. Nicht sadistisch gegen Besucher, kein Beschämen bei Fehlern, keine Witze über reale Opfer/Katastrophen. Es darf physikalische Denkfehler neckisch entlarven, die Person selbst jedoch nicht angreifen.

**Zustände / Mimik:** Idle (schwebender Wächter), Curious (Kopfneigung, Augen enger), Suspicious (einen Halbkreis um ein falsches Vorurteil ziehen), Satisfied (schmales Grinsen nach Einsicht), Disturbed (kurzer Glitch bei extremer Skala), Observing (Augen folgen einer Grafik ohne deren Werte zu verändern), Sleep (verkleinert/steht still bei Inaktivität oder verborgener Ansicht). Kein künstliches „Wesen lebt in deiner persönlichen Kamera“ oder Datenerfassung.

**Kurze Sprechbeispiele (alle ausdrücklich als Humor/Meinung gekennzeichnet):**
- Entropie: „Mehr Möglichkeiten als Hoffnung auf einen bestimmten Zustand.“
- Wärmefluss: „Die Energie bleibt. Die Unterschiede nicht.“
- Schwarzes Loch: „Die Mathematik ist düsterer als meine Laune.“
- Gravitation: „Du nennst es Fallen. Ich nenne es eine Umlaufbahn mit Ambitionen.“
- Erklärung: „Ich beobachte nur. Die Gleichungen machen die Arbeit.“
- Irrtum: „Entropie bedeutet nicht einfach Chaos. Leider so einfach ist es nicht.“

Die letzte Zeile einer Erklärung darf witzig sein, **der wissenschaftliche Kern bleibt davor klar und sachlich**. Aussagen wie „das Universum hat bewiesen keinen Sinn“ oder „ein schwarzes Loch saugt magisch alles“ sind für die Wissensebene unzulässig. Keine Formulierung darf den Nutzer verspotten, der gerade etwas nicht versteht.

### 5. Auftritte auf der gesamten Site – „überall, aber immer nur eins“

**Strenge Sichtbarkeitsregel:** Zu jeder Zeit **maximal eine sichtbare In-Page-Instanz** (einschließlich Kopf-/Augen-/Schattenvarianten). **Nicht** pro Karte, Lab oder Canvas ein separat laufendes Exemplar. Eine einzige Creature-Manager-Instanz hält alle Zustände; Wechsel des Ankers **verschiebt oder morpht** dieselbe Figur. Keine parallelen Kopien durch offene Details, Hover, Scroll, Popovers oder schnelle Navigation. Verhindere Doppellisten/Geisterinstanzen nach Wechsel.

**Konkrete Einsatzstellen (Prototypwünsche, endgültige Anker im Designreview auswählen):**
- Header/Start: einmaliger, dezenter Auftritt beim ersten Besuch, danach weg/klein.
- „Erste Schritte“: taucht am aktuell hervorgehobenen UI-Element auf, schaut auf das Ziel, verschwindet während Texteingabe.
- „Begriffe verstehen“ und Advanced-Details: peekt aus dem Rand der **zuletzt vom Nutzer geöffneten** Karte, schaut zu einer wichtigen Skizze oder markiert eine Fehlannahme.
- „Modelle & Quellen“: steht klein neben Modellgrenzen („Keine Magie“), aber niemals zwischen Messwerten oder Belegen.
- Gravity Sandbox: beobachtet eine Orbitalbahn von außerhalb des numerischen Canvas; schwebt kurz nahe der Grafiklegende bei Start/Reset, keine Wechselwirkung mit Körpern.
- Black Hole Lab: aus seitlichem Schatten/Horizontbereich erscheint eine Silhouette, reagiert auf Ansicht/Blickwinkel oder Größenvergleich; **kein** zweites astrophysikalisches Objekt im Modell. Deutlich dekorative Ebene.
- Extreme Objects: kurzer Silhouettenwechsel zwischen Weißem Zwerg und Neutronenstern, blickt neugierig in die Dichtegrafik.
- Temperature Lab: bei zulässiger Übertragung kurz die Richtung zur Wärme-Lab-Verknüpfung andeuten, ohne Werte zu verdecken.
- Entropy Marker-Modell: verfolgt eine Teilchengruppe oder kommentiert die Häufigkeitskurve, ohne die zufällige Ziehung zu beeinflussen.
- Wärme-/Entropie-Lab: schaut auf den wärmeren Körper und auf das Gleichgewicht; niemals so animieren, als würde es Wärme selbst lenken.
- Seltene Easter Eggs: bei bewusst gestarteten Experimenten und interessanten Zuständen. Kein zwanghaftes Sammelsystem, kein Analytics.
- Bei überlappenden Events gewinnt die **zuletzt ausdrücklich vom Nutzer geöffnete** Erklärung oder das aktive Experiment; alte Animation abbrechen, eine Figur neu verankern.

**Benutzerfreundlichkeit:** nie Messwerte überdecken, keine Buttons blockieren; sichere Margins, Anchor/Viewport-Clamping, auf 320 px ggf. klein oder unsichtbar, Tooltip nur falls hilfreich. Nie während langer Texteingabe plötzliche große Sprünge. Auf kleinen Screens ab und an nur die Augen/maske zeigen (aber nicht ein zweites Wesen).

### 6. Technische Architektur – sauber wiederverwendbar

Projekt ist heute eine buildlose HTML/CSS/JavaScript-App, ohne Framework/Backend. Möglicher Vorschlag:
- eigene deklarative SVG-/CSS-/JS-Komponente, z. B. zentrale „creature“-Module mit **einem** Besitzer im DOM und klaren visuellen Zuständen, nicht je Lab einen eigenen Renderer;
- Ereignisadapter vom bestehenden Lab-UI (Tab-/Unteransichtwechsel, Details öffnen, Start/Pause, Übernahme, Gleichgewicht, Reset). Reagiere auf sichtbare UI-Zustände, **niemals** durch Manipulation der Physikdaten/Integrator-/RNG-Funktionen;
- Prioritätslogik, ein Abort/Cleanup-Pfad und kleine Zustandsmaschine (idle → peek → react → retreat). Nach Viewwechsel/Hidden/Offscreen alle geplanten Effekte abbrechen; kein Timer-Leak.
- Bei Bedarf nur eine rAF-Schleife, und nur solange im sichtbaren, erlaubten Zustand animiert wird. Bevorzuge deklarative CSS-Transitions/Transform-Animationen für Mini-Aktionen; keine tausende DOM-Knoten, keine schwergewichtigen GIF-Assets mit redundanten Kopien.
- Dekorativ mit aria-hidden und pointer-events:none. Enthält das Monster eine **echte Lern-Aktion**, so ist diese zusätzlich als regulär fokussierbarer beschrifteter Button/Link unabhängig vom Wesen vorhanden. Erklärungen dürfen nicht allein durch ein Monster-Sprechfeld vermittelt werden.
- DE/EN: Eventtexte, Hilfekarten und ARIA-Beschriftungen übersetzt. Sprachwechsel erhält Simulations- und Guidezustand; keine separat codierte Monster-Übersetzungswelt.
- Explizite Benutzerkontrolle: bevorzugt Einstellung „voll / dezent / aus“ (oder einfache Abschaltoption), zumindest Reduced Motion und „aus“. Einstellung technisch datensparsam/optional; standardmäßig kein zusätzlicher Consent-Dialog. Bei reduzierter Bewegung kann die Figur als **statisches** Icon erscheinen.
- Keine externen Schrift-/Bilddienste für das Wesen, keine Tracking-Pixel, kein Audio ohne aktive Anforderung.

### 7. Die wissenschaftliche Sicherheitsgrenze

**Monster = fiktionale Personifikation.** Es erzeugt keine Entropie, lenkt keine Teilchen, erhöht keine Ereignishorizontmasse und beeinflusst niemals Messwerte. Optische Reaktionen erhalten das zugrunde liegende Experiment exakt. Wird auf ein Ergebnis gezeigt, ist die Zuordnung durch ein Label und/oder echte Erklärung gesichert. Figur darf Spekulation und philosophische Perspektive anbieten, aber muss sie kenntlich von Berechnung und nachgewiesener Physik trennen.

Der optionale stilisierte kosmische Hintergrund verwendet sehr wenige langsam driftende Partikel/Bruchlinien. **Der Hintergrund ist nicht die Entropie eines physikalischen Systems** und darf nicht mit berechneten Teilchen im Experiment verwechselt werden. Wenn in der App Wissenschaftsdiagramme laufen, Hintergrund reduzieren oder deaktivieren.

### 8. Visuelle Tests und Abnahme – vor der großflächigen Integration

**Zuerst drei visuelle Prototypen derselben Stilrichtung A** (z. B. hero / Rand-Peek / kompakt), keine drei völlig unterschiedlichen Charaktere. Optional ein subtiler Transform-Zustand derselben Grafik; keine zusätzlichen Mimik-/Neuzeichnungsanforderungen. Die Vorschauen müssen bei dunklem Hintergrund und auf kleinen Anzeigen funktionieren. Erst nachdem der Nutzer einen Prototyp freigegeben hat, eine breite Integration beginnen.

**Abnahmekriterien – bei Work-Implementierung prüfbar:**
1. Die abgenommenen Varianten erhalten die asymmetrische rote Skizzenidentität des Masters in mindestens zwei Größen; keine Pflicht zu neuen Tiefen-/Panzer-/Fragmentebenen.
2. Bei 10+ schnellen UI-Interaktionen/überlappenden aufklappbaren Erklärungen gleichzeitig **höchstens ein** sichtbares Monster; beim Tabwechsel, ESC und Schließen keine verwaisten Elemente.
3. Nützlich an fast allen relevanten Hauptbereichen; demonstriere mindestens je einen sinnvollen Kontextauftritt in Gravity, BH, Extreme/Temperature, Entropy und Guide/Science, ohne jeden Klick mit einer Animation zu quittieren.
4. Reduced Motion und „aus“ entfernen automatische Bewegungen/Glitches zuverlässig; keine Timer im Hintergrund, keine unnötige CPU-Arbeit.
5. Desktop, 320/390 px, gebrochener Viewport/DPR: kein horizontaler Überlauf, kein Überdecken interaktiver Controls, kein Fokusverlust. Screenshots und echte Chromium-Tests; Handy-Hardwaretests gesondert durch Nutzer.
6. DE/EN und Screenreader: wissenschaftliche Informationen unabhängig vom Monster vollständig zugänglich, keine unübersetzten wichtigen Texte.
7. Snapshot/State-Tests beweisen, dass Laborparameter, Zufallsgenerator/Modelldaten, Vorhersagen, Körper-IDs und numerische Benchmarks nicht vom Creature-Manager verändert werden.
8. Monster und Glitch passen sich dem schlichten Design unter, besitzen aber Wiedererkennungswert: Fokusgruppe nicht von Messwerten wegziehen.
9. Monster kann überall in der UI als dieselbe Entität erscheinen, **aber maximal einmal sichtbar** (Favicon als statisches Browser-Branding ausgenommen).

### 9. Offene Entscheidungen im Gespräch

- endgültiger visueller Prototyp, Gesicht/Augen, Körperglieder, Glitchintensität;
- Projektname **festgelegt: Reincarnated as a Proton**; offen sind Domain-/Markenprüfung, URL-Strategie und eigenständige Bezeichnung des Wesens;
- wie oft ruhige Überraschungsauftritte erwünscht sind;
- vollständige separate Abschaltoption (empfohlen) und etwaige Sichtbarkeit bei sehr schmalem Handybildschirm;
- ob das Monster gelegentlich interaktive Fragen stellt oder sich zunächst nur als dezenter Beobachter zeigt;
- welche wenigen UI-Elemente beim allerersten Besuch die beste Demonstration ergeben.

**Status (09.11.2026):** Master unverändert, drei abgeleitete WebP-Kandidaten und separate Vergleichsvorschau vorhanden. [Manifest](assets/creature-candidates.json), [Screenshot](assets/comparison-candidates.png), lokale Seite `dist/asset-review.html`. Ausdrückliche Sichtfreigabe steht aus; keine breite Integration, kein neuer Creature-Manager oder Monster-RAF. Phase E folgt ausschließlich nach dieser Freigabe. Keine Änderung an main, Domain oder Produktion.
