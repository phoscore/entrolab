import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AU_KM, J2000, MIN_DAY, MAX_DAY, bodies, advanceModelDay, formatModelDay, parseModelDate, eccentricAnomaly, orbitAt, vectorOnOrbit, solarState, eclipticToMap, radiusAU} from '../dist/explorer/solar-model.mjs';
import {screenPoint, worldPoint, zoomAt, panBy} from '../dist/explorer/camera.mjs';
import {placeLabels} from '../dist/explorer/labels.mjs';
import {preferredStarName, systemFor} from '../dist/explorer/identities.mjs';
import {RELEASE} from '../dist/explorer/release.mjs';

const json = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const close = (a,b,tol=1e-10) => assert.ok(Math.abs(a-b)<=tol,`${a} differs from ${b}`);

test('JPL fit agrees with independent VSOP87A heliocentric vectors at two TDB epochs', () => {
  const {rows} = json('./fixtures/solar-vsop87a.json');
  // Numerical regression gates per planet in AU. These cover the observed residual
  // at these two epochs and are not guarantees for arbitrary dates.
  const bounds = {mercury:2e-5,venus:7e-5,earth:4e-5,mars:2e-4,jupiter:.009,saturn:.033,uranus:.01,neptune:.009};
  assert.equal(rows.length,16);
  for (const [day,id,ref] of rows) {
    const v = solarState(day).find(row=>row.body.id===id).vector;
    const error = Math.hypot(...v.map((x,i)=>x-ref[i]));
    assert.ok(error < bounds[id], `${id} JD${day}: ${error} AU`);
  }
});

test('elliptic solver is periodic and bounded at high eccentricity', () => {
  for (const m of [-3,-.2,0,.2,3]) for (const e of [0,.02,.2,.999999]) {
    const anomaly = eccentricAnomaly(m,e);
    close(anomaly-e*Math.sin(anomaly),m);
    close(eccentricAnomaly(m+8*Math.PI,e),anomaly);
  }
  for (const bad of [-1,1,NaN,Infinity]) assert.throws(()=>eccentricAnomaly(0,bad),RangeError);
  assert.throws(()=>eccentricAnomaly(NaN,.1),RangeError);
});

test('orbital basis retains distance, inclination and perihelion/aphelion', () => {
  for (const day of [MIN_DAY,J2000,MAX_DAY]) {
    const states=solarState(day);
    assert.deepEqual(states[0].vector,[0,0,0]);
    assert.equal(states.length,9);
    for (const {orbit,vector,distanceAU} of states.slice(1)) {
      const {a,e,p,q}=orbit;
      close(Math.hypot(...p),1);close(Math.hypot(...q),1);
      close(p.reduce((sum,v,i)=>sum+v*q[i],0),0);
      close(Math.hypot(...vectorOnOrbit(orbit,0)),a*(1-e));
      close(Math.hypot(...vectorOnOrbit(orbit,Math.PI)),a*(1+e));
      assert.ok(distanceAU>=a*(1-e)-1e-12 && distanceAU<=a*(1+e)+1e-12);
      assert.deepEqual(eclipticToMap(vector),[vector[0],-vector[1]]);
    }
  }
  const mercury = bodies[1];
  const period = 360*36525/(mercury.rate[3]-mercury.rate[4]);
  const x=solarState(J2000)[1].vector,y=solarState(J2000+period)[1].vector;
  assert.ok(Math.hypot(...x.map((v,i)=>v-y[i]))<1e-5);
  assert.ok(Math.hypot(...solarState(J2000+period/2)[1].vector.map((v,i)=>v-x[i]))>.5);
  assert.ok(Math.abs(orbitAt(mercury,J2000).p[2])>.01);
  assert.equal(AU_KM,149597870.7);
  close(radiusAU(bodies[0])*AU_KM,695700);
  close(radiusAU(bodies[3])*AU_KM,6371.0084);
});

test('model time formats TDB calendar fields and rejects dates outside the fit', () => {
  assert.equal(formatModelDay(J2000),'2000-01-01T12:00');
  assert.equal(parseModelDate('1800-01-01'),MIN_DAY);
  assert.equal(parseModelDate('2050-01-01'),MAX_DAY);
  for (const date of ['1799-12-31','2050-01-02','1900-02-29','2025-02-31','']) assert.equal(parseModelDate(date),null);
  assert.equal(parseModelDate('2000-02-29'),J2000+58.5);
  assert.equal(advanceModelDay(J2000,.25,10),J2000+2.5);
  assert.equal(advanceModelDay(MAX_DAY-.1,1,100),MAX_DAY);
  assert.equal(advanceModelDay(MIN_DAY+.1,1,-1),MIN_DAY);
  for (const day of [MIN_DAY-1,MAX_DAY+1,NaN,Infinity]) assert.throws(()=>solarState(day),RangeError);
});

test('shared camera retains an AU anchor through range changes without deforming coordinates', () => {
  const frame=[-32,-32,32,32], camera={x:-.1,y:.9,zoom:1};
  const pointer=[217,104], w=320.5,h=353;
  const world=worldPoint(pointer,camera,w,h,frame);
  const zoomed=zoomAt(camera,3,pointer,w,h,frame);
  screenPoint(world,zoomed,w,h,frame).forEach((v,i)=>close(v,pointer[i]));
  screenPoint(world,panBy(zoomed,-20,13,w,h,frame),w,h,frame).forEach((v,i)=>close(v,pointer[i]+[-20,13][i]));
  assert.equal(panBy(camera,1e8,0,w,h,frame).x,-32);
});

test('labels prefer selection and stay clear of markers, each other and edges', () => {
  const markers = [
    {x:60,y:45,label:'Galaxy',radius:5,priority:1},
    {x:98,y:49,label:'Proxima',radius:8,priority:10,selected:true},
    {x:131,y:45,label:'',radius:5,priority:0},
    {x:92,y:71,label:'Gaia',radius:5,priority:2},
  ];
  const placed = placeLabels(markers,x=>8*x.length,200,120,{limit:2});
  assert.equal(placed.length,2);
  assert.equal(placed[0].marker.label,'Proxima');
  for (const a of placed) {
    assert.ok(a.left>=6 && a.right<=194 && a.top>=8 && a.bottom<=112);
    for (const b of markers) assert.ok(a.right<=b.x-b.radius || a.left>=b.x+b.radius || a.bottom<=b.y-b.radius || a.top>=b.y+b.radius);
  }
  const [a,b]=placed;
  assert.ok(a.right<=b.left || a.left>=b.right || a.bottom<=b.top || a.top>=b.bottom);
});

test('host lookup is pinned to the proven identity and sample while Gaia names require classification', () => {
  const {objects} = json(`../dist/explorer/data/${RELEASE}/objects.json`);
  const planets = objects.filter(o=>o.kind==='exoplanet');
  assert.equal(planets.length,3);
  const expected = new Map([['51 Peg',1],['HR 8799',4],['TRAPPIST-1',7]]);
  for (const p of planets) {
    const system = systemFor(p,RELEASE);
    assert.equal(system.planets.length,expected.get(system.host));
    assert.equal(system.planets[0],p.identity.id);
    assert.equal(systemFor(p,'other'),null);
    const spoof = structuredClone(p);spoof.identity.evidence.reference='different-blob';
    assert.equal(systemFor(spoof,RELEASE),null);
    assert.equal(p.direction,null);
  }
  const proxima=objects.find(o=>o.identity.id==='5853498713190525696');
  assert.equal(preferredStarName(proxima,'de'),'Proxima Centauri');
  assert.equal(preferredStarName({...proxima,kind:'source'},'de'),null);
});
