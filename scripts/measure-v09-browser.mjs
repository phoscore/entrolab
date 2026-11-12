import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {browserHarness} from '../tests/v08-browser-harness.mjs';

const baseline = 'ec2c4f1a5957478ab255f286a0ca2a9341cabcbe';
const temp = await mkdtemp(join(tmpdir(),'v09-baseline-'));
let server,h;
const measurements = [];
const types = {'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'};
try {
 const archive = execFileSync('git',['archive',baseline,'dist'],{maxBuffer:4_000_000});
 execFileSync('tar',['-x','-C',temp],{input:archive});
 const root = join(temp,'dist');
 server = createServer(async(req,res)=>{
  try {
   const pathname = new URL(req.url,'http://localhost').pathname;
   const file = resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
   if(!file.startsWith(root+'/'))return res.writeHead(403).end();
   res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream'}).end(await readFile(file));
  }catch{res.writeHead(404).end()}
 });
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const baselineURL = 'http://127.0.0.1:'+server.address().port;
 h = await browserHarness();
 const profiles=[{id:'desktop',width:1360,height:950,cpu:1,frameWidth:710,frameHeight:345},{id:'mobile',width:390,height:860,cpu:4,frameWidth:272,frameHeight:240}];
 async function page(profile,url){
  const context=await h.browser.newContext({viewport:{width:profile.width,height:profile.height},deviceScaleFactor:1,locale:'de-DE',reducedMotion:'no-preference'});
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
  const p=await context.newPage(),errors=[];p.on('pageerror',error=>errors.push(error.message));
  await p.goto(url);await h.ready(p);
  if(!(await p.evaluate(()=>window.entrolab.inspect().paused)))await p.locator('#play').click();
  const cdp=await context.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.cpu});
  await cdp.send('Performance.enable');
  return {p,context,cdp,errors};
 }
 const durationMetric = async cdp => (await cdp.send('Performance.getMetrics')).metrics.find(m=>m.name==='TaskDuration').value;
 async function sample(profile,variant,scene,repeat){
  const {p,context,cdp,errors}=await page(profile,variant==='base'?baselineURL:h.url);
  try{
   const gas=scene==='gas',gravity=scene==='gravity',active=scene==='moving'||gas;
   if(!gravity){
    await p.locator('[data-tab='+(gas?'extreme':'blackhole')+']').click();
    if(!active){await p.locator('.bh-illustration details > summary').click();await p.locator('#bhViewDisk').uncheck()}
   }
   const stage=gas?'#gasCanvas':gravity?'#universe':'#bhIllustration';
   const target=gas?'entrolabGas':gravity?'entrolab':'entrolabBlackHoleView';
   if(!gas&&!gravity)await p.addStyleTag({content:`.bh-illustration .bh-image-frame{width:${profile.frameWidth}px!important;height:${profile.frameHeight}px!important;max-width:none!important}`});
   if(gravity)await p.addStyleTag({content:'#universe{width:704px!important;height:600px!important;min-height:600px!important;max-height:600px!important;flex:0 0 600px!important}'});
   await p.locator(stage).evaluate(e=>e.scrollIntoView({block:'center',behavior:'auto'}));
   await p.waitForFunction(([key,anim])=>key==='entrolab'||!!window[key]&&(anim?window[key].inspect().scheduled:window[key].inspect().seen),[target,active]);
   await p.waitForTimeout(650);
   const begin=await durationMetric(cdp);
   const data=await p.evaluate(async({target,active})=>{
    const get=()=>target==='entrolab'?{frames:window.entrolab.renderInfo().frame}:window[target].inspect();
    const before=get(),start=performance.now(),drawGaps=[],paintCosts=[],longTasks=[];
    const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>e.duration)));
    observer.observe({type:'longtask'});
    if(active){
     await new Promise(done=>{
      let previous=before.frames,last=0;
      function probe(now){
       const current=get();
       if(current.frames!==previous){if(last)drawGaps.push(now-last);last=now;previous=current.frames;paintCosts.push(current.paintMs??current.frameMs)}
       if(now-start>=4000)done();else requestAnimationFrame(probe);
      }
      requestAnimationFrame(probe);
     });
    }else await new Promise(done=>setTimeout(done,1800));
    longTasks.push(...observer.takeRecords().map(e=>e.duration));observer.disconnect();
    const after=get(),quantile=(a,q)=>a.length?a.sort((x,y)=>x-y)[Math.floor(a.length*q)]:null;
    return {elapsed:performance.now()-start,draws:after.frames-before.frames,scheduled:after.scheduled,
     gapP50:quantile(drawGaps,.5),gapP95:quantile(drawGaps,.95),drawP95:quantile(paintCosts,.95),longTasks};
   },{target,active});
   const taskMs=(await durationMetric(cdp)-begin)*1000;
   const rect=await p.locator(stage).boundingBox();
   measurements.push({profile:profile.id,variant,scene,repeat,taskMs,rect,...data,errors});
   if(errors.length)throw Error(errors.join('\n'));
   if(!active&&!gravity&&(data.draws||data.scheduled))throw Error('Static BH scene rendered in sample');
  } finally{await context.close()}
 }
 for(const profile of profiles){
  for(let rep=0;rep<3;rep++)for(const variant of rep%2===0?['base','candidate']:['candidate','base'])
   await sample(profile,variant,'moving',rep);
  for(const variant of ['base','candidate'])await sample(profile,variant,'static',0);
  await sample(profile,'candidate','gas',0);
 }
 for(const variant of ['base','candidate'])await sample(profiles[0],variant,'gravity',0);
 const prototypes=[];
 for(const profile of profiles){
  const {p,context}=await page(profile,h.url);
  try{
   prototypes.push(await p.evaluate(async({id,frameWidth,frameHeight})=>{
    const {createAccretionRenderer}=await import('/accretion-render.mjs'),samples=[];
    const canvas=document.createElement('canvas');canvas.style.cssText=`position:fixed;left:0;top:0;width:${frameWidth}px;height:${frameHeight}px`;
    document.body.append(canvas);
    for(const cached of [false,true,true,false]){
     const renderer=createAccretionRenderer(canvas,{cached}),times=[];
     renderer.draw({disk:true,angle:22},0,1);
     for(let i=0;i<32;i++){
      await new Promise(requestAnimationFrame);
      const start=performance.now();
      renderer.draw({disk:true,angle:22},i/30,1);
      times.push(performance.now()-start);
     }
     renderer.dispose();times.sort((a,b)=>a-b);
     samples.push({cached,p50:times[16],p95:times[30]});
    }
    canvas.remove();
    return {id,samples,measurement:'Synchronous Canvas 2D draw submission, not GPU end-to-end'};
   },profile));
  } finally{await context.close()}
 }
 const report={baseline,candidate:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),chromium:h.browser.version(),
  conditions:'Same CI runner, DPR 1, system-font fallback, BH dimensions fixed per profile, 650 ms warm-up. 4x CDP CPU emulation is not real mobile hardware.',
  measurements,prototypes};
 await writeFile(join(h.output,'v09-performance.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
} finally {
 if(h)await h.close();
 if(server)await new Promise(done=>server.close(done));
 await rm(temp,{recursive:true,force:true});
}
