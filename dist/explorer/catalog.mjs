import {ByteLru, TileLoader, searchKey, searchPrefix} from './foundation/access.mjs';
import {decodeTile, selectSkyLod} from './foundation/tiles.mjs';
import {validateObjects} from './foundation/schema.mjs';
import {RELEASE, MANIFEST_SHA256} from './release.mjs';

export const DATA_URL = new URL(`./data/${RELEASE}/`, import.meta.url);
const hash = async bytes => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(x => x.toString(16).padStart(2, '0')).join('');

export async function checkedBytes(url, metadata, signal, fetcher = fetch) {
  const timed = AbortSignal.any([signal, AbortSignal.timeout(15000)]);
  const response = await fetcher(url, {signal: timed, credentials: 'same-origin'});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > metadata.bytes) throw new Error('Data exceeds byte budget');
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  timed.throwIfAborted();
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  if ((metadata.exact !== false && total !== metadata.bytes) || await hash(bytes) !== metadata.sha256) throw new Error('Data integrity mismatch');
  timed.throwIfAborted();
  return bytes;
}

const parse = bytes => JSON.parse(new TextDecoder().decode(bytes));
export async function loadCatalog(signal, fetcher = fetch) {
  const manifest = parse(await checkedBytes(new URL('manifest.json', DATA_URL), {bytes: 32768, exact: false, sha256: MANIFEST_SHA256}, signal, fetcher));
  if (manifest.release !== RELEASE || manifest.distribution !== 'cleared-sample' || manifest.schemaVersion !== 1) throw new Error('Unsupported release');
  const bytes = await checkedBytes(new URL('objects.json', DATA_URL), manifest.packages['objects.json'], signal, fetcher);
  const data = parse(bytes);
  if (data.release !== RELEASE || data.schemaVersion !== manifest.schemaVersion || data.objects.length !== manifest.counts.objects) throw new Error('Object release mismatch');
  validateObjects(data.objects, manifest.sources, data.schemaVersion);
  signal.throwIfAborted();
  return {manifest, objects: data.objects};
}

export function makeLoader(manifest, fetcher = fetch) {
  return new TileLoader(async (release, path, signal) => {
    if (release !== RELEASE || !Object.hasOwn(manifest.packages, path)) throw new Error('Unknown package');
    return checkedBytes(new URL(path, DATA_URL), manifest.packages[path], signal, fetcher);
  }, {parallel: 2, maxQueued: 32, cache: new ByteLru(1024 * 1024, 64)});
}

export async function loadSky(manifest, objects, loader, viewport) {
  const selections = Object.values(manifest.layers).map(layer => selectSkyLod(layer.tree, viewport, {maxDepth: 22, maxPoints: 4096, maxTiles: 16}));
  const files = selections.flatMap(s => s.tiles);
  const packets = await Promise.all(files.map(file => loader.request(RELEASE, file.path).then(bytes => decodeTile(bytes, file.count))));
  const rows = new Set(packets.flatMap(packet => [...packet.rows]));
  for (const row of rows) if (!objects[row]?.direction) throw new Error('Invalid sky row');
  return {objects: [...rows].map(row => objects[row]), aggregates: selections.flatMap(s => s.aggregates)};
}

export async function findObjects(manifest, objects, loader, query) {
  const key = searchKey(query);
  if (!key) return objects;
  const prefixes = Object.keys(manifest.search.shards).filter(prefix => prefix.startsWith(key) || key.startsWith(prefix));
  const shards = await Promise.all(prefixes.map(prefix => loader.request(RELEASE, manifest.search.shards[prefix]).then(parse)));
  const rows = new Set();
  for (const entries of shards) for (const [, id, row] of searchPrefix(entries, key, objects.length * 20)) {
    if (objects[row]?.id !== id) throw new Error('Search identity mismatch');
    rows.add(row);
  }
  return [...rows].map(row => objects[row]);
}
