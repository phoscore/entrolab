import {checkedBytes} from './catalog.mjs';
import {SECONDS_PER_DAY, SYSTEMS, seriesFor, ephemerisSpec} from './new-worlds-spec.mjs';

const VALUES = 6;
const BYTES_PER_STATE = VALUES * Float64Array.BYTES_PER_ELEMENT;
const PACKAGE_MAGIC = 0x45504d31; // EPM1

export function supportsEpoch(day,system) {
  const {start,end}=ephemerisSpec(system);
  return Number.isFinite(day) && day >= start && day <= end;
}
export function sampleCount(hours,system) {
  const {start,end}=ephemerisSpec(system);
  return (end-start)*24/hours+1;
}

export function encodeSystem(system, samples) {
  const series = seriesFor(system);
  const bytes = new ArrayBuffer(8 + series.reduce((total, s) => total + sampleCount(s.hours,system) * BYTES_PER_STATE, 0));
  const output = new DataView(bytes);
  output.setUint32(0, PACKAGE_MAGIC);
  output.setUint32(4, SYSTEMS[system].centre);
  let cursor = 8;
  for (const s of series) {
    const values = samples.get(s.id);
    if (values?.length !== sampleCount(s.hours,system) * VALUES) throw new Error(`Invalid length: ${s.id}`);
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
  const length = 8 + series.reduce((total, s) => total + sampleCount(s.hours,system) * BYTES_PER_STATE, 0);
  if (bytes.byteLength !== length || data.getUint32(0) !== PACKAGE_MAGIC || data.getUint32(4) !== SYSTEMS[system].centre) {
    throw new Error(`Invalid ${system} ephemeris package`);
  }
  for (let offset = 8; offset < length; offset += Float64Array.BYTES_PER_ELEMENT) {
    if (!Number.isFinite(data.getFloat64(offset, true))) throw new Error(`Non-finite state value in ${system} ephemeris package`);
  }
  let offset = 8;
  const sources = new Map(series.map(s => {
    const start = offset;
    const count = sampleCount(s.hours,system);
    offset += count * BYTES_PER_STATE;
    return [s.id, {start, count, hours: s.hours}];
  }));
  const {start: epochStart,planetCentred}=ephemerisSpec(system);
  return {sample(id, day) {
    if (!supportsEpoch(day,system)) return null;
    if (planetCentred && id===system) return {position:[0,0,0],velocity:[0,0,0]};
    const source = sources.get(id);
    if (!source) return null;
    const units = (day - epochStart) * (24 / source.hours);
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
  const {release,pack}=ephemerisSpec(system);
  if (!pack) throw new RangeError('Unknown lunar system');
  const url = new URL(`./data/${release}/${system}.bin`, import.meta.url);
  // The view caches verified systems. A retry must bypass cached HTTP errors or unverified bytes.
  return checkedBytes(url, pack, signal ?? new AbortController().signal,
    (url, options) => fetch(url, {...options, cache: 'no-store'}))
    .then(bytes => decodeSystem(system, bytes.buffer));
}
