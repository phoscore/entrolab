import {chooseLab} from './browser-lab-navigation.mjs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp,rm,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve,sep,extname } from 'node:path';

const baseline='a64a174980023a06f673761f7d632240f2d9c21b';
const types={'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg'};
const rounds=3;
const sampleMs=1000;
const warmupMs=250;
const metrics=async session=>Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));

async function profile(h,baselineDir,{width,height,cpu},version,scenes){
 const context=await h.browser.newContext({viewport:{width,height},locale:'de-DE',deviceScaleFactor:1,reducedMotion:'no-preference'});
 const errors=[];
 try{
  if(version==='v0.9')await context.route(h.url+'/**',async route=>{
   const path=resolve(baselineDir,'.'+new URL(route.request().url()).pathname);
   const file=path===baselineDir?join(path,'index.html'):path;
   if(!file.startsWith(baselineDir+sep))return route.abort();
   await route.fulfill({path:file,contentType:types[extname(file)]});
  });
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
  const p=await context.newPage();p.on('pageerror',error=>errors.push(error.message));
  await p.goto(h.url);await h.ready(p);
  if(version!=='v0.9')await p.evaluate(async()=>{(await import('/creature-ui.mjs')).initCreature().dispose()});
  await p.waitForFunction(()=>document.getElementById('checkRunStatus').getAttribute('aria-busy')==='false');
  if(!await p.evaluate(()=>window.entrolab.inspect().paused))await p.locator('#play').click();
  const session=await context.newCDPSession(p);
  await session.send('Performance.enable');
  if(cpu!==1)await session.send('Emulation.setCPUThrottlingRate',{rate:cpu});
  const rows=[];
  for(let round=0;round<rounds;round++){
   const ordered=round%2===0?scenes:[...scenes].reverse();
   for(const [scene,sky] of ordered){
    let pauseRule;
    if(sky==='paused')pauseRule=await p.addStyleTag({content:'#cosmicBackground::before{animation-play-state:paused!important}'});
    const object=scene.startsWith('object:')?scene.split(':')[1]:null;
    if(scene==='background'){
     if(!await p.locator('#gravity').evaluate(e=>e.classList.contains('active')))await chooseLab(p,'gravity');
     await p.evaluate(()=>window.scrollTo(0,0));
    }
    if(object){
     if(!await p.locator('#extreme').evaluate(e=>e.classList.contains('active')))await chooseLab(p,'extreme');
     await p.locator('#extremeObject').selectOption(object);
     await p.locator('#extremeCanvas').scrollIntoViewIfNeeded();
     await p.waitForFunction(()=>document.getElementById('extreme').dataset.animating==='true');
    }
    await p.waitForTimeout(warmupMs);
    const before=await metrics(session);
    const sample=await p.evaluate(async ({object,sampleMs})=>{
     const extreme=document.getElementById('extreme'),sky=document.getElementById('cosmicBackground');
     const frames=()=>object?Number(extreme.dataset.rendered):window.entrolab.renderInfo().frame;
     const started=performance.now(),initial=frames(),longTasks=[];
     const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>e.duration)));
     observer.observe({type:'longtask'});
     await new Promise(done=>setTimeout(done,sampleMs));
     longTasks.push(...observer.takeRecords().map(e=>e.duration));
     observer.disconnect();
     const canvas=document.getElementById(object?'extremeCanvas':'universe');
     const {width,height}=canvas.getBoundingClientRect();
     return {elapsed:performance.now()-started,draws:frames()-initial,canvas:[width,height],longTasks,
      atmosphere:sky?getComputedStyle(sky,'::before').animationPlayState:'absent'};
    },{object,sampleMs});
    const after=await metrics(session);
    const ms=key=>Number(((after[key]-before[key])*1000).toFixed(3));
    rows.push({version,width,height,cpu,round:round+1,scene,...sample,taskMs:ms('TaskDuration'),scriptMs:ms('ScriptDuration')});
    assert.equal(sample.atmosphere,sky,`${version} ${scene}`);
    if(object)assert(sample.draws>0,scene);
    else assert.equal(sample.draws,0,scene);
    await pauseRule?.evaluate(e=>e.remove());
   }
  }
  assert.deepEqual(errors,[]);
  return rows;
 }finally{await context.close()}
}

export async function measurePhaseA(h,t){
 let archive;
 try{archive=execFileSync('git',['archive',baseline,'dist'],{maxBuffer:20*1024*1024,stdio:['ignore','pipe','pipe']});}
 catch(error){
  if(process.env.GITHUB_ACTIONS==='true')throw error;
  t.skip('The v0.9 commit is required for the optional comparison in a full Git checkout.');
  return;
 }
 const scratch=await mkdtemp(join(tmpdir(),'entrolab-v0925-'));
 try{
  execFileSync('tar',['-xf','-','-C',scratch],{input:archive});
  const measurements=[];
  const shared=['background','object:neutron'];
  const old=shared.map(scene=>[scene,'absent']);
  const current=[
   ...shared.flatMap(scene=>[[scene,'running'],[scene,'paused']]),
   ...['brown','supergiant','magnetar','wolf'].map(kind=>['object:'+kind,'running']),
  ];
  for(const [index,setting] of [{width:1360,height:900,cpu:1},{width:390,height:900,cpu:4}].entries()){
   const versions=index===0?[['v0.9',old],['v0.9.25',current]]:[['v0.9.25',current],['v0.9',old]];
   for(const [version,scenes] of versions)measurements.push(...await profile(h,join(scratch,'dist'),setting,version,scenes));
  }
  const report={baseline,browser:h.browser.version(),dpr:1,rounds,sampleMs,warmupMs,
   method:'CDP TaskDuration and ScriptDuration for the whole tab, paired live and paused atmosphere in Phase A',measurements};
  await writeFile(join(h.output,'v0925-performance.json'),JSON.stringify(report,null,2)+'\n');
  console.log('v0.9.25 measurements '+JSON.stringify(report));
 }finally{await rm(scratch,{recursive:true,force:true})}
}
