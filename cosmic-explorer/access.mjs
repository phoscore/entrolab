import {requireData} from './schema.mjs';

export class ByteLru {
  #entries = new Map();
  #used = 0;
  constructor(bytes, entries = 128) {
    requireData(Number.isSafeInteger(bytes) && bytes >= 0 && Number.isSafeInteger(entries) && entries > 0, 'Invalid cache budget');
    this.maxBytes = bytes;
    this.maxEntries = entries;
  }
  get byteLength() { return this.#used; }
  get size() { return this.#entries.size; }
  get(key) {
    const item = this.#entries.get(key);
    if (!item) return undefined;
    this.#entries.delete(key);
    this.#entries.set(key, item);
    return item.value;
  }
  set(key, value, bytes) {
    requireData(Number.isSafeInteger(bytes) && bytes > 0, 'Invalid cache item cost');
    const remove = k => { this.#used -= this.#entries.get(k).bytes; this.#entries.delete(k); };
    if (this.#entries.has(key)) remove(key);
    if (bytes > this.maxBytes) return;
    while (this.#used + bytes > this.maxBytes || this.#entries.size >= this.maxEntries) remove(this.#entries.keys().next().value);
    this.#entries.set(key, {value, bytes});
    this.#used += bytes;
  }
  clear() { this.#entries.clear(); this.#used = 0; }
}

export class TileLoader {
  #active = 0;
  #queue = [];
  #pending = new Map();
  #scene = new AbortController();
  #closed = false;
  constructor(load, {parallel = 4, maxQueued = 32, cache = new ByteLru(16 * 1024 ** 2)} = {}) {
    requireData(typeof load === 'function' && Number.isInteger(parallel) && parallel > 0 && parallel <= 4 &&
      Number.isInteger(maxQueued) && maxQueued > 0, 'Invalid tile loader budget');
    this.load = load;
    this.parallel = parallel;
    this.maxQueued = maxQueued;
    this.cache = cache;
  }
  get active() { return this.#active; }
  get queued() { return this.#queue.length; }
  changeView({clearCache = false} = {}) {
    this.#scene.abort();
    for (const job of this.#queue) job.reject(this.#scene.signal.reason);
    this.#queue = [];
    this.#pending.clear();
    if (clearCache) this.cache.clear();
    if (!this.#closed) this.#scene = new AbortController();
  }
  request(release, tile, priority = 0) {
    const signal = this.#scene.signal;
    if (signal.aborted) return Promise.reject(signal.reason);
    requireData(typeof release === 'string' && release && typeof tile === 'string' && tile && Number.isFinite(priority), 'Invalid tile request');
    const key = JSON.stringify([release, tile]);
    const cached = this.cache.get(key);
    if (cached !== undefined) return Promise.resolve().then(() => { signal.throwIfAborted(); return cached; });
    if (this.#pending.has(key)) return this.#pending.get(key);
    if (this.#queue.length >= this.maxQueued) return Promise.reject(new Error('Tile queue capacity reached'));
    const promise = new Promise((resolve, reject) => this.#queue.push({key, release, tile, priority, signal, resolve, reject}));
    this.#pending.set(key, promise);
    this.#queue.sort((a, b) => b.priority - a.priority);
    this.#drain();
    return promise;
  }
  #drain() {
    while (this.#active < this.parallel && this.#queue.length) {
      const job = this.#queue.shift();
      this.#active++;
      void this.#run(job);
    }
  }
  async #run(job) {
    try {
      job.signal.throwIfAborted();
      const value = await this.load(job.release, job.tile, job.signal);
      job.signal.throwIfAborted();
      this.cache.set(job.key, value, value.byteLength);
      job.resolve(value);
    } catch (error) {
      job.reject(job.signal.aborted ? job.signal.reason : error);
    } finally {
      if (!job.signal.aborted) this.#pending.delete(job.key);
      this.#active--;
      this.#drain();
    }
  }
  dispose() { this.#closed = true; this.changeView({clearCache: true}); }
}

export const searchKey = text => text.normalize('NFKC').trim().toLowerCase();
export function searchShard(key) { return [...searchKey(key)].slice(0, 2).join(''); }

export function searchPrefix(entries, query, limit = 20) {
  const key = searchKey(query);
  if (!key || limit <= 0) return [];
  let lo = 0, hi = entries.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (entries[mid][0] < key) lo = mid + 1;
    else hi = mid;
  }
  const matches = [];
  for (let i = lo; i < entries.length && matches.length < limit && entries[i][0].startsWith(key); i++) matches.push(entries[i]);
  return matches;
}
