# ENTROLAB v0.4 — unabhängiger Prüfnachtrag

Datum: 8. November 2026. Ausgangsstand Pull Request #3, Branch `develop/v0.4`, Code-Head `f0d648d885a448c176c6361b4c399bd06ce17ac8` vor diesem Dokumentationscommit.

**Status:** Prüfung und Reproduktion einfacher mathematischer Grenzfälle. Keine Merge-Freigabe, kein Deployment, keine Änderungen am produktiven Code oder an `main`.

## Bestätigter Projektzustand

- Pull Request #3 offen und mergefähig; `main` weiterhin bei v0.3 (`4a9c961ae709b909873c870cdd8c2e649b1c4505`).
- GitHub Actions für den geprüften v0.4-Commit `f0d648d…` erfolgreich (u. a. Run `42440550247`).
- Die CI-Konfiguration bindet die neuen `tests/extreme.test.mjs`, `tests/extreme-lifecycle.test.mjs` und `tests/extreme-render.test.mjs` sowie sämtliche bisherigen Testdateien ein. Insgesamt laut Projektbericht 76 Prüfungen.
- `dist/physics.mjs` und die ursprünglichen Gravitations- und Vorhersagemodule wurden im PR nicht verändert. Keine direkte Browser-/GPU-/Mobilmessung durch diesen unabhängigen Prüfer; die in `docs/Qualitaetsupdate_v0.4.md` dokumentierte Work-Browserprüfung ist nicht mit einem separaten visuellen Abnahmetest gleichzusetzen.

## Unabhängige mathematische Stichprobe

Die GitHub-Quelldateien `extreme-data.mjs` und `physics.mjs` wurden in einer isolierten JS-Auswertung mit unveränderten Funktionskörpern ausgeführt (Import-/Export-Hülle entfernt). Ergebnisse:

| Größe | Reproduzierter Wert |
|---|---:|
| 0,001 K | −273,149 °C |
| 0,1 K | −273,05 °C |
| 0 K | −273,15 °C |
| Schwarzschild `1 M☉`, r_s | 2953,339382 m |
| Photonensphäre `1 M☉` | 4430,009073 m (= 1,5 r_s) |
| ISCO `1 M☉` | 8860,018146 m (= 3 r_s) |
| Weißer Zwerg, illustrative Mitteldichte | 8,3040043 × 10⁸ kg/m³ |
| Neutronenstern, illustrative Mitteldichte | 3,8460483 × 10¹⁷ kg/m³ |
| BH-Materialdichte | nicht angegeben (`null`) |

Die Formeln und Größenordnungen passen zu den dokumentierten idealisierten Annahmen. Es sind Modell- bzw. exemplarische Werte, keine empirischen Messungen bestimmter Objekte.

## Kleiner bestätigter Grenzfall — Celsius-Eingabe am Slider-Minimum

Bei direkter Eingabe **−273,149 °C** liefert die binäre JavaScript-Addition `celsiusToKelvin(-273.149)` ungefähr **0,0009999999999763531 K**. Dieser Wert liegt numerisch minimal unter dem positiven Slider-Minimum `0.001 K`, obwohl die dargestellten Dezimalwerte dieselbe Temperatur meinen.

In `extreme-ui.mjs` entscheidet `k < .001` über den Hinweis »Unterhalb des Sliderbereichs«. Dadurch kann nach Eingabe von **−273,149 °C** irrtümlich dieser Hinweis erscheinen. Der Slider selbst wird korrekt auf sein Minimum geklemmt. **Niedrige Priorität, reiner Rundungs-/Hinweisfehler**; die angezeigte Celsius-Temperatur und die physikalische Umrechnung bleiben im dokumentierten Genauigkeitsbereich.

**Reproduktion:** `celsiusToKelvin(-273.149) < .001` ist in JavaScript wahr; anschließend in der UI den Celsius-Wert `-273.149` eingeben und den Hinweis überprüfen. Ein vorgeschlagener Fix sollte mit einer kleinen, größenangepassten Rundungstoleranz nur die UI-Grenzklassifikation behandeln, nicht die physikalische Temperaturformel oder die numerische Skalenfunktion verändern. Regressionstest für das Kelvin- und das äquivalente Celsius-Preset ergänzen.

## Weitere technische Grenzen / Prüfpunkte für Codex

- Renderer ist ein Canvas-Artwork, **keine** numerische GR-Lichtbahnrechnung. Visualisierte Scheibenform/Leuchtstärke nicht als beobachtbare Schwarzschild-Signatur erklären.
- Die Zahl »60 fps Ziel« ist ein gewünschtes Zeichnungsintervall, keine gemessene Bildrate; die JS-Zeichenzeit ist keine GPU-Fertigstellungsdauer.
- Zusätzlich unabhängig kontrollieren: Sichtbarkeit bei Tabwechsel, wiederholtes Start/Stop, Reduced Motion, unterbrochene Eingaben und Inkonsistenzen nach schnellen Objekt-/Masseschaltern.
- Auf 390 px wurde laut Work-Browserbericht kein horizontaler Überlauf beobachtet; ein unabhängiger realer Gerätestest ist weiterhin ausstehend, jedoch ausdrücklich keine aktuelle Merge-Voraussetzung.
- Bekannte Grenzen der Newtonschen Sandbox, Schwarzschild-Näherung und Kollisions-Tunneling bleiben bestehen.

## Empfehlung

1. Codex einen **reinen unabhängigen Review von PR #3** durchführen lassen: insbesondere Renderer, UI-Lebenszyklus, wissenschaftliche Grenzen, fehlende Randtests.
2. Den kleinen Celsius-Grenzhinweis entweder vor v0.4-Merge beheben oder dokumentiert als unkritischen UI-Fix auf die nächste Version verschieben; bei Fix unveränderte v0.3-Benchmarks und sämtliche vorhandenen Tests verlangen.
3. **Nicht** ohne explizite Eigentümerfreigabe mergen oder veröffentlichen.
