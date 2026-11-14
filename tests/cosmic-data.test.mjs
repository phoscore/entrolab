import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ByteLru, searchKey, searchPrefix, searchShard, TileLoader} from '../cosmic-explorer/access.mjs';
import {importDesi, importGaia, importNasa, importOec, readCsv} from '../cosmic-explorer/import.mjs';
import {buildSample, sampleDir, sha256, writeSample} from '../cosmic-explorer/pipeline.mjs';
import {orbitCapability, provenance, quantity, validateObjects, validateQuantity} from '../cosmic-explorer/schema.mjs';
import {buildTiles, cameraRelative, decodeTile, encodeTile, selectSkyLod, skyCoordinates} from '../cosmic-explorer/tiles.mjs';

const sample = await buildSample();
const {manifest, objects, files} = sample;
const near = id => objects.find(o => o.identity.id === id);

test('Cosmic: real sample reproduces all versioned counts, content digests and bytes', async () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(JSON.parse(files.get('objects.json')).schemaVersion, 1);
  assert.deepEqual(manifest.counts, {objects: 22, byKind: {galaxy: 6, source: 10, star: 3, exoplanet: 3},
    skyDirections: 19, noDirection: 3, noDistance: 12, negativeParallax: 4, missingParallax: 3});
  assert.deepEqual(files.get('manifest.json'), await readFile(join(sampleDir, 'manifest.json')));
  for (const [path, {bytes, sha256: digest}] of Object.entries(manifest.packages)) {
    assert.equal(files.get(path).length, bytes);
    assert.equal(sha256(files.get(path)), digest);
  }
});

test('Cosmic: Gaia IDs, J2016.0 and genuine weak/missing parallaxes survive import', () => {
  const proxima = near('5853498713190525696');
  assert.equal(proxima.kind, 'star');
  assert.equal(proxima.direction.epoch.value, 2016);
  assert.equal(proxima.direction.ra.value, 217.39232147200883);
  assert.equal(proxima.parallax.value, 768.0665);
  assert.deepEqual(proxima.distances.map(d => [d.method, d.measurement.value, d.measurement.uncertainty.p16]),
    [['geometric', 1.3019114, 1.3018136], ['photogeometric', 1.3019346, 1.3018495]]);
  const weak = near('1511828647680');
  assert.equal(weak.parallax.value, -0.0979929);
  assert.deepEqual(weak.distances.map(d => d.measurement.value), [2822.1357, 8557.534]);
  const angular = near('2512556873600');
  assert.equal(angular.parallax.status, 'unknown');
  assert.deepEqual(angular.distances, []);
  assert.equal(angular.direction.dec.value, 0.1108820420939314);
});

test('Cosmic: DESI spectroscopic redshift and OEC orbit evidence retain independent meanings', () => {
  const galaxy = near('39628379988689587');
  assert.equal(galaxy.redshift.measurement.value, 0.2727416138134127);
  assert.equal(galaxy.redshift.measurement.uncertainty.sigma, 1.56698173519868e-05);
  assert.equal(galaxy.direction.role, 'fiber-mean');
  assert.deepEqual(galaxy.distances, []);
  const planet = near('TRAPPIST-1 b');
  assert.equal(planet.direction, null);
  assert.equal(planet.orbits[0].elements.period.value, 1.5108739);
  assert.equal(planet.orbits[0].phase.kind, 'transit');
  assert.equal(planet.orbits[0].capability, 'schematic-phase');
  assert.equal(near('51 Peg b').orbits[0].phase.timeSystem, 'BJD');
  assert.equal(near('HR 8799 b').orbits[0].elements.semimajorAxis.value, 67.96);
});

test('Cosmic: CSV handles quoted commas, quotes, UTF-8 BOM and missing cells', () => {
  assert.deepEqual(readCsv('\uFEFFid,comment,other\r\n9223372036854775807,"abc, ""def""",\r\n'),
    [{id: '9223372036854775807', comment: 'abc, "def"', other: ''}]);
  for (const csv of ['a,a\n1,2', 'a,b\n1', 'a,b\n1,"2', 'a,b\n1,"2"x']) assert.throws(() => readCsv(csv), /CSV/);
});

test('Cosmic: rejects invalid Gaia IDs, partial or crossed quantiles and DESI quality conflicts', async () => {
  const [gaia, desi] = await Promise.all(['gaia.csv', 'desi.csv'].map(path => readFile(join(sampleDir, path), 'utf8').then(readCsv)));
  assert.throws(() => importGaia([{...gaia[0], source_id: '9223372036854775808'}]), /64-bit/);
  assert.throws(() => importGaia([{...gaia[0], r_hi_geo: ''}]), /Incomplete/);
  assert.throws(() => validateObjects(importGaia([{...gaia[0], r_hi_geo: '1'}]), manifest.sources), /quantiles/);
  assert.throws(() => importGaia([{...gaia[0], parallax: ''}]), /disagree/);
  assert.throws(() => importDesi([{...desi[0], zwarn: '4'}]), /sample filter/);
  assert.throws(() => validateObjects([...objects, objects[0]], manifest.sources), /duplicate object/);
});

test('Cosmic: distinct distance definitions and explicit unknown values are enforced', () => {
  const galaxy = structuredClone(objects[0]), source = manifest.sources;
  galaxy.distances.push({kind: 'luminosity', method: 'test', origin: 'observer', measurement: galaxy.redshift.measurement});
  assert.throws(() => validateObjects([galaxy], source), /Mpc/);
  const p = galaxy.redshift.measurement.evidence;
  galaxy.distances[0].measurement = quantity(1100, 'Mpc', p, {status: 'derived', model: 'test-only'});
  validateObjects([galaxy], source);
  galaxy.redshift.measurement.value = -0.0001;
  assert.throws(() => validateObjects([galaxy], source), /positive framed/);
  assert.throws(() => validateQuantity({...quantity(null, 'mas', p), value: 0}, source, 'mas'), /Unknown quantity/);
});

test('Cosmic: a timed orbit requires a coherent solution and a defined phase, not a transit epoch', () => {
  const p = provenance('test', 'row', 'field', 'paper');
  const q = (n, unit) => quantity(n, unit, p);
  const orbit = {center: 'primary', frame: 'reference-plane', solution: {...p, kind: 'single-reference'},
    phase: {kind: 'periastron', timeSystem: 'BJD-TDB', epoch: q(2451545, 'd')},
    elements: {period: q(10, 'd'), semimajorAxis: q(.1, 'AU'), eccentricity: q(.2, '1'), inclination: q(40, 'deg'),
      ascendingNode: q(15, 'deg'), argumentOfPeriapsis: q(30, 'deg')}};
  assert.equal(orbitCapability(orbit), 'model-position');
  assert.equal(orbitCapability({...orbit, phase: {...orbit.phase, kind: 'transit'}}), 'schematic-phase');
  assert.equal(orbitCapability({...orbit, phase: {...orbit.phase, timeSystem: 'BJD'}}), 'schematic-phase');
  assert.equal(orbitCapability({...orbit, solution: {...orbit.solution, kind: 'composite'}}), 'schematic-phase');
  orbit.elements.ascendingNode = {...orbit.elements.ascendingNode, evidence: {...p, reference: 'other paper'}};
  assert.equal(orbitCapability(orbit), 'schematic-phase');
  delete orbit.elements.semimajorAxis;
  assert.equal(orbitCapability(orbit), 'data-only');
});

function nasaRows() {
  const ps = {pl_name: 'Test b', hostname: 'Test', pl_refname: '<a href=https://example.org/first>Paper</a>', default_flag: '1',
    discoverymethod: 'Radial Velocity', pl_tsystemref: 'BJD-TDB', pl_tranmid: '2451545'};
  for (const field of ['pl_orbper', 'pl_orbsmax', 'pl_orbeccen', 'pl_orbincl', 'pl_orblper', 'pl_orbtper']) {
    for (const suffix of ['', 'err1', 'err2', 'lim']) ps[field + suffix] = '';
  }
  Object.assign(ps, {pl_orbper: '5', pl_orbpererr1: '0.2', pl_orbpererr2: '-0.1', pl_orbeccen: '0.1', pl_orbeccenlim: '1'});
  const comp = {...ps, ra: '30', dec: '-15', sy_dist: '', sy_disterr1: '', sy_disterr2: '', pl_orbsmax: '.1',
    pl_orbper_reflink: 'First', pl_orbsmax_reflink: 'Second'};
  return [ps, comp];
}

test('Cosmic: NASA rows keep signed uncertainties, limits, unknowns and conflicting publications separate', () => {
  const [ps, comp] = nasaRows();
  const secondary = {...ps, default_flag: '0', pl_refname: 'Another paper', pl_orbper: '6'};
  const result = importNasa([ps, secondary], [comp], '2026-11-13');
  const [o] = result.objects;
  assert.equal(result.distribution, 'local-only');
  assert.deepEqual(o.orbits.map(x => x.elements.period.value), [5, 6]);
  assert.deepEqual(o.orbits[0].elements.period.uncertainty, {kind: 'asymmetric', minus: .1, plus: .2});
  assert.equal(o.orbits[0].elements.eccentricity.limit, 'upper');
  assert.equal(o.orbits[0].elements.semimajorAxis.status, 'unknown');
  assert.equal(o.orbits[0].phase.kind, 'transit');
  assert.equal(o.overview.pl_orbsmax.evidence.reference, 'Second');
  assert.equal(o.orbits[0].capability, 'data-only');
  assert.throws(() => importNasa([ps], [{...comp, hostname: 'Other'}], '2026-11-13'), /Conflicting NASA host/);
  assert.throws(() => importNasa([ps, {...secondary, default_flag: '1'}], [comp], '2026-11-13'), /Multiple NASA default/);
  const imaging = importNasa([{...ps, discoverymethod: 'Imaging', pl_orbsmax: '5'}], [{...comp, discoverymethod: 'Imaging'}], '2026-11-13').objects[0];
  assert.equal(imaging.orbits[0].elements.semimajorAxis, undefined);
  assert.equal(imaging.orbits[0].separationOrSemimajorAxis.value, 5);
  assert.equal(imaging.orbits[0].capability, 'data-only');
});

test('Cosmic: NASA PS preserves the partial Winn et al. 2007 period from the audited OGLE-TR-111 b export', () => {
  const [ps] = nasaRows();
  // Project only the audited PS cells. Other columns are test scaffolding.
  const [periodCells] = readCsv('pl_orbper,pl_orbpererr1,pl_orbpererr2,pl_orbperlim\n4.01444790000,0.00000410000,,0\n');
  const row = {...ps, pl_name: 'OGLE-TR-111 b', hostname: 'OGLE-TR-111', discoverymethod: 'Transit', default_flag: '0',
    pl_refname: '<a href=https://ui.adsabs.harvard.edu/abs/2007AJ....133...11W/abstract>Winn et al. 2007</a>',
    pl_tsystemref: '', pl_tranmid: '', pl_orbeccen: '', pl_orbeccenlim: '', ...periodCells};
  const result = JSON.parse(JSON.stringify(importNasa([row], [], '2026-11-13')));
  assert.equal(result.schemaVersion, 2);
  assert.equal(result.distribution, 'local-only');
  assert.deepEqual(result.objects[0].orbits[0].elements.period, {
    status: 'catalog', value: 4.0144479, unit: 'd',
    evidence: provenance('nea-ps', 'OGLE-TR-111 b [CSV 2]', ['pl_orbper', 'pl_orbpererr1', 'pl_orbpererr2', 'pl_orbperlim'],
      'https://ui.adsabs.harvard.edu/abs/2007AJ....133...11W/abstract'),
    uncertainty: {kind: 'asymmetric', minus: null, plus: 0.0000041}, limit: null,
  });
  validateObjects(result.objects, {'nea-ps': {}}, result.schemaVersion);
});

test('Cosmic: NASA asymmetric errors distinguish missing sides, zero and physical limits', () => {
  const [ps] = nasaRows();
  const period = overrides => importNasa([{...ps, ...overrides}], [], '2026-11-13').objects[0].orbits[0].elements.period;
  for (const [err1, err2, minus, plus] of [['0.2', '', null, .2], ['', '-0.1', .1, null], ['0.2', '-0.1', .1, .2], ['', '0', 0, null]]) {
    const q = period({pl_orbpererr1: err1, pl_orbpererr2: err2});
    assert.deepEqual(q.uncertainty, {kind: 'asymmetric', minus, plus});
    assert.equal(q.limit, null);
  }
  assert.equal(period({pl_orbpererr1: '', pl_orbpererr2: ''}).uncertainty, null);
  for (const [flag, limit] of [['1', 'upper'], ['-1', 'lower']]) {
    const q = period({pl_orbperlim: flag, pl_orbpererr2: ''});
    assert.equal(q.limit, limit);
    assert.equal(q.uncertainty, null);
  }
  for (const value of ['-0.2', 'NaN', 'Infinity']) {
    assert.throws(() => period({pl_orbpererr1: value, pl_orbpererr2: ''}), /pl_orbpererr1/);
  }
  for (const value of ['0.1', 'garbage']) {
    assert.throws(() => period({pl_orbpererr1: '', pl_orbpererr2: value}), /pl_orbpererr2/);
  }

  const sources = {'nea-ps': {}};
  const partial = period({pl_orbpererr2: ''});
  assert.throws(() => validateQuantity(partial, sources, 'd', x => x > 0, 1), /Invalid asymmetric/);
  assert.throws(() => validateQuantity({...partial, limit: 'upper'}, sources, 'd'), /must be separate/);
  for (const sides of [{plus: 1}, {minus: null, plus: null}, {minus: 0, plus: 0},
    {minus: -1, plus: null}, {minus: null, plus: Infinity}, {minus: '0', plus: .2}]) {
    const q = {...partial, uncertainty: {kind: 'asymmetric', ...sides}};
    assert.throws(() => validateQuantity(q, sources, 'd'), /Invalid asymmetric/);
  }
});

test('Cosmic: partial errors retain their NASA host-distance and OEC field provenance', () => {
  const [, comp] = nasaRows();
  const hostDistance = overrides => importNasa([], [{...comp, sy_dist: '12.5', sy_dist_reflink: 'Host paper', ...overrides}],
    '2026-11-13').objects[0].distances[0].measurement;
  assert.deepEqual(hostDistance({sy_disterr1: '', sy_disterr2: '-0.3'}), {
    status: 'catalog', value: 12.5, unit: 'pc',
    evidence: provenance('nea-composite', 'Test b [CSV 2]', ['sy_dist', 'sy_disterr1', 'sy_disterr2', 'sy_dist_reflink'], 'Host paper'),
    uncertainty: {kind: 'asymmetric', minus: .3, plus: null}, limit: null,
  });
  assert.deepEqual(hostDistance({sy_disterr1: '0.4'}).uncertainty, {kind: 'asymmetric', minus: null, plus: .4});

  const oec = {file: 'systems/Test.xml', name: 'Test b', blob: 'pinned blob', aliases: [],
    elements: {period: {value: 5, minus: null, plus: .2}},
    phase: {kind: 'transit', value: 2451545, system: 'BJD', minus: .001}};
  const [object] = importOec([oec], 'pinned release');
  validateObjects([object], {oec: {}});
  const {elements, phase} = object.orbits[0];
  assert.deepEqual(elements.period.uncertainty, {kind: 'asymmetric', minus: null, plus: .2});
  assert.deepEqual(phase.epoch.uncertainty, {kind: 'asymmetric', minus: .001, plus: null});
  assert.deepEqual(phase.epoch.evidence, provenance('oec', 'systems/Test.xml#Test b',
    ['planet/transittime', 'planet/transittime/@unit', 'planet/transittime/@errorminus', 'planet/transittime/@errorplus'], 'pinned blob'));
});

test('Cosmic: NASA default flags follow publications when flags or CSV row order change', () => {
  const [first] = nasaRows();
  const second = {...first, default_flag: '0', pl_refname: 'Another paper', pl_orbper: '6'};
  const swapFlags = [first, second].map(row => ({...row, default_flag: row.default_flag === '1' ? '0' : '1'}));
  const importRows = rows => importNasa(rows, [], '2026-11-13').objects[0];
  const refs = ['https://example.org/first', 'Another paper'];
  for (const [rows, flags] of [[[first, second], [true, false]], [swapFlags, [false, true]],
    [[...swapFlags].reverse(), [false, true]], [[first, second].map(row => ({...row, default_flag: '0'})), [false, false]]]) {
    const out = JSON.parse(JSON.stringify(importRows(rows)));
    assert.equal(out.orbits.length, 2);
    validateObjects([out], {'nea-ps': {}});
    for (const [i, ref] of refs.entries()) {
      const {solution, elements} = out.orbits.find(orbit => orbit.solution.reference === ref);
      const inputLine = rows.findIndex(row => row.pl_refname === [first, second][i].pl_refname) + 2;
      assert.deepEqual(solution, {...provenance('nea-ps', `Test b [CSV ${inputLine}]`,
        ['pl_refname', 'default_flag'], ref), kind: 'single-reference', archiveDefault: flags[i]});
      assert.equal(elements.period.value, 5 + i);
      assert.deepEqual(elements.period.uncertainty, {kind: 'asymmetric', minus: .1, plus: .2});
    }
  }
  const invalid = importRows([first, second]);
  invalid.orbits[1].solution.archiveDefault = true;
  assert.throws(() => validateObjects([invalid], {'nea-ps': {}}), /Multiple NASA default/);
  invalid.orbits[1].solution.archiveDefault = false;
  invalid.orbits[1].solution.columns = ['pl_refname'];
  assert.throws(() => validateObjects([invalid], {'nea-ps': {}}), /Invalid NASA default flag or provenance/);
});

test('Cosmic: adaptive angular tiles preserve every row including boundaries and crowded leaves', () => {
  assert.deepEqual(skyCoordinates(0, -90), [0, 0]);
  assert(skyCoordinates(359.999, 90).every(x => x < 1));
  assert.throws(() => skyCoordinates(360, 0), /sky/);
  const u = [0, .5, .5, .5, .5, .9999], v = [0, .5, .5, .5, .5, .9999], seen = [];
  const root = buildTiles(u, v, (node, page, rows) => {
    const bytes = encodeTile(node, rows, u, v);
    assert.deepEqual([...decodeTile(bytes, rows.length).rows], [...rows]);
    seen.push(...rows);
    assert(rows.length <= 2);
  }, 2);
  assert.equal(root.count, u.length);
  assert.deepEqual(seen.sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);
  const bytes = Buffer.from(files.get(manifest.layers.gaia.tree.files[0].path));
  const count = manifest.layers.gaia.tree.files[0].count;
  assert.throws(() => decodeTile(bytes.subarray(1), count), /header/);
  bytes.writeFloatLE(NaN, 16);
  assert.throws(() => decodeTile(bytes, count), /outside tile/);
  assert.deepEqual([...cameraRelative([149597870700.25, 1], [149597870700, 1], 1)], [.25, 0]);
});

test('Cosmic: prefix search resolves through the same object row as the inspector', () => {
  assert.equal(searchShard('  ＨR '), 'hr');
  const query = '  BELLEROPHON ', shard = manifest.search.shards[searchShard(query)];
  const [[key, id, row]] = searchPrefix(JSON.parse(files.get(shard)), query, 1);
  assert.equal(key, searchKey(query));
  assert.equal(JSON.parse(files.get(`objects/${row}.json`)).id, id);
  assert.equal(id, near('51 Peg b').id);
  assert.deepEqual(searchPrefix([['ab', 1], ['ac', 2]], 'ad'), []);
});

test('Cosmic: LOD reports counts and caps points and requests across the RA seam', () => {
  const root = buildTiles([.01, .99, .5], [.4, .4, .7], (node, page, rows) => {
    (node.files ??= []).push({path: `${node.id}-${page}`, count: rows.length});
  }, 1);
  const overview = selectSkyLod(root, [0, 0, 1, 1], {maxDepth: 0, maxPoints: 2, maxTiles: 2});
  assert.equal(overview.aggregates[0].catalogCount, 3);
  const seam = selectSkyLod(root, [.95, .2, .05, .5], {maxDepth: 8, maxPoints: 1, maxTiles: 1});
  assert.equal(seam.displayPointBudgetUsed, 1);
  assert.equal(seam.tiles.length, 1);
  assert.equal(seam.aggregates[0].catalogCount, 1);
});

test('Cosmic: loader deduplicates, bounds work, cancels old views and caches by release', async () => {
  const cache = new ByteLru(12, 2);
  const active = [];
  const loader = new TileLoader((release, tile, signal) => new Promise(resolve => active.push({release, tile, signal, resolve})),
    {parallel: 1, maxQueued: 2, cache});
  const a = loader.request('A', '0');
  assert.strictEqual(loader.request('A', '0'), a);
  const low = loader.request('A', '1');
  const high = loader.request('A', '2', 2);
  await assert.rejects(loader.request('A', '3'), /capacity/);
  active[0].resolve(new Uint8Array(8));
  await a;
  assert.equal(active[1].tile, '2');
  const stale = assert.rejects(high, {name: 'AbortError'}), queued = assert.rejects(low, {name: 'AbortError'});
  loader.changeView();
  assert(active[1].signal.aborted);
  const newer = loader.request('B', '0');
  active[1].resolve(new Uint8Array(8));
  await Promise.all([stale, queued]);
  assert.equal(active[2].release, 'B');
  const payload = new Uint8Array(8);
  active[2].resolve(payload);
  assert.strictEqual(await newer, payload);
  assert.strictEqual(await loader.request('B', '0'), payload);
  assert.equal(cache.byteLength, 8);
  assert.equal(cache.size, 1);
  loader.dispose();
  assert.equal(cache.byteLength, 0);
  await assert.rejects(loader.request('B', '0'), {name: 'AbortError'});
});

test('Cosmic: release write is reproducible and refuses to reuse damaged output', async () => {
  const temp = await mkdtemp(fileURLToPath(new URL('./.cosmic-output-', import.meta.url)));
  try {
    const output = await writeSample(temp, sample);
    assert.equal(await writeSample(temp, sample), output);
    await writeFile(join(output, 'objects.json'), 'damaged');
    await assert.rejects(writeSample(temp, sample), /corrupt/);
  } finally { await rm(temp, {recursive: true, force: true}); }
});
