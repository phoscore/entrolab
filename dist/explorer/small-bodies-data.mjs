import {checkedBytes} from './catalog.mjs';
import {RELEASE,catalog} from './small-bodies-spec.mjs';
import {PACKS} from './small-bodies-release.mjs';

const MAGIC=0x53424f31; // SBO1
const HEADER=8, ROW=56;
const SLOT=8;
const secondsPerDay=86400;
const entriesFor=group=>catalog.filter(entry=>entry.group===group);

export function encodeSmallBodies(group, samples){
  const entries=entriesFor(group);
  const length=HEADER+entries.reduce((n,entry)=>n+SLOT+ROW*samples.get(entry.id).length,0);
  const buffer=new ArrayBuffer(length), view=new DataView(buffer);
  view.setUint32(0,MAGIC);
  view.setUint32(4,entries.length);
  let offset=HEADER;
  for(const entry of entries){
    const rows=samples.get(entry.id);
    view.setUint32(offset,catalog.indexOf(entry));
    view.setUint32(offset+4,rows.length);
    offset+=SLOT;
    for(const row of rows){
      for(const [i,value] of row.entries())view.setFloat64(offset+i*8,value,true);
      offset+=ROW;
    }
  }
  return buffer;
}

export function decodeSmallBodies(group,buffer){
  const view=new DataView(buffer), entries=entriesFor(group), series=new Map();
  if(!entries.length||buffer.byteLength<HEADER||view.getUint32(0)!==MAGIC||view.getUint32(4)!==entries.length)
    throw Error('Invalid small-body package header');
  let offset=HEADER;
  for(const entry of entries){
    if(offset+SLOT>buffer.byteLength||view.getUint32(offset)!==catalog.indexOf(entry))
      throw Error('Invalid small-body identity');
    const count=view.getUint32(offset+4);
    offset+=SLOT;
    const start=offset;
    const field=(i,j=0)=>view.getFloat64(start+i*ROW+j*8,true);
    if(count!==Math.ceil((entry.end-entry.start)/entry.step)+1||offset+count*ROW>buffer.byteLength||
       field(0)!==entry.start||field(count-1)!==entry.end)throw Error('Invalid small-body time coverage');
    for(let i=0;i<count;i++){
      if(field(i)!==Math.min(entry.end,entry.start+i*entry.step))throw Error('Invalid small-body epoch');
      for(let j=1;j<=6;j++)if(!Number.isFinite(field(i,j)))throw Error('Invalid small-body component');
    }
    offset+=count*ROW;
    series.set(entry.id,{sample(day){
      if(!Number.isFinite(day)||day<entry.start||day>entry.end)return null;
      const i=Math.min(count-2,Math.floor((day-entry.start)/entry.step));
      const left=field(i), right=field(i+1), t=(day-left)/(right-left);
      const t2=t*t, t3=t2*t, dt=(right-left)*secondsPerDay;
      const position=[], velocity=[];
      for(let j=1;j<=3;j++){
        const p0=field(i,j),p1=field(i+1,j), v0=field(i,j+3),v1=field(i+1,j+3), d=p1-p0;
        position.push(t===1?p1:p0+(3*t2-2*t3)*d+(t3-2*t2+t)*dt*v0+(t3-t2)*dt*v1);
        velocity.push((6*t-6*t2)*d/dt+(3*t2-4*t+1)*v0+(3*t2-2*t)*v1);
      }
      return {position,velocity};
    }});
  }
  if(offset!==buffer.byteLength)throw Error('Unexpected small-body payload');
  return series;
}

export function loadSmallBodies(group,signal){
  const pin=Object.hasOwn(PACKS,group)&&PACKS[group];
  if(!pin)throw Error('Unknown small-body package');
  const url=new URL(`./data/${RELEASE}/${group}.bin`,import.meta.url);
  return checkedBytes(url,pin,signal,(uri,opts)=>fetch(uri,{...opts,cache:'no-store'}))
    .then(bytes=>decodeSmallBodies(group,bytes.buffer));
}
