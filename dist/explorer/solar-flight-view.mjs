import {SUN_KM_S, flightChordFactor, flightPosition, schematicPosition, sunDisplacement} from './solar-galactic.mjs';
import {spaceBasis} from './solar-space.mjs';

const magnitude = Math.hypot(...SUN_KM_S);
const drift = SUN_KM_S.map(value => value / magnitude);
const cross = [drift[1], -drift[0], 0];
const oblique = cross.map((value, i) => value + .58 * drift[i] + (i === 2 ? .62 : 0));
const facing = vector => ({
  yaw: Math.atan2(vector[1], vector[0]),
  pitch: Math.atan2(vector[2], Math.hypot(vector[0], vector[1])),
});
export const FLIGHT_POSES = Object.freeze({
  angle: Object.freeze(facing(oblique)),
  across: Object.freeze(facing(cross)),
  along: Object.freeze(facing(drift.map(value => -value))),
});

export const flightDisplayPoint = (vector, epoch, schematic) =>
  schematic ? schematicPosition(vector, sunDisplacement(epoch)) : vector;

const dot = ([x,y,z],[a,b,c]) => x*a + y*b + z*c;

export function fitFlight(points, camera, width, height) {
  const axes = spaceBasis(camera);
  const local = points.map(point=>axes.map(axis=>dot(axis,point)));
  const min = [...local[0]], max = [...local[0]];
  for (const point of local) {
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], point[i]);
      max[i] = Math.max(max[i], point[i]);
    }
  }
  const middle = min.map((v,i)=>(v+max[i])/2);
  const focus = axes[0].map((v,i)=>v*middle[0]+axes[1][i]*middle[1]+axes[2][i]*middle[2]);
  const focal = height * .9;
  const xScale = focal / (width * .40), yScale = focal / (height * .38);
  let distance = 3;
  for (const [x,y,z] of local) {
    const inFront = z - middle[2];
    const depthNeeded = Math.max(2, Math.abs(x-middle[0])*xScale, Math.abs(y-middle[1])*yScale);
    distance = Math.max(distance, inFront/.95, inFront+depthNeeded);
  }
  return {focus,distance};
}

const palette = {
  sun:'#ffcb77', mercury:'#aab6d1', venus:'#ed9cc3', earth:'#72dbec', mars:'#ff8878',
  jupiter:'#f1ab7e', saturn:'#d8cf98', uranus:'#71c9aa', neptune:'#879af6',
};

const TRAIL_PIXEL_TARGET = .65;
export const MAX_FLIGHT_REFINEMENTS = 192;
export const MAX_FLIGHT_REFINEMENT_DEPTH = 10;

export function paintFlights(ctx, screen, tracks, markers, width, height, selected, drawBody, schematic = false) {
  const layers = [...markers];
  let refinements = 0, limited = 0;
  for (const {body, samples} of tracks) {
    const chordFactor = flightChordFactor(body) * (schematic ? 3 : 1);
    function addSegment(from,to,level) {
      const radius = chordFactor * (to.day-from.day)**2;
      const error = radius ? screen.trailError(from.vector,to.vector,radius) : 0;
      if (error === null) return;
      if (error > TRAIL_PIXEL_TARGET) {
        if (level < MAX_FLIGHT_REFINEMENT_DEPTH && refinements < MAX_FLIGHT_REFINEMENTS) {
          const day = (from.day+to.day)/2;
          const vector = flightDisplayPoint(flightPosition(body,day),day,schematic);
          const middle = {day,vector,age:(from.age+to.age)/2};
          refinements++;
          addSegment(from,middle,level+1);
          addSegment(middle,to,level+1);
          return;
        }
        limited++;
      }
      const projected = screen.segment(from.vector,to.vector);
      if (!projected) return;
      const [a,b] = projected;
      if (Math.max(a.x,b.x)<0 || Math.min(a.x,b.x)>width ||
          Math.max(a.y,b.y)<0 || Math.min(a.y,b.y)>height) return;
      const live = 1 - (from.age + to.age) / 2;
      layers.push({a,b,body,depth:(a.depth+b.depth)/2,alpha:live**1.3});
    }
    for (let i=1;i<samples.length;i++) addSegment(samples[i-1],samples[i],0);
  }
  layers.sort((a,b)=>b.depth-a.depth);
  ctx.save();
  ctx.lineCap = 'round';
  for (const layer of layers) {
    if (!layer.a) {
      ctx.globalAlpha = 1;
      drawBody(layer);
      continue;
    }
    const sun = layer.body.id === 'sun', chosen = layer.body.id === selected;
    ctx.strokeStyle = palette[layer.body.id];
    ctx.globalAlpha = layer.alpha * (sun ? .92 : chosen ? .88 : .66);
    ctx.lineWidth = sun ? 2.1 : chosen ? 1.8 : 1.3;
    ctx.beginPath();
    ctx.moveTo(layer.a.x,layer.a.y); ctx.lineTo(layer.b.x,layer.b.y);
    ctx.stroke();
  }
  ctx.restore();
  return {refinements,limited,segments:layers.length-markers.length};
}
