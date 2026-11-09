# Reincarnated as a Proton – gemeinsame Roadmap v0.8 / v0.8.5

**Status: Planungsphase; NICHT zur Implementierung freigegeben.** Erst nach Gespräch und ausdrücklicher Zustimmung zu *jedem* detaillierten Teilplan darf Work mit dem betreffenden Umfang starten. **Vom Eigentümer am 09.11.2026 ausdrücklich gewählter künftiger Website-/Produktname: „Reincarnated as a Proton“.** Die konkrete Domain, URL-Slug, Marken-/Domainverfügbarkeit und technische Umstellung sind noch offen und getrennt abzusichern. Bis zum genehmigten Branding-Release bleiben Repository `phoscore/entrolab`, bestehende Domain, bestehender Website-Titel und `main` unverändert.

**Basis:** Freigegebene v0.7 auf `main`, Merge-Commit `8b856086877ea21579cf7d74190ad08155d70c7f` (PR #6). V0.8-Planung nur auf `develop/v0.8`; kein Merge, keine Änderung an `main`, kein Produktions-Deployment. Behalte `archive/v0.1`, alle Originalprüfsummen, zwölf historische numerische Benchmarks und die abgesicherten v0.7-Tests. Auch bestehende DE/EN-, Accessibility- und Reduced-Motion-Funktionen erhalten. Lies `AGENTS.md` und Qualitätsberichte, bevor entwickelt wird.

## Mission

Aus einem technisch funktionierenden Physik-Spielplatz ein verständliches, einladendes, ungewöhnliches **Lern- und Experimentieruniversum** machen. Jede wesentliche Simulation beantwortet erkennbar:
1. **Was sehe ich?**
2. **Warum passiert das?** (zutreffende Ursachen, keine falschen Analogien)
3. **Woher wissen wir das?** (Modell, Annahmen, Datenlage, wissenschaftliche Quellen)
4. **Was bringt mir dieses Wissen?** (konkrete Alltagstechnik, Naturbeobachtung, Verständnis statt Versprechen)
5. **Was kann ich selbst ändern/prüfen?** (kleine Experimente, Prognose → Vergleich)

**Philosophie:** Nihilistische, leicht böse Perspektive ist Kommentar/Humor, kein aus Thermodynamik abgeleiteter Beweis für objektive Sinnlosigkeit. Wissenschaftliche Darstellung >90 %, experimentell/spielerischer Stil höchstens der klar abgegrenzte Rest. Nicht durch Textmassen, Animationsübermaß oder acht neue Labore überfrachten. Bestehende fünf Hauptbereiche und beide Entropy-Experimente bewahren.

## Freigabeprozess (verbindlich)

1. Jeden der **acht Schritte** in dieser Reihenfolge **gemeinsam besprechen**. Nutzer darf Inhalt/Umfang abändern. Danach separate detaillierte, testbare Anweisung in `docs/v0.8/` festhalten; Status von **Entwurf** auf **inhaltlich freigegeben** erst nach ausdrücklicher Bestätigung. Kein implizites Einverständnis allein durch ein Gespräch oder einen Designvorschlag.
2. **v0.8 = Schritte 1–4**, auf `develop/v0.8`; nach ausdrücklicher Baufreigabe Work schrittweise implementieren lassen (kleine Commits, bei Bedarf mehrere Work-Etappen), CI und unabhängiger Codex-Review. Nutzer testet Branch-/Cloudflare-Vorschau. Nur mit eigener erneuter Mergefreigabe nach `main` übernehmen. Eine Vorschau ist keine zweite öffentliche Hauptseite.
3. **v0.8.5 = Schritte 5–8** (vom Nutzer auch „0.85“ genannt), eigener späterer Entwicklungsbranch **erst aus der final freigegebenen v0.8**. Gleicher Qualitäts-/Review-/Mergeprozess. Kein v0.8.5-Merge vor dem v0.8-Review. Die Versionsnummer kann vor Beginn angepasst werden.
4. Übergreifende Architektur/Designvorgaben dürfen im zweiten Release feingeschliffen werden; Monster-Grundtechnik und Wissenskomponenten lieber einmal solide bauen, statt in v0.8.5 neu zu schreiben.
5. Scope-Änderungen, neue wissenschaftliche Modelle, Namens-/Domainumstellung und große Animationen erfordern explizite Freigabe. Kein Backend, Accounts, Tracking oder zusätzliche Hauptnavigation ohne Entscheidung. Kostenfreie öffentliche Nutzung beibehalten.

## V0.8 – Fundament, Inhalte und Entropie

### 01 – Eigenständiger Name, Brand-Identität und Entropie-Wesen / Monster
**Status: Stilrichtung A + subtile Glitch-Ästhetik abgestimmt; Einzelheiten und endgültiger Name offen.**

Das Monster ist ein zentraler Markencharakter: **asymmetrischer 2.5D-artiger Entropy Wraith / Void Beast**, kein Kreis-mit-Smiley, kein Chibi. Ein einziges gleichzeitig sichtbares In-Page-Wesen, aber an zahlreichen Kontextstellen. Situationsabhängige, seltene Aktionen, nicht nervig, mit subtilen Glitch-/Fragment-Effekten. Wenige Akzentfarben und ruhiger Hintergrund; niemals verwirrende Veränderungen wissenschaftlicher Werte. Vollständiger Spezifikationsentwurf: **[`01-monster-identitaet.md`](01-monster-identitaet.md)**.

**Name entschieden:** „Reincarnated as a Proton“ (09.11.2026); noch zu prüfen: identische/ähnliche Marken, Domains und Slug, bevor Domain gekauft oder öffentlich umgestellt wird. **Monster-Vorlage entschieden:** minimalistische, skizzenhafte rote/schwarze A3 Glitched Entity (Details im Einzelplan); die ausgewählte Bilddatei ist noch nicht als Repository-Asset hinterlegt. Noch zu entscheiden: Mimik-/Animationstiefe, genaue Auftrittsfrequenz, Abschaltoption und technische Integration. Produktname und Monstername sind getrennt; vorläufiger Figurenname bleibt offen. Keine URL-Weiterleitungen oder Repository-Umbenennung ungefragt.

### 02 – Konsistentes „Warum / Wozu / Was passiert?“-Erklärformat
**Status: inhaltlich freigegeben vom Nutzer (09.11.2026); noch keine Work-/Merge-/Deployment-Freigabe.** [Vollständiger Plan Schritt 02](02-warum-wozu-was-passiert.md).

**Genau eine direkt erkennbare Hauptfrage je aktivem Labor/Unterexperiment**, Erklärung standardmäßig geschlossen; zusätzliche Fragen und Fachdetails nur freiwillig versteckt aufklappen. Keine Themenkartenflut und keine Pflicht-Tour. **Neue Nutzerentscheidung:** in *jedem* experimentellen Labor/Unterlabor eine **weitere separat eingeklappte** Mini-Prognose („Was glaubst du, passiert?“) mit 2–3 möglichen Antworten, freiwilliger Auflösung und anschließendem Hinweis zum wirklichen Ausprobieren; nie automatisch Modelleingaben verändern. Ein **wiederverwendbares**, kompaktes Erklärformat je Experiment: kurzer Einstieg, Ursache, konkrete Anwendung, Prognose, Grenzen und Quellenlink. Die sechs Kontexte (Gravity, Black Hole, Extreme Objects, Temperature, Entropy-Marker, Entropy-Wärme) besitzen eigene prüfbare Vorschläge im [Schritt-02-Plan](02-warum-wozu-was-passiert.md). **Ort:** Hauptfrage direkt unter dem aktiven Labortitel. **Inhalte:** ungefähr gleiche Gewichtung von Alltags-/Technikbezügen und Kosmos-/Universumsbezügen **über alle Labs**, ohne unpassende Alltagsbehauptungen zu erzwingen. Einzelne konkrete Quiz-/Reglerbeispiele werden vor Implementierung wissenschaftlich und gegen tatsächlich vorhandene UI-Bedienung geprüft. Keine selbstständigen Simulationsmutationen. Fachlich sinnvoll zwischen Alltagstechnik und astronomischen Beobachtungen unterscheiden; keine Nutzenbehauptungen künstlich erfinden. Die Erklärkarte ist **optional**, nicht erzwungen oder modal. Ein gemeinsames Hilfesystem verwenden und in allen fünf Hauptbereichen an relevanten Objekten/Reglern anbringen. DE/EN, Keyboard, Fokus und Sprache ohne Zustandsverlust.

### 03 – Entropy Lab wirklich verständlich und anschaulich machen (P0)
**Status: [ausführlicher Diskussionsentwurf angelegt](03-entropie-verstehen.md); noch keine inhaltliche oder technische Freigabe.** Zwei bisherige separate v0.7-Modelle erhalten, Mikro-/Makrozustand, Häufigkeit und Wärme/Entropiebilanz didaktisch klar verknüpfen; Nutzerentscheidungen zu Umfang und Visualisierung stehen aus.

Bestehende getrennte Marker-/Makrozustand- und Wärme-/Entropie-Lehrmodelle **erhalten**. Verständlich visualisieren, warum viele Mikrozustände denselben Makrozustand ergeben, warum typische Verteilungen häufiger sind, warum einzelne Fluktuationen möglich sind, warum isolierter Wärmeausgleich `ΔS_total≥0` ergibt und weshalb Energieerhaltung nicht mit Energieverfügbarkeit gleichzusetzen ist. Keine falsche „Entropie = Chaos = Alles sinnlos“-Physik, kein Verschmelzen von `S/k_B` mit thermodynamischem `ΔS` in J/K. Kleine Gegenbeispiele, reproduzierbare Prognosefragen, beschriftete schematische Skizzen; freiwillige Advanced-Formeln und Quellen. Echte qualitative Verbindungen zu Motoren, Kühlung, Wärmepumpen und Zeitrichtung, mit sauberer Grenze zwischen Modell und Realität. Für jedes neue Experiment eigene testbare Mathematik.

### 04 – Modelle & Quellen + „Begriffe verstehen“ in ein Wissenssystem integrieren
**Status: offen zur gemeinsamen Detailplanung.**

Bisheriger Science-Bereich, Glossar und Kontextlinks sollen **eine konsistente Wissensarchitektur** bilden, nicht mehrere widersprüchliche Lexika. Jedes Modell mit: Annahmen, Rechenumfang, Formeln mit Einheiten, Quellen pro überprüfbarer Aussage, Messung/Simulation/Illustration, typischen Irrtümern und expliziten bekannten Grenzen. Sprechende Schnellhilfen beim Wert (1–3 Sätze) und getrennt aufklappbare Advanced-Abschnitte; Navigations-/Rückweg und Fokus sicher. Keine erfundenen Referenzen oder falsche Behauptung unabhängiger Zertifizierung.

**Checkpoint:** Review/Tests/Preview/Visuelle und fachliche Nutzerabnahme v0.8, **dann** Entscheidung zu Merge und anschließend v0.8.5.

## V0.8.5 – Geführte Benutzung und visuelle Labor-Upgrades

### 05 – „Erste Schritte 3.0“ und freiwillige Lernpfade
**Status: offen.** Aus der vierstufigen Entropy-Tour eine kurze, optionale, verständliche Orientierung mit gezielten Minibeispielen auch für Gravity/BH/Extreme/Entropy/Science. Wahlmöglichkeit „schnell“ vs. „etwas mehr verstehen“ statt riesigem Pflicht-Tutorial. Realistische Lernziele, keine ungebetenen Parameteränderungen. Bewahren: Fokus, DE/EN, Escape, Reduced Motion, Simulatorzustände.

### 06 – Black Hole Lab: wissenschaftlich ehrliche, eindrückliche Animation
**Status: offen.** Visuelle Überarbeitung von Akkretionsscheibe, Ereignishorizont, Lichtablenkung und Blickwinkel; zu jeder animierten Eigenschaft erklären, ob exakte Rechnung, Näherung oder künstlerische Darstellung. Echtes relativistisches Raytracing **nicht** behaupten, solange nicht tatsächlich gelöst. Bestehende berechnete Schwarzschild-/Hawkingwerte und wissenschaftliche Einschränkungen erhalten. Performant, mobile, 2D/2.5D-Skizze statt unkontrolliertem 3D-Engine-Projekt. Monster als optionale Randreaktion ohne falsche wissenschaftliche Kausalität.

### 07 – Extreme Temperature Lab: physikalische Bedeutung, Kontext, Transfer
**Status: offen.** Bestehende 0-K-/0,001–10¹²-K-Vergleiche um Erklärung der Temperaturskala, Vergleich echter Kontexte und praktische Alltags-/Astrofragen ergänzen. Weiter mit dem begrenzten Wärmeexperiment verbunden, ohne hochenergetische Astrophysik in das idealisierte 250–600-K-Modell zu pressen. Temperatur, Wärme, thermische Energie und Stoffeigenschaften nicht gleichsetzen. Messwerte klar markieren; Modellannahmen belegen.

### 08 – Gesamtes Design und Feinschliff
**Status: offen.** Einheitliche Typografie und Lesbarkeit, etwas mehr **gezielte Farbe**, minimalistischer diskret animierter Entropie-Hintergrund, weniger visuelles Rauschen und bessere mobile Wege. Das eine Monster wie in Schritt 01 über **fast alle geeigneten Kontexte verteilt** einsetzen; kein zweites sichtbares Wesen. Klare visuelle Hierarchie; Messwerte/Diagramme stets vorrangig. Reduzierte Bewegung, CPU-/RAM-Limits, Screenreader, Tastatur, Browserzoom und farbunabhängige Informationskodierung überprüfen.

## Globale Definition of Done (für beide Releases)

- Nachweis des tatsächlichen Ist-Zustands vor Implementierung statt erfundener Testzahlen. Alle bisherigen vollständigen Node- und Chromium-Suiten erhalten und zusätzliche Tests für neue Interaktionen/Mathematik/Übersetzungen schreiben.
- Historische Original-Dateien und SHA-256-Schutz, zwölf exakte vollständige numerische Benchmarks, bestehende Physik und Zustandserhaltung bleiben unverändert; wissenschaftliche Grenzen sichtbar. Jede Änderung von Physikmodulen gesondert begründen und gegen unabhängige Quellen prüfen.
- Reale Chromium-Browsertests inklusive Desktop, 320/390 px, gebrochene Viewportbreite/DPR, tastaturbedienbar, Fokus/Rückweg, DE/EN ohne Verlust nicht angewendeter Entwürfe, Reduced Motion, Offscreen/Tab-Timeouts, kein Canvas-Wachstum/horizontaler Überlauf.
- Performance: keine Monster-Doppelinstanzen, keine unbegrenzten Timer oder partikelreiche Hintergrundanimation; dekorative Effekte niemals Messdaten oder Screenreader-Erklärungen verändern; Nutzer kann übermäßige Bewegung reduzieren/abschalten.
- Dokumentation je Schritt: Anforderungen, wiss. Annahmen, Quellen, Grenzen, Tests, Screenshots/Browserevidenz, offene Punkte und Akzeptanzkriterien. Jede Erweiterung zuerst auf Dev-Branch, anschließend unabhängiger Codex-Review. **Nicht in main mergen oder die öffentliche Website ändern ohne separate eindeutige Freigabe.**

## Nächster gemeinsamer Schritt

**Nächster gemeinsamer Planungspunkt: Schritt 03 – das Entropy Lab verständlicher und anschaulicher machen.** Schritt 02 ist inhaltlich freigegeben, aber weiterhin nicht implementiert. Schritt 01 besitzt inzwischen die freigegebene Grundrichtung und den ausdrücklich gewählten Produktnamen, bleibt aber technisch/gestalterisch ein Entwurf, bis die Domain-/Marken- und Monster-Integrationsfragen geklärt und der Arbeitsauftrag bestätigt sind. Diese Roadmap **autorisiert noch keinen Work-Implementierungsauftrag**.
