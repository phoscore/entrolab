import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync,gzipSync} from 'node:zlib';
import {join} from 'node:path';
import {buildTiles,skyCoordinates} from './tiles.mjs';
import {ATLAS_FORMAT,ATLAS_RELEASE,CSV_HEADER,DETAIL_ROWS,DENSITY_SIDE,MASKS,atlasLines,atlasRow,detailPath,encodeAtlasSearch,encodeAtlasTile,encodeDensity} from './atlas-format.mjs';
import {readCsv} from './import.mjs';
import {requireData} from './schema.mjs';

const input = new URL('./atlas/',import.meta.url);
export const atlasSha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const capture = JSON.parse(await readFile(new URL('capture.json',input)));
const LEAF_POINTS = 384;
const MAX_DETAILS_BYTES = 128*1024;
const json = value => Buffer.from(JSON.stringify(value)+'\n');
const csvBytes = lines => Buffer.from([CSV_HEADER,...lines,''].join('\r\n'));
const gzip = bytes => {
  const packed = gzipSync(bytes,{level:6});
  packed[9]=255; // Stable OS byte across platforms.
  return packed;
};

export async function frozenExport(directory) {
  const lines = [];
  for (let page=0;page<Math.ceil(capture.rows/DETAIL_ROWS);page++) {
    const bytes = await readFile(join(directory,detailPath(page)));
    requireData(bytes.length<=MAX_DETAILS_BYTES,'Oversized Gaia detail page');
    const block = atlasLines(gunzipSync(bytes,{maxOutputLength:MAX_DETAILS_BYTES}));
    requireData(block.length===Math.min(DETAIL_ROWS,capture.rows-page*DETAIL_ROWS),'Gaia detail page count mismatch');
    lines.push(...block);
  }
  return csvBytes(lines);
}

export async function buildAtlas(exportBytes) {
  requireData(exportBytes.length===capture.bytes && atlasSha256(exportBytes)===capture.sha256,'Gaia CSV snapshot digest mismatch');
  const lines = atlasLines(exportBytes), rows = lines.map(atlasRow);
  requireData(rows.length===capture.rows,'Gaia CSV count mismatch');
  const solutionCounts = Object.fromEntries(MASKS.map(mask=>[mask,0]));
  const density = new Uint32Array(DENSITY_SIDE**2*MASKS.length);
  const skyStrata = Array.from({length:3},()=>Array(8).fill(0));
  const stats = {negativeParallax:0,nullParallax:0,nullRuwe:0,ruweAbove14:0,nullRaError:0,nullDecError:0,gRange:[Infinity,-Infinity],skyStrata};
  const u = new Float64Array(rows.length), v = new Float64Array(rows.length);
  const prefixes = new Map();
  let previous = 0n;
  for (const [index,row] of rows.entries()) {
    const id = BigInt(row.id);
    requireData(id>previous,'Gaia input must be ordered with unique 64-bit IDs');
    previous=id;
    [u[index],v[index]]=skyCoordinates(row.ra,row.dec);
    const x=Math.floor(u[index]*DENSITY_SIDE),y=Math.floor(v[index]*DENSITY_SIDE);
    density[(y*DENSITY_SIDE+x)*MASKS.length+MASKS.indexOf(row.mask)]++;
    solutionCounts[row.mask]++;
    skyStrata[Math.floor(v[index]*3)][Math.floor(u[index]*8)]++;
    stats.negativeParallax+=Number(row.parallax<0);
    stats.nullParallax+=Number(row.parallax===null);
    stats.nullRuwe+=Number(row.ruwe===null);
    stats.ruweAbove14+=Number(row.ruwe>1.4);
    stats.nullRaError+=Number(row.raError===null);
    stats.nullDecError+=Number(row.decError===null);
    stats.gRange[0]=Math.min(row.g,stats.gRange[0]);stats.gRange[1]=Math.max(row.g,stats.gRange[1]);
    const prefix=row.id.slice(0,2);
    if (!prefixes.has(prefix)) prefixes.set(prefix,[]);
    prefixes.get(prefix).push(index);
  }
  requireData(MASKS.every(mask=>solutionCounts[mask]===capture.solutionCounts[mask]),'Gaia solution counts differ from archive');

  const files = new Map(), packages = {};
  const put = (path,bytes,details={}) => {
    files.set(path,bytes);
    packages[path]={bytes:bytes.length,sha256:atlasSha256(bytes),...details};
  };
  put('density.bin',encodeDensity(density));
  const tree = buildTiles(u,v,(node,page,indices)=>{
    const path=`tiles/${node.id}-${page}.bin`;
    put(path,encodeAtlasTile(node,indices,u,v,rows));
    (node.files??=[]).push({path,count:indices.length,bounds:node.bounds});
  },LEAF_POINTS);
  for (let i=0;i<lines.length;i+=DETAIL_ROWS) {
    const data=csvBytes(lines.slice(i,i+DETAIL_ROWS));
    requireData(data.length<=MAX_DETAILS_BYTES,'Gaia detail page exceeds decode budget');
    put(detailPath(i/DETAIL_ROWS),gzip(data),{decodedBytes:data.length});
  }
  const search = {};
  for (const [prefix,indices] of [...prefixes].sort(([a],[b])=>a<b?-1:1)) {
    const path=`search/${prefix}.bin`;
    search[prefix]=path;
    put(path,encodeAtlasSearch(indices,rows));
  }
  put('CREDITS.md',await readFile(new URL('CREDITS.md',input)));
  const manifest = {
    release:ATLAS_RELEASE, atlasFormat:ATLAS_FORMAT,tileVersion:1,
    catalog:'Gaia DR3',frame:'ICRS',epoch:2016,timeScale:'TCB',
    source:{table:'gaia.dr3lite',endpoint:capture.endpoint,capturedAt:capture.capturedAt,sha256:capture.sha256,rows:capture.rows},
    selection:{maxG:7.8,solutionMasks:MASKS,classification:'unclassified',coverage:'unknown',geometry:'all-sky',excludedByPositionOrMask:capture.brightCountBeforePositionAndMaskFilter-capture.rows},
    counts:{sources:rows.length,byMask:solutionCounts,...stats},
    density:{path:'density.bin',side:DENSITY_SIDE}, details:{rowsPerPage:DETAIL_ROWS}, tree, search, packages,
  };
  files.set('manifest.json',json(manifest));
  return {manifest,files,rows};
}

export async function auditAtlas(rows) {
  const raw = await readFile(new URL('esa-check.csv',input));
  requireData(atlasSha256(raw)===capture.esa.sha256,'ESA reference snapshot digest mismatch');
  const original = readCsv(raw.toString('utf8'));
  const strata = JSON.parse(await readFile(new URL('strata.json',input)));
  const byId = new Map(rows.map(r=>[r.id,r]));
  const strataIds = new Set(strata.map(s=>s.id));
  requireData(strataIds.size===capture.esa.rows && original.length===strataIds.size,'Gaia cross-check count mismatch');
  const maximum = {};
  const fields = {ra:'ra',dec:'dec',g:'phot_g_mean_mag',mask:'astrometric_params_solved',parallax:'parallax',parallaxError:'parallax_error',ruwe:'ruwe',raError:'ra_error',decError:'dec_error'};
  let missing=0, compared=0;
  for (const entry of original) {
    const id=entry.source_id, row=byId.get(id);
    requireData(row && strataIds.delete(id) && Number(entry.ref_epoch)===2016,'Gaia source identity or epoch mismatch');
    for (const [field,key] of Object.entries(fields)) {
      const source=entry[key];
      const expected=source==='' || source==='NaN' ? null : Number(source);
      const actual=row[field];
      requireData((actual===null)===(expected===null),'Gaia mirror changed a missing value');
      if (actual===null) {missing++;continue;}
      const delta=Math.abs(actual-expected);
      const tolerance=field==='ra'||field==='dec'?2e-12:field==='mask'?0:Math.max(1e-9,Math.abs(expected)*2e-7);
      requireData(delta<=tolerance,`Gaia mirror mismatch for ${id}: ${key}: ${delta}`);
      maximum[key]=Math.max(maximum[key]??0,delta);
      compared++;
    }
  }
  return {rows:original.length,compared,missing,maximum};
}
