import {END, RELEASE, SECONDS_PER_DAY, START, SYSTEMS, seriesFor} from './new-worlds-spec.mjs';

const VALUES = 6;
const BYTES_PER_STATE = VALUES * Float64Array.BYTES_PER_ELEMENT;
const PACKAGE_MAGIC = 0x45504d31; // EPM1

export const supportsEpoch = day => Number.isFinite(day) && day >= START && day <= END;
export const sampleCount = hours => (END - START) * 24 / hours + 1;

export function encodeSystem(system, samples) {
  const series = seriesFor(system);
  const bytes = new ArrayBuffer(8 + series.reduce((total, s) => total + sampleCount(s.hours) * BYTES_PER_STATE, 0));
  const output = new DataView(bytes);
  output.setUint32(0, PACKAGE_MAGIC);
  output.setUint32(4, SYSTEMS[system].centre);
  let cursor = 8;
  for (const s of series) {
    const values = samples.get(s.id);
    if (values?.length !== sampleCount(s.hours) * VALUES) throw new Error(`Invalid length: ${s.id}`);
    for (const v of values) {
      if (!Number.isFinite(v)) throw new Error(`Invalid coordinate: ${s.id}`);
      output.setFloat64(cursor, v, true);
      cursor += 8;
    }
  }
  return bytes;
}

export function decodeSystem(system, bytes) {
  const series = seriesFor(system);
  const data = new DataView(bytes);
  const length = 8 + series.reduce((total, s) => total + sampleCount(s.hours) * BYTES_PER_STATE, 0);
  if (bytes.byteLength !== length || data.getUint32(0) !== PACKAGE_MAGIC || data.getUint32(4) !== SYSTEMS[system].centre) {
    throw new Error(`Invalid ${system} ephemeris package`);
  }
  let offset = 8;
  const sources = new Map(series.map(s => {
    const start = offset;
    const count = sampleCount(s.hours);
    offset += count * BYTES_PER_STATE;
    return [s.id, {start, count, hours: s.hours}];
  }));
  return {sample(id, day) {
    const source = sources.get(id);
    if (!source || !supportsEpoch(day)) return null;
    const units = (day - START) * (24 / source.hours);
    const index = Math.min(Math.floor(units), source.count - 2);
    const row = source.start + index * BYTES_PER_STATE;
    const next = row + BYTES_PER_STATE;
    const dt = source.hours * SECONDS_PER_DAY / 24;
    const t = units - index;
    const t2 = t * t, t3 = t2 * t;
    const position = [], velocity = [];
    for (let i = 0; i < 3; i++) {
      const x = i * 8;
      const p0 = data.getFloat64(row + x, true), p1 = data.getFloat64(next + x, true);
      const v0 = data.getFloat64(row + 24 + x, true), v1 = data.getFloat64(next + 24 + x, true);
      const delta = p1 - p0;
      position[i] = t === 1 ? p1 : p0 + (3*t2 - 2*t3)*delta + (t3 - 2*t2 + t)*dt*v0 + (t3 - t2)*dt*v1;
      velocity[i] = (6*t - 6*t2)*delta/dt + (3*t2 - 4*t + 1)*v0 + (3*t2 - 2*t)*v1;
    }
    return {position, velocity};
  }};
}

export function loadEphemeris(system, signal) {
  if (!Object.hasOwn(SYSTEMS, system)) throw new RangeError('Unknown lunar system');
  return fetch(new URL(`./data/${RELEASE}/${system}.bin`, import.meta.url), {signal}).then(response => {
    if (!response.ok) throw new Error(`Ephemeris request failed (${response.status})`);
    return response.arrayBuffer();
  }).then(bytes => decodeSystem(system, bytes));
}
