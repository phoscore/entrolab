# ENTROLAB v0.7 — Wärme, Entropie und ein besserer Einstieg

**Status:** Entwicklungsplan, noch keine Implementierung. Ausgangspunkt: öffentliche, freigegebene v0.6 auf `main`, Commit `4fe3c48295f66750775fa4fe42c596c26c361830` (PR #5 gemergt, GitHub-CI erfolgreich). Entwicklungsbranch ausschließlich `develop/v0.7`. Öffentliche Website `https://entrolab.pages.dev` bleibt stabil bis zu expliziter Freigabe zum Merge; Cloudflare Pages deployt `main` automatisch. Privates Repository und `archive/v0.1` unangetastet.

## Nutzerwunsch und Ziel

- **„Erste Schritte“ stark verbessern**, damit neue Besucher tatsächlich verstehen, wie man ENTROLAB benutzt. Freundlich, sehr kurz, freiwillig, interaktiv, auf Mobilgeräten gut bedienbar; **keine** lange Pflicht-Tour, sperrenden Modals oder Flut aus erklärenden Pop-ups.
- Das vorhandene **Extreme Temperature Lab** ist isoliert und inhaltlich zu dünn. Es soll sinnvoll an eine neue, wirklich berechnete **Wärme-/Entropie-Funktion** anschließen. Bewahre die bewährte Temperaturskala und Grenzwerte; keine unphysikalische Kopplung an das neue Modell.
- Entropie als großer, aber **nicht alleiniger** Themenkomplex; bestehende Gravity Sandbox, Black Hole Lab, Extreme Objects und v0.6-Zwei-Kammer-Entropy-Lab bleiben vollständig nutzbar.
- Physik und Wissenschaft >90 %, ästhetischer, leicht nihilistischer Witz klar als Kommentar und <10 %. **Keine** Behauptung „Entropie beweist Bedeutungslosigkeit“.
- Komplett Deutsch/Englisch. Projekt bleibt kostenlos öffentlich und erfordert keinen Account.

## 1. Neues quantitatives Wärmeausgleichs-Labor (Hauptfeature, MUSS)

Erweitere **das bestehende Entropy Lab** um eine zweite klar bezeichnete Experimentsansicht, z. B. „Wärme & Entropie“ neben „Teilchen & Wahrscheinlichkeit“. Kein unnötiger sechster Haupttab. Bewahre den v0.6-Stochastikbereich und alle bisherigen Interaktionen.

### Physikalisches Basismodell

Zwei **idealisierte, endliche, thermisch gekoppelte Körper** A und B, zusammen gegen die Außenwelt isoliert, mit je einer homogenen Temperatur `T_A,T_B > 0 K`, konstanten, positiven Wärmekapazitäten `C_A,C_B` in J/K und konstantem positivem Wärmeleitwert `G_th` in W/K. Keine Phasenwechsel, Arbeiten, Wärmeverluste, Strahlung, temperaturabhängigen Wärmekapazitäten oder räumliche Temperaturgradienten. Diese Annahmen bei der Grafik sichtbar kurz nennen; Advanced kann sie ausführlich erklären. **`G_th` nicht mit der Newtonschen Gravitationskonstanten `G` verwechseln.**

`dQ/dt = G_th (T_A-T_B)` ist der vom wärmeren zum kälteren Körper transportierte Wärmeleistungsbetrag (bei umgekehrter Temperatur entsprechend umgekehrtes Vorzeichen). Energiebilanz:
`C_A dT_A/dt = -G_th (T_A-T_B)`,
`C_B dT_B/dt = +G_th (T_A-T_B)`.

Exakter numerisch stabiler/analytischer Zeitschritt mit
`T_eq=(C_A T_A0 + C_B T_B0)/(C_A+C_B)`;
`D(t)= (T_A0-T_B0) exp[-G_th (1/C_A+1/C_B)t]`;
`T_A(t)=T_eq + C_B/(C_A+C_B) D(t)`,
`T_B(t)=T_eq - C_A/(C_A+C_B) D(t)`.
Alternativ nachweislich gleichwertiger stabiler Zeitintegrator; keine temperaturüberquerenden Schritte und kein negativer Kelvinwert. Die Gesamtenergie `U=C_A T_A + C_B T_B` bleibt bis auf Rundungsfehler konstant (der Nullpunkt der Energie ist nur Modellkonvention).

Berechne und zeige die **thermodynamische** Entropieänderung gegenüber dem Anfangszustand:
`ΔS_A=C_A ln(T_A/T_A0)`,
`ΔS_B=C_B ln(T_B/T_B0)`,
`ΔS_total=ΔS_A+ΔS_B` in J/K.
Im passiven isolierten Zweikörpersystem `ΔS_total≥0` bis auf klar dokumentierte numerische Rundung. Entropie des abkühlenden Körpers darf abnehmen; Gesamtentropie nimmt zu. Momentane Entropieproduktionsrate optional:
`σ=G_th (T_A-T_B)^2/(T_A T_B)≥0`, Einheit W/K.
Wärmefluss in Watt, übertragene Wärmeenergie in Joule. Achtung: **Wärme ist Energieübertragung**, nicht „der Wärmeinhalt“ des Körpers. **Temperatur ist nicht Energie**. Behaupte nicht, dass Energie verloren geht, wenn sie sich verteilt.

### Darstellung und Bedienung

- Zwei große, gut lesbare, farblich getrennte Körper-/Temperaturanzeigen mit warmer/kühler Farbe, Pfeil des **Netto-Wärmeflusses** vom höheren zum niedrigeren T, Zahlwerte `T_A,T_B,ΔS_total,Q, U` und anschauliche **Temperatur-vs-Zeit-Kurven**. Farbcodierung zusätzlich textlich kennzeichnen, ausreichend Kontrast, keine flackernden Effekte, Touch und Keyboard.
- Minimaler Startzustand etwa 350 K vs. 290 K, gleiche Wärmekapazitäten, überschaubare Zeitachse. Stellbar sind zwei Anfangstemperaturen sowie ggf. zwei Wärmekapazitäten und der Leitwert; seltene Optionen unter „Erweitert“. Auswahl von 2–3 *ehrlich benannten* Beispielen (zwei idealisierte Körper, ungleiche Wärmekapazität, gleiche Anfangstemperatur).
- Start/Pause/Reset, verständlicher Zeitfaktor oder Schritte. Zustandsänderung nur durch bewusste Eingaben; klarer Reset für neue Parameter. **Keine angebliche Echtzeit-Gas-, Material- oder Raumleitungs-Simulation.**
- Hauptanzeige: Kurztext „Wärme fließt, bis beide Temperaturen gleich sind; Energie bleibt erhalten, Entropie des gesamten isolierten Systems steigt.“ Begriffe kurz erläutern; daneben separate aufklappbare **Advanced-Formeln**, Annahmen und Quellen. Beispiel erläutert, warum das nicht spontan umgekehrt läuft, und wie viel Wärme übertragen wurde.
- Wissenschaftliche Grenze: Modell nur in einem **explizit begrenzten, positiven, gewöhnlichen Temperaturbereich** (beispielsweise ca. 250–600 K oder ähnlich fachlich begründet), bei konstanten Wärmekapazitäten als idealisierte Annahme. Keine Berechnungen bei 0 K, negativem Kelvin, 10^12 K oder in Sternen-/Plasmabedingungen. Keine pauschalen Materialrealismus-Behauptungen, auch nicht bei `350 K`.
- Bewahre das unabhängige v0.6-Zwei-Kammer-Modell und erkläre die Unterschiede: kombinatorische grobe `S/k_B` vs. thermodynamisches `ΔS` in **J/K**; nicht addieren oder gleichsetzen. Benenne die beiden Systeme exakt.

### Sinnvolle Verbindung zur **bestehenden** Temperature-Funktion (MUSS)

Das vorhandene Extreme Temperature Lab (0 K und 0,001 bis 10^12 K als Vergleich/Visualisierung) **nicht entfernen**, nicht neu kalibrieren und nicht in das neue Wärmeexperiment pressen.

Ergänze eine gut erkennbare Aktion „Diese Temperatur im Wärmeexperiment verwenden“ oder einen vergleichbaren **kontextbezogenen Übergang** mit definierter Auswahl Körper A/B. Nur wenn der aktuelle Wert in einem physikalisch für das Modell zugelassenen Bereich liegt: voreintragen (keine automatische Simulation), zu Entropy → Wärme-Lab navigieren und erklärenden Hinweis zeigen. Wenn außerhalb: Button deaktivieren oder eine verständliche Erklärung „Dieser Extremwert liegt außerhalb der vereinfachten Wärme-Modellannahmen“, keine stillschweigende Anpassung/Clamping oder scheinphysikalische Rechnung. Rücknavigation ohne Verlust der aktuellen Extreme-Objects-Temperatur; beide Modelle unabhängig. Denkbare Alternative, wenn die bestehende Architektur direkte Übergabe riskant macht: gut sichtbare Verlinkung und *bewusstes* Kopieren des zulässigen aktuellen Kelvinwerts, mit Tests. Wissenschaftlich korrekte Konversion und Eindeutigkeit des Dezimalpunkts.

## 2. „Erste Schritte“ als wirklicher kompakter Lernpfad (MUSS)

Heute ist `#quickStart` überwiegend statischer Erklärungstext, der über `#helpToggle` geöffnet wird. Entwickle daraus eine **nicht blockierende, kurze, freiwillige Anleitung**: 3–5 Schritte insgesamt oder wenige je Lab, abhängig von tatsächlicher Nutzerführung. Keine zwanghafte Vollseiten-Tour; keine langen Scrolltexte. Beispielsweise:
1. Wähle ein Labor / Szenario (zeigt vorhandene Navigation).
2. Starte oder pausiere ein Experiment (zeigt tatsächliche Steuerung).
3. Verändere **eine** gut verständliche Variable und beobachte **ein** Ergebnis.
4. Tippe auf ⓘ für Erklärung; „Advanced“ nur freiwillig.
5. Ende mit „Selbst ausprobieren“ und einem jederzeit sichtbaren „Anleitung erneut öffnen“.

Führen nicht nur beschreiben: kontextbezogen **sichtbare, aber dezente** Hervorhebung des relevanten Bedienbereichs, passende kurze Text- und ggf. statische Mini-Skizze, mobil nutzbar. Keine automatische Manipulation laufender Simulationswerte oder invasiver Focus-Traps; ein bewusst klickbarer „Zum Beispiel wechseln“-Button nur wenn erlaubt. Jede Anleitung darf übersprungen/geschlossen werden. Sprachwechsel behält aktuellen Schritt ohne Simulationsreset; mit `prefers-reduced-motion` ohne Bewegung; bei Tabwechsel oder verborgenem Ursprungsbutton Fokus auf sichtbarem Navigations-/Hilfeknopf, nie `BODY`. Vermeide den v0.5/v0.6-Fehler der Fokusrückgabe auf versteckte Controls. Kleine, klare Kommentare mit gesondertem Humor, nicht belehrend.

## 3. Kleine zusätzliche Verbesserungen (SOLL, ohne Feature-Explosion)

- Klare Verknüpfung zwischen den beiden Entropie-Experimenten und ihren Modellentropie-Einheiten. Konsistente Begriffs-Info-Hilfen, einheitliche einfache Skizzen/Diagrammlegenden; nicht vier parallele Glossare.
- Optional **ein** hilfreicher kompakter Vergleich/Experiment-Preset, der den Effekt unterschiedlicher Wärmekapazitäten demonstriert. Kein künstliches Video, keine 3D-Engine.
- Taktvolle Grafikverbesserung, gut lesbare Live-Messwerte und animierter Wärmefluss, aber Farbrichtung darf niemals das tatsächliche Wärmestrom-Vorzeichen verschleiern. Kein optischer „SL-Effekt“ im Thermometer als angebliche Physik.
- Der bestehende Browser-Titel `entrolab - emptiness pro max` und das nihilistisch lächelnde SL-Favicon bleiben unverändert.
- Nutzerinteresse: später (v0.8+) großer Cosmic Field Guide mit Universum, schwarzen Löchern, Entropie, Wärmetod und freiwilligen tieferen Formeln; nicht in v0.7 ungefragt ausweiten.

## Architektur, Korrektheit und Quellen

- Keine Änderungen an Newtonschem Integrator, BH-/Hawking-Modell, ursprünglicher `dist/extreme-data.mjs`-Thermodynamik oder v0.6-Statistik, außer wenn explizit technisch erforderlich und begründet. Neue Wärmemodell-Funktionen getrennt (z. B. `dist/thermal-physics.mjs`, UI `dist/thermal-ui.mjs`), keine Backenddienste.
- Übertragungen und UI-Zustand sicher halten; keine dauerhaften Daten/Accounts/Tracking, keine Netzwerkanfragen für den normalen Betrieb.
- Wissenschaftliche Quellen im UI oder Quellenabschnitt mit konkreter Aussagezuordnung, mindestens:
  - OpenStax University Physics Vol. 2, 1.6 „Mechanisms of Heat Transfer“: https://openstax.org/books/university-physics-volume-2/pages/1-6-mechanisms-of-heat-transfer
  - OpenStax University Physics Vol. 2, 4.6 „Entropy“: https://openstax.org/books/university-physics-volume-2/pages/4-6-entropy
  - OpenStax University Physics Vol. 2, 1.4 „Heat Transfer, Specific Heat, and Calorimetry“: https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry
  - Klar unterscheiden zwischen Lehrbuchprinzip und unserer selbstgewählten konstanten `G_th`-/`C`-Parametrisierung. Keine Quellenbehauptung für die eigene Kunstgestaltung.
- DE/EN vollständig, auch dynamische Fehler/ARIA/Grafiklegenden/Advanced-Texte. Browser-Tabtitel bleibt in beiden identisch. Decimal-point-Eingaberegel aus v0.5 beibehalten; Anzeigen mit Locale formatieren. Invalides Formular darf keine physikalischen Werte ersetzen. Keine Zustandmutationen beim Sprachwechsel.
- Animation bei verborgenen Tabs/Offscreen stoppen; `prefers-reduced-motion` aktiv beachten; keine Timer-Leaks. Nutzer muss manuell starten können. Time-Step/Zeitskala explizit; keine Aussage „reale Materialien kühlen in genau X Sekunden“.

## Prüfung, Regressionen, Freigabe

1. Baseline auf `main`: **138/138** reguläre Prüfungen, **20/20** Chromium-Fälle, **12** vollständige numerische Referenzfälle und **6** historische Originaldateien/Prüfsummen. Alte Tests nicht entfernen, verändern oder abmildern; neue Tests ergänzen.
2. Reproduzierbare Mathematiktests: Gleichgewicht exakt, `T_A(t),T_B(t)` positiver/endlicher Wertebereich; konstante Gesamtenergie; Monotonie von `ΔS_total` für nicht identische Temperaturen, für gleiche exakt 0; Wärmeflussrichtung und `Q`-Bilanz; Reihenfolge A/B vertauschen; stark unterschiedliche positive Wärmekapazitäten und extreme **gültige** Leitwerte; NaN/Infinity/0 K/negatives T/ungültige Eingaben abweisen. Grenzwerte mit begründeten und **strengen** numerischen Toleranzen. Unabhängige Referenzrechnung und Gegenprobe gegen entropische Endzustände; kein Rückwärtslaufen durch overshoot.
3. Realer Browser (Chromium CI): 320/390 px und Desktop, ggf. gebrochene Breiten/DPR gegen Canvas-Wachstum; Touch-emuliert ohne echte Hardwareversprechung. Neuer Guided-Flow mit Tabwechsel/Sprachwechsel/Escape, Fokus auf sichtbaren Controls; Thermal Experiment Start/Pause/Reset und Daten/Diagramm synchron; Übergabe gültiger Temperatur sowie Erklärung/kein Transfer bei Extremwerten; Bezugskörperwert ohne stilles Clamping; Regression der v0.6-Markerteilchen und Selbstcheck-Worker.
4. Prüfen, dass Übersetzungen vollständig bleiben, Zustände aller 5 bisherigen Bereiche erhalten bleiben, keine Animation im Hintergrund; keine Warnungen/Fehlermeldungen überschrieben; Sicherheits- und Modellhinweise klar sichtbar.
5. `docs/Qualitaetsupdate_v0.7.md` mit Modellgleichungen/Annahmen, numerischen Abweichungen, Quellen, echten Browsertests, Screenshots soweit möglich, Testgrenzen und Risiken. README und branchlokale Scope-Anweisung `AGENTS.md` aktualisieren; keine Änderung auf `main`.
6. In kleinen Commits ausschließlich `develop/v0.7`, PR nach `main` zur unabhängigen Codex-Prüfung, GitHub-CI grün. **Keine automatische Merge-/Release-/Cloudflare-Freigabe.** Allein die Eigentümerfreigabe erlaubt das Merge nach `main`.

## Umsetzungsempfehlung

Phase I: Physikalisches isoliertes Wärme-Modell + unabhängig getestete Zahlen/Einheiten.
Phase II: einfache UI innerhalb Entropy Lab + begrenzte Verbindung zum bestehenden Temperature Lab.
Phase III: kompakter interaktiver „Erste Schritte“-Guide.
Phase IV: DE/EN, Accessibility, Echtbrowser und Wissenschaftsregressionen, Qualitätsbericht und Review-PR.

Priorität, falls Aufwand kollidiert: **korrektes Wärme-/Entropiemodell + verständliche Bedienung > sichere Temperatur-Verknüpfung > lehrreicher Guide > grafische Spielereien**. Lieber 3 klare Schritte als 15 verwirrende Funktionen.
