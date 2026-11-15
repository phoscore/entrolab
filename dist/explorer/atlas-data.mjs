import {checkedBytes} from './catalog.mjs';
import {ByteLru,TileLoader,searchKey,searchPrefix} from './foundation/access.mjs';
import {selectSkyLod} from './foundation/tiles.mjs';
import {requireData} from './foundation/schema.mjs';
import {ATLAS_FORMAT,ATLAS_RELEASE,DETAIL_ROWS,DENSITY_SIDE,atlasLines,atlasRow,atlasKey,detailPath,decodeDensity,decodeAtlasTile,decodeAtlasSearch,acceptsMask,maskOf} from './foundation/atlas-format.mjs';
import {ATLAS_MANIFEST_SHA256} from './atlas-pin.mjs';

export const ATLAS_URL = new URL(`./data/${ATLAS_RELEASE}/`,import.meta.url);
const decoder = new TextDecoder('utf-8',{fatal:true});
export const MIN_DETAIL_ZOOM = .82;
export const RESULT_LIMIT = 24;

export async function loadAtlasManifest(signal, fetcher = fetch) {
  const bytes = await checkedBytes(new URL('manifest.json',ATLAS_URL),{bytes:192*1024,exact:false,sha256:ATLAS_MANIFEST_SHA256},signal,fetcher);
  const manifest = JSON.parse(decoder.decode(bytes));
  requireData(manifest.atlasFormat===ATLAS_FORMAT && manifest.release===ATLAS_RELEASE &&
    manifest.tileVersion===1 && manifest.catalog==='Gaia DR3' && manifest.epoch===2016 &&
    manifest.timeScale==='TCB' && manifest.frame==='ICRS' && manifest.density.side===DENSITY_SIDE &&
    manifest.details.rowsPerPage===DETAIL_ROWS && manifest.tree.count===manifest.counts.sources,
    'Incompatible Gaia atlas release');
  return manifest;
}

export function makeAtlasLoader(manifest, {parallel=2,maxQueued=16,cache=new ByteLru(768*1024,96),fetcher=fetch}={}) {
  return new TileLoader((release,path,signal)=>{
    requireData(release===manifest.release && Object.hasOwn(manifest.packages,path),'Unknown Gaia atlas package');
    const url = new URL(path,ATLAS_URL);
    requireData(url.href.startsWith(ATLAS_URL.href),'Gaia atlas path outside release');
    return checkedBytes(url,manifest.packages[path],signal,fetcher);
  },{parallel,maxQueued,cache});
}

export async function loadDensity(manifest, loader) {
  return decodeDensity(await loader.request(manifest.release,manifest.density.path),manifest.counts.byMask);
}

export function planAtlas(manifest, viewport, zoom, width) {
  if (zoom<MIN_DETAIL_ZOOM) return {key:'density',mode:'density',tiles:[]};
  const {tiles,aggregates} = selectSkyLod(manifest.tree,viewport,{
    maxDepth:22,maxPoints:width<500?1600:2800,maxTiles:14,
  });
  // A viewport is either an honest complete detail view, or a density view.
  // There is no direction-biased partial tile selection at the resource ceiling.
  if (aggregates.length) return {key:'density',mode:'density',tiles:[]};
  return {key:'points:'+tiles.map(t=>t.path).join(','),mode:'points',tiles};
}

export async function loadAtlasTiles(manifest,loader,plan) {
  return Promise.all(plan.tiles.map(async tile=>{
    const bytes = await loader.request(manifest.release,tile.path);
    return {...decodeAtlasTile(bytes,tile.count,manifest.counts.sources),bounds:tile.bounds};
  }));
}

export function atlasPrefix(query) {
  return /^(?:gaia(?: dr3)?\s+)?([1-9]\d{1,18})$/.exec(searchKey(query))?.[1]??'';
}

export async function searchAtlas(manifest,loader,query,filter='all') {
  const key = atlasPrefix(query), prefix = key.slice(0,2);
  if (!key || !Object.hasOwn(manifest.search,prefix)) return {matches:[],total:0};
  const bytes = await loader.request(manifest.release,manifest.search[prefix]);
  const index = decodeAtlasSearch(bytes,prefix,manifest.counts.sources);
  const matches = searchPrefix(index,key,index.length).filter(item=>acceptsMask(filter,maskOf(item[3])));
  return {matches:matches.slice(0,RESULT_LIMIT).map(([,id,row,flag])=>({id,row,flag,key:atlasKey(id)})),total:matches.length};
}

async function inflatePage(bytes, limit, signal) {
  requireData(Number.isInteger(limit)&&limit>0&&limit<=128*1024,'Invalid Gaia detail decode budget');
  const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  const output = new Uint8Array(limit);
  let offset=0;
  try {
    while (true) {
      signal.throwIfAborted();
      const {value,done}=await reader.read();
      if (done) break;
      requireData(offset+value.length<=limit,'Gaia detail page exceeds decode budget');
      output.set(value,offset); offset+=value.length;
    }
  } finally {await reader.cancel().catch(()=>{});reader.releaseLock();}
  signal.throwIfAborted();
  requireData(offset===limit,'Incomplete Gaia detail page');
  return output;
}

export async function atlasDetail(manifest,loader,ref,signal) {
  requireData(Number.isInteger(ref.row)&&ref.row>=0&&ref.row<manifest.counts.sources,'Invalid Gaia detail row');
  const page = Math.floor(ref.row/DETAIL_ROWS), path=detailPath(page);
  const packed = await loader.request(manifest.release,path,2);
  const raw = await inflatePage(packed,manifest.packages[path].decodedBytes,signal);
  const lines = atlasLines(raw);
  requireData(lines.length===Math.min(DETAIL_ROWS,manifest.counts.sources-page*DETAIL_ROWS),'Gaia detail count mismatch');
  const detail = atlasRow(lines[ref.row%DETAIL_ROWS]);
  requireData(detail.id===ref.id && detail.mask===maskOf(ref.flag),'Gaia detail identity mismatch');
  return detail;
}
