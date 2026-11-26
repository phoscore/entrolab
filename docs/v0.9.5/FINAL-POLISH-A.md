# v0.9.5 · Final Polish A

The interface work follows [Issue #48](https://github.com/phoscore/entrolab/issues/48), with the requested visible name **Extemp-lab**. The production baseline is `01dc62330ae58bfb8943ba5380dca39432de8fd1`.

## Navigation and identity

| Route | Visible name (DE / EN when distinct) | Accent |
| --- | --- | --- |
| `#gravity` | Gravity Sandbox | Violet |
| `#blackhole` | Singularities | Muted red |
| `#extreme` | Extreme Objects | Gold |
| `#temperature` | Extemp-lab | Copper |
| `#entropy` | Entrolab | Indigo |
| `#matter` | Materie & Felder / Matter & Fields | Teal |
| `#explorer` | Cosmic Explorer | Blue |
| `#science` | Modell & Quellen / Models & Sources | Silver-blue |

Each main heading gives the lab name, a bilingual line and the original `rules-null.svg` icon. Singularities identifies itself as the black-hole lab in the heading and lead. CSS custom properties tint the heading rule, subtitle, symbol, active navigation and decorative control borders. The palette does not replace a scientific colour mapping. The brand mark aligns in its own box with the wordmark. DE/EN use 44 CSS px targets and the visible release marker retains the baseline version. At the narrowest widths the version sits below the wordmark.

Desktop exposes all eight navigation buttons. At up to 760 CSS px an in-flow disclosure shows the selected lab; opening it reveals the same buttons. Tab and arrow keys, Home, End and Escape work without a modal focus trap. Selecting an entry closes the disclosure and returns focus to the mobile button. Crossing the breakpoint transfers navigation focus to its visible equivalent and leaves focused lab inputs alone. Direct lab changes set the fragment and add a browser-history entry. Returning to the empty initial fragment restores Gravity. Legacy model and glossary links keep their own focus and return rules. The panels are retained in the DOM, so ordinary transitions keep input drafts, selections and model state under the pre-existing visibility and prediction rules.

## Extemp-lab and illustration controls

`#temperature` is the top-level panel and remains a native anchor and focused landing target. The Kelvin–Celsius calculator, presets, kinetic illustration, comparisons, material references, contextual question, limits, sources and heat-transfer draft bridge keep their existing IDs and state. The gas renderer follows the temperature panel for visibility and animation. The published site continues without the retired walkthrough; the test-only legacy tour now locates the temperature tab through the current navigation.

Singularities and Extreme Objects place the illustration Play/Pause control at the image edge. A small icon sits inside a 44 × 44 CSS px button with a translated action name and visible keyboard focus. Existing lifecycle, Reduced Motion policies and explicit playback choices remain in force. Static illustration presets disable the motion control and remember the previous play setting for a return to a moving view. Simulation and experiment controls retain their existing form.

## Null

The art, rig, favicon and rare fictional gamma sequence are the original ones. The previous SVG viewport and rectangular slot both clipped paint. In the native Chromium probe a 166 × 84 px hero slot gave the SVG an intrinsic 174 px height, leaving most of the tail outside. The SVG now fits the measured container. Most old actions entered horizontally from the same side. Short contextual scheduling could use the same heading repeatedly. The revised slot still physically contains all paint. A soft elliptical opacity falloff reduces the visible edge, and the SVG can paint into that falloff. Three entry and retreat directions vary the old joint animations, and peek and short reaction timings are longer. A small curved lip can sit in front of the art at a clear heading edge. Gamma keeps its separate wide stage and readable fiction label.

The same timer gates ambient and contextual visits. Every animated visit sets the next allowed start to at least 24 seconds after its planned end, including visits interrupted by navigation. For 56 seconds, the planner avoids the guide position and prior offsets within 72 CSS px in the same heading when those positions occur in the recent history. It tries another measured space or waits for the first relevant timestamp to expire. The history is local to the one owner. A short visit may be omitted if clearance is insufficient. No frame loop was added. Hidden pages, focus mode, active editing, pointer interaction, an open mobile menu or glossary and offscreen slots suppress motion. Reduced Motion can show the static pose. The obsolete off values continue to be ignored under #41 and PR #43. Future candidate positions are rechecked against the viewport and text bounds.

## Earlier feedback

| Item | Status in this phase |
| --- | --- |
| Old title and playground claim (#32) | Already absent from the live UI at the baseline. |
| Inconsistent margin numbers (#32) | Already removed from the panel headings. |
| “Erste Schritte” / public Discovery (#32) | Already retired. Its legacy test fixture still verifies the tour routes. |
| X eye and broken-heart variant (#13, #32) | The existing inline symbol uses the broken heart and X. The browser favicon keeps its intact heart and X as specified in the final #13 comment. Chromium checks the favicon at 16 and 32 px. |
| Blue Gravity status dot (#17) | Already removed. The text still reads as a scientific model label. |
| Footer motto (#17) | Already exactly “No plot armor. Just physics?” in DE and EN. |
| Large decorative motion controls and repeated Null visits (#13, #48) | Updated in this phase. |
| Explorer dark edges and public version (#50) | Phase C. |
| More markers, “Einfacher verstehen” and added lab content (#49) | Phase B. |

## Verification

The regular Node and Chromium suites exercise the existing numerical and data integrity contracts. Phase A adds navigation checks for all eight views at 1440, 390 and 320 CSS px, real keyboard and touch input, hash/history changes, draft preservation, translated names and 44 px illustration targets. Null tests sample three animation times at multiple real headings, enforce rest and recent-slot rules and test click transparency, Reduced Motion, hidden/offscreen transitions and repeated navigation/disposal. The before/after review uses native Chromium captures at the same CSS viewport widths. A browser can still omit Null in a crowded heading. Touch coverage uses Chromium emulation.

See the draft PR for the exact-commit CI, native visual artifacts and independent audit.
