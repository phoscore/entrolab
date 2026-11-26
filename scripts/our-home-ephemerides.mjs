import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {AU_KM,parseModelDate} from '../dist/explorer/solar-model.mjs';
import {decodeVoyager,RELEASE as VOY_RELEASE,END as VOY_END} from '../dist/explorer/voyager-data.mjs';
import {sampleVector,closestApproach} from '../dist/explorer/encounter-model.mjs';

const mode=process.argv[2];
if(!['--capture','--check'].includes(mode))throw Error('Use --capture or --check');
const root=new URL('../',import.meta.url);
const raw=new URL('cosmic-explorer/data/raw/our-home-2026.1/',root);
const output=new URL('dist/explorer/data/our-home-2026.1/',root);
const digest=data=>createHash('sha256').update(data).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const fail=(condition,message)=>{if(!condition)throw Error(message);};
const jan=parseModelDate('2029-01-01'), april=parseModelDate('2029-04-12'), after=parseModelDate('2029-04-15'), may=parseModelDate('2029-05-01');
const archive=[], sources=new Set();
if(mode==='--capture')await mkdir(raw,{recursive:true});

function request(command,centre,start,end,step,dates){
  const p=new URLSearchParams({format:'text'});
  const args={COMMAND:command,CENTER:'500@'+centre,MAKE_EPHEM:'YES',OBJ_DATA:'NO',EPHEM_TYPE:'VECTORS',
    TIME_TYPE:'TDB',REF_SYSTEM:'ICRF',REF_PLANE:'ECLIPTIC',VEC_CORR:'NONE',OUT_UNITS:'KM-S',VEC_TABLE:2,CSV_FORMAT:'YES',CAL_FORMAT:'BOTH'};
  Object.assign(args,dates?{TLIST_TYPE:'JD'}:{START_TIME:'JD'+start,STOP_TIME:'JD'+end,STEP_SIZE:step});
  for(const [k,v] of Object.entries(args))p.set(k,`'${v}'`);
  if(dates)p.set('TLIST',dates.map(d=>`'${d.toFixed(10)}'`).join(' '));
  return 'https://ssd.jpl.nasa.gov/api/horizons.api?'+p;
}

async function download(url){
  for(const delay of [0,3000,12000]){
    if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
    try{
      const response=await fetch(url,{signal:AbortSignal.timeout(45000),
        headers:{'User-Agent':'entrolab astronomical source capture (https://github.com/phoscore/entrolab)'}});
      if(response.ok)return Buffer.from(await response.arrayBuffer());
      if(response.status!==429&&response.status<500)throw Error('HTTP '+response.status);
      await response.body.cancel();
    }catch(error){if(delay===12000)throw error;}
  }
  throw Error('JPL request did not succeed');
}
async function query(id,url){
  const name=id+'.txt.gz', file=new URL(name,raw);
  let packed;
  if(mode==='--capture'){
    const original=await download(url);
    fail(original.length<=1_000_000,id+': response too large');
    packed=gzipSync(original,{level:9});
    await writeFile(file,packed);
    await new Promise(resolve=>setTimeout(resolve,350));
  }else packed=await readFile(file);
  const bytes=gunzipSync(packed);
  archive.push({name,url,bytes:bytes.length,sha256:digest(bytes),gzipSha256:digest(packed)});
  return bytes.toString('utf8');
}
const julian=(d)=>2440587.5+Date.parse(d+'T00:00:00Z')/86400000;
for(const [id,target] of [['voyager1','-31'],['voyager2','-32']]){
  const body=await query(id,request(target,10,julian('2027-11-26'),julian('2027-11-27'),'1 d'));
  const label=body.match(/Target body name:[^\r\n]+/)?.[0]??'';
  console.log(id,label,body.includes('$$SOE')?'2027 available':body.split(/\r?\n/).filter(x=>/no ephemeris|range|prior|after/i.test(x)).slice(-5).join(' '));
}

function parse(text,centre,expected,id){
  const a=text.indexOf('$$SOE'),b=text.indexOf('$$EOE');
  fail(a>=0&&b>a,id+': no data '+text.slice(-1500));
  const header=text.slice(0,a);
  const source=header.match(/Target body name:\s*99942\s+Apophis[^\r\n]*?\{source:\s*([^}]+)\}/i);
  const label=centre===399?'Earth':'Sun';
  fail(source&&new RegExp('Center body name:\\s*'+label+'\\s*\\('+centre+'\\)').test(header)&&
    /JDTDB/i.test(header)&&/GEOMETRIC/i.test(header)&&/Output units\s*:\s*KM-S/i.test(header)&&
    /Ecliptic of J2000\.0/i.test(header),id+': incorrect identity or frame '+header.slice(-2100));
  sources.add(source[1].trim());
  const rows=text.slice(a+5,b).trim().split(/\r?\n/);
  fail(rows.length===expected.length,id+': invalid number of rows '+rows.length);
  return rows.map((line,i)=>{
    const f=line.split(',').map(x=>x.trim()), numbers=f.slice(2,8).map(x=>x?Number(x):NaN);
    fail(f[1]?.startsWith('A.D.')&&Math.abs(Number(f[0])-expected[i])<2e-9&&numbers.length===6&&numbers.every(Number.isFinite),id+': invalid row '+i);
    return [expected[i],...numbers];
  });
}
async function grid(id,centre,start,end,minutes){
  const days=Array.from({length:Math.round((end-start)*1440/minutes)+1},(_,i)=>start+i*minutes/1440);
  return parse(await query(id,request('99942;',centre,start,end,minutes+' m')),centre,days,id);
}
const early=await grid('sun-early',10,jan,april,360), dense=await grid('sun-dense',10,april,after,10), late=await grid('sun-late',10,after,may,360);
const relative=await grid('earth-dense',399,april,after,10);
const sun=[...early.slice(0,-1),...dense.slice(0,-1),...late];
const event=closestApproach(relative);
async function compare(id,centre,rows){
  const stride=(rows.length-1)/26;
  const dates=Array.from({length:26},(_,i)=>{
    const k=Math.floor((i+.5)*stride);
    return rows[k][0]+(rows[k+1][0]-rows[k][0])*[.23,.49,.77][i%3];
  });
  if(rows===relative||rows===sun){
    dates.push(...[-17,-7,-3,-1,0,1,3,7,17].map(minutes=>event.day+minutes/1440));
  }
  dates.sort((a,b)=>a-b);
  const refs=parse(await query(id,request('99942;',centre,null,null,null,dates)),centre,dates,id);
  let km=0,kms=0;
  for(const [day,...v] of refs){
    const x=sampleVector(rows,day);
    km=Math.max(km,Math.hypot(...x.slice(0,3).map((p,i)=>p-v[i])));
    kms=Math.max(kms,Math.hypot(...x.slice(3).map((p,i)=>p-v[i+3])));
  }
  fail(km<.25&&kms<.0003,id+': excessive residual '+JSON.stringify({km,kms}));
  return {count:refs.length,km,kms};
}
const checks={sun:await compare('sun-reference',10,sun),earth:await compare('earth-reference',399,relative)};
fail(sources.size===1,'Apophis solution changed mid-capture');
fail(event.day>parseModelDate('2029-04-13')&&event.day<parseModelDate('2029-04-14')&&
  event.distanceKm>37500&&event.distanceKm<39000&&Math.hypot(...sampleVector(sun,event.day).slice(0,3))>AU_KM*.9,'unexpected encounter geometry');
const forecastEnd=julian('2027-11-26');
const forecast={};
const forecastChecks={};
for(const [id,number,expectedName,expectedSource] of [
  ['v1',-31,'Voyager 1','Voyager_1_ST+refit2022_m'],
  ['v2',-32,'Voyager 2','Voyager_2_ST+refit2022_m'],
  ['earth',399,'Earth','DE441'],
]){
  function vectorRows(body,dates){
    const first=body.indexOf('$$SOE'),last=body.indexOf('$$EOE');
    const header=body.slice(0,first);
    const target=header.match(/Target body name:\s*([^\r\n]+?)\s*\{source:\s*([^}]+)\}/i);
    fail(first>=0&&last>first&&target?.[1].startsWith(expectedName)&&target[1].endsWith('('+number+')')&&
      target[2].trim()===expectedSource&&/Center body name:\s*Sun\s*\(10\)/.test(header)&&
      /JDTDB/i.test(header)&&/GEOMETRIC/i.test(header)&&/Output units\s*:\s*KM-S/i.test(header)&&
      /Ecliptic of J2000\.0/i.test(header),id+': unverified extension frame or source '+header.slice(-1200));
    const lines=body.slice(first+5,last).trim().split(/\r?\n/);
    fail(lines.length===dates.length,id+': invalid extension size');
    return lines.map((line,i)=>{
      const columns=line.split(',').map(x=>x.trim());
      const vector=columns.slice(2,8).map(p=>p?Number(p):NaN);
      fail(Math.abs(Number(columns[0])-dates[i])<2e-9&&vector.length===6&&vector.every(Number.isFinite),id+': invalid extension sample');
      return [dates[i],...vector];
    });
  }
  const days=Array.from({length:forecastEnd-VOY_END+1},(_,i)=>VOY_END+i);
  const rows=vectorRows(await query('forecast-'+id,request(number,10,VOY_END,forecastEnd,'1 d')),days);
  const historical=await readFile(new URL('dist/explorer/data/'+VOY_RELEASE+'/'+id+'.bin',root));
  const edge=decodeVoyager(id,historical.buffer.slice(historical.byteOffset,historical.byteOffset+historical.byteLength)).sample(VOY_END);
  const residual=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  const seamKm=residual(rows[0].slice(1,4),edge.position);
  const seamKmS=residual(rows[0].slice(4,7),edge.velocity);
  fail(seamKm<.002&&seamKmS<.000001,id+': incompatible with archived Voyager endpoint');
  const off=Array.from({length:32},(_,i)=>VOY_END+Math.floor(i*(days.length-1)/32)+[.23,.51,.77][i%3]);
  const reference=vectorRows(await query('forecast-reference-'+id,request(number,10,null,null,null,off)),off);
  let km=0,kms=0;
  for(const [day,...vector] of reference){
    const state=sampleVector(rows,day);
    km=Math.max(km,residual(state.slice(0,3),vector.slice(0,3)));
    kms=Math.max(kms,residual(state.slice(3),vector.slice(3)));
  }
  fail(km<.25&&kms<.0001,id+': extension residual not acceptable');
  forecast[id]=rows;
  forecastChecks[id]={count:off.length,km,kms,seamKm,seamKmS,source:expectedSource};
}
const data=json({sun,relative});
const forecastData=json(forecast);
const meta={id:99942,source:[...sources][0],event,checks,first:jan,last:may,bytes:Buffer.byteLength(data),sha256:digest(data)};
const extension={start:VOY_END,end:forecastEnd,checks:forecastChecks,bytes:Buffer.byteLength(forecastData),sha256:digest(forecastData)};
const pin='// Generated by scripts/our-home-ephemerides.mjs.\nexport const ENCOUNTER='+json(meta).trimEnd()+
  ';\nexport const FORECAST='+json(extension).trimEnd()+';\n';
const files=[[new URL('manifest.json',raw),json({archive,...meta,extension})],
  [new URL('apophis.json',output),data],[new URL('voyager-forecast.json',output),forecastData],
  [new URL('dist/explorer/encounter-release.mjs',root),pin]];
if(mode==='--capture')await mkdir(output,{recursive:true});
for(const [path,content] of files){
  if(mode==='--capture')await writeFile(path,content);
  else fail(await readFile(path,'utf8')===content,path.pathname+': reproduction differs');
}
console.log(JSON.stringify({meta,extension}));
