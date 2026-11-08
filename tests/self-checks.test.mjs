import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {createSelfChecks} from '../dist/self-checks.mjs';
import {body,scenario} from '../dist/physics.mjs';
import {predictSync} from '../dist/prediction.mjs';
const moduleURL=new URL('../dist/checks.mjs',import.meta.url).href;
function isolatedWorker(){
 const w=new Worker(`const {parentPort}=require('node:worker_threads');parentPort.on('message',async()=>{const {checks}=await import(${JSON.stringify(moduleURL)});parentPort.postMessage({results:checks()})});`,{eval:true});
 return {set onmessage(fn){w.on('message',data=>fn({data}))},set onerror(fn){w.on('error',fn)},postMessage:v=>w.postMessage(v),terminate:()=>w.terminate()};
}
test('self-checks: each rerun really executes all ten checks in an isolated realm; bodies, prediction and IDs stay unchanged',async()=>{
 let posts=0,terminations=0;const updates=[];const c=createSelfChecks({createWorker(){const w=isolatedWorker();return {set onmessage(fn){w.onmessage=fn},set onerror(fn){w.onerror=fn},postMessage(v){posts++;w.postMessage(v)},terminate(){terminations++;w.terminate()}}},onUpdate:s=>updates.push(s)});
 const bodies=scenario('binary'),before=structuredClone(bodies),forecast=predictSync(bodies,bodies[0].id,10),saved=structuredClone(forecast),a=body('sentinel','planet',1,0,0,0,0,'white');
 for(let i=1;i<=3;i++){const result=await c.run();assert.equal(result.runs,i);assert.equal(result.results.length,10);assert(result.results.every(r=>r.ok));assert.equal(result.error,false);assert.equal(result.running,false)}
 const b=body('sentinel','planet',1,0,0,0,0,'white');assert.equal(b.id,a.id+1);assert.deepEqual(bodies,before);assert.deepEqual(forecast,saved);assert.equal(posts,3);assert.equal(terminations,3);assert.equal(updates.filter(s=>s.running).length,3);
});
test('self-checks: double-click guard shares the pending execution and snapshots cannot mutate the controller',async()=>{
 let posts=0;const c=createSelfChecks({createWorker(){const w=isolatedWorker();return {set onmessage(fn){w.onmessage=fn},set onerror(fn){w.onerror=fn},postMessage(v){posts++;w.postMessage(v)},terminate:()=>w.terminate()}}});
 const a=c.run(),b=c.run();assert.equal(a,b);assert.equal(c.snapshot().running,true);await a;assert.equal(posts,1);const copy=c.snapshot();copy.results[0].ok=false;assert.equal(c.snapshot().results[0].ok,true);
});
test('self-checks: worker creation, error events, malformed responses and timeout report failure and allow retry',async()=>{
 for(const kind of ['create','error','malformed','timeout']){let terminated=0;let attempt=0;const c=createSelfChecks({timeoutMs:25,createWorker(){attempt++;if(attempt>1){const w={terminate(){},postMessage(){queueMicrotask(()=>w.onmessage({data:{results:Array.from({length:10},(_,i)=>({name:'retry '+i,ok:true}))}}))}};return w;}if(kind==='create')throw Error('blocked');const w={terminate(){terminated++},postMessage(){if(kind==='error')queueMicrotask(()=>w.onerror({preventDefault(){}}));if(kind==='malformed')queueMicrotask(()=>w.onmessage({data:{results:[]}}))}};return w}});
 const failed=await c.run();assert.equal(failed.error,true,kind);assert.equal(failed.running,false);assert.equal(failed.runs,1);assert.equal(terminated,kind==='create'?0:1);
 const retry=await c.run();assert.equal(retry.error,false);assert.equal(retry.runs,2);assert.equal(attempt,2);
 }
});
test('self-checks: valid failing result is distinguished from an unavailable worker',async()=>{
 const c=createSelfChecks({createWorker(){const w={terminate(){},postMessage(){queueMicrotask(()=>w.onmessage({data:{results:Array.from({length:10},(_,i)=>({name:'check '+i,ok:i!==0}))}}))}};return w}});const r=await c.run();assert.equal(r.error,false);assert.equal(r.results.filter(x=>x.ok).length,9);
});
