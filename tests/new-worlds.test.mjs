import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {decodeSystem,encodeSystem,sampleCount,supportsEpoch} from '../dist/explorer/new-worlds-ephemeris.mjs';
import {END,RELEASE,SECONDS_PER_DAY,START,SYSTEMS,seriesFor} from '../dist/explorer/new-worlds-spec.mjs';
import {localOrbitPath,worldComparison,worldTrail,worldVector} from '../dist/explorer/new-worlds.mjs';
import {AU_KM,solarState} from '../dist/explorer/solar-model.mjs';
import {LIGHT_KM_S} from '../dist/explorer/solar-motion.mjs';
import {spaceCamera,spaceProjector} from '../dist/explorer/solar-space.mjs';

const readPackage = async id => {
  const bytes = await readFile(new URL(`../dist/explorer/data/${RELEASE}/${id}.bin`, import.meta.url));
  return decodeSystem(id, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
};

test('cubic Hermite interpolation keeps position and velocity in matching units', () => {
  const cubic = (t, i) => ((i + 1)*t**3 - 2*t**2 + 3*t - i);
  const derivative = (t, i) => (3*(i + 1)*t**2 - 4*t + 3)/SECONDS_PER_DAY;
  const vector = (fn, t) => [0,1,2].map(i => fn(t,i));
  const series = seriesFor('earth');
  const data = new Map(series.map(({id,hours}) => [id, Array.from({length: sampleCount(hours)}, (_, row) => {
    const days = row*hours/24;
    return [...vector(cubic,days), ...vector(derivative,days)];
  }).flat()]));
  const bytes = encodeSystem('earth',data);
  const eph = decodeSystem('earth',bytes);
  for (const t of [0, .125, 1, END-START]) {
    const s = eph.sample('moon',START+t);
    assert.ok(s.position.every((v,i)=>Math.abs(v-cubic(t,i))<1e-10));
    assert.ok(s.velocity.every((v,i)=>Math.abs(v-derivative(t,i))<1e-10));
  }
  assert.throws(()=>decodeSystem('jupiter',bytes),/Invalid/);
  assert.throws(()=>decodeSystem('earth',bytes.slice(0,8)),/Invalid/);
  for (const invalid of [START-1/24,END+1/24,NaN,Infinity,undefined]) {
    assert.equal(supportsEpoch(invalid),false);
    assert.equal(eph.sample('moon',invalid),null);
  }
  assert.equal(eph.sample('charon',START),null);
});

test('versioned Horizons packages preserve barycentric geometry at both endpoints', async () => {
  for (const id of Object.keys(SYSTEMS)) {
    const data = await readPackage(id);
    const [parent,satellite] = SYSTEMS[id].bodies;
    for (const day of [START,START+.75,END]) {
      const planet = data.sample(parent.id,day);
      const moon = data.sample(satellite.id,day);
      const result = worldComparison(data,id,day,satellite.id,parent.id);
      const delta = moon.position.map((v,i)=>v-planet.position[i]);
      assert.ok(Math.hypot(...planet.position)>0, 'physical centre is offset from its barycentre');
      assert.equal(result.source,'horizons');
      assert.equal(result.distanceKm,Math.hypot(...delta));
      assert.equal(result.distanceAU,result.distanceKm/AU_KM);
      assert.equal(result.lightSeconds,result.distanceKm/LIGHT_KM_S);
      assert.equal(result.speedKmS,Math.hypot(...moon.velocity.map((v,i)=>v-planet.velocity[i])));
      assert.equal(worldComparison(data,id,day,satellite.id,'mars'),null);
      const heliocentric = worldComparison(data,id,day,satellite.id,'sun');
      assert.equal(heliocentric.source,id==='pluto'?'horizons':'hybrid');
      const legacy = id==='pluto'?data.sample('pluto-anchor',day).position.map(v=>v/AU_KM):solarState(day).find(v=>v.body.id===id).vector;
      const vector = worldVector(data,id,satellite.id,day);
      assert.ok(vector.every((v,i)=>Math.abs(v - legacy[i] - moon.position[i]/AU_KM)<2e-14));
      assert.ok(moon.position.every((v,i)=>worldVector(data,id,satellite.id,day,true)[i]===v/AU_KM));
    }
    assert.equal(worldComparison(data,id,END+1,satellite.id,parent.id),null);
    assert.deepEqual(worldTrail(data,id,satellite,START,true),[worldVector(data,id,satellite.id,START,true)]);
    assert.ok(worldTrail(data,id,satellite,START+.2,true).every(v=>v?.every(Number.isFinite)));
    assert.equal(localOrbitPath(data,id,satellite,END+.01).length,0);
    for (const day of [START,END]) {
      const path = localOrbitPath(data,id,satellite,day);
      assert.equal(path.length,65);
      assert.ok(path.every(v=>v?.every(Number.isFinite)));
    }
    const front = spaceProjector(spaceCamera(),320,360,3.1*SYSTEMS[id].scaleKm/AU_KM);
    assert.ok(Number.isFinite(front(worldVector(data,id,satellite.id,START,true)).depth));
  }
});
