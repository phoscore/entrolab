import {checkedBytes} from './catalog.mjs';
import {AU_KM,parseModelDate} from './solar-model.mjs';
import {PACKAGES} from './voyager-pin.mjs';

export const RELEASE='v0.9.5-voyager-1977-2026.1';
export const END=parseModelDate('2026-11-26');
export const START=parseModelDate('1977-08-21');
export const IDS=Object.freeze({v1:-31,v2:-32,earth:399});
export const FLYBYS=Object.freeze({
  v1:Object.freeze(['1979-03-05','1980-11-12']),
  v2:Object.freeze(['1979-07-09','1981-08-26','1986-01-24','1989-08-25']),
});
export const TRACK_LIMIT=1100;
// Horizons refit-2022 states are discontinuous within this five-minute bracket.
export const V2_GAP=Object.freeze([2447767.5+8/24,2447767.5+(8*60+5)/1440]);
const MAGIC=0x564f5931; // VOY1
const HEADER=12, ROW=56, DAY_SECONDS=86400;

export function encodeVoyager(id,rows){
  const view=new DataView(new ArrayBuffer(HEADER+rows.length*ROW));
  view.setUint32(0,MAGIC);view.setInt32(4,IDS[id]);view.setUint32(8,rows.length);
  for(const [i,row] of rows.entries())for(const [j,value] of row.entries())
    view.setFloat64(HEADER+i*ROW+j*8,value,true);
  return view.buffer;
}

export function decodeVoyager(id,buffer){
  if(!Object.hasOwn(IDS,id)||buffer.byteLength<HEADER)throw new Error('Invalid Voyager package');
  const data=new DataView(buffer),count=data.getUint32(8);
  if(data.getUint32(0)!==MAGIC||data.getInt32(4)!==IDS[id]||count<2||buffer.byteLength!==HEADER+count*ROW)
    throw new Error('Invalid Voyager package layout');
  const field=(row,col)=>data.getFloat64(HEADER+row*ROW+col*8,true);
  const start=field(0,0),end=field(count-1,0);
  const expectedStart=id==='v1'?parseModelDate('1977-09-06'):START;
  if(start!==expectedStart||end!==END)throw new Error('Invalid Voyager coverage');
  for(let i=0;i<count;i++){
    if(!Number.isFinite(field(i,0))||i&&(field(i,0)<=field(i-1,0)||field(i,0)-field(i-1,0)>8))
      throw new Error('Invalid Voyager epoch sequence');
    for(let j=1;j<7;j++)if(!Number.isFinite(field(i,j)))throw new Error('Nonfinite Voyager state');
  }
  function index(day){
    let lo=0,hi=count-1;
    while(hi-lo>1){const mid=(lo+hi)>>>1;if(day<field(mid,0))hi=mid;else lo=mid;}
    return lo;
  }
  function sample(day){
    if(!Number.isFinite(day)||day<start||day>end||id==='v2'&&day>V2_GAP[0]&&day<V2_GAP[1])return null;
    const i=index(day),left=field(i,0),right=field(i+1,0);
    const t=(day-left)/(right-left),dt=(right-left)*DAY_SECONDS;
    const t2=t*t,t3=t*t2,position=[],velocity=[];
    for(let j=1;j<=3;j++){
      const p0=field(i,j),p1=field(i+1,j),v0=field(i,j+3),v1=field(i+1,j+3),delta=p1-p0;
      position.push(t===1?p1:p0+(3*t2-2*t3)*delta+(t3-2*t2+t)*dt*v0+(t3-t2)*dt*v1);
      velocity.push((6*t-6*t2)*delta/dt+(3*t2-4*t+1)*v0+(3*t2-2*t)*v1);
    }
    return {position,velocity};
  }
  const encounters=(FLYBYS[id]??[]).map(parseModelDate);
  function trail(day){
    if(!Number.isFinite(day)||day<start||day>end)return [];
    const stride=Math.max(1,Math.ceil((day-start)/570));
    const epochs=new Set([start,day]);
    // Model-time sampling with an exact endpoint. This remains bounded as the
    // mission timeline grows and does not depend on animation/render frames.
    for(let epoch=start+stride;epoch<day;epoch+=stride)epochs.add(epoch);
    for(const encounter of encounters){
      for(let step=-64;step<=64;step++){
        const epoch=encounter+step/8;
        if(epoch>start&&epoch<day)epochs.add(epoch);
      }
    }
    if(id==='v2'&&day>=V2_GAP[1])for(const edge of V2_GAP)epochs.add(edge);
    return [...epochs].sort((a,b)=>a-b).flatMap(epoch=>{
      const state=sample(epoch);
      const point=state?.position.map(value=>value/AU_KM);
      if(!point)return [];
      return id==='v2'&&epoch===V2_GAP[1]?[null,point]:[point];
    });
  }
  return {start,end,count,sample,trail};
}

export function voyagerMetrics(data,id,day){
  const probe=data?.[id]?.sample(day),earth=data?.earth?.sample(day);
  if(!probe||!earth)return null;
  const earthKm=Math.hypot(...probe.position.map((value,i)=>value-earth.position[i]));
  return {sunAU:Math.hypot(...probe.position)/AU_KM,earthAU:earthKm/AU_KM,
    speedKmS:Math.hypot(...probe.velocity),lightHours:earthKm/299792.458/3600};
}

export async function loadVoyager(signal){
  const entries=await Promise.all(Object.entries(PACKAGES).map(async ([id,pin])=>{
    const url=new URL(`./data/${RELEASE}/${id}.bin`,import.meta.url);
    const bytes=await checkedBytes(url,pin,signal,(url,opts)=>fetch(url,{...opts,cache:'no-store'}));
    return [id,decodeVoyager(id,bytes.buffer)];
  }));
  return Object.fromEntries(entries);
}
