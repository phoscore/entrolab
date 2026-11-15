"""Acquire bounded public Gaia/Bailer-Jones snapshots. Never called by the viewer."""
import concurrent.futures
import csv
import gzip
import hashlib
import io
import json
import math
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen, build_opener, HTTPRedirectHandler
from urllib.parse import urlencode, urljoin, urlsplit

import astropy
from astropy import units as u
from astropy.coordinates import SkyCoord
from astropy.io.votable import parse_single_table

GAVO = "https://dc.g-vo.org/tap/"
AIP = "https://gaia.aip.de/tap/sync"
ESA = "https://gea.esac.esa.int/tap-server/tap/sync"
VIZIER = "https://vizier.cfa.harvard.edu/viz-bin/asu-tsv"
QUALITY = """ra>=0 AND ra<360 AND dec BETWEEN -90 AND 90
AND astrometric_params_solved IN (31,95) AND visibility_periods_used>=10
AND ruwe>0 AND ruwe<1.4 AND parallax>=5 AND parallax_error>0
AND parallax>=10*parallax_error AND r_lo_geo>0 AND r_lo_geo<=r_med_geo
AND r_med_geo<=r_hi_geo AND r_hi_geo-r_lo_geo<=0.2*r_med_geo"""
TABLE = "gedr3dist.litewithdist"
FIELDS = ("source_id,ra,dec,parallax,parallax_error,phot_g_mean_mag,ruwe,"
          "astrometric_params_solved,visibility_periods_used,r_lo_geo,r_med_geo,r_hi_geo")
MAX_ROWS = 25000
MIN_PROBES = 30
GAIA_COLUMNS = ("source_id","ra","dec","ref_epoch","parallax","parallax_error")
DISTANCE_COLUMNS = ("source_id","r_lo_geo","r_med_geo","r_hi_geo")
KNOWN = ("5853498713190525696", "4472832130942575872", "762815470562110464")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def request(url, params=None, timeout=35):
    data = urlencode(params).encode() if params else None
    return urlopen(Request(url, data=data, headers={"User-Agent":"entrolab stellar-neighborhood public-data capture"}), timeout=timeout)


def read(response, max_bytes):
    with response:
        raw = response.read(max_bytes+1)
    if len(raw)>max_bytes:
        raise ValueError("Archive response exceeds byte budget")
    return raw


def tap_args(query, cap):
    return {"REQUEST":"doQuery","LANG":"ADQL","QUERY":query,"FORMAT":"csv","MAXREC":str(cap)}


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def gavo_async(query, row_cap, byte_cap):
    params = tap_args(query, row_cap) | {"PHASE":"RUN", "RUNID":"entrolab-stellar-neighborhood"}
    endpoint = GAVO+"async"
    opener = build_opener(NoRedirect)
    try:
        opener.open(Request(endpoint,data=urlencode(params).encode()), timeout=35).close()
    except HTTPError as error:
        if error.code not in (302,303) or not error.headers.get("Location"):
            raise
        location = urlsplit(urljoin(endpoint,error.headers["Location"]))
        error.close()
    else:
        raise RuntimeError("No UWS job location")
    match = re.fullmatch(r"(?:/tap|/__system__/tap/run)/async/([A-Za-z0-9_-]+)/?",location.path)
    if not match:
        raise RuntimeError(f"Unexpected GAVO UWS location path: {location.path.rsplit('/',1)[0]}")
    job = "https://dc.g-vo.org"+location.path.rstrip("/")
    deadline = time.monotonic()+90
    while time.monotonic() < deadline:
        state = read(request(job+"/phase"),512).decode().strip()
        if state == "COMPLETED":
            return read(request(job+"/results/result"),byte_cap)
        if state in ("ABORTED","ERROR","UNKNOWN"):
            details=read(request(job+"/error"),16000).decode("utf8","replace")
            raise RuntimeError(f"GAVO UWS {state}: {details[:1500]}")
        if state == "PENDING":
            with request(job+"/phase",{"PHASE":"RUN"}):
                pass
        time.sleep(4)
    with request(job+"/phase",{"PHASE":"ABORT"}):
        pass
    raise TimeoutError("GAVO job exceeded the planned acquisition time ceiling")


def csv_dict(data):
    parser = csv.DictReader(io.StringIO(data.decode("utf-8-sig")))
    return tuple(parser.fieldnames or ()), list(parser)


def tap_rows(endpoint, sql):
    raw=read(request(endpoint,tap_args(sql,200),timeout=30),400_000)
    if raw.lstrip().startswith(b"<"):
        table=parse_single_table(io.BytesIO(raw)).to_table()
        return [{k.lower(): v.item() if hasattr(v,"item") else v for k,v in zip(table.colnames,row)}
                for row in table]
    _, rows = csv_dict(raw)
    return [{k.lower():v for k,v in row.items()} for row in rows]


def validate_ids(rows, source_ids):
    if len(rows)!=len(source_ids) or {str(r["source_id"]) for r in rows}!=set(source_ids):
        raise ValueError("Reference rows did not contain every requested source exactly once")
    return sorted(rows,key=lambda r:int(r["source_id"]))


def get_gaia(source_ids):
    where=" WHERE source_id IN ("+",".join(source_ids)+")"
    sql="SELECT "+",".join(GAIA_COLUMNS)+" FROM gaiadr3.gaia_source"+where
    for host in (AIP,ESA):
        try:
            return validate_ids(tap_rows(host,sql),source_ids), {"url":host,"query":sql}
        except Exception as error:
            print(f"Gaia reference {host}: {error}",flush=True)
    raise RuntimeError("No complete independent Gaia DR3 astrometry snapshot")


def vizier_tsv(source_ids, host):
    columns = ("Source","b_rgeo","rgeo","B_rgeo")
    query = urlencode({"-source":"I/352/gedr3dis","-out":",".join(columns),"-out.max":"200",
                       "Source":",".join(source_ids)})
    url=host+"?"+query
    raw=read(request(url,timeout=30),400_000).decode("utf-8")
    lines=[line for line in raw.splitlines() if not line.startswith("#") and line.strip()]
    header=next(i for i,line in enumerate(lines) if line.split("\t")[0].strip()=="Source")
    names=[field.strip() for field in lines[header].split("\t")]
    rows=[]
    for line in lines[header+1:]:
        cells=[field.strip() for field in line.split("\t")]
        if cells[0].isdigit():
            fields=dict(zip(names,cells))
            rows.append(dict(zip(DISTANCE_COLUMNS,(fields[name] for name in columns))))
    return validate_ids(rows,source_ids), {"url":host,"query":query,"catalog":"VizieR I/352"}


def get_distances(source_ids):
    where=" WHERE source_id IN ("+",".join(source_ids)+")"
    sql="SELECT "+",".join(DISTANCE_COLUMNS)+" FROM external.gaiaedr3_distance"+where
    for url in ("https://vizier.cds.unistra.fr/viz-bin/asu-tsv",VIZIER):
        try:
            return vizier_tsv(source_ids,url)
        except Exception as error:
            print(f"Bailer-Jones reference {url}: {error}",flush=True)
    try:
        return validate_ids(tap_rows(ESA,sql),source_ids),{"url":ESA,"query":sql,"catalog":"external.gaiaedr3_distance"}
    except Exception as error:
        print(f"Bailer-Jones reference {ESA}: {error}",flush=True)
    # A second independent distribution path with explicit ADQL column names.
    sql = ('SELECT Source AS source_id, "b_rgeo" AS r_lo_geo, rgeo AS r_med_geo, '
           '"B_rgeo" AS r_hi_geo FROM "I/352/gedr3dis" WHERE Source IN ('+",".join(source_ids)+")")
    for url in ("https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync",
                "https://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync"):
        try:
            return validate_ids(tap_rows(url,sql),source_ids),{"url":url,"query":sql,"catalog":"VizieR I/352"}
        except Exception as error:
            print(f"Bailer-Jones reference {url}: {error}",flush=True)
    raise RuntimeError("No complete independent Bailer-Jones distance snapshot")


def select_reference(rows):
    groups={}
    for r in rows:
        ra,dec=float(r["ra"]),float(r["dec"])
        key=int(ra/60),min(2,int((math.sin(math.radians(dec))+1)*1.5))
        groups.setdefault(key,[]).append(r)
    picked=set()
    for cell in sorted(groups):
        layer=sorted(groups[cell],key=lambda v:float(v["r_med_geo"]))
        picked.update(layer[round(f*(len(layer)-1))]["source_id"] for f in (.08,.5,.94))
    picked.update(r["source_id"] for r in sorted(rows,key=lambda r:-((float(r["r_hi_geo"])-float(r["r_lo_geo"]))/float(r["r_med_geo"])))[:4])
    picked.update(r["source_id"] for r in rows if r["source_id"] in KNOWN)
    if len(picked)<MIN_PROBES:
        raise RuntimeError("Insufficient sky/range strata for independent checks")
    return sorted(picked,key=int)


def save(path, rows, fields):
    with path.open("w",encoding="utf8",newline="") as out:
        writer=csv.DictWriter(out,fieldnames=fields,lineterminator="\n",extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def run(output,radius,max_g):
    where=QUALITY+f" AND r_med_geo<={radius} AND phot_g_mean_mag<={max_g}"
    select=f"SELECT {FIELDS} FROM {TABLE} WHERE {where} ORDER BY source_id"
    count_sql=f"SELECT source_id FROM {TABLE} WHERE {where} ORDER BY source_id"
    limits = {"row_cap": MAX_ROWS+1, "byte_cap": 8*1024**2}
    def get(sql):
        try:
            return read(request(GAVO+"sync",tap_args(sql,limits["row_cap"])),limits["byte_cap"])
        except Exception as error:
            print(f"GAVO synchronous request failed: {error}",flush=True)
            if radius<=10:
                raise
            return gavo_async(sql,**limits)
    raw=get(select)
    cols,rows=csv_dict(raw)
    ids=[int(r["source_id"]) for r in rows]
    check_ids=[int(r["source_id"]) for r in csv_dict(get(count_sql))[1]]
    expected=len(check_ids)
    if check_ids!=ids:
        raise ValueError("The independent identifier export disagrees with the full export")
    if ",".join(cols)!=FIELDS or not 30<=len(rows)==expected<=MAX_ROWS or ids!=sorted(set(ids)):
        raise ValueError(f"Truncated, duplicate or incompatible source data. Count={expected}, export={len(rows)}")
    print(f"Frozen {len(rows)} complete rows, {len(raw)} raw bytes, SHA-256 {digest(raw)}",flush=True)
    source_ids=select_reference(rows)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        gaia=pool.submit(get_gaia,source_ids)
        distance=pool.submit(get_distances,source_ids)
        g,g_meta=gaia.result()
        d,d_meta=distance.result()
    print(f"Independent probes: {len(g)} Gaia at {g_meta['url']}, {len(d)} Bailer-Jones at {d_meta['url']}",flush=True)
    medians={r["source_id"]:float(r["r_med_geo"]) for r in rows}
    vectors=[]
    for gr in g:
        key=str(gr["source_id"])
        c=SkyCoord(ra=float(gr["ra"])*u.deg,dec=float(gr["dec"])*u.deg,distance=medians[key]*u.pc,frame="icrs")
        vectors.append({"source_id":key,"pc":list(map(float,c.galactic.cartesian.xyz.to_value(u.pc)))})
    output.mkdir(parents=True,exist_ok=False)
    (output/"capture.csv.gz").write_bytes(gzip.compress(raw,compresslevel=6,mtime=0))
    save(output/"gaia-reference.csv",g,GAIA_COLUMNS)
    save(output/"distance-reference.csv",d,DISTANCE_COLUMNS)
    (output/"galactic-reference.json").write_text(json.dumps(vectors,indent=2)+"\n",encoding="utf8",newline="\n")
    receipt={"table":TABLE,"endpoint":GAVO+"async","capturedAt":datetime.now(timezone.utc).isoformat(),
             "query":select,"idCheckQuery":count_sql,"idCheckRows":expected,"radius":radius,"maxG":max_g,"rows":len(rows),
             "bytes":len(raw),"sha256":digest(raw),"reference":{"gaia":g_meta,"distances":d_meta,"astropy":astropy.__version__,"ids":source_ids},
             "inputs":{name:digest((output/name).read_bytes()) for name in
                       ("gaia-reference.csv","distance-reference.csv","galactic-reference.json")}}
    (output/"capture.json").write_text(json.dumps(receipt,indent=2)+"\n",encoding="utf8",newline="\n")
    print(f"Archive rows={len(rows)} reference rows={len(source_ids)} selected named IDs={sorted(set(KNOWN)&set(str(i) for i in ids))}",flush=True)


if __name__=="__main__":
    if len(sys.argv) != 4:
        raise SystemExit("Use: fetch-neighborhood.py new-output-directory radius-pc max-G")
    run(Path(sys.argv[1]),float(sys.argv[2]),float(sys.argv[3]))
