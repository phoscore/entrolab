import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {AU_KM,parseModelDate} from '../dist/explorer/solar-model.mjs';
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
const data=json({sun,relative});
const meta={id:99942,source:[...sources][0],event,checks,first:jan,last:may,bytes:Buffer.byteLength(data),sha256:digest(data)};
const pin='// Generated by scripts/our-home-ephemerides.mjs.\nexport const ENCOUNTER='+json(meta).trimEnd()+';\n';
const files=[[new URL('manifest.json',raw),json({archive,...meta})],
  [new URL('apophis.json',output),data],[new URL('dist/explorer/encounter-release.mjs',root),pin]];
if(mode==='--capture')await mkdir(output,{recursive:true});
for(const [path,content] of files){
  if(mode==='--capture')await writeFile(path,content);
  else fail(await readFile(path,'utf8')===content,path.pathname+': reproduction differs');
}
console.log(JSON.stringify(meta));
