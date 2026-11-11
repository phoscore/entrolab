// Reproducible comparative smoke measurement, not a device-independent FPS guarantee.
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,extname} from 'node:path';
import {createServer} from 'node:http';
const {chromium}=await import(process.env.ENTROLAB_PLAYWRIGHT_MODULE??'playwright');
const bhAudit=process.argv.includes('--bh-audit');
const base=bhAudit?'7b64f0b7d189fb7587814e2136ea23229d424c6a':'25e72c639d66677c1629886141e3671a4c696ef6';
const scratch=await mkdtemp(join(tmpdir(),'entrolab-v08-perf-'));
const output=resolve('browser-results');await mkdir(output,{recursive:true});
let browser,server;
async function beginTrace(cdp){
 try{await cdp.send('Tracing.start',{transferMode:'ReturnAsStream',traceConfig:{recordMode:'recordAsMuchAsPossible',includedCategories:['devtools.timeline']}});return {available:true}}
 catch(error){return {available:false,error:String(error.message)}}
}
async function finishTrace(cdp,start){
 if(!start.available)return {status:'unavailable',error:start.error};
 let stream;
 try{
  const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const result=await complete;stream=result.stream;
  if(!stream)throw Error('No trace stream returned');const chunks=[];let eof=false;
  while(!eof){const chunk=await cdp.send('IO.read',{handle:stream,size:1024*1024});chunks.push(chunk.base64Encoded?Buffer.from(chunk.data,'base64'):Buffer.from(chunk.data));eof=chunk.eof}
  const trace=JSON.parse(Buffer.concat(chunks).toString('utf8')),events=trace.traceEvents??[];
  const stats={};
  for(const name of ['Paint','Layout','UpdateLayoutTree','RasterTask']){
   const values=events.filter(e=>e.name===name&&e.ph==='X'&&Number.isFinite(e.dur)&&e.dur>=0).map(e=>e.dur/1000).sort((a,b)=>a-b);
   stats[name]={count:values.length,p50:values.length?values[Math.floor(values.length*.5)]:null,p95:values.length?values[Math.floor(values.length*.95)]:null,max:values.at(-1)??null,total:values.reduce((a,b)=>a+b,0)};
  }
  return {status:result.dataLossOccurred?'incomplete':'recorded',dataLossOccurred:!!result.dataLossOccurred,traceEvents:events.length,units:'ms, duration of recorded Chromium timeline events; not GPU end-to-end frame latency',stats};
 }catch(error){return {status:'unavailable',error:String(error.message)}}
 finally{if(stream)await cdp.send('IO.close',{handle:stream})}
}

try{
 const archive=execFileSync('git',['archive',base,'dist'],{maxBuffer:20*1024*1024});execFileSync('tar',['-x','-C',scratch],{input:archive});
 const roots={baseline:join(scratch,'dist'),current:resolve('dist')};
 server=createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost'),[,variant,...parts]=u.pathname.split('/'),root=roots[variant];if(!root){res.writeHead(404).end();return}const path=resolve(root,parts.join('/')||'index.html');if(!path.startsWith(root+'/')){res.writeHead(403).end();return}res.writeHead(200,{'Content-Type':({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg'})[extname(path)]??'application/octet-stream','Cache-Control':'no-store'}).end(await readFile(path))}catch{res.writeHead(404).end()}});
 await new Promise(done=>server.listen(0,'127.0.0.1',done));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.ENTROLAB_CHROMIUM_EXECUTABLE?{executablePath:process.env.ENTROLAB_CHROMIUM_EXECUTABLE}:{})});
 const measurements=[];
 // Two order-reversed samples; existing scenes plus explicit new-work costs.
 const bhScenes=['bh-disk-off','bh-environment'];
 const profiles=[{id:'desktop',width:1360,height:1000,rate:1,scenes:bhAudit?bhScenes:['gravity-paused','extreme-visible','bh-environment','bh-light']},{id:'mobile-emulated',width:390,height:844,rate:4,scenes:bhAudit?bhScenes:['extreme-visible','bh-environment']}];
 for(const profile of profiles)for(const repetition of [1,2])for(const scene of profile.scenes)for(const variant of repetition===1?['baseline','current']:['current','baseline']){
  const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},deviceScaleFactor:1,locale:'de-DE',reducedMotion:'no-preference'});
  try{
   await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(origin+'/'+variant+'/');await page.waitForFunction(()=>window.entrolab&&window.entrolabThermal&&document.getElementById('checkRunStatus')?.dataset.run==='1');await page.evaluate(()=>document.fonts.ready);
   if(!(await page.evaluate(()=>window.entrolab.inspect().paused)))await page.locator('#play').click();
   // Normalize drawing pixels in the measurement fixture only: the native
   // responsive grid legitimately grows with its sidebar content.
   await page.addStyleTag({content:'#universe{width:704px!important;height:600px!important;min-height:600px!important;max-height:600px!important;flex:0 0 600px!important}'});
   const newBH=scene.startsWith('bh-');
   const illustratedBH=newBH&&(bhAudit||variant==='current');
   const canvas=scene==='gravity-paused'?'#universe':newBH?(illustratedBH?'#bhIllustration':'#sizes'):'#extremeCanvas';
   if(scene==='extreme-visible')await page.locator('[data-tab=extreme]').click();
   if(newBH){
    await page.locator('[data-tab=blackhole]').click();
    if(illustratedBH)await page.locator('#bhView').selectOption(scene==='bh-light'?'light':'environment');
    if(scene==='bh-disk-off'){
     await page.locator('.bh-illustration details > summary').click();
     await page.locator('#bhViewDisk').uncheck();
    }
   }
   await page.locator(canvas).evaluate(e=>e.scrollIntoView({block:'center',behavior:'auto'}));
   const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.rate});
   await page.evaluate(()=>new Promise(done=>{let n=0;function tick(){if(++n===180)done();else requestAnimationFrame(tick)}requestAnimationFrame(tick)}));
   await cdp.send('Performance.enable');await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.collectGarbage');
   if(bhAudit){
    const before=await cdp.send('Performance.getMetrics');
    // No observer RAF: a static page should be able to stay idle during the sample.
    const idle=await page.evaluate(async()=>{
     const tasks=[],observer=new PerformanceObserver(list=>tasks.push(...list.getEntries().map(e=>e.duration)));
     observer.observe({type:'longtask'});
     const before=window.entrolabBlackHoleView.inspect(),start=performance.now();
     await new Promise(done=>setTimeout(done,8000));
     const duration=performance.now()-start,after=window.entrolabBlackHoleView.inspect();
     tasks.push(...observer.takeRecords().map(e=>e.duration));observer.disconnect();
     return {duration,draws:after.frames-before.frames,before,after,longTasks:tasks};
    });
    const after=await cdp.send('Performance.getMetrics'),get=(r,k)=>r.metrics.find(m=>m.name===k)?.value;
    const cpu=Object.fromEntries(['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration'].map(k=>[k,get(after,k)-get(before,k)]));
    const rect=await page.locator(canvas).boundingBox();
    measurements.push({profile:profile.id,cpuThrottle:profile.rate,repetition,scene,variant,idle,cpu,rect,errors});
    console.log(JSON.stringify(measurements.at(-1)));
    if(errors.length||!idle.before.seen||!idle.after.seen)throw Error('Invalid BH sample: '+JSON.stringify(measurements.at(-1)));
    if(variant==='current'&&scene==='bh-disk-off'&&(idle.draws||idle.before.scheduled||idle.after.scheduled))throw Error('Static BH rendered after warm-up');
    if(scene==='bh-environment'&&(idle.draws<1||!idle.after.scheduled))throw Error('Animated BH did not run');
    continue;
   }
   const traceStart=await beginTrace(cdp),before=await cdp.send('Performance.getMetrics');
   const frames=await page.evaluate(()=>new Promise(done=>{const intervals=[],longTasks=[],drawCosts=[];let last,start,seenDraw=-1; const observer=new PerformanceObserver(list=>{for(const e of list.getEntries())longTasks.push(e.duration)});observer.observe({type:'longtask'});function tick(now){if(start===undefined)start=now;if(last!==undefined)intervals.push(now-last);last=now;const view=window.entrolabBlackHoleView?.inspect();if(view&&view.frames!==seenDraw){seenDraw=view.frames;drawCosts.push(view.paintMs)}if(now-start>=30000){observer.disconnect();intervals.sort((a,b)=>a-b);done({duration:now-start,frames:intervals.length,p50:intervals[Math.floor(intervals.length*.5)],p95:intervals[Math.floor(intervals.length*.95)],max:intervals.at(-1),longTasks,drawCosts})}else requestAnimationFrame(tick)}requestAnimationFrame(tick)}));
   const after=await cdp.send('Performance.getMetrics'),get=(r,k)=>r.metrics.find(m=>m.name===k)?.value;
   const cpu=Object.fromEntries(['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration'].map(k=>[k,get(after,k)-get(before,k)]));
   const paint=await finishTrace(cdp,traceStart),rect=await page.locator(canvas).boundingBox(),dom=await cdp.send('Memory.getDOMCounters');
   measurements.push({profile:profile.id,cpuThrottle:profile.rate,repetition,scene,variant,frames,cpu,paint,rect,dom,errors});console.log(JSON.stringify(measurements.at(-1)));
   if(errors.length)throw Error('Page errors: '+errors.join('; '));
  }finally{await context.close()}
 }
 const report={base,current:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),browser:browser.version(),profiles,dpr:1,font:'system fallback; Google fonts blocked',durationPerSampleSeconds:bhAudit?8:30,repetitions:2,warmupFrames:180,measurements};
 Object.assign(report,bhAudit?{
  drawingFixture:'Same canvas and controls on reviewed and corrected builds; centre-aligned scroll',
  scope:'Two order-reversed samples on the same runner. CDP Main Thread metrics without tracing or measurement RAF. 4x CPU is emulation.'
 }:{
  drawingFixture:'Gravity704x600 CSS px on both; existing Extreme canvas unchanged; centre-aligned scroll; test-only CSS, no production sizing change',
  paintTrace:'CDP devtools.timeline on both variants; tracing adds measurement overhead; missing traces explicitly reported',
  scope:'Same runner/browser; two order-reversed 30s samples. Existing scenes compare released v0.8. New BH scenes compare old static calculator with new illustration, NOT equivalent rendering work. 4x CPU is emulation, not real mobile hardware. No inherited A13 exception or universal 10% guarantee'
 });
 await writeFile(join(output,bhAudit?'v085-bh-audit-performance.json':'v085-performance.json'),JSON.stringify(report,null,2));
}finally{await browser?.close();if(server)await new Promise(done=>server.close(done));await rm(scratch,{recursive:true,force:true})}
