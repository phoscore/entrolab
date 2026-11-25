import {checkedBytes} from './catalog.mjs';
import {AU_KM} from './solar-model.mjs';
import {sampleVector} from './encounter-model.mjs';
import {ENCOUNTER,FORECAST} from './encounter-release.mjs';
export {ENCOUNTER,FORECAST};

const directory='./data/our-home-2026.1/';
async function loadAsset(name,pin,signal){
  const url=new URL(directory+name+'.json',import.meta.url);
  const bytes=await checkedBytes(url,pin,signal,(uri,options)=>fetch(uri,{...options,cache:'no-store'}));
  return JSON.parse(new TextDecoder().decode(bytes));
}
function validate(rows,start,end){
  if(!Array.isArray(rows)||rows.length<2||rows[0][0]!==start||rows.at(-1)[0]!==end||
     rows.some((row,i)=>row.length!==7||!row.every(Number.isFinite)||i&&row[0]<=rows[i-1][0])){
    throw Error('Invalid supplemental trajectory');
  }
}
export async function loadEncounter(signal){
  const data=await loadAsset('apophis',ENCOUNTER,signal);
  validate(data.sun,ENCOUNTER.first,ENCOUNTER.last);
  validate(data.relative,Math.floor(ENCOUNTER.event.day-.5)-.5,Math.floor(ENCOUNTER.event.day-.5)+2.5);
  return data;
}
export async function loadForecast(signal){
  const data=await loadAsset('voyager-forecast',FORECAST,signal);
  for(const id of ['v1','v2','earth'])validate(data[id],FORECAST.start,FORECAST.end);
  return data;
}
export function extendVoyager(history,forecast){
  return Object.fromEntries(Object.keys(history).map(id=>{
    const base=history[id], rows=forecast[id];
    function sample(day){
      if(day<=FORECAST.start)return base.sample(day);
      const values=sampleVector(rows,day);
      return values?{position:values.slice(0,3),velocity:values.slice(3)}:null;
    }
    const au=row=>row.slice(0,3).map(v=>v/AU_KM);
    let past;
    function trail(day){
      if(day<=FORECAST.start)return base.trail(day);
      const now=sample(day);
      if(!now)return [];
      past??=base.trail(FORECAST.start);
      const points=[];
      for(let i=8;i<rows.length&&rows[i][0]<day;i+=8)points.push(au(rows[i].slice(1)));
      points.push(au(now.position));
      return [...past,...points];
    }
    return [id,{...base,end:FORECAST.end,sample,trail}];
  }));
}
