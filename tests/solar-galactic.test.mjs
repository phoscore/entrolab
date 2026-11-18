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
  const before=flightTrails(epoch-.111,365);
  const reused=flightTrails(epoch,duration,before);
  assert.deepEqual(reused,at100);
  assert.ok(reused[1].samples.slice(1,-1).every(sample=>
    sample.vector===before[1].samples.find(previous=>previous.day===sample.day).vector));
  assert.deepEqual(at100[1].samples.slice(1,-1).filter(p=>p.day>epoch-duration+1).map(p=>p.vector),
    flightTrails(epoch+1,duration)[1].samples.slice(1,-1).filter(p=>p.day<epoch).map(p=>p.vector));
  const sun=sunDisplacement(epoch), point=galacticPosition(epoch,solarState(epoch)[3].vector);
  near(delta(schematicPosition(point,sun),sun),delta(point,sun).map(v=>v*3),1e-14);
  assert.deepEqual(schematicPosition(sun,sun),sun);
  assert.deepEqual(galacticPosition(epoch,solarState(epoch)[3].vector),point);
});

test('flight camera presets align to motion and the view fits all supplied points', async () => {
  const {FLIGHT_POSES,fitFlight} = await import('../dist/explorer/solar-flight-view.mjs');
  const {spaceProjector} = await import('../dist/explorer/solar-space.mjs');
  const direction = ({yaw,pitch}) => [Math.cos(pitch)*Math.cos(yaw),Math.cos(pitch)*Math.sin(yaw),Math.sin(pitch)];
  assert.ok(Math.abs(dot(direction(FLIGHT_POSES.across),SUN_KM_S))<1e-12);
  near(direction(FLIGHT_POSES.along),SUN_KM_S.map(v=>-v/norm(SUN_KM_S)),5e-16);
  const points = flightTrails(J2000+100,365).flatMap(({samples})=>samples.map(({vector})=>vector));
  for (const width of [300,365,940]) {
    const height=420;
    for (const pose of Object.values(FLIGHT_POSES)) {
      const {focus,distance}=fitFlight(points,pose,width,height);
      const screen=spaceProjector({...pose,zoom:0,focus},width,height,distance);
      for (const point of points) {
        const p=screen(point);
        assert.ok(p && p.x>0 && p.x<width && p.y>0 && p.y<height);
      }
    }
  }
});

test('flight segment crossing the near plane is clipped in 3D before projection', async () => {
  const {spaceProjector} = await import('../dist/explorer/solar-space.mjs');
  const screen=spaceProjector({yaw:0,pitch:0,zoom:0,focus:[0,0,0]},800,600,20);
  assert.equal(screen([21,3,1]),null);
  assert.equal(screen.segment([21,3,1],[23,3,1]),null);
  const a=[17,1,0],b=[21,3,1], edge=screen.segment(a,b)[1];
  assert.deepEqual(screen.segment(a,b)[0],screen(a));
  assert.deepEqual(screen.segment(b,a).reverse(),screen.segment(a,b));
  assert.equal(edge.depth,.5);
  assert.equal(edge.x,400+2.25*540/.5);
  assert.equal(edge.y,300-.625*540/.5);
});

function screenDistance(p,[a,b]) {
  const dx=b.x-a.x,dy=b.y-a.y;
  const lengthSquared=dx**2+dy**2;
  const fraction=lengthSquared?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/lengthSquared)):0;
  return Math.hypot(p.x-a.x-dx*fraction,p.y-a.y-dy*fraction);
}

function captureFlightStrokes() {
  const strokes=[];
  return {
    strokes,color:null,path:null,
    save(){},restore(){},beginPath(){this.path=[];},
    moveTo(x,y){this.path.push({x,y});},
    lineTo(x,y){this.path.push({x,y});},
    stroke(){strokes.push({points:this.path,color:this.strokeStyle});},
  };
}

test('D-01 Mercury at 100× follows independent model checkpoints in both display scales', async () => {
  const {FLIGHT_POSES,flightDisplayPoint,paintFlights}=await import('../dist/explorer/solar-flight-view.mjs');
  const {spaceProjector}=await import('../dist/explorer/solar-space.mjs');
  const width=1058,height=650,track=flightTrails(J2000,180)[1];
  const [start,end]=track.samples.slice(-2);
  assert.equal(start.day,2451544.054643281);
  assert.equal(end.day,J2000);
  const auditDay=2451544.6880322825;

  for(const schematic of [false,true]){
    // Independent of the renderer's refinement evaluator and its choice of epochs.
    const reference=day=>{
      const r=galacticPosition(day,solarState(day)[1].vector),sun=sunDisplacement(day);
      return schematic ? r.map((v,i)=>3*v-2*sun[i]) : r;
    };
    const screen=spaceProjector({...FLIGHT_POSES.along,focus:reference(J2000),zoom:2},width,height,schematic?18:6);
    const samples=track.samples.map(p=>({...p,vector:flightDisplayPoint(p.vector,p.day,schematic)}));
    const before=screen.segment(samples.at(-2).vector,samples.at(-1).vector);
    if(!schematic)assert.ok(Math.abs(screenDistance(screen(reference(auditDay)),before)-6.07615)<.0001);

    const ctx=captureFlightStrokes();
    const stats=paintFlights(ctx,screen,[{...track,samples}],[],width,height,'mercury',()=>{},schematic);
    assert.ok(stats.refinements>0);
    assert.equal(stats.limited,0);
    const lines=ctx.strokes.map(({points})=>points);
    let worst=0, count=0;
    const epochs=Array.from({length:799},(_,i)=>start.day+(end.day-start.day)*(i+.4)/799);
    for(const epoch of [auditDay,...epochs]){
      const p=screen(reference(epoch));
      if(!p||p.x<0||p.x>width||p.y<0||p.y>height)continue;
      worst=Math.max(worst,Math.min(...lines.map(line=>screenDistance(p,line))));
      count++;
    }
    assert.ok(count>200);
    assert.ok(worst<=1,`display scale ${schematic}: ${worst} CSS px`);
    console.log('D-01 Mercury '+JSON.stringify({schematic,checks:count,worstCSS:worst,...stats}));
  }
});

test('D-01 rejects offscreen work and bounds both refinement depth and total model evaluations', async () => {
  const {FLIGHT_POSES,fitFlight,paintFlights,MAX_FLIGHT_REFINEMENTS,MAX_FLIGHT_REFINEMENT_DEPTH}=await import('../dist/explorer/solar-flight-view.mjs');
  const {spaceProjector}=await import('../dist/explorer/solar-space.mjs');
  const width=1058,height=650,tracks=flightTrails(J2000,365),pose=FLIGHT_POSES.angle;
  const {focus,distance}=fitFlight(tracks.flatMap(t=>t.samples.map(p=>p.vector)),pose,width,height);
  const overview=spaceProjector({...pose,focus,zoom:0},width,height,distance);
  const ctx=captureFlightStrokes();
  const normal=paintFlights(ctx,overview,tracks,[],width,height,'sun',()=>{});
  assert.equal(normal.refinements,0);
  assert.ok(normal.segments>700);

  const offscreen=spaceProjector({...FLIGHT_POSES.along,focus:[10000,0,0],zoom:0},width,height,distance);
  assert.deepEqual(paintFlights(ctx,offscreen,tracks,[],width,height,'sun',()=>{}),
    {refinements:0,limited:0,segments:0});

  // Stress the implementation independently of the current view or real chord errors.
  let probes=0,smallest=Infinity,rootRadius=null;
  const stress=Object.assign(()=>null,{
    segment:()=>[{x:5,y:5,depth:1},{x:10,y:10,depth:1}],
    trailError:(_a,_b,radius)=>{
      probes++;
      rootRadius??=radius;
      smallest=Math.min(smallest,radius);
      return Infinity;
    },
  });
  const mercury=tracks[1], segment={...mercury,samples:mercury.samples.slice(-2)};
  const worst=paintFlights(ctx,stress,[segment],[],width,height,'mercury',()=>{});
  assert.equal(worst.refinements,MAX_FLIGHT_REFINEMENTS);
  assert.equal(worst.segments,MAX_FLIGHT_REFINEMENTS+1);
  assert.equal(probes,2*MAX_FLIGHT_REFINEMENTS+1);
  assert.ok(smallest/rootRadius>=.999*4**(-MAX_FLIGHT_REFINEMENT_DEPTH));
  assert.ok(worst.limited>0);
});
