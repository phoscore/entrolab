import test from 'node:test';
import assert from 'node:assert/strict';
import {bodies,solarState,MIN_DAY,MAX_DAY,J2000,orbitAt,eccentricAnomaly,vectorOnOrbit} from '../dist/explorer/solar-model.mjs';
import {ORBIT_POSES,spaceCamera,rotateSpace,zoomSpace,spaceProjector,projectSpace,trailSamples} from '../dist/explorer/solar-space.mjs';

const near=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<eps,`${a} ≠ ${b}`);
test('perspective uses actual J2000 X/Y/Z and sun remains origin in every pose',()=>{
  for(const pose of Object.keys(ORBIT_POSES)){
    const camera=spaceCamera(pose),sun=projectSpace([0,0,0],camera,900,600);
    near(sun.x,450);near(sun.y,300);
    for(const {vector} of solarState(J2000)){
      const p=projectSpace(vector,camera,900,600);
      assert.ok(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.depth>0);
    }
  }
  const lens=spaceProjector(spaceCamera('angle'),900,600);
  for(const vector of solarState(J2000).map(s=>s.vector))
    assert.deepEqual(lens(vector),projectSpace(vector,spaceCamera('angle'),900,600));
  const top=spaceCamera('top');
  const x=projectSpace([1,0,0],top,900,600),y=projectSpace([0,1,0],top,900,600);
  assert.ok(x.x>450&&Math.abs(x.y-300)<.01);
  assert.ok(y.y<300&&Math.abs(y.x-450)<.01);
  const side=spaceCamera('side');
  const above=projectSpace([0,0,1],side,900,600);
  assert.ok(above.y<300);
  const nearBody=projectSpace([0,-1,0],side,900,600);
  const farBody=projectSpace([0,1,0],side,900,600);
  assert.ok(nearBody.depth<farBody.depth&&nearBody.pixelsPerAU>farBody.pixelsPerAU);
  assert.equal(projectSpace([0,-1,0],{...side,zoom:5},900,600),null);
  assert.deepEqual(spaceCamera('top').focus,[0,0,0]);
  assert.throws(()=>spaceCamera('galactic'),RangeError);
});
test('camera rotation, focus and zoom change pixels, never JPL model coordinates',()=>{
  const original=solarState(J2000).map(s=>s.vector);
  const camera=spaceCamera(),rotated=rotateSpace(camera,65,-45),zoomed=zoomSpace(rotated,1.3);
  const source=solarState(J2000).find(s=>s.body.id==='mars').vector;
  assert.notDeepEqual(projectSpace(source,camera,800,500),projectSpace(source,rotated,800,500));
  assert.notDeepEqual(projectSpace(source,rotated,800,500),projectSpace(source,zoomed,800,500));
  const focused=projectSpace(source,{...zoomed,focus:[...source]},800,500);
  near(focused.x,400);near(focused.y,250);
  near(rotateSpace(camera,0,-1e8).pitch,-Math.PI/2+.005);
  near(zoomSpace(camera,1e8).zoom,5);near(zoomSpace(camera,-1e8).zoom,0);
  assert.deepEqual(solarState(J2000).map(s=>s.vector),original);
});
test('sampled trails are model vectors at fixed TDB epochs, bounded and frame independent',()=>{
  for(const day of [MIN_DAY,MIN_DAY+1,J2000,J2000+100,MAX_DAY]){
    for(const body of bodies.slice(1)){
      const trail=trailSamples(day,body);
      assert.ok(trail.samples.length<=97&&trail.samples.length>=1);
      assert.ok(trail.start>=MIN_DAY&&trail.day<=MAX_DAY);
      near(trail.samples.at(-1).day,day,1e-8);
      for(const sample of trail.samples){
        assert.ok(sample.day>=MIN_DAY&&sample.day<=MAX_DAY);
        const expected=solarState(sample.day).find(s=>s.body.id===body.id).vector;
        sample.vector.forEach((x,i)=>near(x,expected[i],1e-10));
      }
      assert.deepEqual(trailSamples(day,body),trail);
      const a=trail.samples.at(-1).vector,b=solarState(day).find(s=>s.body.id===body.id).vector;
      assert.deepEqual(a,b);
      const changedCamera=rotateSpace(spaceCamera(),150,80);
      assert.deepEqual(trailSamples(day,body),trail);
      projectSpace(a,changedCamera,320,360);
    }
  }
  assert.equal(trailSamples(MIN_DAY,bodies[1]).samples.length,1);
  assert.throws(()=>trailSamples(MIN_DAY-1,bodies[1]),RangeError);
  assert.throws(()=>trailSamples(MAX_DAY+1,bodies[1]),RangeError);
  assert.throws(()=>trailSamples(J2000,bodies[0]),RangeError);
});
test('high-rate model jumps still sample the intervening ellipse rather than rendered frames',()=>{
  const mercury=bodies[1],before=trailSamples(J2000,mercury),after=trailSamples(J2000+100,mercury);
  assert.ok(after.samples.length>=25);
  assert.notDeepEqual(after.samples[0].vector,before.samples[0].vector);
  const orbit=orbitAt(mercury,J2000+100);
  assert.deepEqual(after.samples.at(-1).vector,vectorOnOrbit(orbit,eccentricAnomaly(orbit.mean,orbit.e)));
  // For this orbital fraction, each chord is far below a diameter jump.
  const maxChord=Math.max(...after.samples.slice(1).map((p,i)=>Math.hypot(...p.vector.map((x,k)=>x-after.samples[i].vector[k]))));
  assert.ok(maxChord<.04,`Mercury chord ${maxChord} AU`);
});
