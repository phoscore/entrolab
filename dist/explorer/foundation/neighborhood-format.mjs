import {requireData} from './schema.mjs';

export const NEIGHBORHOOD_RELEASE = 'v0.9.5-neighborhood-25pc-g14.1';
export const NEIGHBORHOOD_RADIUS = 25;
export const NEIGHBORHOOD_MAX_G = 14;
export const NEIGHBORHOOD_MAX_ROWS = 25000;
export const NEIGHBORHOOD_PAGE_ROWS = 160;
export const NEIGHBORHOOD_EPOCH = 2016;
export const PC_TO_LY = (648000/Math.PI)*149597870700/(299792458*365.25*86400);
export const NEIGHBORHOOD_HEADER = 'source_id,ra,dec,parallax,parallax_error,phot_g_mean_mag,ruwe,astrometric_params_solved,visibility_periods_used,r_lo_geo,r_med_geo,r_hi_geo';
const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const text = new TextDecoder('utf-8',{fatal:true});
const MAGIC = [83,78,66,49], HEADER=12, STRIDE=24;
const ID_MAX = 0x7fffffffffffffffn;
const RAD = Math.PI/180;

// SOFA/ERFA ICRS to Galactic rotation, with the origin left at the Solar System.
const galactic = [
  [-0.05487556041621537,-0.87343709023488505,-0.48383501554871323],
  [ 0.49410942787558367,-0.44482962996001118, 0.74698224449721889],
  [-0.86766614901900470,-0.19807637343120153, 0.45598377617506692],
];

export const neighborhoodDetailPath = row => `details/${Math.floor(row/NEIGHBORHOOD_PAGE_ROWS)}.csv`;
export const validGaiaId = value => typeof value === 'string' && /^[1-9]\d{0,18}$/.test(value) && BigInt(value)<=ID_MAX;

export function galacticPosition(ra,dec,distance) {
  requireData(Number.isFinite(ra) && ra>=0 && ra<360 && Number.isFinite(dec) &&
    Math.abs(dec)<=90 && Number.isFinite(distance) && distance>=0,'Invalid ICRS direction or distance');
  const a=ra*RAD,d=dec*RAD;
  const i=[Math.cos(a)*Math.cos(d),Math.sin(a)*Math.cos(d),Math.sin(d)];
  return galactic.map(row=>distance*(row[0]*i[0]+row[1]*i[1]+row[2]*i[2]));
}

export function projectNeighborhood([x,y,z],plane) {
  const vertical=plane==='xz'?z:y;
  return {point:[x,-vertical],radius:Math.hypot(x,vertical),depth:plane==='xz'?y:z};
}

export function neighborhoodLines(bytes) {
  const [header,...lines] = text.decode(bytes).split(/\r?\n/);
  requireData(header===NEIGHBORHOOD_HEADER && lines.at(-1)==='', 'Invalid neighborhood CSV header or line endings');
  lines.pop();
  return lines;
}

export function neighborhoodRow(line) {
  const [id,...fields]=line.split(',');
  requireData(validGaiaId(id) && fields.length===11 &&
    fields.every(v=>decimal.test(v)&&Number.isFinite(Number(v))), 'Invalid neighborhood source or measurement');
  const [ra,dec,parallax,parallaxError,g,ruwe,mask,vis,lo,median,hi]=fields.map(Number);
  requireData(ra>=0 && ra<360 && Math.abs(dec)<=90 && parallax>=5 && parallaxError>0 && parallax>=10*parallaxError &&
    ruwe>0 && ruwe<1.4 && (mask===31||mask===95) && Number.isInteger(vis) && vis>=10 &&
    g<=NEIGHBORHOOD_MAX_G && lo>0 && lo<=median && median<=hi && median<=NEIGHBORHOOD_RADIUS &&
    hi-lo<=.2*median, 'Gaia source fails neighborhood selection');
  return {id,ra,dec,parallax,parallaxError,g,ruwe,mask,vis,lo,median,hi};
}

export function packNeighborhood(rows) {
  const bytes=new Uint8Array(HEADER+STRIDE*rows.length);
  bytes.set(MAGIC);
  const data=new DataView(bytes.buffer);
  data.setUint32(4,rows.length,true);
  rows.forEach((row,n)=>{
    const offset=HEADER+STRIDE*n;
    data.setBigUint64(offset,BigInt(row.id),true);
    galacticPosition(row.ra,row.dec,row.median).forEach((v,i)=>data.setFloat32(offset+8+4*i,v,true));
    data.setFloat32(offset+20,row.g,true);
  });
  return bytes;
}

export function unpackNeighborhood(bytes,count) {
  requireData(Number.isInteger(count) && count>0 && count<=NEIGHBORHOOD_MAX_ROWS &&
    bytes.length===HEADER+STRIDE*count && MAGIC.every((v,i)=>bytes[i]===v), 'Invalid neighborhood map data');
  const data=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  requireData(data.getUint32(4,true)===count && data.getUint32(8,true)===0,'Incompatible neighborhood map data');
  const ids=new BigUint64Array(count), xyz=new Float32Array(3*count), magnitude=new Float32Array(count);
  let previous=0n;
  for(let i=0;i<count;i++) {
    const offset=HEADER+STRIDE*i, id=data.getBigUint64(offset,true);
    const x=data.getFloat32(offset+8,true),y=data.getFloat32(offset+12,true),z=data.getFloat32(offset+16,true);
    const g=data.getFloat32(offset+20,true), radius=Math.hypot(x,y,z);
    requireData(id>previous && id<=ID_MAX && Number.isFinite(radius) && radius>0 && radius<=NEIGHBORHOOD_RADIUS+1e-5 &&
      Number.isFinite(g) && g<=NEIGHBORHOOD_MAX_G,'Invalid or unordered neighborhood point');
    ids[i]=previous=id; xyz.set([x,y,z],i*3); magnitude[i]=g;
  }
  const order=Uint32Array.from({length:count},(_,i)=>i).sort((a,b)=>magnitude[a]-magnitude[b]||a-b);
  return {ids,xyz,magnitude,order};
}

export function neighborhoodIndex(ids,id) {
  if (!validGaiaId(id)) return -1;
  const target=BigInt(id);
  let lo=0,hi=ids.length;
  while(lo<hi) {
    const mid=(lo+hi)>>>1;
    if(ids[mid]<target) lo=mid+1;else hi=mid;
  }
  return ids[lo]===target?lo:-1;
}
