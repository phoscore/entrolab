import {checkedBytes} from './catalog.mjs';
import {ByteLru,TileLoader,searchKey} from './foundation/access.mjs';
import {selectSkyLod} from './foundation/tiles.mjs';
import {requireData} from './foundation/schema.mjs';
import {DESI_RELEASE,DESI_FORMAT,DESI_COUNT,DESI_SIDE,DESI_PAGE_ROWS,DESI_Z_MIN,DESI_Z_SPLIT,DESI_Z_MAX,
  DESI_TILE_RADIUS,validDesiId,desiLines,desiRow,desiBand,desiSearchPath,desiFilter,desiDetailPath,
  decodeDesiOverview,decodeDesiTile} from './foundation/desi-format.mjs';
import {DESI_MANIFEST_SHA256} from './desi-pin.mjs';

export const DESI_URL = new URL(`./data/${DESI_RELEASE}/`,import.meta.url);
const utf8 = new TextDecoder('utf-8',{fatal:true});
const parse = bytes => JSON.parse(utf8.decode(bytes));

export async function loadDesiManifest(signal,fetcher = fetch) {
  const m = parse(await checkedBytes(new URL('manifest.json',DESI_URL),
    {bytes:192*1024,exact:false,sha256:DESI_MANIFEST_SHA256},signal,fetcher));
  requireData(m.release === DESI_RELEASE && m.format === DESI_FORMAT && m.tileFormat === 1 &&
    m.catalog === 'DESI DR1' && m.counts.sources === DESI_COUNT && m.tree.count === DESI_COUNT &&
    m.counts.low + m.counts.high === DESI_COUNT && m.overview.side === DESI_SIDE &&
    m.details.rows === DESI_PAGE_ROWS && m.footprint.radius === DESI_TILE_RADIUS &&
    m.footprint.samplesPerCell === 4 && m.selection.z.length === 3 &&
    m.selection.z.every((z,i)=>z === [DESI_Z_MIN,DESI_Z_SPLIT,DESI_Z_MAX][i]),
  'Incompatible DESI data release');
  return m;
}

export function makeDesiLoader(manifest, {parallel=2,bytes=512*1024,fetcher=fetch} = {}) {
  return new TileLoader((release,path,signal)=>{
    requireData(release === DESI_RELEASE && Object.hasOwn(manifest.packages,path),'Unknown DESI package');
    const url = new URL(path,DESI_URL);
    requireData(url.href.startsWith(DESI_URL.href),'DESI path outside data release');
    return checkedBytes(url,manifest.packages[path],signal,fetcher);
  },{parallel,maxQueued:14,cache:new ByteLru(bytes,48)});
}

export async function loadDesiOverview(manifest,loader) {
  return decodeDesiOverview(await loader.request(DESI_RELEASE,manifest.overview.path),manifest.counts);
}

export function planDesi(manifest,{viewport,zoom,width}) {
  if (zoom < .9) return {key:'overview',tiles:null};
  const {tiles,aggregates} = selectSkyLod(manifest.tree,viewport,{maxDepth:22,maxTiles:12,maxPoints:width < 500 ? 1450 : 2200});
  return aggregates.length ? {key:'overview',tiles:null} : {key:tiles.map(t=>t.path).join(','),tiles};
}

export async function loadDesiTiles(loader,plan) {
  return Promise.all(plan.tiles.map(async tile=>({
    ...decodeDesiTile(await loader.request(DESI_RELEASE,tile.path),tile.count),bounds:tile.bounds,
  })));
}

export function desiQuery(value) {
  const key = searchKey(value);
  const match = /^(?:desi(?: dr1)?\s+)?([1-9]\d{14,18})$/.exec(key);
  return match && validDesiId(match[1]) ? match[1] : null;
}

export async function findDesi(loader,id,filter) {
  const entries = parse(await loader.request(DESI_RELEASE,desiSearchPath(id)));
  const entry = entries.find(row=>row[0] === id);
  if (!entry) return null;
  const [,row,band] = entry;
  requireData(Number.isInteger(row) && row >= 0 && row < DESI_COUNT && (band === 0 || band === 1),'Invalid DESI search locator');
  return desiFilter(band,filter) ? {id,row,band} : null;
}

export async function desiDetail(manifest,loader,ref,signal) {
  requireData(Number.isInteger(ref.row) && ref.row >= 0 && ref.row < DESI_COUNT,'Invalid DESI detail locator');
  const path = desiDetailPath(ref.row);
  const packed = await loader.request(DESI_RELEASE,path);
  const expected = manifest.packages[path].decodedBytes;
  requireData(Number.isSafeInteger(expected) && expected > 0 && expected <= 128*1024,'Invalid DESI detail budget');
  const raw = new Uint8Array(expected);
  const reader = new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  let offset = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      const {done,value} = await reader.read();
      if (done) break;
      requireData(offset + value.length <= expected,'DESI detail exceeds decode budget');
      raw.set(value,offset);offset += value.length;
    }
  } finally {
    await reader.cancel().catch(()=>{});
    reader.releaseLock();
  }
  signal.throwIfAborted();
  requireData(offset === expected,'Incomplete DESI detail page');
  const lines = desiLines(raw);
  requireData(lines.length === Math.min(DESI_PAGE_ROWS,DESI_COUNT - Math.floor(ref.row/DESI_PAGE_ROWS)*DESI_PAGE_ROWS),'DESI detail page row count mismatch');
  const detail = desiRow(lines[ref.row % DESI_PAGE_ROWS]);
  requireData(detail.id === ref.id && desiBand(detail.z) === ref.band,'DESI detail identity mismatch');
  return detail;
}
