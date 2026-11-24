import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {AU_KM} from '../dist/explorer/solar-model.mjs';
import {decodeSystem,sampleCount,supportsEpoch} from '../dist/explorer/new-worlds-ephemeris.mjs';
import {ephemerisSpec,seriesFor} from '../dist/explorer/new-worlds-spec.mjs';
import {localOrbitPath,systemBodies,worldComparison,worldNotes,worldVector} from '../dist/explorer/new-worlds.mjs';

const ids={saturn:[606,602,605,604,603,608,601],uranus:[703,704,702,701,705],neptune:[801,808,802]};
const centres={saturn:699,uranus:799,neptune:899};
function normal({position:[x,y,z],velocity:[vx,vy,vz]}){
  return [y*vz-z*vy,z*vx-x*vz,x*vy-y*vx];
}

for(const [system,targets] of Object.entries(ids)){
  test(`${system} loads planet-centred states and calibrated sizes, within a bounded year`,async()=>{
    const {start,end,release,pack}=ephemerisSpec(system);
    assert.equal(end-start,365);
    assert.deepEqual(seriesFor(system).map(m=>m.target),targets);
    const bytes=await readFile(new URL(`../dist/explorer/data/${release}/${system}.bin`,import.meta.url));
    assert.equal(bytes.length,pack.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),pack.sha256);
    assert.equal(bytes.readUInt32BE(4),centres[system]);
    assert.equal(bytes.length,8+seriesFor(system).reduce((sum,s)=>sum+sampleCount(s.hours,system)*48,0));
    const data=decodeSystem(system,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
    const [parent,...moons]=systemBodies(system);
    assert.equal(parent.id,system);
    for(const day of [start,start+176.123,end]){
      assert(supportsEpoch(day,system));
      assert.deepEqual(data.sample(parent.id,day),{position:[0,0,0],velocity:[0,0,0]});
      for(const moon of moons){
        const state=data.sample(moon.id,day);
        const radius=Math.hypot(...state.position);
        assert(radius>parent.radiusKm);
        assert(moon.radiusKm>0&&moon.meanOrbitKm>parent.radiusKm);
        assert(worldNotes[moon.id][0].every(Boolean));
        assert.deepEqual(worldVector(data,system,moon.id,day,true),state.position.map(km=>km/AU_KM));
        assert.equal(worldComparison(data,system,day,moon.id,parent.id).distanceKm,radius);
        assert.equal(worldComparison(data,system,day,moon.id,'sun'),null);
        assert(localOrbitPath(data,system,moon,day).every(point=>point?.every(Number.isFinite)));
      }
    }
    for(const day of [start-1e-5,end+1e-5,NaN]){
      assert.equal(data.sample(moons[0].id,day),null);
      assert.equal(data.sample(system,day),null);
    }
    const day=start+132.48;
    if(system==='uranus'){
      const h=normal(data.sample('titania',day));
      assert(Math.abs(h[2])/Math.hypot(...h)<.35,'the Uranian orbital plane is strongly tilted to the ecliptic');
    }
    if(system==='neptune'){
      const a=normal(data.sample('triton',day)), b=normal(data.sample('proteus',day));
      assert(a.reduce((sum,v,i)=>sum+v*b[i],0)<0,'Triton is retrograde relative to Proteus');
      const radii=localOrbitPath(data,system,moons[2],day).map(p=>Math.hypot(...p));
      assert(Math.max(...radii)>4*Math.min(...radii));
    }
  });
}
