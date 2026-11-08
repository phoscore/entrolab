# ENTROLAB v0.6 — Emptiness Pro Max / erstes Entropy Lab

**Status:** genehmigter Plan, Implementierung noch ausstehend. Basis: `main` v0.5, Commit `39fde20f812da1d371b4990b15062062cddd102f` (PR #4 gemergt, GitHub-CI grün). Entwicklungsbranch: `develop/v0.6`. Einzige öffentliche Produktionsseite: `https://entrolab.pages.dev`, Cloudflare Pages automatisch von `main`. **Nie selbst nach `main` mergen oder veröffentlichen; PR + unabhängiger Codex-Review + ausdrückliche Nutzergenehmigung nötig.** Archive/Original v0.1 unangetastet; Repository privat.

## Produktidee

Entropie erhält in ENTROLAB einen **substanziellen eigenen Experimentierbereich**, ohne die bisherigen Labs zu verdrängen. v0.6 ist ein **wissenschaftlich ehrlicher, interaktiver Einstieg**; die breitere Entropie-Thermodynamik (Wärmefluss/Bilanzen, SL-Entropie) und der größere Cosmic Field Guide sind bewusst für v0.7+ reserviert. Die Darstellung ist >90 % überprüfbare Wissenschaft, <10 % klar abgrenzbarer künstlerischer/nihilistischer Humor. „Entropie = Chaos = Sinnlosigkeit“ **nicht** als wissenschaftliche Behauptung verkaufen.

**Vor Umsetzung lesen:** `AGENTS.md`, `README.md`, `docs/Plan_v0.5.md`, `docs/Qualitaetsupdate_v0.5.md`, `docs/CodexReview_v0.5.md`, relevanten Code `dist/`, `scripts/`, `tests/` und CI-Konfiguration. Zuerst Baseline der 108 Node-/Rechentests, sieben realen Chromium-Browserfälle, 12 numerischen Benchmarks und Originalintegrität nachweisen. Aktualisiere veraltete v0.5-spezifische Agenten-Scope-Hinweise **nur auf dem neuen Branch**, ohne Sicherheitsregeln zu lockern.

## A. Sofortige v0.5-UX-Beobachtung: Rechentests-Button (MUSS)

Unter Modell & Quellen / „03 — Darstellung & Kontrolle“ gibt es `#runTests` / `#testResults`. In `dist/app.mjs` hängt `runChecks()` korrekt an `onclick`; `checks()` aus `dist/checks.mjs` erzeugt aktuell dieselben zehn deterministischen Resultate, die schon beim ersten Laden angezeigt werden. Der Button **wirkt** dadurch funktionslos, obwohl erneut gerechnet wird.

- Klarer Status bei jeder tatsächlichen Ausführung: „Prüfung abgeschlossen – 10/10 bestanden“ / bei Fehlern aussagekräftiger Fehlstatus; Zeit der letzten Prüfung oder monotoner Ausführungszähler, mit verständlichem DE/EN-Label (nicht nur eine unveränderte Liste). Zeige, falls synchron extrem schnell, **nicht** fingiertes langes Laden, künstliche Verzögerung oder erfundenen Fortschritt. Optional Button während tatsächlicher Rechnung sperren / native Statusregion `role=status`, Screenreader berücksichtigen.
- Erkläre deutlich: Das sind zehn **gezielte modellinterne Selbstchecks**, keine vollständige Verifikation aller Physikformeln, keine Ausführung der gesamten GitHub-Testsuite im Browser, keine Überprüfung von Serverhardware; sie können bei reproduzierten Bedingungen wieder dieselben Ergebnisse liefern. Kein physikalischer Simulationszustand, Körper-ID, Trajektorien oder laufende Vorhersagen dürfen durch Buttonklick mutieren (prüfen! `checks()` erzeugt Körper in `physics.mjs`, deren globale ID-Zähler Nebenwirkungen haben könnten; falls nötig isolieren/entkoppeln, ohne Integrator zu verändern).
- Regressionen für echte erneute Ausführung (kein bloßes Text-Feedback), Zähler/Zeitstempel, DE/EN, Screenreaderstatus, mögliche Fehlerfälle und Simulationszustand.

## B. Name und winziges nihilistisch lächelndes SL-Favicon (MUSS)

- Browser-Tab-Titel in **exakt klein geschriebener** Form: `entrolab - emptiness pro max` (vom Nutzer gewählte absurde, nihilistische Namensvariante; in DE/EN gleich, kein unnötiges Übersetzen). HTML `<title>`, ggf. I18n-Eintrag, Website-Metadaten konsistent, Browser-Tab selbst tatsächlich prüfen. Logo/Produktmarke innerhalb der App darf ENTROLAB groß geschrieben bleiben, wenn das Design es erfordert.
- Eigenes, original gestaltetes, kleines Favicon: ein **minimalistisches schwarzes Loch (SL)** mit dunklem Zentrum, subtiler Kontrastkante oder Akkretionsring und einem **einfachen grinsenden/nihilistischen `:`-`)`-Gesicht**. Sachlich: künstlerisches Logo, kein Bild eines realistisch strahlenden Ereignishorizonts. Bei 16×16 und 32×32 erkennbar, kein zu komplexes Artwork, klare Kontur auf dunklen/hellen Browser-Tabs. Bevorzugt `dist/favicon.svg` als leicht wartbare Vektordatei, Browserlink in `index.html`; optional PNG/ICO nur wenn sinnvoll und reproduzierbar. Keine fremden Logos/Bilder oder Font-Dateien. Screenshots/Ansichtsnachweis der Miniaturgrößen, keine blind behauptete Lesbarkeit.
- Footer-Spruch „Kein Zauber. Leider. Nur ziemlich seltsame Physik. ✧“ bleibt grundsätzlich erhalten.

## C. Erstes interaktives Entropy Lab als eigenständiger neuer App-Bereich (MUSS)

Einzug in bestehende Navigation / bestehendes vierfaches Tab-System; mobile Navigation darf dadurch nicht abgeschnitten werden. Alle bisherigen vier Bereiche vollständig funktionsfähig. Kein Backend, kein Login, kein neuer Hosting-Dienst.

**Experiment 1 – Zwei-Kammer-Verteilung / Binomialwahrscheinlichkeit (KERN):**
- Visualisiere eine begrenzte, verständliche Anzahl von **unterscheidbaren**, auf zwei gleich große Kammern verteilten Teilchen/Markern (z. B. Default N=12, anpassbar in begrenztem sinnvollen Bereich). Startzustand „alle links“, Benutzer kann manuell die linke Zahl k wählen, einen zufälligen Schritt ausführen, schrittweise/automatisch mischen, pausieren und zurücksetzen. Die visuelle Animation ist **ein diskretes stochastisches Lehrmodell, kein Teilchenstoß-, Gas-, Diffusionskoeffizient- oder Molekulardynamikmodell**. Ein klar erklärter Algorithmus mit symmetrischen unabhängigen Kammerwechseln statt erfundener echter Transportphysik.
- N Teilchen haben in diesem **spezifizierten** Modell `2^N` gleich wahrscheinliche, individuelle Links/Rechts-Zuordnungen. Makrozustand k hat `Ω(k)=C(N,k)` Mikrozustände und `P(k)=C(N,k)/2^N`, bei fairen und unabhängigen Zuordnungen. Erkläre, dass die wahrscheinlichste einzelne Makroverteilung nicht mit Wahrscheinlichkeit 100 % auftreten muss; **kein Thermodynamik-Beweis** nur wegen einer Animation.
- Optionale, hilfreiche Visualisierung einer Wahrscheinlichkeitskurve mit dem aktuellen k und gut lesbaren, lokalisierten Zahlen und optional vereinfachtem `S/k_B=ln Ω(k)` – ausdrücklich **dimensionslose Spielzeug-Modellentropie, keine gemessene Entropie eines Gases**. Bei veränderlichem N werden Größen konsistent berechnet, nicht naiv per unsicherer Fakultäten/Infinity. Benutze geeignete ganzzahlige Kombinatorik für kleine N oder stabile Logarithmen/rekursive Verhältnisse; überprüfe Symmetrie, Normierung und Extremfälle.
- Entropie darf in einzelnen Zufallsschritten sinken; das macht den makroskopischen Trend nicht falsch. Deutlich zwischen **einzelner stochastischer Trajektorie** und **typischem Verhalten von vielen unabhängigen Teilchen** unterscheiden. Keine deterministische Anzeige „Entropie steigt immer“.
- Interaktion: reversible Neuauswahl und sichtbares Live-Ergebnis, Hilfe für k, Ω und Mikrozustände; Start/Pause und Zeitschritt verlässlich, bei verstecktem Tab/ausserhalb Viewport nicht unnötig rechnen, `prefers-reduced-motion` respektieren. Nach Tabwechsel anderer Lab-Bereich unverändert.

**Erklärung in zwei Ebenen:** Kurz und gut verständlich: „Warum ist eine gleichmäßige Verteilung so häufig?“ mit praktischen Beispielen (Münzwurf/links-rechts) und kurzen humorvollen, deutlich nichtwissenschaftlichen Kommentaren. Extra `<details>`-Bereich **Advanced** mit exakter Annahmenliste, `Ω=C(N,k)`, `P=Ω/2^N`, `S=k_B ln Ω` bei festgelegtem vereinfachtem Modell, Hinweis zu gravitativer Entropie, lokalen Fluktuationen und thermodynamischer Einordnung. Keine naturwissenschaftliche und nihilistische Interpretation vermischen.

**UI-Gestaltung:** Sichtbare, große Hauptwerte und Kamera/Teilchenanimation, aufklappbare Begriffshilfen, kompakt statt ausufernder Enzyklopädie, eigener stilvoller „Kosmisches Labor“-Look passend zu v0.5, keine übermäßigen Effekte, maximal ein/zwei dekorative Highlights. Gute Handybedienung. Ggf. ein einfaches statisches schematisches Diagramm als Lernhilfe, aber keine irreführende exakte realistische Molekülgrafik.

## D. Kontextsensitive Erklärungen und „Cosmic Field Guide – Vorschau“ (MUSS in kleinem Umfang)

- Bereits vorhandene Glossary/ⓘ-Hilfen aus v0.5 wiederverwenden statt paralleles Hilfesystem zu erzeugen. Ein kleines übersetztes, direkt erreichbares **„Was bedeutet das?“** für wichtige bestehende Felder in Sandbox, BH Lab, Extreme Objects und neuem Entropy Lab.
- Priorität für wenige hochwertige Themen: Universum, Gravitation, AU, Schwarzes Loch (SL), Ereignishorizont/Schwarzschild-Radius, Hawking-Temperatur, Weißer Zwerg, Neutronenstern/Pulsar, Entropie/Mikro- vs Makrozustand und statistische Fluktuationen. **Kurzform + optional separat aufklappbare Advanced-Infos** mit Formel/Annahmen, wo passend. Wenige korrekte Aussagen besser als ein unfertiger gigantischer Lexikonkatalog. Links zwischen angezeigten Messwerten und Erklärung, Rückweg ohne Zustandsverlust.
- Scientific Accuracy: Quellentexte oder Links auf etablierte Institutionen/Lehrbücher/Primärliteratur, speziell für Boltzmann-Entropie und vereinfachte statistische Modelle. Quellenzuordnung zu Aussagen; nicht behaupten, dass unsere Lehrmodelle realistische thermodynamische Zeitentwicklung simulieren.
- Ton: gelegentlich leicht frecher, nihilistischer Witz separat markiert, **niemals persönlich beleidigend, kein falsches „alles sinnlos, weil Entropie“, kein Angst-/Doom-Push**. Der spielerisch „böse“ Aspekt darf zum Nachdenken provozieren, nicht das wissenschaftliche Ergebnis ersetzen.
- Einen vollwertigen allgemeinbildenden Cosmic Field Guide mit detaillierter Kosmologie, Wärmetod und SL-Informationsparadoxon **noch nicht** in v0.6 implementieren – als spätere Ausbaustufe dokumentieren.

## E. Nicht in v0.6 (v0.7+)

- Quantitative Wärmeübertragung mit expliziten Energie- und Entropiebilanzen, Wärmeleitungs-/Temperaturmodelle und realistische Einheitenkalibrierung.
- Interaktives Labor zur Bekenstein-Hawking-Entropie und Flächenformel; nicht mit abstrakter Zwei-Kammer-Entropie zusammenwerfen.
- Entwicklung/Expansion des Universums, Wärmetod-Szenarien und substantielle kosmologische Einordnung mit Unsicherheiten.
- Größerer interaktiver Cosmic Field Guide mit Kapitelstruktur, Forschungsstand, Formeln und Visualisierungen.

## Schutz, Qualität und Freigabe

1. Bestehende 108/108 reguläre Prüfungen plus sieben echte Chromium-Regressionen unverändert erhalten; neue Prüfungen **hinzufügen**, keine alten löschen oder schwächen. Zwölf komplette numerische Benchmarks **exakt unverändert** (bestehende Referenzen nie umschreiben). Bewahrung aller v0.1-Dateien, SHA-Checks, Git-Historie und Tests.
2. Wissenschaftliches Entropy-Modell mit separaten **deterministischen Testfunktionen**: `Σ_{k=0}^{N} C(N,k)=2^N`, `P(k)=P(N-k)`, Normierung, Grenzen N=1/2/12, hohe aber begrenzte N und reproduzierbare stochastische Schritte mit injizierbarer Zufallsquelle / Seed, keine NaN/Overflow.
3. Browser-End-to-End: Desktop, 320/390 px mobile und gebrochene CSS-Breiten/DPR (regressionssicheres Canvas), Sprache beim Lauf wechseln, ungespeicherte Eingaben erhalten, Navigation und Fokus, Keyboard, Reduced Motion, Tab/Offscreen-Lifecycle; checkButton gibt echte neue Ausgabe statt nur visuelle Wiederholung. Screenshots / visuelles Feedback bei Gelegenheit; physischer Touchscreen-Test durch den Nutzer ist willkommen und wird nicht als von uns durchgeführt behauptet.
4. Performance und Accessibility: keine laufenden versteckten Timer, keine unnötig hohen Partikelzahlen, kontrastreiche UI, reduzierte Animation, `aria-live` für Prüfergebnisse, Bedienelemente erreichbar, kein horizontales Abschneiden. Keine falschen FPS-Angaben.
5. Alle neuen UI-Texte vollständig DE/EN; Sprachwechsel ohne Zurücksetzen der Simulation, Entropy-Einstellungen oder Berechnungen; Locale bei Anzeigen, eindeutige Eingaben (Dezimalpunkt-Regel). Titel bleibt absichtlich in beiden Sprachen identisch.
6. Dokumentiere `docs/Qualitaetsupdate_v0.6.md`: Implementierung, Modellannahmen, Wissenschaftsgrenzen, Benchmark-Diff, Ausführung neuer Checks, echte Browsertests, Testlücken und bekannte Limitierungen. README/AGENTS branchlokal aktualisieren.
7. In sinnvollen Commits nur auf `develop/v0.6` arbeiten, PR nach `main` für Codex-Unabhängigkeitsreview öffnen und auf grüne CI warten. **Kein Merge, kein öffentliches Deploy, kein neuer Cloudflare-Pages-Standort, keine Repository-Sichtbarkeitsänderung.**
