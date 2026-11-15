import {requireData} from './schema.mjs';
import {decodeTile, encodeTile, TILE_LIMIT} from './tiles.mjs';

export const ATLAS_RELEASE = 'v0.9.5-gaia-dr3-g78.1';
export const ATLAS_FORMAT = 1;
export const DETAIL_ROWS = 512;
export const DENSITY_SIDE = 128;
export const MASKS = [3, 31, 95];
export const CSV_HEADER = 'source_id,ra,dec,phot_g_mean_mag,astrometric_params_solved,parallax,parallax_error,ruwe,ra_error,dec_error';
const TILE_HEADER = 16, TILE_STRIDE = 16;
const ID_LIMIT = 0x7fffffffffffffffn;
const SEARCH_HEADER = 12, SEARCH_STRIDE = 16;
const DENSITY_HEADER = 12;
const numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const decoder = new TextDecoder('utf-8',{fatal:true});

function scalar(value, label, optional = false) {
  if (optional && value === '') return null;
  requireData(numeric.test(value) && Number.isFinite(Number(value)), `Invalid Gaia ${label}`);
  return Number(value);
}

export function atlasRow(line) {
  const fields = line.split(',');
  requireData(fields.length === 10, 'Invalid Gaia atlas CSV row width');
  const [id, ...values] = fields;
  requireData(/^[1-9]\d{0,18}$/.test(id) && BigInt(id) <= ID_LIMIT,'Invalid Gaia source_id');
  const [ra,dec,g,mask,parallax,parallaxError,ruwe,raError,decError] = values.map((v,i)=>scalar(v,i,i>=4));
  requireData(ra>=0 && ra<360 && dec>=-90 && dec<=90 && g<=7.8,'Gaia row outside sky or photometry selection');
  requireData(MASKS.includes(mask) && (mask===3)===(parallax===null) &&
    (parallax===null)===(parallaxError===null) && (parallaxError===null || parallaxError>0), 'Gaia solution/parallax mismatch');
  requireData([ruwe,raError,decError].every(v=>v===null || v>0),'Invalid Gaia uncertainty or RUWE');
  return {id,ra,dec,g,mask,parallax,parallaxError,ruwe,raError,decError};
}

// Capture and detail pages retain the numeric GAVO CSV rows byte for byte.
export function atlasLines(bytes) {
  const [header,...lines] = decoder.decode(bytes).split('\r\n');
  requireData(header === CSV_HEADER && lines.at(-1)==='', 'Unexpected Gaia CSV header or line endings');
  lines.pop();
  return lines;
}

export const detailPath = page => `details/${page}.csv.gz`;
export const atlasKey = id => 'gaia:DR3:'+encodeURIComponent(id);
export const maskOf = flag => flag & 255;
export const magnitudeBin = g => g <= 4 ? 0 : g <= 5.5 ? 1 : g <= 6.7 ? 2 : 3;
export const flagOf = row => row.mask | (magnitudeBin(row.g) << 8);
export const acceptsMask = (filter,mask) => filter === 'all' || (filter === 'position' ? mask === 3 : mask === 31 || mask === 95);
const validFlag = f => MASKS.includes(maskOf(f)) && (f >>> 8) < 4;

// A CXT1 packet followed by one exact uint64 source ID per row. The base tile
// still uses a global uint32 row locator and float32 offsets in the local cell.
export function encodeAtlasTile(node, indices, u, v, rows) {
  const packet = encodeTile(node,indices,u,v,{flags:i=>flagOf(rows[i])});
  const bytes = new Uint8Array(packet.length + 8*indices.length);
  bytes.set(packet);
  const view = new DataView(bytes.buffer);
  for (const [i,row] of indices.entries()) view.setBigUint64(packet.length+8*i,BigInt(rows[row].id),true);
  return bytes;
}

export function decodeAtlasTile(bytes, count, total) {
  const end = TILE_HEADER+TILE_STRIDE*count;
  requireData(Number.isInteger(count) && count>0 && count<=TILE_LIMIT && bytes.length===end+8*count,'Invalid atlas tile length');
  const packet = decodeTile(bytes.subarray(0,end),count);
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const ids = [];
  for (let i=0;i<count;i++) {
    const id = view.getBigUint64(end+8*i,true);
    requireData(id>0n && id<=ID_LIMIT && packet.rows[i]<total && validFlag(packet.flags[i]),'Invalid Gaia tile identity or flags');
    ids.push(String(id));
  }
  return {...packet,ids};
}

// CXI1: ordered by decimal ID string, using the same prefix algorithm as Phase 1.
export function encodeAtlasSearch(indices, rows) {
  const ordered = [...indices].sort((a,b)=>rows[a].id<rows[b].id?-1:1);
  const bytes = new Uint8Array(SEARCH_HEADER+ordered.length*SEARCH_STRIDE);
  bytes.set([67,88,73,49]);
  const view = new DataView(bytes.buffer);
  view.setUint32(4,ordered.length,true);
  for (const [i,row] of ordered.entries()) {
    const offset = SEARCH_HEADER+i*SEARCH_STRIDE;
    view.setBigUint64(offset,BigInt(rows[row].id),true);
    view.setUint32(offset+8,row,true);
    view.setUint32(offset+12,flagOf(rows[row]),true);
  }
  return bytes;
}

export function decodeAtlasSearch(bytes, prefix, total) {
  requireData(bytes.length>=SEARCH_HEADER && [67,88,73,49].every((b,i)=>bytes[i]===b),'Invalid Gaia search header');
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const count = view.getUint32(4,true);
  requireData(view.getUint32(8,true)===0 && bytes.length===SEARCH_HEADER+count*SEARCH_STRIDE,'Invalid Gaia search length');
  const entries = [];
  let previous = '';
  for (let i=0;i<count;i++) {
    const offset = SEARCH_HEADER+i*SEARCH_STRIDE;
    const n = view.getBigUint64(offset,true), id=String(n);
    const row = view.getUint32(offset+8,true), flag = view.getUint32(offset+12,true);
    requireData(n>0n && n<=ID_LIMIT && id.startsWith(prefix) && id>previous && row<total && validFlag(flag),'Invalid Gaia search entry');
    entries.push([id,id,row,flag]); previous=id;
  }
  return entries;
}

// CXD1: exact uint32 counts by equal-area cell and astrometric solution mask.
export function encodeDensity(counts) {
  requireData(counts.length===DENSITY_SIDE**2*MASKS.length,'Invalid Gaia density dimensions');
  const bytes = new Uint8Array(DENSITY_HEADER+counts.length*4);
  bytes.set([67,88,68,49]);
  const view = new DataView(bytes.buffer);
  view.setUint16(4,DENSITY_SIDE,true);
  view.setUint16(6,MASKS.length,true);
  for (let i=0;i<counts.length;i++) view.setUint32(DENSITY_HEADER+4*i,counts[i],true);
  return bytes;
}

export function decodeDensity(bytes, expected) {
  requireData(bytes.length === DENSITY_HEADER+DENSITY_SIDE**2*MASKS.length*4 &&
    [67,88,68,49].every((b,i)=>bytes[i]===b),'Invalid Gaia density packet');
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  requireData(view.getUint16(4,true)===DENSITY_SIDE && view.getUint16(6,true)===MASKS.length &&
    view.getUint32(8,true)===0,'Invalid Gaia density dimensions');
  const sums = [0,0,0];
  const counts = Uint32Array.from({length:DENSITY_SIDE**2*MASKS.length},(_,i)=>{
    const number = view.getUint32(DENSITY_HEADER+4*i,true); sums[i%MASKS.length]+=number; return number;
  });
  requireData(sums.every((n,i)=>n===expected[MASKS[i]]),'Gaia density counts do not match manifest');
  return counts;
}
