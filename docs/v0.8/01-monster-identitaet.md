# Schritt 01 – Das Entropie-Wesen: Entropy Wraith / Void Beast
## Ausführliche Design- und Implementierungsspezifikation – ENTWURF

**Produktkontext:** v0.8 / v0.8.5, siehe [Roadmap](README.md). **Stilrichtung A + Glitch bereits ausdrücklich gewünscht.** Anatomie, Namen, finale Grafik und genaue Auftrittsfrequenz bleiben für gemeinsame Sichtung offen. Noch **keine Freigabe für Work-Implementierung**. **Gewählter Website-/Produktname ist „Reincarnated as a Proton“ (Nutzerentscheidung am 09.11.2026)**; die Domain-/Markenprüfung und Umstellung stehen aus. „Entropy Wraith“ und „Void Beast“ sind weiterhin nur **Arbeitstitel für die Figur**, nicht für die Website.

### Verbindliche Quellen-Hierarchie für v0.8 / v0.8.5 – 09.11.2026

**Unmissverständlich:** Der **neuere, konkret ausgewählte minimalistische rot-schwarze A3/Glitched-Entity-Bildentwurf** und dessen sichtbare Merkmale in diesem Dokument haben **Vorrang** vor dem älteren generischen Stil-A-Text im Folgenden. Die nachstehenden **violetten/türkisen Farbwerte und komplexen 2.5D-Anatomiedetails sind ausschließlich historische Konzeptreste und ausdrücklich NICHT die Produktionsvorgabe**. Sie sollen beim Bauen nicht ohne Freigabe wieder auftauchen. **Aktuelle Sollpalette:** fast Schwarz + kräftige schmale rote Brush-/Glitch-Striche + wenig Weiß für Augen/Grinsen, keine Pflicht zu violettem Glow oder Türkis-Metallpanzer. Siehe [Schritt 08 – finale Designarchitektur](08-design-system-und-finaler-feinschliff.md).

**Asset-Gate:** Die ausgewählte visuelle Chatbildreferenz ist noch kein eingechecktes Produktionsasset. Vor Umsetzung der Figur die tatsächliche Bilddatei oder eine daraus abgeleitete **visuell freigegebene** schlanke SVG-/Vektorversion bereitstellen. Keine freie Neugestaltung durch Work allein aus alten Farbwörtern. **Produktname** „Reincarnated as a Proton“ ist entschieden; **eigener Monstername** ist weiterhin offen und nicht erforderlich, um die Grafik vorzubereiten. Jede Arbeit erst nach separater Work-Freigabe.

### Visuelle Auswahl vom Nutzer – 09.11.2026

**Gewählter Designentwurf:** stark vereinfachte, skizzenhafte **A3 / Glitched Entity** (vorherige aufwendige violette A3-Variante ausdrücklich als zu detailliert verworfen). Das ausgewählte Bild wurde im gemeinsamen Chat generiert; die Pixel-/Assetdatei ist derzeit **noch nicht als GitHub-Binary eingecheckt**. Work soll vor Implementierung die freigegebene Bildreferenz ausdrücklich erhalten oder eine passende reproduzierbare SVG-/Vektorfassung nach sichtbarer Freigabe herstellen, nicht eine beliebige neue Kreatur erfinden.

**Bindende visuelle Merkmale:** nahezu rein schwarzer Hintergrund; kräftige, sparsame **rote Skizzen-/Brush-Striche** als Körperkontur, wenige hellweiße Augenschlitze und schiefes Grinsen. Deutlich asymmetrische, gehörnte/fragmentierte Maskensilhouette mit hohlem Kreis im Stirnbereich, grober gebrochener Ring um den Kopf; dunkler leichter Oberkörper mit einer ringförmigen Leerstelle in der Brust, zwei vereinfachte kantige Greifhände, abstrakter nach unten auslaufender Schweif. Nur vereinzelte eckige Glitch-Striche an der Maske, keine komplizierte 3D-Rüstung, keine Fototexturen, kein violett-türkiser Effektnebel, kein bildfüllendes Poster und keine filigranen 200 Einzelteile. Der ausgewählte Entwurf ist **noch kein finaler produktionsfertiger UI-Asset**: auf 32–64 px muss er gezielt vereinfacht und mit reduziertem Bewegungsaufwand sinnvoll erkennbar gemacht werden. Keine Gameplay-/Physikdaten überlagern.

**Namensstand:** Der Eigentümer hat **„Reincarnated as a Proton“** als zukünftigen Website-/Produktnamen ausdrücklich festgelegt. `entrivial-lab` war ausschließlich provisorischer Text auf früheren Entwürfen und ist verworfen. **Noch keine Umbenennung der bestehenden Domain, GitHub-Repo, öffentlichen UI oder Metadaten:** erst Domain-/Marken- und Migrationsentscheidung. Der Name der Monsterfigur selbst ist unabhängig davon noch offen.

### 1. Identität und Aufgabe

Das Wesen ist **das lebendige Markenzeichen** der ganzen Wissenschaftswebsite. Es soll gleichzeitig:
- visuell einen eigenständigen Wiedererkennungswert schaffen;
- Besuchern durch kleine Überraschungen und Blickführung helfen, neugierig zu bleiben;
- ohne belehrende Popup-Flut an passende Erklärungen und nächste Experimente erinnern;
- mit leicht boshaftem, nihilistisch-sarkastischem Humor eine konstante Persönlichkeit aufbauen;
- in gravitativen, thermischen, statistischen und astronomischen Laboren in verschiedenen Gesten auftreten, **ohne die Physik selbst zu manipulieren oder falsche Aussagen zu vermitteln**.

**Leitsatz:** „Kosmischer Beobachter mit eigenem Charakter, nicht schwarzer Kreis mit Smiley.“ Das alte SL-Smile-Favicon darf als historische Vorversion erhalten bleiben, soll aber nicht die neue volle Kreatur definieren. Keine Vermarktung der erfundenen Figur als wissenschaftlich beobachtbares Phänomen.

### 2. Stil A: asymmetrische, greifbare Silhouette mit räumlicher Wirkung

**Grundkörper / Haltung (Hero-Version, ca. 180–320 px):**
- Silhouette eines frei schwebenden, nicht eindeutig humanoiden Wesens. Deutlich **länger als breit**, organisch-geometrisch asymmetrisch, leicht nach vorn gebeugt wie beim Beobachten.
- Dunkler, tiefer Kern/Brustkorb mit 3–5 versetzten, unvollständigen Rippen-/Panzersegmenten; keine glatte Kugel.
- Zwei unterschiedlich auslaufende seitliche Arm-/Greifformen; eine lang und neugierig, die andere fragmentiert und fast unsichtbar. Keine klassischen Cartoon-Hände; eher abgebrochene Fingerglieder/gespannte Partikelstreifen.
- Oberteil/Kopf als schräger maskenartiger Keil mit **zwei ungleich großen, leuchtenden Augen** oder zeitweise nur einem sichtbaren Spalt; ein **schmales rissiges Grinsen** ist ikonisches Detail. Mimik situativ verändern, nicht dauerhaft überzeichnen.
- Oben/seitlich 2–4 gebrochene Halo-/Ring-/Hornfragmente; keine echte Krone, kein klassischer Helm. Unterkörper läuft in schwebende Schleier, rissige Flächen, dünne Linien und eine kleine Partikelspur aus; keine notwendigen Beine.
- Mindestens **drei Tiefenlagen** (vor/hinter dem Kern schwebende Fragmente, innere Kanten-/Schattierung, äußere gedämpfte Aura): grafisch 2.5D-Charakter statt flacher Icon-Scheibe. Dies kann mit Vektorformen, Masken, leichter Parallaxe und Schatten realisiert werden; **keine Pflicht zu echter 3D-Engine**.
- Erkennbar als EINE einheitliche Figur auch ohne Glow oder Partikeleffekt. Die Silhouette muss ohne Farbe in einem kleinen Graustufen-Test eindeutig lesbar bleiben.

**Nicht gewünscht:** Chibi, klassisches niedliches Haustier, glatter 2D-Kreis, Emojis statt Design, generischer Dämon mit Hörnern/Flügeln, zu filigrane Fantasy-Illustration, unzählige Tentakel, roter Horrorblut-Look, fotorealistische Monsterhaut, schwere 3D-Rendering-Pipeline.

**Skalierung:** (a) kompakter Kopf/Fragment-Ausschnitt ca. 30–48 px, (b) halber Körper ca. 80–150 px, (c) vollständige Silhouette ca. 180–320 px. Diese sind **Darstellungszustände derselben Kreatur** und dürfen **niemals zeitgleich als mehrere sichtbare Monster** verwendet werden. Ein reduziertes Symbol soll trotz Größe noch nach dem großen Wesen aussehen; dabei können filigrane Partikel wegfallen. Das Favicon zählt als statisches Browser-Chrome-Branding, nicht als zweite In-Page-Figur.

### 3. Palette, Formen und „Glitch“-Charakter

**Primärfarben (Vorschlagswerte, nach visueller Abnahme anpassbar):**
- Kern: fast schwarz / Tintenblau (#0B0C17), tiefes Indigo (#21172F).
- Kontur/Kanten: mattes Violett (#9676C6), wenige hellere Akzente (#C3A5F2).
- Augen / Information: gedämpftes Türkis (#77DCD0).
- Seltene Temperatur-/Energie-Reaktion: gedämpftes warmes Amber (#E7A96B), nicht immer gleichzeitig mit allen anderen Akzentfarben.

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

**Zuerst drei visuelle Prototypen derselben Stilrichtung A** (z. B. hero / Rand-Peek / kompakt), keine drei völlig unterschiedlichen Charaktere. Dazu 2–3 Mimikzustände und ein sehr subtiler Glitch-Moment. Die Vorschauen müssen bei dunklem Hintergrund und auf kleinen Anzeigen funktionieren. Erst nachdem der Nutzer einen Prototyp freigegeben hat, eine breite Integration beginnen.

**Abnahmekriterien – bei Work-Implementierung prüfbar:**
1. Der Körper hat an mindestens zwei Größen eine deutlich organisch-asymmetrische Silhouette und mehrere Tiefen-/Panzer-/Fragmentebenen; **nicht** nur eine 2D-Kugel mit Gesicht.
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

**Bis diese Entscheidungen gemeinsam festgelegt und freigegeben sind: keine spontane Implementierung durch Work, kein neuer visueller Asset-Generator, keine Änderungen an main.**
