# Final Polish D · Visual Consistency

Baseline: `392f3f0090a004b0ef8dfe266d807b98756eb5a1`.

All eight lab headers share one layout: title, accent-coloured tagline and small Null mark, learning question, description, then the contextual help action. Existing model labels sit beside help when space permits and below it on compact screens. The help layout is the same for the glossary links and the two inline disclosures, with a chevron identifying the latter. Question and help controls are at least 44 CSS px high. The existing decorative Null visit has room beside the heading.

Cosmic Explorer loads its map stylesheet on entry. Generic title, disclosure and focus rules are scoped to the map content so the surrounding header keeps its shared typography and spacing.

| Area | Accent |
| --- | --- |
| Gravity Sandbox | Violet `#d9baff` |
| Singularities | Rose `#f4a7c0` |
| Extreme Objects | Gold `#f2df9a` |
| Extemp-lab | Apricot `#ffb18b` |
| Entrolab | Green `#b4dfa0` |
| Matter & Fields | Cyan `#8edee2` |
| Cosmic Explorer | Blue `#aebfff` |
| Models & Sources | Silver `#d6dbe8` |

Each accent is shared by the lab header, the desktop navigation and the compact menu tiles. Selection also has a filled background, an outline and the existing pressed state. The palette is applied to the page shell. Simulation palettes, model data and numerical modules are unchanged.

## Verification

The Chromium regression covers eight labs in German and English at 320, 390, 768 and 1440 CSS px. It compares typography and insets, checks element order and geometry, and samples rendered foreground/background pairs for text (at least 4.5:1) and the two header control borders (at least 3:1). [WCAG 2.2, contrast criteria 1.4.3 and 1.4.11](https://www.w3.org/TR/WCAG22/#contrast-minimum)

The PR links the before-and-after captures and results for its verified head. Each comparison shows the navigation plus all eight headers at the same viewport and language.
