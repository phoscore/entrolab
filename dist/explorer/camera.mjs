import {skyCoordinates} from './foundation/tiles.mjs';

export const MAX_ZOOM = 5;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export const project = (ra, dec) => {
  const [u, v] = skyCoordinates(ra, dec);
  return [u * 360, (1 - v) * 180];
};
export const unproject = (x, y) => [x, Math.asin(clamp(1 - y / 90, -1, 1)) * 180 / Math.PI];
export const homeCamera = () => ({x: 180, y: 90, zoom: 0});
export function cameraScale(camera, width, height) {
  return Math.max(.01, Math.min((width - 48) / 360, (height - 56) / 180)) * 10 ** camera.zoom;
}
export function screenPoint(point, camera, width, height) {
  const scale = cameraScale(camera, width, height);
  return [(point[0] - camera.x) * scale + width / 2, (point[1] - camera.y) * scale + height / 2];
}
export function worldPoint(point, camera, width, height) {
  const scale = cameraScale(camera, width, height);
  return [(point[0] - width / 2) / scale + camera.x, (point[1] - height / 2) / scale + camera.y];
}
function bounded(camera) {
  return {...camera, x: clamp(camera.x, 0, 360), y: clamp(camera.y, 0, 180)};
}
export function zoomAt(camera, zoom, anchor, width, height) {
  const next = {...camera, zoom: clamp(zoom, 0, MAX_ZOOM)};
  const before = worldPoint(anchor, camera, width, height);
  const after = worldPoint(anchor, next, width, height);
  return bounded({...next, x: camera.x + before[0] - after[0], y: camera.y + before[1] - after[1]});
}
export function panBy(camera, dx, dy, width, height) {
  const scale = cameraScale(camera, width, height);
  return bounded({...camera, x: camera.x - dx / scale, y: camera.y - dy / scale});
}
export function skyViewport(camera, width, height) {
  const [left, top] = worldPoint([0, 0], camera, width, height);
  const [right, bottom] = worldPoint([width, height], camera, width, height);
  return [clamp(left / 360, 0, 1), clamp(1 - bottom / 180, 0, 1), clamp(right / 360, 0, 1), clamp(1 - top / 180, 0, 1)];
}
export function centerObject(camera, object) {
  if (!object.direction) return camera;
  const [x, y] = project(object.direction.ra.value, object.direction.dec.value);
  return {...camera, x, y, zoom: Math.max(camera.zoom, .7)};
}
export function niceStep(value) {
  const power = 10 ** Math.floor(Math.log10(value));
  return [1, 2, 5, 10].find(n => n * power >= value) * power;
}

// Group only overlapping real sources in screen cells; selection always remains individual.
export function visibleGroups(objects, camera, width, height, selected = null, cell = 38) {
  const bins = new Map();
  for (const object of objects) {
    if (!object.direction) continue;
    const [x, y] = screenPoint(project(object.direction.ra.value, object.direction.dec.value), camera, width, height);
    if (x < 0 || x > width || y < 0 || y > height) continue;
    const key = object.id === selected ? object.id : `${object.identity.catalog}:${Math.floor(x / cell)}:${Math.floor(y / cell)}`;
    if (!bins.has(key)) bins.set(key, {x: 0, y: 0, objects: []});
    const group = bins.get(key);
    group.x += x;
    group.y += y;
    group.objects.push(object);
  }
  return [...bins.values()].map(group => ({...group, x: group.x / group.objects.length, y: group.y / group.objects.length}));
}
export function hitGroup(groups, x, y) {
  return groups.map(group => ({group, distance: Math.hypot(group.x - x, group.y - y)}))
    .filter(hit => hit.distance <= (hit.group.objects.length > 1 ? 22 : 16))
    .sort((a, b) => a.distance - b.distance)[0]?.group ?? null;
}
