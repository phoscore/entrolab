# v0.9.5 Final Audit Corrections

Audit baseline: `6c3cd68fdb55bb43abb0245d0f31185d1e0d0077`
Branch: `feature/v0.9.5-final-audit-corrections`
Release state: v0.9.5 RC; this change does not merge or publish a release.

This correction set addresses the seven confirmed P2/P3 findings in [Issue #56](https://github.com/phoscore/entrolab/issues/56), including its independent GPT-6.2 Sol meta-audit comment.

## Findings matrix

| ID | Priority | Finding | Root cause | Correction | Regression evidence |
|---|---|---|---|---|---|
| F1 | P2 | Root README described the obsolete v0.8 entry point and understated Entropy capacity. | The root guide had not followed the public v0.9.5 RC product. | Rewrote the guide for the public `main` clone, current eight areas, current model assumptions and limits, and the 1–512 marker range; historical material is identified as historical. | `tests/quality.test.mjs`: root README identity, clone target, all eight tabs, 512-marker limit, and current Gravity bounds. |
| F2 | P2 | A transient `explorer.css` failure left the Explorer unstyled until a full reload. | `explorer-entry.mjs` appended a stylesheet link but did not await its `load`/`error` result before importing and mounting the viewer. | Wait for a loaded, non-empty CSSOM; remove failed links; show a localized accessible retry state; serialize pending mounts and keep one controller. A retry reloads CSS and mounts once. Other lab DOM/state is not replaced. | `tests/explorer-browser.test.mjs`: first stylesheet response is HTTP 503, then succeeds on retry; verifies error, removed link, one viewer/canvas, recovered CSS, and preserved Entropy state. |
| F3 | P3 | Gravity accepted coordinates whose Float64 spacing could no longer resolve the configured force-softening scale, and accepted relativistic speeds in a Newtonian model. | Inspector validation checked finiteness but did not apply position or speed domains. | Bound each coordinate using `EPS / (128 × Number.EPSILON)` (about `3.5184 × 10⁶ AU`); at that edge, Float64 spacing is at most `4.6567 × 10⁻¹⁰ AU`, below 1% of `EPS = 10⁻⁷ AU`. Bound total speed to `0.01 c = 2,997.92458 km/s`, where first-order relativistic corrections are of order `β² = 10⁻⁴`. Keep the existing mass domain and ordinary presets. Validate inspector edits and pointer placement with localized messages and no partial mutation. | `tests/quality.test.mjs` checks positive and negative x/y edges, finite values, existing scenarios, and speed norm. `tests/reimagined-browser.test.mjs` checks x/y and vx/vy rejection, retained values, localized errors, and placement rejection without inserting a body. |
| F4 | P3 | Repeated Entropy initialization/disposal accumulated event listeners and left competing handlers. | The old controller removed its timer, observer and language subscription but did not own/unregister all element, document and media-query handlers; a second mount could replace the active controller. | Register every listener through one cleanup stack. Track one controller per document in a `WeakMap`; dispose the previous owner before remounting; make disposal idempotent and cancel timers/observers/subscriptions. | `tests/entropy-ui.test.mjs`: listener-count and idempotent dispose/remount checks. `tests/entropy-browser.test.mjs`: repeated native Chromium mount/dispose with functional owner, listener and DOM invariants. |
| F5 | P3 | Thermal power and entropy production were calculated from already-rounded displayed temperatures near equilibrium. | Subtracting two independently rounded temperatures destroyed the small remaining analytical temperature difference. | Evaluate `ΔT(t) = ΔT₀ exp(−t/τ)` directly and use it for `P = G ΔT(t)` and `dS/dt = G ΔT(t)²/(T_A T_B)`. Report exact model equilibrium separately from display rounding; explain that rounded equal readouts can still have nonzero flux. | `tests/thermal.test.mjs` compares against a separate 100-decimal fixed-point exponential reference at high-precision, same-rounded, and exact-equilibrium cases. `tests/thermal-browser.test.mjs` checks both display cases in German and English. |
| F6 | P3 | Two Chromium resource tests treated noisy native DOM counters as deterministic leak assertions. | Cold-start and single-point measurements included browser-owned objects; functional lifecycle assertions were not isolated from these counters. | Add 10 warmup cycles, explicit GC baselines, repeated samples at three checkpoints, and independent owner/model/listener invariants. Keep the original growth thresholds; no threshold was relaxed and no leak assertion was removed. | `tests/creature-browser.test.mjs`, `tests/knowledge-browser.test.mjs`, and `tests/entropy-browser.test.mjs` retain growth detection across consecutive warmed/collected checkpoints and verify functional lifecycle separately. |
| F7 | P3 | Normal page use requested fonts from Google Fonts. | `style.css` imported the remote Google Fonts CSS. | Bundle the existing DM Sans and Space Grotesk variable fonts locally; retain their family/weight roles; include each upstream OFL 1.1 license. Remove Google Fonts imports. | `tests/quality.test.mjs` checks font files and license notices. `tests/browser-review.test.mjs` checks local font loading, absence of third-party requests, and ordinary offline navigation. |

## Scientific and data boundaries

No scientific data package, catalog, ephemeris, model equation outside the thermal rate calculation, or simulation color convention was changed. The Gravity limits are input-domain guards, not model changes: the position cutoff is derived from the existing `EPS` softening and binary64 resolution; the speed cutoff keeps use inside a conservative Newtonian regime. The existing mass range and bundled solar/stellar presets are retained. The README now describes the actual model limitations rather than claiming precision the simulations do not guarantee.

The Thermal change does not alter the analytical temperature solution or energy transfer. It avoids losing precision in the two derived rates and exposes the distinction between exact equality and equal rounded readouts.

Font provenance: the DM Sans and Space Grotesk variable-font binaries were copied byte-for-byte from the official Google Fonts repository at commit `5026800714d07231937d92eb4cceabf06e05d74e` (`ofl/dmsans/` and `ofl/spacegrotesk/`). The required OFL 1.1 license texts accompany the binaries under `dist/fonts/`.

## Verification record

Verified implementation head: `7545e974e5cea700a7906a4ec1a604f39f4c0523` (tree `b7bcf50104eeb32a112b2b728c3294df0ba8c0d2`). The report update is documentation-only and follows this tested implementation tree.

| Check | Result | Scope |
|---|---|---|
| `node scripts/test.mjs` | **PASS · 312/312 tests** | Node syntax, numerical and physics tests, source/data reproduction checks, and offline ephemeris/catalogue builds. Executed from an LF checkout of this commit with Node 24.22.3. |
| `node scripts/check-benchmarks.mjs` | **PASS · 12/12** | All historical numerical benchmark outputs match the pinned reference commit. |
| `node scripts/verify-original.mjs` | **PASS · 6/6 files** | Preserved original-source checksums. |
| `node scripts/cosmic-data.mjs verify` | **PASS** | 22 packaged objects; 19 sky directions; missing/negative parallax cases retained. |
| Focused regression run | **PASS · 38/38** | Gravity precision, Entropy lifecycle, thermal high-precision boundaries, README and local fonts. |
| Defensive Gravity runtime tests | **PASS · 4/4** | Invalid-state stop/reset, overflowed fit recovery, prediction underflow, and collision trails. |
| Native Chromium suite | **PASS — full suite** | GitHub Actions run [#405](https://github.com/phoscore/entrolab/actions/runs/46094849530), job `Chromium UX regressions`, on the verified implementation head above. The `Physics and data integrity` job also passed. |
| Native Chromium screenshot review | **PASS — reviewed** | Reviewed the run’s `chromium-review-measurements` artifact (artifact ID `15242967734`) for Explorer recovery/error, Gravity validation, Entropy layout, and Thermal near/exact-equilibrium states. Captures include German and English, mobile at 320/390 CSS px, and desktop at 1440 CSS px (Entropy desktop capture at 1360 CSS px). No clipping, overlap, or illegible validation state was observed in the inspected screens. |

The checked-in Windows working tree has `core.autocrlf=true`; exact-source reproduction checks were therefore run in a separate LF checkout, matching GitHub's Ubuntu workflow. Chromium runtime and screenshot evidence come from the successful native Playwright Chromium run and its uploaded artifact, not from a local interactive browser session.

The browser regressions exercise localized Explorer failure/retry and recovery; Gravity boundary validation on all axes; Entropy repeated mount/dispose; Thermal near-equilibrium and exact-equilibrium distinctions; and offline/local font loading with no third-party requests. A test-harness-only follow-up stabilized two existing Chromium checks: the Null visual comparison now waits for the visible animation and resets the controller between independent samples; the Gravity trail-pixel check advances the simulation to establish a measurable path before checking rendered pixels. Their functional and pixel assertions remain enabled.

No scientific data package, benchmark source, or simulation colour convention is modified in this branch. The application remains v0.9.5 RC; no merge or release has been performed.
