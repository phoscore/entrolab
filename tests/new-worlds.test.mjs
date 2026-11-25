import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {decodeSystem,encodeSystem,loadEphemeris,sampleCount,supportsEpoch} from '../dist/explorer/new-worlds-ephemeris.mjs';
import {END,RELEASE,SECONDS_PER_DAY,START,SYSTEMS,LEGACY_SYSTEMS,seriesFor} from '../dist/explorer/new-worlds-spec.mjs';
import {localOrbitPath,worldComparison,worldTrail,worldVector} from '../dist/explorer/new-worlds.mjs';
import {AU_KM,solarState} from '../dist/explorer/solar-model.mjs';
import {LIGHT_KM_S} from '../dist/explorer/solar-motion.mjs';
import {spaceCamera,spaceProjector} from '../dist/explorer/solar-space.mjs';

const readPackageBytes = id => readFile(new URL(`../dist/explorer/data/${RELEASE}/${id}.bin`, import.meta.url));
const readPackage = async id => {
  const bytes = await readPackageBytes(id);
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

test('the runtime loader accepts only the pinned original release bytes', async t => {
  const originals = new Map(await Promise.all(Object.keys(LEGACY_SYSTEMS).map(async id=>[id,await readPackageBytes(id)])));
  let payload;
  const request = t.mock.method(globalThis,'fetch',async (url, options)=>{
    assert.equal(url.pathname.split('/').at(-2),RELEASE);
    assert.equal(options.cache,'no-store');
    return new Response(payload);
  });
  for (const [id, bytes] of originals) {
    payload = bytes;
    const loaded = await loadEphemeris(id);
    assert.deepEqual(loaded.sample(id,START),(await readPackage(id)).sample(id,START));
  }
  const original = originals.get('earth');
  const shiftedY = Buffer.from(original);
  // Reproduce W-01 by shifting every Earth-centre Y by 100 million km. The Moon series and header are untouched.
  const earthRows = sampleCount(SYSTEMS.earth.bodies[0].hours);
  for (let offset = 16; offset < 8 + earthRows*48; offset += 48) {
    shiftedY.writeDoubleLE(shiftedY.readDoubleLE(offset)+100_000_000,offset);
  }
  const oneCoordinate = Buffer.from(original);
  oneCoordinate.writeDoubleLE(oneCoordinate.readDoubleLE(8)+1,8);
  const stale = Buffer.from(original);
  stale.copyWithin(8+48,8,8+48);
  const invalidState = Buffer.from(original);
  invalidState.writeDoubleLE(Infinity,invalidState.length-8);
  const badMagic = Buffer.from(original);
  badMagic[0] ^= 1;
  for (const [description, bytes] of [
    ['audit reproduction',shiftedY],['one changed coordinate',oneCoordinate],['same-format stale state',stale],
    ['another system',originals.get('pluto')],['non-finite state',invalidState],['invalid header',badMagic],
    ['truncated stream',original.subarray(0,-1)],
  ]) {
    payload = bytes;
    await assert.rejects(loadEphemeris('earth'),/Data integrity mismatch/,description);
  }
  payload = original;
  assert.ok((await loadEphemeris('earth')).sample('moon',START));
  assert.equal(request.mock.callCount(),11);
});

test('over-budget bodies are cancelled even without a reliable Content-Length', async t => {
  const original = await readPackageBytes('earth');
  let response;
  t.mock.method(globalThis,'fetch',async ()=>response);
  for (const headers of [{},{'Content-Length':String(original.length)}]) {
    let reads = 0, cancelled = false;
    response = new Response(new ReadableStream({
      pull(controller) {
        reads++;
        controller.enqueue(reads===1?original:Uint8Array.of(0));
        if (reads===3) controller.close();
      },
      cancel() {cancelled=true;},
    },{highWaterMark:0}),{headers});
    await assert.rejects(loadEphemeris('earth'),/Data exceeds byte budget/);
    assert.equal(reads,2);
    assert.equal(cancelled,true);
  }
});

test('the decoder rejects non-finite position and velocity values throughout a package', async () => {
  const original = await readPackageBytes('earth');
  for (const [offset,value] of [[8,NaN],[40,-Infinity],[original.length-8,Infinity]]) {
    const bytes = new Uint8Array(original);
    new DataView(bytes.buffer).setFloat64(offset,value,true);
    assert.throws(()=>decodeSystem('earth',bytes.buffer),/Non-finite state value/);
  }
});

test('versioned Horizons packages preserve barycentric geometry at both endpoints', async () => {
  for (const id of Object.keys(LEGACY_SYSTEMS)) {
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
