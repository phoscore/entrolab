# ENTROLAB v0.5 – Lesbarkeit, Orientierung, Internationalisierung und visuelles Upgrade

**Status:** von der Projektleitung beauftragte Planung, noch keine Implementierung. Ausgangspunkt: freigegebenes v0.4 auf `main`, Commit `5a13686fa16213d811e7ba73f37d94638f5a219a`, 79 bestandene Prüfungen, Website `https://entrolab.pages.dev` (öffentliche Production aus `main`). Entwicklung ausschließlich auf `develop/v0.5`. **Kein Merge, kein Deployment, keine Änderungen an `main`, `archive/v0.1` oder älteren Entwicklungsbranches ohne gesonderte Freigabe.** Cloudflare publiziert `main` automatisch; deshalb niemals vor Freigabe in `main` schreiben.

## Leitbild

v0.5 ist bewusst ein etwas größeres **UX-/Visual-Release**, kein neues Physik-Release. Ziel: ENTROLAB ist angenehm zu lesen, zu verstehen und vorzuführen – ohne den wissenschaftlichen Anspruch zu verlieren. **Wichtigste Informationen sichtbar, Hintergründe bei Bedarf aufklappbar.** Wenige, klare Zustände, keine Menüexplosion. Bei optischen Effekten explizit „illustrativ“; keine vorgetäuschte GR-, Strahlungs-, magnetohydrodynamische oder Oberflächenphysik. „Magie“ nur als ästhetischer Stil, nicht als neue Naturgesetze.

## Prioritäten und Arbeitspakete

### 1. Typografie, Hierarchie und Kontrast (MUSS)

- Bestehendes CSS/HTML und repräsentative Browseransichten analysieren (Desktop 1360–1600 CSS-Pixel, Laptop ~1024, 390 CSS-Pixel). Derzeit `body` 14px, einige `summary` 12px. Zentrale Bedienfelder, echte Messergebnisse, Körpernamen, Tabellen und Buttons deutlich leichter lesbar machen.
- Zielwerte als Ausgangspunkt: normaler UI-Text **16–17px**, wesentliche Labels **14–16px**, wichtige Zahlen **20–26px**, sekundäre Warn-/Quellentexte können kleiner bleiben (aber bei erforderlicher Interaktion ausreichend groß/lesbar). Responsive `clamp()`/Tokens einsetzen statt überall pauschal Größen anheben. Keine horizontalen Überläufe, abgeschnittenen Einheiten, winzigen Klickflächen oder erzwungenen Browser-Zoom.
- Gute Hell-Dunkel-Kontraste einschließlich muted labels und Eingabegrenzen, deutlich erkennbare Fokuszustände, möglichst robuste 200%-Zoom-/Keyboard-Bedienung. Datenzeilen mit Einheiten; Zahlen bei Extremwerten umbrechen oder wissenschaftlich sinnvoll formatieren.

### 2. Leichte Entrümpelung & kontextuelle Wissenschaft (MUSS)

- Oberfläche nicht pauschal verstecken: **Erstansicht zeigt die für das gewählte Experiment relevanten Werte, Start/Pause, Szenario, Zeit und wichtige Steuerung.** Infrequentierte technische Optionen, Quellen, Modellgrenzen und lange Formelerklärungen als zugängliche `<details>/<summary>`, kleine Info-Popovers/Buttons oder klar benannte „Mehr Details“-Panels bereitstellen.
- Warnungen, die zu falscher Interpretation oder riskant ungültigen Eingaben führen, müssen **sichtbar bleiben**; nie wichtige Sicherheits-/Modellinformationen hinter versteckten Menüs vergraben. Bezeichnung „illustrativ, keine exakte GR-Simulation“ im Extreme Objects Lab weiterhin sofort erkennbar.
- Progressive Disclosure für Gravity Sandbox, Inspector/Messwerte, BH Lab und Extreme Objects, möglichst einheitliche Interaktionsmuster; bei wenigen Kerninfos nicht zwanghaft aufklappen.
- Kurze erklärende Mikrotexte und kontextsensitive `ⓘ`-Hilfen für Begriffe wie AU, Schwarzschild-Radius, ISCO, Hawking-Temperatur, Energieerhaltung. Kein übermäßiger Fachjargon.
- Kleine, **freiwillige** Erste-Schritte-Hilfe („Szenario wählen → Start → Körper auswählen“, sowie Extreme Objects) – wieder öffnbar und jederzeit schließbar, **keine blockierende Onboarding-Pflicht**.
- Sinnvoller Fokus-/Kinomodus für die Hauptvisualisierung: vergrößert die Animation/Simulation, reduziert seitliche Panels und behält essenzielle Navigation und Exit-Kontrolle. `Esc`, Tastatur und reduzierte Bewegung berücksichtigen. **Nur UI-Panels ändern, niemals den physikalischen Zustand oder Parameter.** Wenn Implementierung unverhältnismäßig/fragil ist, einfache Lösung ohne Fullscreen-Abhängigkeit bevorzugen.

### 3. Vollständige deutsche/englische Oberfläche (MUSS)

- Ein sichtbarer **DE / EN**-Schalter, der im laufenden Betrieb umschaltet, ohne die Simulation zurückzusetzen oder Tempo/Zeit/Selektion/Trails zu verändern. Browser-Sprache als Startvorschlag; manuelle Wahl in lokalem Browser-Speicher merken (Storage-Fehler abfangen).
- Einheitlicher, wartbarer Übersetzungskatalog (beispielsweise `dist/i18n.mjs` mit DE-/EN-Key-Parität, textbasiert, keine neue Abhängigkeit nötig), verständliche Funktionsgrenzen: statischer HTML-Text, Attributtexte (`title`, `placeholder`, `aria-label`, `alt`), dynamische JavaScript-Meldungen, Fehler, Szenariobeschreibungen, Inspektorbezeichner und **Canvas-Text/Legenden**. Auch Infohilfen, Fußzeile, Menüs, Tooltip und Modelldokumentationsbereiche berücksichtigen.
- Einheiten und mathematische Symbole stabil halten; Formatierung darf die Zahlenwerte nicht ändern. Zahlendarstellung in DE/EN locale-sensibel, aber **Eingabeverhalten** eindeutig und nicht versehentlich 1.5 als 15 interpretieren. In beiden Sprachen klare Regeln für Dezimalpunkt-/Kommaeingaben; keine Änderungen an der numerischen Simulation.
- `document.documentElement.lang` mitführen. Keine HTML-Injection über Übersetzungstexte; sichere Text/DOM-APIs bevorzugen. Externe Quellenbezeichnungen müssen nicht künstlich übersetzt werden.
- Übersetzungsprüfungen: Key-Parität, dynamische Warnungen und Elementtexte, Umschalten während laufender Simulation und während offener Details, kein Rest-Deutsch im EN-Modus in Kernbereichen; fehlende Keys auffangen. Beachte, dass vorhandene Szene-/Körpernamen ggf. nutzerdefinierbar sind und nicht ohne Not umbenannt werden dürfen.
- Sprache darf nicht nur die Startseite übersetzen, sondern **die gesamte benutzbare Anwendung**, einschließlich Schwarz-Loch-Labor, Gravity Sandbox, Extreme Objects und Randfehlern. Falls die komplette Parität beim verfügbaren Umfang nicht erreichbar ist, **nicht** halb fertig als „bilingual“ deklarieren.

### 4. Weißen Zwerg und Neutronenstern visuell aufwerten (MUSS)

- Bestehender Renderer in `dist/extreme-render.mjs` zeichnet aktuell nur relativ einfache Sternkugeln mit Linien. Biete sichtbar hochwertigere, differenzierte 2D-Canvas-Illustrationen; prozedural, ohne urheberrechtlich unklare externe Medien.
- **Weißer Zwerg:** ruhiger, intensiver aber kontrollierter Sternenglanz, subtil geschichtete Leuchthülle, schattierte Kugel/Gliedabdunklung und dezente Oberflächenstruktur. Keine starke frei erfundene Eruption als „typischer“ physikalischer Prozess ausgeben.
- **Neutronenstern:** eindrucksvoll kompakte, schattierte Kugel mit kontrollierten Licht-/Magnetfeld-Andeutungen. Optional eigener, klar beschrifteter **„Pulsar-Beispiel“**-Schalter mit rotierenden schematischen Strahlungskegeln und optischer Periodenanimation; **nicht jeder Neutronenstern ist ein Pulsar** und Kegel/Strahlungsintensität sind keine berechnete Emissionsphysik.
- Kleine Sternfeld-/Parallaxen- oder Tiefeneffekte bei aktiver Ansicht erlauben, aber nur wenn messbar flüssig. Ein ausgewogenes Bilddesign ist wichtiger als viele Partikel; keine Epilepsieauslösenden Blitz-/Stroboskopeffekte, Motion-Reduction unbedingt berücksichtigen.
- Schwarzes-Loch-Artwork bleibt hochwertig und im Grundsatz unverändert; ggf. gezielt Kontrast, Tiefeneindruck und flüssige Übergänge bei Objektwahl verbessern. Geometrische Radien und Maße dürfen visuell nicht an frei erfundene Artwork-Ringe gekoppelt werden.
- Alle optischen Effekte als künstlerische Darstellung kenntlich, die tatsächlichen wissenschaftlichen Massen-/Radiuswerte wie in v0.4 präzise und unabhängig vom Artwork anzeigen.

### 5. Sinnvolle kleine Komfortfunktionen (SOLL, wenn ohne größere Regression)

- **Bequemeres Größen-/Ansichtsmanagement**: z. B. „Ansicht zurücksetzen / Objekt zentrieren“ und ein nachvollziehbarer Fokusmodus. Keine Parameter-Reset-Falle.
- **Werte mit Copy-to-Clipboard** für häufig gewünschte Messwerte / Daten oder eine optionale Bild-Exportfunktion für das eigene Canvas. Nur wenn Browser-Unterstützung, Dateiname, Kennzeichnung „illustrativ“ und korrekte Messwerte/Erklärungen technisch sauber erreichbar sind. **Kein Zwang, beide einzubauen.**
- Ein kleiner wiederverwendbarer Erklärungskatalog mit kurzen Definitionen für Kernbegriffe statt lange Wiederholungen an mehreren Stellen.
- Dezente, flüssige Tab-/Panelübergänge und Feedback auf UI-Interaktion. Keine unnötigen künstlichen Ladeanimationen oder zusätzliche Netzwerkanfragen.
- Fußzeilen-Spruch exakt auf Deutsch anpassen: **„Kein Zauber. Leider. Nur ziemlich seltsame Physik. ✧“** (englische Übersetzung sinngemäß „No magic. Sadly. Just some rather strange physics. ✧“).

## Technische und wissenschaftliche Grenzen

- Die vorhandene Engine (`dist/physics.mjs`), Newtonsche Gravitation, Integrator, Kollisionserkennung, Kepler-Referenzen, Hawking-Formeln, Diagnostik, Prognose und v0.4-Schwarzschild-Geometrie **nicht unnötig verändern**. Für reine Darstellungsarbeit gilt: Keine absichtliche Änderung an den numerischen Benchmark-Ergebnissen.
- Bisherige 79 Prüfungen sowie die Originalintegrität erhalten; die zwölf numerischen Benchmarks vor/nach Änderungen **exakt** vergleichen. Falls notwendiger Refactor eine numerische Ausgabe beeinflusst, stoppen und als nicht autorisierten Scope behandeln.
- Architektur möglichst einfache Browser-ES-Module, ohne große Framework-Neueinführung oder Backend/Cloud-Datenbank. Kein Tracking und keine Accounts.
- Performanceziele: Keine versteckten Renderloops, bei Tab-Ausblendung und `prefers-reduced-motion` pausieren, hohe Pixel-Dichte und Partikelzahlen begrenzen. Getrennte Qualitätseinstellungen weiterhin nutzbar. FPS, Draw-Call-Zeit und GPU-Zeit nicht verwechseln.
- Kein zusätzlicher "Sci-Fi-Physikmodus" in v0.5. Wissenschaftlich getragene Information klar von visueller Fiktion unterscheiden.

## Qualitätssicherung und Abnahme

1. Baseline: `node scripts/test.mjs`, `node scripts/benchmark.mjs`, Originalintegritätsprüfung sowie bestehende GitHub CI dokumentieren, danach erneut ausführen.
2. Zusätzliche automatisierte Prüfungen für i18n-Key-Parität, Laufzeit-Sprachwechsel, dynamische Fehlertexte/Labels, Eingaben in DE/EN und Zustandsbewahrung, open/close-Hilfen, UI-Fokusmodus, Animationslebenszyklus, Reduced Motion.
3. Reale Browser-Smoketests für Desktop und 390px-Ansicht, nach Möglichkeit auch **200% Zoom** und Tastatur-Navigation. Der physische Handytest ist laut Nutzer derzeit **keine Merge-Voraussetzung**, darf aber nicht als durchgeführt behauptet werden.
4. Visualisierung sichten und vor/nachher beschreiben – **Screenshots**, soweit technisch möglich, für beide Sternarten und Schwarzloch; das Projekt soll auf einem realen Monitor sichtbar besser wirken, nicht nur andere Parameter haben.
5. Alle wichtigen bestehenden Szenarien (Sonnensystem, Doppelstern, Dreikörper, Schleuder, BH Lab) funktionieren; Vorhersage bleibt nicht-mutierend. Kein Übersetzungs- oder UI-Refactor darf ihren Zustand unerwartet zurücksetzen.
6. Änderungen modular und in sinnvollen Commits auf `develop/v0.5` speichern. `docs/Qualitaetsupdate_v0.5.md` mit Grenzen, Screenshots/Benchmarks, bekannten Problemen und Reproduktionsschritten schreiben.
7. Pull Request **nach `main`** eröffnen, **nicht mergen**; erfolgreiche GitHub-CI abwarten. Erst nach unabhängigem Review und ausdrücklicher Freigabe nach `main` übernehmen. Die einzige gewünschte öffentliche Website ist `https://entrolab.pages.dev`, kein zusätzliches Projekt/Domain/Hosting anlegen.

## Umsetzung in kontrollierten Phasen

1. Typographie/Hierarchie + klappbare Infos + Fokusmodus.
2. Vollständige DE/EN-Architektur und dynamische Übersetzung.
3. Weiße-Zwerg-/Neutronenstern-Visuals und optionale Pulsardarstellung.
4. Ein **kleines** Komfort-Feature, wenn Qualität/Performance nicht gefährdet sind.
5. Browser-, Performance- und Regressionstests; PR zur Freigabe.

Wenn Umfang/Qualität kollidieren: vollständige funktionierende Zweisprachigkeit + Lesbarkeit > versteckbare Infos > überzeugende Sterne > zusätzliche Effekte. Keine behauptete „Fertigstellung“, solange zentrale Bereiche nur teilweise übersetzt sind.

## Vor Entwicklungsbeginn lesen

`docs/Plan_v0.5.md`, `AGENTS.md`, `docs/Plan_v0.4.md`, `docs/Qualitaetsupdate_v0.4.md`, `docs/CodexReview_v0.4.md`, `docs/Review_v0.4.md`, existierende Tests und relevante `dist/`-Module. Ältere v0.4-spezifische Agentenanweisungen **nur branchlokal** für diesen neuen Auftrag aktualisieren; Schutzregeln nicht lockern. Webseite bleibt während der Entwicklung auf v0.4.
