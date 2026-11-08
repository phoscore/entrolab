import {performance} from 'node:perf_hooks';
import {experiment} from '../dist/experiments.mjs';
import {baseline,diagnostics} from '../dist/instruments.mjs';
import {predict} from '../dist/prediction.mjs';
import {step,safeStep,body} from '../dist/physics.mjs';
const scenarios=[];
for(const name of ['triple','assist']){const b=experiment(name),base=baseline(b,'Reset'),v0=Math.hypot(b.at(-1).vx,b.at(-1).vy);let t=0,steps=0,hits=0;while(t<180){const dt=Math.min(180-t,safeStep(b));hits+=step(b,dt);t+=dt;steps++}const q=diagnostics(b,base);scenarios.push({name,days:t,steps,hits,speedRatio:Math.hypot(b.at(-1).vx,b.at(-1).vy)/v0,energyDrift:q.energyDrift,momentumDrift:q.momentumDrift,angularDrift:q.angularDrift})}
const predictions=[];
for(const name of ['solar','triple','assist','twelve'])for(const days of [10,60,180]){const b=name==='twelve'?Array.from({length:12},(_,i)=>body('test','planet',1e-6,i*2,0,0,.001,'white')):experiment(name);const times=[];let result,maxChunk=0,chunks=0;for(let k=0;k<5;k++){const job=predict(b,b.at(-1).id,days);const start=performance.now();let r;do{const tick=performance.now();r=job.next();maxChunk=Math.max(maxChunk,performance.now()-tick);chunks++}while(!r.done);times.push(performance.now()-start);result=r.value}times.sort((a,b)=>a-b);predictions.push({name,days,steps:result.steps,points:result.points.length,reason:result.reason,medianCpuMilliseconds:times[2],maximumChunkMilliseconds:maxChunk,callsOverFiveRuns:chunks})}
console.log(JSON.stringify({runtime:process.version,platform:process.platform,note:'CPU time, synchronous consumption of <=50-step chunks, five repeats; excludes UI timers/rendering; not a phone benchmark.',scenarios,predictions},null,2));
