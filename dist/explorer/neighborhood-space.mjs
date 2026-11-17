import {rotateSpace, spaceCamera, spaceProjector} from './solar-space.mjs';
import {NEIGHBORHOOD_RADIUS, PC_TO_LY} from './foundation/neighborhood-format.mjs';

export const NEIGHBORHOOD_MAX_ZOOM = 2.4;
export const neighborhoodHome = () => spaceCamera();
export const neighborhoodRotate = (camera, dx, dy) => rotateSpace(camera, dx, -dy);
export function neighborhoodZoom(camera, zoom) {
  if (!Number.isFinite(zoom)) throw new RangeError('Invalid neighborhood zoom');
  return {...camera, zoom:Math.max(0, Math.min(NEIGHBORHOOD_MAX_ZOOM, zoom))};
}
export function neighborhoodFocus(camera, position) {
  if (position.length !== 3 || !Array.from(position).every(Number.isFinite)) throw new RangeError('Invalid neighborhood focus');
  return {...camera, focus:Array.from(position), zoom:Math.max(.55, camera.zoom)};
}
export function neighborhoodProjector(camera, width, height) {
  if (![width,height,camera.yaw,camera.pitch,camera.zoom,...camera.focus].every(Number.isFinite) ||
      width<=0 || height<=0 || camera.focus.length!==3 || camera.zoom<0 || camera.zoom>NEIGHBORHOOD_MAX_ZOOM) {
    throw new RangeError('Invalid neighborhood camera');
  }
  // Fit a bounding sphere in the shorter dimension, including the perspective expansion at its silhouette.
  const distance = NEIGHBORHOOD_RADIUS * Math.hypot(1, .9*height/(.40*Math.min(width,height)));
  const project = spaceProjector(camera,width,height,distance);
  return {distance:distance/10**camera.zoom, project:position=>(
    position.length===3 && Number.isFinite(position[0]) && Number.isFinite(position[1]) &&
      Number.isFinite(position[2]) ? project(position) : null
  )};
}
export const neighborhoodDirection = ({yaw,pitch}) => ({
  longitude:((yaw*180/Math.PI+180)%360+360)%360, latitude:-pitch*180/Math.PI,
});

export function distanceDisplay(median, lo, hi, unit) {
  const factor = unit==='ly' ? PC_TO_LY : 1;
  const value = median*factor;
  const width = (hi-lo)*factor;
  const step = 10**Math.max(Math.floor(Math.log10(value))-1,Math.floor(Math.log10(width/2)));
  return {value:Math.round(value/step)*step,
    interval:width/value>=.05 ? [Math.floor(lo*factor/step)*step,Math.ceil(hi*factor/step)*step] : null};
}

export function neighborhoodGroups(project, width, height, data, selected, named) {
  const bins = new Map();
  let visible = 0;
  if (data) for (const row of data.order) {
    const p = project(data.xyz.subarray(3*row,3*row+3));
    if (!p || p.x<0 || p.x>=width || p.y<0 || p.y>=height) continue;
    visible++;
    const rank = row===selected ? 2 : named.has(row) ? 1 : 0;
    const key = Math.floor(p.x/4)+','+Math.floor(p.y/4);
    const group = bins.get(key);
    const point = {row,x:p.x,y:p.y,depth:p.depth,rank};
    if (!group) bins.set(key,{point,members:[row]});
    else {
      group.members.push(row);
      if (rank>group.point.rank || (rank===group.point.rank && p.depth<group.point.depth)) group.point=point;
    }
  }
  const budget=width<500?1050:2200;
  const marks=[...bins.values()]
    .sort((a,b)=>b.point.rank-a.point.rank || data.magnitude[a.point.row]-data.magnitude[b.point.row] || a.point.row-b.point.row)
    .slice(0,budget).map(({point,members})=>({...point,members}))
    .sort((a,b)=>b.depth-a.depth || b.row-a.row);
  return {marks,visible,overlap:visible-bins.size,limited:bins.size-marks.length};
}

export function neighborhoodHit(marks,x,y) {
  let nearest=null,distance=12**2;
  // The frontmost point wins ties. A group still exposes its individual source IDs.
  for (let i=marks.length-1;i>=0;i--) {
    const point=marks[i], delta=(point.x-x)**2+(point.y-y)**2;
    if (delta<distance) {distance=delta;nearest=point;}
  }
  return nearest;
}
