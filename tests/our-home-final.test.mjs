import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spaceCamera,spaceBasis,spaceProjector} from '../dist/explorer/solar-space.mjs';
import {orbitToFree,freeToOrbit,aimFree,moveFree,freeNear,freeSpeed} from '../dist/explorer/free-camera.mjs';
import {sampleVector,closestApproach} from '../dist/explorer/encounter-model.mjs';
import {ENCOUNTER,FORECAST,extendVoyager} from '../dist/explorer/our-home-data.mjs';
import {decodeVoyager,RELEASE,END} from '../dist/explorer/voyager-data.mjs';
import {decodeSmallBodies} from '../dist/explorer/small-bodies-data.mjs';
import {RELEASE as SMALL} from '../dist/explorer/small-bodies-spec.mjs';

const read=path=>readFileSync(new URL('../dist/explorer/data/'+path,import.meta.url));
const buffer=bytes=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
const near=(a,b,tolerance=1e-10)=>assert(Math.abs(a-b)<=tolerance,`${a} vs ${b}`);
const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);

test('the free camera moves on three orthogonal axes and look input leaves position intact',()=>{
  const start=orbitToFree(spaceCamera(),85);
  for(const p of [start,aimFree(start,120,3000000),aimFree(start,-180,-4000000)]){
    const basis=spaceBasis(p);
    assert.deepEqual(p.position,start.position);
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)near(dot(basis[i],basis[j]),i===j?1:0);
    for(let i=0;i<3;i++){
      const axis=Array.from({length:3},(_,k)=>i===k?1:0);
      const moved=moveFree(p,axis,12,.5), delta=moved.position.map((x,j)=>x-p.position[j]);
      for(let j=0;j<3;j++)near(dot(delta,basis[j]),i===j?(i===2?-6:6):0);
    }
  }
  const one=moveFree(start,[1,1,1],12,1);
  let many=start;
  for(let k=0;k<100;k++)many=moveFree(many,[1,1,1],12,.01);
  one.position.forEach((x,i)=>near(x,many.position[i]));
  near(Math.hypot(...one.position.map((v,i)=>v-start.position[i])),12);
  assert(freeSpeed(start,-8)<freeSpeed(start,0)&&freeSpeed(start,0)<freeSpeed(start,8));
});

test('transition preserves perspective, floating point world positions and bounded clipping',()=>{
  for(const d of [.0005,85,1200]){
    const orbit={...spaceCamera(),zoom:2,focus:[d/8,-d/4,d/3]};
    const free=orbitToFree(orbit,d), back=freeToOrbit(free,d);
    orbit.focus.forEach((x,i)=>near(back.focus[i],x));
    near(back.zoom,orbit.zoom);
    const world=[...orbit.focus];
    const before=spaceProjector(orbit,390,410,d)(world);
    const projection=spaceProjector({...free,nearPlane:freeNear(free)},390,410,d);
    const after=projection(world);
    for(const key of ['x','y','depth','pixelsPerAU'])near(before[key],after[key],1e-5);
    assert.equal(projection(free.position),null);
    assert(projection.segment(free.position,world).every(p=>[p.x,p.y,p.depth,p.pixelsPerAU].every(Number.isFinite)));
    assert.deepEqual(world,orbit.focus);
    const max=moveFree(free,[1,1,1],1e4,1e10);
    assert(max.position.every(x=>Number.isFinite(x)&&Math.abs(x)<=1e6));
  }
});

test('Apophis addition verifies the archive seam and closest Earth-centre encounter',()=>{
  const bytes=read('our-home-2026.1/apophis.json');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),ENCOUNTER.sha256);
  const {sun,relative}=JSON.parse(bytes);
  const existing=decodeSmallBodies('asteroid',buffer(read(SMALL+'/asteroid.bin'))).get('apophis').sample(ENCOUNTER.first);
  [...existing.position,...existing.velocity].forEach((value,i)=>near(value,sun[0][i+1],1e-6));
  const event=closestApproach(relative);
  near(event.day,ENCOUNTER.event.day);near(event.distanceKm,ENCOUNTER.event.distanceKm);
  assert(event.distanceKm>38000&&event.distanceKm<38020);
  assert.equal(sampleVector(sun,ENCOUNTER.last+1e-7),null);
  assert.equal(sampleVector(relative,relative[0][0]-1e-7),null);
  for(const result of Object.values(ENCOUNTER.checks)){
    assert.equal(result.count,35);assert(result.km<.02&&result.kms<.00005);
  }
});

test('Voyager add-on preserves old states and stops at the forecast limit',()=>{
  const bytes=read('our-home-2026.1/voyager-forecast.json');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),FORECAST.sha256);
  const original=Object.fromEntries(['v1','v2','earth'].map(id=>[
    id,decodeVoyager(id,buffer(read(RELEASE+'/'+id+'.bin'))),
  ]));
  const data=extendVoyager(original,JSON.parse(bytes));
  for(const [id,series] of Object.entries(data)){
    assert.deepEqual(series.sample(END),original[id].sample(END));
    assert.deepEqual(series.sample(2459070.5),original[id].sample(2459070.5));
    assert(series.sample(FORECAST.end).position.every(Number.isFinite));
    assert.equal(series.sample(FORECAST.end+1e-7),null);
    assert(FORECAST.checks[id].count===32&&FORECAST.checks[id].seamKm===0&&FORECAST.checks[id].seamKmS===0);
  }
  assert.deepEqual(data.v2.trail(FORECAST.end).slice(0,original.v2.trail(END).length),original.v2.trail(END));
});
