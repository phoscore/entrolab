import {createHash} from 'node:crypto';
import {mkdir, readFile, rename, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {searchKey, searchShard} from './access.mjs';
import {importDesi, importGaia, importOec, readCsv} from './import.mjs';
import {requireData, SCHEMA_VERSION, validateObjects} from './schema.mjs';
import {buildTiles, encodeTile, skyCoordinates, TILE_VERSION} from './tiles.mjs';

export const sampleDir = fileURLToPath(new URL('./samples/', import.meta.url));
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const safeName = value => typeof value === 'string' && /^[a-z0-9][a-z0-9.-]*$/i.test(value);

export async function buildSample(input = sampleDir) {
  const configBytes = await readFile(join(input, 'sources.json'));
  const config = JSON.parse(configBytes);
  requireData(config.version === 1 && safeName(config.release) && config.distribution === 'cleared-sample', 'Invalid sample source manifest');
  const license = await readFile(join(input, 'OEC-LICENSE.txt'));
  const credits = await readFile(join(input, 'CREDITS.md'));
  const inputs = [['sources.json', configBytes], ['OEC-LICENSE.txt', license], ['CREDITS.md', credits]]
    .map(([file, bytes]) => ({file, sha256: sha256(bytes)}));
  const objects = [];
  for (const {file, type, query, maxRows, expectedRows} of config.inputs) {
    requireData(safeName(file) && ['gaia', 'desi', 'oec'].includes(type) && Number.isInteger(maxRows) && maxRows <= 100 && maxRows > 0 &&
      !inputs.some(x => x.file === file), 'Unexpected sample input');
    const bytes = await readFile(join(input, file));
    requireData(bytes.length <= 128 * 1024, `Sample exceeds input byte budget: ${file}`);
    const rows = type === 'oec' ? JSON.parse(bytes) : readCsv(bytes.toString('utf8'));
    requireData(Array.isArray(rows) && rows.length === expectedRows && rows.length <= maxRows && rows.length > 0, `Unexpected row count: ${file}`);
    const imported = type === 'gaia' ? importGaia(rows) : type === 'desi' ? importDesi(rows) : importOec(rows, config.sources.oec.release);
    inputs.push({file, type, rows: rows.length, maxRows, query, bytes: bytes.length, sha256: sha256(bytes)});
    objects.push(...imported);
  }
  validateObjects(objects, config.sources);
  objects.sort((a, b) => compare(a.id, b.id));
  const files = new Map(), packages = {};
  function add(path, bytes) {
    files.set(path, bytes);
    packages[path] = {bytes: bytes.length, sha256: sha256(bytes)};
    return path;
  }
  add('OEC-LICENSE.txt', license);
  add('CREDITS.md', credits);
  add('objects.json', json({schemaVersion: SCHEMA_VERSION, release: config.release, objects}));
  const lookup = new Map();
  objects.forEach((o, row) => {
    add(`objects/${row}.json`, json(o));
    for (const key of new Set([o.id, o.identity.id, ...o.aliases.filter(a => a.relation === 'catalog').map(a => a.name)].map(searchKey))) {
      const shard = searchShard(key);
      if (!lookup.has(shard)) lookup.set(shard, []);
      lookup.get(shard).push([key, o.id, row]);
    }
  });
  const shards = {};
  for (const [key, entries] of lookup) {
    entries.sort((a, b) => compare(a[0], b[0]) || compare(a[1], b[1]));
    shards[key] = add(`search/${Buffer.from(key).toString('hex')}.json`, json(entries));
  }
  const sky = objects.flatMap((o, row) => o.direction ? [{row, o, xy: skyCoordinates(o.direction.ra.value, o.direction.dec.value)}] : []);
  // Keep Gaia source astrometry and DESI observed directions in distinct layer indexes.
  const layers = {};
  for (const type of ['gaia', 'desi']) {
    const layer = sky.filter(({o}) => o.identity.catalog === type);
    const u = Float64Array.from(layer, x => x.xy[0]), v = Float64Array.from(layer, x => x.xy[1]);
    const tree = buildTiles(u, v, (node, page, indices) => {
      const bytes = encodeTile(node, indices, u, v, {rowId: i => layer[i].row, flags: i => layer[i].o.distances.length > 0 ? 1 : 0});
      (node.files ??= []).push({path: add(`tiles/${type}-${node.id}-${page}.bin`, bytes), count: indices.length});
    });
    layers[type] = {frame: layer[0]?.o.direction.frame ?? null, projection: 'equal-area-ra-sin-dec', coverage: 'selected-rows-only', tree};
  }
  const kinds = {};
  for (const o of objects) kinds[o.kind] = (kinds[o.kind] ?? 0) + 1;
  const manifest = {manifestVersion: 1, schemaVersion: SCHEMA_VERSION, tileVersion: TILE_VERSION, indexVersion: 1,
    release: config.release, acquiredDate: config.acquiredDate, distribution: config.distribution, sources: config.sources,
    inputs, counts: {objects: objects.length, byKind: kinds, skyDirections: sky.length, noDirection: objects.length - sky.length,
      noDistance: objects.filter(o => !o.distances.length).length, negativeParallax: objects.filter(o => o.parallax?.value < 0).length,
      missingParallax: objects.filter(o => o.parallax?.status === 'unknown').length},
    layers, search: {shards, inspectorPath: 'objects/{row}.json'}, packages};
  files.set('manifest.json', json(manifest));
  return {files, manifest, objects};
}

export async function writeSample(root, sample) {
  await mkdir(root, {recursive: true});
  const output = join(root, sample.manifest.release);
  try {
    await mkdir(output);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const old = await readFile(join(output, 'manifest.json'));
    requireData(old.equals(sample.files.get('manifest.json')), 'Refusing to overwrite an existing data release');
    for (const [path, bytes] of sample.files) requireData((await readFile(join(output, path))).equals(bytes), `Existing release is corrupt: ${path}`);
    return output;
  }
  for (const [path, bytes] of sample.files) {
    if (path === 'manifest.json') continue;
    const dest = join(output, path);
    await mkdir(join(dest, '..'), {recursive: true});
    await writeFile(dest, bytes, {flag: 'wx'});
  }
  await writeFile(join(output, 'manifest.pending'), sample.files.get('manifest.json'), {flag: 'wx'});
  await rename(join(output, 'manifest.pending'), join(output, 'manifest.json'));
  return output;
}
