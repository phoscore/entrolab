import assert from 'node:assert/strict';
import test from 'node:test';
import {AU_KM, J2000, bodies, solarState} from '../dist/explorer/solar-model.mjs';
import {solarVelocities} from '../dist/explorer/solar-motion.mjs';
import {
  GALACTIC_MIN_DAY, GALACTIC_MAX_DAY, MAX_TRAIL_POINTS, SUN_KM_S, TRAIL_DAYS,
  flightTrails, galacticPosition, galacticVelocity, rotateEcliptic,
  schematicPosition, sunDisplacement, supportsGalacticDay,
} from '../dist/explorer/solar-galactic.mjs';

const delta = (a,b) => a.map((v,i) => v-b[i]);
const norm = a => Math.hypot(...a);
const dot = (a,b) => a.reduce((sum,v,i) => sum+v*b[i],0);
const near = (actual, expected, tolerance) =>
  assert.ok(norm(delta(actual, expected)) <= tolerance, `${actual} versus ${expected}`);

test('Galactocentric rotation matches independent Astropy 7.2.0 Cartesian transforms', () => {
  // Astropy public SkyCoord(ICRS).transform_to(Galactocentric()) with
  // galactocentric_frame_defaults = v4.0. Subtract the transformed origin.
  const axes = [[1,0,0],[0,1,0],[0,0,1]].map(rotateEcliptic);
  const expected = [
    [-0.057095820333710634, 0.4941107627040048, -0.8675221158451737],
    [-0.9938191151529185, -0.1109899162439757, 0.0021919965387417195],
    [-0.09520311789585101, 0.8622852153853862, 0.4973937812947474],
  ];
  axes.forEach((v,i) => near(v,expected[i],2e-12));
  near(rotateEcliptic([.7,-2.3,1.9]),[2.0649309666159983,2.239496250486181,.3327411113292922],2e-12);
  axes.forEach((a,i) => axes.forEach((b,j) => assert.ok(Math.abs(dot(a,b)-Number(i===j))<5e-16)));
  const [x,y,z] = axes;
  near([x[1]*y[2]-x[2]*y[1], x[2]*y[0]-x[0]*y[2], x[0]*y[1]-x[1]*y[0]],z,5e-16);
  assert.deepEqual(galacticVelocity([0,0,0]),[12.9,245.6,7.78]);
  assert.ok(Math.abs(norm(SUN_KM_S)-246.061574408)<1e-5);
});

test('TDB window, exact AU conversion and Gaia acceleration scale hold at both edges', () => {
  assert.deepEqual(sunDisplacement(J2000),[0,0,0]);
  near(sunDisplacement(J2000+365.25),SUN_KM_S.map(v=>v*31557600/149597870.7),1e-13);
  for (const day of [GALACTIC_MIN_DAY,GALACTIC_MAX_DAY]) {
    assert.ok(supportsGalacticDay(day));
    const seconds = Math.abs(day-J2000)*86400;
    assert.ok(.5*4e-10*seconds**2/(AU_KM*1000)<.0012);
    assert.ok(4e-10*seconds<.38);
  }
  for (const day of [GALACTIC_MIN_DAY-1e-6,GALACTIC_MAX_DAY+1e-6,NaN,Infinity,null]) {
    assert.equal(supportsGalacticDay(day),false);
    assert.throws(()=>sunDisplacement(day),RangeError);
  }
  assert.throws(()=>flightTrails(J2000,0),RangeError);
});

test('shared Galactic drift preserves distances and relative velocities for every body pair', () => {
  for (const day of [GALACTIC_MIN_DAY,GALACTIC_MIN_DAY+10,J2000,J2000+7932.123,GALACTIC_MAX_DAY]) {
    const {states} = solarVelocities(day);
    const kilometresPerSecond = v => v.map(c=>c*AU_KM/86400);
    const vectors = states.map(({vector})=>galacticPosition(day,vector));
    const velocities = states.map(({velocityAUPerDay})=>galacticVelocity(kilometresPerSecond(velocityAUPerDay)));
    for (let i=0;i<states.length;i++) for (let j=0;j<i;j++) {
      const r = delta(states[i].vector,states[j].vector);
      const v = kilometresPerSecond(delta(states[i].velocityAUPerDay,states[j].velocityAUPerDay));
      near(delta(vectors[i],vectors[j]),rotateEcliptic(r),4e-13);
      near(delta(velocities[i],velocities[j]),rotateEcliptic(v),6e-14);
      assert.ok(Math.abs(norm(delta(vectors[i],vectors[j]))-norm(r))<4e-13);
      assert.ok(Math.abs(dot(delta(vectors[i],vectors[j]),delta(velocities[i],velocities[j]))-dot(r,v))<2e-11);
    }
  }
});

test('position derivative recovers the solar vector plus the rotated JPL derivative', () => {
  for (const days of [-8900,0,7200]) {
    const epoch = J2000+days, h = .0078125;
    const endpoints = [epoch-h,epoch+h].map(t=>solarState(t).map(({vector})=>galacticPosition(t,vector)));
    solarVelocities(epoch).states.forEach(({velocityAUPerDay},i)=>{
      const measured = delta(endpoints[1][i],endpoints[0][i]).map(v=>v*AU_KM/(86400*2*h));
      near(measured,galacticVelocity(velocityAUPerDay.map(v=>v*AU_KM/86400)),4e-6);
    });
  }
});

test('flight trails use exact model-time points, resolve curves and bound memory at every duration', () => {
  for (const epoch of [GALACTIC_MIN_DAY,GALACTIC_MIN_DAY+.2,GALACTIC_MIN_DAY+365,J2000+51.2345,GALACTIC_MAX_DAY]) {
    for (const duration of TRAIL_DAYS) {
      const tracks = flightTrails(epoch,duration);
      assert.deepEqual(tracks.map(({body})=>body.id),bodies.map(({id})=>id));
      let count = 0;
      tracks.forEach(({samples},i) => {
        assert.equal(samples[0].day,Math.max(GALACTIC_MIN_DAY,epoch-duration));
        assert.equal(samples.at(-1).day,epoch);
        assert.equal(samples.at(-1).age,0);
        count += samples.length;
        samples.forEach(({day,vector,age},j)=>{
          near(vector,galacticPosition(day,solarState(day)[i].vector),0);
          assert.ok(age>=0 && age<=1);
          if (j===0) return;
          const a = samples[j-1];
          assert.ok(day>a.day && day-a.day<=14+1e-9);
          const mid = (a.day+day)/2;
          const chord = vector.map((v,k)=>(v+a.vector[k])/2);
          near(chord,galacticPosition(mid,solarState(mid)[i].vector),.001);
        });
      });
      assert.ok(count<=MAX_TRAIL_POINTS);
    }
  }
  assert.ok(MAX_TRAIL_POINTS<920);
});

test('samples are independent of playback history and the schematic transform leaves model vectors intact', () => {
  const epoch=J2000+100, duration=90;
  const at100=flightTrails(epoch,duration);
  flightTrails(epoch-25,duration); // e.g. a quarter-second at 100 days/s
  flightTrails(epoch-.1,duration);
  assert.deepEqual(flightTrails(epoch,duration),at100);
  assert.deepEqual(at100[1].samples.slice(1,-1).filter(p=>p.day>epoch-duration+1).map(p=>p.vector),
    flightTrails(epoch+1,duration)[1].samples.slice(1,-1).filter(p=>p.day<epoch).map(p=>p.vector));
  const sun=sunDisplacement(epoch), point=galacticPosition(epoch,solarState(epoch)[3].vector);
  near(delta(schematicPosition(point,sun),sun),delta(point,sun).map(v=>v*3),1e-14);
  assert.deepEqual(schematicPosition(sun,sun),sun);
  assert.deepEqual(galacticPosition(epoch,solarState(epoch)[3].vector),point);
});
