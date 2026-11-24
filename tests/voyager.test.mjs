import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {AU_KM,parseModelDate} from '../dist/explorer/solar-model.mjs';
import {decodeVoyager,loadVoyager,RELEASE,START,END,TRACK_LIMIT,V2_GAP,voyagerMetrics} from '../dist/explorer/voyager-data.mjs';
import {PACKAGES} from '../dist/explorer/voyager-pin.mjs';

const files={};
for(const id of Object.keys(PACKAGES)){
  files[id]=await readFile(new URL(`../dist/explorer/data/${RELEASE}/${id}.bin`,import.meta.url));
}
const buffer=bytes=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length);
const data=Object.fromEntries(Object.entries(files).map(([id,bytes])=>[id,decodeVoyager(id,buffer(bytes))]));
const near=(actual,expected,tol)=>assert(Math.abs(actual-expected)<tol,`${actual} vs ${expected}`);

test('Voyager packages have pinned hashes, exact frame domains, and strictly bounded trajectories',()=>{
  for(const [id,bytes] of Object.entries(files)){
    assert.equal(bytes.length,PACKAGES[id].bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),PACKAGES[id].sha256);
    const series=data[id];
    for(const day of [NaN,Infinity,series.start-1e-7,END+1e-7])assert.equal(series.sample(day),null);
    for(const day of [series.start,END]){
      const state=series.sample(day);
      assert(state.position.every(Number.isFinite)&&state.velocity.every(Number.isFinite));
    }
  }
  assert.equal(data.v1.sample(START),null);
  for(const id of ['v1','v2']){
    const trail=data[id].trail(END);
    assert(trail.length<TRACK_LIMIT&&trail.length>500);
    assert.deepEqual(trail.at(-1),data[id].sample(END).position.map(km=>km/AU_KM));
  }
  assert(data.v2.sample(V2_GAP[0])&&data.v2.sample(V2_GAP[1]));
  assert.equal(data.v2.sample((V2_GAP[0]+V2_GAP[1])/2),null);
  const track=data.v2.trail(END),boundary=track.indexOf(null);
  assert(boundary>0&&boundary<track.length-1);
  for(const [i,day] of V2_GAP.entries())assert.deepEqual(track[boundary+2*i-1],data.v2.sample(day).position.map(km=>km/AU_KM));
});

test('Voyager metrics use same-epoch Earth centre and geometric d/c',()=>{
  const day=parseModelDate('2026-11-24');
  const one=voyagerMetrics(data,'v1',day),two=voyagerMetrics(data,'v2',day);
  near(one.sunAU,172.444,.005);near(two.sunAU,144.555,.005);
  near(one.speedKmS,16.918,.005);near(two.speedKmS,15.263,.005);
  for(const id of ['v1','v2']){
    const p=data[id].sample(day),e=data.earth.sample(day),m=voyagerMetrics(data,id,day);
    const [x,y,z]=p.position.map((v,i)=>v-e.position[i]);
    near(m.earthAU,Math.sqrt(x*x+y*y+z*z)/AU_KM,1e-11);
    near(m.lightHours,m.earthAU*AU_KM/1079252848.8,1e-10);
  }
});

test('Voyager rejects malformed packages, nonfinite epochs and same-size altered network payloads',async()=>{
  const old=globalThis.fetch;
  try{
    assert.throws(()=>decodeVoyager('v2',buffer(files.v1)),/layout/);
    assert.throws(()=>decodeVoyager('v1',buffer(files.v1.subarray(0,-1))),/layout/);
    const nonfinite=Buffer.from(files.v1);nonfinite.writeDoubleLE(NaN,12+56);
    assert.throws(()=>decodeVoyager('v1',buffer(nonfinite)),/epoch/);
    const slot=Buffer.from(files.v1);slot.writeDoubleLE(Infinity,20);
    assert.throws(()=>decodeVoyager('v1',buffer(slot)),/Nonfinite/);
    let failure='shift';
    globalThis.fetch=async url=>{
      const id=url.pathname.split('/').at(-1).slice(0,-4),bytes=Buffer.from(files[id]);
      if(id!=='v1'||!failure)return new Response(bytes);
      if(failure==='size')return new Response(Buffer.concat([bytes,new Uint8Array(1)]));
      bytes.writeDoubleLE(bytes.readDoubleLE(28)+1e8,28);return new Response(bytes);
    };
    const signal=new AbortController().signal;
    await assert.rejects(loadVoyager(signal),/integrity/);
    failure='size';await assert.rejects(loadVoyager(signal),/byte budget/);
    failure=null;const verified=await loadVoyager(signal);
    assert.deepEqual(verified.v1.sample(END),data.v1.sample(END));
  }finally{globalThis.fetch=old;}
});
