# Lean polish · v0.9.5

Base main commit fe9fd6854e1d520caed0b213de12ffc7c1278d31, following PR #36. Scope follows issues #17, #32, #15 and #13, including their correction comments.

| State | Item | Result |
| --- | --- | --- |
| Done | #17 motto | Footer and active DE/EN text entries use exactly “No plot armor. Just physics?”. |
| Done | #17 Gravity status dot | Removed the decorative dot element. The full computed-pairwise-gravity label and translation remain visible. |
| Done | #32 / #13 Gravity headline | “Deine Regeln? Eher nicht.” / “Your rules? Probably not.” with a small decorative Null copy whose heart eye is broken. Subtitle retained. |
| Done | #32 panel numbering | Removed the three isolated 01/02/01 panel counters. Panel headings carry their own names. |
| Done | #32 motion control | The Extreme Objects play/pause button uses its label width, with a 44 px touch target. |
| Already done | Old product titles and footer claims | Current page title and brand use Reincarnated as a Proton. The old footer claims are absent from the rendered product. |
| Already done | First steps | No regular First steps area or forced initial tour. Historical optional tour strings and fixtures remain in the source. |
| Already done | Dynamic object descriptions | Existing DE/EN descriptions distinguish all seven objects and special modes. Verified by the existing focused browser case. |
| Already done | Black Hole explanation | Existing “One horizon. Two views.” illustration differentiates environment and light/horizon, with the radius comparison separate. No duplicate section of the originally reported name. |
| Already done | Extreme Temperature visual | The old abstract thermalCanvas is absent from the page. Context explanations and the material comparison are available. |
| Open | Explorer dark edges | The issue does not identify the exact view or boundary. No scientifically empty catalogue area is repainted in this sprint. A specific reproducible view is still needed for a rendering fix. |
| Deferred | #15 Gravity trails | Browser reproduction confirms frame-based sampling. A complete follow-up should collect bounded true integration states and cover collision/reset/rate changes. |
| Deferred | #13 Null appearances | The existing controller still anchors one Null figure at the glossary. Relocation across labs needs overlap and lifecycle coverage. |
| Deferred | #13 larger visual overhaul | New spectacle, the Sun as an eighth object and replacing the explicit 30/60 selector remain in the separate phase. |

## Icon decision

Issue #13 has a specific correction comment stating that the actual favicon keeps its existing X-eye and ordinary heart. The broken heart belongs to an independent inline copy after the Gravity headline. This sprint follows that correction. rules-null.svg is copied from the existing icon with a dark crack in its heart. It is decorative, has explicit dimensions and does not add words to the accessible heading.

## Focused verification

Local Node checks cover DE/EN catalogue key parity and coverage, UX and all seven object descriptions. Local Chromium checks inspect the headline, icon load, footer, dot removal, panel counters, movement control and document width at 1440/390/320 px. In the measured browser, the English movement button is 113.5 × 44 CSS px at each width. Screenshots are emitted by tests/v0925-browser.test.mjs under browser-results/lean-*.png.

Windows Git checkout introduced CRLF into the unchanged i18n module, causing an existing VM-based test's import-stripping pattern to fail locally. Converting that local checkout file back to LF made the focused test pass, with no semantic source change or added i18n diff. Local shell browser startup also failed through its sandboxed named pipe. The existing browser test server also assumes forward slashes in its local path guard. For the local run only, that guard used the Windows path separator; the harness was restored byte-for-byte afterwards. Through the available browser runtime, the three focused Chromium cases passed (seven dynamic descriptions, atmosphere/footer, and the new responsive polish case). The final PR uses one normal full GitHub Actions run.

## Gravity trail reproduction and follow-up

The unchanged app loop records one trail point every three rendered frames and connects all saved points. At the 1000 model days/s slider setting, a local 1440 px Chromium sample advanced 1600.2 model days and observed 129 trail updates. The largest observed gap was 12.6 days. The displayed energy drift was 4.570 × 10^-9 percent, with no step-limit message. At 320 px with CPU throttle ×4, the sample advanced 1200.1 days with 91 updates and a largest observed gap of 20.8 days. The displayed drift was 3.263 × 10^-9 percent. These single runs establish coarse trail sampling and do not bound long-term integration error.

At Mercury's roughly 88-day orbital period these gaps join widely separated true positions with chords. The saved frame history lacks the intervening states. A follow-up should record actual states from the existing integrator at a bounded cadence, split trails where states are missing, and verify pause/reset/speed/collision behaviour, render cost, storage and unchanged trajectories. It should retain existing integrator parameters and historical benchmark tolerances. The present sprint leaves this task as a complete separate change.
