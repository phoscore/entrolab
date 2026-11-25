import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync, gunzipSync} from 'node:zlib';
import {AU_KM} from '../dist/explorer/solar-model.mjs';
import {solarVelocities} from '../dist/explorer/solar-motion.mjs';
import {decodeSystem, encodeSystem, sampleCount} from '../dist/explorer/new-worlds-ephemeris.mjs';
import {END, FRAME, RELEASE, SECONDS_PER_DAY, START, LEGACY_SYSTEMS, seriesFor} from '../dist/explorer/new-worlds-spec.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const raw = join(root, 'cosmic-explorer/data/raw', RELEASE);
const output = join(root, 'dist/explorer/data', RELEASE);
const endpoint = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const chunk = 10000;
const samplesPerCheck = 32;
const systems = Object.keys(LEGACY_SYSTEMS);
const series = systems.flatMap(system => seriesFor(system).map(s => ({...s, system})));
const anchors = [{id: 'earth', target: 3, centre: 10, hours: 6}, {id: 'jupiter', target: 5, centre: 10, hours: 12}];
const pairs = [
  {id: 'moon', parent: 'earth', target: 301, centre: 399, hours: 6, system: 'earth'},
  {id: 'io', parent: 'jupiter', target: 501, centre: 599, hours: 1, system: 'jupiter'},
  {id: 'charon', parent: 'pluto', target: 901, centre: 999, hours: 12, system: 'pluto'},
];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const fail = (condition, message) => { if (!condition) throw new Error(message); };
const difference = (a, b) => a.map((v, i) => v - b[i]);

function referenceDays(hours) {
  const count = sampleCount(hours) - 1;
  return Array.from({length: samplesPerCheck}, (_, i) => {
    const fraction = [.21, .5, .79, .63][i % 4];
    return START + (Math.floor((i + .5) * count / samplesPerCheck) + fraction) * hours / 24;
  });
}

function requests() {
  const rows = [];
  for (const s of series) {
    const count = sampleCount(s.hours);
    for (let index = 0; index < count; index += chunk) {
      const length = Math.min(chunk, count - index);
      const start = START + index * s.hours / 24;
      const stop = START + (index + length - 1) * s.hours / 24;
      rows.push({file: `grid-${s.id}-${index}.txt.gz`, s, length, start, stop});
    }
    rows.push({file: `reference-${s.id}.txt.gz`, s, days: referenceDays(s.hours)});
  }
  for (const [kind, group] of [['anchor', anchors], ['pair', pairs]]) {
    for (const s of group) rows.push({file: `${kind}-${s.id}.txt.gz`, s, days: referenceDays(s.hours)});
  }
  return rows.map(request => {
    const {s, days, start, stop} = request;
    const options = {
      COMMAND: s.target, CENTER: `500@${s.centre}`, MAKE_EPHEM: 'YES', OBJ_DATA: 'NO',
      EPHEM_TYPE: 'VECTORS', TIME_TYPE: 'TDB', REF_SYSTEM: 'ICRF', REF_PLANE: 'ECLIPTIC',
      VEC_CORR: 'NONE', OUT_UNITS: 'KM-S', VEC_TABLE: '2', CSV_FORMAT: 'YES', CAL_FORMAT: 'BOTH',
    };
    const time = days ? {TLIST_TYPE: 'JD', TLIST: days.map(day => `'${day.toFixed(10)}'`).join(' ')} :
      {START_TIME: `JD${start.toFixed(10)}`, STOP_TIME: `JD${stop.toFixed(10)}`, STEP_SIZE: `${s.hours} h`};
    const params = new URLSearchParams({format: 'text'});
    for (const [key, value] of Object.entries({...options, ...time})) params.set(key, key === 'TLIST' ? value : `'${value}'`);
    return {...request, url: `${endpoint}?${params}`};
  });
}

function parse(bytes, request) {
  const text = bytes.toString('utf8');
  const start = text.indexOf('$$SOE\n') >= 0 ? text.indexOf('$$SOE\n') : text.indexOf('$$SOE\r\n');
  const end = text.indexOf('$$EOE', start + 5);
  fail(start !== -1 && end > start, `${request.file}: missing vector table: ${text.slice(0, 1250)}`);
  const header = text.slice(0, start);
  const target = header.match(/Target body name:.*?\((\d+)\).*?\{source:\s*([^}]+)\}/i);
  const centre = header.match(/Center body name:.*?\((\d+)\).*?\{source:\s*([^}]+)\}/i);
  fail(Number(target?.[1]) === request.s.target && Number(centre?.[1]) === request.s.centre, `${request.file}: target or centre mismatch`);
  fail(/Output units\s*:\s*KM-S/i.test(header) && /GEOMETRIC/i.test(header) && /Ecliptic of J2000\.0/i.test(header) && /JDTDB/i.test(header), `${request.file}: frame or time mismatch`);
  const lines = text.slice(start + 5, end).trim().split(/\r?\n/);
  fail(lines.length === (request.days?.length ?? request.length), `${request.file}: ${lines.length} unexpected vector rows`);
  const states = lines.map((line, i) => {
    const fields = line.split(',').map(v => v.trim());
    const day = Number(fields[0]);
    const expected = request.days?.[i] ?? request.start + i * request.s.hours / 24;
    const values = fields.slice(2, 8).map(v => v ? Number(v) : NaN);
    fail(fields[1]?.startsWith('A.D.') && values.length === 6 && values.every(Number.isFinite) && Math.abs(day - expected) < 2e-9,
      `${request.file}: bad vector or epoch at row ${i + 1}`);
    return {day, values};
  });
  return {states, targetSource: target[2].trim(), centreSource: centre[2].trim()};
}

async function capture() {
  await mkdir(raw, {recursive: true});
  const entries = [];
  for (const request of requests()) {
    const path = join(raw, request.file);
    let archived = await readFile(path).catch(error => { if (error.code !== 'ENOENT') throw error; });
    if (!archived) {
      let response;
      for (const wait of [0, 3000, 12000]) {
        if (wait) await new Promise(resolve => setTimeout(resolve, wait));
        try {
          response = await fetch(request.url, {signal: AbortSignal.timeout(100000), headers: {'User-Agent': 'Entrolab offline scientific ephemeris capture (phoscore/entrolab)'}});
          if (response.ok) break;
          if (response.status !== 429 && response.status < 500) break;
          await response.body?.cancel();
        } catch (error) {
          response = undefined;
          console.warn(`${request.file}: ${error.message} ${error.cause?.message ?? ''}`);
        }
      }
      fail(response?.ok, `${request.file}: Horizons HTTP ${response?.status ?? 'unreachable'}`);
      const original = Buffer.from(await response.arrayBuffer());
      parse(original, request);
      archived = gzipSync(original, {level: 9});
      await writeFile(path, archived, {flag: 'wx'});
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    const original = gunzipSync(archived);
    const {targetSource, centreSource} = parse(original, request);
    entries.push({file: request.file, url: request.url, target: request.s.target, centre: request.s.centre,
      targetSource, centreSource, originalBytes: original.length, archivedBytes: archived.length, sha256: sha256(original), gzipSha256: sha256(archived)});
    console.log(`${request.file} ${original.length} bytes ${targetSource} / ${centreSource}`);
  }
  await writeFile(join(raw, 'manifest.json'), json({release: RELEASE, frame: FRAME, entries}));
}

function residual(states, predict) {
  let maxPositionKm = 0, maxVelocityKmS = 0;
  for (const {day, values} of states) {
    const {position, velocity} = predict(day);
    maxPositionKm = Math.max(maxPositionKm, Math.hypot(...difference(position, values.slice(0, 3))));
    maxVelocityKmS = Math.max(maxVelocityKmS, Math.hypot(...difference(velocity, values.slice(3))));
  }
  fail(Number.isFinite(maxPositionKm) && Number.isFinite(maxVelocityKmS), 'Non-finite residual');
  return {count: states.length, maxPositionKm, maxVelocityKmS};
}

async function build(check) {
  const sourceManifest = await readFile(join(raw, 'manifest.json'));
  const manifest = JSON.parse(sourceManifest);
  const wanted = requests();
  fail(manifest.release === RELEASE && manifest.frame === FRAME && wanted.length === manifest.entries.length, 'Wrong source manifest');
  const grid = new Map(series.map(s => [s.id, []]));
  const references = new Map();
  for (const [i, request] of wanted.entries()) {
    const entry = manifest.entries[i];
    fail(entry.file === request.file && entry.url === request.url && entry.target === request.s.target && entry.centre === request.s.centre, `Wrong source query: ${request.file}`);
    const archived = await readFile(join(raw, entry.file));
    const original = gunzipSync(archived);
    fail(archived.length === entry.archivedBytes && original.length === entry.originalBytes &&
      sha256(original) === entry.sha256 && sha256(archived) === entry.gzipSha256, `Bad source hash: ${entry.file}`);
    const {states, targetSource, centreSource} = parse(original, request);
    fail(targetSource === entry.targetSource && centreSource === entry.centreSource, `Kernel provenance mismatch: ${entry.file}`);
    if (request.days) references.set(entry.file, states);
    else for (const {values} of states) grid.get(request.s.id).push(...values);
  }
  const packages = new Map(systems.map(system => {
    const bytes = encodeSystem(system, grid);
    return [system, {name: `${system}.bin`, bytes: Buffer.from(bytes), decoded: decodeSystem(system, bytes)}];
  }));
  const at = (s, day) => packages.get(s.system).decoded.sample(s.id, day);
  const interpolation = Object.fromEntries(series.map(s => {
    const states = references.get(`reference-${s.id}.txt.gz`);
    const errors = residual(states, day => at(s, day));
    fail(errors.maxPositionKm <= 25 && errors.maxVelocityKmS <= .003, `Interpolation rejected for ${s.id}: ${JSON.stringify(errors)}`);
    return [s.id, errors];
  }));
  const directPairs = Object.fromEntries(pairs.map(s => {
    const errors = residual(references.get(`pair-${s.id}.txt.gz`), day => {
      const a = at(s, day), b = at({...s, id: s.parent}, day);
      return {position: difference(a.position, b.position), velocity: difference(a.velocity, b.velocity)};
    });
    fail(errors.maxPositionKm <= 30 && errors.maxVelocityKmS <= .004, `Frame composition rejected for ${s.id}: ${JSON.stringify(errors)}`);
    return [s.id, errors];
  }));
  const approximateAnchors = Object.fromEntries(anchors.map(s => [s.id,
    residual(references.get(`anchor-${s.id}.txt.gz`), day => {
      const a = solarVelocities(day).states.find(entry => entry.body.id === s.id);
      return {position: a.vector.map(v => v * AU_KM), velocity: a.velocityAUPerDay.map(v => v * AU_KM / SECONDS_PER_DAY)};
    }),
  ]));
  const summary = json({release: RELEASE, frame: FRAME, start: START, end: END,
    files: [...packages.values()].map(({name, bytes}) => ({name, bytes: bytes.length, sha256: sha256(bytes)})),
    series: series.map(({id, target, centre, hours}) => ({id, target, centre, hours, samples: sampleCount(hours)})),
    sources: {sha256: sha256(sourceManifest), replies: wanted.length,
      originalBytes: manifest.entries.reduce((n, e) => n + e.originalBytes, 0),
      archivedBytes: manifest.entries.reduce((n, e) => n + e.archivedBytes, 0)},
    interpolation, directPairs, approximateAnchors});
  if (!check) await mkdir(output, {recursive: true});
  for (const {name, bytes} of [...packages.values(), {name: 'manifest.json', bytes: summary}]) {
    if (check) fail((await readFile(join(output, name))).equals(bytes), `Offline output mismatch: ${name}`);
    else await writeFile(join(output, name), bytes);
  }
  console.log(summary.toString());
}

const mode = process.argv[2];
if (mode === '--capture') await capture();
else if (mode === '--build' || mode === '--check') await build(mode === '--check');
else throw new Error('Use --capture (network), --build (offline), or --check (offline)');
