import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {readCsv} from './import.mjs';
import {requireData} from './schema.mjs';
import {NEIGHBORHOOD_RELEASE,NEIGHBORHOOD_RADIUS,NEIGHBORHOOD_MAX_G,NEIGHBORHOOD_PAGE_ROWS,NEIGHBORHOOD_MAX_ROWS,
  NEIGHBORHOOD_EPOCH,NEIGHBORHOOD_HEADER,neighborhoodLines,neighborhoodRow,neighborhoodDetailPath,
  packNeighborhood,galacticPosition} from '../dist/explorer/foundation/neighborhood-format.mjs';

const root = new URL('./neighborhood/source/',import.meta.url);
export const neighborhoodSha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=name=>readFile(new URL(name,root));

export async function readNeighborhoodSource() {
  const receipt=JSON.parse(await read('capture.json'));
  const raw=gunzipSync(await read('capture.csv.gz'),{maxOutputLength:8*1024**2});
  requireData(receipt.table==='gedr3dist.litewithdist' && receipt.radius===NEIGHBORHOOD_RADIUS && receipt.maxG===NEIGHBORHOOD_MAX_G &&
    raw.length===receipt.bytes && neighborhoodSha(raw)===receipt.sha256,'Neighborhood capture digest or selection mismatch');
  const lines=neighborhoodLines(raw), rows=lines.map(neighborhoodRow);
  requireData(rows.length===receipt.rows && rows.length===receipt.idCheckRows && rows.length>0 && rows.length<=NEIGHBORHOOD_MAX_ROWS &&
    rows.every((row,i)=>!i||BigInt(row.id)>BigInt(rows[i-1].id)), 'Missing, duplicate or unordered neighborhood sources');
  const refs={};
  for (const file of ['gaia-reference.csv','distance-reference.csv','galactic-reference.json']) {
    const bytes=await read(file);
    requireData(neighborhoodSha(bytes)===receipt.inputs[file],`Neighborhood reference digest mismatch: ${file}`);
    refs[file]=bytes.toString('utf8');
  }
  const checks=checkReferences(rows,receipt,refs);
  return {receipt,rows,lines,checks};
}

const close=(a,b,tolerance)=>Number.isFinite(b)&&Math.abs(a-b)<=tolerance;
function checkReferences(rows,receipt,refs) {
  const source=new Map(rows.map(r=>[r.id,r]));
  const gaia=readCsv(refs['gaia-reference.csv']), distances=readCsv(refs['distance-reference.csv']);
  const xyz=JSON.parse(refs['galactic-reference.json']);
  const size=receipt.reference.ids.length;
  for (const set of [gaia.map(r=>r.source_id),distances.map(r=>r.source_id),xyz.map(r=>r.source_id)]) {
    requireData(size>=30 && set.length===size && new Set(set).size===size && receipt.reference.ids.every(id=>set.includes(id)),
      'Independent neighborhood reference IDs differ');
  }
  const max={angleDeg:0,parallaxMas:0,distancePc:0,vectorPc:0};
  for (const g of gaia) {
    const r=source.get(g.source_id);
    requireData(r && Number(g.ref_epoch)===NEIGHBORHOOD_EPOCH && g.ra && g.dec && g.parallax && g.parallax_error &&
      close(r.ra,Number(g.ra),1e-8) && close(r.dec,Number(g.dec),1e-8) &&
      close(r.parallax,Number(g.parallax),Math.max(2e-6,Math.abs(r.parallax)*2e-7)) &&
      close(r.parallaxError,Number(g.parallax_error),2e-7),'Independent Gaia astrometry disagrees');
    max.angleDeg=Math.max(max.angleDeg,Math.abs(r.ra-Number(g.ra)),Math.abs(r.dec-Number(g.dec)));
    max.parallaxMas=Math.max(max.parallaxMas,Math.abs(r.parallax-Number(g.parallax)));
  }
  for (const d of distances) {
    const r=source.get(d.source_id);
    requireData(r,'Unknown independent distance source');
    for (const [key,field] of [['lo','r_lo_geo'],['median','r_med_geo'],['hi','r_hi_geo']]) {
      requireData(d[field] && close(r[key],Number(d[field]),3e-5),'Independent distance quantile disagrees');
      max.distancePc=Math.max(max.distancePc,Math.abs(r[key]-Number(d[field])));
    }
  }
  for (const v of xyz) {
    const r=source.get(v.source_id);
    const position=galacticPosition(r.ra,r.dec,r.median);
    const delta=Math.hypot(...position.map((n,i)=>n-v.pc[i]));
    requireData(delta<2e-5,'Independent Astropy Galactic coordinate differs');
    max.vectorPc=Math.max(max.vectorPc,delta);
  }
  return {rows:size,max};
}

export async function buildNeighborhood() {
  const {rows,lines,receipt,checks}=await readNeighborhoodSource();
  const files=new Map(), packages={};
  const put=(path,bytes)=>{files.set(path,bytes);packages[path]={bytes:bytes.length,sha256:neighborhoodSha(bytes)};};
  put('positions.bin',packNeighborhood(rows));
  for(let row=0;row<rows.length;row+=NEIGHBORHOOD_PAGE_ROWS) {
    const bytes=Buffer.from(NEIGHBORHOOD_HEADER+'\n'+lines.slice(row,row+NEIGHBORHOOD_PAGE_ROWS).join('\n')+'\n');
    requireData(bytes.length<=64*1024,'Neighborhood detail page exceeds byte budget');
    put(neighborhoodDetailPath(row),bytes);
  }
  put('CREDITS.md',await readFile(new URL('./neighborhood/CREDITS.md',import.meta.url)));
  const manifest={release:NEIGHBORHOOD_RELEASE,format:1,frame:'Galactic',origin:'Solar System',epoch:NEIGHBORHOOD_EPOCH,
    count:rows.length,radius:NEIGHBORHOOD_RADIUS,maxG:NEIGHBORHOOD_MAX_G,pageRows:NEIGHBORHOOD_PAGE_ROWS,
    source:{table:receipt.table,capturedAt:receipt.capturedAt,sha256:receipt.sha256},packages};
  const manifestBytes=Buffer.from(JSON.stringify(manifest)+'\n');
  files.set('manifest.json',manifestBytes);
  return {manifest,manifestHash:neighborhoodSha(manifestBytes),files,checks};
}
