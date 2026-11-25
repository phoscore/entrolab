import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync,gunzipSync} from 'node:zlib';
import {FRAME, GROUPS, RELEASE,catalog} from '../dist/explorer/small-bodies-spec.mjs';
import {encodeSmallBodies,decodeSmallBodies} from '../dist/explorer/small-bodies-data.mjs';

const mode=process.argv[2];
if(!['--capture','--build','--check'].includes(mode))throw Error('Use --capture, --build, or --check');
const root=fileURLToPath(new URL('../',import.meta.url));
const raw=join(root,'cosmic-explorer/data/raw',RELEASE);
const dist=join(root,'dist/explorer/data',RELEASE);
const capture=mode==='--capture', check=mode==='--check';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';
const assert=(condition,message)=>{if(!condition)throw Error(message);};
const entries=[], manifest={release:RELEASE,frame:FRAME,entries};
const grids=new Map(), results={}, metadata={};
if(capture)await mkdir(raw,{recursive:true});

async function archive(file,url){
  const path=join(raw,file);
  let packed=await readFile(path).catch(err=>{if(capture&&err.code==='ENOENT')return null;throw err;});
  if(!packed){
    let response;
    for(const delay of [0,3500,15000]){
      if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
      try {
        response=await fetch(url,{signal:AbortSignal.timeout(70000),headers:{'User-Agent':'Entrolab scientific ephemeris capture (https://github.com/phoscore/entrolab)'}});
        if(response.ok)break;
        if(response.status!==429&&response.status<500)break;
        await response.body?.cancel();
      }catch(error){console.warn(file,error.message);response=null;}
    }
    assert(response?.ok,file+': source not available ('+(response?.status??'network')+')');
    const bytes=Buffer.from(await response.arrayBuffer());
    assert(bytes.length<2_000_000,file+': response too large');
    packed=gzipSync(bytes,{level:9});
    await writeFile(path,packed,{flag:'wx'});
    await new Promise(resolve=>setTimeout(resolve,300));
  }
  const original=gunzipSync(packed);
  entries.push({file,url,bytes:original.length,archivedBytes:packed.length,sha256:hash(original),archiveSha256:hash(packed)});
  console.log(`${file} ${original.length} bytes`);
  return original.toString('utf8');
}

function horizonURL(entry,epochs,grid){
  const args={COMMAND:entry.command,CENTER:'500@10',MAKE_EPHEM:'YES',OBJ_DATA:'NO',EPHEM_TYPE:'VECTORS',
    TIME_TYPE:'TDB',REF_SYSTEM:'ICRF',REF_PLANE:'ECLIPTIC',VEC_CORR:'NONE',
    OUT_UNITS:'KM-S',VEC_TABLE:2,CSV_FORMAT:'YES',CAL_FORMAT:'BOTH'};
  const param=new URLSearchParams({format:'text'});
  for(const [key,value] of Object.entries(args))param.set(key,`'${value}'`);
  if(grid&&epochs.length>1){
    param.set('START_TIME',`'JD${epochs[0]}'`);
    param.set('STOP_TIME',`'JD${epochs.at(-1)}'`);
    param.set('STEP_SIZE',`'${entry.step*24} h'`);
  }else{
    param.set('TLIST_TYPE',"'JD'");
    param.set('TLIST',epochs.map(day=>`'${day.toFixed(10)}'`).join(' '));
  }
  return 'https://ssd.jpl.nasa.gov/api/horizons.api?'+param;
}

async function vectors(entry,file,epochs,grid=false){
  const text=await archive(file,horizonURL(entry,epochs,grid));
  const start=text.indexOf('$$SOE'),finish=text.indexOf('$$EOE');
  assert(start>=0&&finish>start,file+': no vector table: '+text.slice(0,1500));
  const header=text.slice(0,start);
  const target=header.match(/Target body name:\s*([^\n{]+?)\s*\{source:\s*([^}]+)\}/i);
  const centre=header.match(/Center body name:\s*Sun\s*\(10\)\s*\{source:\s*([^}]+)\}/i);
  const label=target?.[1].trim();
  assert(label&&(label.startsWith(entry.designation+' ')||label.startsWith(entry.designation+'/')),file+': wrong target: '+label);
  assert(centre&&/Output units\s*:\s*KM-S/i.test(header)&&/GEOMETRIC/i.test(header)&&/Ecliptic of J2000\.0/i.test(header)&&/JDTDB/i.test(header),file+': wrong frame');
  const source={label,target:target[2].trim(),centre:centre[1].trim()};
  const rows=text.slice(start+5,finish).trim().split(/\r?\n/);
  assert(rows.length===epochs.length,`${file}: expected ${epochs.length} rows, received ${rows.length}`);
  const samples=rows.map((line,i)=>{
    const fields=line.split(',').map(s=>s.trim());
    const day=Number(fields[0]),values=fields.slice(2,8).map(x=>x?Number(x):NaN);
    assert(fields[1]?.startsWith('A.D.')&&values.length===6&&values.every(Number.isFinite)&&Math.abs(day-epochs[i])<2e-9,
      file+': invalid row '+i);
    return [epochs[i],...values];
  });
  return {source,samples};
}

async function database(entry){
  const args=new URLSearchParams({sstr:entry.designation,'phys-par':'true'});
  const body=JSON.parse(await archive('sbdb-'+entry.id+'.json.gz','https://ssd-api.jpl.nasa.gov/sbdb.api?'+args));
  const o=body.object,orbit=body.orbit;
  assert(o?.des===entry.designation&&/^\d+$/.test(o.spkid)&&orbit?.epoch&&orbit?.elements,entry.id+': SBDB identity mismatch');
  assert(o.fullname?.toLowerCase().replace(/[^a-z]/g,'').includes(entry.name.toLowerCase().normalize('NFD').replace(/[^a-z]/g,'')),entry.id+': SBDB name mismatch '+o.fullname);
  const values=Object.fromEntries(orbit.elements.map(e=>[e.name,Number(e.value)]));
  const diameter=body.phys_par?.find(p=>p.name==='diameter');
  const positive=value=>Number.isFinite(Number(value))&&Number(value)>0?Number(value):null;
  return {spkid:o.spkid,orbitClass:o.orbit_class?.code??null,orbitEpoch:Number(orbit.epoch),
    orbitId:orbit.orbit_id,modelParameters:orbit.model_pars?.filter(p=>['A1','A2','A3','DT'].includes(p.name)).map(p=>p.name)??[],
    periodDays:positive(values.per),eccentricity:Number.isFinite(values.e)?values.e:null,
    inclination:Number.isFinite(values.i)?values.i:null,diameterKm:positive(diameter?.value),diameterSigmaKm:positive(diameter?.sigma)};
}

function gridsFor(entry){
  const n=Math.floor((entry.end-entry.start)/entry.step);
  const days=Array.from({length:n+1},(_,i)=>entry.start+entry.step*i), result=[];
  for(let i=0;i<days.length;i+=2300)result.push({days:days.slice(i,i+2300),grid:true});
  if(days.at(-1)<entry.end)result.push({days:[entry.end],grid:false});
  return result;
}

function references(rows){
  const intervals=rows.length-1;
  const spread=Array.from({length:32},(_,i)=>Math.floor((i+.5)*intervals/32));
  const ranked=Array.from({length:intervals},(_,i)=>i).sort((a,b)=>
    Math.hypot(...rows[b].slice(4))-Math.hypot(...rows[a].slice(4))).slice(0,24);
  return [...new Set([...spread,...ranked])].sort((a,b)=>a-b).map((i,j)=>rows[i][0]+
    (rows[i+1][0]-rows[i][0])*[.21,.49,.78][j%3]);
}

const counterchecks=new Map();
for(const entry of catalog){
  metadata[entry.id]=await database(entry);
  const states=[];
  let solution;
  function sameSource(source){
    solution??=source;
    assert(JSON.stringify(solution)===JSON.stringify(source),entry.id+': Horizons solution changed during capture');
  }
  for(const [index,{days,grid}] of gridsFor(entry).entries()){
    const found=await vectors(entry,`grid-${entry.id}-${index}.txt.gz`,days,grid);
    sameSource(found.source);
    states.push(...found.samples);
  }
  const found=await vectors(entry,'reference-'+entry.id+'.txt.gz',references(states));
  sameSource(found.source);
  grids.set(entry.id,states);
  counterchecks.set(entry.id,found.samples);
  results[entry.id]={...solution,start:entry.start,end:entry.end,step:entry.step,count:states.length};
}
if(capture)await writeFile(join(raw,'manifest.json'),json(manifest));
else assert(await readFile(join(raw,'manifest.json'),'utf8')===json(manifest),'Source manifest differs');
if(capture)process.exit(0);
if(!check)await mkdir(dist,{recursive:true});

async function writeOrCheck(path,data){
  if(check)assert((await readFile(path)).equals(Buffer.from(data)),path+': offline reproduction mismatch');
  else await writeFile(path,data);
}

const packs={};
for(const group of Object.keys(GROUPS)){
  const binary=encodeSmallBodies(group,grids);
  const decoded=decodeSmallBodies(group,binary);
  const bytes=Buffer.from(binary);
  packs[group]={bytes:bytes.length,sha256:hash(bytes)};
  await writeOrCheck(join(dist,group+'.bin'),bytes);
  for(const [id,series] of decoded){
    let positionKm=0,velocityKmS=0;
    const refs=counterchecks.get(id);
    for(const [day,x,y,z,vx,vy,vz] of refs){
      const {position:p,velocity:v}=series.sample(day);
      positionKm=Math.max(positionKm,Math.hypot(p[0]-x,p[1]-y,p[2]-z));
      velocityKmS=Math.max(velocityKmS,Math.hypot(v[0]-vx,v[1]-vy,v[2]-vz));
    }
    assert(positionKm<=100&&velocityKmS<=.015,id+': interpolation over budget '+positionKm+' km / '+velocityKmS+' km/s');
    Object.assign(results[id],{references:refs.length,positionKm,velocityKmS});
  }
}
await writeOrCheck(join(dist,'manifest.json'),json({release:RELEASE,frame:FRAME,packs,results,metadata,sourceManifestSha256:hash(json(manifest))}));
await writeOrCheck(join(root,'dist/explorer/small-bodies-release.mjs'),
  '// Reproduced by scripts/small-bodies.mjs from the archived source snapshots.\nexport const PACKS='+json(packs).trimEnd()+
  ';\nexport const METADATA='+json(metadata).trimEnd()+';\n');
console.log(JSON.stringify(results));
