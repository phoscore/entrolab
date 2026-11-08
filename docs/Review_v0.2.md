# ENTROLAB v0.2 – unabhängiger Review-Nachtrag (2026-11-08)

**Status:** Ergänzende unabhängige numerische Prüfung auf `develop/v0.2`; **keine Merge-Freigabe**. `main` und `dist/physics.mjs` sind unverändert. Die Reviewdatei enthält reproduzierbare Diagnostik, nicht zusätzliche CI-Assertions.

## Vorgehen

Für den Newtonschen Zweikörperfall werden die simulierten **relativen Positionen** mit der analytischen Kepler-Lösung verglichen (Keplergleichung (E-e\sin E=M), numerisch bis zur Konvergenz gelöst). 1 AU Anfangsabstand, Sonnenmasse plus planetare Masse (3\times10^{-6}\,M_\odot), exzentrische Fälle starten am Apozentrum. Festschritt = 0,1 Tage, adaptiv = unverändertes `safeStep`. Gleiche Endzeiten für beide Verfahren. Die Referenz ist die **ungeglättete** Newtonsche Keplerbahn; der Simulator verwendet eine kleine Plummer-Glättung `EPS=1e-7` AU. Der dadurch bedingte Modellunterschied ist bei diesen Testabständen klein, aber nicht null.

Reproduzieren:
```bash
node tests/independent_kepler_review.mjs
```

## Ergebnisse der eigenständig ausgeführten Referenzprüfung

| Exzentrizität | Dauer | Adaptiv: Positionsfehler am Ende | Fest h=0,1 d: Positionsfehler am Ende |
|---|---:|---:|---:|
| 0 (kreisförmig) | 3652,5 Tage | 231.787 km | 9.272 km |
| 0,5 | 365,25 Tage | 10.656 km | 10.418 km |
| 0,8 | 365,25 Tage | 25.067 km | 85.897 km |

Für die kreisförmige adaptive Bahn nach zehn Jahren ist die maximale relative **Energieabweichung** nur ca. **1,37×10⁻⁹**, obwohl die **Positionsabweichung** ca. **0,00155 AU** beträgt. Energieerhaltung schützt nicht vor einem akkumulierten Bahn-/Phasenfehler. Die maximalen Positionsfehler während des Laufs sowie die Energiedrift stehen in der maschinenlesbaren Konsolenausgabe.

**Folgerung:** Der feste Schritt mit h=0,1 d ist hier nicht generell besser: Beim stark exzentrischen Fall ist er schlechter. Die Entscheidung aus v0.2, den Integrator nicht pauschal auszutauschen, bleibt sinnvoll. Tests sollten aber zusätzlich absolute Bahn- bzw. Phasenfehler gegenüber analytischen Lösungen erfassen.

## Kollisionserkennung – diagnostischer Grenzfall

Zwei frontal entgegenkommende Körper mit (3\times10^{-6}\,M_\odot), Anfangsabstand (0,0002\) AU und Geschwindigkeiten jeweils `±0.02 AU/Tag`.

- **Ein einziger Schritt** von `dt=0,02 Tage`: Die Körper durchqueren sich zwischen den diskreten Prüfpunkten; `step()` meldet **0** Kollisionen.
- **Bestehende adaptive Steuerung:** Im identischen Fall wird eine Kollision nach **6** Schritten erkannt.

Das demonstriert eine **Grenze der Endpunkt-Überlappungsprüfung** (Collision Tunneling) bei zu großen Einzelschritten, **keinen nachgewiesenen Fehler im normalen adaptiven UI-Modus**. Das Problem ist relevant, wenn später feste/große Schritte, externe Aufrufe oder extremere Konfigurationen zugelassen werden. Für harte Kollisionen wäre perspektivisch ein Swept-Collision-/Time-of-Impact-Test sinnvoll.

## Zusätzliche Erkenntnisse und Restrisiken

- GitHub Actions und vorhandene v0.2-Tests wurden laut unabhängig abgefragtem Workflowstatus erfolgreich ausgeführt. Dies ersetzt keine Vollprüfung aller Randfälle.
- Die vorhandenen v0.2-Orbitkonvergenztests prüfen primär eine feinere numerische Lösung desselben Verfahrens; analytische Referenztests ergänzen diese sinnvoll.
- Ein Mobiltest wurde vom Projektinhaber als **„funktioniert ganz gut“** rückgemeldet; das ist eine positive manuelle Plausibilitätsprüfung, keine vollständige Touch-/Barrierefreiheits-Zertifizierung.
- Noch nicht unabhängig nachgewiesen: kontinuierliche Kollisionen für beliebige Anfangsdaten, relativistische Dynamik, vollständiges Hawking-Emissionsmodell, extreme Benutzereingaben und langfristige 3+-Körper-Validierung gegenüber externen Referenzen.

## Empfehlung für die nächste Iteration

1. Einen reproduzierbaren **analytischen Kepler-Regressionstest** mit tolerierten Positions-/Phasenabweichungen in die reguläre CI-Suite aufnehmen. Nicht nur Energie/Impuls prüfen.
2. Kollisions-Tunneling als bekannte Modellgrenze dokumentieren; robuste Erkennung nur nach Performance- und Regressionstests implementieren.
3. Weiterhin **keinen** globalen Integratorwechsel ohne mehrere gleichwertige Vergleichsszenarien.
4. Anschließend Pull Request #1 prüfen und erst nach expliziter Freigabe mergen.

**Status:** Dieser Nachtrag verändert keine Physikformeln und keine produktive Web-App. Er dokumentiert unabhängige Prüfung und mögliche Folgeaufgaben.
