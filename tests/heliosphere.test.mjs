import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AU_KM,parseModelDate} from '../dist/explorer/solar-model.mjs';
import {boundaries,nose,shellGeometry,crossings,crossingPosition,observedRegion,regionPoint} from '../dist/explorer/heliosphere-model.mjs';
import {decodeVoyager,END,RELEASE,V2_GAP} from '../dist/explorer/voyager-data.mjs';
import {resolveCrossings,heliosphereText} from '../dist/explorer/heliosphere-view.mjs';

test('shells are finite, asymmetric, nested and expressed in heliocentric ecliptic AU',()=>{
  const shells=shellGeometry();
  assert.deepEqual(shells,shellGeometry());
  assert(Math.abs(Math.hypot(...nose)-1)<1e-14);
  assert(nose[0]<0&&nose[1]<-.95&&nose[2]>0);
  assert.equal(shells[0].rings.length,21);
  for(let j=0;j<21;j++){
    const cosine=Math.cos(j*Math.PI/20);
    for(let i=0;i<40;i++){
      const outer=shells[0].rings[j][i], inner=shells[1].rings[j][i];
      const {shock,heliopause}=boundaries(cosine,i*2*Math.PI/40);
      assert(Math.abs(Math.hypot(...outer)-heliopause)<1e-10);
      assert(Math.abs(Math.hypot(...inner)-shock)<1e-10);
      assert(Math.abs(outer.reduce((sum,v,k)=>sum+v*nose[k],0)/heliopause-cosine)<1e-13);
      assert(shock>70&&heliopause-shock>25);
    }
  }
  const east=[-Math.sin(256*Math.PI/180),Math.cos(256*Math.PI/180),0];
  const radii=['wind','shock','sheath','heliopause','interstellar'].map(id=>Math.hypot(...regionPoint(id,east)));
  assert(radii.every((radius,index)=>!index||radius>radii[index-1]));
  assert(boundaries(-1,0).heliopause>2*boundaries(1,0).heliopause);
  assert.notEqual(boundaries(0,Math.PI/2).heliopause,boundaries(0,-Math.PI/2).heliopause);
});

function readProbe(id){
  const bytes=readFileSync(new URL(`../dist/explorer/data/${RELEASE}/${id}.bin`,import.meta.url));
  return decodeVoyager(id,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
}
test('observed crossings use the released ephemerides and documented calendar dates',()=>{
  const data={v1:readProbe('v1'),v2:readProbe('v2')};
  assert.deepEqual(crossings.map(({day})=>day),
    ['2004-12-16','2007-08-30','2012-08-25','2018-11-05'].map(parseModelDate));
  assert.equal(crossings[1].lastDay,parseModelDate('2007-09-01'));
  const positions=resolveCrossings(data);
  assert.equal(positions.length,4);
  for(const {event,vector} of positions){
    assert(Math.abs(Math.hypot(...vector)-event.au)<.5);
    assert.deepEqual(vector,data[event.probe].sample(event.day).position.map(value=>value/AU_KM));
    assert.equal(crossingPosition({...event,day:END+1},data),null);
  }
  assert.equal(resolveCrossings(null).length,0);
  assert.equal(resolveCrossings({v2:data.v2}).length,2);
  assert.equal(crossingPosition({...crossings[1],day:(V2_GAP[0]+V2_GAP[1])/2},data),null);
});

test('chronology comes from spacecraft observations across the entire crossing date or interval',()=>{
  for(const event of crossings){
    const phase=event.boundary==='shock'?'shockCrossing':'pauseCrossing';
    assert.equal(observedRegion(event.probe,event.day),phase);
    assert.equal(observedRegion(event.probe,event.lastDay+.9),phase);
    assert.equal(observedRegion(event.probe,event.lastDay+1),event.boundary==='shock'?'sheath':'interstellar');
  }
  assert.equal(observedRegion('v1',crossings[0].day-1),'wind');
  assert.equal(observedRegion('earth',crossings[0].day),null);
  assert(Object.values(heliosphereText).every(pair=>pair.length===2&&pair.every(Boolean)));
});
