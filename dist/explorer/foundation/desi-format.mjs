import {requireData} from './schema.mjs';
import {decodeTile, encodeTile, TILE_LIMIT} from './tiles.mjs';

export const DESI_RELEASE = 'v0.9.5-desi-dr1-bgs-z025.1';
export const DESI_FORMAT = 1;
export const DESI_COUNT = 32392;
export const DESI_SIDE = 128;
export const DESI_PAGE_ROWS = 384;
export const DESI_Z_MIN = .003, DESI_Z_SPLIT = .012, DESI_Z_MAX = .025;
export const DESI_TILE_RADIUS = 1.605;
export const DESI_HEADER = 'targetid,mean_fiber_ra,mean_fiber_dec,z,zerr,zwarn,deltachi2,healpix,bgs_target,spectype,zcat_primary,desiname';
const ID_MAX = 0x7fffffffffffffffn;
const OVERVIEW_MAGIC = [68, 83, 73, 49];
const text = new TextDecoder('utf-8',{fatal:true});
const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export const validDesiId = id => typeof id === 'string' && /^[1-9]\d{0,18}$/.test(id) && BigInt(id) <= ID_MAX;
export const desiBand = z => Number(z >= DESI_Z_SPLIT);
export const desiFilter = (band, filter) => filter === 'all' || (band === 0 ? filter === 'low' : filter === 'high');
export const desiSearchPath = id => `search/${BigInt(id) % 32n}.json`;
export const desiDetailPath = row => `details/${Math.floor(row / DESI_PAGE_ROWS)}.csv.gz`;

export function desiLines(bytes, expected = DESI_HEADER) {
  const [header,...lines] = text.decode(bytes).split('\n');
  requireData(header === expected && lines.at(-1) === '', 'Incompatible DESI CSV header or ending');
  lines.pop();
  return lines;
}

export function desiRow(line) {
  const [id,...fields] = line.split(',');
  requireData(validDesiId(id) && fields.length === 11, 'Invalid DESI row identity or width');
  const numeric = fields.slice(0,8);
  requireData(numeric.every(v=>decimal.test(v) && Number.isFinite(Number(v))), 'Missing or invalid DESI measurement');
  const [ra,dec,z,zerr,zwarn,deltachi2,healpix,bgsTarget] = numeric.map(Number);
  const [spectype,primary,name] = fields.slice(8);
  requireData(spectype === 'GALAXY' && primary === 't' && zwarn === 0 && deltachi2 > 40 && zerr > 0 &&
    z >= DESI_Z_MIN && z < DESI_Z_MAX && ra >= 0 && ra < 360 && dec >= -90 && dec <= 90 &&
    Number.isInteger(healpix) && healpix >= 0 && healpix < 49152 &&
    Number.isSafeInteger(bgsTarget) && bgsTarget >= 2 && (BigInt(bgsTarget)&2n) === 2n &&
    /^DESI J\d{3}\.\d{4}[+-]\d{2}\.\d{4}$/.test(name), 'DESI row fails released selection');
  return {id,ra,dec,z,zerr,zwarn,deltachi2,healpix,bgsTarget,spectype,name};
}

export function encodeDesiTile(node, indices, u, v, rows) {
  const base = encodeTile(node,indices,u,v,{flags:i=>desiBand(rows[i].z)});
  const bytes = new Uint8Array(base.length + 8*indices.length);
  bytes.set(base);
  const view = new DataView(bytes.buffer);
  indices.forEach((row,i)=>view.setBigUint64(base.length + 8*i,BigInt(rows[row].id),true));
  return bytes;
}
export function decodeDesiTile(bytes, count) {
  const end = 16 + 16*count;
  requireData(Number.isInteger(count) && count > 0 && count <= TILE_LIMIT && bytes.length === end + 8*count, 'Invalid DESI tile length');
  const packet = decodeTile(bytes.subarray(0,end),count);
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const ids = Array.from(packet.rows,(row,i)=>{
    const id = String(view.getBigUint64(end + 8*i,true));
    requireData(validDesiId(id) && row < DESI_COUNT && packet.flags[i] <= 1, 'Invalid DESI tile entry');
    return id;
  });
  return {...packet,ids};
}

export function encodeDesiOverview(low,high,coverage) {
  const cells = DESI_SIDE**2;
  requireData(low.length === cells && high.length === cells && coverage.length === cells, 'Invalid DESI overview dimensions');
  const out = new Uint8Array(8 + cells*5);
  out.set(OVERVIEW_MAGIC);
  const view = new DataView(out.buffer);
  view.setUint16(4,DESI_SIDE,true);
  for (let i=0;i<cells;i++) {
    view.setUint16(8+5*i,low[i],true);
    view.setUint16(10+5*i,high[i],true);
    out[12+5*i] = coverage[i];
  }
  return out;
}
export function decodeDesiOverview(bytes, expected) {
  const cells = DESI_SIDE**2;
  requireData(bytes.length === 8 + cells*5 && OVERVIEW_MAGIC.every((b,i)=>bytes[i] === b), 'Invalid DESI overview');
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  requireData(view.getUint16(4,true) === DESI_SIDE && view.getUint16(6,true) === 0, 'Invalid DESI overview dimensions');
  const low = new Uint16Array(cells), high = new Uint16Array(cells), coverage = new Uint8Array(cells);
  let sumLow = 0, sumHigh = 0;
  for (let i=0;i<cells;i++) {
    sumLow += low[i] = view.getUint16(8+5*i,true);
    sumHigh += high[i] = view.getUint16(10+5*i,true);
    coverage[i] = bytes[12+5*i];
    requireData(coverage[i] <= 4, 'Invalid DESI footprint sample count');
  }
  requireData(sumLow === expected.low && sumHigh === expected.high, 'DESI overview count mismatch');
  return {low,high,coverage};
}
