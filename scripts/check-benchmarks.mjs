import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {spawnSync,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
// Approved pre-v0.6 baseline. Never regenerate the historical JSON to hide drift.
const base='39fde20f812da1d371b4990b15062062cddd102f';
const files=['dist/physics.mjs','tests/numerics.mjs','scripts/benchmark.mjs'];
const original=path=>execFileSync('git',['show',`${base}:${path}`],{cwd:root,maxBuffer:2*1024*1024});
const temp=mkdtempSync(join(tmpdir(),'entrolab-bench-'));
function run(cwd){const r=spawnSync(process.execPath,['scripts/benchmark.mjs'],{cwd,encoding:'utf8',timeout:120000,maxBuffer:2*1024*1024});assert.ifError(r.error);assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout)}
try{
 for(const file of files){const bytes=original(file);assert.deepEqual(readFileSync(join(root,file)),bytes,`Preserve benchmark source: ${file}`);const target=join(temp,file);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,bytes)}
 assert.deepEqual(readFileSync(join(root,'docs/numerics-v0.2.json')),original('docs/numerics-v0.2.json'),'Historical numerical reference must remain byte-identical');
 // Compare both commits under this exact Node/V8/OS. Transcendental rounding can
 // differ across runtimes, especially on long chaotic trajectories.
 const reference=run(temp),actual=run(root);assert.equal(actual.results.length,12);assert.deepEqual(actual,reference,'All twelve complete numerical outputs must match the approved baseline exactly in the same runtime');
 console.log(`Runtime ${process.version}; exact comparison against ${base}`);
 for(const row of actual.results)console.log(`PASS unchanged benchmark: ${row.name} / ${row.mode} / ${row.steps} steps`);
}finally{rmSync(temp,{recursive:true,force:true})}
