// Explicit maintenance command only. Build, test and browser are offline.
import {readFile,writeFile} from 'node:fs/promises';
import {capture,atlasSha256} from '../cosmic-explorer/atlas-build.mjs';

const [kind,path,...rest]=process.argv.slice(2);
if (!path || rest.length || !['gaia','esa-check'].includes(kind)) {
  throw new Error('Usage: node scripts/fetch-real-sky.mjs gaia|esa-check path/to/new.csv');
}
const archive=kind==='gaia'?capture:capture.esa;
const file=kind==='gaia'?capture.query:'esa-check.adql';
const query=(await readFile(new URL('../cosmic-explorer/atlas/'+file,import.meta.url),'utf8')).trim();
const url=new URL(archive.endpoint);
url.search=new URLSearchParams({REQUEST:'doQuery',LANG:'ADQL',FORMAT:'csv',MAXREC:String(archive.rows+1),QUERY:query});
const response=await fetch(url,{signal:AbortSignal.timeout(60000)});
if (!response.ok || !response.headers.get('content-type')?.startsWith('text/csv')) {
  throw new Error(`Archive did not return CSV (HTTP ${response.status})`);
}
const bytes=Buffer.from(await response.arrayBuffer());
const hash=atlasSha256(bytes);
if (hash!==archive.sha256) throw new Error(`Archive snapshot differs (${hash}); verify before cutting a new atlas release`);
await writeFile(path,bytes,{flag:'wx'});
console.log(`${bytes.length} bytes · SHA-256 ${hash}`);
