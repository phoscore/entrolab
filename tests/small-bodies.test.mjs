import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {AU_KM} from '../dist/explorer/solar-model.mjs';
import {FRAME,RELEASE,GROUPS,catalog,parseSmallDate,formatSmallDate} from '../dist/explorer/small-bodies-spec.mjs';
import {PACKS,METADATA} from '../dist/explorer/small-bodies-release.mjs';
import {decodeSmallBodies} from '../dist/explorer/small-bodies-data.mjs';
import {beltFitPoints,orbitalArc,smallBodyById,smallBodyCopy} from '../dist/explorer/small-bodies-view.mjs';

const read=file=>readFileSync(new URL(`../dist/explorer/data/${RELEASE}/${file}`,import.meta.url));
const binary=bytes=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
const manifest=JSON.parse(read('manifest.json'));
const records=new Map();
for(const group of Object.keys(GROUPS)){
  const bytes=read(group+'.bin'), view=binary(bytes);
  assert.deepEqual(PACKS[group],{bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
  const entries=decodeSmallBodies(group,view);
  for(const [id,series] of entries)records.set(id,series);
  const corrupt=view.slice(0);
  new DataView(corrupt).setFloat64(24,NaN,true);
  assert.throws(()=>decodeSmallBodies(group,corrupt),/component/);
}
test('small-body catalogue has 22 verified distinct identities, complete groups and pinned releases',()=>{
  assert.equal(catalog.length,22);
  assert.equal(new Set(catalog.map(x=>x.designation)).size,22);
  assert.equal(new Set(Object.values(METADATA).map(x=>x.spkid)).size,22);
  assert.deepEqual(Object.values(GROUPS).map(group=>group.length),[4,7,6,5]);
  assert.equal(manifest.frame,FRAME);
  for(const body of catalog){
    const series=records.get(body.id);
    for(const day of [body.start,body.end,(body.start+body.end)/2]){
      const v=series.sample(day);
      assert(v.position.every(Number.isFinite)&&v.velocity.every(Number.isFinite));
      assert(Math.hypot(...v.position)>AU_KM*.1);
    }
    assert.equal(series.sample(body.start-.01),null);
    assert.equal(series.sample(body.end+.01),null);
    assert.equal(series.sample(NaN),null);
    assert(manifest.results[body.id].references>=32);
  }
  assert(Object.values(smallBodyCopy).every(pair=>pair.length===2&&pair.every(Boolean)));
});

test('eccentric and inclined comet geometry comes from archived vectors',()=>{
  const halley=smallBodyById.get('halley');
  const series=records.get(halley.id);
  const arc=orbitalArc(series,halley);
  const distances=arc.map(v=>Math.hypot(...v));
  assert(Math.min(...distances)<.62);
  assert(Math.max(...distances)>34);
  assert(arc.some(v=>Math.abs(v[2])>3));
  assert(arc.length<=640);
  const a=series.sample(parseSmallDate('2061-07-28')+.25);
  assert(Math.hypot(...a.position)/AU_KM<.7);
  assert(Math.hypot(...a.velocity)>48);
  assert.equal(formatSmallDate(parseSmallDate('2061-07-28')),'2061-07-28T00:00');
  assert.equal(parseSmallDate('2061-02-30'),null);
  for(const [i,key] of ['asteroid','tno'].entries()){
    const points=beltFitPoints(new Set([key]));
    const radius=i?50:3.3;
    assert(points.every(v=>Math.abs(Math.hypot(v[0],v[1])-radius)<1e-12&&v[2]!==0));
  }
});
