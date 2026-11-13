import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {extname,join,resolve,sep} from 'node:path';

const baseline='6d390efe1a61f8e849bd8c4fdf5868d2039c9a34';
const types={'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg'};

async function measure(h,base,version,width,cpu){
 const current=version==='B';
 const context=await h.browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'no-preference'});
 try{
  if(!current)await context.route(h.url+'/**',route=>{
   const pathname=new URL(route.request().url()).pathname;
   const file=resolve(base,'.'+(pathname==='/'?'/index.html':pathname));
   if(!file.startsWith(base+sep))return route.abort();
   return route.fulfill({path:file,contentType:types[extname(file)]});
  });
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
  const p=await context.newPage();
  await p.goto(h.url);
  await h.ready(p);
  await p.waitForFunction(()=>document.querySelector('#checkRunStatus').getAttribute('aria-busy')==='false');
  if(!await p.evaluate(()=>window.entrolab.inspect().paused))await p.locator('#play').click();
  await p.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});});
  const session=await context.newCDPSession(p);
  await session.send('Performance.enable');
  await session.send('Emulation.setCPUThrottlingRate',{rate:cpu});
  const metrics=async()=>Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
  if(current)await p.evaluate(async()=>{
   const {initCreature}=await import('/creature-ui.mjs');
   initCreature().dispose();
   const random=[.5,.31,.5,.5,.31,.5,.5,.31,.5];
   let next=null;
   initCreature(document,{storage:null,random:()=>random.shift()??.31,schedule:fn=>(next=fn,1),cancel:()=>{next=null}});
   window.advanceNullBenchmark=()=>{const callback=next;next=null;callback()};
  });
  if(current)await p.waitForFunction(()=>window.entrolabCreature.inspect().timers===1,null,{timeout:3500});
  else await p.waitForFunction(()=>!document.querySelector('#creature').getAnimations({subtree:true}).length);
  const rows=[];
  for(const scene of ['idle','entrance']){
   for(let run=0;run<3;run++){
    await p.waitForTimeout(180);
    if(scene==='entrance'){
     if(current)await p.evaluate(()=>window.advanceNullBenchmark());
     else await p.evaluate(()=>{
      document.querySelector('#creaturePreferencesSummary').click();
      document.querySelector('#nullPreviewRift').click();
     });
    }
    await p.waitForTimeout(100);
    const before=await metrics();
    const sample=await p.evaluate(async()=>{
     const initial=window.entrolab.renderInfo().frame,modelTime=window.entrolab.inspect().elapsed;
     const start=performance.now(),longTasks=[];
     const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(x=>x.duration)));
     observer.observe({type:'longtask'});
     const animations=document.querySelector('#creature').getAnimations({subtree:true}).length;
     await new Promise(done=>setTimeout(done,1100));
     longTasks.push(...observer.takeRecords().map(x=>x.duration));
     observer.disconnect();
     return {elapsed:performance.now()-start,animations,longTasks,gravity:window.entrolab.renderInfo().frame-initial,modelTimeDelta:window.entrolab.inspect().elapsed-modelTime};
    });
    const after=await metrics();
    assert.equal(sample.modelTimeDelta,0);
    assert.equal(sample.animations>0,scene==='entrance');
    rows.push({version,width,cpu,scene,run,...sample,
     taskMs:(after.TaskDuration-before.TaskDuration)*1000,scriptMs:(after.ScriptDuration-before.ScriptDuration)*1000});
    if(scene==='entrance'){
     if(current)await p.evaluate(()=>window.advanceNullBenchmark());
     else await p.waitForFunction(()=>!document.querySelector('#creature').getAnimations({subtree:true}).length);
    }
   }
  }
  return rows;
 }finally{await context.close()}
}

export async function measureNull(h,t){
 let zip;
 try{zip=execFileSync('git',['archive',baseline,'dist'],{maxBuffer:20*1024*1024,stdio:['ignore','pipe','pipe']});}
 catch(error){
  if(process.env.GITHUB_ACTIONS==='true')throw error;
  t.skip('The Phase A Git object is required for the comparative measurement.');
  return;
 }
 const temp=await mkdtemp(join(tmpdir(),'entrolab-null-'));
 try{
  execFileSync('tar',['-xf','-','-C',temp],{input:zip});
  const samples=[];
  for(const [width,cpu,order] of [[1440,1,['A','B']],[390,4,['B','A']]]){
   for(const version of order)samples.push(...await measure(h,join(temp,'dist'),version,width,cpu));
  }
  const result={baseline,browser:h.browser.version(),dpr:1,windowMs:1100,samples};
  await writeFile(join(h.output,'null-phase-a-comparison.json'),JSON.stringify(result,null,2)+'\n');
  console.log('Null phase A comparison '+JSON.stringify(result));
 }finally{await rm(temp,{recursive:true,force:true})}
}
