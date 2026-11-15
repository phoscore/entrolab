import {checkedBytes} from './catalog.mjs';
import {ByteLru,TileLoader} from './foundation/access.mjs';
import {requireData} from './foundation/schema.mjs';
import {NEIGHBORHOOD_RELEASE,NEIGHBORHOOD_RADIUS,NEIGHBORHOOD_MAX_G,NEIGHBORHOOD_MAX_ROWS,NEIGHBORHOOD_PAGE_ROWS,
  NEIGHBORHOOD_EPOCH,neighborhoodDetailPath,unpackNeighborhood,neighborhoodLines,
  neighborhoodRow,galacticPosition} from './foundation/neighborhood-format.mjs';
import {NEIGHBORHOOD_MANIFEST_SHA256} from './neighborhood-pin.mjs';

export const NEIGHBORHOOD_URL=new URL(`./data/${NEIGHBORHOOD_RELEASE}/`,import.meta.url);
const utf8=new TextDecoder('utf-8',{fatal:true});

export async function loadNeighborhood(signal,fetcher=fetch) {
  const bytes=await checkedBytes(new URL('manifest.json',NEIGHBORHOOD_URL),
    {bytes:96*1024,exact:false,sha256:NEIGHBORHOOD_MANIFEST_SHA256},signal,fetcher);
  const manifest=JSON.parse(utf8.decode(bytes));
  requireData(manifest.release===NEIGHBORHOOD_RELEASE && manifest.format===1 && manifest.frame==='Galactic' &&
    manifest.origin==='Solar System' && manifest.epoch===NEIGHBORHOOD_EPOCH && manifest.radius===NEIGHBORHOOD_RADIUS &&
    manifest.maxG===NEIGHBORHOOD_MAX_G && manifest.pageRows===NEIGHBORHOOD_PAGE_ROWS &&
    Number.isInteger(manifest.count) && manifest.count>0 && manifest.count<=NEIGHBORHOOD_MAX_ROWS &&
    manifest.packages['positions.bin']?.bytes===12+24*manifest.count,'Incompatible neighborhood release');
  const points=await checkedBytes(new URL('positions.bin',NEIGHBORHOOD_URL),manifest.packages['positions.bin'],signal,fetcher);
  return {manifest,...unpackNeighborhood(points,manifest.count)};
}

export function neighborhoodLoader(manifest,fetcher=fetch) {
  return new TileLoader((release,path,signal)=>{
    const metadata=manifest.packages[path];
    requireData(release===NEIGHBORHOOD_RELEASE && /^details\/\d+\.csv$/.test(path) &&
      Object.hasOwn(manifest.packages,path) && Number.isInteger(metadata.bytes) && metadata.bytes>0 &&
      metadata.bytes<=64*1024,'Incompatible neighborhood detail page');
    return checkedBytes(new URL(path,NEIGHBORHOOD_URL),metadata,signal,fetcher);
  },{parallel:1,maxQueued:2,cache:new ByteLru(256*1024,12)});
}

export async function neighborhoodDetails(data,loader,index) {
  requireData(Number.isInteger(index) && index>=0 && index<data.ids.length,'Unknown neighborhood row');
  const bytes=await loader.request(NEIGHBORHOOD_RELEASE,neighborhoodDetailPath(index));
  const lines=neighborhoodLines(bytes), offset=index%NEIGHBORHOOD_PAGE_ROWS;
  requireData(lines.length===Math.min(NEIGHBORHOOD_PAGE_ROWS,data.ids.length-index+offset),'Incorrect neighborhood page size');
  const row=neighborhoodRow(lines[offset]);
  requireData(BigInt(row.id)===data.ids[index],'Neighborhood detail identity mismatch');
  const xyz=galacticPosition(row.ra,row.dec,row.median);
  requireData(xyz.every((v,i)=>Math.abs(v-data.xyz[3*index+i])<1e-5),'Neighborhood detail position mismatch');
  return {...row,xyz};
}
