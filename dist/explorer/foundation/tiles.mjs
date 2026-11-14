import {requireData} from './schema.mjs';

export const TILE_VERSION = 1;
export const TILE_LIMIT = 4096;
const HEADER = 16, STRIDE = 16, MAX_DEPTH = 22;

// Equal-area cylindrical subdivision of the celestial sphere. Each child owns a half-open cell.
export function skyCoordinates(ra, dec) {
  requireData(Number.isFinite(ra) && ra >= 0 && ra < 360 && Number.isFinite(dec) && Math.abs(dec) <= 90, 'Invalid sky coordinates');
  return [ra / 360, Math.min((Math.sin(dec * Math.PI / 180) + 1) / 2, 1 - Number.EPSILON)];
}

export function buildTiles(u, v, visitLeaf, limit = TILE_LIMIT) {
  requireData(u.length === v.length && u.length <= 0xffffffff && Number.isInteger(limit) && limit > 0 && limit <= TILE_LIMIT, 'Invalid tile input');
  const indices = Uint32Array.from({length: u.length}, (_, i) => {
    requireData(u[i] >= 0 && u[i] < 1 && v[i] >= 0 && v[i] < 1, 'Coordinate outside unit sky');
    return i;
  });
  const scratch = new Uint32Array(indices.length);
  function split(start, end, x, y, size, id, depth) {
    const count = end - start;
    const node = {id, bounds: [x, y, size], count};
    if (count <= limit || depth === MAX_DEPTH) {
      node.pages = Math.ceil(count / limit);
      for (let offset = start, page = 0; offset < end; offset += limit, page++) {
        visitLeaf(node, page, indices.subarray(offset, Math.min(end, offset + limit)));
      }
      return node;
    }
    const half = size / 2, mx = x + half, my = y + half;
    const quadrant = i => (u[i] >= mx ? 1 : 0) + (v[i] >= my ? 2 : 0);
    const counts = [0, 0, 0, 0];
    for (let i = start; i < end; i++) counts[quadrant(indices[i])]++;
    const offsets = counts.map((_, n) => counts.slice(0, n).reduce((sum, c) => sum + c, start));
    const cursor = [...offsets];
    for (let i = start; i < end; i++) {
      const j = indices[i];
      scratch[cursor[quadrant(j)]++] = j;
    }
    indices.set(scratch.subarray(start, end), start);
    node.children = [];
    for (let q = 0; q < 4; q++) if (counts[q]) node.children.push(split(offsets[q], cursor[q], x + (q & 1) * half, y + (q >> 1) * half, half, id + q, depth + 1));
    return node;
  }
  return split(0, u.length, 0, 0, 1, 'r', 0);
}

export function encodeTile(node, indices, u, v, {flags = () => 0, rowId = i => i} = {}) {
  requireData(indices.length <= TILE_LIMIT, 'Tile point limit exceeded');
  const [x, y, size] = node.bounds;
  const bytes = new Uint8Array(HEADER + STRIDE * indices.length);
  bytes.set([67, 88, 84, 49]); // CXT1
  const view = new DataView(bytes.buffer);
  view.setUint16(4, TILE_VERSION, true);
  view.setUint16(6, STRIDE, true);
  view.setUint32(8, indices.length, true);
  for (const [row, i] of indices.entries()) {
    const offset = HEADER + row * STRIDE;
    view.setFloat32(offset, (u[i] - x) / size, true);
    view.setFloat32(offset + 4, (v[i] - y) / size, true);
    view.setUint32(offset + 8, rowId(i), true);
    view.setUint32(offset + 12, flags(i), true);
  }
  return bytes;
}

export function decodeTile(bytes, expectedCount) {
  requireData(bytes instanceof Uint8Array && bytes.length >= HEADER && bytes.length <= HEADER + STRIDE * TILE_LIMIT &&
    [67, 88, 84, 49].every((byte, i) => bytes[i] === byte), 'Invalid tile header/length');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = view.getUint32(8, true);
  requireData(view.getUint16(4, true) === TILE_VERSION && view.getUint16(6, true) === STRIDE && view.getUint32(12, true) === 0 &&
    count === expectedCount && bytes.length === HEADER + count * STRIDE, 'Incompatible tile version/count');
  const xy = new Float32Array(count * 2), rows = new Uint32Array(count), flags = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    const offset = HEADER + i * STRIDE;
    const x = view.getFloat32(offset, true), y = view.getFloat32(offset + 4, true);
    requireData(x >= 0 && x <= 1 && y >= 0 && y <= 1, 'Point outside tile');
    xy[2 * i] = x;
    xy[2 * i + 1] = y;
    rows[i] = view.getUint32(offset + 8, true);
    flags[i] = view.getUint32(offset + 12, true);
  }
  return {xy, rows, flags, byteLength: count * STRIDE};
}

export function selectSkyLod(root, viewport, {maxDepth, maxPoints, maxTiles}) {
  requireData([maxDepth, maxPoints, maxTiles].every(n => Number.isSafeInteger(n) && n >= 0) && maxDepth <= MAX_DEPTH &&
    viewport.length === 4 && viewport.every(x => Number.isFinite(x) && x >= 0 && x <= 1) && viewport[1] <= viewport[3], 'Invalid LOD budget or viewport');
  const [left, bottom, right, top] = viewport;
  const overlaps = ([x, y, size]) => y < top && y + size > bottom &&
    (left <= right ? x < right && x + size > left : x + size > left || x < right);
  const aggregates = [], tiles = [];
  let points = 0;
  function visit(node, depth) {
    if (!node.count || !overlaps(node.bounds)) return;
    if (node.children && depth < maxDepth) {
      for (const child of node.children) visit(child, depth + 1);
    } else if (node.files && node.files.length + tiles.length <= maxTiles && points + node.count <= maxPoints) {
      tiles.push(...node.files);
      points += node.count;
    } else aggregates.push({id: node.id, bounds: node.bounds, catalogCount: node.count});
  }
  visit(root, 0);
  return {tiles, aggregates, displayPointBudgetUsed: points};
}

export function cameraRelative(point, origin, unitsPerLocalUnit) {
  requireData(point.length === origin.length && Number.isFinite(unitsPerLocalUnit) && unitsPerLocalUnit > 0 &&
    point.every(Number.isFinite) && origin.every(Number.isFinite), 'Invalid local origin or unit');
  // point and origin must already be expressed in the same nearby reference frame.
  return Float32Array.from(point, (value, i) => (value - origin[i]) / unitsPerLocalUnit);
}
