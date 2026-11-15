import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {gunzipSync, gzipSync} from 'node:zlib';
import {readCsv} from './import.mjs';
import {buildTiles,skyCoordinates} from './tiles.mjs';
import {requireData} from './schema.mjs';
import {DESI_RELEASE,DESI_FORMAT,DESI_COUNT,DESI_SIDE,DESI_PAGE_ROWS,DESI_TILE_RADIUS,DESI_Z_MIN,DESI_Z_SPLIT,DESI_Z_MAX,
  DESI_HEADER,desiLines,desiRow,desiBand,desiDetailPath,desiSearchPath,encodeDesiTile,encodeDesiOverview} from '../dist/explorer/foundation/desi-format.mjs';

const source = new URL('./deep-sky/source/',import.meta.url);
export const desiHash = bytes => createHash('sha256').update(bytes).digest('hex');
const record = bytes => ({bytes:bytes.length,sha256:desiHash(bytes)});
const json = data => Buffer.from(JSON.stringify(data)+'\n');
const RAD = Math.PI/180;
const sin = Math.sin, cos = Math.cos;

export function desiFootprint(tiles) {
  // Sample four equal-area subcell centres. Integrate the union of nominal
  // angular fields, with spherical distances and periodic right ascension.
  const side = DESI_SIDE*2;
  const hits = new Uint8Array(side**2);
  const latitude = Array.from({length:side},(_,y)=>Math.asin(2*(y+.5)/side-1));
  const limit = DESI_TILE_RADIUS*RAD;
  for (const {ra,dec} of tiles) {
    const d = dec*RAD, a = ra*RAD;
    for (const [y,lat] of latitude.entries()) {
      if (Math.abs(lat-d)>limit) continue;
      const ratio = (cos(limit)-sin(lat)*sin(d))/(cos(lat)*cos(d));
      if (ratio >= 1) continue;
      const span = Math.acos(Math.max(-1,ratio));
      const left = Math.ceil((a-span)*side/(2*Math.PI)-.5);
      const right = Math.floor((a+span)*side/(2*Math.PI)-.5);
      for (let x=left;x<=right;x++) hits[y*side+(x+side)%side] = 1;
    }
  }
  const coverage = new Uint8Array(DESI_SIDE**2);
  for (let y=0;y<side;y++) for (let x=0;x<side;x++) coverage[(y>>1)*DESI_SIDE+(x>>1)] += hits[y*side+x];
  return coverage;
}

async function inputFile(name) {return readFile(new URL(name,source));}

export async function readDesiSource() {
  const receipt = JSON.parse(await inputFile('capture.json'));
  const raw = gunzipSync(await inputFile('capture.csv.gz'),{maxOutputLength:8*1024**2});
  requireData(receipt.rows === DESI_COUNT && raw.length === receipt.bytes && desiHash(raw) === receipt.sha256 &&
    receipt.table === 'desi_dr1.zpix','Unexpected DESI capture');
  const files = {};
  for (const name of ['tiles.csv','reference.csv','ACKNOWLEDGMENTS.md']) {
    const bytes = await inputFile(name);
    requireData(desiHash(bytes) === receipt.inputs[name],`DESI auxiliary snapshot changed: ${name}`);
    files[name] = bytes;
  }
  const lines = desiLines(raw);
  const rows = lines.map(desiRow);
  requireData(rows.length === DESI_COUNT && rows.every((r,i)=>!i || BigInt(r.id) > BigInt(rows[i-1].id)), 'Duplicate, unsorted or missing DESI rows');
  const tiles = readCsv(files['tiles.csv'].toString('utf8')).map(t=>{
    requireData(t.tileid && t.ra && t.dec,'Incomplete DESI observation tile');
    return {id:Number(t.tileid),ra:Number(t.ra),dec:Number(t.dec)};
  });
  requireData(tiles.length === receipt.footprint.rows && tiles.length > 1000 && tiles.every((t,i)=>
    Number.isInteger(t.id) && t.id > (tiles[i-1]?.id??0) && t.ra >= 0 && t.ra < 360 && Math.abs(t.dec) <= 90),'Invalid DESI tile footprint');
  const reference = readCsv(files['reference.csv'].toString('utf8'));
  checkDesiReference(rows,reference,receipt.reference.rows);
  return {rows,lines,tiles,receipt,ack:files['ACKNOWLEDGMENTS.md'].toString('utf8')};
}

function checkDesiReference(rows,reference,count) {
  requireData(reference.length === count && reference.length >= 30 &&
    new Set(reference.map(r=>r.targetid)).size === count && new Set(reference.map(r=>r.healpix)).size >= 10,'Insufficient independent DESI comparisons');
  const byId = new Map(rows.map(row=>[row.id,row]));
  const fields = {mean_fiber_ra:'ra', mean_fiber_dec:'dec', z:'z', zerr:'zerr', deltachi2:'deltachi2'};
  for (const r of reference) {
    const row = byId.get(r.targetid);
    requireData(row && row.healpix === Number(r.healpix) &&
      row.zwarn === Number(r.zwarn) && row.bgsTarget === Number(r.bgs_target) &&
      row.spectype === r.spectype && r.objtype === 'TGT', `DESI FITS identity/quality mismatch for ${r.targetid}`);
    for (const [key,field] of Object.entries(fields)) {
      const val = Number(r[key]);
      requireData(r[key] !== '' && Number.isFinite(val) && Math.abs(val-row[field]) <= Math.max(1e-15,Math.abs(val)*2e-13),
        `DESI FITS mismatch for ${r.targetid}: ${key}`);
    }
  }
}

export async function buildDeepSky() {
  const {rows,lines,tiles,receipt,ack} = await readDesiSource();
  const files = new Map(), packages = {};
  const put = (path,bytes,extra={})=>{
    files.set(path,bytes);packages[path]={...record(bytes),...extra};
  };
  const low = new Uint16Array(DESI_SIDE**2), high = new Uint16Array(DESI_SIDE**2);
  const u = new Float64Array(rows.length), v = new Float64Array(rows.length);
  const searches = new Map();
  const counts = {sources:rows.length,low:0,high:0};
  rows.forEach((row,i)=>{
    [u[i],v[i]] = skyCoordinates(row.ra,row.dec);
    const cell = Math.floor(v[i]*DESI_SIDE)*DESI_SIDE+Math.floor(u[i]*DESI_SIDE);
    const band = desiBand(row.z);
    (band?high:low)[cell]++;
    counts[band?'high':'low']++;
    const path = desiSearchPath(row.id);
    if (!searches.has(path)) searches.set(path,[]);
    searches.get(path).push([row.id,i,band]);
  });
  const coverage = desiFootprint(tiles);
  put('overview.bin',encodeDesiOverview(low,high,coverage));
  const tree = buildTiles(u,v,(node,page,indices)=>{
    const path = `tiles/${node.id}-${page}.bin`;
    put(path,encodeDesiTile(node,indices,u,v,rows));
    (node.files??=[]).push({path,count:indices.length,bounds:node.bounds});
  },320);
  for (let row=0;row<lines.length;row+=DESI_PAGE_ROWS) {
    const page = Buffer.from(DESI_HEADER+'\n'+lines.slice(row,row+DESI_PAGE_ROWS).join('\n')+'\n');
    requireData(page.length <= 128*1024,'Oversized DESI detail page');
    const zip = gzipSync(page,{level:6});
    zip[9]=255;
    put(desiDetailPath(row),zip,{decodedBytes:page.length});
  }
  for (const [path,entries] of searches) put(path,json(entries));
  const credits = `# DESI DR1 · Deep Sky

Data from the Dark Energy Spectroscopic Instrument (DESI), DR1, Iron spectroscopic reductions. DOI [10.3847/1538-3881/ae4c43](https://doi.org/10.3847/1538-3881/ae4c43), DESI Collaboration et al. (2026), *Data Release 1 of the Dark Energy Spectroscopic Instrument*.

DESI data in this product are licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) under the [official DESI data licence and acknowledgment requirements](https://data.desi.lbl.gov/doc/acknowledgments/). Gaia has its own data licence. Website source-code terms are separate.

Changes to the original catalogue include the selection of Main Survey Bright BGS bright targets and selected columns, grouping rows into detail pages, and deriving the spatial and search index, density grid and approximate tile footprint. The detail pages preserve the numeric fields of the frozen NOIRLab export. No distances or galaxy morphologies were added.

## DESI acknowledgments

${ack}`;
  put('CREDITS.md',Buffer.from(credits));
  const manifest = {release:DESI_RELEASE,format:DESI_FORMAT,tileFormat:1,catalog:'DESI DR1',
    source:{table:receipt.table,sha256:receipt.sha256,capturedAt:receipt.capturedAt,endpoint:receipt.endpoint},
    selection:{survey:'main',program:'bright',target:'BGS_BRIGHT',spectype:'GALAXY',z:[DESI_Z_MIN,DESI_Z_SPLIT,DESI_Z_MAX]},
    counts,overview:{path:'overview.bin',side:DESI_SIDE},
    footprint:{kind:'recorded-tile-centres',radius:DESI_TILE_RADIUS,tiles:tiles.length,samplesPerCell:4,source:receipt.footprint.url},
    details:{rows:DESI_PAGE_ROWS},tree,packages};
  const manifestBytes = json(manifest);
  files.set('manifest.json',manifestBytes);
  return {files,manifest,manifestHash:desiHash(manifestBytes),referenceRows:receipt.reference.rows,
    footprintSquareDegrees:coverage.reduce((sum,n)=>sum+n,0)/(4*DESI_SIDE**2)*(129600/Math.PI)};
}
