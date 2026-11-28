import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {extname,join,resolve,sep} from 'node:path';

const baseline='6d390efe1a61f8e849bd8c4fdf5868d2039c9a34';
const auditedPhaseB='f3221d5e544ed57f2da84db0b5abac270d889326';
const types={'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg'};

async function measure(h,base,version,width,cpu,scenes=['idle','entrance']){
 const current=version==='B'||version==='fixed';
 const phaseB=version!=='A';
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
  if(phaseB)await p.evaluate(async()=>{
   const {initCreature}=await import('/creature-ui.mjs');
   initCreature().dispose();
   let next=null;
   let rolls=[];
   initCreature(document,{random:()=>rolls.shift()??.5,schedule:fn=>(next=fn,1),cancel:()=>{next=null}});
   window.startNullBenchmark=roll=>{rolls=[roll,.5];window.advanceNullBenchmark()};
   window.advanceNullBenchmark=()=>{const callback=next;next=null;callback()};
  });
  if(phaseB)await p.waitForFunction(()=>window.entrolabCreature.inspect().timers===1,null,{timeout:3500});
  else await p.waitForFunction(()=>!document.querySelector('#creature').getAnimations({subtree:true}).length);
  const rows=[];
  for(const scene of scenes){
   for(let run=0;run<3;run++){
    await p.waitForTimeout(180);
    if(scene!=='idle'){
     if(phaseB)await p.evaluate(roll=>window.startNullBenchmark(roll),{entrance:.31,mischief:.19,curiosity:.48}[scene]);
     else await p.evaluate(()=>{
      document.querySelector('#creaturePreferencesSummary').click();
      document.querySelector('#nullPreviewRift').click();
     });
    }
    if(scene==='mischief'||scene==='curiosity')await p.waitForTimeout(2150);
    else if(scene==='idle')await p.waitForTimeout(100);
    if(scene!=='idle')try{
     await p.waitForFunction(()=>{
      const figure=document.querySelector('#creature');
      return figure&&!figure.hidden&&figure.getAnimations({subtree:true}).length>0;
     },null,{timeout:3000});
    }catch(error){
     const state=await p.evaluate(()=>{
      const figure=document.querySelector('#creature');
      return {hidden:figure?.hidden,sequence:figure?.dataset.sequence,moving:figure?.dataset.moving,
       phase:figure?.dataset.phase,animations:figure?.getAnimations({subtree:true}).map(animation=>({name:animation.animationName,state:animation.playState,currentTime:animation.currentTime})),
       reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
       mode:document.querySelector('#creatureMode')?.value,previewDisabled:document.querySelector('#nullPreviewRift')?.disabled};
     });
     throw new Error(`Null ${version}/${width}px ${scene} run ${run} did not enter an active animation: ${JSON.stringify(state)}`,{cause:error});
    }
    const before=await metrics();
    const sample=await p.evaluate(async()=>{
     const initial=window.entrolab.renderInfo().frame,modelTime=window.entrolab.inspect().elapsed;
     const start=performance.now(),longTasks=[];
     const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(x=>x.duration)));
     observer.observe({type:'longtask'});
     const figure=document.querySelector('#creature');
     const animations=figure.getAnimations({subtree:true}).length;
     await new Promise(done=>setTimeout(done,1100));
     longTasks.push(...observer.takeRecords().map(x=>x.duration));
     observer.disconnect();
     return {elapsed:performance.now()-start,animations,sequence:figure.dataset.sequence,longTasks,gravity:window.entrolab.renderInfo().frame-initial,modelTimeDelta:window.entrolab.inspect().elapsed-modelTime};
    });
    const after=await metrics();
    assert.equal(sample.modelTimeDelta,0);
    assert.equal(sample.animations>0,scene!=='idle',JSON.stringify({version,width,cpu,scene,run,sample}));
    if(scene==='mischief'||scene==='curiosity')assert.equal(sample.sequence,scene);
    rows.push({version,width,cpu,scene,run,...sample,
     taskMs:(after.TaskDuration-before.TaskDuration)*1000,scriptMs:(after.ScriptDuration-before.ScriptDuration)*1000});
    if(scene!=='idle'){
     if(phaseB)await p.evaluate(()=>window.advanceNullBenchmark());
     else await p.waitForFunction(()=>!document.querySelector('#creature').getAnimations({subtree:true}).length);
    }
   }
  }
  return rows;
 }finally{await context.close()}
}

async function compare(h,t,{base,versions,scenes,file,label}){
 let zip;
 try{zip=execFileSync('git',['archive',base,'dist'],{maxBuffer:20*1024*1024,stdio:['ignore','pipe','pipe']});}
 catch(error){
  if(process.env.GITHUB_ACTIONS==='true')throw error;
  t.skip('The baseline Git object is required for the comparative measurement.');
  return;
 }
 const temp=await mkdtemp(join(tmpdir(),'entrolab-null-'));
 try{
  execFileSync('tar',['-xf','-','-C',temp],{input:zip});
  const samples=[];
  for(const [width,cpu,order] of [[1440,1,versions],[390,4,[...versions].reverse()]]){
   for(const version of order)samples.push(...await measure(h,join(temp,'dist'),version,width,cpu,scenes));
  }
  const result={baseline:base,browser:h.browser.version(),dpr:1,windowMs:1100,samples};
  await writeFile(join(h.output,file),JSON.stringify(result,null,2)+'\n');
  console.log(label+' '+JSON.stringify(result));
 }finally{await rm(temp,{recursive:true,force:true})}
}

export const measureNull=(h,t)=>compare(h,t,{
 base:baseline,versions:['A','B'],file:'null-phase-a-comparison.json',label:'Null phase A comparison',
});
export const measureNullAudit=(h,t)=>compare(h,t,{
 base:auditedPhaseB,versions:['audited','fixed'],scenes:['mischief','curiosity'],
 file:'null-audit-comparison.json',label:'Null audit comparison',
});
