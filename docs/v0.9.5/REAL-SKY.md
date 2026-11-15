# Cosmic Explorer · Phase 2C-A: Real Sky

Open **Cosmic Explorer → Sky map**. The Gaia layer begins with a colour map of real counts per equal area of sky. Click a populated area or zoom to see individual sources. Circles are Gaia entries without a classification in this data product. Click a circle, pick a source from the keyboard list or search by Gaia source ID. The inspector then loads the matching measurement page. **All sky** restores the overview. **Solar System** switches to the existing local view. First Light stays available when the Gaia layer is off.

## Scientific scope and rights

| Item | Decision for this release |
| --- | --- |
| Separate data product | `v0.9.5-gaia-dr3-g78.1`, atlas format 1, Phase-1 tile envelope CXT1. First Light remains `v0.9.5-sample.1`, schema 1. |
| Catalogue and access | ESA **Gaia DR3** `gaiadr3.gaia_source`, released 13 June 2022. Captured on 15 November 2026 at 03:53:36 UTC from the GAVO Data Center mirror **`gaia.dr3lite`**, with a separate ESA Archive cross-check. The mirror is a projection of the official catalogue. |
| Selected rows | All rows returned by the pinned query with `phot_g_mean_mag <= 7.8`, valid RA/Dec and solution mask 3, 31 or 95. A separate mirror count with the magnitude predicate alone also returned **50,635**. The position and mask checks discarded zero rows from that bright count. Stable numeric `source_id` ordering and an exact count check prevent silent truncation. |
| Frame and units | ICRS aligned to Gaia-CRF3, catalogue epoch J2016.0 (TCB). RA/Dec in degrees, positional standard errors and parallax in mas, Gaia G in magnitudes and RUWE dimensionless. Each source ID stays an exact decimal string at the interface and uint64 in the index. The epoch is a documented release invariant, checked explicitly in the ESA rows. |
| Quality and unknowns | No cut on RUWE, parallax sign or parallax S/N. The astrometry control filters solution availability, not the reliability or class of the object. Blank measurements stay unknown. Atlas rows provide no distance, space position, proper-motion propagation, names or astrophysical classifications. |
| Geometry and completeness | The **frame** is all-sky. This magnitude-selected export has entries in all 24 audited equal-area strata. It establishes neither an observational footprint nor a complete magnitude census. Gaia astrometry and G-band selection are affected by bright-end incompleteness, source processing, crowding and survey selection. The map reports counts of this export, not actual star density. |
| Attribution and reuse | The [GAVO resource record](https://dc.g-vo.org/browse/gaia/q3) describes republication of public numerical Gaia data and refers to the [ESA/DPAC credit instructions](https://gea.esac.esa.int/archive/documentation/GDR3/Miscellaneous/sec_credit_and_citation_instructions/). This attributed educational derivative carries the mission and release citations in [CREDITS](../../cosmic-explorer/atlas/CREDITS.md). The basis applies to these selected catalogue fields. No separate SPDX licence is claimed for the Gaia catalogue. Reassess rights for commercial use, new products or large-scale mirroring. |

See the [DR3 catalogue frame and epoch](https://gaia.aip.de/cms/data/gdr3/), [Gaia DR3 data model](https://gea.esac.esa.int/archive/documentation/GDR3/Gaia_archive/chap_datamodel/sec_dm_main_source_catalogue/ssec_dm_gaia_source.html), [release paper](https://doi.org/10.1051/0004-6361/202243940) and [known issues](https://www.cosmos.esa.int/web/gaia/dr3-known-issues). GAVO's [table metadata](https://dc.g-vo.org/__system__/dc_tables/show/tableinfo/gaia.dr3lite) distinguishes the real DR3 mirror from its separate simulated products. The overlay imports only the former. Source links open only on explicit user action.

## Quality evidence

| Check | Result |
| --- | ---: |
| Sources in the pinned capture | 50,635 |
| Position-only mask 3 | 779 |
| Five-parameter mask 31 | 46,968 |
| Six-parameter mask 95 | 2,888 |
| Missing parallax and RUWE | 779 each |
| Negative parallax | 12 |
| RUWE > 1.4 | 10,040 |
| Measured G range in the export | 1.731607–7.7999997 |
| Counts in 8 RA sectors × 3 equal-area latitude bands | 1,278–3,203 per stratum |
| Rows independently fetched from ESA Gaia Archive | **62** |

The [strata](../../cosmic-explorer/atlas/strata.json) cover all 24 sky areas, all three masks, negative parallaxes, RUWE above 1.4, bright and faint edges, both sides of RA 0°, and sources close to equal-area cell boundaries. The [ESA query](../../cosmic-explorer/atlas/esa-check.adql) looks up IDs without the export filter. The [frozen ESA response](../../cosmic-explorer/atlas/esa-check.csv) matched all 62 IDs and epochs, 531 numeric fields and 27 missing fields. RA and Dec were numerically identical. The maximum parallax difference was 0.000001375 mas, within the mirror precision tolerance. No class or distance is inferred from the comparisons.

The offline tests check every generated point and exact ID against the captured source, including single assignment to a half-open tile and local float32 rounding. The detail page retains the original decimal fields. Lalande 21185 is the one Gaia ID shared with First Light. The display gives that ID to its existing named marker, while each product reports its own counts.

## Packaging and reproducibility

The [ADQL](../../cosmic-explorer/atlas/gaia-dr3-g78.adql) and [capture receipt](../../cosmic-explorer/atlas/capture.json) pin the endpoints, times, row counts and input SHA-256. The 6,321,087-byte capture is frozen as 99 gzip CSV pages of up to 512 rows. Their interiors preserve the original CSV values and line endings. The offline builder reconstructs the exact captured stream, verifies its SHA-256 and the independent reference, then regenerates each derived asset. The same pages serve as detail payloads, so the archive has no second full copy of the astrometry.

| Payload | Shape and transfer |
| --- | --- |
| Manifest | 102,112 B, pinned SHA-256 `3bb12a15f935223739aeec921ddb0abbcbfe002e740f3ca0b2f948fbe506f5aa`. Validated once per browser mount. |
| Overview | One 196,620 B grid with exact counts for each solution mask in 128 × 128 equal-area cells. The grid contains only counts. |
| Single-source tiles | 271 CXT1 leaf packages plus uint64 identifiers, 24 B per point plus tile header. 9,232 B largest. The subdivision builds on Phase 1's equal-area quadtree and local coordinate codec. |
| Search | 90 shards keyed by the first two decimal digits. 23,996 B largest. Uses existing prefix search and yields at most 24 matches at a time. First Light's proven names and aliases remain searchable alongside it. |
| Details | 99 immutable gzip pages. 29,407 B largest compressed and 128 KiB maximum permitted decode. Detail lookup confirms the ID and mask from the index before changing selection. |
| Static budget | 463 Gaia files, 5,206,962 B together. The whole `dist/` contains 604 files in this candidate. A Gaia cold overview requests 298,732 raw payload bytes. Level-6 Gzip estimates 44,676 B for those two resources, before protocol overhead. |

Camera LOD runs on the same projection. It requests intersecting leaves after 55 ms of stable footprint and draws source positions only when the complete tile selection fits 14 packages and 1,600 points at widths below 500 px or 2,800 elsewhere. Otherwise it displays density. Pixel collisions are thinned for display, with brighter measured G bands drawn first. Density colours are mapped logarithmically within the active filter; smoothing is visual only. Whole intersecting cell totals can include sources outside the immediate viewport at its edges. The summary separates catalogue size, filter size, intersection count and actual drawn markers.

Atlas network concurrency is at most two tile requests, one search and one detail request. The caches are bounded by 768, 128 and 320 KiB respectively. The Phase 1 loader remains separate. A changed footprint aborts obsolete tile requests, changing a query or selection cancels that channel, and leaving the sky disposes all loaders and the raster. Returned data must still match the current scene. In the UI, an unloaded region, a failed/integrity-invalid resource, a region emptied by the mask filter and a genuinely empty **catalogue selection** each have distinct states. Unknown survey coverage is reported independently.

The packaged files are small compared with [Pages' published limits](https://developers.cloudflare.com/pages/platform/limits/) of 20,000 files on Free and 25 MiB per asset. The [static pricing terms](https://developers.cloudflare.com/pages/functions/pricing/) distinguish static requests from Functions. This branch needs static files only. The transfer estimates do not assume server-side compression, new storage, or an account-specific bill. Serve the archive over HTTPS or localhost with gzip detail pages delivered as files (no implicit content decoding of `.csv.gz`).

```sh
# Offline verification, using the immutable archived export
node scripts/build-real-sky.mjs --check
node scripts/build-explorer.mjs --check
node scripts/cosmic-data.mjs verify
node scripts/test.mjs
node scripts/check-benchmarks.mjs
node scripts/verify-original.mjs
npm ci
npx playwright install chromium
npm run test:browser

# Explicit network calls for reacquisition only
node scripts/fetch-real-sky.mjs gaia gaia-capture.csv
node scripts/fetch-real-sky.mjs esa-check gaia-reference.csv
node scripts/build-real-sky.mjs --from gaia-capture.csv
```

If fresh TAP bytes differ, inspect the change and create a new version. The pinned release is immutable. Browser and CI build/test paths use only local packaged data.

## Canvas measurements

Local Windows x64 headless Edge 146 on localhost, three 20-move trials per profile. The path changes zoom and pans in both denser and sparse real regions. It also leaves and returns to the explorer six times per profile, for **144 measured camera/lifecycle changes**. The browser suite exercises a held tile response, a corrupt payload, cancellation when switching to the Solar System, a held detail response superseded by a First Light selection, cold overview, direct marker selection, empty/filter states, keyboard and 320 px touch pinch under Reduced Motion.

| Metric, range across three trials | 1440 px desktop | 390 px emulated touch, 4× CPU |
| --- | ---: | ---: |
| CPU draw p50 | 0.1–0.2 ms | 0.6–0.9 ms |
| CPU draw p95 | 0.2–0.4 ms | 1.3–1.8 ms |
| Active frame interval p95 | 4.2 ms | 8.3–12.5 ms |
| Input dispatch to requested frame callback p95 | 3.9 ms | 3.0–4.0 ms |
| Largest observed Gaia cache during these trials | 302,492 B | 308,604 B |
| Gaia HTTP transfer over the complete stress path, including the six reopenings | 1.79 MB | 1.79 MB |
| JS heap after GC, before → after | 4.20 → 4.62 MB | 4.21 → 4.65 MB |

The first mapped overview was visible after 246 ms locally. At rest after settling there were zero more draws. Listener counts were 370 before and after in each profile. The final inspected state includes one selected source and more DOM nodes than the initial overview. The heap snapshots are spot checks, not a process-level or GPU memory measurement. The warm movement trials can stay within cached leaves or change footprint before a pending load begins. Cancellation is measured separately under held responses. Frame interval and callback timing are runner observations, not display latency or phone performance.

The Actions review artifact contains the three main screenshots, an Inspector close-up, and `real-sky-performance.json` and `real-sky-startup.json` for that exact run. Canvas 2D fits this capped workload. Testing WebGL2 would be useful only if a larger measured workload exceeds the intended frame or memory budgets.

## Next decision for 2C-B

First test the archived preview on a mid-range physical phone and check whether users can explain the difference between a bright-source density cell and a direction marker. Then test a separately labelled fainter Gaia tier, with a published brightness and sky-cell selection function and a coverage study. Keep the G ≤ 7.8 layer available to compare how the cut changes the view. Add better direction-quality filters or larger tiles only after comparing real transfer, p95 draw time and selection accuracy on those devices.
