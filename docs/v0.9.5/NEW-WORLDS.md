# Our Home: Moon systems and Pluto (Phase 2F-C1)

## Source and resource decision, before import

Checked 17 November 2026 against [JPL satellite ephemerides](https://ssd.jpl.nasa.gov/sats/ephem/files.html), [Horizons vector API](https://ssd-api.jpl.nasa.gov/doc/horizons.html), [SSD data terms](https://ssd.jpl.nasa.gov/faq.html) and [NAIF rules](https://naif.jpl.nasa.gov/naif/rules.html). JUP365 covers the four Galilean moons, PLU060 covers Pluto/Charon. Direct SPK downloads are large: JUP365 1,108,796,416 bytes, JUP347 876,787,712 bytes, PLU060 116,884,480 bytes (HTTP Content-Length, 17 November 2026). The official Horizons API returns precisely selected, geometric vectors for the same sources. Its small pilot request returned 200 OK and the required TDB / ecliptic J2000 / km and km/s metadata. We therefore use bounded Horizons captures, never fetch ephemerides in the browser, and do not copy SPICE Toolkit binaries into the repository.

NASA/JPL SSD describes the data it provides as public domain, requires that modifications be made clear and discourages excessive network calls. NAIF permits downloading and use of its kernels, and redistribution of *unmodified* NAIF kernels; its Toolkit redistribution rules are separate. Our numerical exports are **derived Horizons data**, labelled as such, with exact request parameters, source bytes and hashes archived. They do not grant any rights to Gaia (CC BY-NC 3.0 IGO), DESI or the site's own code. NASA/JPL/Caltech endorsement is not implied.

### Trial measurements

An independent 30-day J2000 pilot queried ten named target/center pairs, then queried **half-step epochs independently** for cubic Hermite comparison. Position / velocity maximum residuals from all pilot midpoints:

| Target relative to center | Step | Midpoints | Max position (km) | Max speed (km/s) |
| --- | ---: | ---: | ---: | ---: |
| Earth center / Earth–Moon barycenter | 6 h | 120 | 0.00023 | 0.00000000020 |
| Moon / Earth–Moon barycenter | 6 h | 120 | 0.019 | 0.000000016 |
| Jupiter center / Jupiter-system barycenter | 12 h | 60 | 0.53 | 0.0000044 |
| Io / Jupiter-system barycenter | 3 h | 240 | **44** | 0.00038 |
| Europa / Jupiter-system barycenter | 6 h | 120 | **72** | 0.00032 |
| Ganymede / Jupiter-system barycenter | 12 h | 60 | **105** | 0.00022 |
| Callisto / Jupiter-system barycenter | 12 h | 60 | 6.6 | 0.0000062 |
| Pluto-system barycenter / Sun | 24 h | 30 | 0.000003 | 0.00000000003 |
| Pluto / Pluto-system barycenter | 12 h | 60 | 0.33 | 0.00000074 |
| Charon / Pluto-system barycenter | 12 h | 60 | 2.7 | 0.0000061 |

The short-period Galilean moons require closer samples. The production choice is 1 h Io, 3 h Europa, 4 h Ganymede and 8 h Callisto; other pilot spacings remain. The exact maximum errors for the actual release need new independent interstitial samples across its time span; the pilot figures **must not** be presented as a global accuracy guarantee.

### Bounded release contract

Candidate window: 2025-01-01 00:00 through 2030-01-01 00:00 **TDB**, containing the current epoch but deliberately narrower than the old 1800–2050 approximate eight-planet model. Ten distinct target/center vectors (Earth, Moon; Jupiter, four moons; Pluto barycenter, Pluto, Charon) plus 30 or more independent off-grid reference checks per object. Expected ~105,000 vector records, ~25 MB raw API response before compression, ~6 MB compact binary hosting. Actual measured byte sizes, interpolation residuals and request count are required before shipping. Explicitly show unavailable states outside coverage; never extrapolate a new object or silently substitute a circular orbit.

**Frame combination.** Earth/Moon states are relative to the Earth–Moon barycenter (`3`); Jupiter and four moons are relative to the Jupiter-system barycenter (`5`); Pluto/Charon are relative to their barycenter (`9`), which is separately positioned relative to the Sun (`10`). All vector requests specify `TIME_TYPE=TDB`, `REF_SYSTEM=ICRF`, `REF_PLANE=ECLIPTIC`, `OUT_UNITS=KM-S`, `VEC_TABLE=2`, `VEC_CORR=NONE`. The old approximate Earth and Jupiter barycenter heliocentric positions are only anchors for their local systems; the relative satellite geometry remains internally consistent. Cross-system and Sun comparisons using those anchors are a **hybrid approximation** and must be labelled and checked against independent Horizons anchor vectors before display. The old planetary model is not replaced. No high-precision geocentric Earth or Jupiter center is claimed from its existing planet glyphs.

Scientific error can include kernel fit errors, mixed-model anchor differences and interpolation. Interpolation checks constrain only the last of these. Absolute values are rounded according to their actual combined validity.
