"""Acquire the bounded DESI Main/BGS Bright DR1 extract. The site never runs this."""
import csv
import gzip
import hashlib
import io
import json
import math
import sys
from collections import defaultdict
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from astropy.io import fits

ROOT = "https://data.desi.lbl.gov/public/dr1/spectro/redux/iron/"
MIRROR = "https://datalab.noirlab.edu/query/query"
LICENSE = "https://data.desi.lbl.gov/doc/acknowledgments/"
COLUMNS = ("targetid,mean_fiber_ra,mean_fiber_dec,z,zerr,zwarn,deltachi2,healpix,"
           "bgs_target,spectype,zcat_primary,desiname")
WHERE = """survey='main' AND program='bright' AND zcat_primary
AND spectype='GALAXY' AND zwarn=0 AND deltachi2>40 AND zerr>0 AND (bgs_target & 2)=2
AND z>=0.003 AND z<0.025 AND mean_fiber_ra>=0 AND mean_fiber_ra<360
AND mean_fiber_dec BETWEEN -90 AND 90"""
EXPECTED = 32392
MIB = 1024**2


def digest(data):
    return hashlib.sha256(data).hexdigest()


def get(url, max_bytes, mirror=False):
    headers = {"User-Agent": "entrolab/Deep-Sky (DESI DR1 public catalogue)"}
    if mirror:
        headers["X-DL-AuthToken"] = "anonymous.0.0.anon_access"
    with urlopen(Request(url, headers=headers), timeout=70) as response:
        data = response.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise ValueError(f"Resource exceeds {max_bytes} byte cap: {url}")
    return data


def query(sql, cap):
    params = urlencode({"sql": sql, "ofmt": "csv", "out": "", "async": "False"})
    return get(f"{MIRROR}?{params}", cap, mirror=True)


def save_csv(path, fieldnames, rows):
    with path.open("w", newline="", encoding="utf-8") as out:
        writer = csv.writer(out, lineterminator="\n")
        writer.writerow(fieldnames)
        writer.writerows(rows)


class Acknowledgments(HTMLParser):
    def __init__(self):
        super().__init__()
        self.collecting = False
        self.parts = []
        self.paragraph = None

    def handle_starttag(self, tag, attrs):
        if tag == "h2":
            self.collecting = dict(attrs).get("id") == "acknowledgments"
        if self.collecting and tag == "p":
            self.paragraph = []

    def handle_endtag(self, tag):
        if tag == "p" and self.paragraph is not None:
            self.parts.append(" ".join("".join(self.paragraph).split()))
            self.paragraph = None

    def handle_data(self, data):
        if self.paragraph is not None:
            self.paragraph.append(data)


def credits(path):
    raw = get(LICENSE, 120_000)
    parser = Acknowledgments()
    parser.feed(raw.decode("utf-8"))
    start = next(i for i, p in enumerate(parser.parts) if p.startswith("This research used data"))
    paragraphs = parser.parts[start:]
    if len(paragraphs) != 3 or not paragraphs[-1].endswith("listed funding agencies."):
        raise ValueError("DESI acknowledgment template changed")
    path.write_text("\n\n".join(paragraphs) + "\n", encoding="utf-8", newline="\n")
    return digest(raw)


def get_footprint(path):
    raw = get(ROOT + "tiles-iron.fits", 2 * MIB)
    with fits.open(io.BytesIO(raw)) as hdus:
        table = hdus["TILES"].data
        ra_key, dec_key = ("TILERA", "TILEDEC") if "TILERA" in table.names else ("RA", "DEC")
        rows = [
            (int(row["TILEID"]), float(row[ra_key]), float(row[dec_key]))
            for row in table
            if str(row["SURVEY"]).strip().lower() == "main"
            and str(row["PROGRAM"]).strip().lower() == "bright"
        ]
    rows.sort()
    if not 1000 < len(rows) < 8000 or len({r[0] for r in rows}) != len(rows):
        raise ValueError("Unexpected set of DESI Main Bright observation tiles")
    save_csv(path, ("tileid", "ra", "dec"), rows)
    return {"url": ROOT + "tiles-iron.fits", "sourceBytes": len(raw),
            "sourceSha256": digest(raw), "rows": len(rows), "hdu": "TILES",
            "columns": ["TILEID", ra_key, dec_key, "SURVEY", "PROGRAM"]}


def choose_checks(rows):
    # Stratify by RA and equal-area declination. Sweep redshift quantiles in
    # occupied cells, then include the smallest Delta-chi-squared solutions.
    strata = defaultdict(list)
    for row in rows:
        ra, dec = float(row["mean_fiber_ra"]), float(row["mean_fiber_dec"])
        cell = (int(ra / 45), min(2, int((math.sin(math.radians(dec)) + 1) * 1.5)))
        strata[cell].append(row)
    ordered = [sorted(strata[cell], key=lambda r: float(r["z"])) for cell in sorted(strata)]
    checks = {}
    for group in ordered:
        for fraction in (0.07, 0.49, 0.94):
            row = group[int(fraction * (len(group) - 1))]
            checks[row["targetid"]] = row
    for row in sorted(rows, key=lambda r: float(r["deltachi2"]))[:5]:
        checks[row["targetid"]] = row
    if not 30 <= len(checks) <= 60:
        raise ValueError(f"Invalid reference sample size: {len(checks)}")
    return checks


def independent_reference(rows, path):
    by_pixel = defaultdict(dict)
    for target_id, row in rows.items():
        by_pixel[int(row["healpix"])][int(target_id)] = row
    results, snapshots = [], []
    total = 0
    for pixel, targets in sorted(by_pixel.items()):
        endpoint = f"{ROOT}healpix/main/bright/{pixel // 100}/{pixel}/redrock-main-bright-{pixel}.fits"
        raw = get(endpoint, min(5 * MIB, 110 * MIB - total))
        total += len(raw)
        snapshots.append({"healpix": pixel, "bytes": len(raw), "sha256": digest(raw)})
        with fits.open(io.BytesIO(raw)) as hdus:
            redshifts = hdus["REDSHIFTS"].data
            fibermap = hdus["FIBERMAP"].data
            if len(redshifts) != len(fibermap) or not (redshifts["TARGETID"] == fibermap["TARGETID"]).all():
                raise ValueError(f"Incoherent original HDUs in pixel {pixel}")
            for i, cat in enumerate(redshifts):
                name = int(cat["TARGETID"])
                if name not in targets:
                    continue
                f = fibermap[i]
                results.append((name, pixel, float(f["MEAN_FIBER_RA"]), float(f["MEAN_FIBER_DEC"]),
                                float(cat["Z"]), float(cat["ZERR"]), int(cat["ZWARN"]),
                                float(cat["DELTACHI2"]), str(cat["SPECTYPE"]).strip(),
                                int(f["BGS_TARGET"]), str(f["OBJTYPE"]).strip()))
    results.sort()
    if len(results) != len(rows) or {str(r[0]) for r in results} != rows.keys():
        raise ValueError("Official FITS comparisons are incomplete")
    save_csv(path, ("targetid", "healpix", "mean_fiber_ra", "mean_fiber_dec", "z", "zerr", "zwarn",
                    "deltachi2", "spectype", "bgs_target", "objtype"), results)
    return {"directory": ROOT + "healpix/main/bright/", "files": snapshots,
            "sourceBytes": total, "rows": len(results)}


def main(output):
    count_query = f"SELECT count(*) AS n FROM desi_dr1.zpix WHERE {WHERE}"
    count = int(next(csv.DictReader(io.StringIO(query(count_query, 1024).decode())))["n"])
    if count != EXPECTED:
        raise ValueError(f"Selection count {count} differs from verified preflight count {EXPECTED}")
    sql = f"SELECT {COLUMNS} FROM desi_dr1.zpix WHERE {WHERE}\nORDER BY targetid"
    raw = query(sql, 8 * MIB)
    parser = csv.DictReader(io.StringIO(raw.decode("utf-8")))
    rows = list(parser)
    ids = [int(row["targetid"]) for row in rows]
    if ",".join(parser.fieldnames) != COLUMNS or len(ids) != count or sorted(set(ids)) != ids:
        raise ValueError("NOIRLab returned a truncated, duplicate, unordered or incompatible export")
    print(f"Selected {count} rows, {len(raw)} exact CSV bytes", flush=True)
    output.mkdir(parents=True, exist_ok=False)
    (output / "capture.csv.gz").write_bytes(gzip.compress(raw, compresslevel=6, mtime=0))
    license_hash = credits(output / "ACKNOWLEDGMENTS.md")
    footprints = get_footprint(output / "tiles.csv")
    reference = independent_reference(choose_checks(rows), output / "reference.csv")
    receipt = {"table": "desi_dr1.zpix", "endpoint": MIRROR, "capturedAt": datetime.now(timezone.utc).isoformat(),
               "bytes": len(raw), "sha256": digest(raw), "rows": count, "query": sql, "countQuery": count_query,
               "footprint": footprints, "reference": reference, "acknowledgmentsSourceSha256": license_hash,
               "inputs": {name: digest((output / name).read_bytes())
                          for name in ("ACKNOWLEDGMENTS.md", "tiles.csv", "reference.csv")}}
    (output / "capture.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({**receipt, "reference": {k: v for k, v in reference.items() if k != "files"}}, indent=2), flush=True)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
