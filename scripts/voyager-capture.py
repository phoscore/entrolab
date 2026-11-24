"""Capture original JPL Horizons text serially. No browser requests."""
import argparse
import datetime as dt
import gzip
import hashlib
import json
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request

RELEASE = "v0.9.5-voyager-1977-2026.1"
ROOT = Path(__file__).resolve().parents[1] / "cosmic-explorer/data/raw" / RELEASE
ENDPOINT = "https://ssd.jpl.nasa.gov/api/horizons.api"
DAY_ZERO = 2440587.5
END = "2026-11-26"
SOURCES = {
    "v1": (-31, "1977-09-06", ["1979-03-05", "1980-11-12"]),
    "v2": (-32, "1977-08-21", ["1979-07-09", "1981-08-26", "1986-01-24", "1989-08-25"]),
    "earth": (399, "1977-08-21", []),
}


def jd(iso):
    return DAY_ZERO + (dt.date.fromisoformat(iso) - dt.date(1970, 1, 1)).days


def grid(name, start, flybys):
    if name == "earth":
        bands = [(jd(start), jd(END), 48)]
    else:
        cursor = jd(start)
        bands = [(cursor, cursor+4, 1)]
        cursor += 4
        for encounter in map(jd, flybys):
            bands += [(cursor, encounter-16, 48), (encounter-16, encounter-3, 6),
                      (encounter-3, encounter+3, 1), (encounter+3, encounter+16, 6)]
            cursor = encounter+16
        bands += [(cursor, jd("1990-01-01"), 48), (jd("1990-01-01"), jd(END), 192)]
    for start, end, hours in bands:
        # Include the shared boundaries explicitly, with a one-day remainder if needed.
        while start < end:
            stop = min(end, start + 2800*hours/24)
            whole = start + int((stop-start)*24/hours + 1e-8)*hours/24
            if whole > start:
                yield start, whole, hours
            if whole < stop:
                yield whole, stop, 24 if (stop-whole).is_integer() else 1
            start = stop


def queries(name, start, flybys):
    bands = list(grid(name, start, flybys))
    refs = []
    for left, right, hours in bands:
        count = round((right-left)*24/hours)
        step = hours/24
        for i in range(min(count, 5)):
            cell = int((i+.5)*count/min(count, 5))
            refs.append(left+step*(cell+[.173,.381,.5,.694,.831][i]))
    for number, (left, right, hours) in enumerate(bands):
        args = {"START_TIME": f"JD{left:.10f}", "STOP_TIME": f"JD{right:.10f}", "STEP_SIZE": f"{hours} h"}
        yield f"{name}-grid-{number:02}", args, [left, right, hours]
    if name == "v2":
        yield "v2-refine-neptune", {"START_TIME": "1989-Aug-29 06:00",
                                  "STOP_TIME": "1989-Aug-29 12:00", "STEP_SIZE": "5 m"}, [2447767.75, 2447768, 1/12]
    for number in range(0, len(refs), 25):
        days = refs[number:number+25]
        yield f"{name}-reference-{number//25:02}", {"TLIST_TYPE": "JD", "TLIST": " ".join(f"'{x:.10f}'" for x in days)}, days


def capture():
    ROOT.mkdir(parents=True, exist_ok=True)
    files = []
    for name, (target, start, flybys) in SOURCES.items():
        for label, span, schedule in queries(name, start, flybys):
            options = dict(COMMAND=target, CENTER="500@10", MAKE_EPHEM="YES", OBJ_DATA="NO",
                           EPHEM_TYPE="VECTORS", TIME_TYPE="TDB", REF_SYSTEM="ICRF",
                           REF_PLANE="ECLIPTIC", VEC_CORR="NONE", OUT_UNITS="KM-S",
                           VEC_TABLE=2, CSV_FORMAT="YES", CAL_FORMAT="BOTH", **span)
            url = ENDPOINT + "?" + urllib.parse.urlencode({
                "format": "text", **{k: v if k == "TLIST" else f"'{v}'" for k, v in options.items()}
            })
            path = ROOT / (label + ".txt.gz")
            if path.exists():
                archive = path.read_bytes()
                original = gzip.decompress(archive)
            else:
                for delay in (0, 3, 12):
                    time.sleep(delay)
                    req = urllib.request.Request(url, headers={"User-Agent": "Entrolab offline ephemeris capture (phoscore/entrolab)"})
                    try:
                        with urllib.request.urlopen(req, timeout=75) as response:
                            original = response.read(2_000_001)
                        break
                    except (urllib.error.URLError, TimeoutError) as error:
                        if delay == 12 or getattr(error, "code", 500) < 429:
                            raise
                archive = gzip.compress(original, compresslevel=9, mtime=0)
            text = original.decode()
            header, found, _ = text.partition("$$SOE")
            identity = re.search(r"Target body name: (.*?) \((-?\d+)\).*?\{source:\s*([^}]+)", header)
            if len(original)>2_000_000 or not found or not identity or int(identity[2]) != target:
                raise ValueError(f"{label}: wrong Horizons response: {text[:1600]}")
            if not path.exists():
                path.write_bytes(archive)
                time.sleep(.3)
            files.append(dict(file=path.name, url=url, name=name, target=target, identity=identity[1],
                              source=identity[3].strip(), schedule=schedule, reference="TLIST" in span,
                              bytes=len(original), sha256=hashlib.sha256(original).hexdigest(),
                              gzipSha256=hashlib.sha256(archive).hexdigest()))
            print(f"{label}: {len(original)} B, {identity[3]}", flush=True)
    (ROOT/"manifest.json").write_text(json.dumps(dict(release=RELEASE, files=files), indent=2)+"\n")


if __name__ == "__main__":
    argparse.ArgumentParser(description=__doc__).parse_args()
    capture()
