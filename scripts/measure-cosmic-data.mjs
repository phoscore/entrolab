import {performance} from 'node:perf_hooks';
import {gzipSync} from 'node:zlib';
import {buildSample} from '../cosmic-explorer/pipeline.mjs';
import {buildTiles, decodeTile, encodeTile, TILE_LIMIT} from '../cosmic-explorer/tiles.mjs';
import {ByteLru, searchPrefix} from '../cosmic-explorer/access.mjs';

const requested = process.argv.slice(2).map(Number);
const sizes = requested.length ? requested : [100_000, 1_000_000];
if (sizes.some(n => !Number.isSafeInteger(n) || n < 1 || n > 10_000_000)) throw new Error('Use integer counts between 1 and 10000000');
const memory = () => {
  const {rss, heapUsed, arrayBuffers} = process.memoryUsage();
  return {rss, heapUsed, arrayBuffers};
};
const gzip = bytes => gzipSync(bytes, {level: 6}).length;
const rounded = value => Math.round(value * 100) / 100;

function syntheticLoad(count) {
  globalThis.gc?.();
  const before = memory();
  let state = 0x31415926;
  function draw() {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 2 ** 32;
  }
  const u = new Float64Array(count), v = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    u[i] = draw();
    v[i] = i % 3 ? .42 + .16 * draw() : draw();
  }
  const started = performance.now(), packages = new Map();
  let raw = 0, transfer = 0, maximum = 0, largest = null;
  const tree = buildTiles(u, v, (node, page, indices) => {
    const bytes = encodeTile(node, indices, u, v, {flags: i => i % 5 === 0 ? 0 : 1});
    const compressed = gzip(bytes);
    const name = `${node.id}-${page}`;
    (node.files ??= []).push(name);
    packages.set(name, compressed);
    raw += bytes.length;
    transfer += compressed;
    if (compressed > maximum) { maximum = compressed; largest = {bytes, count: indices.length}; }
  });
  const buildMs = performance.now() - started;
  const overview = gzip(Buffer.from(JSON.stringify({count: tree.count, children: tree.children?.map(({id, count, bounds}) => ({id, count, bounds}))})));
  const directory = gzip(Buffer.from(JSON.stringify(tree)));
  const cache = new ByteLru(16 * 1024 ** 2);
  let routeTransfer = 0, decodeMs = 0;
  const leaves = [...packages.keys()];
  for (const [i, name] of leaves.slice(0, 32).entries()) {
    routeTransfer += packages.get(name);
    cache.set(name, true, i === 0 ? largest.count * 16 : TILE_LIMIT * 16); // conservative when the route tile is short
  }
  for (let i = 0; i < 10; i++) {
    const t = performance.now();
    decodeTile(largest.bytes, largest.count);
    decodeMs += performance.now() - t;
  }
  const width = String(count - 1).length, key = i => `syn${String(i).padStart(width, '0')}`;
  const searchStart = performance.now();
  const shardSizes = [];
  let searchTransfer = 0;
  // Exercise a more granular prefix than the sample's two-character directory.
  const shardLimit = 2048;
  for (let offset = 0; offset < count; offset += shardLimit) {
    const shard = Array.from({length: Math.min(shardLimit, count - offset)}, (_, i) => [key(offset + i), offset + i]);
    if (!searchPrefix(shard, key(offset), 1).length) throw new Error('Synthetic lookup failed');
    const compressed = gzip(Buffer.from(JSON.stringify(shard)));
    searchTransfer += compressed;
    shardSizes.push(compressed);
  }
  const searchMs = performance.now() - searchStart;
  globalThis.gc?.();
  return {count, tiles: packages.size, tileBuildAndGzipMs: rounded(buildMs), tileBytes: raw, tileGzipBytes: transfer,
    largestTileGzipBytes: maximum, largestTileMeanDecodeMs: rounded(decodeMs / 10), overviewGzipBytes: overview,
    directoryGzipBytes: directory, routeTileGzipBytes: routeTransfer, routeCacheAccountedBytes: cache.byteLength,
    searchShards: shardSizes.length, searchGzipBytes: searchTransfer, largestSearchShardGzipBytes: Math.max(...shardSizes),
    searchBuildAndGzipMs: rounded(searchMs), inputCoordinatesBytes: u.byteLength + v.byteLength,
    before, after: memory()};
}

const sample = await buildSample();
const manifest = sample.files.get('manifest.json');
const real = {counts: sample.manifest.counts, manifestBytes: manifest.length, manifestGzipBytes: gzip(manifest),
  packages: Object.fromEntries([...sample.files].filter(([name]) => !name.startsWith('objects/') && !name.startsWith('search/') && name !== 'manifest.json')
    .map(([name, bytes]) => [name, {bytes: bytes.length, gzipBytes: gzip(bytes)}])),
  inspectorGzipBytes: [...sample.files].filter(([name]) => name.startsWith('objects/')).reduce((n, [, bytes]) => n + gzip(bytes), 0),
  searchGzipBytes: [...sample.files].filter(([name]) => name.startsWith('search/')).reduce((n, [, bytes]) => n + gzip(bytes), 0)};
console.log(JSON.stringify({node: process.version, platform: process.platform, arch: process.arch, garbageCollection: !!globalThis.gc,
  real, syntheticLoadOnly: sizes.map(syntheticLoad)}, null, 2));
