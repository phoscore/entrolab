import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {IDS,RELEASE,decodeVoyager,encodeVoyager} from '../dist/explorer/voyager-data.mjs';

const check=process.argv[2]==='--check';
if(!check&&process.argv[2]!=='--build')throw Error('Use --build or --check');
const raw=new URL(`../cosmic-explorer/data/raw/${RELEASE}/`,import.meta.url);
const output=new URL(`../dist/explorer/data/${RELEASE}/`,import.meta.url);
const archive=await readFile(new URL('manifest.json',raw));
const manifest=JSON.parse(archive);
const json=value=>JSON.stringify(value,null,2)+'\n';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const results={},pins={};
assert.equal(manifest.release,RELEASE);

for(const [id,target] of Object.entries(IDS)){
  const grid=[],refined=[],tests=[],sources=new Set();
  for(const file of manifest.files.filter(f=>f.name===id)){
    const response=await readFile(new URL(file.file,raw));
    assert.equal(hash(response),file.gzipSha256);
    const bytes=gunzipSync(response);
    assert.equal(bytes.length,file.bytes);assert.equal(hash(bytes),file.sha256);
    const [header,rest]=bytes.toString().split('$$SOE');
    assert.match(header,/API SOURCE: NASA\/JPL Horizons API/);
    const identity=header.match(/Target body name: (.+?) \((-?\d+)\).*?\{source:\s*([^}]+)/);
    assert.equal(Number(identity?.[2]),target);
    assert.equal(identity[1],file.identity);
    if(id==='earth')assert.equal(identity[1],'Earth');
    else assert.match(identity[1],new RegExp(`^Voyager ${id[1]} \\(spacecraft\\)$`));
    assert.equal(identity[3].trim(),file.source);
    sources.add(file.source);
    assert.match(header,/Center body name:\s*Sun \(10\)/);
    assert.match(header,/Center-site name:\s*BODY CENTER/);
    assert.match(header,/Output units\s*:\s*KM-S/);
    assert.match(header,/Output type\s*:\s*GEOMETRIC cartesian states/);
    assert.match(header,/Reference frame\s*:\s*Ecliptic of J2000\.0/);
    assert.match(header,/JDTDB/);
    const url=new URL(file.url),options=url.searchParams;
    assert.equal(url.origin+url.pathname,'https://ssd.jpl.nasa.gov/api/horizons.api');
    for(const [key,value] of Object.entries({COMMAND:target,CENTER:'500@10',TIME_TYPE:'TDB',REF_SYSTEM:'ICRF',REF_PLANE:'ECLIPTIC',VEC_CORR:'NONE',OUT_UNITS:'KM-S',VEC_TABLE:2}))
      assert.equal(options.get(key),`'${value}'`);
    const rows=rest.split('$$EOE')[0].trim().split(/\r?\n/).map(line=>{
      const [day,calendar,...vector]=line.split(',').map(s=>s.trim());
      assert.match(calendar,/^A\.D\./);
      const row=[day,...vector.slice(0,6)].map(value=>value?Number(value):NaN);
      assert.equal(row.length,7);assert(row.every(Number.isFinite));
      return row;
    });
    const [first,last,hours]=file.schedule;
    assert.equal(rows.length,file.reference?file.schedule.length:Math.round((last-first)*24/hours)+1,file.file);
    for(const [i,row] of rows.entries()){
      const epoch=file.reference?file.schedule[i]:first+i*hours/24;
      assert(Math.abs(row[0]-epoch)<2e-9,file.file);
      if(file.reference){tests.push(row);continue;}
      if(file.file.includes('-refine-')){refined.push([epoch,...row.slice(1)]);continue;}
      if(grid.at(-1)?.[0]===epoch){
        assert.deepEqual(grid.at(-1).slice(1),row.slice(1),file.file);
        continue;
      }
      if(grid.length)assert(Math.abs(grid.at(-1)[0]+hours/24-epoch)<2e-9,file.file+' contains a gap');
      grid.push([epoch,...row.slice(1)]);
    }
  }
  assert.equal(sources.size,1,id+' source changed during capture');
  for(const row of refined){
    const matching=grid.find(previous=>Math.abs(previous[0]-row[0])<2e-9);
    if(matching)assert.deepEqual(matching.slice(1),row.slice(1));
    else grid.push(row);
  }
  grid.sort((a,b)=>a[0]-b[0]);
  if(id==='v2'){
    const seam=grid.findIndex(row=>row[0]===2447767.5+8/24);
    const [first,last]=grid.slice(seam,seam+2);
    assert.equal(last[0],2447767.5+(8*60+5)/1440);
    const dx=first.slice(1,4).map((x,i)=>last[i+1]-x-300*first[i+4]);
    assert(Math.hypot(...dx)>13000,'Horizons seam used by the release is missing');
  }
  const bytes=Buffer.from(encodeVoyager(id,grid));
  const decoded=decodeVoyager(id,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length));
  const epochs=new Set(grid.map(row=>row[0]));
  let maxPositionKm=0,maxVelocityKmS=0;
  for(const [day,...values] of tests){
    assert(!epochs.has(day),'Validation epoch must be off the grid');
    const {position,velocity}=decoded.sample(day);
    maxPositionKm=Math.max(maxPositionKm,Math.hypot(...position.map((p,i)=>p-values[i])));
    maxVelocityKmS=Math.max(maxVelocityKmS,Math.hypot(...velocity.map((v,i)=>v-values[i+3])));
  }
  assert(tests.length>=10);
  assert(maxPositionKm<10&&maxVelocityKmS<.002,`Interpolation budget exceeded for ${id}`);
  results[id]={target,source:[...sources][0],records:grid.length,offGridChecks:tests.length,start:decoded.start,end:decoded.end,maxPositionKm,maxVelocityKmS};
  pins[id]={bytes:bytes.length,sha256:hash(bytes)};
  await save(new URL(id+'.bin',output),bytes);
}
await save(new URL('manifest.json',output),Buffer.from(json({release:RELEASE,rawManifestSha256:hash(archive),packages:pins,results})));
await save(new URL('../dist/explorer/voyager-pin.mjs',import.meta.url),Buffer.from('// Generated by scripts/voyager-build.mjs from the archived Horizons responses.\nexport const PACKAGES=Object.freeze('+JSON.stringify(pins,null,2)+');\n'));
console.log(JSON.stringify(results,null,2));

async function save(path,bytes){
  if(check)assert.deepEqual(await readFile(path),bytes,path.href);
  else {await mkdir(new URL('.',path),{recursive:true});await writeFile(path,bytes);}
}
